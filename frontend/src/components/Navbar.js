import { useEffect, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  FaBook, FaSignOutAlt, FaCog, FaUser,
  FaChalkboardTeacher, FaTachometerAlt, FaUsers,
  FaBars, FaTimes, FaPlus, FaChevronLeft, FaChevronRight,
} from "react-icons/fa"
import "./Navbar.css"

const userTabs = [
  { link: "/dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { link: "/courses",   label: "Courses",   icon: FaChalkboardTeacher },
  { link: "/profile",   label: "Profile",   icon: FaUser },
  { link: "/settings",  label: "Settings",  icon: FaCog },
]

const adminTabs = [
  { link: "/admin?tab=overview",    label: "Admin",      icon: FaTachometerAlt },
  { link: "/admin?tab=users",       label: "Users",      icon: FaUsers },
  { link: "/admin?tab=courses",     label: "Courses",    icon: FaBook },
  { link: "/admin?tab=add-course",  label: "Add Course", icon: FaPlus },
  { link: "/profile",               label: "Profile",    icon: FaUser },
  { link: "/settings",              label: "Settings",   icon: FaCog },
]

function Navbar({ role = "user", email = "user@skillvoyage.com", setToken }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const tabs = role === "admin" ? adminTabs : userTabs

  // Admin redirect on first mount
  useEffect(() => {
    if (role === "admin") {
      const p = location.pathname
      if (p === "/" || p === "/dashboard" || p === "/courses") {
        navigate("/admin?tab=overview", { replace: true })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  // Sync body class for main-content margin adjustment
  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add("sidebar-collapsed")
    } else {
      document.body.classList.remove("sidebar-collapsed")
    }
    return () => {
      document.body.classList.remove("sidebar-collapsed")
    }
  }, [isCollapsed])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  const isActive = (path) => {
    if (path.includes("?")) {
      const [pn, qs] = path.split("?")
      const target = new URLSearchParams(qs)
      const current = new URLSearchParams(location.search)
      const sameTab = target.get("tab") ? target.get("tab") === current.get("tab") : true
      return location.pathname === pn && sameTab
    }
    return location.pathname === path
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setToken?.(null)
    navigate("/")
  }

  return (
    <>
      {/* Mobile top navigation bar */}
      <header className="mobile-header" role="banner">
        <div className="mobile-header-brand">
          <img
            src="/logo.png"
            alt="SkillVoyage Logo"
            className="mobile-header-logo"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="mobile-header-title">SkillVoyage</span>
        </div>
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside
        className={`app-sidebar${isCollapsed ? " is-collapsed" : ""}${isMobileMenuOpen ? " is-mobile-open" : ""}`}
        aria-label="Application sidebar"
      >
        {/* Brand header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img
              src="/logo.png"
              alt="SkillVoyage"
              className="sidebar-logo"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            {!isCollapsed && <span className="sidebar-title">SkillVoyage</span>}
          </div>

          {!isCollapsed && (
            <div className="sidebar-user-card">
              <div className="sidebar-avatar" aria-hidden="true">
                {(email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="sidebar-user-meta">
                <span className="sidebar-user-email" title={email}>{email}</span>
                <span className={`sidebar-role-badge ${role}`}>
                  {role === "admin" ? "Admin" : "Learner"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav">
          {!isCollapsed && <div className="sidebar-section-title">Navigation</div>}
          <ul className="sidebar-nav-list">
            {tabs.map((item) => {
              const active = isActive(item.link)
              const Icon = item.icon
              return (
                <li key={item.label} className="sidebar-nav-item">
                  <Link
                    to={item.link}
                    className={`sidebar-nav-link${active ? " active" : ""}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="sidebar-nav-icon" aria-hidden="true" />
                    {!isCollapsed && <span className="sidebar-nav-text">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer actions */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-logout-btn"
            title={isCollapsed ? "Logout" : undefined}
            aria-label="Log out"
          >
            <FaSignOutAlt className="sidebar-nav-icon" aria-hidden="true" />
            {!isCollapsed && <span>Log Out</span>}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="sidebar-collapse-btn"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FaChevronRight aria-hidden="true" /> : <FaChevronLeft aria-hidden="true" />}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Navbar

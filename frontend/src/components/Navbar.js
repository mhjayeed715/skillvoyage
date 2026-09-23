import { useEffect, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  FaBook, FaSignOutAlt, FaCog, FaUser,
  FaChalkboardTeacher, FaTachometerAlt, FaUsers,
  FaBars, FaTimes, FaPlus,
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
  const navigate   = useNavigate()
  const location   = useLocation()
  const tabs       = role === "admin" ? adminTabs : userTabs

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

  const isActive = (path) => {
    if (path.includes("?")) {
      const [pn, qs] = path.split("?")
      const target  = new URLSearchParams(qs)
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
      {/* Mobile toggle */}
      <button
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav
        className={`navbar${isCollapsed ? " navbar-collapsed" : ""}${isMobileMenuOpen ? " navbar-mobile-open" : ""}`}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div className="navbar-header">
          <div className="navbar-brand">
            <img
              src="/logo.png"
              alt="SkillVoyage"
              className="navbar-logo"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            {!isCollapsed && <span className="navbar-title">SkillVoyage</span>}
          </div>

          {!isCollapsed && (
            <div className="user-info">
              <div className="user-avatar" aria-hidden="true">
                {(email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-email" title={email}>{email}</div>
                <div>
                  <span className={`role-badge ${role}`}>
                    {role === "admin" ? "Administrator" : "Learner"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="navbar-main">
          {!isCollapsed && <div className="nav-section-label">Navigation</div>}
          {tabs.map((item) => (
            <Link
              key={item.label}
              to={item.link}
              className={`navbar-link${isActive(item.link) ? " active" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
              title={isCollapsed ? item.label : undefined}
              aria-current={isActive(item.link) ? "page" : undefined}
            >
              <item.icon className="navbar-icon" aria-hidden="true" />
              {!isCollapsed && <span className="navbar-text">{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="navbar-footer">
          <button
            onClick={handleLogout}
            className="logout-button"
            title={isCollapsed ? "Logout" : undefined}
            aria-label="Sign out"
          >
            <FaSignOutAlt className="navbar-icon" aria-hidden="true" />
            {!isCollapsed && <span>Logout</span>}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="collapse-toggle"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <FaBars
              style={{
                transform: isCollapsed ? "rotate(90deg)" : "none",
                transition: "transform 0.25s ease",
              }}
              aria-hidden="true"
            />
          </button>
        </div>
      </nav>
    </>
  )
}

export default Navbar

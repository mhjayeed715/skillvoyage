import { useEffect, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  FaBook, FaSignOutAlt, FaCog, FaUser,
  FaChalkboardTeacher, FaTachometerAlt, FaUsers,
  FaBars, FaPlus, FaChevronLeft, FaChevronRight,
  FaCompass,
} from "react-icons/fa"
import "./Navbar.css"

const userTabs = [
  { link: "/dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { link: "/courses",   label: "Courses",   icon: FaChalkboardTeacher },
  { link: "/profile",   label: "Profile",   icon: FaUser },
  { link: "/settings",  label: "Settings",  icon: FaCog },
]

const adminTabs = [
  { link: "/admin?tab=overview",    label: "Admin Overview", icon: FaTachometerAlt },
  { link: "/admin?tab=users",       label: "Users",          icon: FaUsers },
  { link: "/admin?tab=courses",     label: "Courses",        icon: FaBook },
  { link: "/admin?tab=add-course",  label: "Add Course",     icon: FaPlus },
  { link: "/profile",               label: "Profile",        icon: FaUser },
  { link: "/settings",              label: "Settings",       icon: FaCog },
]

function Navbar({ role = "user", email = "user@skillvoyage.com", setToken }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
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

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  }, [isMobileDrawerOpen])

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

  // Get current page name for topbar breadcrumb
  const getCurrentPageTitle = () => {
    const activeTab = tabs.find((t) => isActive(t.link))
    if (activeTab) return activeTab.label
    if (location.pathname.startsWith("/admin")) return "Admin Panel"
    return "Workspace"
  }

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setIsMobileDrawerOpen(!isMobileDrawerOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setToken?.(null)
    navigate("/")
  }

  const userInitial = (email || "U").charAt(0).toUpperCase()

  return (
    <>
      {/* ── Universal Google Classroom Style Top Navbar ── */}
      <header className="app-topbar" role="banner">
        <div className="topbar-left">
          {/* Hamburger Menu Toggle Button */}
          <button
            className="topbar-hamburger-btn"
            onClick={handleToggleSidebar}
            aria-label={isCollapsed ? "Expand navigation drawer" : "Collapse navigation drawer"}
            title="Main menu"
          >
            <FaBars aria-hidden="true" />
          </button>

          {/* Logo & Brand Identity */}
          <Link to={role === "admin" ? "/admin?tab=overview" : "/dashboard"} className="topbar-brand">
            <div className="topbar-logo-wrap">
              <img
                src="/logo.png"
                alt="SkillVoyage Logo"
                className="topbar-logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                  e.currentTarget.nextElementSibling.style.display = "flex"
                }}
              />
              <div className="topbar-logo-fallback" style={{ display: "none" }}>
                <FaCompass />
              </div>
            </div>
            <span className="topbar-brand-title">SkillVoyage</span>
          </Link>

          {/* Breadcrumb Separator & Active Page */}
          <div className="topbar-breadcrumb">
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-current">{getCurrentPageTitle()}</span>
          </div>
        </div>

        {/* Right User Actions & Profile Pill */}
        <div className="topbar-right">
          <div className="topbar-user-badge">
            <div className="topbar-avatar" title={email}>
              {userInitial}
            </div>
            <div className="topbar-user-info">
              <span className="topbar-user-email">{email}</span>
              <span className={`topbar-role-tag ${role}`}>
                {role === "admin" ? "Admin" : "Learner"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="topbar-logout-btn"
            title="Log Out"
            aria-label="Log Out"
          >
            <FaSignOutAlt aria-hidden="true" />
            <span className="logout-text">Exit</span>
          </button>
        </div>
      </header>

      {/* ── Backdrop Overlay for Mobile Drawer ── */}
      {isMobileDrawerOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Collapsible Google Classroom Style Sidebar ── */}
      <aside
        className={`app-sidebar${isCollapsed ? " is-collapsed" : ""}${isMobileDrawerOpen ? " is-mobile-open" : ""}`}
        aria-label="Application navigation drawer"
      >
        {/* Navigation links */}
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
                    onClick={() => setIsMobileDrawerOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    <div className="nav-icon-container">
                      <Icon className="sidebar-nav-icon" aria-hidden="true" />
                    </div>
                    {!isCollapsed && <span className="sidebar-nav-text">{item.label}</span>}
                    {active && <span className="active-indicator-bar" aria-hidden="true" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar Footer with Collapse/Expand helper */}
        <div className="sidebar-footer">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="sidebar-rail-toggle-btn"
            title={isCollapsed ? "Expand sidebar (Ctrl + B)" : "Collapse sidebar (Ctrl + B)"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FaChevronRight aria-hidden="true" /> : <FaChevronLeft aria-hidden="true" />}
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Navbar

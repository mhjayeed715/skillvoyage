import { useEffect, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  FaBook,
  FaSignOutAlt,
  FaCog,
  FaUser,
  FaChalkboardTeacher,
  FaTachometerAlt,
  FaUsers,
  FaBars,
  FaPlus,
  FaCompass,
} from "react-icons/fa"
import "./Navbar.css"

const userPrimaryTabs = [
  { link: "/dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { link: "/courses",   label: "Courses",   icon: FaChalkboardTeacher },
  { link: "/profile",   label: "Profile",   icon: FaUser },
]

const adminPrimaryTabs = [
  { link: "/admin?tab=overview",    label: "Admin Overview", icon: FaTachometerAlt },
  { link: "/admin?tab=users",       label: "Users",          icon: FaUsers },
  { link: "/admin?tab=courses",     label: "Courses",        icon: FaBook },
  { link: "/admin?tab=add-course",  label: "Add Course",     icon: FaPlus },
  { link: "/profile",               label: "Profile",        icon: FaUser },
]

function Navbar({ role = "user", email = "user@skillvoyage.com", setToken }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const primaryTabs = role === "admin" ? adminPrimaryTabs : userPrimaryTabs

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
      {/* ── Top App Bar (Shows Hamburger & Breadcrumb / User Pill) ── */}
      <header className="app-topbar" role="banner">
        <div className="topbar-left">
          <button
            className="topbar-hamburger-btn"
            onClick={handleToggleSidebar}
            aria-label="Toggle navigation menu"
            title="Toggle Menu"
          >
            <FaBars />
          </button>

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
        </div>

        {/* Right User Meta */}
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

      {/* ── Deep Navy UniShareSync Style Sidebar (Matches Screenshot 2) ── */}
      <aside
        className={`app-sidebar dark-navy-theme${isCollapsed ? " is-collapsed" : ""}${isMobileDrawerOpen ? " is-mobile-open" : ""}`}
        aria-label="Application Navigation"
      >
        {/* Sidebar Brand & Hamburger Header */}
        <div className="sidebar-brand-header">
          <Link to={role === "admin" ? "/admin?tab=overview" : "/dashboard"} className="sidebar-brand-left">
            <div className="sidebar-brand-icon-box">
              <img
                src="/logo.png"
                alt="SkillVoyage"
                className="sidebar-brand-img"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                  e.currentTarget.nextElementSibling.style.display = "flex"
                }}
              />
              <div className="sidebar-brand-fallback" style={{ display: "none" }}>
                <FaCompass />
              </div>
            </div>
            {!isCollapsed && <span className="sidebar-brand-text">SkillVoyage</span>}
          </Link>

          {/* Hamburger toggle directly in header */}
          <button
            className="sidebar-header-hamburger-btn"
            onClick={handleToggleSidebar}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title="Toggle Sidebar"
          >
            <FaBars />
          </button>
        </div>

        {/* Main Nav Section */}
        <nav className="sidebar-nav-container">
          {!isCollapsed && <div className="sidebar-menu-label">MENU</div>}
          <ul className="sidebar-menu-list">
            {primaryTabs.map((item) => {
              const active = isActive(item.link)
              const Icon = item.icon
              return (
                <li key={item.label} className="sidebar-menu-item">
                  <Link
                    to={item.link}
                    className={`sidebar-nav-button${active ? " active-teal" : ""}`}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    <div className="nav-btn-icon-wrapper">
                      <Icon className="nav-icon-glyph" />
                    </div>
                    {!isCollapsed && <span className="nav-btn-text">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Pinned Bottom Section: Settings & Logout (Matches Screenshot 2) */}
        <div className="sidebar-bottom-pinned">
          <ul className="sidebar-menu-list">
            <li className="sidebar-menu-item">
              <Link
                to="/settings"
                className={`sidebar-nav-button${isActive("/settings") ? " active-teal" : ""}`}
                onClick={() => setIsMobileDrawerOpen(false)}
                title={isCollapsed ? "Settings" : undefined}
              >
                <div className="nav-btn-icon-wrapper">
                  <FaCog className="nav-icon-glyph" />
                </div>
                {!isCollapsed && <span className="nav-btn-text">Settings</span>}
              </Link>
            </li>

            <li className="sidebar-menu-item">
              <button
                type="button"
                onClick={handleLogout}
                className="sidebar-nav-button logout-button"
                title={isCollapsed ? "Logout" : undefined}
                aria-label="Logout"
              >
                <div className="nav-btn-icon-wrapper">
                  <FaSignOutAlt className="nav-icon-glyph" />
                </div>
                {!isCollapsed && <span className="nav-btn-text">Logout</span>}
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  )
}

export default Navbar

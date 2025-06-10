import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBook, 
  FaSignOutAlt, 
  FaCog, 
  FaUser, 
  FaChalkboardTeacher,
  FaTachometerAlt,
  FaUsers,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import './Navbar.css';

const userTabs = [
  { link: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
  { link: '/courses', label: 'Courses', icon: FaChalkboardTeacher },
  { link: '/profile', label: 'Profile', icon: FaUser },
  { link: '/settings', label: 'Settings', icon: FaCog },
];

const adminTabs = [
  { link: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
  { link: '/courses', label: 'Courses', icon: FaChalkboardTeacher },
  { link: '/profile', label: 'Profile', icon: FaUser },
  { link: '/settings', label: 'Settings', icon: FaCog },
  { link: '/admin', label: 'Admin Panel', icon: FaUsers },
];

function Navbar({ role = 'user', email = 'user@skillvoyage.com', setToken }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = role === 'admin' ? adminTabs : userTabs;

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-button md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navbar */}
      <nav className={`navbar ${isCollapsed ? 'navbar-collapsed' : ''} ${isMobileMenuOpen ? 'navbar-mobile-open' : ''}`}>
        {/* Header */}
        <div className="navbar-header">
          <div className="navbar-brand">
            <img
              src="/logo.png"
              alt="SkillVoyage Logo"
              className="navbar-logo"
              onError={(e) => (e.target.style.display = 'none')}
            />
            {!isCollapsed && (
              <span className="navbar-title">SkillVoyage</span>
            )}
          </div>
          
          {/* User Info */}
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-avatar">
                {email.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-email">{email}</div>
                <div className="user-role">
                  <span className={`role-badge ${role}`}>
                    {role === 'admin' ? 'Administrator' : 'Learner'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="navbar-main">
          <div className="nav-section">
            <div className="nav-section-title">
              {!isCollapsed && <span>Navigation</span>}
            </div>
            {tabs.map((item) => (
              <Link
                key={item.label}
                to={item.link}
                className={`navbar-link ${isActiveLink(item.link) ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon className="navbar-icon" />
                {!isCollapsed && <span className="navbar-text">{item.label}</span>}
                {isActiveLink(item.link) && <div className="active-indicator" />}
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          {!isCollapsed && role === 'user' && (
            <div className="nav-section">
              <div className="nav-section-title">
                <span>Quick Stats</span>
              </div>
              <div className="quick-stats">
                <div className="stat-item">
                  <FaBook className="stat-icon" />
                  <div className="stat-info">
                    <div className="stat-number">12</div>
                    <div className="stat-label">Courses</div>
                  </div>
                </div>
                <div className="stat-item">
                  <FaTachometerAlt className="stat-icon" />
                  <div className="stat-info">
                    <div className="stat-number">85%</div>
                    <div className="stat-label">Progress</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="navbar-footer">
          <button
            onClick={handleLogout}
            className="logout-button"
            title={isCollapsed ? 'Logout' : ''}
          >
            <FaSignOutAlt className="navbar-icon" />
            {!isCollapsed && <span>Logout</span>}
          </button>
          
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="collapse-toggle hidden md:flex"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <FaBars className={`transform transition-transform ${isCollapsed ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
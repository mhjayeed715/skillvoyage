import { Link } from "react-router-dom"
import {
  FaLinkedin,
  FaEnvelope,
  FaPhone,
  FaChevronRight,
  FaCompass,
  FaGithub,
} from "react-icons/fa"
import "./Footer.css"

function Footer() {
  return (
    <footer className="unishare-footer-root" role="contentinfo">
      <div className="unishare-footer-container">
        {/* Top 4-Column Grid */}
        <div className="unishare-footer-grid">
          {/* Column 1: Brand & Bio */}
          <div className="footer-col brand-col">
            <div className="footer-brand-header">
              <div className="footer-logo-box">
                <img
                  src="/logo.png"
                  alt="SkillVoyage"
                  className="footer-logo-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.nextElementSibling.style.display = "flex"
                  }}
                />
                <div className="footer-logo-fallback" style={{ display: "none" }}>
                  <FaCompass />
                </div>
              </div>
              <span className="footer-brand-heading">SkillVoyage</span>
            </div>

            <p className="footer-brand-mission">
              Unify your learning. Accelerate your career. Master high-impact technical disciplines with precision AI guidance.
            </p>

            <div className="footer-social-row">
              <a
                href="https://linkedin.com/in/mhjayeed715"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="mailto:mehrabjayeed715@gmail.com"
                className="social-icon-btn"
                aria-label="Email"
                title="Email Us"
              >
                <FaEnvelope />
              </a>
              <a
                href="https://github.com/mhjayeed715"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="GitHub"
                title="GitHub"
              >
                <FaGithub />
              </a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="footer-col">
            <h3 className="footer-col-title">Product</h3>
            <ul className="footer-links-list">
              <li>
                <a href="/#features" className="footer-nav-link">
                  <FaChevronRight className="chevron-icon" />
                  <span>Features</span>
                </a>
              </li>
              <li>
                <a href="/#curriculum" className="footer-nav-link">
                  <FaChevronRight className="chevron-icon" />
                  <span>Curriculum</span>
                </a>
              </li>
              <li>
                <Link to="/signup" className="footer-nav-link">
                  <FaChevronRight className="chevron-icon" />
                  <span>For Students</span>
                </Link>
              </li>
              <li>
                <Link to="/signup" className="footer-nav-link">
                  <FaChevronRight className="chevron-icon" />
                  <span>For Teams</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="footer-col">
            <h3 className="footer-col-title">Support</h3>
            <ul className="footer-links-list">
              <li>
                <a href="mailto:mehrabjayeed715@gmail.com" className="footer-nav-link">
                  <FaChevronRight className="chevron-icon" />
                  <span>Help Center</span>
                </a>
              </li>
              <li>
                <a href="mailto:mehrabjayeed715@gmail.com" className="footer-nav-link">
                  <FaChevronRight className="chevron-icon" />
                  <span>Contact Us</span>
                </a>
              </li>
              <li>
                <Link to="/privacy-policy" className="footer-nav-link">
                  <FaChevronRight className="chevron-icon" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="footer-nav-link">
                  <FaChevronRight className="chevron-icon" />
                  <span>Terms of Service</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="footer-col contact-col">
            <h3 className="footer-col-title">Contact</h3>
            <div className="footer-contact-items">
              <a href="mailto:mehrabjayeed715@gmail.com" className="contact-link-row">
                <FaEnvelope className="contact-row-icon" />
                <span>mehrabjayeed715@gmail.com</span>
              </a>

              <a href="tel:+8801533652232" className="contact-link-row">
                <FaPhone className="contact-row-icon" />
                <span>+8801533652232</span>
              </a>

              <a
                href="https://linkedin.com/in/mhjayeed715"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link-row"
              >
                <FaLinkedin className="contact-row-icon" />
                <span>linkedin.com/in/mhjayeed715</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="unishare-footer-bottom">
          <p className="copyright-text">
            © {new Date().getFullYear()} SkillVoyage. All rights reserved.
          </p>
          <div className="bottom-legal-links">
            <Link to="/privacy-policy" className="legal-link">Privacy Policy</Link>
            <Link to="/terms-of-service" className="legal-link">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

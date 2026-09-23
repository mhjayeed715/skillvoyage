import { Link } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import "./LegalPage.css"

function TermsOfService() {
  return (
    <div className="legal-page-canvas">
      <header className="legal-header-nav">
        <div className="legal-nav-inner">
          <Link to="/" className="legal-brand-link">
            <img src="/logo.png" alt="SkillVoyage" className="legal-brand-logo" onError={(e) => (e.target.style.display = "none")} />
            <span className="legal-brand-name">SkillVoyage</span>
          </Link>
          <Link to="/" className="legal-back-btn">
            <FaArrowLeft />
            <span>Return to Platform</span>
          </Link>
        </div>
      </header>

      <main className="legal-container">
        <div className="legal-card-shell">
          <article className="legal-card-core">
            <div className="legal-eyebrow">Platform Agreement</div>
            <h1 className="legal-title">Terms of Service</h1>
            <div className="legal-effective-date">Last Updated: September 2026</div>

            <div className="legal-body">
              <section className="legal-section">
                <h2>1. Acceptance of Terms</h2>
                <p>
                  By registering an account, accessing courses, or interacting with SkillVoyage ("Platform"), you agree to abide by these Terms of Service. If you do not agree with any part of these terms, you must refrain from utilizing the service.
                </p>
              </section>

              <section className="legal-section">
                <h2>2. User Accounts & Security</h2>
                <p>
                  Users are responsible for maintaining the confidentiality of their credentials and all activities occurring under their accounts. You agree to notify us immediately of any unauthorized use or security breaches.
                </p>
              </section>

              <section className="legal-section">
                <h2>3. Acceptable Code of Conduct</h2>
                <p>When participating in SkillVoyage community modules, discussions, and course workflows, you agree not to:</p>
                <ul>
                  <li>Violate applicable copyright or intellectual property rights of course instructors or peer learners.</li>
                  <li>Engage in automated scraping, denial-of-service attempts, or reverse-engineering of system APIs.</li>
                  <li>Distribute malicious code, automated bots, or disruptive payloads across the workspace.</li>
                </ul>
              </section>

              <section className="legal-section">
                <h2>4. Intellectual Property</h2>
                <p>
                  All curriculum materials, course structure, software code, UI interfaces, and visual assets are proprietary to SkillVoyage and respective content authors. Reproduction or redistribution without explicit written consent is strictly prohibited.
                </p>
              </section>

              <section className="legal-section">
                <h2>5. Questions & Support</h2>
                <p>
                  Questions regarding these Terms of Service should be directed to <a href="mailto:mehrabjayeed715@gmail.com" style={{ color: "#4f46e5", fontWeight: 600 }}>mehrabjayeed715@gmail.com</a> or phone <a href="tel:+8801533652232" style={{ color: "#4f46e5", fontWeight: 600 }}>+8801533652232</a>.
                </p>
              </section>
            </div>
          </article>
        </div>
      </main>
    </div>
  )
}

export default TermsOfService

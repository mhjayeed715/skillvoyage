import { Link } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import "./LegalPage.css"

function PrivacyPolicy() {
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
            <div className="legal-eyebrow">Data Governance & Trust</div>
            <h1 className="legal-title">Privacy Policy</h1>
            <div className="legal-effective-date">Last Updated: September 2026</div>

            <div className="legal-body">
              <section className="legal-section">
                <h2>1. Commitment to Privacy</h2>
                <p>
                  At SkillVoyage ("we", "our", or "us"), we believe education should be transparent, accessible, and respectful of individual privacy. This Privacy Policy outlines our procedures regarding the collection, utilization, and safeguarding of personal data when you interact with the SkillVoyage platform.
                </p>
              </section>

              <section className="legal-section">
                <h2>2. Information We Collect</h2>
                <p>We collect information necessary to personalize your learning trajectory and maintain account security:</p>
                <ul>
                  <li><strong>Account Credentials:</strong> Full name, verified email address, encrypted password credentials, and avatar preferences.</li>
                  <li><strong>Learning Metadata:</strong> Course completions, study streaks, quiz performance scores, and interest discipline preferences.</li>
                  <li><strong>Technical Telemetry:</strong> Log data, device identifiers, and browser parameters utilized strictly for diagnosing service anomalies and optimizing latency.</li>
                </ul>
              </section>

              <section className="legal-section">
                <h2>3. Use of Personal Information</h2>
                <p>Your data is processed exclusively to deliver high-impact learning experiences:</p>
                <ul>
                  <li>Generating intelligent, personalized course recommendations based on cognitive momentum.</li>
                  <li>Delivering transactional verification emails, streak notifications, and security alerts.</li>
                  <li>Providing anonymous peer benchmarking to track cohort progress without compromising identity.</li>
                </ul>
              </section>

              <section className="legal-section">
                <h2>4. Data Storage & Security Standards</h2>
                <p>
                  All sensitive data is encrypted both in transit (TLS 1.3) and at rest (AES-256). We enforce strict least-privilege role-based access controls across our cloud infrastructure. We never sell, monetize, or broker your personal information to third-party advertising networks.
                </p>
              </section>

              <section className="legal-section">
                <h2>5. Contact Data Privacy Officer</h2>
                <p>
                  For privacy inquiries, data deletion requests, or data export assistance, please contact our team directly at <a href="mailto:mehrabjayeed715@gmail.com" style={{ color: "#4f46e5", fontWeight: 600 }}>mehrabjayeed715@gmail.com</a>.
                </p>
              </section>
            </div>
          </article>
        </div>
      </main>
    </div>
  )
}

export default PrivacyPolicy

import { Link } from "react-router-dom"
import {
  FaRocket, FaTrophy, FaUsers, FaChartLine, FaBrain, FaCheck,
  FaStar, FaArrowRight, FaGraduationCap, FaLightbulb, FaBolt, FaPlay,
} from "react-icons/fa"
import "./Homepage.css"

function Homepage() {
  const features = [
    { icon: <FaBrain />, iconClass: "indigo", title: "AI-Powered Recommendations", desc: "Get personalized course suggestions based on your learning preferences and progress patterns.", tall: true },
    { icon: <FaTrophy />, iconClass: "amber",  title: "Gamified Learning",           desc: "Earn badges, maintain streaks, and track achievements as you progress." },
    { icon: <FaChartLine />, iconClass: "teal",  title: "Progress Analytics",         desc: "Visualize your learning journey with detailed charts and insights." },
    { icon: <FaUsers />, iconClass: "rose",  title: "Peer Comparison",            desc: "Compare your progress with peers to stay motivated and on track." },
    { icon: <FaGraduationCap />, iconClass: "emerald", title: "Expert-Led Courses",  desc: "Learn from industry experts with real-world experience." },
    { icon: <FaLightbulb />, iconClass: "indigo", title: "Interactive Learning",    desc: "Hands-on projects, quizzes, and interactive coding environments." },
  ]

  const stats = [
    { num: "25K+",  lbl: "Active Learners" },
    { num: "1,200+", lbl: "Courses" },
    { num: "150+",  lbl: "Skill Categories" },
    { num: "98%",   lbl: "Satisfaction" },
  ]

  const steps = [
    { n: "01", title: "Sign Up & Set Your Course", desc: "Create your account and tell us your learning goals. Our AI crafts your personalized learning path." },
    { n: "02", title: "Navigate with AI Guidance",  desc: "Receive intelligent recommendations that adapt to your learning style, pace, and progress." },
    { n: "03", title: "Achieve & Excel",             desc: "Complete courses, unlock achievements, and compare your progress with a global community." },
  ]

  const testimonials = [
    { name: "Sarah Johnson",   role: "Senior Web Developer", company: "Google",    initial: "SJ", content: "SkillVoyage transformed my learning. The AI recommendations helped me discover courses I never knew I needed — I went from junior to senior in 8 months." },
    { name: "Michael Chen",    role: "Lead Data Scientist",  company: "Microsoft", initial: "MC", content: "The gamification keeps me motivated daily. I've completed 18 courses in 4 months and landed my dream job." },
    { name: "Emily Rodriguez", role: "UX Design Manager",    company: "Apple",     initial: "ER", content: "The peer comparison feature showed me where I stand and motivated me to push harder. The community aspect is incredible!" },
  ]

  const ctaChecks = ["Free to start", "No credit card", "Cancel anytime", "24/7 support"]

  return (
    <div className="homepage">
      {/* ── Nav ── */}
      <header className="hp-nav" role="banner">
        <div className="hp-nav-brand">
          <img src="/logo.png" alt="SkillVoyage" className="hp-nav-logo" onError={(e) => e.target.style.display='none'} />
          <span className="hp-nav-name">SkillVoyage</span>
        </div>
        <nav className="hp-nav-actions" aria-label="Primary navigation">
          <Link to="/login" className="hp-nav-link">Sign In</Link>
          <Link to="/signup" className="hp-nav-cta">
            <FaRocket aria-hidden="true" />
            Get Started
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="hero-bg-glow" aria-hidden="true" />
        <div className="hero-grid">
          {/* Left copy */}
          <div className="hero-copy">
            <div className="hero-eyebrow" aria-label="Platform category">
              <FaBolt aria-hidden="true" />
              AI-Powered Learning Platform
            </div>
            <h1 id="hero-heading" className="hero-title">
              Master New Skills with{" "}
              <span className="gradient-word">Intelligent Guidance</span>
            </h1>
            <p className="hero-desc">
              SkillVoyage adapts to how you learn. Personalized courses, gamified progress, and real analytics — all in one platform built for ambitious learners.
            </p>
            <div className="hero-cta-row">
              <Link to="/signup" className="hero-btn-primary" id="hero-cta-primary">
                <FaRocket aria-hidden="true" />
                Start Free Today
              </Link>
              <Link to="/login" className="hero-btn-secondary" id="hero-cta-secondary">
                <FaPlay aria-hidden="true" style={{ fontSize: '0.75rem' }} />
                Already a member
              </Link>
            </div>
            <div className="hero-stats" aria-label="Platform statistics">
              {stats.map((s, i) => (
                <div key={i} className="stat-item">
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: preview card */}
          <div className="hero-visual" aria-hidden="true">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-avatar">SV</div>
                <div className="preview-header-info">
                  <strong>Learning Dashboard</strong>
                  <span>Active learner · 15-day streak 🔥</span>
                </div>
              </div>
              <div className="preview-metrics">
                <div className="preview-metric">
                  <div className="pm-value indigo">12</div>
                  <div className="pm-label">Courses</div>
                </div>
                <div className="preview-metric">
                  <div className="pm-value teal">87%</div>
                  <div className="pm-label">Completion</div>
                </div>
                <div className="preview-metric">
                  <div className="pm-value amber">15🔥</div>
                  <div className="pm-label">Streak</div>
                </div>
              </div>
              <div className="preview-courses">
                {[
                  { name: "React Development", pct: 75 },
                  { name: "Python for AI/ML",  pct: 60 },
                  { name: "Advanced Data Science", pct: 90 },
                ].map((c, i) => (
                  <div className="preview-course" key={i}>
                    <div className="pc-header">
                      <span className="pc-name">{c.name}</span>
                      <span className="pc-pct">{c.pct}%</span>
                    </div>
                    <div className="pc-bar">
                      <div className="pc-fill" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="preview-badges">
                <span className="preview-badge">🏆 Top Learner</span>
                <span className="preview-badge">🔥 15-Day Streak</span>
                <span className="preview-badge">⭐ Top 10%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section" aria-labelledby="features-heading">
        <div className="section-container">
          <h2 id="features-heading" className="section-heading">Why Choose SkillVoyage?</h2>
          <p className="section-sub">A platform built for how modern learners actually grow — intelligent, adaptive, and engaging.</p>
          <div className="features-bento" role="list">
            {features.map((f, i) => (
              <div key={i} className={`feature-card ${f.tall ? "tall" : ""}`} role="listitem">
                <div className={`feature-icon-wrap ${f.iconClass}`}>{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="steps-section" aria-labelledby="steps-heading">
        <div className="section-container">
          <h2 id="steps-heading" className="section-heading">How It Works</h2>
          <p className="section-sub">Your personalized journey to mastery in three simple steps.</p>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{s.n}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials-section" aria-labelledby="testimonials-heading">
        <div className="section-container">
          <h2 id="testimonials-heading" className="section-heading">Success Stories</h2>
          <p className="section-sub">Join thousands of learners who transformed their careers with SkillVoyage.</p>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <figure key={i} className="testimonial-card">
                <div className="t-stars" aria-label="5 star rating">
                  {[...Array(5)].map((_, j) => <FaStar key={j} aria-hidden="true" />)}
                </div>
                <blockquote className="t-quote">"{t.content}"</blockquote>
                <figcaption className="t-author">
                  <div className="t-avatar" aria-hidden="true">{t.initial}</div>
                  <div>
                    <div className="t-name">{t.name}</div>
                    <div className="t-role">{t.role} · {t.company}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section" aria-labelledby="cta-heading">
        <div className="cta-inner">
          <h2 id="cta-heading" className="cta-title">
            Ready to Begin Your <span>SkillVoyage?</span>
          </h2>
          <p className="cta-desc">
            Join our community and unlock your potential with AI-powered personalized education. Your journey to mastery starts now.
          </p>
          <div className="cta-btn-row">
            <Link to="/signup" className="hero-btn-primary" id="cta-btn-main">
              Start Your Voyage
              <FaArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="cta-checks">
            {ctaChecks.map((c, i) => (
              <div key={i} className="cta-check">
                <div className="cta-check-icon"><FaCheck aria-hidden="true" /></div>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="hp-footer" role="contentinfo">
        <div className="hp-footer-brand">
          <img src="/logo.png" alt="SkillVoyage" style={{ width: 24, height: 24, borderRadius: 6 }} onError={(e) => e.target.style.display='none'} />
          SkillVoyage
        </div>
        <p className="hp-footer-copy">© {new Date().getFullYear()} SkillVoyage. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Homepage

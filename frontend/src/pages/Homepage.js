import { useState } from "react"
import { Link } from "react-router-dom"
import {
  FaRocket,
  FaArrowRight,
  FaFire,
  FaCheck,
  FaBrain,
  FaChartLine,
  FaUsers,
  FaCode,
  FaCloud,
  FaCompass,
  FaLaptopCode,
} from "react-icons/fa"
import Footer from "../components/Footer"
import "./Homepage.css"

const curriculumTracks = [
  {
    id: "ai",
    label: "AI & Neural Systems",
    icon: FaBrain,
    courses: [
      { title: "Deep Learning & Transformer Architectures", duration: "18h", level: "Advanced", tag: "Hot" },
      { title: "Autonomous Agent Orchestration with LangChain", duration: "12h", level: "Intermediate", tag: "New" },
      { title: "Computer Vision & Edge AI Deployment", duration: "16h", level: "Advanced", tag: "Featured" },
    ],
  },
  {
    id: "eng",
    label: "Modern Fullstack",
    icon: FaCode,
    courses: [
      { title: "Distributed Systems & Event-Driven Architecture", duration: "24h", level: "Advanced", tag: "Core" },
      { title: "High-Performance React & Next.js 15 Internals", duration: "14h", level: "Intermediate", tag: "Popular" },
      { title: "Microservices with Go & gRPC Systems", duration: "20h", level: "Advanced", tag: "Featured" },
    ],
  },
  {
    id: "cloud",
    label: "Cloud & Platform",
    icon: FaCloud,
    courses: [
      { title: "Kubernetes Operators & Multi-Cluster Mesh", duration: "22h", level: "Advanced", tag: "Essential" },
      { title: "AWS Solutions Architecture & Terraform CI/CD", duration: "18h", level: "Intermediate", tag: "Top Rated" },
      { title: "Zero Trust Security & Cloud Hardening", duration: "15h", level: "Advanced", tag: "New" },
    ],
  },
]

function Homepage() {
  const [activeTrack, setActiveTrack] = useState("ai")
  const [selectedSkill, setSelectedSkill] = useState("AI Agents")

  const currentTrackData = curriculumTracks.find((t) => t.id === activeTrack) || curriculumTracks[0]

  return (
    <div className="homepage-canvas">
      {/* ── Ambient Background Mesh ── */}
      <div className="canvas-mesh-top" aria-hidden="true" />
      <div className="canvas-mesh-side" aria-hidden="true" />

      {/* ── Floating Island Glass Header ── */}
      <header className="island-nav-header" role="banner">
        <div className="island-nav-container">
          <Link to="/" className="island-brand">
            <div className="island-brand-icon-wrap">
              <img
                src="/logo.png"
                alt="SkillVoyage"
                className="island-brand-img"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                  e.currentTarget.nextElementSibling.style.display = "flex"
                }}
              />
              <div className="island-brand-fallback" style={{ display: "none" }}>
                <FaCompass />
              </div>
            </div>
            <span className="island-brand-text">SkillVoyage</span>
          </Link>

          <nav className="island-nav-links" aria-label="Quick links">
            <a href="#curriculum" className="island-nav-item">Curriculum</a>
            <a href="#features" className="island-nav-item">Platform Architecture</a>
            <a href="#outcomes" className="island-nav-item">Outcomes</a>
          </nav>

          <div className="island-nav-actions">
            <Link to="/login" className="island-login-link">Sign In</Link>
            <Link to="/signup" className="island-nav-cta-btn">
              <span>Start Free</span>
              <div className="island-cta-icon-circle">
                <FaArrowRight />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="hero-spatial-container" aria-labelledby="hero-main-title">
        <div className="hero-eyebrow-wrapper">
          <div className="hero-micro-badge">
            <span className="pulse-indicator" />
            <span>AI-Driven Adaptive Learning OS</span>
          </div>
        </div>

        <h1 id="hero-main-title" className="hero-headline">
          Master Modern Engineering with{" "}
          <span className="headline-gradient-span">Precision Guidance</span>
        </h1>

        <p className="hero-subheading">
          SkillVoyage replaces static courses with an intelligent, adaptive platform.
          Curated technical paths, gamified cognitive momentum, and real-time peer analytics.
        </p>

        {/* Hero CTA Button-in-Button */}
        <div className="hero-cta-action-row">
          <Link to="/signup" className="hero-master-cta-btn" id="hero-primary-cta">
            <span>Explore The Curriculum</span>
            <div className="master-cta-circle">
              <FaArrowRight />
            </div>
          </Link>

          <Link to="/login" className="hero-ghost-btn">
            <span>Access Workspace</span>
          </Link>
        </div>

        {/* Live Metrics Ticker */}
        <div className="hero-metrics-strip">
          <div className="metric-pill">
            <span className="metric-number">98.4%</span>
            <span className="metric-label">Course Completion Rate</span>
          </div>
          <div className="metric-divider" />
          <div className="metric-pill">
            <span className="metric-number">25,000+</span>
            <span className="metric-label">Active Global Engineers</span>
          </div>
          <div className="metric-divider" />
          <div className="metric-pill">
            <span className="metric-number">4.9 / 5</span>
            <span className="metric-label">Learner Quality Score</span>
          </div>
        </div>

        {/* ── Hero Interactive Hardware Preview (Double-Bezel) ── */}
        <div className="hero-hardware-shell">
          <div className="hero-hardware-core">
            <div className="hardware-header-bar">
              <div className="window-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="window-address-pill">
                <span className="lock-icon">🔒</span>
                <span>skillvoyage.app/workspace/neural-path</span>
              </div>
              <div className="window-status-pill">
                <span className="status-live-dot" />
                <span>Engine Active</span>
              </div>
            </div>

            {/* Hardware Inner Bento Preview */}
            <div className="hardware-bento-preview">
              {/* Preview Tile 1: Recommendation Engine */}
              <div className="preview-tile-card tile-large">
                <div className="tile-eyebrow">
                  <FaBrain className="tile-icon" />
                  <span>Recommendation Vector</span>
                </div>
                <h3 className="tile-title">Adaptive Discipline Focus</h3>
                <p className="tile-desc">Click a track to see personalized trajectory adjustments:</p>
                <div className="interactive-skill-chips">
                  {["AI Agents", "Kubernetes", "Next.js 15", "Distributed DBs"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSkill(s)}
                      className={`skill-chip-btn ${selectedSkill === s ? "is-selected" : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="skill-match-metric-bar">
                  <div className="match-bar-track">
                    <div
                      className="match-bar-fill"
                      style={{ width: selectedSkill === "AI Agents" ? "94%" : selectedSkill === "Kubernetes" ? "88%" : "91%" }}
                    />
                  </div>
                  <span className="match-percentage">
                    {selectedSkill === "AI Agents" ? "94% Match" : selectedSkill === "Kubernetes" ? "88% Match" : "91% Match"}
                  </span>
                </div>
              </div>

              {/* Preview Tile 2: Streak & Cognitive Momentum */}
              <div className="preview-tile-card tile-small">
                <div className="tile-eyebrow">
                  <FaFire className="tile-icon flame" />
                  <span>Cognitive Momentum</span>
                </div>
                <div className="streak-display-unit">
                  <div className="streak-flame-circle">
                    <FaFire />
                  </div>
                  <div className="streak-text-group">
                    <span className="streak-digit">15</span>
                    <span className="streak-unit">Days Active</span>
                  </div>
                </div>
                <div className="momentum-pill">
                  <span className="momentum-multiplier">2.4x</span>
                  <span>XP Velocity Boost</span>
                </div>
              </div>

              {/* Preview Tile 3: Benchmark Radar */}
              <div className="preview-tile-card tile-small">
                <div className="tile-eyebrow">
                  <FaChartLine className="tile-icon" />
                  <span>Global Percentile</span>
                </div>
                <div className="radar-score-box">
                  <span className="radar-score-big">Top 3%</span>
                  <span className="radar-caption">In System Architecture</span>
                </div>
                <div className="cohort-comparison-tag">
                  <FaCheck className="cohort-check" />
                  <span>Above 97% of cohort pace</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Asymmetrical Bento Grid: Platform Architecture ── */}
      <section id="features" className="bento-platform-section" aria-labelledby="features-heading">
        <div className="section-header-block">
          <div className="section-eyebrow-tag">
            <span className="eyebrow-bullet" />
            ENGINEERED FOR DEPTH
          </div>
          <h2 id="features-heading" className="section-main-heading">
            Four pillars that drive exponential mastery
          </h2>
          <p className="section-sub-copy">
            Every layer of SkillVoyage is designed around cognitive load theory and deliberate practice.
          </p>
        </div>

        <div className="asymmetric-bento-grid">
          {/* Bento Item 1: Large (Span 8) */}
          <div className="double-bezel-bento-card bento-span-8">
            <div className="bento-inner-core">
              <div className="bento-text-column">
                <div className="bento-card-badge">
                  <FaBrain />
                  <span>Adaptive Engine</span>
                </div>
                <h3 className="bento-card-title">Dynamic Recommendation Pathways</h3>
                <p className="bento-card-desc">
                  Our system evaluates your progress curves, quiz results, and note-taking density.
                  When you stall on concurrency or distributed consensus, it dynamically routes targeted refresher modules.
                </p>
                <div className="bento-features-bullet-list">
                  <div className="feature-bullet-item">
                    <FaCheck className="bullet-check" />
                    <span>Self-calibrating difficulty curve</span>
                  </div>
                  <div className="feature-bullet-item">
                    <FaCheck className="bullet-check" />
                    <span>Zero duplicate lectures or redundant theory</span>
                  </div>
                </div>
              </div>
              <div className="bento-visual-column">
                <div className="vector-route-graphic">
                  <div className="node-pill active">Core Foundation</div>
                  <div className="vector-connector" />
                  <div className="node-pill highlight">Transformer Mechanics</div>
                  <div className="vector-connector" />
                  <div className="node-pill">Autonomous Agents</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Small (Span 4) */}
          <div className="double-bezel-bento-card bento-span-4">
            <div className="bento-inner-core">
              <div className="bento-card-badge">
                <FaFire />
                <span>Gamification</span>
              </div>
              <h3 className="bento-card-title">Haptic Momentum & Streaks</h3>
              <p className="bento-card-desc">
                Consistency beats intensity. Visual streaks, milestones, and cognitive badges ensure you build an unbreakable daily coding habit.
              </p>
              <div className="mini-streak-badge-row">
                <div className="streak-chip">🔥 15 Days</div>
                <div className="streak-chip">⚡ 1,840 XP</div>
                <div className="streak-chip">🎖️ Master</div>
              </div>
            </div>
          </div>

          {/* Bento Item 3: Small (Span 4) */}
          <div className="double-bezel-bento-card bento-span-4">
            <div className="bento-inner-core">
              <div className="bento-card-badge">
                <FaUsers />
                <span>Cohort Intel</span>
              </div>
              <h3 className="bento-card-title">Peer Velocity Benchmarking</h3>
              <p className="bento-card-desc">
                Know exactly where your technical depth stands against thousands of peers worldwide without toxic competition.
              </p>
              <div className="cohort-stat-box">
                <span className="stat-big-percentile">+34%</span>
                <span className="stat-caption">Pace velocity over industry median</span>
              </div>
            </div>
          </div>

          {/* Bento Item 4: Large (Span 8) */}
          <div className="double-bezel-bento-card bento-span-8">
            <div className="bento-inner-core">
              <div className="bento-text-column">
                <div className="bento-card-badge">
                  <FaLaptopCode />
                  <span>Precision Library</span>
                </div>
                <h3 className="bento-card-title">Production-Grade Video Curricula</h3>
                <p className="bento-card-desc">
                  Curated directly from verified technical leaders. Every lesson links to concrete code repositories,
                  interactive note-taking, and progress checkpoints.
                </p>
                <div className="bento-tags-row">
                  <span className="tech-pill">TypeScript</span>
                  <span className="tech-pill">PyTorch</span>
                  <span className="tech-pill">Docker</span>
                  <span className="tech-pill">Rust</span>
                  <span className="tech-pill">Kubernetes</span>
                </div>
              </div>
              <div className="bento-visual-column">
                <div className="live-curriculum-snippet">
                  <div className="snippet-row">
                    <span className="snippet-index">01</span>
                    <span className="snippet-name">Attention Mechanisms in Detail</span>
                    <span className="snippet-duration">42m</span>
                  </div>
                  <div className="snippet-row active-row">
                    <span className="snippet-index">02</span>
                    <span className="snippet-name">KV Cache & FlashAttention-2</span>
                    <span className="snippet-duration">58m</span>
                  </div>
                  <div className="snippet-row">
                    <span className="snippet-index">03</span>
                    <span className="snippet-name">Serving at Scale with vLLM</span>
                    <span className="snippet-duration">36m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Curriculum Explorer Section ── */}
      <section id="curriculum" className="curriculum-explorer-section" aria-labelledby="curriculum-heading">
        <div className="section-header-block">
          <div className="section-eyebrow-tag">
            <span className="eyebrow-bullet" />
            PRODUCTION TRACKS
          </div>
          <h2 id="curriculum-heading" className="section-main-heading">
            Curriculum mapped to modern engineering teams
          </h2>
          <p className="section-sub-copy">
            Switch tracks to explore in-depth syllabi crafted for technical leaders.
          </p>
        </div>

        {/* Track Selector Tabs */}
        <div className="curriculum-track-tab-bar">
          {curriculumTracks.map((track) => {
            const Icon = track.icon
            const isActive = activeTrack === track.id
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setActiveTrack(track.id)}
                className={`track-tab-pill-btn ${isActive ? "active" : ""}`}
              >
                <Icon className="track-tab-icon" />
                <span>{track.label}</span>
              </button>
            )
          })}
        </div>

        {/* Track Courses Showcase */}
        <div className="curriculum-cards-grid">
          {currentTrackData.courses.map((c, i) => (
            <div key={i} className="double-bezel-course-card">
              <div className="course-card-inner">
                <div className="course-card-top-row">
                  <span className="course-tag-pill">{c.tag}</span>
                  <span className="course-duration-pill">{c.duration}</span>
                </div>
                <h3 className="course-card-heading">{c.title}</h3>
                <div className="course-card-bottom-row">
                  <span className="course-level-tag">{c.level}</span>
                  <Link to="/signup" className="course-explore-link">
                    <span>Enroll</span>
                    <FaArrowRight className="link-arrow" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social Proof & Learner Outcomes ── */}
      <section id="outcomes" className="outcomes-proof-section">
        <div className="section-header-block">
          <div className="section-eyebrow-tag">
            <span className="eyebrow-bullet" />
            ENGINEER VOICES
          </div>
          <h2 className="section-main-heading">Trusted by builders worldwide</h2>
        </div>

        <div className="outcomes-cards-grid">
          <div className="double-bezel-card outcome-card">
            <div className="bezel-card-inner">
              <div className="outcome-stars">★★★★★</div>
              <p className="outcome-quote">
                “SkillVoyage completely changed how I allocate my study hours. The peer benchmarking motivated me to stay consistent, and I leveled up to Staff Engineer within 9 months.”
              </p>
              <div className="outcome-author-row">
                <div className="author-avatar-circle">SJ</div>
                <div className="author-meta-block">
                  <span className="author-name">Sarah Jenkins</span>
                  <span className="author-role">Staff Distributed Systems Engineer</span>
                </div>
              </div>
            </div>
          </div>

          <div className="double-bezel-card outcome-card">
            <div className="bezel-card-inner">
              <div className="outcome-stars">★★★★★</div>
              <p className="outcome-quote">
                “Most platforms offer surface-level videos. SkillVoyage’s AI recommendations drilled straight into transformer internals and GPU memory optimization. Invaluable.”
              </p>
              <div className="outcome-author-row">
                <div className="author-avatar-circle">MC</div>
                <div className="author-meta-block">
                  <span className="author-name">Marcus Chen</span>
                  <span className="author-role">Senior Machine Learning Scientist</span>
                </div>
              </div>
            </div>
          </div>

          <div className="double-bezel-card outcome-card">
            <div className="bezel-card-inner">
              <div className="outcome-stars">★★★★★</div>
              <p className="outcome-quote">
                “The streak momentum feature cured my burnout. The pacing tracker keeps sessions focused and bite-sized, making daily progress feel effortless.”
              </p>
              <div className="outcome-author-row">
                <div className="author-avatar-circle">ER</div>
                <div className="author-meta-block">
                  <span className="author-name">Elena Rostova</span>
                  <span className="author-role">Lead Platform Architect</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final Conversion CTA Island ── */}
      <section className="final-conversion-section">
        <div className="final-cta-shell">
          <div className="final-cta-core">
            <div className="cta-ambient-glow" aria-hidden="true" />
            <h2 className="final-cta-headline">
              Begin your precision learning journey today
            </h2>
            <p className="final-cta-subtext">
              Join thousands of ambitious engineers mastering AI, distributed architecture, and cloud systems with SkillVoyage.
            </p>
            <div className="final-cta-buttons-row">
              <Link to="/signup" className="hero-master-cta-btn">
                <span>Create Free Account</span>
                <div className="master-cta-circle">
                  <FaRocket />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Refined Footer Matching Reference Screenshot ── */}
      <Footer />
    </div>
  )
}

export default Homepage

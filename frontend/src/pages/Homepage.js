import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaRocket, 
  FaTrophy, 
  FaUsers, 
  FaChartLine, 
  FaBrain, 
  FaPlay,
  FaCheck,
  FaStar,
  FaArrowRight
} from 'react-icons/fa';
import './Homepage.css';

function Homepage() {
  const features = [
    {
      icon: <FaBrain className="text-blue-600" />,
      title: "AI-Powered Recommendations",
      description: "Get personalized course suggestions based on your learning preferences and progress."
    },
    {
      icon: <FaTrophy className="text-yellow-500" />,
      title: "Gamified Learning",
      description: "Earn badges, maintain streaks, and track your achievements as you progress."
    },
    {
      icon: <FaChartLine className="text-green-600" />,
      title: "Progress Analytics",
      description: "Visualize your learning journey with detailed charts and insights."
    },
    {
      icon: <FaUsers className="text-purple-600" />,
      title: "Peer Comparison",
      description: "Compare your progress with anonymous peers to stay motivated."
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Learners" },
    { number: "500+", label: "Courses Available" },
    { number: "50+", label: "Skill Categories" },
    { number: "95%", label: "Success Rate" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Web Developer",
      content: "SkillVoyage transformed my learning journey. The AI recommendations helped me discover courses I never knew I needed!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Data Scientist",
      content: "The gamification features keep me motivated. I've completed 12 courses in just 3 months!",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "UX Designer",
      content: "The peer comparison feature showed me where I stand and motivated me to push harder. Amazing platform!",
      rating: 5
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container-modern">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Master New Skills with 
                <span className="text-gradient"> AI-Powered Learning</span>
              </h1>
              <p className="hero-description">
                Join thousands of learners on SkillVoyage, where personalized recommendations, 
                gamification, and peer comparison make learning engaging and effective.
              </p>
              <div className="hero-buttons">
                <Link to="/signup" className="btn-primary btn-large">
                  <FaRocket />
                  Start Learning Free
                </Link>
                <Link to="/login" className="btn-outline">
                  <FaPlay />
                  Sign In
                </Link>
              </div>
              <div className="hero-stats">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-card">
                <div className="card-header">
                  <FaTrophy className="text-yellow-500" />
                  <span>Your Learning Dashboard</span>
                </div>
                <div className="progress-demo">
                  <div className="course-item">
                    <span>React Development</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div className="course-item">
                    <span>Python for AI</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '60%'}}></div>
                    </div>
                  </div>
                  <div className="course-item">
                    <span>Data Science</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '90%'}}></div>
                    </div>
                  </div>
                </div>
                <div className="badges-demo">
                  <div className="badge">🏆 Course Master</div>
                  <div className="badge">🔥 7-day Streak</div>
                  <div className="badge">⭐ Top Performer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container-modern">
          <div className="section-header">
            <h2>Why Choose SkillVoyage?</h2>
            <p>Experience the future of online learning with our innovative features</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card-modern">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container-modern">
          <div className="section-header">
            <h2>How SkillVoyage Works</h2>
            <p>Your journey to mastery in three simple steps</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up & Set Preferences</h3>
              <p>Create your account and tell us about your learning interests. Our AI will use this to personalize your experience.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Get AI Recommendations</h3>
              <p>Receive curated course suggestions based on your preferences, learning style, and progress patterns.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Learn & Achieve</h3>
              <p>Complete courses, earn badges, maintain streaks, and compare your progress with peers for motivation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container-modern">
          <div className="section-header">
            <h2>What Our Learners Say</h2>
            <p>Join thousands of successful learners who transformed their careers</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card card-modern">
                <div className="stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p>"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container-modern">
          <div className="cta-content">
            <h2>Ready to Start Your Learning Journey?</h2>
            <p>Join SkillVoyage today and unlock your potential with AI-powered personalized learning.</p>
            <div className="cta-buttons">
              <Link to="/signup" className="btn-primary btn-large">
                Get Started Free
                <FaArrowRight />
              </Link>
            </div>
            <div className="cta-features">
              <div className="cta-feature">
                <FaCheck className="text-green-500" />
                <span>Free to start</span>
              </div>
              <div className="cta-feature">
                <FaCheck className="text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="cta-feature">
                <FaCheck className="text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
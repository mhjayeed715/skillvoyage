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
  FaArrowRight,
  FaGraduationCap,
  FaBookOpen,
  FaLightbulb
} from 'react-icons/fa';
import skillVoyageLogo from '../assets/svlogo.png'; 
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
    },
    {
      icon: <FaGraduationCap className="text-indigo-600" />,
      title: "Expert-Led Courses",
      description: "Learn from industry experts with real-world experience and proven track records."
    },
    {
      icon: <FaLightbulb className="text-orange-600" />,
      title: "Interactive Learning",
      description: "Engage with hands-on projects, quizzes, and interactive coding environments."
    }
  ];

  const stats = [
    { number: "25K+", label: "Active Learners" },
    { number: "1,200+", label: "Courses Available" },
    { number: "150+", label: "Skill Categories" },
    { number: "98%", label: "Success Rate" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Senior Web Developer at Google",
      content: "SkillVoyage transformed my learning journey. The AI recommendations helped me discover courses I never knew I needed! I went from junior to senior developer in just 8 months.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Lead Data Scientist at Microsoft",
      content: "The gamification features keep me motivated every day. I've completed 18 courses in just 4 months and landed my dream job!",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "UX Design Manager at Apple",
      content: "The peer comparison feature showed me where I stand and motivated me to push harder. The community aspect is incredible!",
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
              <div className="brand-header">
                <img src={skillVoyageLogo} alt="SkillVoyage Logo" className="hero-logo" />
                <h1 className="brand-name">SkillVoyage</h1>
              </div>
              <h2 className="hero-title">
                Master New Skills with 
                <span className="text-gradient"> AI-Powered Learning</span>
              </h2>
              <p className="hero-description">
                Embark on your personalized learning adventure with SkillVoyage. Where cutting-edge AI meets 
                gamified education to create an engaging, effective, and transformative learning experience 
                tailored just for you.
              </p>
              <div className="hero-buttons">
                <Link to="/signup" className="btn-primary btn-large">
                  <FaRocket />
                  Start Your Voyage Free
                </Link>
                <Link to="/login" className="btn-outline">
                  <FaPlay />
                  Sign In to Continue
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
                  <div className="mini-logo">
                    <img src={skillVoyageLogo} alt="SV" className="card-logo" />
                  </div>
                  <span>Your Learning Dashboard</span>
                </div>
                <div className="progress-demo">
                  <div className="course-item">
                    <span>React Development Mastery</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '75%'}}></div>
                    </div>
                    <small>75% Complete</small>
                  </div>
                  <div className="course-item">
                    <span>Python for AI & Machine Learning</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '60%'}}></div>
                    </div>
                    <small>60% Complete</small>
                  </div>
                  <div className="course-item">
                    <span>Advanced Data Science</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '90%'}}></div>
                    </div>
                    <small>90% Complete</small>
                  </div>
                </div>
                <div className="badges-demo">
                  <div className="badge">🏆 Course Master</div>
                  <div className="badge">🔥 15-day Streak</div>
                  <div className="badge">⭐ Top 10% Learner</div>
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
            <p>Experience the future of online learning with our innovative, AI-driven platform</p>
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
            <p>Your personalized journey to mastery in three simple steps</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up & Set Your Course</h3>
              <p>Create your SkillVoyage account and tell us about your learning goals and interests. Our advanced AI will use this to craft your personalized learning experience.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Navigate with AI Guidance</h3>
              <p>Receive intelligent course recommendations powered by machine learning algorithms that adapt to your learning style, pace, and progress patterns.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Achieve & Excel</h3>
              <p>Complete courses, unlock achievements, maintain learning streaks, and compare your progress with a global community of motivated learners.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container-modern">
          <div className="section-header">
            <h2>Success Stories from Our Voyagers</h2>
            <p>Join thousands of successful learners who transformed their careers with SkillVoyage</p>
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
            <div className="cta-logo">
              <img src={skillVoyageLogo} alt="SkillVoyage" className="cta-logo-img" />
            </div>
            <h2>Ready to Begin Your SkillVoyage?</h2>
            <p>Join our community of learners and unlock your potential with AI-powered personalized education. Your journey to mastery starts here.</p>
            <div className="cta-buttons">
              <Link to="/signup" className="btn-primary btn-large">
                Start Your Voyage Now
                <FaArrowRight />
              </Link>
            </div>
            <div className="cta-features">
              <div className="cta-feature">
                <FaCheck className="text-green-300" />
                <span>Free to start your voyage</span>
              </div>
              <div className="cta-feature">
                <FaCheck className="text-green-300" />
                <span>No credit card required</span>
              </div>
              <div className="cta-feature">
                <FaCheck className="text-green-300" />
                <span>Cancel anytime</span>
              </div>
              <div className="cta-feature">
                <FaCheck className="text-green-300" />
                <span>24/7 learning support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
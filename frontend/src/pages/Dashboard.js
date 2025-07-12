import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  BarElement, 
  CategoryScale, 
  LinearScale,
  RadialLinearScale, 
  Tooltip, 
  Legend,
  LineElement,
  PointElement 
} from 'chart.js';
import { 
  FaTrophy, 
  FaSpinner, 
  FaFire, 
  FaClock, 
  FaUsers,
  FaChartLine,
  FaBookOpen,
  FaStar,
  FaBullseye,
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaGraduationCap
} from 'react-icons/fa';
import axios from 'axios';
import Select from 'react-select';
import LearningPaceTracker from '../components/LearningPaceTracker.js';
import PeerComparison from '../components/PeerComparison.js';
import CourseNotes from '../components/CourseNotes.js';
import './Dashboard.css';

ChartJS.register(
  ArcElement, 
  BarElement, 
  CategoryScale, 
  LinearScale,
  RadialLinearScale,  
  Tooltip, 
  Legend,
  LineElement,
  PointElement
);

function Dashboard({ name, preferences = [] }) {
  const [dashboardData, setDashboardData] = useState({
    progress: [],
    badges: [],
    streak: 0,
    goals: [],
    weeklyProgress: [],
    totalHours: 0,
    completedCourses: 0
  });
  const [recommendations, setRecommendations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // New states for goals and recommendations
  const [goals, setGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Mock course data for recommendations based on user preferences
  const mockCourseDatabase = {
    'Web Development': [
      { id: 1, title: 'Complete React.js Bootcamp', description: 'Master modern React development with hooks, context, and routing', rating: 4.8, duration: '12 weeks', students: 2340, category: 'Web Development' },
      { id: 2, title: 'Full Stack JavaScript Developer', description: 'Build complete web applications using MERN stack', rating: 4.9, duration: '16 weeks', students: 1890, category: 'Web Development' },
      { id: 3, title: 'Advanced CSS & Responsive Design', description: 'Create stunning responsive websites with modern CSS', rating: 4.7, duration: '8 weeks', students: 1567, category: 'Web Development' }
    ],
    'Data Science': [
      { id: 4, title: 'Python for Data Analysis', description: 'Learn pandas, numpy, and data visualization techniques', rating: 4.6, duration: '10 weeks', students: 3200, category: 'Data Science' },
      { id: 5, title: 'Machine Learning Fundamentals', description: 'Introduction to ML algorithms and implementations', rating: 4.8, duration: '14 weeks', students: 2800, category: 'Data Science' },
      { id: 6, title: 'Data Visualization with Tableau', description: 'Create compelling data stories and dashboards', rating: 4.5, duration: '6 weeks', students: 1200, category: 'Data Science' }
    ],
    'Machine Learning': [
      { id: 7, title: 'Deep Learning with TensorFlow', description: 'Build neural networks and deep learning models', rating: 4.9, duration: '18 weeks', students: 1890, category: 'Machine Learning' },
      { id: 8, title: 'Natural Language Processing', description: 'Process and analyze text data with Python', rating: 4.7, duration: '12 weeks', students: 1450, category: 'Machine Learning' },
      { id: 9, title: 'Computer Vision Essentials', description: 'Image processing and computer vision techniques', rating: 4.6, duration: '14 weeks', students: 1100, category: 'Machine Learning' }
    ],
    'Artificial Intelligence': [
      { id: 10, title: 'AI Ethics and Responsible Development', description: 'Understanding ethical implications of AI systems', rating: 4.8, duration: '8 weeks', students: 890, category: 'Artificial Intelligence' },
      { id: 11, title: 'Reinforcement Learning', description: 'Learn Q-learning and policy gradient methods', rating: 4.7, duration: '16 weeks', students: 650, category: 'Artificial Intelligence' },
      { id: 12, title: 'AI for Business Applications', description: 'Implementing AI solutions in business contexts', rating: 4.5, duration: '10 weeks', students: 1200, category: 'Artificial Intelligence' }
    ],
    'Cybersecurity': [
      { id: 13, title: 'Ethical Hacking Fundamentals', description: 'Learn penetration testing and security assessment', rating: 4.9, duration: '12 weeks', students: 2100, category: 'Cybersecurity' },
      { id: 14, title: 'Network Security Engineering', description: 'Secure network infrastructure and protocols', rating: 4.6, duration: '14 weeks', students: 1600, category: 'Cybersecurity' },
      { id: 15, title: 'Digital Forensics Investigation', description: 'Investigate cyber crimes and digital evidence', rating: 4.7, duration: '16 weeks', students: 980, category: 'Cybersecurity' }
    ],
    'UI/UX Design': [
      { id: 16, title: 'User Experience Design Bootcamp', description: 'Design user-centered digital experiences', rating: 4.8, duration: '10 weeks', students: 1800, category: 'UI/UX Design' },
      { id: 17, title: 'Advanced Figma for Designers', description: 'Master prototyping and design systems in Figma', rating: 4.6, duration: '6 weeks', students: 1400, category: 'UI/UX Design' },
      { id: 18, title: 'Mobile App Design Principles', description: 'Design intuitive mobile applications', rating: 4.7, duration: '8 weeks', students: 1200, category: 'UI/UX Design' }
    ]
  };

  // Generate personalized recommendations based on user preferences
  const generatePersonalizedRecommendations = () => {
    if (!preferences || preferences.length === 0) {
      // Return popular courses if no preferences
      return [
        ...mockCourseDatabase['Web Development'].slice(0, 2),
        ...mockCourseDatabase['Data Science'].slice(0, 2),
        ...mockCourseDatabase['Machine Learning'].slice(0, 2)
      ].slice(0, 6);
    }

    const recommendedCourses = [];
    preferences.forEach(preference => {
      if (mockCourseDatabase[preference]) {
        recommendedCourses.push(...mockCourseDatabase[preference]);
      }
    });

    // Shuffle and limit to 6 recommendations
    return recommendedCourses.sort(() => 0.5 - Math.random()).slice(0, 6);
  };

  // Get all courses for courses tab with filtering
  const getAllCourses = () => {
    let allCourses = Object.values(mockCourseDatabase).flat();
    
    // Apply category filter
    if (selectedCategory) {
      allCourses = allCourses.filter(course => course.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchKeyword) {
      allCourses = allCourses.filter(course =>
        course.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        course.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        course.category.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }
    
    return allCourses;
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      setLoading(true);
      setError(null);

      try {
        // Simulate API calls - in production, replace with actual backend calls
        setTimeout(() => {
          // Set dashboard data with mock values
          setDashboardData({
            progress: [],
            badges: [
              { name: '3-Day Streak', icon: '🔥' },
              { name: 'First Course', icon: '🎯' }
            ],
            streak: 3,
            goals: goals,
            weeklyProgress: [2, 3, 1, 4, 2, 5, 3],
            totalHours: 24,
            completedCourses: 2
          });

          // Generate personalized recommendations
          setRecommendations(generatePersonalizedRecommendations());
          
          // Set courses with filtering
          setCourses(getAllCourses());
          
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Fetch error:', err.message);
        setError(err.message || 'Error fetching data');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchKeyword, preferences, goals]);

  // Goal management functions
  const handleCreateGoal = (goalData) => {
    const newGoal = {
      id: Date.now(),
      ...goalData,
      currentValue: 0,
      isCompleted: false,
      createdAt: new Date()
    };
    setGoals([...goals, newGoal]);
    setShowGoalModal(false);
  };

  const handleUpdateGoal = (goalId, updates) => {
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, ...updates, updatedAt: new Date() } : goal
    ));
  };

  const handleDeleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(goal => goal.id !== goalId));
    }
  };

  // Chart configurations
  const progressData = {
    labels: dashboardData.progress.length ? 
      dashboardData.progress.map(p => p.courseId?.title || 'Unknown') : 
      ['No Data'],
    datasets: [
      {
        label: 'Completion %',
        data: dashboardData.progress.length ? 
          dashboardData.progress.map(p => (p.completion || 0) * 100) : 
          [0],
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const goalsData = {
    labels: goals.length ? 
      goals.map(g => g.title || 'Goal') : 
      ['No Goals'],
    datasets: [
      {
        data: goals.length ? 
          goals.map(g => (g.currentValue / (g.targetValue || 1)) * 100) : 
          [0],
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(99, 102, 241, 0.8)',
        ],
        borderColor: [
          'rgba(37, 99, 235, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(99, 102, 241, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const weeklyProgressData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Hours Studied',
        data: dashboardData.weeklyProgress || [2, 3, 1, 4, 2, 5, 3],
        borderColor: 'rgba(37, 99, 235, 1)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const handleCompleteCourse = async (courseId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/complete-course`,
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        setDashboardData(prev => ({
          ...prev,
          streak: response.data.streak,
          badges: response.data.badges,
        }));
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = 'Course completed! Check your badges and streak.';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      }
    } catch (err) {
      console.error('Complete course error:', err.message);
      setError('Failed to complete course');
    }
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Machine Learning', label: 'Machine Learning' },
    { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
    { value: 'Cybersecurity', label: 'Cybersecurity' },
    { value: 'UI/UX Design', label: 'UI/UX Design' },
  ];

  // Goal Item Component
  const GoalItem = ({ goal }) => {
    const progressPercentage = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
    const isCompleted = goal.isCompleted || progressPercentage >= 100;
    const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !isCompleted;

    const handleProgressUpdate = () => {
      const newValue = prompt(`Update progress for "${goal.title}" (current: ${goal.currentValue}/${goal.targetValue}):`);
      if (newValue !== null && !isNaN(newValue)) {
        handleUpdateGoal(goal.id, { currentValue: parseInt(newValue) });
      }
    };

    return (
      <div className={`goal-item ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
        <div className="goal-header">
          <div className="goal-title-section">
            <h4>{goal.title}</h4>
            {goal.category && <span className="goal-category">{goal.category}</span>}
          </div>
          <div className="goal-actions">
            <span className="goal-progress-text">{Math.round(progressPercentage)}%</span>
            <button onClick={handleProgressUpdate} className="btn-icon">
              <FaEdit />
            </button>
            <button onClick={() => handleDeleteGoal(goal.id)} className="btn-icon delete">
              <FaTrash />
            </button>
          </div>
        </div>

        <div className="progress-bar">
          <div className={`progress-fill ${isCompleted ? 'completed' : ''}`} style={{ width: `${progressPercentage}%` }} />
        </div>

        <div className="goal-details">
          <span className="goal-progress-detail">
            {goal.currentValue} / {goal.targetValue} {goal.category || 'units'}
          </span>
          {goal.deadline && (
            <span className={`deadline ${isOverdue ? 'overdue' : ''}`}>
              <FaCalendarAlt /> Due: {new Date(goal.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        {goal.description && (
          <p className="goal-description">{goal.description}</p>
        )}
      </div>
    );
  };

  // Goal Modal Component
  const GoalModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      targetValue: '',
      deadline: '',
      category: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleCreateGoal({
        ...formData,
        targetValue: parseInt(formData.targetValue),
        deadline: formData.deadline ? new Date(formData.deadline) : null
      });
      setFormData({ title: '', description: '', targetValue: '', deadline: '', category: '' });
    };

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3>Create New Goal</h3>
            <button onClick={() => setShowGoalModal(false)} className="modal-close">×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="modal-body">
            <div className="form-group">
              <label>Goal Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                placeholder="Complete 5 Web Development courses"
              />
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your learning goal..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Value</label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select category</option>
                  <option value="courses">Courses</option>
                  <option value="hours">Hours</option>
                  <option value="certificates">Certificates</option>
                  <option value="projects">Projects</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Deadline (Optional)</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={() => setShowGoalModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Recommendation Card Component
  const RecommendationCard = ({ course }) => {
    return (
      <div className="recommendation-card">
        <div className="course-category">
          {course.category}
        </div>
        
        <h4 className="course-title">
          {course.title}
        </h4>
        
        <p className="course-description">
          {course.description}
        </p>

        <div className="course-meta">
          <div className="meta-item">
            <FaStar className="meta-icon" />
            <span>{course.rating}</span>
          </div>
          <div className="meta-item">
            <FaClock className="meta-icon" />
            <span>{course.duration}</span>
          </div>
          <div className="meta-item">
            <FaUsers className="meta-icon" />
            <span>{course.students} students</span>
          </div>
        </div>

        <div className="course-actions">
          <button className="btn-primary btn-sm">
            Enroll Now
          </button>
          <button className="btn-outline btn-sm">
            Learn More
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="loading-container">
          <div className="loading-spinner">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
          <p className="loading-text">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">
            Welcome back, <span className="text-gradient">{name}</span>! 🎯
          </h1>
          <p className="dashboard-subtitle">
            Ready to continue your learning journey? Here's your progress overview.
          </p>
        </div>
        
        {/* Quick Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bg-blue-100 text-blue-600">
              <FaBookOpen />
            </div>
            <div className="stat-info">
              <div className="stat-number">{dashboardData.completedCourses || 0}</div>
              <div className="stat-label">Completed Courses</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon bg-green-100 text-green-600">
              <FaClock />
            </div>
            <div className="stat-info">
              <div className="stat-number">{dashboardData.totalHours || 0}h</div>
              <div className="stat-label">Total Learning Time</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon bg-orange-100 text-orange-600">
              <FaFire />
            </div>
            <div className="stat-info">
              <div className="stat-number">{dashboardData.streak || 0}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon bg-purple-100 text-purple-600">
              <FaTrophy />
            </div>
            <div className="stat-info">
              <div className="stat-number">{dashboardData.badges?.length || 0}</div>
              <div className="stat-label">Badges Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartLine /> Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <FaBookOpen /> Courses
        </button>
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FaUsers /> Analytics
        </button>
        <button 
          className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <FaStar /> Notes
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Progress Charts Row */}
            <div className="charts-row">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Course Progress</h3>
                  <FaBullseye className="chart-icon" />
                </div>
                {dashboardData.progress.length ? (
                  <div className="chart-container">
                    <Bar data={progressData} options={chartOptions} />
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaBookOpen className="empty-icon" />
                    <p>No progress data available</p>
                    <span>Start a course to see your progress here</span>
                  </div>
                )}
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Weekly Activity</h3>
                  <FaCalendarAlt className="chart-icon" />
                </div>
                <div className="chart-container">
                  <Line data={weeklyProgressData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Goals and Badges Row */}
            <div className="goals-badges-row">
              {/* Learning Goals Section */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Learning Goals</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBullseye className="chart-icon" />
                    <button 
                      onClick={() => setShowGoalModal(true)} 
                      className="btn-primary btn-sm"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      <FaPlus /> Set Goal
                    </button>
                  </div>
                </div>

                {goals.length === 0 ? (
                  <div className="empty-state">
                    <FaBullseye className="empty-icon" />
                    <p>No goals set</p>
                    <span>Set learning goals to track progress</span>
                  </div>
                ) : (
                  <div className="goals-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {goals.map(goal => (
                      <GoalItem key={goal.id} goal={goal} />
                    ))}
                  </div>
                )}
              </div>

              {/* Achievement Badges */}
              <div className="badges-card">
                <div className="chart-header">
                  <h3>Achievement Badges</h3>
                  <FaTrophy className="chart-icon" />
                </div>
                {dashboardData.badges?.length ? (
                  <div className="badges-container">
                    {dashboardData.badges.map((badge, index) => (
                      <div key={index} className="badge-item">
                        <span className="badge-icon">{badge.icon}</span>
                        <span className="badge-name">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaTrophy className="empty-icon" />
                    <p>No badges earned yet</p>
                    <span>Complete courses to earn badges</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Recommendations Section */}
            <div className="recommendations-section">
              <div className="section-header">
                <FaGraduationCap style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginRight: '12px' }} />
                <div>
                  <h3>AI Recommendations</h3>
                  <p>Personalized course suggestions based on your preferences</p>
                </div>
              </div>

              {recommendations.length === 0 ? (
                <div className="empty-state full-width">
                  <FaStar className="empty-icon" />
                  <p>No recommendations available</p>
                  <span>Update your preferences to get personalized suggestions</span>
                </div>
              ) : (
                <div className="recommendations-grid">
                  {recommendations.map(course => (
                    <RecommendationCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="courses-tab">
            {/* Course Filters */}
            <div className="courses-filters">
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="category-filter">
                <Select
                  options={categoryOptions}
                  value={categoryOptions.find(option => option.value === selectedCategory)}
                  onChange={(option) => setSelectedCategory(option?.value || '')}
                  placeholder="Select category..."
                  isClearable
                />
              </div>
            </div>

            {/* Courses Grid */}
            <div className="courses-grid">
              {courses.length === 0 ? (
                <div className="empty-state full-width">
                  <FaBookOpen className="empty-icon" />
                  <p>No courses found</p>
                  <span>Try adjusting your search or filters</span>
                </div>
              ) : (
                courses.map(course => (
                  <div key={course.id} className="course-card">
                    <div className="course-header">
                      <div>
                        <div className="course-category">{course.category}</div>
                        <h4 className="course-title">{course.title}</h4>
                        <p className="course-description">{course.description}</p>
                      </div>
                      <button 
                        onClick={() => handleCompleteCourse(course.id)} 
                        className="complete-btn"
                        title="Mark as Complete"
                      >
                        <FaBullseye />
                      </button>
                    </div>

                    <div className="course-meta">
                      <div className="meta-item">
                        <FaStar className="meta-icon" />
                        <span>{course.rating}</span>
                      </div>
                      <div className="meta-item">
                        <FaClock className="meta-icon" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="meta-item">
                        <FaUsers className="meta-icon" />
                        <span>{course.students} students</span>
                      </div>
                    </div>

                    <div className="course-actions">
                      <button className="btn-primary btn-sm">
                        Start Course
                      </button>
                      <button className="btn-outline btn-sm">
                        Preview
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="charts-row">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Learning Pace</h3>
                  <FaChartLine className="chart-icon" />
                </div>
                <div className="chart-container">
                  <LearningPaceTracker />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Peer Comparison</h3>
                  <FaUsers className="chart-icon" />
                </div>
                <div className="chart-container">
                  <PeerComparison />
                </div>
              </div>
            </div>

            {goals.length > 0 && (
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Goals Progress</h3>
                  <FaBullseye className="chart-icon" />
                </div>
                <div className="chart-container">
                  <Doughnut data={goalsData} options={chartOptions} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="notes-tab">
            <CourseNotes />
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {showGoalModal && <GoalModal />}
    </div>
  );
}

export default Dashboard;
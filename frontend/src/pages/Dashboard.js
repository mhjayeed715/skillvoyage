import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
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
  FaCalendarAlt
} from 'react-icons/fa';
import axios from 'axios';
import Select from 'react-select';
import LearningPaceTracker from '../components/LearningPaceTracker';
import PeerComparison from '../components/PeerComparison';
import CourseNotes from '../components/CourseNotes';
import './Dashboard.css';

ChartJS.register(
  ArcElement, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Tooltip, 
  Legend,
  LineElement,
  PointElement
);

function Dashboard({ name, preferences }) {
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

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      setLoading(true);
      setError(null);

      try {
        // Fetch dashboard data
        const dashboardResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (dashboardResponse.status === 200) {
          setDashboardData(dashboardResponse.data);
        }

        // Fetch recommendations
        const recommendationsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (recommendationsResponse.status === 200) {
          setRecommendations(recommendationsResponse.data);
        }

        // Fetch courses
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchKeyword) params.append('keyword', searchKeyword);
        
        const coursesResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/courses?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (coursesResponse.status === 200) {
          setCourses(coursesResponse.data);
        }
      } catch (err) {
        console.error('Fetch error:', err.message);
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchKeyword]);

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
    labels: dashboardData.goals.length ? 
      dashboardData.goals.map(g => g.title || 'Goal') : 
      ['No Goals'],
    datasets: [
      {
        data: dashboardData.goals.length ? 
          dashboardData.goals.map(g => (g.current / (g.target || 1)) * 100) : 
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
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Machine Learning', label: 'Machine Learning' },
    { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
    { value: 'Cybersecurity', label: 'Cybersecurity' },
  ];

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
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Learning Goals</h3>
                  <FaBullseye className="chart-icon" />
                </div>
                {dashboardData.goals.length ? (
                  <div className="chart-container">
                    <Doughnut data={goalsData} options={chartOptions} />
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaBullseye className="empty-icon" />
                    <p>No goals set</p>
                    <span>Set learning goals to track progress</span>
                  </div>
                )}
              </div>

              <div className="badges-card">
                <div className="chart-header">
                  <h3>Achievement Badges</h3>
                  <FaTrophy className="chart-icon" />
                </div>
                <div className="badges-container">
                  {dashboardData.badges.length ? (
                    dashboardData.badges.map((badge, index) => (
                      <div key={index} className="badge-item">
                        <FaTrophy className="badge-icon" />
                        <span className="badge-name">{badge}</span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <FaTrophy className="empty-icon" />
                      <p>No badges yet</p>
                      <span>Complete courses to earn badges</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="recommendations-section">
              <div className="section-header">
                <h3>AI Recommendations</h3>
                <p>Personalized course suggestions based on your preferences</p>
              </div>
              <div className="recommendations-grid">
                {recommendations.length ? (
                  recommendations.slice(0, 6).map((course) => (
                    <div key={course._id} className="recommendation-card">
                      <div className="course-category">{course.category}</div>
                      <h4 className="course-title">{course.title}</h4>
                      <p className="course-description">
                        Enhance your skills in {course.category.toLowerCase()}
                      </p>
                      <div className="course-actions">
                        <a 
                          href={course.youtube} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-primary btn-sm"
                        >
                          Start Learning
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state full-width">
                    <FaStar className="empty-icon" />
                    <p>No recommendations available</p>
                    <span>Update your preferences to get personalized suggestions</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="courses-tab">
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
                  onChange={(opt) => setSelectedCategory(opt ? opt.value : '')}
                  placeholder="Filter by category..."
                  isClearable
                  className="category-select"
                />
              </div>
            </div>

            <div className="courses-grid">
              {courses.length ? (
                courses.map((course) => (
                  <div key={course._id} className="course-card">
                    <div className="course-header">
                      <div className="course-category">{course.category}</div>
                      <button 
                        onClick={() => handleCompleteCourse(course._id)}
                        className="complete-btn"
                        title="Mark as Complete"
                      >
                        <FaBullseye />
                      </button>
                    </div>
                    <h4 className="course-title">{course.title}</h4>
                    <div className="course-actions">
                      <a 
                        href={course.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-primary btn-sm"
                      >
                        Watch Course
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state full-width">
                  <FaBookOpen className="empty-icon" />
                  <p>No courses found</p>
                  <span>Try adjusting your search or category filter</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <LearningPaceTracker />
            <PeerComparison />
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="notes-tab">
            <CourseNotes />
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
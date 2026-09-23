"use client"

import { useEffect, useMemo, useState } from "react"
import { Bar, Doughnut, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js"
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
  FaGraduationCap,
  FaYoutube,
  FaCheckCircle,
} from "react-icons/fa"
import axios from "axios"
import Select from "react-select"
import LearningPaceTracker from "../components/LearningPaceTracker.js"
import PeerComparison from "../components/PeerComparison.js"
import CourseNotes from "../components/CourseNotes.js"
import "./Dashboard.css"

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement)

// Extract video id for thumbnails
function extractYouTubeIds(url) {
  try {
    const u = new URL(url)
    const v = u.searchParams.get("v") || ""
    const list = u.searchParams.get("list") || ""
    return { videoId: v, playlistId: list }
  } catch (_e) {
    return { videoId: "", playlistId: "" }
  }
}
function getVideoThumbFromUrl(youtubeUrl) {
  const { videoId } = extractYouTubeIds(youtubeUrl || "")
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : ""
}

const CATEGORY_LIST = [
  "Web Development",
  "Data Science",
  "Machine Learning",
  "Artificial Intelligence",
  "Cybersecurity",
  "Cloud Computing",
  "DevOps",
  "Mobile Development",
  "Game Development",
  "Blockchain",
  "UI/UX Design",
  "Graphic Design",
  "Digital Marketing",
  "SEO",
  "Content Writing",
  "Video Editing",
  "Photography",
  "3D Modeling",
  "Animation",
  "Software Engineering",
  "Database Management",
  "Network Administration",
  "System Administration",
  "Project Management",
  "Product Management",
  "Business Analysis",
  "Data Analysis",
  "Data Visualization",
  "Statistics",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Environmental Science",
  "Economics",
  "Finance",
  "Accounting",
  "Human Resources",
  "Public Speaking",
  "Leadership",
  "Time Management",
  "Critical Thinking",
  "Problem Solving",
  "Teamwork",
  "Communication Skills",
  "Creative Writing",
  "Journalism",
  "Translation",
  "Foreign Languages",
  "Psychology",
  "Sociology",
  "History",
  "Philosophy",
  "Music Production",
  "Sound Design",
  "Fashion Design",
  "Interior Design",
  "Cooking",
  "Gardening",
  "Fitness Training",
]

function Dashboard({ name, preferences = [] }) {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || ""

  const [dashboardData, setDashboardData] = useState({
    progress: [],
    badges: [],
    streak: 0,
    goals: [],
    weeklyProgress: [],
    totalHours: 0,
    completedCourses: 0,
  })
  const [allCourses, setAllCourses] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [courseThumbs, setCourseThumbs] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Goals (local UX)
  const [goals, setGoals] = useState([])
  const [showGoalModal, setShowGoalModal] = useState(false)

  // Fetch dashboard + courses
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")
        const [dashRes, courseRes] = await Promise.all([
          axios.get(`${backendUrl}/api/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${backendUrl}/api/courses`),
        ])
        if (!mounted) return
        const dash = dashRes.data || {}
        setDashboardData({
          progress: dash.progress || [],
          badges: dash.badges || [],
          streak: dash.streak || 0,
          goals: dash.goals || [],
          weeklyProgress: dash.weeklyProgress || [],
          totalHours: dash.totalHours || 0,
          completedCourses: dash.completedCourses || 0,
        })
        setAllCourses(Array.isArray(courseRes.data) ? courseRes.data : [])
      } catch (e) {
        console.error("Dashboard fetch error:", e.message)
        if (mounted) setError(e.message || "Failed to load dashboard")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [backendUrl])

  // Recommendations
  useEffect(() => {
    let recs = []
    if (preferences && preferences.length) {
      recs = allCourses.filter((c) => preferences.includes(c.category))
    } else {
      recs = allCourses.slice(0, 12)
    }
    recs = [...recs].sort(() => 0.5 - Math.random()).slice(0, 6)
    setRecommendations(recs)
  }, [allCourses, preferences])

  // Filter courses
  const filteredCourses = useMemo(() => {
    let list = [...allCourses]
    if (selectedCategory) list = list.filter((c) => c.category === selectedCategory)
    if (searchKeyword) {
      const q = searchKeyword.toLowerCase()
      list = list.filter(
        (c) => (c.title || "").toLowerCase().includes(q) || (c.category || "").toLowerCase().includes(q),
      )
    }
    return list
  }, [allCourses, selectedCategory, searchKeyword])

  useEffect(() => setCourses(filteredCourses), [filteredCourses])

  // Load YouTube thumbnails
  useEffect(() => {
    const controller = new AbortController()
    async function resolveThumb(course) {
      if (!course?.youtube) return ""
      const direct = getVideoThumbFromUrl(course.youtube)
      if (direct) return direct
      try {
        const oembed = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(course.youtube)}&format=json`,
          { signal: controller.signal },
        )
        if (oembed.ok) {
          const data = await oembed.json()
          return data.thumbnail_url || ""
        }
      } catch (_e) {}
      return ""
    }
    async function run() {
      const updates = {}
      await Promise.all(
        courses.map(async (c) => {
          if (courseThumbs[c._id]) return
          const url = await resolveThumb(c)
          if (url) updates[c._id] = url
        }),
      )
      if (Object.keys(updates).length) setCourseThumbs((prev) => ({ ...prev, ...updates }))
    }
    if (courses.length) run()
    return () => controller.abort()
  }, [courses, courseThumbs])

  // Charts
  const progressData = {
    labels: (dashboardData.progress || []).length
      ? dashboardData.progress.map((p) => p.title || "Course")
      : ["No Data"],
    datasets: [
      {
        label: "Completion %",
        data: (dashboardData.progress || []).length
          ? dashboardData.progress.map((p) => Math.round((p.completion || 0) * 100))
          : [0],
        backgroundColor: "rgba(37, 99, 235, 0.8)",
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }
  const weeklyProgressData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Hours Studied",
        data: dashboardData.weeklyProgress || [2, 3, 1, 4, 2, 5, 3],
        borderColor: "rgba(37, 99, 235, 1)",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgba(37, 99, 235, 1)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  }
  const goalsData = {
    labels: goals.length ? goals.map((g) => g.title || "Goal") : ["No Goals"],
    datasets: [
      {
        data: goals.length ? goals.map((g) => (g.currentValue / (g.targetValue || 1)) * 100) : [0],
        backgroundColor: [
          "rgba(37,99,235,0.8)",
          "rgba(16,185,129,0.8)",
          "rgba(245,158,11,0.8)",
          "rgba(99,102,241,0.8)",
        ],
        borderColor: ["rgba(37,99,235,1)", "rgba(16,185,129,1)", "rgba(245,158,11,1)", "rgba(99,102,241,1)"],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  }

  // Goals CRUD
  const handleCreateGoal = (goalData) => {
    const newGoal = { id: Date.now(), ...goalData, currentValue: 0, isCompleted: false, createdAt: new Date() }
    setGoals((prev) => [...prev, newGoal])
    setShowGoalModal(false)
  }
  const handleUpdateGoal = (goalId, updates) => {
    setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, ...updates, updatedAt: new Date() } : g)))
  }
  const handleDeleteGoal = (goalId) => {
    if (window.confirm("Are you sure you want to delete this goal?"))
      setGoals((prev) => prev.filter((g) => g.id !== goalId))
  }

  // Course Progress
  const getCourseProgressEntry = (courseId) =>
    (dashboardData.progress || []).find((p) => String(p.courseId) === String(courseId)) || null
  const statusToCompletion = (status) => (status === "completed" ? 1 : status === "in-progress" ? 0.5 : 0)
  const handleUpdateCourseStatus = async (courseId, courseTitle, status) => {
    const token = localStorage.getItem("token")
    const completion = statusToCompletion(status)
    // optimistic
    setDashboardData((prev) => {
      const arr = prev.progress || []
      const idx = arr.findIndex((p) => String(p.courseId) === String(courseId))
      const updated =
        idx >= 0
          ? arr.map((p, i) => (i === idx ? { ...p, status, completion, title: courseTitle } : p))
          : [...arr, { courseId, status, completion, title: courseTitle }]
      return { ...prev, progress: updated, completedCourses: updated.filter((p) => (p.completion || 0) >= 1).length }
    })
    try {
      if (status === "completed") {
        await axios.post(
          `${backendUrl}/api/complete-course`,
          { courseId },
          { headers: { Authorization: `Bearer ${token}` } },
        )
      } else {
        await axios.post(
          `${backendUrl}/api/course-progress`,
          { courseId, status, completion },
          { headers: { Authorization: `Bearer ${token}` } },
          )
      }
    } catch (e) {
      console.error("Update status failed:", e.message)
      setError("Failed to update course progress")
      setTimeout(() => setError(null), 2400)
    }
  }
  const handleCompleteCourse = (courseId, courseTitle) => {
    handleUpdateCourseStatus(courseId, courseTitle, "completed")
    const n = document.createElement("div")
    n.className = "notification success"
    n.textContent = "Course marked completed!"
    document.body.appendChild(n)
    setTimeout(() => document.body.removeChild(n), 2000)
  }

  // Subcomponents
  const GoalItem = ({ goal }) => {
    const progressPercentage = Math.min((goal.currentValue / goal.targetValue) * 100, 100)
    const isCompleted = goal.isCompleted || progressPercentage >= 100
    const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !isCompleted
    const handleProgressUpdate = () => {
      const newValue = prompt(
        `Update progress for "${goal.title}" (current: ${goal.currentValue}/${goal.targetValue}):`,
      )
      if (newValue !== null && !isNaN(newValue))
        handleUpdateGoal(goal.id, { currentValue: Number.parseInt(newValue, 10) })
    }
    return (
      <div className={`goal-item ${isCompleted ? "completed" : ""} ${isOverdue ? "overdue" : ""}`}>
        <div className="goal-header">
          <div className="goal-title-section">
            <h4>{goal.title}</h4>
            {goal.category && <span className="goal-category">{goal.category}</span>}
          </div>
          <div className="goal-actions">
            <span className="goal-progress-text">{Math.round(progressPercentage)}%</span>
            <button onClick={handleProgressUpdate} className="btn-icon" aria-label="Edit progress">
              <FaEdit />
            </button>
            <button onClick={() => handleDeleteGoal(goal.id)} className="btn-icon delete" aria-label="Delete goal">
              <FaTrash />
            </button>
          </div>
        </div>
        <div className="dash-progress-bar">
          <div
            className={`dash-progress-fill ${isCompleted ? "completed" : ""}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="goal-details">
          <span className="goal-progress-detail">
            {goal.currentValue} / {goal.targetValue} {goal.category || "units"}
          </span>
          {goal.deadline && (
            <span className={`deadline ${isOverdue ? "overdue" : ""}`}>
              <FaCalendarAlt /> Due: {new Date(goal.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
        {goal.description && <p className="goal-description">{goal.description}</p>}
      </div>
    )
  }

  const GoalModal = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      targetValue: "",
      deadline: "",
      category: "",
    })
    const handleSubmit = (e) => {
      e.preventDefault()
      handleCreateGoal({
        ...formData,
        targetValue: Number.parseInt(formData.targetValue || "0", 10),
        deadline: formData.deadline ? new Date(formData.deadline) : null,
      })
      setFormData({ title: "", description: "", targetValue: "", deadline: "", category: "" })
    }
    return (
      <div className="modal-overlay" role="dialog" aria-modal="true">
        <div className="modal">
          <div className="modal-header">
            <h3>Create New Goal</h3>
            <button onClick={() => setShowGoalModal(false)} className="modal-close" aria-label="Close">
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className="modal-body">
            <div className="form-group">
              <label>Goal Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Complete 5 courses"
              />
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your learning goal..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Target Value</label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowGoalModal(false)} className="dash-btn-outline btn-sm">
                Cancel
              </button>
              <button type="submit" className="dash-btn-primary btn-sm">
                Create Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const StatusControl = ({ course }) => {
    const progress = getCourseProgressEntry(course._id)
    const currentStatus = progress?.status || "not-started"
    const onChange = (e) => handleUpdateCourseStatus(course._id, course.title, e.target.value)
    return (
      <div className="status-control" aria-label="Course progress status">
        <select className="status-select" value={currentStatus} onChange={onChange}>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {currentStatus === "completed" && (
          <span className="status-pill completed">
            <FaCheckCircle /> Completed
          </span>
        )}
      </div>
    )
  }

  const RecommendationCard = ({ course }) => {
    const thumb = courseThumbs[course._id] || getVideoThumbFromUrl(course.youtube) || ""
    return (
      <div className="recommendation-card">
        <div className="course-category">{course.category}</div>
        <div className="course-media">
          {thumb ? (
            <img src={thumb || "/placeholder.svg"} alt={`${course.title} thumbnail`} className="thumb-img" />
          ) : (
            <div className="thumb-fallback">
              <FaYoutube className="yt-icon" />
            </div>
          )}
          <div className="media-overlay">
            <a
              className="dash-btn-primary btn-sm"
              href={course.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Watch on YouTube"
            >
              <FaYoutube /> Watch
            </a>
          </div>
        </div>
        <h4 className="course-title">{course.title}</h4>
        {/* Removed Start button as requested; users can set status via StatusControl on the Courses tab */}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="loading-container">
          <div className="loading-spinner">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="dashboard-content">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()} className="dash-btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">
            Welcome back, <span className="text-gradient">{name}</span>! 🎯
          </h1>
          <p className="dashboard-subtitle">Ready to continue your learning journey? Here's your progress overview.</p>
        </div>

        {/* Quick Stats */}
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

      {/* Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <FaChartLine /> Overview
        </button>
        <button
          className={`tab-button ${activeTab === "courses" ? "active" : ""}`}
          onClick={() => setActiveTab("courses")}
        >
          <FaBookOpen /> Courses
        </button>
        <button
          className={`tab-button ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <FaUsers /> Analytics
        </button>
        <button className={`tab-button ${activeTab === "notes" ? "active" : ""}`} onClick={() => setActiveTab("notes")}>
          <FaStar /> Notes
        </button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="charts-row">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Course Progress</h3>
                  <FaBullseye className="chart-icon" />
                </div>
                {dashboardData.progress?.length ? (
                  <div className="chart-container">
                    <Bar data={progressData} options={chartOptions} />
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaBookOpen className="empty-icon" />
                    <p>No progress data available</p>
                    <span>Use the Courses tab to start tracking.</span>
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

            <div className="goals-badges-row">
              {/* Goals */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Learning Goals</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaBullseye className="chart-icon" />
                    <button onClick={() => setShowGoalModal(true)} className="dash-btn-primary btn-sm">
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
                  <div className="goals-container" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {goals.map((goal) => (
                      <GoalItem key={goal.id} goal={goal} />
                    ))}
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="badges-card">
                <div className="chart-header">
                  <h3>Achievement Badges</h3>
                  <FaTrophy className="chart-icon" />
                </div>
                {dashboardData.badges?.length ? (
                  <div className="badges-container">
                    {dashboardData.badges.map((badge, idx) => (
                      <div key={idx} className="badge-item">
                        <span className="badge-icon">🏅</span>
                        <span className="badge-name">{badge}</span>
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

            {/* Recommendations */}
            <div className="recommendations-section">
              <div className="section-header">
                <FaGraduationCap style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginRight: "12px" }} />
                <div>
                  <h3>Recommended Playlists</h3>
                  <p>Curated from your learning preferences</p>
                </div>
              </div>
              {!recommendations.length ? (
                <div className="empty-state full-width">
                  <FaStar className="empty-icon" />
                  <p>No recommendations available</p>
                  <span>Update your preferences to get personalized suggestions</span>
                </div>
              ) : (
                <div className="recommendations-grid">
                  {recommendations.map((course) => (
                    <RecommendationCard key={course._id} course={course} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "courses" && (
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
                  options={[
                    { value: "", label: "All Categories" },
                    ...CATEGORY_LIST.map((c) => ({ value: c, label: c })),
                  ]}
                  value={
                    [
                      { value: "", label: "All Categories" },
                      ...CATEGORY_LIST.map((c) => ({ value: c, label: c })),
                    ].find((o) => o.value === selectedCategory) || { value: "", label: "All Categories" }
                  }
                  onChange={(opt) => setSelectedCategory(opt?.value || "")}
                  isClearable
                />
              </div>
            </div>

            <div className="courses-grid">
              {courses.length === 0 ? (
                <div className="empty-state full-width">
                  <FaBookOpen className="empty-icon" />
                  <p>No courses found</p>
                  <span>Try adjusting your search or filters</span>
                </div>
              ) : (
                courses.map((course) => {
                  const thumb = courseThumbs[course._id] || getVideoThumbFromUrl(course.youtube) || ""
                  const progressEntry = getCourseProgressEntry(course._id)
                  const percent = Math.round((progressEntry?.completion || 0) * 100)
                  return (
                    <div key={course._id} className="course-card">
                      <div className="course-media">
                        {thumb ? (
                          <img
                            src={thumb || "/placeholder.svg"}
                            alt={`${course.title} thumbnail`}
                            className="thumb-img"
                          />
                        ) : (
                          <div className="thumb-fallback">
                            <FaYoutube className="yt-icon" />
                          </div>
                        )}
                        <div className="media-overlay">
                          <a
                            className="dash-btn-primary btn-sm"
                            href={course.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Watch on YouTube"
                          >
                            <FaYoutube /> Watch
                          </a>
                        </div>
                      </div>

                      <div className="course-header">
                        <div>
                          <div className="course-category">{course.category}</div>
                          <h4 className="course-title">{course.title}</h4>
                        </div>
                        <button
                          onClick={() => handleCompleteCourse(course._id, course.title)}
                          className="complete-btn"
                          title="Mark as Complete"
                          aria-label="Mark as complete"
                        >
                          <FaBullseye />
                        </button>
                      </div>

                      <div className="course-progress">
                        <div className="dash-progress-bar">
                          <div
                            className={`dash-progress-fill ${percent >= 100 ? "completed" : ""}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="progress-text">{percent}% completed</div>
                      </div>

                      <div className="course-actions">
                        <a
                          className="dash-btn-primary btn-sm"
                          href={course.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaYoutube /> Watch Playlist
                        </a>
                        {/* Removed 'Set In Progress' button per request. Use selector below. */}
                      </div>

                      <StatusControl course={course} />
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
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

        {activeTab === "notes" && (
          <div className="notes-tab">
            <CourseNotes />
          </div>
        )}
      </div>

      {showGoalModal && <GoalModal />}
    </div>
  )
}

export default Dashboard

"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Select from "react-select"
import {
  FaUsers,
  FaBook,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaChartLine,
  FaDownload,
  FaGraduationCap,
  FaTrophy,
} from "react-icons/fa"
import { useLocation, useNavigate } from "react-router-dom"
import { getBackendUrl } from "../utils/apiConfig"
import "./AdminPanel.css"

function AdminPanel() {
  const backendUrl = getBackendUrl()
  const navigate = useNavigate()
  const location = useLocation()

  const [title, setTitle] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [category, setCategory] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPreferences, setEditPreferences] = useState([])
  const [editProgress, setEditProgress] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeUsers: 0,
    completionRate: 0,
  })

  // Sync tab state with URL (?tab=overview|users|courses|add-course)
  const getTabFromQuery = () => {
    const params = new URLSearchParams(location.search)
    return params.get("tab") || "overview"
  }
  useEffect(() => {
    const tab = getTabFromQuery()
    setActiveTab(tab)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])
  const setTab = (tab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(location.search)
    if (params.get("tab") !== tab) {
      params.set("tab", tab)
      navigate({ pathname: "/admin", search: params.toString() }, { replace: true })
    }
  }

  const preferenceOptions = [
    { value: "Web Development", label: "Web Development" },
    { value: "Data Science", label: "Data Science" },
    { value: "Machine Learning", label: "Machine Learning" },
    { value: "Artificial Intelligence", label: "Artificial Intelligence" },
    { value: "Cybersecurity", label: "Cybersecurity" },
    { value: "Cloud Computing", label: "Cloud Computing" },
    { value: "DevOps", label: "DevOps" },
    { value: "Mobile Development", label: "Mobile Development" },
  ]

  const categoryOptions = [
    "Web Development",
    "Data Science",
    "Machine Learning",
    "Artificial Intelligence",
    "Cybersecurity",
    "Cloud Computing",
    "DevOps",
    "Mobile Development",
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      const [usersRes, coursesRes] = await Promise.all([
        axios.get(`${backendUrl}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${backendUrl}/api/admin/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      setUsers(usersRes.data)
      setCourses(coursesRes.data)

      setStats({
        totalUsers: usersRes.data.length,
        totalCourses: coursesRes.data.length,
        activeUsers: usersRes.data.filter(
          (user) => user.lastActive && new Date(user.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        ).length,
        completionRate: Math.round(
          usersRes.data.reduce(
            (acc, user) => acc + (user.progress?.reduce((sum, p) => sum + p.completion, 0) || 0),
            0,
          ) / (usersRes.data.length || 1),
        ),
      })
    } catch (err) {
      setMessage("Error fetching data: " + (err.response?.data?.error || err.message))
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlaylist = async (e) => {
    e.preventDefault()
    if (!title.trim() || !youtubeUrl.trim() || !category.trim()) {
      setMessage("Please fill in all required fields")
      setMessageType("error")
      return
    }
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      const res = await axios.post(
        `${backendUrl}/api/admin/courses`,
        { title: title.trim(), youtube: youtubeUrl.trim(), category },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setMessage("Course added successfully!")
      setMessageType("success")
      setTitle("")
      setYoutubeUrl("")
      setCategory("")
      setCourses([...courses, res.data.course])
      setStats((prev) => ({ ...prev, totalCourses: prev.totalCourses + 1 }))
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add course")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user._id)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditPreferences((user.preferences || []).map((p) => ({ value: p, label: p })))
    setEditProgress(user.progress?.[0]?.completion || 0)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    if (!editName.trim() || !editEmail.trim()) {
      setMessage("Name and email are required")
      setMessageType("error")
      return
    }
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      const res = await axios.put(
        `${backendUrl}/api/admin/users/${selectedUser}`,
        {
          name: editName.trim(),
          email: editEmail.trim(),
          preferences: editPreferences.map((p) => p.value),
          progress: [{ completion: Number.parseFloat(editProgress) }],
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setMessage("User updated successfully!")
      setMessageType("success")
      setUsers(users.map((u) => (u._id === selectedUser ? res.data.user : u)))
      setSelectedUser(null)
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to update user")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      await axios.delete(`${backendUrl}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessage("User deleted successfully!")
      setMessageType("success")
      setUsers(users.filter((u) => u._id !== userId))
      setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers - 1 }))
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to delete user")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleEditCourse = (course) => {
    setSelectedCourse(course._id)
    setTitle(course.title)
    setYoutubeUrl(course.youtube)
    setCategory(course.category)
  }

  const handleUpdateCourse = async (e) => {
    e.preventDefault()
    if (!title.trim() || !youtubeUrl.trim() || !category.trim()) {
      setMessage("Please fill in all required fields")
      setMessageType("error")
      return
    }
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      const res = await axios.put(
        `${backendUrl}/api/admin/courses/${selectedCourse}`,
        { title: title.trim(), youtube: youtubeUrl.trim(), category },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setMessage("Course updated successfully!")
      setMessageType("success")
      setCourses(courses.map((c) => (c._id === selectedCourse ? res.data.course : c)))
      setSelectedCourse(null)
      setTitle("")
      setYoutubeUrl("")
      setCategory("")
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to update course")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      await axios.delete(`${backendUrl}/api/admin/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessage("Course deleted successfully!")
      setMessageType("success")
      setCourses(courses.filter((c) => c._id !== courseId))
      setStats((prev) => ({ ...prev, totalCourses: prev.totalCourses - 1 }))
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to delete course")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      (activeTab === "users"
        ? "Name,Email,Preferences,Progress\n" +
          users
            .map(
              (u) =>
                `"${u.name}","${u.email}","${(u.preferences || []).join(";")}","${u.progress?.[0]?.completion || 0}"`,
            )
            .join("\n")
        : "Title,Category,YouTube URL\n" + courses.map((c) => `"${c.title}","${c.category}","${c.youtube}"`).join("\n"))
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${activeTab}_export_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredUsers = users.filter(
    (user) =>
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredCourses = courses.filter(
    (course) =>
      (course.title || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === "" || course.category === filterCategory),
  )

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="header-content">
          <h1>
            <FaGraduationCap className="header-icon" />
            Admin Dashboard
          </h1>
          <p className="subtitle">Manage users, courses, and platform analytics</p>
        </div>
        {message && (
          <div className={`alert alert-${messageType}`}>
            {message}
            <button onClick={() => setMessage("")} className="alert-close">
              ×
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100">
            <FaUsers className="text-blue-600" />
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-100">
            <FaBook className="text-green-600" />
          </div>
          <div className="stat-content">
            <h3>{stats.totalCourses}</h3>
            <p>Total Courses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple-100">
            <FaChartLine className="text-purple-600" />
          </div>
          <div className="stat-content">
            <h3>{stats.activeUsers}</h3>
            <p>Active Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-orange-100">
            <FaTrophy className="text-orange-600" />
          </div>
          <div className="stat-content">
            <h3>{stats.completionRate}%</h3>
            <p>Avg Completion</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button className={`tab-button ${activeTab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>
          <FaChartLine />
          Overview
        </button>
        <button className={`tab-button ${activeTab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>
          <FaUsers />
          Users
        </button>
        <button className={`tab-button ${activeTab === "courses" ? "active" : ""}`} onClick={() => setTab("courses")}>
          <FaBook />
          Courses
        </button>
        <button
          className={`tab-button ${activeTab === "add-course" ? "active" : ""}`}
          onClick={() => setTab("add-course")}
        >
          <FaPlus />
          Add Course
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-section">
            <h2>Platform Overview</h2>
            <div className="overview-grid">
              <div className="overview-item">
                <h3>Recent Activity</h3>
                <p>Platform analytics and insights would go here</p>
              </div>
              <div className="overview-item">
                <h3>Growth Metrics</h3>
                <p>User growth and engagement metrics</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="users-section">
            <div className="section-header">
              <h2>
                <FaUsers />
                User Management
              </h2>
              <div className="header-actions">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <button onClick={exportData} className="btn-secondary">
                  <FaDownload />
                  Export
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Preferences</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <div className="preferences-tags">
                          {(user.preferences || []).slice(0, 2).map((pref) => (
                            <span key={pref} className="preference-tag">
                              {pref}
                            </span>
                          ))}
                          {(user.preferences || []).length > 2 && (
                            <span className="preference-tag more">+{(user.preferences || []).length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${(user.progress?.[0]?.completion || 0) * 100}%` }}
                          />
                        </div>
                        <span className="progress-text">
                          {Math.round((user.progress?.[0]?.completion || 0) * 100)}%
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleEditUser(user)} className="btn-icon btn-edit" title="Edit User">
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="btn-icon btn-delete"
                            title="Delete User"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit User Modal */}
            {selectedUser && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h3>Edit User</h3>
                    <button onClick={() => setSelectedUser(null)} className="modal-close">
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleUpdateUser} className="modal-body">
                    <div className="form-group">
                      <label>Name:</label>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Email:</label>
                      <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Preferences:</label>
                      <Select
                        isMulti
                        options={preferenceOptions}
                        value={editPreferences}
                        onChange={setEditPreferences}
                        className="react-select"
                        classNamePrefix="select"
                      />
                    </div>
                    <div className="form-group">
                      <label>Progress (0-1):</label>
                      <input
                        type="number"
                        value={editProgress}
                        onChange={(e) => setEditProgress(e.target.value)}
                        min="0"
                        max="1"
                        step="0.1"
                      />
                    </div>
                    <div className="modal-footer">
                      <button type="button" onClick={() => setSelectedUser(null)} className="btn-secondary">
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Updating..." : "Update User"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "courses" && (
          <div className="courses-section">
            <div className="section-header">
              <h2>
                <FaBook />
                Course Management
              </h2>
              <div className="header-actions">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button onClick={exportData} className="btn-secondary">
                  <FaDownload />
                  Export
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>URL</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course._id}>
                      <td>{course.title}</td>
                      <td>
                        <span className="category-badge">{course.category}</span>
                      </td>
                      <td>
                        <a href={course.youtube} target="_blank" rel="noopener noreferrer" className="url-link">
                          View Course
                        </a>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="btn-icon btn-edit"
                            title="Edit Course"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            className="btn-icon btn-delete"
                            title="Delete Course"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit Course Modal */}
            {selectedCourse && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h3>Edit Course</h3>
                    <button onClick={() => setSelectedCourse(null)} className="modal-close">
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleUpdateCourse} className="modal-body">
                    <div className="form-group">
                      <label>Title:</label>
                      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>YouTube URL:</label>
                      <input type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Category:</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                        <option value="">Select Category</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="modal-footer">
                      <button type="button" onClick={() => setSelectedCourse(null)} className="btn-secondary">
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Updating..." : "Update Course"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "add-course" && (
          <div className="add-course-section">
            <h2>
              <FaPlus />
              Add New Course
            </h2>
            <form onSubmit={handleAddPlaylist} className="course-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Course Title:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter course title..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category:</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="">Select Category</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>YouTube URL:</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/playlist?list=..."
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary btn-large" disabled={loading}>
                {loading ? "Adding Course..." : "Add Course"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel

"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import {
  FaSearch,
  FaTimes,
  FaPlay,
  FaCheckCircle,
  FaFire,
  FaClock,
  FaBookOpen,
  FaBrain,
  FaTv,
} from "react-icons/fa"
import InbuiltPlayer from "../components/InbuiltPlayer"
import { getBackendUrl } from "../utils/apiConfig"
import "./Courses.css"

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
  "Software Engineering",
  "Database Management",
  "Project Management",
]

function Courses() {
  const backendUrl = getBackendUrl()
  const [courses, setCourses] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [thumbs, setThumbs] = useState({})
  const [progressMap, setProgressMap] = useState({}) // courseId -> { status, completion }
  const [userStats, setUserStats] = useState({ streak: 1, totalHours: 0, completedCount: 0 })
  const [activeCourse, setActiveCourse] = useState(null) // Course opened in InbuiltPlayer
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const token = localStorage.getItem("token")
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  // Fetch user stats & dashboard data for telemetry banner
  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/dashboard`, { headers: authHeaders })
      if (res.data) {
        const watchHours = Math.round(((res.data.totalWatchTime || 0) / 3600) * 10) / 10
        setUserStats({
          streak: res.data.streak || 1,
          totalHours: Math.max(res.data.totalHours || 0, watchHours),
          completedCount: res.data.completedCourses || 0,
        })

        // Build progress map
        const map = {}
        ;(res.data.progress || []).forEach((p) => {
          if (p.courseId) {
            map[p.courseId] = {
              status: p.status || "not-started",
              completion: p.completion || 0,
            }
          }
        })
        setProgressMap(map)
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e.message)
    }
  }, [backendUrl, authHeaders])

  // Fetch courses list
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedCategory) params.append("category", selectedCategory)
    if (searchKeyword) params.append("keyword", searchKeyword)

    try {
      const response = await axios.get(`${backendUrl}/api/courses?${params.toString()}`, {
        headers: authHeaders,
      })
      if (response.status >= 200 && response.status < 300) {
        setCourses(Array.isArray(response.data) ? response.data : [])
      } else {
        setError(response.data?.error || "Failed to load courses")
      }
    } catch (e) {
      console.error("Courses fetch error:", e.message)
      setError("Failed to load courses. Please check connection.")
    } finally {
      setLoading(false)
    }
  }, [backendUrl, selectedCategory, searchKeyword, authHeaders])

  useEffect(() => {
    fetchCourses()
    fetchDashboardData()
  }, [fetchCourses, fetchDashboardData])

  // Load video thumbnails efficiently
  useEffect(() => {
    const controller = new AbortController()
    async function loadThumb(course) {
      if (!course?.youtube) return ""
      const direct = getVideoThumbFromUrl(course.youtube)
      if (direct) return direct
      try {
        const oembed = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(course.youtube)}&format=json`,
          { signal: controller.signal }
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
          if (thumbs[c._id]) return
          const url = await loadThumb(c)
          if (url) updates[c._id] = url
        })
      )
      if (Object.keys(updates).length) setThumbs((prev) => ({ ...prev, ...updates }))
    }
    if (courses.length) run()
    return () => controller.abort()
  }, [courses, thumbs])

  // Toggle course complete status
  const handleToggleComplete = async (course, e) => {
    if (e) e.stopPropagation()
    const current = progressMap[course._id]?.status || "not-started"
    const nextStatus = current === "completed" ? "not-started" : "completed"
    const nextCompletion = nextStatus === "completed" ? 1 : 0

    // Optimistic UI update
    setProgressMap((prev) => ({
      ...prev,
      [course._id]: { status: nextStatus, completion: nextCompletion },
    }))

    try {
      if (nextStatus === "completed") {
        await axios.post(
          `${backendUrl}/api/complete-course`,
          { courseId: course._id },
          { headers: authHeaders }
        )
      } else {
        await axios.post(
          `${backendUrl}/api/course-progress`,
          { courseId: course._id, status: nextStatus, completion: nextCompletion },
          { headers: authHeaders }
        )
      }
      fetchDashboardData()
    } catch (err) {
      console.error("Toggle complete error:", err)
    }
  }

  // Handle in-player progress updates
  const handlePlayerProgressUpdate = (courseId, status) => {
    setProgressMap((prev) => ({
      ...prev,
      [courseId]: {
        status,
        completion: status === "completed" ? 1 : Math.max(prev[courseId]?.completion || 0, 0.4),
      },
    }))
    fetchDashboardData()
  }

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchCat = !selectedCategory || c.category?.toLowerCase() === selectedCategory.toLowerCase()
      const matchSearch =
        !searchKeyword ||
        c.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchKeyword.toLowerCase())
      return matchCat && matchSearch
    })
  }, [courses, selectedCategory, searchKeyword])

  return (
    <div className="courses-page-root">
      {/* ── Active Inbuilt Video Player Modal ── */}
      {activeCourse && (
        <InbuiltPlayer
          course={activeCourse}
          onClose={() => setActiveCourse(null)}
          onProgressUpdated={handlePlayerProgressUpdate}
        />
      )}

      {/* ── Hero & Live Learning Telemetry ── */}
      <section className="courses-hero-banner">
        <div className="courses-hero-text">
          <div className="courses-hero-eyebrow">
            <FaTv /> Curated Interactive Lectures
          </div>
          <h1 className="courses-hero-title">Course Curriculum & Video Lab</h1>
          <p className="courses-hero-desc">
            Learn with our inbuilt YouTube player. Your study time is logged second-by-second to sustain
            your learning streak, power AI conceptual assistance, and advance your engineering profile.
          </p>
        </div>

        {/* Telemetry Stat Tiles */}
        <div className="courses-telemetry-cluster">
          <div className="telemetry-stat-tile">
            <div className="stat-tile-icon-box">
              <FaFire />
            </div>
            <div className="stat-tile-content">
              <span className="stat-tile-value">{userStats.streak} Days</span>
              <span className="stat-tile-label">Daily Streak</span>
            </div>
          </div>

          <div className="telemetry-stat-tile">
            <div className="stat-tile-icon-box">
              <FaClock />
            </div>
            <div className="stat-tile-content">
              <span className="stat-tile-value">{userStats.totalHours} hrs</span>
              <span className="stat-tile-label">Watched Time</span>
            </div>
          </div>

          <div className="telemetry-stat-tile">
            <div className="stat-tile-icon-box">
              <FaBookOpen />
            </div>
            <div className="stat-tile-content">
              <span className="stat-tile-value">{userStats.completedCount}</span>
              <span className="stat-tile-label">Completed</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search Bar & Category Navigation Strip ── */}
      <div className="courses-control-bar">
        <div className="courses-search-row">
          <div className="search-input-wrapper">
            <FaSearch className="search-glyph-icon" />
            <input
              type="text"
              placeholder="Search lectures, topics, or technologies..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="courses-search-field"
            />
            {searchKeyword && (
              <button
                type="button"
                className="courses-clear-search-btn"
                onClick={() => setSearchKeyword("")}
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="courses-category-strip" role="tablist">
          <button
            type="button"
            className={`category-chip-btn ${selectedCategory === "" ? "active" : ""}`}
            onClick={() => setSelectedCategory("")}
          >
            All Tracks ({courses.length})
          </button>
          {CATEGORY_LIST.map((cat) => {
            const count = courses.filter((c) => c.category?.toLowerCase() === cat.toLowerCase()).length
            if (count === 0 && selectedCategory !== cat) return null
            return (
              <button
                key={cat}
                type="button"
                className={`category-chip-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
              >
                {cat} {count > 0 && `(${count})`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div style={{ padding: "12px 18px", borderRadius: "10px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Grid of Courses ── */}
      <div className="courses-grid-container">
        {filteredCourses.map((course) => {
          const thumb = thumbs[course._id] || getVideoThumbFromUrl(course.youtube) || ""
          const progress = progressMap[course._id] || { status: "not-started", completion: 0 }
          const isCompleted = progress.status === "completed"
          const percent = Math.round(progress.completion * 100)

          return (
            <motion.div
              key={course._id}
              className="modern-course-card"
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Media Preview */}
              <div className="card-media-box" onClick={() => setActiveCourse(course)}>
                {thumb ? (
                  <img
                    src={thumb}
                    alt={`${course.title} thumbnail`}
                    className="card-thumb-image"
                    loading="lazy"
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#0f172a",
                      color: "#6366f1",
                      fontSize: "2.5rem",
                    }}
                  >
                    <FaTv />
                  </div>
                )}

                {/* Hover Play Button Overlay */}
                <div className="card-play-overlay">
                  <div className="overlay-play-circle">
                    <FaPlay style={{ marginLeft: "3px" }} />
                  </div>
                </div>

                <div className="in-app-badge">
                  <FaTv style={{ fontSize: "0.68rem" }} /> Inbuilt Player
                </div>
              </div>

              {/* Card Body */}
              <div className="card-content-wrap">
                <div className="card-eyebrow-row">
                  <span className="card-category-pill">{course.category || "General"}</span>
                  {isCompleted && (
                    <span className="card-status-pill completed">
                      <FaCheckCircle /> Completed
                    </span>
                  )}
                  {!isCompleted && progress.status === "in-progress" && (
                    <span className="card-status-pill in-progress">In Progress</span>
                  )}
                </div>

                <h3 className="card-course-title" title={course.title}>
                  {course.title}
                </h3>
              </div>

              {/* Progress bar */}
              <div className="card-progress-section">
                <div className="card-progress-bar-bg">
                  <div
                    className={`card-progress-bar-fill ${isCompleted ? "completed" : ""}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="card-progress-legend">
                  <span>{percent}% Finished</span>
                  <span>{isCompleted ? "Verified" : "Self-Paced"}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="card-footer-actions">
                <button
                  type="button"
                  className="btn-watch-course"
                  onClick={() => setActiveCourse(course)}
                >
                  <FaPlay style={{ fontSize: "0.75rem" }} /> Watch in App
                </button>

                <button
                  type="button"
                  className="btn-ai-tutor"
                  onClick={() => setActiveCourse(course)}
                  title="Open AI Concept Tutor for this lecture"
                >
                  <FaBrain /> AI
                </button>

                <button
                  type="button"
                  className={`btn-toggle-complete ${isCompleted ? "completed" : ""}`}
                  onClick={(e) => handleToggleComplete(course, e)}
                  title={isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
                >
                  <FaCheckCircle />
                </button>
              </div>
            </motion.div>
          )
        })}

        {filteredCourses.length === 0 && !loading && (
          <div className="courses-empty-card">
            <FaBookOpen className="courses-empty-icon" />
            <h3>No courses found</h3>
            <p>
              We couldn't find any courses matching your criteria. Try resetting the filters or searching
              for another keyword.
            </p>
            <button
              type="button"
              className="courses-reset-btn"
              onClick={() => {
                setSelectedCategory("")
                setSearchKeyword("")
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Courses

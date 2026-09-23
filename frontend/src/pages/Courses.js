"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import Select from "react-select"
import { FaYoutube, FaBullseye, FaCheckCircle } from "react-icons/fa"
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

function Courses() {
  const backendUrl = getBackendUrl()
  const [courses, setCourses] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [thumbs, setThumbs] = useState({})
  const [progressMap, setProgressMap] = useState({}) // courseId -> status
  const [error, setError] = useState(null)

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      const params = new URLSearchParams()
      if (selectedCategory) params.append("category", selectedCategory)
      if (searchKeyword) params.append("keyword", searchKeyword)
      const token = localStorage.getItem("token")
      try {
        const response = await axios.get(`${backendUrl}/api/courses?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.status >= 200 && response.status < 300) {
          setCourses(Array.isArray(response.data) ? response.data : [])
        } else {
          setError(response.data?.error || "Failed to load courses")
        }
      } catch (e) {
        console.error("Courses fetch error:", e.message)
        setError("Failed to load courses")
      }
    }
    fetchCourses()
  }, [backendUrl, selectedCategory, searchKeyword])

  // Load thumbnails
  useEffect(() => {
    const controller = new AbortController()
    async function loadThumb(course) {
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
          if (thumbs[c._id]) return
          const url = await loadThumb(c)
          if (url) updates[c._id] = url
        }),
      )
      if (Object.keys(updates).length) setThumbs((prev) => ({ ...prev, ...updates }))
    }
    if (courses.length) run()
    return () => controller.abort()
  }, [courses, thumbs])

  const categoryOptions = useMemo(
    () => [{ value: "", label: "All Categories" }, ...CATEGORY_LIST.map((v) => ({ value: v, label: v }))],
    [],
  )

  const statusToCompletion = (status) => (status === "completed" ? 1 : status === "in-progress" ? 0.5 : 0)
  const onUpdateStatus = async (course, status) => {
    const token = localStorage.getItem("token")
    const completion = statusToCompletion(status)
    // optimistic UI
    setProgressMap((prev) => ({ ...prev, [course._id]: status }))
    try {
      if (status === "completed") {
        await axios.post(
          `${backendUrl}/api/complete-course`,
          { courseId: course._id },
          { headers: { Authorization: `Bearer ${token}` } },
        )
      } else {
        await axios.post(
          `${backendUrl}/api/course-progress`,
          { courseId: course._id, status, completion },
          { headers: { Authorization: `Bearer ${token}` } },
        )
      }
    } catch (e) {
      console.error("Update status failed:", e.message)
      setError("Failed to update status")
      setTimeout(() => setError(null), 2200)
    }
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h2 className="courses-title">Courses</h2>
        <p className="courses-subtext">Browse curated YouTube playlists and track your progress</p>
      </div>

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
            value={categoryOptions.find((o) => o.value === selectedCategory) || categoryOptions[0]}
            onChange={(opt) => setSelectedCategory(opt ? opt.value : "")}
            placeholder="Filter by category..."
            isClearable
          />
        </div>
      </div>

      {error && <div className="courses-error">⚠️ {error}</div>}

      <div className="courses-grid">
        {courses.map((course) => {
          const thumb = thumbs[course._id] || getVideoThumbFromUrl(course.youtube) || ""
          const status = progressMap[course._id] || "not-started"
          const completed = status === "completed"
          const percent = Math.round(statusToCompletion(status) * 100)

          return (
            <div key={course._id} className="course-card">
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
                  >
                    <FaYoutube /> Watch
                  </a>
                </div>
              </div>

              <div className="course-info">
                <div className="course-meta-row">
                  <span className="course-pill">{course.category}</span>
                  {completed && (
                    <span className="status-pill completed">
                      <FaCheckCircle /> Completed
                    </span>
                  )}
                </div>
                <h3 className="course-title">{course.title}</h3>
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
                <a className="dash-btn-primary btn-sm" href={course.youtube} target="_blank" rel="noopener noreferrer">
                  <FaYoutube /> Watch Playlist
                </a>
                <button className="dash-btn-outline btn-sm" onClick={() => onUpdateStatus(course, "in-progress")}>
                  Set In Progress
                </button>
                <button className="course-complete-btn btn-sm" onClick={() => onUpdateStatus(course, "completed")}>
                  <FaBullseye />
                </button>
              </div>

              <div className="status-control">
                <label className="sr-only" htmlFor={`status-${course._id}`}>
                  Course status
                </label>
                <select
                  id={`status-${course._id}`}
                  className="status-select"
                  value={status}
                  onChange={(e) => onUpdateStatus(course, e.target.value)}
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          )
        })}
        {courses.length === 0 && (
          <div className="courses-empty">
            <FaYoutube className="empty-icon" />
            <h3>No courses found</h3>
            <p>Try a different search or category filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Courses

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import axios from "axios"
import {
  FaTimes,
  FaExpand,
  FaCompress,
  FaPlay,
  FaPause,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaClock,
} from "react-icons/fa"
import AiCourseTutor from "./AiCourseTutor"
import { getBackendUrl } from "../utils/apiConfig"
import "./InbuiltPlayer.css"

function extractYouTubeDetails(url) {
  try {
    const u = new URL(url)
    let videoId = u.searchParams.get("v") || ""
    const playlistId = u.searchParams.get("list") || ""

    if (!videoId && u.hostname.includes("youtu.be")) {
      videoId = u.pathname.replace(/^\//, "")
    }
    if (!videoId && u.pathname.includes("/embed/")) {
      videoId = u.pathname.split("/embed/")[1]
    }
    return { videoId, playlistId }
  } catch (_e) {
    return { videoId: "", playlistId: "" }
  }
}

function formatWatchDuration(seconds) {
  if (!seconds || seconds <= 0) return "00:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const remM = m % 60
    return `${h}h ${remM}m`
  }
  return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`
}

function InbuiltPlayer({ course, onClose, onProgressUpdated }) {
  const backendUrl = getBackendUrl()
  const [isTheaterMode, setIsTheaterMode] = useState(false)
  const [isTrackingActive, setIsTrackingActive] = useState(true)
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [totalCourseWatchTime, setTotalCourseWatchTime] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const unrecordedSecondsRef = useRef(0)
  const token = localStorage.getItem("token")
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  const { videoId, playlistId } = extractYouTubeDetails(course?.youtube || "")

  // Determine iframe source URL
  let embedUrl = ""
  if (videoId) {
    embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(
      window.location.origin
    )}&rel=0`
  } else if (playlistId) {
    embedUrl = `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}&enablejsapi=1&origin=${encodeURIComponent(
      window.location.origin
    )}`
  } else {
    embedUrl = course?.youtube || ""
  }

  // Flush watch time to backend
  const flushWatchTime = useCallback(
    async (isFinished = false) => {
      const secondsToFlush = unrecordedSecondsRef.current
      if (secondsToFlush <= 0 && !isFinished) return

      unrecordedSecondsRef.current = 0
      try {
        const res = await axios.post(
          `${backendUrl}/api/video-watch-time`,
          {
            courseId: course?._id,
            videoId: videoId || playlistId || String(course?._id),
            title: course?.title,
            secondsWatched: secondsToFlush,
            completed: isFinished,
          },
          { headers: authHeaders }
        )

        if (res.data?.totalWatchTime) {
          setTotalCourseWatchTime(res.data.totalWatchTime)
        }
        if (onProgressUpdated) {
          onProgressUpdated(course?._id, isFinished ? "completed" : "in-progress")
        }
      } catch (err) {
        console.error("Flush watch time error:", err)
        // restore unrecorded seconds on network failure
        unrecordedSecondsRef.current += secondsToFlush
      }
    },
    [backendUrl, course, videoId, playlistId, authHeaders, onProgressUpdated]
  )

  // 1-Second Timer Heartbeat when Tracking Active
  useEffect(() => {
    let intervalId = null
    if (isTrackingActive) {
      intervalId = setInterval(() => {
        setSessionSeconds((prev) => prev + 1)
        unrecordedSecondsRef.current += 1

        // Sync to backend every 10 seconds
        if (unrecordedSecondsRef.current >= 10) {
          flushWatchTime(false)
        }
      }, 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isTrackingActive, flushWatchTime])

  // Flush remaining time on unmount / close
  useEffect(() => {
    return () => {
      flushWatchTime(false)
    }
  }, [flushWatchTime])

  // Mark Course as Completed
  const handleMarkCompleted = async () => {
    setIsCompleted(true)
    await flushWatchTime(true)
    try {
      await axios.post(
        `${backendUrl}/api/complete-course`,
        { courseId: course?._id },
        { headers: authHeaders }
      )
      if (onProgressUpdated) {
        onProgressUpdated(course?._id, "completed")
      }
    } catch (e) {
      console.error("Mark completed error:", e)
    }
  }

  // Handle Close
  const handleClose = useCallback(async () => {
    await flushWatchTime(false)
    onClose()
  }, [flushWatchTime, onClose])

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleClose])

  return (
    <div className="inbuilt-player-overlay" role="dialog" aria-modal="true">
      <div className={`inbuilt-player-container ${isTheaterMode ? "theater-mode" : ""}`}>
        {/* Top Header */}
        <div className="player-topbar">
          <div className="player-title-group">
            <span className="player-brand-badge">Lecture Stream</span>
            <span className="player-course-name">{course?.title}</span>
          </div>

          <div className="player-topbar-actions">
            <a
              href={course?.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="player-action-icon-btn"
              title="Open externally on YouTube"
            >
              <FaExternalLinkAlt />
            </a>

            <button
              type="button"
              className="player-action-icon-btn"
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              title={isTheaterMode ? "Exit Theater Mode" : "Expand Theater Mode"}
            >
              {isTheaterMode ? <FaCompress /> : <FaExpand />}
            </button>

            <button
              type="button"
              className="player-close-btn"
              onClick={handleClose}
              title="Close player (Esc)"
              aria-label="Close Player"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Main Grid: Left Stage + Right AI Tutor */}
        <div className="player-main-grid">
          {/* Left: Video & Telemetry */}
          <div className="player-stage-column">
            <div className="player-video-viewport">
              <iframe
                title={course?.title || "Video lecture"}
                src={embedUrl}
                className="player-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Live Watch Time Telemetry Strip */}
            <div className="player-telemetry-strip">
              <div className="watch-timer-capsule">
                <div className={`timer-live-indicator ${isTrackingActive ? "active" : "paused"}`}>
                  <span className="pulse-dot" />
                  <span>{isTrackingActive ? "Tracking" : "Paused"}</span>
                </div>

                <div>
                  <span className="watch-digits">
                    <FaClock style={{ marginRight: 6, fontSize: "0.85rem", opacity: 0.8 }} />
                    {formatWatchDuration(sessionSeconds)}
                  </span>
                  <span className="watch-label-subtext">
                    session study time {totalCourseWatchTime > 0 ? `· ${formatWatchDuration(totalCourseWatchTime)} total` : ""}
                  </span>
                </div>
              </div>

              <div className="telemetry-controls">
                <button
                  type="button"
                  className="track-toggle-btn"
                  onClick={() => setIsTrackingActive(!isTrackingActive)}
                  title={isTrackingActive ? "Pause study timer" : "Resume study timer"}
                >
                  {isTrackingActive ? <FaPause /> : <FaPlay />}
                  <span>{isTrackingActive ? "Pause Timer" : "Resume Timer"}</span>
                </button>

                <button
                  type="button"
                  className={`mark-finished-btn ${isCompleted ? "completed" : ""}`}
                  onClick={handleMarkCompleted}
                  disabled={isCompleted}
                >
                  <FaCheckCircle />
                  <span>{isCompleted ? "Completed!" : "Mark Completed"}</span>
                </button>
              </div>
            </div>

            {/* Course Information Details */}
            <div className="player-details-row">
              <span className="details-category-tag">{course?.category || "Technical Discipline"}</span>
              <h2 className="details-course-headline">{course?.title}</h2>
              <p className="details-course-guidance">
                This course is integrated with SkillVoyage's verified curriculum. Your watch time is automatically
                logged to your profile, building momentum toward streak unlocks and mastery milestones.
              </p>
            </div>
          </div>

          {/* Right: Real Groq AI Study Tutor Column */}
          <div className="player-ai-column">
            <AiCourseTutor
              courseTitle={course?.title}
              courseCategory={course?.category}
              activeVideoId={videoId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default InbuiltPlayer

"use client"

import { useState, useEffect } from "react"
import { Line, Bar } from "react-chartjs-2"
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
import { FaClock, FaChartLine, FaArrowUp, FaArrowDown, FaEquals, FaLightbulb, FaCalendarAlt } from "react-icons/fa"
import axios from "axios"
import { getBackendUrl } from "../utils/apiConfig"
import "./LearningPaceTracker.css"

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement)

function LearningPaceTracker() {
  const backendUrl = getBackendUrl()
  const [paceData, setPaceData] = useState({
    weeklyHours: [],
    coursesPerWeek: [],
    averagePace: 0,
    recommendation: "",
    trend: "stable",
    weeklyGoal: 10,
    currentWeekHours: 0,
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("4weeks")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get(`${backendUrl}/api/pace?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (mounted) setPaceData(res.data)
      } catch (e) {
        console.error("Pace fetch error:", e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [timeRange])

  const labels = (() => {
    const w = paceData.weeklyHours.length
    if (w === 12) return ["12w", "11w", "10w", "9w", "8w", "7w", "6w", "5w", "4w", "3w", "2w", "1w"]
    if (w === 8) return ["8w", "7w", "6w", "5w", "4w", "3w", "2w", "1w"]
    return ["4w", "3w", "2w", "1w"]
  })()

  const weeklyHoursData = {
    labels,
    datasets: [
      {
        label: "Hours Studied",
        data: paceData.weeklyHours.slice(-labels.length),
        borderColor: "rgba(37, 99, 235, 1)",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgba(37, 99, 235, 1)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
      {
        label: "Weekly Goal",
        data: Array(labels.length).fill(paceData.weeklyGoal),
        borderColor: "rgba(245, 158, 11, 1)",
        backgroundColor: "transparent",
        borderDash: [5, 5],
        tension: 0,
        pointRadius: 0,
      },
    ],
  }

  const coursesData = {
    labels,
    datasets: [
      {
        label: "Courses Completed",
        data: paceData.coursesPerWeek.slice(-labels.length),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  }

  const getTrendIcon = () => {
    switch (paceData.trend) {
      case "up":
        return <FaArrowUp className="lp-text-green" />
      case "down":
        return <FaArrowDown className="lp-text-red" />
      default:
        return <FaEquals className="lp-text-amber" />
    }
  }

  const progressPercentage = Math.min((paceData.currentWeekHours / paceData.weeklyGoal) * 100, 100)

  if (loading) {
    return (
      <div className="learning-pace-tracker">
        <div className="loading-container">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p>Loading learning pace data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="learning-pace-tracker">
      <div className="pace-header">
        <div className="header-content">
          <h3 className="section-title">
            <FaClock className="section-icon" />
            Learning Pace Tracker
          </h3>
          <p className="section-description">Monitor your learning speed and get personalized recommendations</p>
        </div>
        <div className="time-range-selector">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="range-select">
            <option value="4weeks">Last 4 Weeks</option>
            <option value="8weeks">Last 8 Weeks</option>
            <option value="12weeks">Last 12 Weeks</option>
          </select>
        </div>
      </div>

      <div className="pace-stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <FaChartLine className="stat-icon lp-text-blue" />
            <span className="stat-label">Average Pace</span>
          </div>
          <div className="stat-value">{paceData.averagePace} courses/week</div>
          <div className="stat-trend">
            {getTrendIcon()}
            <span className={`trend-text ${paceData.trend}`}>
              {paceData.trend === "up" ? "Improving" : paceData.trend === "down" ? "Declining" : "Stable"}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <FaCalendarAlt className="stat-icon lp-text-green" />
            <span className="stat-label">This Week</span>
          </div>
          <div className="stat-value">{paceData.currentWeekHours}h studied</div>
          <div className="lp-progress-bar">
            <div className="lp-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="progress-text">
            {paceData.currentWeekHours}/{paceData.weeklyGoal}h goal ({Math.round(progressPercentage)}%)
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <div className="chart-header">
            <h4>Weekly Study Hours</h4>
            <FaClock className="chart-icon" />
          </div>
          <div className="chart-wrapper">
            <Line data={weeklyHoursData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h4>Courses Completed</h4>
            <FaChartLine className="chart-icon" />
          </div>
          <div className="chart-wrapper">
            <Bar data={coursesData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="recommendation-card">
        <div className="recommendation-header">
          <FaLightbulb className="recommendation-icon" />
          <h4>Pace Recommendation</h4>
        </div>
        <p className="recommendation-text">{paceData.recommendation}</p>
        <div className="recommendation-actions">
          <button className="dash-btn-primary btn-sm">Adjust Weekly Goal</button>
          <button className="dash-btn-outline btn-sm">View Detailed Analytics</button>
        </div>
      </div>
    </div>
  )
}

export default LearningPaceTracker

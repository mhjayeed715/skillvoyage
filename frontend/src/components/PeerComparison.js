"use client"

import { useState, useEffect } from "react"
import { Bar, Radar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js"
import {
  FaUsers,
  FaMedal,
  FaChartBar,
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa"
import axios from "axios"
import { getBackendUrl } from "../utils/apiConfig"
import "./PeerComparison.css"

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, RadialLinearScale, Tooltip, Legend, PointElement)

function PeerComparison() {
  const backendUrl = getBackendUrl()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAnonymous, setIsAnonymous] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get(`${backendUrl}/api/peer-comparison`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (mounted) setData(res.data)
      } catch (e) {
        console.error("PeerComparison fetch error:", e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <FaArrowUp className="text-green-500" />
      case "down":
        return <FaArrowDown className="text-red-500" />
      default:
        return <FaEquals className="text-yellow-500" />
    }
  }

  if (loading || !data) {
    return (
      <div className="peer-comparison">
        <div className="loading-container">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p>Loading peer comparison data...</p>
        </div>
      </div>
    )
  }

  const barData = {
    labels: ["Courses Completed", "Hours Studied", "Average Score", "Streak Days", "Badges Earned"],
    datasets: [
      {
        label: "You",
        data: [
          data.userStats.coursesCompleted,
          data.userStats.hoursStudied,
          data.userStats.averageScore,
          data.userStats.streakDays,
          data.userStats.badgesEarned,
        ],
        backgroundColor: "rgba(37, 99, 235, 0.8)",
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: "Peer Average",
        data: [
          data.peerAverages.coursesCompleted,
          data.peerAverages.hoursStudied,
          data.peerAverages.averageScore,
          data.peerAverages.streakDays,
          data.peerAverages.badgesEarned,
        ],
        backgroundColor: "rgba(156, 163, 175, 0.6)",
        borderColor: "rgba(156, 163, 175, 1)",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const radarData = {
    labels: Object.keys(data.categoryComparison || {}),
    datasets: [
      {
        label: "Your Performance",
        data: Object.values(data.categoryComparison || {}).map((v) => v.user || 0),
        borderColor: "rgba(37, 99, 235, 1)",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        pointBackgroundColor: "rgba(37, 99, 235, 1)",
      },
      {
        label: "Peer Average",
        data: Object.values(data.categoryComparison || {}).map((v) => v.peer || 0),
        borderColor: "rgba(156, 163, 175, 1)",
        backgroundColor: "rgba(156, 163, 175, 0.2)",
        pointBackgroundColor: "rgba(156, 163, 175, 1)",
      },
    ],
  }

  const doughnutData = {
    labels: ["Your Percentile", "Below You"],
    datasets: [
      {
        data: [data.percentile, 100 - data.percentile],
        backgroundColor: ["rgba(37, 99, 235, 0.8)", "rgba(229, 231, 235, 0.6)"],
        borderColor: ["rgba(37, 99, 235, 1)", "rgba(229, 231, 235, 1)"],
        borderWidth: 2,
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
  const radarOptions = { responsive: true, maintainAspectRatio: false }
  const doughnutOptions = { responsive: true, maintainAspectRatio: false, cutout: "60%" }

  const performanceLevel = (() => {
    if (data.percentile >= 90) return { text: "Exceptional", color: "text-purple-600", bg: "bg-purple-100" }
    if (data.percentile >= 75) return { text: "Above Average", color: "text-green-600", bg: "bg-green-100" }
    if (data.percentile >= 50) return { text: "Average", color: "text-blue-600", bg: "bg-blue-100" }
    if (data.percentile >= 25) return { text: "Below Average", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { text: "Needs Improvement", color: "text-red-600", bg: "bg-red-100" }
  })()

  return (
    <div className="peer-comparison">
      <div className="comparison-header">
        <div className="header-content">
          <h3 className="section-title">
            <FaUsers className="section-icon" />
            Peer Comparison
          </h3>
          <p className="section-description">See how your learning progress compares to other learners</p>
        </div>
        <div className="header-controls">
          <button
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`anonymity-toggle ${isAnonymous ? "active" : ""}`}
          >
            {isAnonymous ? <FaEyeSlash /> : <FaEye />}
            {isAnonymous ? "Anonymous" : "Public"}
          </button>
        </div>
      </div>

      <div className="ranking-banner">
        <div className="ranking-info">
          <div className="rank-badge">
            <FaTrophy className="rank-icon" />
            <span className="rank-number">#{data.ranking}</span>
          </div>
          <div className="rank-details">
            <div className="rank-text">Your Ranking</div>
            <div className="rank-subtext">out of {data.totalUsers} learners</div>
          </div>
        </div>
        <div className="percentile-info">
          <div className={`performance-badge ${performanceLevel.bg} ${performanceLevel.color}`}>
            <FaMedal className="performance-icon" />
            {performanceLevel.text}
          </div>
          <div className="percentile-text">{data.percentile}th percentile</div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Courses Completed</span>
            {getTrendIcon(data.trends?.coursesCompleted)}
          </div>
          <div className="metric-comparison">
            <span className="user-value">{data.userStats.coursesCompleted}</span>
            <span className="vs-text">vs</span>
            <span className="peer-value">{data.peerAverages.coursesCompleted}</span>
          </div>
          <div className="metric-footer">
            <span className="comparison-text">You vs Peer Average</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Hours Studied</span>
            {getTrendIcon(data.trends?.hoursStudied)}
          </div>
          <div className="metric-comparison">
            <span className="user-value">{data.userStats.hoursStudied}</span>
            <span className="vs-text">vs</span>
            <span className="peer-value">{data.peerAverages.hoursStudied}</span>
          </div>
          <div className="metric-footer">
            <span className="comparison-text">You vs Peer Average</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Streak Days</span>
            {getTrendIcon(data.trends?.streakDays)}
          </div>
          <div className="metric-comparison">
            <span className="user-value">{data.userStats.streakDays}</span>
            <span className="vs-text">vs</span>
            <span className="peer-value">{data.peerAverages.streakDays}</span>
          </div>
          <div className="metric-footer">
            <span className="comparison-text">You vs Peer Average</span>
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <div className="chart-header">
            <h4>Performance Comparison</h4>
            <FaChartBar className="chart-icon" />
          </div>
          <div className="chart-wrapper">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h4>Category Performance</h4>
            <FaUsers className="chart-icon" />
          </div>
          <div className="chart-wrapper">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h4>Percentile Ranking</h4>
            <FaTrophy className="chart-icon" />
          </div>
          <div className="chart-wrapper">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div className="percentile-display">
            <div className="percentile-number">{data.percentile}%</div>
            <div className="percentile-label">Better than peers</div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default PeerComparison

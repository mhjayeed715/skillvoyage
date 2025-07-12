import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { 
  FaClock, 
  FaChartLine, 
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaLightbulb,
  FaCalendarAlt
} from 'react-icons/fa';
import axios from 'axios';

function LearningPaceTracker() {
  const [paceData, setPaceData] = useState({
    weeklyHours: [],
    coursesPerWeek: [],
    averagePace: 0,
    recommendation: '',
    trend: 'stable',
    weeklyGoal: 10,
    currentWeekHours: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('4weeks');

  useEffect(() => {
    fetchPaceData();
  }, [timeRange]);

  const fetchPaceData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Mock data for now - replace with actual API call
      const mockData = {
        weeklyHours: [8, 12, 6, 15, 10, 14, 9, 11],
        coursesPerWeek: [2, 3, 1, 4, 2, 3, 2, 3],
        averagePace: 2.5,
        recommendation: 'Your learning pace is consistent! Try to maintain 10-12 hours per week for optimal progress.',
        trend: 'up',
        weeklyGoal: 10,
        currentWeekHours: 9
      };
      
      // Set data immediately
      setPaceData(mockData);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching pace data:', error);
      setLoading(false);
    }
  };

  const weeklyHoursData = {
    labels: ['4 weeks ago', '3 weeks ago', '2 weeks ago', 'Last week', 'This week'],
    datasets: [
      {
        label: 'Hours Studied',
        data: paceData.weeklyHours.slice(-5),
        borderColor: 'rgba(37, 99, 235, 1)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: 'Weekly Goal',
        data: Array(5).fill(paceData.weeklyGoal),
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0,
        pointRadius: 0,
      }
    ],
  };

  const coursesData = {
    labels: ['4 weeks ago', '3 weeks ago', '2 weeks ago', 'Last week', 'This week'],
    datasets: [
      {
        label: 'Courses Completed',
        data: paceData.coursesPerWeek.slice(-5),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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

  const getTrendIcon = () => {
    switch (paceData.trend) {
      case 'up':
        return <FaArrowUp className="text-green-500" />;
      case 'down':
        return <FaArrowDown className="text-red-500" />;
      default:
        return <FaEquals className="text-yellow-500" />;
    }
  };
  
  const getTrendText = () => {
    switch (paceData.trend) {
      case 'up':
        return 'Improving';
      case 'down':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  const progressPercentage = (paceData.currentWeekHours / paceData.weeklyGoal) * 100;

  if (loading) {
    return (
      <div className="learning-pace-tracker">
        <div className="loading-container">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p>Loading learning pace data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-pace-tracker">
      <div className="pace-header">
        <div className="header-content">
          <h3 className="section-title">
            <FaClock className="section-icon" />
            Learning Pace Tracker
          </h3>
          <p className="section-description">
            Monitor your learning speed and get personalized pace recommendations
          </p>
        </div>
        
        <div className="time-range-selector">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="range-select"
          >
            <option value="4weeks">Last 4 Weeks</option>
            <option value="8weeks">Last 8 Weeks</option>
            <option value="12weeks">Last 12 Weeks</option>
          </select>
        </div>
      </div>

      <div className="pace-stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <FaChartLine className="stat-icon text-blue-600" />
            <span className="stat-label">Average Pace</span>
          </div>
          <div className="stat-value">{paceData.averagePace} courses/week</div>
          <div className="stat-trend">
            {getTrendIcon()}
            <span className={`trend-text ${paceData.trend}`}>
              {getTrendText()}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <FaCalendarAlt className="stat-icon text-green-600" />
            <span className="stat-label">This Week</span>
          </div>
          <div className="stat-value">{paceData.currentWeekHours}h studied</div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
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
          <button className="btn-primary btn-sm">
            Adjust Weekly Goal
          </button>
          <button className="btn-outline btn-sm">
            View Detailed Analytics
          </button>
        </div>
      </div>
    </div>
  );
}

export default LearningPaceTracker;
import React, { useState, useEffect } from 'react';
import { Bar, Radar, Doughnut } from 'react-chartjs-2';
import { 
  FaUsers, 
  FaMedal, 
  FaChartBar,
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import axios from 'axios';

function PeerComparison() {
  const [comparisonData, setComparisonData] = useState({
    userStats: {
      coursesCompleted: 0,
      hoursStudied: 0,
      averageScore: 0,
      streakDays: 0,
      badgesEarned: 0
    },
    peerAverages: {
      coursesCompleted: 0,
      hoursStudied: 0,
      averageScore: 0,
      streakDays: 0,
      badgesEarned: 0
    },
    percentile: 0,
    ranking: 0,
    totalUsers: 0,
    categoryComparison: {},
    trends: {}
  });
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('overall');

  useEffect(() => {
    fetchComparisonData();
  }, [selectedMetric]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Mock data for now - replace with actual API call
      const mockData = {
        userStats: {
          coursesCompleted: 12,
          hoursStudied: 84,
          averageScore: 87,
          streakDays: 15,
          badgesEarned: 8
        },
        peerAverages: {
          coursesCompleted: 8,
          hoursStudied: 56,
          averageScore: 78,
          streakDays: 10,
          badgesEarned: 5
        },
        percentile: 78,
        ranking: 245,
        totalUsers: 1124,
        categoryComparison: {
          'Web Development': { user: 85, peer: 72 },
          'Data Science': { user: 92, peer: 80 },
          'Machine Learning': { user: 78, peer: 75 },
          'UI/UX Design': { user: 88, peer: 70 }
        },
        trends: {
          coursesCompleted: 'up',
          hoursStudied: 'up',
          averageScore: 'stable',
          streakDays: 'up'
        }
      };
      
      // Simulate API call
      setTimeout(() => {
        setComparisonData(mockData);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      setLoading(false);
    }
  };

  const getComparisonData = () => {
    const { userStats, peerAverages } = comparisonData;
    
    return {
      labels: ['Courses Completed', 'Hours Studied', 'Average Score', 'Streak Days', 'Badges Earned'],
      datasets: [
        {
          label: 'You',
          data: [
            userStats.coursesCompleted,
            userStats.hoursStudied,
            userStats.averageScore,
            userStats.streakDays,
            userStats.badgesEarned
          ],
          backgroundColor: 'rgba(37, 99, 235, 0.8)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: 'Peer Average',
          data: [
            peerAverages.coursesCompleted,
            peerAverages.hoursStudied,
            peerAverages.averageScore,
            peerAverages.streakDays,
            peerAverages.badgesEarned
          ],
          backgroundColor: 'rgba(156, 163, 175, 0.6)',
          borderColor: 'rgba(156, 163, 175, 1)',
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  };

  const getRadarData = () => {
    const categories = Object.keys(comparisonData.categoryComparison);
    const userScores = categories.map(cat => comparisonData.categoryComparison[cat]?.user || 0);
    const peerScores = categories.map(cat => comparisonData.categoryComparison[cat]?.peer || 0);

    return {
      labels: categories,
      datasets: [
        {
          label: 'Your Performance',
          data: userScores,
          borderColor: 'rgba(37, 99, 235, 1)',
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          pointBackgroundColor: 'rgba(37, 99, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(37, 99, 235, 1)',
        },
        {
          label: 'Peer Average',
          data: peerScores,
          borderColor: 'rgba(156, 163, 175, 1)',
          backgroundColor: 'rgba(156, 163, 175, 0.2)',
          pointBackgroundColor: 'rgba(156, 163, 175, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(156, 163, 175, 1)',
        },
      ],
    };
  };

  const getPercentileData = () => {
    return {
      labels: ['Your Percentile', 'Below You'],
      datasets: [
        {
          data: [comparisonData.percentile, 100 - comparisonData.percentile],
          backgroundColor: [
            'rgba(37, 99, 235, 0.8)',
            'rgba(229, 231, 235, 0.6)',
          ],
          borderColor: [
            'rgba(37, 99, 235, 1)',
            'rgba(229, 231, 235, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
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

  const radarOptions = {
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
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: 11,
          },
        },
        ticks: {
          display: false,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
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
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      }
    },
    cutout: '60%',
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <FaArrowUp className="text-green-500" />;
      case 'down':
        return <FaArrowDown className="text-red-500" />;
      default:
        return <FaEquals className="text-yellow-500" />;
    }
  };

  const getPerformanceLevel = () => {
    if (comparisonData.percentile >= 90) return { text: 'Exceptional', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (comparisonData.percentile >= 75) return { text: 'Above Average', color: 'text-green-600', bg: 'bg-green-100' };
    if (comparisonData.percentile >= 50) return { text: 'Average', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (comparisonData.percentile >= 25) return { text: 'Below Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const performanceLevel = getPerformanceLevel();

  if (loading) {
    return (
      <div className="peer-comparison">
        <div className="loading-container">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p>Loading peer comparison data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="peer-comparison">
      <div className="comparison-header">
        <div className="header-content">
          <h3 className="section-title">
            <FaUsers className="section-icon" />
            Peer Comparison
          </h3>
          <p className="section-description">
            See how your learning progress compares to other learners
          </p>
        </div>
        
        <div className="header-controls">
          <button
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`anonymity-toggle ${isAnonymous ? 'active' : ''}`}
            title={isAnonymous ? 'Anonymous Mode On' : 'Anonymous Mode Off'}
          >
            {isAnonymous ? <FaEye /> : <FaEyeSlash />}
            {isAnonymous ? 'Anonymous' : 'Public'}
          </button>
        </div>
      </div>

      <div className="ranking-banner">
        <div className="ranking-info">
          <div className="rank-badge">
            <FaMedal className="rank-icon" />
            <span className="rank-number">#{comparisonData.ranking}</span>
          </div>
          <div className="rank-details">
            <div className="rank-text">Your Ranking</div>
            <div className="rank-subtext">out of {comparisonData.totalUsers} learners</div>
          </div>
        </div>
        
        <div className="percentile-info">
          <div className={`performance-badge ${performanceLevel.bg} ${performanceLevel.color}`}>
            <FaTrophy className="performance-icon" />
            <span>{performanceLevel.text}</span>
          </div>
          <div className="percentile-text">
            {comparisonData.percentile}th percentile
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Courses Completed</span>
            {getTrendIcon(comparisonData.trends.coursesCompleted)}
          </div>
          <div className="metric-comparison">
            <div className="user-value">{comparisonData.userStats.coursesCompleted}</div>
            <div className="vs-text">vs</div>
            <div className="peer-value">{comparisonData.peerAverages.coursesCompleted}</div>
          </div>
          <div className="metric-footer">
            <span className="comparison-text">
              {comparisonData.userStats.coursesCompleted > comparisonData.peerAverages.coursesCompleted 
                ? 'Above' : 'Below'} peer average
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Hours Studied</span>
            {getTrendIcon(comparisonData.trends.hoursStudied)}
          </div>
          <div className="metric-comparison">
            <div className="user-value">{comparisonData.userStats.hoursStudied}h</div>
            <div className="vs-text">vs</div>
            <div className="peer-value">{comparisonData.peerAverages.hoursStudied}h</div>
          </div>
          <div className="metric-footer">
            <span className="comparison-text">
              {comparisonData.userStats.hoursStudied > comparisonData.peerAverages.hoursStudied 
                ? 'Above' : 'Below'} peer average
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Average Score</span>
            {getTrendIcon(comparisonData.trends.averageScore)}
          </div>
          <div className="metric-comparison">
            <div className="user-value">{comparisonData.userStats.averageScore}%</div>
            <div className="vs-text">vs</div>
            <div className="peer-value">{comparisonData.peerAverages.averageScore}%</div>
          </div>
          <div className="metric-footer">
            <span className="comparison-text">
              {comparisonData.userStats.averageScore > comparisonData.peerAverages.averageScore 
                ? 'Above' : 'Below'} peer average
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Current Streak</span>
            {getTrendIcon(comparisonData.trends.streakDays)}
          </div>
          <div className="metric-comparison">
            <div className="user-value">{comparisonData.userStats.streakDays} days</div>
            <div className="vs-text">vs</div>
            <div className="peer-value">{comparisonData.peerAverages.streakDays} days</div>
          </div>
          <div className="metric-footer">
            <span className="comparison-text">
              {comparisonData.userStats.streakDays > comparisonData.peerAverages.streakDays 
                ? 'Above' : 'Below'} peer average
            </span>
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card full-width">
          <div className="chart-header">
            <h4>Overall Performance Comparison</h4>
            <FaChartBar className="chart-icon" />
          </div>
          <div className="chart-wrapper">
            <Bar data={getComparisonData()} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h4>Category Performance</h4>
            <FaUsers className="chart-icon" />
          </div>
          <div className="chart-wrapper">
            <Radar data={getRadarData()} options={radarOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h4>Your Percentile</h4>
            <FaTrophy className="chart-icon" />
          </div>
          <div className="chart-wrapper">
            <Doughnut data={getPercentileData()} options={doughnutOptions} />
          </div>
          <div className="percentile-display">
            <div className="percentile-number">{comparisonData.percentile}%</div>
            <div className="percentile-label">Better than {comparisonData.percentile}% of learners</div>
          </div>
        </div>
      </div>

      <div className="insights-card">
        <div className="insights-header">
          <h4>Performance Insights</h4>
        </div>
        <div className="insights-grid">
          <div className="insight-item">
            <div className="insight-icon text-green-600">
              <FaArrowUp />
            </div>
            <div className="insight-content">
              <div className="insight-title">Strong Performance</div>
              <div className="insight-text">
                You're performing above average in {
                  Object.entries(comparisonData.categoryComparison)
                    .filter(([_, values]) => values.user > values.peer)
                    .length
                } out of {Object.keys(comparisonData.categoryComparison).length} categories
              </div>
            </div>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon text-blue-600">
              <FaUsers />
            </div>
            <div className="insight-content">
              <div className="insight-title">Peer Network</div>
              <div className="insight-text">
                You're part of a community of {comparisonData.totalUsers} active learners
              </div>
            </div>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon text-purple-600">
              <FaTrophy />
            </div>
            <div className="insight-content">
              <div className="insight-title">Achievement Level</div>
              <div className="insight-text">
                You've earned more badges than {comparisonData.percentile}% of learners
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PeerComparison;
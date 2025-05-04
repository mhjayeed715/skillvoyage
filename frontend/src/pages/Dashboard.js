import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { FaTrophy } from 'react-icons/fa';
import axios from 'axios';
import Select from 'react-select';
import './Dashboard.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Dashboard({ name, preferences }) {
    const [dashboardData, setDashboardData] = useState({
        progress: [],
        badges: [],
        streak: 0,
        goals: [],
    });
    const [recommendations, setRecommendations] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Dashboard component mounted');
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            setLoading(true);
            setError(null);

            try {
                // Fetch Dashboard Data
                const dashboardResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                });
                console.log('Dashboard Data:', dashboardResponse.data);
                if (dashboardResponse.status === 200) {
                    setDashboardData(dashboardResponse.data);
                } else {
                    throw new Error('Failed to load dashboard data');
                }

                // Fetch Recommendations
                const recommendationsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/recommendations`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                });
                console.log('Recommendations Data:', recommendationsResponse.data);
                if (recommendationsResponse.status === 200) {
                    setRecommendations(recommendationsResponse.data);
                } else {
                    throw new Error('Failed to load recommendations');
                }

                // Fetch Courses
                const params = new URLSearchParams();
                if (selectedCategory) params.append('category', selectedCategory);
                if (searchKeyword) params.append('keyword', searchKeyword);
                const coursesResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/courses?${params}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                });
                console.log('Courses Data:', coursesResponse.data);
                if (coursesResponse.status === 200) {
                    setCourses(coursesResponse.data);
                } else {
                    throw new Error('Failed to load courses');
                }
            } catch (err) {
                console.error('Fetch error:', err.message, err.response?.data);
                setError(err.message || 'Error fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedCategory, searchKeyword]);

    const progressData = {
        labels: dashboardData.progress.length ? dashboardData.progress.map(p => p.courseId?.title || 'Unknown') : ['No Data'],
        datasets: [
            {
                label: 'Completion Status (%)',
                data: dashboardData.progress.length ? dashboardData.progress.map(p => (p.completion || 0) * 100) : [0],
                backgroundColor: '#4caf50',
            },
        ],
    };

    const goalsData = {
        labels: dashboardData.goals.length ? dashboardData.goals.map(g => g.title || 'Goal') : ['No Goals'],
        datasets: [
            {
                data: dashboardData.goals.length ? dashboardData.goals.map(g => (g.current / (g.target || 1)) * 100) : [0],
                backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56'],
            },
        ],
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
                alert('Course completed! Check your badges and streak.');
            }
        } catch (err) {
            console.error('Complete course error:', err.message);
            setError('Failed to complete course');
        }
    };

    if (loading) return <div className="dashboard-content">Loading...</div>;
    if (error) return <div className="dashboard-content">Error: {error}</div>;

    return (
        <div className="dashboard-content">
            <h1>Dashboard</h1>
            <div className="dashboard-section">
                <h2>Progress</h2>
                {dashboardData.progress.length ? (
                    <div className="dashboard-chart">
                        <Bar data={progressData} options={{ responsive: true }} />
                    </div>
                ) : (
                    <p>No progress data available.</p>
                )}
            </div>
            <div className="dashboard-section">
                <h2>Badges</h2>
                <div className="dashboard-badges">
                    {dashboardData.badges.length ? (
                        dashboardData.badges.map((badge, index) => (
                            <div key={index} className="badge">
                                <FaTrophy /> {badge}
                            </div>
                        ))
                    ) : (
                        <p>No badges earned yet.</p>
                    )}
                </div>
                <p>Streak: {dashboardData.streak} days</p>
            </div>
            <div className="dashboard-section">
                <h2>Goals</h2>
                {dashboardData.goals.length ? (
                    <div className="dashboard-chart">
                        <Doughnut data={goalsData} options={{ responsive: true }} />
                    </div>
                ) : (
                    <p>No goals set.</p>
                )}
            </div>
            <div className="dashboard-section">
                <h2>Personalized Recommendations</h2>
                <div className="recommendations-list">
                    {recommendations.length ? (
                        recommendations.map((course) => (
                            <div key={course._id} className="recommendation-item">
                                <a href={course.youtube} target="_blank" rel="noopener noreferrer">{course.title}</a>
                            </div>
                        ))
                    ) : (
                        <p>No recommendations available.</p>
                    )}
                </div>
            </div>
            <div className="dashboard-section">
                <h2>Courses</h2>
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <Select
                    options={[{ value: 'Web Development', label: 'Web Development' }, { value: 'Data Science', label: 'Data Science' }]}
                    onChange={(opt) => setSelectedCategory(opt ? opt.value : '')}
                    placeholder="Filter by category..."
                    isClearable
                />
                <div className="courses-list">
                    {courses.length ? (
                        courses.map((course) => (
                            <div key={course._id} className="course-item">
                                <a href={course.youtube} target="_blank" rel="noopener noreferrer">{course.title}</a> ({course.category})
                                <button onClick={() => handleCompleteCourse(course._id)}>Complete</button>
                            </div>
                        ))
                    ) : (
                        <p>No courses found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
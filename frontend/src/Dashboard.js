import React from 'react';
import { FaBook, FaStar, FaUserEdit, FaSearch, FaUser } from 'react-icons/fa';
import './Dashboard.css';

function Dashboard({ name, preferences }) {
    // Ensure preferences is an array and name is a string
    const safePreferences = Array.isArray(preferences) ? preferences : [];
    const safeName = typeof name === 'string' ? name : 'User';

    // Recommended courses based on preferences (static mapping for now)
    const recommendedCourses = {
        'Data Science': ['Python for Data Science', 'Data Visualization with Tableau', 'Statistics for Data Science'],
        'Web Development': ['React for Beginners', 'Node.js Essentials', 'CSS Mastery'],
        'Machine Learning': ['Intro to Machine Learning', 'Deep Learning with TensorFlow', 'AI Fundamentals'],
        'Cybersecurity': ['Ethical Hacking Basics', 'Network Security', 'Cyber Threat Analysis'],
    };

    // Popular topics (static list)
    const popularTopics = [
        'Web Development',
        'Cybersecurity',
        'UI/UX Design',
        'Cloud Computing',
        'Blockchain'
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome, {safeName}!</h1>
                <p>Explore your learning journey with SkillVoyage</p>
            </div>

            <div className="dashboard-section">
                <h2>Your Preferences</h2>
                <div className="preferences-list">
                    {safePreferences.length > 0 ? (
                        safePreferences.map((pref, index) => (
                            <span key={index} className="preference-tag">
                                {pref}
                            </span>
                        ))
                    ) : (
                        <p>No preferences selected.</p>
                    )}
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Recommended Courses <FaBook className="section-icon" /></h2>
                <div className="courses-list">
                    {safePreferences.length > 0 ? (
                        safePreferences.map((pref, index) => (
                            recommendedCourses[pref] ? (
                                recommendedCourses[pref].map((course, idx) => (
                                    <div key={`${index}-${idx}`} className="course-card">
                                        <h3>{course}</h3>
                                        <button className="action-button">Start Learning</button>
                                    </div>
                                ))
                            ) : null
                        ))
                    ) : (
                        <p>No recommendations available. Add preferences to see courses!</p>
                    )}
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Popular Topics <FaStar className="section-icon" /></h2>
                <div className="topics-list">
                    {popularTopics.map((topic, index) => (
                        <div key={index} className="topic-card">
                            <h3>{topic}</h3>
                            <button className="action-button">Explore</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Quick Links</h2>
                <div className="quick-links">
                    <button className="link-button">
                        <FaSearch /> Explore More Topics
                    </button>
                    <button className="link-button">
                        <FaUserEdit /> Update Preferences
                    </button>
                    <button className="link-button">
                        <FaUser /> View Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
import React from 'react';
import './Dashboard.css';

const contentData = {
    'Web Development': ['HTML & CSS Basics', 'JavaScript for Beginners', 'React Mastery'],
    'Data Science': ['Python for Data Science', 'Machine Learning 101', 'Data Visualization'],
    'Mobile Development': ['Flutter Basics', 'React Native Guide', 'iOS Development with Swift'],
    'Graphic Design': ['Photoshop Essentials', 'Illustrator for Beginners', 'UI/UX Design Principles'],
    'Cybersecurity': ['Ethical Hacking 101', 'Network Security Basics', 'Cyber Threat Analysis'],
    'Cloud Computing': ['AWS Fundamentals', 'Azure for Beginners', 'Google Cloud Essentials'],
};

function Dashboard({ name, preferences }) {
    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Welcome, {name}!</h1>
                <p>Explore content tailored to your interests.</p>
            </div>
            {preferences.length > 0 ? (
                preferences.map((pref, index) => (
                    <div key={index} className="content-section">
                        <h2>{pref}</h2>
                        <div className="content-list">
                            {contentData[pref] ? (
                                contentData[pref].map((item, idx) => (
                                    <div key={idx} className="content-item">
                                        {item}
                                    </div>
                                ))
                            ) : (
                                <p>No content available for {pref} yet.</p>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p>Please select some preferences to see personalized content.</p>
            )}
        </div>
    );
}

export default Dashboard;
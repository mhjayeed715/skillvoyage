import React from 'react';
import './Profile.css';

function Profile({ name, email, preferences }) {
    return (
        <div className="dashboard-content">
            <h2>Profile</h2>
            <div className="dashboard-section">
                <h3>User Information</h3>
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Preferences:</strong> {preferences.join(', ')}</p>
            </div>
        </div>
    );
}

export default Profile;
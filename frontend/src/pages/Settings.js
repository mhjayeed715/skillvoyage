import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './Settings.css';

function Settings({ preferences, setUserPreferences }) {
    const [newPreferences, setNewPreferences] = useState(preferences.map(p => ({ value: p, label: p })));

    const preferenceOptions = [
        { value: 'Web Development', label: 'Web Development' },
        { value: 'Data Science', label: 'Data Science' },
        { value: 'Machine Learning', label: 'Machine Learning' },
        { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
        { value: 'Cybersecurity', label: 'Cybersecurity' },
        { value: 'Cloud Computing', label: 'Cloud Computing' },
        { value: 'DevOps', label: 'DevOps' },
        { value: 'Mobile Development', label: 'Mobile Development' },
        { value: 'Game Development', label: 'Game Development' },
        { value: 'Blockchain', label: 'Blockchain' },
        { value: 'UI/UX Design', label: 'UI/UX Design' },
        { value: 'Graphic Design', label: 'Graphic Design' },
        { value: 'Digital Marketing', label: 'Digital Marketing' },
        { value: 'SEO', label: 'SEO' },
        { value: 'Content Writing', label: 'Content Writing' },
        { value: 'Video Editing', label: 'Video Editing' },
        { value: 'Photography', label: 'Photography' },
        { value: '3D Modeling', label: '3D Modeling' },
        { value: 'Animation', label: 'Animation' },
        { value: 'Software Engineering', label: 'Software Engineering' },
        { value: 'Database Management', label: 'Database Management' },
        { value: 'Network Administration', label: 'Network Administration' },
        { value: 'System Administration', label: 'System Administration' },
        { value: 'Project Management', label: 'Project Management' },
        { value: 'Product Management', label: 'Product Management' },
        { value: 'Business Analysis', label: 'Business Analysis' },
        { value: 'Data Analysis', label: 'Data Analysis' },
        { value: 'Data Visualization', label: 'Data Visualization' },
        { value: 'Statistics', label: 'Statistics' },
        { value: 'Mathematics', label: 'Mathematics' },
        { value: 'Physics', label: 'Physics' },
        { value: 'Chemistry', label: 'Chemistry' },
        { value: 'Biology', label: 'Biology' },
        { value: 'Environmental Science', label: 'Environmental Science' },
        { value: 'Economics', label: 'Economics' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Accounting', label: 'Accounting' },
        { value: 'Human Resources', label: 'Human Resources' },
        { value: 'Public Speaking', label: 'Public Speaking' },
        { value: 'Leadership', label: 'Leadership' },
        { value: 'Time Management', label: 'Time Management' },
        { value: 'Critical Thinking', label: 'Critical Thinking' },
        { value: 'Problem Solving', label: 'Problem Solving' },
        { value: 'Teamwork', label: 'Teamwork' },
        { value: 'Communication Skills', label: 'Communication Skills' },
        { value: 'Creative Writing', label: 'Creative Writing' },
        { value: 'Journalism', label: 'Journalism' },
        { value: 'Translation', label: 'Translation' },
        { value: 'Foreign Languages', label: 'Foreign Languages' },
        { value: 'Psychology', label: 'Psychology' },
        { value: 'Sociology', label: 'Sociology' },
        { value: 'History', label: 'History' },
        { value: 'Philosophy', label: 'Philosophy' },
        { value: 'Music Production', label: 'Music Production' },
        { value: 'Sound Design', label: 'Sound Design' },
        { value: 'Fashion Design', label: 'Fashion Design' },
        { value: 'Interior Design', label: 'Interior Design' },
        { value: 'Cooking', label: 'Cooking' },
        { value: 'Gardening', label: 'Gardening' },
        { value: 'Fitness Training', label: 'Fitness Training' },
    ];

    // Update preferences in real-time and sync with parent
    const handlePreferenceChange = (selectedOptions) => {
        setNewPreferences(selectedOptions || []);
        const selectedValues = selectedOptions.map(p => p.value);
        setUserPreferences(selectedValues); // Sync with parent state immediately
    };

    const handleUpdatePreferences = async () => {
        const token = localStorage.getItem('token');
        const selectedPreferences = newPreferences.map(p => p.value);
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/user`, // Changed to /api/user for self-update
                { preferences: selectedPreferences },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                alert('Preferences updated successfully!');
            }
        } catch (err) {
            console.error('Update preferences error:', err);
            alert('Failed to update preferences. Please try again.');
        }
    };

    return (
        <div className="dashboard-content">
            <h2>Settings</h2>
            <div className="dashboard-section">
                <h3>Update Preferences</h3>
                <Select
                    isMulti
                    options={preferenceOptions}
                    value={newPreferences}
                    onChange={handlePreferenceChange}
                    placeholder="Type to search preferences..."
                    className="preferences-select"
                    classNamePrefix="select"
                />
                <button onClick={handleUpdatePreferences}>Update Preferences</button>
            </div>
        </div>
    );
}

export default Settings;
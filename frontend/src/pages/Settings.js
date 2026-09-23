import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { 
  FaCog, 
  FaSave, 
  FaPalette,
  FaUserCog,
  FaDownload,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import { getBackendUrl } from '../utils/apiConfig';
import './Settings.css';

function Settings({ preferences, setUserPreferences }) {
    const backendUrl = getBackendUrl();
    const [newPreferences, setNewPreferences] = useState(
        preferences.map(p => ({ value: p, label: p }))
    );
    const [activeTab, setActiveTab] = useState('preferences');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    
    // Theme settings
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        setNewPreferences(preferences.map(p => ({ value: p, label: p })));
    }, [preferences]);

    useEffect(() => {
        // Apply theme to document root
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

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
        { value: 'Software Engineering', label: 'Software Engineering' }
    ];

    const handlePreferenceChange = (selectedOptions) => {
        setNewPreferences(selectedOptions || []);
        const selectedValues = (selectedOptions || []).map(p => p.value);
        setUserPreferences(selectedValues);
    };

    const handleUpdatePreferences = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
            setMessage('No token found. Please log in again.');
            setMessageType('error');
            setLoading(false);
            return;
        }

        const selectedPreferences = newPreferences.map(p => p.value);
        
        try {
            const response = await axios.put(
                `${backendUrl}/api/user`,
                { preferences: selectedPreferences },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.status === 200) {
                setMessage('Preferences updated successfully!');
                setMessageType('success');
            }
        } catch (err) {
            console.error('Update preferences error:', err.response?.data || err.message);
            setMessage(`Failed to update preferences: ${err.response?.data?.error || err.message}`);
            setMessageType('error');
        } finally {
            setLoading(false);
        }

        // Auto-hide success message
        setTimeout(() => {
            setMessage('');
        }, 3000);
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        setMessage('Theme updated successfully!');
        setMessageType('success');
        
        // Auto-hide success message
        setTimeout(() => {
            setMessage('');
        }, 2000);
    };

    const exportSettings = () => {
        const settingsData = {
            preferences: newPreferences.map(p => p.value),
            theme: theme
        };

        const dataStr = JSON.stringify(settingsData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'settings-backup.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <div className="header-content">
                    <h1><FaCog className="header-icon" />Settings</h1>
                    <p className="subtitle">Customize your learning experience and preferences</p>
                </div>
                
                <div className="header-actions">
                    <button onClick={exportSettings} className="btn-secondary">
                        <FaDownload />Export Settings
                    </button>
                </div>
            </div>

            {message && (
                <div className={`alert alert-${messageType}`}>
                    {message}
                    <button 
                        onClick={() => setMessage('')}
                        className="alert-close"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button 
                    className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preferences')}
                >
                    <FaUserCog />Learning Preferences
                </button>
                <button 
                    className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('appearance')}
                >
                    <FaPalette />Appearance
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'preferences' && (
                    <div className="settings-section">
                        <h2><FaUserCog />Learning Preferences</h2>
                        <p className="section-description">
                            Choose your learning interests to get personalized course recommendations
                        </p>
                        
                        <div className="preference-form">
                            <div className="form-group">
                                <label>Select your interests (you can choose multiple):</label>
                                <Select
                                    isMulti
                                    options={preferenceOptions}
                                    value={newPreferences}
                                    onChange={handlePreferenceChange}
                                    placeholder="Type to search preferences..."
                                    className="preferences-select"
                                    classNamePrefix="select"
                                />
                                <small className="help-text">
                                    These preferences help us recommend courses that match your interests.
                                </small>
                            </div>

                            <div className="form-actions">
                                <button 
                                    onClick={handleUpdatePreferences}
                                    className="btn-primary"
                                    disabled={loading}
                                >
                                    <FaSave />
                                    {loading ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </div>
                        </div>

                        <div className="current-preferences">
                            <h3>Current Preferences:</h3>
                            <div className="preference-tags">
                                {newPreferences.length > 0 ? (
                                    newPreferences.map((pref, index) => (
                                        <span key={index} className="preference-tag">
                                            {pref.label}
                                        </span>
                                    ))
                                ) : (
                                    <p className="no-preferences">No preferences selected yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <div className="settings-section">
                        <h2><FaPalette />Appearance</h2>
                        <p className="section-description">
                            Customize the look and feel of the application
                        </p>
                        
                        <div className="settings-grid">
                            <div className="setting-group">
                                <h3>Theme</h3>
                                <div className="theme-options">
                                    <div className="theme-option">
                                        <div 
                                            className={`theme-preview light ${theme === 'light' ? 'active' : ''}`}
                                            onClick={() => handleThemeChange('light')}
                                        >
                                            <div className="theme-preview-header"></div>
                                            <div className="theme-preview-content">
                                                <div className="theme-preview-sidebar"></div>
                                                <div className="theme-preview-main"></div>
                                            </div>
                                        </div>
                                        <div className="theme-info">
                                            <FaSun className="theme-icon" />
                                            <span>Light Theme</span>
                                            {theme === 'light' && <span className="active-badge">Active</span>}
                                        </div>
                                    </div>

                                    <div className="theme-option">
                                        <div 
                                            className={`theme-preview dark ${theme === 'dark' ? 'active' : ''}`}
                                            onClick={() => handleThemeChange('dark')}
                                        >
                                            <div className="theme-preview-header"></div>
                                            <div className="theme-preview-content">
                                                <div className="theme-preview-sidebar"></div>
                                                <div className="theme-preview-main"></div>
                                            </div>
                                        </div>
                                        <div className="theme-info">
                                            <FaMoon className="theme-icon" />
                                            <span>Dark Theme</span>
                                            {theme === 'dark' && <span className="active-badge">Active</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Settings;
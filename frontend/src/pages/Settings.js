import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { 
  FaCog, 
  FaSave, 
  FaBell, 
  FaLock, 
  FaPalette,
  FaGlobe,
  FaShieldAlt,
  FaUserCog,
  FaDownload,
  FaTrash,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import './Settings.css';

function Settings({ preferences, setUserPreferences }) {
    const [newPreferences, setNewPreferences] = useState(
        preferences.map(p => ({ value: p, label: p }))
    );
    const [activeTab, setActiveTab] = useState('preferences');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    
    // Notification settings
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        courseReminders: true,
        weeklyProgress: true,
        newCourses: false,
        achievements: true
    });

    // Privacy settings
    const [privacy, setPrivacy] = useState({
        profileVisibility: 'private',
        showProgress: false,
        showBadges: true,
        allowMessageFromPeers: false
    });

    // Appearance settings
    const [appearance, setAppearance] = useState({
        theme: 'light',
        language: 'en',
        fontSize: 'medium',
        compactMode: false
    });

    // Security settings
    const [security, setSecurity] = useState({
        twoFactorEnabled: false,
        sessionTimeout: '30',
        loginNotifications: true
    });

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        setNewPreferences(preferences.map(p => ({ value: p, label: p })));
        fetchUserSettings();
    }, [preferences]);

    const fetchUserSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            // Mock data - replace with actual API call
            // const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/settings`, {
            //     headers: { Authorization: `Bearer ${token}` }
            // });
            // setNotifications(response.data.notifications);
            // setPrivacy(response.data.privacy);
            // setAppearance(response.data.appearance);
            // setSecurity(response.data.security);
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

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
                `${process.env.REACT_APP_BACKEND_URL}/api/user`,
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
    };

    const handleSaveSettings = async (settingType, data) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Mock API call - replace with actual implementation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setMessage(`${settingType} settings updated successfully!`);
            setMessageType('success');
            
        } catch (error) {
            setMessage(`Failed to update ${settingType} settings`);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage('New passwords do not match');
            setMessageType('error');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setMessage('Password must be at least 8 characters long');
            setMessageType('error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Mock API call - replace with actual implementation
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setMessage('Password changed successfully!');
            setMessageType('success');
            setShowChangePassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            
        } catch (error) {
            setMessage('Failed to change password');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const exportSettings = () => {
        const settingsData = {
            preferences: newPreferences.map(p => p.value),
            notifications,
            privacy,
            appearance,
            security: { ...security, twoFactorEnabled: security.twoFactorEnabled }
        };

        const dataStr = JSON.stringify(settingsData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'settings-backup.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const deleteAccount = async () => {
        const confirmText = 'DELETE MY ACCOUNT';
        const userInput = prompt(
            `This action cannot be undone. Please type "${confirmText}" to confirm account deletion:`
        );

        if (userInput === confirmText) {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                
                // Mock API call - replace with actual implementation
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                alert('Account deleted successfully. You will be redirected to the homepage.');
                localStorage.removeItem('token');
                window.location.href = '/';
                
            } catch (error) {
                setMessage('Failed to delete account');
                setMessageType('error');
            } finally {
                setLoading(false);
            }
        } else if (userInput !== null) {
            setMessage('Account deletion cancelled - text did not match');
            setMessageType('error');
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <div className="header-content">
                    <h1><FaCog className="header-icon" />Settings</h1>
                    <p className="subtitle">Customize your learning experience and manage your account</p>
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
                    className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    <FaBell />Notifications
                </button>
                <button 
                    className={`tab-button ${activeTab === 'privacy' ? 'active' : ''}`}
                    onClick={() => setActiveTab('privacy')}
                >
                    <FaShieldAlt />Privacy
                </button>
                <button 
                    className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('appearance')}
                >
                    <FaPalette />Appearance
                </button>
                <button 
                    className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <FaLock />Security
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
                                    Your preferences help us recommend relevant courses and content
                                </small>
                            </div>
                            
                            <button 
                                onClick={handleUpdatePreferences}
                                className="btn-primary"
                                disabled={loading}
                            >
                                <FaSave />{loading ? 'Updating...' : 'Update Preferences'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="settings-section">
                        <h2><FaBell />Notification Settings</h2>
                        <p className="section-description">
                            Control how and when you receive notifications from SkillVoyage
                        </p>
                        
                        <div className="settings-grid">
                            <div className="setting-group">
                                <h3>Notification Channels</h3>
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Email Notifications</label>
                                        <small>Receive notifications via email</small>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={notifications.email}
                                            onChange={(e) => setNotifications({
                                                ...notifications,
                                                email: e.target.checked
                                            })}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Push Notifications</label>
                                        <small>Receive browser push notifications</small>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={notifications.push}
                                            onChange={(e) => setNotifications({
                                                ...notifications,
                                                push: e.target.checked
                                            })}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="setting-group">
                                <h3>Notification Types</h3>
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Course Reminders</label>
                                        <small>Reminders to continue your courses</small>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={notifications.courseReminders}
                                            onChange={(e) => setNotifications({
                                                ...notifications,
                                                courseReminders: e.target.checked
                                            })}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Weekly Progress</label>
                                        <small>Weekly summary of your progress</small>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={notifications.weeklyProgress}
                                            onChange={(e) => setNotifications({
                                                ...notifications,
                                                weeklyProgress: e.target.checked
                                            })}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>New Courses</label>
                                        <small>Notifications about new course releases</small>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={notifications.newCourses}
                                            onChange={(e) => setNotifications({
                                                ...notifications,
                                                newCourses: e.target.checked
                                            })}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Achievements</label>
                                        <small>Notifications for badges and milestones</small>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={notifications.achievements}
                                            onChange={(e) => setNotifications({
                                                ...notifications,
                                                achievements: e.target.checked
                                            })}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => handleSaveSettings('notification', notifications)}
                            className="btn-primary"
                            disabled={loading}
                        >
                            <FaSave />Save Notification Settings
                        </button>
                    </div>
                )}

                {activeTab === 'privacy' && (
                    <div className="settings-section">
                        <h2><FaShieldAlt />Privacy Settings</h2>
                        <p className="section-description">
                            Control your privacy and what information is visible to others
                        </p>
                        
                        <div className="settings-grid">
                            <div className="setting-group">
                                <h3>Profile Visibility</h3>
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Profile Visibility</label>
                                        <small>Who can see your profile information</small>
                                    </div>
                                    <select
                                        value={privacy.profileVisibility}
                                        onChange={(e) => setPrivacy({
                                            ...privacy,
                                            profileVisibility: e.target.value
                                        })}
                                        className="setting-select"
                                    >
                                        <option value="private">Private</option>
                                        <option value="friends">Friends Only</option>
                                        <option value="public">Public</option>
                                    </select>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Show Progress</label>
                                        <small>Display your learning progress to others</small>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={privacy.showProgress}
                                            onChange={(e) => setPrivacy({
                                                ...privacy,
                                                showProgress: e.target.checked
                                            })}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Show Badges</label>
                                        <small>Display your earned badges</small>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={privacy.showBadges}
                                            onChange={(e) => setPrivacy({
                                                ...privacy,
                                                showBadges: e.target.checked
                                            })}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Allow Messages from Peers</label>
                                        <small>Let other learners send you messages</small>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={privacy.allowMessageFromPeers}
                                            onChange={(e) => setPrivacy({
                                                ...privacy,
                                                allowMessageFromPeers: e.target.checked
                                            })}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => handleSaveSettings('privacy', privacy)}
                            className="btn-primary"
                            disabled={loading}
                        >
                            <FaSave />Save Privacy Settings
                        </button>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <div className="settings-section">
                        <h2><FaPalette />Appearance Settings</h2>
                        <p className="section-description">
                            Customize the look and feel of your learning environment
                        </p>
                        
                        <div className="settings-grid">
                            <div className="setting-group">
                                <h3>Visual Preferences</h3>
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Theme</label>
                                        <small>Choose your preferred color scheme</small>
                                    </div>
                                    <select
                                        value={appearance.theme}
                                        onChange={(e) => setAppearance({
                                            ...appearance,
                                            theme: e.target.value
                                        })}
                                        className="setting-select"
                                    >
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                        <option value="auto">Auto (System)</option>
                                    </select>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Language</label>
                                        <small>Choose your interface language</small>
                                    </div>
                                    <select
                                        value={appearance.language}
                                        onChange={(e) => setAppearance({
                                            ...appearance,
                                            language: e.target.value
                                        })}
                                        className="setting-select"
                                    >
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                    </select>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Font Size</label>
                                        <small>Adjust text size for better readability</small>
                                    </div>
                                    <select
                                        value={appearance.fontSize}
                                        onChange={(e) => setAppearance({
                                            ...appearance,
                                            fontSize: e.target.value
                                        })}
                                        className="setting-select"
                                    >
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Compact Mode</label>
                                        <small>Use more compact interface layout</small>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={appearance.compactMode}
                                            onChange={(e) => setAppearance({
                                                ...appearance,
                                                compactMode: e.target.checked
                                            })}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => handleSaveSettings('appearance', appearance)}
                            className="btn-primary"
                            disabled={loading}
                        >
                            <FaSave />Save Appearance Settings
                        </button>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="settings-section">
                        <h2><FaLock />Security Settings</h2>
                        <p className="section-description">
                            Manage your account security and privacy
                        </p>
                        
                        <div className="settings-grid">
                            <div className="setting-group">
                                <h3>Account Security</h3>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Change Password</label>
                                        <small>Update your account password</small>
                                    </div>
                                    <button 
                                        onClick={() => setShowChangePassword(!showChangePassword)}
                                        className="btn-secondary btn-sm"
                                    >
                                        {showChangePassword ? <FaEyeSlash /> : <FaEye />}
                                        {showChangePassword ? 'Cancel' : 'Change Password'}
                                    </button>
                                </div>

                                {showChangePassword && (
                                    <form onSubmit={handleChangePassword} className="password-form">
                                        <div className="form-group">
                                            <label>Current Password</label>
                                            <input
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({
                                                    ...passwordData,
                                                    currentPassword: e.target.value
                                                })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({
                                                    ...passwordData,
                                                    newPassword: e.target.value
                                                })}
                                                required
                                                minLength="8"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({
                                                    ...passwordData,
                                                    confirmPassword: e.target.value
                                                })}
                                                required
                                                minLength="8"
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="btn-primary" disabled={loading}>
                                                {loading ? 'Changing...' : 'Change Password'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Two-Factor Authentication</label>
                                        <small>Add an extra layer of security</small>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={security.twoFactorEnabled}
                                            onChange={(e) => setSecurity({
                                                ...security,
                                                twoFactorEnabled: e.target.checked
                                            })}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Session Timeout</label>
                                        <small>Automatically log out after inactivity</small>
                                    </div>
                                    <select
                                        value={security.sessionTimeout}
                                        onChange={(e) => setSecurity({
                                            ...security,
                                            sessionTimeout: e.target.value
                                        })}
                                        className="setting-select"
                                    >
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="never">Never</option>
                                    </select>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label>Login Notifications</label>
                                        <small>Get notified of new login attempts</small>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={security.loginNotifications}
                                            onChange={(e) => setSecurity({
                                                ...security,
                                                loginNotifications: e.target.checked
                                            })}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="security-actions">
                            <button 
                                onClick={() => handleSaveSettings('security', security)}
                                className="btn-primary"
                                disabled={loading}
                            >
                                <FaSave />Save Security Settings
                            </button>
                            
                            <div className="danger-zone">
                                <h3>Danger Zone</h3>
                                <p>Permanently delete your account and all associated data</p>
                                <button 
                                    onClick={deleteAccount}
                                    className="btn-danger"
                                    disabled={loading}
                                >
                                    <FaTrash />Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Settings;
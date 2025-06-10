import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaUserCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaGlobe,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaCamera
} from 'react-icons/fa';
import axios from 'axios';
import './Profile.css';

function Profile({ name, email, preferences }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [profileData, setProfileData] = useState({
        name: name || '',
        email: email || '',
        preferences: preferences || [],
        bio: '',
        location: '',
        phone: '',
        website: '',
        linkedin: '',
        github: '',
        twitter: '',
        joinDate: '',
        avatar: '',
        timezone: 'UTC',
        language: 'English'
    });
    const [tempProfileData, setTempProfileData] = useState({...profileData});

    useEffect(() => {
        fetchProfileData();
    }, []);

    useEffect(() => {
        setProfileData(prev => ({
            ...prev,
            name: name || '',
            email: email || '',
            preferences: preferences || []
        }));
        setTempProfileData(prev => ({
            ...prev,
            name: name || '',
            email: email || '',
            preferences: preferences || []
        }));
    }, [name, email, preferences]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.status === 200) {
                const userData = response.data;
                setProfileData({
                    ...profileData,
                    ...userData,
                    joinDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'
                });
                setTempProfileData({
                    ...profileData,
                    ...userData,
                    joinDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Use mock data for demo
            setProfileData(prev => ({
                ...prev,
                bio: 'Passionate learner focused on developing new skills in technology and personal growth.',
                location: 'San Francisco, CA',
                phone: '+1 (555) 123-4567',
                website: 'https://johndoe.dev',
                linkedin: 'https://linkedin.com/in/johndoe',
                github: 'https://github.com/johndoe',
                twitter: 'https://twitter.com/johndoe',
                joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                timezone: 'Pacific Standard Time',
                language: 'English'
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setTempProfileData({...profileData});
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTempProfileData({...profileData});
        setMessage('');
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/profile`,
                tempProfileData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.status === 200) {
                setProfileData({...tempProfileData});
                setIsEditing(false);
                setMessage('Profile updated successfully!');
                setMessageType('success');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Failed to update profile. Please try again.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setTempProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading && !profileData.name) {
        return (
            <div className="profile-content">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-content">
            <div className="profile-header">
                <div className="header-background"></div>
                <div className="profile-info">
                    <div className="avatar-section">
                        <div className="avatar-container">
                            {profileData.avatar ? (
                                <img src={profileData.avatar} alt="Profile" className="avatar-image" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {getInitials(profileData.name || 'User')}
                                </div>
                            )}
                            {isEditing && (
                                <button className="avatar-edit-btn">
                                    <FaCamera />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="profile-details">
                        <div className="name-section">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={tempProfileData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="edit-input edit-name"
                                    placeholder="Enter your name"
                                />
                            ) : (
                                <h1 className="profile-name">{profileData.name || 'User Name'}</h1>
                            )}
                        </div>
                        
                        <div className="profile-meta">
                            <div className="meta-item">
                                <FaEnvelope className="meta-icon" />
                                <span>{profileData.email}</span>
                            </div>
                            {profileData.location && (
                                <div className="meta-item">
                                    <FaMapMarkerAlt className="meta-icon" />
                                    <span>{profileData.location}</span>
                                </div>
                            )}
                            <div className="meta-item">
                                <FaCalendarAlt className="meta-icon" />
                                <span>Joined {profileData.joinDate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions">
                        {!isEditing ? (
                            <button onClick={handleEdit} className="btn-primary">
                                <FaEdit />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="edit-actions">
                                <button onClick={handleSave} className="btn-primary" disabled={loading}>
                                    <FaSave />
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={handleCancel} className="btn-secondary">
                                    <FaTimes />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {message && (
                <div className={`alert alert-${messageType}`}>
                    {message}
                    <button onClick={() => setMessage('')} className="alert-close">×</button>
                </div>
            )}

            <div className="profile-body">
                <div className="profile-sections">
                    {/* About Section */}
                    <div className="profile-section">
                        <h3 className="section-title">
                            <FaUser className="section-icon" />
                            About
                        </h3>
                        <div className="section-content">
                            {isEditing ? (
                                <textarea
                                    value={tempProfileData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    className="edit-textarea"
                                    placeholder="Tell us about yourself..."
                                    rows="4"
                                />
                            ) : (
                                <p className="bio-text">
                                    {profileData.bio || 'No bio available. Click edit to add information about yourself.'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="profile-section">
                        <h3 className="section-title">
                            <FaEnvelope className="section-icon" />
                            Contact Information
                        </h3>
                        <div className="section-content">
                            <div className="contact-grid">
                                <div className="contact-item">
                                    <label>
                                        <FaMapMarkerAlt className="contact-icon" />
                                        Location
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={tempProfileData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            className="edit-input"
                                            placeholder="Your location"
                                        />
                                    ) : (
                                        <span>{profileData.location || 'Not specified'}</span>
                                    )}
                                </div>

                                <div className="contact-item">
                                    <label>
                                        <FaPhone className="contact-icon" />
                                        Phone
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={tempProfileData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="edit-input"
                                            placeholder="Your phone number"
                                        />
                                    ) : (
                                        <span>{profileData.phone || 'Not specified'}</span>
                                    )}
                                </div>

                                <div className="contact-item">
                                    <label>
                                        <FaGlobe className="contact-icon" />
                                        Website
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            value={tempProfileData.website}
                                            onChange={(e) => handleInputChange('website', e.target.value)}
                                            className="edit-input"
                                            placeholder="https://yourwebsite.com"
                                        />
                                    ) : (
                                        <span>
                                            {profileData.website ? (
                                                <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="contact-link">
                                                    {profileData.website}
                                                </a>
                                            ) : (
                                                'Not specified'
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="profile-section">
                        <h3 className="section-title">
                            <FaGlobe className="section-icon" />
                            Social Links
                        </h3>
                        <div className="section-content">
                            <div className="social-grid">
                                <div className="social-item">
                                    <label>
                                        <FaLinkedin className="social-icon linkedin" />
                                        LinkedIn
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            value={tempProfileData.linkedin}
                                            onChange={(e) => handleInputChange('linkedin', e.target.value)}
                                            className="edit-input"
                                            placeholder="https://linkedin.com/in/username"
                                        />
                                    ) : (
                                        <span>
                                            {profileData.linkedin ? (
                                                <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                                                    {profileData.linkedin}
                                                </a>
                                            ) : (
                                                'Not connected'
                                            )}
                                        </span>
                                    )}
                                </div>

                                <div className="social-item">
                                    <label>
                                        <FaGithub className="social-icon github" />
                                        GitHub
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            value={tempProfileData.github}
                                            onChange={(e) => handleInputChange('github', e.target.value)}
                                            className="edit-input"
                                            placeholder="https://github.com/username"
                                        />
                                    ) : (
                                        <span>
                                            {profileData.github ? (
                                                <a href={profileData.github} target="_blank" rel="noopener noreferrer" className="social-link">
                                                    {profileData.github}
                                                </a>
                                            ) : (
                                                'Not connected'
                                            )}
                                        </span>
                                    )}
                                </div>

                                <div className="social-item">
                                    <label>
                                        <FaTwitter className="social-icon twitter" />
                                        Twitter
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            value={tempProfileData.twitter}
                                            onChange={(e) => handleInputChange('twitter', e.target.value)}
                                            className="edit-input"
                                            placeholder="https://twitter.com/username"
                                        />
                                    ) : (
                                        <span>
                                            {profileData.twitter ? (
                                                <a href={profileData.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                                                    {profileData.twitter}
                                                </a>
                                            ) : (
                                                'Not connected'
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Learning Preferences */}
                    <div className="profile-section">
                        <h3 className="section-title">
                            <FaUserCircle className="section-icon" />
                            Learning Preferences
                        </h3>
                        <div className="section-content">
                            <div className="preferences-display">
                                {profileData.preferences && profileData.preferences.length > 0 ? (
                                    <div className="preferences-tags">
                                        {profileData.preferences.map((pref, index) => (
                                            <span key={index} className="preference-tag">
                                                {pref}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-preferences">
                                        No learning preferences set. Visit Settings to add your interests.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="profile-section">
                        <h3 className="section-title">
                            <FaUserCircle className="section-icon" />
                            Account Settings
                        </h3>
                        <div className="section-content">
                            <div className="settings-grid">
                                <div className="setting-item">
                                    <label>Timezone</label>
                                    {isEditing ? (
                                        <select
                                            value={tempProfileData.timezone}
                                            onChange={(e) => handleInputChange('timezone', e.target.value)}
                                            className="edit-select"
                                        >
                                            <option value="UTC">UTC</option>
                                            <option value="Pacific Standard Time">Pacific Standard Time</option>
                                            <option value="Mountain Standard Time">Mountain Standard Time</option>
                                            <option value="Central Standard Time">Central Standard Time</option>
                                            <option value="Eastern Standard Time">Eastern Standard Time</option>
                                        </select>
                                    ) : (
                                        <span>{profileData.timezone}</span>
                                    )}
                                </div>

                                <div className="setting-item">
                                    <label>Language</label>
                                    {isEditing ? (
                                        <select
                                            value={tempProfileData.language}
                                            onChange={(e) => handleInputChange('language', e.target.value)}
                                            className="edit-select"
                                        >
                                            <option value="English">English</option>
                                            <option value="Spanish">Spanish</option>
                                            <option value="French">French</option>
                                            <option value="German">German</option>
                                            <option value="Chinese">Chinese</option>
                                            <option value="Japanese">Japanese</option>
                                        </select>
                                    ) : (
                                        <span>{profileData.language}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
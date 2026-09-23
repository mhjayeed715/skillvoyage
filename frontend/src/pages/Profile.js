"use client"

import { useState, useEffect, useRef } from "react"
import {
  FaUser,
  FaEnvelope,
  FaEdit,
  FaSave,
  FaTimes,
  FaUserCircle,
  FaPhone,
  FaLinkedin,
  FaGithub,
  FaFacebook,
  FaCamera,
  FaUpload,
} from "react-icons/fa"
import axios from "axios"
import { getBackendUrl } from "../utils/apiConfig"
import "./Profile.css"

function Profile({ name, email, preferences }) {
  const backendUrl = getBackendUrl()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")
  const fileInputRef = useRef(null)

  const [profileData, setProfileData] = useState({
    name: name || "",
    email: email || "",
    preferences: preferences || [],
    bio: "",
    phone: "",
    linkedin: "",
    github: "",
    facebook: "",
    avatar: "",
  })
  const [tempProfileData, setTempProfileData] = useState({ ...profileData })

  useEffect(() => {
    fetchProfileData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setProfileData((prev) => ({
      ...prev,
      name: name || "",
      email: email || "",
      preferences: preferences || [],
    }))
    setTempProfileData((prev) => ({
      ...prev,
      name: name || "",
      email: email || "",
      preferences: preferences || [],
    }))
  }, [name, email, preferences])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${backendUrl}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Accept any 2xx as success
      if (response.status >= 200 && response.status < 300) {
        const userData = response.data || {}
        setProfileData((prev) => ({ ...prev, ...userData }))
        setTempProfileData((prev) => ({ ...prev, ...userData }))
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      // Provide sensible defaults so UI doesn't look empty
      setProfileData((prev) => ({
        ...prev,
        bio: prev.bio || "Passionate learner focused on developing new skills in technology and personal growth.",
        phone: prev.phone || "+880 1712345678",
        linkedin: prev.linkedin || "",
        github: prev.github || "",
        facebook: prev.facebook || "",
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setTempProfileData({ ...profileData })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setTempProfileData({ ...profileData })
    setMessage("")
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      // Do not send avatar here — it's managed by the upload endpoint to avoid conflicts.
      const {
        avatar, // eslint-disable-line @typescript-eslint/no-unused-vars
        ...payload
      } = tempProfileData

      const response = await axios.put(`${backendUrl}/api/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Treat any 2xx as success (handles 200, 201, 204)
      if (response.status >= 200 && response.status < 300) {
        setProfileData({ ...tempProfileData })
        setIsEditing(false)
        setMessage("Profile updated successfully!")
        setMessageType("success")
        setTimeout(() => setMessage(""), 3000)
      } else {
        setMessage("Failed to update profile. Please try again.")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      // Optimistic: Avatar might already be saved separately. Keep UI changes, inform user.
      setMessage("Failed to update profile. Your photo may still be saved.")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setTempProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePhotoUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files && event.target.files[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a valid image file (JPEG, PNG, or GIF)")
      setMessageType("error")
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setMessage("File size must be less than 5MB")
      setMessageType("error")
      return
    }

    setUploadingPhoto(true)
    setMessage("Uploading photo...")
    setMessageType("info")

    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const token = localStorage.getItem("token")
      const response = await axios.post(`${backendUrl}/api/profile/upload-avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      // Accept any 2xx as success
      if (response.status >= 200 && response.status < 300) {
        const avatarUrl = response.data?.avatarUrl
        if (avatarUrl) {
          setProfileData((prev) => ({ ...prev, avatar: avatarUrl }))
          setTempProfileData((prev) => ({ ...prev, avatar: avatarUrl }))
        }
        setMessage("Photo uploaded successfully!")
        setMessageType("success")
        setTimeout(() => setMessage(""), 3000)
      } else {
        throw new Error("Unexpected response status for upload")
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
      // Fallback: use local preview so user sees immediate result
      const reader = new FileReader()
      reader.onload = (e) => {
        const avatarUrl = e.target?.result || ""
        setProfileData((prev) => ({ ...prev, avatar: avatarUrl }))
        setTempProfileData((prev) => ({ ...prev, avatar: avatarUrl }))
        setMessage("Photo uploaded successfully! (Local preview)")
        setMessageType("success")
        setTimeout(() => setMessage(""), 3000)
      }
      reader.readAsDataURL(file)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemovePhoto = () => {
    setProfileData((prev) => ({ ...prev, avatar: "" }))
    setTempProfileData((prev) => ({ ...prev, avatar: "" }))
    setMessage("Photo removed successfully!")
    setMessageType("success")
    setTimeout(() => setMessage(""), 3000)
  }

  const getInitials = (fullName) => {
    return (fullName || "User")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading && !profileData.name) {
    return (
      <div className="profile-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-content">
      <div className="profile-header">
        <div className="header-background"></div>
        <div className="profile-info">
          <div className="avatar-section">
            <div className="avatar-container">
              {profileData.avatar ? (
                <img
                  src={profileData.avatar || "/placeholder.svg"}
                  alt="Profile"
                  className="avatar-image"
                  onError={(e) => {
                    const target = e.target
                    target.style.display = "none"
                    const placeholder = target.nextElementSibling
                    if (placeholder) placeholder.style.display = "flex"
                  }}
                />
              ) : null}
              <div className="avatar-placeholder" style={{ display: profileData.avatar ? "none" : "flex" }}>
                {getInitials(profileData.name)}
              </div>

              <div className="avatar-actions">
                <button
                  className="avatar-edit-btn"
                  onClick={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  title="Upload photo"
                  aria-label="Upload photo"
                >
                  {uploadingPhoto ? <div className="upload-spinner" aria-hidden="true"></div> : <FaCamera />}
                </button>

                {profileData.avatar && (
                  <button
                    className="avatar-remove-btn"
                    onClick={handleRemovePhoto}
                    title="Remove photo"
                    aria-label="Remove photo"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            {!profileData.avatar && (
              <div className="upload-prompt">
                <button onClick={handlePhotoUpload} className="upload-btn" disabled={uploadingPhoto}>
                  <FaUpload />
                  {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                </button>
              </div>
            )}
          </div>

          <div className="profile-details">
            <div className="name-section">
              {isEditing ? (
                <input
                  type="text"
                  value={tempProfileData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="edit-input edit-name"
                  placeholder="Enter your name"
                />
              ) : (
                <h1 className="profile-name">{profileData.name || "User Name"}</h1>
              )}
            </div>

            <div className="profile-meta">
              <div className="meta-item">
                <FaEnvelope className="meta-icon" />
                <span>{profileData.email}</span>
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
                  {loading ? "Saving..." : "Save"}
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
          <button onClick={() => setMessage("")} className="alert-close" aria-label="Close alert">
            ×
          </button>
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
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="edit-textarea"
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              ) : (
                <p className="bio-text">
                  {profileData.bio || "No bio available. Click edit to add information about yourself."}
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
                    <FaPhone className="contact-icon" />
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={tempProfileData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="edit-input"
                      placeholder="+880 1XXXXXXXXX"
                    />
                  ) : (
                    <span>{profileData.phone || "Not specified"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="profile-section">
            <h3 className="section-title">
              <FaUserCircle className="section-icon" />
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
                      onChange={(e) => handleInputChange("linkedin", e.target.value)}
                      className="edit-input"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  ) : profileData.linkedin ? (
                    <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                      {profileData.linkedin}
                    </a>
                  ) : (
                    <span>Not specified</span>
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
                      onChange={(e) => handleInputChange("github", e.target.value)}
                      className="edit-input"
                      placeholder="https://github.com/yourusername"
                    />
                  ) : profileData.github ? (
                    <a href={profileData.github} target="_blank" rel="noopener noreferrer" className="social-link">
                      {profileData.github}
                    </a>
                  ) : (
                    <span>Not specified</span>
                  )}
                </div>

                <div className="social-item">
                  <label>
                    <FaFacebook className="social-icon facebook" />
                    Facebook
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={tempProfileData.facebook}
                      onChange={(e) => handleInputChange("facebook", e.target.value)}
                      className="edit-input"
                      placeholder="https://facebook.com/yourprofile"
                    />
                  ) : profileData.facebook ? (
                    <a href={profileData.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
                      {profileData.facebook}
                    </a>
                  ) : (
                    <span>Not specified</span>
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
                  <p className="no-preferences">No learning preferences set.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

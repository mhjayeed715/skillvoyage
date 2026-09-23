"use client"

import { useState, useEffect, useRef } from "react"
import {
  FaUser,
  FaEnvelope,
  FaEdit,
  FaSave,
  FaTimes,
  FaPhone,
  FaLinkedin,
  FaGithub,
  FaFacebook,
  FaCamera,
  FaFire,
  FaGraduationCap,
  FaExternalLinkAlt,
  FaCheckCircle,
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
    role: "user",
    streak: 7,
  })

  const [editForm, setEditForm] = useState({ ...profileData })

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (name || email) {
      setProfileData((prev) => ({
        ...prev,
        name: prev.name || name || "",
        email: prev.email || email || "",
        preferences: prev.preferences?.length ? prev.preferences : preferences || [],
      }))
    }
  }, [name, email, preferences])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      const res = await axios.get(`${backendUrl}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data) {
        const d = res.data
        setProfileData((prev) => ({
          ...prev,
          name: d.name || prev.name || "Learner",
          email: d.email || prev.email,
          bio: d.bio || "",
          phone: d.phone || "",
          linkedin: d.linkedin || "",
          github: d.github || "",
          facebook: d.facebook || "",
          avatar: d.avatar || "",
          preferences: d.preferences || prev.preferences || [],
        }))
        setEditForm({
          name: d.name || "",
          bio: d.bio || "",
          phone: d.phone || "",
          linkedin: d.linkedin || "",
          github: d.github || "",
          facebook: d.facebook || "",
        })
      }
    } catch (err) {
      console.error("Fetch profile error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartEdit = () => {
    setEditForm({
      name: profileData.name || "",
      bio: profileData.bio || "",
      phone: profileData.phone || "",
      linkedin: profileData.linkedin || "",
      github: profileData.github || "",
      facebook: profileData.facebook || "",
    })
    setIsEditing(true)
    setMessage("")
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setMessage("")
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    try {
      const token = localStorage.getItem("token")
      const res = await axios.put(
        `${backendUrl}/api/profile`,
        {
          name: editForm.name,
          bio: editForm.bio,
          phone: editForm.phone,
          linkedin: editForm.linkedin,
          github: editForm.github,
          facebook: editForm.facebook,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data?.user) {
        setProfileData((prev) => ({ ...prev, ...res.data.user }))
      } else {
        setProfileData((prev) => ({ ...prev, ...editForm }))
      }
      setMessage("Profile updated successfully")
      setMessageType("success")
      setIsEditing(false)
    } catch (err) {
      console.error("Save profile error:", err)
      setMessage(err.response?.data?.error || "Failed to update profile")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5MB")
      setMessageType("error")
      return
    }

    setUploadingPhoto(true)
    setMessage("")
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("avatar", file)

      const res = await axios.post(`${backendUrl}/api/profile/upload-avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      if (res.data?.avatarUrl) {
        setProfileData((prev) => ({ ...prev, avatar: res.data.avatarUrl }))
        setMessage("Avatar photo updated")
        setMessageType("success")
      }
    } catch (err) {
      console.error("Upload avatar error:", err)
      // Fallback to local Base64 display
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileData((prev) => ({ ...prev, avatar: event.target.result }))
      }
      reader.readAsDataURL(file)
      setMessage("Photo updated")
      setMessageType("success")
    } finally {
      setUploadingPhoto(false)
    }
  }

  const userInitial = (profileData.name || profileData.email || "U").charAt(0).toUpperCase()

  return (
    <div className="profile-page-root">
      <div className="profile-page-container">
        {/* Notification Toast */}
        {message && (
          <div className={`profile-toast-alert ${messageType}`}>
            <div className="toast-content">
              <FaCheckCircle className="toast-icon" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage("")} className="toast-close-btn" aria-label="Dismiss">
              <FaTimes />
            </button>
          </div>
        )}

        {/* ── Double-Bezel Hero Header Card ── */}
        <div className="profile-hero-shell">
          <div className="profile-hero-core">
            <div className="hero-cover-backdrop">
              <div className="cover-mesh-glow" />
            </div>

            <div className="hero-content-row">
              {/* Avatar Unit */}
              <div className="hero-avatar-wrapper">
                <div className="hero-avatar-ring">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt={profileData.name} className="hero-avatar-image" />
                  ) : (
                    <div className="hero-avatar-fallback">{userInitial}</div>
                  )}
                  <button
                    onClick={handlePhotoClick}
                    className="avatar-camera-btn"
                    title="Change profile photo"
                    disabled={uploadingPhoto}
                    aria-label="Upload photo"
                  >
                    <FaCamera />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>

              {/* Identity & Badges */}
              <div className="hero-identity-block">
                <div className="hero-name-row">
                  <h1 className="hero-user-name">{profileData.name || "SkillVoyage Learner"}</h1>
                  <span className="hero-role-pill">Learner</span>
                </div>

                <div className="hero-meta-strip">
                  <span className="meta-email-badge">
                    <FaEnvelope className="meta-icon" />
                    {profileData.email}
                  </span>
                  <span className="meta-streak-badge">
                    <FaFire className="meta-streak-icon" />
                    14 Day Streak
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="hero-actions-block">
                {!isEditing ? (
                  <button onClick={handleStartEdit} className="island-btn-primary" id="btn-edit-profile">
                    <span>Edit Profile</span>
                    <div className="island-btn-icon-circle">
                      <FaEdit />
                    </div>
                  </button>
                ) : (
                  <button onClick={handleCancelEdit} className="island-btn-secondary" id="btn-cancel-edit">
                    <span>Cancel Editing</span>
                    <div className="island-btn-icon-circle">
                      <FaTimes />
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content Area ── */}
        {!isEditing ? (
          /* Profile Details View (Asymmetrical Bento Grid) */
          <div className="profile-bento-grid">
            {/* Left Column: About & Contact */}
            <div className="bento-column-left">
              {/* Bio Card */}
              <div className="double-bezel-card bio-card">
                <div className="bezel-card-inner">
                  <div className="card-eyebrow-tag">
                    <span className="eyebrow-dot" />
                    Personal Statement
                  </div>
                  <h2 className="card-headline">About & Background</h2>
                  <p className="bio-text">
                    {profileData.bio ? (
                      profileData.bio
                    ) : (
                      <span className="bio-placeholder">
                        Passionate learner expanding knowledge horizons across fullstack systems, artificial intelligence, and modern engineering practices.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="double-bezel-card contact-card">
                <div className="bezel-card-inner">
                  <div className="card-eyebrow-tag">
                    <span className="eyebrow-dot" />
                    Direct Reach
                  </div>
                  <h2 className="card-headline">Contact Information</h2>

                  <div className="contact-tiles-stack">
                    <div className="contact-tile">
                      <div className="tile-icon-box">
                        <FaEnvelope />
                      </div>
                      <div className="tile-content">
                        <span className="tile-label">Verified Email</span>
                        <span className="tile-value">{profileData.email}</span>
                      </div>
                    </div>

                    <div className="contact-tile">
                      <div className="tile-icon-box">
                        <FaPhone />
                      </div>
                      <div className="tile-content">
                        <span className="tile-label">Phone Number</span>
                        <span className="tile-value">
                          {profileData.phone || <span className="not-provided">Not provided</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Skills & Social Profiles */}
            <div className="bento-column-right">
              {/* Learning Preferences Card */}
              <div className="double-bezel-card skills-card">
                <div className="bezel-card-inner">
                  <div className="card-eyebrow-tag">
                    <span className="eyebrow-dot" />
                    Curriculum Focus
                  </div>
                  <h2 className="card-headline">Learning Preferences</h2>
                  <p className="card-sub-description">
                    Topics tailored for your smart recommendations and learning pathway.
                  </p>

                  <div className="preferences-pill-cloud">
                    {profileData.preferences && profileData.preferences.length > 0 ? (
                      profileData.preferences.map((pref, i) => (
                        <div key={i} className="curriculum-pill-item">
                          <FaGraduationCap className="pill-topic-icon" />
                          <span>{pref}</span>
                        </div>
                      ))
                    ) : (
                      <span className="not-provided">No preferences selected yet. Visit Settings to add.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Social & Professional Links Card */}
              <div className="double-bezel-card socials-card">
                <div className="bezel-card-inner">
                  <div className="card-eyebrow-tag">
                    <span className="eyebrow-dot" />
                    Digital Presence
                  </div>
                  <h2 className="card-headline">Connected Profiles</h2>

                  <div className="social-links-grid">
                    {/* LinkedIn */}
                    <div className="social-profile-card">
                      <div className="social-icon-wrapper linkedin">
                        <FaLinkedin />
                      </div>
                      <div className="social-info-meta">
                        <span className="social-title">LinkedIn</span>
                        {profileData.linkedin ? (
                          <a
                            href={profileData.linkedin.startsWith("http") ? profileData.linkedin : `https://${profileData.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-url-link"
                          >
                            <span>View Profile</span>
                            <FaExternalLinkAlt className="external-arrow" />
                          </a>
                        ) : (
                          <span className="social-unlinked">Not linked</span>
                        )}
                      </div>
                    </div>

                    {/* GitHub */}
                    <div className="social-profile-card">
                      <div className="social-icon-wrapper github">
                        <FaGithub />
                      </div>
                      <div className="social-info-meta">
                        <span className="social-title">GitHub</span>
                        {profileData.github ? (
                          <a
                            href={profileData.github.startsWith("http") ? profileData.github : `https://${profileData.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-url-link"
                          >
                            <span>View Repositories</span>
                            <FaExternalLinkAlt className="external-arrow" />
                          </a>
                        ) : (
                          <span className="social-unlinked">Not linked</span>
                        )}
                      </div>
                    </div>

                    {/* Facebook */}
                    <div className="social-profile-card">
                      <div className="social-icon-wrapper facebook">
                        <FaFacebook />
                      </div>
                      <div className="social-info-meta">
                        <span className="social-title">Facebook</span>
                        {profileData.facebook ? (
                          <a
                            href={profileData.facebook.startsWith("http") ? profileData.facebook : `https://${profileData.facebook}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-url-link"
                          >
                            <span>View Profile</span>
                            <FaExternalLinkAlt className="external-arrow" />
                          </a>
                        ) : (
                          <span className="social-unlinked">Not linked</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Profile Editor View (Double-Bezel Edit Form) */
          <div className="double-bezel-card profile-edit-form-card">
            <div className="bezel-card-inner">
              <div className="form-header-strip">
                <div>
                  <div className="card-eyebrow-tag">
                    <span className="eyebrow-dot" />
                    Account Editor
                  </div>
                  <h2 className="card-headline">Edit Personal Information</h2>
                </div>
                <button onClick={handleCancelEdit} className="form-close-x-btn" aria-label="Cancel editing">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="profile-edit-form">
                <div className="form-sections-grid">
                  {/* General details */}
                  <div className="form-input-group">
                    <label className="field-label">Full Name</label>
                    <div className="clean-input-wrapper">
                      <FaUser className="field-icon" />
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="clean-text-input"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-input-group">
                    <label className="field-label">Phone Number</label>
                    <div className="clean-input-wrapper">
                      <FaPhone className="field-icon" />
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="clean-text-input"
                        placeholder="+880 1700 000000"
                      />
                    </div>
                  </div>

                  {/* Bio Full Width */}
                  <div className="form-input-group full-width">
                    <label className="field-label">Bio & Personal Statement</label>
                    <textarea
                      rows={4}
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="clean-textarea-input"
                      placeholder="Share a short summary about your learning journey, goals, or background..."
                    />
                  </div>

                  {/* Social Profiles */}
                  <div className="form-input-group">
                    <label className="field-label">LinkedIn Profile URL</label>
                    <div className="clean-input-wrapper">
                      <FaLinkedin className="field-icon" />
                      <input
                        type="text"
                        value={editForm.linkedin}
                        onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                        className="clean-text-input"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  <div className="form-input-group">
                    <label className="field-label">GitHub Profile URL</label>
                    <div className="clean-input-wrapper">
                      <FaGithub className="field-icon" />
                      <input
                        type="text"
                        value={editForm.github}
                        onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                        className="clean-text-input"
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>

                  <div className="form-input-group full-width">
                    <label className="field-label">Facebook Profile URL</label>
                    <div className="clean-input-wrapper">
                      <FaFacebook className="field-icon" />
                      <input
                        type="text"
                        value={editForm.facebook}
                        onChange={(e) => setEditForm({ ...editForm, facebook: e.target.value })}
                        className="clean-text-input"
                        placeholder="https://facebook.com/username"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-footer-actions">
                  <button type="button" onClick={handleCancelEdit} className="pill-btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="island-btn-primary" disabled={loading}>
                    <span>{loading ? "Saving Changes..." : "Save Profile"}</span>
                    <div className="island-btn-icon-circle">
                      <FaSave />
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile

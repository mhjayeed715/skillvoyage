import { useState, useEffect } from "react"
import axios from "axios"
import Select from "react-select"
import {
  FaSlidersH,
  FaSave,
  FaPalette,
  FaUserCog,
  FaDownload,
  FaSun,
  FaMoon,
  FaBell,
  FaCheckCircle,
  FaTimes,
  FaTag,
  FaPlus,
} from "react-icons/fa"
import { getBackendUrl } from "../utils/apiConfig"
import "./Settings.css"

const preferenceOptions = [
  { value: "Artificial Intelligence", label: "Artificial Intelligence", category: "Core AI" },
  { value: "Machine Learning", label: "Machine Learning", category: "Core AI" },
  { value: "Web Development", label: "Web Development", category: "Engineering" },
  { value: "Software Engineering", label: "Software Engineering", category: "Engineering" },
  { value: "Cloud Computing", label: "Cloud Computing", category: "Infrastructure" },
  { value: "DevOps", label: "DevOps", category: "Infrastructure" },
  { value: "Cybersecurity", label: "Cybersecurity", category: "Security" },
  { value: "Data Science", label: "Data Science", category: "Data" },
  { value: "Mobile Development", label: "Mobile Development", category: "Engineering" },
  { value: "UI/UX Design", label: "UI/UX Design", category: "Design" },
  { value: "Graphic Design", label: "Graphic Design", category: "Design" },
  { value: "Digital Marketing", label: "Digital Marketing", category: "Growth" },
  { value: "Blockchain", label: "Blockchain", category: "Emerging Tech" },
  { value: "Game Development", label: "Game Development", category: "Interactive" },
  { value: "Content Writing", label: "Content Writing", category: "Growth" },
]

function Settings({ preferences = [], setUserPreferences }) {
  const backendUrl = getBackendUrl()
  const [selectedPrefs, setSelectedPrefs] = useState(
    preferences.map((p) => ({ value: p, label: p }))
  )
  const [activeTab, setActiveTab] = useState("preferences")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")

  // Theme settings
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")

  // Notification toggles
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [streakReminders, setStreakReminders] = useState(true)

  useEffect(() => {
    if (preferences && preferences.length > 0) {
      setSelectedPrefs(preferences.map((p) => ({ value: p, label: p })))
    }
  }, [preferences])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const handlePreferenceChange = (options) => {
    setSelectedPrefs(options || [])
  }

  const handleQuickAdd = (prefValue) => {
    if (!selectedPrefs.some((p) => p.value === prefValue)) {
      const updated = [...selectedPrefs, { value: prefValue, label: prefValue }]
      setSelectedPrefs(updated)
    }
  }

  const handleRemovePref = (valToRemove) => {
    const updated = selectedPrefs.filter((p) => p.value !== valToRemove)
    setSelectedPrefs(updated)
  }

  const handleSavePreferences = async () => {
    setLoading(true)
    setMessage("")
    const token = localStorage.getItem("token")

    if (!token) {
      setMessage("Session expired. Please log in again.")
      setMessageType("error")
      setLoading(false)
      return
    }

    const values = selectedPrefs.map((p) => p.value)

    try {
      const response = await axios.put(
        `${backendUrl}/api/user`,
        { preferences: values },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.status === 200) {
        setUserPreferences?.(values)
        setMessage("Learning preferences successfully updated!")
        setMessageType("success")
      }
    } catch (err) {
      console.error("Update preferences error:", err)
      setMessage(err.response?.data?.error || "Failed to update preferences")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const exportSettings = () => {
    const settingsData = {
      preferences: selectedPrefs.map((p) => p.value),
      theme,
      notifications: {
        emailNotifications,
        weeklyDigest,
        streakReminders,
      },
      exportedAt: new Date().toISOString(),
      platform: "SkillVoyage Learning OS",
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settingsData, null, 2))
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `skillvoyage-settings-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Custom styling for react-select matching high-end design
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#f8fafc",
      borderColor: state.isFocused ? "#6366f1" : "#e2e8f0",
      borderRadius: "14px",
      padding: "6px 8px",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(99, 102, 241, 0.12)" : "none",
      "&:hover": {
        borderColor: "#cbd5e1",
      },
      fontFamily: "inherit",
      fontSize: "0.92rem",
      minHeight: "48px",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#eef2ff",
      borderRadius: "8px",
      border: "1px solid #c7d2fe",
      padding: "2px 6px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#4338ca",
      fontWeight: 600,
      fontSize: "0.85rem",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#6366f1",
      "&:hover": {
        backgroundColor: "#c7d2fe",
        color: "#1e1b4b",
      },
      borderRadius: "4px",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "14px",
      boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#4f46e5" : state.isFocused ? "#f1f5f9" : "#ffffff",
      color: state.isSelected ? "#ffffff" : "#0f172a",
      fontSize: "0.9rem",
      padding: "10px 16px",
      cursor: "pointer",
    }),
  }

  return (
    <div className="settings-page-root">
      <div className="settings-page-container">
        {/* Header Hero */}
        <div className="settings-header-banner">
          <div className="header-meta-group">
            <div className="settings-eyebrow-pill">
              <FaSlidersH className="eyebrow-icon" />
              <span>Platform Configuration</span>
            </div>
            <h1 className="settings-main-heading">Preferences & Controls</h1>
            <p className="settings-sub-text">
              Fine-tune your learning pathway, visual environment, and notifications.
            </p>
          </div>

          <div className="header-action-group">
            <button onClick={exportSettings} className="export-settings-pill-btn" title="Export settings to JSON">
              <FaDownload className="export-icon" />
              <span>Export Profile Config</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {message && (
          <div className={`settings-toast-alert ${messageType}`}>
            <div className="toast-content">
              <FaCheckCircle className="toast-icon" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage("")} className="toast-close-btn" aria-label="Dismiss">
              <FaTimes />
            </button>
          </div>
        )}

        {/* ── Segmented Pill Navigation Tab Bar ── */}
        <div className="settings-segmented-tab-nav" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "preferences"}
            className={`segmented-tab-btn ${activeTab === "preferences" ? "active" : ""}`}
            onClick={() => setActiveTab("preferences")}
          >
            <FaUserCog className="tab-btn-icon" />
            <span>Learning Interests</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "appearance"}
            className={`segmented-tab-btn ${activeTab === "appearance" ? "active" : ""}`}
            onClick={() => setActiveTab("appearance")}
          >
            <FaPalette className="tab-btn-icon" />
            <span>Theme & Interface</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "notifications"}
            className={`segmented-tab-btn ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <FaBell className="tab-btn-icon" />
            <span>Notifications</span>
          </button>
        </div>

        {/* ── Tab Content: Learning Preferences ── */}
        {activeTab === "preferences" && (
          <div className="double-bezel-card settings-panel-card">
            <div className="bezel-card-inner">
              <div className="panel-header-block">
                <div className="panel-eyebrow">
                  <span className="eyebrow-dot" />
                  Curriculum Matching
                </div>
                <h2 className="panel-title">Your Learning Focus</h2>
                <p className="panel-desc">
                  SkillVoyage recommends courses, learning streaks, and peer groups based on these core disciplines.
                </p>
              </div>

              {/* Multi-Select Field */}
              <div className="settings-form-row">
                <label className="field-group-label">Select Skills & Technical Domains</label>
                <Select
                  isMulti
                  options={preferenceOptions}
                  value={selectedPrefs}
                  onChange={handlePreferenceChange}
                  placeholder="Search and select learning disciplines..."
                  styles={customSelectStyles}
                  closeMenuOnSelect={false}
                />
              </div>

              {/* Popular Category Quick Add Pills */}
              <div className="quick-suggestions-box">
                <span className="quick-add-title">Recommended Categories:</span>
                <div className="quick-add-pills">
                  {["Artificial Intelligence", "Machine Learning", "Web Development", "Cloud Computing", "UI/UX Design", "Cybersecurity"].map(
                    (item) => {
                      const isAdded = selectedPrefs.some((p) => p.value === item)
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleQuickAdd(item)}
                          disabled={isAdded}
                          className={`quick-pill-btn ${isAdded ? "is-active" : ""}`}
                        >
                          {isAdded ? <FaCheckCircle className="pill-check" /> : <FaPlus className="pill-add" />}
                          <span>{item}</span>
                        </button>
                      )
                    }
                  )}
                </div>
              </div>

              {/* Active Selected Tags Display */}
              <div className="active-preferences-preview">
                <h3 className="preview-label">
                  <FaTag className="tag-icon" />
                  Currently Selected Disciplines ({selectedPrefs.length})
                </h3>
                <div className="active-tags-cloud">
                  {selectedPrefs.length > 0 ? (
                    selectedPrefs.map((pref, i) => (
                      <div key={i} className="active-discipline-tag">
                        <span>{pref.label}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePref(pref.value)}
                          className="tag-remove-x"
                          title={`Remove ${pref.label}`}
                          aria-label={`Remove ${pref.label}`}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="empty-prefs-notice">No preferences selected yet. Pick categories above to tailor your feed.</span>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="panel-actions-row">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="island-btn-primary"
                  disabled={loading}
                >
                  <span>{loading ? "Saving Changes..." : "Save Preferences"}</span>
                  <div className="island-btn-icon-circle">
                    <FaSave />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Content: Appearance ── */}
        {activeTab === "appearance" && (
          <div className="double-bezel-card settings-panel-card">
            <div className="bezel-card-inner">
              <div className="panel-header-block">
                <div className="panel-eyebrow">
                  <span className="eyebrow-dot" />
                  Visual System
                </div>
                <h2 className="panel-title">Interface Theme & Aesthetic</h2>
                <p className="panel-desc">
                  Customize the visual contrast, density, and color palette of your learning workspace.
                </p>
              </div>

              <div className="theme-selection-grid">
                {/* Light Theme Card */}
                <div
                  className={`theme-preset-card ${theme === "light" ? "selected" : ""}`}
                  onClick={() => setTheme("light")}
                >
                  <div className="theme-preview-box light-preview">
                    <div className="preview-mini-header" />
                    <div className="preview-mini-body">
                      <div className="mini-sidebar" />
                      <div className="mini-cards">
                        <div className="mini-card" />
                        <div className="mini-card" />
                      </div>
                    </div>
                  </div>
                  <div className="theme-card-footer">
                    <div className="theme-title-group">
                      <FaSun className="theme-icon sun" />
                      <span className="theme-name">Modern Light</span>
                    </div>
                    {theme === "light" && <span className="active-tag">Active</span>}
                  </div>
                </div>

                {/* Dark Theme Card */}
                <div
                  className={`theme-preset-card ${theme === "dark" ? "selected" : ""}`}
                  onClick={() => setTheme("dark")}
                >
                  <div className="theme-preview-box dark-preview">
                    <div className="preview-mini-header dark-header" />
                    <div className="preview-mini-body">
                      <div className="mini-sidebar dark-sidebar" />
                      <div className="mini-cards">
                        <div className="mini-card dark-card" />
                        <div className="mini-card dark-card" />
                      </div>
                    </div>
                  </div>
                  <div className="theme-card-footer">
                    <div className="theme-title-group">
                      <FaMoon className="theme-icon moon" />
                      <span className="theme-name">Deep Slate Dark</span>
                    </div>
                    {theme === "dark" && <span className="active-tag">Active</span>}
                  </div>
                </div>
              </div>

              <div className="panel-notice-box">
                <span>The platform defaults to a curated high-contrast light mode optimized for cognitive retention and study ergonomics.</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Content: Notifications ── */}
        {activeTab === "notifications" && (
          <div className="double-bezel-card settings-panel-card">
            <div className="bezel-card-inner">
              <div className="panel-header-block">
                <div className="panel-eyebrow">
                  <span className="eyebrow-dot" />
                  Engagement Alerts
                </div>
                <h2 className="panel-title">Notification Preferences</h2>
                <p className="panel-desc">
                  Choose which alerts and milestones arrive in your inbox.
                </p>
              </div>

              <div className="notification-switches-list">
                <div className="notification-item-row">
                  <div className="switch-info">
                    <span className="switch-title">Course Recommendations</span>
                    <span className="switch-desc">Receive weekly curated courses matching your learning interests.</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="notification-item-row">
                  <div className="switch-info">
                    <span className="switch-title">Learning Streak & Momentum Alerts</span>
                    <span className="switch-desc">Get reminded before your streak resets at midnight.</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={streakReminders}
                      onChange={(e) => setStreakReminders(e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="notification-item-row">
                  <div className="switch-info">
                    <span className="switch-title">Weekly Progress Digest</span>
                    <span className="switch-desc">Summary of hours studied, completed modules, and peer benchmarks.</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={weeklyDigest}
                      onChange={(e) => setWeeklyDigest(e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings
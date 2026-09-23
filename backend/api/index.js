const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const multer = require("multer")
require("dotenv").config()
const User = require("../models/User")
const Course = require("../models/Course")

const app = express()

// Explicit CORS middleware for Vercel Serverless
app.use((req, res, next) => {
  const origin = req.headers.origin || "*"
  res.setHeader("Access-Control-Allow-Origin", origin)
  res.setHeader("Access-Control-Allow-Credentials", "true")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token"
  )

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }
  next()
})

app.use(express.json())
app.use(cors())
app.options("*", cors())

// MongoDB Connection with Serverless Caching
const mongoURI =
  process.env.MONGO_URI ||
  "mongodb+srv://mehrabjayeed715:4C86IEgB0E40Fc1n@skillvoyage.vc9by.mongodb.net/skillvoyage?retryWrites=true&w=majority&appName=SkillVoyage"

let cachedDb = null

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb
  }
  const db = await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  })
  cachedDb = db
  return db
}

// Ensure DB is connected for API requests
app.use(async (req, res, next) => {
  if (req.path === "/api/health" || req.method === "OPTIONS") {
    return next()
  }
  try {
    await connectToDatabase()
    next()
  } catch (err) {
    console.error("Database connection failure:", err.message)
    res.status(503).json({ error: "Service temporarily unavailable. Please try again." })
  }
})

const JWT_SECRET = process.env.JWT_SECRET || "skillvoyage-secret-2025"

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]
  if (!token) return res.status(401).json({ error: "Unauthorized" })
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" })
    req.user = user
    next()
  })
}

// Admin guard
const isAdmin = (req, res, next) => {
  User.findById(req.user.userId)
    .then((user) => {
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" })
      }
      next()
    })
    .catch(() => res.status(500).json({ error: "Server error" }))
}

// Email (Gmail) - with production fallbacks for Vercel Serverless
const EMAIL_USER = process.env.EMAIL_USER || "mehrabjayeed715@gmail.com"
const EMAIL_PASS = process.env.EMAIL_PASS || "jpbhhrtmndwnmnjv"
const FRONTEND_URL = process.env.FRONTEND_URL || "https://skillvoyageweb.vercel.app"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
})

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

/* -------------------- Streak & Gamification Engine ------------------- */

function getUtcDayNumber(date) {
  const d = new Date(date)
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86400000)
}

async function syncUserStreak(user) {
  if (!user) return 0
  const now = new Date()
  const todayDay = getUtcDayNumber(now)
  let changed = false

  if (!user.lastActiveDate) {
    user.streak = 1
    user.lastActiveDate = now
    changed = true
  } else {
    const lastDay = getUtcDayNumber(user.lastActiveDate)
    const diff = todayDay - lastDay

    if (diff === 1) {
      // Exactly consecutive calendar day: continuous streak increment!
      user.streak = (user.streak || 0) + 1
      user.lastActiveDate = now
      changed = true
    } else if (diff > 1) {
      // Missed 1 or more calendar days: reset streak to 1
      user.streak = 1
      user.lastActiveDate = now
      changed = true
    } else if (diff === 0) {
      // Same calendar day: maintain streak, update timestamp
      user.lastActiveDate = now
      if (!user.streak || user.streak < 1) {
        user.streak = 1
        changed = true
      }
    }
  }

  // Check and award streak achievement badges
  user.badges = user.badges || []
  if (user.streak >= 3 && !user.badges.includes("3-Day Streak")) {
    user.badges.push("3-Day Streak")
    changed = true
  }
  if (user.streak >= 7 && !user.badges.includes("7-Day Streak")) {
    user.badges.push("7-Day Streak")
    changed = true
  }
  if (user.streak >= 14 && !user.badges.includes("14-Day Streak")) {
    user.badges.push("14-Day Streak")
    changed = true
  }
  if (user.streak >= 30 && !user.badges.includes("Monthly Master")) {
    user.badges.push("Monthly Master")
    changed = true
  }

  if (changed) {
    try {
      await user.save()
    } catch (saveErr) {
      console.error("Streak sync save error:", saveErr.message)
    }
  }
  return user.streak
}

/* ----------------------- Real Groq AI Client ----------------------- */
const GROQ_API_KEY = process.env.GROQ_API_KEY || ""
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b"

async function callGroqAI(messages, { max_tokens = 700, temperature = 0.6 } = {}) {
  const https = require("https")
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens,
      temperature,
    })

    const req = https.request(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        timeout: 20000,
      },
      (res) => {
        let data = ""
        res.on("data", (chunk) => (data += chunk))
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data)
            if (res.statusCode >= 200 && res.statusCode < 300 && parsed.choices?.[0]?.message?.content) {
              resolve(parsed.choices[0].message.content)
            } else {
              reject(new Error(parsed.error?.message || `Groq API returned HTTP ${res.statusCode}`))
            }
          } catch (e) {
            reject(new Error(`Failed to parse Groq response: ${e.message}`))
          }
        })
      }
    )

    req.on("error", (e) => reject(e))
    req.on("timeout", () => {
      req.destroy()
      reject(new Error("Groq API request timed out"))
    })
    req.write(payload)
    req.end()
  })
}

/* ------------------------------- Auth ------------------------------- */

app.post("/api/signup", async (req, res) => {
  const { name, email, password, preferences } = req.body
  const cleanEmail = email ? String(email).trim().toLowerCase() : ""
  if (!cleanEmail) {
    return res.status(400).json({ error: "Email is required" })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const otp = generateOTP()
    const otpExpiry = Date.now() + 10 * 60 * 1000
    const user = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: "user",
      preferences,
      otp,
      otpExpiry,
    })
    await user.save()

    const mailOptions = {
      from: `"SkillVoyage" <${EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Verify Your SkillVoyage Account with OTP",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px">
          <h2 style="color: #4f46e5; margin: 0 0 12px 0; font-size: 24px; font-weight: 800">SkillVoyage</h2>
          <p style="color: #0f172a; font-size: 16px; margin: 0 0 8px 0">Your verification OTP is:</p>
          <div style="background: #4f46e5; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 18px; border-radius: 8px; margin: 16px 0">${otp}</div>
          <p style="color: #64748b; font-size: 14px; margin: 0">This OTP expires in <strong>10 minutes</strong>. If you did not create an account, please ignore this email.</p>
        </div>
      `,
    }
    console.log(`Sending OTP email to ${cleanEmail}: ${otp}`)
    const info = await transporter.sendMail(mailOptions)
    console.log(`Email sent: ${info.response || info.messageId}`)
    res.json({ message: "Signup successful - check your email for the OTP" })
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({ error: "Email already exists. Please use a different email or log in." })
    }
    console.log(`Signup error: ${err.message}`)
    res.status(400).json({ error: "Signup failed. Please try again." })
  }
})

app.post("/api/verify-otp", async (req, res) => {
  const { email, otp } = req.body
  const cleanEmail = email ? String(email).trim().toLowerCase() : ""
  try {
    const user = await User.findOne({ email: cleanEmail, otp, otpExpiry: { $gt: Date.now() } })
    if (!user) {
      console.log(`Invalid or expired OTP for ${cleanEmail}`)
      return res.status(400).json({ error: "Invalid or expired OTP" })
    }
    user.isVerified = true
    user.otp = null
    user.otpExpiry = null
    await user.save()
    console.log(`Email verified for ${cleanEmail}`)
    res.json({ message: "Email verified - you can now login" })
  } catch (err) {
    console.log(`OTP verification error: ${err.message}`)
    res.status(400).json({ error: "Verification failed" })
  }
})

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body
  const cleanEmail = email ? String(email).trim().toLowerCase() : ""
  try {
    const user = await User.findOne({ email: cleanEmail })
    if (!user) {
      console.log(`User not found: ${cleanEmail}`)
      return res.status(401).json({ error: "User not found" })
    }
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      console.log(`Password mismatch for ${cleanEmail}`)
      return res.status(401).json({ error: "Incorrect password" })
    }
    if (!user.isVerified) {
      console.log(`Email not verified for ${cleanEmail}`)
      return res.status(401).json({ error: "Email not verified" })
    }

    // Sync streak logic: continuous day login increments +1, missed day resets
    await syncUserStreak(user)

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "24h" })
    res.json({
      token,
      userId: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      role: user.role,
      streak: user.streak || 1,
      totalWatchTime: user.totalWatchTime || 0,
      badges: user.badges || [],
    })
  } catch (err) {
    console.log(`Login error: ${err.message}`)
    res.status(500).json({ error: "Something went wrong" })
  }
})

/* ------------------------ Password Reset Flow ------------------------ */

// Request reset link
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body
  const cleanEmail = email ? String(email).trim().toLowerCase() : ""
  if (!cleanEmail) {
    return res.status(400).json({ error: "Email address is required" })
  }

  try {
    const user = await User.findOne({ email: cleanEmail })
    if (user) {
      const token = crypto.randomBytes(32).toString("hex")
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
      user.resetPasswordToken = tokenHash
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000 // 1 hour
      await user.save()

      const frontendBase = FRONTEND_URL.replace(/\/$/, "")
      const resetLink = `${frontendBase}/reset-password?token=${token}`

      const mailOptions = {
        from: `"SkillVoyage" <${EMAIL_USER}>`,
        to: user.email,
        subject: "Reset your SkillVoyage password",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 36px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;">
            <div style="margin-bottom: 24px;">
              <h2 style="margin: 0; color: #4f46e5; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">SkillVoyage</h2>
            </div>
            <h3 style="color: #0f172a; font-size: 18px; margin: 0 0 12px 0;">Reset Your Password</h3>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
              We received a request to reset the password for your SkillVoyage account (<strong>${user.email}</strong>). Click the button below to set a new password:
            </p>
            <div style="margin: 28px 0;">
              <a href="${resetLink}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
              This link is valid for <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; margin: 0; word-break: break-all;">
              If the button doesn't work, copy and paste this link into your browser:<br />
              <a href="${resetLink}" style="color: #4f46e5;">${resetLink}</a>
            </p>
          </div>
        `,
      }
      try {
        const info = await transporter.sendMail(mailOptions)
        console.log(`Reset email sent to ${user.email}: ${info.response || info.messageId}`)
        return res.json({ message: "Password reset link sent! Check your inbox and spam folder." })
      } catch (e) {
        console.error("Failed to send reset email via transporter:", e)
        return res.status(500).json({ error: "Failed to send reset email. Please try again later." })
      }
    } else {
      console.log(`Password reset requested for non-existent email: ${cleanEmail}`)
      // Neutral message to prevent email enumeration
      return res.json({ message: "If an account exists for that email, a reset link has been sent." })
    }
  } catch (err) {
    console.error("Forgot password error:", err)
    res.status(500).json({ error: "Failed to process request" })
  }
})

// Reset password
app.post("/api/reset-password", async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Missing token or password" })
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" })
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" })
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    })
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: "Password reset successful" })
  } catch (err) {
    console.error("Reset password error:", err)
    res.status(500).json({ error: "Failed to reset password" })
  }
})

/* ------------------------------ Profile ----------------------------- */

app.get("/api/user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: "User not found" })
    await syncUserStreak(user)
    res.json({
      name: user.name,
      email: user.email,
      preferences: user.preferences || [],
      role: user.role,
      streak: user.streak || 1,
      totalWatchTime: user.totalWatchTime || 0,
      videoWatchHistory: user.videoWatchHistory || [],
      badges: user.badges || [],
      bio: user.bio || "",
      phone: user.phone || "",
      linkedin: user.linkedin || "",
      github: user.github || "",
      facebook: user.facebook || "",
      avatar: user.avatar || "",
    })
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user data" })
  }
})

app.put("/api/user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: "User not found" })
    user.preferences = Array.isArray(req.body.preferences) ? req.body.preferences : user.preferences
    await user.save()
    res.status(200).json({ message: "Preferences updated", preferences: user.preferences })
  } catch (err) {
    console.error("Update user error:", err)
    res.status(500).json({ error: "Failed to update preferences" })
  }
})

app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: "User not found" })
    res.json({
      name: user.name || "",
      email: user.email || "",
      preferences: user.preferences || [],
      bio: user.bio || "",
      phone: user.phone || "",
      linkedin: user.linkedin || "",
      github: user.github || "",
      facebook: user.facebook || "",
      avatar: user.avatar || "",
    })
  } catch (err) {
    console.error("Fetch profile error:", err)
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

app.put("/api/profile", authenticateToken, async (req, res) => {
  try {
    const { name, bio, phone, linkedin, github, facebook, preferences, avatar } = req.body
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: "User not found" })
    if (typeof name === "string") user.name = name
    if (typeof bio === "string") user.bio = bio
    if (typeof phone === "string") user.phone = phone
    if (typeof linkedin === "string") user.linkedin = linkedin
    if (typeof github === "string") user.github = github
    if (typeof facebook === "string") user.facebook = facebook
    if (Array.isArray(preferences)) user.preferences = preferences
    if (typeof avatar === "string") user.avatar = avatar
    await user.save()
    res.json({
      message: "Profile updated",
      user: {
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        bio: user.bio,
        phone: user.phone,
        linkedin: user.linkedin,
        github: user.github,
        facebook: user.facebook,
        avatar: user.avatar,
      },
    })
  } catch (err) {
    console.error("Update profile error:", err)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

app.post("/api/profile/upload-avatar", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" })
    const mime = req.file.mimetype || "image/png"
    const base64 = req.file.buffer.toString("base64")
    const dataUrl = `data:${mime};base64,${base64}`
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: "User not found" })
    user.avatar = dataUrl
    await user.save()
    res.json({ avatarUrl: dataUrl })
  } catch (err) {
    console.error("Avatar upload error:", err)
    res.status(500).json({ error: "Failed to upload avatar" })
  }
})

/* ---------------------------- Dashboard APIs ---------------------------- */

app.get("/api/dashboard", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("progress.courseId")
    if (!user) return res.status(404).json({ error: "User not found" })

    // Synchronize streak based on calendar day continuity
    await syncUserStreak(user)

    const progress = (user.progress || []).map((p) => ({
      courseId: p.courseId?._id || p.courseId,
      title: p.courseId?.title || undefined,
      category: p.courseId?.category || undefined,
      youtube: p.courseId?.youtube || undefined,
      completion: typeof p.completion === "number" ? p.completion : 0,
      status: p.status || "not-started",
      updatedAt: p.updatedAt || p._id?.getTimestamp?.() || new Date(),
    }))

    const weeklyProgress = Array(7).fill(0)
    const now = new Date()
    progress.forEach((p) => {
      const d = new Date(p.updatedAt || now)
      const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
      if (diffDays >= 0 && diffDays < 7) {
        weeklyProgress[6 - diffDays] += p.completion >= 1 ? 2 : p.completion > 0 ? 1 : 0
      }
    })

    const completedCourses = progress.filter((p) => (p.completion || 0) >= 1).length
    const trackedWatchHours = Math.round(((user.totalWatchTime || 0) / 3600) * 10) / 10
    const totalHours = Math.max(weeklyProgress.reduce((a, b) => a + b, 0), trackedWatchHours)

    res.json({
      progress,
      badges: user.badges || [],
      streak: user.streak || 1,
      lastActiveDate: user.lastActiveDate,
      totalWatchTime: user.totalWatchTime || 0,
      goals: user.goals || [],
      weeklyProgress,
      totalHours,
      completedCourses,
    })
  } catch (err) {
    console.error("Dashboard error:", err)
    res.status(500).json({ error: "Failed to fetch dashboard data" })
  }
})

app.post("/api/complete-course", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: "User not found" })
    const idx = (user.progress || []).findIndex((p) => p.courseId.toString() === courseId)
    const now = new Date()
    if (idx >= 0) {
      user.progress[idx].completion = 1
      user.progress[idx].status = "completed"
      user.progress[idx].updatedAt = now
    } else {
      user.progress.push({ courseId, completion: 1, status: "completed", updatedAt: now })
    }
    await syncUserStreak(user)
    if (user.progress.filter((p) => p.completion >= 1).length >= 5 && !user.badges.includes("5 Courses Completed")) {
      user.badges.push("5 Courses Completed")
    }
    await user.save()
    res.json({ streak: user.streak, badges: user.badges })
  } catch (err) {
    console.error("Complete course error:", err)
    res.status(500).json({ error: "Failed to complete course" })
  }
})

app.post("/api/course-progress", authenticateToken, async (req, res) => {
  try {
    const { courseId, status, completion } = req.body
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: "User not found" })
    if (!courseId) return res.status(400).json({ error: "courseId is required" })

    const normalizedStatus = ["not-started", "in-progress", "completed"].includes(status) ? status : "not-started"
    let normalizedCompletion = typeof completion === "number" ? completion : 0
    if (normalizedStatus === "completed") normalizedCompletion = 1
    if (normalizedStatus === "not-started") normalizedCompletion = 0
    normalizedCompletion = Math.max(0, Math.min(1, normalizedCompletion))

    const now = new Date()
    const idx = (user.progress || []).findIndex((p) => p.courseId.toString() === courseId)
    if (idx >= 0) {
      user.progress[idx].status = normalizedStatus
      user.progress[idx].completion = normalizedCompletion
      user.progress[idx].updatedAt = now
    } else {
      user.progress.push({ courseId, status: normalizedStatus, completion: normalizedCompletion, updatedAt: now })
    }

    await user.save()
    res.json({ message: "Progress updated" })
  } catch (err) {
    console.error("Course progress error:", err)
    res.status(500).json({ error: "Failed to update course progress" })
  }
})

/* ------------------- Inbuilt Video Watch Tracker API ------------------- */

app.post("/api/video-watch-time", authenticateToken, async (req, res) => {
  try {
    const { courseId, videoId, title, secondsWatched, completed, completion } = req.body
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: "User not found" })

    const validSeconds = Math.max(1, Math.min(Number(secondsWatched) || 0, 600))
    user.totalWatchTime = (user.totalWatchTime || 0) + validSeconds

    // Update video watch history
    user.videoWatchHistory = user.videoWatchHistory || []
    const vId = videoId || (courseId ? String(courseId) : "general-video")
    const existingIdx = user.videoWatchHistory.findIndex((v) => v.videoId === vId)
    const now = new Date()

    if (existingIdx >= 0) {
      user.videoWatchHistory[existingIdx].watchTime =
        (user.videoWatchHistory[existingIdx].watchTime || 0) + validSeconds
      user.videoWatchHistory[existingIdx].lastWatched = now
      if (completed) user.videoWatchHistory[existingIdx].completed = true
    } else {
      user.videoWatchHistory.push({
        videoId: vId,
        courseId: courseId || null,
        title: title || "Course Lecture",
        watchTime: validSeconds,
        lastWatched: now,
        completed: !!completed,
      })
    }

    // Update course progress if courseId is supplied
    if (courseId) {
      user.progress = user.progress || []
      const cIdx = user.progress.findIndex((p) => p.courseId.toString() === courseId.toString())
      const calculatedCompletion =
        typeof completion === "number"
          ? Math.min(1, Math.max(0, completion))
          : completed
          ? 1
          : 0.25
      const newStatus = completed || calculatedCompletion >= 1 ? "completed" : "in-progress"

      if (cIdx >= 0) {
        user.progress[cIdx].completion = Math.max(user.progress[cIdx].completion || 0, calculatedCompletion)
        if (newStatus === "completed") user.progress[cIdx].status = "completed"
        else if (user.progress[cIdx].status !== "completed") user.progress[cIdx].status = newStatus
        user.progress[cIdx].updatedAt = now
      } else {
        user.progress.push({
          courseId,
          completion: calculatedCompletion,
          status: newStatus,
          updatedAt: now,
        })
      }
    }

    // Award milestones for focused watching
    user.badges = user.badges || []
    if (user.totalWatchTime >= 3600 && !user.badges.includes("1 Hour Focused")) {
      user.badges.push("1 Hour Focused")
    }
    if (user.totalWatchTime >= 18000 && !user.badges.includes("5 Hours Deep Work")) {
      user.badges.push("5 Hours Deep Work")
    }

    // Sync streak as well
    await syncUserStreak(user)
    await user.save()

    res.json({
      success: true,
      totalWatchTime: user.totalWatchTime,
      streak: user.streak,
      badges: user.badges,
    })
  } catch (err) {
    console.error("Video watch time update error:", err)
    res.status(500).json({ error: "Failed to record watch time" })
  }
})

/* ----------------------- Real Groq AI Endpoints ----------------------- */

// AI Explain Concept / Tutor
app.post("/api/ai/explain", authenticateToken, async (req, res) => {
  try {
    const { topic, courseTitle, userQuestion, context } = req.body
    if (!topic && !courseTitle && !userQuestion) {
      return res.status(400).json({ error: "Please provide a concept or question to explain" })
    }

    const systemPrompt = `You are SkillVoyage AI, an elite, friendly computer science tutor and learning coach.
Explain technical concepts with maximum clarity and zero filler words.
Structure your explanation cleanly using:
- **Core Principle**: 1-2 sentence crystal-clear definition.
- **Why It Matters**: Concrete software engineering rationale.
- **Key Mechanics**: Clear bullet points explaining how it works.
- **Practical Code Example**: A clean, modern code snippet (TypeScript/JavaScript/Python as appropriate).
- **Pro Tip**: One common pitfall to avoid.`

    const userPrompt = `Course: ${courseTitle || "Technical Subject"}
Topic: ${topic || "General Concept"}
Student Question / Context: ${userQuestion || context || `Explain ${topic || courseTitle} thoroughly.`}`

    const explanation = await callGroqAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { max_tokens: 850, temperature: 0.5 }
    )

    res.json({ explanation })
  } catch (err) {
    console.error("AI explain error:", err.message)
    res.status(500).json({ error: "AI explanation failed", details: err.message })
  }
})

// AI Practice Quiz Generator
app.post("/api/ai/quiz", authenticateToken, async (req, res) => {
  try {
    const { courseTitle, topic, category } = req.body
    const subject = topic || courseTitle || category || "Web Development"

    const systemPrompt = `You are SkillVoyage AI Quiz Generator.
Generate exactly 3 multiple-choice practice questions testing conceptual understanding of: "${subject}".
Return ONLY a valid JSON array of objects with this exact structure, with no markdown backticks, no markdown formatting, and no commentary:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 0,
    "explanation": "Why this option is correct"
  }
]`

    const rawResponse = await callGroqAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate 3 practice questions for ${subject}.` },
      ],
      { max_tokens: 950, temperature: 0.4 }
    )

    let quiz = []
    try {
      const cleaned = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim()
      quiz = JSON.parse(cleaned)
    } catch (_e) {
      quiz = [
        {
          question: `What is the primary role of ${subject}?`,
          options: [
            "Core architecture & structural application logic",
            "Visual styling only",
            "Database indexing only",
            "Network routing only",
          ],
          answerIndex: 0,
          explanation: `${subject} forms the foundational structural logic for engineering scalable applications.`,
        },
      ]
    }

    res.json({ quiz })
  } catch (err) {
    console.error("AI quiz error:", err.message)
    res.status(500).json({ error: "AI quiz generation failed", details: err.message })
  }
})

// AI Personalized Recommendations
app.post("/api/ai/recommend", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    const preferences = user?.preferences || []
    const completedCount = (user?.progress || []).filter((p) => p.completion >= 1).length

    const prompt = `Student has preferences: [${preferences.join(", ")}].
They have completed ${completedCount} courses so far.
Provide 3 high-impact recommended next skills or concepts to learn, with a 1-sentence rationale for each.
Return a valid JSON array:
[
  { "title": "Skill/Concept Name", "category": "Discipline", "reason": "Why this accelerates their career" }
]`

    const raw = await callGroqAI(
      [
        { role: "system", content: "You are SkillVoyage AI Career Advisor. Return ONLY valid JSON array with no wrapping." },
        { role: "user", content: prompt },
      ],
      { max_tokens: 650, temperature: 0.5 }
    )

    let recommendations = []
    try {
      const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim()
      recommendations = JSON.parse(cleaned)
    } catch (_e) {
      recommendations = [
        {
          title: "Full-Stack System Architecture",
          category: "Software Engineering",
          reason: "Directly bridges front-end and back-end mastery.",
        },
        {
          title: "Production TypeScript & Type Systems",
          category: "Web Development",
          reason: "Industry standard for mission-critical web applications.",
        },
      ]
    }

    res.json({ recommendations })
  } catch (err) {
    console.error("AI recommend error:", err.message)
    res.status(500).json({ error: "AI recommendations failed" })
  }
})

/* ------------------------- Analytics (Real Data) ------------------------- */

app.get("/api/peer-comparison", authenticateToken, async (req, res) => {
  try {
    const me = await User.findById(req.user.userId)
    if (!me) return res.status(404).json({ error: "User not found" })

    const users = await User.find({ role: "user" }).select("progress streak badges preferences")
    const totalUsers = users.length || 1

    const summarize = (u) => ({
      coursesCompleted: (u.progress || []).filter((p) => (p.completion || 0) >= 1).length,
      hoursStudied: (u.progress || []).reduce((acc, p) => acc + (p.completion >= 1 ? 2 : p.completion > 0 ? 1 : 0), 0),
      averageScore: 0,
      streakDays: u.streak || 0,
      badgesEarned: (u.badges || []).length,
    })

    const myStats = summarize(me)
    const peerAgg = users.reduce(
      (acc, u) => {
        const s = summarize(u)
        acc.coursesCompleted += s.coursesCompleted
        acc.hoursStudied += s.hoursStudied
        acc.averageScore += s.averageScore
        acc.streakDays += s.streakDays
        acc.badgesEarned += s.badgesEarned
        return acc
      },
      { coursesCompleted: 0, hoursStudied: 0, averageScore: 0, streakDays: 0, badgesEarned: 0 },
    )
    const peerAverages = {
      coursesCompleted: Math.round(peerAgg.coursesCompleted / totalUsers),
      hoursStudied: Math.round(peerAgg.hoursStudied / totalUsers),
      averageScore: 0,
      streakDays: Math.round(peerAgg.streakDays / totalUsers),
      badgesEarned: Math.round(peerAgg.badgesEarned / totalUsers),
    }

    const sorted = [...users]
      .map((u) => ({ id: u._id.toString(), count: (u.progress || []).filter((p) => (p.completion || 0) >= 1).length }))
      .sort((a, b) => b.count - a.count)
    const ranking = sorted.findIndex((x) => x.id === me._id.toString()) + 1 || totalUsers
    const betterThan = sorted.filter((x) => x.count <= myStats.coursesCompleted).length
    const percentile = Math.round((betterThan / totalUsers) * 100)

    const categories = [
      "Web Development",
      "Data Science",
      "Machine Learning",
      "Artificial Intelligence",
      "Cybersecurity",
      "UI/UX Design",
    ]
    const categoryComparison = {}
    categories.forEach((cat) => {
      const peerInCat = users.filter((u) => (u.preferences || []).includes(cat))
      const peerAvgInCat = peerInCat.length
        ? Math.round(
            peerInCat.reduce((acc, u) => acc + (u.progress || []).filter((p) => (p.completion || 0) >= 1).length, 0) /
              peerInCat.length,
          )
        : 0
      const myInCat = (me.progress || []).filter((p) => (p.completion || 0) >= 1).length
      categoryComparison[cat] = { user: myInCat, peer: peerAvgInCat }
    })

    res.json({
      userStats: myStats,
      peerAverages,
      percentile,
      ranking,
      totalUsers,
      categoryComparison,
      trends: {
        coursesCompleted: "up",
        hoursStudied: "up",
        averageScore: "stable",
        streakDays: "up",
      },
    })
  } catch (err) {
    console.error("Peer comparison error:", err)
    res.status(500).json({ error: "Failed to compute peer comparison" })
  }
})

app.get("/api/pace", authenticateToken, async (req, res) => {
  try {
    const range = String(req.query.range || "4weeks")
    const weeks = range === "12weeks" ? 12 : range === "8weeks" ? 8 : 4
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: "User not found" })

    const now = new Date()
    const buckets = Array(weeks).fill(0)
    ;(user.progress || []).forEach((p) => {
      const d = new Date(p.updatedAt || now)
      const diffWeeks = Math.floor((now - d) / (1000 * 60 * 60 * 24 * 7))
      if (diffWeeks >= 0 && diffWeeks < weeks) {
        buckets[weeks - 1 - diffWeeks] += p.completion >= 1 ? 2 : p.completion > 0 ? 1 : 0
      }
    })
    const coursesPerWeek = Array(weeks).fill(0)
    ;(user.progress || []).forEach((p) => {
      const d = new Date(p.updatedAt || now)
      const diffWeeks = Math.floor((now - d) / (1000 * 60 * 60 * 24 * 7))
      if (diffWeeks >= 0 && diffWeeks < weeks && p.completion >= 1) {
        coursesPerWeek[weeks - 1 - diffWeeks] += 1
      }
    })

    const averagePace = coursesPerWeek.reduce((a, b) => a + b, 0) / (weeks || 1)
    const weeklyGoal = 10
    const currentWeekHours = buckets[buckets.length - 1] || 0

    res.json({
      weeklyHours: buckets,
      coursesPerWeek,
      averagePace: Number(averagePace.toFixed(2)),
      recommendation: "Maintain 8-12 hours per week for steady progress. Adjust based on your schedule.",
      trend: averagePace >= 2 ? "up" : averagePace > 0.5 ? "stable" : "down",
      weeklyGoal,
      currentWeekHours,
    })
  } catch (err) {
    console.error("Pace error:", err)
    res.status(500).json({ error: "Failed to fetch pace data" })
  }
})

/* ---------------------------- Courses Catalog ---------------------------- */

app.get("/api/courses", async (req, res) => {
  try {
    const { category, keyword } = req.query
    const query = {}
    if (category) query.category = category
    if (keyword) query.title = { $regex: keyword, $options: "i" }
    const courses = await Course.find(query).sort({ createdAt: -1 })
    res.json(courses)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch courses" })
  }
})

/* ------------------------------- Admin APIs ------------------------------ */

app.get("/api/admin/users", authenticateToken, isAdmin, async (_req, res) => {
  try {
    const users = await User.find({ role: "user" })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

app.put("/api/admin/users/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, email, preferences } = req.body
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: "User not found" })
    user.name = name || user.name
    user.email = email || user.email
    user.preferences = Array.isArray(preferences) ? preferences : user.preferences
    await user.save()
    res.json({ message: "User updated", user })
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" })
  }
})

app.delete("/api/admin/users/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: "User not found" })
    await User.deleteOne({ _id: req.params.id })
    res.json({ message: "User deleted" })
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" })
  }
})

app.get("/api/admin/courses", authenticateToken, isAdmin, async (_req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 })
    res.json(courses)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch courses" })
  }
})

app.post("/api/admin/courses", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, youtube, category } = req.body
    if (!title || !youtube || !category) {
      return res.status(400).json({ error: "Title, YouTube URL, and category are required" })
    }
    const course = new Course({ title, youtube, category })
    await course.save()
    res.json({ message: "Course added", course })
  } catch (err) {
    console.log(`Add course error: ${err.message}`)
    res.status(500).json({ error: "Failed to add course" })
  }
})

app.put("/api/admin/courses/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, youtube, category } = req.body
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json({ error: "Course not found" })
    course.title = title || course.title
    course.youtube = youtube || course.youtube
    course.category = category || course.category
    await course.save()
    res.json({ message: "Course updated", course })
  } catch (err) {
    res.status(500).json({ error: "Failed to update course" })
  }
})

app.delete("/api/admin/courses/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json({ error: "Course not found" })
    await Course.deleteOne({ _id: req.params.id })
    res.json({ message: "Course deleted" })
  } catch (err) {
    res.status(500).json({ error: "Failed to delete course" })
  }
})

/* ------------------------------- Server ------------------------------- */

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`)
  })
}

module.exports = app

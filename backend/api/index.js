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
app.use(express.json())

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, true) // permissive fallback — tighten in production
      }
    },
    credentials: true,
  }),
)

app.options("*", cors())

// MongoDB Connection
const mongoURI =
  process.env.MONGO_URI ||
  "mongodb+srv://mehrabjayeed715:4C86IEgB0E40Fc1n@skillvoyage.vc9by.mongodb.net/skillvoyage?retryWrites=true&w=majority&appName=SkillVoyage"
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err))

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]
  if (!token) return res.status(401).json({ error: "Unauthorized" })
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
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

// Email (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
})

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

/* ------------------------------- Auth ------------------------------- */

app.post("/api/signup", async (req, res) => {
  const { name, email, password, preferences } = req.body
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const otp = generateOTP()
    const otpExpiry = Date.now() + 10 * 60 * 1000
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
      preferences,
      otp,
      otpExpiry,
    })
    await user.save()

    const mailOptions = {
      from: `"SkillVoyage" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your SkillVoyage Account with OTP",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px">
          <h2 style="color:#6366f1;margin-bottom:8px">SkillVoyage</h2>
          <p style="color:#1f2937;font-size:16px">Your verification OTP is:</p>
          <div style="background:#6366f1;color:#fff;font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;padding:20px;border-radius:8px;margin:16px 0">${otp}</div>
          <p style="color:#6b7280;font-size:14px">This OTP expires in <strong>10 minutes</strong>. If you did not create an account, please ignore this email.</p>
        </div>
      `,
    }
    console.log(`Sending OTP email to ${email}: ${otp}`)
    const info = await transporter.sendMail(mailOptions)
    console.log(`Email sent: ${info.response}`)
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
  try {
    const user = await User.findOne({ email, otp, otpExpiry: { $gt: Date.now() } })
    if (!user) {
      console.log(`Invalid or expired OTP for ${email}`)
      return res.status(400).json({ error: "Invalid or expired OTP" })
    }
    user.isVerified = true
    user.otp = null
    user.otpExpiry = null
    await user.save()
    console.log(`Email verified for ${email}`)
    res.json({ message: "Email verified - you can now login" })
  } catch (err) {
    console.log(`OTP verification error: ${err.message}`)
    res.status(400).json({ error: "Verification failed" })
  }
})

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) {
      console.log(`User not found: ${email}`)
      return res.status(401).json({ error: "User not found" })
    }
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      console.log(`Password mismatch for ${email}`)
      return res.status(401).json({ error: "Incorrect password" })
    }
    if (!user.isVerified) {
      console.log(`Email not verified for ${email}`)
      return res.status(401).json({ error: "Email not verified" })
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" })
    res.json({
      token,
      userId: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      role: user.role,
    })
  } catch (err) {
    console.log(`Login error: ${err.message}`)
    res.status(500).json({ error: "Something went wrong" })
  }
})

/* ------------------------ Password Reset Flow ------------------------ */

// Request reset link (always return 200 to prevent account enumeration)
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body
  try {
    const user = await User.findOne({ email })
    if (user) {
      const token = crypto.randomBytes(32).toString("hex")
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
      user.resetPasswordToken = tokenHash
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000 // 1 hour
      await user.save()

      const frontendBase = process.env.FRONTEND_URL || "http://localhost:3000"
      const resetLink = `${frontendBase.replace(/\/$/, "")}/reset-password?token=${token}`

      const mailOptions = {
        from: `"SkillVoyage" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Reset your SkillVoyage password",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px">
            <h2 style="color:#6366f1;margin-bottom:8px">SkillVoyage</h2>
            <p style="color:#1f2937">You requested a password reset.</p>
            <p style="color:#1f2937">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
            <a href="${resetLink}" style="display:inline-block;background:#6366f1;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Reset Password</a>
            <p style="color:#6b7280;font-size:13px">If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
      }
      try {
        await transporter.sendMail(mailOptions)
        console.log(`Reset email sent to ${user.email}`)
      } catch (e) {
        console.error("Failed to send reset email:", e.message)
      }
    }
    // Always respond success (even if user doesn't exist)
    res.json({ message: "If an account exists for that email, a reset link has been sent." })
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
    res.json({
      name: user.name,
      email: user.email,
      preferences: user.preferences || [],
      role: user.role,
      streak: user.streak || 0,
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

    const progress = (user.progress || []).map((p) => ({
      courseId: p.courseId?._id || p.courseId,
      title: p.courseId?.title || undefined,
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
    const totalHours = weeklyProgress.reduce((a, b) => a + b, 0)

    res.json({
      progress,
      badges: user.badges || [],
      streak: user.streak || 0,
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
    user.streak = (user.streak || 0) + 1
    user.badges = user.badges || []
    if (user.streak >= 3 && !user.badges.includes("3-Day Streak")) user.badges.push("3-Day Streak")
    if (user.progress.length >= 5 && !user.badges.includes("5 Courses Completed"))
      user.badges.push("5 Courses Completed")
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

const PORT = process.env.PORT || 3001
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app

const mongoose = require("mongoose")

const ProgressSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    status: { type: String, enum: ["not-started", "in-progress", "completed"], default: "not-started" },
    completion: { type: Number, default: 0 }, // 0-1
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true },
)

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // onboarding/verification
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },

    // profile
    preferences: { type: [String], default: [] },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    facebook: { type: String, default: "" },

    // gamification / stats
    streak: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    goals: { type: [String], default: [] },

    // learning progress
    progress: { type: [ProgressSchema], default: [] },

    // password reset
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true },
)

module.exports = mongoose.models.User || mongoose.model("User", UserSchema)

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: String,
    role: { type: String, default: 'user' },
    preferences: [String],
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    progress: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        completion: { type: Number, default: 0 }
    }],
    streak: { type: Number, default: 0 },
    badges: [String],
    goals: [String]
});

module.exports = mongoose.model('User', userSchema);
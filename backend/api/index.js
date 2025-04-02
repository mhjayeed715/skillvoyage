const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));

// MongoDB Connection
const mongoURI = 'mongodb+srv://mehrabjayeed715:4C86IEgB0E40Fc1n@skillvoyage.vc9by.mongodb.net/skillvoyage?retryWrites=true&w=majority&appName=SkillVoyage';
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: String,
    role: String,
    preferences: [String],
    isVerified: { type: Boolean, default: false },
    otp: String, // Store OTP
    otpExpiry: Date, // OTP expiry time
    resetToken: String,
    resetTokenExpiry: Date
});
const User = mongoose.model('User', UserSchema);

// Email Setup (using Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Signup with OTP Verification
app.post('/signup', async (req, res) => {
    const { name, email, password, preferences } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    const user = new User({ name, email, password: hashedPassword, role: 'user', preferences, otp, otpExpiry });

    try {
        await user.save();
        await transporter.sendMail({
            to: email,
            subject: 'Verify Your SkillVoyage Account with OTP',
            html: `Your OTP for SkillVoyage account verification is <b>${otp}</b>. It expires in 10 minutes.`
        });
        res.json({ message: 'Signup successful - check your email for the OTP' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email, otp, otpExpiry: { $gt: Date.now() } });
        if (!user) {
            console.log(`Invalid or expired OTP for ${email}`);
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        console.log(`Email verified for ${email}`);
        res.json({ message: 'Email verified - you can now login' });
    } catch (err) {
        console.log(`OTP verification error: ${err.message}`);
        res.status(400).json({ error: 'Verification failed' });
    }
});

// Login with JWT
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        console.log(`User not found: ${email}`);
        return res.status(401).json({ error: 'Invalid credentials or email not verified' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        console.log(`Password mismatch for ${email}`);
        return res.status(401).json({ error: 'Invalid credentials or email not verified' });
    }
    if (!user.isVerified) {
        console.log(`Email not verified for ${email}`);
        return res.status(401).json({ error: 'Invalid credentials or email not verified' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
    res.json({ token, userId: user._id, name: user.name, preferences: user.preferences });
});

// Forgot Password
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '15m' });
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
        to: email,
        subject: 'Reset Your SkillVoyage Password',
        html: `Click <a href="${resetUrl}">here</a> to reset your password. Expires in 15 minutes.`
    });
    res.json({ message: 'Password reset link sent to your email' });
});

// Reset Password (via token in URL)
app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        const user = await User.findOne({ email: decoded.email, resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();
        res.json({ message: 'Password reset successful - login with your new password' });
    } catch (err) {
        res.status(400).json({ error: 'Token expired or invalid' });
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
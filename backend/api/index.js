const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
const mongoURI = 'mongodb+srv://mehrabjayeed715:4C86IEgB0E40Fc1n@skillvoyage.vc9by.mongodb.net/?retryWrites=true&w=majority&appName=SkillVoyage';
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: String,
    role: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
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

// Signup with Email Verification
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
    const user = new User({ email, password: hashedPassword, role: 'user', verificationToken });

    try {
        await user.save();
        const verificationUrl = `http://localhost:3000/verify?token=${verificationToken}`;
        await transporter.sendMail({
            to: email,
            subject: 'Verify Your SkillVoyage Account',
            html: `Click <a href="${verificationUrl}">here</a> to verify your email.`
        });
        res.json({ message: 'Signup successful - check your email to verify' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Verify Email
app.get('/verify', async (req, res) => {
    const { token } = req.query;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        const user = await User.findOne({ email: decoded.email, verificationToken: token });
        if (!user) return res.status(400).json({ error: 'Invalid token' });
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();
        res.json({ message: 'Email verified - you can now login' });
    } catch (err) {
        res.status(400).json({ error: 'Token expired or invalid' });
    }
});

// Login with JWT
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)) || !user.isVerified) {
        return res.status(401).json({ error: 'Invalid credentials or email not verified' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
    res.json({ token, userId: user._id });
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

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    await transporter.sendMail({
        to: email,
        subject: 'Reset Your SkillVoyage Password',
        html: `Click <a href="${resetUrl}">here</a> to reset your password. Expires in 15 minutes.`
    });
    res.json({ message: 'Password reset link sent to your email' });
});

// Reset Password
app.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
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
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

module.exports = app;
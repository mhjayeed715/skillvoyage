const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: '*', 
}));

app.options("*", cors());

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
    otp: String,
    otpExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpiry: Date
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
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Signup with OTP 
app.post('/signup', async (req, res) => {
    const { name, email, password, preferences } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000;
    const user = new User({ name, email, password: hashedPassword, role: 'user', preferences, otp, otpExpiry });

    try {
        await user.save();
        const mailOptions = {
            to: email,
            subject: 'Verify Your SkillVoyage Account with OTP',
            html: `Your OTP for SkillVoyage account verification is <b>${otp}</b>. It expires in 10 minutes.`
        };
        console.log(`Sending OTP email to ${email}: ${otp}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.response}`);
        res.json({ message: 'Signup successful - check your email for the OTP' });
    } catch (err) {
        if (err.code === 11000 && err.keyPattern?.email) {
            return res.status(400).json({ error: 'Email already exists. Please use a different email or log in.' });
        }
        console.log(`Signup error: ${err.message}`);
        res.status(400).json({ error: 'Signup failed. Please try again.' });
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
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found: ${email}`);
            return res.status(401).json({ error: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log(`Password mismatch for ${email}`);
            return res.status(401).json({ error: 'Incorrect password' });
        }
        if (!user.isVerified) {
            console.log(`Email not verified for ${email}`);
            return res.status(401).json({ error: 'Email not verified' });
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user._id, name: user.name, preferences: user.preferences });
    } catch (err) {
        console.log(`Login error: ${err.message}`);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Forgot Password
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found: ${email}`);
            return res.status(404).json({ error: 'User not found' });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = Date.now() + 3600000; // 1 hour expiry
        await user.save();
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const mailOptions = {
            to: email,
            subject: 'Reset Your SkillVoyage Password',
            html: `Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.`
        };
        console.log(`Sending reset email to ${email}: ${resetLink}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.response}`);
        res.json({ message: 'Password reset email sent' });
    } catch (err) {
        console.log(`Forgot password error: ${err.message}`);
        res.status(500).json({ error: 'Failed to send reset email' });
    }
});

// Reset Password
app.post('/reset-password', async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;
    try {
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() }
        });
        if (!user) {
            console.log(`Invalid or expired token: ${token}`);
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();
        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.log(`Reset password error: ${err.message}`);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
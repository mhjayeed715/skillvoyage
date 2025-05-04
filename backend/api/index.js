const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();
const User = require('../models/User');
const Course = require('../models/Course');

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

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Middleware to Check Admin Role
const isAdmin = (req, res, next) => {
    User.findById(req.user.userId)
        .then(user => {
            if (!user || user.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }
            next();
        })
        .catch(err => res.status(500).json({ error: 'Server error' }));
};

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
app.post('/api/signup', async (req, res) => {
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
app.post('/api/verify-otp', async (req, res) => {
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
app.post('/api/login', async (req, res) => {
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
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, userId: user._id, name: user.name, email: user.email, preferences: user.preferences, role: user.role });
    } catch (err) {
        console.log(`Login error: ${err.message}`);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Forgot Password
app.post('/api/forgot-password', async (req, res) => {
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
app.post('/api/reset-password', async (req, res) => {
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

// User Data Endpoint (for App.js)
app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({
            name: user.name,
            email: user.email,
            preferences: user.preferences || [],
            role: user.role,
            streak: user.streak || 0,
            badges: user.badges || []
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// New Endpoint to Update User Preferences
app.put('/api/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.preferences = req.body.preferences || user.preferences;
        await user.save();
        res.status(200).json({ message: 'Preferences updated', preferences: user.preferences });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

// Dashboard Endpoint (Interactive Dashboard)
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('progress.courseId');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({
            progress: user.progress || [],
            badges: user.badges || [],
            streak: user.streak || 0,
            goals: user.goals || []
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Personalized Recommendations
app.get('/api/recommendations', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const recommendedCourses = await Course.find({
            category: { $in: user.preferences }
        }).limit(5);
        res.json(recommendedCourses);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// Content Browsing & Search
app.get('/api/courses', async (req, res) => {
    try {
        const { category, keyword } = req.query;
        let query = {};
        if (category) query.category = category;
        if (keyword) query.title = { $regex: keyword, $options: 'i' };
        const courses = await Course.find(query);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// Gamification: Complete a Course
app.post('/api/complete-course', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const progressIndex = user.progress.findIndex(p => p.courseId.toString() === courseId);
        if (progressIndex >= 0) {
            user.progress[progressIndex].completion = 1;
        } else {
            user.progress.push({ courseId, completion: 1 });
        }
        user.streak = (user.streak || 0) + 1;
        if (!user.badges) user.badges = [];
        if (user.streak >= 3 && !user.badges.includes('3-Day Streak')) {
            user.badges.push('3-Day Streak');
        }
        if (user.progress.length >= 5 && !user.badges.includes('5 Courses Completed')) {
            user.badges.push('5 Courses Completed');
        }
        await user.save();
        res.json({ streak: user.streak, badges: user.badges });
    } catch (err) {
        res.status(500).json({ error: 'Failed to complete course' });
    }
});

// User Management (Admin)
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.put('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, email, preferences } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.name = name || user.name;
        user.email = email || user.email;
        user.preferences = preferences || user.preferences;
        await user.save();
        res.json({ message: 'User updated', user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Content Management (Admin)
app.get('/api/admin/courses', authenticateToken, isAdmin, async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

app.post('/api/admin/courses', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { title, youtube, category } = req.body;
        if (!title || !youtube || !category) {
            return res.status(400).json({ error: 'Title, YouTube URL, and category are required' });
        }
        const course = new Course({ title, youtube, category });
        await course.save();
        res.json({ message: 'Course added', course });
    } catch (err) {
        console.log(`Add course error: ${err.message}`);
        res.status(500).json({ error: 'Failed to add course' });
    }
});

app.put('/api/admin/courses/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { title, youtube, category } = req.body;
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        course.title = title || course.title;
        course.youtube = youtube || course.youtube;
        course.category = category || course.category;
        await course.save();
        res.json({ message: 'Course updated', course });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update course' });
    }
});

app.delete('/api/admin/courses/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        await Course.deleteOne({ _id: req.params.id });
        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete course' });
    }
});

// Progress Oversight (Admin)
app.get('/api/admin/progress', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).populate('progress.courseId');
        const progressStats = users.map(user => ({
            email: user.email,
            progress: user.progress || [],
            streak: user.streak || 0,
            badges: user.badges || []
        }));
        res.json(progressStats);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch progress stats' });
    }
});

// Start the Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
import React, { useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import Select from 'react-select';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import ResetPassword from './ResetPassword';
import './App.css';

function App() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState(null);
    const [userName, setUserName] = useState('');
    const [preferences, setPreferences] = useState([]);
    const [userPreferences, setUserPreferences] = useState([]);
    const [isSignup, setIsSignup] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showOTPForm, setShowOTPForm] = useState(false);
    const [otp, setOtp] = useState('');
    const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

    // Predefined preferences (50-60 options)
    const preferenceOptions = [
        { value: 'Web Development', label: 'Web Development' },
        { value: 'Data Science', label: 'Data Science' },
        { value: 'Mobile Development', label: 'Mobile Development' },
        { value: 'Graphic Design', label: 'Graphic Design' },
        { value: 'Cybersecurity', label: 'Cybersecurity' },
        { value: 'Cloud Computing', label: 'Cloud Computing' },
        { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
        { value: 'Machine Learning', label: 'Machine Learning' },
        { value: 'Blockchain', label: 'Blockchain' },
        { value: 'Game Development', label: 'Game Development' },
        { value: 'UI/UX Design', label: 'UI/UX Design' },
        { value: 'Digital Marketing', label: 'Digital Marketing' },
        { value: 'Photography', label: 'Photography' },
        { value: 'Video Editing', label: 'Video Editing' },
        { value: 'Animation', label: 'Animation' },
        { value: '3D Modeling', label: '3D Modeling' },
        { value: 'Software Engineering', label: 'Software Engineering' },
        { value: 'DevOps', label: 'DevOps' },
        { value: 'Database Management', label: 'Database Management' },
        { value: 'Networking', label: 'Networking' },
        { value: 'Ethical Hacking', label: 'Ethical Hacking' },
        { value: 'Python Programming', label: 'Python Programming' },
        { value: 'Java Programming', label: 'Java Programming' },
        { value: 'C++ Programming', label: 'C++ Programming' },
        { value: 'JavaScript Programming', label: 'JavaScript Programming' },
        { value: 'Ruby Programming', label: 'Ruby Programming' },
        { value: 'PHP Programming', label: 'PHP Programming' },
        { value: 'SQL', label: 'SQL' },
        { value: 'NoSQL', label: 'NoSQL' },
        { value: 'Big Data', label: 'Big Data' },
        { value: 'IoT', label: 'IoT' },
        { value: 'Robotics', label: 'Robotics' },
        { value: 'Augmented Reality', label: 'Augmented Reality' },
        { value: 'Virtual Reality', label: 'Virtual Reality' },
        { value: 'App Development', label: 'App Development' },
        { value: 'Web Design', label: 'Web Design' },
        { value: 'SEO', label: 'SEO' },
        { value: 'Content Writing', label: 'Content Writing' },
        { value: 'Copywriting', label: 'Copywriting' },
        { value: 'Social Media Marketing', label: 'Social Media Marketing' },
        { value: 'Email Marketing', label: 'Email Marketing' },
        { value: 'Business Analytics', label: 'Business Analytics' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Accounting', label: 'Accounting' },
        { value: 'Project Management', label: 'Project Management' },
        { value: 'Leadership', label: 'Leadership' },
        { value: 'Entrepreneurship', label: 'Entrepreneurship' },
        { value: 'Public Speaking', label: 'Public Speaking' },
        { value: 'Creative Writing', label: 'Creative Writing' },
        { value: 'Music Production', label: 'Music Production' },
        { value: 'Film Making', label: 'Film Making' },
        { value: 'Cooking', label: 'Cooking' },
        { value: 'Fitness', label: 'Fitness' },
        { value: 'Yoga', label: 'Yoga' },
        { value: 'Meditation', label: 'Meditation' },
        { value: 'Language Learning', label: 'Language Learning' },
        { value: 'History', label: 'History' },
        { value: 'Psychology', label: 'Psychology' },
        { value: 'Philosophy', label: 'Philosophy' },
    ];

    const signup = async (e) => {
        e.preventDefault();
        try {
            const selectedPreferences = preferences.map(p => p.value);
            const res = await axios.post(`${backendUrl}/signup`, { name, email, password, preferences: selectedPreferences });
            setMessage(res.data.message);
            setShowOTPForm(true);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Signup failed');
        }
    };

    const verifyOTP = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${backendUrl}/verify-otp`, { email, otp });
            setMessage(res.data.message);
            setShowOTPForm(false);
            setIsSignup(false);
        } catch (err) {
            setMessage(err.response?.data?.error || 'OTP verification failed');
        }
    };

    const login = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${backendUrl}/login`, { email, password });
            setToken(res.data.token);
            setUserName(res.data.name);
            setUserPreferences(res.data.preferences);
            setMessage('Logged in!');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Login failed');
        }
    };

    const forgotPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${backendUrl}/forgot-password`, { email: forgotEmail });
            setMessage(res.data.message);
            setShowForgotPasswordForm(false);
            setForgotEmail('');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Reset failed');
        }
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        !token ? (
                            <div className="container">
                                <div className="auth-card">
                                    <div className="logo">
                                        <img src="/logo.png" alt="SkillVoyage Logo" className="logo-image" />
                                        SkillVoyage
                                    </div>
                                    {showOTPForm ? (
                                        <>
                                            <h2>Verify OTP</h2>
                                            {message && <p className="message">{message}</p>}
                                            <form onSubmit={verifyOTP}>
                                                <div className="input-group">
                                                    <FaEnvelope className="input-icon" />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="Email"
                                                        required
                                                        disabled
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <FaLock className="input-icon" />
                                                    <input
                                                        type="text"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        placeholder="Enter OTP"
                                                        required
                                                    />
                                                </div>
                                                <button type="submit">Verify OTP</button>
                                            </form>
                                        </>
                                    ) : showForgotPasswordForm ? (
                                        <>
                                            <h2>Forgot Password</h2>
                                            {message && <p className="message">{message}</p>}
                                            <form onSubmit={forgotPassword}>
                                                <div className="input-group">
                                                    <FaEnvelope className="input-icon" />
                                                    <input
                                                        type="email"
                                                        value={forgotEmail}
                                                        onChange={(e) => setForgotEmail(e.target.value)}
                                                        placeholder="Enter your email"
                                                        required
                                                    />
                                                </div>
                                                <button type="submit">Send Reset Link</button>
                                            </form>
                                            <p
                                                className="switch-link"
                                                onClick={() => {
                                                    setShowForgotPasswordForm(false);
                                                    setMessage('');
                                                }}
                                            >
                                                Back to Login
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
                                            {message && <p className="message">{message}</p>}
                                            <form onSubmit={isSignup ? signup : login}>
                                                {isSignup && (
                                                    <div className="input-group">
                                                        <FaUser className="input-icon" />
                                                        <input
                                                            type="text"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            placeholder="Full Name"
                                                            required
                                                        />
                                                    </div>
                                                )}
                                                <div className="input-group">
                                                    <FaEnvelope className="input-icon" />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="Email"
                                                        required
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <FaLock className="input-icon" />
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="Password"
                                                        required
                                                    />
                                                    <span
                                                        className="eye-icon"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                    </span>
                                                </div>
                                                {isSignup && (
                                                    <div className="preferences-group">
                                                        <label>Select Your Preferences:</label>
                                                        <Select
                                                            isMulti
                                                            options={preferenceOptions}
                                                            value={preferences}
                                                            onChange={setPreferences}
                                                            placeholder="Type to search preferences..."
                                                            className="preferences-select"
                                                            classNamePrefix="select"
                                                        />
                                                    </div>
                                                )}
                                                <button type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
                                            </form>
                                            {!isSignup && (
                                                <button
                                                    className="forgot-button"
                                                    onClick={() => {
                                                        setShowForgotPasswordForm(true);
                                                        setMessage('');
                                                    }}
                                                >
                                                    Forgot Password?
                                                </button>
                                            )}
                                            <p
                                                className="switch-link"
                                                onClick={() => {
                                                    setIsSignup(!isSignup);
                                                    setMessage('');
                                                    setShowOTPForm(false);
                                                }}
                                            >
                                                {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <Dashboard name={userName} preferences={userPreferences} />
                        )
                    }
                />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
        </Router>
    );
}

export default App;
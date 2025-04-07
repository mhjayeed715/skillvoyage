import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import Select from 'react-select';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

    // Checking for existing token on app load
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    // Predefined preferences
    const preferenceOptions = [
        { value: 'Web Development', label: 'Web Development' },
        { value: 'Data Science', label: 'Data Science' },
        { value: 'Machine Learning', label: 'Machine Learning' },
        { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
        { value: 'Cybersecurity', label: 'Cybersecurity' },
        { value: 'Cloud Computing', label: 'Cloud Computing' },
        { value: 'DevOps', label: 'DevOps' },
        { value: 'Mobile Development', label: 'Mobile Development' },
        { value: 'Game Development', label: 'Game Development' },
        { value: 'Blockchain', label: 'Blockchain' },
        { value: 'UI/UX Design', label: 'UI/UX Design' },
        { value: 'Graphic Design', label: 'Graphic Design' },
        { value: 'Digital Marketing', label: 'Digital Marketing' },
        { value: 'SEO', label: 'SEO' },
        { value: 'Content Writing', label: 'Content Writing' },
        { value: 'Video Editing', label: 'Video Editing' },
        { value: 'Photography', label: 'Photography' },
        { value: '3D Modeling', label: '3D Modeling' },
        { value: 'Animation', label: 'Animation' },
        { value: 'Software Engineering', label: 'Software Engineering' },
        { value: 'Database Management', label: 'Database Management' },
        { value: 'Network Administration', label: 'Network Administration' },
        { value: 'System Administration', label: 'System Administration' },
        { value: 'Project Management', label: 'Project Management' },
        { value: 'Product Management', label: 'Product Management' },
        { value: 'Business Analysis', label: 'Business Analysis' },
        { value: 'Data Analysis', label: 'Data Analysis' },
        { value: 'Data Visualization', label: 'Data Visualization' },
        { value: 'Statistics', label: 'Statistics' },
        { value: 'Mathematics', label: 'Mathematics' },
        { value: 'Physics', label: 'Physics' },
        { value: 'Chemistry', label: 'Chemistry' },
        { value: 'Biology', label: 'Biology' },
        { value: 'Environmental Science', label: 'Environmental Science' },
        { value: 'Economics', label: 'Economics' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Accounting', label: 'Accounting' },
        { value: 'Human Resources', label: 'Human Resources' },
        { value: 'Public Speaking', label: 'Public Speaking' },
        { value: 'Leadership', label: 'Leadership' },
        { value: 'Time Management', label: 'Time Management' },
        { value: 'Critical Thinking', label: 'Critical Thinking' },
        { value: 'Problem Solving', label: 'Problem Solving' },
        { value: 'Teamwork', label: 'Teamwork' },
        { value: 'Communication Skills', label: 'Communication Skills' },
        { value: 'Creative Writing', label: 'Creative Writing' },
        { value: 'Journalism', label: 'Journalism' },
        { value: 'Translation', label: 'Translation' },
        { value: 'Foreign Languages', label: 'Foreign Languages' },
        { value: 'Psychology', label: 'Psychology' },
        { value: 'Sociology', label: 'Sociology' },
        { value: 'History', label: 'History' },
        { value: 'Philosophy', label: 'Philosophy' },
        { value: 'Music Production', label: 'Music Production' },
        { value: 'Sound Design', label: 'Sound Design' },
        { value: 'Fashion Design', label: 'Fashion Design' },
        { value: 'Interior Design', label: 'Interior Design' },
        { value: 'Cooking', label: 'Cooking' },
        { value: 'Gardening', label: 'Gardening' },
        { value: 'Fitness Training', label: 'Fitness Training' }
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
            localStorage.setItem('token', res.data.token);
            setUserName(res.data.name);
            setUserPreferences(res.data.preferences);
            setMessage('Logged in!');
            navigate('/dashboard');
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
                <Route path="/dashboard" element={<Dashboard name={userName} preferences={userPreferences} />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
        </Router>
    );
}

export default App;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import Select from 'react-select';
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ResetPassword from './pages/ResetPassword';
import AdminPanel from './pages/AdminPanel';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import './App.css';

class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong. Please try again later.</h1>;
        }
        return this.props.children;
    }
}

function AppContent() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [preferences, setPreferences] = useState([]);
    const [userPreferences, setUserPreferences] = useState([]);
    const [role, setRole] = useState('user');
    const [isSignup, setIsSignup] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showOTPForm, setShowOTPForm] = useState(false);
    const [otp, setOtp] = useState('');
    const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    console.log('Backend URL:', backendUrl);
    console.log('Initial Token:', token);

    useEffect(() => {
        console.log('useEffect triggered');
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setIsLoading(true);
            console.log('Fetching user data with token:', storedToken);
            axios
                .get(`${backendUrl}/api/user`, {
                    headers: { Authorization: `Bearer ${storedToken}` },
                })
                .then((res) => {
                    console.log('User Data:', res.data);
                    setUserName(res.data.name || '');
                    setUserEmail(res.data.email || '');
                    setUserPreferences(res.data.preferences || []);
                    setRole(res.data.role || 'user');
                    setToken(storedToken);
                })
                .catch((err) => {
                    console.error('User fetch error:', err.message);
                    if (err.response) {
                        console.error('Response data:', err.response.data);
                        console.error('Response status:', err.response.status);
                    }
                    localStorage.removeItem('token');
                    setToken(null);
                    setUserName('');
                    setUserEmail('');
                    setUserPreferences([]);
                    setRole('user');
                })
                .finally(() => {
                    setIsLoading(false);
                    console.log('Loading finished');
                });
        } else {
            setIsLoading(false);
            console.log('No token found, loading finished');
        }
    }, [backendUrl]);

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
        { value: 'Fitness Training', label: 'Fitness Training' },
    ];

    const signup = async (e) => {
        e.preventDefault();
        console.log('Signup initiated', { name, email, password, preferences });
        try {
            const selectedPreferences = preferences.map((p) => p.value);
            const res = await axios.post(`${backendUrl}/api/signup`, {
                name,
                email,
                password,
                preferences: selectedPreferences,
            });
            setMessage(res.data.message);
            setMessageType('success');
            setShowOTPForm(true);
            console.log('Signup success:', res.data);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Signup failed');
            setMessageType('error');
            console.error('Signup error:', err.message);
        }
    };

    const login = async (e) => {
        e.preventDefault();
        console.log('Login initiated', { email, password });
        try {
            const res = await axios.post(`${backendUrl}/api/login`, { email, password });
            const newToken = res.data.token;
            setToken(newToken);
            localStorage.setItem('token', newToken);
            setUserName(res.data.name || '');
            setUserEmail(res.data.email || '');
            setUserPreferences(res.data.preferences || []);
            setRole(res.data.role || 'user');
            setMessage('Logged in!');
            setMessageType('success');
            console.log('Login success:', res.data);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Login failed');
            setMessageType('error');
            console.error('Login error:', err.message);
        }
    };

    const forgotPassword = async (e) => {
        e.preventDefault();
        console.log('Forgot password initiated', { forgotEmail });
        try {
            const res = await axios.post(`${backendUrl}/api/forgot-password`, { email: forgotEmail });
            setMessage(res.data.message);
            setMessageType('success');
            setShowForgotPasswordForm(false);
            setForgotEmail('');
            console.log('Forgot password success:', res.data);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Reset failed');
            setMessageType('error');
            console.error('Forgot password error:', err.message);
        }
    };

    const verifyOTP = async (e) => {
        e.preventDefault();
        console.log('Verify OTP initiated', { email, otp });
        try {
            const res = await axios.post(`${backendUrl}/api/verify-otp`, { email, otp });
            setMessage(res.data.message);
            setMessageType('success');
            setShowOTPForm(false);
            setIsSignup(false);
            console.log('OTP verification success:', res.data);
        } catch (err) {
            setMessage(err.response?.data?.error || 'OTP verification failed');
            setMessageType('error');
            console.error('OTP verification error:', err.message);
        }
    };

    console.log('Rendering AppContent, isLoading:', isLoading, 'token:', token);

    if (isLoading) return <div className="container"><div className="auth-card">Loading...</div></div>;

    return (
        <ErrorBoundary>
            {token ? (
                <div className="dashboard-container">
                    <Navbar role={role} email={userEmail} setToken={setToken} />
                    <div className="dashboard-content">
                        <Routes>
                            <Route path="/dashboard" element={<Dashboard name={userName} preferences={userPreferences} />} />
                            <Route path="/courses" element={<Courses />} />
                            <Route path="/profile" element={<Profile name={userName} email={userEmail} preferences={userPreferences} />} />
                            <Route path="/settings" element={<Settings preferences={userPreferences} setUserPreferences={setUserPreferences} />} />
                            <Route path="/admin" element={role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" replace />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </div>
                </div>
            ) : (
                <div className="container">
                    <div className="auth-card">
                        <div className="logo">
                            <img
                                src="/logo.png"
                                alt="SkillVoyage Logo"
                                className="logo-image"
                                onError={(e) => (e.target.style.display = 'none')}
                            />
                            SkillVoyage
                        </div>
                        {showOTPForm ? (
                            <>
                                <h2>Verify OTP</h2>
                                {message && <p className={`message ${messageType}`}>{message}</p>}
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
                                {message && <p className={`message ${messageType}`}>{message}</p>}
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
                                        setMessageType('');
                                    }}
                                >
                                    Back to Login
                                </p>
                            </>
                        ) : (
                            <>
                                <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
                                {message && <p className={`message ${messageType}`}>{message}</p>}
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
                                    <div className="password-group"> {/* Changed to password-group */}
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
                                            setMessageType('');
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
                                        setMessageType('');
                                        setShowOTPForm(false);
                                    }}
                                >
                                    {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </ErrorBoundary>
    );
}

function App() {
    console.log('Rendering App component');
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
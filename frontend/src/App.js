import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import Select from 'react-select';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ResetPassword from './pages/ResetPassword';
import AdminPanel from './pages/AdminPanel';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Homepage from './pages/Homepage';
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
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
                        <p className="text-gray-600">Please refresh the page and try again.</p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
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

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setIsLoading(true);
            axios
                .get(`${backendUrl}/api/user`, {
                    headers: { Authorization: `Bearer ${storedToken}` },
                })
                .then((res) => {
                    setUserName(res.data.name || '');
                    setUserEmail(res.data.email || '');
                    setUserPreferences(res.data.preferences || []);
                    setRole(res.data.role || 'user');
                    setToken(storedToken);
                })
                .catch((err) => {
                    console.error('User fetch error:', err.message);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUserName('');
                    setUserEmail('');
                    setUserPreferences([]);
                    setRole('user');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [backendUrl]);

    
useEffect(() => {
  
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}, []);

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
        } catch (err) {
            setMessage(err.response?.data?.error || 'Signup failed');
            setMessageType('error');
        }
    };

    const login = async (e) => {
        e.preventDefault();
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
        } catch (err) {
            setMessage(err.response?.data?.error || 'Login failed');
            setMessageType('error');
        }
    };

    const forgotPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${backendUrl}/api/forgot-password`, { email: forgotEmail });
            setMessage(res.data.message);
            setMessageType('success');
            setShowForgotPasswordForm(false);
            setForgotEmail('');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Reset failed');
            setMessageType('error');
        }
    };

    const verifyOTP = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${backendUrl}/api/verify-otp`, { email, otp });
            setMessage(res.data.message);
            setMessageType('success');
            setShowOTPForm(false);
            setIsSignup(false);
        } catch (err) {
            setMessage(err.response?.data?.error || 'OTP verification failed');
            setMessageType('error');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading SkillVoyage...</p>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={!token ? <Homepage /> : <Navigate to="/dashboard" replace />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Auth Routes */}
                <Route path="/signup" element={
                    !token ? (
                        <div className="auth-container min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
                            <div className="auth-card card-modern max-w-md w-full">
                                <div className="logo flex items-center justify-center mb-8">
                                    <img
                                        src="/logo.png"
                                        alt="SkillVoyage Logo"
                                        className="logo-image w-10 h-10 mr-3"
                                        onError={(e) => (e.target.style.display = 'none')}
                                    />
                                    <span className="text-gradient font-bold text-2xl">SkillVoyage</span>
                                </div>
                                {showOTPForm ? (
                                    <>
                                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Verify Your Account</h2>
                                        {message && <p className={`message ${messageType} p-3 rounded-lg mb-4 text-center ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</p>}
                                        <form onSubmit={verifyOTP} className="space-y-4">
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    placeholder="Enter 6-digit OTP"
                                                    required
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                                                    maxLength="6"
                                                />
                                            </div>
                                            <button type="submit" className="btn-primary w-full">Verify Account</button>
                                        </form>
                                    </>
                                ) : showForgotPasswordForm ? (
                                    <>
                                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Reset Password</h2>
                                        {message && <p className={`message ${messageType} p-3 rounded-lg mb-4 text-center ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</p>}
                                        <form onSubmit={forgotPassword} className="space-y-4">
                                            <div className="input-group relative">
                                                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={forgotEmail}
                                                    onChange={(e) => setForgotEmail(e.target.value)}
                                                    placeholder="Enter your email"
                                                    required
                                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <button type="submit" className="btn-primary w-full">Send Reset Link</button>
                                            <button
                                                type="button"
                                                onClick={() => setShowForgotPasswordForm(false)}
                                                className="btn-outline w-full"
                                            >
                                                Back to Sign Up
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                                            {isSignup ? 'Join SkillVoyage' : 'Welcome Back'}
                                        </h2>
                                        {message && <p className={`message ${messageType} p-3 rounded-lg mb-4 text-center ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</p>}
                                        <form onSubmit={isSignup ? signup : login} className="space-y-4">
                                            {isSignup && (
                                                <div className="input-group relative">
                                                    <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        placeholder="Full Name"
                                                        required
                                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            )}
                                            <div className="input-group relative">
                                                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="Email Address"
                                                    required
                                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="password-group relative">
                                                <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Password"
                                                    required
                                                    className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            <span
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-3.5 cursor-pointer text-gray-400 hover:text-gray-600"
                                                 >
                                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                                            </span>
                                            </div>

                                            {isSignup && (
                                                <div className="preferences-group">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Learning Preferences <span className="text-gray-500">(Optional)</span>
                                                    </label>
                                                    <Select
                                                        isMulti
                                                        options={preferenceOptions}
                                                        value={preferences}
                                                        onChange={setPreferences}
                                                        placeholder="Select your interests..."
                                                        className="preferences-select"
                                                        styles={{
                                                            control: (base) => ({
                                                                ...base,
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '0.5rem',
                                                                padding: '2px',
                                                                '&:hover': { borderColor: '#2563eb' },
                                                                '&:focus-within': { 
                                                                    borderColor: '#2563eb',
                                                                    boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)'
                                                                }
                                                            })
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <button type="submit" className="btn-primary w-full text-lg py-3">
                                                {isSignup ? 'Create Account' : 'Sign In'}
                                            </button>
                                            {!isSignup && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowForgotPasswordForm(true)}
                                                    className="w-full text-blue-600 hover:text-blue-800 text-sm mt-3 transition-colors"
                                                >
                                                    Forgot your password?
                                                </button>
                                            )}
                                        </form>
                                        <div className="text-center mt-6 pt-6 border-t border-gray-200">
                                            <p className="text-gray-600">
                                                {isSignup ? 'Already have an account?' : "Don't have an account?"}
                                            </p>
                                            <button
                                                onClick={() => setIsSignup(!isSignup)}
                                                className="text-blue-600 hover:text-blue-800 font-medium mt-1 transition-colors"
                                            >
                                                {isSignup ? 'Sign In' : 'Create Account'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Navigate to="/dashboard" replace />
                    )
                } />
                
                <Route path="/login" element={
                    !token ? <Navigate to="/signup" replace /> : <Navigate to="/dashboard" replace />
                } />

                {/* Protected Routes */}
                {token && (
                    <>
                        <Route path="/dashboard" element={
                            <div className="app-layout">
                                <Navbar role={role} email={userEmail} setToken={setToken} />
                                <main className="main-content">
                                    <Dashboard name={userName} preferences={userPreferences} />
                                </main>
                            </div>
                        } />
                        <Route path="/courses" element={
                            <div className="app-layout">
                                <Navbar role={role} email={userEmail} setToken={setToken} />
                                <main className="main-content">
                                    <Courses />
                                </main>
                            </div>
                        } />
                        <Route path="/profile" element={
                            <div className="app-layout">
                                <Navbar role={role} email={userEmail} setToken={setToken} />
                                <main className="main-content">
                                    <Profile name={userName} email={userEmail} preferences={userPreferences} />
                                </main>
                            </div>
                        } />
                        <Route path="/settings" element={
                            <div className="app-layout">
                                <Navbar role={role} email={userEmail} setToken={setToken} />
                                <main className="main-content">
                                    <Settings preferences={userPreferences} setUserPreferences={setUserPreferences} />
                                </main>
                            </div>
                        } />
                        {role === 'admin' && (
                            <Route path="/admin" element={
                                <div className="app-layout">
                                    <Navbar role={role} email={userEmail} setToken={setToken} />
                                    <main className="main-content">
                                        <AdminPanel />
                                    </main>
                                </div>
                            } />
                        )}
                    </>
                )}

                {/* Fallback Routes */}
                <Route path="*" element={
                    token ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
                } />
            </Routes>
        </ErrorBoundary>
    );
}

export default App;
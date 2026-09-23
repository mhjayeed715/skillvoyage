import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaRocket, FaShieldAlt, FaTrophy, FaBrain } from 'react-icons/fa';
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
import { getBackendUrl } from './utils/apiConfig';
import './App.css';

/* ---------- Error Boundary ---------- */
class ErrorBoundary extends React.Component {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error, info) { console.error('ErrorBoundary:', error, info); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="loading-screen">
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                        <h2 style={{ color: 'var(--white)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Something went wrong</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Please refresh the page and try again.</p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

/* ---------- React-Select light theme styles ---------- */
const selectStyles = {
    control: (base, state) => ({
        ...base,
        background: 'var(--bg-surface)',
        border: `1.5px solid ${state.isFocused ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: state.isFocused ? '0 0 0 3px var(--accent-soft)' : 'none',
        padding: '2px 6px',
        minHeight: '46px',
        '&:hover': { borderColor: 'var(--accent)' },
    }),
    menu: (base) => ({
        ...base,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        zIndex: 50,
    }),
    option: (base, state) => ({
        ...base,
        background: state.isSelected ? 'var(--accent)' : state.isFocused ? 'var(--accent-soft)' : 'transparent',
        color: state.isSelected ? '#ffffff' : 'var(--text-primary)',
        fontSize: '0.9rem',
        cursor: 'pointer',
    }),
    multiValue: (base) => ({
        ...base,
        background: 'var(--accent-soft)',
        borderRadius: '6px',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: 'var(--accent)',
        fontWeight: 600,
        fontSize: '0.85rem',
        padding: '3px 6px',
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: 'var(--accent)',
        ':hover': { background: '#fee2e2', color: '#dc2626' },
    }),
    placeholder: (base) => ({ ...base, color: 'var(--text-muted)', fontSize: '0.9rem' }),
    singleValue: (base) => ({ ...base, color: 'var(--text-primary)', fontWeight: 500 }),
    input: (base) => ({ ...base, color: 'var(--text-primary)' }),
};

/* ---------- Preference options ---------- */
const preferenceOptions = [
    'Web Development','Data Science','Machine Learning','Artificial Intelligence',
    'Cybersecurity','Cloud Computing','DevOps','Mobile Development',
    'Game Development','Blockchain','UI/UX Design','Graphic Design',
    'Digital Marketing','SEO','Content Writing','Video Editing',
    'Photography','3D Modeling','Animation','Software Engineering',
    'Database Management','Network Administration','System Administration',
    'Project Management','Product Management','Business Analysis',
    'Data Analysis','Data Visualization','Statistics','Mathematics',
    'Physics','Chemistry','Biology','Environmental Science',
    'Economics','Finance','Accounting','Human Resources',
    'Public Speaking','Leadership','Time Management','Critical Thinking',
    'Problem Solving','Teamwork','Communication Skills','Creative Writing',
    'Journalism','Translation','Foreign Languages','Psychology',
    'Sociology','History','Philosophy','Music Production',
    'Sound Design','Fashion Design','Interior Design','Cooking',
    'Gardening','Fitness Training',
].map((v) => ({ value: v, label: v }));

/* ---------- Auth brand features ---------- */
const brandFeatures = [
    { icon: <FaBrain />, text: 'AI-powered course recommendations' },
    { icon: <FaTrophy />, text: 'Gamified streaks and badges' },
    { icon: <FaShieldAlt />, text: 'Secure, verified accounts' },
    { icon: <FaRocket />, text: 'Learn at your own pace' },
];

/* ========================================
   LOGIN PAGE
   ======================================== */
function LoginPage({ onLoginSuccess, backendUrl }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const login = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        try {
            const res = await axios.post(`${backendUrl}/api/login`, { email, password });
            onLoginSuccess(res.data);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Login failed. Please check your credentials.');
            setMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const forgotPassword = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await axios.post(`${backendUrl}/api/forgot-password`, { email: forgotEmail });
            setMessage(res.data.message);
            setMessageType('success');
            setShowForgot(false);
            setForgotEmail('');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to send reset email.');
            setMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Brand Panel */}
            <div className="auth-brand-panel">
                <div className="auth-brand-logo">
                    <img src="/logo.png" alt="SkillVoyage" onError={(e) => e.target.style.display='none'} />
                    <span>SkillVoyage</span>
                </div>
                <h2 className="auth-brand-heading">
                    Welcome Back, <span>Voyager</span>
                </h2>
                <p className="auth-brand-sub">
                    Continue your learning journey. Your progress, streaks, and achievements are waiting for you.
                </p>
                <div className="auth-feature-list">
                    {brandFeatures.map((f, i) => (
                        <div className="auth-feature-item" key={i}>
                            <div className="auth-feature-icon">{f.icon}</div>
                            <span className="auth-feature-text">{f.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Panel */}
            <div className="auth-form-panel">
                <div className="auth-card">
                    <div className="auth-card-logo">
                        <img src="/logo.png" alt="SV" onError={(e) => e.target.style.display='none'} />
                        <span>SkillVoyage</span>
                    </div>

                    {showForgot ? (
                        <>
                            <h1 className="auth-title">Reset Password</h1>
                            <p className="auth-subtitle">Enter your email and we'll send a reset link.</p>
                            {message && <div className={`alert alert-${messageType}`}>{message}</div>}
                            <form onSubmit={forgotPassword}>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <div className="form-input-wrap">
                                        <FaEnvelope className="form-input-icon" />
                                        <input
                                            id="forgot-email"
                                            type="email"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                                </button>
                                <button type="button" onClick={() => setShowForgot(false)} className="btn-ghost" style={{width:'100%', marginTop:'4px'}}>
                                    Back to Login
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h1 className="auth-title">Sign In</h1>
                            <p className="auth-subtitle">Welcome back! Enter your details to continue.</p>
                            {message && <div className={`alert alert-${messageType}`}>{message}</div>}
                            <form onSubmit={login}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="login-email">Email Address</label>
                                    <div className="form-input-wrap">
                                        <FaEnvelope className="form-input-icon" />
                                        <input
                                            id="login-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="login-password">Password</label>
                                    <div className="form-input-wrap">
                                        <FaLock className="form-input-icon" />
                                        <input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Your password"
                                            required
                                            className="form-input"
                                        />
                                        <button
                                            type="button"
                                            className="form-input-right"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                                        </button>
                                    </div>
                                </div>
                                <button type="button" className="forgot-link" onClick={() => setShowForgot(true)}>
                                    Forgot your password?
                                </button>
                                <div style={{ marginTop: '20px' }}>
                                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                        <FaRocket />
                                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                                    </button>
                                </div>
                            </form>
                            <div className="auth-toggle">
                                <p>Don't have an account?</p>
                                <button className="auth-toggle-btn" onClick={() => navigate('/signup')}>
                                    Create Account
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ========================================
   SIGNUP PAGE
   ======================================== */
function SignupPage({ backendUrl }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [preferences, setPreferences] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showOTPForm, setShowOTPForm] = useState(false);
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const signup = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        try {
            const res = await axios.post(`${backendUrl}/api/signup`, {
                name,
                email,
                password,
                preferences: preferences.map((p) => p.value),
            });
            setMessage(res.data.message);
            setMessageType('success');
            setShowOTPForm(true);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Signup failed. Please try again.');
            setMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const verifyOTP = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        try {
            const res = await axios.post(`${backendUrl}/api/verify-otp`, { email, otp });
            setMessage(res.data.message + ' — Redirecting to login...');
            setMessageType('success');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setMessage(err.response?.data?.error || 'OTP verification failed.');
            setMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Brand Panel */}
            <div className="auth-brand-panel">
                <div className="auth-brand-logo">
                    <img src="/logo.png" alt="SkillVoyage" onError={(e) => e.target.style.display='none'} />
                    <span>SkillVoyage</span>
                </div>
                <h2 className="auth-brand-heading">
                    Start Your <span>Learning Voyage</span>
                </h2>
                <p className="auth-brand-sub">
                    Join thousands of learners who are advancing their careers with AI-powered, personalized education.
                </p>
                <div className="auth-feature-list">
                    {brandFeatures.map((f, i) => (
                        <div className="auth-feature-item" key={i}>
                            <div className="auth-feature-icon">{f.icon}</div>
                            <span className="auth-feature-text">{f.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Panel */}
            <div className="auth-form-panel">
                <div className="auth-card">
                    <div className="auth-card-logo">
                        <img src="/logo.png" alt="SV" onError={(e) => e.target.style.display='none'} />
                        <span>SkillVoyage</span>
                    </div>

                    {showOTPForm ? (
                        <>
                            <h1 className="auth-title">Verify Your Email</h1>
                            <p className="auth-subtitle">We sent a 6-digit OTP to <strong style={{color:'var(--indigo-400)'}}>{email}</strong></p>
                            {message && <div className={`alert alert-${messageType}`}>{message}</div>}
                            <form onSubmit={verifyOTP}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="otp-input">Enter OTP</label>
                                    <input
                                        id="otp-input"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="• • • • • •"
                                        required
                                        maxLength="6"
                                        className="form-input otp-input"
                                        style={{ paddingLeft: '16px' }}
                                    />
                                </div>
                                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Verifying...' : 'Verify Account'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    style={{ width: '100%', marginTop: '4px' }}
                                    onClick={() => { setShowOTPForm(false); setMessage(''); }}
                                >
                                    Back to Signup
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h1 className="auth-title">Create Account</h1>
                            <p className="auth-subtitle">Join SkillVoyage and start learning smarter.</p>
                            {message && <div className={`alert alert-${messageType}`}>{message}</div>}
                            <form onSubmit={signup}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="signup-name">Full Name</label>
                                    <div className="form-input-wrap">
                                        <FaUser className="form-input-icon" />
                                        <input
                                            id="signup-name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your full name"
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="signup-email">Email Address</label>
                                    <div className="form-input-wrap">
                                        <FaEnvelope className="form-input-icon" />
                                        <input
                                            id="signup-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="signup-password">Password</label>
                                    <div className="form-input-wrap">
                                        <FaLock className="form-input-icon" />
                                        <input
                                            id="signup-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min. 8 characters"
                                            required
                                            minLength={8}
                                            className="form-input"
                                        />
                                        <button
                                            type="button"
                                            className="form-input-right"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="pref-label">Learning Interests <span style={{color:'var(--text-secondary)',fontWeight:400}}>(optional)</span></label>
                                    <Select
                                        isMulti
                                        options={preferenceOptions}
                                        value={preferences}
                                        onChange={setPreferences}
                                        placeholder="Select topics you want to learn..."
                                        styles={selectStyles}
                                        classNamePrefix="sv-select"
                                    />
                                </div>
                                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                    <FaRocket />
                                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>
                            <div className="auth-toggle">
                                <p>Already have an account?</p>
                                <button className="auth-toggle-btn" onClick={() => navigate('/login')}>
                                    Sign In
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ========================================
   MAIN APP
   ======================================== */
function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPreferences, setUserPreferences] = useState([]);
    const [role, setRole] = useState('user');
    const [isLoading, setIsLoading] = useState(true);

    const backendUrl = getBackendUrl();

    // Apply theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    // Restore session
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            axios
                .get(`${backendUrl}/api/user`, { headers: { Authorization: `Bearer ${storedToken}` } })
                .then((res) => {
                    setUserName(res.data.name || '');
                    setUserEmail(res.data.email || '');
                    setUserPreferences(res.data.preferences || []);
                    setRole(res.data.role || 'user');
                    setToken(storedToken);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setToken(null);
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [backendUrl]);

    const handleLoginSuccess = (data) => {
        const newToken = data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUserName(data.name || '');
        setUserEmail(data.email || '');
        setUserPreferences(data.preferences || []);
        setRole(data.role || 'user');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUserName('');
        setUserEmail('');
        setUserPreferences([]);
        setRole('user');
    };

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <span className="loading-text">Loading SkillVoyage...</span>
            </div>
        );
    }

    const ProtectedLayout = ({ children }) => (
        <div className="app-layout">
            <Navbar role={role} email={userEmail} setToken={(t) => { if (!t) handleLogout(); else setToken(t); }} />
            <main className="main-content">{children}</main>
        </div>
    );

    return (
        <ErrorBoundary>
            <Routes>
                {/* Public */}
                <Route path="/" element={!token ? <Homepage /> : <Navigate to="/dashboard" replace />} />
                <Route path="/login"  element={!token ? <LoginPage onLoginSuccess={handleLoginSuccess} backendUrl={backendUrl} /> : <Navigate to="/dashboard" replace />} />
                <Route path="/signup" element={!token ? <SignupPage backendUrl={backendUrl} /> : <Navigate to="/dashboard" replace />} />
                <Route path="/reset-password" element={<ResetPassword backendUrl={backendUrl} />} />

                {/* Protected */}
                {token && (
                    <>
                        <Route path="/dashboard" element={<ProtectedLayout><Dashboard name={userName} preferences={userPreferences} /></ProtectedLayout>} />
                        <Route path="/courses"   element={<ProtectedLayout><Courses /></ProtectedLayout>} />
                        <Route path="/profile"   element={<ProtectedLayout><Profile name={userName} email={userEmail} preferences={userPreferences} /></ProtectedLayout>} />
                        <Route path="/settings"  element={<ProtectedLayout><Settings preferences={userPreferences} setUserPreferences={setUserPreferences} /></ProtectedLayout>} />
                        {role === 'admin' && (
                            <Route path="/admin" element={<ProtectedLayout><AdminPanel /></ProtectedLayout>} />
                        )}
                    </>
                )}

                {/* Fallback */}
                <Route path="*" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />} />
            </Routes>
        </ErrorBoundary>
    );
}

export default App;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { getBackendUrl } from '../utils/apiConfig';
import './ResetPassword.css';

function ResetPassword({ backendUrl }) {
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const navigate = useNavigate();

    const apiBase = backendUrl || getBackendUrl();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match.');
            setMessageType('error');
            return;
        }
        if (newPassword.length < 8) {
            setMessage('Password must be at least 8 characters.');
            setMessageType('error');
            return;
        }
        const query = new URLSearchParams(window.location.search);
        const token = query.get('token');
        if (!token) {
            setMessage('Invalid or missing reset token. Please request a new link.');
            setMessageType('error');
            return;
        }

        setIsSubmitting(true);
        setMessage('');
        try {
            const res = await fetch(`${apiBase}/api/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword, confirmPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setDone(true);
                setMessage('Password reset successful! Redirecting to login...');
                setMessageType('success');
                setTimeout(() => navigate('/login'), 2500);
            } else {
                setMessage(data.error || 'Reset failed. The link may have expired.');
                setMessageType('error');
            }
        } catch {
            setMessage('Network error. Please check your connection and try again.');
            setMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="reset-page">
            <div className="reset-glow" aria-hidden="true" />
            <div className="reset-card">
                <div className="reset-brand">
                    <img
                        src="/logo.png"
                        alt="SkillVoyage"
                        className="reset-logo"
                        onError={(e) => (e.target.style.display = 'none')}
                    />
                    <span className="reset-brand-name">SkillVoyage</span>
                </div>

                {done ? (
                    <div className="reset-success">
                        <div className="reset-success-icon">
                            <FaCheckCircle aria-hidden="true" />
                        </div>
                        <h1 className="reset-title">Password Reset!</h1>
                        <p className="reset-desc">{message}</p>
                    </div>
                ) : (
                    <>
                        <h1 className="reset-title">Set New Password</h1>
                        <p className="reset-desc">Enter and confirm your new password below.</p>

                        {message && (
                            <div className={`alert alert-${messageType}`} role="alert">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="reset-field">
                                <label className="reset-label" htmlFor="new-password">New Password</label>
                                <div className="reset-input-wrap">
                                    <FaLock className="reset-input-icon" aria-hidden="true" />
                                    <input
                                        id="new-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        required
                                        minLength={8}
                                        className="reset-input"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="reset-eye"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                                    </button>
                                </div>
                            </div>

                            <div className="reset-field">
                                <label className="reset-label" htmlFor="confirm-password">Confirm Password</label>
                                <div className="reset-input-wrap">
                                    <FaLock className="reset-input-icon" aria-hidden="true" />
                                    <input
                                        id="confirm-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter password"
                                        required
                                        className="reset-input"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="reset-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>

                        <button
                            type="button"
                            className="reset-back"
                            onClick={() => navigate('/login')}
                        >
                            Back to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;
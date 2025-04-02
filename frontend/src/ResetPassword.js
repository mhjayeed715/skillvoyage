import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Added Link for navigation
import './ResetPassword.css';

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [token, setToken] = useState('');

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

    useEffect(() => {
        // Extract token from URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const resetToken = urlParams.get('token');
        if (resetToken) {
            setToken(resetToken);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${backendUrl}/reset-password/${token}`, { newPassword });
            setMessage(res.data.message);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Password reset failed');
        }
    };

    return (
        <div className="container">
            <div className="auth-card">
                <div className="logo">
                    <img src="/logo.png" alt="SkillVoyage Logo" className="logo-image" />
                    SkillVoyage
                </div>
                <h2>Reset Password</h2>
                {message && <p className="message">{message}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            required
                        />
                        <span
                            className="eye-icon"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <button type="submit">Reset Password</button>
                </form>
                {message && message.includes('successful') && (
                    <Link to="/">
                        <button className="back-to-login">Back to Login</button>
                    </Link>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;
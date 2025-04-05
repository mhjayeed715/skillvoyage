import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaLock } from 'react-icons/fa';
import './ResetPassword.css';

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${backendUrl}/reset-password`, {
                token,
                newPassword,
                confirmPassword,
            });
            setMessage(res.data.message);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Reset failed');
            setMessage('');
        }
    };

    return (
        <div className="reset-container">
            <div className="reset-card">
                <div className="logo">
                    <img src="/logo.png" alt="SkillVoyage Logo" className="logo-image" />
                    SkillVoyage
                </div>
                <h2>Reset Password</h2>
                {message && <p className="message">{message}</p>}
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleResetPassword}>
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                        />
                    </div>
                    <button type="submit">Reset Password</button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
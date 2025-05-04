import React from 'react';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './ResetPassword.css';

function ResetPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const query = new URLSearchParams(window.location.search);
        const token = query.get('token');
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword, confirmPassword }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage('Password reset successful');
                setMessageType('success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                setMessage(data.error || 'Reset failed');
                setMessageType('error');
            }
        } catch (err) {
            setMessage('Reset failed due to a network error');
            setMessageType('error');
        }
    };

    return (
        <div className="reset-container">
            <div className="reset-card">
                <div className="logo">
                    <img
                        src="/logo.png"
                        alt="SkillVoyage Logo"
                        className="logo-image"
                        onError={(e) => (e.target.style.display = 'none')}
                    />
                    SkillVoyage
                </div>
                <h2>Reset Password</h2>
                {message && <p className={`message ${messageType}`}>{message}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            required
                        />
                        <span
                            onClick={togglePasswordVisibility}
                            className="eye-icon"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <div className="input-group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                        />
                        <span
                            onClick={togglePasswordVisibility}
                            className="eye-icon"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <button type="submit">Reset Password</button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
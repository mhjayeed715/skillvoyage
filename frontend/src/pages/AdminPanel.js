import React, { useState } from 'react';
import axios from 'axios';
import './AdminPanel.css';

function AdminPanel() {
    const [title, setTitle] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleAddPlaylist = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/admin/courses`,
                { title, youtube: youtubeUrl, category },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Playlist added successfully!');
            setMessageType('success');
            setTitle('');
            setYoutubeUrl('');
            setCategory('');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to add playlist');
            setMessageType('error');
            console.error('Add playlist error:', err.message);
        }
    };

    return (
        <div className="admin-panel">
            <h1>Admin Panel</h1>
            <h2>Add YouTube Playlist</h2>
            {message && <p className={`message ${messageType}`}>{message}</p>}
            <form onSubmit={handleAddPlaylist}>
                <div className="input-group">
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Playlist Title"
                        required
                    />
                </div>
                <div className="input-group">
                    <label>YouTube URL:</label>
                    <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/playlist?list=..."
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Category:</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">Select Category</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Machine Learning">Machine Learning</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                    </select>
                </div>
                <button type="submit">Add Playlist</button>
            </form>
        </div>
    );
}

export default AdminPanel;
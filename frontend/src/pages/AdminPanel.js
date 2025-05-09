import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select'; 
import './AdminPanel.css';

function AdminPanel() {
    const [title, setTitle] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPreferences, setEditPreferences] = useState([]);
    const [editProgress, setEditProgress] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setUsers(res.data))
          .catch(err => console.error('Fetch users error:', err));

        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/courses`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setCourses(res.data))
          .catch(err => console.error('Fetch courses error:', err));
    }, []);

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
            setCourses([...courses, res.data.course]);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to add playlist');
            setMessageType('error');
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user._id);
        setEditName(user.name);
        setEditEmail(user.email);
        setEditPreferences(user.preferences.map(p => ({ value: p, label: p })));
        setEditProgress(user.progress?.[0]?.completion || '');
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${selectedUser}`,
                { name: editName, email: editEmail, preferences: editPreferences.map(p => p.value), progress: [{ completion: editProgress }] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('User updated successfully!');
            setMessageType('success');
            setUsers(users.map(u => u._id === selectedUser ? res.data.user : u));
            setSelectedUser(null);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to update user');
            setMessageType('error');
        }
    };

    const handleDeleteUser = async (userId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('User deleted successfully!');
            setMessageType('success');
            setUsers(users.filter(u => u._id !== userId));
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to delete user');
            setMessageType('error');
        }
    };

    const handleEditCourse = (course) => {
        setSelectedCourse(course._id);
        setTitle(course.title);
        setYoutubeUrl(course.youtube);
        setCategory(course.category);
    };

    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/admin/courses/${selectedCourse}`,
                { title, youtube: youtubeUrl, category },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Course updated successfully!');
            setMessageType('success');
            setCourses(courses.map(c => c._id === selectedCourse ? res.data.course : c));
            setSelectedCourse(null);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to update course');
            setMessageType('error');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/admin/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Course deleted successfully!');
            setMessageType('success');
            setCourses(courses.filter(c => c._id !== courseId));
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to delete course');
            setMessageType('error');
        }
    };

    return (
        <div className="admin-panel">
            <h1>Admin Panel</h1>
            {message && <p className={`message ${messageType}`}>{message}</p>}

            {/* Add Playlist Section */}
            <h2>Add YouTube Playlist</h2>
            <form onSubmit={handleAddPlaylist}>
                <div className="input-group">
                    <label>Title:</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Playlist Title" required />
                </div>
                <div className="input-group">
                    <label>YouTube URL:</label>
                    <input type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/playlist?list=..." required />
                </div>
                <div className="input-group">
                    <label>Category:</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} required>
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

            {/* User Management Section */}
            <h2>User Management</h2>
            <ul>
                {users.map(user => (
                    <li key={user._id}>
                        {user.name} ({user.email})
                        <button onClick={() => handleEditUser(user)}>Edit</button>
                        <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                    </li>
                ))}
            </ul>
            {selectedUser && (
                <form onSubmit={handleUpdateUser}>
                    <div className="input-group">
                        <label>Name:</label>
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label>Email:</label>
                        <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label>Preferences:</label>
                        <Select isMulti options={preferenceOptions} value={editPreferences} onChange={setEditPreferences} />
                    </div>
                    <div className="input-group">
                        <label>Progress (0-1):</label>
                        <input type="number" value={editProgress} onChange={(e) => setEditProgress(e.target.value)} min="0" max="1" step="0.1" />
                    </div>
                    <button type="submit">Update User</button>
                    <button type="button" onClick={() => setSelectedUser(null)}>Cancel</button>
                </form>
            )}

            {/* Course Management Section */}
            <h2>Course Management</h2>
            <ul>
                {courses.map(course => (
                    <li key={course._id}>
                        {course.title} ({course.category})
                        <button onClick={() => handleEditCourse(course)}>Edit</button>
                        <button onClick={() => handleDeleteCourse(course._id)}>Delete</button>
                    </li>
                ))}
            </ul>
            {selectedCourse && (
                <form onSubmit={handleUpdateCourse}>
                    <div className="input-group">
                        <label>Title:</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label>YouTube URL:</label>
                        <input type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label>Category:</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                            <option value="">Select Category</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Machine Learning">Machine Learning</option>
                            <option value="Artificial Intelligence">Artificial Intelligence</option>
                            <option value="Cybersecurity">Cybersecurity</option>
                        </select>
                    </div>
                    <button type="submit">Update Course</button>
                    <button type="button" onClick={() => setSelectedCourse(null)}>Cancel</button>
                </form>
            )}
        </div>
    );
}

const preferenceOptions = [
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Machine Learning', label: 'Machine Learning' },
    { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
    { value: 'Cybersecurity', label: 'Cybersecurity' },
];

export default AdminPanel;
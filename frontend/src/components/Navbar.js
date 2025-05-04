import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBook, FaSignOutAlt, FaCog, FaUser, FaChalkboardTeacher } from 'react-icons/fa';
import { SegmentedControl, Text } from '@mantine/core';
import './Navbar.css';

const tabs = {
    user: [
        { link: '/dashboard', label: 'Dashboard', icon: FaBook },
        { link: '/courses', label: 'Courses', icon: FaChalkboardTeacher },
        { link: '/profile', label: 'Profile', icon: FaUser },
        { link: '/settings', label: 'Settings', icon: FaCog },
    ],
    admin: [
        { link: '/dashboard', label: 'Dashboard', icon: FaBook },
        { link: '/courses', label: 'Courses', icon: FaChalkboardTeacher },
        { link: '/profile', label: 'Profile', icon: FaUser },
        { link: '/settings', label: 'Settings', icon: FaCog },
        { link: '/admin', label: 'Admin', icon: FaChalkboardTeacher },
    ],
};

function Navbar({ role = 'user', email = 'user@skillvoyage.com', setToken }) {
    const [section, setSection] = useState(role === 'admin' ? 'admin' : 'user');
    const [active, setActive] = useState('Dashboard');
    const navigate = useNavigate();

    const links = tabs[section].map((item) => (
        <Link
            to={item.link}
            className="navbar-link"
            data-active={item.label === active || undefined}
            key={item.label}
            onClick={() => {
                setActive(item.label);
                console.log(`Navigating to ${item.link}`);
            }}
        >
            <item.icon className="navbar-linkIcon" />
            <span>{item.label}</span>
        </Link>
    ));

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div>
                <Text fw={500} size="sm" className="navbar-title" c="dimmed" mb="xs">
                    {email}
                </Text>
                <SegmentedControl
                    value={section}
                    onChange={(value) => setSection(value)}
                    transitionTimingFunction="ease"
                    fullWidth
                    data={[{ label: 'User', value: 'user' }, role === 'admin' && { label: 'Admin', value: 'admin' }].filter(Boolean)}
                />
            </div>
            <div className="navbar-main">{links}</div>
            <div className="navbar-footer">
                <Link className="navbar-link" to="/" onClick={handleLogout}>
                    <FaSignOutAlt className="navbar-linkIcon" />
                    <span>Logout</span>
                </Link>
            </div>
        </nav>
    );
}

export default Navbar;
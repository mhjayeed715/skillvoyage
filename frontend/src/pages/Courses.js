import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './Courses.css';

function Courses() {
    const [courses, setCourses] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            const params = new URLSearchParams();
            if (selectedCategory) params.append('category', selectedCategory);
            if (searchKeyword) params.append('keyword', searchKeyword);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/courses?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                setCourses(response.data);
            } else {
                console.error('Failed to load courses:', response.data.error);
            }
        };
        fetchCourses();
    }, [selectedCategory, searchKeyword]);

    return (
        <div className="dashboard-content">
            <h2>Courses</h2>
            <input
                type="text"
                placeholder="Search courses..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <Select
                options={[{ value: 'Web Development', label: 'Web Development' }, { value: 'Data Science', label: 'Data Science' }]}
                onChange={(opt) => setSelectedCategory(opt ? opt.value : '')}
                placeholder="Filter by category..."
                isClearable
            />
            <div className="courses-list">
                {courses.map((course) => (
                    <div key={course._id} className="course-item">
                        <a href={course.youtube} target="_blank" rel="noopener noreferrer">{course.title}</a> ({course.category})
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Courses;
import React, { useState } from 'react';
import { Card, Button } from '../../../components/common';

const BrowseCourses = () => {
    const [courses] = useState([
        {
            id: 1,
            title: 'React Fundamentals',
            description: 'Learn the basics of React including components, state, and props.',
            tutor: 'Jane Smith',
            rating: 4.8,
            students: 1234,
            price: 'Free'
        },
        {
            id: 2,
            title: 'Advanced JavaScript',
            description: 'Deep dive into advanced JS concepts like closures, promises, and async/await.',
            tutor: 'John Doe',
            rating: 4.9,
            students: 856,
            price: '$49.99'
        },
        {
            id: 3,
            title: 'Node.js for Beginners',
            description: 'Build server-side applications with Node.js and Express.',
            tutor: 'Bob Wilson',
            rating: 4.7,
            students: 543,
            price: '$39.99'
        },
        {
            id: 4,
            title: 'CSS Mastery',
            description: 'Master CSS including Flexbox, Grid, and modern styling techniques.',
            tutor: 'Alice Brown',
            rating: 4.6,
            students: 721,
            price: 'Free'
        },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="browse-courses">
            <div className="page-header">
                <h1>Browse Courses</h1>
                <div className="search-box">
                    <input
                        type="search"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="courses-grid">
                {filteredCourses.map((course) => (
                    <Card key={course.id} className="course-card">
                        <div className="course-thumbnail">
                            <div className="thumbnail-placeholder">📖</div>
                        </div>
                        <div className="course-content">
                            <h3>{course.title}</h3>
                            <p className="course-description">{course.description}</p>
                            <div className="course-meta">
                                <span className="tutor">👤 {course.tutor}</span>
                                <span className="rating">⭐ {course.rating}</span>
                                <span className="students">👥 {course.students}</span>
                            </div>
                            <div className="course-footer">
                                <span className="price">{course.price}</span>
                                <Button variant="primary" size="small">Enroll Now</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default BrowseCourses;

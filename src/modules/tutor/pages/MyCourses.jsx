import React, { useState } from 'react';
import { Card, Button } from '../../../components/common';

const MyCourses = () => {
    const [courses] = useState([
        {
            id: 1,
            title: 'React Fundamentals',
            students: 45,
            status: 'published',
            lastUpdated: '2024-01-15'
        },
        {
            id: 2,
            title: 'Advanced JavaScript',
            students: 32,
            status: 'published',
            lastUpdated: '2024-01-10'
        },
        {
            id: 3,
            title: 'Node.js Basics',
            students: 0,
            status: 'draft',
            lastUpdated: '2024-01-18'
        },
    ]);

    return (
        <div className="my-courses">
            <div className="page-header">
                <h1>My Courses</h1>
                <Button variant="primary">Create New Course</Button>
            </div>

            <div className="courses-grid">
                {courses.map((course) => (
                    <Card key={course.id} className="course-card">
                        <div className="course-thumbnail">
                            <div className="thumbnail-placeholder">📖</div>
                        </div>
                        <div className="course-info">
                            <h3>{course.title}</h3>
                            <p className="course-meta">
                                <span>{course.students} students</span>
                                <span className={`status status-${course.status}`}>{course.status}</span>
                            </p>
                            <p className="last-updated">Last updated: {course.lastUpdated}</p>
                        </div>
                        <div className="course-actions">
                            <Button size="small" variant="outline">Edit</Button>
                            <Button size="small" variant="secondary">View</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MyCourses;

import React, { useState } from 'react';
import { Card, Button } from '../../../components/common';

const MyEnrollments = () => {
    const [enrollments] = useState([
        {
            id: 1,
            title: 'React Fundamentals',
            tutor: 'Jane Smith',
            progress: 75,
            status: 'in-progress',
            startDate: '2024-01-01',
            lastAccessed: '2024-01-18'
        },
        {
            id: 2,
            title: 'JavaScript Basics',
            tutor: 'John Doe',
            progress: 100,
            status: 'completed',
            startDate: '2023-11-15',
            completedDate: '2023-12-20'
        },
        {
            id: 3,
            title: 'CSS Mastery',
            tutor: 'Alice Brown',
            progress: 20,
            status: 'in-progress',
            startDate: '2024-01-10',
            lastAccessed: '2024-01-17'
        },
    ]);

    return (
        <div className="my-enrollments">
            <div className="page-header">
                <h1>My Enrollments</h1>
                <p>View and manage your enrolled courses</p>
            </div>

            <div className="enrollments-list">
                {enrollments.map((enrollment) => (
                    <Card key={enrollment.id} className="enrollment-card">
                        <div className="enrollment-thumbnail">
                            <div className="thumbnail-placeholder">📖</div>
                        </div>
                        <div className="enrollment-info">
                            <h3>{enrollment.title}</h3>
                            <p className="tutor">Instructor: {enrollment.tutor}</p>
                            <div className="enrollment-meta">
                                <span>Started: {enrollment.startDate}</span>
                                {enrollment.status === 'completed' ? (
                                    <span>Completed: {enrollment.completedDate}</span>
                                ) : (
                                    <span>Last accessed: {enrollment.lastAccessed}</span>
                                )}
                            </div>
                        </div>
                        <div className="enrollment-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${enrollment.progress}%` }}
                                ></div>
                            </div>
                            <span className="progress-text">{enrollment.progress}%</span>
                        </div>
                        <div className="enrollment-actions">
                            {enrollment.status === 'completed' ? (
                                <Button variant="secondary" size="small">View Certificate</Button>
                            ) : (
                                <Button variant="primary" size="small">Continue</Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MyEnrollments;

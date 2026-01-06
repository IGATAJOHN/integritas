import React from 'react';
import { Card } from '../../../components/common';

const LearnerDashboard = () => {
    const stats = [
        { label: 'Enrolled Courses', value: '5', icon: '📚' },
        { label: 'Completed', value: '2', icon: '✅' },
        { label: 'In Progress', value: '3', icon: '🔄' },
        { label: 'Certificates', value: '2', icon: '🏆' },
    ];

    const currentCourses = [
        { id: 1, title: 'React Fundamentals', progress: 75, tutor: 'Jane Smith' },
        { id: 2, title: 'Advanced JavaScript', progress: 45, tutor: 'John Doe' },
        { id: 3, title: 'CSS Mastery', progress: 20, tutor: 'Bob Wilson' },
    ];

    return (
        <div className="learner-dashboard">
            <div className="page-header">
                <h1>My Learning Dashboard</h1>
                <p>Track your progress and continue learning</p>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <Card key={index} className="stat-card">
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </Card>
                ))}
            </div>

            <Card title="Continue Learning" className="current-courses-card">
                <div className="courses-list">
                    {currentCourses.map((course) => (
                        <div key={course.id} className="course-item">
                            <div className="course-info">
                                <h4>{course.title}</h4>
                                <p>Instructor: {course.tutor}</p>
                            </div>
                            <div className="course-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>
                                <span className="progress-text">{course.progress}% complete</span>
                            </div>
                            <button className="continue-btn">Continue</button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default LearnerDashboard;

import React from 'react';
import { Card } from '../../../components/common';

const TutorDashboard = () => {
    const stats = [
        { label: 'My Courses', value: '8', icon: '📚' },
        { label: 'Total Students', value: '156', icon: '👥' },
        { label: 'Pending Reviews', value: '12', icon: '📝' },
        { label: 'Average Rating', value: '4.8', icon: '⭐' },
    ];

    return (
        <div className="tutor-dashboard">
            <div className="page-header">
                <h1>Tutor Dashboard</h1>
                <p>Manage your courses and students</p>
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

            <div className="dashboard-sections">
                <Card title="Recent Submissions" className="submissions-card">
                    <ul className="submission-list">
                        <li>
                            <span className="student-name">Alice Johnson</span>
                            <span className="assignment">React Fundamentals Quiz</span>
                            <span className="time">2 hours ago</span>
                        </li>
                        <li>
                            <span className="student-name">Bob Smith</span>
                            <span className="assignment">JavaScript Project</span>
                            <span className="time">5 hours ago</span>
                        </li>
                        <li>
                            <span className="student-name">Carol White</span>
                            <span className="assignment">CSS Layout Exercise</span>
                            <span className="time">1 day ago</span>
                        </li>
                    </ul>
                </Card>

                <Card title="Upcoming Classes" className="classes-card">
                    <ul className="class-list">
                        <li>
                            <span className="class-name">Advanced JavaScript</span>
                            <span className="class-time">Today, 3:00 PM</span>
                        </li>
                        <li>
                            <span className="class-name">React Hooks Deep Dive</span>
                            <span className="class-time">Tomorrow, 10:00 AM</span>
                        </li>
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default TutorDashboard;

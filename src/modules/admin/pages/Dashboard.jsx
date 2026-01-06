import React from 'react';
import { Card } from '../../../components/common';

const AdminDashboard = () => {
    const stats = [
        { label: 'Total Users', value: '1,234', trend: '+12%' },
        { label: 'Total Tutors', value: '56', trend: '+5%' },
        { label: 'Total Learners', value: '1,178', trend: '+15%' },
        { label: 'Active Courses', value: '24', trend: '+3%' },
    ];

    return (
        <div className="admin-dashboard">
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome to the admin control panel</p>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <Card key={index} className="stat-card">
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-trend positive">{stat.trend}</div>
                    </Card>
                ))}
            </div>

            <div className="dashboard-sections">
                <Card title="Recent Activity" className="activity-card">
                    <ul className="activity-list">
                        <li>New user registration: John Doe</li>
                        <li>Course "React Basics" was updated</li>
                        <li>Tutor application approved: Jane Smith</li>
                        <li>System backup completed</li>
                    </ul>
                </Card>

                <Card title="Quick Actions" className="actions-card">
                    <div className="action-buttons">
                        <button className="action-btn">Manage Users</button>
                        <button className="action-btn">View Reports</button>
                        <button className="action-btn">System Settings</button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/common';

const Home = () => {
    const roles = [
        {
            title: 'Admin',
            description: 'Manage users, courses, and system settings',
            icon: '⚙️',
            path: '/admin',
            color: '#e74c3c'
        },
        {
            title: 'Tutor',
            description: 'Create courses, manage students, and track progress',
            icon: '👨‍🏫',
            path: '/tutor',
            color: '#3498db'
        },
        {
            title: 'Learner',
            description: 'Browse courses, track progress, and earn certificates',
            icon: '🎓',
            path: '/learner',
            color: '#2ecc71'
        }
    ];

    return (
        <div className="home-page">
            <section className="hero-section">
                <h1>Welcome to GGH Platform</h1>
                <p>Your comprehensive learning management system</p>
            </section>

            <section className="roles-section">
                <h2>Choose Your Role</h2>
                <div className="roles-grid">
                    {roles.map((role) => (
                        <Card key={role.title} className="role-card">
                            <div className="role-icon" style={{ backgroundColor: role.color }}>
                                {role.icon}
                            </div>
                            <h3>{role.title}</h3>
                            <p>{role.description}</p>
                            <Link to={role.path}>
                                <Button variant="primary">Enter {role.title} Dashboard</Button>
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="features-section">
                <h2>Platform Features</h2>
                <div className="features-grid">
                    <div className="feature-item">
                        <span className="feature-icon">📚</span>
                        <h4>Rich Course Content</h4>
                        <p>Access a variety of courses with video, text, and interactive content</p>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">📊</span>
                        <h4>Progress Tracking</h4>
                        <p>Monitor your learning journey with detailed progress reports</p>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">🏆</span>
                        <h4>Certificates</h4>
                        <p>Earn certificates upon course completion</p>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">💬</span>
                        <h4>Community</h4>
                        <p>Connect with tutors and fellow learners</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

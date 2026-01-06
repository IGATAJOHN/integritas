import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const MainLayout = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/admin', label: 'Admin' },
        { path: '/tutor', label: 'Tutor' },
        { path: '/learner', label: 'Learner' },
    ];

    return (
        <div className="main-layout">
            <header className="main-header">
                <div className="header-brand">
                    <Link to="/" className="brand-link">
                        <h1>GGH Platform</h1>
                    </Link>
                </div>
                <nav className="main-nav">
                    <ul className="nav-list">
                        {navItems.map((item) => (
                            <li key={item.path} className="nav-item">
                                <Link
                                    to={item.path}
                                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="main-footer">
                <p>&copy; {new Date().getFullYear()} GGH Platform. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default MainLayout;

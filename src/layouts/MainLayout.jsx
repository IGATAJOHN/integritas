import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/integritas_logo.jpg';

const MainLayout = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/admin', label: 'Admin' },
        { path: '/tutor', label: 'Tutor' },
        { path: '/explore', label: 'Explore' },
    ];

    return (
        <div className="main-layout">
            <header className="main-header">
                <div className="header-brand">
                    <Link to="/" className="brand-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <img src={logo} alt="Integritas Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                        <h1>Integritas Platform</h1>
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
                <p>&copy; {new Date().getFullYear()} Integritas Platform. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default MainLayout;

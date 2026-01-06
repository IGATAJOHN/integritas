import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const DashboardLayout = ({ sidebarItems = [], title = 'Dashboard' }) => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-title">{title}</h2>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? '←' : '→'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <ul className="sidebar-menu">
                        {sidebarItems.map((item) => (
                            <li key={item.path} className="sidebar-item">
                                <Link
                                    to={item.path}
                                    className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                                >
                                    {item.icon && <span className="sidebar-icon">{item.icon}</span>}
                                    {sidebarOpen && <span className="sidebar-label">{item.label}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="dashboard-main">
                <header className="dashboard-header">
                    <div className="header-left">
                        <Link to="/" className="back-link">← Back to Home</Link>
                    </div>
                    <div className="header-right">
                        <span className="user-info">Welcome, User</span>
                    </div>
                </header>

                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

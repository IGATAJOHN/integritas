import React from 'react';
import { DashboardLayout } from '../../layouts';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
    const sidebarItems = [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/users', label: 'User Management', icon: '👥' },
        { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <DashboardLayout sidebarItems={sidebarItems} title="Admin Panel">
            <Outlet />
        </DashboardLayout>
    );
};

export default AdminLayout;

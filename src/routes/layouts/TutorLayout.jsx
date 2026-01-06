import React from 'react';
import { DashboardLayout } from '../../layouts';
import { Outlet } from 'react-router-dom';

const TutorLayout = () => {
    const sidebarItems = [
        { path: '/tutor', label: 'Dashboard', icon: '📊' },
        { path: '/tutor/courses', label: 'My Courses', icon: '📚' },
        { path: '/tutor/students', label: 'Students', icon: '👥' },
    ];

    return (
        <DashboardLayout sidebarItems={sidebarItems} title="Tutor Panel">
            <Outlet />
        </DashboardLayout>
    );
};

export default TutorLayout;

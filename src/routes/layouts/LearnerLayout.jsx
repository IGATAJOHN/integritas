import React from 'react';
import { DashboardLayout } from '../../layouts';
import { Outlet } from 'react-router-dom';

const LearnerLayout = () => {
    const sidebarItems = [
        { path: '/learner', label: 'Dashboard', icon: '📊' },
        { path: '/learner/courses', label: 'Browse Courses', icon: '🔍' },
        { path: '/learner/enrollments', label: 'My Enrollments', icon: '📚' },
    ];

    return (
        <DashboardLayout sidebarItems={sidebarItems} title="Learner Portal">
            <Outlet />
        </DashboardLayout>
    );
};

export default LearnerLayout;

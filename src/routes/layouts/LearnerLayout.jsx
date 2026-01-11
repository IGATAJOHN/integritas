import React from 'react';
import { ModernDashboardLayout } from '../../layouts';
import { Outlet } from 'react-router-dom';
import {
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    EmojiEvents as AchievementsIcon,
    Folder as ResourcesIcon,
    Settings as SettingsIcon,
    MenuBook as MyLearningIcon
} from '@mui/icons-material';

const LearnerLayout = () => {
    const sidebarItems = [
        { path: '/explore', label: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/explore/courses', label: 'Courses', icon: <MyLearningIcon /> },
        { path: '/explore/progress', label: 'Progress', icon: <AchievementsIcon /> },
        { path: '/explore/community', label: 'Community', icon: <SchoolIcon /> },
        { path: '/explore/settings', label: 'Settings', icon: <SettingsIcon /> },
    ];

    return (
        <ModernDashboardLayout sidebarItems={sidebarItems} title="Learner Portal">
            <Outlet />
        </ModernDashboardLayout>
    );
};

export default LearnerLayout;

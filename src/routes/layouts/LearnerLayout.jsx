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
        { path: '/learner', label: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/learner/courses', label: 'Courses', icon: <MyLearningIcon /> },
        { path: '/learner/progress', label: 'Progress', icon: <AchievementsIcon /> },
        { path: '/learner/community', label: 'Community', icon: <SchoolIcon /> },
        { path: '/learner/settings', label: 'Settings', icon: <SettingsIcon /> },
    ];

    return (
        <ModernDashboardLayout sidebarItems={sidebarItems} title="Learner Portal">
            <Outlet />
        </ModernDashboardLayout>
    );
};

export default LearnerLayout;

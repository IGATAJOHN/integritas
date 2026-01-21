import React from 'react';
import {
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    EmojiEvents as TrophyIcon,
    Folder as ResourcesIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import { ModernDashboardLayout } from '../../layouts';

const sidebarItems = [
    { label: 'Dashboard', path: '/explore/dashboard', icon: <DashboardIcon /> },
    { label: 'My Courses', path: '/explore/my-learning', icon: <SchoolIcon /> },
    { label: 'Achievements', path: '/explore/achievements', icon: <TrophyIcon /> },
    { label: 'Resources', path: '/explore/resources', icon: <ResourcesIcon /> },
    { label: 'Settings', path: '/explore/settings', icon: <SettingsIcon /> },
];

const ModernLearnerLayout = () => {
    return (
        <ModernDashboardLayout sidebarItems={sidebarItems} title="Learner Portal" />
    );
};

export default ModernLearnerLayout;

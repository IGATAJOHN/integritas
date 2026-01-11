import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import {
    DashboardOutlined,
    SchoolOutlined,
    BarChartOutlined,
    AssignmentOutlined,
    PersonOutlined,
} from '@mui/icons-material';
import DashboardSidebar from '../../components/DashboardSidebar';
import DashboardNavbar from '../../components/DashboardNavbar';

const SIDEBAR_WIDTH = 260;

const TutorLayout = () => {
    const sidebarItems = [
        { path: '/tutor', label: 'Dashboard', icon: <DashboardOutlined sx={{ fontSize: 22 }} /> },
        { path: '/tutor/courses', label: 'My Courses', icon: <SchoolOutlined sx={{ fontSize: 22 }} /> },
        { path: '/tutor/analytics', label: 'Teacher Analytics', icon: <BarChartOutlined sx={{ fontSize: 22 }} /> },
        { path: '/tutor/assignments', label: 'Assignments', icon: <AssignmentOutlined sx={{ fontSize: 22 }} /> },
        { path: '/tutor/profile', label: 'Profile', icon: <PersonOutlined sx={{ fontSize: 22 }} /> },
    ];

    const user = {
        name: 'Tutor James',
        initials: 'TJ',
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0C1322' }}>
            {/* Fixed Sidebar */}
            <DashboardSidebar
                navItems={sidebarItems}
                switchRolePath="/learner"
                switchRoleLabel="Switch Role"
            />

            {/* Main Content Area */}
            <Box
                sx={{
                    marginLeft: `${SIDEBAR_WIDTH}px`,
                    width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                }}
            >
                {/* Sticky Navbar */}
                <Box sx={{ position: 'sticky', top: 0, zIndex: 100 }}>
                    <DashboardNavbar
                        title="Tutor Dashboard"
                        searchPlaceholder="Search courses or students..."
                        user={user}
                        notificationCount={3}
                    />
                </Box>

                {/* Page Content */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default TutorLayout;

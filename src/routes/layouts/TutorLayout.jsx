import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleDrawerClose = () => {
        setMobileOpen(false);
    };

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
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0C1322', overflowX: 'hidden' }}>
            {/* Sidebar with Drawer Support */}
            <DashboardSidebar
                navItems={sidebarItems}
                switchRolePath="/learner"
                switchRoleLabel="Switch Role"
                mobileOpen={mobileOpen}
                onDrawerClose={handleDrawerClose}
            />

            {/* Main Content Area */}
            <Box
                sx={{
                    marginLeft: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
                    width: { xs: '100%', md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    overflowX: 'hidden',
                }}
            >
                {/* Sticky Navbar */}
                <Box sx={{ position: 'sticky', top: 0, zIndex: 100 }}>
                    <DashboardNavbar
                        title="Tutor Dashboard"
                        searchPlaceholder="Search courses or students..."
                        user={user}
                        notificationCount={3}
                        onDrawerToggle={handleDrawerToggle}
                    />
                </Box>

                {/* Page Content */}
                <Box sx={{ flex: 1, overflowX: 'hidden', overflowY: 'auto' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default TutorLayout;

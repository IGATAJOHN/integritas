import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import TutorSidebar from '../components/TutorSidebar';
import TutorNavbar from '../components/TutorNavbar';
import { useAuth } from '../../../contexts';

const SIDEBAR_WIDTH = 260;

const TutorLayout = () => {
    const theme = useTheme();
    const { user, getKycStatus } = useAuth();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleDrawerClose = () => {
        setMobileOpen(false);
    };

    const displayUser = {
        name: user?.name || 'Tutor',
        initials: user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'T',
        avatar: user?.avatar,
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0C1322', overflowX: 'hidden' }}>
            <TutorSidebar
                mobileOpen={mobileOpen}
                onDrawerClose={handleDrawerClose}
            />

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
                <Box sx={{ position: 'sticky', top: 0, zIndex: 100 }}>
                    <TutorNavbar
                        title="Tutor Dashboard"
                        searchPlaceholder="Search courses or students..."
                        user={displayUser}
                        notificationCount={3}
                        onDrawerToggle={handleDrawerToggle}
                        kycStatus={getKycStatus() || 'draft'}
                    />
                </Box>

                <Box sx={{ flex: 1, overflowX: 'hidden', overflowY: 'auto' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default TutorLayout;


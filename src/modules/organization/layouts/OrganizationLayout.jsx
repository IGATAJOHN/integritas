import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import OrganizationSidebar from '../components/OrganizationSidebar';
import OrganizationNavbar from '../components/OrganizationNavbar';

const SIDEBAR_WIDTH = 260;

const OrganizationLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleDrawerClose = () => {
        setMobileOpen(false);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0C1322', overflowX: 'hidden' }}>
            <OrganizationSidebar
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
                    <OrganizationNavbar onDrawerToggle={handleDrawerToggle} />
                </Box>

                <Box sx={{ flex: 1, overflowX: 'hidden', overflowY: 'auto' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default OrganizationLayout;

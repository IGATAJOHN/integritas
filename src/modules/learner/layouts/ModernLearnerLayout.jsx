import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer, useTheme } from '@mui/material';
import LearnerNavbar from '../components/LearnerNavbar';
import LearnerSidebar from '../components/LearnerSidebar';

const SIDEBAR_WIDTH = 260;
const DESKTOP_NAVBAR_HEIGHT = 65;

const ModernLearnerLayout = () => {
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);

    const colors = {
        bg: theme.palette.mode === 'dark' ? '#080D19' : '#F8FAFC',
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: colors.bg }}>
            {/* Navbar */}
            <LearnerNavbar onMobileMenuToggle={() => setMobileOpen(true)} />

            <Box sx={{ display: 'flex', flex: 1 }}>
                {/* Desktop Sidebar */}
                <Box
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        flex: `0 0 ${SIDEBAR_WIDTH}px`,
                        width: SIDEBAR_WIDTH,
                        position: 'sticky',
                        top: `${DESKTOP_NAVBAR_HEIGHT}px`,
                        alignSelf: 'flex-start',
                        height: `calc(100vh - ${DESKTOP_NAVBAR_HEIGHT}px)`,
                    }}
                >
                    <LearnerSidebar />
                </Box>

                {/* Mobile Sidebar Drawer */}
                <Drawer
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: SIDEBAR_WIDTH }
                    }}
                >
                    <LearnerSidebar onClose={() => setMobileOpen(false)} />
                </Drawer>

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        p: { xs: 2, md: 3 },
                        overflow: 'auto',
                        width: '100%' // Ensure it takes width
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default ModernLearnerLayout;

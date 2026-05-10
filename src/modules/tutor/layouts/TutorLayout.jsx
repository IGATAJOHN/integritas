import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import TutorSidebar from '../components/TutorSidebar';
import TutorNavbar from '../components/TutorNavbar';
import { useAuth } from '../../../contexts';
import { kycService } from '../services/kycService';
import { isFoundationalTutor } from '../../../utils';

const SIDEBAR_WIDTH = 260;

const readKycStatus = (user) => {
    const status = user?.kyc_status || user?.kycStatus || null;
    return status ? String(status).toLowerCase() : null;
};

const TutorLayout = () => {
    const { user } = useAuth();
    const isFoundational = isFoundationalTutor(user);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [expertKycStatus, setExpertKycStatus] = useState(readKycStatus(user) || 'draft');
    const kycStatus = isFoundational ? null : expertKycStatus;

    // Fetch actual KYC status from API
    useEffect(() => {
        if (isFoundational) return;

        const fetchKycStatus = async () => {
            try {
                const data = await kycService.getKyc();
                if (data?.status) {
                    setExpertKycStatus(String(data.status).toLowerCase());
                }
            } catch (err) {
                if (err?.status === 403) {
                    setExpertKycStatus(readKycStatus(user) || null);
                    return;
                }
                console.warn('Failed to fetch KYC status:', err);
            }
        };
        fetchKycStatus();
    }, [isFoundational, user]);

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
                        kycStatus={kycStatus}
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

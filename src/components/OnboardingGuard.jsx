import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts';
import { Box, CircularProgress } from '@mui/material';

const OnboardingGuard = ({ children }) => {
    const { user, loading, needsEmailVerification, needsKyc, getKycStatus, isKycComplete } = useAuth();
    const location = useLocation();

    // Show loading while checking
    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: '#0C1322',
                }}
            >
                <CircularProgress sx={{ color: '#1152D4' }} />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (needsEmailVerification() && location.pathname !== '/verify') {
        return <Navigate to="/verify" replace />;
    }
    const isTutorRoute = location.pathname.startsWith('/tutor');
    const isKycPage = location.pathname === '/tutor/kyc';
    // If on KYC page but the status is already complete (approved), redirect to dashboard
    if (isTutorRoute && isKycPage) {
        if (isKycComplete()) {
            return <Navigate to="/tutor" replace />;
        }
    }

    if (isTutorRoute && !isKycPage && needsKyc()) {
        return <Navigate to="/tutor/kyc" replace />;
    }

    return children;
};

export default OnboardingGuard;


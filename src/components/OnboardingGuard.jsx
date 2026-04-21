import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts';
import { Box, CircularProgress } from '@mui/material';
import { hasOrganizationAccess } from '../utils';
import theme from '../styles/theme';


const OnboardingGuard = ({ children }) => {
    const { user, loading, needsEmailVerification, needsKyc, isKycComplete } = useAuth();
    const location = useLocation();

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
                <CircularProgress sx={{ color: theme.colors.brand }} />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const isOrganizationRoute =
        location.pathname.startsWith('/org') ||
        location.pathname.startsWith('/learner/organization');
    const shouldBypassEmailVerification =
        isOrganizationRoute && hasOrganizationAccess(user);

    if (!shouldBypassEmailVerification && needsEmailVerification() && location.pathname !== '/verify') {
        return <Navigate to="/verify" replace />;
    }
    const isTutorRoute = location.pathname.startsWith('/tutor');
    const isKycPage = location.pathname === '/tutor/kyc';
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

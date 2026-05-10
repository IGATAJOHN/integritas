import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts';
import { Box, CircularProgress } from '@mui/material';
import { hasOrganizationAccess, isFoundationalTutor } from '../utils';
import theme from '../styles/theme';


const OnboardingGuard = ({ children }) => {
    const { user, loading, needsEmailVerification, needsLearnerPayment, needsKyc, isKycComplete } = useAuth();
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

    const isLearnerPaymentAllowedPath =
        location.pathname === '/learner/foundational' ||
        location.pathname === '/explore/foundational' ||
        location.pathname === '/checkout' ||
        location.pathname === '/enrolment/return' ||
        location.pathname === '/payment-success' ||
        location.pathname === '/payment/success' ||
        location.pathname === '/settings/profile' ||
        location.pathname === '/notifications';

    if (needsLearnerPayment() && !isLearnerPaymentAllowedPath) {
        return <Navigate to="/learner/foundational" state={{ from: location }} replace />;
    }

    const isTutorRoute = location.pathname.startsWith('/tutor');
    const isKycPage = location.pathname === '/tutor/kyc';
    // Foundational tutors are admin-vouched and skip KYC entirely.
    const requiresKyc = !isFoundationalTutor(user);

    if (isTutorRoute && isKycPage) {
        if (!requiresKyc || isKycComplete()) {
            return <Navigate to="/tutor" replace />;
        }
    }

    if (isTutorRoute && !isKycPage && requiresKyc && needsKyc()) {
        return <Navigate to="/tutor/kyc" replace />;
    }

    return children;
};

export default OnboardingGuard;

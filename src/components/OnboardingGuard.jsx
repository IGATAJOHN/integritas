import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts';
import { Box, CircularProgress } from '@mui/material';

/**
 * OnboardingGuard Component
 * 
 * Checks user onboarding status and redirects to appropriate pages:
 * - If email not verified → redirect to /verify
 * - If KYC not complete (for tutors) → redirect to /tutor/kyc
 * - Otherwise, allows access to the protected route
 */
const OnboardingGuard = ({ children }) => {
    const { user, loading, needsEmailVerification, needsKyc, getKycStatus } = useAuth();
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

    // Check if email needs verification
    // Skip verification check for verify page itself
    if (needsEmailVerification() && location.pathname !== '/verify') {
        return <Navigate to="/verify" replace />;
    }

    // Check if KYC is needed (for tutors)
    // Only check KYC for tutor routes, and skip if already on KYC page
    const isTutorRoute = location.pathname.startsWith('/tutor');
    const isKycPage = location.pathname === '/tutor/kyc';
    
    if (isTutorRoute && !isKycPage && needsKyc()) {
        const kycStatus = getKycStatus();
        // Only redirect if KYC is not approved/completed
        if (kycStatus !== 'approved' && kycStatus !== 'completed') {
            return <Navigate to="/tutor/kyc" replace />;
        }
    }

    return children;
};

export default OnboardingGuard;


import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts';
import { Box, CircularProgress } from '@mui/material';
import OnboardingGuard from './OnboardingGuard';
import theme from '../styles/theme';


const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
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

    // Redirect to login if not authenticated
    // Save the current location so we can redirect back after login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Wrap children with OnboardingGuard to check email verification and KYC status
    return <OnboardingGuard>{children}</OnboardingGuard>;
};

export default ProtectedRoute;


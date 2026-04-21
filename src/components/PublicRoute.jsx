import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { Box, CircularProgress } from '@mui/material';
import { getDashboardRoute } from '../utils';
import theme from '../styles/theme';


const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();

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

    // Redirect to appropriate dashboard based on user role if already authenticated
    if (isAuthenticated && user) {
        return <Navigate to={getDashboardRoute(user)} replace />;
    }

    return children;
};

export default PublicRoute;

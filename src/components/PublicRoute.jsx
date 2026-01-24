import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { Box, CircularProgress } from '@mui/material';

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
                <CircularProgress sx={{ color: '#1152D4' }} />
            </Box>
        );
    }

    // Redirect to appropriate dashboard based on user role if already authenticated
    if (isAuthenticated && user) {
        const role = user.role || user.userType;
        
        // Map roles to their dashboard routes
        if (role === 'administrator' || role === 'admin') {
            return <Navigate to="/admin" replace />;
        } else if (role === 'tutor') {
            return <Navigate to="/tutor" replace />;
        } else if (role === 'learner' || role === 'student') {
            return <Navigate to="/learner" replace />;
        }
        
        // Default fallback to learner dashboard
        return <Navigate to="/learner" replace />;
    }

    return children;
};

export default PublicRoute;


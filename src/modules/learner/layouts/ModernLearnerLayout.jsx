import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

/**
 * ModernLearnerLayout
 * 
 * This layout is designed to match the new "Explore" page design.
 * It provides a clean container for pages that manage their own header and sidebar,
 * or it can be expanded to include a global modern header.
 */
const ModernLearnerLayout = () => {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#080D19' }}>
            <Outlet />
        </Box>
    );
};

export default ModernLearnerLayout;

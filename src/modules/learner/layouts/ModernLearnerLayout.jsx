import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const ModernLearnerLayout = () => {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#080D19' }}>
            <Outlet />
        </Box>
    );
};

export default ModernLearnerLayout;

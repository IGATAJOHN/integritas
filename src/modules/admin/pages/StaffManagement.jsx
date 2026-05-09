import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import { GroupOutlined } from '@mui/icons-material';
import theme from '../../../styles/theme';

const StaffManagement = () => (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
            <GroupOutlined sx={{ color: theme.colors.brand, fontSize: 28 }} />
            <Box>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                    Staff Management
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    Manage admin and staff accounts.
                </Typography>
            </Box>
        </Stack>

        <Paper sx={{ bgcolor: '#1A2230', border: '1px solid #374151', borderRadius: 2, p: 6, textAlign: 'center' }}>
            <GroupOutlined sx={{ fontSize: 56, color: '#374151', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#9CA3AF', fontWeight: 600, mb: 1 }}>
                Feature Coming Soon
            </Typography>
            <Typography sx={{ color: '#6B7280', fontSize: '0.875rem', maxWidth: 420, mx: 'auto' }}>
                Staff account management is not yet available in this version of the API.
                This section will be enabled once the backend endpoints are live.
            </Typography>
        </Paper>
    </Box>
);

export default StaffManagement;

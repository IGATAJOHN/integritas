import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    IconButton,
    Avatar,
    Badge,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    NotificationsOutlined,
    Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts';

const TITLES = {
    '/org': 'Organization Workspace',
    '/org/create': 'Create Organization',
    '/org/invitations': 'Invitations',
    '/org/learning-paths': 'Learning Paths',
    '/org/assignments': 'Assignments',
    '/org/reports': 'Reports',
    '/org/my-assignments': 'My Assignments',
};

const OrganizationNavbar = ({
    onDrawerToggle = () => { },
}) => {
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useAuth();

    const title = useMemo(
        () => TITLES[location.pathname] || 'Organization Workspace',
        [location.pathname]
    );

    const userName = user?.name || user?.first_name || 'Org User';
    const userInitials = userName.split(' ').map((name) => name[0]).join('').toUpperCase().slice(0, 2) || 'OU';

    return (
        <Box
            sx={{
                height: 70,
                bgcolor: '#0F1729',
                borderBottom: '1px solid #1F2937',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: { xs: 2, md: 4 },
                overflow: 'hidden',
            }}
        >
            <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 3 }}>
                <IconButton
                    onClick={onDrawerToggle}
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        color: '#FFFFFF',
                        mr: 1,
                    }}
                >
                    <MenuIcon />
                </IconButton>

                <Typography
                    sx={{
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: { xs: '1rem', md: '1.1rem' },
                    }}
                >
                    {title}
                </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
                {!isMobile && (
                    <IconButton
                        sx={{
                            color: '#6B7280',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                        }}
                    >
                        <Badge badgeContent={0} color="error">
                            <NotificationsOutlined sx={{ fontSize: 24 }} />
                        </Badge>
                    </IconButton>
                )}
                <Avatar
                    sx={{
                        width: 40,
                        height: 40,
                        bgcolor: '#1152D4',
                        ml: 1,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                    }}
                >
                    {userInitials}
                </Avatar>
            </Stack>
        </Box>
    );
};

export default OrganizationNavbar;

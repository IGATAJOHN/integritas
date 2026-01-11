import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    TextField,
    InputAdornment,
    IconButton,
    Avatar,
    Badge,
} from '@mui/material';
import {
    Search,
    NotificationsOutlined,
    SettingsOutlined,
} from '@mui/icons-material';

const DashboardNavbar = ({
    title = 'Dashboard',
    searchPlaceholder = 'Search...',
    user = { name: 'User', initials: 'U' },
    notificationCount = 0,
    showSearch = true,
}) => {
    return (
        <Box
            sx={{
                height: 70,
                bgcolor: '#0F1729',
                borderBottom: '1px solid #1F2937',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
            }}
        >
            {/* Left - Page Title & Search */}
            <Stack direction="row" alignItems="center" spacing={3}>
                <Typography
                    sx={{
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                    }}
                >
                    {title}
                </Typography>
                {showSearch && (
                    <TextField
                        placeholder={searchPlaceholder}
                        size="small"
                        sx={{
                            width: 280,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: '#1A2230',
                                borderRadius: 2,
                                height: 44,
                                '& fieldset': { border: 'none' },
                            },
                            '& .MuiInputBase-input': {
                                color: '#9CA3AF',
                                fontSize: '0.9rem',
                                py: 1,
                                '&::placeholder': {
                                    color: '#6B7280',
                                    opacity: 1,
                                },
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: '#6B7280', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                )}
            </Stack>

            {/* Right - Actions & Profile */}
            <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton
                    sx={{
                        color: '#6B7280',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                    }}
                >
                    <Badge badgeContent={notificationCount} color="error">
                        <NotificationsOutlined sx={{ fontSize: 24 }} />
                    </Badge>
                </IconButton>
                <IconButton
                    component={Link}
                    to="/settings"
                    sx={{
                        color: '#6B7280',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                    }}
                >
                    <SettingsOutlined sx={{ fontSize: 24 }} />
                </IconButton>
                <Avatar
                    src={user.avatar}
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
                    {user.initials}
                </Avatar>
            </Stack>
        </Box>
    );
};

export default DashboardNavbar;

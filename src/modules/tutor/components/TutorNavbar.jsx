import React, { useState } from 'react';
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
    useTheme,
    useMediaQuery,
    InputBase,
} from '@mui/material';
import {
    Search,
    NotificationsOutlined,
    SettingsOutlined,
    Menu as MenuIcon,
} from '@mui/icons-material';

const DashboardNavbar = ({
    title = 'Dashboard',
    searchPlaceholder = 'Search...',
    user = { name: 'User', initials: 'U' },
    notificationCount = 0,
    showSearch = true,
    onDrawerToggle = () => { },
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [searchQuery, setSearchQuery] = useState('');

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
                {showSearch && !isMobile && (
                    <Box sx={{
                        bgcolor: "#1F2937",
                        borderRadius: 1,
                        px: 2,
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        gap: 1,
                        width: '260px',
                        height: '40px'
                    }}>
                        <Search sx={{ color: "#9CA3AF", fontSize: 20 }} />
                        <InputBase
                            placeholder="Search courses"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                color: "#FFFFFF",
                                fontSize: '0.9rem',
                                width: '100%',
                                '& input': {
                                    border: 'none',
                                    outline: 'none',
                                    '&:focus': {
                                        border: 'none',
                                        outline: 'none'
                                    }
                                }
                            }}
                        />
                    </Box>
                )}
            </Stack>

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

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
    Box,
    Typography,
    Stack,
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
    Menu as MenuIcon,
    LightMode,
    DarkMode,
} from '@mui/icons-material';
import { useThemeMode } from '../../../contexts';
import appTheme from '../../../styles/theme';
import { apiService } from '../../../services/api';


const AdminNavbar = ({
    onDrawerToggle = () => { },
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { isDark, toggleThemeMode } = useThemeMode();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        let failed = false;
        const fetchUnread = async () => {
            if (failed) return; // stop polling after a server error
            try {
                const res = await apiService.get('/me/notifications/unread-count');
                const count = res?.count ?? res?.unread_count ?? res?.data?.count ?? 0;
                setUnreadCount(Number(count) || 0);
            } catch (err) {
                // Stop polling on 5xx — server-side issue, no point hammering it
                if (err?.status >= 500 || err?.response?.status >= 500) failed = true;
            }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 60000);
        return () => clearInterval(interval);
    }, []);

    // Get user display info
    const userName = user?.name || user?.first_name || 'Admin';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';

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
                    Admin Dashboard
                </Typography>
                {!isMobile && (
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
                            placeholder="Search users, courses..."
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
                {/* Theme Toggle */}
                <IconButton
                    onClick={toggleThemeMode}
                    sx={{
                        color: '#6B7280',
                        '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.05)' },
                    }}
                >
                    {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                </IconButton>

                <IconButton
                    onClick={() => navigate('/notifications')}
                    sx={{
                        color: '#6B7280',
                        '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.05)' },
                    }}
                >
                    <Badge
                        badgeContent={unreadCount > 9 ? '9+' : unreadCount}
                        color="error"
                        invisible={unreadCount === 0}
                    >
                        <NotificationsOutlined sx={{ fontSize: 24 }} />
                    </Badge>
                </IconButton>
                <Avatar
                    sx={{
                        width: 40,
                        height: 40,
                        bgcolor: appTheme.colors.brand,
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

export default AdminNavbar;

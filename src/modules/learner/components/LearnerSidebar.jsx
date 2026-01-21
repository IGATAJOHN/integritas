import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    alpha
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    MenuBook as CoursesIcon,
    EmojiEvents as AchievementsIcon,
    Folder as ResourcesIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';

const LearnerSidebar = ({ onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const colors = {
        bg: '#0C1322',
        text: '#FFFFFF',
        textSecondary: '#94A3B8',
        primary: '#2563EB',
        primaryBg: 'rgba(37, 99, 235, 0.15)',
        hover: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.05)'
    };

    const menuItems = [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/learner' },
        { label: 'My Learning', icon: <CoursesIcon />, path: '/explore/my-learning' },
        { label: 'Achievements', icon: <AchievementsIcon />, path: '/achievements' },
        { label: 'Resources', icon: <ResourcesIcon />, path: '/resources' },
    ];

    const bottomMenuItems = [
        { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    ];

    const isActiveLink = (path) => {
        if (path === '/learner') return location.pathname === '/learner';
        return location.pathname.startsWith(path);
    };

    const handleNavigate = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    const MenuItem = ({ item }) => {
        const active = isActiveLink(item.path);
        return (
            <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                        borderRadius: 2,
                        mx: 1,
                        py: 1.25,
                        bgcolor: active ? colors.primaryBg : 'transparent',
                        '&:hover': {
                            bgcolor: active ? colors.primaryBg : colors.hover
                        }
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 40,
                            color: active ? colors.primary : colors.textSecondary
                        }}
                    >
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: active ? 600 : 500,
                            color: active ? colors.primary : colors.text
                        }}
                    />
                </ListItemButton>
            </ListItem>
        );
    };

    return (
        <Box
            sx={{
                width: 220,
                height: '100%',
                bgcolor: colors.bg,
                borderRight: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Main Menu */}
            <Box sx={{ flex: 1, pt: 3, overflowY: 'auto' }}>
                <List sx={{ px: 1 }}>
                    {menuItems.map((item) => (
                        <MenuItem key={item.label} item={item} />
                    ))}
                </List>
            </Box>

            {/* Bottom Menu */}
            <Box sx={{ pb: 2 }}>
                <Divider sx={{ borderColor: colors.border, mb: 2, mx: 2 }} />
                <List sx={{ px: 1 }}>
                    {bottomMenuItems.map((item) => (
                        <MenuItem key={item.label} item={item} />
                    ))}
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => navigate('/')}
                            sx={{
                                borderRadius: 2,
                                mx: 1,
                                py: 1.25,
                                '&:hover': {
                                    bgcolor: alpha('#EF4444', 0.1)
                                }
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 40,
                                    color: '#EF4444'
                                }}
                            >
                                <LogoutIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Logout"
                                primaryTypographyProps={{
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    color: '#EF4444'
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Box>
    );
};

export default LearnerSidebar;

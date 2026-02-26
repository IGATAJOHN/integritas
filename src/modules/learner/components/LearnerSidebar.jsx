import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Collapse,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    alpha
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    ExpandLess,
    ExpandMore,
    Folder as ResourcesIcon,
    Logout as LogoutIcon,
    MenuBook as CoursesIcon,
    EmojiEvents as AchievementsIcon,
    Settings as SettingsIcon,
    BusinessOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts';

const LearnerSidebar = ({ onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [openSubmenu, setOpenSubmenu] = React.useState('');

    const colors = {
        bg: '#0F1729',
        text: '#9CA3AF',
        textSecondary: '#6B7280',
        activeText: '#FFFFFF',
        primary: '#1152D4',
        primaryBg: '#1152D4',
        childActiveBg: 'rgba(17, 82, 212, 0.15)',
        childHoverBg: 'rgba(17, 82, 212, 0.05)',
        hover: 'rgba(17, 82, 212, 0.1)',
        border: '#1F2937'
    };

    const menuItems = [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/learner' },
        { label: 'My Learning', icon: <CoursesIcon />, path: '/explore/my-learning' },
        {
            label: 'Organizations',
            icon: <BusinessOutlined sx={{ fontSize: 22 }} />,
            children: [
                { path: '/learner/organization/overview', label: 'Overview' },
                { path: '/learner/organization/invitations', label: 'Invitations' },
                { path: '/learner/organization/learning-paths', label: 'Learning Paths' },
                { path: '/learner/organization/assignments', label: 'Assignments' },
                { path: '/learner/organization/reports', label: 'Reports' },
            ]
        },
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

    const isParentActive = (item) => {
        if (item.path) return isActiveLink(item.path);
        if (!item.children) return false;
        return item.children.some((child) => isActiveLink(child.path));
    };

    const MenuItem = ({ item }) => {
        const active = isParentActive(item);
        const isOpen = openSubmenu === item.label;
        return (
            <>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                        onClick={() => {
                            if (item.children) {
                                setOpenSubmenu(isOpen ? '' : item.label);
                                return;
                            }
                            handleNavigate(item.path);
                        }}
                        sx={{
                            borderRadius: 2,
                            mx: 1,
                            py: 1.25,
                            bgcolor: active || isOpen ? colors.primaryBg : 'transparent',
                            '&:hover': {
                                bgcolor: active || isOpen ? colors.primaryBg : colors.hover
                            }
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 40,
                                color: active || isOpen ? colors.activeText : colors.textSecondary
                            }}
                        >
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                                fontSize: '0.9rem',
                                fontWeight: active || isOpen ? 600 : 400,
                                color: active || isOpen ? colors.activeText : colors.text
                            }}
                        />
                        {item.children && (isOpen ? <ExpandLess sx={{ color: colors.activeText }} /> : <ExpandMore sx={{ color: colors.text }} />)}
                    </ListItemButton>
                </ListItem>
                {item.children && (
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding sx={{ mb: 0.5 }}>
                            {item.children.map((child) => {
                                const childActive = isActiveLink(child.path);
                                return (
                                    <ListItemButton
                                        key={child.path}
                                        onClick={() => handleNavigate(child.path)}
                                        sx={{
                                            pl: 7,
                                            borderRadius: 1.5,
                                            mx: 1,
                                            mb: 0.5,
                                            py: 1,
                                            bgcolor: childActive ? colors.childActiveBg : 'transparent',
                                            '&:hover': {
                                                bgcolor: childActive ? colors.childActiveBg : colors.childHoverBg,
                                            },
                                        }}
                                    >
                                        <ListItemText
                                            primary={child.label}
                                            primaryTypographyProps={{
                                                fontSize: '0.84rem',
                                                fontWeight: childActive ? 600 : 400,
                                                color: childActive ? colors.primary : colors.text,
                                            }}
                                        />
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    </Collapse>
                )}
            </>
        );
    };

    return (
        <Box
            sx={{
                width: 260,
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
                            onClick={async () => {
                                try {
                                    await logout();
                                    navigate('/login');
                                } catch (error) {
                                    console.error('Logout error:', error);
                                    navigate('/login');
                                }
                            }}
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

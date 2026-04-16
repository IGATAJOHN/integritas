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
    BusinessOutlined as OrganizationIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts';

const LearnerSidebar = ({ onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, isAuthenticated } = useAuth();
    const [openSubmenu, setOpenSubmenu] = React.useState(
        location.pathname.startsWith('/learner/organization') ? 'Organization' : ''
    );

    const colors = {
        bg: '#0F1729',
        text: '#9CA3AF',
        textSecondary: '#6B7280',
        activeText: '#FFFFFF',
        primary: '#1152D4',
        primaryBg: '#1152D4',
        hover: 'rgba(17, 82, 212, 0.1)',
        border: '#1F2937'
    };

    const menuItems = [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/learner', private: true },
        { label: 'My Learning', icon: <CoursesIcon />, path: '/explore/my-learning', private: true },
        {
            label: 'Organization',
            icon: <OrganizationIcon sx={{ fontSize: 22 }} />,
            private: true,
            children: [
                { label: 'Overview', path: '/learner/organization/overview' },
                { label: 'Invitations', path: '/learner/organization/invite' },
                { label: 'Learning Paths', path: '/learner/organization/learning-paths' },
                { label: 'Assignments', path: '/learner/organization/assignments' },
                { label: 'My Assignments', path: '/learner/organization/my-assignments' },
                { label: 'Reports', path: '/learner/organization/reports' },
            ],
        },
        // { label: 'Achievements', icon: <AchievementsIcon />, path: '/achievements', private: true }, // hidden until implemented
        // { label: 'Resources', icon: <ResourcesIcon />, path: '/resources' }, // hidden until implemented
    ];

    const displayMenuItems = isAuthenticated 
        ? menuItems 
        : menuItems.filter(item => !item.private);

    const bottomMenuItems = [
        // { label: 'Settings', icon: <SettingsIcon />, path: '/settings' }, // hidden until implemented
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
        const isHighlighted = item.children ? (active || isOpen) : active;
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
                            bgcolor: isHighlighted ? colors.primaryBg : 'transparent',
                            '&:hover': {
                                bgcolor: isHighlighted ? colors.primaryBg : colors.hover
                            }
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 40,
                                color: isHighlighted ? colors.activeText : colors.textSecondary
                            }}
                        >
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                                fontSize: '0.9rem',
                                fontWeight: isHighlighted ? 600 : 400,
                                color: isHighlighted ? colors.activeText : colors.text
                            }}
                        />
                        {item.children && (
                            isOpen
                                ? <ExpandLess sx={{ color: colors.activeText }} />
                                : <ExpandMore sx={{ color: colors.text }} />
                        )}
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
                                            bgcolor: childActive ? 'rgba(17, 82, 212, 0.15)' : 'transparent',
                                            '&:hover': {
                                                bgcolor: childActive ? 'rgba(17, 82, 212, 0.15)' : 'rgba(17, 82, 212, 0.05)',
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
                    {displayMenuItems.map((item) => (
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
                    {isAuthenticated && (
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
                    )}
                </List>
            </Box>
        </Box>
    );
};

export default LearnerSidebar;

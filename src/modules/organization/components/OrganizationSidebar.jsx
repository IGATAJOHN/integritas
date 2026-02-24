import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Button,
    Drawer,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    LogoutOutlined,
    DashboardOutlined,
    AddBusinessOutlined,
    GroupAddOutlined,
    RouteOutlined,
    AssignmentTurnedInOutlined,
    QueryStatsOutlined,
    TaskOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts';
import { canManageOrganization, getOrganizationRole } from '../../../utils';

const DRAWER_WIDTH = 260;

const OrganizationSidebar = ({
    mobileOpen = false,
    onDrawerClose = () => { },
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { logout, user } = useAuth();

    const organizationRole = getOrganizationRole(user);
    const canManage = canManageOrganization(user);

    const navItems = useMemo(() => {
        const baseItems = [
            { path: '/org', label: 'Dashboard', icon: <DashboardOutlined sx={{ fontSize: 22 }} /> },
            { path: '/org/create', label: 'Create Organization', icon: <AddBusinessOutlined sx={{ fontSize: 22 }} /> },
        ];

        if (canManage) {
            baseItems.push(
                { path: '/org/invitations', label: 'Invitations', icon: <GroupAddOutlined sx={{ fontSize: 22 }} /> },
                { path: '/org/learning-paths', label: 'Learning Paths', icon: <RouteOutlined sx={{ fontSize: 22 }} /> },
                { path: '/org/assignments', label: 'Assignments', icon: <AssignmentTurnedInOutlined sx={{ fontSize: 22 }} /> },
                { path: '/org/reports', label: 'Reports', icon: <QueryStatsOutlined sx={{ fontSize: 22 }} /> },
            );
        }

        if (organizationRole) {
            baseItems.push(
                { path: '/org/my-assignments', label: 'My Assignments', icon: <TaskOutlined sx={{ fontSize: 22 }} /> }
            );
        }

        return baseItems;
    }, [canManage, organizationRole]);

    const isActive = (path) => {
        if (path === '/org') {
            return location.pathname === '/org';
        }
        return location.pathname.startsWith(path);
    };

    const handleNavClick = (item) => {
        navigate(item.path);
        if (isMobile) {
            onDrawerClose();
        }
    };

    const drawerContent = (
        <Box
            sx={{
                width: DRAWER_WIDTH,
                minWidth: DRAWER_WIDTH,
                maxWidth: DRAWER_WIDTH,
                bgcolor: '#0F1729',
                borderRight: '1px solid #1F2937',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflowX: 'hidden',
            }}
        >
            <Box sx={{ p: 2.5 }}>
                <Stack
                    component={Link}
                    to="/"
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{ textDecoration: 'none' }}
                >
                    <Box
                        component="img"
                        src="/src/assets/images/GGH_icon.png"
                        alt="GGH Logo"
                        sx={{ height: 50, width: 50 }}
                    />
                    <Box>
                        <Typography
                            sx={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#FFFFFF',
                                lineHeight: 1.2,
                            }}
                        >
                            Good Governance Hub
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '0.75rem',
                                color: '#6B7280',
                            }}
                        >
                            Organization Portal
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <Box sx={{ flex: 1, py: 2, overflow: 'auto' }}>
                <List sx={{ px: 0 }}>
                    {navItems.map((item) => (
                        <ListItem disablePadding sx={{ mb: 0.5 }} key={item.path}>
                            <ListItemButton
                                onClick={() => handleNavClick(item)}
                                sx={{
                                    borderRadius: 1.5,
                                    py: 1.5,
                                    px: 2,
                                    bgcolor: isActive(item.path) ? '#1152D4' : 'transparent',
                                    '&:hover': {
                                        bgcolor: isActive(item.path) ? '#1152D4' : 'rgba(17, 82, 212, 0.1)',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 40,
                                        color: isActive(item.path) ? '#FFFFFF' : '#6B7280',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: '0.9rem',
                                        fontWeight: isActive(item.path) ? 600 : 400,
                                        color: isActive(item.path) ? '#FFFFFF' : '#9CA3AF',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid #1F2937' }}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LogoutOutlined />}
                    onClick={async () => {
                        await logout();
                        navigate('/login');
                        if (isMobile) onDrawerClose();
                    }}
                    sx={{
                        borderColor: '#374151',
                        color: '#EF4444',
                        textTransform: 'none',
                        py: 1.25,
                        fontSize: '0.9rem',
                        '&:hover': {
                            borderColor: '#EF4444',
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                        },
                    }}
                >
                    Logout
                </Button>
            </Box>
        </Box>
    );

    return (
        <>
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onDrawerClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: DRAWER_WIDTH,
                        bgcolor: '#0F1729',
                        border: 'none',
                        overflowX: 'hidden',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: DRAWER_WIDTH,
                        bgcolor: '#0F1729',
                        border: 'none',
                        borderRight: '1px solid #1F2937',
                        overflowX: 'hidden',
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </>
    );
};

export default OrganizationSidebar;

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
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
    Collapse,
} from '@mui/material';
import {
    SwapHoriz,
    DashboardOutlined,
    PeopleOutlined,
    SettingsOutlined,
    SchoolOutlined,
    BarChartOutlined,
    VerifiedUserOutlined,
    ExpandLess,
    ExpandMore,
    LogoutOutlined,
    AssignmentOutlined,
    ReceiptLongOutlined,
    HistoryOutlined,
    WorkspacePremiumOutlined,
    OndemandVideoOutlined,
} from '@mui/icons-material';
import appTheme from '../../../styles/theme';


const DRAWER_WIDTH = 260;

const AdminSidebar = ({
    mobileOpen = false,
    onDrawerClose = () => { },
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [openSubmenu, setOpenSubmenu] = React.useState('');
    const { logout } = useAuth();

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Still navigate to login even if logout fails
            navigate('/login');
        }
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: <DashboardOutlined sx={{ fontSize: 22 }} /> },
        { path: '/admin/foundational', label: 'Foundational', icon: <WorkspacePremiumOutlined sx={{ fontSize: 22 }} /> },
        { path: '/admin/exemplar-series', label: 'Exemplar Series', icon: <OndemandVideoOutlined sx={{ fontSize: 22 }} /> },
        {
            label: 'User Management',
            icon: <PeopleOutlined sx={{ fontSize: 22 }} />,
            children: [
                { path: '/admin/users/staff', label: 'Staff' },
                { path: '/admin/users/learners', label: 'Learners' },
                { path: '/admin/users/tutors', label: 'Tutors' },
                { path: '/admin/users/reviewers', label: 'Reviewers' },
            ]
        },
        {
            label: 'Course Management',
            icon: <SchoolOutlined sx={{ fontSize: 22 }} />,
            children: [
                { path: '/admin/content/courses', label: 'Courses' },
                { path: '/admin/content/categories', label: 'Categories' },
            ]
        },
        { path: '/admin/kycreview', label: 'KYC Review', icon: <VerifiedUserOutlined sx={{ fontSize: 22 }} /> },
        { path: '/admin/project-submissions', label: 'Project Submissions', icon: <AssignmentOutlined sx={{ fontSize: 22 }} /> },
        { path: '/admin/transactions', label: 'Transactions', icon: <ReceiptLongOutlined sx={{ fontSize: 22 }} /> },
        { path: '/admin/audit-logs', label: 'Audit Logs', icon: <HistoryOutlined sx={{ fontSize: 22 }} /> },
        // { path: '/admin/analytics', label: 'Analytics', icon: <BarChartOutlined sx={{ fontSize: 22 }} /> },
        // { path: '/admin/settings', label: 'Settings', icon: <SettingsOutlined sx={{ fontSize: 22 }} /> },
    ];

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    const handleNavClick = (item) => {
        if (item.children) {
            setOpenSubmenu(openSubmenu === item.label ? '' : item.label);
        } else {
            navigate(item.path);
            if (isMobile) {
                onDrawerClose();
            }
        }
    };

    const sidebarBg = theme.palette.mode === 'dark' ? '#0F1729' : '#FFFFFF';
    const sidebarBorder = theme.palette.mode === 'dark' ? '#1F2937' : '#E2E8F0';

    const hideScrollbar = {
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE/legacy Edge
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    };

    const drawerContent = (
        <Box
            sx={{
                width: DRAWER_WIDTH,
                minWidth: DRAWER_WIDTH,
                maxWidth: DRAWER_WIDTH,
                bgcolor: sidebarBg,
                borderRight: `1px solid ${sidebarBorder}`,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflowX: 'hidden',
            }}
        >
            {/* Logo */}
            <Box sx={{ p: 2.5, }}>
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
                        src="/src/assets/images/integritas_logo.jpg"
                        alt="Integritas Logo"
                        sx={{ height: 50, width: 50 }}
                    />
                    <Box>
                        <Typography
                            sx={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'text.primary',
                                lineHeight: 1.2,
                            }}
                        >
                            Integritas
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '0.75rem',
                                color: 'text.secondary',
                            }}
                        >
                            Admin Portal
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* Navigation */}
            <Box sx={{ flex: 1, py: 2, overflow: 'auto', ...hideScrollbar }}>
                <List sx={{ px: 0 }}>
                    {navItems.map((item) => (
                        <React.Fragment key={item.label}>
                            <ListItem disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => handleNavClick(item)}
                                    sx={{
                                        borderRadius: 1.5,
                                        py: 1.5,
                                        px: 2,
                                        bgcolor: (item.path && isActive(item.path)) || (item.children && openSubmenu === item.label) ? appTheme.colors.brand : 'transparent',
                                        '&:hover': {
                                            bgcolor: (item.path && isActive(item.path)) || (item.children && openSubmenu === item.label) ? appTheme.colors.brand : appTheme.colors.brandLight,
                                        },
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 40,
                                                color: (item.path && isActive(item.path)) || (item.children && openSubmenu === item.label) ? '#FFFFFF' : '#6B7280',
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                fontSize: '0.9rem',
                                                fontWeight: (item.path && isActive(item.path)) || (item.children && openSubmenu === item.label) ? 600 : 400,
                                                color: (item.path && isActive(item.path)) || (item.children && openSubmenu === item.label) ? '#FFFFFF' : '#9CA3AF',
                                            }}
                                        />
                                    </Box>
                                    {item.children && (
                                        openSubmenu === item.label ? <ExpandLess sx={{ color: '#fff' }} /> : <ExpandMore sx={{ color: '#9CA3AF' }} />
                                    )}
                                </ListItemButton>
                            </ListItem>
                            {item.children && (
                                <Collapse in={openSubmenu === item.label} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {item.children.map((child) => (
                                            <ListItemButton
                                                key={child.label}
                                                onClick={() => handleNavClick(child)}
                                                sx={{
                                                    pl: 9,
                                                    borderRadius: 1.5,
                                                    mb: 0.5,
                                                    bgcolor: isActive(child.path) ? 'rgba(17, 82, 212, 0.15)' : 'transparent',
                                                    '&:hover': {
                                                        bgcolor: isActive(child.path) ? 'rgba(17, 82, 212, 0.15)' : 'rgba(17, 82, 212, 0.05)',
                                                    },
                                                }}
                                            >
                                                <ListItemText
                                                    primary={child.label}
                                                    primaryTypographyProps={{
                                                        fontSize: '0.85rem',
                                                        color: isActive(child.path) ? appTheme.colors.brand : '#9CA3AF',
                                                        fontWeight: isActive(child.path) ? 600 : 400,
                                                    }}
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            )}
                        </React.Fragment>
                    ))}
                </List>
            </Box>

            {/* Logout Button */}
            <Box sx={{ p: 2, borderTop: `1px solid ${sidebarBorder}` }}>
                <Button
                    fullWidth
                    onClick={handleLogout}
                    startIcon={<LogoutOutlined />}
                    sx={{
                        justifyContent: 'flex-start',
                        color: '#EF4444',
                        py: 1.5,
                        px: 2,
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        '&:hover': {
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
            {/* Mobile Drawer (Temporary) */}
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
                        bgcolor: sidebarBg,
                        border: 'none',
                        overflowX: 'hidden',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer (Permanent) */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: DRAWER_WIDTH,
                        bgcolor: sidebarBg,
                        border: 'none',
                        borderRight: `1px solid ${sidebarBorder}`,
                        overflowX: 'hidden',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </>
    );
};

export default AdminSidebar;

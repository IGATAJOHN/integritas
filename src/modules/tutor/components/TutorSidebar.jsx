import React from 'react';
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
    Collapse,
} from '@mui/material';
import {
    LogoutOutlined,
    DashboardOutlined,
    SchoolOutlined,
    BarChartOutlined,
    AssignmentOutlined,
    PersonOutlined,
    MenuBookOutlined,
    AccountBalanceOutlined,
    PaymentsOutlined,
    ExpandLess,
    ExpandMore,
} from '@mui/icons-material';
import { isExpertTutor } from '../../../utils';
import { useAuth } from '../../../contexts';
import logo from '../../../assets/images/integritas_logo.jpg';
import appTheme from '../../../styles/theme';


const DRAWER_WIDTH = 260;

const TutorSidebar = ({
    mobileOpen = false,
    onDrawerClose = () => { },
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [openSubmenu, setOpenSubmenu] = React.useState('');
    const { logout, user } = useAuth();
    const showExpertOnly = isExpertTutor(user);

    const navItems = [
        { path: '/tutor', label: 'Dashboard', icon: <DashboardOutlined sx={{ fontSize: 22 }} /> },
        { path: '/tutor/lessons', label: 'Assigned Lessons', icon: <MenuBookOutlined sx={{ fontSize: 22 }} /> },
        ...(showExpertOnly
            ? [
                { path: '/tutor/banking', label: 'Banking', icon: <AccountBalanceOutlined sx={{ fontSize: 22 }} /> },
                { path: '/tutor/earnings', label: 'Earnings', icon: <PaymentsOutlined sx={{ fontSize: 22 }} /> },
            ]
            : []),
    ];

    const isActive = (path) => {
        if (path === '/tutor') { 
            return location.pathname === '/tutor';
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
                        src={logo}
                        alt="Integritas Logo"
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
                            Integritas
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '0.75rem',
                                color: '#6B7280',
                            }}
                        >
                            Tutor Portal
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* Navigation */}
            <Box sx={{ flex: 1, py: 2, overflow: 'auto' }}>
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
                        bgcolor: '#0F1729',
                        border: 'none',
                        overflowX: 'hidden',
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

export default TutorSidebar;


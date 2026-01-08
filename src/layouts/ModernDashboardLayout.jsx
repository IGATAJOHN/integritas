import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    useTheme,
    useMediaQuery,
    Avatar,
    Stack,
    Button,
    Divider,
    Container
} from '@mui/material';
import {
    Menu as MenuIcon,
    ExitToApp as LogoutIcon,
    Settings as SettingsIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon
} from '@mui/icons-material';

const drawerWidth = 260;

/**
 * ModernDashboardLayout Component
 * 
 * A responsive dashboard layout with a sidebar drawer and a main content area.
 * 
 * Features:
 * - Responsive sidebar (permanent on desktop, temporary on mobile)
 * - Theme-aware styling (supports light and dark modes)
 * - Collapsible navigation logic
 * - User welcome header
 * - Centered content layout
 * 
 * @param {Array} sidebarItems - Array of objects defining the sidebar navigation items
 * @param {string} title - Title of the dashboard (displayed in the sidebar or header)
 */
const ModernDashboardLayout = ({ sidebarItems = [], title = 'Dashboard' }) => {
    const theme = useTheme();
    // Check if the screen size is mobile (less than md breakpoint)
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Toggle mobile drawer
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Handle user logout
    const handleLogout = () => {
        // Implement actual logout logic here (e.g., clear tokens, update context)
        console.log('Logging out...');
        navigate('/');
    };

    /**
     * Sidebar Content
     * 
     * This component defines the content inside the drawer.
     * It includes the brand logo, navigation list, and bottom action buttons.
     */
    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0C1322', color: '#fff' }}>
            {/* Logo / Brand Section */}
            <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <PersonIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                        Good Governance Hub
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {title}
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Navigation Items List */}
            <List sx={{ px: 3, pt: 4, flexGrow: 1 }}>
                {sidebarItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 2 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false); // Close drawer on mobile after selection
                                }}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        color: '#fff',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* Bottom Actions (Logout) */}
            <Box sx={{ p: 3 }}>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 2,
                        color: 'rgba(255,255,255,0.6)',
                        '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Log Out" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
            {/* Mobile Drawer Toggle Button */}
            <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' }, position: 'absolute', top: 16, left: 16, zIndex: 1100 }}
            >
                <MenuIcon />
            </IconButton>

            {/* Sidebar Drawer Container */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                {/* Mobile Drawer (Temporary) */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }} // Better open performance on mobile
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#0C1322' },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop Drawer (Permanent) */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', bgcolor: '#0C1322' },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 3, md: 6 },
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    // Use theme background for main content area
                    bgcolor: theme.palette.mode === 'dark' ? '#080D19' : '#F8FAFC',
                    minHeight: '100vh',
                    overflowX: 'hidden'
                }}
            >
                {/* Centered Container for Content */}
                <Container maxWidth="xl" sx={{ mx: 'auto', px: 0 }}>
                    {/* Top Header Section - Only show if showWelcome is true */}
                    {title === 'Learner Portal' && location.pathname === '/learner' && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pt: { xs: 5, md: 0 } }}>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                    Welcome back, Alex
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                                    <Box component="span" sx={{ fontSize: '1.2rem' }}>🔥</Box>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                        You're on a 3-day learning streak. Keep it up!
                                    </Typography>
                                </Stack>
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<CalendarIcon />}
                                sx={{
                                    borderColor: theme.palette.divider,
                                    color: theme.palette.text.primary,
                                    textTransform: 'none',
                                    '&:hover': { borderColor: theme.palette.text.secondary }
                                }}
                            >
                                View Calendar
                            </Button>
                        </Box>
                    )}

                    {/* Render the current page content */}
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
};

export default ModernDashboardLayout;

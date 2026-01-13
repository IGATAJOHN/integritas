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
} from '@mui/material';
import { SwapHoriz } from '@mui/icons-material';

const DRAWER_WIDTH = 260;

const DashboardSidebar = ({
    navItems = [],
    switchRolePath = null,
    switchRoleLabel = 'Switch Role',
    mobileOpen = false,
    onDrawerClose = () => { },
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const isActive = (path, basePath) => {
        if (path === basePath) {
            return location.pathname === basePath;
        }
        return location.pathname.startsWith(path);
    };

    const basePath = navItems.length > 0 ? navItems[0].path : '/';

    const handleNavClick = (path) => {
        navigate(path);
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
                            Tutors Portal
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* Navigation */}
            <Box sx={{ flex: 1, py: 2, overflow: 'auto' }}>
                <List sx={{ px: 1.5 }}>
                    {navItems.map((item) => (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => handleNavClick(item.path)}
                                sx={{
                                    borderRadius: 1.5,
                                    py: 1.5,
                                    px: 2,
                                    bgcolor: isActive(item.path, basePath) ? '#1152D4' : 'transparent',
                                    '&:hover': {
                                        bgcolor: isActive(item.path, basePath) ? '#1152D4' : 'rgba(17, 82, 212, 0.1)',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 40,
                                        color: isActive(item.path, basePath) ? '#FFFFFF' : '#6B7280',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: '0.9rem',
                                        fontWeight: isActive(item.path, basePath) ? 600 : 400,
                                        color: isActive(item.path, basePath) ? '#FFFFFF' : '#9CA3AF',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Switch Role Button */}
            {switchRolePath && (
                <Box sx={{ p: 2, borderTop: '1px solid #1F2937' }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<SwapHoriz />}
                        onClick={() => {
                            navigate(switchRolePath);
                            if (isMobile) onDrawerClose();
                        }}
                        sx={{
                            borderColor: '#374151',
                            color: '#9CA3AF',
                            textTransform: 'none',
                            py: 1.25,
                            fontSize: '0.9rem',
                            '&:hover': {
                                borderColor: '#1152D4',
                                bgcolor: 'rgba(17, 82, 212, 0.1)',
                            },
                        }}
                    >
                        {switchRoleLabel}
                    </Button>
                </Box>
            )}
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

export default DashboardSidebar;

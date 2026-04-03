import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Stack,
    Button,
    IconButton,
    useTheme,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
} from '@mui/material';
import { LightMode, DarkMode, Menu, Close } from '@mui/icons-material';
import { useThemeMode } from '../contexts';
import logo from '../assets/images/GGH_logo.png';
import { useAuth } from '../contexts';

const Header = () => {
    const navItems = [
    { label: 'Courses', to: '/explore' },
    { label: 'About Us', to: '/about-us' },
    { label: 'Partners', to: '/partners' },
];
    const { mode, toggleThemeMode, isDark } = useThemeMode();
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Mobile drawer content
    const drawer = (
        <Box
            sx={{
                width: 280,
                height: '100%',
                bgcolor: isDark ? '#111827' : '#FFFFFF',
                color: isDark ? '#FFFFFF' : '#1E293B',
            }}
        >
            {/* Drawer Header */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ p: 2, borderBottom: `1px solid ${isDark ? '#282E39' : '#E2E8F0'}` }}
            >
                <Box
                    component={Link}
                    to="/"
                    onClick={handleDrawerToggle}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        textDecoration: 'none',
                        color: isDark ? '#FFFFFF' : '#1E293B',
                        fontWeight: 700,
                        fontSize: '1rem',
                    }}
                >
                    <Box
                        component="img"
                        src={logo}
                        alt="Integritas Hub Logo"
                        sx={{ height: 32, width: 'auto' }}
                    />
                    <span>Integritas Hub</span>
                </Box>
                <IconButton
                    onClick={handleDrawerToggle}
                    sx={{ color: isDark ? '#9CA3AF' : '#64748B' }}
                >
                    <Close />
                </IconButton>
            </Stack>

            {/* Navigation Links */}
            <List sx={{ py: 2 }}>
                {navItems.map((item) => (
                    <ListItem key={item.label} disablePadding>
                        <ListItemButton
                            component={Link}
                            to={item.to}
                            onClick={handleDrawerToggle}
                            sx={{
                                py: 1.5,
                                px: 3,
                                '&:hover': {
                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                },
                            }}
                        >
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontWeight: 500,
                                    color: isDark ? '#9CA3AF' : '#64748B',
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider sx={{ borderColor: isDark ? '#282E39' : '#E2E8F0' }} />

            {/* Action Buttons */}
            <Stack spacing={2} sx={{ p: 3 }}>
                <Button
                    component={Link}
                    to="/login"
                    onClick={handleDrawerToggle}
                    fullWidth
                    sx={{
                        bgcolor: isDark ? '#282E39' : '#F1F5F9',
                        '&:hover': {
                            bgcolor: isDark ? '#374151' : '#E2E8F0',
                        },
                        textTransform: 'none',
                        fontWeight: 600,
                        color: isDark ? '#FFFFFF' : '#1E293B',
                        borderRadius: '10px',
                        py: 1.5,
                    }}
                >
                    Login
                </Button>
                <Button
                    component={Link}
                    to="/signup"
                    onClick={handleDrawerToggle}
                    variant="contained"
                    fullWidth
                    sx={{
                        bgcolor: 'rgba(17, 82, 212, 1)',
                        '&:hover': { bgcolor: 'rgba(13, 65, 170, 1)' },
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        py: 1.5,
                    }}
                >
                    Sign Up
                </Button>
                {!isAuthenticated && (
                    <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                        sx={{
                            bgcolor: 'rgba(17, 82, 212, 1)',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 1,
                            px: 3
                        }}
                    >
                        Log in
                    </Button>
                )}
            </Stack>

            {/* Theme Toggle in Drawer */}
            <Box sx={{ px: 3, mt: 2 }}>
                <Button
                    onClick={() => {
                        toggleThemeMode();
                    }}
                    startIcon={isDark ? <LightMode /> : <DarkMode />}
                    fullWidth
                    sx={{
                        color: isDark ? '#9CA3AF' : '#64748B',
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        '&:hover': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        },
                    }}
                >
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                </Button>
            </Box>
        </Box>
    );

    return (
        <>
            <Box
                component="header"
                sx={{
                    bgcolor: isDark ? '#111318D9' : 'rgba(255, 255, 255, 0.95)',
                    borderBottom: `1px solid ${isDark ? '#282E39' : '#E2E8F0'}`,
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Box sx={{ px: { xs: 2, md: 4, lg: 6 } }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ py: 2 }}
                    >
                        {/* Logo */}
                        <Box
                            component={Link}
                            to="/"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                textDecoration: 'none',
                                color: isDark ? '#FFFFFF' : '#1E293B',
                                fontWeight: 700,
                                fontSize: '1.125rem',
                            }}
                        >
                            <Box
                                component="img"
                                src={logo}
                                alt="Integritas Hub Logo"
                                sx={{ height: 36, width: 'auto' }}
                            />
                            <Box
                                component="span"
                                sx={{ display: { xs: 'none', sm: 'inline' } }}
                            >
                                Integritas Hub
                            </Box>
                        </Box>

                        {/* Desktop Navigation */}
                        <Stack
                            direction="row"
                            spacing={4}
                            alignItems="center"
                            sx={{ display: { xs: 'none', md: 'flex' } }}
                        >
                            {/* Navigation */}
                            <Stack direction="row" spacing={4}>
                                {navItems.map((item) => (
                                    <Box
                                        key={item.label}
                                        component={Link}
                                        to={item.to}
                                        sx={{
                                            color: isDark ? '#9CA3AF' : '#64748B',
                                            textDecoration: 'none',
                                            fontWeight: 500,
                                            fontSize: '0.9375rem',
                                            '&:hover': { color: isDark ? '#FFFFFF' : '#1E293B' },
                                        }}
                                    >
                                        {item.label}
                                    </Box>
                                ))}
                            </Stack>

                            {/* Theme Toggle */}
                            <IconButton
                                onClick={toggleThemeMode}
                                sx={{
                                    color: isDark ? '#9CA3AF' : '#64748B',
                                    '&:hover': {
                                        color: isDark ? '#FFFFFF' : '#1E293B',
                                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    },
                                }}
                            >
                                {isDark ? <LightMode /> : <DarkMode />}
                            </IconButton>

                            {/* Actions */}
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Button
                                    component={Link}
                                    to="/login"
                                    sx={{
                                        bgcolor: isDark ? '#282E39' : '#F1F5F9',
                                        '&:hover': {
                                            bgcolor: isDark ? '#374151' : '#E2E8F0',
                                        },
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        color: isDark ? '#FFFFFF' : '#1E293B',
                                        borderRadius: '10px',
                                    }}
                                >
                                    Login
                                </Button>
                                <Button
                                    component={Link}
                                    to="/signup"
                                    variant="contained"
                                    sx={{
                                        bgcolor: 'rgba(17, 82, 212, 1)',
                                        '&:hover': { bgcolor: 'rgba(13, 65, 170, 1)', color: '#FFFFFF' },
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderRadius: '10px',
                                        color: '#FFFFFF',
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </Stack>
                        </Stack>

                        {/* Mobile Menu Button */}
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ display: { xs: 'flex', md: 'none' } }}
                        >
                            <IconButton
                                onClick={toggleThemeMode}
                                sx={{
                                    color: isDark ? '#9CA3AF' : '#64748B',
                                    '&:hover': {
                                        color: isDark ? '#FFFFFF' : '#1E293B',
                                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    },
                                }}
                            >
                                {isDark ? <LightMode /> : <DarkMode />}
                            </IconButton>
                            <IconButton
                                onClick={handleDrawerToggle}
                                sx={{
                                    color: isDark ? '#FFFFFF' : '#1E293B',
                                }}
                            >
                                <Menu />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Box>
            </Box>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        border: 'none',
                    },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default Header;

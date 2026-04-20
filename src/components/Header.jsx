import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
    Popper,
    Paper,
    Grow,
    ClickAwayListener,
    Collapse,
} from '@mui/material';
import { LightMode, DarkMode, Menu, Close, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useThemeMode } from '../contexts';
import logo from '../assets/images/integritas_logo.jpg';
import { useAuth } from '../contexts';

const Header = () => {
    const navItems = [
        { label: 'Home', to: '/', children: [{ label: 'The Vision', to: '/about-us' }] },
        { label: 'Experta Class', to: '/explore' },
        { label: 'Foundational Courses', to: '/explore' },
        { label: 'Partners', to: '/partners' },
    ];
    const { mode, toggleThemeMode, isDark } = useThemeMode();
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownAnchor, setDropdownAnchor] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [mobileExpanded, setMobileExpanded] = useState(null);

    const isActive = (to) =>
        to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
    const { isAuthenticated, user } = useAuth();
    

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
                        alt="Integritas Logo"
                        sx={{ height: 32, width: 40 }}
                    />
                    <span>Integritas</span>
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
                {navItems.map((item) => {
                    const hasChildren = item.children?.length > 0;
                    const isExpanded = mobileExpanded === item.label;
                    return (
                        <React.Fragment key={item.label}>
                            <ListItem disablePadding>
                                <ListItemButton
                                    component={hasChildren ? 'div' : Link}
                                    to={hasChildren ? undefined : item.to}
                                    onClick={() => {
                                        if (hasChildren) {
                                            setMobileExpanded(isExpanded ? null : item.label);
                                        } else {
                                            handleDrawerToggle();
                                        }
                                    }}
                                    sx={{
                                        py: 1.5,
                                        px: 3,
                                        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
                                    }}
                                >
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{ fontWeight: 500, color: isDark ? '#9CA3AF' : '#64748B' }}
                                    />
                                    {hasChildren && (isExpanded ? <ExpandLess sx={{ color: isDark ? '#9CA3AF' : '#64748B' }} /> : <ExpandMore sx={{ color: isDark ? '#9CA3AF' : '#64748B' }} />)}
                                </ListItemButton>
                            </ListItem>
                            {hasChildren && (
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <List disablePadding>
                                        {item.children.map((child) => (
                                            <ListItem key={child.label} disablePadding>
                                                <ListItemButton
                                                    component={Link}
                                                    to={child.to}
                                                    onClick={handleDrawerToggle}
                                                    sx={{
                                                        py: 1.25,
                                                        pl: 5,
                                                        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={child.label}
                                                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500, color: isDark ? '#6B7280' : '#94A3B8' }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            )}
                        </React.Fragment>
                    );
                })}
            </List>

            <Divider sx={{ borderColor: isDark ? '#282E39' : '#E2E8F0' }} />

            {/* Action Buttons */}
            <Stack spacing={2} sx={{ p: 3 }}>
                {isAuthenticated ? (
                    <Button
                        onClick={() => { handleDrawerToggle(); navigate('/learner'); }}
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
                        Go to Dashboard
                    </Button>
                ) : (
                    <>
                        <Button
                            component={Link}
                            to="/login"
                            onClick={handleDrawerToggle}
                            fullWidth
                            sx={{
                                bgcolor: isDark ? '#282E39' : '#F1F5F9',
                                '&:hover': { bgcolor: isDark ? '#374151' : '#E2E8F0' },
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
                            Become an Associate
                        </Button>
                    </>
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
                                alt="Integritas Logo"
                                sx={{ height: "80px", width: 'auto' }}
                            />
                            {/* <Box
                                component="span"
                                sx={{ display: { xs: 'none', sm: 'inline' } }}
                            >
                                Integritas
                            </Box> */}
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
                                {navItems.map((item) => {
                                    const active = isActive(item.to);
                                    const hasChildren = item.children?.length > 0;
                                    const isOpen = openDropdown === item.label;

                                    const linkSx = {
                                        color: active ? 'rgba(17, 82, 212, 1)' : isDark ? '#9CA3AF' : '#64748B',
                                        textDecoration: 'none',
                                        fontWeight: active ? 700 : 500,
                                        fontSize: '0.9375rem',
                                        position: 'relative',
                                        pb: 0.5,
                                        cursor: 'pointer',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: -2,
                                            left: 0,
                                            width: active ? '100%' : '0%',
                                            height: '2px',
                                            bgcolor: 'rgba(17, 82, 212, 1)',
                                            borderRadius: 1,
                                            transition: 'width 0.2s ease',
                                        },
                                        '&:hover': {
                                            color: 'rgba(17, 82, 212, 1)',
                                            '&::after': { width: '100%' },
                                        },
                                    };

                                    if (!hasChildren) {
                                        return (
                                            <Box key={item.label} component={Link} to={item.to} sx={linkSx}>
                                                {item.label}
                                            </Box>
                                        );
                                    }

                                    return (
                                        <ClickAwayListener key={item.label} onClickAway={() => setOpenDropdown(null)}>
                                            <Box sx={{ position: 'relative' }}>
                                                <Box
                                                    sx={{ ...linkSx, display: 'inline-flex', alignItems: 'center', gap: 0.25 }}
                                                    component={Link}
                                                    to={item.to}
                                                    onMouseEnter={(e) => { setDropdownAnchor(e.currentTarget); setOpenDropdown(item.label); }}
                                                    onMouseLeave={() => setOpenDropdown(null)}
                                                >
                                                    {item.label}
                                                    <ExpandMore sx={{ fontSize: 16 }} />
                                                </Box>
                                                <Popper
                                                    open={isOpen}
                                                    anchorEl={dropdownAnchor}
                                                    placement="bottom-start"
                                                    transition
                                                    sx={{ zIndex: 200 }}
                                                >
                                                    {({ TransitionProps }) => (
                                                        <Grow {...TransitionProps} timeout={150}>
                                                            <Paper
                                                                onMouseEnter={() => setOpenDropdown(item.label)}
                                                                onMouseLeave={() => setOpenDropdown(null)}
                                                                sx={{
                                                                    mt: 1,
                                                                    minWidth: 160,
                                                                    bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                                                                    border: `1px solid ${isDark ? '#374151' : '#E2E8F0'}`,
                                                                    borderRadius: 1.5,
                                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                                                    overflow: 'hidden',
                                                                }}
                                                            >
                                                                {item.children.map((child) => (
                                                                    <Box
                                                                        key={child.label}
                                                                        component={Link}
                                                                        to={child.to}
                                                                        sx={{
                                                                            display: 'block',
                                                                            px: 2,
                                                                            py: 1.25,
                                                                            fontSize: '0.875rem',
                                                                            fontWeight: 500,
                                                                            color: isDark ? '#9CA3AF' : '#64748B',
                                                                            textDecoration: 'none',
                                                                            '&:hover': {
                                                                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                                                                color: 'rgba(17, 82, 212, 1)',
                                                                            },
                                                                        }}
                                                                    >
                                                                        {child.label}
                                                                    </Box>
                                                                ))}
                                                            </Paper>
                                                        </Grow>
                                                    )}
                                                </Popper>
                                            </Box>
                                        </ClickAwayListener>
                                    );
                                })}
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
                                {isAuthenticated ? (
                                    <Button
                                        onClick={() => navigate('/learner')}
                                        variant="contained"
                                        sx={{
                                            bgcolor: 'rgba(17, 82, 212, 1)',
                                            '&:hover': { bgcolor: 'rgba(13, 65, 170, 1)' },
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderRadius: '10px',
                                            color: '#FFFFFF',
                                        }}
                                    >
                                        Go to Dashboard
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            component={Link}
                                            to="/login"
                                            sx={{
                                                bgcolor: isDark ? '#282E39' : '#F1F5F9',
                                                '&:hover': { bgcolor: isDark ? '#374151' : '#E2E8F0' },
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
                                            Become an Associate
                                        </Button>
                                    </>
                                )}
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

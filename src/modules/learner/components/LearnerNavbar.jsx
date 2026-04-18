import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    InputBase,
    IconButton,
    Stack,
    Avatar,
    Menu,
    MenuItem,
    Badge,
    useTheme,
    alpha
} from '@mui/material';
import {
    Search,
    NotificationsNone as BellIcon,
    ExpandMore as ChevronDownIcon,
    Menu as MenuIcon,
    LightMode,
    DarkMode,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth, useThemeMode } from '../../../contexts';
import logo from '../../../assets/images/integritas_logo.jpg';

const LearnerNavbar = ({ onMobileMenuToggle }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user, isAuthenticated } = useAuth();
    const { isDark, toggleThemeMode } = useThemeMode();
    const [searchQuery, setSearchQuery] = useState('');
    const [profileAnchor, setProfileAnchor] = useState(null);

    const colors = {
        bg: theme.palette.mode === 'dark' ? '#080D19' : '#FFFFFF',
        paper: theme.palette.mode === 'dark' ? '#0C1322' : '#F8FAFC',
        card: theme.palette.mode === 'dark' ? 'rgba(28, 31, 39, 1)' : '#F1F5F9',
        text: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1E293B',
        textSecondary: theme.palette.mode === 'dark' ? '#94A3B8' : '#64748B',
        primary: '#2563EB',
        border: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)'
    };

    const navLinks = [
        { label: 'Dashboard', path: '/learner' },
        { label: 'Explore', path: '/explore' },
        // { label: 'My Learning', path: '/explore/my-learning' },
        { label: 'Organization', path: '/learner/organization' },
        // { label: 'Community', path: '/community' },
    ];

    const isActiveLink = (path) => {
        if (path === '/learner') return location.pathname === '/learner';
        return location.pathname.startsWith(path);
    };

    const displayNavLinks = isAuthenticated 
        ? navLinks 
        : navLinks.filter(l => l.path === '/explore' || l.path === '/community');

    return (
        <Box
            component="header"
            sx={{
                bgcolor: colors.paper,
                px: { xs: 2, md: 3 },
                py: '12px',
                height: { xs: 'auto', md: '65px' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${colors.border}`,
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxSizing: 'border-box',
                gap: 2
            }}
        >
            {/* Left Section: Mobile Menu + Logo + Search */}
            <Stack direction="row" alignItems="center" spacing={2}>
                {/* Mobile Menu Toggle */}
                <IconButton
                    onClick={onMobileMenuToggle}
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        color: colors.text
                    }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Logo */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    onClick={() => navigate('/learner')}
                    sx={{ cursor: 'pointer' }}
                >
                    <Box
                        component="img"
                        src={logo}
                        alt="Integritas Hub Logo"
                        sx={{ width: 32, height: 32, objectFit: 'contain' }}
                    />
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: colors.text, lineHeight: 1.2 }}
                        >
                            Integritas Hub
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{ color: colors.textSecondary, fontSize: '0.7rem' }}
                        >
                            Learner Portal
                        </Typography>
                    </Box>
                </Stack>

                {/* Search Box */}
               <Box sx={{
                    bgcolor: "#1F2937",
                    borderRadius: 1,
                    px: 2,
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    gap: 1,
                    width: '260px',
                    height: '40px'
                }}>
                    <Search sx={{ color: "#9CA3AF", fontSize: 20 }} />
                    <InputBase
                        placeholder="Search courses"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            color: "#FFFFFF",
                            fontSize: '0.9rem',
                            width: '100%',
                            '& input': {
                                border: 'none',
                                outline: 'none',
                                '&:focus': {
                                    border: 'none',
                                    outline: 'none'
                                }
                            }
                        }}
                    />
                </Box>
            </Stack>

            {/* Right Section: Nav Links + Actions */}
            <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
                {/* Navigation Links (Desktop) */}
                <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', lg: 'flex' }, mr: 2 }}>
                    {displayNavLinks.map((link) => (
                        <Typography
                            key={link.label}
                            onClick={() => navigate(link.path)}
                            sx={{
                                color: isActiveLink(link.path) ? colors.primary : colors.textSecondary,
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: isActiveLink(link.path) ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                                '&:hover': { color: colors.primary }
                            }}
                        >
                            {link.label}
                        </Typography>
                    ))}
                </Stack>

                {/* Theme Toggle */}
                <IconButton
                    onClick={toggleThemeMode}
                    sx={{
                        color: colors.textSecondary,
                        '&:hover': { color: colors.text, bgcolor: colors.card },
                    }}
                >
                    {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                </IconButton>

                {/* Notifications — hidden until implemented */}
                {/* <IconButton
                    sx={{
                        bgcolor: colors.card,
                        color: colors.text,
                        borderRadius: 2,
                        '&:hover': { bgcolor: alpha(colors.card, 0.8) }
                    }}
                >
                    <Badge badgeContent={3} color="error">
                        <BellIcon fontSize="small" />
                    </Badge>
                </IconButton> */}

                {/* Profile Menu or Login Button */}
                {isAuthenticated ? (
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        onClick={(e) => setProfileAnchor(e.currentTarget)}
                        sx={{
                            cursor: 'pointer',
                            bgcolor: colors.card,
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.5,
                            '&:hover': { bgcolor: alpha(colors.card, 0.8) }
                        }}
                    >
                        <Avatar
                            sx={{ width: 32, height: 32, bgcolor: colors.primary }}
                        >
                            {user?.name?.charAt(0) || user?.first_name?.charAt(0) || 'U'}
                        </Avatar>
                        <Typography
                            sx={{
                                color: colors.text,
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            {user?.name || user?.first_name || 'User'}
                        </Typography>
                        <ChevronDownIcon sx={{ color: colors.textSecondary, fontSize: 18 }} />
                    </Stack>
                ) : (
                    <Button
                        variant="contained"
                        onClick={() => navigate('/login')}
                        sx={{
                            bgcolor: colors.primary,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            '&:hover': { bgcolor: alpha(colors.primary, 0.9) }
                        }}
                    >
                        Log in
                    </Button>
                )}

                <Menu
                    anchorEl={profileAnchor}
                    open={Boolean(profileAnchor)}
                    onClose={() => setProfileAnchor(null)}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                        sx: {
                            bgcolor: colors.paper,
                            color: colors.text,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 2,
                            mt: 1,
                            minWidth: 240,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                            overflow: 'visible',
                        }
                    }}
                >
                    <MenuItem
                        onClick={async () => {
                            setProfileAnchor(null);
                            try {
                                await logout();
                                navigate('/login');
                            } catch (error) {
                                console.error('Logout error:', error);
                                navigate('/login');
                            }
                        }}
                        sx={{
                            gap: 1.5,
                            color: '#EF4444',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' }
                        }}
                    >
                        <LogoutIcon fontSize="small" />
                        Sign out
                    </MenuItem>
                </Menu>
            </Stack>
        </Box>
    );
};

export default LearnerNavbar;

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
    Menu as MenuIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts';
import logo from '../../../assets/images/Integritas Hub_icon.png';

const LearnerNavbar = ({ onMobileMenuToggle }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
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
        { label: 'My Learning', path: '/explore/my-learning' },
        { label: 'Organization', path: '/learner/organization' },
        { label: 'Community', path: '/community' },
    ];

    const isActiveLink = (path) => {
        if (path === '/learner') return location.pathname === '/learner';
        return location.pathname.startsWith(path);
    };

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
                    {navLinks.map((link) => (
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

                {/* Notifications */}
                <IconButton
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
                </IconButton>

                {/* Profile Menu */}
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
                        A
                    </Avatar>
                    <Typography
                        sx={{
                            color: colors.text,
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            display: { xs: 'none', sm: 'block' }
                        }}
                    >
                        Alex
                    </Typography>
                    <ChevronDownIcon sx={{ color: colors.textSecondary, fontSize: 18 }} />
                </Stack>

                <Menu
                    anchorEl={profileAnchor}
                    open={Boolean(profileAnchor)}
                    onClose={() => setProfileAnchor(null)}
                    PaperProps={{
                        sx: {
                            bgcolor: colors.paper,
                            color: colors.text,
                            border: `1px solid ${colors.border}`,
                            mt: 1
                        }
                    }}
                >
                    <MenuItem onClick={() => { setProfileAnchor(null); navigate('/profile'); }}>
                        My Profile
                    </MenuItem>
                    <MenuItem onClick={() => { setProfileAnchor(null); navigate('/settings'); }}>
                        Settings
                    </MenuItem>
                    <MenuItem onClick={async () => { 
                        setProfileAnchor(null); 
                        try {
                            await logout();
                            navigate('/login');
                        } catch (error) {
                            console.error('Logout error:', error);
                            navigate('/login');
                        }
                    }}>
                        Logout
                    </MenuItem>
                </Menu>
            </Stack>
        </Box>
    );
};

export default LearnerNavbar;

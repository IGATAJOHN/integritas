import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Stack,
    Typography,
    IconButton,
    Divider,
} from '@mui/material';
import { Twitter, LinkedIn, YouTube } from '@mui/icons-material';
import { useThemeMode } from '../contexts';

// Theme-aware colors function
const getColors = (isDark) => ({
    bgDarker: isDark ? '#080D19' : '#F8FAFC',
    textWhite: isDark ? '#FFFFFF' : '#1E293B',
    textMuted: isDark ? '#9CA3AF' : '#64748B',
    textDark: isDark ? '#6B7280' : '#94A3B8',
    border: isDark ? '#1F2937' : '#E2E8F0',
    borderLight: isDark ? '#374151' : '#CBD5E1',
});

const Footer = () => {
    const { isDark } = useThemeMode();
    const colors = getColors(isDark);

    const footerColumns = [
        { title: 'Platform', links: ['Browse Courses', 'Accreditation', 'For Institutions', 'Pricing'] },
        { title: 'Company', links: ['About Us', 'Careers', 'Partners', 'news'] },
        { title: 'Resources', links: ['Help Center', 'Research Papers', 'Community', 'Contact'] },
    ];

    const legalLinks = ['Privacy Policy', 'Terms of Service', 'Cookies'];

    return (
        <Box component="footer" sx={{ bgcolor: colors.bgDarker, py: 8, px: { xs: 2, md: 4, lg: 6 } }}>
            <Box maxWidth="lg" sx={{ mx: 'auto' }}>
                <Grid container spacing={6} sx={{ mb: 6 }}>
                    {/* Brand Section */}
                    <Grid item xs={12} lg={4}>
                        <Stack spacing={3}>
                            <Box
                                component={Link}
                                to="/"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    color: colors.textWhite,
                                }}
                            >
                                <Box
                                    component="img"
                                    src="/src/assets/images/GGH_logo.png"
                                    alt="GGH Logo"
                                    sx={{ height: 32, width: 'auto' }}
                                />
                                <span>Good Governance Hub</span>
                            </Box>
                            <Typography sx={{ color: colors.textMuted, fontSize: '0.9375rem', lineHeight: 1.6 }}>
                               Empowering institutions and individuals with
                                the knowledge to build better, more
                                transparent societies.
                            </Typography>
                            <Stack direction="row" spacing={1.5}>
                                <IconButton
                                    component="a"
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ bgcolor: colors.border, '&:hover': { bgcolor: colors.borderLight } }}
                                >
                                    <Twitter sx={{ fontSize: 18, color: colors.textWhite }} />
                                </IconButton>
                                <IconButton
                                    component="a"
                                    href="https://linkedin.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ bgcolor: colors.border, '&:hover': { bgcolor: colors.borderLight } }}
                                >
                                    <LinkedIn sx={{ fontSize: 18, color: colors.textWhite }} />
                                </IconButton>
                                <IconButton
                                    component="a"
                                    href="https://youtube.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ bgcolor: colors.border, '&:hover': { bgcolor: colors.borderLight } }}
                                >
                                    <YouTube sx={{ fontSize: 18, color: colors.textWhite }} />
                                </IconButton>
                            </Stack>
                        </Stack>
                    </Grid>

                    {/* Links Section */}
                    <Grid item xs={12} lg={8}>
                        <Grid container spacing={4}>
                            {footerColumns.map((col) => (
                                <Grid item xs={6} md={4} key={col.title}>
                                    <Typography
                                        sx={{
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: colors.textWhite,
                                            mb: 2.5,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                        }}
                                    >
                                        {col.title}
                                    </Typography>
                                    <Stack spacing={1.5}>
                                        {col.links.map((link) => (
                                            <Box
                                                key={link}
                                                component={Link}
                                                to={`/${link.toLowerCase().replace(' ', '-')}`}
                                                sx={{
                                                    color: colors.textMuted,
                                                    textDecoration: 'none',
                                                    fontSize: '0.9375rem',
                                                    '&:hover': { color: colors.textWhite },
                                                }}
                                            >
                                                {link}
                                            </Box>
                                        ))}
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>

                <Divider sx={{ borderColor: colors.border, mb: 4 }} />

                {/* Bottom Bar */}
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                >
                    <Typography sx={{ fontSize: '0.875rem', color: colors.textDark }}>
                        © 2026 Good Governance Hub. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={4}>
                        {legalLinks.map((item) => (
                            <Box
                                key={item}
                                component={Link}
                                to={`/${item.toLowerCase().replace(' ', '-')}`}
                                sx={{
                                    color: colors.textDark,
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    '&:hover': { color: colors.textWhite },
                                }}
                            >
                                {item}
                            </Box>
                        ))}
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
};

export default Footer;

import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Stack,
    Typography,
    Divider,
} from '@mui/material';
import { Email, Phone, LocationOn } from '@mui/icons-material';
import { useThemeMode } from '../contexts';
import TermsCondition from '../assets/INTEGRITAS_Terms_and_Conditions.pdf';
import theme from '../styles/theme';

const getColors = (isDark) => ({
    bgDarker: isDark ? '#080D19' : '#F8FAFC',
    textWhite: isDark ? '#FFFFFF' : '#1E293B',
    textMuted: isDark ? '#9CA3AF' : '#64748B',
    textDark: isDark ? '#6B7280' : '#94A3B8',
    border: isDark ? '#1F2937' : '#E2E8F0',
});

const Footer = () => {
    const { isDark } = useThemeMode();
    const colors = getColors(isDark);
    const currentYear = new Date().getFullYear();

    const contactItems = [
        {
            icon: <LocationOn sx={{ fontSize: 18, color: theme.colors.brand, flexShrink: 0, mt: '2px' }} />,
            text: 'No. 11 Ado Ekiti Close, Off Emeka Anyaouku Street, Area 11, Garki, Abuja',
        },
        {
            icon: <Phone sx={{ fontSize: 18, color: theme.colors.brand, flexShrink: 0 }} />,
            text: '+2348033278895',
        },
        {
            icon: <Email sx={{ fontSize: 18, color: theme.colors.brand, flexShrink: 0 }} />,
            text: 'mail@fiscaltransparency.org',
        },
    ];

    return (
        <Box component="footer" sx={{ bgcolor: colors.bgDarker, px: { xs: 2, md: 4, lg: 6 } }}>
            <Box maxWidth="lg" sx={{ mx: 'auto' }}>

                {/* Contact Info + Developed By Strip */}
                <Box sx={{ py: 6 }}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        spacing={4}
                    >
                        {/* Contact Details */}
                        <Stack spacing={2}>
                            <Typography
                                sx={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.18em',
                                    color: colors.textDark,
                                    mb: 1,
                                }}
                            >
                                Contact Us
                            </Typography>
                            {contactItems.map((item, i) => (
                                <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                                    {item.icon}
                                    <Typography
                                        sx={{
                                            fontSize: '0.85rem',
                                            color: colors.textMuted,
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {item.text}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>

                        {/* Developed by */}
                        <Typography
                            sx={{
                                fontSize: '0.8rem',
                                color: colors.textDark,
                                lineHeight: 1.6,
                                textAlign: { xs: 'left', md: 'right' },
                                maxWidth: 280,
                            }}
                        >
                            Developed by the{' '}
                            <Box component="span" sx={{ color: colors.textMuted, fontWeight: 600 }}>
                                Center for Fiscal Transparency and Public Integrity (CeFTPI)
                            </Box>
                        </Typography>
                    </Stack>
                </Box>

                <Divider sx={{ borderColor: colors.border }} />

                {/* Bottom Bar */}
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                    sx={{ py: 3 }}
                >
                    <Typography sx={{ fontSize: '0.875rem', color: colors.textDark }}>
                        © {currentYear} Integritas. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={4}>
                        <Box
                            component="a"
                            href={TermsCondition}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                color: '#3B82F6',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                '&:hover': { color: '#60A5FA' },
                            }}
                        >
                            Terms of Service and Privacy Policy
                        </Box>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
};

export default Footer;

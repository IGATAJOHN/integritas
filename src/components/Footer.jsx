import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Stack,
    Typography,
    Divider,
} from '@mui/material';
import { useThemeMode } from '../contexts';

const getColors = (isDark) => ({
    bgDarker: isDark ? '#080D19' : '#F8FAFC',
    textWhite: isDark ? '#FFFFFF' : '#1E293B',
    textMuted: isDark ? '#9CA3AF' : '#64748B',
    textDark: isDark ? '#6B7280' : '#94A3B8',
    border: isDark ? '#1F2937' : '#E2E8F0',
    pill: isDark ? '#111827' : '#FFFFFF',
    pillBorder: isDark ? '#1F2937' : '#E2E8F0',
});

const partners = [
    { name: 'NLGII', full: 'Nigeria Local Government Integrity and Index' },
];

const Footer = () => {
    const { isDark } = useThemeMode();
    const colors = getColors(isDark);

    const legalLinks = ['Privacy', 'Terms', 'Support'];
    const currentYear = new Date().getFullYear();

    return (
        <Box component="footer" sx={{ bgcolor: colors.bgDarker, px: { xs: 2, md: 4, lg: 6 } }}>
            <Box maxWidth="lg" sx={{ mx: 'auto' }}>

                {/* Trust / Social Proof Strip */}
                <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography
                        sx={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.18em',
                            color: colors.textDark,
                            mb: 3,
                        }}
                    >
                        Trusted by officials from
                    </Typography>

                    {/* Partner pills */}
                    <Stack
                        direction="row"
                        flexWrap="wrap"
                        justifyContent="center"
                        gap={2}
                        sx={{ mb: 4 }}
                    >
                        {partners.map((p) => (
                            <Box
                                key={p.name}
                                title={p.full}
                                sx={{
                                    px: 3,
                                    py: 1,
                                    // borderRadius: 50,
                                    // border: `1px solid ${colors.pillBorder}`,
                                    // bgcolor: colors.pill,
                                    // fontSize: '0.8rem',
                                    // fontWeight: 700,
                                    // color: colors.textMuted,
                                    // letterSpacing: '0.05em',
                                    // cursor: 'default',
                                    // transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: 'rgba(17, 82, 212, 0.5)',
                                        color: 'rgba(17, 82, 212, 1)',
                                    },
                                }}
                            >
                                {p.name}
                            </Box>
                        ))}
                    </Stack>

                    {/* Developed by line */}
                    <Typography
                        sx={{
                            fontSize: '0.8rem',
                            color: colors.textDark,
                            lineHeight: 1.6,
                        }}
                    >
                        Developed by the{' '}
                        <Box component="span" sx={{ color: colors.textMuted, fontWeight: 600 }}>
                            Center for Fiscal Transparency and Public Integrity (CeFTPI)
                        </Box>
                    </Typography>
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

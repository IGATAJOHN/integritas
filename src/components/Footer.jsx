import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Stack,
    Typography,
} from '@mui/material';
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

    const legalLinks = ['Privacy', 'Terms', 'Support'];

    return (
        <Box component="footer" sx={{ bgcolor: colors.bgDarker, py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
            <Box maxWidth="lg" sx={{ mx: 'auto' }}>

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

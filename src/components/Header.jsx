import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Stack, Button } from '@mui/material';

// Theme colors
const colors = {
    bgDarker: '#080D19',
    border: '#1F2937',
    textWhite: '#FFFFFF',
    textMuted: '#9CA3AF',
    primary: 'rgba(17, 82, 212, 1)',
    primaryHover: 'rgba(13, 65, 170, 1)',
};


const Header = () => {
    const navItems = ['Courses', 'About Us', 'Partners', 'Contact'];

    return (
        <Box
            component="header"
            sx={{
                bgcolor: colors.bgDarker,
                borderBottom: `1px solid ${colors.border}`,
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}
        >
            <Container maxWidth="lg">
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
                            gap: 1,
                            textDecoration: 'none',
                            color: colors.textWhite,
                            fontWeight: 700,
                            fontSize: '1.125rem',
                        }}
                    >
                        <span>🏛️</span>
                        <span>Good Governance Hub</span>
                    </Box>

                    {/* Navigation */}
                    <Stack
                        direction="row"
                        spacing={4}
                        sx={{ display: { xs: 'none', md: 'flex' } }}
                    >
                        {navItems.map((item) => (
                            <Box
                                key={item}
                                component={Link}
                                to={`/${item.toLowerCase().replace(' ', '-')}`}
                                sx={{
                                    color: colors.textMuted,
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.9375rem',
                                    '&:hover': { color: colors.textWhite },
                                }}
                            >
                                {item}
                            </Box>
                        ))}
                    </Stack>

                    {/* Actions */}
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                            component={Link}
                            to="/login"
                            sx={{
                                color: colors.textMuted,
                                textTransform: 'none',
                                '&:hover': { color: colors.textWhite },
                            }}
                        >
                            Login
                        </Button>
                        <Button
                            component={Link}
                            to="/signup"
                            variant="contained"
                            sx={{
                                bgcolor: colors.primary,
                                '&:hover': { bgcolor: colors.primaryHover },
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Sign Up
                        </Button>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
};

export default Header;

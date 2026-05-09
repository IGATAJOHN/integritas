import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    TextField,
    Stack,
    Alert,
    InputAdornment,
} from '@mui/material';
import { ShieldOutlined } from '@mui/icons-material';
import { useAuth } from '../contexts';
import { getDashboardRoute, isReturnToAllowedForUser } from '../utils';
import { authService } from '../services/api';
import logo from '../assets/images/integritas_logo.jpg';
import theme from '../styles/theme';

const inputSx = {
    '& .MuiOutlinedInput-root': {
        bgcolor: '#1E293B',
        borderRadius: 1.5,
        '& fieldset': { borderColor: '#374151' },
        '&:hover fieldset': { borderColor: '#4B5563' },
        '&.Mui-focused fieldset': { borderColor: theme.colors.brand },
        '&.Mui-error fieldset': { borderColor: '#EF4444' },
    },
    '& .MuiInputBase-input': {
        py: 1.25,
        fontSize: '0.875rem',
        color: '#FFFFFF',
        letterSpacing: '0.25em',
        textAlign: 'center',
        '&::placeholder': { color: '#9CA3AF', opacity: 1, letterSpacing: 'normal' },
    },
};

const TwoFactorChallengePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { completeLogin } = useAuth();
    const currentYear = new Date().getFullYear();

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const challengeToken = useRef(sessionStorage.getItem('2fa_challenge_token'));

    useEffect(() => {
        if (!challengeToken.current) {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = code.replace(/\s/g, '');
        if (trimmed.length !== 6) {
            setError('Please enter the 6-digit code from your authenticator app.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await authService.twoFactorChallenge(challengeToken.current, trimmed);
            sessionStorage.removeItem('2fa_challenge_token');
            const userData = completeLogin(response);

            const dashboardRoute = getDashboardRoute(userData);
            const returnTo = location.state?.from;
            const target = isReturnToAllowedForUser(returnTo, userData) ? returnTo : dashboardRoute;
            navigate(target, { replace: true });
        } catch (err) {
            setError(err?.message || 'Invalid code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
            }}
        >
            {/* Left branding panel */}
            <Box
                sx={{
                    flex: { md: '0 0 45%' },
                    backgroundImage: 'url(/src/assets/images/LoginBg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 6,
                    minHeight: '100vh',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        bgcolor: '#212c4c98', pointerEvents: 'none',
                    }}
                />
                <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <Box
                        component="img"
                        src={logo}
                        alt="Integritas Logo"
                        sx={{ height: 120, width: 400, borderRadius: 2, mb: 2 }}
                    />
                </Box>
            </Box>

            {/* Right form panel */}
            <Box
                sx={{
                    flex: { xs: '1 1 auto', md: '0 0 55%' },
                    bgcolor: '#0C1322',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: { xs: 3, sm: 4, md: 6, lg: 8 },
                    minHeight: '100vh',
                }}
            >
                <Box sx={{ maxWidth: 400, mx: 'auto', width: '100%', my: 'auto' }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Typography sx={{ fontSize: '1.2rem', fontWeight: 600, color: '#FFFFFF' }}>
                            Integritas
                        </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Typography
                            variant="h4"
                            sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: { xs: '1.5rem', md: '2rem' } }}
                        >
                            Two-Factor Auth
                        </Typography>
                        <ShieldOutlined sx={{ color: theme.colors.brand, fontSize: 24 }} />
                    </Stack>

                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem', mb: 3 }}>
                        Open your authenticator app and enter the 6-digit code.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ mb: 3 }}>
                            <Typography
                                sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}
                            >
                                Authentication Code
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="000 000"
                                value={code}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                    setCode(val);
                                }}
                                size="small"
                                inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ShieldOutlined sx={{ color: '#9CA3AF', fontSize: 18 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={inputSx}
                            />
                        </Box>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 2, bgcolor: '#1E293B', color: '#EF4444',
                                    '& .MuiAlert-icon': { color: '#EF4444' },
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading || code.length !== 6}
                            sx={{
                                bgcolor: theme.colors.brand,
                                color: '#FFFFFF',
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                borderRadius: 1.5,
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: theme.colors.brandHover,
                                    boxShadow: theme.shadows.brandGlow,
                                },
                                '&:disabled': { bgcolor: '#374151', color: '#9CA3AF' },
                            }}
                        >
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </Button>
                    </Box>

                    <Typography sx={{ textAlign: 'center', mt: 3, fontSize: '0.875rem', color: '#9CA3AF' }}>
                        <Link
                            to="/login"
                            style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 600 }}
                            onClick={() => sessionStorage.removeItem('2fa_challenge_token')}
                        >
                            ← Back to Login
                        </Link>
                    </Typography>
                </Box>

                <Typography sx={{ textAlign: 'center', fontSize: '0.75rem', color: '#6B7280', pt: 2 }}>
                    © {currentYear} Integritas. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
};

export default TwoFactorChallengePage;

import React from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Stack,
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import { useAuth } from '../contexts';
import { getPostAuthRoute } from '../utils';
import icon from '../assets/images/integritas_logo.jpg';
import theme from '../styles/theme';

const EmailVerifiedPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const status = searchParams.get('status');
    const isSuccess = status === 'ok';

    const handleContinue = () => {
        if (user?.token) {
            navigate(getPostAuthRoute(user), { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#0C1322',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, md: 4 },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: { xs: 2, md: 3 },
                    bgcolor: '#0C1322',
                    zIndex: 10,
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                        component="img"
                        src={icon}
                        alt="Integritas Logo"
                        sx={{ height: 28, width: 28 }}
                    />
                    <Typography
                        sx={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#FFFFFF',
                        }}
                    >
                        Integritas
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={3}>
                    <Typography
                        component={Link}
                        to="/contact"
                        sx={{
                            fontSize: '0.875rem',
                            color: '#9CA3AF',
                            textDecoration: 'none',
                            '&:hover': { color: '#FFFFFF' },
                        }}
                    >
                        Support
                    </Typography>
                    <Typography
                        component={Link}
                        to="/"
                        sx={{
                            fontSize: '0.875rem',
                            color: '#9CA3AF',
                            textDecoration: 'none',
                            '&:hover': { color: '#FFFFFF' },
                        }}
                    >
                        Privacy
                    </Typography>
                </Stack>
            </Box>

            {/* Card */}
            <Box
                sx={{
                    bgcolor: '#1A2230',
                    borderRadius: 3,
                    borderTop: `4px solid ${isSuccess ? theme.colors.brand : '#EF4444'}`,
                    p: { xs: 3, sm: 3.5, md: 4 },
                    maxWidth: 450,
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
            >
                {/* Icon */}
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        bgcolor: isSuccess ? 'rgba(23, 138, 131, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                    }}
                >
                    {isSuccess ? (
                        <CheckCircleOutline sx={{ fontSize: 36, color: theme.colors.brand }} />
                    ) : (
                        <ErrorOutline sx={{ fontSize: 36, color: '#EF4444' }} />
                    )}
                </Box>

                {/* Title */}
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: '#FFFFFF',
                        fontSize: { xs: '1.25rem', md: '1.5rem' },
                        mb: 1.5,
                    }}
                >
                    {isSuccess ? 'Email Verified!' : 'Verification Failed'}
                </Typography>

                {/* Message */}
                <Typography
                    sx={{
                        color: '#9CA3AF',
                        fontSize: '0.9rem',
                        lineHeight: 1.7,
                        mb: 4,
                    }}
                >
                    {isSuccess
                        ? 'Your email address has been successfully verified. You can now access your account and start learning.'
                        : 'The verification link is invalid or has expired. Please request a new verification email and try again.'}
                </Typography>

                {/* CTA Button */}
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleContinue}
                    sx={{
                        bgcolor: isSuccess ? theme.colors.brand : '#3B82F6',
                        color: '#FFFFFF',
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderRadius: 1.5,
                        boxShadow: 'none',
                        '&:hover': {
                            bgcolor: isSuccess ? theme.colors.brandHover : '#2563EB',
                        },
                        mb: 2,
                    }}
                >
                    {isSuccess
                        ? user?.token ? 'Continue to Dashboard' : 'Go to Login'
                        : 'Back to Login'}
                </Button>

                {!isSuccess && (
                    <Button
                        fullWidth
                        variant="outlined"
                        component={Link}
                        to="/verify"
                        sx={{
                            color: '#9CA3AF',
                            borderColor: '#374151',
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            borderRadius: 1.5,
                            '&:hover': {
                                borderColor: '#6B7280',
                                bgcolor: 'rgba(255,255,255,0.04)',
                            },
                        }}
                    >
                        Resend Verification Email
                    </Button>
                )}

                {/* Divider footer */}
                <Box
                    sx={{
                        mt: 3,
                        pt: 3,
                        borderTop: '1px solid #374151',
                    }}
                >
                    <Typography sx={{ fontSize: '0.8rem', color: '#6B7280' }}>
                        Need help?{' '}
                        <Typography
                            component={Link}
                            to="/contact"
                            sx={{
                                fontSize: '0.8rem',
                                color: '#3B82F6',
                                textDecoration: 'none',
                                fontWeight: 500,
                                '&:hover': { textDecoration: 'underline' },
                            }}
                        >
                            Contact support
                        </Typography>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default EmailVerifiedPage;

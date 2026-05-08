import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    TextField,
    Stack,
    Alert,
} from '@mui/material';
import { LockResetOutlined, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../contexts';
import icon from '../assets/images/integritas_logo.jpg';
import theme from '../styles/theme';


const ForgotPasswordPage = () => {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await forgotPassword(email);
            setIsSubmitted(true);
        } catch (err) {
            setError(err?.message || 'Failed to send reset link. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
                    <Box component="img" src={icon} alt="Integritas Logo" sx={{ height: 28, width: 28 }} />
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>
                        Integritas
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={3}>
                    <Typography
                        component={Link}
                        to="/contact"
                        sx={{ fontSize: '0.875rem', color: '#9CA3AF', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}
                    >
                        Support
                    </Typography>
                    <Typography
                        component={Link}
                        to="/"
                        sx={{ fontSize: '0.875rem', color: '#9CA3AF', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}
                    >
                        Privacy
                    </Typography>
                </Stack>
            </Box>

            <Box
                sx={{
                    bgcolor: '#1A2230',
                    borderRadius: 3,
                    borderTop: `4px solid ${theme.colors.brand}`,
                    p: { xs: 3, sm: 3.5, md: 4 },
                    maxWidth: 450,
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
            >
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        bgcolor: theme.colors.brand,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                    }}
                >
                    <LockResetOutlined sx={{ fontSize: 28, color: '#FFFFFF' }} />
                </Box>

                <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: { xs: '1.25rem', md: '1.5rem' }, mb: 1.5 }}
                >
                    Forgot your password?
                </Typography>

                <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem', mb: 3, lineHeight: 1.6 }}>
                    Enter the email address associated with your Integritas account, and we'll email you a secure link to reset your password.
                </Typography>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                            color: '#EF4444',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            '& .MuiAlert-icon': { color: '#EF4444' },
                        }}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                {!isSubmitted ? (
                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ mb: 3, textAlign: 'left' }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                Email Address
                            </Typography>
                            <TextField
                                fullWidth
                                type="email"
                                placeholder="name@organization.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                size="small"
                                autoComplete="email"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: '#0C1322',
                                        borderRadius: 1.5,
                                        '& fieldset': { border: 'none' },
                                        '&:hover fieldset': { border: 'none' },
                                        '&.Mui-focused fieldset': { border: `2px solid ${theme.colors.brand}` },
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.5,
                                        fontSize: '0.875rem',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        '&::placeholder': { color: '#6B7280', opacity: 1 },
                                    },
                                }}
                            />
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={!isValidEmail || isSubmitting}
                            sx={{
                                bgcolor: theme.colors.brand,
                                color: '#FFFFFF',
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                borderRadius: 1.5,
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: theme.colors.brandHover,
                                    boxShadow: theme.shadows.brandGlow,
                                },
                                '&:disabled': { bgcolor: '#374151', color: '#6B7280' },
                            }}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </Box>
                ) : (
                    <Alert
                        severity="success"
                        sx={{
                            bgcolor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10B981',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            '& .MuiAlert-icon': { color: '#10B981' },
                        }}
                    >
                        <Typography sx={{ color: '#10B981', fontSize: '0.875rem', fontWeight: 500 }}>
                            ✓ A password reset link has been sent to {email}. Check your inbox and follow the link to set a new password.
                        </Typography>
                    </Alert>
                )}

                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #374151' }}>
                    <Link
                        to="/login"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.875rem',
                            color: '#3B82F6',
                            textDecoration: 'none',
                            fontWeight: 500,
                        }}
                    >
                        <ArrowBack sx={{ fontSize: 16 }} />
                        Return to Log In
                    </Link>
                </Box>
            </Box>

            <Stack direction="row" spacing={4} sx={{ mt: 4 }}>
                <Typography
                    component={Link}
                    to="/contact"
                    sx={{ fontSize: '0.875rem', color: '#6B7280', textDecoration: 'none', '&:hover': { color: '#9CA3AF' } }}
                >
                    Need help?
                </Typography>
                <Typography
                    component={Link}
                    to="/contact"
                    sx={{ fontSize: '0.875rem', color: '#6B7280', textDecoration: 'none', '&:hover': { color: '#9CA3AF' } }}
                >
                    Contact support
                </Typography>
            </Stack>
        </Box>
    );
};

export default ForgotPasswordPage;

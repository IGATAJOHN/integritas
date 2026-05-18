import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    TextField,
    Stack,
    Alert,
} from '@mui/material';
import {
    EmailOutlined,
} from '@mui/icons-material';
import { useAuth } from '../contexts';
import { getPostAuthRoute } from '../utils';
import icon from '../assets/images/integritas_logo.jpg';
import theme from '../styles/theme';


const VerifyPage = () => {
    const { id, hash } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { verifyEmail, resendEmail, user, logout } = useAuth();

    const [timer, setTimer] = useState(60);
    const [isResending, setIsResending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Handle Auto-Verification from Signed URL
    useEffect(() => {
        const autoVerify = async () => {
            if (id && hash) {
                setIsVerifying(true);
                setError('');
                setSuccess('');

                try {
                    // Extract all query parameters (expires, signature, etc.)
                    const queryParams = Object.fromEntries([...searchParams]);

                    const result = await verifyEmail(id, hash, queryParams);
                    const verifiedUser = result?.user || user;
                    const nextRoute = verifiedUser?.token ? getPostAuthRoute(verifiedUser) : '/login';

                    setSuccess(
                        nextRoute === '/learner/foundational'
                            ? 'Email verified successfully! Continue to the Foundational Courses payment.'
                            : nextRoute === '/login'
                                ? 'Email verified successfully! Log in to continue to payment.'
                            : 'Email verified successfully! Redirecting to dashboard...'
                    );

                    // Delay redirect to show success message
                    setTimeout(() => {
                        navigate(nextRoute, { replace: true });
                    }, 3000);
                } catch (err) {
                    console.error('Auto-verification error:', err);
                    setError(err?.message || 'Verification link is invalid or has expired.');
                } finally {
                    setIsVerifying(false);
                }
            }
        };

        autoVerify();
    }, [id, hash, searchParams, verifyEmail, navigate, user]);

    // Timer countdown
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // Format timer as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResend = async () => {
        setIsResending(true);
        setError('');
        setSuccess('');

        try {
            await resendEmail();
            setTimer(60); // Reset timer to 1 minute
            setSuccess('Verification email has been resent. Please check your inbox.');
        } catch (err) {
            setError(err?.message || 'Failed to resend verification email. Please try again.');
        } finally {
            setIsResending(false);
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

            {/* Verification Card */}
            <Box
                sx={{
                    bgcolor: '#1A2230',
                    borderRadius: 3,
                    borderTop: `4px solid ${theme.colors.brand}`,
                    p: { xs: 3, sm: 3.5, md: 4 },
                    maxWidth: 450,
                    width: '100%',
                    height: 500,
                    textAlign: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
            >
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        bgcolor: theme.colors.brand,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                    }}
                >
                    <EmailOutlined sx={{ fontSize: 28, color: '#FFFFFF' }} />
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
                    {isVerifying ? 'Verifying your email...' : id && hash ? 'Verification in progress' : 'Verify your email'}
                </Typography>

                {/* Description */}
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem', mb: 3 }}>
                    {id && hash ? (
                        'Please wait while we confirm your verification link...'
                    ) : (
                        <>
                            We sent a verification link to{' '}
                            <Box component="span" sx={{ color: '#3B82F6', fontWeight: 600 }}>
                                {user?.email || 'your email'}
                            </Box>
                            . Please click the link in that email to confirm your identity.
                        </>
                    )}
                </Typography>

                {/* Error Alert */}
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                            color: '#EF4444',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            '& .MuiAlert-icon': {
                                color: '#EF4444',
                            },
                        }}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                {/* Success Alert */}
                {success && (
                    <Alert
                        severity="success"
                        sx={{
                            mb: 3,
                            bgcolor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10B981',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            '& .MuiAlert-icon': {
                                color: '#10B981',
                            },
                        }}
                        onClose={() => setSuccess('')}
                    >
                        {success}
                    </Alert>
                )}

                {!id && !hash && (
                    <>
                        <Button
                            fullWidth
                            variant="contained"
                            disabled={isResending || timer > 0 || !user?.token}
                            onClick={handleResend}
                            sx={{
                                bgcolor: theme.colors.brand,
                                color: '#FFFFFF',
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                borderRadius: 1.5,
                                boxShadow: 'none',
                                '&:hover': { bgcolor: theme.colors.brandHover },
                                mb: 1,
                            }}
                        >
                            {isResending ? 'Sending...' : timer > 0 ? `Resend email in ${formatTime(timer)}` : 'Resend Verification Email'}
                        </Button>
                        {!user?.token && (
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.75rem', mb: 3 }}>
                                Log in first to resend the verification email.
                            </Typography>
                        )}
                    </>
                )}

                {/* Footer Link inside card */}
                <Box
                    sx={{
                        pt: 3,
                        borderTop: '1px solid #374151',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Typography
                        onClick={async () => {
                            await logout();
                            navigate('/login');
                        }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.875rem',
                            color: '#3B82F6',
                            cursor: 'pointer',
                            fontWeight: 500,
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        ← {user ? 'Logout & Back to Login' : 'Back to Login'}
                    </Typography>
                </Box>
            </Box>

            {/* Footer Links outside card */}
            <Stack
                direction="row"
                spacing={4}
                sx={{ mt: 4 }}
            >
                <Typography
                    component={Link}
                    to="/contact"
                    sx={{
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        textDecoration: 'none',
                        '&:hover': { color: '#9CA3AF' },
                    }}
                >
                    Need help?
                </Typography>
                <Typography
                    onClick={async () => {
                        try {
                            await logout();
                        } catch {
                            /* ignore — we just need to clear session */
                        }
                        navigate('/signup');
                    }}
                    sx={{
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        '&:hover': { color: '#9CA3AF' },
                    }}
                >
                    Change email address
                </Typography>
            </Stack>
        </Box>
    );
};

export default VerifyPage;

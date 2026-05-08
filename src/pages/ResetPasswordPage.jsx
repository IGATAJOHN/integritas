import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    TextField,
    Stack,
    Alert,
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    LockResetOutlined,
    ArrowBack,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../contexts';
import icon from '../assets/images/integritas_logo.jpg';
import theme from '../styles/theme';


const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { resetPassword } = useAuth();

    const emailFromLink = searchParams.get('email') || '';
    const tokenFromLink = searchParams.get('token') || '';

    const [email, setEmail] = useState(emailFromLink);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isReset, setIsReset] = useState(false);
    const [error, setError] = useState('');

    const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password.length >= 8;
    const passwordsMatch = password === passwordConfirmation && password.length > 0;
    const canSubmit = !!tokenFromLink && isValidEmail && passwordValid && passwordsMatch && !isSubmitting;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!tokenFromLink) {
            setError('Invalid or missing reset token. Please request a new password reset link.');
            return;
        }
        if (!passwordValid) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (!passwordsMatch) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            await resetPassword(email, tokenFromLink, password, passwordConfirmation);
            setIsReset(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err?.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setIsSubmitting(false);
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
                    Set a new password
                </Typography>

                <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem', mb: 3, lineHeight: 1.6 }}>
                    Choose a strong new password for your Integritas account.
                </Typography>

                {!tokenFromLink && (
                    <Alert severity="warning" sx={{ mb: 3, bgcolor: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                        Missing reset token. Please <Link to="/forgot-password" style={{ color: '#3B82F6' }}>request a new link</Link>.
                    </Alert>
                )}

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

                {isReset ? (
                    <Alert
                        severity="success"
                        sx={{
                            bgcolor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10B981',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            '& .MuiAlert-icon': { color: '#10B981' },
                        }}
                    >
                        <Typography sx={{ color: '#10B981', fontSize: '0.9rem', fontWeight: 500 }}>
                            ✓ Password reset successfully! Redirecting to login...
                        </Typography>
                    </Alert>
                ) : (
                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ mb: 2.5, textAlign: 'left' }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                Email Address
                            </Typography>
                            <TextField
                                fullWidth
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                size="small"
                                autoComplete="email"
                                disabled={!!emailFromLink}
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
                                    },
                                }}
                            />
                        </Box>

                        <Box sx={{ mb: 2.5, textAlign: 'left' }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                New Password
                            </Typography>
                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                size="small"
                                autoComplete="new-password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: '#9CA3AF' }}>
                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
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
                                    },
                                }}
                            />
                        </Box>

                        <Box sx={{ mb: 3, textAlign: 'left' }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                Confirm New Password
                            </Typography>
                            <TextField
                                fullWidth
                                type={showPasswordConfirmation ? 'text' : 'password'}
                                placeholder="Confirm new password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                size="small"
                                autoComplete="new-password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)} edge="end" size="small" sx={{ color: '#9CA3AF' }}>
                                                {showPasswordConfirmation ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
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
                                    },
                                }}
                            />
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={!canSubmit}
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
                            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                        </Button>
                    </Box>
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
        </Box>
    );
};

export default ResetPasswordPage;

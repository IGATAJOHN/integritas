import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    TextField,
    Stack,
} from '@mui/material';
import {
    LockResetOutlined,
    ArrowBack,
} from '@mui/icons-material';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log('Password reset requested for:', email);
        // TODO: Implement password reset logic
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 1000);
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
                    <Box
                        component="img"
                        src="/src/assets/images/GGH_icon.png"
                        alt="GGH Logo"
                        sx={{ height: 28, width: 28 }}
                    />
                    <Typography
                        sx={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#FFFFFF',
                        }}
                    >
                        Good Governance Hub
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={3}>
                    <Typography
                        component={Link}
                        to="/support"
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
                        to="/privacy"
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

            {/* Forgot Password Card */}
            <Box
                sx={{
                    bgcolor: '#1A2230',
                    borderRadius: 3,
                    borderTop: '4px solid #1152D4',
                    p: { xs: 3, sm: 3.5, md: 4 },
                    maxWidth: 450,
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
            >
                {/* Key Icon */}
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        bgcolor: '#1152D4',
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
                    Forgot your password?
                </Typography>

                {/* Description */}
                <Typography
                    sx={{
                        color: '#9CA3AF',
                        fontSize: '0.875rem',
                        mb: 3,
                        lineHeight: 1.6,
                    }}
                >
                    No worries. Enter the email address associated with your Good Governance Hub account, and we'll send you instructions to reset it.
                </Typography>

                {!isSubmitted ? (
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                    >
                        {/* Email Field */}
                        <Box sx={{ mb: 3, textAlign: 'left' }}>
                            <Typography
                                sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#E5E7EB',
                                    mb: 0.75,
                                }}
                            >
                                Email Address
                            </Typography>
                            <TextField
                                fullWidth
                                type="email"
                                placeholder="name@governancehub.org"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                size="small"
                                autoComplete="off"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: '#0C1322',
                                        borderRadius: 1.5,
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                        '&:hover fieldset': {
                                            border: 'none',
                                        },
                                        '&.Mui-focused fieldset': {
                                            border: '2px solid #1152D4',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.5,
                                        fontSize: '0.875rem',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        '&::placeholder': {
                                            color: '#6B7280',
                                            opacity: 1,
                                        },
                                    },
                                }}
                            />
                        </Box>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={!isValidEmail || isSubmitting}
                            sx={{
                                bgcolor: '#1152D4',
                                color: '#FFFFFF',
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                borderRadius: 1.5,
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: '#0D41AA',
                                    boxShadow: '0 4px 12px rgba(17, 82, 212, 0.3)',
                                },
                                '&:disabled': {
                                    bgcolor: '#374151',
                                    color: '#6B7280',
                                },
                            }}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ py: 2 }}>
                        <Typography
                            sx={{
                                color: '#10B981',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                            }}
                        >
                            ✓ Reset link sent! Check your email.
                        </Typography>
                    </Box>
                )}

                {/* Back to Login */}
                <Box
                    sx={{
                        mt: 3,
                        pt: 3,
                        borderTop: '1px solid #374151',
                    }}
                >
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

            {/* Footer Links */}
            <Stack
                direction="row"
                spacing={4}
                sx={{ mt: 4 }}
            >
                <Typography
                    component={Link}
                    to="/help"
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
                    component={Link}
                    to="/contact"
                    sx={{
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        textDecoration: 'none',
                        '&:hover': { color: '#9CA3AF' },
                    }}
                >
                    Contact support
                </Typography>
            </Stack>
        </Box>
    );
};

export default ForgotPasswordPage;

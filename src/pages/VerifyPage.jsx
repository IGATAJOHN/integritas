import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../contexts';
import icon from '../assets/images/GGH_icon.png';

const VerifyPage = () => {
    const { resendEmail, user } = useAuth();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const inputRefs = useRef([]);

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

    const handleCodeChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newCode = [...code];
            pastedData.split('').forEach((digit, i) => {
                if (i < 6) newCode[i] = digit;
            });
            setCode(newCode);
            const lastIndex = Math.min(pastedData.length, 5);
            inputRefs.current[lastIndex]?.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const verificationCode = code.join('');
        console.log('Verification code submitted:', verificationCode);
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

    const isCodeComplete = code.every(digit => digit !== '');

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

            {/* Verification Card */}
            <Box
                sx={{
                    bgcolor: '#1A2230',
                    borderRadius: 3,
                    borderTop: '4px solid #1152D4',
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
                        bgcolor: '#1152D4',
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
                    Verify your email
                </Typography>

                {/* Description */}
                <Typography
                    sx={{
                        color: '#9CA3AF',
                        fontSize: '0.875rem',
                        mb: 0.5,
                    }}
                >
                    We sent a secure code to{' '}
                    <Box component="span" sx={{ color: '#3B82F6', fontWeight: 600 }}>
                        {user?.email || 'your email'}
                    </Box>
                    .
                </Typography>
                <Typography
                    sx={{
                        color: '#6B7280',
                        fontSize: '0.875rem',
                        mb: 4,
                    }}
                >
                    Please enter it below to confirm your identity.
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

                {/* Code Input */}
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                >
                    <Stack
                        direction="row"
                        spacing={{ xs: 1, sm: 1.5 }}
                        justifyContent="center"
                        sx={{ mb: 3 }}
                    >
                        {code.map((digit, index) => (
                            <TextField
                                key={index}
                                inputRef={(el) => (inputRefs.current[index] = el)}
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                inputProps={{
                                    maxLength: 1,
                                    style: {
                                        textAlign: 'center',
                                        fontSize: '1.25rem',
                                        fontWeight: 600,
                                        padding: '14px 0',
                                    },
                                }}
                                sx={{
                                    width: { xs: 44, sm: 48 },
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
                                        color: '#FFFFFF',
                                        border: 'none',
                                    },
                                }}
                            />
                        ))}
                    </Stack>

                    {/* Verify Button */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={!isCodeComplete}
                        endIcon={<ArrowForward />}
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
                                bgcolor: '#94A3B8',
                                color: '#FFFFFF',
                            },
                        }}
                    >
                        Verify Email
                    </Button>
                </Box>

                {/* Resend Link */}
                <Typography
                    sx={{
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        mt: 3,
                        mb: 4,
                    }}
                >
                    Didn't receive the email?{' '}
                    <Box
                        component="span"
                        onClick={timer > 0 || isResending ? undefined : handleResend}
                        sx={{
                            color: (isResending || timer > 0) ? '#9CA3AF' : '#3B82F6',
                            cursor: (isResending || timer > 0) ? 'not-allowed' : 'pointer',
                            fontWeight: 500,
                            '&:hover': { 
                                textDecoration: (isResending || timer > 0) ? 'none' : 'underline' 
                            },
                        }}
                    >
                        {isResending ? 'Sending...' : timer > 0 ? `Resend in ${formatTime(timer)}` : 'Click to resend'}
                    </Box>
                </Typography>

                {/* Footer Link inside card */}
                <Box
                    sx={{
                        pt: 3,
                        borderTop: '1px solid #374151',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Link
                        to="/login"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.875rem',
                            color: '#3B82F6',
                            textDecoration: 'none',
                            fontWeight: 500,
                        }}
                    >
                        ← Back to Login
                    </Link>
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
                    to="/change-email"
                    sx={{
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        textDecoration: 'none',
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

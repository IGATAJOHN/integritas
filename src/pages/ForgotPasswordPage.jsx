import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    ArrowForward,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../contexts';
import icon from '../assets/images/GGH_icon.png';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const { forgotPassword, verifyPasswordOtp, resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isPasswordReset, setIsPasswordReset] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(600); // 10 minutes in seconds
    const inputRefs = useRef([]);

    // Timer countdown
    useEffect(() => {
        if (timer > 0 && isSubmitted) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer, isSubmitted]);

    // Format timer as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCodeChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = [...otp];
            pastedData.split('').forEach((digit, i) => {
                if (i < 6) newOtp[i] = digit;
            });
            setOtp(newOtp);
            const lastIndex = Math.min(pastedData.length, 5);
            inputRefs.current[lastIndex]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        
        try {
            await forgotPassword(email);
            setIsSubmitted(true);
            setTimer(600); // Reset timer to 10 minutes
        } catch (err) {
            setError(err?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsVerifying(true);
        
        const otpCode = otp.join('');
        
        try {
            await verifyPasswordOtp(email, otpCode);
            setIsOtpVerified(true);
        } catch (err) {
            setError(err?.message || 'Invalid OTP. Please try again.');
            // Clear OTP on error
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        
        if (password !== passwordConfirmation) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setIsResetting(true);
        const otpCode = otp.join('');
        
        try {
            await resetPassword(email, otpCode, password, passwordConfirmation);
            setIsPasswordReset(true);
            // Redirect to login after 2 seconds
        setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err?.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsResetting(false);
        }
    };

    const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isOtpComplete = otp.every(digit => digit !== '');

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
                    No worries. Enter the email address associated with your Good Governance Hub account, and we'll send you a 6-digit OTP to reset your password.
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
                            {isSubmitting ? 'Sending...' : 'Send OTP'}
                        </Button>
                    </Box>
                ) : !isOtpVerified ? (
                    <Box>
                        {/* Success Message */}
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
                        >
                            <Typography
                                sx={{
                                    color: '#10B981',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                }}
                            >
                                ✓ OTP sent to {email}. Enter the 6-digit code below. Expires in {formatTime(timer)}.
                            </Typography>
                        </Alert>

                        {/* OTP Input Form */}
                        <Box component="form" onSubmit={handleVerifyOtp}>
                            <Typography
                                sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#E5E7EB',
                                    mb: 2,
                                    textAlign: 'left',
                                }}
                            >
                                Enter OTP Code
                            </Typography>
                            <Stack
                                direction="row"
                                spacing={{ xs: 1, sm: 1.5 }}
                                justifyContent="center"
                                sx={{ mb: 3 }}
                            >
                                {otp.map((digit, index) => (
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
                                disabled={!isOtpComplete || isVerifying}
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
                                        bgcolor: '#374151',
                                        color: '#6B7280',
                                    },
                                }}
                            >
                                {isVerifying ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                        </Box>
                    </Box>
                ) : !isPasswordReset ? (
                    <Box>
                        {/* Success Message */}
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
                        >
                            <Typography
                                sx={{
                                    color: '#10B981',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                }}
                            >
                                ✓ OTP verified successfully! Please enter your new password.
                            </Typography>
                        </Alert>

                        {/* Password Reset Form */}
                        <Box component="form" onSubmit={handleResetPassword}>
                            {/* New Password Field */}
                            <Box sx={{ mb: 2.5, textAlign: 'left' }}>
                                <Typography
                                    sx={{
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#E5E7EB',
                                        mb: 0.75,
                                    }}
                                >
                                    New Password
                                </Typography>
                                <TextField
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    size="small"
                                    autoComplete="off"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                    sx={{ color: '#9CA3AF' }}
                                                >
                                                    {showPassword ? (
                                                        <VisibilityOff fontSize="small" />
                                                    ) : (
                                                        <Visibility fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
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

                            {/* Confirm Password Field */}
                            <Box sx={{ mb: 3, textAlign: 'left' }}>
                                <Typography
                                    sx={{
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#E5E7EB',
                                        mb: 0.75,
                                    }}
                                >
                                    Confirm New Password
                                </Typography>
                                <TextField
                                    fullWidth
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    placeholder="Confirm new password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    size="small"
                                    autoComplete="off"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                    edge="end"
                                                    size="small"
                                                    sx={{ color: '#9CA3AF' }}
                                                >
                                                    {showPasswordConfirmation ? (
                                                        <VisibilityOff fontSize="small" />
                                                    ) : (
                                                        <Visibility fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
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

                            {/* Reset Password Button */}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={!password || !passwordConfirmation || isResetting}
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
                                        bgcolor: '#374151',
                                        color: '#6B7280',
                                    },
                                }}
                            >
                                {isResetting ? 'Resetting Password...' : 'Reset Password'}
                        </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ py: 2 }}>
                        <Alert 
                            severity="success" 
                            sx={{ 
                                bgcolor: 'rgba(16, 185, 129, 0.1)',
                                color: '#10B981',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                '& .MuiAlert-icon': {
                                    color: '#10B981',
                                },
                            }}
                        >
                        <Typography
                            sx={{
                                color: '#10B981',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                            }}
                        >
                                ✓ Password reset successfully! Redirecting to login...
                        </Typography>
                        </Alert>
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

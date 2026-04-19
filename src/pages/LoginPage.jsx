import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    TextField,
    Stack,
    IconButton,
    InputAdornment,
    Alert,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    LockOutlined,
} from '@mui/icons-material';
import { useAuth } from '../contexts';
import { getDashboardRoute, isReturnToAllowedForUser } from '../utils';
import logo from '../assets/images/integritas_logo.jpg';
import icon from '../assets/images/integritas_logo.jpg';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);

        try {
            // Login with only email and password - role comes from API response
            const userData = await login(formData.email, formData.password);
            
            // Get role from API response only
            const userRole = userData?.role || userData?.userType;
            
            if (!userRole) {
                setError('Unable to determine user role. Please contact support.');
                setLoading(false);
                return;
            }

            const dashboardRoute = getDashboardRoute(userData || userRole);
            const returnTo = location.state?.from;
            const target = isReturnToAllowedForUser(returnTo, userData) ? returnTo : dashboardRoute;
            navigate(target, { replace: true });
        } catch (err) {
            console.error('Login error:', err);
            setError(err?.message || 'Login failed. Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
            }}
        >
            {/* Left Panel - Branding */}
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
                {/* Dark transparent overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: '#212c4c98',
                        pointerEvents: 'none',
                    }}
                />

                {/* Content */}
                <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    {/* Icon */}
                    <Box
                        component="img"
                        src={logo}
                        alt="Integritas Logo"
                        sx={{ height: 120, width: 400, borderRadius: 2, mb: 2 }}
                    />

                    {/* Title */}
                    <Typography
                        variant="h4"
                        sx={{
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: { xs: '1.5rem', md: '1.75rem' },
                            mb: 2,
                        }}
                    >
                        Governance Reimagined
                    </Typography>

                    {/* Description */}
                    <Typography
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.875rem',
                            lineHeight: 1.7,
                            maxWidth: 320,
                            mx: 'auto',
                        }}
                    >
                        Ensuring transparency, accountability, and secure
                        access for all governance professionals
                        worldwide.
                    </Typography>
                </Box>
            </Box>

            {/* Right Panel - Login Form */}
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
                    {/* Logo and Title */}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        {/* <Box
                            component="img"
                            src={icon}
                            alt="Integritas Logo"
                            sx={{ height: 50, width: 500, }}
                        /> */}
                        <Typography
                            sx={{
                                fontSize: '1.2rem',
                                fontWeight: 600,
                                color: '#FFFFFF',
                            }}
                        >
                            Integritas
                        </Typography>
                    </Stack>

                    {/* Welcome Title */}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: '#FFFFFF',
                                fontSize: { xs: '1.5rem', md: '2rem' },
                            }}
                        >
                            Welcome back
                        </Typography>
                        <LockOutlined sx={{ color: '#1152D4', fontSize: 24 }} />
                    </Stack>

                    {/* Subtitle */}
                    <Typography
                        sx={{
                            color: '#9CA3AF',
                            fontSize: '0.875rem',
                            mb: 3,
                        }}
                    >
                        Secure Access for Governance Professionals
                    </Typography>

                    {/* Login Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <Box sx={{ mb: 2.5 }}>
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
                                name="email"
                                type="email"
                                placeholder="name@organization.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                size="small"
                                autoComplete="off"
                                inputProps={{
                                    autoComplete: 'new-email',
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: '#1E293B',
                                        borderRadius: 1.5,
                                        '& fieldset': {
                                            borderColor: '#374151',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#4B5563',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1152D4',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.25,
                                        fontSize: '0.875rem',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        '&::placeholder': {
                                            color: '#9CA3AF',
                                            opacity: 1,
                                        },
                                    },
                                }}
                            />
                        </Box>

                        {/* Password Field */}
                        <Box sx={{ mb: 3 }}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{ mb: 0.75 }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#E5E7EB',
                                    }}
                                >
                                    Password
                                </Typography>
                                <Link
                                    to="/forgot-password"
                                    style={{
                                        fontSize: '0.75rem',
                                        color: '#3B82F6',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                    }}
                                >
                                    Forgot Password?
                                </Link>
                            </Stack>
                            <TextField
                                fullWidth
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                size="small"
                                autoComplete="off"
                                inputProps={{
                                    autoComplete: 'new-password',
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleTogglePassword}
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
                                        bgcolor: '#1E293B',
                                        borderRadius: 1.5,
                                        '& fieldset': {
                                            borderColor: '#374151',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#4B5563',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1152D4',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.25,
                                        fontSize: '0.875rem',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        '&::placeholder': {
                                            color: '#9CA3AF',
                                            opacity: 1,
                                        },
                                    },
                                }}
                            />
                        </Box>

                        {/* Error Alert */}
                        {error && (
                            <Alert 
                                severity="error" 
                                sx={{ 
                                    mb: 2,
                                    bgcolor: '#1E293B',
                                    color: '#EF4444',
                                    '& .MuiAlert-icon': {
                                        color: '#EF4444',
                                    },
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        {/* Login Button */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                bgcolor: '#1152D4',
                                color: '#FFFFFF',
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                borderRadius: 1.5,
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: '#0D41AA',
                                    boxShadow: '0 4px 12px rgba(17, 82, 212, 0.3)',
                                },
                                '&:disabled': {
                                    bgcolor: '#374151',
                                    color: '#9CA3AF',
                                },
                            }}
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </Button>
                    </Box>

                    {/* Contact Admin Link */}
                    <Typography
                        sx={{
                            textAlign: 'center',
                            mt: 3,
                            fontSize: '0.875rem',
                            color: '#9CA3AF',
                        }}
                    >
                        Don't have an account?{' '}
                        <Link
                            to="/signup"
                            style={{
                                color: '#3B82F6',
                                textDecoration: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Click to Register
                        </Link>
                    </Typography>
                </Box>

                {/* Footer - Fixed at bottom */}
                <Typography
                    sx={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        color: '#6B7280',
                        pt: 2,
                    }}
                >
                    © 2026 Integritas. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
};

export default LoginPage;

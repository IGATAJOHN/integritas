import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Box,
    Typography,
    Button,
    TextField,
    Stack,
    IconButton,
    InputAdornment,
    Tabs,
    Tab,
    Collapse,
    Alert,
    FormHelperText,
    Divider,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    LockOutlined,
    ErrorOutline,
    CheckCircleOutline,
    HighlightOff,
} from '@mui/icons-material';
import logo from '../assets/images/integritas_logo.png';
import icon from '../assets/images/integritas_logo.png';
import { getDashboardRoute } from '../utils';

const SignupPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const [role, setRole] = useState('student');

    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
        password_confirmation: false,
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleRoleChange = (event, newValue) => {
        if (newValue !== null) setRole(newValue);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const markTouched = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleTogglePassword = () => setShowPassword((prev) => !prev);
    const handleTogglePasswordConfirmation = () =>
        setShowPasswordConfirmation((prev) => !prev);

    const passwordRules = {
        minLen: formData.password.length >= 8,
        hasUpper: /[A-Z]/.test(formData.password),
        hasNumber: /\d/.test(formData.password),
    };

    const passwordValid =
        passwordRules.minLen &&
        passwordRules.hasUpper &&
        passwordRules.hasNumber;

    const requiredPasswordRulesPass =
        passwordRules.minLen && passwordRules.hasUpper && passwordRules.hasNumber;

    const passwordsMatch =
        formData.password_confirmation.length > 0 &&
        formData.password === formData.password_confirmation;

    const isNameValid = formData.name.trim().length >= 2;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());

    const canSubmit =
        !loading &&
        isNameValid &&
        isEmailValid &&
        requiredPasswordRulesPass &&
        passwordsMatch;

    const showConfirmValidation =
        touched.password_confirmation || formData.password_confirmation.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        setTouched({
            name: true,
            email: true,
            password: true,
            password_confirmation: true,
        });

        if (!isNameValid) {
            setError('Please enter your full name.');
            return;
        }

        if (!isEmailValid) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!requiredPasswordRulesPass) {
            setError('Password does not meet the required rules.');
            return;
        }

        if (!passwordsMatch) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const userData = await register({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                password_confirmation: formData.password_confirmation,
                role: role,
                user_type: role, 
            });

            navigate('/verify');
        } catch (err) {
            console.error(err);
            setError(err?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const RulePill = ({ ok, label, required = true }) => (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.6,
                borderRadius: 999,
                border: '1px solid',
                borderColor: ok ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)',
                bgcolor: ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.10)',
                color: ok ? '#86EFAC' : '#FCA5A5',
                fontSize: '0.75rem',
                lineHeight: 1,
                whiteSpace: 'nowrap',
            }}
        >
            {ok ? (
                <CheckCircleOutline sx={{ fontSize: 16, color: '#22C55E' }} />
            ) : (
                <HighlightOff sx={{ fontSize: 16, color: '#EF4444' }} />
            )}
            <span>
                {label}
                {!required && (
                    <Box component="span" sx={{ ml: 0.75, color: '#9CA3AF' }}>
                        optional
                    </Box>
                )}
            </span>
        </Box>
    );

    const PasswordStrengthBar = () => {
        // quick score: required rules + optional rules
        const score =
            (passwordRules.minLen ? 1 : 0) +
            (passwordRules.hasUpper ? 1 : 0) +
            (passwordRules.hasNumber ? 1 : 0) +
            (passwordRules.hasLower ? 1 : 0) +
            (passwordRules.hasSpecial ? 1 : 0);

        // map score 0..5 to 0..100
        const pct = Math.round((score / 5) * 100);

        const label =
            pct >= 80 ? 'Strong' : pct >= 60 ? 'Good' : pct >= 40 ? 'Okay' : 'Weak';

        return (
            <Box sx={{ mt: 1 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                        Password strength
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                        {label}
                    </Typography>
                </Stack>

                <Box
                    sx={{
                        height: 8,
                        borderRadius: 999,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    <Box
                        sx={{
                            height: '100%',
                            width: `${pct}%`,
                            borderRadius: 999,
                            // neutral “blue” fill fits your theme; no conditional colors needed
                            bgcolor: 'rgba(17, 82, 212, 0.9)',
                            transition: 'width 180ms ease',
                        }}
                    />
                </Box>
            </Box>
        );
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
                    <Box
                        component="img"
                        src={logo}
                        alt="Integritas Hub Logo"
                        sx={{ height: 100, width: 100, borderRadius: 2, mb: 2 }}
                    />

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

                    <Typography
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.875rem',
                            lineHeight: 1.7,
                            maxWidth: 320,
                            mx: 'auto',
                        }}
                    >
                        Ensuring transparency, accountability, and secure access for all
                        governance professionals worldwide.
                    </Typography>
                </Box>
            </Box>

            {/* Right Panel - Signup Form */}
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
                <Box sx={{ maxWidth: 420, mx: 'auto', width: '100%', my: 'auto' }}>
                    {/* Logo and Title */}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Box
                            component="img"
                            src={icon}
                            alt="Integritas Hub Logo"
                            sx={{ height: 50, width: 50 }}
                        />
                        <Typography
                            sx={{ fontSize: '1.2rem', fontWeight: 600, color: '#FFFFFF' }}
                        >
                            Integritas Hub
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
                            Create Account
                        </Typography>
                        <LockOutlined sx={{ color: '#1152D4', fontSize: 24 }} />
                    </Stack>

                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem', mb: 3 }}>
                        Secure Access for Governance Professionals
                    </Typography>

                    {/* Role Tabs */}
                    <Box sx={{ bgcolor: '#1E293B', borderRadius: 2, p: 0.5, mb: 3 }}>
                        <Tabs
                            value={role}
                            onChange={handleRoleChange}
                            variant="fullWidth"
                            TabIndicatorProps={{ style: { display: 'none' } }}
                            sx={{
                                minHeight: 40,
                                '& .MuiTab-root': {
                                    minHeight: 36,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    color: '#9CA3AF',
                                    borderRadius: 1.5,
                                    transition: 'all 0.2s',
                                    '&.Mui-selected': {
                                        color: '#FFFFFF',
                                        bgcolor: '#374151',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                    },
                                },
                            }}
                        >
                            <Tab label="Student" value="student" />
                            <Tab label="Tutor" value="tutor" />
                        </Tabs>
                    </Box>

                    {/* Error Alert */}
                    <Collapse in={!!error}>
                        <Alert
                            severity="error"
                            icon={<ErrorOutline fontSize="inherit" />}
                            sx={{
                                mb: 3,
                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                                color: '#FCA5A5',
                                '& .MuiAlert-icon': { color: '#EF4444' },
                            }}
                        >
                            {error}
                        </Alert>
                    </Collapse>

                    {/* Signup Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                        {/* Name Field */}
                        <Box sx={{ mb: 0.5 }}>
                            <Typography
                                sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#E5E7EB',
                                    mb: 0.75,
                                }}
                            >
                                Full Name
                            </Typography>
                            <TextField
                                fullWidth
                                name="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={() => markTouched('name')}
                                disabled={loading}
                                size="small"
                                autoComplete="off"
                                inputProps={{ autoComplete: 'name' }}
                                error={touched.name && !isNameValid}
                                helperText={
                                    touched.name && !isNameValid ? 'Please enter your full name.' : ' '
                                }
                                FormHelperTextProps={{
                                    sx: { color: '#FCA5A5', m: 0, mt: 0.75 },
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: '#1E293B',
                                        borderRadius: 1.5,
                                        '& fieldset': { borderColor: '#374151' },
                                        '&:hover fieldset': { borderColor: '#4B5563' },
                                        '&.Mui-focused fieldset': { borderColor: '#1152D4' },
                                        '&.Mui-error fieldset': { borderColor: '#EF4444' },
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.25,
                                        fontSize: '0.875rem',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        '&::placeholder': { color: '#9CA3AF', opacity: 1 },
                                    },
                                }}
                            />
                        </Box>

                        {/* Email Field */}
                        <Box sx={{ mb: 0.5 }}>
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
                                onBlur={() => markTouched('email')}
                                disabled={loading}
                                size="small"
                                autoComplete="off"
                                inputProps={{ autoComplete: 'new-email' }}
                                error={touched.email && !isEmailValid}
                                helperText={
                                    touched.email && !isEmailValid
                                        ? 'Please enter a valid email address.'
                                        : ' '
                                }
                                FormHelperTextProps={{
                                    sx: { color: '#FCA5A5', m: 0, mt: 0.75 },
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: '#1E293B',
                                        borderRadius: 1.5,
                                        '& fieldset': { borderColor: '#374151' },
                                        '&:hover fieldset': { borderColor: '#4B5563' },
                                        '&.Mui-focused fieldset': { borderColor: '#1152D4' },
                                        '&.Mui-error fieldset': { borderColor: '#EF4444' },
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.25,
                                        fontSize: '0.875rem',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        '&::placeholder': { color: '#9CA3AF', opacity: 1 },
                                    },
                                }}
                            />
                        </Box>

                        {/* Password Field */}
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                Password
                            </Typography>

                            <TextField
                                fullWidth
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                                error={touched.password && !passwordValid}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleTogglePassword} edge="end" size="small" sx={{ color: '#9CA3AF' }}
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
                                        '& fieldset': { borderColor: '#374151' },
                                        '&:hover fieldset': { borderColor: '#4B5563' },
                                        '&.Mui-focused fieldset': { borderColor: '#1152D4' },
                                        '&.Mui-error fieldset': { borderColor: '#EF4444' },
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.25,
                                        fontSize: '0.875rem',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        '&::placeholder': { color: '#9CA3AF', opacity: 1 },
                                    },
                                }}
                            />

                            {/* Compact validation */}
                            {(touched.password || formData.password.length > 0) && (
                                <Stack spacing={0.5} sx={{ mt: 1 }}>
                                    {[
                                        { ok: passwordRules.minLen, label: 'At least 8 characters' },
                                        { ok: passwordRules.hasUpper, label: 'One uppercase letter' },
                                        { ok: passwordRules.hasNumber, label: 'One number' },
                                    ].map((rule) => (
                                        <Stack key={rule.label} direction="row" spacing={1} alignItems="center">
                                            {rule.ok ? (
                                                <CheckCircleOutline sx={{ fontSize: 16, color: '#22C55E' }} />
                                            ) : (
                                                <HighlightOff sx={{ fontSize: 16, color: '#EF4444' }} />
                                            )}
                                            <Typography sx={{ fontSize: '0.75rem', color: rule.ok ? '#86EFAC' : '#FCA5A5' }}>
                                                {rule.label}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            )}
                        </Box>

                        {/* Password Confirmation Field */}
                        <Box sx={{ mb: 3 }}>
                            <Typography
                                sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#E5E7EB',
                                    mb: 0.75,
                                }}
                            >
                                Confirm Password
                            </Typography>

                            <TextField
                                fullWidth
                                name="password_confirmation"
                                type={showPasswordConfirmation ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={formData.password_confirmation}
                                onChange={handleInputChange}
                                onBlur={() => markTouched('password_confirmation')}
                                disabled={loading}
                                size="small"
                                autoComplete="off"
                                inputProps={{ autoComplete: 'new-password' }}
                                error={showConfirmValidation && !passwordsMatch}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleTogglePasswordConfirmation}
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
                                        bgcolor: '#1E293B',
                                        borderRadius: 1.5,
                                        '& fieldset': { borderColor: '#374151' },
                                        '&:hover fieldset': { borderColor: '#4B5563' },
                                        '&.Mui-focused fieldset': { borderColor: '#1152D4' },
                                        '&.Mui-error fieldset': { borderColor: '#EF4444' },
                                    },
                                    '& .MuiInputBase-input': {
                                        py: 1.25,
                                        fontSize: '0.875rem',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        '&::placeholder': { color: '#9CA3AF', opacity: 1 },
                                    },
                                }}
                            />

                            <Box sx={{ mt: 1 }}>
                                {showConfirmValidation && formData.password_confirmation.length > 0 && (
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 0.75,
                                            px: 1.25,
                                            py: 0.6,
                                            borderRadius: 999,
                                            border: '1px solid',
                                            borderColor: passwordsMatch
                                                ? 'rgba(34,197,94,0.35)'
                                                : 'rgba(239,68,68,0.35)',
                                            bgcolor: passwordsMatch
                                                ? 'rgba(34,197,94,0.12)'
                                                : 'rgba(239,68,68,0.10)',
                                            color: passwordsMatch ? '#86EFAC' : '#FCA5A5',
                                            fontSize: '0.75rem',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {passwordsMatch ? (
                                            <CheckCircleOutline sx={{ fontSize: 16, color: '#22C55E' }} />
                                        ) : (
                                            <HighlightOff sx={{ fontSize: 16, color: '#EF4444' }} />
                                        )}
                                        {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Sign Up Button (disabled until valid) */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={!canSubmit}
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
                                '&.Mui-disabled': {
                                    bgcolor: 'rgba(17, 82, 212, 0.35)',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                },
                            }}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </Box>

                    {/* Login Link */}
                    <Typography
                        sx={{
                            textAlign: 'center',
                            mt: 3,
                            fontSize: '0.875rem',
                            color: '#9CA3AF',
                        }}
                    >
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            style={{
                                color: '#3B82F6',
                                textDecoration: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Log In
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
                    © 2026 Integritas Hub. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
};

export default SignupPage;

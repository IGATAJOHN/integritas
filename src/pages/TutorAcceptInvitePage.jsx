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
import { ArrowBack, Visibility, VisibilityOff, SchoolOutlined } from '@mui/icons-material';
import { authService } from '../services/api';
import icon from '../assets/images/integritas_logo.jpg';
import theme from '../styles/theme';


const TutorAcceptInvitePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tokenFromLink = searchParams.get('token') || '';

    const [bio, setBio] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);
    const [error, setError] = useState('');

    const passwordValid = password.length >= 8;
    const passwordsMatch = password === passwordConfirmation && password.length > 0;
    const canSubmit = !!tokenFromLink && passwordValid && passwordsMatch && bio.trim().length >= 10 && !isSubmitting;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!tokenFromLink) {
            setError('Invalid invite link. Please contact your administrator.');
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
        if (bio.trim().length < 10) {
            setError('Please add a short bio (at least 10 characters).');
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.acceptTutorInvite({
                token: tokenFromLink,
                password,
                password_confirmation: passwordConfirmation,
                bio: bio.trim(),
            });
            setIsAccepted(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err?.message || 'Failed to accept invite. The link may be expired or invalid.');
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
                    bgcolor: '#1A2230',
                    borderRadius: 3,
                    borderTop: `4px solid ${theme.colors.brand}`,
                    p: { xs: 3, sm: 3.5, md: 4 },
                    maxWidth: 480,
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                    <Box component="img" src={icon} alt="Integritas Logo" sx={{ height: 32, width: 32 }} />
                    <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>
                        Integritas
                    </Typography>
                </Stack>

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
                    <SchoolOutlined sx={{ fontSize: 28, color: '#FFFFFF' }} />
                </Box>

                <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: { xs: '1.25rem', md: '1.5rem' }, mb: 1 }}
                >
                    Accept Tutor Invitation
                </Typography>
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem', mb: 3, lineHeight: 1.6 }}>
                    You've been invited to join Integritas as a tutor. Set your password and write a short bio to get started.
                </Typography>

                {!tokenFromLink && (
                    <Alert severity="warning" sx={{ mb: 3, bgcolor: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                        Missing invitation token. Ask your administrator for a fresh invite link.
                    </Alert>
                )}

                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                {isAccepted ? (
                    <Alert
                        severity="success"
                        sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}
                    >
                        <Typography sx={{ color: '#10B981', fontSize: '0.9rem', fontWeight: 500 }}>
                            ✓ Invitation accepted! Redirecting to login...
                        </Typography>
                    </Alert>
                ) : (
                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ mb: 2.5, textAlign: 'left' }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                Short Bio
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                placeholder="Tell learners briefly about yourself and your expertise."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: '#0C1322',
                                        borderRadius: 1.5,
                                        '& fieldset': { border: 'none' },
                                        '&.Mui-focused fieldset': { border: `2px solid ${theme.colors.brand}` },
                                    },
                                    '& .MuiInputBase-input': { color: '#FFFFFF', fontSize: '0.875rem' },
                                }}
                            />
                        </Box>

                        <Box sx={{ mb: 2.5, textAlign: 'left' }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                Set Password
                            </Typography>
                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                placeholder="At least 8 characters"
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
                                        '&.Mui-focused fieldset': { border: `2px solid ${theme.colors.brand}` },
                                    },
                                    '& .MuiInputBase-input': { py: 1.5, color: '#FFFFFF', fontSize: '0.875rem' },
                                }}
                            />
                        </Box>

                        <Box sx={{ mb: 3, textAlign: 'left' }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                Confirm Password
                            </Typography>
                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Re-enter password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                size="small"
                                autoComplete="new-password"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: '#0C1322',
                                        borderRadius: 1.5,
                                        '& fieldset': { border: 'none' },
                                        '&.Mui-focused fieldset': { border: `2px solid ${theme.colors.brand}` },
                                    },
                                    '& .MuiInputBase-input': { py: 1.5, color: '#FFFFFF', fontSize: '0.875rem' },
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
                                '&:hover': { bgcolor: theme.colors.brandHover, boxShadow: theme.shadows.brandGlow },
                                '&:disabled': { bgcolor: '#374151', color: '#6B7280' },
                            }}
                        >
                            {isSubmitting ? 'Accepting Invite...' : 'Accept Invitation'}
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

export default TutorAcceptInvitePage;

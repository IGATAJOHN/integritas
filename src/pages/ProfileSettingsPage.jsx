import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Paper,
    TextField,
    InputAdornment,
    IconButton,
    Switch,
    FormControlLabel,
    Divider,
} from '@mui/material';
import {
    ArrowBack,
    SaveOutlined,
    Visibility,
    VisibilityOff,
    LogoutOutlined,
    PersonOutlineOutlined,
} from '@mui/icons-material';
import { useAuth } from '../contexts';
import { authService } from '../services/api';

const ProfileSettingsPage = () => {
    const navigate = useNavigate();
    const { user, changePassword, logout, refreshUser } = useAuth();

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [publicVerify, setPublicVerify] = useState(false);

    useEffect(() => {
        const value = user?.is_publicly_verifiable ?? user?.publicly_verifiable ?? false;
        setPublicVerify(Boolean(value));
    }, [user]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!currentPassword || !newPassword || !newPasswordConfirmation) {
            setError('All password fields are required.');
            return;
        }
        if (newPassword.length < 8) {
            setError('New password must be at least 8 characters.');
            return;
        }
        if (newPassword !== newPasswordConfirmation) {
            setError('New passwords do not match.');
            return;
        }
        try {
            setBusy(true);
            await changePassword(currentPassword, newPassword, newPasswordConfirmation);
            setSuccess('Password changed. You will need to log back in.');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err?.message || 'Failed to change password.');
        } finally {
            setBusy(false);
        }
    };

    const handleVerifyToggle = async (event) => {
        const value = event.target.checked;
        setPublicVerify(value);
        try {
            setBusy(true);
            await authService.setPublicVerifiable(value);
            await refreshUser?.();
            setSuccess('Profile verifiability updated.');
        } catch (err) {
            setError(err?.message || 'Failed to update profile setting.');
            setPublicVerify(!value);
        } finally {
            setBusy(false);
        }
    };

    const handleLogoutEverywhere = async () => {
        if (!window.confirm('Sign out from all devices?')) return;
        try {
            setBusy(true);
            await authService.logoutAll();
            await logout();
            navigate('/login');
        } catch (err) {
            setError(err?.message || 'Failed to log out from all devices.');
            setBusy(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 4 }}>
            <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 2, md: 3 } }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ color: 'text.secondary', textTransform: 'none', mb: 3 }}
                >
                    Back
                </Button>

                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <PersonOutlineOutlined color="primary" />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Profile Settings
                    </Typography>
                </Stack>

                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Account
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        {user?.name || '—'} · {user?.email || ''}
                    </Typography>

                    <FormControlLabel
                        sx={{ alignItems: 'flex-start', m: 0 }}
                        control={
                            <Switch
                                checked={publicVerify}
                                onChange={handleVerifyToggle}
                                disabled={busy}
                                color="primary"
                            />
                        }
                        label={
                            <Box sx={{ ml: 1 }}>
                                <Typography sx={{ fontWeight: 600 }}>Public certificate verifiability</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Allow anyone with your certificate ID to verify it on the public verify page.
                                </Typography>
                            </Box>
                        }
                    />
                </Paper>

                <Paper component="form" onSubmit={handleChangePassword} variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Change Password
                    </Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Current Password"
                            type={showPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            fullWidth
                            autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            fullWidth
                            autoComplete="new-password"
                        />
                        <TextField
                            label="Confirm New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={newPasswordConfirmation}
                            onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                            fullWidth
                            autoComplete="new-password"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveOutlined />}
                            disabled={busy}
                            sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                        >
                            {busy ? 'Saving…' : 'Change Password'}
                        </Button>
                    </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Sessions
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Sign out from every device using your account. You'll need to log back in everywhere.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutOutlined />}
                        onClick={handleLogoutEverywhere}
                        disabled={busy}
                        sx={{ textTransform: 'none' }}
                    >
                        Sign Out Everywhere
                    </Button>
                </Paper>
            </Box>
        </Box>
    );
};

export default ProfileSettingsPage;

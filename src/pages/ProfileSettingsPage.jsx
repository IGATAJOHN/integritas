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
    SecurityOutlined,
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
    const [mfaSetup, setMfaSetup] = useState(null);
    const [mfaCode, setMfaCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState([]);

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

    const handleEnableMfa = async () => {
        try {
            setBusy(true);
            setError('');
            setSuccess('');
            const res = await authService.enableTwoFactor();
            setMfaSetup(res?.data || res);
            setRecoveryCodes((res?.data || res)?.recovery_codes || []);
            setSuccess('Scan the QR code, then enter your 6-digit code to confirm MFA.');
        } catch (err) {
            setError(err?.message || 'Failed to start MFA setup.');
        } finally {
            setBusy(false);
        }
    };

    const handleConfirmMfa = async () => {
        if (!mfaCode.trim()) {
            setError('Enter the 6-digit code from your authenticator app.');
            return;
        }
        try {
            setBusy(true);
            setError('');
            const res = await authService.confirmTwoFactor(mfaCode.trim());
            setMfaCode('');
            setRecoveryCodes(res?.recovery_codes || res?.data?.recovery_codes || recoveryCodes);
            await refreshUser?.();
            setSuccess('MFA is active for this account.');
        } catch (err) {
            setError(err?.message || 'Failed to confirm MFA.');
        } finally {
            setBusy(false);
        }
    };

    const handleRegenerateRecoveryCodes = async () => {
        try {
            setBusy(true);
            setError('');
            const res = await authService.regenerateRecoveryCodes();
            setRecoveryCodes(res?.recovery_codes || res?.data?.recovery_codes || []);
            setSuccess('New recovery codes generated.');
        } catch (err) {
            setError(err?.message || 'Failed to generate recovery codes.');
        } finally {
            setBusy(false);
        }
    };

    const handleDisableMfa = async () => {
        if (!window.confirm('Disable MFA for this account?')) return;
        try {
            setBusy(true);
            setError('');
            await authService.disableTwoFactor();
            setMfaSetup(null);
            setRecoveryCodes([]);
            await refreshUser?.();
            setSuccess('MFA disabled.');
        } catch (err) {
            setError(err?.message || 'MFA cannot be disabled for this role.');
        } finally {
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

                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                        <SecurityOutlined color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Multi-Factor Authentication
                        </Typography>
                    </Stack>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Elevated roles may be required to set up TOTP MFA before continuing.
                    </Typography>

                    {mfaSetup?.qr_code_svg && (
                        <Box
                            sx={{ bgcolor: '#fff', width: 180, height: 180, p: 1, borderRadius: 1, mb: 2 }}
                            dangerouslySetInnerHTML={{ __html: mfaSetup.qr_code_svg }}
                        />
                    )}
                    {mfaSetup?.otpauth_url && (
                        <Typography variant="caption" sx={{ display: 'block', wordBreak: 'break-all', color: 'text.secondary', mb: 2 }}>
                            Manual setup: {mfaSetup.otpauth_url}
                        </Typography>
                    )}

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                        <Button variant="contained" onClick={handleEnableMfa} disabled={busy} sx={{ textTransform: 'none' }}>
                            Start MFA Setup
                        </Button>
                        <TextField
                            label="Authenticator code"
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value)}
                            inputProps={{ maxLength: 6 }}
                            size="small"
                        />
                        <Button variant="outlined" onClick={handleConfirmMfa} disabled={busy || !mfaCode.trim()} sx={{ textTransform: 'none' }}>
                            Confirm
                        </Button>
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Button variant="outlined" onClick={handleRegenerateRecoveryCodes} disabled={busy} sx={{ textTransform: 'none' }}>
                            Recovery Codes
                        </Button>
                        <Button variant="outlined" color="error" onClick={handleDisableMfa} disabled={busy} sx={{ textTransform: 'none' }}>
                            Disable MFA
                        </Button>
                    </Stack>

                    {recoveryCodes.length > 0 && (
                        <Box sx={{ mt: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Recovery codes</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 0.5 }}>
                                {recoveryCodes.map((code) => (
                                    <Typography key={code} sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{code}</Typography>
                                ))}
                            </Box>
                        </Box>
                    )}
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

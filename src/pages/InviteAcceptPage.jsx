import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { apiService } from '../services/api';

const readAuthToken = () => {
    try {
        const raw = localStorage.getItem('user');
        if (!raw) return '';
        const parsed = JSON.parse(raw);
        return String(parsed?.token || '').trim();
    } catch {
        return '';
    }
};

const buildAcceptEndpoint = (baseEndpoint, token) => {
    const safeToken = encodeURIComponent(String(token || '').trim());
    return `${baseEndpoint}?token=${safeToken}`;
};

const withTokenAliases = (payload = {}, token) => ({
    ...payload,
    token,
    invitation_token: token,
    invite_token: token,
});

const InviteAcceptPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = useMemo(() => String(searchParams.get('token') || '').trim(), [searchParams]);
    const isAuthenticated = !!readAuthToken();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        password: '',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLoggedInAccept = async () => {
        if (!token) {
            setError('Invitation token is missing in the URL.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await apiService.post(
                buildAcceptEndpoint('/org-invitations/accept', token),
                withTokenAliases({}, token)
            );
            setSuccess('Invite accepted. Redirecting to organization dashboard...');
            setTimeout(() => {
                window.location.assign('/org');
            }, 600);
        } catch (err) {
            console.error('Failed to accept invitation (logged in):', err);
            setError(err?.message || 'Failed to accept invitation.');
        } finally {
            setLoading(false);
        }
    };

    const handlePublicAccept = async (event) => {
        event.preventDefault();
        if (!token) {
            setError('Invitation token is missing in the URL.');
            return;
        }
        if (!String(formData.name || '').trim() || !String(formData.password || '').trim()) {
            setError('Name and password are required.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const payload = {
                name: String(formData.name || '').trim(),
                password: formData.password,
            };

            await apiService.post(
                buildAcceptEndpoint('/org-invitations/public/accept', token),
                withTokenAliases(payload, token)
            );

            setSuccess('Invite accepted. You can now log in with the invited email and password.');
            setTimeout(() => navigate('/login', { replace: true }), 900);
        } catch (err) {
            console.error('Failed to accept invitation (public):', err);
            setError(err?.message || 'Failed to accept invitation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#0C1322',
                p: 2,
            }}
        >
            <Paper
                sx={{
                    width: '100%',
                    maxWidth: 520,
                    bgcolor: '#1A2230',
                    border: '1px solid #374151',
                    borderRadius: 3,
                    p: { xs: 3, md: 4 },
                }}
            >
                <Stack spacing={2.25}>
                    <Box>
                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                            Accept Organization Invitation
                        </Typography>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                            This page reads your invitation token from the URL link.
                        </Typography>
                    </Box>

                    {!token && (
                        <Alert severity="error">
                            No invitation token was found in this link.
                        </Alert>
                    )}

                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">{success}</Alert>}

                    {isAuthenticated ? (
                        <>
                            <Alert severity="info" sx={{ bgcolor: 'rgba(59,130,246,0.12)', color: '#BFDBFE' }}>
                                You are signed in. Accepting now will link this account to the invited organization.
                            </Alert>

                            <Button
                                variant="contained"
                                onClick={handleLoggedInAccept}
                                disabled={loading || !token}
                                sx={{ bgcolor: '#1152D4', textTransform: 'none', py: 1.2, '&:hover': { bgcolor: '#0E46B5' } }}
                            >
                                {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Accept Invite'}
                            </Button>
                        </>
                    ) : (
                        <Box component="form" onSubmit={handlePublicAccept}>
                            <Stack spacing={2}>
                                <TextField
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    fullWidth
                                    disabled={loading}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: '#1F2937',
                                            color: '#fff',
                                            '& fieldset': { borderColor: '#374151' },
                                            '&:hover fieldset': { borderColor: '#4B5563' },
                                            '&.Mui-focused fieldset': { borderColor: '#1152D4' },
                                        },
                                        '& .MuiInputLabel-root': { color: '#9CA3AF' },
                                    }}
                                />
                                <TextField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    fullWidth
                                    disabled={loading}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: '#1F2937',
                                            color: '#fff',
                                            '& fieldset': { borderColor: '#374151' },
                                            '&:hover fieldset': { borderColor: '#4B5563' },
                                            '&.Mui-focused fieldset': { borderColor: '#1152D4' },
                                        },
                                        '& .MuiInputLabel-root': { color: '#9CA3AF' },
                                    }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading || !token}
                                    sx={{ bgcolor: '#1152D4', textTransform: 'none', py: 1.2, '&:hover': { bgcolor: '#0E46B5' } }}
                                >
                                    {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Accept Invite'}
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
};

export default InviteAcceptPage;

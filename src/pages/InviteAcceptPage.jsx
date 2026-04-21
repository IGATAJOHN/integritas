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
import theme from '../styles/theme';


const INVITE_TOKEN_KEYS = ['token', 'invitation_token', 'invite_token'];

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

const readInviteToken = (searchParams) => {
    const rawSearch = typeof window !== 'undefined' ? String(window.location.search || '') : '';

    for (const key of INVITE_TOKEN_KEYS) {
        const match = rawSearch.match(new RegExp(`[?&]${key}=([^&#]+)`));
        if (!match?.[1]) continue;
        try {
            return decodeURIComponent(match[1]).trim();
        } catch {
            return String(match[1]).trim();
        }
    }

    for (const key of INVITE_TOKEN_KEYS) {
        const value = String(searchParams.get(key) || '').trim();
        if (value) return value;
    }

    return '';
};

const buildAcceptEndpoint = (baseEndpoint, token) => {
    const safeToken = encodeURIComponent(String(token || '').trim());
    return `${baseEndpoint}?token=${safeToken}`;
};

const withTokenAliases = (payload = {}, token) => {
    const safeToken = String(token || '').trim();
    const body = {
        ...payload,
        token: safeToken,
        invitation_token: safeToken,
        invite_token: safeToken,
        invitation: safeToken,
    };

    if (/^\d+$/.test(safeToken)) {
        body.invitation_id = safeToken;
        body.id = safeToken;
    }

    return body;
};

const isRecoverableAcceptError = (error) => {
    const status = Number(error?.status || 0);
    if (status === 404 || status === 405) return true;
    const message = String(error?.message || '').toLowerCase();
    return message.includes('invalid invite token') || message.includes('no query results');
};

const readInvitationOrganizationName = (payload) => {
    const queue = [payload];
    const visited = new Set();

    while (queue.length > 0) {
        const current = queue.shift();
        if (!current || typeof current !== 'object') continue;
        if (visited.has(current)) continue;
        visited.add(current);

        const directName = String(
            current?.organization_name ||
            current?.organizationName ||
            current?.org_name ||
            ''
        ).trim();
        if (directName) return directName;

        const organizationName = String(
            current?.organization?.name ||
            current?.org?.name ||
            ''
        ).trim();
        if (organizationName) return organizationName;

        Object.values(current).forEach((value) => {
            if (value && typeof value === 'object') queue.push(value);
        });
    }

    return '';
};

const postWithFallback = async (requests = []) => {
    let lastError = null;
    for (const request of requests) {
        try {
            return await apiService.post(request.endpoint, request.payload);
        } catch (error) {
            lastError = error;
            if (!isRecoverableAcceptError(error)) throw error;
        }
    }
    throw lastError;
};

const InviteAcceptPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = useMemo(() => readInviteToken(searchParams), [searchParams]);
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
            const payload = withTokenAliases({}, token);
            const response = await postWithFallback([
                { endpoint: '/org-invitations/public/accept', payload },
                { endpoint: buildAcceptEndpoint('/org-invitations/public/accept', token), payload },
            ]);
            const organizationName = readInvitationOrganizationName(response);
            setSuccess(
                organizationName
                    ? `Invite accepted for ${organizationName}. Redirecting to organization...`
                    : 'Invite accepted. Redirecting to organization...'
            );
            setTimeout(() => {
                window.location.assign('/learner/organization');
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

            const acceptPayload = withTokenAliases(payload, token);
            const response = await postWithFallback([
                { endpoint: '/org-invitations/public/accept', payload: acceptPayload },
                { endpoint: buildAcceptEndpoint('/org-invitations/public/accept', token), payload: acceptPayload },
            ]);
            const organizationName = readInvitationOrganizationName(response);
            setSuccess(
                organizationName
                    ? `Invite accepted for ${organizationName}. You can now log in with the invited email and password.`
                    : 'Invite accepted. You can now log in with the invited email and password.'
            );
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
                                sx={{ bgcolor: theme.colors.brand, textTransform: 'none', py: 1.2, '&:hover': { bgcolor: '#0E46B5' } }}
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
                                            '&.Mui-focused fieldset': { borderColor: theme.colors.brand },
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
                                            '&.Mui-focused fieldset': { borderColor: theme.colors.brand },
                                        },
                                        '& .MuiInputLabel-root': { color: '#9CA3AF' },
                                    }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading || !token}
                                    sx={{ bgcolor: theme.colors.brand, textTransform: 'none', py: 1.2, '&:hover': { bgcolor: '#0E46B5' } }}
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

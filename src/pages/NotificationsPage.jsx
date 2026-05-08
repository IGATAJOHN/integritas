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
    IconButton,
    useTheme,
    alpha,
} from '@mui/material';
import {
    NotificationsOutlined,
    ArrowBack,
    DoneAll,
    CircleOutlined,
    CheckCircleOutlined,
} from '@mui/icons-material';
import { notificationsService } from '../services';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [busy, setBusy] = useState(false);

    const refresh = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await notificationsService.list();
            setItems(res?.data || []);
        } catch (err) {
            setError(err?.message || 'Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const handleMarkAll = async () => {
        try {
            setBusy(true);
            await notificationsService.markAllRead();
            await refresh();
        } catch (err) {
            setError(err?.message || 'Failed to mark all as read.');
        } finally {
            setBusy(false);
        }
    };

    const handleMarkOne = async (id) => {
        try {
            await notificationsService.markRead(id);
            setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
        } catch (err) {
            setError(err?.message || 'Failed to mark as read.');
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

                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <NotificationsOutlined color="primary" />
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            Notifications
                        </Typography>
                    </Stack>
                    <Button
                        startIcon={<DoneAll />}
                        onClick={handleMarkAll}
                        disabled={busy || items.length === 0}
                        sx={{ textTransform: 'none' }}
                    >
                        Mark all read
                    </Button>
                </Stack>

                {error && (
                    <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Stack alignItems="center" sx={{ py: 8 }}>
                        <CircularProgress />
                    </Stack>
                ) : items.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">You're all caught up.</Typography>
                    </Paper>
                ) : (
                    <Stack spacing={1}>
                        {items.map((n) => {
                            const unread = !n.read_at;
                            return (
                                <Paper
                                    key={n.id}
                                    variant="outlined"
                                    sx={{
                                        bgcolor: unread ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                                        borderColor: unread ? alpha(theme.palette.primary.main, 0.35) : 'divider',
                                        p: 2,
                                    }}
                                >
                                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontWeight: unread ? 600 : 500, mb: 0.5 }}>
                                                {n.title || n.subject || 'Notification'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {n.message || n.body || ''}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                                            </Typography>
                                        </Box>
                                        {unread ? (
                                            <IconButton onClick={() => handleMarkOne(n.id)} aria-label="Mark as read" color="primary">
                                                <CircleOutlined />
                                            </IconButton>
                                        ) : (
                                            <CheckCircleOutlined sx={{ color: 'success.main', mt: 1 }} />
                                        )}
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

export default NotificationsPage;

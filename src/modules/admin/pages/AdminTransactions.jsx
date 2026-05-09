import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    CircularProgress,
    Alert,
    Paper,
    Chip,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Tabs,
    Tab,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Snackbar,
} from '@mui/material';
import { ReceiptLongOutlined, FlagOutlined } from '@mui/icons-material';
import { adminTransactionsService } from '../services';
import theme from '../../../styles/theme';

const formatNgn = (value) => {
    if (value == null) return '—';
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value);
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(num);
};

const inputSx = {
    '& .MuiOutlinedInput-root': {
        bgcolor: '#1E293B', borderRadius: 1.5,
        '& fieldset': { borderColor: '#374151' },
        '&:hover fieldset': { borderColor: '#4B5563' },
        '&.Mui-focused fieldset': { borderColor: theme.colors.brand },
    },
    '& .MuiInputBase-input': {
        py: 1.25, fontSize: '0.875rem', color: '#FFFFFF',
        '&::placeholder': { color: '#9CA3AF', opacity: 1 },
    },
    '& .MuiInputBase-inputMultiline': { py: 1 },
};

const TABS = [
    { value: 'transactions', label: 'Transactions' },
    { value: 'enrolments', label: 'Enrolments' },
];

const AdminTransactions = () => {
    const [tab, setTab] = useState('transactions');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Flag-for-refund dialog
    const [flagDialog, setFlagDialog] = useState({ open: false, tx: null });
    const [flagReason, setFlagReason] = useState('');
    const [flagging, setFlagging] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const res =
                    tab === 'transactions'
                        ? await adminTransactionsService.listTransactions()
                        : await adminTransactionsService.listEnrolments();
                if (cancelled) return;
                setItems(res?.data || []);
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Failed to load.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [tab]);

    const openFlagDialog = (tx) => {
        setFlagReason('');
        setFlagDialog({ open: true, tx });
    };
    const closeFlagDialog = () => setFlagDialog({ open: false, tx: null });

    const handleFlag = async () => {
        if (!flagReason.trim()) return;
        setFlagging(true);
        try {
            await adminTransactionsService.flagForRefund(flagDialog.tx.id, flagReason.trim());
            setSnackbar({ open: true, message: 'Transaction flagged for refund review.', severity: 'success' });
            closeFlagDialog();
            // Refresh list
            const res = await adminTransactionsService.listTransactions();
            setItems(res?.data || []);
        } catch (err) {
            setSnackbar({ open: true, message: err?.message || 'Failed to flag transaction.', severity: 'error' });
        } finally {
            setFlagging(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <ReceiptLongOutlined sx={{ color: theme.colors.brand }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                    Payments &amp; Enrolments
                </Typography>
            </Stack>

            <Paper sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151', mb: 3 }}>
                <Tabs
                    value={tab}
                    onChange={(_e, v) => setTab(v)}
                    TabIndicatorProps={{ style: { backgroundColor: theme.colors.brand } }}
                    sx={{
                        px: 2,
                        '& .MuiTab-root': {
                            textTransform: 'none', fontWeight: 500, fontSize: '0.875rem',
                            color: '#9CA3AF', minHeight: 48,
                            '&.Mui-selected': { color: theme.colors.brand },
                        },
                    }}
                >
                    {TABS.map((t) => <Tab key={t.value} value={t.value} label={t.label} />)}
                </Tabs>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2, bgcolor: '#1E293B', color: '#EF4444', '& .MuiAlert-icon': { color: '#EF4444' } }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Stack alignItems="center" sx={{ py: 8 }}>
                    <CircularProgress sx={{ color: theme.colors.brand }} />
                </Stack>
            ) : (
                <Paper sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                    <Table size="small">
                        <TableHead>
                            {tab === 'transactions' ? (
                                <TableRow>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Reference</TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Learner</TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Type</TableCell>
                                    <TableCell align="right" sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Amount</TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Date</TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }} />
                                </TableRow>
                            ) : (
                                <TableRow>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Learner</TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Course</TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Enrolled</TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Status</TableCell>
                                </TableRow>
                            )}
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography sx={{ color: '#9CA3AF', py: 4 }}>No records yet.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            {tab === 'transactions' && items.map((tx) => (
                                <TableRow key={tx.id || tx.reference} sx={{ '&:last-child td': { border: 0 } }}>
                                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#9CA3AF', borderBottom: '1px solid #374151' }}>
                                        {tx.reference || '—'}
                                    </TableCell>
                                    <TableCell sx={{ color: '#E5E7EB', borderBottom: '1px solid #374151' }}>
                                        {tx.user?.name || tx.learner?.name || '—'}
                                    </TableCell>
                                    <TableCell sx={{ color: '#E5E7EB', borderBottom: '1px solid #374151' }}>{tx.type || '—'}</TableCell>
                                    <TableCell align="right" sx={{ color: '#E5E7EB', borderBottom: '1px solid #374151' }}>{formatNgn(tx.amount)}</TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Chip
                                            label={tx.status || '—'}
                                            size="small"
                                            sx={{
                                                fontSize: '0.72rem',
                                                bgcolor:
                                                    tx.status === 'success' ? 'rgba(34,197,94,0.12)'
                                                        : tx.status === 'failed' ? 'rgba(239,68,68,0.12)'
                                                            : tx.status === 'refund_requested' ? 'rgba(251,191,36,0.12)'
                                                                : 'rgba(156,163,175,0.12)',
                                                color:
                                                    tx.status === 'success' ? '#22C55E'
                                                        : tx.status === 'failed' ? '#EF4444'
                                                            : tx.status === 'refund_requested' ? '#FBBF24'
                                                                : '#9CA3AF',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151' }}>
                                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '—'}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        {tx.status === 'success' && (
                                            <Tooltip title="Flag for refund">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => openFlagDialog(tx)}
                                                    sx={{ color: '#FBBF24', '&:hover': { bgcolor: 'rgba(251,191,36,0.1)' } }}
                                                >
                                                    <FlagOutlined fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tab === 'enrolments' && items.map((en) => (
                                <TableRow key={en.id} sx={{ '&:last-child td': { border: 0 } }}>
                                    <TableCell sx={{ color: '#E5E7EB', borderBottom: '1px solid #374151' }}>{en.user?.name || en.learner?.name || '—'}</TableCell>
                                    <TableCell sx={{ color: '#E5E7EB', borderBottom: '1px solid #374151' }}>{en.course?.title || '—'}</TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151' }}>
                                        {en.created_at ? new Date(en.created_at).toLocaleDateString() : '—'}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Chip
                                            label={en.status || '—'}
                                            size="small"
                                            sx={{
                                                fontSize: '0.72rem',
                                                bgcolor: en.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(156,163,175,0.12)',
                                                color: en.status === 'active' ? '#22C55E' : '#9CA3AF',
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}

            {/* Flag for Refund Dialog */}
            <Dialog
                open={flagDialog.open}
                onClose={closeFlagDialog}
                PaperProps={{ sx: { bgcolor: '#111827', border: '1px solid #374151', borderRadius: 2, minWidth: 380 } }}
            >
                <DialogTitle sx={{ color: '#FFFFFF', fontWeight: 600, pb: 1 }}>Flag for Refund</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem', mb: 2 }}>
                        Transaction: <Box component="span" sx={{ color: '#E5E7EB', fontFamily: 'monospace' }}>{flagDialog.tx?.reference || flagDialog.tx?.id}</Box>
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                        Reason <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Explain why this transaction should be refunded…"
                        value={flagReason}
                        onChange={(e) => setFlagReason(e.target.value)}
                        sx={inputSx}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        onClick={closeFlagDialog}
                        sx={{ textTransform: 'none', color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={!flagReason.trim() || flagging}
                        onClick={handleFlag}
                        sx={{
                            bgcolor: '#FBBF24', color: '#000',
                            textTransform: 'none', fontWeight: 600,
                            '&:hover': { bgcolor: '#F59E0B' },
                            '&:disabled': { bgcolor: '#374151', color: '#9CA3AF' },
                        }}
                    >
                        {flagging ? 'Flagging…' : 'Flag Transaction'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminTransactions;

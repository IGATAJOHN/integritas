import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    CircularProgress,
    Alert,
    Paper,
    Grid,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Chip,
} from '@mui/material';
import { PaymentsOutlined } from '@mui/icons-material';
import { kycService } from '../services';

const formatNgn = (value) => {
    if (value == null) return '—';
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value);
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(num);
};

const Earnings = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await kycService.getEarnings();
                if (cancelled) return;
                setData(res?.data || res);
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Failed to load earnings.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const summary = data?.summary || {};
    const payouts = data?.payouts || data?.transactions || [];

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: 'auto' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <PaymentsOutlined color="primary" />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Earnings
                </Typography>
            </Stack>

            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Stack alignItems="center" sx={{ py: 8 }}>
                    <CircularProgress />
                </Stack>
            ) : (
                <>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                                    Total Earned
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {formatNgn(summary.total_earned ?? data?.total_earned)}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                                    Available Balance
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {formatNgn(summary.available_balance ?? data?.available_balance)}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                                    Pending Payout
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {formatNgn(summary.pending_payout ?? data?.pending_payout)}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper variant="outlined">
                        <Typography variant="subtitle2" sx={{ p: 2, fontWeight: 700, borderBottom: 1, borderColor: 'divider' }}>
                            Payout History
                        </Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Reference</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payouts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">No payouts yet.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {payouts.map((p) => (
                                    <TableRow key={p.id || p.reference}>
                                        <TableCell>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.reference || '—'}</TableCell>
                                        <TableCell align="right">{formatNgn(p.amount)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={p.status || '—'}
                                                size="small"
                                                color={p.status === 'paid' ? 'success' : p.status === 'failed' ? 'error' : 'default'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default Earnings;

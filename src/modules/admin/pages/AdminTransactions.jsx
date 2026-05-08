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
} from '@mui/material';
import { ReceiptLongOutlined } from '@mui/icons-material';
import { adminTransactionsService } from '../services';

const formatNgn = (value) => {
    if (value == null) return '—';
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value);
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(num);
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
        return () => {
            cancelled = true;
        };
    }, [tab]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <ReceiptLongOutlined color="primary" />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Payments &amp; Enrolments
                </Typography>
            </Stack>

            <Tabs
                value={tab}
                onChange={(_e, v) => setTab(v)}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                {TABS.map((t) => (
                    <Tab key={t.value} value={t.value} label={t.label} sx={{ textTransform: 'none' }} />
                ))}
            </Tabs>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Stack alignItems="center" sx={{ py: 8 }}>
                    <CircularProgress />
                </Stack>
            ) : (
                <Paper variant="outlined">
                    <Table size="small">
                        <TableHead>
                            {tab === 'transactions' ? (
                                <TableRow>
                                    <TableCell>Reference</TableCell>
                                    <TableCell>Learner</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            ) : (
                                <TableRow>
                                    <TableCell>Learner</TableCell>
                                    <TableCell>Course</TableCell>
                                    <TableCell>Enrolled</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            )}
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography color="text.secondary" sx={{ py: 4 }}>
                                            No records yet.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            {tab === 'transactions' &&
                                items.map((tx) => (
                                    <TableRow key={tx.id || tx.reference}>
                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                            {tx.reference || '—'}
                                        </TableCell>
                                        <TableCell>{tx.user?.name || tx.learner?.name || '—'}</TableCell>
                                        <TableCell>{tx.type || '—'}</TableCell>
                                        <TableCell align="right">{formatNgn(tx.amount)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={tx.status || '—'}
                                                size="small"
                                                color={
                                                    tx.status === 'success'
                                                        ? 'success'
                                                        : tx.status === 'failed'
                                                            ? 'error'
                                                            : 'default'
                                                }
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {tab === 'enrolments' &&
                                items.map((en) => (
                                    <TableRow key={en.id}>
                                        <TableCell>{en.user?.name || en.learner?.name || '—'}</TableCell>
                                        <TableCell>{en.course?.title || '—'}</TableCell>
                                        <TableCell>
                                            {en.created_at ? new Date(en.created_at).toLocaleDateString() : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={en.status || '—'}
                                                size="small"
                                                color={en.status === 'active' ? 'success' : 'default'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}
        </Box>
    );
};

export default AdminTransactions;

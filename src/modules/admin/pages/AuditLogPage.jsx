import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { HistoryOutlined, RefreshOutlined, SearchOutlined } from '@mui/icons-material';
import { auditService } from '../services';
import { paperStyle, primaryButtonStyle, textFieldStyle } from '../../../styles/formStyles';
import theme from '../../../styles/theme';

const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

const actorLabel = (item) =>
    item.actor?.name || item.actor_name || item.user?.name || (item.actor_id ? `User #${item.actor_id}` : 'System');

const resourceLabel = (item) => {
    const type = item.auditable_type || item.subject_type || item.resource_type || '';
    const id = item.auditable_id || item.subject_id || item.resource_id || '';
    if (!type && !id) return '-';
    return `${String(type).split('\\').pop() || 'Resource'}${id ? ` #${id}` : ''}`;
};

const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        action: '',
        action_prefix: '',
        actor_id: '',
        auditable_type: '',
        auditable_id: '',
        request_id: '',
        per_page: 25,
    });

    const query = useMemo(() => {
        const trimmed = {};
        Object.entries(filters).forEach(([key, value]) => {
            trimmed[key] = typeof value === 'string' ? value.trim() : value;
        });
        return trimmed;
    }, [filters]);

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const res = await auditService.list(query);
            setLogs(res.data || []);
            setMeta(res.meta || {});
        } catch (err) {
            setError(err?.message || 'Failed to load audit logs.');
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [query]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const updateFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <HistoryOutlined sx={{ color: theme.colors.brand }} />
                    <Box>
                        <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 800 }}>
                            Audit Logs
                        </Typography>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                            Review operational events, actor activity, and affected resources.
                        </Typography>
                    </Box>
                </Stack>
                <Button
                    variant="contained"
                    startIcon={<RefreshOutlined />}
                    onClick={fetchLogs}
                    disabled={loading}
                    sx={{ ...primaryButtonStyle, color: '#FFFFFF', textTransform: 'none', alignSelf: { xs: 'stretch', md: 'center' } }}
                >
                    Refresh
                </Button>
            </Stack>

            <Paper sx={{ ...paperStyle, p: 2.5, mb: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(6, 1fr)' }, gap: 2 }}>
                    <TextField placeholder="Exact action" value={filters.action} onChange={(e) => updateFilter('action', e.target.value)} sx={textFieldStyle} size="small" />
                    <TextField placeholder="Action prefix" value={filters.action_prefix} onChange={(e) => updateFilter('action_prefix', e.target.value)} sx={textFieldStyle} size="small" />
                    <TextField placeholder="Actor ID" value={filters.actor_id} onChange={(e) => updateFilter('actor_id', e.target.value)} sx={textFieldStyle} size="small" />
                    <TextField placeholder="Resource type" value={filters.auditable_type} onChange={(e) => updateFilter('auditable_type', e.target.value)} sx={textFieldStyle} size="small" />
                    <TextField placeholder="Resource ID" value={filters.auditable_id} onChange={(e) => updateFilter('auditable_id', e.target.value)} sx={textFieldStyle} size="small" />
                    <Button variant="contained" startIcon={<SearchOutlined />} onClick={fetchLogs} sx={{ ...primaryButtonStyle, color: '#FFFFFF', textTransform: 'none', minHeight: 40 }}>
                        Search
                    </Button>
                </Box>
                <TextField
                    placeholder="Request ID"
                    value={filters.request_id}
                    onChange={(e) => updateFilter('request_id', e.target.value)}
                    sx={{ ...textFieldStyle, mt: 2, maxWidth: 420 }}
                    size="small"
                />
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Paper sx={{ ...paperStyle, overflow: 'hidden' }}>
                {loading ? (
                    <Stack alignItems="center" sx={{ py: 8 }}>
                        <CircularProgress sx={{ color: theme.colors.brand }} />
                    </Stack>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {['Action', 'Actor', 'Resource', 'Request', 'When'].map((label) => (
                                    <TableCell key={label} sx={{ color: '#9CA3AF', borderColor: '#374151', fontWeight: 700 }}>
                                        {label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ border: 0, py: 5 }}>
                                        <Typography sx={{ color: '#9CA3AF' }}>No audit events found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : logs.map((item) => (
                                <TableRow key={item.id || item.request_id || `${item.action}-${item.created_at}`}>
                                    <TableCell sx={{ color: '#E5E7EB', borderColor: '#374151' }}>
                                        <Chip label={item.action || '-'} size="small" sx={{ bgcolor: 'rgba(23,138,131,0.14)', color: '#5EEAD4' }} />
                                    </TableCell>
                                    <TableCell sx={{ color: '#E5E7EB', borderColor: '#374151' }}>{actorLabel(item)}</TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderColor: '#374151' }}>{resourceLabel(item)}</TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderColor: '#374151', fontFamily: 'monospace' }}>{item.request_id || '-'}</TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderColor: '#374151' }}>{formatDateTime(item.created_at)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>
            {meta.total != null && (
                <Typography sx={{ color: '#6B7280', fontSize: '0.75rem', mt: 1.5 }}>
                    Showing {logs.length} of {meta.total} events
                </Typography>
            )}
        </Box>
    );
};

export default AuditLogPage;

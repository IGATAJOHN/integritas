import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Stack,
    IconButton,
    Chip,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    InputBase,
    Tooltip,
    CircularProgress,
    Alert,
    Button,
    Tab,
    Tabs,
    FormControl,
    Select,
    MenuItem,
    Snackbar,
} from '@mui/material';
import {
    Search,
    Refresh,
    Person,
    VerifiedUser,
    School,
    OpenInNew,
} from '@mui/icons-material';
import { adminFoundationalTutorService } from '../services/foundationalTutorService';
import theme from '../../../styles/theme';

const TYPE_TABS = [
    { label: 'All Tutors', value: '' },
    { label: 'Foundational', value: 'foundational' },
    { label: 'Expert', value: 'expert' },
];

const KYC_STATUS_OPTIONS = [
    { label: 'Any KYC Status', value: '' },
    { label: 'Not Submitted', value: 'not_submitted' },
    { label: 'Pending Review', value: 'pending_review' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
];

const KYC_CHIP = {
    not_submitted: { label: 'Not Submitted', color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
    pending_review: { label: 'Pending Review', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
    approved: { label: 'Approved', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
    rejected: { label: 'Rejected', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
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
};

const fullName = (t) => {
    if (t?.name) return t.name;
    const first = t?.first_name || '';
    const last = t?.last_name || '';
    return `${first} ${last}`.trim() || t?.email || 'Unknown';
};

const TutorManagement = () => {
    const navigate = useNavigate();
    const [tutors, setTutors] = useState([]);
    const [typeTab, setTypeTab] = useState('');
    const [kycStatus, setKycStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchTutors = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await adminFoundationalTutorService.listTutors({
                type: typeTab || undefined,
                kyc_status: kycStatus || undefined,
                q: searchTerm || undefined,
                per_page: 50,
            });
            setTutors(res.data || []);
        } catch (err) {
            console.error('Error fetching tutors:', err);
            setError(err.message || 'Failed to load tutors');
        } finally {
            setLoading(false);
        }
    }, [typeTab, kycStatus, searchTerm]);

    useEffect(() => {
        const timer = setTimeout(fetchTutors, searchTerm ? 400 : 0);
        return () => clearTimeout(timer);
    }, [fetchTutors, searchTerm]);

    const formatDate = (d) => {
        if (!d) return '—';
        try { return new Date(d).toLocaleDateString(); } catch { return d; }
    };

    const getTutorType = (t) => {
        const roles = (t?.roles || []).map(r => (typeof r === 'string' ? r : r?.name || '').toLowerCase());
        if (roles.includes('expert_tutor') || roles.includes('expert tutor')) return 'expert';
        if (roles.includes('foundational_tutor') || roles.includes('foundational tutor')) return 'foundational';
        return t?.type?.toLowerCase() || 'foundational';
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            {/* Header */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                        Tutor Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        View all foundational and expert tutors on the platform.
                    </Typography>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton onClick={fetchTutors} disabled={loading} sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </Stack>

            {/* Type tabs */}
            <Paper sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151', mb: 3 }}>
                <Tabs
                    value={typeTab}
                    onChange={(_, v) => { setTypeTab(v); setKycStatus(''); }}
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
                    {TYPE_TABS.map(t => <Tab key={t.value} label={t.label} value={t.value} />)}
                </Tabs>
            </Paper>

            {/* Filters row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <Box sx={{
                    bgcolor: '#1F2937', borderRadius: 1, px: 2,
                    display: 'flex', alignItems: 'center', gap: 1, height: 40, flex: 1, maxWidth: 400,
                    border: '1px solid #374151',
                }}>
                    <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
                    <InputBase
                        placeholder="Search by name or email…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ color: '#FFFFFF', fontSize: '0.875rem', width: '100%', '& input::placeholder': { color: '#6B7280' } }}
                    />
                </Box>

                {(typeTab === '' || typeTab === 'expert') && (
                    <FormControl size="small" sx={{ minWidth: 190 }}>
                        <Select
                            value={kycStatus}
                            onChange={(e) => setKycStatus(e.target.value)}
                            displayEmpty
                            sx={{
                                bgcolor: '#1E293B', color: '#FFFFFF', borderRadius: 1.5,
                                fontSize: '0.875rem', height: 40,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.colors.brand },
                                '& .MuiSvgIcon-root': { color: '#9CA3AF' },
                            }}
                            MenuProps={{ PaperProps: { sx: { bgcolor: '#1E293B', border: '1px solid #374151' } } }}
                        >
                            {KYC_STATUS_OPTIONS.map(o => (
                                <MenuItem key={o.value} value={o.value} sx={{ color: '#FFFFFF', fontSize: '0.875rem', '&:hover': { bgcolor: '#374151' }, '&.Mui-selected': { bgcolor: 'rgba(23,138,131,0.15)' } }}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Stack>

            {/* Table */}
            <TableContainer component={Paper} sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Tutor</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Type</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>KYC Status</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Joined</TableCell>
                            <TableCell align="right" sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
                                    <CircularProgress size={36} sx={{ color: theme.colors.brand }} />
                                    <Typography sx={{ color: '#9CA3AF', mt: 2 }}>Loading tutors…</Typography>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 4 }}>
                                    <Alert severity="error" sx={{ bgcolor: 'transparent', justifyContent: 'center' }}>{error}</Alert>
                                    <Button onClick={fetchTutors} sx={{ mt: 2, color: theme.colors.brand, textTransform: 'none' }}>Try Again</Button>
                                </TableCell>
                            </TableRow>
                        ) : tutors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
                                    <Person sx={{ fontSize: 48, color: '#374151', mb: 1 }} />
                                    <Typography sx={{ color: '#9CA3AF' }}>
                                        {searchTerm ? 'No tutors match your search' : 'No tutors found'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : tutors.map((tutor) => {
                            const type = getTutorType(tutor);
                            const name = fullName(tutor);
                            const kyc = tutor?.kyc_status || (type === 'foundational' ? null : 'not_submitted');
                            const kycInfo = KYC_CHIP[kyc];

                            return (
                                <TableRow key={tutor.id} sx={{ '&:last-child td': { border: 0 } }}>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Avatar sx={{ width: 38, height: 38, bgcolor: theme.colors.brand, fontSize: '0.85rem' }}>
                                                {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>{name}</Typography>
                                                <Typography variant="caption" sx={{ color: '#6B7280' }}>{tutor.email || '—'}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Chip
                                            icon={type === 'expert' ? <VerifiedUser sx={{ fontSize: 13 }} /> : <School sx={{ fontSize: 13 }} />}
                                            label={type === 'expert' ? 'Expert' : 'Foundational'}
                                            size="small"
                                            sx={{
                                                bgcolor: type === 'expert' ? 'rgba(59,130,246,0.12)' : 'rgba(23,138,131,0.12)',
                                                color: type === 'expert' ? '#3B82F6' : theme.colors.brand,
                                                fontSize: '0.72rem',
                                                '& .MuiChip-icon': { color: 'inherit' },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        {kycInfo ? (
                                            <Chip
                                                label={kycInfo.label}
                                                size="small"
                                                sx={{ bgcolor: kycInfo.bg, color: kycInfo.color, fontSize: '0.72rem' }}
                                            />
                                        ) : (
                                            <Typography variant="caption" sx={{ color: '#6B7280' }}>N/A</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                                            {formatDate(tutor.created_at)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottom: '1px solid #374151' }}>
                                        {type === 'expert' && (
                                            <Tooltip title="Review KYC">
                                                <IconButton
                                                    onClick={() => navigate('/admin/kycreview')}
                                                    size="small"
                                                    sx={{ color: '#FBBF24', bgcolor: 'rgba(251,191,36,0.1)', '&:hover': { bgcolor: 'rgba(251,191,36,0.2)' } }}
                                                >
                                                    <OpenInNew fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default TutorManagement;

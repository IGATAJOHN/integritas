import React, { useState, useEffect, useCallback } from 'react';
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
    Snackbar,
} from '@mui/material';
import {
    Search,
    Visibility,
    Block,
    CheckCircle,
    School,
    Refresh,
    Person,
} from '@mui/icons-material';
import { learnerService } from '../services/learnerService';
import theme from '../../../styles/theme';

/**
 * LearnerManagement
 *
 * Lists platform learners using the documented API:
 *   GET /api/v1/support/users      — user listing
 *   GET /api/v1/admin/enrolments   — used to derive an enrolments count
 *
 * The API does not currently expose endpoints to mutate users, so this page
 * is read-only.
 */

const LearnerManagement = () => {
    const [learners, setLearners] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchLearners = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await learnerService.listLearners();
            setLearners(res.data || []);
        } catch (err) {
            console.error('Error fetching learners:', err);
            setError(err.message || 'Failed to load learners');
            setLearners([]);
            setSnackbar({
                open: true,
                message: err.message || 'Failed to load learners',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLearners();
    }, [fetchLearners]);

    const term = searchTerm.trim().toLowerCase();
    const filteredLearners = term
        ? learners.filter((user) =>
            (user.name || '').toLowerCase().includes(term) ||
            (user.email || '').toLowerCase().includes(term),
        )
        : learners;

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Learner Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        View platform learners.
                    </Typography>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton
                        onClick={fetchLearners}
                        disabled={loading}
                        sx={{
                            color: '#9CA3AF',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </Stack>

            <Paper sx={{ p: 2, mb: 4, bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Box sx={{
                    bgcolor: "#1F2937",
                    borderRadius: 1,
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    width: '100%',
                    maxWidth: 400,
                    height: '40px'
                }}>
                    <Search sx={{ color: "#9CA3AF", fontSize: 20 }} />
                    <InputBase
                        placeholder="Search learners..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            color: "#FFFFFF",
                            fontSize: '0.9rem',
                            width: '100%',
                            '& input': {
                                border: 'none',
                                outline: 'none',
                                '&::placeholder': { color: '#6B7280' }
                            }
                        }}
                    />
                </Box>
            </Paper>

            <TableContainer component={Paper} sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Learner</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Enrolled Courses</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Last Login</TableCell>
                            <TableCell align="right" sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
                                    <CircularProgress size={40} sx={{ color: theme.colors.brand }} />
                                    <Typography sx={{ color: '#9CA3AF', mt: 2 }}>Loading learners...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 4 }}>
                                    <Alert severity="error" sx={{ bgcolor: 'transparent', justifyContent: 'center' }}>
                                        {error}
                                    </Alert>
                                    <Button onClick={fetchLearners} sx={{ mt: 2, color: theme.colors.brand }}>Try Again</Button>
                                </TableCell>
                            </TableRow>
                        ) : filteredLearners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
                                    <Person sx={{ fontSize: 48, color: '#374151', mb: 2 }} />
                                    <Typography sx={{ color: '#9CA3AF' }}>
                                        {searchTerm ? 'No learners match your search' : 'No learners found'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : filteredLearners.map((user) => {
                            const isActive = (user.status || '').toLowerCase() === 'active';
                            return (
                                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ color: '#fff', borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Avatar sx={{ width: 40, height: 40, bgcolor: theme.colors.brand, fontSize: '0.9rem' }}>
                                                {(user.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>
                                                    {user.name || 'Unknown'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                    {user.email || 'No email'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <School sx={{ color: theme.colors.brand, fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                                                {user.enrollments_count ?? 0}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                courses
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Chip
                                            icon={isActive ? <CheckCircle sx={{ fontSize: 14 }} /> : <Block sx={{ fontSize: 14 }} />}
                                            label={user.status || 'Unknown'}
                                            size="small"
                                            sx={{
                                                bgcolor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                color: isActive ? '#10B981' : '#EF4444',
                                                fontSize: '0.75rem',
                                                '& .MuiChip-icon': {
                                                    color: isActive ? '#10B981' : '#EF4444',
                                                },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151' }}>
                                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                                            {formatDate(user.last_login_at)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="View Profile">
                                                <IconButton
                                                    sx={{
                                                        color: '#3B82F6',
                                                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                                                        '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }
                                                    }}
                                                >
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LearnerManagement;

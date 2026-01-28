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
    People,
    HourglassEmpty,
    Refresh,
    Delete,
} from '@mui/icons-material';
import { userService } from '../../../services/api';

/**
 * TutorManagement Component
 * 
 * Manages course instructors with the following features:
 * - List users with role 'tutor' from API (GET /users with filter)
 * - View tutor details
 * - Delete tutors (DELETE /users/{id})
 * 
 * Note: Uses the /users endpoint filtering by role since /admin/tutors doesn't exist
 */

// Fallback data for when API fails or isn't available
const FALLBACK_TUTORS = [
    { id: 1, name: 'Dr. Sarah Wilson', email: 'sarah@example.com', status: 'Active', courses_count: 2, students_count: 45 },
    { id: 2, name: 'Prof. James Miller', email: 'james@example.com', status: 'Pending', courses_count: 0, students_count: 0 },
    { id: 3, name: 'Emily Davis', email: 'emily@example.com', status: 'Suspended', courses_count: 1, students_count: 12 },
];

const TutorManagement = () => {
    // Data state
    const [tutors, setTutors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);
    const [usingFallback, setUsingFallback] = useState(false);

    // Snackbar for notifications
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    /**
     * Fetch all tutors from the API
     * GET /users (filters users with role 'tutor')
     * Falls back to mock data if API fails
     */
    const fetchTutors = useCallback(async () => {
        setLoading(true);
        setError(null);
        setUsingFallback(false);
        try {
            const response = await userService.getAll();
            // Filter users with tutor role
            const allUsers = response?.data || response || [];
            const tutorUsers = Array.isArray(allUsers)
                ? allUsers.filter(user => user.role === 'tutor' || user.role === 'instructor')
                : [];

            if (tutorUsers.length > 0) {
                setTutors(tutorUsers);
            } else {
                // No tutors found, use fallback
                setTutors(FALLBACK_TUTORS);
                setUsingFallback(true);
            }
        } catch (err) {
            console.error('Error fetching tutors:', err);
            // Use fallback data when API fails
            setTutors(FALLBACK_TUTORS);
            setUsingFallback(true);
            setSnackbar({
                open: true,
                message: 'Using demo data - API endpoint not available',
                severity: 'warning'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch tutors on component mount
    useEffect(() => {
        fetchTutors();
    }, [fetchTutors]);

    // Filter tutors based on search
    const filteredTutors = tutors.filter(user =>
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    /**
     * Get status configuration for display
     */
    const getStatusConfig = (status) => {
        const normalizedStatus = status?.toLowerCase() || '';
        switch (normalizedStatus) {
            case 'active':
            case 'approved':
                return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', icon: <CheckCircle sx={{ fontSize: 14 }} />, label: 'Active' };
            case 'suspended':
                return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', icon: <Block sx={{ fontSize: 14 }} />, label: 'Suspended' };
            case 'pending':
                return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', icon: <HourglassEmpty sx={{ fontSize: 14 }} />, label: 'Pending' };
            case 'rejected':
                return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', icon: <Block sx={{ fontSize: 14 }} />, label: 'Rejected' };
            default:
                return { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)', icon: null, label: status || 'Unknown' };
        }
    };

    /**
     * Handle status toggle (mock implementation)
     * Note: Real implementation would require backend support
     */
    const handleToggleStatus = async (tutor) => {
        if (usingFallback) {
            // Mock toggle for fallback data
            setTutors(prev => prev.map(t => {
                if (t.id === tutor.id) {
                    let newStatus = t.status;
                    if (t.status === 'Active') newStatus = 'Suspended';
                    else if (t.status === 'Suspended') newStatus = 'Active';
                    else if (t.status === 'Pending') newStatus = 'Active';
                    return { ...t, status: newStatus };
                }
                return t;
            }));
            setSnackbar({ open: true, message: 'Status updated (demo mode)', severity: 'info' });
            return;
        }

        setActionLoading(tutor.id);
        try {
            // Try to update via API
            await userService.update(tutor.id, {
                status: tutor.status === 'Active' ? 'Suspended' : 'Active'
            });
            setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
            await fetchTutors();
        } catch (err) {
            console.error('Error updating tutor status:', err);
            setSnackbar({ open: true, message: err.message || 'Failed to update status', severity: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    /**
     * Handle delete tutor
     */
    const handleDeleteTutor = async (tutor) => {
        if (!window.confirm(`Are you sure you want to delete ${tutor.name}? This action cannot be undone.`)) {
            return;
        }

        if (usingFallback) {
            // Mock delete for fallback data
            setTutors(prev => prev.filter(t => t.id !== tutor.id));
            setSnackbar({ open: true, message: 'Tutor deleted (demo mode)', severity: 'info' });
            return;
        }

        setActionLoading(tutor.id);
        try {
            await userService.delete(tutor.id);
            setSnackbar({ open: true, message: 'Tutor deleted successfully', severity: 'success' });
            await fetchTutors();
        } catch (err) {
            console.error('Error deleting tutor:', err);
            setSnackbar({ open: true, message: err.message || 'Failed to delete tutor', severity: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    /**
     * Close snackbar notification
     */
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            {/* Header Section */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Tutor Management
                        {usingFallback && (
                            <Chip
                                label="Demo Mode"
                                size="small"
                                sx={{ ml: 2, bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}
                            />
                        )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Approve and manage course instructors.
                    </Typography>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton
                        onClick={fetchTutors}
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

            {/* Search Section */}
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
                        placeholder="Search tutors..."
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

            {/* Tutors Table */}
            <TableContainer component={Paper} sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Tutor</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Courses</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Students</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Status</TableCell>
                            <TableCell align="right" sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
                                    <CircularProgress size={40} sx={{ color: '#7C3AED' }} />
                                    <Typography sx={{ color: '#9CA3AF', mt: 2 }}>Loading tutors...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 4 }}>
                                    <Alert severity="error" sx={{ bgcolor: 'transparent', justifyContent: 'center' }}>
                                        {error}
                                    </Alert>
                                    <Button onClick={fetchTutors} sx={{ mt: 2, color: '#7C3AED' }}>Try Again</Button>
                                </TableCell>
                            </TableRow>
                        ) : filteredTutors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
                                    <School sx={{ fontSize: 48, color: '#374151', mb: 2 }} />
                                    <Typography sx={{ color: '#9CA3AF' }}>
                                        {searchTerm ? 'No tutors match your search' : 'No tutors found'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : filteredTutors.map((user) => {
                            const statusConfig = getStatusConfig(user.status);
                            const isActionLoading = actionLoading === user.id;
                            return (
                                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ color: '#fff', borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Avatar sx={{ width: 40, height: 40, bgcolor: '#7C3AED', fontSize: '0.9rem' }}>
                                                {user.name?.split(' ').map(n => n[0]).join('') || '?'}
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
                                            <School sx={{ color: '#1152D4', fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                                                {user.courses_count ?? user.courses ?? 0}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <People sx={{ color: '#10B981', fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                                                {user.students_count ?? user.students ?? 0}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Chip
                                            icon={statusConfig.icon}
                                            label={statusConfig.label}
                                            size="small"
                                            sx={{
                                                bgcolor: statusConfig.bg,
                                                color: statusConfig.color,
                                                fontSize: '0.75rem',
                                                '& .MuiChip-icon': {
                                                    color: statusConfig.color,
                                                },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="View Profile">
                                                <IconButton
                                                    disabled={isActionLoading}
                                                    sx={{
                                                        color: '#3B82F6',
                                                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                                                        '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }
                                                    }}
                                                >
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={
                                                statusConfig.label === 'Active' ? 'Suspend Tutor' :
                                                    statusConfig.label === 'Pending' ? 'Approve Tutor' : 'Activate Tutor'
                                            }>
                                                <IconButton
                                                    onClick={() => handleToggleStatus(user)}
                                                    disabled={isActionLoading}
                                                    sx={{
                                                        color: statusConfig.label === 'Active' ? '#EF4444' : '#10B981',
                                                        bgcolor: statusConfig.label === 'Active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                        '&:hover': {
                                                            bgcolor: statusConfig.label === 'Active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                                                        }
                                                    }}
                                                >
                                                    {isActionLoading ? (
                                                        <CircularProgress size={18} sx={{ color: 'inherit' }} />
                                                    ) : statusConfig.label === 'Active' ? (
                                                        <Block fontSize="small" />
                                                    ) : (
                                                        <CheckCircle fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Tutor">
                                                <IconButton
                                                    onClick={() => handleDeleteTutor(user)}
                                                    disabled={isActionLoading}
                                                    sx={{
                                                        color: '#EF4444',
                                                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                                                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
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

            {/* Snackbar for notifications */}
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

export default TutorManagement;

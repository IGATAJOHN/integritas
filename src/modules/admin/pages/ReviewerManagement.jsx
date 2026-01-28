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
    Modal,
    TextField,
} from '@mui/material';
import {
    Search,
    Block,
    CheckCircle,
    Assignment,
    Visibility,
    Refresh,
    Delete,
    Add,
    Close,
    PersonAdd,
} from '@mui/icons-material';
import { reviewerService } from '../services/reviewerService';
import { textFieldStyle, modalStyle } from '../../../styles/formStyles';

/**
 * ReviewerManagement Component
 * 
 * Manages content reviewers with the following features:
 * - List reviewers (GET /reviewers)
 * - Create new reviewers (POST /reviewers)
 * - Update reviewer status (PATCH /reviewers/{id}/status)
 * - Delete reviewers (DELETE /reviewers/{id})
 * 
 * Note: Uses direct /reviewers endpoints with proper admin authentication
 */

const ReviewerManagement = () => {
    // Data state
    const [reviewers, setReviewers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Modal state
    const [openModal, setOpenModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    // Snackbar for notifications
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    /**
     * Fetch all reviewers from the API
     * GET /reviewers
     */
    const fetchReviewers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await reviewerService.listReviewers();
            const reviewerList = response?.data || [];
            setReviewers(reviewerList);
        } catch (err) {
            console.error('Error fetching reviewers:', err);
            setError(err.message || 'Failed to load reviewers');
            setSnackbar({
                open: true,
                message: 'Failed to load reviewers from API',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch reviewers on component mount
    useEffect(() => {
        fetchReviewers();
    }, [fetchReviewers]);

    // Filter reviewers based on search
    const filteredReviewers = reviewers.filter(user =>
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    /**
     * Open modal for creating reviewer
     */
    const handleOpenModal = () => {
        setFormData({ name: '', email: '', password: '' });
        setOpenModal(true);
    };

    /**
     * Close modal
     */
    const handleCloseModal = () => {
        setOpenModal(false);
        setFormData({ name: '', email: '', password: '' });
    };

    /**
     * Create new reviewer
     */
    const handleCreateReviewer = async () => {
        if (!formData.name.trim() || !formData.email.trim()) {
            setSnackbar({ open: true, message: 'Name and email are required', severity: 'error' });
            return;
        }

        setSaving(true);
        try {
            // Split name into first and last
            const nameParts = formData.name.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            await reviewerService.createReviewer({
                first_name: firstName,
                last_name: lastName,
                email: formData.email,
                password: formData.password || undefined,
            });
            setSnackbar({ open: true, message: 'Reviewer created successfully', severity: 'success' });
            handleCloseModal();
            await fetchReviewers();
        } catch (err) {
            console.error('Error creating reviewer:', err);
            setSnackbar({ open: true, message: err.message || 'Failed to create reviewer', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    /**
     * Handle delete reviewer
     */
    const handleDeleteReviewer = async (reviewer) => {
        if (!window.confirm(`Are you sure you want to delete ${reviewer.first_name || reviewer.name || 'this reviewer'}? This action cannot be undone.`)) {
            return;
        }

        setActionLoading(reviewer.id);
        try {
            await reviewerService.deleteReviewer(reviewer.id);
            setSnackbar({ open: true, message: 'Reviewer deleted successfully', severity: 'success' });
            await fetchReviewers();
        } catch (err) {
            console.error('Error deleting reviewer:', err);
            setSnackbar({ open: true, message: err.message || 'Failed to delete reviewer', severity: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    /**
     * Toggle reviewer status (Active/Inactive)
     * Uses PATCH /reviewers/{id}/status
     */
    const handleToggleStatus = async (reviewer) => {
        const currentStatus = reviewer.status || 'Active';
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

        setActionLoading(reviewer.id);
        try {
            await reviewerService.updateStatus(reviewer.id, newStatus);
            setSnackbar({ open: true, message: `Reviewer ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`, severity: 'success' });
            await fetchReviewers();
        } catch (err) {
            console.error('Error updating reviewer status:', err);
            setSnackbar({ open: true, message: err.message || 'Failed to update status', severity: 'error' });
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
                        Reviewer Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Manage content reviewers and their access.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Refresh">
                        <IconButton
                            onClick={fetchReviewers}
                            disabled={loading}
                            sx={{
                                color: '#9CA3AF',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpenModal}
                        sx={{
                            bgcolor: '#F59E0B',
                            '&:hover': { bgcolor: '#D97706' },
                            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
                        }}
                    >
                        Add Reviewer
                    </Button>
                </Stack>
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
                        placeholder="Search reviewers..."
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

            {/* Reviewers Table */}
            <TableContainer component={Paper} sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Reviewer</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Assigned Tasks</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Status</TableCell>
                            <TableCell align="right" sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
                                    <CircularProgress size={40} sx={{ color: '#F59E0B' }} />
                                    <Typography sx={{ color: '#9CA3AF', mt: 2 }}>Loading reviewers...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ borderBottom: '1px solid #374151', py: 4 }}>
                                    <Alert severity="error" sx={{ bgcolor: 'transparent', justifyContent: 'center' }}>
                                        {error}
                                    </Alert>
                                    <Button onClick={fetchReviewers} sx={{ mt: 2, color: '#F59E0B' }}>Try Again</Button>
                                </TableCell>
                            </TableRow>
                        ) : filteredReviewers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
                                    <Assignment sx={{ fontSize: 48, color: '#374151', mb: 2 }} />
                                    <Typography sx={{ color: '#9CA3AF' }}>
                                        {searchTerm ? 'No reviewers match your search' : 'No reviewers found. Click "Add Reviewer" to create one.'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : filteredReviewers.map((user) => {
                            const isActionLoading = actionLoading === user.id;
                            const isActive = (user.status || 'Active').toLowerCase() === 'active';
                            // Build display name from first_name/last_name or name
                            const displayName = user.first_name && user.last_name
                                ? `${user.first_name} ${user.last_name}`
                                : (user.user?.name || user.name || 'Unknown');
                            const email = user.user?.email || user.email || 'No email';
                            const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

                            return (
                                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ color: '#fff', borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Avatar sx={{ width: 40, height: 40, bgcolor: '#F59E0B', fontSize: '0.9rem' }}>
                                                {initials}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>
                                                    {displayName}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                    {email}
                                                    {user.specialization && ` • ${user.specialization}`}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Assignment sx={{ color: '#F59E0B', fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                                                {user.max_assignments ?? user.tasks_count ?? 0}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                max tasks
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Chip
                                            icon={isActive ? <CheckCircle sx={{ fontSize: 14 }} /> : <Block sx={{ fontSize: 14 }} />}
                                            label={user.status || 'Active'}
                                            size="small"
                                            sx={{
                                                bgcolor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                color: isActive ? '#10B981' : '#EF4444',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                '& .MuiChip-icon': {
                                                    color: isActive ? '#10B981' : '#EF4444',
                                                },
                                                '&:hover': {
                                                    bgcolor: isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                                                }
                                            }}
                                            onClick={() => handleToggleStatus(user)}
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title={isActive ? 'Deactivate' : 'Activate'}>
                                                <IconButton
                                                    onClick={() => handleToggleStatus(user)}
                                                    disabled={isActionLoading}
                                                    sx={{
                                                        color: isActive ? '#EF4444' : '#10B981',
                                                        bgcolor: isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                        '&:hover': { bgcolor: isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)' }
                                                    }}
                                                >
                                                    {isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                                                </IconButton>
                                            </Tooltip>
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
                                            <Tooltip title="Delete Reviewer">
                                                <IconButton
                                                    onClick={() => handleDeleteReviewer(user)}
                                                    disabled={isActionLoading}
                                                    sx={{
                                                        color: '#EF4444',
                                                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                                                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                                                    }}
                                                >
                                                    {isActionLoading ? (
                                                        <CircularProgress size={18} sx={{ color: 'inherit' }} />
                                                    ) : (
                                                        <Delete fontSize="small" />
                                                    )}
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

            {/* Create Reviewer Modal */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={modalStyle}>
                    {/* Modal Header */}
                    <Box sx={{
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <PersonAdd sx={{ color: '#fff', fontSize: 28 }} />
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                Add New Reviewer
                            </Typography>
                        </Stack>
                        <IconButton onClick={handleCloseModal} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Modal Body */}
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={2.5}>
                            <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                    Full Name
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="e.g. John Reviewer"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    sx={textFieldStyle}
                                />
                            </Box>

                            <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                    Email Address
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="reviewer@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    sx={textFieldStyle}
                                />
                            </Box>

                            <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                    Password (Optional)
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="password"
                                    placeholder="Leave empty to auto-generate"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    sx={textFieldStyle}
                                />
                            </Box>

                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleCreateReviewer}
                                disabled={!formData.name.trim() || !formData.email.trim() || saving}
                                sx={{
                                    bgcolor: '#F59E0B',
                                    py: 1.5,
                                    borderRadius: 1.5,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                                    '&:hover': { bgcolor: '#D97706' },
                                    '&:disabled': { bgcolor: '#1F2937', color: '#6B7280', boxShadow: 'none' }
                                }}
                            >
                                {saving ? (
                                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                                ) : (
                                    'Create Reviewer'
                                )}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>

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

export default ReviewerManagement;

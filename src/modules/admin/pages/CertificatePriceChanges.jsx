import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    Stack,
    CircularProgress,
    IconButton,
    Tabs,
    Tab,
    Modal,
    TextField,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Visibility,
    MoreVert,
    Payments,
    Close,
} from '@mui/icons-material';
import { adminCoursesService } from '../services';
import { formatCurrency } from '../../../utils';
import { modalStyle, textFieldStyle } from '../../../styles/formStyles';
import theme from '../../../styles/theme';


const CertificatePriceChanges = () => {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState(0); // 0: pending, 1: approved, 2: rejected
    const [actionLoading, setActionLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Rejection modal state
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const statusMap = ['pending', 'approved', 'rejected'];

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const status = statusMap[activeTab];
            const response = await adminCoursesService.listPriceChanges({ status, with_course: 1 });
            // The API response might have different structures, resolve to data array
            setRequests((response?.data || response) ?? []);
        } catch (err) {
            console.error('Failed to fetch requests:', err);
            setSnackbar({ open: true, message: 'Failed to load requests', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    const handleApprove = async (id) => {
        try {
            setActionLoading(true);
            await adminCoursesService.approvePriceChange(id);
            setSnackbar({ open: true, message: 'Request approved successfully', severity: 'success' });
            fetchRequests();
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'Failed to approve request', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleQuickReject = async (id) => {
        try {
            setActionLoading(true);
            await adminCoursesService.rejectPriceChange(id, 'Price change rejected by administrator.');
            setSnackbar({ open: true, message: 'Request rejected', severity: 'success' });
            fetchRequests();
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'Failed to reject request', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectWithReason = async () => {
        if (!rejectionReason) {
            setSnackbar({ open: true, message: 'Please provide a reason', severity: 'warning' });
            return;
        }
        try {
            setActionLoading(true);
            await adminCoursesService.rejectPriceChange(selectedRequest.id, rejectionReason);
            setSnackbar({ open: true, message: 'Request rejected', severity: 'success' });
            setRejectModalOpen(false);
            setRejectionReason('');
            fetchRequests();
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'Failed to reject request', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                    Certificate Price Changes
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    Review and manage certificate price change requests from tutors.
                </Typography>
            </Box>

            <Tabs
                value={activeTab}
                onChange={(e, v) => setActiveTab(v)}
                sx={{
                    mb: 3,
                    '& .MuiTab-root': { color: '#9CA3AF', textTransform: 'none' },
                    '& .Mui-selected': { color: '#fff !important' },
                    '& .MuiTabs-indicator': { bgcolor: theme.colors.brand }
                }}
            >
                <Tab label="Pending" />
                <Tab label="Approved" />
                <Tab label="Rejected" />
            </Tabs>

            <TableContainer component={Paper} sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151' }}>Course Name</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151' }}>Old Price</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151' }}>New Price</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151' }}>Reason</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151' }}>Requested At</TableCell>
                            {activeTab === 0 && <TableCell align="right" sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151' }}>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : !Array.isArray(requests) || requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8, color: '#9CA3AF' }}>
                                    No requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell sx={{ color: '#fff', borderBottom: '1px solid #374151' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {req.course?.title || req.course_title || `ID: ${req.course_id}`}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151' }}>
                                        {formatCurrency(req.old_amount, req.old_currency)}
                                    </TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600, borderBottom: '1px solid #374151' }}>
                                        {formatCurrency(req.new_amount, req.new_currency)}
                                    </TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', maxWidth: 300, borderBottom: '1px solid #374151' }}>
                                        {req.reason}
                                    </TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151' }}>
                                        {req.requested_at ? new Date(req.requested_at).toLocaleDateString() : '-'}
                                    </TableCell>
                                    {activeTab === 0 && (
                                        <TableCell align="right" sx={{ borderBottom: '1px solid #374151' }}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => handleApprove(req.id)}
                                                    disabled={actionLoading}
                                                    sx={{ textTransform: 'none', bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleQuickReject(req.id)}
                                                    disabled={actionLoading}
                                                    sx={{ textTransform: 'none', borderColor: '#EF4444', color: '#EF4444' }}
                                                >
                                                    Quick Reject
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => { setSelectedRequest(req); setRejectModalOpen(true); }}
                                                    disabled={actionLoading}
                                                    sx={{ textTransform: 'none', borderColor: '#9CA3AF', color: '#9CA3AF' }}
                                                >
                                                    Reject...
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Rejection Modal */}
            <Modal open={rejectModalOpen} onClose={() => !actionLoading && setRejectModalOpen(false)}>
                <Box sx={modalStyle}>
                    <Box sx={{ bgcolor: '#EF4444', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>Reject Price Change</Typography>
                        <IconButton onClick={() => setRejectModalOpen(false)} sx={{ color: '#fff' }} disabled={actionLoading}><Close /></IconButton>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                            Course: {selectedRequest?.course?.title || selectedRequest?.course_title || `ID: ${selectedRequest?.course_id}`}
                        </Typography>
                        <Typography sx={{ color: '#E5E7EB', mb: 2 }}>Provide a reason for rejecting this request.</Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="e.g. Price increase is too significant..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            sx={textFieldStyle}
                        />
                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                            <Button onClick={() => setRejectModalOpen(false)} sx={{ color: '#9CA3AF' }} disabled={actionLoading}>Cancel</Button>
                            <Button
                                variant="contained"
                                sx={{ bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' } }}
                                onClick={handleRejectWithReason}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Reject Request'}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CertificatePriceChanges;

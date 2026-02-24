import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    CircularProgress,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import organizationService from '../services/organizationService';
import {
    paperStyle,
    selectMenuProps,
    selectStyle,
    tableBodyCellStyle,
    tableHeaderCellStyle,
} from '../../../styles/formStyles';

const ASSIGNMENT_STATUSES = ['assigned', 'in_progress', 'completed', 'revoked'];
const ASSIGNMENT_TYPES = ['course', 'learning_path'];

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
};

const resolveItemName = (row) => {
    if (row.type === 'course') {
        return row.course?.title || row.course?.name || row.course_id || '-';
    }

    return row.learning_path?.title || row.learningPath?.title || row.learning_path_id || '-';
};

const OrganizationMyAssignments = () => {
    const [loading, setLoading] = useState(false);
    const [assignments, setAssignments] = useState([]);

    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const openSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const loadAssignments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await organizationService.listMyAssignments({
                status: statusFilter,
                type: typeFilter,
                per_page: 50,
            });
            setAssignments(response.data || []);
        } catch (error) {
            console.error('Failed to load my assignments:', error);
            setAssignments([]);
            openSnackbar(error.message || 'Failed to load assignments.', 'error');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, typeFilter]);

    useEffect(() => {
        loadAssignments();
    }, [loadAssignments]);

    const rows = useMemo(() => assignments, [assignments]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        My Assignments
                    </Typography>
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                        View assignments linked to your account across organization courses and learning paths.
                    </Typography>
                </Box>
                <IconButton onClick={loadAssignments} sx={{ color: '#9CA3AF' }}>
                    <Refresh />
                </IconButton>
            </Stack>

            <Paper sx={{ ...paperStyle, p: 2, mb: 2.5 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel sx={{ color: '#9CA3AF' }}>Status</InputLabel>
                        <Select
                            label="Status"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All Statuses</MenuItem>
                            {ASSIGNMENT_STATUSES.map((status) => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel sx={{ color: '#9CA3AF' }}>Type</InputLabel>
                        <Select
                            label="Type"
                            value={typeFilter}
                            onChange={(event) => setTypeFilter(event.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All Types</MenuItem>
                            {ASSIGNMENT_TYPES.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            <TableContainer component={Paper} sx={paperStyle}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={tableHeaderCellStyle}>Type</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Item</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Assigned At</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Due At</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Completed At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ ...tableBodyCellStyle, py: 6 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ ...tableBodyCellStyle, py: 4 }}>
                                    <Alert
                                        severity="info"
                                        sx={{
                                            bgcolor: 'rgba(59, 130, 246, 0.08)',
                                            color: '#93C5FD',
                                            border: '1px solid rgba(59,130,246,0.25)',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        No assignments found for the selected filters.
                                    </Alert>
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB', textTransform: 'capitalize' }}>
                                        {row.type || '-'}
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#fff', fontWeight: 600 }}>
                                        {resolveItemName(row)}
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB', textTransform: 'capitalize' }}>
                                        {row.status || '-'}
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>
                                        {formatDate(row.assigned_at)}
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>
                                        {formatDate(row.due_at)}
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>
                                        {formatDate(row.completed_at)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3500}
                onClose={closeSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={closeSnackbar} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrganizationMyAssignments;

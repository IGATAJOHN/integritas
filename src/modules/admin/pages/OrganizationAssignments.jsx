import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
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
    TextField,
    Typography,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { organizationService } from '../services/organizationService';
import { useOrganizationScope } from '../hooks/useOrganizationScope';
import OrganizationScopeToolbar from '../components/OrganizationScopeToolbar';
import {
    paperStyle,
    primaryButtonStyle,
    selectMenuProps,
    selectStyle,
    tableBodyCellStyle,
    tableHeaderCellStyle,
    textFieldStyle,
} from '../../../styles/formStyles';

const ASSIGNMENT_TYPES = ['course', 'learning_path'];
const ASSIGNMENT_STATUSES = ['assigned', 'in_progress', 'completed', 'revoked'];

const parseIdList = (value) =>
    String(value || '')
        .split(/[\n,;\s]/)
        .map((item) => item.trim())
        .filter(Boolean);

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
};

const OrganizationAssignments = () => {
    const {
        organizations,
        selectedOrgId,
        selectedOrganization,
        setSelectedOrgId,
    } = useOrganizationScope();

    const [assignments, setAssignments] = useState([]);
    const [myAssignments, setMyAssignments] = useState([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [learningPaths, setLearningPaths] = useState([]);

    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [manualUserIds, setManualUserIds] = useState('');

    const [assignForm, setAssignForm] = useState({
        type: 'course',
        course_id: '',
        learning_path_id: '',
        due_at: '',
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const openSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const listAssignments = useCallback(async () => {
        if (!selectedOrgId) {
            setAssignments([]);
            return;
        }

        setLoading(true);
        try {
            const response = await organizationService.listAssignments(selectedOrgId, {
                type: typeFilter,
                status: statusFilter,
                per_page: 50,
            });
            setAssignments(response.data || []);
        } catch (err) {
            console.error('Failed to load assignments:', err);
            setAssignments([]);
            openSnackbar(err.message || 'Failed to load assignments.', 'error');
        } finally {
            setLoading(false);
        }
    }, [selectedOrgId, typeFilter, statusFilter]);

    const listMyAssignments = async () => {
        setLoading(true);
        try {
            const response = await organizationService.listMyAssignments({ per_page: 20 });
            setMyAssignments(response.data || []);
            openSnackbar('Loaded my assignments.');
        } catch (err) {
            console.error('Failed to load my assignments:', err);
            openSnackbar(err.message || 'Failed to load my assignments.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadOptions = useCallback(async () => {
        try {
            const [usersResponse, coursesResponse] = await Promise.all([
                organizationService.listUsers({ per_page: 100 }),
                organizationService.listCourses({ per_page: 100 }),
            ]);

            setUsers(usersResponse.data || []);
            setCourses(coursesResponse.data || []);
        } catch (err) {
            console.error('Failed to load assignment options:', err);
            setUsers([]);
            setCourses([]);
        }
    }, []);

    const loadLearningPaths = useCallback(async () => {
        if (!selectedOrgId) {
            setLearningPaths([]);
            return;
        }

        try {
            const response = await organizationService.listLearningPaths(selectedOrgId, { per_page: 100 });
            setLearningPaths(response.data || []);
        } catch (err) {
            console.error('Failed to load learning paths for assignment:', err);
            setLearningPaths([]);
        }
    }, [selectedOrgId]);

    useEffect(() => {
        loadOptions();
    }, [loadOptions]);

    useEffect(() => {
        loadLearningPaths();
    }, [loadLearningPaths]);

    useEffect(() => {
        listAssignments();
    }, [listAssignments]);

    const mergedUserIds = useMemo(() => {
        const fromSelect = selectedUserIds.map((id) => String(id).trim()).filter(Boolean);
        const fromManual = parseIdList(manualUserIds);
        return [...new Set([...fromSelect, ...fromManual])];
    }, [selectedUserIds, manualUserIds]);

    const handleAssign = async () => {
        if (!selectedOrgId) {
            openSnackbar('Select an organization first.', 'error');
            return;
        }

        if (mergedUserIds.length === 0) {
            openSnackbar('Select at least one user.', 'error');
            return;
        }

        const payload = {
            type: assignForm.type,
            user_ids: mergedUserIds,
            due_at: assignForm.due_at || undefined,
        };

        if (assignForm.type === 'course') {
            if (!String(assignForm.course_id || '').trim()) {
                openSnackbar('Choose a course before assigning.', 'error');
                return;
            }
            payload.course_id = assignForm.course_id;
        }

        if (assignForm.type === 'learning_path') {
            if (!String(assignForm.learning_path_id || '').trim()) {
                openSnackbar('Choose a learning path before assigning.', 'error');
                return;
            }
            payload.learning_path_id = assignForm.learning_path_id;
        }

        setSaving(true);
        try {
            await organizationService.assignToUsers(selectedOrgId, payload);
            openSnackbar('Assignment created successfully.');
            setSelectedUserIds([]);
            setManualUserIds('');
            setAssignForm((prev) => ({ ...prev, due_at: '' }));
            await listAssignments();
        } catch (err) {
            console.error('Failed to assign content:', err);
            openSnackbar(err.message || 'Failed to create assignment.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleRevoke = async (assignmentId) => {
        if (!selectedOrgId || !assignmentId) return;

        setActionLoading(assignmentId);
        try {
            await organizationService.revokeAssignment(selectedOrgId, assignmentId);
            openSnackbar('Assignment revoked successfully.');
            await listAssignments();
        } catch (err) {
            console.error('Failed to revoke assignment:', err);
            openSnackbar(err.message || 'Failed to revoke assignment.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const assignmentRows = useMemo(() => assignments, [assignments]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Organization Assignments
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Assign courses or learning paths to users and monitor assignment status.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={listMyAssignments} sx={{ borderColor: '#374151', color: '#E5E7EB' }}>
                        Load My Assignments
                    </Button>
                    <IconButton onClick={listAssignments} sx={{ color: '#9CA3AF' }}>
                        <Refresh />
                    </IconButton>
                </Stack>
            </Stack>

            <OrganizationScopeToolbar
                organizations={organizations}
                selectedOrgId={selectedOrgId}
                selectedOrganization={selectedOrganization}
                onChangeOrgId={setSelectedOrgId}
            />

            <Paper sx={{ ...paperStyle, p: 2.5, mb: 3 }}>
                <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>Create Assignment</Typography>

                <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: '#9CA3AF' }}>Type</InputLabel>
                            <Select
                                label="Type"
                                value={assignForm.type}
                                onChange={(event) =>
                                    setAssignForm((prev) => ({
                                        ...prev,
                                        type: event.target.value,
                                        course_id: '',
                                        learning_path_id: '',
                                    }))
                                }
                                sx={selectStyle}
                                MenuProps={selectMenuProps}
                            >
                                {ASSIGNMENT_TYPES.map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {assignForm.type === 'course' ? (
                            <FormControl fullWidth>
                                <InputLabel sx={{ color: '#9CA3AF' }}>Course</InputLabel>
                                <Select
                                    label="Course"
                                    value={assignForm.course_id}
                                    onChange={(event) => setAssignForm((prev) => ({ ...prev, course_id: event.target.value }))}
                                    sx={selectStyle}
                                    MenuProps={selectMenuProps}
                                >
                                    {courses.length === 0 ? (
                                        <MenuItem value="" disabled>No courses found</MenuItem>
                                    ) : (
                                        courses.map((course) => (
                                            <MenuItem key={course.id} value={course.id}>
                                                {course.title || course.name || course.id}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        ) : (
                            <FormControl fullWidth>
                                <InputLabel sx={{ color: '#9CA3AF' }}>Learning Path</InputLabel>
                                <Select
                                    label="Learning Path"
                                    value={assignForm.learning_path_id}
                                    onChange={(event) => setAssignForm((prev) => ({ ...prev, learning_path_id: event.target.value }))}
                                    sx={selectStyle}
                                    MenuProps={selectMenuProps}
                                >
                                    {learningPaths.length === 0 ? (
                                        <MenuItem value="" disabled>No learning paths found</MenuItem>
                                    ) : (
                                        learningPaths.map((path) => (
                                            <MenuItem key={path.id} value={path.id}>
                                                {path.title || path.id}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        )}

                        <TextField
                            label="Due Date"
                            type="date"
                            value={assignForm.due_at}
                            onChange={(event) => setAssignForm((prev) => ({ ...prev, due_at: event.target.value }))}
                            sx={textFieldStyle}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                    </Stack>

                    <FormControl fullWidth>
                        <InputLabel sx={{ color: '#9CA3AF' }}>Select Users</InputLabel>
                        <Select
                            multiple
                            label="Select Users"
                            value={selectedUserIds}
                            onChange={(event) => {
                                const value = event.target.value;
                                setSelectedUserIds(typeof value === 'string' ? value.split(',') : value);
                            }}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                            renderValue={(selected) => `${selected.length} users selected`}
                        >
                            {users.length === 0 ? (
                                <MenuItem value="" disabled>No users found</MenuItem>
                            ) : (
                                users.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.name || user.user?.name || user.email || user.id}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Or paste User IDs (comma/newline separated)"
                        value={manualUserIds}
                        onChange={(event) => setManualUserIds(event.target.value)}
                        multiline
                        rows={3}
                        sx={textFieldStyle}
                        fullWidth
                    />

                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1}>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>
                            Total users to assign: {mergedUserIds.length}
                        </Typography>

                        <Button variant="contained" onClick={handleAssign} disabled={saving || !selectedOrgId} sx={primaryButtonStyle}>
                            {saving ? 'Assigning...' : 'Create Assignment'}
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <Paper sx={{ ...paperStyle, p: 2, mb: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel sx={{ color: '#9CA3AF' }}>Type Filter</InputLabel>
                        <Select
                            label="Type Filter"
                            value={typeFilter}
                            onChange={(event) => setTypeFilter(event.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All</MenuItem>
                            {ASSIGNMENT_TYPES.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 220 }}>
                        <InputLabel sx={{ color: '#9CA3AF' }}>Status Filter</InputLabel>
                        <Select
                            label="Status Filter"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All</MenuItem>
                            {ASSIGNMENT_STATUSES.map((status) => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            <TableContainer component={Paper} sx={paperStyle}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={tableHeaderCellStyle}>Assignee</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Type</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Content</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Due Date</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
                            <TableCell align="right" sx={tableHeaderCellStyle}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!selectedOrgId ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ ...tableBodyCellStyle, py: 5, color: '#9CA3AF' }}>
                                    Select an organization to view assignments.
                                </TableCell>
                            </TableRow>
                        ) : loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ ...tableBodyCellStyle, py: 6 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : assignmentRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ ...tableBodyCellStyle, py: 5, color: '#9CA3AF' }}>
                                    No assignments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            assignmentRows.map((assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell sx={tableBodyCellStyle}>
                                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                            {assignment.user?.name || assignment.user?.email || assignment.user_id}
                                        </Typography>
                                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                            {assignment.user?.email || assignment.user_id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB', textTransform: 'capitalize' }}>
                                        {assignment.type}
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>
                                        {assignment.type === 'course'
                                            ? assignment.course?.title || assignment.course_id || '-'
                                            : assignment.learning_path?.title || assignment.learning_path_id || '-'}
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>
                                        {formatDate(assignment.due_at)}
                                    </TableCell>
                                    <TableCell sx={tableBodyCellStyle}>
                                        <Chip
                                            size="small"
                                            label={assignment.status || 'unknown'}
                                            sx={{
                                                textTransform: 'capitalize',
                                                bgcolor: 'rgba(255,255,255,0.06)',
                                                color:
                                                    assignment.status === 'completed'
                                                        ? '#10B981'
                                                        : assignment.status === 'revoked'
                                                            ? '#EF4444'
                                                            : assignment.status === 'in_progress'
                                                                ? '#3B82F6'
                                                                : '#F59E0B',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={tableBodyCellStyle}>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleRevoke(assignment.id)}
                                            disabled={actionLoading === assignment.id || assignment.status === 'revoked'}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Revoke
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {myAssignments.length > 0 && (
                <Paper sx={{ ...paperStyle, p: 2, mt: 3 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>My Assignments</Typography>
                    <Stack spacing={1}>
                        {myAssignments.map((assignment) => (
                            <Stack
                                key={assignment.id}
                                direction={{ xs: 'column', md: 'row' }}
                                justifyContent="space-between"
                                sx={{ p: 1.25, borderRadius: 1, bgcolor: '#0F1729', border: '1px solid #374151' }}
                            >
                                <Typography sx={{ color: '#E5E7EB' }}>
                                    {assignment.type === 'course'
                                        ? assignment.course?.title || assignment.course_id
                                        : assignment.learning_path?.title || assignment.learning_path_id}
                                </Typography>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>
                                    Status: {assignment.status || '-'}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Paper>
            )}

            <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={closeSnackbar} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrganizationAssignments;

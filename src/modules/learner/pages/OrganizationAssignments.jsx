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
import { useAuth } from '../../../contexts';
import { canManageOrganization } from '../../../utils';
import { useLocation } from 'react-router-dom';
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

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
};

const readCourseLabel = (course = {}) =>
    String(course?.title || course?.name || '').trim() || 'Untitled course';

const readLearningPathLabel = (path = {}) =>
    String(path?.title || path?.name || '').trim() || 'Untitled learning path';

const readAssignmentContentTitle = (assignment = {}) =>
    assignment.type === 'course'
        ? readCourseLabel(assignment.course)
        : readLearningPathLabel(assignment.learning_path);

const readAssignmentUserPrimary = (assignment = {}) =>
    String(assignment.user?.name || assignment.user?.email || '').trim() || 'Unknown user';

const readAssignmentUserSecondary = (assignment = {}) =>
    String(assignment.user?.email || '').trim() || 'No email available';

const readAssignmentOrganizationName = (assignment = {}) =>
    String(
        assignment.organization?.name ||
        assignment.organization_name ||
        assignment.org?.name ||
        assignment.organization?.slug ||
        ''
    ).trim() || 'Organization';

const normalizeStatus = (value) => String(value || '').trim().toLowerCase();
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const readUserId = (entry = {}) =>
    String(
        entry?.id ||
        entry?.user_id ||
        entry?.user?.id ||
        entry?.member_id ||
        entry?.member?.id ||
        ''
    ).trim();

const readUserEmail = (entry = {}) =>
    normalizeEmail(entry?.email || entry?.user?.email || entry?.member?.email || '');

const normalizeUserOption = (entry = {}) => {
    const id = readUserId(entry);
    if (!id) return null;

    return {
        id,
        name: String(entry?.name || entry?.user?.name || entry?.member?.name || '').trim(),
        email: readUserEmail(entry),
    };
};

const mergeUserOptions = (entries = []) => {
    const unique = new Map();

    entries.forEach((entry) => {
        const normalized = normalizeUserOption(entry);
        if (!normalized) return;

        const existing = unique.get(normalized.id) || {};
        unique.set(normalized.id, {
            ...existing,
            ...normalized,
            name: normalized.name || existing.name || '',
            email: normalized.email || existing.email || '',
        });
    });

    return Array.from(unique.values());
};

const formatUserLabel = (entry = {}) => {
    const name = String(entry?.name || '').trim();
    const email = String(entry?.email || '').trim();

    if (name && email) return `${name} (${email})`;
    return name || email || 'Unknown user';
};

const renderSelectedUsers = (selectedIds = [], options = []) => {
    const labels = selectedIds
        .map((id) => options.find((option) => option.id === String(id)) || { id })
        .map((entry) => formatUserLabel(entry))
        .filter(Boolean);

    if (labels.length <= 2) return labels.join(', ');
    return `${labels.slice(0, 2).join(', ')} +${labels.length - 2} more`;
};

const OrganizationAssignments = () => {
    const { user } = useAuth();
    const { pathname } = useLocation();
    const {
        organizations,
        selectedOrgId,
        selectedOrganization,
        setSelectedOrgId,
    } = useOrganizationScope();
    const isMyAssignmentsRoute = pathname.includes('/organization/my-assignments');
    const canManageAssignments = Boolean(selectedOrganization?.can_manage ?? canManageOrganization(user));

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
    const [inviteStats, setInviteStats] = useState({ pending: 0, acceptedWithoutUser: 0 });

    const [selectedUserIds, setSelectedUserIds] = useState([]);

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
        if (!selectedOrgId || !canManageAssignments || isMyAssignmentsRoute) {
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
    }, [canManageAssignments, isMyAssignmentsRoute, selectedOrgId, typeFilter, statusFilter]);

    const listMyAssignments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await organizationService.listMyAssignments({
                status: statusFilter || undefined,
                type: typeFilter || undefined,
                per_page: 20,
            });
            setMyAssignments(response.data || []);
            openSnackbar('Loaded my assignments.');
        } catch (err) {
            console.error('Failed to load my assignments:', err);
            openSnackbar(err.message || 'Failed to load my assignments.', 'error');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, typeFilter]);

    const loadOptions = useCallback(async () => {
        if (!selectedOrgId || !canManageAssignments || isMyAssignmentsRoute) {
            setUsers([]);
            setCourses([]);
            setInviteStats({ pending: 0, acceptedWithoutUser: 0 });
            return;
        }

        try {
            const [usersResponse, coursesResponse, invitationsResponse] = await Promise.all([
                organizationService.listUsers({ per_page: 100, org_id: selectedOrgId }),
                organizationService.listCourses({ per_page: 100, org_id: selectedOrgId }),
                organizationService
                    .listInvitations(selectedOrgId, { per_page: 200 })
                    .catch(() => ({ data: [] })),
            ]);

            const invitationRows = Array.isArray(invitationsResponse?.data) ? invitationsResponse.data : [];
            const pending = invitationRows.filter((invitation) => normalizeStatus(invitation?.status) === 'pending').length;

            const acceptedInvitations = invitationRows.filter(
                (invitation) => normalizeStatus(invitation?.status) === 'accepted'
            );
            const acceptedWithUserId = acceptedInvitations
                .map((invitation) =>
                    normalizeUserOption({
                        id: invitation?.user_id || invitation?.user?.id || invitation?.member_id || invitation?.member?.id,
                        name: invitation?.user?.name || invitation?.member?.name || invitation?.name,
                        email: invitation?.user?.email || invitation?.member?.email || invitation?.email,
                    })
                )
                .filter(Boolean);
            const mergedUsers = mergeUserOptions([...(usersResponse.data || []), ...acceptedWithUserId]);
            setUsers(mergedUsers);
            setCourses(coursesResponse.data || []);

            const knownAcceptedEmails = new Set(
                mergedUsers.map((entry) => normalizeEmail(entry?.email)).filter(Boolean)
            );
            const unresolvedAccepted = acceptedInvitations.filter((invitation) => {
                const email = normalizeEmail(invitation?.email || invitation?.user?.email || invitation?.member?.email);
                if (!email) return true;
                return !knownAcceptedEmails.has(email);
            }).length;

            setInviteStats({
                pending,
                acceptedWithoutUser: unresolvedAccepted,
            });
        } catch (err) {
            console.error('Failed to load assignment options:', err);
            setUsers([]);
            setCourses([]);
            setInviteStats({ pending: 0, acceptedWithoutUser: 0 });
        }
    }, [canManageAssignments, isMyAssignmentsRoute, selectedOrgId]);

    const loadLearningPaths = useCallback(async () => {
        if (!selectedOrgId || !canManageAssignments || isMyAssignmentsRoute) {
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
    }, [canManageAssignments, isMyAssignmentsRoute, selectedOrgId]);

    useEffect(() => {
        loadOptions();
    }, [loadOptions]);

    useEffect(() => {
        loadLearningPaths();
    }, [loadLearningPaths]);

    useEffect(() => {
        listAssignments();
    }, [listAssignments]);

    useEffect(() => {
        if (!isMyAssignmentsRoute && canManageAssignments) return;
        void listMyAssignments();
    }, [canManageAssignments, isMyAssignmentsRoute, listMyAssignments]);

    useEffect(() => {
        const allowedIds = new Set((users || []).map((user) => String(user?.id || '').trim()).filter(Boolean));
        setSelectedUserIds((prev) => prev.filter((id) => allowedIds.has(String(id || '').trim())));
    }, [users]);

    const mergedUserIds = useMemo(
        () => [...new Set(selectedUserIds.map((id) => String(id).trim()).filter(Boolean))],
        [selectedUserIds]
    );

    const userOptions = useMemo(
        () => mergeUserOptions(users).sort((left, right) => formatUserLabel(left).localeCompare(formatUserLabel(right))),
        [users]
    );

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
                        {isMyAssignmentsRoute ? 'My Assignments' : 'Organization Assignments'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        {isMyAssignmentsRoute
                            ? 'View assignments for your account.'
                            : 'Assign courses or learning paths to users and monitor assignment status.'}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={listMyAssignments} sx={{ borderColor: '#374151', color: '#E5E7EB' }}>
                        Load My Assignments
                    </Button>
                    <IconButton onClick={canManageAssignments && !isMyAssignmentsRoute ? listAssignments : listMyAssignments} sx={{ color: '#9CA3AF' }}>
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

            {!canManageAssignments && !isMyAssignmentsRoute && (
                <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#93C5FD' }}>
                    Organization assignment management requires an org admin or manager role. You can still load and view your own assignments below.
                </Alert>
            )}

            {canManageAssignments && !isMyAssignmentsRoute && (
                <>
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
                                                {readCourseLabel(course)}
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
                                                {readLearningPathLabel(path)}
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
                            renderValue={(selected) => renderSelectedUsers(selected, userOptions)}
                        >
                            {userOptions.length === 0 ? (
                                <MenuItem value="" disabled>No users found</MenuItem>
                            ) : (
                                userOptions.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {formatUserLabel(user)}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    {(inviteStats.pending > 0 || inviteStats.acceptedWithoutUser > 0) && (
                        <Alert severity="info" sx={{ bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#93C5FD' }}>
                            {inviteStats.pending > 0
                                ? `${inviteStats.pending} invited user(s) are still pending and cannot be assigned yet. `
                                : ''}
                            {inviteStats.acceptedWithoutUser > 0
                                ? `${inviteStats.acceptedWithoutUser} accepted invite(s) have no linked user record in the API response, so they cannot be added to this selector.`
                                : ''}
                        </Alert>
                    )}

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
                                            {readAssignmentUserPrimary(assignment)}
                                        </Typography>
                                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                            {readAssignmentUserSecondary(assignment)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB', textTransform: 'capitalize' }}>
                                        {assignment.type}
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>
                                        {readAssignmentContentTitle(assignment)}
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
                </>
            )}

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
                                <Box>
                                    <Typography sx={{ color: '#E5E7EB', fontWeight: 600 }}>
                                        {readAssignmentContentTitle(assignment)}
                                    </Typography>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>
                                        Organization: {readAssignmentOrganizationName(assignment)}
                                    </Typography>
                                </Box>
                                <Stack spacing={0.5} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>
                                        Status: {assignment.status || '-'}
                                    </Typography>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>
                                        Due: {formatDate(assignment.due_at)}
                                    </Typography>
                                </Stack>
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

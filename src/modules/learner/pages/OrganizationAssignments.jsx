import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    Fade,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Modal,
    Paper,
    Popover,
    Select,
    Skeleton,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AddRounded,
    AssignmentOutlined,
    BusinessOutlined,
    CalendarMonthRounded,
    CheckCircleRounded,
    FilterListRounded,
    HistoryRounded,
    InfoOutlined,
    RefreshRounded,
    SearchRounded,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts';
import { canManageOrganization } from '../../../utils';
import { useLocation } from 'react-router-dom';
import { organizationService } from '../services/organizationService';
import { useOrganizationScope } from '../hooks/useOrganizationScope';
import OrganizationScopeToolbar from '../components/OrganizationScopeToolbar';
import {
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

const CreateAssignmentModal = ({
    open,
    onClose,
    onAssign,
    saving,
    assignForm,
    setAssignForm,
    courses,
    learningPaths,
    userOptions,
    selectedUserIds,
    setSelectedUserIds,
    inviteStats,
}) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
        >
            <Fade in={open}>
                <Paper
                    sx={{
                        width: '100%',
                        maxWidth: 600,
                        bgcolor: '#0F172A',
                        border: '1px solid #1E293B',
                        borderRadius: 3,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    <Box sx={{ p: 3, borderBottom: '1px solid #1E293B', bgcolor: 'rgba(30, 41, 59, 0.5)' }}>
                        <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                            Create New Assignment
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
                            Assign educational content to your organization members.
                        </Typography>
                    </Box>

                    <Box sx={{ p: 3 }}>
                        <Stack spacing={3}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <FormControl fullWidth>
                                    <InputLabel sx={{ color: '#94A3B8' }}>Content Type</InputLabel>
                                    <Select
                                        label="Content Type"
                                        value={assignForm.type}
                                        onChange={(event) =>
                                            setAssignForm((prev) => ({
                                                ...prev,
                                                type: event.target.value,
                                                course_id: '',
                                                learning_path_id: '',
                                            }))
                                        }
                                        sx={{ ...selectStyle, bgcolor: '#0B1120' }}
                                        MenuProps={selectMenuProps}
                                    >
                                        {ASSIGNMENT_TYPES.map((type) => (
                                            <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                                                {type.replace('_', ' ')}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {assignForm.type === 'course' ? (
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: '#94A3B8' }}>Select Course</InputLabel>
                                        <Select
                                            label="Select Course"
                                            value={assignForm.course_id}
                                            onChange={(event) => setAssignForm((prev) => ({ ...prev, course_id: event.target.value }))}
                                            sx={{ ...selectStyle, bgcolor: '#0B1120' }}
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
                                        <InputLabel sx={{ color: '#94A3B8' }}>Select Learning Path</InputLabel>
                                        <Select
                                            label="Select Learning Path"
                                            value={assignForm.learning_path_id}
                                            onChange={(event) => setAssignForm((prev) => ({ ...prev, learning_path_id: event.target.value }))}
                                            sx={{ ...selectStyle, bgcolor: '#0B1120' }}
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
                            </Stack>

                            <FormControl fullWidth>
                                <InputLabel sx={{ color: '#94A3B8' }}>Select Members</InputLabel>
                                <Select
                                    multiple
                                    label="Select Members"
                                    value={selectedUserIds}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setSelectedUserIds(typeof value === 'string' ? value.split(',') : value);
                                    }}
                                    sx={{ ...selectStyle, bgcolor: '#0B1120' }}
                                    MenuProps={selectMenuProps}
                                    renderValue={(selected) => renderSelectedUsers(selected, userOptions)}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <SearchRounded sx={{ color: '#64748B', fontSize: 20, ml: 1 }} />
                                        </InputAdornment>
                                    }
                                >
                                    {userOptions.length === 0 ? (
                                        <MenuItem value="" disabled>No members found</MenuItem>
                                    ) : (
                                        userOptions.map((user) => (
                                            <MenuItem key={user.id} value={user.id}>
                                                {formatUserLabel(user)}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>

                            <TextField
                                label="Deadline (Optional)"
                                type="date"
                                value={assignForm.due_at}
                                onChange={(event) => setAssignForm((prev) => ({ ...prev, due_at: event.target.value }))}
                                sx={{ ...textFieldStyle, '& .MuiInputBase-root': { bgcolor: '#0B1120' } }}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarMonthRounded sx={{ color: '#64748B', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {(inviteStats.pending > 0 || inviteStats.acceptedWithoutUser > 0) && (
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: 'rgba(59, 130, 246, 0.05)',
                                        border: '1px solid rgba(59, 130, 246, 0.1)',
                                        display: 'flex',
                                        gap: 1.5,
                                    }}
                                >
                                    <InfoOutlined sx={{ color: '#3B82F6', fontSize: 20, mt: 0.2 }} />
                                    <Typography variant="caption" sx={{ color: '#94A3B8', lineHeight: 1.4 }}>
                                        {inviteStats.pending > 0 ? `${inviteStats.pending} members are still pending. ` : ''}
                                        {inviteStats.acceptedWithoutUser > 0 ? `Some members are awaiting sync and aren't listed yet.` : ''}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </Box>

                    <Box sx={{ p: 3, bgcolor: 'rgba(30, 41, 59, 0.5)', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            onClick={onClose}
                            sx={{
                                color: '#94A3B8',
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={onAssign}
                            disabled={saving}
                            sx={{
                                ...primaryButtonStyle,
                                px: 4,
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                            }}
                        >
                            {saving ? 'Creating...' : 'Create Assignment'}
                        </Button>
                    </Box>
                </Paper>
            </Fade>
        </Modal>
    );
};

const FilterPopover = ({
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    return (
        <>
            <Tooltip title="Filters">
                <Button
                    startIcon={<FilterListRounded />}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                        bgcolor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid #1E293B',
                        color: '#E2E8F0',
                        textTransform: 'none',
                        px: 2,
                        '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.8)', borderColor: '#334155' },
                    }}
                >
                    Filters
                    {(typeFilter || statusFilter) && (
                        <Box
                            sx={{
                                ml: 1,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: '#3B82F6',
                                border: '2px solid #0F172A',
                            }}
                        />
                    )}
                </Button>
            </Tooltip>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        bgcolor: '#0F172A',
                        border: '1px solid #1E293B',
                        borderRadius: 2,
                        p: 2,
                        minWidth: 260,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    },
                }}
            >
                <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 700, mb: 2 }}>
                    Filter Assignments
                </Typography>
                <Stack spacing={2.5}>
                    <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: '#94A3B8' }}>Type</InputLabel>
                        <Select
                            label="Type"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All Types</MenuItem>
                            {ASSIGNMENT_TYPES.map((type) => (
                                <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: '#94A3B8' }}>Status</InputLabel>
                        <Select
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All Statuses</MenuItem>
                            {ASSIGNMENT_STATUSES.map((status) => (
                                <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                                    {status}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Divider sx={{ borderColor: '#1E293B' }} />

                    <Button
                        size="small"
                        fullWidth
                        onClick={() => {
                            setTypeFilter('');
                            setStatusFilter('');
                            setAnchorEl(null);
                        }}
                        sx={{ color: '#EF4444', textTransform: 'none', fontWeight: 600 }}
                    >
                        Reset Filters
                    </Button>
                </Stack>
            </Popover>
        </>
    );
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
    const [createModalOpen, setCreateModalOpen] = useState(false);

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
        if (!isMyAssignmentsRoute) return;
        void listMyAssignments();
    }, [isMyAssignmentsRoute, listMyAssignments]);

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
            setCreateModalOpen(false);
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
        <Box sx={{ p: { xs: 2.5, md: 5 }, bgcolor: '#0F1729', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', md: 'center' }}
                spacing={3}
                sx={{ mb: 5 }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            color: '#F8FAFC',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        {isMyAssignmentsRoute ? (
                            <>
                                <AssignmentOutlined sx={{ fontSize: 32, color: '#6366F1' }} />
                                My Learning Tasks
                            </>
                        ) : (
                            <>
                                <AssignmentOutlined sx={{ fontSize: 32, color: '#3B82F6' }} />
                                Organization Assignments
                            </>
                        )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 1, maxWidth: 600 }}>
                        {isMyAssignmentsRoute
                            ? 'Monitor your assigned courses and learning paths, track deadlines, and view your progress in real-time.'
                            : 'Plan your team’s development. Create specific assignments, set deadlines, and monitor completion metrics across your organization.'}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    {canManageAssignments && !isMyAssignmentsRoute && (
                        <Button
                            variant="contained"
                            startIcon={<AddRounded />}
                            onClick={() => setCreateModalOpen(true)}
                            sx={{
                                ...primaryButtonStyle,
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                height: 44,
                            }}
                        >
                            Create Assignment
                        </Button>
                    )}
                    <Tooltip title="Refresh Data">
                        <IconButton
                            onClick={isMyAssignmentsRoute ? listMyAssignments : listAssignments}
                            sx={{
                                color: '#94A3B8',
                                bgcolor: 'rgba(30, 41, 59, 0.4)',
                                border: '1px solid #1E293B',
                                borderRadius: '10px',
                                '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.8)' },
                            }}
                        >
                            <RefreshRounded />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            <OrganizationScopeToolbar
                organizations={organizations}
                selectedOrgId={selectedOrgId}
                selectedOrganization={selectedOrganization}
                onChangeOrgId={setSelectedOrgId}
            />

            {!canManageAssignments && !isMyAssignmentsRoute && (
                <Fade in>
                    <Box
                        sx={{
                            p: 2,
                            mb: 4,
                            borderRadius: 2,
                            bgcolor: 'rgba(59, 130, 246, 0.05)',
                            border: '1px solid rgba(59, 130, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <InfoOutlined sx={{ color: '#3B82F6' }} />
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                            You do not have organization assignment management access. Open the My Assignments menu to view the items assigned to you.
                        </Typography>
                    </Box>
                </Fade>
            )}

            {canManageAssignments && !isMyAssignmentsRoute && (
                <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
                    <FilterPopover
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                    />
                </Stack>
            )}

            {!isMyAssignmentsRoute && (
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        bgcolor: 'rgba(15, 23, 42, 0.4)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        border: '1px solid #1E293B',
                        overflow: 'hidden',
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(30, 41, 59, 0.5)' }}>
                                <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</TableCell>
                                <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</TableCell>
                                <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Content</TableCell>
                                <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due Date</TableCell>
                                <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
                                <TableCell align="right" sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Control</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} sx={{ borderBottom: '1px solid #1E293B' }}>
                                    <TableCell sx={tableBodyCellStyle}>
                                        <Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: '70%', height: 24 }} />
                                        <Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: '50%', height: 16 }} />
                                    </TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: 60 }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: '80%' }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: 100 }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="rectangular" sx={{ bgcolor: '#1E293B', width: 80, height: 24, borderRadius: 1 }} /></TableCell>
                                    <TableCell align="right" sx={tableBodyCellStyle}><Skeleton variant="rectangular" sx={{ bgcolor: '#1E293B', width: 60, height: 32, borderRadius: 1, ml: 'auto' }} /></TableCell>
                                </TableRow>
                            ))
                        ) : !selectedOrgId ? (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ p: 0 }}>
                                    <Box sx={{ py: 10, textAlign: 'center' }}>
                                        <BusinessOutlined sx={{ fontSize: 60, color: '#1E293B', mb: 2 }} />
                                        <Typography sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1 }}>No Organization Selected</Typography>
                                        <Typography sx={{ color: '#64748B', maxWidth: 300, mx: 'auto' }}>Please select an organization context above to see the member assignments.</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : assignmentRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ p: 0 }}>
                                    <Box sx={{ py: 10, textAlign: 'center' }}>
                                        <HistoryRounded sx={{ fontSize: 60, color: '#1E293B', mb: 2 }} />
                                        <Typography sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1 }}>Clean Slate</Typography>
                                        <Typography sx={{ color: '#64748B', maxWidth: 300, mx: 'auto' }}>No assignments have been created yet. Click "Create Assignment" to get started.</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            assignmentRows.map((assignment) => (
                                <TableRow
                                    key={assignment.id}
                                    sx={{
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                                        transition: 'background-color 0.2s ease',
                                        borderBottom: '1px solid #1E293B',
                                    }}
                                >
                                    <TableCell sx={tableBodyCellStyle}>
                                        <Typography sx={{ color: '#F1F5F9', fontWeight: 600, fontSize: '0.9rem' }}>
                                            {readAssignmentUserPrimary(assignment)}
                                        </Typography>
                                        <Typography sx={{ color: '#64748B', fontSize: '0.75rem' }}>
                                            {readAssignmentUserSecondary(assignment)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#94A3B8', textTransform: 'capitalize', fontSize: '0.85rem' }}>
                                        {assignment.type === 'learning_path' ? 'Learning Path' : assignment.type}
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#E2E8F0', fontWeight: 500, fontSize: '0.85rem' }}>
                                        {readAssignmentContentTitle(assignment)}
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#94A3B8', fontSize: '0.85rem' }}>
                                        {formatDate(assignment.due_at)}
                                    </TableCell>
                                    <TableCell sx={tableBodyCellStyle}>
                                        <Chip
                                            size="small"
                                            label={assignment.status || 'unknown'}
                                            sx={{
                                                textTransform: 'capitalize',
                                                bgcolor: assignment.status === 'completed'
                                                    ? 'rgba(16, 185, 129, 0.1)'
                                                    : assignment.status === 'revoked'
                                                        ? 'rgba(239, 68, 68, 0.1)'
                                                        : assignment.status === 'in_progress'
                                                            ? 'rgba(59, 130, 246, 0.1)'
                                                            : 'rgba(245, 158, 11, 0.1)',
                                                color:
                                                    assignment.status === 'completed'
                                                        ? '#10B981'
                                                        : assignment.status === 'revoked'
                                                            ? '#EF4444'
                                                            : assignment.status === 'in_progress'
                                                                ? '#3B82F6'
                                                                : '#F59E0B',
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                borderRadius: '6px',
                                                border: '1px solid transparent',
                                                borderColor: assignment.status === 'completed'
                                                    ? 'rgba(16, 185, 129, 0.2)'
                                                    : 'rgba(239, 68, 68, 0.2)',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={tableBodyCellStyle}>
                                        <Button
                                            size="small"
                                            onClick={() => handleRevoke(assignment.id)}
                                            disabled={actionLoading === assignment.id || assignment.status === 'revoked'}
                                            sx={{
                                                textTransform: 'none',
                                                color: '#EF4444',
                                                fontWeight: 600,
                                                fontSize: '0.8rem',
                                                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' },
                                                '&.Mui-disabled': { color: '#334155' },
                                            }}
                                        >
                                            {actionLoading === assignment.id ? 'Revoking...' : 'Revoke'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {isMyAssignmentsRoute && (
                <Box sx={{ mt: 8 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            color: '#F8FAFC',
                            fontWeight: 700,
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        <CheckCircleRounded sx={{ color: '#10B981' }} />
                        My Active Assignments
                    </Typography>
                    {loading && isMyAssignmentsRoute ? (
                        <Stack spacing={2}>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Paper
                                    key={index}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        bgcolor: '#0F172A',
                                        border: '1px solid #1E293B',
                                    }}
                                >
                                    <Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: '55%', height: 28 }} />
                                    <Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: '35%', height: 20 }} />
                                    <Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: '25%', height: 20 }} />
                                </Paper>
                            ))}
                        </Stack>
                    ) : myAssignments.length === 0 ? (
                        <Paper
                            sx={{
                                p: 4,
                                borderRadius: 3,
                                bgcolor: '#0F172A',
                                border: '1px solid #1E293B',
                                textAlign: 'center',
                            }}
                        >
                            <HistoryRounded sx={{ fontSize: 52, color: '#1E293B', mb: 2 }} />
                            <Typography sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1 }}>
                                No assignments yet
                            </Typography>
                            <Typography sx={{ color: '#64748B', maxWidth: 360, mx: 'auto' }}>
                                You have not been assigned any courses or learning paths yet.
                            </Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={2}>
                            {myAssignments.map((assignment) => (
                                <Paper
                                    key={assignment.id}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        bgcolor: '#0F172A',
                                        border: '1px solid #1E293B',
                                        display: 'flex',
                                        flexDirection: { xs: 'column', md: 'row' },
                                        justifyContent: 'space-between',
                                        gap: 2,
                                        transition: 'transform 0.2s ease, border-color 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            borderColor: '#334155',
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 2,
                                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <AssignmentOutlined sx={{ color: '#6366F1' }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: '#F1F5F9', fontWeight: 600, fontSize: '1rem' }}>
                                                {readAssignmentContentTitle(assignment)}
                                            </Typography>
                                            <Typography sx={{ color: '#64748B', fontSize: '0.85rem', mt: 0.5 }}>
                                                Organization: {readAssignmentOrganizationName(assignment)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Stack direction="row" spacing={3} alignItems="center">
                                        <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                            <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Due Date</Typography>
                                            <Typography sx={{ color: '#E2E8F0', fontWeight: 600 }}>{formatDate(assignment.due_at)}</Typography>
                                        </Box>
                                        <Chip
                                            size="small"
                                            label={assignment.status || 'Pending'}
                                            sx={{
                                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                                                color: '#818CF8',
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                borderRadius: '6px',
                                            }}
                                        />
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Box>
            )}

            <CreateAssignmentModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onAssign={handleAssign}
                saving={saving}
                assignForm={assignForm}
                setAssignForm={setAssignForm}
                courses={courses}
                learningPaths={learningPaths}
                userOptions={userOptions}
                selectedUserIds={selectedUserIds}
                setSelectedUserIds={setSelectedUserIds}
                inviteStats={inviteStats}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={closeSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={closeSnackbar}
                    variant="filled"
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrganizationAssignments;

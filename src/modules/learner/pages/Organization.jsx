import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    Grid,
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
import { AssignmentTurnedIn, GroupAdd, QueryStats, Refresh, Route } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts';
import { canManageOrganization, getOrganizationRole } from '../../../utils';
import {
    paperStyle,
    primaryButtonStyle,
    selectMenuProps,
    selectStyle,
    tableBodyCellStyle,
    tableHeaderCellStyle,
    textFieldStyle,
} from '../../../styles/formStyles';
import { learnerOrganizationService } from '../services/organizationService';
import OrganizationScopeToolbar from '../../organization/components/OrganizationScopeToolbar';

const STORAGE_KEY = 'Integritas Hub_learner_selected_org_id';
const ASSIGNMENT_TYPES = ['course', 'learning_path'];
const ASSIGNMENT_STATUSES = ['assigned', 'in_progress', 'completed', 'revoked'];

const emptyListResponse = { data: [], meta: {}, links: {} };

const resolveTotal = (response) => {
    if (typeof response?.meta?.total === 'number') return response.meta.total;
    if (Array.isArray(response?.data)) return response.data.length;
    return 0;
};

const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
};

const safeList = async (request) => {
    try {
        return await request();
    } catch (error) {
        if ([404, 405].includes(error?.status)) return emptyListResponse;
        throw error;
    }
};

const parseCsv = (value) =>
    String(value || '')
        .split(/[\n,;\s]/)
        .map((item) => item.trim())
        .filter(Boolean);

const getTitle = (item, fallback = '-') =>
    item?.title || item?.name || item?.course?.title || item?.learning_path?.title || fallback;

const StatCard = ({ title, value, subtitle, icon }) => (
    <Paper sx={{ ...paperStyle, p: 2.5, minHeight: 140 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem', mb: 1 }}>{title}</Typography>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.8rem', lineHeight: 1.1 }}>{value}</Typography>
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.78rem', mt: 1 }}>{subtitle}</Typography>
            </Box>
            <Box sx={{ color: '#1152D4', opacity: 0.95 }}>{icon}</Box>
        </Stack>
    </Paper>
);

const Organization = () => {
    const { section } = useParams();
    const { user } = useAuth();
    const canManage = canManageOrganization(user);
    const orgRole = getOrganizationRole(user);

    const [createdOrganizations, setCreatedOrganizations] = useState([]);
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [invitations, setInvitations] = useState([]);
    const [learningPaths, setLearningPaths] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [myAssignments, setMyAssignments] = useState([]);
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);

    const [totals, setTotals] = useState({
        invitations: 0,
        learningPaths: 0,
        assignments: 0,
        myAssignments: 0,
    });

    const [orgForm, setOrgForm] = useState({ name: '', email_domain: '', logo: null });
    const [inviteForm, setInviteForm] = useState({ emails: '', role: 'staff' });
    const [pathForm, setPathForm] = useState({ title: '', description: '' });
    const [assignForm, setAssignForm] = useState({
        type: 'course',
        course_id: '',
        learning_path_id: '',
        due_at: '',
        user_ids: '',
    });
    const [myFilter, setMyFilter] = useState({ type: '', status: '' });

    const organizations = useMemo(() => {
        const fromUser = Array.isArray(user?.organizations) ? user.organizations : [];
        const fromSingle = user?.organization && typeof user.organization === 'object' ? [user.organization] : [];
        const merged = [...fromUser, ...fromSingle, ...createdOrganizations];
        const deduped = new Map();
        merged.forEach((item) => {
            const key = String(item?.id || '').trim();
            if (key) deduped.set(key, item);
        });
        return Array.from(deduped.values());
    }, [user, createdOrganizations]);

    const activeOrgId = useMemo(() => {
        if (selectedOrgId) return selectedOrgId;
        return String(organizations[0]?.id || user?.organization_id || user?.org_id || '').trim();
    }, [organizations, selectedOrgId, user]);

    const selectedOrganization = useMemo(
        () => organizations.find((item) => String(item?.id || '') === String(activeOrgId || '')) || null,
        [organizations, activeOrgId]
    );

    const showToast = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const requests = [safeList(() => learnerOrganizationService.listMyAssignments({ ...myFilter, org_id: activeOrgId || undefined, per_page: 20 }))];

            if (canManage && activeOrgId) {
                requests.push(
                    safeList(() => learnerOrganizationService.listInvitations(activeOrgId, { per_page: 20 })),
                    safeList(() => learnerOrganizationService.listLearningPaths(activeOrgId, { per_page: 20 })),
                    safeList(() => learnerOrganizationService.listAssignments(activeOrgId, { per_page: 20 })),
                    safeList(() => learnerOrganizationService.getProgressReport(activeOrgId, { per_page: 20 })),
                    safeList(() => learnerOrganizationService.listUsers({ per_page: 100 })),
                    safeList(() => learnerOrganizationService.listCourses({ per_page: 100 }))
                );
            }

            const results = await Promise.all(requests);
            const myAssignmentsRes = results[0] || emptyListResponse;
            const invitationRes = results[1] || emptyListResponse;
            const pathRes = results[2] || emptyListResponse;
            const assignmentRes = results[3] || emptyListResponse;
            const reportRes = results[4] || emptyListResponse;
            const usersRes = results[5] || emptyListResponse;
            const coursesRes = results[6] || emptyListResponse;

            setMyAssignments(myAssignmentsRes.data || []);
            setInvitations(invitationRes.data || []);
            setLearningPaths(pathRes.data || []);
            setAssignments(assignmentRes.data || []);
            setReports(reportRes.data || []);
            setUsers(usersRes.data || []);
            setCourses(coursesRes.data || []);

            setTotals({
                invitations: resolveTotal(invitationRes),
                learningPaths: resolveTotal(pathRes),
                assignments: resolveTotal(assignmentRes),
                myAssignments: resolveTotal(myAssignmentsRes),
            });
        } catch (requestError) {
            console.error('Failed to load organization data:', requestError);
            setError(requestError?.message || 'Failed to load organization data.');
        } finally {
            setLoading(false);
        }
    }, [activeOrgId, canManage, myFilter]);

    useEffect(() => {
        const stored = String(localStorage.getItem(STORAGE_KEY) || '').trim();
        if (stored) setSelectedOrgId(stored);
    }, []);

    useEffect(() => {
        if (activeOrgId) localStorage.setItem(STORAGE_KEY, activeOrgId);
    }, [activeOrgId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreateOrganization = async () => {
        if (!String(orgForm.name || '').trim()) {
            showToast('Organization name is required.', 'error');
            return;
        }
        try {
            const created = orgForm.logo
                ? await learnerOrganizationService.createOrganizationMultipart(orgForm)
                : await learnerOrganizationService.createOrganizationJson({
                    name: orgForm.name.trim(),
                    email_domain: String(orgForm.email_domain || '').trim() || undefined,
                });
            const org = created?.organization || created?.data || created;
            if (org?.id) {
                setCreatedOrganizations((prev) => [...prev, org]);
                setSelectedOrgId(String(org.id));
            }
            setOrgForm({ name: '', email_domain: '', logo: null });
            showToast('Organization created.');
        } catch (requestError) {
            console.error('Failed to create organization:', requestError);
            showToast(requestError?.message || 'Failed to create organization.', 'error');
        }
    };

    const handleInvite = async () => {
        if (!activeOrgId) return showToast('Select an organization first.', 'error');
        const emails = parseCsv(inviteForm.emails);
        if (emails.length === 0) return showToast('Add at least one email.', 'error');
        try {
            await learnerOrganizationService.batchInviteStaff(activeOrgId, {
                role: inviteForm.role,
                emails,
                expires_days: 7,
            });
            setInviteForm({ emails: '', role: inviteForm.role });
            showToast('Invitations sent.');
            await loadData();
        } catch (requestError) {
            showToast(requestError?.message || 'Failed to send invites.', 'error');
        }
    };

    const handleCreatePath = async () => {
        if (!activeOrgId) return showToast('Select an organization first.', 'error');
        if (!String(pathForm.title || '').trim()) return showToast('Path title is required.', 'error');
        try {
            await learnerOrganizationService.createLearningPath(activeOrgId, {
                title: pathForm.title.trim(),
                description: String(pathForm.description || '').trim(),
            });
            setPathForm({ title: '', description: '' });
            showToast('Learning path created.');
            await loadData();
        } catch (requestError) {
            showToast(requestError?.message || 'Failed to create learning path.', 'error');
        }
    };

    const handleAssign = async () => {
        if (!activeOrgId) return showToast('Select an organization first.', 'error');
        const userIds = parseCsv(assignForm.user_ids);
        if (userIds.length === 0) return showToast('Provide user IDs.', 'error');

        const payload = {
            type: assignForm.type,
            user_ids: userIds,
            due_at: assignForm.due_at || undefined,
        };
        if (assignForm.type === 'course') payload.course_id = assignForm.course_id;
        if (assignForm.type === 'learning_path') payload.learning_path_id = assignForm.learning_path_id;

        try {
            await learnerOrganizationService.assignToUsers(activeOrgId, payload);
            setAssignForm((prev) => ({ ...prev, user_ids: '', due_at: '' }));
            showToast('Assignment created.');
            await loadData();
        } catch (requestError) {
            showToast(requestError?.message || 'Failed to create assignment.', 'error');
        }
    };

    return (
        <Box sx={{ color: '#fff', pb: 4 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Organization</Typography>
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                        Learner organization API is now attached to this module UI.
                        {section ? ` Current menu: ${String(section).replace(/-/g, ' ')}.` : ''}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Chip label={`Role: ${orgRole || 'learner'}`} sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#34D399', textTransform: 'capitalize' }} />
                    <Button variant="outlined" onClick={loadData} startIcon={<Refresh />} sx={{ borderColor: '#374151', color: '#E5E7EB', textTransform: 'none' }}>
                        Refresh
                    </Button>
                </Stack>
            </Stack>

            <OrganizationScopeToolbar
                title="Active Organization Context"
                subtitle="Pick organization context for organization endpoints."
                organizations={organizations}
                selectedOrgId={activeOrgId}
                selectedOrganization={selectedOrganization}
                onChangeOrgId={(value) => setSelectedOrgId(String(value || ''))}
                actions={
                    <Button variant="contained" onClick={handleCreateOrganization} sx={{ ...primaryButtonStyle, textTransform: 'none', minHeight: 40 }}>
                        Create Org
                    </Button>
                }
            />

            <Paper sx={{ ...paperStyle, p: 2, mb: 2.5 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                        label="Organization Name"
                        value={orgForm.name}
                        onChange={(event) => setOrgForm((prev) => ({ ...prev, name: event.target.value }))}
                        sx={textFieldStyle}
                        fullWidth
                    />
                    <TextField
                        label="Email Domain (optional)"
                        value={orgForm.email_domain}
                        onChange={(event) => setOrgForm((prev) => ({ ...prev, email_domain: event.target.value }))}
                        sx={textFieldStyle}
                        fullWidth
                    />
                    <Button
                        variant="outlined"
                        component="label"
                        sx={{ borderColor: '#374151', color: '#E5E7EB', textTransform: 'none', minHeight: 40 }}
                    >
                        {orgForm.logo ? 'Logo Selected' : 'Upload Logo'}
                        <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0] || null;
                                setOrgForm((prev) => ({ ...prev, logo: file }));
                            }}
                        />
                    </Button>
                </Stack>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

            {loading ? (
                <Paper sx={{ ...paperStyle, p: 6, textAlign: 'center' }}><CircularProgress /></Paper>
            ) : (
                <>
                    <Grid container spacing={2} sx={{ mb: 2.5 }}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <StatCard title="Pending Invitations" value={totals.invitations} subtitle="Invitation records." icon={<GroupAdd sx={{ fontSize: 34 }} />} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <StatCard title="Learning Paths" value={totals.learningPaths} subtitle="Paths in org." icon={<Route sx={{ fontSize: 34 }} />} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <StatCard title="Assignments" value={totals.assignments} subtitle="Organization assignments." icon={<AssignmentTurnedIn sx={{ fontSize: 34 }} />} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <StatCard title="My Assignments" value={totals.myAssignments} subtitle="Your assignments." icon={<QueryStats sx={{ fontSize: 34 }} />} />
                        </Grid>
                    </Grid>

                    {canManage && (
                        <Paper sx={{ ...paperStyle, p: 2.5, mb: 2.5 }}>
                            <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>Invitations</Typography>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                                <TextField label="Emails (comma/newline)" value={inviteForm.emails} onChange={(event) => setInviteForm((prev) => ({ ...prev, emails: event.target.value }))} sx={textFieldStyle} fullWidth />
                                <FormControl sx={{ minWidth: 180 }}>
                                    <InputLabel sx={{ color: '#9CA3AF' }}>Role</InputLabel>
                                    <Select label="Role" value={inviteForm.role} onChange={(event) => setInviteForm((prev) => ({ ...prev, role: event.target.value }))} sx={selectStyle} MenuProps={selectMenuProps}>
                                        <MenuItem value="staff">staff</MenuItem>
                                        <MenuItem value="manager">manager</MenuItem>
                                        <MenuItem value="admin">admin</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button variant="contained" onClick={handleInvite} sx={{ ...primaryButtonStyle, textTransform: 'none' }}>Invite</Button>
                            </Stack>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                Latest invitations: {(invitations || []).slice(0, 6).map((item) => item.email).join(', ') || 'none'}
                            </Typography>
                        </Paper>
                    )}

                    {canManage && (
                        <Paper sx={{ ...paperStyle, p: 2.5, mb: 2.5 }}>
                            <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>Learning Paths</Typography>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                                <TextField label="Title" value={pathForm.title} onChange={(event) => setPathForm((prev) => ({ ...prev, title: event.target.value }))} sx={textFieldStyle} fullWidth />
                                <TextField label="Description" value={pathForm.description} onChange={(event) => setPathForm((prev) => ({ ...prev, description: event.target.value }))} sx={textFieldStyle} fullWidth />
                                <Button variant="contained" onClick={handleCreatePath} sx={{ ...primaryButtonStyle, textTransform: 'none' }}>Create Path</Button>
                            </Stack>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                Latest paths: {(learningPaths || []).slice(0, 6).map((item) => item.title || item.id).join(', ') || 'none'}
                            </Typography>
                        </Paper>
                    )}

                    {canManage && (
                        <Paper sx={{ ...paperStyle, p: 2.5, mb: 2.5 }}>
                            <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>Create Assignment</Typography>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                                <FormControl sx={{ minWidth: 180 }}>
                                    <InputLabel sx={{ color: '#9CA3AF' }}>Type</InputLabel>
                                    <Select label="Type" value={assignForm.type} onChange={(event) => setAssignForm((prev) => ({ ...prev, type: event.target.value }))} sx={selectStyle} MenuProps={selectMenuProps}>
                                        <MenuItem value="course">course</MenuItem>
                                        <MenuItem value="learning_path">learning_path</MenuItem>
                                    </Select>
                                </FormControl>
                                {assignForm.type === 'course' ? (
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: '#9CA3AF' }}>Course</InputLabel>
                                        <Select label="Course" value={assignForm.course_id} onChange={(event) => setAssignForm((prev) => ({ ...prev, course_id: event.target.value }))} sx={selectStyle} MenuProps={selectMenuProps}>
                                            {courses.map((course) => (
                                                <MenuItem key={course.id} value={course.id}>{course.title || course.id}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: '#9CA3AF' }}>Learning Path</InputLabel>
                                        <Select label="Learning Path" value={assignForm.learning_path_id} onChange={(event) => setAssignForm((prev) => ({ ...prev, learning_path_id: event.target.value }))} sx={selectStyle} MenuProps={selectMenuProps}>
                                            {learningPaths.map((path) => (
                                                <MenuItem key={path.id} value={path.id}>{path.title || path.id}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                                <TextField label="User IDs (comma/newline)" value={assignForm.user_ids} onChange={(event) => setAssignForm((prev) => ({ ...prev, user_ids: event.target.value }))} sx={textFieldStyle} fullWidth />
                                <Button variant="contained" onClick={handleAssign} sx={{ ...primaryButtonStyle, textTransform: 'none' }}>Assign</Button>
                            </Stack>
                        </Paper>
                    )}

                    <Paper sx={{ ...paperStyle, p: 2.5, mb: 2.5 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 1.5 }}>
                            <Typography sx={{ color: '#fff', fontWeight: 700 }}>My Assignments</Typography>
                            <Stack direction="row" spacing={1}>
                                <FormControl sx={{ minWidth: 180 }}>
                                    <InputLabel sx={{ color: '#9CA3AF' }}>Type</InputLabel>
                                    <Select label="Type" value={myFilter.type} onChange={(event) => setMyFilter((prev) => ({ ...prev, type: event.target.value }))} sx={selectStyle} MenuProps={selectMenuProps}>
                                        <MenuItem value="">all</MenuItem>
                                        {ASSIGNMENT_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <FormControl sx={{ minWidth: 180 }}>
                                    <InputLabel sx={{ color: '#9CA3AF' }}>Status</InputLabel>
                                    <Select label="Status" value={myFilter.status} onChange={(event) => setMyFilter((prev) => ({ ...prev, status: event.target.value }))} sx={selectStyle} MenuProps={selectMenuProps}>
                                        <MenuItem value="">all</MenuItem>
                                        {ASSIGNMENT_STATUSES.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Stack>
                        <TableContainer component={Paper} sx={{ ...paperStyle, bgcolor: '#111827' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={tableHeaderCellStyle}>Type</TableCell>
                                        <TableCell sx={tableHeaderCellStyle}>Item</TableCell>
                                        <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
                                        <TableCell sx={tableHeaderCellStyle}>Due</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(myAssignments || []).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} sx={{ ...tableBodyCellStyle, color: '#9CA3AF', textAlign: 'center' }}>No assignments found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        myAssignments.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB', textTransform: 'capitalize' }}>{item.type || '-'}</TableCell>
                                                <TableCell sx={{ ...tableBodyCellStyle, color: '#fff', fontWeight: 600 }}>{getTitle(item, 'Assignment')}</TableCell>
                                                <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB', textTransform: 'capitalize' }}>{item.status || '-'}</TableCell>
                                                <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>{formatDateTime(item.due_at)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {canManage && (
                        <Paper sx={{ ...paperStyle, p: 2.5 }}>
                            <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>Reports (Progress)</Typography>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem', mb: 1.5 }}>
                                Latest report rows: {reports.length}
                            </Typography>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                Assignment rows loaded: {assignments.length}. User options loaded: {users.length}. Course options loaded: {courses.length}.
                            </Typography>
                        </Paper>
                    )}
                </>
            )}

            <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Organization;

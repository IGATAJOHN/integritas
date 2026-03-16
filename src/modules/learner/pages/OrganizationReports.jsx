import React, { useCallback, useEffect, useState } from 'react';
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
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AssessmentOutlined,
    AssignmentOutlined,
    BusinessOutlined,
    CalendarTodayRounded,
    FilterListRounded,
    InsightsRounded,
    PersonOutlineRounded,
    RefreshRounded,
} from '@mui/icons-material';
import { organizationService } from '../services/organizationService';
import { useOrganizationScope } from '../hooks/useOrganizationScope';
import OrganizationScopeToolbar from '../components/OrganizationScopeToolbar';
import {
    paperStyle,
    selectMenuProps,
    selectStyle,
    tableBodyCellStyle,
    tableHeaderCellStyle,
} from '../../../styles/formStyles';

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const readCourseLabel = (course = {}) =>
    String(course?.title || course?.name || '').trim() || 'Untitled course';

const readUserLabel = (user = {}) =>
    String(user?.name || user?.email || '').trim() || 'Unknown user';

const FilterPopover = ({
    courseFilter,
    setCourseFilter,
    userFilter,
    setUserFilter,
    courses,
    users,
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    return (
        <>
            <Tooltip title="Filter Reports">
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
                    {(courseFilter || userFilter) && (
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
                        minWidth: 320,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    },
                }}
            >
                <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 700, mb: 2 }}>
                    Report Scope Filters
                </Typography>
                <Stack spacing={2.5}>
                    <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: '#94A3B8' }}>Filter by Course</InputLabel>
                        <Select
                            label="Filter by Course"
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All Active Courses</MenuItem>
                            {courses.map((course) => (
                                <MenuItem key={course.id} value={course.id}>
                                    {readCourseLabel(course)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: '#94A3B8' }}>Filter by Learner</InputLabel>
                        <Select
                            label="Filter by Learner"
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All Organization Members</MenuItem>
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {readUserLabel(user)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Divider sx={{ borderColor: '#1E293B' }} />

                    <Button
                        size="small"
                        fullWidth
                        onClick={() => {
                            setCourseFilter('');
                            setUserFilter('');
                            setAnchorEl(null);
                        }}
                        sx={{ color: '#EF4444', textTransform: 'none', fontWeight: 600 }}
                    >
                        Clear All Parameters
                    </Button>
                </Stack>
            </Popover>
        </>
    );
};

const OrganizationReports = () => {
    const {
        organizations,
        selectedOrgId,
        selectedOrganization,
        setSelectedOrgId,
    } = useOrganizationScope();

    const [reportRows, setReportRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);

    const [courseFilter, setCourseFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const openSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const loadOptions = useCallback(async () => {
        if (!selectedOrgId) return;
        try {
            const [coursesResponse, usersResponse] = await Promise.all([
                organizationService.listCourses({ per_page: 100, org_id: selectedOrgId || undefined }),
                organizationService.listUsers({ per_page: 100, org_id: selectedOrgId || undefined }),
            ]);

            setCourses(coursesResponse.data || []);
            setUsers(usersResponse.data || []);
        } catch (err) {
            console.error('Failed to load report options:', err);
            setCourses([]);
            setUsers([]);
        }
    }, [selectedOrgId]);

    const loadProgressReport = useCallback(async (isSilent = false) => {
        if (!selectedOrgId) {
            setReportRows([]);
            return;
        }

        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const response = await organizationService.getProgressReport(selectedOrgId, {
                course_id: courseFilter,
                user_id: userFilter,
                per_page: 50,
            });

            setReportRows(response.data || []);
        } catch (err) {
            console.error('Failed to load progress report:', err);
            setReportRows([]);
            openSnackbar(err.message || 'Failed to load progress report.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedOrgId, courseFilter, userFilter]);

    useEffect(() => {
        loadOptions();
    }, [loadOptions]);

    useEffect(() => {
        loadProgressReport();
    }, [loadProgressReport]);

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
                        <InsightsRounded sx={{ fontSize: 32, color: '#10B981' }} />
                        Progress Intelligence
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 1, maxWidth: 600 }}>
                        Deep dive into organizational learning efficacy. Track enrollment status, course completion rates, and individual performance benchmarks.
                    </Typography>
                </Box>

                <Tooltip title="Synchronize Intelligence">
                    <IconButton
                        onClick={() => loadProgressReport(true)}
                        disabled={refreshing || loading}
                        sx={{
                            color: '#94A3B8',
                            bgcolor: 'rgba(30, 41, 59, 0.4)',
                            border: '1px solid #1E293B',
                            borderRadius: '10px',
                            height: 44,
                            width: 44,
                            '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.8)' },
                        }}
                    >
                        <RefreshRounded sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                        <style>{`
                            @keyframes spin {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </IconButton>
                </Tooltip>
            </Stack>

            <OrganizationScopeToolbar
                organizations={organizations}
                selectedOrgId={selectedOrgId}
                selectedOrganization={selectedOrganization}
                onChangeOrgId={setSelectedOrgId}
            />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, mt: 4 }}>
                <Typography sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                    Showing {reportRows.length} performance records
                </Typography>
                <FilterPopover
                    courseFilter={courseFilter}
                    setCourseFilter={setCourseFilter}
                    userFilter={userFilter}
                    setUserFilter={setUserFilter}
                    courses={courses}
                    users={users}
                />
            </Stack>

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
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Learner Identity</TableCell>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course Domain</TableCell>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Status</TableCell>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mastery %</TableCell>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} sx={{ borderBottom: '1px solid #1E293B' }}>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: '60%', height: 24 }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: '80%' }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="rectangular" sx={{ bgcolor: '#1E293B', width: 90, height: 24, borderRadius: 1 }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: 40 }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: '40%' }} /></TableCell>
                                </TableRow>
                            ))
                        ) : !selectedOrgId ? (
                            <TableRow>
                                <TableCell colSpan={5} sx={{ p: 0 }}>
                                    <Box sx={{ py: 12, textAlign: 'center' }}>
                                        <BusinessOutlined sx={{ fontSize: 60, color: '#1E293B', mb: 2 }} />
                                        <Typography sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1 }}>Context Required</Typography>
                                        <Typography sx={{ color: '#64748B', maxWidth: 300, mx: 'auto' }}>Select an organization to activate the real-time progress intelligence dashboard.</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : reportRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} sx={{ p: 0 }}>
                                    <Box sx={{ py: 12, textAlign: 'center' }}>
                                        <AssessmentOutlined sx={{ fontSize: 60, color: '#1E293B', mb: 2 }} />
                                        <Typography sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1 }}>No Intelligence Records</Typography>
                                        <Typography sx={{ color: '#64748B', maxWidth: 350, mx: 'auto' }}>
                                            {courseFilter || userFilter 
                                                ? "No records found matching your specified intelligence parameters."
                                                : "No active enrollments detected for this organization context."}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            reportRows.map((row) => {
                                const progress = row.progress_percent || 0;
                                const isCompleted = row.status === 'completed' || progress === 100;
                                
                                return (
                                    <TableRow
                                        key={row.id}
                                        sx={{
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                                            transition: 'background-color 0.2s ease',
                                            borderBottom: '1px solid #1E293B',
                                        }}
                                    >
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isCompleted ? '#10B981' : '#3B82F6' }} />
                                                <Typography sx={{ color: '#F8FAFC', fontWeight: 600, fontSize: '0.9rem' }}>
                                                    {readUserLabel(row.user)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Typography sx={{ color: '#CBD5E1', fontSize: '0.85rem' }}>
                                                {readCourseLabel(courses.find((c) => c.id === row.course_id) || row.course)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Chip
                                                size="small"
                                                label={row.status || 'Active'}
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    bgcolor: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                    color: isCompleted ? '#10B981' : '#3B82F6',
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem',
                                                    borderRadius: '6px',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography sx={{ color: isCompleted ? '#10B981' : '#F1F5F9', fontWeight: 800, fontSize: '1rem' }}>
                                                    {progress}%
                                                </Typography>
                                                {isCompleted && <CheckCircleRounded sx={{ fontSize: 14, color: '#10B981' }} />}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Stack spacing={0.5}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CalendarTodayRounded sx={{ fontSize: 12, color: '#475569' }} />
                                                    <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                                                        In: {formatDate(row.enrolled_at)}
                                                    </Typography>
                                                </Box>
                                                {row.completed_at && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <CheckCircleRounded sx={{ fontSize: 12, color: '#10B981' }} />
                                                        <Typography sx={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 600 }}>
                                                            Out: {formatDate(row.completed_at)}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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

export default OrganizationReports;

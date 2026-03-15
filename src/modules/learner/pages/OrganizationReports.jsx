import React, { useCallback, useEffect, useState } from 'react';
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
    return date.toLocaleDateString();
};

const readCourseLabel = (course = {}) =>
    String(course?.title || course?.name || '').trim() || 'Untitled course';

const readUserLabel = (user = {}) =>
    String(user?.name || user?.email || '').trim() || 'Unknown user';

const OrganizationReports = () => {
    const {
        organizations,
        selectedOrgId,
        selectedOrganization,
        setSelectedOrgId,
    } = useOrganizationScope();

    const [reportRows, setReportRows] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const loadProgressReport = useCallback(async () => {
        if (!selectedOrgId) {
            setReportRows([]);
            return;
        }

        setLoading(true);
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
        }
    }, [selectedOrgId, courseFilter, userFilter]);

    useEffect(() => {
        loadOptions();
    }, [loadOptions]);

    useEffect(() => {
        loadProgressReport();
    }, [loadProgressReport]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Organization Progress Reports
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Track course progress using organization enrollment report endpoint.
                    </Typography>
                </Box>

                <IconButton onClick={loadProgressReport} sx={{ color: '#9CA3AF' }}>
                    <Refresh />
                </IconButton>
            </Stack>

            <OrganizationScopeToolbar
                organizations={organizations}
                selectedOrgId={selectedOrgId}
                selectedOrganization={selectedOrganization}
                onChangeOrgId={setSelectedOrgId}
            />

            <Paper sx={{ ...paperStyle, p: 2, mb: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel sx={{ color: '#9CA3AF' }}>Course</InputLabel>
                        <Select
                            label="Course"
                            value={courseFilter}
                            onChange={(event) => setCourseFilter(event.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All Courses</MenuItem>
                            {courses.map((course) => (
                                <MenuItem key={course.id} value={course.id}>
                                    {readCourseLabel(course)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel sx={{ color: '#9CA3AF' }}>User</InputLabel>
                        <Select
                            label="User"
                            value={userFilter}
                            onChange={(event) => setUserFilter(event.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All Users</MenuItem>
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {readUserLabel(user)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            <TableContainer component={Paper} sx={paperStyle}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={tableHeaderCellStyle}>User</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Course</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Progress %</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Enrolled At</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Completed At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!selectedOrgId ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ ...tableBodyCellStyle, py: 5, color: '#9CA3AF' }}>
                                    Select an organization to view progress report.
                                </TableCell>
                            </TableRow>
                        ) : loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ ...tableBodyCellStyle, py: 6 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : reportRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ ...tableBodyCellStyle, py: 5, color: '#9CA3AF' }}>
                                    No progress records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reportRows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell sx={tableBodyCellStyle}>
                                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                            {readUserLabel(row.user)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>
                                        {readCourseLabel(courses.find((course) => course.id === row.course_id) || row.course)}
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB', textTransform: 'capitalize' }}>
                                        {row.status || '-'}
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>
                                        {row.progress_percent || 0}
                                    </TableCell>
                                    <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>
                                        {formatDate(row.enrolled_at)}
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

            <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={closeSnackbar} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrganizationReports;

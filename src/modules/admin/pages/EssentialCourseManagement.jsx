import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    IconButton,
    InputBase,
    InputLabel,
    MenuItem,
    Modal,
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
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Add,
    Close,
    Delete,
    Edit,
    Refresh,
    Search,
    Visibility,
} from '@mui/icons-material';
import { optionAdminService } from '../services/optionAdminService';
import { categoryService } from '../../../services';
import {
    modalStyle,
    paperStyle,
    primaryButtonStyle,
    searchBarStyle,
    searchInputStyle,
    selectMenuProps,
    selectStyle,
    tableBodyCellStyle,
    tableHeaderCellStyle,
    textFieldStyle,
} from '../../../styles/formStyles';

const COURSE_STATUSES = ['draft', 'published', 'archived'];

const parseCommaList = (value) =>
    String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const getTutorOptionLabel = (tutor) =>
    tutor?.name || tutor?.user?.name || tutor?.email || tutor?.id || 'Unknown tutor';

const getCourseTutors = (course) => {
    const candidates = [
        course?.tutors,
        course?.users,
        course?.course_tutors,
        course?.courseTutors,
        course?.tutor_users,
        course?.tutorUsers,
        course?.tutor_assignments,
        course?.tutorAssignments,
        course?.data?.tutors,
        course?.data?.users,
        course?.data?.course_tutors,
        course?.data?.courseTutors,
        course?.data?.tutor_users,
        course?.data?.tutorUsers,
        course?.data?.tutor_assignments,
        course?.data?.tutorAssignments,
    ];

    return candidates.find((value) => Array.isArray(value)) || [];
};

const getCourseCategories = (course) => {
    if (Array.isArray(course?.categories)) return course.categories;
    if (Array.isArray(course?.data?.categories)) return course.data.categories;
    return [];
};

const normalizeTutorEntity = (item, tutorOptions = []) => {
    if (item === null || item === undefined) return null;

    if (typeof item === 'string' || typeof item === 'number') {
        const id = String(item).trim();
        if (!id) return null;
        const fallbackTutor = tutorOptions.find((tutor) => String(tutor?.id) === id);
        if (fallbackTutor) {
            return {
                id,
                name: getTutorOptionLabel(fallbackTutor),
                email: fallbackTutor?.email || fallbackTutor?.user?.email || '',
            };
        }
        return { id, name: id };
    }

    const nestedTutor = (item.tutor && typeof item.tutor === 'object')
        ? item.tutor
        : (item.user && typeof item.user === 'object')
            ? item.user
            : null;

    const source = nestedTutor || item;
    const rawId = source?.id || item?.tutor_id || item?.user_id || item?.pivot?.tutor_id || item?.pivot?.user_id;
    if (!rawId) return null;

    const id = String(rawId).trim();
    if (!id) return null;

    const name = source?.name || source?.full_name || source?.email || id;
    const email = source?.email || item?.email || '';

    return { ...source, id, name, email };
};

const getCourseTutorIds = (course) => {
    const idSources = [
        course?.tutor_ids,
        course?.tutorIds,
        course?.data?.tutor_ids,
        course?.data?.tutorIds,
    ];

    const idsFromDirectFields = idSources.flatMap((value) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return parseCommaList(value);
        return [];
    });

    const tutors = getCourseTutors(course);
    const idsFromTutorArray = tutors.map((tutor) => {
        if (typeof tutor === 'string' || typeof tutor === 'number') return tutor;
        return tutor?.id || tutor?.tutor_id || tutor?.user_id || tutor?.pivot?.tutor_id || null;
    });

    return [...idsFromDirectFields, ...idsFromTutorArray]
        .map((id) => String(id || '').trim())
        .filter(Boolean);
};

const dedupeTutorsById = (tutors = []) => {
    const seen = new Set();
    return tutors.filter((tutor) => {
        const id = String(tutor?.id || '').trim();
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

const resolveCourseTutors = (course, { fallbackCourse = null, tutorOptions = [] } = {}) => {
    const rawTutors = [...getCourseTutors(course), ...getCourseTutors(fallbackCourse)];
    const normalizedTutors = dedupeTutorsById(
        rawTutors
            .map((item) => normalizeTutorEntity(item, tutorOptions))
            .filter(Boolean)
    );

    if (normalizedTutors.length > 0) return normalizedTutors;

    const tutorIds = [...getCourseTutorIds(course), ...getCourseTutorIds(fallbackCourse)]
        .map((id) => String(id || '').trim())
        .filter(Boolean);

    if (tutorIds.length === 0) return [];

    return dedupeTutorsById(
        tutorIds.map((id) => {
            const fallbackTutor = tutorOptions.find((tutor) => String(tutor?.id) === id);
            if (fallbackTutor) {
                return {
                    id,
                    name: getTutorOptionLabel(fallbackTutor),
                    email: fallbackTutor?.email || fallbackTutor?.user?.email || '',
                };
            }
            return { id, name: id, email: '' };
        })
    );
};

const EssentialCourseManagement = () => {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const [tutorOptions, setTutorOptions] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedTutorIds, setSelectedTutorIds] = useState([]);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const openSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const listCourses = useCallback(async ({ q = '', status = '' } = {}) => {
        setLoading(true);
        setError('');

        try {
            const response = await optionAdminService.listEssentialCourses({
                q,
                status,
                with_categories: 1,
                with_tutors: 1,
                with_audit: 1,
                per_page: 50,
            });

            setCourses(response.data || []);
        } catch (err) {
            console.error('Failed to load essential courses:', err);
            setError(err.message || 'Failed to load essential courses.');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const listTutors = useCallback(async () => {
        try {
            const response = await optionAdminService.listTutors({ per_page: 100 });
            setTutorOptions(response.data || []);
        } catch (err) {
            console.error('Failed to load tutor options:', err);
        }
    }, []);

    const listCategories = useCallback(async () => {
        try {
            const response = await categoryService.listCategories({ per_page: 100 });
            setCategoryOptions(response.data || []);
        } catch (err) {
            console.error('Failed to load category options:', err);
        }
    }, []);

    useEffect(() => {
        listTutors();
        listCategories();
    }, [listTutors, listCategories]);

    useEffect(() => {
        const timer = setTimeout(() => {
            listCourses({ q: searchTerm, status: statusFilter });
        }, 350);

        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, listCourses]);

    const courseRows = useMemo(() => {
        return courses.map((course) => {
            const tutors = resolveCourseTutors(course, { tutorOptions });
            const categories = getCourseCategories(course);

            return {
                ...course,
                _title: course.title || '-',
                _status: String(course.status || 'unknown').toLowerCase(),
                _duration: course.duration_minutes || '-',
                _tutorCount: tutors.length,
                _categoryCount: categories.length,
            };
        });
    }, [courses, tutorOptions]);

    const loadCourseDetail = useCallback(async (
        courseId,
        { openModal = false, fallbackCourse = null } = {}
    ) => {
        setDetailLoading(true);
        try {
            const detail = await optionAdminService.getEssentialCourseById(courseId, {
                with_categories: 1,
                with_tutors: 1,
                with_audit: 1,
            });

            const tutors = resolveCourseTutors(detail, { fallbackCourse, tutorOptions });
            setSelectedTutorIds(tutors.map((tutor) => tutor.id).filter(Boolean));
            setSelectedCourse(tutors.length > 0 ? { ...detail, tutors } : detail);

            if (openModal) {
                setOpenDetailModal(true);
            }

            return tutors.length > 0 ? { ...detail, tutors } : detail;
        } catch (err) {
            console.error('Failed to load course detail:', err);
            openSnackbar(err.message || 'Failed to load course detail.', 'error');
            return null;
        } finally {
            setDetailLoading(false);
        }
    }, [tutorOptions]);

    const handleCreateCourse = () => {
        navigate('/admin/content/essential-courses/create');
    };

    const handleEditCourse = (courseId) => {
        navigate(`/admin/content/essential-courses/create?edit=${courseId}`);
    };

    const handleAddTutors = async () => {
        if (!selectedCourse?.id || selectedTutorIds.length === 0) {
            openSnackbar('Select at least one tutor.', 'error');
            return;
        }

        setSaving(true);
        try {
            await optionAdminService.addTutorsToCourse(selectedCourse.id, selectedTutorIds);
            openSnackbar('Tutors added successfully.');
            await loadCourseDetail(selectedCourse.id, { fallbackCourse: selectedCourse });
            await listCourses({ q: searchTerm, status: statusFilter });
        } catch (err) {
            console.error('Failed to add tutors:', err);
            openSnackbar(err.message || 'Failed to add tutors.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSyncTutors = async () => {
        if (!selectedCourse?.id || selectedTutorIds.length === 0) {
            openSnackbar('Select at least one tutor.', 'error');
            return;
        }

        setSaving(true);
        try {
            await optionAdminService.syncCourseTutors(selectedCourse.id, selectedTutorIds);
            openSnackbar('Course tutors updated successfully.');
            await loadCourseDetail(selectedCourse.id, { fallbackCourse: selectedCourse });
            await listCourses({ q: searchTerm, status: statusFilter });
        } catch (err) {
            console.error('Failed to sync tutors:', err);
            openSnackbar(err.message || 'Failed to sync tutors.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveTutor = async (tutorId) => {
        if (!selectedCourse?.id) return;
        if (!window.confirm('Remove this tutor from the course?')) return;

        setActionLoading(tutorId);
        try {
            await optionAdminService.removeTutorFromCourse(selectedCourse.id, tutorId);
            openSnackbar('Tutor removed from course.');
            await loadCourseDetail(selectedCourse.id, { fallbackCourse: selectedCourse });
            await listCourses({ q: searchTerm, status: statusFilter });
        } catch (err) {
            console.error('Failed to remove tutor from course:', err);
            openSnackbar(err.message || 'Failed to remove tutor.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const selectedCourseTutors = useMemo(
        () => resolveCourseTutors(selectedCourse, { tutorOptions }),
        [selectedCourse, tutorOptions]
    );
    const selectedCourseCategories = useMemo(() => getCourseCategories(selectedCourse), [selectedCourse]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Essential Courses
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Manage admin-owned essential courses and tutor assignments.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Tooltip title="Refresh">
                        <IconButton
                            onClick={() => listCourses({ q: searchTerm, status: statusFilter })}
                            disabled={loading}
                            sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
                        >
                            <Refresh />
                        </IconButton>
                    </Tooltip>

                    <Button variant="contained" startIcon={<Add />} onClick={handleCreateCourse} sx={primaryButtonStyle}>
                        Create Course
                    </Button>
                </Stack>
            </Stack>

            <Paper sx={{ ...paperStyle, p: 2, mb: 4 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                    <Box sx={{ ...searchBarStyle, maxWidth: 460 }}>
                        <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
                        <InputBase
                            placeholder="Search by title or summary..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            sx={searchInputStyle}
                        />
                    </Box>

                    <FormControl sx={{ minWidth: 220 }}>
                        <InputLabel sx={{ color: '#9CA3AF' }}>Status</InputLabel>
                        <Select
                            label="Status"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All</MenuItem>
                            {COURSE_STATUSES.map((status) => (
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
                            <TableCell sx={tableHeaderCellStyle}>Course</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Duration</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Tutors</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Categories</TableCell>
                            <TableCell align="right" sx={tableHeaderCellStyle}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ ...tableBodyCellStyle, py: 7 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ ...tableBodyCellStyle, py: 4 }}>
                                    <Alert severity="error" sx={{ bgcolor: 'transparent', justifyContent: 'center' }}>
                                        {error}
                                    </Alert>
                                </TableCell>
                            </TableRow>
                        ) : courseRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ ...tableBodyCellStyle, py: 5, color: '#9CA3AF' }}>
                                    No essential courses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            courseRows.map((course) => {
                                const statusColor =
                                    course._status === 'published'
                                        ? '#10B981'
                                        : course._status === 'archived'
                                            ? '#EF4444'
                                            : '#F59E0B';

                                return (
                                    <TableRow key={course.id}>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Typography sx={{ color: '#fff', fontWeight: 600 }}>{course._title}</Typography>
                                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                                {course.language || '-'} · {course.level || '-'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={tableBodyCellStyle}>
                                            <Chip
                                                label={course._status}
                                                size="small"
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    color: statusColor,
                                                    bgcolor: 'rgba(255,255,255,0.06)',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>{course._duration} min</TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>{course._tutorCount}</TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>{course._categoryCount}</TableCell>

                                        <TableCell align="right" sx={tableBodyCellStyle}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        onClick={() => loadCourseDetail(course.id, {
                                                            openModal: true,
                                                            fallbackCourse: course,
                                                        })}
                                                        sx={{ color: '#3B82F6' }}
                                                    >
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Edit Course">
                                                    <IconButton
                                                        onClick={() => handleEditCourse(course.id)}
                                                        disabled={actionLoading === course.id}
                                                        sx={{ color: '#F59E0B' }}
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal open={openDetailModal} onClose={() => setOpenDetailModal(false)}>
                <Box
                    sx={{
                        ...modalStyle,
                        width: { xs: '95%', md: 860 },
                        maxHeight: '92vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, borderBottom: '1px solid #374151' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>Essential Course Details</Typography>
                        <IconButton onClick={() => setOpenDetailModal(false)} sx={{ color: '#9CA3AF' }}>
                            <Close />
                        </IconButton>
                    </Stack>

                    <Box sx={{ p: 2.5, overflowY: 'auto' }}>
                        {detailLoading ? (
                            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress />
                            </Box>
                        ) : selectedCourse ? (
                            <Stack spacing={2}>
                                <Paper sx={{ ...paperStyle, p: 2 }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>{selectedCourse.title || '-'}</Typography>
                                    <Typography sx={{ color: '#D1D5DB', fontSize: '0.9rem', mb: 1 }}>{selectedCourse.summary || '-'}</Typography>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                                        Status: {selectedCourse.status || '-'} · Level: {selectedCourse.level || '-'} · Language: {selectedCourse.language || '-'}
                                    </Typography>
                                </Paper>

                                <Paper sx={{ ...paperStyle, p: 2 }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>Categories</Typography>
                                    {selectedCourseCategories.length === 0 ? (
                                        <Typography sx={{ color: '#9CA3AF' }}>No categories attached.</Typography>
                                    ) : (
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {selectedCourseCategories.map((category) => (
                                                <Chip
                                                    key={category.id}
                                                    label={category.name || category.title || category.id}
                                                    size="small"
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#E5E7EB' }}
                                                />
                                            ))}
                                        </Stack>
                                    )}
                                </Paper>

                                <Paper sx={{ ...paperStyle, p: 2 }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>Tutor Assignment</Typography>

                                    {selectedCourseTutors.length === 0 ? (
                                        <Typography sx={{ color: '#9CA3AF', mb: 1.5 }}>No tutors attached.</Typography>
                                    ) : (
                                        <Stack spacing={1.25} sx={{ mb: 2 }}>
                                            {selectedCourseTutors.map((tutor) => (
                                                <Stack
                                                    key={tutor.id}
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                    sx={{
                                                        p: 1.25,
                                                        borderRadius: 1,
                                                        bgcolor: '#0F1729',
                                                        border: '1px solid #374151',
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography sx={{ color: '#E5E7EB', fontWeight: 600, fontSize: '0.9rem' }}>
                                                            {tutor.name || tutor.email || tutor.id}
                                                        </Typography>
                                                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>ID: {tutor.id}</Typography>
                                                    </Box>

                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        startIcon={<Delete />}
                                                        onClick={() => handleRemoveTutor(tutor.id)}
                                                        disabled={actionLoading === tutor.id}
                                                        sx={{ textTransform: 'none' }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    )}

                                    <Autocomplete
                                        multiple
                                        id="tutor-select"
                                        options={tutorOptions}
                                        getOptionLabel={(option) => option.name || option.user?.name || option.email || option.id || ''}
                                        value={tutorOptions.filter(t => selectedTutorIds.includes(t.id))}
                                        onChange={(event, newValue) => {
                                            setSelectedTutorIds(newValue.map(t => t.id));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Tutors"
                                                sx={textFieldStyle}
                                            />
                                        )}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    label={option.name || option.user?.name || option.email || option.id}
                                                    {...getTagProps({ index })}
                                                    size="small"
                                                    sx={{ bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#93C5FD' }}
                                                />
                                            ))
                                        }
                                        sx={{ mb: 1.5 }}
                                        PaperComponent={({ children }) => (
                                            <Paper sx={{ bgcolor: '#1F2937', color: '#fff' }}>
                                                {children}
                                            </Paper>
                                        )}
                                    />

                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="flex-end">
                                        <Button
                                            variant="outlined"
                                            onClick={handleAddTutors}
                                            disabled={saving || selectedTutorIds.length === 0}
                                            sx={{ borderColor: '#3B82F6', color: '#3B82F6', textTransform: 'none' }}
                                        >
                                            Add Selected Tutors
                                        </Button>

                                        <Button
                                            variant="contained"
                                            onClick={handleSyncTutors}
                                            disabled={saving || selectedTutorIds.length === 0}
                                            sx={primaryButtonStyle}
                                        >
                                            Replace Tutors
                                        </Button>
                                    </Stack>
                                </Paper>
                            </Stack>
                        ) : (
                            <Typography sx={{ color: '#9CA3AF' }}>No course selected.</Typography>
                        )}
                    </Box>
                </Box>
            </Modal>

            <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={closeSnackbar} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EssentialCourseManagement;

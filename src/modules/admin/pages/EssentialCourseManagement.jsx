import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    FormHelperText,
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
    Autocomplete,
} from '@mui/material';
import {
    Add,
    ArrowBack,
    ArrowForward,
    CheckCircle,
    Close,
    DescriptionOutlined,
    Delete,
    Edit,
    MenuBookOutlined,
    PermMediaOutlined,
    RateReviewOutlined,
    Refresh,
    Schedule,
    Search,
    UploadFile,
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

const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced'];
const COURSE_STATUSES = ['draft', 'published', 'archived'];
const COURSE_CREATION_STEPS = [
    { label: 'Step 1', sublabel: 'Basic Details', icon: DescriptionOutlined },
    { label: 'Step 2', sublabel: 'Assignment', icon: MenuBookOutlined },
    { label: 'Step 3', sublabel: 'Media', icon: PermMediaOutlined },
    { label: 'Step 4', sublabel: 'Review', icon: RateReviewOutlined },
];

const initialCourseForm = {
    title: '',
    summary: '',
    description: '',
    level: 'beginner',
    language: 'en',
    duration_minutes: '60',
    status: 'published',
    tags: '',
    learning_objectives: '',
    requirements: '',
    target_audience: '',
    category_ids: [],
    tutor_ids: [],
    thumbnail_url: '',
    banner_url: '',
    intro_video_url: '',
    thumbnail: null,
    banner: null,
    intro_video: null,
};

const parseCommaList = (value) =>
    String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const normalizeIdList = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item || '').trim())
            .filter(Boolean);
    }
    return parseCommaList(value);
};

const stringifyList = (value) => {
    if (!Array.isArray(value)) return '';
    return value.filter(Boolean).join(', ');
};

const getTutorOptionLabel = (tutor) =>
    tutor?.name || tutor?.user?.name || tutor?.email || tutor?.id || 'Unknown tutor';

const getCategoryOptionLabel = (category) =>
    category?.name || category?.title || category?.slug || category?.id || 'Unknown category';

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

const hasAnyFile = (formData) =>
    formData.thumbnail instanceof File ||
    formData.banner instanceof File ||
    formData.intro_video instanceof File;

const EssentialCourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [openFormModal, setOpenFormModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState(initialCourseForm);
    const [activeStep, setActiveStep] = useState(0);
    const [stepErrors, setStepErrors] = useState({});

    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const [tutorOptions, setTutorOptions] = useState([]);
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

    const mapCourseToForm = (course) => {
        const tutors = resolveCourseTutors(course, { tutorOptions });
        const categories = getCourseCategories(course);

        return {
            ...initialCourseForm,
            title: String(course.title || ''),
            summary: String(course.summary || ''),
            description: String(course.description || ''),
            level: String(course.level || 'beginner'),
            language: String(course.language || 'en'),
            duration_minutes: String(course.duration_minutes || 60),
            status: String(course.status || 'published'),
            tags: stringifyList(course.tags || []),
            learning_objectives: stringifyList(course.learning_objectives || []),
            requirements: stringifyList(course.requirements || []),
            target_audience: stringifyList(course.target_audience || []),
            category_ids: categories.map((category) => String(category.id || '')).filter(Boolean),
            tutor_ids: tutors.map((tutor) => String(tutor.id || '')).filter(Boolean),
            thumbnail_url: String(course.thumbnail_url || ''),
            banner_url: String(course.banner_url || ''),
            intro_video_url: String(course.intro_video_url || ''),
            thumbnail: null,
            banner: null,
            intro_video: null,
        };
    };

    const openCreateModal = () => {
        setEditingCourse(null);
        setFormData(initialCourseForm);
        setActiveStep(0);
        setStepErrors({});
        setOpenFormModal(true);
    };

    const openEditModal = async (courseId, fallbackCourse = null) => {
        setActionLoading(courseId);
        try {
            const detail = await optionAdminService.getEssentialCourseById(courseId, {
                with_categories: 1,
                with_tutors: 1,
                with_audit: 1,
            });

            const tutors = resolveCourseTutors(detail, { fallbackCourse, tutorOptions });
            const normalizedDetail = tutors.length > 0 ? { ...detail, tutors } : detail;

            setEditingCourse(normalizedDetail);
            setFormData(mapCourseToForm(normalizedDetail));
            setActiveStep(0);
            setStepErrors({});
            setOpenFormModal(true);
        } catch (err) {
            console.error('Failed to open edit modal:', err);
            openSnackbar(err.message || 'Unable to load course for editing.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSaveCourse = async () => {
        if (!String(formData.title).trim() || !String(formData.summary).trim()) {
            openSnackbar('Title and summary are required.', 'error');
            return;
        }

        const tutorIds = normalizeIdList(formData.tutor_ids);
        if (!editingCourse && tutorIds.length === 0) {
            openSnackbar('At least one tutor ID is required to create a course.', 'error');
            return;
        }

        const categoryIds = normalizeIdList(formData.category_ids);
        const payload = {
            title: formData.title.trim(),
            summary: formData.summary.trim(),
            description: formData.description.trim(),
            level: formData.level,
            language: formData.language.trim(),
            duration_minutes: Number(formData.duration_minutes || 0),
            status: formData.status,
            tags: parseCommaList(formData.tags),
            learning_objectives: parseCommaList(formData.learning_objectives),
            requirements: parseCommaList(formData.requirements),
            target_audience: parseCommaList(formData.target_audience),
            category_ids: categoryIds,
            tutor_ids: tutorIds,
            thumbnail_url: formData.thumbnail_url.trim(),
            banner_url: formData.banner_url.trim(),
            intro_video_url: formData.intro_video_url.trim(),
        };

        if (editingCourse && tutorIds.length === 0) {
            delete payload.tutor_ids;
        }

        if (editingCourse && categoryIds.length === 0) {
            delete payload.category_ids;
        }

        const multipart = hasAnyFile(formData);

        setSaving(true);
        try {
            if (editingCourse) {
                if (multipart) {
                    await optionAdminService.updateEssentialCourseMultipart(editingCourse.id, {
                        ...payload,
                        thumbnail: formData.thumbnail,
                        banner: formData.banner,
                        intro_video: formData.intro_video,
                    });
                } else {
                    await optionAdminService.updateEssentialCourseJson(editingCourse.id, payload);
                }
                openSnackbar('Essential course updated successfully.');
            } else {
                if (multipart) {
                    await optionAdminService.createEssentialCourseMultipart({
                        ...payload,
                        thumbnail: formData.thumbnail,
                        banner: formData.banner,
                        intro_video: formData.intro_video,
                    });
                } else {
                    await optionAdminService.createEssentialCourseJson(payload);
                }
                openSnackbar('Essential course created successfully.');
            }

            setOpenFormModal(false);
            setFormData(initialCourseForm);
            await listCourses({ q: searchTerm, status: statusFilter });
        } catch (err) {
            console.error('Failed to save essential course:', err);
            openSnackbar(err.message || 'Failed to save essential course.', 'error');
        } finally {
            setSaving(false);
        }
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
    const selectedTutorCount = normalizeIdList(formData.tutor_ids).length;
    const selectedCategoryCount = normalizeIdList(formData.category_ids).length;

    const updateFormValue = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (stepErrors[field]) {
            setStepErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validateComposerStep = (step) => {
        const errors = {};

        if (step === 0) {
            if (!String(formData.title).trim()) errors.title = 'Title is required.';
            if (!String(formData.summary).trim()) errors.summary = 'Summary is required.';
            if (!String(formData.language).trim()) errors.language = 'Language is required.';
            if (!String(formData.duration_minutes).trim() || Number(formData.duration_minutes) <= 0) {
                errors.duration_minutes = 'Duration must be greater than 0.';
            }
        }

        if (step === 1) {
            const tutorIds = normalizeIdList(formData.tutor_ids);
            if (!editingCourse && tutorIds.length === 0) {
                errors.tutor_ids = 'At least one tutor ID is required.';
            }
        }

        setStepErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNextStep = () => {
        if (!validateComposerStep(activeStep)) return;
        setActiveStep((prev) => Math.min(prev + 1, COURSE_CREATION_STEPS.length - 1));
    };

    const handleBackStep = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    const renderComposerBasicDetails = () => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 60%' }, minWidth: 0 }}>
                <Stack spacing={2.5}>
                    <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                            Course Title
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="e.g. Essential Governance Foundations"
                            value={formData.title}
                            onChange={(event) => updateFormValue('title', event.target.value)}
                            error={Boolean(stepErrors.title)}
                            helperText={stepErrors.title}
                            sx={textFieldStyle}
                        />
                    </Box>

                    <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                            Short Summary
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Brief overview of what learners should expect."
                            value={formData.summary}
                            onChange={(event) => updateFormValue('summary', event.target.value)}
                            error={Boolean(stepErrors.summary)}
                            helperText={stepErrors.summary}
                            sx={textFieldStyle}
                        />
                    </Box>

                    <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                            Description
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={5}
                            placeholder="Write a complete course description."
                            value={formData.description}
                            onChange={(event) => updateFormValue('description', event.target.value)}
                            sx={textFieldStyle}
                        />
                    </Box>
                </Stack>
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 35%' }, minWidth: 0 }}>
                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel sx={{ color: '#9CA3AF' }}>Level</InputLabel>
                        <Select
                            label="Level"
                            value={formData.level}
                            onChange={(event) => updateFormValue('level', event.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            {COURSE_LEVELS.map((level) => (
                                <MenuItem key={level} value={level}>{level}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Language"
                        value={formData.language}
                        onChange={(event) => updateFormValue('language', event.target.value)}
                        error={Boolean(stepErrors.language)}
                        helperText={stepErrors.language}
                        fullWidth
                        sx={textFieldStyle}
                    />

                    <TextField
                        label="Duration (minutes)"
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(event) => updateFormValue('duration_minutes', event.target.value)}
                        error={Boolean(stepErrors.duration_minutes)}
                        helperText={stepErrors.duration_minutes}
                        fullWidth
                        sx={textFieldStyle}
                    />

                    <FormControl fullWidth>
                        <InputLabel sx={{ color: '#9CA3AF' }}>Status</InputLabel>
                        <Select
                            label="Status"
                            value={formData.status}
                            onChange={(event) => updateFormValue('status', event.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            {COURSE_STATUSES.map((status) => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Paper sx={{ bgcolor: '#1A2230', border: '1px solid #374151', borderRadius: 2, p: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <DescriptionOutlined sx={{ color: '#1152D4', fontSize: 18 }} />
                            <Typography sx={{ color: '#1152D4', fontWeight: 600, fontSize: '0.85rem' }}>
                                Creation Tips
                            </Typography>
                        </Stack>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                            Match tutor flow: clear title, concise summary, and complete metadata before tutor assignments.
                        </Typography>
                    </Paper>
                </Stack>
            </Box>
        </Box>
    );

    const renderComposerAssignment = () => (
        <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth error={Boolean(stepErrors.tutor_ids)}>
                    <InputLabel sx={{ color: '#9CA3AF' }}>Tutors</InputLabel>
                    <Select
                        multiple
                        label="Tutors"
                        value={normalizeIdList(formData.tutor_ids)}
                        onChange={(event) => {
                            const value = event.target.value;
                            updateFormValue('tutor_ids', typeof value === 'string' ? value.split(',') : value);
                        }}
                        renderValue={(selected) => (
                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                {selected.map((id) => {
                                    const tutor = tutorOptions.find((item) => String(item.id) === String(id));
                                    return (
                                        <Chip
                                            key={id}
                                            size="small"
                                            label={getTutorOptionLabel(tutor) || id}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#E5E7EB' }}
                                        />
                                    );
                                })}
                            </Stack>
                        )}
                        sx={selectStyle}
                        MenuProps={selectMenuProps}
                    >
                        {tutorOptions.length === 0 ? (
                            <MenuItem disabled value="">
                                No tutors found
                            </MenuItem>
                        ) : (
                            tutorOptions.map((tutor) => (
                                <MenuItem key={tutor.id} value={String(tutor.id)}>
                                    {getTutorOptionLabel(tutor)}
                                </MenuItem>
                            ))
                        )}
                    </Select>
                    {stepErrors.tutor_ids && (
                        <FormHelperText>{stepErrors.tutor_ids}</FormHelperText>
                    )}
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel sx={{ color: '#9CA3AF' }}>Categories</InputLabel>
                    <Select
                        multiple
                        label="Categories"
                        value={normalizeIdList(formData.category_ids)}
                        onChange={(event) => {
                            const value = event.target.value;
                            updateFormValue('category_ids', typeof value === 'string' ? value.split(',') : value);
                        }}
                        renderValue={(selected) => (
                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                {selected.map((id) => {
                                    const category = categoryOptions.find((item) => String(item.id) === String(id));
                                    return (
                                        <Chip
                                            key={id}
                                            size="small"
                                            label={getCategoryOptionLabel(category) || id}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#E5E7EB' }}
                                        />
                                    );
                                })}
                            </Stack>
                        )}
                        sx={selectStyle}
                        MenuProps={selectMenuProps}
                    >
                        {categoryOptions.length === 0 ? (
                            <MenuItem disabled value="">
                                No categories found
                            </MenuItem>
                        ) : (
                            categoryOptions.map((category) => (
                                <MenuItem key={category.id} value={String(category.id)}>
                                    {getCategoryOptionLabel(category)}
                                </MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                    label="Tags (comma separated)"
                    value={formData.tags}
                    onChange={(event) => updateFormValue('tags', event.target.value)}
                    fullWidth
                    sx={textFieldStyle}
                />
                <TextField
                    label="Learning Objectives (comma separated)"
                    value={formData.learning_objectives}
                    onChange={(event) => updateFormValue('learning_objectives', event.target.value)}
                    fullWidth
                    sx={textFieldStyle}
                />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                    label="Requirements (comma separated)"
                    value={formData.requirements}
                    onChange={(event) => updateFormValue('requirements', event.target.value)}
                    fullWidth
                    sx={textFieldStyle}
                />
                <TextField
                    label="Target Audience (comma separated)"
                    value={formData.target_audience}
                    onChange={(event) => updateFormValue('target_audience', event.target.value)}
                    fullWidth
                    sx={textFieldStyle}
                />
            </Stack>

            <Paper sx={{ bgcolor: '#1A2230', border: '1px solid #374151', borderRadius: 2, p: 2.5 }}>
                <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>Assignment Summary</Typography>
                <Stack direction="row" spacing={4}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ color: '#1152D4', fontSize: '1.8rem', fontWeight: 700 }}>{selectedTutorCount}</Typography>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Tutors</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ color: '#10B981', fontSize: '1.8rem', fontWeight: 700 }}>{selectedCategoryCount}</Typography>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Categories</Typography>
                    </Box>
                </Stack>
            </Paper>
        </Stack>
    );

    const renderComposerMedia = () => (
        <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                    label="Thumbnail URL"
                    value={formData.thumbnail_url}
                    onChange={(event) => updateFormValue('thumbnail_url', event.target.value)}
                    fullWidth
                    sx={textFieldStyle}
                />
                <TextField
                    label="Banner URL"
                    value={formData.banner_url}
                    onChange={(event) => updateFormValue('banner_url', event.target.value)}
                    fullWidth
                    sx={textFieldStyle}
                />
                <TextField
                    label="Intro Video URL"
                    value={formData.intro_video_url}
                    onChange={(event) => updateFormValue('intro_video_url', event.target.value)}
                    fullWidth
                    sx={textFieldStyle}
                />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadFile />}
                    sx={{
                        borderColor: '#374151',
                        color: '#E5E7EB',
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        '&:hover': { borderColor: '#4B5563', bgcolor: 'rgba(255,255,255,0.03)' },
                    }}
                >
                    {formData.thumbnail ? formData.thumbnail.name : 'Thumbnail File'}
                    <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(event) => updateFormValue('thumbnail', event.target.files?.[0] || null)}
                    />
                </Button>

                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadFile />}
                    sx={{
                        borderColor: '#374151',
                        color: '#E5E7EB',
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        '&:hover': { borderColor: '#4B5563', bgcolor: 'rgba(255,255,255,0.03)' },
                    }}
                >
                    {formData.banner ? formData.banner.name : 'Banner File'}
                    <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(event) => updateFormValue('banner', event.target.files?.[0] || null)}
                    />
                </Button>

                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadFile />}
                    sx={{
                        borderColor: '#374151',
                        color: '#E5E7EB',
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        '&:hover': { borderColor: '#4B5563', bgcolor: 'rgba(255,255,255,0.03)' },
                    }}
                >
                    {formData.intro_video ? formData.intro_video.name : 'Intro Video File'}
                    <input
                        hidden
                        type="file"
                        accept="video/*"
                        onChange={(event) => updateFormValue('intro_video', event.target.files?.[0] || null)}
                    />
                </Button>
            </Stack>
        </Stack>
    );

    const renderComposerReview = () => (
        <Stack spacing={2}>
            <Paper sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151', p: 3 }}>
                <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>Course Information</Typography>
                <Stack spacing={1.25}>
                    <Typography sx={{ color: '#D1D5DB', fontSize: '0.9rem' }}>Title: {formData.title || '-'}</Typography>
                    <Typography sx={{ color: '#D1D5DB', fontSize: '0.9rem' }}>Summary: {formData.summary || '-'}</Typography>
                    <Typography sx={{ color: '#D1D5DB', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                        Level: {formData.level || '-'} · Status: {formData.status || '-'}
                    </Typography>
                    <Typography sx={{ color: '#D1D5DB', fontSize: '0.9rem' }}>
                        Duration: {formData.duration_minutes || '-'} min · Language: {formData.language || '-'}
                    </Typography>
                </Stack>
            </Paper>

            <Paper sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151', p: 3 }}>
                <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>Submission Checklist</Typography>
                <Stack spacing={1.25}>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                        <CheckCircle sx={{ color: formData.title ? '#10B981' : '#374151', fontSize: 20 }} />
                        <Typography sx={{ color: formData.title ? '#E5E7EB' : '#6B7280', fontSize: '0.9rem' }}>Course title provided</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                        <CheckCircle sx={{ color: formData.summary ? '#10B981' : '#374151', fontSize: 20 }} />
                        <Typography sx={{ color: formData.summary ? '#E5E7EB' : '#6B7280', fontSize: '0.9rem' }}>Summary provided</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                        <CheckCircle sx={{ color: selectedTutorCount > 0 || editingCourse ? '#10B981' : '#374151', fontSize: 20 }} />
                        <Typography sx={{ color: selectedTutorCount > 0 || editingCourse ? '#E5E7EB' : '#6B7280', fontSize: '0.9rem' }}>
                            Tutor assignment ready
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                        <CheckCircle sx={{ color: hasAnyFile(formData) || formData.thumbnail_url || formData.banner_url || formData.intro_video_url ? '#10B981' : '#374151', fontSize: 20 }} />
                        <Typography sx={{ color: hasAnyFile(formData) || formData.thumbnail_url || formData.banner_url || formData.intro_video_url ? '#E5E7EB' : '#6B7280', fontSize: '0.9rem' }}>
                            Media configured (optional)
                        </Typography>
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );

    const renderComposerStepContent = () => {
        if (activeStep === 0) return renderComposerBasicDetails();
        if (activeStep === 1) return renderComposerAssignment();
        if (activeStep === 2) return renderComposerMedia();
        return renderComposerReview();
    };

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

                    <Button variant="contained" startIcon={<Add />} onClick={openCreateModal} sx={primaryButtonStyle}>
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
                                                        onClick={() => openEditModal(course.id, course)}
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

            <Modal open={openFormModal} onClose={() => !saving && setOpenFormModal(false)}>
                <Box
                    sx={{
                        ...modalStyle,
                        width: { xs: '95%', md: 1040 },
                        maxHeight: '92vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, borderBottom: '1px solid #374151' }}>
                        <Box>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>
                                {editingCourse ? 'Update Essential Course' : 'Create Essential Course'}
                            </Typography>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>
                                Follow the tutor-style flow: details, assignment, media, review.
                            </Typography>
                        </Box>

                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Chip
                                icon={<Schedule sx={{ fontSize: 14 }} />}
                                label={editingCourse ? 'Editing draft' : 'New draft'}
                                sx={{
                                    bgcolor: 'rgba(245, 158, 11, 0.15)',
                                    color: '#F59E0B',
                                    '& .MuiChip-icon': { color: '#F59E0B' },
                                }}
                            />
                            <IconButton onClick={() => !saving && setOpenFormModal(false)} sx={{ color: '#9CA3AF' }}>
                                <Close />
                            </IconButton>
                        </Stack>
                    </Stack>

                    <Box sx={{ p: 2.5, overflowY: 'auto' }}>
                        <Box sx={{ mb: 3 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: '#1A2230',
                                    borderRadius: '50px',
                                    p: 0.5,
                                    border: '1px solid #374151',
                                    overflowX: 'auto',
                                }}
                            >
                                {COURSE_CREATION_STEPS.map((step, index) => {
                                    const StepIcon = step.icon;
                                    const isActive = index === activeStep;
                                    const isCompleted = index < activeStep;
                                    const isLast = index === COURSE_CREATION_STEPS.length - 1;

                                    return (
                                        <React.Fragment key={step.label}>
                                            <Box
                                                onClick={() => {
                                                    if (isCompleted) setActiveStep(index);
                                                }}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.25,
                                                    py: 1.25,
                                                    px: 2,
                                                    borderRadius: '50px',
                                                    bgcolor: isActive ? '#1152D4' : 'transparent',
                                                    cursor: isCompleted ? 'pointer' : 'default',
                                                    transition: 'all 0.2s ease',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 30,
                                                        height: 30,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: isActive ? 'rgba(255,255,255,0.2)' : isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                                                        color: isActive ? '#fff' : isCompleted ? '#10B981' : '#6B7280',
                                                    }}
                                                >
                                                    {isCompleted ? <CheckCircle sx={{ fontSize: 16 }} /> : <StepIcon sx={{ fontSize: 16 }} />}
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ color: isActive ? '#fff' : '#9CA3AF', fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.2 }}>
                                                        {step.label}
                                                    </Typography>
                                                    <Typography sx={{ color: isActive ? '#E5E7EB' : '#6B7280', fontSize: '0.75rem', lineHeight: 1.2 }}>
                                                        {step.sublabel}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {!isLast && (
                                                <Box sx={{ width: 18, height: 1, bgcolor: '#374151', flexShrink: 0 }} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </Box>
                        </Box>

                        {renderComposerStepContent()}
                    </Box>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5} sx={{ p: 2.5, borderTop: '1px solid #374151' }}>
                        <Button onClick={() => setOpenFormModal(false)} disabled={saving} sx={{ color: '#9CA3AF', textTransform: 'none' }}>
                            Cancel
                        </Button>

                        <Stack direction="row" spacing={1.5}>
                            {activeStep > 0 && (
                                <Button
                                    variant="outlined"
                                    startIcon={<ArrowBack />}
                                    onClick={handleBackStep}
                                    disabled={saving}
                                    sx={{ borderColor: '#374151', color: '#E5E7EB', textTransform: 'none' }}
                                >
                                    Back
                                </Button>
                            )}

                            {activeStep < COURSE_CREATION_STEPS.length - 1 ? (
                                <Button
                                    variant="contained"
                                    endIcon={<ArrowForward />}
                                    onClick={handleNextStep}
                                    disabled={saving}
                                    sx={primaryButtonStyle}
                                >
                                    Continue to {COURSE_CREATION_STEPS[activeStep + 1].sublabel}
                                </Button>
                            ) : (
                                <Button variant="contained" onClick={handleSaveCourse} disabled={saving} sx={primaryButtonStyle}>
                                    {saving ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </Box>
            </Modal>

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

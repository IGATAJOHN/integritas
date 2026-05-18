import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    TextField,
    Select,
    MenuItem,
    IconButton,
    Chip,
    Tooltip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Collapse,
    Modal,
    Alert,
    CircularProgress,
    Snackbar,
} from '@mui/material';
import {
    ArrowBack,
    ArrowForward,
    CloudUpload,
    Add,
    Edit,
    Delete,
    DragIndicator,
    ExpandMore,
    ExpandLess,
    PlayCircleOutline,
    ArticleOutlined,
    AttachFile,
    CheckCircle,
    Schedule,
    Info,
    Close,
    Send,
    DescriptionOutlined,
    MenuBookOutlined,
    PermMediaOutlined,
    RateReviewOutlined,
    ChevronRight,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { textFieldStyle, selectStyle, selectMenuProps, modalStyle, scrollableModalBody } from '../../../styles/formStyles';
import { formatCurrency } from '../../../utils';
import { categoryService } from '../../../services/categoryService';
import { tutorCoursesService, tutorModuleService, tutorLessonService } from '../services';
import theme from '../../../styles/theme';


const steps = [
    { label: 'Step 1', sublabel: 'Basic Details', icon: DescriptionOutlined },
    { label: 'Step 2', sublabel: 'Curriculum', icon: MenuBookOutlined },
    { label: 'Step 3', sublabel: 'Media', icon: PermMediaOutlined },
    { label: 'Step 4', sublabel: 'Review', icon: RateReviewOutlined },
];

const levels = ['beginner', 'intermediate', 'advanced'];
const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
];

const CreateCourse = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editCourseId = new URLSearchParams(location.search).get('edit') || null;
    const isEditMode = Boolean(editCourseId);

    const [activeStep, setActiveStep] = useState(0);
    const [lastSaved, setLastSaved] = useState(null);
    const [slugEdited, setSlugEdited] = useState(false);
    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [loadingCourse, setLoadingCourse] = useState(isEditMode);

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Categories state - fetched from API
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [courseData, setCourseData] = useState({
        title: '',
        slug: '',
        summary: '',
        description: '',
        level: 'beginner',
        language: 'en',
        price: 0,
        currency: 'USD',
        duration_minutes: 0,
        thumbnail_url: '', // For preview display only
        category_id: '',
        status: 'draft',
        is_editable: true,
        tags: [],
        certificate_fee_amount: '',
    });

    // Thumbnail file state - stores the actual File object for server upload
    const [thumbnailFile, setThumbnailFile] = useState(null);

    // Modules state
    const [modules, setModules] = useState([]);
    const [editingModule, setEditingModule] = useState(null);
    const [moduleModalOpen, setModuleModalOpen] = useState(false);
    const [newModule, setNewModule] = useState({ title: '', description: '' });

    // Lessons state
    const [expandedModule, setExpandedModule] = useState(null);
    const [lessonModalOpen, setLessonModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [currentModuleId, setCurrentModuleId] = useState(null);
    const [newLesson, setNewLesson] = useState({ title: '', type: 'video', content: '', duration: 0 });

    // Auto-generate slug from title
    useEffect(() => {
        if (!slugEdited && courseData.title) {
            const slug = courseData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            setCourseData(prev => ({ ...prev, slug }));
        }
    }, [courseData.title, slugEdited]);

    // Auto-save draft
    useEffect(() => {
        const timer = setTimeout(() => {
            if (courseData.title) {
                setLastSaved(new Date());
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [courseData]);

    // Fetch categories from API on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const categoriesData = await categoryService.getAllCategories();
                const categoryList = Array.isArray(categoriesData) ? categoriesData : [];
                setCategories(categoryList);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Load existing course data when in edit mode
    useEffect(() => {
        if (!isEditMode) return;
        const fetchCourse = async () => {
            setLoadingCourse(true);
            try {
                const course = await tutorCoursesService.getCourseById(editCourseId);
                const c = course?.data ?? course;
                setCourseData({
                    title: c.title || '',
                    slug: c.slug || '',
                    summary: c.summary || '',
                    description: c.description || '',
                    level: c.level || 'beginner',
                    language: c.language || 'en',
                    price: c.price ?? 0,
                    currency: c.currency || 'NGN',
                    duration_minutes: c.duration_minutes || 0,
                    thumbnail_url: c.thumbnail_url || '',
                    category_id: c.categories?.[0]?.id || c.category_id || '',
                    status: c.status || 'draft',
                    is_editable: c.is_editable !== false,
                    tags: c.tags || [],
                    certificate_fee_amount: c.certificate?.fee_amount ?? '',
                });
                setSlugEdited(true); // Prevent auto-overwriting the existing slug
            } catch (error) {
                console.error('Error loading course for editing:', error);
                setSnackbar({ open: true, message: 'Failed to load course data.', severity: 'error' });
            } finally {
                setLoadingCourse(false);
            }
        };
        fetchCourse();
    }, [editCourseId, isEditMode]);

    const handleInputChange = (field, value) => {
        setCourseData(prev => ({ ...prev, [field]: value }));
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleSlugChange = (value) => {
        setSlugEdited(true);
        setCourseData(prev => ({ ...prev, slug: value }));
    };

    const validateStep = (step) => {
        const errors = {};
        if (step === 0) {
            if (!courseData.title) errors.title = 'Course title is required';
            if (!courseData.category_id) errors.category_id = 'Category is required';
            if (!courseData.summary) errors.summary = 'Summary is required';
        }
        if (step === 3) {
            if (modules.length === 0) errors.modules = 'At least one module is required';
            const hasLessons = modules.some(m => m.lessons && m.lessons.length > 0);
            if (!hasLessons) errors.lessons = 'At least one lesson is required';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    // Module functions
    const handleAddModule = () => {
        if (newModule.title) {
            const module = {
                id: Date.now(),
                ...newModule,
                order: modules.length,
                lessons: [],
            };
            setModules([...modules, module]);
            setNewModule({ title: '', description: '' });
            setModuleModalOpen(false);
        }
    };

    const handleEditModule = (module) => {
        setEditingModule(module);
        setNewModule({ title: module.title, description: module.description });
        setModuleModalOpen(true);
    };

    const handleUpdateModule = () => {
        setModules(modules.map(m =>
            m.id === editingModule.id ? { ...m, ...newModule } : m
        ));
        setEditingModule(null);
        setNewModule({ title: '', description: '' });
        setModuleModalOpen(false);
    };

    const handleDeleteModule = (moduleId) => {
        const module = modules.find(m => m.id === moduleId);
        if (module && (!module.lessons || module.lessons.length === 0)) {
            setModules(modules.filter(m => m.id !== moduleId));
        }
    };

    // Lesson functions
    const emptyLesson = {
        title: '',
        type: 'video',
        content: '',
        videoUrl: '',
        videoFile: null,
        fileName: '',
        durationHours: 0,
        durationMinutes: 0,
        duration: 0,
    };

    const handleAddLesson = (moduleId) => {
        setCurrentModuleId(moduleId);
        setNewLesson({ ...emptyLesson });
        setEditingLesson(null);
        setLessonModalOpen(true);
    };

    const handleSaveLesson = () => {
        const title = String(newLesson.title || '').trim();
        if (!title) {
            setSnackbar({ open: true, message: 'Lesson title is required', severity: 'error' });
            return;
        }
        const plainContent = String(newLesson.content || '').replace(/<(.|\n)*?>/g, '').trim();
        if (!plainContent) {
            setSnackbar({ open: true, message: 'Please provide lesson content', severity: 'error' });
            return;
        }
        const videoUrl = String(newLesson.videoUrl || '').trim();
        if (videoUrl && !/^https?:\/\//.test(videoUrl)) {
            setSnackbar({ open: true, message: 'Video URL must start with http:// or https://', severity: 'error' });
            return;
        }

        const totalMinutes = (parseInt(newLesson.durationHours) || 0) * 60 + (parseInt(newLesson.durationMinutes) || 0);
        const merged = { ...newLesson, title, type: 'video', videoUrl, duration: totalMinutes };

        setModules(modules.map(m => {
            if (m.id === currentModuleId) {
                if (editingLesson) {
                    return {
                        ...m,
                        lessons: m.lessons.map(l =>
                            l.id === editingLesson.id ? { ...l, ...merged } : l
                        ),
                    };
                } else {
                    return {
                        ...m,
                        lessons: [...(m.lessons || []), { id: Date.now(), ...merged }],
                    };
                }
            }
            return m;
        }));
        setLessonModalOpen(false);
        setNewLesson({ ...emptyLesson });
    };

    const handleEditLesson = (moduleId, lesson) => {
        setCurrentModuleId(moduleId);
        setEditingLesson(lesson);
        const total = parseInt(lesson.duration) || 0;
        setNewLesson({
            title: lesson.title || '',
            type: 'video',
            content: lesson.content || '',
            videoUrl: lesson.videoUrl || '',
            videoFile: lesson.videoFile || null,
            fileName: lesson.fileName || '',
            durationHours: Math.floor(total / 60),
            durationMinutes: total % 60,
            duration: total,
        });
        setLessonModalOpen(true);
    };

    const handleDeleteLesson = (moduleId, lessonId) => {
        setModules(modules.map(m => {
            if (m.id === moduleId) {
                return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
            }
            return m;
        }));
    };

    /**
     * Handle course save — creates (POST) or updates (PUT/PATCH) depending on edit mode.
     * @param {boolean} asDraft - If true, saves as draft; if false, submits for approval
     */
    const handleSubmit = async (asDraft = true) => {
        if (!asDraft && !validateStep(3)) return;

        setSubmitting(true);
        setSubmitModalOpen(false);

        try {
            if (isEditMode) {
                // ── EDIT MODE ── PUT (JSON) or PATCH (multipart when new thumbnail)
                if (thumbnailFile) {
                    // PATCH /lms/courses/{id} — multipart to replace media
                    const formData = new FormData();
                    formData.append('title', courseData.title);
                    formData.append('summary', courseData.summary);
                    if (courseData.description) formData.append('description', courseData.description);
                    formData.append('level', courseData.level);
                    formData.append('language', courseData.language);
                    formData.append('duration_minutes', courseData.duration_minutes || 0);
                    if (courseData.category_id) formData.append('category_ids[]', courseData.category_id);
                    formData.append('thumbnail', thumbnailFile);
                    await tutorCoursesService.updateCourseMultipart(editCourseId, formData);
                } else {
                    // PUT /lms/courses/{id} — JSON update
                    const payload = {
                        title: courseData.title,
                        summary: courseData.summary,
                        level: courseData.level,
                        language: courseData.language,
                        duration_minutes: courseData.duration_minutes || 0,
                        category_ids: courseData.category_id ? [courseData.category_id] : [],
                    };
                    if (courseData.description) payload.description = courseData.description;
                    if (Array.isArray(courseData.tags) && courseData.tags.length > 0) {
                        payload.tags = courseData.tags;
                    }
                    if (courseData.certificate_fee_amount !== '' && courseData.certificate_fee_amount != null) {
                        payload.certificate_fee_amount = Number(courseData.certificate_fee_amount);
                    }
                    await tutorCoursesService.updateCourseJson(editCourseId, payload);
                }

                setSnackbar({ open: true, message: 'Course updated successfully!', severity: 'success' });
                setTimeout(() => navigate('/tutor/courses'), 1500);

            } else {
                // ── CREATE MODE ── POST multipart or JSON
                let createdCourse;

                if (thumbnailFile) {
                    const formData = new FormData();
                    formData.append('title', courseData.title);
                    formData.append('summary', courseData.summary);
                    if (courseData.description) formData.append('description', courseData.description);
                    formData.append('level', courseData.level);
                    formData.append('language', courseData.language);
                    formData.append('price', courseData.price || 0);
                    formData.append('currency', courseData.currency || 'USD');
                    formData.append('duration_minutes', courseData.duration_minutes || 0);
                    if (courseData.category_id) formData.append('category_ids[]', courseData.category_id);
                    formData.append('thumbnail', thumbnailFile);
                    createdCourse = await tutorCoursesService.createCourseMultipart(formData);
                } else {
                    const coursePayload = {
                        title: courseData.title,
                        summary: courseData.summary,
                        level: courseData.level,
                        language: courseData.language,
                        price: courseData.price || 0,
                        currency: courseData.currency || 'USD',
                        duration_minutes: courseData.duration_minutes || 0,
                        category_ids: courseData.category_id ? [courseData.category_id] : [],
                    };
                    if (courseData.description) coursePayload.description = courseData.description;
                    createdCourse = await tutorCoursesService.createCourseJson(coursePayload);
                }

                const courseId = createdCourse?.id || createdCourse?.data?.id;
                if (!courseId) throw new Error('Course was created but no ID was returned');

                // Create modules and lessons
                for (let i = 0; i < modules.length; i++) {
                    const module = modules[i];
                    const createdModule = await tutorModuleService.createModule(courseId, {
                        title: module.title,
                        summary: module.description || '',
                    });
                    const moduleId = createdModule?.id || createdModule?.data?.id;
                    if (!moduleId) continue;

                    for (let j = 0; j < (module.lessons || []).length; j++) {
                        const lesson = module.lessons[j];
                        const durationMinutes = lesson.duration_minutes || lesson.duration || 0;
                        const hasVideoUrl = /^https?:\/\//.test(String(lesson.videoUrl || '').trim());

                        if (lesson.videoFile) {
                            const fd = new FormData();
                            fd.append('title', lesson.title);
                            fd.append('type', 'video');
                            fd.append('video_file', lesson.videoFile);
                            fd.append('content', lesson.content || '');
                            if (durationMinutes) fd.append('duration_minutes', String(durationMinutes));
                            await tutorLessonService.createLessonMultipart(moduleId, fd);
                        } else {
                            const payload = {
                                title: lesson.title,
                                type: 'video',
                                content: lesson.content || '',
                            };
                            if (durationMinutes) payload.duration_minutes = durationMinutes;
                            if (hasVideoUrl) payload.video_url = String(lesson.videoUrl).trim();
                            await tutorLessonService.createLesson(moduleId, payload);
                        }
                    }
                }

                setSnackbar({
                    open: true,
                    message: asDraft ? 'Course saved as draft successfully!' : 'Course submitted for approval successfully!',
                    severity: 'success'
                });
                setTimeout(() => navigate('/tutor/courses'), 1500);
            }

        } catch (error) {
            console.error('Error saving course:', error);
            setSnackbar({
                open: true,
                message: error.message || `Failed to ${isEditMode ? 'update' : 'create'} course. Please try again.`,
                severity: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getLessonTypeIcon = (type) => {
        switch (type) {
            case 'video': return <PlayCircleOutline sx={{ fontSize: 18 }} />;
            case 'text':
            case 'reading': return <ArticleOutlined sx={{ fontSize: 18 }} />;
            case 'document':
            case 'file': return <AttachFile sx={{ fontSize: 18 }} />;
            default: return null;
        }
    };

    // Step 1: Basic Details
    const renderBasicDetails = () => (
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {/* Left Column */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 55%' }, minWidth: 0 }}>
                <Stack spacing={3}>
                    {/* Course Title */}
                    <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                            Course Title
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="e.g. Public Governance 101"
                            value={courseData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            error={!!validationErrors.title}
                            helperText={validationErrors.title || 'Use a clear, catchy title (Max 80 chars)'}
                            sx={textFieldStyle}
                            FormHelperTextProps={{ sx: { color: validationErrors.title ? '#EF4444' : '#6B7280' } }}
                        />
                    </Box>

                    {/* Category & Level Row */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                                Category
                            </Typography>
                            <Select
                                fullWidth
                                value={courseData.category_id}
                                onChange={(e) => handleInputChange('category_id', e.target.value)}
                                displayEmpty
                                sx={selectStyle}
                                error={!!validationErrors.category_id}
                            >
                                <MenuItem value="" disabled>Select category</MenuItem>
                                {categories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </Box>
                        <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                                Course Level
                            </Typography>
                            <Select
                                fullWidth
                                value={courseData.level}
                                onChange={(e) => handleInputChange('level', e.target.value)}
                                sx={selectStyle}
                            >
                                {levels.map(level => (
                                    <MenuItem key={level} value={level} sx={{ textTransform: 'capitalize' }}>
                                        {level}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>
                    </Box>

                    {/* Price & Currency Row */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                                Price
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                placeholder="0.00"
                                value={courseData.price}
                                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                                sx={textFieldStyle}
                                InputProps={{
                                    startAdornment: <Typography sx={{ color: '#6B7280', mr: 1 }}>{courseData.currency}</Typography>,
                                }}
                            />
                        </Box>
                        <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                                Currency
                            </Typography>
                            <Select
                                fullWidth
                                value={courseData.currency}
                                onChange={(e) => handleInputChange('currency', e.target.value)}
                                sx={selectStyle}
                            >
                                <MenuItem value="USD">USD ($)</MenuItem>
                                <MenuItem value="NGN">NGN (₦)</MenuItem>
                                <MenuItem value="GBP">GBP (£)</MenuItem>
                                <MenuItem value="EUR">EUR (€)</MenuItem>
                            </Select>
                        </Box>
                    </Box>

                    {/* Summary */}
                    <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                            Short Summary
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Brief overview of what students will learn..."
                            value={courseData.summary}
                            onChange={(e) => handleInputChange('summary', e.target.value)}
                            error={!!validationErrors.summary}
                            sx={textFieldStyle}
                        />
                    </Box>

                    {/* Description */}
                    <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                            Description
                        </Typography>
                        <Box
                            sx={{
                                '& .quill': {
                                    display: 'flex',
                                    flexDirection: 'column',
                                },
                                '& .ql-toolbar': {
                                    bgcolor: '#1E293B',
                                    borderColor: '#374151',
                                    borderRadius: '6px 6px 0 0',
                                    '& .ql-stroke': {
                                        stroke: '#9CA3AF',
                                    },
                                    '& .ql-fill': {
                                        fill: '#9CA3AF',
                                    },
                                    '& .ql-picker': {
                                        color: '#9CA3AF',
                                    },
                                    '& .ql-picker-options': {
                                        bgcolor: '#1E293B',
                                        border: '1px solid #374151',
                                    },
                                    '& .ql-picker-item:hover': {
                                        color: '#fff',
                                    },
                                    '& button:hover .ql-stroke': {
                                        stroke: '#fff',
                                    },
                                    '& button:hover .ql-fill': {
                                        fill: '#fff',
                                    },
                                    '& button.ql-active .ql-stroke': {
                                        stroke: theme.colors.brand,
                                    },
                                    '& button.ql-active .ql-fill': {
                                        fill: theme.colors.brand,
                                    },
                                },
                                '& .ql-container': {
                                    bgcolor: '#0F172A',
                                    borderColor: '#374151',
                                    borderRadius: '0 0 6px 6px',
                                    minHeight: 150,
                                    fontSize: '0.95rem',
                                },
                                '& .ql-editor': {
                                    color: '#fff',
                                    minHeight: 150,
                                    '&.ql-blank::before': {
                                        color: '#6B7280',
                                        fontStyle: 'normal',
                                    },
                                },
                            }}
                        >
                            <ReactQuill
                                theme="snow"
                                value={courseData.description}
                                onChange={(value) => handleInputChange('description', value)}
                                placeholder="Describe what students will learn in this course..."
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        ['link'],
                                        ['clean']
                                    ],
                                }}
                            />
                        </Box>
                    </Box>
                </Stack>
            </Box>

            {/* Right Column */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 35%' }, minWidth: 0 }}>
                <Stack spacing={3}>
                    {/* Thumbnail Upload */}
                    <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                            Course Thumbnail
                        </Typography>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="thumbnail-upload"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    // Store the actual File object for server upload
                                    setThumbnailFile(file);
                                    // Also create a preview URL for display
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        handleInputChange('thumbnail_url', reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <label htmlFor="thumbnail-upload">
                            <Box
                                sx={{
                                    bgcolor: '#1E293B',
                                    border: courseData.thumbnail_url ? `2px solid ${theme.colors.brand}` : '2px dashed #374151',
                                    borderRadius: 2,
                                    p: courseData.thumbnail_url ? 0 : 4,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s',
                                    '&:hover': { borderColor: theme.colors.brand },
                                    overflow: 'hidden',
                                    minHeight: 150,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {courseData.thumbnail_url ? (
                                    <Box
                                        component="img"
                                        src={courseData.thumbnail_url}
                                        alt="Thumbnail preview"
                                        sx={{ width: '100%', height: 'auto', maxHeight: 200, objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Box>
                                        <CloudUpload sx={{ fontSize: 40, color: '#6B7280', mb: 1 }} />
                                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 0.5 }}>
                                            Click to upload
                                        </Typography>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                            or drag and drop
                                        </Typography>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.7rem', mt: 1 }}>
                                            SVG, PNG, JPG (max. 800x400px)
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </label>
                        {courseData.thumbnail_url && (
                            <Button
                                size="small"
                                onClick={() => {
                                    // Clear both the preview and the file object
                                    handleInputChange('thumbnail_url', '');
                                    setThumbnailFile(null);
                                }}
                                sx={{ mt: 1, color: '#EF4444', fontSize: '0.75rem' }}
                            >
                                Remove Image
                            </Button>
                        )}
                    </Box>

                    {/* Tutor Tips */}
                    <Paper sx={{ bgcolor: '#1A2230', border: '1px solid #374151', borderRadius: 2, p: 2.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                            <Info sx={{ color: theme.colors.brand, fontSize: 18 }} />
                            <Typography sx={{ color: theme.colors.brand, fontWeight: 600, fontSize: '0.85rem' }}>
                                Tutor Tips
                            </Typography>
                        </Stack>
                        <Stack spacing={1}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                • Start with a catchy title that includes keywords
                            </Typography>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                • Clearly define the target audience in your description
                            </Typography>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                • Use high-quality images for better engagement
                            </Typography>
                        </Stack>
                    </Paper>
                </Stack>
            </Box>
        </Box>
    );

    // Step 2: Modules (Curriculum)
    const renderModules = () => (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                    Course Modules ({modules.length})
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => { setEditingModule(null); setNewModule({ title: '', description: '' }); setModuleModalOpen(true); }}
                    sx={{ bgcolor: theme.colors.brand, '&:hover': { bgcolor: '#0D42AF' } }}
                >
                    Add Module
                </Button>
            </Stack>

            {validationErrors.modules && (
                <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                    {validationErrors.modules}
                </Alert>
            )}

            {modules.length === 0 ? (
                <Paper sx={{ p: 6, bgcolor: '#1A2230', borderRadius: 2, border: '1px dashed #374151', textAlign: 'center' }}>
                    <Typography sx={{ color: '#6B7280', mb: 2 }}>No modules added yet</Typography>
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => setModuleModalOpen(true)}
                        sx={{ color: theme.colors.brand, borderColor: theme.colors.brand }}
                    >
                        Create First Module
                    </Button>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {modules.map((module, index) => (
                        <Paper key={module.id} sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151', overflow: 'hidden' }}>
                            <Box
                                sx={{ p: 2, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                            >
                                <DragIndicator sx={{ color: '#6B7280', mr: 2 }} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                        Module {index + 1}: {module.title}
                                    </Typography>
                                    <Typography sx={{ color: '#6B7280', fontSize: '0.8rem' }}>
                                        {module.lessons?.length || 0} lessons
                                    </Typography>
                                </Box>
                                <Stack direction="row" spacing={1}>
                                    <Tooltip title="Edit Module">
                                        <IconButton onClick={(e) => { e.stopPropagation(); handleEditModule(module); }} sx={{ color: '#3B82F6' }}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Module">
                                        <IconButton
                                            onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.id); }}
                                            disabled={module.lessons?.length > 0}
                                            sx={{ color: module.lessons?.length > 0 ? '#374151' : '#EF4444' }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    {expandedModule === module.id ? <ExpandLess sx={{ color: '#9CA3AF' }} /> : <ExpandMore sx={{ color: '#9CA3AF' }} />}
                                </Stack>
                            </Box>
                            <Collapse in={expandedModule === module.id}>
                                <Divider sx={{ bgcolor: '#374151' }} />
                                <Box sx={{ p: 2, bgcolor: '#0F172A' }}>
                                    {module.lessons?.length > 0 ? (
                                        <List dense>
                                            {module.lessons.map((lesson, li) => (
                                                <ListItem key={lesson.id} sx={{ bgcolor: '#1A2230', borderRadius: 1, mb: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                                        {getLessonTypeIcon(lesson.type)}
                                                    </Box>
                                                    <ListItemText
                                                        primary={lesson.title}
                                                        secondary={lesson.duration ? `${lesson.duration} min` : null}
                                                        primaryTypographyProps={{ sx: { color: '#fff', fontSize: '0.85rem' } }}
                                                        secondaryTypographyProps={{ sx: { color: '#6B7280' } }}
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <IconButton onClick={() => handleEditLesson(module.id, lesson)} sx={{ color: '#3B82F6' }}>
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                        <IconButton onClick={() => handleDeleteLesson(module.id, lesson.id)} sx={{ color: '#EF4444' }}>
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography sx={{ color: '#6B7280', textAlign: 'center', py: 2 }}>
                                            No lessons in this module
                                        </Typography>
                                    )}
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<Add />}
                                        onClick={() => handleAddLesson(module.id)}
                                        sx={{ mt: 1, color: theme.colors.brand, borderColor: '#374151', '&:hover': { borderColor: theme.colors.brand } }}
                                    >
                                        Add Lesson
                                    </Button>
                                </Box>
                            </Collapse>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );

    // Step 3: Lessons (Media/Content)
    const renderLessons = () => (
        <Box>
            <Typography sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>
                Lesson Content Overview
            </Typography>

            {validationErrors.lessons && (
                <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                    {validationErrors.lessons}
                </Alert>
            )}

            {modules.length === 0 ? (
                <Paper sx={{ p: 6, bgcolor: '#1A2230', borderRadius: 2, border: '1px dashed #374151', textAlign: 'center' }}>
                    <Typography sx={{ color: '#6B7280' }}>Create modules first to add lessons</Typography>
                </Paper>
            ) : (
                <Stack spacing={3}>
                    {modules.map((module, mi) => (
                        <Paper key={module.id} sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151', p: 3 }}>
                            <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                                Module {mi + 1}: {module.title}
                            </Typography>
                            {module.lessons?.length > 0 ? (
                                <Stack spacing={1.5}>
                                    {module.lessons.map((lesson, li) => (
                                        <Box
                                            key={lesson.id}
                                            sx={{
                                                bgcolor: '#0F172A',
                                                borderRadius: 1.5,
                                                p: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                            }}
                                        >
                                            <Box sx={{ p: 1, bgcolor: '#1E293B', borderRadius: 1 }}>
                                                {getLessonTypeIcon(lesson.type)}
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>
                                                    {lesson.title}
                                                </Typography>
                                                <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                                    {lesson.type} {lesson.duration ? `• ${lesson.duration} min` : ''}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={lesson.content ? 'Content Added' : 'Pending'}
                                                size="small"
                                                sx={{
                                                    bgcolor: lesson.content ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                                    color: lesson.content ? '#10B981' : '#F59E0B',
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography sx={{ color: '#6B7280', textAlign: 'center', py: 2 }}>
                                    No lessons added
                                </Typography>
                            )}
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => handleAddLesson(module.id)}
                                sx={{ mt: 2, color: theme.colors.brand, borderColor: '#374151' }}
                            >
                                Add Lesson to Module {mi + 1}
                            </Button>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );

    // Step 4: Review & Submit
    const renderReview = () => {
        const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);

        return (
            <Box>
                <Stack spacing={3}>
                    {/* Course Summary */}
                    <Paper sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151', p: 3 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>Course Information</Typography>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ color: '#6B7280', width: 120 }}>Title:</Typography>
                                <Typography sx={{ color: '#fff' }}>{courseData.title || '-'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ color: '#6B7280', width: 120 }}>Category:</Typography>
                                <Typography sx={{ color: '#fff' }}>
                                    {categories.find(c => c.id === courseData.category_id)?.name || '-'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ color: '#6B7280', width: 120 }}>Level:</Typography>
                                <Typography sx={{ color: '#fff', textTransform: 'capitalize' }}>{courseData.level}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ color: '#6B7280', width: 120 }}>Summary:</Typography>
                                <Typography sx={{ color: '#fff' }}>{courseData.summary || '-'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ color: '#6B7280', width: 120 }}>Price:</Typography>
                                <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                    {courseData.price > 0
                                        ? formatCurrency(courseData.price, courseData.currency)
                                        : 'Free'}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    {/* Curriculum Summary */}
                    <Paper sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151', p: 3 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>Curriculum Summary</Typography>
                        <Stack direction="row" spacing={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography sx={{ color: theme.colors.brand, fontSize: '2rem', fontWeight: 700 }}>{modules.length}</Typography>
                                <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>Modules</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography sx={{ color: '#10B981', fontSize: '2rem', fontWeight: 700 }}>{totalLessons}</Typography>
                                <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>Lessons</Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    {/* Validation Status */}
                    <Paper sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151', p: 3 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>Submission Checklist</Typography>
                        <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CheckCircle sx={{ color: courseData.title ? '#10B981' : '#374151', fontSize: 20 }} />
                                <Typography sx={{ color: courseData.title ? '#fff' : '#6B7280' }}>Course title provided</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CheckCircle sx={{ color: courseData.category_id ? '#10B981' : '#374151', fontSize: 20 }} />
                                <Typography sx={{ color: courseData.category_id ? '#fff' : '#6B7280' }}>Category selected</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CheckCircle sx={{ color: modules.length > 0 ? '#10B981' : '#374151', fontSize: 20 }} />
                                <Typography sx={{ color: modules.length > 0 ? '#fff' : '#6B7280' }}>At least one module</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CheckCircle sx={{ color: totalLessons > 0 ? '#10B981' : '#374151', fontSize: 20 }} />
                                <Typography sx={{ color: totalLessons > 0 ? '#fff' : '#6B7280' }}>At least one lesson</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Stack>
            </Box>
        );
    };

    if (loadingCourse) {
        return (
            <Box sx={{ p: 4, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress sx={{ color: theme.colors.brand }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                        {isEditMode ? 'Edit Course' : 'Create New Course'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        {isEditMode ? 'Update your course details and media.' : 'Share your expertise in governance and policy.'}
                    </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Chip
                        icon={courseData.status === 'draft' ? <Schedule sx={{ fontSize: 14 }} /> : <CheckCircle sx={{ fontSize: 14 }} />}
                        label={lastSaved ? `Draft saved ${lastSaved.toLocaleTimeString()}` : 'Draft'}
                        sx={{
                            bgcolor: 'rgba(245, 158, 11, 0.15)',
                            color: '#F59E0B',
                            '& .MuiChip-icon': { color: '#F59E0B' },
                        }}
                    />
                </Stack>
            </Stack>

            {/* Stepper */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: '#1A2230',
                        borderRadius: '50px',
                        p: 0.5,
                        border: '1px solid #374151',
                        overflow: 'hidden',
                    }}
                >
                    {steps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isActive = index === activeStep;
                        const isCompleted = index < activeStep;
                        const isLast = index === steps.length - 1;

                        return (
                            <React.Fragment key={step.label}>
                                {/* Step Item */}
                                <Box
                                    onClick={() => {
                                        if (isCompleted) setActiveStep(index);
                                    }}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        py: 1.5,
                                        px: 2.5,
                                        borderRadius: '50px',
                                        bgcolor: isActive ? theme.colors.brand : 'transparent',
                                        cursor: isCompleted ? 'pointer' : 'default',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: isCompleted && !isActive ? 'rgba(17, 82, 212, 0.15)' : isActive ? theme.colors.brand : 'transparent',
                                        },
                                        flexShrink: 0,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: isActive ? 'rgba(255,255,255,0.2)' : isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                                            color: isActive ? '#fff' : isCompleted ? '#10B981' : '#6B7280',
                                        }}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle sx={{ fontSize: 18 }} />
                                        ) : (
                                            <StepIcon sx={{ fontSize: 18 }} />
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography
                                            sx={{
                                                color: isActive ? '#fff' : isCompleted ? '#10B981' : '#9CA3AF',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {step.label}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: isActive ? 'rgba(255,255,255,0.7)' : '#6B7280',
                                                fontSize: '0.7rem',
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {step.sublabel}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Chevron Separator */}
                                {!isLast && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: '#374151',
                                            flex: 1,
                                            justifyContent: 'center',
                                            minWidth: 40,
                                        }}
                                    >
                                        <ChevronRight sx={{ fontSize: 24 }} />
                                    </Box>
                                )}
                            </React.Fragment>
                        );
                    })}
                </Box>
            </Box>

            {/* Step Content */}
            <Paper sx={{ p: 4, mb: 4, bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                {activeStep === 0 && renderBasicDetails()}
                {activeStep === 1 && renderModules()}
                {activeStep === 2 && renderLessons()}
                {activeStep === 3 && renderReview()}
            </Paper>

            {/* Navigation Buttons */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Stack direction="row" spacing={1}>
                    <Button
                        onClick={() => navigate('/tutor/courses')}
                        sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                    >
                        Cancel
                    </Button>
                    {/* Save Draft / Save Changes — always visible on every step */}
                    {!(activeStep === steps.length - 1 && isEditMode) && (
                        <Button
                            onClick={() => handleSubmit(true)}
                            disabled={submitting || !courseData.title}
                            variant="outlined"
                            sx={{
                                borderColor: '#374151',
                                color: '#9CA3AF',
                                '&:hover': { borderColor: '#6B7280', color: '#fff' },
                                '&:disabled': { borderColor: '#1F2937', color: '#374151' },
                            }}
                        >
                            {submitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Save Draft'}
                        </Button>
                    )}
                </Stack>
                <Stack direction="row" spacing={2}>
                    {activeStep > 0 && (
                        <Button
                            onClick={handleBack}
                            startIcon={<ArrowBack />}
                            sx={{ color: '#fff', borderColor: '#374151', '&:hover': { borderColor: '#4B5563' } }}
                            variant="outlined"
                        >
                            Back
                        </Button>
                    )}
                    {activeStep < steps.length - 1 ? (
                        <Button
                            onClick={handleNext}
                            endIcon={<ArrowForward />}
                            variant="contained"
                            sx={{ bgcolor: theme.colors.brand, '&:hover': { bgcolor: '#0D42AF' } }}
                        >
                            Continue to {steps[activeStep + 1].sublabel}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => isEditMode ? handleSubmit(true) : setSubmitModalOpen(true)}
                            endIcon={<Send />}
                            variant="contained"
                            disabled={submitting}
                            sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                        >
                            {isEditMode ? 'Save Changes' : 'Submit Course'}
                        </Button>
                    )}
                </Stack>
            </Stack>

            {/* Module Modal */}
            <Modal open={moduleModalOpen} onClose={() => setModuleModalOpen(false)}>
                <Box sx={modalStyle}>
                    <Box sx={{ background: '${theme.colors.brand} 0%, ${theme.colors.brandHover} 100%)', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>{editingModule ? 'Edit Module' : 'Add Module'}</Typography>
                        <IconButton onClick={() => setModuleModalOpen(false)} sx={{ color: '#fff' }}><Close /></IconButton>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={2}>
                            <Box>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Module Title</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="e.g. Introduction to the Course"
                                    value={newModule.title}
                                    onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                                    sx={textFieldStyle}
                                />
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Description (optional)</Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Brief description of what this module covers"
                                    value={newModule.description}
                                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                    sx={textFieldStyle}
                                />
                            </Box>
                        </Stack>
                        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                            <Button onClick={() => setModuleModalOpen(false)} sx={{ color: '#9CA3AF' }}>Cancel</Button>
                            <Button
                                variant="contained"
                                onClick={editingModule ? handleUpdateModule : handleAddModule}
                                sx={{ bgcolor: theme.colors.brand }}
                            >
                                {editingModule ? 'Update' : 'Add Module'}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>

            {/* Lesson Modal */}
            <Modal open={lessonModalOpen} onClose={() => setLessonModalOpen(false)}>
                <Box sx={{ ...modalStyle, width: { xs: '95vw', sm: '90vw', md: 900 }, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ background: '${theme.colors.brand} 0%, ${theme.colors.brandHover} 100%)', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>{editingLesson ? 'Edit Lesson' : 'Add Lesson'}</Typography>
                        <IconButton onClick={() => setLessonModalOpen(false)} sx={{ color: '#fff' }}><Close /></IconButton>
                    </Box>
                    <Box sx={{ p: 3, overflowY: 'auto', flex: 1, ...scrollableModalBody }}>
                        <Stack spacing={2}>
                            <Box>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Lesson Title</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="e.g. Welcome Video"
                                    value={newLesson.title}
                                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                                    sx={textFieldStyle}
                                />
                            </Box>

                            <Box>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Video</Typography>
                                    <Chip label="Optional" size="small" sx={{ bgcolor: 'rgba(156, 163, 175, 0.15)', color: '#9CA3AF', fontSize: '0.7rem', height: 20 }} />
                                </Stack>
                                <input
                                    type="file"
                                    accept="video/*"
                                    style={{ display: 'none' }}
                                    id="lesson-video-upload"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setNewLesson({ ...newLesson, videoFile: file, fileName: file.name, videoUrl: '' });
                                        }
                                    }}
                                />
                                <label htmlFor="lesson-video-upload">
                                    <Box
                                        sx={{
                                            bgcolor: '#1E293B',
                                            border: (newLesson.videoFile || newLesson.fileName) ? '2px solid #10B981' : '2px dashed #374151',
                                            borderRadius: 2,
                                            p: 3,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            '&:hover': { borderColor: theme.colors.brand },
                                        }}
                                    >
                                        {(newLesson.videoFile || newLesson.fileName) ? (
                                            <Stack alignItems="center" spacing={1}>
                                                <PlayCircleOutline sx={{ fontSize: 36, color: '#10B981' }} />
                                                <Typography sx={{ color: '#fff', fontSize: '0.85rem' }}>
                                                    {newLesson.fileName}
                                                </Typography>
                                                <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                                    Click to change
                                                </Typography>
                                            </Stack>
                                        ) : (
                                            <Stack alignItems="center" spacing={1}>
                                                <CloudUpload sx={{ fontSize: 36, color: '#6B7280' }} />
                                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                                                    Click to upload video
                                                </Typography>
                                                <Typography sx={{ color: '#6B7280', fontSize: '0.7rem' }}>
                                                    MP4, WebM, MOV (max. 500MB)
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Box>
                                </label>
                                <Typography sx={{ color: '#6B7280', fontSize: '0.75rem', textAlign: 'center', my: 1 }}>— or —</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Paste a video URL (https://...)"
                                    value={newLesson.videoUrl}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setNewLesson({ ...newLesson, videoUrl: v, ...(v ? { videoFile: null, fileName: '' } : {}) });
                                    }}
                                    sx={textFieldStyle}
                                    slotProps={{ htmlInput: { maxLength: 2048 } }}
                                />
                            </Box>

                            <Box>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Lesson Content</Typography>
                                <Box
                                    sx={{
                                        bgcolor: '#1E293B',
                                        borderRadius: 1.5,
                                        border: '1px solid #374151',
                                        '& .ql-toolbar': {
                                            borderTopLeftRadius: 6,
                                            borderTopRightRadius: 6,
                                            borderColor: '#374151',
                                            bgcolor: '#111827',
                                        },
                                        '& .ql-container': {
                                            borderBottomLeftRadius: 6,
                                            borderBottomRightRadius: 6,
                                            borderColor: '#374151',
                                            minHeight: 220,
                                            fontSize: '0.9rem',
                                        },
                                        '& .ql-editor': { color: '#FFFFFF', minHeight: 220 },
                                        '& .ql-editor.ql-blank::before': { color: '#6B7280', fontStyle: 'normal' },
                                        '& .ql-stroke': { stroke: '#9CA3AF' },
                                        '& .ql-fill': { fill: '#9CA3AF' },
                                        '& .ql-picker-label': { color: '#9CA3AF' },
                                    }}
                                >
                                    <ReactQuill
                                        theme="snow"
                                        value={newLesson.content}
                                        onChange={(value) => setNewLesson({ ...newLesson, content: value })}
                                        placeholder="Write your lesson content here..."
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, 3, false] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                ['link', 'blockquote', 'code-block'],
                                                ['clean']
                                            ],
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Box>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Duration</Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <TextField
                                        type="number"
                                        label="Hours"
                                        value={newLesson.durationHours === 0 ? '' : newLesson.durationHours}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === '') { setNewLesson({ ...newLesson, durationHours: 0 }); return; }
                                            const v = Math.max(0, parseInt(raw) || 0);
                                            setNewLesson({ ...newLesson, durationHours: v });
                                        }}
                                        slotProps={{ htmlInput: { min: 0, max: 23, placeholder: '0' } }}
                                        sx={{ ...textFieldStyle, width: 140, '& .MuiInputLabel-root': { color: '#9CA3AF' } }}
                                    />
                                    <Typography sx={{ color: '#6B7280', fontSize: '1.25rem', fontWeight: 600 }}>:</Typography>
                                    <TextField
                                        type="number"
                                        label="Minutes"
                                        value={newLesson.durationMinutes === 0 ? '' : newLesson.durationMinutes}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === '') { setNewLesson({ ...newLesson, durationMinutes: 0 }); return; }
                                            const v = Math.min(59, Math.max(0, parseInt(raw) || 0));
                                            setNewLesson({ ...newLesson, durationMinutes: v });
                                        }}
                                        slotProps={{ htmlInput: { min: 0, max: 59, placeholder: '0' } }}
                                        sx={{ ...textFieldStyle, width: 140, '& .MuiInputLabel-root': { color: '#9CA3AF' } }}
                                    />
                                </Stack>
                            </Box>
                        </Stack>
                        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                            <Button onClick={() => setLessonModalOpen(false)} sx={{ color: '#9CA3AF' }}>Cancel</Button>
                            <Button variant="contained" onClick={handleSaveLesson} sx={{ bgcolor: theme.colors.brand }}>
                                {editingLesson ? 'Update' : 'Add Lesson'}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>

            {/* Submit Confirmation Modal */}
            <Modal open={submitModalOpen} onClose={() => setSubmitModalOpen(false)}>
                <Box sx={modalStyle}>
                    <Box sx={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', p: 3 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>Submit for Approval</Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <Typography sx={{ color: '#9CA3AF', mb: 3 }}>
                            Once submitted, your course will be locked for editing until reviewed by an admin.
                            Are you sure you want to submit?
                        </Typography>
                        <Stack direction="row" justifyContent="flex-end" spacing={2}>
                            <Button onClick={() => handleSubmit(true)} sx={{ color: '#9CA3AF' }}>
                                Save as Draft
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => handleSubmit(false)}
                                sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                            >
                                Submit for Approval
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>

            {/* Loading Overlay during submission */}
            {submitting && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                    }}
                >
                    <CircularProgress size={60} sx={{ color: theme.colors.brand, mb: 2 }} />
                    <Typography sx={{ color: '#fff', fontSize: '1.1rem' }}>
                        Creating your course...
                    </Typography>
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mt: 1 }}>
                        Please wait while we set up your course, modules, and lessons.
                    </Typography>
                </Box>
            )}

            {/* Snackbar for feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CreateCourse;

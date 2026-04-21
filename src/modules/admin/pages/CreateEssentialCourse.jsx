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
    FormControl,
    InputLabel,
    OutlinedInput,
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
import { categoryService } from '../../../services/categoryService';
import { optionAdminService } from '../services/optionAdminService';
import { tutorModuleService, tutorLessonService } from '../../tutor/services';
import theme from '../../../styles/theme';


const steps = [
    { label: 'Step 1', sublabel: 'Basic Details', icon: DescriptionOutlined },
    { label: 'Step 2', sublabel: 'Curriculum', icon: MenuBookOutlined },
    { label: 'Step 3', sublabel: 'Media', icon: PermMediaOutlined },
    { label: 'Step 4', sublabel: 'Review', icon: RateReviewOutlined },
];

const levels = ['beginner', 'intermediate', 'advanced'];
const statuses = ['draft', 'published', 'archived'];

const getTutorLabel = (tutor) =>
    tutor?.name || tutor?.user?.name || tutor?.email || tutor?.id || 'Unknown tutor';

const CreateEssentialCourse = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editCourseId = new URLSearchParams(location.search).get('edit') || null;
    const isEditMode = Boolean(editCourseId);

    const [activeStep, setActiveStep] = useState(0);
    const [lastSaved, setLastSaved] = useState(null);
    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [loadingCourse, setLoadingCourse] = useState(isEditMode);

    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [categories, setCategories] = useState([]);
    const [tutorOptions, setTutorOptions] = useState([]);

    const [courseData, setCourseData] = useState({
        title: '',
        summary: '',
        description: '',
        level: 'beginner',
        language: 'en',
        duration_minutes: 0,
        thumbnail_url: '',
        status: 'published',
        category_id: '',
        tutor_ids: [],
    });

    const [thumbnailFile, setThumbnailFile] = useState(null);

    const [modules, setModules] = useState([]);
    const [editingModule, setEditingModule] = useState(null);
    const [moduleModalOpen, setModuleModalOpen] = useState(false);
    const [newModule, setNewModule] = useState({ title: '', description: '' });

    const [expandedModule, setExpandedModule] = useState(null);
    const [lessonModalOpen, setLessonModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [currentModuleId, setCurrentModuleId] = useState(null);
    const [newLesson, setNewLesson] = useState({ title: '', type: 'video', content: '', duration: 0 });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (courseData.title) setLastSaved(new Date());
        }, 2000);
        return () => clearTimeout(timer);
    }, [courseData]);

    useEffect(() => {
        const load = async () => {
            try {
                const categoriesData = await categoryService.getAllCategories();
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } catch (err) {
                console.error('Failed to load categories:', err);
                setCategories([]);
            }

            try {
                const tutorsResponse = await optionAdminService.listTutors({ per_page: 100 });
                setTutorOptions(tutorsResponse.data || []);
            } catch (err) {
                console.error('Failed to load tutors:', err);
                setTutorOptions([]);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (!isEditMode) return;
        const fetchCourse = async () => {
            setLoadingCourse(true);
            try {
                const course = await optionAdminService.getEssentialCourseById(editCourseId, {
                    with_categories: 1,
                    with_tutors: 1,
                    with_audit: 1,
                });
                const c = course?.data ?? course;
                const tutorIds = Array.isArray(c?.tutors)
                    ? c.tutors.map((tutor) => String(tutor?.id || '')).filter(Boolean)
                    : Array.isArray(c?.tutor_ids)
                        ? c.tutor_ids.map(String)
                        : [];
                setCourseData({
                    title: c.title || '',
                    summary: c.summary || '',
                    description: c.description || '',
                    level: c.level || 'beginner',
                    language: c.language || 'en',
                    duration_minutes: c.duration_minutes || 0,
                    thumbnail_url: c.thumbnail_url || '',
                    status: c.status || 'published',
                    category_id: c.categories?.[0]?.id || c.category_id || '',
                    tutor_ids: tutorIds,
                });
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
        setCourseData((prev) => ({ ...prev, [field]: value }));
        if (validationErrors[field]) {
            setValidationErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validateStep = (step) => {
        const errors = {};
        if (step === 0) {
            if (!courseData.title) errors.title = 'Course title is required';
            if (!courseData.category_id) errors.category_id = 'Category is required';
            if (!courseData.summary) errors.summary = 'Summary is required';
            if (!isEditMode && (!courseData.tutor_ids || courseData.tutor_ids.length === 0)) {
                errors.tutor_ids = 'At least one tutor is required';
            }
        }
        if (step === 3) {
            if (modules.length === 0) errors.modules = 'At least one module is required';
            const hasLessons = modules.some((m) => m.lessons && m.lessons.length > 0);
            if (!hasLessons) errors.lessons = 'At least one lesson is required';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

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
        setModules(modules.map((m) => (m.id === editingModule.id ? { ...m, ...newModule } : m)));
        setEditingModule(null);
        setNewModule({ title: '', description: '' });
        setModuleModalOpen(false);
    };

    const handleDeleteModule = (moduleId) => {
        const module = modules.find((m) => m.id === moduleId);
        if (module && (!module.lessons || module.lessons.length === 0)) {
            setModules(modules.filter((m) => m.id !== moduleId));
        }
    };

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

        setModules(modules.map((m) => {
            if (m.id === currentModuleId) {
                if (editingLesson) {
                    return {
                        ...m,
                        lessons: m.lessons.map((l) => (l.id === editingLesson.id ? { ...l, ...merged } : l)),
                    };
                }
                return {
                    ...m,
                    lessons: [...(m.lessons || []), { id: Date.now(), ...merged }],
                };
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
        setModules(modules.map((m) => {
            if (m.id === moduleId) {
                return { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) };
            }
            return m;
        }));
    };

    const handleSubmit = async (asDraft = true) => {
        if (!asDraft && !validateStep(3)) return;

        setSubmitting(true);
        setSubmitModalOpen(false);

        try {
            const basePayload = {
                title: courseData.title.trim(),
                summary: courseData.summary.trim(),
                description: courseData.description || '',
                level: courseData.level,
                language: courseData.language,
                duration_minutes: Number(courseData.duration_minutes || 0),
                status: asDraft ? 'draft' : courseData.status || 'published',
                category_ids: courseData.category_id ? [String(courseData.category_id)] : [],
                tutor_ids: (courseData.tutor_ids || []).map(String),
            };

            if (isEditMode && basePayload.tutor_ids.length === 0) delete basePayload.tutor_ids;
            if (isEditMode && basePayload.category_ids.length === 0) delete basePayload.category_ids;

            let savedCourse;
            if (isEditMode) {
                if (thumbnailFile) {
                    savedCourse = await optionAdminService.updateEssentialCourseMultipart(editCourseId, {
                        ...basePayload,
                        thumbnail: thumbnailFile,
                    });
                } else {
                    savedCourse = await optionAdminService.updateEssentialCourseJson(editCourseId, basePayload);
                }
            } else if (thumbnailFile) {
                savedCourse = await optionAdminService.createEssentialCourseMultipart({
                    ...basePayload,
                    thumbnail: thumbnailFile,
                });
            } else {
                savedCourse = await optionAdminService.createEssentialCourseJson(basePayload);
            }

            const courseId = savedCourse?.id || savedCourse?.data?.id || editCourseId;
            if (!isEditMode && !courseId) throw new Error('Course was created but no ID was returned');

            if (!isEditMode && courseId) {
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
            }

            setSnackbar({
                open: true,
                message: isEditMode
                    ? 'Essential course updated successfully!'
                    : asDraft
                        ? 'Essential course saved as draft successfully!'
                        : 'Essential course published successfully!',
                severity: 'success',
            });
            setTimeout(() => navigate('/admin/content/essential-courses'), 1500);
        } catch (error) {
            console.error('Error saving essential course:', error);
            setSnackbar({
                open: true,
                message: error.message || `Failed to ${isEditMode ? 'update' : 'create'} course. Please try again.`,
                severity: 'error',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getLessonTypeIcon = (type) => {
        switch (type) {
            case 'video':
                return <PlayCircleOutline sx={{ fontSize: 18 }} />;
            case 'text':
            case 'reading':
                return <ArticleOutlined sx={{ fontSize: 18 }} />;
            case 'document':
            case 'file':
                return <AttachFile sx={{ fontSize: 18 }} />;
            default:
                return null;
        }
    };

    const renderBasicDetails = () => (
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 55%' }, minWidth: 0 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                            Course Title
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="e.g. Essential Governance Foundations"
                            value={courseData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            error={!!validationErrors.title}
                            helperText={validationErrors.title || 'Use a clear, catchy title (Max 80 chars)'}
                            sx={textFieldStyle}
                            FormHelperTextProps={{ sx: { color: validationErrors.title ? '#EF4444' : '#6B7280' } }}
                        />
                    </Box>

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
                                MenuProps={selectMenuProps}
                            >
                                <MenuItem value="" disabled>
                                    Select category
                                </MenuItem>
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </MenuItem>
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
                                MenuProps={selectMenuProps}
                            >
                                {levels.map((level) => (
                                    <MenuItem key={level} value={level} sx={{ textTransform: 'capitalize' }}>
                                        {level}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                                Language
                            </Typography>
                            <TextField
                                fullWidth
                                value={courseData.language}
                                onChange={(e) => handleInputChange('language', e.target.value)}
                                sx={textFieldStyle}
                            />
                        </Box>
                        <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                                Status
                            </Typography>
                            <Select
                                fullWidth
                                value={courseData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                sx={selectStyle}
                                MenuProps={selectMenuProps}
                            >
                                {statuses.map((status) => (
                                    <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>
                    </Box>

                    <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                            Assign Tutors
                        </Typography>
                        <FormControl fullWidth error={!!validationErrors.tutor_ids}>
                            <Select
                                multiple
                                displayEmpty
                                value={courseData.tutor_ids}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    handleInputChange('tutor_ids', typeof value === 'string' ? value.split(',') : value);
                                }}
                                input={<OutlinedInput />}
                                renderValue={(selected) => {
                                    if (!selected || selected.length === 0) {
                                        return <Typography sx={{ color: '#6B7280', fontSize: '0.875rem' }}>Select tutors</Typography>;
                                    }
                                    return (
                                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                            {selected.map((id) => {
                                                const tutor = tutorOptions.find((t) => String(t.id) === String(id));
                                                return (
                                                    <Chip
                                                        key={id}
                                                        size="small"
                                                        label={getTutorLabel(tutor) || id}
                                                        sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#E5E7EB' }}
                                                    />
                                                );
                                            })}
                                        </Stack>
                                    );
                                }}
                                sx={selectStyle}
                                MenuProps={selectMenuProps}
                            >
                                {tutorOptions.length === 0 ? (
                                    <MenuItem disabled value="">
                                        No tutors available
                                    </MenuItem>
                                ) : (
                                    tutorOptions.map((tutor) => (
                                        <MenuItem key={tutor.id} value={String(tutor.id)}>
                                            {getTutorLabel(tutor)}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                            {validationErrors.tutor_ids && (
                                <Typography sx={{ color: '#EF4444', fontSize: '0.75rem', mt: 0.5 }}>
                                    {validationErrors.tutor_ids}
                                </Typography>
                            )}
                        </FormControl>
                    </Box>

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
                            helperText={validationErrors.summary}
                            sx={textFieldStyle}
                            FormHelperTextProps={{ sx: { color: '#EF4444' } }}
                        />
                    </Box>

                    <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                            Description
                        </Typography>
                        <Box
                            sx={{
                                '& .quill': { display: 'flex', flexDirection: 'column' },
                                '& .ql-toolbar': {
                                    bgcolor: '#1E293B',
                                    borderColor: '#374151',
                                    borderRadius: '6px 6px 0 0',
                                    '& .ql-stroke': { stroke: '#9CA3AF' },
                                    '& .ql-fill': { fill: '#9CA3AF' },
                                    '& .ql-picker': { color: '#9CA3AF' },
                                    '& .ql-picker-options': { bgcolor: '#1E293B', border: '1px solid #374151' },
                                    '& .ql-picker-item:hover': { color: '#fff' },
                                    '& button:hover .ql-stroke': { stroke: '#fff' },
                                    '& button:hover .ql-fill': { fill: '#fff' },
                                    '& button.ql-active .ql-stroke': { stroke: theme.colors.brand },
                                    '& button.ql-active .ql-fill': { fill: theme.colors.brand },
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
                                    '&.ql-blank::before': { color: '#6B7280', fontStyle: 'normal' },
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
                                        [{ header: [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ list: 'ordered' }, { list: 'bullet' }],
                                        ['link'],
                                        ['clean'],
                                    ],
                                }}
                            />
                        </Box>
                    </Box>

                </Stack>
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 35%' }, minWidth: 0 }}>
                <Stack spacing={3}>
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
                                    setThumbnailFile(file);
                                    const reader = new FileReader();
                                    reader.onloadend = () => handleInputChange('thumbnail_url', reader.result);
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
                                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 0.5 }}>Click to upload</Typography>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>or drag and drop</Typography>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.7rem', mt: 1 }}>SVG, PNG, JPG (max. 800x400px)</Typography>
                                    </Box>
                                )}
                            </Box>
                        </label>
                        {courseData.thumbnail_url && (
                            <Button
                                size="small"
                                onClick={() => {
                                    handleInputChange('thumbnail_url', '');
                                    setThumbnailFile(null);
                                }}
                                sx={{ mt: 1, color: '#EF4444', fontSize: '0.75rem' }}
                            >
                                Remove Image
                            </Button>
                        )}
                    </Box>

                    <Paper sx={{ bgcolor: '#1A2230', border: '1px solid #374151', borderRadius: 2, p: 2.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                            <Info sx={{ color: theme.colors.brand, fontSize: 18 }} />
                            <Typography sx={{ color: theme.colors.brand, fontWeight: 600, fontSize: '0.85rem' }}>
                                Admin Tips
                            </Typography>
                        </Stack>
                        <Stack spacing={1}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                • Essential courses are mandatory for every learner
                            </Typography>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                • Assign qualified tutors to maintain content authority
                            </Typography>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                • Use high-quality thumbnails for better engagement
                            </Typography>
                        </Stack>
                    </Paper>
                </Stack>
            </Box>
        </Box>
    );

    const renderModules = () => (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                    Course Modules ({modules.length})
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                        setEditingModule(null);
                        setNewModule({ title: '', description: '' });
                        setModuleModalOpen(true);
                    }}
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
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditModule(module);
                                            }}
                                            sx={{ color: '#3B82F6' }}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Module">
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteModule(module.id);
                                            }}
                                            disabled={module.lessons?.length > 0}
                                            sx={{ color: module.lessons?.length > 0 ? '#374151' : '#EF4444' }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    {expandedModule === module.id ? (
                                        <ExpandLess sx={{ color: '#9CA3AF' }} />
                                    ) : (
                                        <ExpandMore sx={{ color: '#9CA3AF' }} />
                                    )}
                                </Stack>
                            </Box>
                            <Collapse in={expandedModule === module.id}>
                                <Divider sx={{ bgcolor: '#374151' }} />
                                <Box sx={{ p: 2, bgcolor: '#0F172A' }}>
                                    {module.lessons?.length > 0 ? (
                                        <List dense>
                                            {module.lessons.map((lesson) => (
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

    const renderLessons = () => (
        <Box>
            <Typography sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>Lesson Content Overview</Typography>

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
                                    {module.lessons.map((lesson) => (
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

    const renderReview = () => {
        const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
        const selectedCategoryName = categories.find((c) => c.id === courseData.category_id)?.name || '-';
        const selectedTutorNames = tutorOptions
            .filter((t) => courseData.tutor_ids.map(String).includes(String(t.id)))
            .map(getTutorLabel);

        return (
            <Box>
                <Stack spacing={3}>
                    <Paper sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151', p: 3 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>Course Information</Typography>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ color: '#6B7280', width: 140 }}>Title:</Typography>
                                <Typography sx={{ color: '#fff' }}>{courseData.title || '-'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ color: '#6B7280', width: 140 }}>Category:</Typography>
                                <Typography sx={{ color: '#fff' }}>{selectedCategoryName}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ color: '#6B7280', width: 140 }}>Level:</Typography>
                                <Typography sx={{ color: '#fff', textTransform: 'capitalize' }}>{courseData.level}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ color: '#6B7280', width: 140 }}>Status:</Typography>
                                <Typography sx={{ color: '#fff', textTransform: 'capitalize' }}>{courseData.status}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ color: '#6B7280', width: 140 }}>Summary:</Typography>
                                <Typography sx={{ color: '#fff' }}>{courseData.summary || '-'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ color: '#6B7280', width: 140 }}>Tutors:</Typography>
                                <Typography sx={{ color: '#fff' }}>
                                    {selectedTutorNames.length > 0 ? selectedTutorNames.join(', ') : '-'}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

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
                                <CheckCircle sx={{ color: courseData.tutor_ids.length > 0 ? '#10B981' : '#374151', fontSize: 20 }} />
                                <Typography sx={{ color: courseData.tutor_ids.length > 0 ? '#fff' : '#6B7280' }}>Tutor assignment ready</Typography>
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
            <Box
                sx={{
                    p: 4,
                    bgcolor: '#0C1322',
                    minHeight: 'calc(100vh - 70px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <CircularProgress sx={{ color: theme.colors.brand }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                        {isEditMode ? 'Edit Essential Course' : 'Create Essential Course'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        {isEditMode
                            ? 'Update essential course details, tutors, and curriculum.'
                            : 'Build a mandatory essential course and assign tutors to deliver it.'}
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
                                        {isCompleted ? <CheckCircle sx={{ fontSize: 18 }} /> : <StepIcon sx={{ fontSize: 18 }} />}
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography sx={{ color: isActive ? '#fff' : isCompleted ? '#10B981' : '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.2 }}>
                                            {step.label}
                                        </Typography>
                                        <Typography sx={{ color: isActive ? 'rgba(255,255,255,0.7)' : '#6B7280', fontSize: '0.7rem', lineHeight: 1.2 }}>
                                            {step.sublabel}
                                        </Typography>
                                    </Box>
                                </Box>

                                {!isLast && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#374151', flex: 1, justifyContent: 'center', minWidth: 40 }}>
                                        <ChevronRight sx={{ fontSize: 24 }} />
                                    </Box>
                                )}
                            </React.Fragment>
                        );
                    })}
                </Box>
            </Box>

            <Paper sx={{ p: 4, mb: 4, bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                {activeStep === 0 && renderBasicDetails()}
                {activeStep === 1 && renderModules()}
                {activeStep === 2 && renderLessons()}
                {activeStep === 3 && renderReview()}
            </Paper>

            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Stack direction="row" spacing={1}>
                    <Button
                        onClick={() => navigate('/admin/content/essential-courses')}
                        sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                    >
                        Cancel
                    </Button>
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
                            onClick={() => (isEditMode ? handleSubmit(true) : setSubmitModalOpen(true))}
                            endIcon={<Send />}
                            variant="contained"
                            disabled={submitting}
                            sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                        >
                            {isEditMode ? 'Save Changes' : 'Publish Course'}
                        </Button>
                    )}
                </Stack>
            </Stack>

            <Modal open={moduleModalOpen} onClose={() => setModuleModalOpen(false)}>
                <Box sx={modalStyle}>
                    <Box sx={{ background: '${theme.colors.brand} 0%, ${theme.colors.brandHover} 100%)', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>{editingModule ? 'Edit Module' : 'Add Module'}</Typography>
                        <IconButton onClick={() => setModuleModalOpen(false)} sx={{ color: '#fff' }}>
                            <Close />
                        </IconButton>
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
                            <Button onClick={() => setModuleModalOpen(false)} sx={{ color: '#9CA3AF' }}>
                                Cancel
                            </Button>
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

            <Modal open={lessonModalOpen} onClose={() => setLessonModalOpen(false)}>
                <Box sx={{ ...modalStyle, width: { xs: '95vw', sm: '90vw', md: 900 }, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ background: '${theme.colors.brand} 0%, ${theme.colors.brandHover} 100%)', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>{editingLesson ? 'Edit Lesson' : 'Add Lesson'}</Typography>
                        <IconButton onClick={() => setLessonModalOpen(false)} sx={{ color: '#fff' }}>
                            <Close />
                        </IconButton>
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
                                                <Typography sx={{ color: '#fff', fontSize: '0.85rem' }}>{newLesson.fileName}</Typography>
                                                <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Click to change</Typography>
                                            </Stack>
                                        ) : (
                                            <Stack alignItems="center" spacing={1}>
                                                <CloudUpload sx={{ fontSize: 36, color: '#6B7280' }} />
                                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Click to upload video</Typography>
                                                <Typography sx={{ color: '#6B7280', fontSize: '0.7rem' }}>MP4, WebM, MOV (max. 500MB)</Typography>
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
                                                [{ header: [1, 2, 3, false] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ list: 'ordered' }, { list: 'bullet' }],
                                                ['link', 'blockquote', 'code-block'],
                                                ['clean'],
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
                                            if (raw === '') {
                                                setNewLesson({ ...newLesson, durationHours: 0 });
                                                return;
                                            }
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
                                            if (raw === '') {
                                                setNewLesson({ ...newLesson, durationMinutes: 0 });
                                                return;
                                            }
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
                            <Button onClick={() => setLessonModalOpen(false)} sx={{ color: '#9CA3AF' }}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={handleSaveLesson} sx={{ bgcolor: theme.colors.brand }}>
                                {editingLesson ? 'Update' : 'Add Lesson'}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>

            <Modal open={submitModalOpen} onClose={() => setSubmitModalOpen(false)}>
                <Box sx={modalStyle}>
                    <Box sx={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', p: 3 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>Publish Essential Course</Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <Typography sx={{ color: '#9CA3AF', mb: 3 }}>
                            Once published, this essential course will be visible to learners. You can still edit it later.
                            Are you sure you want to publish?
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
                                Publish Course
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>

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
                        {isEditMode ? 'Updating essential course...' : 'Creating essential course...'}
                    </Typography>
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mt: 1 }}>
                        Please wait while we save the course, modules, and lessons.
                    </Typography>
                </Box>
            )}

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

export default CreateEssentialCourse;

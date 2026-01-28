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
import { useNavigate } from 'react-router-dom';
import { textFieldStyle, selectStyle, selectMenuProps, modalStyle } from '../../../styles/formStyles';
import { categoryService } from '../../../services/categoryService';

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
    const [activeStep, setActiveStep] = useState(0);
    const [lastSaved, setLastSaved] = useState(null);
    const [slugEdited, setSlugEdited] = useState(false);
    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

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
        duration_minutes: 0,
        thumbnail_url: '',
        category_id: '',
        status: 'draft',
        is_editable: true,
    });

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
                // Handle both array and object response
                const categoryList = Array.isArray(categoriesData) ? categoriesData : [];
                setCategories(categoryList);
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Keep empty array on error
                setCategories([]);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

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
    const handleAddLesson = (moduleId) => {
        setCurrentModuleId(moduleId);
        setNewLesson({ title: '', type: 'video', content: '', duration: 0 });
        setEditingLesson(null);
        setLessonModalOpen(true);
    };

    const handleSaveLesson = () => {
        if (newLesson.title) {
            setModules(modules.map(m => {
                if (m.id === currentModuleId) {
                    if (editingLesson) {
                        return {
                            ...m,
                            lessons: m.lessons.map(l =>
                                l.id === editingLesson.id ? { ...l, ...newLesson } : l
                            ),
                        };
                    } else {
                        return {
                            ...m,
                            lessons: [...(m.lessons || []), { id: Date.now(), ...newLesson }],
                        };
                    }
                }
                return m;
            }));
            setLessonModalOpen(false);
            setNewLesson({ title: '', type: 'video', content: '', duration: 0 });
        }
    };

    const handleEditLesson = (moduleId, lesson) => {
        setCurrentModuleId(moduleId);
        setEditingLesson(lesson);
        setNewLesson({ title: lesson.title, type: lesson.type, content: lesson.content, duration: lesson.duration });
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

    const handleSubmit = (asDraft = true) => {
        if (!asDraft) {
            if (!validateStep(3)) return;
            setCourseData(prev => ({
                ...prev,
                status: 'pending_approval',
                is_editable: false,
            }));
        }
        setSubmitModalOpen(false);
        navigate('/tutor/courses');
    };

    const getLessonTypeIcon = (type) => {
        switch (type) {
            case 'video': return <PlayCircleOutline sx={{ fontSize: 18 }} />;
            case 'text': return <ArticleOutlined sx={{ fontSize: 18 }} />;
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
                            placeholder="e.g. Introduction to Public Ethics 101"
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
                                        stroke: '#1152D4',
                                    },
                                    '& button.ql-active .ql-fill': {
                                        fill: '#1152D4',
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
                                    border: courseData.thumbnail_url ? '2px solid #1152D4' : '2px dashed #374151',
                                    borderRadius: 2,
                                    p: courseData.thumbnail_url ? 0 : 4,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s',
                                    '&:hover': { borderColor: '#1152D4' },
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
                                onClick={() => handleInputChange('thumbnail_url', '')}
                                sx={{ mt: 1, color: '#EF4444', fontSize: '0.75rem' }}
                            >
                                Remove Image
                            </Button>
                        )}
                    </Box>

                    {/* Tutor Tips */}
                    <Paper sx={{ bgcolor: '#1A2230', border: '1px solid #374151', borderRadius: 2, p: 2.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                            <Info sx={{ color: '#1152D4', fontSize: 18 }} />
                            <Typography sx={{ color: '#1152D4', fontWeight: 600, fontSize: '0.85rem' }}>
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
                    sx={{ bgcolor: '#1152D4', '&:hover': { bgcolor: '#0D42AF' } }}
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
                        sx={{ color: '#1152D4', borderColor: '#1152D4' }}
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
                                        sx={{ mt: 1, color: '#1152D4', borderColor: '#374151', '&:hover': { borderColor: '#1152D4' } }}
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
                                sx={{ mt: 2, color: '#1152D4', borderColor: '#374151' }}
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
                        </Stack>
                    </Paper>

                    {/* Curriculum Summary */}
                    <Paper sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151', p: 3 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>Curriculum Summary</Typography>
                        <Stack direction="row" spacing={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography sx={{ color: '#1152D4', fontSize: '2rem', fontWeight: 700 }}>{modules.length}</Typography>
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

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                        Create New Course
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Share your expertise in governance and policy.
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
                                        bgcolor: isActive ? '#1152D4' : 'transparent',
                                        cursor: isCompleted ? 'pointer' : 'default',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: isCompleted && !isActive ? 'rgba(17, 82, 212, 0.15)' : isActive ? '#1152D4' : 'transparent',
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
            <Stack direction="row" justifyContent="space-between">
                <Button
                    onClick={() => navigate('/tutor/courses')}
                    sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                >
                    Cancel
                </Button>
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
                            sx={{ bgcolor: '#1152D4', '&:hover': { bgcolor: '#0D42AF' } }}
                        >
                            Continue to {steps[activeStep + 1].sublabel}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setSubmitModalOpen(true)}
                            endIcon={<Send />}
                            variant="contained"
                            sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                        >
                            Submit for Approval
                        </Button>
                    )}
                </Stack>
            </Stack>

            {/* Module Modal */}
            <Modal open={moduleModalOpen} onClose={() => setModuleModalOpen(false)}>
                <Box sx={modalStyle}>
                    <Box sx={{ background: 'linear-gradient(135deg, #1152D4 0%, #0D42AF 100%)', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                sx={{ bgcolor: '#1152D4' }}
                            >
                                {editingModule ? 'Update' : 'Add Module'}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>

            {/* Lesson Modal */}
            <Modal open={lessonModalOpen} onClose={() => setLessonModalOpen(false)}>
                <Box sx={modalStyle}>
                    <Box sx={{ background: 'linear-gradient(135deg, #1152D4 0%, #0D42AF 100%)', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>{editingLesson ? 'Edit Lesson' : 'Add Lesson'}</Typography>
                        <IconButton onClick={() => setLessonModalOpen(false)} sx={{ color: '#fff' }}><Close /></IconButton>
                    </Box>
                    <Box sx={{ p: 3 }}>
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
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Lesson Type</Typography>
                                <Select
                                    fullWidth
                                    value={newLesson.type}
                                    onChange={(e) => setNewLesson({ ...newLesson, type: e.target.value, content: '' })}
                                    sx={selectStyle}
                                    MenuProps={selectMenuProps}
                                >
                                    <MenuItem value="video">Video</MenuItem>
                                    <MenuItem value="text">Text/Article</MenuItem>
                                    <MenuItem value="file">File Attachment</MenuItem>
                                </Select>
                            </Box>

                            {/* Content based on type */}
                            {newLesson.type === 'video' && (
                                <Box>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Upload Video</Typography>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        style={{ display: 'none' }}
                                        id="lesson-video-upload"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setNewLesson({ ...newLesson, content: file.name, fileName: file.name });
                                            }
                                        }}
                                    />
                                    <label htmlFor="lesson-video-upload">
                                        <Box
                                            sx={{
                                                bgcolor: '#1E293B',
                                                border: newLesson.content ? '2px solid #10B981' : '2px dashed #374151',
                                                borderRadius: 2,
                                                p: 3,
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                '&:hover': { borderColor: '#1152D4' },
                                            }}
                                        >
                                            {newLesson.content ? (
                                                <Stack alignItems="center" spacing={1}>
                                                    <PlayCircleOutline sx={{ fontSize: 36, color: '#10B981' }} />
                                                    <Typography sx={{ color: '#fff', fontSize: '0.85rem' }}>
                                                        {newLesson.fileName || newLesson.content}
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
                                </Box>
                            )}

                            {newLesson.type === 'text' && (
                                <Box>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Article Content</Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={6}
                                        placeholder="Write your lesson content here..."
                                        value={newLesson.content}
                                        onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                                        sx={textFieldStyle}
                                    />
                                </Box>
                            )}

                            {newLesson.type === 'file' && (
                                <Box>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Upload File</Typography>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                                        style={{ display: 'none' }}
                                        id="lesson-file-upload"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setNewLesson({ ...newLesson, content: file.name, fileName: file.name });
                                            }
                                        }}
                                    />
                                    <label htmlFor="lesson-file-upload">
                                        <Box
                                            sx={{
                                                bgcolor: '#1E293B',
                                                border: newLesson.content ? '2px solid #10B981' : '2px dashed #374151',
                                                borderRadius: 2,
                                                p: 3,
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                '&:hover': { borderColor: '#1152D4' },
                                            }}
                                        >
                                            {newLesson.content ? (
                                                <Stack alignItems="center" spacing={1}>
                                                    <AttachFile sx={{ fontSize: 36, color: '#10B981' }} />
                                                    <Typography sx={{ color: '#fff', fontSize: '0.85rem' }}>
                                                        {newLesson.fileName || newLesson.content}
                                                    </Typography>
                                                    <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                                        Click to change
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                <Stack alignItems="center" spacing={1}>
                                                    <CloudUpload sx={{ fontSize: 36, color: '#6B7280' }} />
                                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                                                        Click to upload file
                                                    </Typography>
                                                    <Typography sx={{ color: '#6B7280', fontSize: '0.7rem' }}>
                                                        PDF, DOC, PPT, XLS, ZIP
                                                    </Typography>
                                                </Stack>
                                            )}
                                        </Box>
                                    </label>
                                </Box>
                            )}

                            <Box>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Duration (minutes)</Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    value={newLesson.duration}
                                    onChange={(e) => setNewLesson({ ...newLesson, duration: parseInt(e.target.value) || 0 })}
                                    sx={textFieldStyle}
                                />
                            </Box>
                        </Stack>
                        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                            <Button onClick={() => setLessonModalOpen(false)} sx={{ color: '#9CA3AF' }}>Cancel</Button>
                            <Button variant="contained" onClick={handleSaveLesson} sx={{ bgcolor: '#1152D4' }}>
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
        </Box>
    );
};

export default CreateCourse;
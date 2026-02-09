import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Stack,
    Paper,
    Chip,
    IconButton,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemButton,
    Divider,
    Tabs,
    Tab,
    TextField,
    Select,
    MenuItem,
    Snackbar,
    Alert,
    Modal,
} from '@mui/material';
import {
    ArrowBack,
    Add,
    Edit,
    Delete,
    ExpandMore,
    AccessTime,
    PlayCircleOutline,
    ArticleOutlined,
    AttachFile,
    MoreVert,
    Category,
    Language,
    Timer,
    School,
    Image,
    Description,
    Publish,
    Archive,
    Close,
    CloudUpload,
    Payments,
    History,
} from '@mui/icons-material';
import { tutorCoursesService } from '../services/courseService';
import { formatCurrency } from '../../../utils';
import { tutorModuleService } from '../services/moduleService';
import { tutorLessonService } from '../services/lessonService';
import { tutorQuestionService } from '../services/questionService';
import { modalStyle, textFieldStyle, selectStyle, selectMenuProps } from '../../../styles/formStyles';

/**
 * @param {string} type 
 */
const getLessonIcon = (type) => {
    switch (type) {
        case 'video': return <PlayCircleOutline />;
        case 'reading':
        case 'text': return <ArticleOutlined />;
        case 'file':
        case 'document': return <AttachFile />;
        default: return <ArticleOutlined />;
    }
};

const CourseDashboard = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    // State
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    // Module / Lesson modal state
    const [moduleModalOpen, setModuleModalOpen] = useState(false);
    const [moduleTitle, setModuleTitle] = useState('');
    const [moduleDescription, setModuleDescription] = useState('');
    const [lessonModalOpen, setLessonModalOpen] = useState(false);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonType, setLessonType] = useState('video');
    const [lessonDuration, setLessonDuration] = useState(0);
    const [lessonContent, setLessonContent] = useState('');
    const [lessonFileName, setLessonFileName] = useState('');
    const [lessonFile, setLessonFile] = useState(null);
    const [selectedModuleForLesson, setSelectedModuleForLesson] = useState(null);

    // Price change state
    const [priceChangeModalOpen, setPriceChangeModalOpen] = useState(false);
    const [pendingPriceChange, setPendingPriceChange] = useState(null);
    const [priceChangeData, setPriceChangeData] = useState({
        new_amount: '',
        new_currency: 'USD',
        reason: ''
    });

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                setError(null);

                const courseData = await tutorCoursesService.getCourseDetail(courseId);
                setCourse(courseData);

                try {
                    const modulesResponse = await tutorModuleService.listModules(courseId);
                    const rawModules = modulesResponse?.data ?? modulesResponse ?? [];

                    const modulesWithLessons = await Promise.all(
                        rawModules.map(async (m) => {
                            try {
                                const lessonsResp = await tutorLessonService.listLessons(m.id);
                                const lessons = lessonsResp?.data ?? [];
                                return { ...m, lessons };
                            } catch (e) {
                                console.warn(`Failed to load lessons for module ${m.id}`, e);
                                setSnackbar({ open: true, message: "Failed to load lessons (check login/token)", severity: "error" });
                                return { ...m, lessons: [] };
                            }
                        })
                    );

                    setModules(modulesWithLessons);
                } catch (modErr) {
                    console.warn('Could not fetch modules:', modErr);
                    setModules([]);
                }

                try {
                    const changesResp = await tutorCoursesService.listPriceChanges({ status: 'pending' });
                    const pending = (changesResp?.data || changesResp || []).find(r => r.course_id === courseId);
                    setPendingPriceChange(pending || null);
                } catch (e) {
                    console.warn('Could not fetch price changes:', e);
                }
            } catch (err) {
                console.error("Error fetching course:", err);
                setError("Failed to load course details.");
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const handleBack = () => {
        navigate('/tutor/courses');
    };

    const handleRequestPriceChange = async () => {
        if (!priceChangeData.new_amount || !priceChangeData.reason) {
            setSnackbar({ open: true, message: 'Please fill in all fields', severity: 'warning' });
            return;
        }

        try {
            setActionLoading(true);
            await tutorCoursesService.requestPriceChange(courseId, {
                new_amount: parseFloat(priceChangeData.new_amount),
                new_currency: priceChangeData.new_currency,
                reason: priceChangeData.reason
            });
            setSnackbar({ open: true, message: 'Price change requested successfully. Awaiting admin approval.', severity: 'success' });
            setPriceChangeModalOpen(false);
            setPriceChangeData({ new_amount: '', new_currency: 'USD', reason: '' });
        } catch (err) {
            console.error('Failed to request price change:', err);
            setSnackbar({ open: true, message: err.message || 'Failed to request price change', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Publish a lesson
     */
    const handlePublishLesson = async (moduleId, lessonId) => {
        try {
            setActionLoading(true);
            const updated = await tutorLessonService.publishLesson(moduleId, lessonId);
            setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: (m.lessons || []).map(l => l.id === lessonId ? updated : l) } : m));
            setSnackbar({ open: true, message: 'Lesson published', severity: 'success' });
        } catch (err) {
            console.error('Error publishing lesson:', err);
            const message = err?.data?.message || err.message || 'Failed to publish lesson';
            setSnackbar({ open: true, message, severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Unpublish a lesson
     */
    const handleUnpublishLesson = async (moduleId, lessonId) => {
        try {
            setActionLoading(true);
            const updated = await tutorLessonService.unpublishLesson(moduleId, lessonId);
            setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: (m.lessons || []).map(l => l.id === lessonId ? updated : l) } : m));
            setSnackbar({ open: true, message: 'Lesson unpublished', severity: 'success' });
        } catch (err) {
            console.error('Error unpublishing lesson:', err);
            const message = err?.data?.message || err.message || 'Failed to unpublish lesson';
            setSnackbar({ open: true, message, severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleLessonNavigate = (moduleId, lessonId) => {
        navigate(`/tutor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
    };

    const refreshModuleLessonsWithRetry = async (moduleId, createdId, maxAttempts = 6, delayMs = 1000) => {
        const wait = (ms) => new Promise(res => setTimeout(res, ms));
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const lessonsResp = await tutorLessonService.listLessons(moduleId);
                const lessons = lessonsResp.data;
                console.debug(`Retry attempt ${i + 1} for module ${moduleId}:`, lessons);
                if (createdId && lessons.find(l => l.id === createdId)) {
                    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons } : m));
                    return lessons;
                }
                if (i === maxAttempts - 1) {
                    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons } : m));
                    return lessons;
                }
            } catch (e) {
                console.warn('Error listing lessons during retry:', e);
            }
            await wait(delayMs);
        }
        return null;
    };

    /**
     * Publishes the course
     */
    const handlePublish = async () => {
        try {
            setActionLoading(true);
            await tutorCoursesService.publishCourse(courseId);
            setCourse(prev => ({ ...prev, status: 'published', is_published: true }));
            setSnackbar({ open: true, message: 'Course published successfully!', severity: 'success' });
        } catch (err) {
            console.error('Error publishing course:', err);
            setSnackbar({ open: true, message: err.message || 'Failed to publish course', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Unpublishes the course
     */
    const handleUnpublish = async () => {
        try {
            setActionLoading(true);
            await tutorCoursesService.unpublishCourse(courseId);
            setCourse(prev => ({ ...prev, status: 'draft', is_published: false }));
            setSnackbar({ open: true, message: 'Course unpublished successfully!', severity: 'success' });
        } catch (err) {
            console.error('Error unpublishing course:', err);
            setSnackbar({ open: true, message: err.message || 'Failed to unpublish course', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Archives the course
     */
    const handleArchive = async () => {
        if (!window.confirm('Are you sure you want to archive this course?')) return;
        try {
            setActionLoading(true);
            await tutorCoursesService.archiveCourse(courseId);
            setCourse(prev => ({ ...prev, status: 'archived' }));
            setSnackbar({ open: true, message: 'Course archived successfully!', severity: 'success' });
        } catch (err) {
            console.error('Error archiving course:', err);
            setSnackbar({ open: true, message: err.message || 'Failed to archive course', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Deletes the course
     */
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
        try {
            setActionLoading(true);
            await tutorCoursesService.deleteCourse(courseId);
            setSnackbar({ open: true, message: 'Course deleted successfully!', severity: 'success' });
            setTimeout(() => navigate('/tutor/courses'), 1500);
        } catch (err) {
            console.error('Error deleting course:', err);
            setSnackbar({ open: true, message: err.message || 'Failed to delete course', severity: 'error' });
            setActionLoading(false);
        }
    };

    /**
     * Publish a module
     */
    const handlePublishModule = async (moduleId) => {
        try {
            setActionLoading(true);
            const updated = await tutorModuleService.publishModule(courseId, moduleId);
            // Preserve existing lessons array when replacing with updated module
            setModules(prev => prev.map(m => (m.id === moduleId ? { ...updated, lessons: m.lessons || updated.lessons || [] } : m)));
            setSnackbar({ open: true, message: 'Module published', severity: 'success' });
        } catch (err) {
            console.error('Error publishing module:', err);
            const message = err?.data?.message || err.message || 'Failed to publish module';
            setSnackbar({ open: true, message, severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Unpublish a module
     */
    const handleUnpublishModule = async (moduleId) => {
        try {
            setActionLoading(true);
            const updated = await tutorModuleService.unpublishModule(courseId, moduleId);
            // Preserve existing lessons array when replacing with updated module
            setModules(prev => prev.map(m => (m.id === moduleId ? { ...updated, lessons: m.lessons || updated.lessons || [] } : m)));
            setSnackbar({ open: true, message: 'Module unpublished', severity: 'success' });
        } catch (err) {
            console.error('Error unpublishing module:', err);
            const message = err?.data?.message || err.message || 'Failed to unpublish module';
            setSnackbar({ open: true, message, severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Create a module inline via modal
     */
    const handleCreateModule = async () => {
        if (!String(moduleTitle).trim()) {
            setSnackbar({ open: true, message: 'Module title is required', severity: 'error' });
            return;
        }
        try {
            setActionLoading(true);
            const payload = { title: moduleTitle.trim(), description: moduleDescription, position: (modules.length || 0) + 1 };
            const created = await tutorModuleService.createModule(courseId, payload);
            // Append to modules list (ensure lessons array exists)
            setModules(prev => [...prev, { ...created, lessons: created.lessons || [] }]);
            setModuleModalOpen(false);
            setModuleTitle('');
            setModuleDescription('');
            setSnackbar({ open: true, message: 'Module created', severity: 'success' });
        } catch (err) {
            console.error('Error creating module:', err);
            // Try to show validation errors returned by API
            const apiData = err?.data || err?.response || null;
            let message = err.message || 'Failed to create module';
            if (apiData) {
                if (apiData.message) message = apiData.message;
                if (apiData.errors) {
                    // join first-level error messages
                    try {
                        const errs = Object.values(apiData.errors).flat().slice(0, 3);
                        if (errs.length) message = errs.join(' ');
                    } catch (e) { }
                }
            }
            setSnackbar({ open: true, message, severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Create a lesson inline via modal
     */
    const handleCreateLesson = async () => {
        if (!selectedModuleForLesson) return;
        const trimmedTitle = String(lessonTitle).trim();
        if (!trimmedTitle) {
            setSnackbar({ open: true, message: 'Lesson title is required', severity: 'error' });
            return;
        }

        if (!lessonType) {
            setSnackbar({ open: true, message: 'Please select a lesson type', severity: 'error' });
            return;
        }

        // Type-specific validation
        if (lessonType === 'text') {
            if (!String(lessonContent).trim()) {
                setSnackbar({ open: true, message: 'Please provide article content', severity: 'error' });
                return;
            }
        }

        if (lessonType === 'video') {
            const hasUrl = /^https?:\/\//.test(String(lessonContent).trim());
            const hasFile = !!lessonFile;
            if (!hasUrl && !hasFile) {
                setSnackbar({ open: true, message: 'Upload a video file or paste a video URL', severity: 'error' });
                return;
            }
        }

        if (lessonType === 'document') {
            if (!lessonFile) {
                setSnackbar({ open: true, message: 'Please upload a file', severity: 'error' });
                return;
            }
        }

        try {
            setActionLoading(true);
            // find module to determine position
            const mod = modules.find(m => m.id === selectedModuleForLesson) || { lessons: [] };
            const position = (mod.lessons?.length || 0);
            // Map UI lesson types to API types and payload shape
            const mapType = (t) => {
                if (t === 'text' || t === 'reading') return 'article';
                if (t === 'document') return 'document';
                if (t === 'quiz') return 'quiz';
                return t || 'article';
            };

            const apiType = mapType(lessonType);

            const payload = { title: trimmedTitle, type: apiType, position: position + 1 };

            // Duration field expected as `duration_minutes`
            if (lessonDuration) payload.duration_minutes = parseInt(lessonDuration) || 0;

            // Content fields per type
            if (apiType === 'article') {
                payload.content = lessonContent.trim();
            } else if (apiType === 'video') {
                // If user supplied a URL, use it; otherwise, if a file was selected we set a placeholder filename
                if (/^https?:\/\//.test(lessonContent.trim())) {
                    payload.video_url = lessonContent.trim();
                } else if (lessonFileName) {
                    // File upload not implemented here; include filename as summary placeholder
                    payload.video_url = null;
                    payload.summary = lessonFileName;
                }
            } else if (apiType === 'quiz') {
                // For quiz, allow settings (e.g., pass_percent) if provided in content as JSON
                try {
                    const parsed = JSON.parse(lessonContent);
                    if (parsed && typeof parsed === 'object') payload.settings = parsed;
                } catch (e) {
                    // ignore parse error
                }
            } else if (apiType === 'document') {
                if (lessonFileName) {
                    payload.resource_url = null;
                    payload.summary = lessonFileName;
                } else {
                    payload.content = lessonContent.trim();
                }
            }

            const created = await tutorLessonService.createLesson(selectedModuleForLesson, payload);
            console.debug('Lesson create response:', created);

            // After creation (and optional upload), refresh the module from server so we reflect persisted state.
            try {
                if (lessonFile && (apiType === 'video' || apiType === 'document')) {
                    const formData = new FormData();
                    formData.append('file', lessonFile);
                    const uploadRes = await tutorLessonService.uploadLessonMedia(created.id, formData);
                    console.debug('Lesson upload response:', uploadRes);
                }

                // Use retry helper to ensure the created lesson appears for the module (handles eventual consistency)
                try {
                    await refreshModuleLessonsWithRetry(selectedModuleForLesson, created.id, 6, 1000);

                    // Also refresh module list metadata and merge lessons we have for the created module
                    try {

                    } catch (metaErr) {
                        console.warn('Could not refresh modules metadata after retry:', metaErr);
                    }
                } catch (retryErr) {
                    console.warn('Retry refresh failed, falling back to local insert:', retryErr);
                    setModules(prev => prev.map(m => m.id === selectedModuleForLesson ? { ...m, lessons: [...(m.lessons || []), created] } : m));
                }
            } catch (uploadErr) {
                console.error('Error uploading lesson media or refreshing module:', uploadErr);
                setSnackbar({ open: true, message: uploadErr?.data?.message || uploadErr.message || 'Failed to upload media', severity: 'error' });
                // still insert the created lesson without media as a fallback
                setModules(prev => prev.map(m => m.id === selectedModuleForLesson ? { ...m, lessons: [...(m.lessons || []), created] } : m));
            }

            setLessonModalOpen(false);
            setSelectedModuleForLesson(null);
            setLessonTitle('');
            setLessonType('video');
            setLessonDuration(0);
            setLessonContent('');
            setLessonFileName('');
            setLessonFile(null);
            setSnackbar({ open: true, message: 'Lesson created', severity: 'success' });
        } catch (err) {
            console.error('Error creating lesson:', err);
            setSnackbar({ open: true, message: err.message || 'Failed to create lesson', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Open question management for a lesson
     */
    const handleOpenQuestionsModal = (moduleId, lessonId) => {
        navigate(`/tutor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/questions`);
    };


    // Loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#080D19' }}>
                <CircularProgress sx={{ color: '#1152D4' }} />
            </Box>
        );
    }

    // Error state
    if (error || !course) {
        return (
            <Box sx={{ p: 4, bgcolor: '#080D19', minHeight: '100vh', color: '#fff' }}>
                <Typography color="error">{error || "Course not found"}</Typography>
                <Button onClick={handleBack} sx={{ mt: 2, color: '#fff' }}>Back to Courses</Button>
            </Box>
        );
    }

    // Derived state
    const published = course.status === 'published' || course.status === 'active' || course.is_published;
    const totalLessons = modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0);

    return (
        <Box sx={{ bgcolor: '#0C1322', minHeight: '100vh', color: '#fff' }}>
            {/* Top Toolbar */}
            <Box sx={{
                px: 4,
                py: 2,
                borderBottom: '1px solid #1F2937',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: '#0C1322'
            }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <IconButton onClick={handleBack} sx={{ color: '#9CA3AF' }}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {course.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                            <Chip
                                label={published ? "Published" : course.status || "Draft"}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: published ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                    color: published ? '#10B981' : '#F59E0B',
                                    textTransform: 'capitalize',
                                }}
                            />
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                Last updated {course.updated_at ? new Date(course.updated_at).toLocaleDateString() : '-'}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        onClick={() => window.open(`/courses/${courseId}/preview`, '_blank')}
                        sx={{
                            borderColor: '#374151',
                            color: '#fff',
                            textTransform: 'none',
                            '&:hover': { borderColor: '#6B7280' }
                        }}
                    >
                        Preview
                    </Button>
                    <Button
                        variant="contained"
                        onClick={published ? handleUnpublish : handlePublish}
                        disabled={actionLoading || course.status === 'pending'}
                        sx={{
                            bgcolor: published ? '#F59E0B' : (course.status === 'pending' ? '#4B5563' : '#1152D4'),
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: published ? '#D97706' : (course.status === 'pending' ? '#4B5563' : '#0D42AF') }
                        }}
                    >
                        {actionLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> :
                            published ? 'Unpublish' :
                                (course.status === 'pending' ? 'Under Review' : 'Publish Course')
                        }
                    </Button>
                </Stack>
            </Box>

            {/* Rejection Alert */}
            {course.status === 'draft' && course.meta && course.meta.review && course.meta.review.reason && (
                <Box sx={{ p: 4, pb: 0 }}>
                    <Alert
                        severity="error"
                        variant="filled" // High visibility
                        sx={{
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                            color: '#EF4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            '& .MuiAlert-icon': { color: '#EF4444' }
                        }}
                    >
                        <Typography variant="subtitle2" fontWeight="bold">Course Rejected</Typography>
                        <Typography variant="body2">{course.meta.review.reason}</Typography>
                    </Alert>
                </Box>
            )}

            {/* Custom Tabs */}
            <Box sx={{ px: 4, pt: 2, borderBottom: '1px solid #1F2937', bgcolor: '#0C1322' }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, v) => setActiveTab(v)}
                    sx={{
                        '& .MuiTab-root': {
                            color: '#9CA3AF',
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            minHeight: 48,
                            '&.Mui-selected': { color: '#3B82F6' }
                        },
                        '& .MuiTabs-indicator': { bgcolor: '#3B82F6' }
                    }}
                >
                    <Tab label="Curriculum" />
                    <Tab label="Course Details" />
                    <Tab label="Settings" />
                </Tabs>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ maxWidth: 1000, mx: 'auto', p: 4 }}>

                {/* CURRICULUM TAB */}
                {activeTab === 0 && (
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Course Content ({modules.length} modules, {totalLessons} lessons)
                            </Typography>
                            <Button
                                startIcon={<Add />}
                                variant="contained"
                                onClick={() => setModuleModalOpen(true)}
                                sx={{ bgcolor: '#1152D4', textTransform: 'none', '&:hover': { bgcolor: '#0D42AF' } }}
                            >
                                Add Module
                            </Button>
                        </Stack>

                        {modules && modules.length > 0 ? (
                            <Stack spacing={2}>
                                {modules.map((mod, index) => (
                                    <Paper
                                        key={mod.id}
                                        sx={{
                                            bgcolor: '#1A2230',
                                            borderRadius: 2,
                                            border: '1px solid #1F2937',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Accordion
                                            defaultExpanded={index === 0}
                                            disableGutters
                                            sx={{ bgcolor: 'transparent', boxShadow: 'none', '&:before': { display: 'none' } }}
                                        >
                                            <AccordionSummary
                                                component="div"
                                                expandIcon={<ExpandMore sx={{ color: '#6B7280' }} />}
                                            >
                                                <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 2 }}>
                                                    <Typography sx={{ color: '#E5E7EB', fontWeight: 600 }}>
                                                        Module {index + 1}: {mod.title}
                                                    </Typography>
                                                    <Chip
                                                        label={`${mod.lessons?.length || 0} lessons`}
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#9CA3AF', height: 20, fontSize: '0.7rem' }}
                                                    />
                                                    <Box sx={{ flex: 1 }} />
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => { e.stopPropagation(); mod.is_published ? handleUnpublishModule(mod.id) : handlePublishModule(mod.id); }}
                                                        sx={{ color: mod.is_published ? '#10B981' : '#6B7280' }}
                                                    >
                                                        <Publish fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={(e) => e.stopPropagation()} sx={{ color: '#6B7280' }}>
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                                                {mod.summary && (
                                                    <Typography sx={{ color: '#6B7280', fontSize: '0.85rem', mb: 2, px: 2 }}>
                                                        {mod.summary}
                                                    </Typography>
                                                )}
                                                <List disablePadding>
                                                    {mod.lessons && mod.lessons.length > 0 ? mod.lessons.map((lesson, lIndex) => (
                                                        <ListItem key={lesson.id} disablePadding sx={{ mb: 1 }}>
                                                            <ListItemButton
                                                                component="div"
                                                                onClick={() => handleLessonNavigate(mod.id, lesson.id)}
                                                                sx={{
                                                                    bgcolor: '#0F172A',
                                                                    borderRadius: 1,
                                                                    border: '1px solid transparent',
                                                                    '&:hover': {
                                                                        bgcolor: '#1E293B',
                                                                        borderColor: 'rgba(59, 130, 246, 0.3)'
                                                                    },
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    px: 1
                                                                }}
                                                            >
                                                                <ListItemIcon sx={{ minWidth: 40, color: '#3B82F6' }}>
                                                                    {getLessonIcon(lesson.type)}
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={lesson.title}
                                                                    secondary={
                                                                        <Typography variant="caption" sx={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            {lesson.type || 'Lesson'} • {lesson.duration || lesson.duration_minutes || 0} min
                                                                        </Typography>
                                                                    }
                                                                    primaryTypographyProps={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}
                                                                />
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => { e.stopPropagation(); lesson.is_published ? handleUnpublishLesson(mod.id, lesson.id) : handlePublishLesson(mod.id, lesson.id); }}
                                                                    sx={{ color: lesson.is_published ? '#10B981' : '#6B7280', mr: 1 }}
                                                                >
                                                                    <Publish fontSize="small" />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => { e.stopPropagation(); handleOpenQuestionsModal(mod.id, lesson.id); }}
                                                                    sx={{ color: '#3B82F6', mr: 1 }}
                                                                    title="Manage questions"
                                                                >
                                                                    <School fontSize="small" />
                                                                </IconButton>
                                                                <IconButton size="small" sx={{ color: '#6B7280' }}>
                                                                    <Edit fontSize="small" />
                                                                </IconButton>
                                                            </ListItemButton>
                                                        </ListItem>
                                                    )) : (
                                                        <Typography sx={{ color: '#6B7280', textAlign: 'center', py: 2 }}>
                                                            No lessons in this module yet
                                                        </Typography>
                                                    )}
                                                </List>
                                                <Button
                                                    fullWidth
                                                    startIcon={<Add />}
                                                    onClick={() => { setSelectedModuleForLesson(mod.id); setLessonTitle(''); setLessonContent(''); setLessonModalOpen(true); }}
                                                    sx={{
                                                        mt: 1,
                                                        color: '#3B82F6',
                                                        bgcolor: 'rgba(59, 130, 246, 0.05)',
                                                        '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' },
                                                        textTransform: 'none'
                                                    }}
                                                >
                                                    Add Lesson
                                                </Button>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Paper>
                                ))}
                            </Stack>
                        ) : (
                            <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#1A2230', border: '1px dashed #374151', borderRadius: 2 }}>
                                <School sx={{ fontSize: 60, color: '#374151', mb: 2 }} />
                                <Typography sx={{ color: '#9CA3AF', mb: 2 }}>
                                    No modules created yet.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={() => setModuleModalOpen(true)}
                                    sx={{ borderColor: '#374151', color: '#9CA3AF' }}
                                >
                                    Create First Module
                                </Button>
                            </Paper>
                        )}
                    </Box>
                )}

                {/* DETAILS TAB */}
                {activeTab === 1 && (
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Course Details</Typography>

                        <Stack spacing={3}>
                            {/* Thumbnail */}
                            {course.thumbnail_url && (
                                <Paper sx={{ bgcolor: '#1A2230', p: 2, borderRadius: 2, border: '1px solid #1F2937' }}>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Thumbnail</Typography>
                                    <Box
                                        component="img"
                                        src={course.thumbnail_url}
                                        alt="Course thumbnail"
                                        sx={{ width: '100%', maxWidth: 400, borderRadius: 1 }}
                                    />
                                </Paper>
                            )}

                            {/* Basic Info */}
                            <Paper sx={{ bgcolor: '#1A2230', p: 3, borderRadius: 2, border: '1px solid #1F2937' }}>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Basic Information</Typography>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Title</Typography>
                                        <Typography sx={{ color: '#fff', fontWeight: 500 }}>{course.title}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Slug</Typography>
                                        <Typography sx={{ color: '#9CA3AF' }}>{course.slug || '-'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Summary</Typography>
                                        <Typography sx={{ color: '#9CA3AF' }}>{course.summary || '-'}</Typography>
                                    </Box>
                                    {course.description && (
                                        <Box>
                                            <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Description</Typography>
                                            <Typography
                                                sx={{ color: '#9CA3AF' }}
                                                dangerouslySetInnerHTML={{ __html: course.description }}
                                            />
                                        </Box>
                                    )}
                                </Stack>
                            </Paper>

                            {/* Course Attributes */}
                            <Paper sx={{ bgcolor: '#1A2230', p: 3, borderRadius: 2, border: '1px solid #1F2937' }}>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Course Attributes</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                    <Box sx={{ minWidth: 150 }}>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                            <School sx={{ fontSize: 16, color: '#6B7280' }} />
                                            <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Level</Typography>
                                        </Stack>
                                        <Typography sx={{ color: '#fff', textTransform: 'capitalize' }}>{course.level || '-'}</Typography>
                                    </Box>
                                    <Box sx={{ minWidth: 150 }}>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                            <Language sx={{ fontSize: 16, color: '#6B7280' }} />
                                            <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Language</Typography>
                                        </Stack>
                                        <Typography sx={{ color: '#fff', textTransform: 'uppercase' }}>{course.language || '-'}</Typography>
                                    </Box>
                                    <Box sx={{ minWidth: 150 }}>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                            <Timer sx={{ fontSize: 16, color: '#6B7280' }} />
                                            <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Duration</Typography>
                                        </Stack>
                                        <Typography sx={{ color: '#fff' }}>{course.duration_minutes || 0} minutes</Typography>
                                    </Box>
                                    <Box sx={{ minWidth: 150 }}>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                            <Payments sx={{ fontSize: 16, color: '#6B7280' }} />
                                            <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Price</Typography>
                                        </Stack>
                                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                            {course.price > 0
                                                ? formatCurrency(course.price, course.currency)
                                                : 'Free'}
                                        </Typography>
                                        {pendingPriceChange && (
                                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: '#3B82F6', mt: 0.5 }}>
                                                <History sx={{ fontSize: 12 }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                    {formatCurrency(pendingPriceChange.new_amount, pendingPriceChange.new_currency)}
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Box>
                                </Box>
                            </Paper>

                            {/* Categories */}
                            {course.categories && course.categories.length > 0 && (
                                <Paper sx={{ bgcolor: '#1A2230', p: 3, borderRadius: 2, border: '1px solid #1F2937' }}>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Categories</Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {course.categories.map(cat => (
                                            <Chip
                                                key={cat.id}
                                                label={cat.name}
                                                size="small"
                                                sx={{ bgcolor: '#374151', color: '#9CA3AF' }}
                                            />
                                        ))}
                                    </Stack>
                                </Paper>
                            )}

                            {/* Timestamps */}
                            <Paper sx={{ bgcolor: '#1A2230', p: 3, borderRadius: 2, border: '1px solid #1F2937' }}>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Timestamps</Typography>
                                <Stack direction="row" spacing={4}>
                                    <Box>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Created</Typography>
                                        <Typography sx={{ color: '#9CA3AF' }}>
                                            {course.created_at ? new Date(course.created_at).toLocaleString() : '-'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Updated</Typography>
                                        <Typography sx={{ color: '#9CA3AF' }}>
                                            {course.updated_at ? new Date(course.updated_at).toLocaleString() : '-'}
                                        </Typography>
                                    </Box>
                                    {course.published_at && (
                                        <Box>
                                            <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Published</Typography>
                                            <Typography sx={{ color: '#9CA3AF' }}>
                                                {new Date(course.published_at).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Paper>
                        </Stack>
                    </Box>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 2 && (
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Course Settings</Typography>

                        <Stack spacing={3}>
                            {/* Publication Status */}
                            <Paper sx={{ bgcolor: '#1A2230', p: 3, borderRadius: 2, border: '1px solid #1F2937' }}>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Publication Status</Typography>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                                            {published ? 'Course is Published' : 'Course is Draft'}
                                        </Typography>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>
                                            {published
                                                ? 'This course is visible to learners and can be enrolled.'
                                                : 'This course is not yet visible to learners.'}
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        startIcon={<Publish />}
                                        onClick={published ? handleUnpublish : handlePublish}
                                        disabled={actionLoading}
                                        sx={{
                                            bgcolor: published ? '#F59E0B' : '#10B981',
                                            textTransform: 'none',
                                            '&:hover': { bgcolor: published ? '#D97706' : '#059669' }
                                        }}
                                    >
                                        {published ? 'Unpublish' : 'Publish'}
                                    </Button>
                                </Stack>
                            </Paper>

                            {/* Archive Course */}
                            <Paper sx={{ bgcolor: '#1A2230', p: 3, borderRadius: 2, border: '1px solid #1F2937' }}>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Archive Course</Typography>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography sx={{ color: '#fff', fontWeight: 500 }}>Archive this course</Typography>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>
                                            Archived courses are hidden from the catalog but retained for records.
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Archive />}
                                        onClick={handleArchive}
                                        disabled={actionLoading || course.status === 'archived'}
                                        sx={{
                                            borderColor: '#F59E0B',
                                            color: '#F59E0B',
                                            textTransform: 'none',
                                            '&:hover': { borderColor: '#D97706', bgcolor: 'rgba(245, 158, 11, 0.1)' }
                                        }}
                                    >
                                        {course.status === 'archived' ? 'Archived' : 'Archive'}
                                    </Button>
                                </Stack>
                            </Paper>


                            {/* Certificate Price Change */}
                            <Paper sx={{ bgcolor: '#1A2230', p: 3, borderRadius: 2, border: '1px solid #1F2937' }}>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Certificate Pricing</Typography>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography sx={{ color: '#fff', fontWeight: 500 }}>Request Price Change</Typography>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>
                                            Request a change for the certificate issuance price. This requires admin approval.
                                        </Typography>
                                        {pendingPriceChange && (
                                            <Typography sx={{ color: '#3B82F6', fontSize: '0.85rem', mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <History sx={{ fontSize: 16 }} /> Pending Approval: {formatCurrency(pendingPriceChange.new_amount, pendingPriceChange.new_currency)}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={pendingPriceChange ? <History /> : <Payments />}
                                        onClick={() => setPriceChangeModalOpen(true)}
                                        disabled={actionLoading || !!pendingPriceChange}
                                        sx={{
                                            borderColor: pendingPriceChange ? '#9CA3AF' : '#3B82F6',
                                            color: pendingPriceChange ? '#9CA3AF' : '#3B82F6',
                                            textTransform: 'none',
                                            '&:hover': {
                                                borderColor: pendingPriceChange ? '#9CA3AF' : '#2563EB',
                                                bgcolor: pendingPriceChange ? 'transparent' : 'rgba(59, 130, 246, 0.1)'
                                            }
                                        }}
                                    >
                                        {pendingPriceChange ? 'Pending Approval' : 'Request Change'}
                                    </Button>
                                </Stack>
                            </Paper>

                            {/* Danger Zone */}
                            <Paper sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', p: 3, borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                <Typography sx={{ color: '#EF4444', fontSize: '0.85rem', mb: 2 }}>Danger Zone</Typography>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography sx={{ color: '#fff', fontWeight: 500 }}>Delete this course</Typography>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>
                                            Once deleted, this course and all its content cannot be recovered.
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Delete />}
                                        onClick={handleDelete}
                                        disabled={actionLoading}
                                        sx={{
                                            borderColor: '#EF4444',
                                            color: '#EF4444',
                                            textTransform: 'none',
                                            '&:hover': { borderColor: '#DC2626', bgcolor: 'rgba(239, 68, 68, 0.1)' }
                                        }}
                                    >
                                        Delete Course
                                    </Button>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Box>
                )}

            </Box>

            {/* Snackbar for notifications */}
            {/* Module Modal */}
            <Modal open={moduleModalOpen} onClose={() => setModuleModalOpen(false)}>
                <Box sx={modalStyle}>
                    <Box sx={{ background: 'linear-gradient(135deg, #1152D4 0%, #0D42AF 100%)', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>{moduleTitle ? 'Edit Module' : 'Add Module'}</Typography>
                        <IconButton onClick={() => setModuleModalOpen(false)} sx={{ color: '#fff' }}><Close /></IconButton>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={2}>
                            <Box>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Module Title</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="e.g. Introduction to the Course"
                                    value={moduleTitle}
                                    onChange={(e) => setModuleTitle(e.target.value)}
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
                                    value={moduleDescription}
                                    onChange={(e) => setModuleDescription(e.target.value)}
                                    sx={textFieldStyle}
                                />
                            </Box>
                        </Stack>
                        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                            <Button onClick={() => setModuleModalOpen(false)} sx={{ color: '#9CA3AF' }}>Cancel</Button>
                            <Button
                                variant="contained"
                                onClick={handleCreateModule}
                                sx={{ bgcolor: '#1152D4' }}
                                disabled={actionLoading}
                            >
                                Create
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>

            {/* Lesson Modal */}
            <Modal open={lessonModalOpen} onClose={() => setLessonModalOpen(false)}>
                <Box sx={modalStyle}>
                    <Box sx={{ background: 'linear-gradient(135deg, #1152D4 0%, #0D42AF 100%)', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>Add Lesson</Typography>
                        <IconButton onClick={() => setLessonModalOpen(false)} sx={{ color: '#fff' }}><Close /></IconButton>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={2}>
                            <Box>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Lesson Title</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="e.g. Welcome Video"
                                    value={lessonTitle}
                                    onChange={(e) => setLessonTitle(e.target.value)}
                                    sx={textFieldStyle}
                                />
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Lesson Type</Typography>
                                <Select
                                    fullWidth
                                    value={lessonType}
                                    onChange={(e) => setLessonType(e.target.value)}
                                    sx={selectStyle}
                                    MenuProps={selectMenuProps}
                                >
                                    <MenuItem value="video">Video</MenuItem>
                                    <MenuItem value="text">Text/Article</MenuItem>
                                    <MenuItem value="document">File Attachment</MenuItem>
                                </Select>
                            </Box>

                            {/* Content based on type */}
                            {lessonType === 'video' && (
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
                                                setLessonFile(file);
                                                setLessonFileName(file.name);
                                                setLessonContent('');
                                            }
                                        }}
                                    />
                                    <label htmlFor="lesson-video-upload">
                                        <Box
                                            sx={{
                                                bgcolor: '#1E293B',
                                                border: (lessonFile || lessonFileName) ? '2px solid #10B981' : '2px dashed #374151',
                                                borderRadius: 2,
                                                p: 3,
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                '&:hover': { borderColor: '#1152D4' },
                                            }}
                                        >
                                            {(lessonFile || lessonFileName) ? (
                                                <Stack alignItems="center" spacing={1}>
                                                    <PlayCircleOutline sx={{ fontSize: 36, color: '#10B981' }} />
                                                    <Typography sx={{ color: '#fff', fontSize: '0.85rem' }}>
                                                        {lessonFileName}
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

                            {lessonType === 'text' && (
                                <Box>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Article Content</Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={6}
                                        placeholder="Write your lesson content here..."
                                        value={lessonContent}
                                        onChange={(e) => setLessonContent(e.target.value)}
                                        sx={textFieldStyle}
                                    />
                                </Box>
                            )}

                            {lessonType === 'document' && (
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
                                                setLessonFile(file);
                                                setLessonFileName(file.name);
                                                setLessonContent('');
                                            }
                                        }}
                                    />
                                    <label htmlFor="lesson-file-upload">
                                        <Box
                                            sx={{
                                                bgcolor: '#1E293B',
                                                border: (lessonFile || lessonFileName) ? '2px solid #10B981' : '2px dashed #374151',
                                                borderRadius: 2,
                                                p: 3,
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                '&:hover': { borderColor: '#1152D4' },
                                            }}
                                        >
                                            {(lessonFile || lessonFileName) ? (
                                                <Stack alignItems="center" spacing={1}>
                                                    <AttachFile sx={{ fontSize: 36, color: '#10B981' }} />
                                                    <Typography sx={{ color: '#fff', fontSize: '0.85rem' }}>
                                                        {lessonFileName}
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
                                    value={lessonDuration}
                                    onChange={(e) => setLessonDuration(parseInt(e.target.value) || 0)}
                                    sx={textFieldStyle}
                                />
                            </Box>
                        </Stack>
                        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                            <Button onClick={() => setLessonModalOpen(false)} sx={{ color: '#9CA3AF' }}>Cancel</Button>
                            <Button variant="contained" onClick={handleCreateLesson} disabled={actionLoading} sx={{ bgcolor: '#1152D4' }}>
                                Add Lesson
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
            {/* Price Change Modal */}
            <Modal open={priceChangeModalOpen} onClose={() => !actionLoading && setPriceChangeModalOpen(false)}>
                <Box sx={modalStyle}>
                    <Box sx={{ background: '#2563EB', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>Request Price Change</Typography>
                        <IconButton onClick={() => setPriceChangeModalOpen(false)} sx={{ color: '#fff' }} disabled={actionLoading}><Close /></IconButton>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={3}>
                            <Alert severity="info" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                Current certificate price: {course ? formatCurrency(course.price, course.currency) : '...'}
                            </Alert>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>New Amount</Typography>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        placeholder="0.00"
                                        value={priceChangeData.new_amount}
                                        onChange={(e) => setPriceChangeData(prev => ({ ...prev, new_amount: e.target.value }))}
                                        sx={textFieldStyle}
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Currency</Typography>
                                    <Select
                                        fullWidth
                                        value={priceChangeData.new_currency}
                                        onChange={(e) => setPriceChangeData(prev => ({ ...prev, new_currency: e.target.value }))}
                                        sx={selectStyle}
                                        MenuProps={selectMenuProps}
                                    >
                                        <MenuItem value="USD">USD ($)</MenuItem>
                                        <MenuItem value="NGN">NGN (₦)</MenuItem>
                                        <MenuItem value="GBP">GBP (£)</MenuItem>
                                        <MenuItem value="EUR">EUR (€)</MenuItem>
                                    </Select>
                                </Box>
                            </Box>

                            <Box>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Reason for Change</Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Explain why you are requesting this price change..."
                                    value={priceChangeData.reason}
                                    onChange={(e) => setPriceChangeData(prev => ({ ...prev, reason: e.target.value }))}
                                    sx={textFieldStyle}
                                />
                            </Box>
                        </Stack>

                        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 4 }}>
                            <Button
                                onClick={() => setPriceChangeModalOpen(false)}
                                sx={{ color: '#9CA3AF' }}
                                disabled={actionLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleRequestPriceChange}
                                sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' } }}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Submit Request'}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default CourseDashboard;

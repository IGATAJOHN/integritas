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
    Divider,
    Tabs,
    Tab,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    ArrowBack,
    Add,
    Edit,
    Delete,
    ExpandMore,
    PlayCircleOutline,
    ArticleOutlined,
    AttachFile,
    CheckCircle,
    AccessTime,
    MoreVert,
    Category,
    Language,
    Timer,
    School,
    Image,
    Description,
    Publish,
    Archive,
} from '@mui/icons-material';
import { tutorCoursesService } from '../services/courseService';
import { tutorModuleService } from '../services/moduleService';

/**
 * Returns the appropriate icon for a lesson type
 * @param {string} type - Lesson type (video, reading, file, etc.)
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

/**
 * Course Dashboard - Displays course details, curriculum (modules/lessons), and settings
 * 
 * Fetches course data from API and displays it in a tabbed interface.
 * If modules are not included in the course response, fetches them separately.
 */
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

    /**
     * Fetches course details and modules from the API
     */
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch course details
                const courseData = await tutorCoursesService.getCourseDetail(courseId);
                setCourse(courseData);

                // If course has modules in response, use them
                if (courseData.modules && courseData.modules.length > 0) {
                    setModules(courseData.modules);
                } else {
                    // Otherwise, fetch modules separately
                    try {
                        const modulesResponse = await tutorModuleService.listModules(courseId);
                        setModules(modulesResponse.data || []);
                    } catch (modErr) {
                        console.warn('Could not fetch modules separately:', modErr);
                        setModules([]);
                    }
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

    const handleLessonNavigate = (moduleId, lessonId) => {
        navigate(`/tutor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
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
    const published = course.status === 'published' || course.is_published;
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
                        disabled={actionLoading}
                        sx={{
                            bgcolor: published ? '#F59E0B' : '#1152D4',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: published ? '#D97706' : '#0D42AF' }
                        }}
                    >
                        {actionLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : published ? 'Unpublish' : 'Publish Course'}
                    </Button>
                </Stack>
            </Box>

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
                                            <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#6B7280' }} />}>
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
                                                        <ListItem
                                                            key={lesson.id}
                                                            button
                                                            onClick={() => handleLessonNavigate(mod.id, lesson.id)}
                                                            sx={{
                                                                bgcolor: '#0F172A',
                                                                mb: 1,
                                                                borderRadius: 1,
                                                                border: '1px solid transparent',
                                                                '&:hover': {
                                                                    bgcolor: '#1E293B',
                                                                    borderColor: 'rgba(59, 130, 246, 0.3)'
                                                                }
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
                                                            <IconButton size="small" sx={{ color: '#6B7280' }}>
                                                                <Edit fontSize="small" />
                                                            </IconButton>
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
                                <Button variant="outlined" startIcon={<Add />} sx={{ borderColor: '#374151', color: '#9CA3AF' }}>
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
        </Box>
    );
};

export default CourseDashboard;

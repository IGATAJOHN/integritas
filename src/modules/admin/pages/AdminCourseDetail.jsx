import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Box, Typography, Stack, Button, IconButton, Paper,
    Tabs, Tab, Accordion, AccordionSummary, AccordionDetails,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    TextField, Modal, Chip, Alert, Snackbar, CircularProgress,
    FormControl, InputLabel, Select, MenuItem, Switch, Breadcrumbs
} from '@mui/material';
import {
    ArrowBack, Add, Edit, Delete, ExpandMore, Publish,
    School, Language, Timer, Payments, History, CheckCircle,
    Cancel, PlayCircleOutline, Description, AttachFile, Close,
    CloudUpload, VideoLibrary
} from '@mui/icons-material';
import { adminCoursesService } from '../services/courseService';
import {

    textFieldStyle,
    selectStyle,
    selectMenuProps,
    primaryButtonStyle,
    paperStyle,
    modalStyle
} from '../../../styles/formStyles';

const AdminCourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    // Data State
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Module Modal State
    const [moduleModalOpen, setModuleModalOpen] = useState(false);
    const [moduleTitle, setModuleTitle] = useState('');
    const [moduleDescription, setModuleDescription] = useState('');
    const [editingModuleId, setEditingModuleId] = useState(null);

    // Lesson Modal State
    const [lessonModalOpen, setLessonModalOpen] = useState(false);
    const [selectedModuleForLesson, setSelectedModuleForLesson] = useState(null);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonType, setLessonType] = useState('video');
    const [lessonContent, setLessonContent] = useState('');
    const [lessonDuration, setLessonDuration] = useState(0);
    const [lessonFile, setLessonFile] = useState(null);
    const [lessonFileName, setLessonFileName] = useState('');

    // Reject Modal State
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            const courseData = await adminCoursesService.getCourseDetail(courseId);
            setCourse(courseData);

            // Fetch modules details
            const modulesData = await adminCoursesService.getCourseModules(courseId);

            // Fetch lessons for each module in parallel to populate the accordion
            if (modulesData && modulesData.length > 0) {
                const modulesWithLessons = await Promise.all(modulesData.map(async (mod) => {
                    try {
                        const lessonsRes = await adminCoursesService.listLessons(mod.id);
                        return { ...mod, lessons: lessonsRes.data || [] };
                    } catch (e) {
                        return { ...mod, lessons: [] };
                    }
                }));
                setModules(modulesWithLessons);
            } else {
                setModules([]);
            }
        } catch (error) {
            console.error('Error fetching course data:', error);
            showSnackbar('Failed to load course data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // --- Module Handlers ---

    const handleCreateModule = async () => {
        if (!moduleTitle.trim()) return;
        try {
            setActionLoading(true);
            const payload = { title: moduleTitle, description: moduleDescription };

            if (editingModuleId) {
                await adminCoursesService.updateModule(editingModuleId, payload);
                showSnackbar('Module updated successfully');
            } else {
                await adminCoursesService.createModule(courseId, payload);
                showSnackbar('Module created successfully');
            }

            setModuleModalOpen(false);
            setModuleTitle('');
            setModuleDescription('');
            setEditingModuleId(null);
            fetchCourseData();
        } catch (error) {
            showSnackbar('Failed to save module', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm('Are you sure? All lessons in this module will be deleted.')) return;
        try {
            setActionLoading(true);
            await adminCoursesService.deleteModule(moduleId);
            showSnackbar('Module deleted');
            fetchCourseData();
        } catch (error) {
            showSnackbar('Failed to delete module', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePublishModule = async (moduleId, currentStatus) => {
        try {
            // Optimistic update
            const updatedModules = modules.map(m =>
                m.id === moduleId ? { ...m, is_published: !currentStatus } : m
            );
            setModules(updatedModules);

            if (currentStatus) {
                await adminCoursesService.unpublishModule(courseId, moduleId);
                showSnackbar('Module unpublished');
            } else {
                await adminCoursesService.publishModule(courseId, moduleId);
                showSnackbar('Module published');
            }
            fetchCourseData();
        } catch (error) {
            showSnackbar('Failed to update module status', 'error');
            fetchCourseData(); // Revert
        }
    };

    // --- Lesson Handlers ---

    const openAddLessonModal = (moduleId) => {
        setSelectedModuleForLesson(moduleId);
        setLessonTitle('');
        setLessonType('video');
        setLessonContent('');
        setLessonDuration(0);
        setLessonFile(null);
        setLessonFileName('');
        setLessonModalOpen(true);
    };

    const handleCreateLesson = async () => {
        if (!lessonTitle.trim()) {
            showSnackbar('Lesson title is required', 'error');
            return;
        }

        try {
            setActionLoading(true);

            const payload = {
                title: lessonTitle,
                type: lessonType,
                content: lessonContent,
                duration: lessonDuration,
                position: 0
            };

            const newLesson = await adminCoursesService.createLesson(selectedModuleForLesson, payload);

            if ((lessonType === 'video' || lessonType === 'document') && lessonFile) {
                const formData = new FormData();
                formData.append('file', lessonFile);
                await adminCoursesService.uploadLessonMedia(newLesson.id, formData);
            }

            showSnackbar('Lesson created successfully');
            setLessonModalOpen(false);
            fetchCourseData();
        } catch (error) {
            console.error('Create lesson error:', error);
            showSnackbar(error.message || 'Failed to create lesson', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm('Delete this lesson?')) return;
        try {
            setActionLoading(true);
            await adminCoursesService.deleteLesson(lessonId);
            showSnackbar('Lesson deleted');
            fetchCourseData();
        } catch (error) {
            showSnackbar('Failed to delete lesson', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePublishLesson = async (moduleId, lessonId, currentStatus) => {
        try {
            if (currentStatus) {
                await adminCoursesService.unpublishLesson(moduleId, lessonId);
                showSnackbar('Lesson unpublished');
            } else {
                await adminCoursesService.publishLesson(moduleId, lessonId);
                showSnackbar('Lesson published');
            }
            fetchCourseData();
        } catch (error) {
            showSnackbar('Failed to update lesson status', 'error');
        }
    };

    // --- Course Actions ---

    const handlePublishCourse = async () => {
        try {
            setActionLoading(true);
            if (course.published_at) {
                await adminCoursesService.unpublishCourse(courseId);
                showSnackbar('Course unpublished');
            } else {
                await adminCoursesService.publishCourse(courseId);
                showSnackbar('Course published');
            }
            fetchCourseData();
        } catch (error) {
            showSnackbar('Failed to update course status', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveCourse = async () => {
        if (!window.confirm('Approve this course? It will be marked as reviewed.')) return;
        try {
            setActionLoading(true);
            await adminCoursesService.updateCourse(courseId, { status: 'published' });
            showSnackbar('Course approved');
            fetchCourseData();
        } catch (error) {
            showSnackbar('Failed to approve course', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectCourse = async () => {
        if (!rejectionReason.trim()) {
            showSnackbar('Please provide a reason', 'error');
            return;
        }
        try {
            setActionLoading(true);
            await adminCoursesService.updateCourse(courseId, { status: 'rejected', rejection_reason: rejectionReason });
            showSnackbar('Course rejected');
            setRejectModalOpen(false);
            fetchCourseData();
        } catch (error) {
            showSnackbar('Failed to reject course', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteCourse = async () => {
        if (!window.confirm('CRITICAL: Delete this course permanently? This cannot be undone.')) return;
        try {
            setActionLoading(true);
            await adminCoursesService.deleteCourse(courseId);
            navigate('/admin/content/courses');
        } catch (error) {
            showSnackbar('Failed to delete course', 'error');
            setActionLoading(false);
        }
    };

    // --- Render Helpers ---

    const getLessonIcon = (type) => {
        switch (type) {
            case 'video': return <PlayCircleOutline />;
            case 'document': return <Description />;
            case 'text': return <Language />;
            case 'quiz': return <School />;
            default: return <VideoLibrary />;
        }
    };

    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency || 'NGN' }).format(amount);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0F1729' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!course) return null;

    const hasThumbnail = Boolean(String(course.thumbnail_url || '').trim());

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0F1729', minHeight: '100vh', color: '#fff' }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <IconButton onClick={() => navigate('/admin/content/courses')} sx={{ color: '#9CA3AF' }}>
                    <ArrowBack />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                    <Breadcrumbs separator="›" sx={{ color: '#6B7280', fontSize: '0.85rem', mb: 0.5 }}>
                        <Link to="/admin/content/courses" style={{ color: '#6B7280', textDecoration: 'none' }}>Courses</Link>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Details</Typography>
                    </Breadcrumbs>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#fff' }}>
                        {course.title}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Chip
                        label={course.status}
                        color={course.status === 'published' ? 'success' : course.status === 'rejected' ? 'error' : 'warning'}
                        sx={{ fontWeight: 600, borderRadius: 1 }}
                    />
                </Stack>
            </Stack>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Curriculum" sx={{ textTransform: 'none', color: '#9CA3AF' }} />
                    <Tab label="Details" sx={{ textTransform: 'none', color: '#9CA3AF' }} />
                    <Tab label="Settings" sx={{ textTransform: 'none', color: '#9CA3AF' }} />
                </Tabs>
            </Box>

            {/* TAB 0: CURRICULUM */}
            {activeTab === 0 && (
                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Course Content</Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => { setEditingModuleId(null); setModuleTitle(''); setModuleDescription(''); setModuleModalOpen(true); }}
                            sx={primaryButtonStyle}
                        >
                            Add Module
                        </Button>
                    </Stack>

                    {modules.length === 0 ? (
                        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#1A2230', border: '1px dashed #374151', borderRadius: 2 }}>
                            <School sx={{ fontSize: 60, color: '#374151', mb: 2 }} />
                            <Typography sx={{ color: '#9CA3AF', mb: 2 }}>No modules yet.</Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={2}>
                            {modules.map((mod) => (
                                <Paper key={mod.id} sx={{ bgcolor: '#1A2230', overflow: 'hidden', border: '1px solid #374151', borderRadius: 2 }}>
                                    <Accordion disableGutters sx={{ bgcolor: 'transparent', boxShadow: 'none', '&:before': { display: 'none' } }}>
                                        <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#9CA3AF' }} />}>
                                            <Stack direction="row" alignItems="center" sx={{ width: '100%', mr: 2 }}>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                                        {mod.title}
                                                    </Typography>
                                                    {mod.description && (
                                                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                                                            {mod.description}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Stack direction="row" alignItems="center" spacing={1} onClick={e => e.stopPropagation()}>
                                                    <Switch
                                                        size="small"
                                                        checked={!!mod.is_published}
                                                        onChange={() => handlePublishModule(mod.id, mod.is_published)}
                                                        color="success"
                                                    />
                                                    <IconButton size="small" sx={{ color: '#3B82F6' }} onClick={() => { setEditingModuleId(mod.id); setModuleTitle(mod.title); setModuleDescription(mod.description || ''); setModuleModalOpen(true); }}>
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" sx={{ color: '#EF4444' }} onClick={() => handleDeleteModule(mod.id)}>
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </Stack>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ bgcolor: '#111827', borderTop: '1px solid #374151', p: 0 }}>
                                            <List>
                                                {mod.lessons && mod.lessons.map((lesson) => (
                                                    <ListItem key={lesson.id} disablePadding secondaryAction={
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Switch
                                                                size="small"
                                                                checked={!!lesson.published_at}
                                                                onChange={() => handlePublishLesson(mod.id, lesson.id, !!lesson.published_at)}
                                                                color="success"
                                                            />
                                                            <IconButton size="small" sx={{ color: '#EF4444' }} onClick={() => handleDeleteLesson(lesson.id)}>
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Stack>
                                                    }>
                                                        <ListItemButton>
                                                            <ListItemIcon sx={{ color: '#9CA3AF', minWidth: 40 }}>
                                                                {getLessonIcon(lesson.type)}
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={<Typography sx={{ color: '#E5E7EB', fontSize: '0.9rem' }}>{lesson.title}</Typography>}
                                                                secondary={
                                                                    <Typography sx={{ color: '#6B7280', fontSize: '0.8rem' }}>
                                                                        {lesson.type} • {lesson.duration || 0}m
                                                                    </Typography>
                                                                }
                                                            />
                                                        </ListItemButton>
                                                    </ListItem>
                                                ))}
                                                {(!mod.lessons || mod.lessons.length === 0) && (
                                                    <ListItem>
                                                        <Typography sx={{ color: '#6B7280', fontSize: '0.85rem', p: 1, width: '100%', textAlign: 'center' }}>
                                                            No lessons yet
                                                        </Typography>
                                                    </ListItem>
                                                )}
                                                <ListItem>
                                                    <Button
                                                        fullWidth
                                                        startIcon={<Add />}
                                                        onClick={() => openAddLessonModal(mod.id)}
                                                        sx={{ color: '#3B82F6', bgcolor: 'rgba(59, 130, 246, 0.05)', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' } }}
                                                    >
                                                        Add Lesson
                                                    </Button>
                                                </ListItem>
                                            </List>
                                        </AccordionDetails>
                                    </Accordion>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Box>
            )}

            {/* TAB 1: DETAILS */}
            {activeTab === 1 && (
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Course Details</Typography>
                    <Stack spacing={3}>
                        <Paper sx={{ ...paperStyle, padding: 2 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Thumbnail</Typography>
                            {hasThumbnail ? (
                                <Box component="img" src={course.thumbnail_url} sx={{ width: '100%', maxWidth: 400, borderRadius: 1 }} />
                            ) : (
                                <Box
                                    sx={{
                                        width: '100%',
                                        maxWidth: 400,
                                        aspectRatio: '1 / 1',
                                        bgcolor: '#000000',
                                        borderRadius: 1,
                                    }}
                                />
                            )}
                        </Paper>
                        <Paper sx={{ ...paperStyle, padding: 3 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Basic Info</Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Title</Typography>
                                    <Typography sx={{ color: '#fff' }}>{course.title}</Typography>
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
                                        <Typography sx={{ color: '#9CA3AF' }} dangerouslySetInnerHTML={{ __html: course.description }} />
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                        <Paper sx={{ ...paperStyle, padding: 3 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Attributes</Typography>
                            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center"><School sx={{ fontSize: 16, color: '#6B7280' }} /><Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Level</Typography></Stack>
                                    <Typography sx={{ color: '#fff' }}>{course.level || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center"><Language sx={{ fontSize: 16, color: '#6B7280' }} /><Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Language</Typography></Stack>
                                    <Typography sx={{ color: '#fff' }}>{course.language || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center"><Timer sx={{ fontSize: 16, color: '#6B7280' }} /><Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Duration</Typography></Stack>
                                    <Typography sx={{ color: '#fff' }}>{course.duration_minutes || 0} min</Typography>
                                </Box>
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center"><Payments sx={{ fontSize: 16, color: '#6B7280' }} /><Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Price</Typography></Stack>
                                    <Typography sx={{ color: '#fff' }}>{formatCurrency(course.price, course.currency)}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Stack>
                </Box>
            )}

            {/* TAB 2: SETTINGS */}
            {activeTab === 2 && (
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Course Settings</Typography>
                    <Stack spacing={3}>
                        <Paper sx={{ ...paperStyle, padding: 3 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Publication</Typography>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>{course.published_at ? 'Published' : 'Draft'}</Typography>
                                    <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>{course.published_at ? 'Visible to students' : 'Hidden from students'}</Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    color={course.published_at ? "warning" : "success"}
                                    onClick={handlePublishCourse}
                                    startIcon={<Publish />}
                                >
                                    {course.published_at ? 'Unpublish' : 'Publish'}
                                </Button>
                            </Stack>
                        </Paper>

                        <Paper sx={{ ...paperStyle, padding: 3 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Approval Status</Typography>
                            <Stack direction="row" spacing={2}>
                                <Button variant="contained" color="success" onClick={handleApproveCourse} startIcon={<CheckCircle />}>
                                    Approve Course
                                </Button>
                                <Button variant="outlined" color="error" onClick={() => setRejectModalOpen(true)} startIcon={<Cancel />}>
                                    Reject Course
                                </Button>
                            </Stack>
                        </Paper>

                        <Paper sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', p: 3, borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            <Typography sx={{ color: '#EF4444', fontSize: '0.85rem', mb: 2 }}>Danger Zone</Typography>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>Delete Course</Typography>
                                    <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>Irreversible action</Typography>
                                </Box>
                                <Button variant="outlined" color="error" onClick={handleDeleteCourse} startIcon={<Delete />}>
                                    Delete
                                </Button>
                            </Stack>
                        </Paper>
                    </Stack>
                </Box>
            )}

            {/* Module Modal */}
            <Modal open={moduleModalOpen} onClose={() => setModuleModalOpen(false)}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>{editingModuleId ? 'Edit Module' : 'Add Module'}</Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Title"
                            fullWidth
                            value={moduleTitle}
                            onChange={(e) => setModuleTitle(e.target.value)}
                            sx={textFieldStyle}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={moduleDescription}
                            onChange={(e) => setModuleDescription(e.target.value)}
                            sx={textFieldStyle}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            <Button onClick={() => setModuleModalOpen(false)} sx={{ color: '#9CA3AF' }}>Cancel</Button>
                            <Button variant="contained" onClick={handleCreateModule} disabled={actionLoading} sx={primaryButtonStyle}>Save</Button>
                        </Box>
                    </Stack>
                </Box>
            </Modal>

            {/* Lesson Modal */}
            <Modal open={lessonModalOpen} onClose={() => setLessonModalOpen(false)}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Add Lesson</Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Lesson Title"
                            fullWidth
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                            sx={textFieldStyle}
                        />
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: '#9CA3AF' }}>Type</InputLabel>
                            <Select
                                value={lessonType}
                                onChange={(e) => setLessonType(e.target.value)}
                                sx={selectStyle}
                                MenuProps={selectMenuProps}
                                label="Type"
                            >
                                <MenuItem value="video">Video</MenuItem>
                                <MenuItem value="text">Text/Article</MenuItem>
                                <MenuItem value="document">File Attachment</MenuItem>
                            </Select>
                        </FormControl>

                        {(lessonType === 'video' || lessonType === 'document') && (
                            <Box sx={{ border: '1px dashed #374151', p: 2, borderRadius: 1, textAlign: 'center' }}>
                                <input
                                    type="file"
                                    id="lesson-file-upload"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setLessonFile(file);
                                            setLessonFileName(file.name);
                                        }
                                    }}
                                />
                                <label htmlFor="lesson-file-upload">
                                    <Button component="span" startIcon={<CloudUpload />} sx={{ color: '#3B82F6' }}>
                                        {lessonFileName || 'Upload File'}
                                    </Button>
                                </label>
                            </Box>
                        )}

                        {lessonType === 'text' && (
                            <TextField
                                label="Content"
                                fullWidth
                                multiline
                                rows={4}
                                value={lessonContent}
                                onChange={(e) => setLessonContent(e.target.value)}
                                sx={textFieldStyle}
                            />
                        )}

                        <TextField
                            label="Duration (minutes)"
                            type="number"
                            fullWidth
                            value={lessonDuration}
                            onChange={(e) => setLessonDuration(e.target.value)}
                            sx={textFieldStyle}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            <Button onClick={() => setLessonModalOpen(false)} sx={{ color: '#9CA3AF' }}>Cancel</Button>
                            <Button variant="contained" onClick={handleCreateLesson} disabled={actionLoading} sx={primaryButtonStyle}>Create</Button>
                        </Box>
                    </Stack>
                </Box>
            </Modal>

            {/* Reject Modal */}
            <Modal open={rejectModalOpen} onClose={() => setRejectModalOpen(false)}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Reject Course</Typography>
                    <TextField
                        label="Reason for rejection"
                        fullWidth
                        multiline
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        sx={textFieldStyle}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                        <Button onClick={() => setRejectModalOpen(false)} sx={{ color: '#9CA3AF' }}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={handleRejectCourse} disabled={actionLoading}>Reject</Button>
                    </Box>
                </Box>
            </Modal>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminCourseDetail;

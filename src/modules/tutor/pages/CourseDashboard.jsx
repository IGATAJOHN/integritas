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
    Tab
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
    MoreVert
} from '@mui/icons-material';
import { tutorCoursesService } from '../services/courseService';

const getLessonIcon = (type) => {
    switch (type) {
        case 'video': return <PlayCircleOutline />;
        case 'reading': return <ArticleOutlined />;
        case 'file': return <AttachFile />;
        default: return <ArticleOutlined />;
    }
};

const CourseDashboard = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true);
                const data = await tutorCoursesService.getCourseDetail(courseId);
                setCourse(data);
            } catch (err) {
                console.error("Error fetching course:", err);
                setError("Failed to load course details.");
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const handleBack = () => {
        navigate('/tutor/courses');
    };

    const handleLessonNavigate = (moduleId, lessonId) => {
        navigate(`/tutor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', pkgcolor: '#080D19' }}>
                <CircularProgress sx={{ color: '#1152D4' }} />
            </Box>
        );
    }

    if (error || !course) {
        return (
            <Box sx={{ p: 4, bgcolor: '#080D19', minHeight: '100vh', color: '#fff' }}>
                <Typography color="error">{error || "Course not found"}</Typography>
                <Button onClick={handleBack} sx={{ mt: 2, color: '#fff' }}>Back to Courses</Button>
            </Box>
        );
    }

    // Prepare derived state
    const published = course.status === 'published';

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
                                label={published ? "Published" : "Draft"}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: published ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                    color: published ? '#10B981' : '#F59E0B'
                                }}
                            />
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                Last updated {new Date(course.updated_at).toLocaleDateString()}
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
                        sx={{
                            bgcolor: '#1152D4',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#0D42AF' }
                        }}
                    >
                        {published ? 'Update Course' : 'Publish Course'}
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
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Course Content</Typography>
                            <Button
                                startIcon={<Add />}
                                variant="contained"
                                sx={{ bgcolor: '#1152D4', textTransform: 'none', '&:hover': { bgcolor: '#0D42AF' } }}
                            >
                                Add Module
                            </Button>
                        </Stack>

                        {course.modules && course.modules.length > 0 ? (
                            <Stack spacing={2}>
                                {course.modules.map((mod, index) => (
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
                                                <List disablePadding>
                                                    {mod.lessons?.map((lesson, lIndex) => (
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
                                                                        {lesson.type === 'video' ? 'Video' : 'Reading'} • {lesson.duration} min
                                                                        {lesson.is_visible && (
                                                                            <Chip label="Published" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }} />
                                                                        )}
                                                                    </Typography>
                                                                }
                                                                primaryTypographyProps={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}
                                                            />
                                                            <IconButton size="small" sx={{ color: '#6B7280' }}>
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </ListItem>
                                                    ))}
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
                                <Typography color="text.secondary" sx={{ mb: 2 }}>
                                    No modules created yet.
                                </Typography>
                                <Button variant="outlined" startIcon={<Add />}>
                                    Create First Module
                                </Button>
                            </Paper>
                        )}
                    </Box>
                )}

                {/* DETAILS TAB */}
                {activeTab === 1 && (
                    <Box>
                        <Typography color="text.secondary">Course Details View (Placeholder)</Typography>
                    </Box>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 2 && (
                    <Box>
                        <Typography color="text.secondary">Course Settings View (Placeholder)</Typography>
                    </Box>
                )}

            </Box>
        </Box>
    );
};

export default CourseDashboard;

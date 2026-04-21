import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tutorLessonService, tutorCoursesService } from '../services';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    Paper,
    Stack,
    Switch,
    Select,
    MenuItem,
    FormControl,
    Chip,
    CircularProgress,
    Divider,
    Breadcrumbs,
    Link,
    InputBase
} from '@mui/material';
import {
    Save,
    RocketLaunch,
    Delete,
    PlayCircleOutline,
    ArticleOutlined,
    AttachFile,
    QuizOutlined,
    CloudUpload,
    ArrowBack,
    AccessTime,
    Edit,
    Visibility,
    MoreVert,
    DragIndicator
} from '@mui/icons-material';
import theme from '../../../styles/theme';


const CourseEditor = () => {
    const navigate = useNavigate();
    const { courseId, moduleId, lessonId } = useParams();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonDescription, setLessonDescription] = useState('');
    const [lessonDuration, setLessonDuration] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [difficulty, setDifficulty] = useState('Intermediate');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    // Fetch Course & Lesson Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch full course details
                const courseData = await tutorCoursesService.getCourseDetail(courseId);
                setCourse(courseData);

                // Find the specific lesson
                let foundLesson = null;
                courseData.modules?.forEach(mod => {
                    if (mod.id.toString() === moduleId) {
                        const l = mod.lessons?.find(item => item.id.toString() === lessonId);
                        if (l) foundLesson = l;
                    }
                });

                if (foundLesson) {
                    setLessonTitle(foundLesson.title);
                    setLessonDescription(foundLesson.content || '');
                    setLessonDuration(foundLesson.duration || 45); // Default to 45 if 0
                    setIsVisible(foundLesson.is_visible || false);
                    setDifficulty(foundLesson.difficulty || 'Intermediate');
                    // setTags(foundLesson.tags || []);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId && lessonId) {
            fetchData();
        }
    }, [courseId, moduleId, lessonId]);

    const handleSave = async () => {
        if (!lessonId) return;
        setSaving(true);
        try {
            const payload = {
                title: lessonTitle,
                content: lessonDescription,
                duration: parseInt(lessonDuration) || 0,
                difficulty,
                is_visible: isVisible
            };

            await tutorLessonService.updateLesson(lessonId, payload);
            // Show success feedback if needed
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate(`/tutor/courses/${courseId}`);
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setTags(tags.filter((tag) => tag !== tagToDelete));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#080D19' }}>
                <CircularProgress sx={{ color: theme.colors.brand }} />
            </Box>
        );
    }

    if (!course) return null;

    // Derived
    const currentModule = course.modules?.find(m => m.id.toString() === moduleId);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', bgcolor: '#080D19', overflow: 'hidden' }}>

            {/* Header */}
            <Box sx={{
                px: 4, height: 70, borderBottom: '1px solid #1F2937', bgcolor: '#0C1322',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
            }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Breadcrumbs separator="/" sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                        <Link underline="hover" color="inherit" onClick={() => navigate('/tutor/courses')} sx={{ cursor: 'pointer' }}>Courses</Link>
                        <Link underline="hover" color="inherit" onClick={handleBack} sx={{ cursor: 'pointer' }}>{course.title}</Link>
                        <Typography color="text.primary" sx={{ color: '#E5E7EB' }}>Module {currentModule?.title}</Typography>
                        <Typography color="text.primary" sx={{ color: '#fff', fontWeight: 600 }}>{lessonTitle}</Typography>
                    </Breadcrumbs>
                </Stack>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        onClick={handleSave}
                        disabled={saving}
                        sx={{ borderColor: '#374151', color: '#fff', textTransform: 'none', '&:hover': { borderColor: '#6B7280' } }}
                    >
                        {saving ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        endIcon={<RocketLaunch fontSize="small" />}
                        sx={{ bgcolor: theme.colors.brand, textTransform: 'none', '&:hover': { bgcolor: '#0D42AF' } }}
                    >
                        Publish Lesson
                    </Button>
                </Stack>
            </Box>

            {/* Content Area */}
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* Main Editor (Left) */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 4, bgcolor: '#080D19' }}>
                    <Box sx={{ maxWidth: 800, mx: 'auto' }}>

                        {/* Title Section */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, letterSpacing: 1, mb: 1, display: 'block' }}>
                                LESSON TITLE
                            </Typography>
                            <InputBase
                                value={lessonTitle}
                                onChange={(e) => setLessonTitle(e.target.value)}
                                fullWidth
                                sx={{
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    color: '#fff',
                                    '& input': { p: 0 }
                                }}
                                placeholder="Enter lesson title..."
                            />
                        </Box>

                        {/* Description Section */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, letterSpacing: 1, mb: 1.5, display: 'block' }}>
                                DESCRIPTION & INSTRUCTIONS
                            </Typography>
                            <Paper sx={{
                                bgcolor: '#111827',
                                border: '1px solid #1F2937',
                                borderRadius: 2,
                                overflow: 'hidden',
                                '& .ql-toolbar': { bgcolor: '#1F2937', borderBottom: '1px solid #374151', borderColor: 'transparent' },
                                '& .ql-container': { bgcolor: '#111827', borderColor: 'transparent', minHeight: 200, fontSize: '1rem' },
                                '& .ql-editor': { color: '#D1D5DB' },
                                '& .ql-stroke': { stroke: '#9CA3AF' },
                                '& .ql-fill': { fill: '#9CA3AF' },
                                '& .ql-picker': { color: '#9CA3AF' }
                            }}>
                                <ReactQuill
                                    theme="snow"
                                    value={lessonDescription}
                                    onChange={setLessonDescription}
                                    placeholder="Write a description or instructions for this lesson..."
                                />
                            </Paper>
                        </Box>

                        {/* Upload Section */}
                        <Box sx={{ mb: 4 }}>
                            <Paper
                                sx={{
                                    border: '2px dashed #374151',
                                    bgcolor: 'transparent',
                                    p: 4,
                                    borderRadius: 2,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    '&:hover': { borderColor: '#3B82F6', bgcolor: 'rgba(59, 130, 246, 0.05)' }
                                }}
                            >
                                <CloudUpload sx={{ fontSize: 40, color: '#3B82F6', mb: 1 }} />
                                <Typography sx={{ color: '#fff', fontWeight: 600 }}>Click to upload or drag and drop</Typography>
                                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                    Video (MP4), Documents (PDF), or create a <Link href="#" sx={{ color: '#3B82F6' }}>New Quiz</Link>
                                </Typography>
                            </Paper>
                        </Box>

                        {/* Content List Section (Mock items based on screenshot) */}
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="h6" sx={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>Lesson Content</Typography>
                                <Typography variant="caption" sx={{ color: '#3B82F6', cursor: 'pointer' }}>Expand All | Collapse All</Typography>
                            </Stack>

                            <Stack spacing={2}>
                                {/* Video Item */}
                                <Paper sx={{ p: 2, bgcolor: '#1A2230', border: '1px solid #1F2937', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <DragIndicator sx={{ color: '#6B7280', cursor: 'move' }} />
                                    <Box sx={{ p: 1, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 1 }}>
                                        <PlayCircleOutline sx={{ color: '#EF4444' }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ color: '#fff', fontWeight: 500, fontSize: '0.95rem' }}>Video_Intro_Transparency.mp4</Typography>
                                        <Typography variant="caption" sx={{ color: '#6B7280' }}>10:00 mins • 45 MB</Typography>
                                    </Box>
                                    <Chip label="Ready" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', height: 24 }} />
                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" sx={{ color: '#6B7280' }}><Edit fontSize="small" /></IconButton>
                                        <IconButton size="small" sx={{ color: '#6B7280' }}><Visibility fontSize="small" /></IconButton>
                                        <IconButton size="small" sx={{ color: '#EF4444' }}><Delete fontSize="small" /></IconButton>
                                    </Stack>
                                </Paper>

                                {/* PDF Item */}
                                <Paper sx={{ p: 2, bgcolor: '#1A2230', border: '1px solid #1F2937', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <DragIndicator sx={{ color: '#6B7280', cursor: 'move' }} />
                                    <Box sx={{ p: 1, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 1 }}>
                                        <ArticleOutlined sx={{ color: '#F59E0B' }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ color: '#fff', fontWeight: 500, fontSize: '0.95rem' }}>Case_Study_Brazil_2023.pdf</Typography>
                                        {/* Progress bar simulation */}
                                        <Box sx={{ width: 100, height: 4, bgcolor: '#374151', borderRadius: 2, mt: 0.5 }}>
                                            <Box sx={{ width: '60%', height: '100%', bgcolor: '#3B82F6', borderRadius: 2 }} />
                                        </Box>
                                    </Box>
                                    <Chip label="Processing.." size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', height: 24 }} />
                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" sx={{ color: '#6B7280' }}><Edit fontSize="small" /></IconButton>
                                        <IconButton size="small" sx={{ color: '#EF4444' }}><Delete fontSize="small" /></IconButton>
                                    </Stack>
                                </Paper>

                                {/* Quiz Item */}
                                <Paper sx={{ p: 2, bgcolor: '#1A2230', border: '1px solid #1F2937', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <DragIndicator sx={{ color: '#6B7280', cursor: 'move' }} />
                                    <Box sx={{ p: 1, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 1 }}>
                                        <QuizOutlined sx={{ color: '#10B981' }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ color: '#fff', fontWeight: 500, fontSize: '0.95rem' }}>Unit 3 Assessment: Pillars of Governance</Typography>
                                        <Typography variant="caption" sx={{ color: '#6B7280' }}>10 Questions • Multiple Choice</Typography>
                                    </Box>
                                    <Chip label="Active" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', height: 24 }} />
                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" sx={{ color: '#6B7280' }}><Edit fontSize="small" /></IconButton>
                                        <IconButton size="small" sx={{ color: '#6B7280' }}><Visibility fontSize="small" /></IconButton>
                                        <IconButton size="small" sx={{ color: '#EF4444' }}><Delete fontSize="small" /></IconButton>
                                    </Stack>
                                </Paper>
                            </Stack>
                        </Box>

                    </Box>
                </Box>

                {/* Right Sidebar - Settings */}
                <Paper square sx={{
                    width: 350,
                    bgcolor: '#111827',
                    borderLeft: '1px solid #1F2937',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0
                }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid #1F2937' }}>
                        <Typography variant="h6" sx={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>Lesson Settings</Typography>
                    </Box>

                    <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
                        <Stack spacing={4}>
                            {/* Visibility */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography sx={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>Visibility</Typography>
                                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Visible to enrolled students</Typography>
                                </Box>
                                <Switch checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} color="primary" />
                            </Box>

                            {/* Duration */}
                            <Box>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, mb: 1, display: 'block' }}>EST. DURATION (MINUTES)</Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    value={lessonDuration}
                                    onChange={(e) => setLessonDuration(e.target.value)}
                                    size="small"
                                    placeholder="e.g. 45"
                                    InputProps={{
                                        startAdornment: <AccessTime sx={{ color: '#6B7280', mr: 1, fontSize: 20 }} />
                                    }}
                                    sx={{ bgcolor: '#1F2937', '& input': { color: '#fff' }, '& fieldset': { borderColor: '#374151' } }}
                                />
                            </Box>

                            {/* Difficulty */}
                            <Box>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, mb: 1, display: 'block' }}>DIFFICULTY LEVEL</Typography>
                                <Select
                                    fullWidth
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    size="small"
                                    sx={{ bgcolor: '#1F2937', color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' }, '& .MuiSvgIcon-root': { color: '#6B7280' } }}
                                >
                                    <MenuItem value="Beginner">Beginner</MenuItem>
                                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                                    <MenuItem value="Advanced">Advanced</MenuItem>
                                </Select>
                            </Box>

                            {/* Tags */}
                            <Box>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, mb: 1, display: 'block' }}>TAGS</Typography>
                                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                                    <Chip label="Governance" onDelete={() => { }} size="small" sx={{ bgcolor: theme.colors.brand, color: '#fff' }} />
                                    <Chip label="Policy" onDelete={() => { }} size="small" sx={{ bgcolor: theme.colors.brand, color: '#fff' }} />
                                    {tags.map((tag, index) => (
                                        <Chip key={index} label={tag} onDelete={() => handleDeleteTag(tag)} size="small" sx={{ bgcolor: '#374151', color: '#fff' }} />
                                    ))}
                                </Stack>
                                <TextField
                                    fullWidth
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={handleAddTag}
                                    placeholder="Add a tag..."
                                    size="small"
                                    sx={{ bgcolor: '#1F2937', '& input': { color: '#fff' }, '& fieldset': { borderColor: '#374151' } }}
                                />
                            </Box>

                            {/* Thumbnail */}
                            <Box>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, mb: 1, display: 'block' }}>LESSON THUMBNAIL</Typography>
                                <Box sx={{
                                    height: 120,
                                    bgcolor: '#0f172a',
                                    borderRadius: 2,
                                    border: '1px solid #1F2937',
                                    backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {/* Placeholder for thumbnail image */}
                                    <Box sx={{ width: '100%', height: '100%', opacity: 0.5, background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2), transparent)' }} />
                                </Box>
                            </Box>
                        </Stack>
                    </Box>

                    <Box sx={{ p: 3, borderTop: '1px solid #1F2937' }}>
                        <Button
                            fullWidth
                            startIcon={<Delete />}
                            sx={{ color: '#9CA3AF', textTransform: 'none', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                        >
                            Delete Lesson
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default CourseEditor;

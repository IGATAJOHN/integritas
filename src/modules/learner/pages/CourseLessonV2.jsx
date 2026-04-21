import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Slider,
    Stack,
    LinearProgress,
    Avatar,
    useTheme,
    alpha
} from '@mui/material';
import {
    PlayArrow,
    Pause,
    VolumeUp,
    Settings,
    Fullscreen,
    ExpandMore,
    PlayCircleOutline,
    CheckCircle,
    Lock,
    Download,
    Subtitles,
    Menu,
    Help,
    Person,
    ArrowBack
} from '@mui/icons-material';
import logo from '../../../assets/images/integritas_logo.jpg';

/**
 * CourseLessonV2 Component
 * 
 * Alternative course lesson layout with:
 * - Left sidebar showing course progress and module navigation
 * - Top breadcrumb header
 * - Main content area with video and lesson details
 */
const CourseLessonV2 = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(135); // 2:15 in seconds
    const [duration] = useState(1125); // 18:45 in seconds
    const [expandedModule, setExpandedModule] = useState('module2');

    // Format time in mm:ss
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Mock data for course
    const course = {
        title: 'Governance Ethics 101',
        progress: 45,
        completedLessons: 12,
        totalLessons: 28
    };

    // Mock data for current lesson
    const lesson = {
        id: '2.2',
        title: 'Whistleblower Protection Mechanisms',
        lastUpdated: '2 days ago',
        description: 'In this lesson, we explore the critical frameworks necessary to protect individuals who report misconduct. Effective whistleblower protection is a cornerstone of anti-corruption strategies in both public and private sectors.',
        keyTakeaways: [
            'Legal definitions of protected disclosures.',
            'Anonymity vs. Confidentiality: Understanding the difference.',
            'Institutional reporting channels and their efficacy.'
        ],
        videoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=675&fit=crop'
    };

    // Mock data for modules
    const modules = [
        {
            id: 'module1',
            title: 'Module 1: Introduction to Transparency',
            completedLessons: 2,
            totalLessons: 2,
            duration: '24 min',
            lessons: [
                { id: '1.1', title: 'Introduction to Governance', duration: '12:00', completed: true },
                { id: '1.2', title: 'Transparency Fundamentals', duration: '12:00', completed: true }
            ]
        },
        {
            id: 'module2',
            title: 'Module 2: Anti-Corruption Strategies',
            completedLessons: 1,
            totalLessons: 3,
            duration: '45 min',
            lessons: [
                { id: '2.1', title: 'Defining Modern Corruption', duration: '12:30', completed: true },
                { id: '2.2', title: 'Whistleblower Protection Mechanisms', duration: '18:45', active: true, nowPlaying: true },
                { id: '2.3', title: 'Case Studies: Global Impact', duration: '14:03', locked: false }
            ]
        },
        {
            id: 'module3',
            title: 'Module 3: Implementation & Review',
            completedLessons: 0,
            totalLessons: 4,
            duration: '1h 02m',
            locked: true,
            lessons: [
                { id: '3.1', title: 'Implementation Strategies', duration: '15:00', locked: true },
                { id: '3.2', title: 'Monitoring & Evaluation', duration: '17:00', locked: true },
                { id: '3.3', title: 'Case Study: Local Government', duration: '15:00', locked: true },
                { id: '3.4', title: 'Final Review', duration: '15:00', locked: true }
            ]
        }
    ];

    const handleModuleChange = (panel) => (event, isExpanded) => {
        setExpandedModule(isExpanded ? panel : false);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: theme.palette.mode === 'dark' ? '#080D19' : '#F8FAFC',
            display: 'flex'
        }}>
            {/* Left Sidebar */}
            <Box
                sx={{
                    width: 280,
                    flexShrink: 0,
                    bgcolor: theme.palette.mode === 'dark' ? '#0C1322' : '#fff',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    position: 'sticky',
                    top: 0
                }}
            >
                {/* Course Header */}
                <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                            <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 600, letterSpacing: 0.5 }}>
                                CURRENT COURSE
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary, mt: 0.5 }}>
                                {course.title}
                            </Typography>
                        </Box>
                        <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                            <Settings sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>

                    {/* Progress */}
                    <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                                {course.progress}% Complete
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                {course.completedLessons}/{course.totalLessons} Lessons
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={course.progress}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: 'primary.main',
                                    borderRadius: 3
                                }
                            }}
                        />
                    </Box>
                </Box>

                {/* Module List */}
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    {modules.map((module) => (
                        <Accordion
                            key={module.id}
                            expanded={expandedModule === module.id}
                            onChange={handleModuleChange(module.id)}
                            disabled={module.locked}
                            sx={{
                                bgcolor: 'transparent',
                                boxShadow: 'none',
                                '&:before': { display: 'none' },
                                '& .MuiAccordionSummary-root': {
                                    minHeight: 56,
                                    '&.Mui-expanded': { minHeight: 56 }
                                }
                            }}
                        >
                            <AccordionSummary
                                expandIcon={
                                    module.locked ? (
                                        <Lock sx={{ color: theme.palette.text.secondary, fontSize: 18 }} />
                                    ) : (
                                        <ExpandMore sx={{ color: theme.palette.text.secondary }} />
                                    )
                                }
                                sx={{
                                    px: 2.5,
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 600,
                                            color: module.locked ? theme.palette.text.secondary : theme.palette.text.primary,
                                            mb: 0.25
                                        }}
                                    >
                                        {module.title}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                        {module.completedLessons}/{module.totalLessons} Lessons • {module.duration}
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                                <List sx={{ py: 0 }}>
                                    {module.lessons.map((lessonItem) => (
                                        <ListItemButton
                                            key={lessonItem.id}
                                            sx={{
                                                py: 1.5,
                                                pl: 3,
                                                pr: 2,
                                                bgcolor: lessonItem.active
                                                    ? alpha(theme.palette.primary.main, 0.1)
                                                    : 'transparent',
                                                borderLeft: lessonItem.active
                                                    ? `3px solid ${theme.palette.primary.main}`
                                                    : '3px solid transparent',
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                                                }
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 28 }}>
                                                {lessonItem.completed ? (
                                                    <CheckCircle sx={{ color: '#10B981', fontSize: 18 }} />
                                                ) : lessonItem.active ? (
                                                    <PlayCircleOutline sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
                                                ) : lessonItem.locked ? (
                                                    <Lock sx={{ color: theme.palette.text.secondary, fontSize: 16 }} />
                                                ) : (
                                                    <PlayCircleOutline sx={{ color: theme.palette.text.secondary, fontSize: 18 }} />
                                                )}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: lessonItem.active ? 600 : 400,
                                                                color: lessonItem.active
                                                                    ? theme.palette.primary.main
                                                                    : theme.palette.text.primary,
                                                                fontSize: '0.85rem'
                                                            }}
                                                        >
                                                            {lessonItem.title}
                                                        </Typography>
                                                        {lessonItem.nowPlaying && (
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: theme.palette.primary.main,
                                                                    fontWeight: 500
                                                                }}
                                                            >
                                                                Now Playing
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                {lessonItem.duration}
                                            </Typography>
                                        </ListItemButton>
                                    ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

                {/* Back to Dashboard Button */}
                <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button
                        fullWidth
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/explore')}
                        sx={{
                            justifyContent: 'flex-start',
                            color: theme.palette.text.secondary,
                            textTransform: 'none',
                            py: 1.5,
                            borderRadius: 2,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                            '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                color: theme.palette.text.primary
                            }
                        }}
                    >
                        Back to Dashboard
                    </Button>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Top Header / Breadcrumb */}
                <Box
                    sx={{
                        px: 3,
                        py: 1.5,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: theme.palette.mode === 'dark' ? '#0C1322' : '#fff'
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                            <Menu />
                        </IconButton>
                        <Box
                            component="img"
                            src={logo}
                            alt="Integritas"
                            sx={{ width: 32, height: 32, objectFit: 'contain', mr: 1 }}
                        />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Course / {course.title} / Module 2
                        </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Button
                            size="small"
                            startIcon={<Help sx={{ fontSize: 18 }} />}
                            sx={{
                                color: theme.palette.text.secondary,
                                textTransform: 'none',
                                '&:hover': { color: theme.palette.text.primary }
                            }}
                        >
                            Help
                        </Button>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            <Person sx={{ fontSize: 18 }} />
                        </Avatar>
                    </Stack>
                </Box>

                {/* Lesson Content */}
                <Box sx={{ flex: 1, p: 4, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ maxWidth: 800, width: '100%' }}>
                        {/* Video Player */}
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '16/9',
                                bgcolor: '#000',
                                borderRadius: 2,
                                overflow: 'hidden',
                                mb: 4
                            }}
                        >
                            {/* Video Thumbnail */}
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundImage: `url(${lesson.videoUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative'
                                }}
                            >
                                <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)' }} />

                                {/* Play Button */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setIsPlaying(!isPlaying)}
                                >
                                    <Box
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: '50%',
                                            bgcolor: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            '&:hover': {
                                                bgcolor: 'primary.dark',
                                                transform: 'scale(1.1)',
                                                transition: 'all 0.2s ease'
                                            }
                                        }}
                                    >
                                        {isPlaying ? (
                                            <Pause sx={{ color: '#fff', fontSize: 32 }} />
                                        ) : (
                                            <PlayArrow sx={{ color: '#fff', fontSize: 32, ml: 0.5 }} />
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Video Controls */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    bgcolor: 'rgba(0,0,0,0.8)',
                                    p: 1.5
                                }}
                            >
                                <Slider
                                    value={(currentTime / duration) * 100}
                                    onChange={(e, value) => setCurrentTime((value / 100) * duration)}
                                    sx={{
                                        color: 'primary.main',
                                        height: 4,
                                        p: 0,
                                        mb: 1,
                                        '& .MuiSlider-thumb': {
                                            width: 12,
                                            height: 12,
                                            '&:hover': { boxShadow: 'none' }
                                        },
                                        '& .MuiSlider-rail': {
                                            bgcolor: 'rgba(255,255,255,0.3)'
                                        }
                                    }}
                                />

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <IconButton size="small" sx={{ color: '#fff' }} onClick={() => setIsPlaying(!isPlaying)}>
                                            {isPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                                        </IconButton>
                                        <IconButton size="small" sx={{ color: '#fff' }}>
                                            <VolumeUp fontSize="small" />
                                        </IconButton>
                                        <Typography variant="caption" sx={{ color: '#fff', ml: 1 }}>
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </Typography>
                                    </Stack>

                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <IconButton size="small" sx={{ color: '#fff' }}>
                                            <Subtitles fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" sx={{ color: '#fff' }}>
                                            <Settings fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" sx={{ color: '#fff' }}>
                                            <Fullscreen fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </Box>
                            </Box>
                        </Box>

                        {/* Lesson Details */}
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
                                {lesson.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                                Last updated {lesson.lastUpdated}
                            </Typography>

                            <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 4, lineHeight: 1.8 }}>
                                {lesson.description}
                            </Typography>

                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 2 }}>
                                Key Takeaways
                            </Typography>
                            <Box sx={{ mb: 4 }}>
                                {lesson.keyTakeaways.map((takeaway, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mr: 1 }}>•</Typography>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                            {takeaway}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Action Buttons */}
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Download />}
                                    sx={{
                                        borderColor: theme.palette.divider,
                                        color: theme.palette.text.primary,
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        '&:hover': {
                                            borderColor: theme.palette.primary.main,
                                            color: theme.palette.primary.main
                                        }
                                    }}
                                >
                                    Download Transcript
                                </Button>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        borderColor: theme.palette.divider,
                                        color: theme.palette.text.primary,
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        '&:hover': {
                                            borderColor: theme.palette.primary.main,
                                            color: theme.palette.primary.main
                                        }
                                    }}
                                >
                                    View Case Study PDF
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default CourseLessonV2;

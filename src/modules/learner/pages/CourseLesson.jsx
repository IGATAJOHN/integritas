import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Slider,
    Stack,
    Chip,
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
    ChevronLeft,
    ChevronRight,
    ExpandMore,
    PlayCircleOutline,
    CheckCircle,
    Lock,
    Download,
    Subtitles,
    Search,
    Notifications,
    Person
} from '@mui/icons-material';
import logo from '../../../assets/images/GGH_logo.png';

/**
 * CourseLesson Component
 * 
 * Full-page course lesson view with video player, lesson content,
 * notes section, and module navigation sidebar.
 * This is a standalone page without the dashboard sidebar.
 */
const CourseLesson = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(312); // 5:12 in seconds
    const [duration] = useState(930); // 15:30 in seconds
    const [expandedModule, setExpandedModule] = useState('module1');
    const [noteText, setNoteText] = useState('');

    // Format time in mm:ss
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Mock data for lesson
    const lesson = {
        id: '1.2',
        title: '1.2 Transparency in Public Office',
        module: 'Module 1: Principles of Governance',
        lastUpdated: 'Oct 2023',
        description: 'Transparency is the cornerstone of trust in public office. In this lesson, we explore the mechanisms that ensure government actions, decisions, and data are open to public scrutiny. We will cover Freedom of Information acts, open data initiatives, and the role of whistleblowers in maintaining integrity.',
        learningOutcomes: [
            'Understand the legal frameworks supporting transparency.',
            'Identify the difference between active and passive transparency.',
            'Analyze real-world case studies of transparency failures.'
        ],
        videoUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=675&fit=crop'
    };

    // Mock data for modules/lessons
    const modules = [
        {
            id: 'module1',
            title: 'Module 1: Principles',
            lessons: [
                { id: '1.1', title: '1.1 Introduction to Governance', duration: '12 min', completed: true },
                { id: '1.2', title: '1.2 Transparency in Public Office', duration: '16 min', active: true },
                { id: '1.3', title: '1.3 Accountability Mechanisms', duration: '14 min', locked: false }
            ]
        },
        {
            id: 'module2',
            title: 'Module 2: Ethics & Law',
            lessons: [
                { id: '2.1', title: '2.1 Ethical Foundations', duration: '18 min', locked: true },
                { id: '2.2', title: '2.2 Legal Frameworks', duration: '20 min', locked: true }
            ]
        },
        {
            id: 'module3',
            title: 'Module 3: Citizen Engagement',
            lessons: [
                { id: '3.1', title: '3.1 Public Participation', duration: '15 min', locked: true },
                { id: '3.2', title: '3.2 Digital Democracy', duration: '17 min', locked: true }
            ]
        }
    ];

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleModuleChange = (panel) => (event, isExpanded) => {
        setExpandedModule(isExpanded ? panel : false);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: theme.palette.mode === 'dark' ? '#080D19' : '#F8FAFC',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Top Header */}
            <Box
                sx={{
                    bgcolor: theme.palette.mode === 'dark' ? '#0C1322' : '#fff',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    px: 3,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >


                // ... (existing imports)

                {/* Left: Logo and Search */}
                <Stack direction="row" alignItems="center" spacing={3}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate('/explore')}
                    >
                        <Box
                            component="img"
                            src={logo}
                            alt="Integritas Hub"
                            sx={{ width: 32, height: 32, objectFit: 'contain' }}
                        />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                            Integritas Hub
                        </Typography>
                    </Stack>

                    <TextField
                        size="small"
                        placeholder="Search"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            width: 200,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                                borderRadius: 2,
                                '& fieldset': { border: 'none' }
                            },
                            '& .MuiInputBase-input': {
                                color: theme.palette.text.primary,
                                py: 0.75,
                                '&::placeholder': {
                                    color: theme.palette.text.secondary,
                                    opacity: 1
                                }
                            }
                        }}
                    />
                </Stack>

                {/* Right: Navigation */}
                <Stack direction="row" alignItems="center" spacing={3}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: theme.palette.text.secondary,
                            cursor: 'pointer',
                            '&:hover': { color: theme.palette.text.primary }
                        }}
                    >
                        Browse Catalog
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/explore')}
                    >
                        My Dashboard
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: theme.palette.text.secondary,
                            cursor: 'pointer',
                            '&:hover': { color: theme.palette.text.primary }
                        }}
                    >
                        Community
                    </Typography>
                    <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                        <Notifications fontSize="small" />
                    </IconButton>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        <Person sx={{ fontSize: 18 }} />
                    </Avatar>
                </Stack>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ display: 'flex', flex: 1 }}>
                {/* Left Content */}
                <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
                    {/* Video Player */}
                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '16/9',
                            bgcolor: '#000',
                            borderRadius: 2,
                            overflow: 'hidden',
                            mb: 3
                        }}
                    >
                        {/* Video Thumbnail/Placeholder */}
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
                            {/* Dark Overlay */}
                            <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)' }} />

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
                            {/* Progress Bar */}
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

                    {/* Lesson Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
                                {lesson.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                {lesson.module} • Last updated {lesson.lastUpdated}
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                startIcon={<ChevronLeft />}
                                sx={{
                                    borderColor: theme.palette.divider,
                                    color: theme.palette.text.primary,
                                    textTransform: 'none',
                                    '&:hover': { borderColor: theme.palette.text.secondary }
                                }}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="contained"
                                endIcon={<ChevronRight />}
                                sx={{ textTransform: 'none' }}
                            >
                                Next Lesson
                            </Button>
                        </Stack>
                    </Box>

                    {/* Content Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: theme.palette.divider, mb: 3 }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            sx={{
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    color: theme.palette.text.secondary,
                                    fontWeight: 500,
                                    minWidth: 'auto',
                                    px: 2,
                                    '&.Mui-selected': {
                                        color: theme.palette.primary.main
                                    }
                                }
                            }}
                        >
                            <Tab label="Overview" />
                            <Tab label="Notes & Bookmarks" />
                            <Tab label="Resources (3)" />
                            <Tab label="Discussion" />
                        </Tabs>
                    </Box>

                    {/* Tab Content */}
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        {/* Left: Course Content */}
                        <Box sx={{ flex: 1 }}>
                            {activeTab === 0 && (
                                <Box>
                                    <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 3, lineHeight: 1.8 }}>
                                        {lesson.description}
                                    </Typography>

                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 2 }}>
                                        Key Learning Outcomes:
                                    </Typography>
                                    <List sx={{ pl: 2 }}>
                                        {lesson.learningOutcomes.map((outcome, index) => (
                                            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                    • {outcome}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </List>
                                </Box>
                            )}

                            {activeTab === 1 && (
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                    Your notes and bookmarks will appear here.
                                </Typography>
                            )}

                            {activeTab === 2 && (
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                    Downloadable resources for this lesson.
                                </Typography>
                            )}

                            {activeTab === 3 && (
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                    Join the discussion with other learners.
                                </Typography>
                            )}
                        </Box>

                        {/* Right: Take a Note Section */}
                        <Box sx={{ width: 300, flexShrink: 0 }}>
                            <Card
                                sx={{
                                    bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#fff',
                                    borderRadius: 2,
                                    boxShadow: theme.shadows[1],
                                    position: 'sticky',
                                    top: 16
                                }}
                            >
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                            Take a Note
                                        </Typography>
                                        <Chip
                                            label={`At ${formatTime(currentTime)}`}
                                            size="small"
                                            sx={{
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                color: theme.palette.primary.main,
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                    </Box>

                                    <TextField
                                        multiline
                                        rows={4}
                                        placeholder="Type your observation here..."
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        fullWidth
                                        sx={{
                                            mb: 2,
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                                                '& fieldset': {
                                                    borderColor: theme.palette.divider
                                                }
                                            },
                                            '& .MuiInputBase-input': {
                                                color: theme.palette.text.primary,
                                                '&::placeholder': {
                                                    color: theme.palette.text.secondary,
                                                    opacity: 1
                                                }
                                            }
                                        }}
                                    />

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            py: 1
                                        }}
                                    >
                                        Save Note
                                    </Button>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                </Box>

                {/* Right Sidebar - Module Navigation */}
                <Box
                    sx={{
                        width: 300,
                        flexShrink: 0,
                        bgcolor: theme.palette.mode === 'dark' ? '#0C1322' : '#fff',
                        borderLeft: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Module Accordions */}
                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        {modules.map((module) => (
                            <Accordion
                                key={module.id}
                                expanded={expandedModule === module.id}
                                onChange={handleModuleChange(module.id)}
                                sx={{
                                    bgcolor: 'transparent',
                                    boxShadow: 'none',
                                    '&:before': { display: 'none' },
                                    '& .MuiAccordionSummary-root': {
                                        bgcolor: theme.palette.mode === 'dark' ? '#0F172A' : '#f1f5f9',
                                        minHeight: 48,
                                        '&.Mui-expanded': { minHeight: 48 }
                                    }
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMore sx={{ color: theme.palette.text.secondary }} />}
                                    sx={{ px: 2 }}
                                >
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                        {module.title}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                    <List sx={{ py: 0 }}>
                                        {module.lessons.map((lessonItem) => (
                                            <ListItemButton
                                                key={lessonItem.id}
                                                sx={{
                                                    py: 1.5,
                                                    px: 2,
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
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    {lessonItem.completed ? (
                                                        <CheckCircle sx={{ color: '#10B981', fontSize: 18 }} />
                                                    ) : lessonItem.active ? (
                                                        <PlayCircleOutline sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
                                                    ) : lessonItem.locked ? (
                                                        <Lock sx={{ color: theme.palette.text.secondary, fontSize: 18 }} />
                                                    ) : (
                                                        <PlayCircleOutline sx={{ color: theme.palette.text.secondary, fontSize: 18 }} />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={lessonItem.title}
                                                    secondary={lessonItem.duration}
                                                    primaryTypographyProps={{
                                                        variant: 'body2',
                                                        fontWeight: lessonItem.active ? 600 : 400,
                                                        color: lessonItem.active
                                                            ? theme.palette.primary.main
                                                            : theme.palette.text.primary
                                                    }}
                                                    secondaryTypographyProps={{
                                                        variant: 'caption',
                                                        color: theme.palette.text.secondary
                                                    }}
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>

                    {/* Download Syllabus Button */}
                    <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                        <Button
                            variant="outlined"
                            fullWidth
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
                            Download Syllabus
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default CourseLesson;

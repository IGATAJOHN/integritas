import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
    Stack,
    Avatar,
    Chip,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import {
    PlayArrow,
    AccessTime,
    EmojiEvents,
    School,
    TrendingUp
} from '@mui/icons-material';

/**
 * LearnerDashboard Component
 * 
 * This component displays the main dashboard for the learner.
 * It includes sections for continuing learning, active courses, achievements,
 * recommended courses, and upcoming deadlines.
 * 
 * It uses Material UI components and the application theme for styling,
 * supporting both light and dark modes.
 */
const LearnerDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    // ==========================================
    // Mock Data
    // ==========================================

    // Data for the "Continue Learning" hero section
    const continueLearning = {
        title: 'Ethics in Public Administration',
        description: 'Deep dive into the ethical frameworks governing public service, focusing on practical scenarios and conflict resolution.',
        progress: 75,
        module: 'Module 4: Conflict of Interest',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop'
    };

    // List of active courses the user is currently enrolled in
    const activeCourses = [
        {
            id: 1,
            title: 'Data Privacy for Civil Servants',
            type: 'Video',
            remaining: '45m remaining',
            progress: 30,
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&h=100&fit=crop'
        },
        {
            id: 2,
            title: 'Policy Analysis 101',
            type: 'Quiz',
            remaining: 'Due Tomorrow',
            progress: 90,
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&h=100&fit=crop'
        }
    ];

    // List of recommended courses based on user's interests
    const recommendedCourses = [
        {
            id: 1,
            title: 'Strategic Planning in Gov',
            category: 'Leadership',
            duration: '4h',
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop'
        },
        {
            id: 2,
            title: 'Effective Public Speaking',
            category: 'Communication',
            duration: '2.5h',
            image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=400&h=250&fit=crop'
        },
        {
            id: 3,
            title: 'Digital Transformation',
            category: 'Technology',
            duration: '6h',
            image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop'
        }
    ];

    // List of upcoming deadlines and events
    const upcomingDeadlines = [
        {
            id: 1,
            title: 'Policy Memo Draft',
            course: 'Policy Analysis 101',
            date: 'OCT 24',
            tag: 'Due in 2 days',
            tagColor: 'error'
        },
        {
            id: 2,
            title: 'Live Webinar: Integrity',
            course: 'General Workshop',
            date: 'OCT 28',
            tag: 'Online Event',
            tagColor: 'primary'
        }
    ];

    return (
        <Box>
            {/* 
                Continue Learning Section 
                Displays the most recent course the user was working on.
            */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: theme.palette.text.primary }}>
                Continue Learning
            </Typography>
            <Card
                sx={{
                    mb: 5,
                    bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#fff', // Darker background in dark mode
                    color: theme.palette.text.primary,
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: theme.shadows[2]
                }}
            >
                <Grid container>
                    {/* Course Image */}
                    <Grid item xs={12} md={4}>
                        <Box
                            sx={{
                                height: '100%',
                                minHeight: 200,
                                backgroundImage: `url(${continueLearning.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                position: 'relative'
                            }}
                        >
                            <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)' }} />
                        </Box>
                    </Grid>

                    {/* Course Details */}
                    <Grid item xs={12} md={8}>
                        <Box sx={{ p: 3 }}>
                            <Chip
                                label={continueLearning.module}
                                size="small"
                                sx={{ bgcolor: 'primary.main', color: '#fff', mb: 2, borderRadius: 1 }}
                            />
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                {continueLearning.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                                {continueLearning.description}
                            </Typography>

                            {/* Progress Bar */}
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Progress</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{continueLearning.progress}%</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={continueLearning.progress}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' }
                                    }}
                                />
                            </Box>

                            <Button
                                variant="contained"
                                startIcon={<PlayArrow />}
                                onClick={() => navigate('/explore/lesson/1/1.2')}
                                sx={{ borderRadius: 2, px: 3 }}
                            >
                                Resume Course
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            <Grid container spacing={3}>
                {/* Left Column: Active Courses & Recommended */}
                <Grid item xs={12} lg={8}>

                    {/* Active Courses Grid */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                Active Courses
                            </Typography>
                            <Button size="small" sx={{ textTransform: 'none' }}>View All</Button>
                        </Box>
                        <Grid container spacing={2}>
                            {activeCourses.map((course) => (
                                <Grid item xs={12} md={6} key={course.id}>
                                    <Card
                                        sx={{
                                            bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#fff',
                                            color: theme.palette.text.primary,
                                            borderRadius: 3,
                                            p: 3,
                                            boxShadow: theme.shadows[1],
                                            height: '100%'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Avatar
                                                variant="rounded"
                                                src={course.image}
                                                sx={{ width: 60, height: 60 }}
                                            />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2, mb: 0.5 }}>
                                                    {course.title}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1 }}>
                                                    {course.type} • {course.remaining}
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={course.progress}
                                                    sx={{
                                                        height: 4,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        mb: 0.5,
                                                        '& .MuiLinearProgress-bar': { bgcolor: course.progress > 80 ? 'success.main' : 'primary.main' }
                                                    }}
                                                />
                                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, float: 'right' }}>
                                                    {course.progress}% Complete
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {/* Recommended for You Grid */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
                            Recommended for You
                        </Typography>
                        <Grid container spacing={2}>
                            {recommendedCourses.map((course) => (
                                <Grid item xs={12} md={4} key={course.id}>
                                    <Card
                                        sx={{
                                            bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#fff',
                                            color: theme.palette.text.primary,
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            height: '100%',
                                            boxShadow: theme.shadows[1]
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                height: 120,
                                                backgroundImage: `url(${course.image})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        />
                                        <CardContent sx={{ p: 3 }}>
                                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                                <Chip
                                                    label={course.category}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.65rem',
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        color: theme.palette.primary.main
                                                    }}
                                                />
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <AccessTime sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
                                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                        {course.duration}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                                {course.title}
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                size="small"
                                                onClick={() => navigate('/checkout')}
                                                sx={{
                                                    borderColor: theme.palette.divider,
                                                    color: theme.palette.text.primary,
                                                    '&:hover': { borderColor: theme.palette.primary.main, color: theme.palette.primary.main }
                                                }}
                                            >
                                                Enroll Now
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Grid>

                {/* Right Column: Achievements & Deadlines */}
                <Grid item xs={12} lg={4}>

                    {/* Achievements Card */}
                    <Card
                        sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#fff',
                            color: theme.palette.text.primary,
                            borderRadius: 3,
                            mb: 3,
                            boxShadow: theme.shadows[1]
                        }}
                    >
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Achievements</Typography>
                                <Button size="small" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>View All</Button>
                            </Box>

                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: '#F59E0B', margin: '0 auto', mb: 1 }}>
                                    <EmojiEvents sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Scholar Level 3</Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>2,450 XP</Typography>
                            </Box>

                            <Divider sx={{ borderColor: theme.palette.divider, mb: 2 }} />

                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                        <School />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Ethics Champion</Typography>
                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Earned 2 days ago</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                                        <TrendingUp />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Quick Learner</Typography>
                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Earned 1 week ago</Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Upcoming Deadlines Card */}
                    <Card
                        sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#fff',
                            color: theme.palette.text.primary,
                            borderRadius: 3,
                            boxShadow: theme.shadows[1]
                        }}
                    >
                        <CardContent sx={{ p: 2.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Upcoming Deadlines</Typography>
                            <Stack spacing={2}>
                                {upcomingDeadlines.map((item) => (
                                    <Box key={item.id} sx={{ display: 'flex', gap: 2 }}>
                                        <Box sx={{
                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                            borderRadius: 2,
                                            p: 1,
                                            textAlign: 'center',
                                            minWidth: 50
                                        }}>
                                            <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
                                                {item.date.split(' ')[0]}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                                                {item.date.split(' ')[1]}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                                                {item.course}
                                            </Typography>
                                            <Chip
                                                label={item.tag}
                                                size="small"
                                                color={item.tagColor === 'error' ? 'error' : 'primary'}
                                                sx={{ height: 20, fontSize: '0.65rem' }}
                                            />
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default LearnerDashboard;

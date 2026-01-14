import React from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    LinearProgress,
    Stack,
    Avatar,
    Divider,
    IconButton,
    Chip,
    useTheme,
    alpha
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
    PlayArrow,
    EmojiEvents,
    AccessTime as TimeIcon,
    CheckCircle as CheckCircleIcon,
    School,
    TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ActiveCourseCard from '../components/ActiveCourseCard';
import RecommendedCourseCard from '../components/RecommendedCourseCard';

const LearnerDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    // Mock Data
    const activeCourse = {
        title: 'Ethics in Public Administration',
        subtitle: 'MODULE 4: CONFLICT OF INTEREST',
        description: 'Deep dive into the ethical frameworks governing public service, focusing on practical scenarios and conflict resolution.',
        progress: 75,
        image: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800&q=80'
    };

    const activeCourses = [
        {
            id: 1,
            title: 'Data Privacy for Civil Servants',
            type: 'Video • 45m remaining',
            progress: 30,
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80'
        },
        {
            id: 2,
            title: 'Data Privacy for Civil Servants',
            type: 'Video • 45m remaining',
            progress: 30,
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80'
        }
    ];

    const recommendedCourses = [
        {
            id: 3,
            title: 'Strategic Planning in Gov',
            category: 'Leadership',
            duration: '4h',
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'
        },
        {
            id: 4,
            title: 'Effective Public Speaking',
            category: 'Communication',
            duration: '2.5h',
            image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800&q=80'
        },
        {
            id: 5,
            title: 'Digital Transformation',
            category: 'Technology',
            duration: '6h',
            image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80'
        }
    ];

    const upcomingDeadlines = [
        {
            id: 1,
            month: 'OCT',
            day: '24',
            title: 'Policy Memo Draft',
            subtitle: 'Policy Analysis 101',
            status: 'Due in 2 days',
            statusColor: '#EF4444', // Red
            tag: 'Urgent',
            tagColor: 'error',
            course: 'Policy Analysis 101',
            date: 'OCT 24'
        },
        {
            id: 2,
            month: 'OCT',
            day: '28',
            title: 'Live Webinar: Integrity',
            subtitle: 'General Workshop',
            status: 'Online Event',
            statusColor: '#3B82F6', // Blue
            tag: 'Optional',
            tagColor: 'primary',
            course: 'General Workshop',
            date: 'OCT 28'
        }
    ];

    const recentAchievements = [
        {
            id: 1,
            title: 'Ethics Champion',
            date: 'Earned 2 days ago',
            icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
            color: '#3B82F6'
        },
        {
            id: 2,
            title: 'Quick Learner',
            date: 'Earned 1 week ago',
            icon: <TimeIcon sx={{ fontSize: 16 }} />,
            color: '#10B981'
        }
    ];

    return (
        <Box sx={{ color: '#fff', px: { xs: 2, md: 6 }, pb: 6, maxWidth: '1216px', mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Welcome back, Alex
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Box component="span" sx={{ fontSize: '1.2rem' }}>🔥</Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            You're on a 3-day learning streak. Keep it up!
                        </Typography>
                    </Stack>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<CalendarIcon />}
                    sx={{
                        color: '#fff',
                        borderColor: 'rgba(255,255,255,0.2)',
                        textTransform: 'none',
                        '&:hover': { borderColor: '#fff' }
                    }}
                >
                    View Calendar
                </Button>
            </Box>

            {/* Content Grid */}
            <Grid container spacing={4}>
                {/* Continue Learning Section - Full Width */}
                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        Continue Learning
                    </Typography>

                    {/* Hero Course Card */}
                    <Card sx={{
                        bgcolor: '#1e293b',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        color: '#fff',
                        mb: 4,
                        overflow: 'hidden',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        minHeight: { md: 294 }
                    }}>
                        <Box sx={{
                            width: { xs: '100%', md: '35%' },
                            height: { xs: 200, md: 'auto' },
                            position: 'relative'
                        }}>
                            <Box
                                component="img"
                                src={activeCourse.image}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    opacity: 0.6
                                }}
                            />
                            {/* Gradient Overlay */}
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(90deg, rgba(28,31,39,0) 0%, rgba(28,31,39,1) 100%)',
                                display: { xs: 'none', md: 'block' }
                            }} />
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(180deg, rgba(28,31,39,0) 0%, rgba(28,31,39,1) 100%)',
                                display: { xs: 'block', md: 'none' }
                            }} />
                        </Box>

                        <Box sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#3B82F6', fontWeight: 700, mb: 1, display: 'block', bgcolor: 'rgba(59, 130, 246, 0.1)', width: 'fit-content', px: 1, py: 0.5, borderRadius: 0.5 }}>
                                {activeCourse.subtitle}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                                {activeCourse.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                                {activeCourse.description}
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Progress</Typography>
                                    <Typography variant="caption" sx={{ color: '#fff' }}>{activeCourse.progress}%</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={activeCourse.progress}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        '& .MuiLinearProgress-bar': { bgcolor: '#3B82F6' },
                                        height: 8,
                                        borderRadius: 4
                                    }}
                                />
                            </Box>

                            <Button
                                variant="contained"
                                startIcon={<PlayArrow />}
                                onClick={() => navigate('/explore/lesson/1/1.2')}
                                sx={{
                                    bgcolor: '#2563EB',
                                    color: '#fff',
                                    width: 'fit-content',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    '&:hover': { bgcolor: '#1D4ED8' }
                                }}
                            >
                                Resume Course
                            </Button>
                        </Box>
                    </Card>
                </Grid>

                {/* Left Column - Main Content */}
                <Grid item xs={12} lg={9}>

                    {/* Active Courses */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Active Courses</Typography>
                        <Typography variant="caption" sx={{ color: '#3B82F6', cursor: 'pointer' }}>View All</Typography>
                    </Box>

                    <Grid container spacing={3} sx={{ mb: 5, display: 'flex', flexWrap: 'nowrap' }}>
                        {activeCourses.map(course => (
                            <Grid item xs={6} md={6} key={course.id}>
                                <ActiveCourseCard course={course} />
                            </Grid>
                        ))}
                    </Grid>

                    {/* Recommended for You */}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recommended for You</Typography>
                    <Grid container spacing={2} justifyContent="space-between">
                        {recommendedCourses.map(course => (
                            <Grid item xs={12} md={5} key={course.id}>
                                <RecommendedCourseCard course={course} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                {/* Right Column - Sidebar */}
                <Grid item xs={12} lg={3}>

                    {/* Achievements Widget */}
                    <Box sx={{ mb: 4, width: '295px' }}>
                        <Card sx={{ bgcolor: '#1e293b', color: '#fff', borderRadius: 2, p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Achievements</Typography>
                                <Typography variant="caption" sx={{ color: '#3B82F6', cursor: 'pointer' }}>View All</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                                <Box sx={{ position: 'relative', width: 80, height: 80, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F59E0B', borderRadius: '50%' }}>
                                    <EmojiEvents sx={{ fontSize: 40, color: '#fff' }} />
                                    {/* Glow effect */}
                                    <Box sx={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '4px solid rgba(245, 158, 11, 0.3)', animation: 'pulse 2s infinite' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Scholar Level 3</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>2,450 XP</Typography>
                            </Box>

                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

                            <Stack spacing={2}>
                                {recentAchievements.map(achievement => (
                                    <Box key={achievement.id} sx={{ display: 'flex', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: alpha(achievement.color, 0.1), color: achievement.color, width: 32, height: 32 }}>
                                            {achievement.icon}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{achievement.title}</Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{achievement.date}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </Card>
                    </Box>

                    {/* Upcoming Deadlines Widget */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Upcoming Deadlines</Typography>
                        <Card sx={{ bgcolor: '#1e293b', color: '#fff', borderRadius: 2, p: 3 }}>
                            <Stack spacing={3}>
                                {upcomingDeadlines.map(deadline => (
                                    <Box key={deadline.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <Box sx={{
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                            borderRadius: 1,
                                            p: 1,
                                            minWidth: 48,
                                            textAlign: 'center'
                                        }}>
                                            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 10, mb: 0.5 }}>{deadline.month}</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>{deadline.day}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{deadline.title}</Typography>
                                            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.5)', mb: 0.5 }}>{deadline.subtitle}</Typography>
                                            <Chip
                                                label={deadline.status}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.65rem',
                                                    bgcolor: alpha(deadline.statusColor, 0.1),
                                                    color: deadline.statusColor
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </Card>
                    </Box>

                </Grid>
            </Grid>
        </Box>
    );
};

export default LearnerDashboard;

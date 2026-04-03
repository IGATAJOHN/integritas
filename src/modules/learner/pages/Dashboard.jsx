import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
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
    alpha,
    CircularProgress,
} from '@mui/material';
import {
    PlayArrow,
    AccessTime,
    EmojiEvents,
    School,
    TrendingUp,
    CalendarToday,
    LocalFireDepartment
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { learnerEnrollmentService, courseCatalogService } from '../services';

const LearnerDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();

    const colors = {
        card: theme.palette.mode === 'dark' ? '#1F2937' : '#FFFFFF'
    };

    const [loading, setLoading] = useState(true);
    const [continueLearning, setContinueLearning] = useState(null);
    const [activeCourses, setActiveCourses] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [completedCount, setCompletedCount] = useState(0);
    const [xpPoints, setXpPoints] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [enrollmentsRes, recommendedRes] = await Promise.allSettled([
                    learnerEnrollmentService.getEnrollments({ per_page: 20 }),
                    courseCatalogService.listCourses({ per_page: 3, sort: 'popular', status: 'published' }),
                ]);

                // Process enrollments
                if (enrollmentsRes.status === 'fulfilled') {
                    const enrollments = enrollmentsRes.value.data || [];

                    // Find most recently active enrollment for "Continue Learning"
                    const active = enrollments
                        .filter(e => e.status === 'active' || e.status === 'enrolled' || e.status === 'in_progress')
                        .sort((a, b) => new Date(b.updated_at || b.last_accessed_at || 0) - new Date(a.updated_at || a.last_accessed_at || 0));

                    if (active.length > 0) {
                        const top = active[0];
                        setContinueLearning({
                            id: top.course_id || top.id,
                            title: top.course?.title || top.course_title || 'Continue Learning',
                            description: top.course?.short_description || top.course?.summary || top.course?.description || '',
                            progress: top.progress ?? top.completion_percentage ?? 0,
                            module: top.current_lesson?.title || top.last_lesson?.title || top.current_module?.title || 'Continue where you left off',
                            image: top.course?.thumbnail_url || top.course?.cover_image_url || top.course?.image_url || null,
                        });
                    }

                    // Active courses list (up to 4)
                    const formatted = active.slice(0, 4).map(e => ({
                        id: e.course_id || e.id,
                        title: e.course?.title || e.course_title || 'Course',
                        type: e.course?.level || e.course?.type || 'Course',
                        remaining: e.progress != null ? `${100 - Math.round(e.progress)}% remaining` : 'In progress',
                        progress: Math.round(e.progress ?? e.completion_percentage ?? 0),
                        image: e.course?.thumbnail_url || e.course?.cover_image_url || e.course?.image_url || null,
                    }));
                    setActiveCourses(formatted);

                    // Completed courses for achievements
                    const completed = enrollments.filter(e => e.status === 'completed');
                    setCompletedCount(completed.length);
                    setXpPoints(completed.length * 500 + active.length * 100);
                }

                // Process recommended courses
                if (recommendedRes.status === 'fulfilled') {
                    const courses = (recommendedRes.value.data || []).slice(0, 3).map(course => ({
                        id: course.id,
                        title: course.title,
                        category: course.topic || course.topics?.[0] || 'General',
                        duration: course.duration || 'TBD',
                        image: course.image || null,
                    }));
                    setRecommendedCourses(courses);
                }
            } catch (error) {
                console.error('Learner dashboard fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    const displayName = user?.first_name || user?.name?.split(' ')[0] || 'Learner';
    const levelLabel = completedCount >= 10 ? 'Scholar Level 5' : completedCount >= 5 ? 'Scholar Level 3' : 'Scholar Level 1';


    return (
        <Box>
            {/* Welcome Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
                        Welcome back, {displayName}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <LocalFireDepartment sx={{ color: '#F59E0B', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {activeCourses.length > 0
                                ? `You have ${activeCourses.length} course${activeCourses.length > 1 ? 's' : ''} in progress. Keep it up!`
                                : 'Start a course to begin your learning journey!'}
                        </Typography>
                    </Stack>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<CalendarToday />}
                    sx={{
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.primary,
                        textTransform: 'none',
                        borderRadius: 2,
                        display: { xs: 'none', sm: 'flex' },
                        '&:hover': { borderColor: theme.palette.primary.main }
                    }}
                >
                    View Calendar
                </Button>
            </Box>

            {/* Continue Learning Section */}
            {continueLearning ? (
                <>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: theme.palette.text.primary }}>
                        Continue Learning
                    </Typography>
                    <Card
                        sx={{
                            mb: 5,
                            bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#fff',
                            color: theme.palette.text.primary,
                            borderRadius: 3,
                            overflow: 'hidden',
                            boxShadow: theme.shadows[2]
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                            {/* Course Image */}
                            <Box
                                sx={{
                                    width: { xs: '100%', md: '35%' },
                                    minHeight: { xs: 200, md: 'auto' },
                                    backgroundImage: continueLearning.image ? `url(${continueLearning.image})` : 'none',
                                    bgcolor: continueLearning.image ? 'transparent' : alpha(theme.palette.primary.main, 0.1),
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {continueLearning.image && <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)' }} />}
                                {!continueLearning.image && <School sx={{ fontSize: 64, color: theme.palette.primary.main, opacity: 0.5 }} />}
                            </Box>

                            {/* Course Details */}
                            <Box sx={{ flex: 1, p: 3 }}>
                                <Chip
                                    label={continueLearning.module}
                                    size="small"
                                    sx={{ bgcolor: 'primary.main', color: '#fff', mb: 2, borderRadius: 1 }}
                                />
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                    {continueLearning.title}
                                </Typography>
                                {continueLearning.description && (
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                                        {continueLearning.description}
                                    </Typography>
                                )}

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
                                    onClick={() => navigate(`/learner/my-enrollments`)}
                                    sx={{ borderRadius: 2, px: 3 }}
                                >
                                    Resume Course
                                </Button>
                            </Box>
                        </Box>
                    </Card>
                </>
            ) : (
                <Card sx={{ mb: 5, bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#fff', borderRadius: 3, p: 4, textAlign: 'center' }}>
                    <School sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        No courses in progress
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Enroll in a course to start your learning journey.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/learner/explore')} sx={{ borderRadius: 2 }}>
                        Explore Courses
                    </Button>
                </Card>
            )}

            {/* Main Content - Active Courses, Recommended, and Sidebar */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, width: '100%' }}>
                {/* Left Column: Active Courses & Recommended */}
                <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(66.67% - 12px)' }, minWidth: 0 }}>

                    {/* Active Courses */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                Active Courses
                            </Typography>
                            <Button size="small" sx={{ textTransform: 'none', color: '#3B82F6' }} onClick={() => navigate('/learner/my-enrollments')}>View All</Button>
                        </Box>
                        {activeCourses.length === 0 ? (
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                No active courses. Browse the catalog to enroll.
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {activeCourses.map((course) => (
                                    <Box key={course.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                                        <Card
                                            sx={{
                                                bgcolor: colors.card,
                                                color: theme.palette.text.primary,
                                                borderRadius: 2,
                                                p: 2,
                                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                                height: '100%'
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Avatar
                                                    variant="rounded"
                                                    src={course.image}
                                                    sx={{ width: 60, height: 60, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                                                >
                                                    <School sx={{ color: theme.palette.primary.main }} />
                                                </Avatar>
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
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Recommended for You */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
                            Recommended for You
                        </Typography>
                        {recommendedCourses.length === 0 ? (
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                No recommendations available.
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {recommendedCourses.map((course) => (
                                    
                                    <Box key={course.id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.33% - 10.67px)' }, minWidth: 0 }}>
                                        <Card
                                            sx={{
                                                bgcolor: colors.card,
                                                color: theme.palette.text.primary,
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                height: '100%',
                                                border: '1px solid rgba(255, 255, 255, 0.05)'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    height: 100,
                                                    backgroundImage: course.image ? `url(${course.image})` : 'none',
                                                    bgcolor: course.image ? 'transparent' : alpha(theme.palette.primary.main, 0.1),
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {!course.image && <School sx={{ fontSize: 36, color: theme.palette.primary.main, opacity: 0.5 }} />}
                                            </Box>
                                            <CardContent sx={{ p: 2 }}>
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
                                                    onClick={() => navigate(`/explore/course/${course.id}`)}
                                                    sx={{
                                                        borderColor: 'rgba(255, 255, 255, 0.1)',
                                                        color: theme.palette.text.primary,
                                                        '&:hover': { borderColor: theme.palette.primary.main, color: theme.palette.primary.main }
                                                    }}
                                                >
                                                    Enroll Now
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Right Column: Achievements */}
                <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(33.33% - 12px)' }, minWidth: 0 }}>

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
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{levelLabel}</Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{xpPoints.toLocaleString()} XP</Typography>
                            </Box>

                            <Divider sx={{ borderColor: theme.palette.divider, mb: 2 }} />

                            <Stack spacing={2}>
                                {completedCount > 0 && (
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                            <School />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Course Completer</Typography>
                                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{completedCount} course{completedCount > 1 ? 's' : ''} completed</Typography>
                                        </Box>
                                    </Box>
                                )}
                                {activeCourses.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                                            <TrendingUp />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Active Learner</Typography>
                                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{activeCourses.length} course{activeCourses.length > 1 ? 's' : ''} in progress</Typography>
                                        </Box>
                                    </Box>
                                )}
                                {completedCount === 0 && activeCourses.length === 0 && (
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textAlign: 'center', display: 'block' }}>
                                        Complete courses to earn achievements!
                                    </Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};

export default LearnerDashboard;

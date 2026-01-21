import React from 'react';
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
    alpha
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

const LearnerDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const colors = {
        card: theme.palette.mode === 'dark' ? '#1F2937' : '#FFFFFF'
    };


    const continueLearning = {
        title: 'Ethics in Public Administration',
        description: 'Deep dive into the ethical frameworks governing public service, focusing on practical scenarios and conflict resolution.',
        progress: 75,
        module: 'Module 4: Conflict of Interest',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop'
    };

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
            {/* Welcome Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
                        Welcome back, Alex
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <LocalFireDepartment sx={{ color: '#F59E0B', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            You're on a 3-day learning streak. Keep it up!
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
                            backgroundImage: `url(${continueLearning.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative'
                        }}
                    >
                        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)' }} />
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
                </Box>
            </Card>

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
                            <Button size="small" sx={{ textTransform: 'none', color: '#3B82F6' }}>View All</Button>
                        </Box>
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
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Recommended for You */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
                            Recommended for You
                        </Typography>
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
                                                backgroundImage: `url(${course.image})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        />
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
                                                onClick={() => navigate('/checkout')}
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
                    </Box>
                </Box>

                {/* Right Column: Achievements & Deadlines */}
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
                </Box>
            </Box>
        </Box>
    );
};

export default LearnerDashboard;

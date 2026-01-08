import React from 'react';
import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    Button,
    LinearProgress,
    Stack,
    Avatar,
    IconButton,
    useTheme,
    alpha,
    Chip
} from '@mui/material';
import {
    TrendingUp,
    School,
    AccessTime,
    LocalFireDepartment,
    Download,
    Share,
    CheckCircle,
    Lock,
    ArrowForward,
    MoreVert,
    EmojiEvents,
    Psychology,
    RocketLaunch
} from '@mui/icons-material';

/**
 * MyProgress Component
 * 
 * Displays learner's progress, stats, activity chart, skills mastery, and badges.
 * Matches the "Progress & Achievements" design.
 */
const MyProgress = () => {
    const theme = useTheme();

    // Mock Data
    const stats = [
        { label: 'COURSES', value: '12', trend: '+2 this month', icon: <School />, color: '#3B82F6' },
        { label: 'AVG. SCORE', value: '85%', trend: '+5% vs last month', icon: <TrendingUp />, color: '#10B981' },
        { label: 'LEARNING HOURS', value: '45h', trend: '+12h this week', icon: <AccessTime />, color: '#F59E0B' },
        { label: 'STREAK', value: '7 Days', trend: 'Keep it up!', icon: <LocalFireDepartment />, color: '#EF4444' }
    ];

    const weeklyActivity = [
        { day: 'Mon', value: 30 },
        { day: 'Tue', value: 45 },
        { day: 'Wed', value: 25 },
        { day: 'Thu', value: 60 },
        { day: 'Fri', value: 40 },
        { day: 'Sat', value: 20 },
        { day: 'Sun', value: 10 }
    ];

    const skills = [
        { name: 'Public Policy', progress: 92, color: '#0EA5E9' },
        { name: 'Ethical Leadership', progress: 78, color: '#0EA5E9' },
        { name: 'Civic Engagement', progress: 64, color: '#0EA5E9' },
        { name: 'Data Analysis', progress: 45, color: '#0EA5E9' }
    ];

    const continueLearning = [
        {
            id: 1,
            title: 'Digital Governance Systems',
            module: 'Module 4: Implementing e-Services',
            progress: 75,
            remaining: '15m remaining',
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop'
        },
        {
            id: 2,
            title: 'Ethics in Public Service',
            module: 'Module 2: Conflict of Interest',
            progress: 30,
            remaining: '45m remaining',
            image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop'
        }
    ];

    const badges = [
        { name: 'Policy Pro', icon: <CheckCircle />, color: '#0EA5E9', earned: true },
        { name: 'Thought Leader', icon: <Psychology />, color: '#0EA5E9', earned: true },
        { name: 'Fast Starter', icon: <RocketLaunch />, color: '#0EA5E9', earned: true },
        { name: 'Scholar', icon: <Lock />, color: '#64748B', earned: false },
        { name: 'Mentor', icon: <Lock />, color: '#64748B', earned: false },
        { name: 'Guardian', icon: <Lock />, color: '#64748B', earned: false }
    ];

    return (
        <Box sx={{ minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
                        My Progress
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                        Track your journey and milestones in Good Governance.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        sx={{
                            borderColor: theme.palette.divider,
                            color: theme.palette.text.secondary,
                            textTransform: 'none',
                            '&:hover': { borderColor: theme.palette.text.primary, color: theme.palette.text.primary }
                        }}
                    >
                        Export Report
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Share />}
                        sx={{
                            bgcolor: '#0EA5E9',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#0284C7' }
                        }}
                    >
                        Share Stats
                    </Button>
                </Stack>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card sx={{
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
                            borderRadius: 3,
                            border: `1px solid ${theme.palette.divider}`,
                            height: '100%',
                            minHeight: 160,
                            boxShadow: theme.shadows[1],
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary, letterSpacing: 1 }}>
                                        {stat.label}
                                    </Typography>
                                    <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="caption" sx={{ color: stat.color, fontWeight: 500 }}>
                                    {stat.trend}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                {/* Left Column */}
                <Grid item xs={12} lg={8}>
                    {/* Weekly Activity Chart */}
                    <Card sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        mb: 4,
                        boxShadow: theme.shadows[1]
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                    Weekly Activity
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ bgcolor: alpha(theme.palette.text.primary, 0.05), p: 0.5, borderRadius: 1 }}>
                                    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 0.5, bgcolor: alpha(theme.palette.text.primary, 0.1), cursor: 'pointer' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Week</Typography>
                                    </Box>
                                    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 0.5, cursor: 'pointer' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Month</Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Custom Bar Chart */}
                            <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', px: 2 }}>
                                {weeklyActivity.map((item, index) => (
                                    <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '100%' }}>
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: `${item.value * 2}px`,
                                                bgcolor: item.day === 'Thu' ? '#0EA5E9' : alpha(theme.palette.text.primary, 0.1),
                                                borderRadius: 4,
                                                transition: 'height 0.3s ease'
                                            }}
                                        />
                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                            {item.day}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Continue Learning */}
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 2 }}>
                        Continue Learning
                    </Typography>
                    <Stack spacing={2}>
                        {continueLearning.map((course) => (
                            <Card key={course.id} sx={{
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
                                borderRadius: 3,
                                border: `1px solid ${theme.palette.divider}`,
                                transition: 'transform 0.2s',
                                boxShadow: theme.shadows[1],
                                '&:hover': { transform: 'translateY(-2px)' }
                            }}>
                                <CardContent sx={{ p: 2, display: 'flex', gap: 3, alignItems: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 160,
                                            height: 90,
                                            borderRadius: 2,
                                            backgroundImage: `url(${course.image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            flexShrink: 0
                                        }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                                {course.title}
                                            </Typography>
                                            <Chip
                                                label="In Progress"
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.65rem',
                                                    bgcolor: '#0EA5E9',
                                                    color: '#fff',
                                                    fontWeight: 600
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                            {course.module}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={course.progress}
                                                sx={{
                                                    flex: 1,
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: alpha(theme.palette.text.primary, 0.1),
                                                    '& .MuiLinearProgress-bar': { bgcolor: '#0EA5E9' }
                                                }}
                                            />
                                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                {course.remaining}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                {course.progress}% Completed
                                            </Typography>
                                            <Button
                                                size="small"
                                                endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                                                sx={{
                                                    color: '#0EA5E9',
                                                    textTransform: 'none',
                                                    p: 0,
                                                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                                                }}
                                            >
                                                Resume Course
                                            </Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} lg={4}>
                    {/* Skills Mastery */}
                    <Card sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        mb: 4,
                        boxShadow: theme.shadows[1]
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 3 }}>
                                Skills Mastery
                            </Typography>
                            <Stack spacing={3}>
                                {skills.map((skill, index) => (
                                    <Box key={index}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                                                {skill.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: skill.color, fontWeight: 700 }}>
                                                {skill.progress}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={skill.progress}
                                            sx={{
                                                height: 6,
                                                borderRadius: 3,
                                                bgcolor: alpha(theme.palette.text.primary, 0.1),
                                                '& .MuiLinearProgress-bar': { bgcolor: skill.color }
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Badges */}
                    <Card sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.shadows[1]
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                    Badges
                                </Typography>
                                <Button size="small" sx={{ color: '#0EA5E9', textTransform: 'none' }}>
                                    View All
                                </Button>
                            </Box>

                            <Grid container spacing={2}>
                                {badges.map((badge, index) => (
                                    <Grid item xs={4} key={index}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
                                            <Box sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: '50%',
                                                border: `2px solid ${badge.earned ? badge.color : alpha(theme.palette.text.primary, 0.1)}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: badge.earned ? badge.color : alpha(theme.palette.text.primary, 0.2),
                                                bgcolor: badge.earned ? alpha(badge.color, 0.1) : 'transparent'
                                            }}>
                                                {badge.icon}
                                            </Box>
                                            <Typography variant="caption" sx={{ color: badge.earned ? theme.palette.text.primary : theme.palette.text.secondary, fontWeight: 500 }}>
                                                {badge.name}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MyProgress;

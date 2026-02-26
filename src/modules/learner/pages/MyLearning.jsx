import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Chip,
    Grid,
    InputBase,
    LinearProgress,
    Paper,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import {
    AccessTime,
    CheckCircle,
    Search,
} from '@mui/icons-material';

const tabs = ['All Courses', 'In Progress', 'Completed', 'Certificates'];

const courses = [
    {
        id: 1,
        title: 'Introduction to Public Policy',
        instructor: 'Dr. Sarah Jenkins',
        category: 'PUBLIC POLICY',
        categoryColor: '#2563EB',
        status: 'IN PROGRESS',
        progress: 65,
        lastAccessed: '2h ago',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop',
    },
    {
        id: 2,
        title: 'Ethics in Leadership',
        instructor: 'Prof. Michael Chang',
        category: 'ETHICS',
        categoryColor: '#EC4899',
        status: 'IN PROGRESS',
        progress: 32,
        lastAccessed: '1d ago',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop',
    },
    {
        id: 3,
        title: 'Strategic Urban Planning',
        instructor: 'Elena Rodriguez',
        category: 'MANAGEMENT',
        categoryColor: '#6B7280',
        status: 'COMPLETED',
        finishedDate: 'Oct 12, 2023',
        hasCertificate: true,
        image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=250&fit=crop',
    },
    {
        id: 4,
        title: 'Public Sector Finance 101',
        instructor: 'David Kim',
        category: 'FINANCE',
        categoryColor: '#F97316',
        status: 'IN PROGRESS',
        progress: 15,
        lastAccessed: '3d ago',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    },
    {
        id: 5,
        title: 'Sustainable Development Goals',
        instructor: 'Dr. Amara Okafor',
        category: 'SUSTAINABILITY',
        categoryColor: '#10B981',
        status: 'COMPLETED',
        finishedDate: 'Sep 20, 2023',
        hasCertificate: true,
        image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=250&fit=crop',
    },
];

const MyLearning = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('All Courses');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCourses = useMemo(() => {
        const byTab = courses.filter((course) => {
            if (activeTab === 'All Courses') return true;
            if (activeTab === 'In Progress') return course.status === 'IN PROGRESS';
            if (activeTab === 'Completed') return course.status === 'COMPLETED';
            if (activeTab === 'Certificates') return course.hasCertificate;
            return true;
        });

        const q = String(searchTerm || '').trim().toLowerCase();
        if (!q) return byTab;

        return byTab.filter((course) =>
            String(course.title || '').toLowerCase().includes(q) ||
            String(course.instructor || '').toLowerCase().includes(q)
        );
    }, [activeTab, searchTerm]);

    const inProgressCount = courses.filter((course) => course.status === 'IN PROGRESS').length;
    const certificatesCount = courses.filter((course) => course.hasCertificate).length;

    const tabCounts = {
        'All Courses': courses.length,
        'In Progress': inProgressCount,
        Completed: courses.filter((course) => course.status === 'COMPLETED').length,
        Certificates: certificatesCount,
    };

    return (
        <Box sx={{ color: '#fff', px: { xs: 0, md: 1 }, pb: 4 }}>
            <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={2} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        My Learning
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Track and continue your learning progress.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1.25}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/explore/courses')}
                        sx={{ borderColor: '#374151', color: '#E5E7EB', textTransform: 'none' }}
                    >
                        Browse Courses
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/explore')}
                        sx={{ bgcolor: '#1152D4', textTransform: 'none', '&:hover': { bgcolor: '#0D42AF' } }}
                    >
                        Explore
                    </Button>
                </Stack>
            </Stack>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ bgcolor: '#1A2230', border: '1px solid #374151', borderRadius: 2, p: 2 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: alpha('#2563EB', 0.15), color: '#60A5FA' }}>
                                <AccessTime />
                            </Avatar>
                            <Box>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 0.5 }}>
                                    HOURS LEARNED
                                </Typography>
                                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem' }}>
                                    12h 30m
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ bgcolor: '#1A2230', border: '1px solid #374151', borderRadius: 2, p: 2 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: alpha('#10B981', 0.16), color: '#34D399' }}>
                                <CheckCircle />
                            </Avatar>
                            <Box>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 0.5 }}>
                                    CERTIFICATES
                                </Typography>
                                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem' }}>
                                    {certificatesCount}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ bgcolor: '#1A2230', border: '1px solid #374151', borderRadius: 2, p: 2, mb: 3 }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', lg: 'center' }}>
                    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto' }}>
                        {tabs.map((tab) => (
                            <Button
                                key={tab}
                                size="small"
                                onClick={() => setActiveTab(tab)}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 1.5,
                                    px: 1.8,
                                    color: activeTab === tab ? '#fff' : '#9CA3AF',
                                    bgcolor: activeTab === tab ? '#1152D4' : '#111827',
                                    border: activeTab === tab ? '1px solid #1D4ED8' : '1px solid #374151',
                                    '&:hover': {
                                        bgcolor: activeTab === tab ? '#0D42AF' : '#1F2937',
                                    },
                                }}
                            >
                                {tab} ({tabCounts[tab]})
                            </Button>
                        ))}
                    </Stack>

                    <Box
                        sx={{
                            bgcolor: '#111827',
                            borderRadius: 1.5,
                            px: 1.5,
                            border: '1px solid #374151',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            width: { xs: '100%', lg: 360 },
                            height: 40,
                        }}
                    >
                        <Search sx={{ color: '#9CA3AF', fontSize: 18 }} />
                        <InputBase
                            placeholder="Filter by title or instructor..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            sx={{
                                color: '#fff',
                                fontSize: '0.9rem',
                                width: '100%',
                                '& input::placeholder': { color: '#6B7280', opacity: 1 },
                            }}
                        />
                    </Box>
                </Stack>
            </Paper>

            <Grid container spacing={2}>
                {filteredCourses.map((course) => (
                    <Grid key={course.id} item xs={12} sm={6} xl={4}>
                        <Paper sx={{ bgcolor: '#1A2230', border: '1px solid #374151', borderRadius: 2, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box
                                sx={{
                                    height: 158,
                                    backgroundImage: `url(${course.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative',
                                }}
                            >
                                <Chip
                                    label={course.category}
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        left: 10,
                                        bgcolor: course.categoryColor,
                                        color: '#fff',
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        borderRadius: 1,
                                    }}
                                />
                            </Box>

                            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography sx={{ color: course.status === 'IN PROGRESS' ? '#60A5FA' : '#34D399', fontSize: '0.72rem', fontWeight: 700 }}>
                                        {course.status}
                                    </Typography>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.72rem' }}>
                                        {course.status === 'IN PROGRESS'
                                            ? `Last accessed ${course.lastAccessed}`
                                            : `Finished ${course.finishedDate}`}
                                    </Typography>
                                </Stack>

                                <Typography sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.35 }}>
                                    {course.title}
                                </Typography>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>
                                    Instructor: {course.instructor}
                                </Typography>

                                <Box sx={{ mt: 'auto' }}>
                                    {course.status === 'IN PROGRESS' ? (
                                        <>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.74rem' }}>Progress</Typography>
                                                <Typography sx={{ color: '#fff', fontSize: '0.74rem', fontWeight: 700 }}>{course.progress}%</Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={course.progress}
                                                sx={{
                                                    height: 7,
                                                    borderRadius: 10,
                                                    bgcolor: 'rgba(255,255,255,0.08)',
                                                    mb: 1.3,
                                                    '& .MuiLinearProgress-bar': { bgcolor: course.categoryColor },
                                                }}
                                            />
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={() => navigate(`/explore/lesson/${course.id}/1`)}
                                                sx={{ bgcolor: '#1152D4', textTransform: 'none', '&:hover': { bgcolor: '#0D42AF' } }}
                                            >
                                                Resume Course
                                            </Button>
                                        </>
                                    ) : (
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={0.75} alignItems="center">
                                                <CheckCircle sx={{ color: '#34D399', fontSize: 16 }} />
                                                <Typography sx={{ color: '#34D399', fontSize: '0.76rem', fontWeight: 600 }}>
                                                    Certificate Earned
                                                </Typography>
                                            </Stack>
                                            <Button
                                                size="small"
                                                onClick={() => navigate('/explore/courses')}
                                                sx={{ color: '#9CA3AF', textTransform: 'none' }}
                                            >
                                                Review
                                            </Button>
                                        </Stack>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default MyLearning;

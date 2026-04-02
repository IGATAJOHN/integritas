import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Grid,
    InputBase,
    LinearProgress,
    Paper,
    Skeleton,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import {
    AccessTime,
    CheckCircle,
    Search,
} from '@mui/icons-material';
import { learnerEnrollmentService } from '../services';

const tabs = ['All Courses', 'In Progress', 'Completed', 'Certificates'];

const normalizeStatus = (status) => {
    if (!status) return 'IN PROGRESS';
    const s = String(status).toLowerCase();
    if (s === 'completed') return 'COMPLETED';
    return 'IN PROGRESS';
};

const fallbackImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%25" height="100%25" fill="%23111827"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-size="28">Course Image</text></svg>';

const MyLearning = () => {
    const navigate = useNavigate();

    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('All Courses');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');

        learnerEnrollmentService.getMyEnrolledCourses({ per_page: 50 })
            .then((res) => {
                if (!active) return;
                setEnrollments(res.data || []);
            })
            .catch((err) => {
                if (!active) return;
                setError(err?.message || 'Failed to load your enrollments.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, []);

    const filteredEnrollments = useMemo(() => {
        const byTab = enrollments.filter((enrollment) => {
            const status = normalizeStatus(enrollment.status);
            if (activeTab === 'All Courses') return true;
            if (activeTab === 'In Progress') return status === 'IN PROGRESS';
            if (activeTab === 'Completed') return status === 'COMPLETED';
            if (activeTab === 'Certificates') return status === 'COMPLETED';
            return true;
        });

        const q = String(searchTerm || '').trim().toLowerCase();
        if (!q) return byTab;

        return byTab.filter((enrollment) => {
            const title = String(enrollment.course?.title || enrollment.course_title || '').toLowerCase();
            const instructor = String(enrollment.course?.instructor || enrollment.instructor || '').toLowerCase();
            return title.includes(q) || instructor.includes(q);
        });
    }, [enrollments, activeTab, searchTerm]);

    const completedCount = enrollments.filter((e) => normalizeStatus(e.status) === 'COMPLETED').length;
    const inProgressCount = enrollments.filter((e) => normalizeStatus(e.status) === 'IN PROGRESS').length;

    const tabCounts = {
        'All Courses': enrollments.length,
        'In Progress': inProgressCount,
        'Completed': completedCount,
        'Certificates': completedCount,
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

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ bgcolor: '#1A2230', border: '1px solid #374151', borderRadius: 2, p: 2 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: alpha('#2563EB', 0.15), color: '#60A5FA' }}>
                                <AccessTime />
                            </Avatar>
                            <Box>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 0.5 }}>
                                    COURSES ENROLLED
                                </Typography>
                                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem' }}>
                                    {loading ? <Skeleton width={60} sx={{ bgcolor: '#374151' }} /> : enrollments.length}
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
                                    {loading ? <Skeleton width={40} sx={{ bgcolor: '#374151' }} /> : completedCount}
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
                                {tab} ({tabCounts[tab] ?? 0})
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

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : filteredEnrollments.length === 0 ? (
                <Box sx={{ p: 5, textAlign: 'center', border: '1px dashed #374151', borderRadius: 2 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
                        {enrollments.length === 0 ? 'No enrollments yet' : 'No courses match your filter'}
                    </Typography>
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.9rem', mb: 2 }}>
                        {enrollments.length === 0
                            ? 'Browse and enroll in a course to get started.'
                            : 'Try a different tab or search term.'}
                    </Typography>
                    {enrollments.length === 0 && (
                        <Button
                            variant="contained"
                            onClick={() => navigate('/explore')}
                            sx={{ bgcolor: '#1152D4', textTransform: 'none', '&:hover': { bgcolor: '#0D42AF' } }}
                        >
                            Explore Courses
                        </Button>
                    )}
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {filteredEnrollments.map((enrollment) => {
                        const status = normalizeStatus(enrollment.status);
                        const progress = Number(enrollment.progress_percent || 0);
                        const title = String(enrollment.course?.title || enrollment.course_title || 'Untitled Course');
                        const instructor = String(enrollment.course?.instructor || enrollment.instructor || 'Integritas Hub');
                        const image = String(enrollment.course?.thumbnail_url || enrollment.course?.image || '').trim() || fallbackImage;
                        const courseId = enrollment.course_id || enrollment.course?.id;

                        return (
                            <Grid key={enrollment.id} item xs={12} sm={6} xl={4}>
                                <Paper sx={{ bgcolor: '#1A2230', border: '1px solid #374151', borderRadius: 2, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Box
                                        component="img"
                                        src={image}
                                        alt={title}
                                        onError={(e) => { e.currentTarget.src = fallbackImage; }}
                                        sx={{
                                            height: 158,
                                            width: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />

                                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography sx={{ color: status === 'IN PROGRESS' ? '#60A5FA' : '#34D399', fontSize: '0.72rem', fontWeight: 700 }}>
                                                {status === 'IN PROGRESS' ? 'IN PROGRESS' : 'COMPLETED'}
                                            </Typography>
                                            {enrollment.enrolled_at && (
                                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.72rem' }}>
                                                    Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </Typography>
                                            )}
                                        </Stack>

                                        <Typography sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.35 }}>
                                            {title}
                                        </Typography>
                                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>
                                            Instructor: {instructor}
                                        </Typography>

                                        <Box sx={{ mt: 'auto' }}>
                                            {status === 'IN PROGRESS' ? (
                                                <>
                                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                                                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.74rem' }}>Progress</Typography>
                                                        <Typography sx={{ color: '#fff', fontSize: '0.74rem', fontWeight: 700 }}>{progress}%</Typography>
                                                    </Stack>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={progress}
                                                        sx={{
                                                            height: 7,
                                                            borderRadius: 10,
                                                            bgcolor: 'rgba(255,255,255,0.08)',
                                                            mb: 1.3,
                                                            '& .MuiLinearProgress-bar': { bgcolor: '#2563EB' },
                                                        }}
                                                    />
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        onClick={() => courseId && navigate(`/explore/lesson/${courseId}`)}
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
                                                        onClick={() => courseId && navigate(`/explore/course/${courseId}`)}
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
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
};

export default MyLearning;

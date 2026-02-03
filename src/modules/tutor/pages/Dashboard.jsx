import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    IconButton,
    Chip,
    Alert,
    AlertTitle,
    CircularProgress,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import {
    TrendingUp,
    TrendingDown,
    Add,
    MoreHoriz,
    Group,
    RateReview,
    EmojiEvents,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { tutorCoursesService, kycService } from '../services';

const pendingReviews = [
    {
        id: 1,
        title: 'Governance Ethics Essay',
        student: 'John Doe',
        time: '3h ago',
        type: 'Essay',
        typeColor: '#7C3AED',
    },
    {
        id: 2,
        title: 'Policy Framework Quiz',
        student: 'Jane Smith',
        time: '6h ago',
        type: 'Quiz',
        typeColor: '#374151',
    },
    {
        id: 3,
        title: 'Final Thesis Draft',
        student: 'Mike Johnson',
        time: '1d ago',
        type: 'Review',
        typeColor: '#374151',
    },
];

const TutorDashboard = () => {
    const navigate = useNavigate();
    const { user, isKycComplete } = useAuth();
    const chartContainerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(0);

    // State for real data
    const [courses, setCourses] = useState([]);
    const [kycStatus, setKycStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [totalStudents, setTotalStudents] = useState(0);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Courses and KYC in parallel
                const [coursesRes, kycRes] = await Promise.allSettled([
                    tutorCoursesService.listCourses({ per_page: 5 }), // Get top 5 mainly
                    kycService.getKyc()
                ]);

                // Handle Courses
                if (coursesRes.status === 'fulfilled') {
                    const fetchedCourses = coursesRes.value.data || [];
                    setCourses(fetchedCourses);

                    // Calculate Total Students (sum of students_count from all fetched courses)
                    // Note: Ideally the API stats endpoint provides this global count, 
                    // but for now we sum from the list or use a separate stats endpoint if available.
                    // If pagination is involved, this might be partial, but sufficient for now or we need a stats endpoint.
                    // Assuming list returns recent/relevant courses.
                    const total = fetchedCourses.reduce((acc, curr) => acc + (curr.students_count || 0), 0);
                    setTotalStudents(total);
                }

                // Handle KYC
                if (kycRes.status === 'fulfilled') {
                    // Adjust based on actual API response structure for KYC
                    // kycService.getKyc returns response which might have data property
                    const kycData = kycRes.value.data || kycRes.value;
                    setKycStatus(kycData?.status || 'pending');
                } else {
                    // Default to pending or check user object if fetch fails
                    setKycStatus(user?.kyc_status || 'pending');
                }

            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Chart width observer
        const updateWidth = () => {
            if (chartContainerRef.current) {
                setChartWidth(chartContainerRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [user]);

    // Derived stats for the cards
    const statsData = [
        {
            label: 'Total Enrolled',
            value: totalStudents.toLocaleString(),
            change: '12%', // Mock change for now
            changeType: 'positive',
            icon: Group,
        },
        {
            label: 'Pending Reviews',
            value: '12', // Mock
            sublabel: 'Needs Action',
            sublabelColor: '#F59E0B',
            icon: RateReview,
        },
        {
            label: 'Course Completion Rate',
            value: '78%', // Mock
            change: '1%',
            changeType: 'negative',
            icon: EmojiEvents,
        },
    ];

    const needsKycAction = !isKycComplete() && (!kycStatus || kycStatus === 'pending' || kycStatus === 'rejected' || kycStatus === 'draft');

    if (loading) {
        return (
            <Box sx={{ p: 4, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)' }}>
            {/* KYC Alert */}
            {needsKycAction && (
                <Alert
                    severity="warning"
                    sx={{
                        mb: 4,
                        cursor: 'pointer',
                        bgcolor: 'rgba(245, 158, 11, 0.1)',
                        color: '#FCD34D',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        '& .MuiAlert-icon': { color: '#F59E0B' },
                        '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.15)' }
                    }}
                    onClick={() => navigate('/tutor/kyc')}
                >
                    <AlertTitle sx={{ fontWeight: 600 }}>Action Required: Teacher Verification</AlertTitle>
                    {kycStatus === 'rejected'
                        ? "Your previous KYC submission was rejected. Please review and resubmit."
                        : "Please complete your KYC verification to start creating courses and accepting students."}
                    <strong> Click here to complete now.</strong>
                </Alert>
            )}

            {/* Welcome Header */}
            <Box sx={{ mb: 3 }}>
                <Typography
                    sx={{
                        fontWeight: 700,
                        color: '#FFFFFF',
                        fontSize: { xs: '1.5rem', md: '1.75rem' },
                        mb: 0.5,
                    }}
                >
                    Welcome back, {user?.first_name ? `Tutor ${user.first_name}` : 'Tutor'}
                </Typography>
                <Typography sx={{ color: '#6B7280', fontSize: '0.95rem' }}>
                    Here is an overview of your courses and student performance today.
                </Typography>
            </Box>

            {/* Stats Cards Row */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, width: '100%' }}>
                {statsData.map((stat, index) => (
                    <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.33% - 16px)' }, minWidth: 0 }}>
                        <Paper
                            sx={{
                                bgcolor: '#1A2230',
                                p: 3,
                                borderRadius: 2,
                                border: '1px solid #374151',
                                minHeight: 120,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            {/* Top row - Label and Icon */}
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Typography
                                    sx={{
                                        color: '#9CA3AF',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    {stat.label}
                                </Typography>
                                <Box
                                    sx={{
                                        bgcolor: '#0C1322',
                                        borderRadius: 1.5,
                                        p: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <stat.icon sx={{ fontSize: 22, color: '#6B7280' }} />
                                </Box>
                            </Stack>

                            {/* Bottom row - Value and Change */}
                            <Stack direction="row" alignItems="baseline" spacing={1.5} sx={{ mt: 2 }}>
                                <Typography
                                    sx={{
                                        color: '#FFFFFF',
                                        fontSize: '2.5rem',
                                        fontWeight: 700,
                                        lineHeight: 1,
                                    }}
                                >
                                    {stat.value}
                                </Typography>
                                {stat.change && (
                                    <Stack direction="row" alignItems="center" spacing={0.25}>
                                        {stat.changeType === 'positive' ? (
                                            <TrendingUp sx={{ fontSize: 14, color: '#10B981' }} />
                                        ) : (
                                            <TrendingDown sx={{ fontSize: 14, color: '#EF4444' }} />
                                        )}
                                        <Typography
                                            sx={{
                                                color: stat.changeType === 'positive' ? '#10B981' : '#EF4444',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                            }}
                                        >
                                            {stat.change}
                                        </Typography>
                                    </Stack>
                                )}
                                {stat.sublabel && (
                                    <Typography
                                        sx={{
                                            color: stat.sublabelColor || '#F59E0B',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {stat.sublabel}
                                    </Typography>
                                )}
                            </Stack>
                        </Paper>
                    </Box>
                ))}
            </Box>

            {/* Main Content - Chart and Reviews */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4, width: '100%' }}>
                {/* Learner Engagement Chart */}
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(66.67% - 16px)' }, minWidth: 0 }}>
                    <Paper
                        sx={{
                            bgcolor: '#1A2230',
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid #374151',
                            height: { xs: 250, md: 280 },
                            width: '100%',
                            maxWidth: '100%',
                            overflow: 'hidden',
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Box>
                                <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.85rem' }}>
                                    Learner Engagement
                                </Typography>
                                <Typography sx={{ color: '#6B7280', fontSize: '0.65rem' }}>
                                    Video views and lesson completions (Last 30 Days)
                                </Typography>
                            </Box>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography sx={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 700 }}>
                                    15.2k
                                </Typography>
                                <Typography sx={{ color: '#10B981', fontSize: '0.7rem', fontWeight: 500 }}>
                                    +14.5%
                                </Typography>
                            </Stack>
                        </Stack>

                        <Box
                            ref={chartContainerRef}
                            sx={{
                                height: 200,
                                mt: 1,
                                width: '100%',
                                overflow: 'hidden',
                            }}
                        >
                            {chartWidth > 0 && (
                                <LineChart
                                    width={chartWidth}
                                    height={200}
                                    xAxis={[{
                                        data: [1, 2, 3, 4, 5, 6],
                                        scaleType: 'point',
                                        valueFormatter: (v) => `WEEK ${v}`,
                                        tickLabelStyle: { fill: '#4B5563', fontSize: 9, fontWeight: 500 },
                                        disableLine: true,
                                        disableTicks: true,
                                    }]}
                                    yAxis={[{
                                        disableLine: true,
                                        disableTicks: true,
                                        tickLabelStyle: { display: 'none' },
                                    }]}
                                    series={[{
                                        data: [1800, 3500, 2800, 4200, 3600, 5500],
                                        area: true,
                                        color: '#1E90FF',
                                        showMark: false,
                                        curve: 'natural',
                                    }]}
                                    sx={{
                                        '& .MuiLineElement-root': {
                                            strokeWidth: 2.5,
                                            stroke: '#00BFFF',
                                        },
                                        '& .MuiAreaElement-root': {
                                            fill: 'url(#areaGradient)',
                                        },
                                        '& .MuiChartsAxis-line': { display: 'none' },
                                        '& .MuiChartsAxis-tick': { display: 'none' },
                                        '& .MuiChartsGrid-line': { stroke: '#1F2937', strokeDasharray: '3 3' },
                                    }}
                                    margin={{ left: 10, right: 10, top: 20, bottom: 30 }}
                                    slotProps={{
                                        legend: { hidden: true },
                                    }}
                                >
                                    <defs>
                                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#1E90FF" stopOpacity={0.4} />
                                            <stop offset="50%" stopColor="#1E90FF" stopOpacity={0.15} />
                                            <stop offset="100%" stopColor="#1E90FF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                </LineChart>
                            )}
                        </Box>
                    </Paper>
                </Box>

                {/* Pending Reviews */}
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' }, minWidth: 0 }}>
                    <Paper
                        sx={{
                            bgcolor: '#1A2230',
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid #374151',
                            height: 280,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                            <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.85rem' }}>
                                Pending Reviews
                            </Typography>
                            <Button size="small" sx={{ color: '#3B82F6', textTransform: 'none', fontSize: '0.7rem', p: 0 }}>
                                View All
                            </Button>
                        </Stack>

                        <Stack spacing={1} sx={{ flex: 1, overflow: 'auto' }}>
                            {pendingReviews.map((review) => (
                                <Box
                                    key={review.id}
                                    sx={{
                                        bgcolor: '#0C1322',
                                        borderRadius: 1.5,
                                        p: 1.25,
                                    }}
                                >
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
                                                <Chip
                                                    label={review.type}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: review.typeColor,
                                                        color: '#FFFFFF',
                                                        fontSize: '0.55rem',
                                                        height: 16,
                                                        '& .MuiChip-label': { px: 0.75 },
                                                    }}
                                                />
                                                <Typography
                                                    sx={{
                                                        color: '#FFFFFF',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {review.title}
                                                </Typography>
                                            </Stack>
                                            <Typography sx={{ color: '#6B7280', fontSize: '0.65rem' }}>
                                                {review.student} • {review.time}
                                            </Typography>
                                        </Box>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            sx={{
                                                bgcolor: '#1152D4',
                                                color: '#FFFFFF',
                                                textTransform: 'none',
                                                fontSize: '0.65rem',
                                                px: 1.25,
                                                py: 0.5,
                                                minWidth: 'auto',
                                                ml: 1,
                                                '&:hover': { bgcolor: '#0D41AA' },
                                            }}
                                        >
                                            Grade Now →
                                        </Button>
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Box>
            </Box>

            {/* Managed Courses */}
            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem' }}>
                        Managed Courses
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add sx={{ fontSize: 16 }} />}
                        size="small"
                        onClick={() => navigate('/tutor/create-course')}
                        sx={{
                            bgcolor: '#1152D4',
                            color: '#FFFFFF',
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            px: 2,
                            py: 0.75,
                            '&:hover': { bgcolor: '#0D41AA' },
                        }}
                    >
                        Create New
                    </Button>
                </Stack>

                {courses.length === 0 ? (
                    <Paper
                        sx={{
                            bgcolor: '#1A2230',
                            p: 4,
                            borderRadius: 2,
                            border: '1px solid #374151',
                            textAlign: 'center',
                        }}
                    >
                        <Typography sx={{ color: '#9CA3AF', mb: 2 }}>
                            You haven't created any courses yet.
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/tutor/create-course')}
                            sx={{ color: '#3B82F6', borderColor: '#3B82F6' }}
                        >
                            Create your first course
                        </Button>
                    </Paper>
                ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {courses.map((course) => (
                            <Box key={course.id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(33.33% - 21.33px)' }, minWidth: 0 }}>
                                <Paper
                                    sx={{
                                        bgcolor: '#1A2230',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '1px solid #374151',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    {/* Course Image */}
                                    <Box
                                        sx={{
                                            height: 120,
                                            bgcolor: course.image_url ? 'transparent' : '#0C1322',
                                            position: 'relative',
                                            backgroundImage: course.image_url ? `url(${course.image_url})` : 'none',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    >
                                        {(course.status === 'draft' || course.status === 'inactive') && (
                                            <Chip
                                                label={course.status}
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    bgcolor: '#F59E0B',
                                                    color: '#000000',
                                                    fontWeight: 600,
                                                    fontSize: '0.55rem',
                                                    height: 18,
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography
                                            sx={{
                                                color: '#FFFFFF',
                                                fontWeight: 600,
                                                fontSize: '1rem',
                                                mb: 1,
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {course.title}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: '#6B7280',
                                                fontSize: '0.85rem',
                                                mb: 2,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {course.summary || course.description || 'No description available.'}
                                        </Typography>

                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, mt: 'auto' }}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Group sx={{ fontSize: 16, color: '#6B7280' }} />
                                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                                    {course.students_count || 0} Students
                                                </Typography>
                                            </Stack>
                                            {/* Rating mock for now as API might not have it normalized yet */}
                                            {course.rating && (
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <Typography sx={{ color: '#F59E0B', fontSize: '0.8rem' }}>★</Typography>
                                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                                        {course.rating}
                                                    </Typography>
                                                </Stack>
                                            )}
                                        </Stack>

                                        <Stack direction="row" spacing={0.75}>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                onClick={() => navigate(`/tutor/create-course?edit=${course.id}`)}
                                                sx={{
                                                    borderColor: '#374151',
                                                    color: '#FFFFFF',
                                                    textTransform: 'none',
                                                    fontSize: '0.65rem',
                                                    py: 0.5,
                                                    '&:hover': { borderColor: '#1152D4', bgcolor: 'rgba(17, 82, 212, 0.1)' },
                                                }}
                                            >
                                                {course.status === 'draft' ? 'Edit Draft' : 'Manage'}
                                            </Button>
                                            {/* <IconButton
                                                size="small"
                                                sx={{
                                                    border: '1px solid #374151',
                                                    borderRadius: 1,
                                                    color: '#6B7280',
                                                    p: 0.5,
                                                }}
                                            >
                                                <MoreHoriz sx={{ fontSize: 16 }} />
                                            </IconButton> */}
                                        </Stack>
                                    </Box>
                                </Paper>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default TutorDashboard;

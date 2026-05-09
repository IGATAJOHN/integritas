import React, { useRef, useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    IconButton,
    Chip,
    Avatar,
    LinearProgress,
    CircularProgress,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import {
    TrendingUp,
    TrendingDown,
    MoreHoriz,
    PersonAdd,
    School,
    People,
    Verified,
    Warning,
    CheckCircle,
    Schedule,
    DescriptionOutlined,
    ArrowForward,
} from '@mui/icons-material';
import { adminFoundationalTutorService } from '../services/foundationalTutorService';
import { adminTransactionsService } from '../services/transactionsService';
import { adminProjectReviewService } from '../services/projectReviewService';
import { adminListKyc } from '../services/kyc';
import { apiService } from '../../../services/api';
import theme from '../../../styles/theme';


// Initial stats data for admin dashboard (will be updated with live data)
const initialStatsData = [
    {
        label: 'Total Users',
        value: '0',
        change: '18%',
        changeType: 'positive',
        icon: People,
    },
    {
        label: 'Active Courses',
        value: '0',
        change: '8%',
        changeType: 'positive',
        icon: School,
    },
    {
        label: 'Pending Verifications',
        value: '0',
        sublabel: 'Needs Review',
        sublabelColor: '#F59E0B',
        icon: Verified,
    },
    {
        label: 'Active Tutors',
        value: '0',
        change: '12%',
        changeType: 'positive',
        icon: PersonAdd,
    },
];

const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
};

const AdminDashboard = () => {
    const chartContainerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(0);

    // State for live data
    const [statsData, setStatsData] = useState(initialStatsData);
    const [activeTutors, setActiveTutors] = useState([]);
    const [recentUsersList, setRecentUsersList] = useState([]);
    const [pendingActionsList, setPendingActionsList] = useState([]);
    const [chartData, setChartData] = useState([120, 180, 250, 380, 520, 847]);
    const [chartTotal, setChartTotal] = useState('+847');
    const [chartChange, setChartChange] = useState('+23.4%');

    // Fetch chart width on resize
    useEffect(() => {
        const updateWidth = () => {
            if (chartContainerRef.current) {
                setChartWidth(chartContainerRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Fetch all live dashboard data from documented endpoints
    useEffect(() => {
        const fetchDashboardData = async () => {
            const [usersRes, tutorsRes, enrolmentsRes, kycRes, projectsRes] = await Promise.allSettled([
                apiService.get('/support/users'),
                adminFoundationalTutorService.listTutors({ per_page: 25 }),
                adminTransactionsService.listEnrolments({ per_page: 1 }),
                adminListKyc({ status: 'pending_review', per_page: 1 }),
                adminProjectReviewService.list({ status: 'pending', per_page: 3 }),
            ]);

            // Total users
            const totalUsers = usersRes.status === 'fulfilled'
                ? (usersRes.value?.meta?.total ?? (usersRes.value?.data?.length ?? 0))
                : 0;

            // Tutors
            const tutorMeta = tutorsRes.status === 'fulfilled' ? tutorsRes.value : { data: [], meta: {} };
            const tutorList = tutorMeta.data || [];
            const totalTutors = tutorMeta.meta?.total ?? tutorList.length;

            // Enrolments
            const totalEnrolments = enrolmentsRes.status === 'fulfilled'
                ? (enrolmentsRes.value?.meta?.total ?? 0)
                : 0;

            // Pending KYC
            const pendingKyc = kycRes.status === 'fulfilled'
                ? (kycRes.value?.meta?.total ?? kycRes.value?.data?.length ?? 0)
                : 0;

            // Pending projects → also feeds the pending actions list
            const pendingProjects = projectsRes.status === 'fulfilled' ? projectsRes.value : { data: [], meta: {} };
            const pendingProjectCount = pendingProjects.meta?.total ?? pendingProjects.data?.length ?? 0;
            const pendingActions = (pendingProjects.data || []).slice(0, 3).map((item, i) => ({
                id: item.id || i,
                title: item.course?.title || item.title || 'Project Submission',
                author: item.learner?.name || item.user?.name || item.student?.name || 'Unknown',
                time: getTimeAgo(item.submitted_at || item.created_at),
                action: 'Grade',
            }));

            setStatsData(prev => prev.map(stat => {
                if (stat.label === 'Total Users') return { ...stat, value: Number(totalUsers).toLocaleString() };
                if (stat.label === 'Active Courses') return { ...stat, value: Number(totalEnrolments).toLocaleString() };
                if (stat.label === 'Pending Verifications') return { ...stat, value: Number(pendingKyc + pendingProjectCount).toLocaleString() };
                if (stat.label === 'Active Tutors') return { ...stat, value: Number(totalTutors).toLocaleString() };
                return stat;
            }));

            if (pendingActions.length > 0) setPendingActionsList(pendingActions);

            const formattedTutors = tutorList.slice(0, 4).map((tutor, index) => ({
                id: tutor.id || index,
                name: tutor.name || `${tutor.first_name || ''} ${tutor.last_name || ''}`.trim() || 'Unknown Tutor',
                subject: tutor.specialization || tutor.expertise || tutor.bio?.slice(0, 30) || 'Tutor',
                status: 'Online',
            }));
            if (formattedTutors.length > 0) setActiveTutors(formattedTutors);
        };

        fetchDashboardData();
    }, []);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%', boxSizing: 'border-box' }}>
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
                    Welcome back, Admin
                </Typography>
                <Typography sx={{ color: '#6B7280', fontSize: '0.95rem' }}>
                    Here's an overview of the platform's performance and pending tasks.
                </Typography>
            </Box>

            {/* Stats Cards Row */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, width: '100%' }}>
                {statsData.map((stat, index) => (
                    <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
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
                                        fontSize: '2rem',
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

            {/* Main Content - Chart and Pending Actions */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4, mt: 4, width: '100%' }}>
                {/* User Growth Chart */}
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
                                    User Growth
                                </Typography>
                                <Typography sx={{ color: '#6B7280', fontSize: '0.65rem' }}>
                                    New registrations over the last 6 months
                                </Typography>
                            </Box>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography sx={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 700 }}>
                                    {chartTotal}
                                </Typography>
                                <Typography sx={{ color: '#10B981', fontSize: '0.7rem', fontWeight: 500 }}>
                                    {chartChange}
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
                                        valueFormatter: (v) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][v - 1],
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
                                        data: chartData,
                                        area: true,
                                        color: theme.colors.brand,
                                        showMark: false,
                                        curve: 'natural',
                                    }]}
                                    sx={{
                                        '& .MuiLineElement-root': {
                                            strokeWidth: 2.5,
                                            stroke: theme.colors.brand,
                                        },
                                        '& .MuiAreaElement-root': {
                                            fill: 'url(#adminAreaGradient)',
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
                                        <linearGradient id="adminAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={theme.colors.brand} stopOpacity={0.4} />
                                            <stop offset="50%" stopColor={theme.colors.brand} stopOpacity={0.15} />
                                            <stop offset="100%" stopColor={theme.colors.brand} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                </LineChart>
                            )}
                        </Box>
                    </Paper>
                </Box>

                {/* Pending Actions */}
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' }, minWidth: 0 }}>
                    <Paper
                        sx={{
                            bgcolor: 'transparent',
                            p: 0,
                            borderRadius: 2,
                            height: { xs: 'auto', md: 280 },
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        elevation={0}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.85rem' }}>
                                Pending Actions
                            </Typography>
                            <Button size="small" sx={{ color: '#3B82F6', textTransform: 'none', fontSize: '0.7rem', p: 0 }}>
                                View All
                            </Button>
                        </Stack>

                        <Stack spacing={1} sx={{ flex: 1 }}>
                            {pendingActionsList.length === 0 && (
                                <Typography sx={{ color: '#6B7280', fontSize: '0.8rem', textAlign: 'center', mt: 2 }}>
                                    No pending actions
                                </Typography>
                            )}
                            {pendingActionsList.map((action) => (
                                <Box
                                    key={action.id}
                                    sx={{
                                        bgcolor: '#1A2230',
                                        borderRadius: 1.5,
                                        p: 1.5,
                                        border: '1px solid #374151',
                                        transition: 'border-color 0.2s ease',
                                        '&:hover': {
                                            borderColor: '#4B5563',
                                        },
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                                            {/* Icon */}
                                            <Box
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <DescriptionOutlined sx={{ fontSize: 16, color: '#3B82F6' }} />
                                            </Box>

                                            {/* Content */}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography
                                                    sx={{
                                                        color: '#FFFFFF',
                                                        fontWeight: 600,
                                                        fontSize: '0.8rem',
                                                        lineHeight: 1.3,
                                                    }}
                                                >
                                                    {action.title}
                                                </Typography>
                                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.7rem' }}>
                                                    {action.author} • {action.time}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        {/* Action Link */}
                                        <Button
                                            endIcon={<ArrowForward sx={{ fontSize: 12 }} />}
                                            sx={{
                                                color: '#3B82F6',
                                                textTransform: 'none',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                p: 0,
                                                minWidth: 'auto',
                                                ml: 1,
                                                flexShrink: 0,
                                                '&:hover': {
                                                    bgcolor: 'transparent',
                                                    color: '#60A5FA',
                                                },
                                            }}
                                        >
                                            {action.action}
                                        </Button>
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Box>
            </Box>

            {/* Recent Users and System Health */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mt: 4, width: '100%' }}>
                {/* Recent Users */}
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(66.67% - 16px)' }, minWidth: 0 }}>
                    <Paper
                        sx={{
                            bgcolor: '#1A2230',
                            p: 3,
                            borderRadius: 2,
                            border: '1px solid #374151',
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem' }}>
                                Recent Users
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<PersonAdd sx={{ fontSize: 16 }} />}
                                size="small"
                                sx={{
                                    bgcolor: theme.colors.brand,
                                    color: '#FFFFFF',
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    px: 2,
                                    py: 0.75,
                                    '&:hover': { bgcolor: theme.colors.brandHover },
                                }}
                            >
                                Add User
                            </Button>
                        </Stack>

                        <Stack spacing={1.5}>
                            {recentUsersList.length === 0 && (
                                <Typography sx={{ color: '#6B7280', fontSize: '0.8rem', textAlign: 'center', mt: 2 }}>
                                    No recent users
                                </Typography>
                            )}
                            {recentUsersList.map((user) => (
                                <Box
                                    key={user.id}
                                    sx={{
                                        bgcolor: '#0C1322',
                                        borderRadius: 1.5,
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                bgcolor: theme.colors.brand,
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            {user.name.split(' ').map(n => n[0]).join('')}
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.85rem' }}>
                                                {user.name}
                                            </Typography>
                                            <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Chip
                                            label={user.role}
                                            size="small"
                                            sx={{
                                                bgcolor: user.role === 'Tutor' ? '#7C3AED' : '#374151',
                                                color: '#FFFFFF',
                                                fontSize: '0.7rem',
                                            }}
                                        />
                                        <Chip
                                            icon={user.status === 'active' ? <CheckCircle sx={{ fontSize: 14 }} /> : <Schedule sx={{ fontSize: 14 }} />}
                                            label={user.status === 'active' ? 'Active' : 'Pending'}
                                            size="small"
                                            sx={{
                                                bgcolor: user.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                                color: user.status === 'active' ? '#10B981' : '#F59E0B',
                                                fontSize: '0.7rem',
                                                '& .MuiChip-icon': {
                                                    color: user.status === 'active' ? '#10B981' : '#F59E0B',
                                                },
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            sx={{
                                                color: '#6B7280',
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                                            }}
                                        >
                                            <MoreHoriz sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Box>

                {/* Active Tutors */}
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' }, minWidth: 0 }}>
                    <Paper
                        sx={{
                            bgcolor: '#1A2230',
                            p: 3,
                            borderRadius: 2,
                            border: '1px solid #374151',
                            height: '100%',
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem' }}>
                                Active Tutors
                            </Typography>
                            <Button size="small" sx={{ color: '#3B82F6', textTransform: 'none', fontSize: '0.7rem', p: 0 }}>
                                View All
                            </Button>
                        </Stack>

                        <Stack spacing={1.5}>
                            {activeTutors.map((tutor) => (
                                <Box
                                    key={tutor.id}
                                    sx={{
                                        bgcolor: '#0C1322',
                                        borderRadius: 1.5,
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Avatar
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    bgcolor: '#7C3AED',
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                {tutor.name.split(' ').map(n => n[0]).join('')}
                                            </Avatar>
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 0,
                                                    width: 10,
                                                    height: 10,
                                                    bgcolor: tutor.status === 'Online' ? '#10B981' : (tutor.status === 'In Session' ? '#F59E0B' : '#9CA3AF'),
                                                    borderRadius: '50%',
                                                    border: '2px solid #0C1322',
                                                }}
                                            />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.8rem' }}>
                                                {tutor.name}
                                            </Typography>
                                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.7rem' }}>
                                                {tutor.subject}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Chip
                                        label={tutor.status}
                                        size="small"
                                        sx={{
                                            bgcolor: tutor.status === 'Online' ? 'rgba(16, 185, 129, 0.1)' : (tutor.status === 'In Session' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(156, 163, 175, 0.1)'),
                                            color: tutor.status === 'Online' ? '#10B981' : (tutor.status === 'In Session' ? '#F59E0B' : '#9CA3AF'),
                                            fontSize: '0.65rem',
                                            height: 20,
                                        }}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default AdminDashboard;

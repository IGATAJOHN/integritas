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
import { optionAdminService } from '../services/optionAdminService';

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

const recentUsers = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Learner',
        status: 'active',
        avatar: null,
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'Tutor',
        status: 'pending',
        avatar: null,
    },
    {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike.j@example.com',
        role: 'Learner',
        status: 'active',
        avatar: null,
    },
    {
        id: 4,
        name: 'Sarah Williams',
        email: 'sarah.w@example.com',
        role: 'Tutor',
        status: 'active',
        avatar: null,
    },
];

const pendingActions = [
    {
        id: 1,
        title: 'Governance Ethics Essay',
        author: 'John Doe',
        time: '2h ago',
        action: 'Grade Now',
    },
    {
        id: 2,
        title: 'Policy Framework Quiz',
        author: 'Jane Smith',
        time: '5h ago',
        action: 'Review',
    },
    {
        id: 3,
        title: 'Final Thesis Draft',
        author: 'A. Williams',
        time: '1d ago',
        action: 'Read',
    },
];

const AdminDashboard = () => {
    const chartContainerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(0);

    // State for live data
    const [statsData, setStatsData] = useState(initialStatsData);
    const [activeTutors, setActiveTutors] = useState([]);

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

    // Fetch live tutor data from API
    useEffect(() => {
        const fetchTutors = async () => {
            try {
                const response = await optionAdminService.listTutors({ per_page: 20 });
                const tutorList = response?.data || response || [];

                // Handle array response
                const tutors = Array.isArray(tutorList) ? tutorList : [];

                // Map API data to display format
                const formattedTutors = tutors.slice(0, 4).map((tutor, index) => ({
                    id: tutor.id || index,
                    name: tutor.name || `${tutor.first_name || ''} ${tutor.last_name || ''}`.trim() || 'Unknown Tutor',
                    subject: tutor.specialization || tutor.expertise || 'General',
                    status: tutor.status === 'Active' ? 'Online' : 'Offline',
                }));

                setActiveTutors(formattedTutors);

                // Update stats with live tutor count
                setStatsData(prev => prev.map(stat =>
                    stat.label === 'Active Tutors'
                        ? { ...stat, value: tutors.length.toString() }
                        : stat
                ));
            } catch (error) {
                console.error('Error fetching tutors:', error);
                // Use fallback data on error
                setActiveTutors([
                    { id: 1, name: 'No tutors available', subject: '-', status: 'Offline' },
                ]);
            }
        };

        fetchTutors();
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
                                    +847
                                </Typography>
                                <Typography sx={{ color: '#10B981', fontSize: '0.7rem', fontWeight: 500 }}>
                                    +23.4%
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
                                        data: [120, 180, 250, 380, 520, 847],
                                        area: true,
                                        color: '#1152D4',
                                        showMark: false,
                                        curve: 'natural',
                                    }]}
                                    sx={{
                                        '& .MuiLineElement-root': {
                                            strokeWidth: 2.5,
                                            stroke: '#1152D4',
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
                                            <stop offset="0%" stopColor="#1152D4" stopOpacity={0.4} />
                                            <stop offset="50%" stopColor="#1152D4" stopOpacity={0.15} />
                                            <stop offset="100%" stopColor="#1152D4" stopOpacity={0} />
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
                            {pendingActions.map((action) => (
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
                                    bgcolor: '#1152D4',
                                    color: '#FFFFFF',
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    px: 2,
                                    py: 0.75,
                                    '&:hover': { bgcolor: '#0D41AA' },
                                }}
                            >
                                Add User
                            </Button>
                        </Stack>

                        <Stack spacing={1.5}>
                            {recentUsers.map((user) => (
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
                                                bgcolor: '#1152D4',
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

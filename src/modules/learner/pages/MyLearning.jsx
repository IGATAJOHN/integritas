import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
    Chip,
    InputBase,
    Stack,
    useTheme,
    alpha
} from '@mui/material';
import {
    Search,
    AccessTime,
    CheckCircle,
    Add
} from '@mui/icons-material';

const MyLearning = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All Courses');

    const colors = {
        bg: '#080D19',
        card: '#1F2937',
        text: '#FFFFFF',
        textSecondary: '#94A3B8',
        primary: '#2563EB',
        success: '#10B981',
        border: 'rgba(255, 255, 255, 0.1)'
    };

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
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop'
        },
        {
            id: 2,
            title: 'Ethics in Leadership',
            instructor: 'Prof. Michael Chang',
            category: 'ETHICS',
            categoryColor: '#D946EF', // Purple/Pink
            status: 'IN PROGRESS',
            progress: 32,
            lastAccessed: '1d ago',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop'
        },
        {
            id: 3,
            title: 'Strategic Urban Planning',
            instructor: 'Elena Rodriguez',
            category: 'MANAGEMENT',
            categoryColor: '#6B7280', // Grey
            status: 'COMPLETED',
            finishedDate: 'Oct 12, 2023',
            hasCertificate: true,
            image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=250&fit=crop'
        },
        {
            id: 4,
            title: 'Public Sector Finance 101',
            instructor: 'David Kim',
            category: 'FINANCE',
            categoryColor: '#F97316', // Orange
            status: 'IN PROGRESS',
            progress: 15,
            lastAccessed: '3d ago',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop'
        },
        {
            id: 5,
            title: 'Sustainable Development Goals',
            instructor: 'Dr. Amara Okafor',
            category: 'SUSTAINABILITY',
            categoryColor: '#10B981', // Green
            status: 'COMPLETED',
            finishedDate: 'Sep 20, 2023',
            hasCertificate: true,
            image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=250&fit=crop'
        }
    ];

    // Filter courses based on active tab
    const filteredCourses = courses.filter(course => {
        if (activeTab === 'All Courses') return true;
        if (activeTab === 'In Progress') return course.status === 'IN PROGRESS';
        if (activeTab === 'Completed') return course.status === 'COMPLETED';
        if (activeTab === 'Certificates') return course.hasCertificate;
        return true;
    });

    const inProgressCount = courses.filter(c => c.status === 'IN PROGRESS').length;
    const certificatesCount = courses.filter(c => c.hasCertificate).length;

    return (
        <Box>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5, flexWrap: 'wrap', gap: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text, mb: 1 }}>
                        My Learning
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Welcome back, Alex. You have {inProgressCount} courses in progress.
                    </Typography>
                </Box>

                {/* Stats Cards */}
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                    <Box
                        sx={{
                            bgcolor: '#1E293B',
                            borderRadius: 2,
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            border: `1px solid ${colors.border}`,
                            minWidth: 160
                        }}
                    >
                        <Box sx={{ bgcolor: alpha(colors.primary, 0.1), p: 1, borderRadius: '50%' }}>
                            <AccessTime sx={{ color: colors.primary, fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', fontSize: '0.65rem', letterSpacing: 0.5, fontWeight: 600 }}>
                                HOURS LEARNED
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text, fontSize: '1.1rem' }}>
                                12h 30m
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            bgcolor: '#1E293B',
                            borderRadius: 2,
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            border: `1px solid ${colors.border}`,
                            minWidth: 160
                        }}
                    >
                        <Box sx={{ bgcolor: alpha(colors.success, 0.1), p: 1, borderRadius: '50%' }}>
                            <CheckCircle sx={{ color: colors.success, fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', fontSize: '0.65rem', letterSpacing: 0.5, fontWeight: 600 }}>
                                CERTIFICATES
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text, fontSize: '1.1rem' }}>
                                {certificatesCount}
                            </Typography>
                        </Box>
                    </Box>
                </Stack>
            </Box>

            {/* Filter Tabs and Search */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', maxWidth: '100%', pb: 1 }}>
                    {tabs.map((tab) => (
                        <Button
                            key={tab}
                            variant="contained"
                            size="small"
                            onClick={() => setActiveTab(tab)}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 2,
                                py: 0.75,
                                fontSize: '0.85rem',
                                boxShadow: 'none',
                                bgcolor: activeTab === tab ? colors.primary : '#1E293B',
                                color: activeTab === tab ? '#fff' : colors.textSecondary,
                                '&:hover': {
                                    bgcolor: activeTab === tab ? '#1d4ed8' : '#334155',
                                    boxShadow: 'none'
                                }
                            }}
                        >
                            {tab}
                        </Button>
                    ))}
                </Stack>

                <Box
                    sx={{
                        bgcolor: colors.card,
                        borderRadius: 2,
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        width: { xs: '100%', sm: 300 },
                        height: 40,
                        border: `1px solid ${colors.border}`
                    }}
                >
                    <Search sx={{ color: colors.textSecondary, fontSize: 20 }} />
                    <InputBase
                        placeholder="Filter by title or instructor..."
                        sx={{
                            color: "#FFFFFF",
                            fontSize: '0.9rem',
                            width: '100%',
                            '& input': {
                                border: 'none',
                                outline: 'none',
                                '&:focus': {
                                    border: 'none',
                                    outline: 'none'
                                }
                            }
                        }}
                    />
                </Box>
            </Box>

            {/* Course Grid (Flexbox) */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {filteredCourses.map((course) => (
                    <Box key={course.id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.33% - 16px)' }, minWidth: 280 }}>
                        <Card
                            sx={{
                                bgcolor: colors.card,
                                color: colors.text,
                                borderRadius: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: 'none',
                                border: `1px solid ${colors.border}`
                            }}
                        >
                            {/* Course Image */}
                            <Box
                                sx={{
                                    height: 160,
                                    backgroundImage: `url(${course.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative'
                                }}
                            >
                                <Chip
                                    label={course.category}
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 12,
                                        left: 12,
                                        bgcolor: course.categoryColor,
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '0.65rem',
                                        height: 22,
                                        borderRadius: 0.5
                                    }}
                                />
                                {course.status === 'COMPLETED' && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            bgcolor: 'rgba(0,0,0,0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', p: 1 }}>
                                            <CheckCircle sx={{ color: '#fff', fontSize: 32 }} />
                                        </Box>
                                    </Box>
                                )}
                            </Box>

                            <CardContent sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                                {/* Status Row */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: course.status === 'IN PROGRESS' ? '#3B82F6' : '#10B981',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            letterSpacing: 0.5
                                        }}
                                    >
                                        {course.status}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                        {course.status === 'IN PROGRESS'
                                            ? `Last accessed ${course.lastAccessed}`
                                            : `Finished ${course.finishedDate}`
                                        }
                                    </Typography>
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1rem', lineHeight: 1.4 }}>
                                    {course.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: colors.textSecondary, mb: 3, display: 'block' }}>
                                    Instructor: {course.instructor}
                                </Typography>

                                <Box sx={{ mt: 'auto' }}>
                                    {course.status === 'IN PROGRESS' ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>Progress</Typography>
                                                    <Typography variant="caption" sx={{ color: colors.text, fontWeight: 700 }}>{course.progress}%</Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={course.progress}
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        bgcolor: 'rgba(255,255,255,0.1)',
                                                        '& .MuiLinearProgress-bar': { bgcolor: course.categoryColor }
                                                    }}
                                                />
                                            </Box>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    bgcolor: '#334155',
                                                    color: '#fff',
                                                    textTransform: 'none',
                                                    '&:hover': { bgcolor: '#475569' }
                                                }}
                                            >
                                                Resume
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {course.hasCertificate && (
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <CheckCircle sx={{ color: '#10B981', fontSize: 16 }} />
                                                    <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
                                                        Certificate Earned
                                                    </Typography>
                                                </Stack>
                                            )}
                                            <Button
                                                variant="text"
                                                size="small"
                                                sx={{ color: colors.textSecondary, textTransform: 'none', '&:hover': { color: colors.text } }}
                                            >
                                                Review
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                ))}

                {/* Explore New Courses Card */}
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.33% - 16px)' }, minWidth: 280 }}>
                    <Card
                        sx={{
                            bgcolor: 'transparent',
                            color: colors.text,
                            borderRadius: 3,
                            height: '100%',
                            minHeight: 340,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `2px dashed ${colors.border}`,
                            cursor: 'pointer',
                            '&:hover': {
                                borderColor: colors.primary,
                                bgcolor: alpha(colors.primary, 0.05)
                            }
                        }}
                    >
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                bgcolor: '#334155',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                            }}
                        >
                            <Add sx={{ color: '#fff', fontSize: 24 }} />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Explore New Courses
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary, textAlign: 'center' }}>
                            Browse the catalog to find your next topic.
                        </Typography>
                    </Card>
                </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 8, pt: 3, borderTop: `1px solid ${colors.border}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        © 2024 Good Governance Hub. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={3}>
                        <Typography variant="caption" sx={{ color: colors.textSecondary, cursor: 'pointer', '&:hover': { color: colors.text } }}>
                            Privacy Policy
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary, cursor: 'pointer', '&:hover': { color: colors.text } }}>
                            Terms of Service
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary, cursor: 'pointer', '&:hover': { color: colors.text } }}>
                            Help Center
                        </Typography>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
};

export default MyLearning;

import React, { useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
    Chip,
    TextField,
    InputAdornment,
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

/**
 * MyLearning Component
 * 
 * This page displays all courses the learner is enrolled in.
 * It includes filter tabs, search functionality, and course cards
 * showing progress for in-progress courses and certificates for completed ones.
 */
const MyLearning = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState('All Courses');

    // Filter tabs
    const tabs = ['All Courses', 'In Progress', 'Completed', 'Certificates'];

    // Mock data for courses
    const courses = [
        {
            id: 1,
            title: 'Introduction to Public Policy',
            instructor: 'Dr. Sarah Jenkins',
            category: 'PUBLIC POLICY',
            categoryColor: '#10B981',
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
            categoryColor: '#3B82F6',
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
            categoryColor: '#6366F1',
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
            categoryColor: '#EF4444',
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
            categoryColor: '#14B8A6',
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

    // Count courses in progress
    const inProgressCount = courses.filter(c => c.status === 'IN PROGRESS').length;
    const certificatesCount = courses.filter(c => c.hasCertificate).length;

    return (
        <Box>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
                        My Learning
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Welcome back, Alex. You have {inProgressCount} courses in progress.
                    </Typography>
                </Box>

                {/* Stats */}
                <Stack direction="row" spacing={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                        <Box>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                                HOURS LEARNED
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                12h 30m
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
                        <Box>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                                CERTIFICATES
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                {certificatesCount}
                            </Typography>
                        </Box>
                    </Box>
                </Stack>
            </Box>

            {/* Filter Tabs and Search */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                {/* Tabs */}
                <Stack direction="row" spacing={1}>
                    {tabs.map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => setActiveTab(tab)}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 2,
                                py: 0.75,
                                borderColor: activeTab === tab ? 'primary.main' : theme.palette.divider,
                                color: activeTab === tab ? '#fff' : theme.palette.text.secondary,
                                bgcolor: activeTab === tab ? 'primary.main' : 'transparent',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    bgcolor: activeTab === tab ? 'primary.dark' : alpha(theme.palette.primary.main, 0.1)
                                }
                            }}
                        >
                            {tab}
                        </Button>
                    ))}
                </Stack>

                {/* Search */}
                <TextField
                    size="small"
                    placeholder="Filter by title or instructor..."
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        width: 280,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#fff',
                            borderRadius: 2,
                            '& fieldset': {
                                borderColor: theme.palette.divider,
                            },
                            '&:hover fieldset': {
                                borderColor: theme.palette.text.secondary,
                            },
                        },
                        '& .MuiInputBase-input': {
                            color: theme.palette.text.primary,
                            '&::placeholder': {
                                color: theme.palette.text.secondary,
                                opacity: 1
                            }
                        }
                    }}
                />
            </Box>

            {/* Course Cards Grid */}
            <Grid container spacing={3}>
                {filteredCourses.map((course) => (
                    <Grid item xs={12} sm={6} md={4} key={course.id}>
                        <Card
                            sx={{
                                bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#fff',
                                color: theme.palette.text.primary,
                                borderRadius: 3,
                                overflow: 'hidden',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: theme.shadows[1],
                                '&:hover': {
                                    boxShadow: theme.shadows[4],
                                    transform: 'translateY(-2px)',
                                    transition: 'all 0.2s ease-in-out'
                                }
                            }}
                        >
                            {/* Course Image */}
                            <Box
                                sx={{
                                    height: 140,
                                    backgroundImage: `url(${course.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative'
                                }}
                            >
                                {/* Category Badge */}
                                <Chip
                                    label={course.category}
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 12,
                                        left: 12,
                                        bgcolor: course.categoryColor,
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '0.65rem',
                                        height: 22
                                    }}
                                />

                                {/* Completed Checkmark Overlay */}
                                {course.status === 'COMPLETED' && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(255,255,255,0.9)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <CheckCircle sx={{ color: '#10B981', fontSize: 32 }} />
                                    </Box>
                                )}
                            </Box>

                            <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                                {/* Status and Date */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                    <Chip
                                        label={course.status}
                                        size="small"
                                        sx={{
                                            bgcolor: course.status === 'IN PROGRESS'
                                                ? alpha('#3B82F6', 0.2)
                                                : alpha('#10B981', 0.2),
                                            color: course.status === 'IN PROGRESS' ? '#3B82F6' : '#10B981',
                                            fontWeight: 600,
                                            fontSize: '0.65rem',
                                            height: 20
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                        {course.status === 'IN PROGRESS'
                                            ? `Last accessed ${course.lastAccessed}`
                                            : `Finished ${course.finishedDate}`
                                        }
                                    </Typography>
                                </Box>

                                {/* Title and Instructor */}
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}>
                                    {course.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                    Instructor: {course.instructor}
                                </Typography>

                                {/* Progress or Certificate */}
                                <Box sx={{ mt: 'auto' }}>
                                    {course.status === 'IN PROGRESS' ? (
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                    Progress
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                                    {course.progress}%
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={course.progress}
                                                    sx={{
                                                        flexGrow: 1,
                                                        height: 6,
                                                        borderRadius: 3,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: 'primary.main',
                                                            borderRadius: 3
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        px: 2,
                                                        py: 0.5,
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    Resume
                                                </Button>
                                            </Box>
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
                                                sx={{
                                                    textTransform: 'none',
                                                    color: theme.palette.text.secondary,
                                                    '&:hover': { color: theme.palette.primary.main }
                                                }}
                                            >
                                                Review
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* Explore New Courses Card */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card
                        sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#fff',
                            color: theme.palette.text.primary,
                            borderRadius: 3,
                            height: '100%',
                            minHeight: 280,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: theme.shadows[1],
                            border: `2px dashed ${theme.palette.divider}`,
                            cursor: 'pointer',
                            '&:hover': {
                                borderColor: theme.palette.primary.main,
                                bgcolor: alpha(theme.palette.primary.main, 0.05)
                            }
                        }}
                    >
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 2,
                                border: `2px dashed ${theme.palette.text.secondary}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                            }}
                        >
                            <Add sx={{ color: theme.palette.text.secondary, fontSize: 28 }} />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Explore New Courses
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textAlign: 'center', px: 2 }}>
                            Browse the catalog to find your next topic.
                        </Typography>
                    </Card>
                </Grid>
            </Grid>

            {/* Footer */}
            <Box sx={{ mt: 6, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        © 2024 Good Governance Hub. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={3}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, cursor: 'pointer', '&:hover': { color: theme.palette.text.primary } }}>
                            Privacy Policy
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, cursor: 'pointer', '&:hover': { color: theme.palette.text.primary } }}>
                            Terms of Service
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, cursor: 'pointer', '&:hover': { color: theme.palette.text.primary } }}>
                            Help Center
                        </Typography>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
};

export default MyLearning;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tutorCoursesService } from '../services';
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    IconButton,
    Chip,
    InputBase,
    Tooltip,
    LinearProgress,
    CircularProgress,
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Visibility,
    People,
    School,
    CheckCircle,
    Schedule,
    Block,
    MoreVert,
} from '@mui/icons-material';

const MyCourses = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Debounced search effect
    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await tutorCoursesService.listCourses({ q: searchTerm });
                setCourses(response.data || []);
            } catch (err) {
                console.error('Failed to fetch courses:', err);
                setError('Failed to load courses. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchCourses();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const getStatusConfig = (status) => {
        // Normalize status to match UI expectation (API might return lowercase)
        const normalizedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Draft';

        switch (normalizedStatus) {
            case 'Published':
            case 'Active':
                return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', icon: <CheckCircle sx={{ fontSize: 14 }} /> };
            case 'Draft':
                return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', icon: <Schedule sx={{ fontSize: 14 }} /> };
            case 'Inactive':
            case 'Archived':
                return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', icon: <Block sx={{ fontSize: 14 }} /> };
            default:
                return { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)', icon: null };
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            {/* Header Section */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        My Courses
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Manage and track your course content.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/tutor/create-course')}
                    sx={{
                        bgcolor: '#1152D4',
                        '&:hover': { bgcolor: '#0D42AF' },
                        boxShadow: '0 4px 14px rgba(17, 82, 212, 0.4)'
                    }}
                >
                    Create New Course
                </Button>
            </Stack>

            {/* Search Section */}
            <Paper sx={{ p: 2, mb: 4, bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Box sx={{
                    bgcolor: "#1F2937",
                    borderRadius: 1,
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    width: '100%',
                    maxWidth: 400,
                    height: '40px'
                }}>
                    <Search sx={{ color: "#9CA3AF", fontSize: 20 }} />
                    <InputBase
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            color: "#FFFFFF",
                            fontSize: '0.9rem',
                            width: '100%',
                            '& input': {
                                border: 'none',
                                outline: 'none',
                                '&::placeholder': { color: '#6B7280' }
                            }
                        }}
                    />
                </Box>
            </Paper>

            {/* Course Cards Grid */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, width: '100%' }}>
                    <CircularProgress sx={{ color: '#1152D4' }} />
                </Box>
            ) : error ? (
                <Box sx={{ textAlign: 'center', py: 8, width: '100%' }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {courses.map((course) => {
                        const statusConfig = getStatusConfig(course.status);
                        // Map API fields to UI expected fields
                        const displayStatus = course.status ? course.status.charAt(0).toUpperCase() + course.status.slice(1).toLowerCase() : 'Draft';
                        return (
                            <Box
                                key={course.id}
                                sx={{
                                    flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', lg: '1 1 calc(33.33% - 16px)' },
                                    minWidth: 0,
                                }}
                            >
                                <Paper
                                    sx={{
                                        bgcolor: '#1A2230',
                                        borderRadius: 2,
                                        border: '1px solid #374151',
                                        overflow: 'hidden',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'border-color 0.2s, transform 0.2s',
                                        '&:hover': {
                                            borderColor: '#1152D4',
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                >
                                    {/* Course Header */}
                                    <Box sx={{ p: 2.5, borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 1.5,
                                                    bgcolor: '#1152D4',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {course.image_url ? (
                                                    <img src={course.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <School sx={{ color: '#fff', fontSize: 22 }} />
                                                )}
                                            </Box>
                                            <Chip
                                                icon={statusConfig.icon}
                                                label={displayStatus}
                                                size="small"
                                                sx={{
                                                    bgcolor: statusConfig.bg,
                                                    color: statusConfig.color,
                                                    fontSize: '0.7rem',
                                                    height: 24,
                                                    '& .MuiChip-icon': {
                                                        color: statusConfig.color,
                                                    },
                                                }}
                                            />
                                        </Stack>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#fff', mb: 0.5 }}>
                                            {course.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.8rem', mb: 1.5, minHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {course.summary || course.description || 'No description available'}
                                        </Typography>
                                        <Chip
                                            label={course.category?.name || 'Uncategorized'}
                                            size="small"
                                            sx={{
                                                bgcolor: '#374151',
                                                color: '#9CA3AF',
                                                fontSize: '0.7rem',
                                                height: 22,
                                            }}
                                        />
                                    </Box>

                                    {/* Course Stats */}
                                    <Box sx={{ p: 2.5, flex: 1 }}>
                                        <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                                            <Stack direction="row" alignItems="center" spacing={0.75}>
                                                <People sx={{ color: '#10B981', fontSize: 18 }} />
                                                <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                                                    {course.students_count || 0}
                                                </Typography>
                                                <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                                    students
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" alignItems="center" spacing={0.75}>
                                                <School sx={{ color: '#3B82F6', fontSize: 18 }} />
                                                <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                                                    {course.lessons_count || 0}
                                                </Typography>
                                                <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                                    lessons
                                                </Typography>
                                            </Stack>
                                        </Stack>

                                        {/* Progress bar removed as not standard in listing unless enrolled */}
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                            Last updated: {course.updated_at ? new Date(course.updated_at).toLocaleDateString() : '-'}
                                        </Typography>
                                    </Box>

                                    {/* Course Actions */}
                                    <Box sx={{ p: 2, borderTop: '1px solid #374151', bgcolor: '#0C1322' }}>
                                        <Stack direction="row" spacing={1}>
                                            <Tooltip title="Edit Course">
                                                <IconButton
                                                    onClick={() => navigate(`/tutor/create-course?edit=${course.id}`)}
                                                    sx={{
                                                        color: '#3B82F6',
                                                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                                                        '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }
                                                    }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="View Course">
                                                <IconButton
                                                    onClick={() => navigate(`/tutor/courses/${course.id}`)}
                                                    sx={{
                                                        color: '#10B981',
                                                        bgcolor: 'rgba(16, 185, 129, 0.1)',
                                                        '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)' }
                                                    }}
                                                >
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Box sx={{ flex: 1 }} />
                                            <Tooltip title="More Options">
                                                <IconButton
                                                    sx={{
                                                        color: '#9CA3AF',
                                                        '&:hover': { bgcolor: 'rgba(156, 163, 175, 0.1)' }
                                                    }}
                                                >
                                                    <MoreVert fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Box>
                                </Paper>
                            </Box>
                        );
                    })}
                </Box>
            )}

            {/* Empty State */}
            {!loading && !error && courses.length === 0 && (
                <Paper sx={{ p: 6, bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151', textAlign: 'center' }}>
                    <School sx={{ fontSize: 60, color: '#374151', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#9CA3AF', mb: 1 }}>
                        No courses found
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
                        {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first course'}
                    </Typography>
                    {!searchTerm && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => navigate('/tutor/create-course')}
                            sx={{
                                bgcolor: '#1152D4',
                                '&:hover': { bgcolor: '#0D42AF' },
                            }}
                        >
                            Create Your First Course
                        </Button>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default MyCourses;


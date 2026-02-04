import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminCoursesService } from '../services';
import { CircularProgress } from '@mui/material';
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    IconButton,
    Chip,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Modal,
    TextField,
    InputBase,
    Tooltip,
    Collapse,
    Divider,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    Search,
    Add,
    Info,
    Block,
    CheckCircle,
    Close,
    School,
    ExpandMore,
    ExpandLess,
    PlayCircleOutline,
    ArticleOutlined,
    QuizOutlined,
} from '@mui/icons-material';


const CourseManagement = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch courses with debounce
    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const response = await adminCoursesService.listCourses({ q: searchTerm });
                console.log('Courses API response:', response);
                if (response.data?.[0]) {
                    console.log('First course object keys:', Object.keys(response.data[0]));
                    console.log('First course full data:', response.data[0]);
                }
                setCourses(response.data || []);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchCourses();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleViewCourse = (course) => {
        navigate(`/admin/content/courses/${course.id}`);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            {/* Header Section */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Course Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Manage all courses, view content, and control course status.
                    </Typography>
                </Box>
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
                        placeholder="Search courses, tutors, categories..."
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

            {/* Courses Table */}
            <TableContainer component={Paper} sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Course</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Tutor</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Students</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Category</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Status</TableCell>
                            <TableCell align="right" sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8, color: '#9CA3AF' }}>
                                    No courses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            courses.map((course) => {
                                const isActive = course.status === 'active' || course.status === 'published';
                                const statusLabel = course.status ? course.status.charAt(0).toUpperCase() + course.status.slice(1) : 'Unknown';
                                // Determine a friendly category label from multiple possible response shapes
                                const categoryLabel = course.category?.name
                                    || course.category?.title
                                    || course.category_name
                                    || (course.categories && course.categories[0]?.name)
                                    || 'Uncategorized';

                                // Resolve tutor data and friendly display name
                                const tutorData = course.tutor || course.user || course.creator || course.created_by;
                                const tutorName = (() => {
                                    if (!tutorData) return null;
                                    if (typeof tutorData === 'string') {
                                        const s = String(tutorData).trim();
                                        return s || null;
                                    }
                                    const first = String(tutorData.first_name || tutorData.firstName || '').trim();
                                    const last = String(tutorData.last_name || tutorData.lastName || '').trim();
                                    if (first || last) return `${first} ${last}`.trim();
                                    const name = String(
                                        tutorData.name || tutorData.full_name || tutorData.fullName || tutorData.display_name || tutorData.displayName || tutorData.username || tutorData.email || ''
                                    ).trim();
                                    return name || null;
                                })();
                                const tutorInitial = (() => {
                                    if (!tutorData) return '?';
                                    if (typeof tutorData === 'string') return (tutorData[0] || '?');
                                    return (tutorData.first_name?.[0] || tutorData.firstName?.[0] || tutorData.name?.[0] || tutorData.username?.[0] || '?');
                                })();
                                return (
                                    <TableRow key={course.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ color: '#fff', borderBottom: '1px solid #374151' }}>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
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
                                                        <School sx={{ color: '#fff', fontSize: 20 }} />
                                                    )}
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>
                                                        {course.title}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                        {course.modules_count || 0} modules • {course.lessons_count || 0} lessons
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                {/* Check tutor, user, or creator (from with_audit) */}
                                                <>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#7C3AED', fontSize: '0.8rem' }} src={tutorData?.avatar_url || tutorData?.profile_photo_url}>
                                                        {tutorInitial}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ color: '#E5E7EB' }}>
                                                        {tutorName || 'Unknown'}
                                                    </Typography>
                                                </>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                                                    {course.students_count || 0}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                    enrolled
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                            <Chip
                                                label={categoryLabel}
                                                size="small"
                                                sx={{
                                                    bgcolor: '#374151',
                                                    color: '#E5E7EB',
                                                    fontSize: '0.75rem',
                                                    borderRadius: 1,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                            <Chip
                                                icon={isActive ? <CheckCircle sx={{ fontSize: 14 }} /> : <Block sx={{ fontSize: 14 }} />}
                                                label={statusLabel}
                                                size="small"
                                                sx={{
                                                    bgcolor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                    color: isActive ? '#10B981' : '#EF4444',
                                                    fontSize: '0.75rem',
                                                    '& .MuiChip-icon': {
                                                        color: isActive ? '#10B981' : '#EF4444',
                                                    },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right" sx={{ borderBottom: '1px solid #374151' }}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleViewCourse(course)}
                                                startIcon={<Info fontSize="small" />}
                                                sx={{
                                                    bgcolor: '#1E293B',
                                                    color: '#3B82F6',
                                                    textTransform: 'none',
                                                    boxShadow: 'none',
                                                    '&:hover': { bgcolor: '#334155' }
                                                }}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

        </Box>
    );
};

export default CourseManagement;

import React, { useState, useEffect } from 'react';
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
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [expandedModules, setExpandedModules] = useState({});
    const [modalLoading, setModalLoading] = useState(false);

    // Fetch courses with debounce
    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const response = await adminCoursesService.listCourses({ q: searchTerm });
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

    const handleViewCourse = async (course) => {
        setOpenViewModal(true);
        setModalLoading(true);
        setSelectedCourse(course); // Show partial data immediately
        try {
            const fullCourse = await adminCoursesService.getCourseDetail(course.id);
            setSelectedCourse(fullCourse);
        } catch (error) {
            console.error("Failed to fetch course details:", error);
        } finally {
            setModalLoading(false);
        }
        setExpandedModules({});
    };

    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setSelectedCourse(null);
    };

    const handleToggleStatus = async (courseId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await adminCoursesService.updateCourse(courseId, { status: newStatus });

            // Update local state
            setCourses(courses.map(course => {
                if (course.id === courseId) {
                    return { ...course, status: newStatus };
                }
                return course;
            }));

            // If selected course is open, update it too
            if (selectedCourse && selectedCourse.id === courseId) {
                setSelectedCourse({ ...selectedCourse, status: newStatus });
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    const getLessonIcon = (type) => {
        switch (type) {
            case 'video':
                return <PlayCircleOutline sx={{ fontSize: 18, color: '#3B82F6' }} />;
            case 'reading':
                return <ArticleOutlined sx={{ fontSize: 18, color: '#10B981' }} />;
            case 'quiz':
                return <QuizOutlined sx={{ fontSize: 18, color: '#F59E0B' }} />;
            default:
                return <ArticleOutlined sx={{ fontSize: 18, color: '#9CA3AF' }} />;
        }
    };

    // Modal styling
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: 700, md: 800 },
        maxHeight: '90vh',
        bgcolor: '#1A2230',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 4,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
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
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#7C3AED', fontSize: '0.8rem' }} src={course.tutor?.avatar_url}>
                                                    {course.tutor?.first_name ? course.tutor.first_name[0] : '?'}
                                                </Avatar>
                                                <Typography variant="body2" sx={{ color: '#E5E7EB' }}>
                                                    {course.tutor ? `${course.tutor.first_name} ${course.tutor.last_name}` : 'Unknown'}
                                                </Typography>
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
                                                label={course.category?.name || 'Uncategorized'}
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
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="View Course Details">
                                                    <IconButton
                                                        onClick={() => handleViewCourse(course)}
                                                        sx={{
                                                            color: '#3B82F6',
                                                            bgcolor: 'rgba(59, 130, 246, 0.1)',
                                                            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }
                                                        }}
                                                    >
                                                        <Info fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={isActive ? 'Deactivate Course' : 'Activate Course'}>
                                                    <IconButton
                                                        onClick={() => handleToggleStatus(course.id, course.status)}
                                                        sx={{
                                                            color: isActive ? '#EF4444' : '#10B981',
                                                            bgcolor: isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                            '&:hover': {
                                                                bgcolor: isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                                                            }
                                                        }}
                                                    >
                                                        {isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Course View Modal */}
            <Modal open={openViewModal} onClose={handleCloseViewModal}>
                <Box sx={modalStyle}>
                    {/* Modal Header */}
                    <Box sx={{
                        background: 'linear-gradient(135deg, #1152D4 0%, #0D42AF 100%)',
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                    }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <School sx={{ color: '#fff', fontSize: 28 }} />
                            <Box>
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                    {selectedCourse?.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    by {selectedCourse?.tutor?.first_name} {selectedCourse?.tutor?.last_name}
                                </Typography>
                            </Box>
                        </Stack>
                        <IconButton onClick={handleCloseViewModal} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Course Stats */}
                    <Box sx={{ p: 2, bgcolor: '#0C1322', display: 'flex', gap: 3, flexWrap: 'wrap', borderBottom: '1px solid #374151' }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Students:</Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>{selectedCourse?.students_count || 0}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Modules:</Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>{selectedCourse?.modules?.length || selectedCourse?.modules_count || 0}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Lessons:</Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                                {selectedCourse?.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || selectedCourse?.lessons_count || 0}
                            </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Status:</Typography>
                            <Chip
                                label={selectedCourse?.status || 'Unknown'}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: (selectedCourse?.status === 'active' || selectedCourse?.status === 'published') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    color: (selectedCourse?.status === 'active' || selectedCourse?.status === 'published') ? '#10B981' : '#EF4444',
                                }}
                            />
                        </Stack>
                    </Box>

                    {/* Modal Body - Modules and Lessons */}
                    <Box sx={{
                        p: 3,
                        overflowY: 'auto',
                        flex: 1,
                        '&::-webkit-scrollbar': { width: '8px' },
                        '&::-webkit-scrollbar-track': { background: '#0C1322', borderRadius: '4px' },
                        '&::-webkit-scrollbar-thumb': { background: '#374151', borderRadius: '4px', '&:hover': { background: '#4B5563' } }
                    }}>
                        {modalLoading ? (
                            <Box sx={{ display: 'flex', justifyItems: 'center', alignItems: 'center', pt: 5 }}>
                                <CircularProgress size={30} sx={{ mx: 'auto' }} />
                            </Box>
                        ) : (
                            <>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2, fontWeight: 600 }}>
                                    COURSE CONTENT
                                </Typography>

                                <Stack spacing={1.5}>
                                    {selectedCourse?.modules?.map((module) => (
                                        <Paper
                                            key={module.id}
                                            sx={{
                                                bgcolor: '#0C1322',
                                                border: '1px solid #374151',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {/* Module Header */}
                                            <Box
                                                onClick={() => toggleModule(module.id)}
                                                sx={{
                                                    p: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer',
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }
                                                }}
                                            >
                                                <Box>
                                                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                                                        {module.title}
                                                    </Typography>
                                                    <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                                        {module.lessons?.length || 0} lessons
                                                    </Typography>
                                                </Box>
                                                <IconButton size="small" sx={{ color: '#9CA3AF' }}>
                                                    {expandedModules[module.id] ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </Box>

                                            {/* Module Lessons */}
                                            <Collapse in={expandedModules[module.id]}>
                                                <Divider sx={{ borderColor: '#374151' }} />
                                                <Stack sx={{ p: 1.5 }} spacing={0.5}>
                                                    {module.lessons?.map((lesson) => (
                                                        <Box
                                                            key={lesson.id}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                p: 1.5,
                                                                borderRadius: 1,
                                                                bgcolor: '#1A2230',
                                                            }}
                                                        >
                                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                                {getLessonIcon(lesson.type)}
                                                                <Typography sx={{ color: '#E5E7EB', fontSize: '0.85rem' }}>
                                                                    {lesson.title}
                                                                </Typography>
                                                            </Stack>
                                                            <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                                                {lesson.duration || (lesson.questions ? `${lesson.questions} questions` : '')}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Collapse>
                                        </Paper>
                                    ))}
                                </Stack>
                            </>
                        )}
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default CourseManagement;

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
    CircularProgress,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Visibility,
    Delete,
    People,
    School,
    CheckCircle,
    Schedule,
    Block,
    Payments,
    History,
} from '@mui/icons-material';
import { formatCurrency, getImageUrl } from '../../../utils';
import theme from '../../../styles/theme';


/**
 * My Courses Page - Lists all courses created by the tutor
 * 
 * Features:
 * - Search courses with debounced API calls
 * - View course details
 * - Edit course
 * - Delete course with confirmation dialog
 */
const MyCourses = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingChanges, setPendingChanges] = useState({}); // Map of courseId -> change

    // Delete dialog state
    const [deleteDialog, setDeleteDialog] = useState({ open: false, course: null });
    const [deleting, setDeleting] = useState(false);

    // Snackbar state
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Debounced search effect
    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);
            try {
                const [coursesResp, changesResp] = await Promise.all([
                    tutorCoursesService.listCourses({ q: searchTerm }),
                    tutorCoursesService.listPriceChanges({ status: 'pending' })
                ]);

                setCourses(coursesResp.data || []);

                // Construct a map of courseId to pending change
                const changesMap = {};
                (changesResp?.data || changesResp || []).forEach(change => {
                    changesMap[change.course_id] = change;
                });
                setPendingChanges(changesMap);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchCourses();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    /**
     * Opens the delete confirmation dialog
     * @param {Object} course - The course to delete
     */
    const handleDeleteClick = (course) => {
        setDeleteDialog({ open: true, course });
    };

    /**
     * Closes the delete confirmation dialog
     */
    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, course: null });
    };

    /**
     * Confirms and executes the course deletion
     * The backend should cascade delete modules and lessons
     */
    const handleDeleteConfirm = async () => {
        if (!deleteDialog.course) return;

        setDeleting(true);
        try {
            await tutorCoursesService.deleteCourse(deleteDialog.course.id);

            // Remove the course from local state
            setCourses(courses.filter(c => c.id !== deleteDialog.course.id));

            setSnackbar({
                open: true,
                message: 'Course deleted successfully!',
                severity: 'success'
            });
        } catch (err) {
            console.error('Failed to delete course:', err);
            setSnackbar({
                open: true,
                message: err.message || 'Failed to delete course. Please try again.',
                severity: 'error'
            });
        } finally {
            setDeleting(false);
            setDeleteDialog({ open: false, course: null });
        }
    };

    const getStatusConfig = (status) => {
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
                        bgcolor: theme.colors.brand,
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
                    <CircularProgress sx={{ color: theme.colors.brand }} />
                </Box>
            ) : error ? (
                <Box sx={{ textAlign: 'center', py: 8, width: '100%' }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {courses.map((course) => {
                        const statusConfig = getStatusConfig(course.status);
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
                                            borderColor: theme.colors.brand,
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
                                                    bgcolor: theme.colors.brand,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {course.thumbnail_url ? (
                                                    <img src={getImageUrl(course.thumbnail_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                            <Stack direction="row" alignItems="center" spacing={0.75}>
                                                <Payments sx={{ color: '#F59E0B', fontSize: 18 }} />
                                                <Box>
                                                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                                                        {course.price > 0
                                                            ? formatCurrency(course.price, course.currency)
                                                            : 'Free'}
                                                    </Typography>
                                                    {pendingChanges[course.id] && (
                                                        <Tooltip title={`Pending Change: ${formatCurrency(pendingChanges[course.id].new_amount, pendingChanges[course.id].new_currency)}`}>
                                                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: '#3B82F6' }}>
                                                                <History sx={{ fontSize: 12 }} />
                                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                                    {formatCurrency(pendingChanges[course.id].new_amount, pendingChanges[course.id].new_currency)}
                                                                </Typography>
                                                            </Stack>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </Stack>
                                        </Stack>

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
                                            <Tooltip title="Delete Course">
                                                <IconButton
                                                    onClick={() => handleDeleteClick(course)}
                                                    sx={{
                                                        color: '#EF4444',
                                                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                                                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
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
                                bgcolor: theme.colors.brand,
                                '&:hover': { bgcolor: '#0D42AF' },
                            }}
                        >
                            Create Your First Course
                        </Button>
                    )}
                </Paper>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                PaperProps={{
                    sx: {
                        bgcolor: '#1A2230',
                        border: '1px solid #374151',
                        borderRadius: 2,
                        minWidth: 400,
                    }
                }}
            >
                <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid #374151' }}>
                    Delete Course
                </DialogTitle>
                <DialogContent sx={{ py: 3 }}>
                    <Typography sx={{ color: '#9CA3AF', mb: 2 }}>
                        Are you sure you want to delete <strong style={{ color: '#fff' }}>{deleteDialog.course?.title}</strong>?
                    </Typography>
                    <Typography sx={{ color: '#EF4444', fontSize: '0.85rem' }}>
                        ⚠️ This action cannot be undone. All modules and lessons in this course will also be deleted.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #374151' }}>
                    <Button
                        onClick={handleDeleteCancel}
                        sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(156, 163, 175, 0.1)' } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        disabled={deleting}
                        variant="contained"
                        sx={{
                            bgcolor: '#EF4444',
                            '&:hover': { bgcolor: '#DC2626' },
                            '&:disabled': { bgcolor: '#374151' }
                        }}
                    >
                        {deleting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Delete Course'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MyCourses;

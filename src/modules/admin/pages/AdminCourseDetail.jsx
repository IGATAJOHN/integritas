import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminCoursesService } from '../services';
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    IconButton,
    Chip,
    Avatar,
    CircularProgress,
    Divider,
    Collapse,
    TextField,
    Modal,
    Snackbar,
    Alert
} from '@mui/material';
import {
    ArrowBack,
    School,
    CheckCircle,
    Block,
    ExpandMore,
    ExpandLess,
    PlayCircleOutline,
    ArticleOutlined,
    QuizOutlined,
    Close,
    History,
} from '@mui/icons-material';
import { formatCurrency } from '../../../utils';

const AdminCourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState({});
    const [actionLoading, setActionLoading] = useState(false);

    // Rejection Modal State
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [pendingPriceChange, setPendingPriceChange] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchCourse = async () => {
        setLoading(true);
        try {
            const data = await adminCoursesService.getCourseDetail(courseId);
            // Fetch modules if missing
            if (!data.modules || data.modules.length === 0) {
                try {
                    const modules = await adminCoursesService.getCourseModules(courseId);
                    data.modules = modules;
                } catch (err) {
                    console.warn('Failed to fetch modules', err);
                }
            }
            setCourse(data);

            // Fetch pending price changes
            try {
                const changesResp = await adminCoursesService.listPriceChanges({ status: 'pending' });
                const pending = (changesResp?.data || changesResp || []).find(r => r.course_id === courseId);
                setPendingPriceChange(pending || null);
            } catch (e) {
                console.warn('Failed to fetch pending price changes', e);
            }
        } catch (error) {
            console.error("Failed to fetch course:", error);
            setSnackbar({ open: true, message: 'Failed to load course details', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const handleBack = () => {
        navigate('/admin/content/courses');
    };

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    const handleApprove = async () => {
        if (!course) return;
        setActionLoading(true);
        try {
            const updated = await adminCoursesService.approveCourse(course.id);
            // Update local state
            const newStatus = (updated && updated.status) ? updated.status : 'published';
            setCourse(prev => ({ ...prev, status: newStatus, is_published: true }));
            setSnackbar({ open: true, message: 'Course approved successfully!', severity: 'success' });
        } catch (error) {
            console.error("Failed to approve:", error);
            setSnackbar({ open: true, message: 'Failed to approve course', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!course || !rejectionReason.trim()) return;
        setActionLoading(true);
        try {
            const updated = await adminCoursesService.rejectCourse(course.id, rejectionReason);
            const newStatus = (updated && updated.status) ? updated.status : 'draft';
            setCourse(prev => ({ ...prev, status: newStatus, is_published: false, meta: updated?.meta || prev.meta }));
            setOpenRejectModal(false);
            setRejectionReason('');
            setSnackbar({ open: true, message: 'Course rejected', severity: 'info' });
        } catch (error) {
            console.error("Failed to reject:", error);
            setSnackbar({ open: true, message: 'Failed to reject course', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const getLessonIcon = (type) => {
        switch (type) {
            case 'video': return <PlayCircleOutline sx={{ fontSize: 18, color: '#3B82F6' }} />;
            case 'reading': return <ArticleOutlined sx={{ fontSize: 18, color: '#10B981' }} />;
            case 'quiz': return <QuizOutlined sx={{ fontSize: 18, color: '#F59E0B' }} />;
            default: return <ArticleOutlined sx={{ fontSize: 18, color: '#9CA3AF' }} />;
        }
    };

    // Modal styling
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: 500 },
        bgcolor: '#1A2230',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 4,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        p: 0,
        outline: 'none',
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0C1322' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!course) {
        return (
            <Box sx={{ p: 4, bgcolor: '#0C1322', minHeight: '100vh', color: '#fff' }}>
                <Typography>Course not found.</Typography>
                <Button onClick={handleBack}>Back</Button>
            </Box>
        );
    }

    const isPublished = course.status === 'published' || course.status === 'active';
    const isDraft = course.status === 'draft';
    // Determine a friendly category label from multiple possible response shapes
    const categoryLabel = course.category?.name
        || course.category?.title
        || course.category_name
        || (course.categories && course.categories[0]?.name)
        || '-';

    // Determine a friendly tutor name from multiple possible response shapes
    const tutorObj = course.tutor || course.user || course.creator || course.created_by;
    const tutorName = (() => {
        if (!tutorObj) return null;
        if (typeof tutorObj === 'string') {
            const s = String(tutorObj).trim();
            return s || null;
        }
        const first = String(tutorObj.first_name || tutorObj.firstName || '').trim();
        const last = String(tutorObj.last_name || tutorObj.lastName || '').trim();
        if (first || last) return `${first} ${last}`.trim();
        const name = String(
            tutorObj.name || tutorObj.full_name || tutorObj.fullName || tutorObj.display_name || tutorObj.displayName || tutorObj.username || tutorObj.email || ''
        ).trim();
        return name || null;
    })();

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: '100vh', width: '100%' }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <IconButton onClick={handleBack} sx={{ color: '#9CA3AF' }}>
                    <ArrowBack />
                </IconButton>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                        {course.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                            by {tutorName || 'Unknown Tutor'}
                        </Typography>
                        <Chip
                            label={course.status || 'unknown'}
                            size="small"
                            sx={{
                                textTransform: 'capitalize',
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: isPublished ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: isPublished ? '#10B981' : '#EF4444',
                            }}
                        />
                    </Stack>
                </Box>
                <Box sx={{ flex: 1 }} />
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={handleApprove}
                        disabled={actionLoading || isPublished}
                    >
                        Approve
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<Block />}
                        onClick={() => setOpenRejectModal(true)}
                        disabled={actionLoading || isDraft}
                    >
                        Reject
                    </Button>
                </Stack>
            </Stack>

            {/* Pending Price Change Alert */}
            {pendingPriceChange && (
                <Alert
                    severity="info"
                    icon={<History />}
                    sx={{
                        mb: 4,
                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3B82F6',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        '& .MuiAlert-icon': { color: '#3B82F6' }
                    }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => navigate('/admin/content/price-changes')}
                        >
                            View Request
                        </Button>
                    }
                >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Certificate Price Change Pending: {formatCurrency(pendingPriceChange.new_amount, pendingPriceChange.new_currency)}
                    </Typography>
                    <Typography variant="caption">
                        Current price: {formatCurrency(pendingPriceChange.old_amount, pendingPriceChange.old_currency)}
                    </Typography>
                </Alert>
            )}

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
                {/* Left Column: Content */}
                <Box sx={{ flex: 1 }}>
                    {/* About Section */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>About This Course</Typography>
                        <Typography
                            component="div"
                            sx={{ color: '#D1D5DB', lineHeight: 1.6, mb: 3, '& p': { m: 0, mb: 1 } }}
                            dangerouslySetInnerHTML={{ __html: course.description || 'No description provided.' }}
                        />

                        {course.what_you_will_learn && (
                            <Box sx={{ mb: 3, p: 3, bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                                <Typography variant="subtitle1" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>What you'll learn</Typography>
                                <ul style={{ margin: 0, paddingLeft: 20, color: '#D1D5DB' }}>
                                    {Array.isArray(course.what_you_will_learn)
                                        ? course.what_you_will_learn.map((item, i) => <li key={i}>{item}</li>)
                                        : course.what_you_will_learn.split('\n').map((item, i) => <li key={i}>{item}</li>)
                                    }
                                </ul>
                            </Box>
                        )}

                        {course.requirements && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>Requirements</Typography>
                                <Typography sx={{ color: '#D1D5DB' }}>{course.requirements}</Typography>
                            </Box>
                        )}
                    </Box>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>Course Content</Typography>
                    <Stack spacing={2}>
                        {course.modules?.map((module, index) => (
                            <Paper
                                key={module.id}
                                sx={{
                                    bgcolor: '#1A2230',
                                    border: '1px solid #374151',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                }}
                            >
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
                                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                            {module.title}
                                        </Typography>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.8rem' }}>
                                            {module.lessons?.length || 0} lessons
                                        </Typography>
                                    </Box>
                                    <IconButton size="small" sx={{ color: '#9CA3AF' }}>
                                        {expandedModules[module.id] ? <ExpandLess /> : <ExpandMore />}
                                    </IconButton>
                                </Box>
                                <Collapse in={expandedModules[module.id]}>
                                    <Divider sx={{ borderColor: '#374151' }} />
                                    <Stack sx={{ p: 0 }}>
                                        {module.lessons?.map((lesson) => (
                                            <Box
                                                key={lesson.id}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    p: 2,
                                                    borderBottom: '1px solid #374151',
                                                    '&:last-child': { borderBottom: 'none' },
                                                    bgcolor: '#111827'
                                                }}
                                            >
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    {getLessonIcon(lesson.type)}
                                                    <Typography sx={{ color: '#E5E7EB', fontSize: '0.9rem' }}>
                                                        {lesson.title}
                                                    </Typography>
                                                </Stack>
                                                <Typography sx={{ color: '#6B7280', fontSize: '0.8rem' }}>
                                                    {lesson.duration || (lesson.questions ? `${lesson.questions} Qs` : '')}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Collapse>
                            </Paper>
                        ))}
                    </Stack>
                </Box>

                {/* Right Column: Stats & Details */}
                <Box sx={{ width: { xs: '100%', lg: 350 } }}>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>Details</Typography>

                    <Paper sx={{ p: 3, bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151', mb: 3 }}>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Overview</Typography>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ color: '#D1D5DB' }}>Students</Typography>
                                <Typography sx={{ color: '#fff', fontWeight: 600 }}>{course.students_count || 0}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ color: '#D1D5DB' }}>Reviews</Typography>
                                <Typography sx={{ color: '#fff', fontWeight: 600 }}>{course.reviews_count || 0}</Typography>
                            </Box>
                            <Divider sx={{ borderColor: '#374151' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ color: '#D1D5DB' }}>Level</Typography>
                                <Typography sx={{ color: '#fff', fontWeight: 600, textTransform: 'capitalize' }}>{course.level || '-'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ color: '#D1D5DB' }}>Language</Typography>
                                <Typography sx={{ color: '#fff', fontWeight: 600, textTransform: 'uppercase' }}>{course.language || '-'}</Typography>
                            </Box>
                            <Divider sx={{ borderColor: '#374151' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography sx={{ color: '#D1D5DB' }}>Price</Typography>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                        {course.price > 0
                                            ? formatCurrency(course.price, course.currency)
                                            : 'Free'}
                                    </Typography>
                                    {pendingPriceChange && (
                                        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5} sx={{ color: '#3B82F6', mt: 0.5 }}>
                                            <History sx={{ fontSize: 12 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                {formatCurrency(pendingPriceChange.new_amount, pendingPriceChange.new_currency)}
                                            </Typography>
                                        </Stack>
                                    )}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ color: '#D1D5DB' }}>Category</Typography>
                                <Typography sx={{ color: '#fff', fontWeight: 600 }}>{categoryLabel}</Typography>
                            </Box>
                            <Divider sx={{ borderColor: '#374151' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ color: '#D1D5DB' }}>Created</Typography>
                                <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                                    {course.created_at ? new Date(course.created_at).toLocaleDateString() : '-'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ color: '#D1D5DB' }}>Updated</Typography>
                                <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                                    {course.updated_at ? new Date(course.updated_at).toLocaleDateString() : '-'}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    {course.thumbnail_url && (
                        <Paper sx={{ p: 2, bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Thumbnail</Typography>
                            <Box
                                component="img"
                                src={course.thumbnail_url}
                                sx={{ width: '100%', borderRadius: 1 }}
                            />
                        </Paper>
                    )}
                </Box>
            </Stack>

            {/* Rejection Modal */}
            <Modal open={openRejectModal} onClose={() => setOpenRejectModal(false)}>
                <Box sx={modalStyle}>
                    <Box sx={{ p: 3, borderBottom: '1px solid #374151' }}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>Reject Course</Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <Typography sx={{ color: '#9CA3AF', mb: 2 }}>
                            Enter rejection reason:
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            sx={{
                                bgcolor: '#111827',
                                borderRadius: 1,
                                border: '1px solid #374151',
                                '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { border: 'none' } }
                            }}
                        />
                    </Box>
                    <Box sx={{ p: 3, borderTop: '1px solid #374151', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={() => setOpenRejectModal(false)} sx={{ color: '#9CA3AF' }}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleReject}
                            disabled={!rejectionReason.trim() || actionLoading}
                        >
                            {actionLoading ? 'Rejecting...' : 'Reject Course'}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminCourseDetail;

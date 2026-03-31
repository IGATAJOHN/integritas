import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    LinearProgress,
    Chip,
    Skeleton,
    Stack,
    Divider,
    Alert
} from '@mui/material';
import {
    BookOutlined as BookIcon,
    CheckCircleOutlined as CheckIcon,
    PlayCircleOutlined as PlayIcon,
    SchoolOutlined as SchoolIcon
} from '@mui/icons-material';
import { learnerEnrollmentService } from '../services';

const statusConfig = {
    enrolled: { label: 'Enrolled', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
    in_progress: { label: 'In Progress', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    completed: { label: 'Completed', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const EnrollmentSkeleton = () => (
    <Box sx={{ p: 3, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)' }}>
        <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="rectangular" width={64} height={64} sx={{ borderRadius: 1, bgcolor: 'rgba(255,255,255,0.08)' }} />
            <Box sx={{ flex: 1 }}>
                <Skeleton width="60%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: 1 }} />
                <Skeleton width="40%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
            </Box>
        </Stack>
    </Box>
);

const MyEnrollments = () => {
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({});

    useEffect(() => {
        const fetchEnrollments = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await learnerEnrollmentService.getEnrollments({ per_page: 20, page });
                setEnrollments(result.data || []);
                setMeta(result.meta || {});
            } catch (err) {
                setError('Failed to load your enrollments. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchEnrollments();
    }, [page]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
                    My Enrollments
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    View and manage your enrolled courses
                </Typography>
            </Box>

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                </Alert>
            )}

            {/* Loading skeletons */}
            {loading && (
                <Stack spacing={2}>
                    {[1, 2, 3].map((i) => <EnrollmentSkeleton key={i} />)}
                </Stack>
            )}

            {/* Empty state */}
            {!loading && !error && enrollments.length === 0 && (
                <Box sx={{
                    textAlign: 'center',
                    py: 10,
                    border: '1px dashed rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.01)'
                }}>
                    <SchoolIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>No enrollments yet</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 3 }}>
                        Browse available courses and start learning today.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/explore/courses')}
                        sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#1D4ED8' } }}
                    >
                        Browse Courses
                    </Button>
                </Box>
            )}

            {/* Enrollment list */}
            {!loading && enrollments.length > 0 && (
                <Stack spacing={2}>
                    {enrollments.map((enrollment) => {
                        const status = statusConfig[enrollment.status] || statusConfig.enrolled;
                        const progress = parseFloat(enrollment.progress_percent || 0);
                        const isCompleted = enrollment.status === 'completed';
                        const courseTitle = enrollment.course?.title || enrollment.title || `Course ${enrollment.course_id?.slice(0, 8) || ''}`;
                        const instructor = enrollment.course?.instructor || enrollment.instructor || enrollment.tutor || '';

                        return (
                            <Box
                                key={enrollment.id}
                                sx={{
                                    p: 3,
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    display: 'flex',
                                    gap: 3,
                                    alignItems: 'flex-start',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {/* Icon / Thumbnail */}
                                <Box sx={{
                                    width: 64, height: 64, borderRadius: 1,
                                    bgcolor: 'rgba(37,99,235,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <BookIcon sx={{ fontSize: 28, color: '#3B82F6' }} />
                                </Box>

                                {/* Info */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                                            {courseTitle}
                                        </Typography>
                                        <Chip
                                            label={status.label}
                                            size="small"
                                            sx={{
                                                bgcolor: status.bg,
                                                color: status.color,
                                                fontWeight: 600,
                                                fontSize: 11,
                                                height: 22,
                                                border: `1px solid ${status.color}30`
                                            }}
                                        />
                                    </Stack>

                                    {instructor && (
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 1.5 }}>
                                            Instructor: {instructor}
                                        </Typography>
                                    )}

                                    {/* Progress */}
                                    <Box sx={{ mb: 1.5 }}>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Progress</Typography>
                                            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>{progress.toFixed(0)}%</Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={progress}
                                            sx={{
                                                height: 4,
                                                borderRadius: 2,
                                                bgcolor: 'rgba(255,255,255,0.08)',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: isCompleted ? '#10B981' : '#2563EB',
                                                    borderRadius: 2
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
                                        Enrolled: {formatDate(enrollment.enrolled_at)}
                                    </Typography>
                                </Box>

                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.07)', display: { xs: 'none', sm: 'block' } }} />

                                {/* Action */}
                                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                    {isCompleted ? (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<CheckIcon />}
                                            sx={{
                                                borderColor: '#10B981',
                                                color: '#10B981',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                '&:hover': { bgcolor: 'rgba(16,185,129,0.1)', borderColor: '#10B981' }
                                            }}
                                        >
                                            View Certificate
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<PlayIcon />}
                                            onClick={() => navigate(`/explore/course/${enrollment.course_id}`)}
                                            sx={{
                                                bgcolor: '#2563EB',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                '&:hover': { bgcolor: '#1D4ED8' }
                                            }}
                                        >
                                            Continue
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Stack>
            )}

            {/* Pagination */}
            {!loading && meta.last_page > 1 && (
                <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 4 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', textTransform: 'none' }}
                    >
                        Previous
                    </Button>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', alignSelf: 'center', px: 2 }}>
                        Page {page} of {meta.last_page}
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={page >= meta.last_page}
                        onClick={() => setPage((p) => p + 1)}
                        sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', textTransform: 'none' }}
                    >
                        Next
                    </Button>
                </Stack>
            )}
        </Box>
    );
};

export default MyEnrollments;

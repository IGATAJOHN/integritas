import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    CircularProgress,
    Alert,
    Paper,
    Chip,
} from '@mui/material';
import { ChevronRight, MenuBookOutlined } from '@mui/icons-material';
import { tutorAssignmentService } from '../services';

const AssignedLessons = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lessons, setLessons] = useState([]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await tutorAssignmentService.listAssignedLessons();
                if (cancelled) return;
                setLessons(res?.data || []);
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Failed to load assigned lessons.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <MenuBookOutlined color="primary" />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    My Assigned Lessons
                </Typography>
            </Stack>

            {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Stack alignItems="center" sx={{ py: 8 }}>
                    <CircularProgress />
                </Stack>
            ) : lessons.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        You haven't been assigned to any lessons yet. An admin will assign you when content is ready.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={1.5}>
                    {lessons.map((lesson) => (
                        <Paper
                            key={lesson.id}
                            variant="outlined"
                            sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                            onClick={() => navigate(`/tutor/lessons/${lesson.id}`)}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                <Box>
                                    <Typography sx={{ fontWeight: 600 }}>{lesson.title || 'Untitled lesson'}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {lesson.course?.title || lesson.module?.course?.title || '—'}
                                        {lesson.module?.title ? ` · ${lesson.module.title}` : ''}
                                    </Typography>
                                </Box>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    {lesson.is_published != null && (
                                        <Chip
                                            label={lesson.is_published ? 'Published' : 'Draft'}
                                            size="small"
                                            color={lesson.is_published ? 'success' : 'default'}
                                            variant="outlined"
                                        />
                                    )}
                                    <ChevronRight color="action" />
                                </Stack>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default AssignedLessons;

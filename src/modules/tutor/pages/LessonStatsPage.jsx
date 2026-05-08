import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    CircularProgress,
    Alert,
    Paper,
    Grid,
    Button,
    LinearProgress,
} from '@mui/material';
import { ArrowBack, GroupOutlined, CheckCircleOutlined, QuizOutlined } from '@mui/icons-material';
import { tutorAssignmentService } from '../services';

const StatCard = ({ icon, label, value, sublabel }) => (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1, display: 'flex' }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    {label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {value ?? '—'}
                </Typography>
                {sublabel && (
                    <Typography variant="caption" color="text.secondary">
                        {sublabel}
                    </Typography>
                )}
            </Box>
        </Stack>
    </Paper>
);

const LessonStatsPage = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await tutorAssignmentService.getLessonStats(lessonId);
                if (cancelled) return;
                setStats(data);
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Failed to load stats.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [lessonId]);

    const completionPct = Number(stats?.completion_percent ?? stats?.completion_rate ?? 0);
    const passRate = Number(stats?.cbt_pass_rate ?? 0);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: 'auto' }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/tutor/lessons')}
                sx={{ textTransform: 'none', mb: 2 }}
            >
                Back to Lessons
            </Button>

            {loading ? (
                <Stack alignItems="center" sx={{ py: 8 }}>
                    <CircularProgress />
                </Stack>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {stats?.lesson?.title || 'Lesson Stats'}
                    </Typography>
                    {stats?.lesson?.course?.title && (
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            {stats.lesson.course.title}
                        </Typography>
                    )}

                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={4}>
                            <StatCard
                                icon={<GroupOutlined />}
                                label="Enrolled Learners"
                                value={stats?.enrolled_count ?? stats?.learners_total ?? 0}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <StatCard
                                icon={<CheckCircleOutlined />}
                                label="Completed"
                                value={stats?.completed_count ?? 0}
                                sublabel={`${completionPct.toFixed(1)}% of enrolled`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <StatCard
                                icon={<QuizOutlined />}
                                label="CBT Pass Rate"
                                value={`${passRate.toFixed(1)}%`}
                                sublabel={`${stats?.cbt_attempts_count ?? 0} attempts`}
                            />
                        </Grid>
                    </Grid>

                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Completion Progress
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(100, Math.max(0, completionPct))}
                            sx={{ height: 10, borderRadius: 5 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            {Math.round(completionPct)}% of enrolled learners have completed this lesson.
                        </Typography>
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default LessonStatsPage;

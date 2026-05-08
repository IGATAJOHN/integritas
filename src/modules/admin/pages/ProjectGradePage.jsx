import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Paper,
    Chip,
    TextField,
    Divider,
    Link as MuiLink,
} from '@mui/material';
import {
    ArrowBack,
    InsertDriveFileOutlined,
    DownloadOutlined,
    CheckCircleOutlined,
    HighlightOff,
} from '@mui/icons-material';
import { adminProjectReviewService } from '../services';

const ProjectGradePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [submission, setSubmission] = useState(null);
    const [score, setScore] = useState('');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await adminProjectReviewService.get(id);
                if (cancelled) return;
                setSubmission(data);
                setScore(data?.score != null ? String(data.score) : '');
                setFeedback(data?.feedback || '');
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Failed to load submission.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleGrade = async (passed) => {
        const numericScore = Number(score);
        if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
            setError('Score must be a number between 0 and 100.');
            return;
        }
        if (feedback.trim().length < 5) {
            setError('Please leave at least a brief note for the learner.');
            return;
        }
        try {
            setSubmitting(true);
            setError('');
            const result = await adminProjectReviewService.grade(id, {
                passed: Boolean(passed),
                score_percent: numericScore,
                feedback: feedback.trim(),
            });
            setSubmission((prev) => ({ ...(prev || {}), ...result }));
            navigate('/admin/project-submissions');
        } catch (err) {
            setError(err?.message || 'Failed to record grade.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Stack alignItems="center" sx={{ py: 8 }}>
                <CircularProgress />
            </Stack>
        );
    }

    if (!submission) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error || 'Submission not found.'}</Alert>
            </Box>
        );
    }

    const files = submission.files || submission.attachments || [];

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 880, mx: 'auto' }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/admin/project-submissions')}
                sx={{ textTransform: 'none', mb: 2 }}
            >
                Back to queue
            </Button>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {submission.learner?.name || submission.user?.name || 'Submission'}
                    </Typography>
                    <Typography color="text.secondary">{submission.course?.title || '—'}</Typography>
                </Box>
                <Chip
                    label={submission.status || 'pending'}
                    color={
                        submission.status === 'passed'
                            ? 'success'
                            : submission.status === 'failed'
                                ? 'error'
                                : 'warning'
                    }
                />
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                    Learner's Description
                </Typography>
                <Typography sx={{ whiteSpace: 'pre-line', mb: 3 }}>{submission.description || '—'}</Typography>

                {files.length > 0 && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                            Attachments
                        </Typography>
                        <Stack spacing={1}>
                            {files.map((file) => (
                                <Stack
                                    key={file.id || file.url}
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1 }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <InsertDriveFileOutlined color="action" />
                                        <Box>
                                            <Typography>{file.name || file.filename || 'File'}</Typography>
                                            {file.size_bytes && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {(file.size_bytes / 1024 / 1024).toFixed(2)} MB
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                    {file.url && (
                                        <Button
                                            component={MuiLink}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            startIcon={<DownloadOutlined />}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Open
                                        </Button>
                                    )}
                                </Stack>
                            ))}
                        </Stack>
                    </>
                )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Grade Submission
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Score (0–100)"
                        type="number"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        fullWidth
                        inputProps={{ min: 0, max: 100 }}
                    />
                    <TextField
                        label="Feedback for the learner"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        fullWidth
                        multiline
                        minRows={4}
                        helperText="Required. The learner will see this in their dashboard."
                    />
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleOutlined />}
                            disabled={submitting}
                            onClick={() => handleGrade(true)}
                            sx={{ textTransform: 'none' }}
                        >
                            Pass
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<HighlightOff />}
                            disabled={submitting}
                            onClick={() => handleGrade(false)}
                            sx={{ textTransform: 'none' }}
                        >
                            Request Revision
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
};

export default ProjectGradePage;

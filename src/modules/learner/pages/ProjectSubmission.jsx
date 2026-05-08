import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Stack,
    CircularProgress,
    Alert,
    TextField,
    Paper,
    Chip,
    LinearProgress,
} from '@mui/material';
import {
    ArrowBack,
    UploadFileOutlined,
    DeleteOutline,
    CheckCircleOutlined,
    AccessTime,
    ErrorOutline,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { learnerProjectService } from '../services';

const MAX_TOTAL_BYTES = 50 * 1024 * 1024;

const StatusChip = ({ status }) => {
    const theme = useTheme();
    if (!status) return null;
    const map = {
        pending: { label: 'Awaiting Review', color: theme.palette.warning.main, icon: <AccessTime sx={{ fontSize: 16 }} /> },
        passed: { label: 'Passed', color: theme.palette.success.main, icon: <CheckCircleOutlined sx={{ fontSize: 16 }} /> },
        failed: { label: 'Needs Revision', color: theme.palette.error.main, icon: <ErrorOutline sx={{ fontSize: 16 }} /> },
    };
    const info = map[status.toLowerCase()] || { label: status, color: theme.palette.text.secondary };
    return (
        <Chip
            icon={info.icon}
            label={info.label}
            sx={{
                bgcolor: `${info.color}22`,
                color: info.color,
                border: `1px solid ${info.color}66`,
                fontWeight: 600,
            }}
        />
    );
};

const ProjectSubmission = () => {
    const { courseSlug } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = {
        bg: theme.palette.background.default,
        card: theme.palette.background.paper,
        border: theme.palette.divider,
        text: theme.palette.text.primary,
        textSecondary: theme.palette.text.secondary,
        primary: theme.palette.primary.main,
        success: theme.palette.success.main,
        danger: theme.palette.error.main,
        warn: theme.palette.warning.main,
    };

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [project, setProject] = useState(null);
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState([]);

    const totalBytes = files.reduce((sum, f) => sum + (f?.size || 0), 0);
    const tooLarge = totalBytes > MAX_TOTAL_BYTES;
    const hasExistingSubmission = project?.submission && project?.submission?.status;

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await learnerProjectService.getProject(courseSlug);
                if (cancelled) return;
                setProject(data);
                setDescription(data?.submission?.description || '');
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Failed to load project brief.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [courseSlug]);

    const handleFileChange = (e) => {
        const incoming = Array.from(e.target.files || []);
        setFiles((prev) => [...prev, ...incoming]);
        e.target.value = '';
    };

    const removeFile = (idx) => {
        setFiles((prev) => prev.filter((_f, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (tooLarge) {
            setError('Total file size exceeds the 50 MB limit.');
            return;
        }
        if (description.trim().length < 20) {
            setError('Please write at least a short description (20+ characters).');
            return;
        }
        if (files.length === 0 && !hasExistingSubmission) {
            setError('Please attach at least one file for your submission.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            const result = await learnerProjectService.submitProject(courseSlug, { description: description.trim(), files });
            setProject((prev) => ({ ...(prev || {}), submission: result?.submission || result }));
            setFiles([]);
        } catch (err) {
            setError(err?.message || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: colors.primary }} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, color: colors.text, py: 4 }}>
            <Box sx={{ maxWidth: 880, mx: 'auto', px: { xs: 2, md: 3 } }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ color: colors.textSecondary, textTransform: 'none', mb: 3 }}
                >
                    Back
                </Button>

                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Final Project Submission
                    </Typography>
                    <StatusChip status={project?.submission?.status} />
                </Stack>
                {project?.course?.title && (
                    <Typography sx={{ color: colors.textSecondary, mb: 3 }}>
                        {project.course.title}
                    </Typography>
                )}

                {error && (
                    <Alert
                        severity="error"
                        onClose={() => setError('')}
                        sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', color: '#FCA5A5' }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Brief */}
                <Paper
                    sx={{
                        bgcolor: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 2,
                        p: 3,
                        mb: 3,
                        color: colors.text,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Project Brief
                    </Typography>
                    <Typography sx={{ color: colors.textSecondary, whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                        {project?.brief || 'Your tutor has not published a brief yet. Check back soon.'}
                    </Typography>
                    {project?.requirements && (
                        <>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
                                Requirements
                            </Typography>
                            <Typography sx={{ color: colors.textSecondary, whiteSpace: 'pre-line' }}>
                                {project.requirements}
                            </Typography>
                        </>
                    )}
                </Paper>

                {/* Existing submission summary */}
                {hasExistingSubmission && (
                    <Paper
                        sx={{
                            bgcolor: colors.card,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 2,
                            p: 3,
                            mb: 3,
                            color: colors.text,
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Your Latest Submission
                        </Typography>
                        <Typography sx={{ color: colors.textSecondary, mb: 2 }}>
                            {project.submission.description || '—'}
                        </Typography>
                        {project.submission.feedback && (
                            <Box sx={{ p: 2, bgcolor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 1 }}>
                                <Typography variant="subtitle2" sx={{ color: colors.warn, mb: 0.5, fontWeight: 600 }}>
                                    Reviewer Feedback
                                </Typography>
                                <Typography sx={{ color: colors.text }}>{project.submission.feedback}</Typography>
                            </Box>
                        )}
                    </Paper>
                )}

                {/* Submit form */}
                {project?.submission?.status !== 'passed' && (
                    <Paper
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            bgcolor: colors.card,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 2,
                            p: 3,
                            color: colors.text,
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            {hasExistingSubmission ? 'Submit a Revised Version' : 'New Submission'}
                        </Typography>

                        <TextField
                            label="Description / Notes"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth
                            multiline
                            minRows={4}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: '#0C1322',
                                    color: colors.text,
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                                },
                                '& .MuiInputLabel-root': { color: colors.textSecondary },
                                '& .MuiInputLabel-root.Mui-focused': { color: colors.primary },
                            }}
                        />

                        <Box sx={{ mb: 2 }}>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<UploadFileOutlined />}
                                sx={{ color: colors.text, borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none' }}
                            >
                                Add Files
                                <input hidden multiple type="file" onChange={handleFileChange} />
                            </Button>
                            <Typography variant="caption" sx={{ color: colors.textSecondary, ml: 2 }}>
                                Total {(totalBytes / 1024 / 1024).toFixed(2)} MB / 50 MB
                            </Typography>
                        </Box>

                        {tooLarge && (
                            <Alert severity="warning" sx={{ mb: 2, bgcolor: 'rgba(245,158,11,0.1)', color: colors.warn }}>
                                File total exceeds the 50 MB upload cap.
                            </Alert>
                        )}

                        <Stack spacing={1} sx={{ mb: 3 }}>
                            {files.map((file, idx) => (
                                <Paper
                                    key={idx}
                                    sx={{
                                        bgcolor: '#0C1322',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 1,
                                        px: 2,
                                        py: 1.25,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Stack>
                                        <Typography sx={{ color: colors.text, fontSize: '0.9rem' }}>{file.name}</Typography>
                                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </Typography>
                                    </Stack>
                                    <Button
                                        size="small"
                                        startIcon={<DeleteOutline />}
                                        onClick={() => removeFile(idx)}
                                        sx={{ color: colors.danger, textTransform: 'none' }}
                                    >
                                        Remove
                                    </Button>
                                </Paper>
                            ))}
                        </Stack>

                        {submitting && <LinearProgress sx={{ mb: 2, '& .MuiLinearProgress-bar': { bgcolor: colors.primary } }} />}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={submitting || tooLarge}
                            sx={{
                                bgcolor: colors.primary,
                                py: 1.5,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                '&:hover': { bgcolor: '#1d4ed8' },
                                '&.Mui-disabled': { bgcolor: '#374151', color: '#6B7280' },
                            }}
                        >
                            {submitting ? 'Uploading…' : 'Submit Project'}
                        </Button>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default ProjectSubmission;

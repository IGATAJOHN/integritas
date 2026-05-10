import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Paper,
    Chip,
    Tabs,
    Tab,
} from '@mui/material';
import {
    AssignmentOutlined,
    ChevronRight,
} from '@mui/icons-material';
import { adminProjectReviewService } from '../services';

const STATUS_TABS = [
    { value: 'pending', label: 'Pending' },
    { value: 'passed', label: 'Passed' },
    { value: 'failed', label: 'Needs Revision' },
];

const getScanStatus = (submission) => String(
    submission.virus_scan_status ||
    submission.scan_status ||
    submission.security_scan_status ||
    'clean'
).toLowerCase();

const ProjectReview = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await adminProjectReviewService.list({ status: tab });
                if (cancelled) return;
                setItems(res?.data || []);
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Failed to load submissions.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [tab]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <AssignmentOutlined color="primary" />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Project Submissions
                </Typography>
            </Stack>

            <Tabs
                value={tab}
                onChange={(_e, v) => setTab(v)}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                {STATUS_TABS.map((t) => (
                    <Tab key={t.value} value={t.value} label={t.label} sx={{ textTransform: 'none' }} />
                ))}
            </Tabs>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Stack alignItems="center" sx={{ py: 8 }}>
                    <CircularProgress />
                </Stack>
            ) : items.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No submissions in this state.</Typography>
                </Paper>
            ) : (
                <Stack spacing={1.5}>
                    {items.map((submission) => (
                        <Paper
                            key={submission.id}
                            variant="outlined"
                            sx={{
                                p: 2,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                            onClick={() => navigate(`/admin/project-submissions/${submission.id}`)}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                <Box>
                                    <Typography sx={{ fontWeight: 600 }}>
                                        {submission.learner?.name || submission.user?.name || 'Unknown learner'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {submission.course?.title || '—'}
                                        {submission.submitted_at
                                            ? ` · Submitted ${new Date(submission.submitted_at).toLocaleDateString()}`
                                            : ''}
                                    </Typography>
                                </Box>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Chip
                                        size="small"
                                        label={`Scan: ${getScanStatus(submission)}`}
                                        color={['clean', 'passed', 'safe', 'completed'].includes(getScanStatus(submission)) ? 'success' : 'warning'}
                                        variant="outlined"
                                    />
                                    <Chip
                                        size="small"
                                        label={submission.status || tab}
                                        color={
                                            submission.status === 'passed'
                                                ? 'success'
                                                : submission.status === 'failed'
                                                    ? 'error'
                                                    : 'warning'
                                        }
                                        variant="outlined"
                                    />
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

export default ProjectReview;

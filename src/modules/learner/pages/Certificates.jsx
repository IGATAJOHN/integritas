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
} from '@mui/material';
import {
    ArrowBack,
    CardMembershipOutlined,
    DownloadOutlined,
    VerifiedOutlined,
    PaidOutlined,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { learnerCertificateService } from '../services';

const STATUS_LABELS = {
    awaiting_payment: 'Payment required',
    pending: 'Processing',
    issued: 'Issued',
    revoked: 'Revoked',
};

const Certificates = () => {
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
        warn: theme.palette.warning.main,
    };
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [certificates, setCertificates] = useState([]);
    const [busyId, setBusyId] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await learnerCertificateService.list();
                if (cancelled) return;
                setCertificates(res?.data || []);
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Failed to load certificates.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const handlePay = async (cert) => {
        try {
            setBusyId(cert.uuid);
            const res = await learnerCertificateService.initiatePayment(cert.uuid);
            const url = res?.authorization_url || res?.payment_url;
            if (res?.reference) {
                sessionStorage.setItem('pending_certificate_reference', res.reference);
                sessionStorage.setItem('pending_certificate_uuid', cert.uuid);
            }
            if (url) {
                window.location.href = url;
            } else {
                navigate('/certificates/return');
            }
        } catch (err) {
            setError(err?.message || 'Failed to start payment. Please try again.');
        } finally {
            setBusyId(null);
        }
    };

    const handleDownload = async (cert) => {
        try {
            setBusyId(cert.uuid);
            await learnerCertificateService.downloadPdf(
                cert.uuid,
                `${(cert.course?.title || 'certificate').replace(/[^a-z0-9]+/gi, '-')}.pdf`
            );
        } catch (err) {
            setError(err?.message || 'Could not download the PDF.');
        } finally {
            setBusyId(null);
        }
    };

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

                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <CardMembershipOutlined sx={{ color: colors.primary, fontSize: 32 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        My Certificates
                    </Typography>
                </Stack>

                {error && (
                    <Alert
                        severity="error"
                        onClose={() => setError('')}
                        sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', color: '#FCA5A5' }}
                    >
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Stack alignItems="center" sx={{ py: 8 }}>
                        <CircularProgress sx={{ color: colors.primary }} />
                    </Stack>
                ) : certificates.length === 0 ? (
                    <Paper
                        sx={{
                            bgcolor: colors.card,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 2,
                            p: 6,
                            textAlign: 'center',
                            color: colors.text,
                        }}
                    >
                        <CardMembershipOutlined sx={{ color: colors.textSecondary, fontSize: 48, mb: 2 }} />
                        <Typography sx={{ color: colors.textSecondary, mb: 2 }}>
                            You don't have any certificates yet. Complete a course and pass the final project to earn your Fellow certificate.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/learner/my-learning')}
                            sx={{ bgcolor: colors.primary, textTransform: 'none' }}
                        >
                            Continue Learning
                        </Button>
                    </Paper>
                ) : (
                    <Stack spacing={2}>
                        {certificates.map((cert) => {
                            const status = String(cert.status || '').toLowerCase();
                            const issued = status === 'issued';
                            const awaiting = status === 'awaiting_payment';
                            return (
                                <Paper
                                    key={cert.uuid}
                                    sx={{
                                        bgcolor: colors.card,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 2,
                                        p: 3,
                                        color: colors.text,
                                    }}
                                >
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {cert.course?.title || 'Course Certificate'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 1 }}>
                                                Issued {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : '—'} · ID {cert.uuid}
                                            </Typography>
                                            <Chip
                                                label={STATUS_LABELS[status] || cert.status || 'Unknown'}
                                                size="small"
                                                sx={{
                                                    bgcolor: issued
                                                        ? `${colors.success}22`
                                                        : awaiting
                                                            ? `${colors.warn}22`
                                                            : 'rgba(255,255,255,0.06)',
                                                    color: issued ? colors.success : awaiting ? colors.warn : colors.textSecondary,
                                                    border: `1px solid ${issued ? `${colors.success}66` : awaiting ? `${colors.warn}66` : 'rgba(255,255,255,0.1)'}`,
                                                }}
                                            />
                                        </Box>
                                        <Stack direction="row" spacing={1.5}>
                                            {awaiting && (
                                                <Button
                                                    variant="contained"
                                                    startIcon={<PaidOutlined />}
                                                    disabled={busyId === cert.uuid}
                                                    onClick={() => handlePay(cert)}
                                                    sx={{ bgcolor: colors.primary, textTransform: 'none', '&:hover': { bgcolor: '#1d4ed8' } }}
                                                >
                                                    Pay NGN 8,000
                                                </Button>
                                            )}
                                            {issued && (
                                                <>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<DownloadOutlined />}
                                                        disabled={busyId === cert.uuid}
                                                        onClick={() => handleDownload(cert)}
                                                        sx={{ bgcolor: colors.primary, textTransform: 'none', '&:hover': { bgcolor: '#1d4ed8' } }}
                                                    >
                                                        Download PDF
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<VerifiedOutlined />}
                                                        onClick={() => navigate(`/verify/${cert.uuid}`)}
                                                        sx={{ color: colors.text, borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none' }}
                                                    >
                                                        Public Page
                                                    </Button>
                                                </>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

export default Certificates;

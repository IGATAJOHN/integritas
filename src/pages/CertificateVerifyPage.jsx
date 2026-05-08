import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Paper,
    Divider,
} from '@mui/material';
import {
    VerifiedOutlined,
    ErrorOutline,
    DownloadOutlined,
    HomeOutlined,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { apiService, buildBackendUrl } from '../services/api';
import logo from '../assets/images/integritas_logo.jpg';

const CertificateVerifyPage = () => {
    const { uuid } = useParams();
    const theme = useTheme();
    const colors = {
        card: theme.palette.background.paper,
        border: theme.palette.divider,
        text: theme.palette.text.primary,
        textSecondary: theme.palette.text.secondary,
        primary: theme.palette.primary.main,
        success: theme.palette.success.main,
        danger: theme.palette.error.main,
    };
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [certificate, setCertificate] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const verify = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await apiService.get(`/verify/${encodeURIComponent(uuid)}`);
                if (cancelled) return;
                setCertificate(res?.data || res);
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Certificate not found or invalid.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        verify();
        return () => {
            cancelled = true;
        };
    }, [uuid]);

    const pdfUrl = buildBackendUrl(`/verify/${encodeURIComponent(uuid)}/pdf`);
    const valid = certificate && String(certificate?.status || '').toLowerCase() === 'issued';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: colors.text }}>
            <Box
                sx={{
                    px: { xs: 2, md: 4 },
                    py: 2,
                    borderBottom: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box component="img" src={logo} alt="Integritas" sx={{ width: 32, height: 32 }} />
                    <Typography sx={{ fontWeight: 700 }}>Integritas — Certificate Verification</Typography>
                </Stack>
                <Button
                    component={Link}
                    to="/"
                    startIcon={<HomeOutlined />}
                    sx={{ color: colors.textSecondary, textTransform: 'none' }}
                >
                    Home
                </Button>
            </Box>

            <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 2, md: 3 }, py: 6 }}>
                <Paper
                    sx={{
                        bgcolor: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 3,
                        p: { xs: 3, md: 5 },
                        color: colors.text,
                        textAlign: 'center',
                    }}
                >
                    {loading ? (
                        <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
                            <CircularProgress sx={{ color: colors.primary }} />
                            <Typography sx={{ color: colors.textSecondary }}>Verifying certificate…</Typography>
                        </Stack>
                    ) : error || !certificate ? (
                        <>
                            <ErrorOutline sx={{ color: colors.danger, fontSize: 56, mb: 2 }} />
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                Certificate not found
                            </Typography>
                            <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(239,68,68,0.1)', color: '#FCA5A5', textAlign: 'left' }}>
                                {error || 'We could not verify this certificate ID. Double-check the link or contact the issuer.'}
                            </Alert>
                        </>
                    ) : (
                        <>
                            <Box
                                sx={{
                                    width: 72,
                                    height: 72,
                                    bgcolor: valid ? `${colors.success}22` : `${colors.danger}22`,
                                    borderRadius: '50%',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                }}
                            >
                                {valid ? (
                                    <VerifiedOutlined sx={{ color: colors.success, fontSize: 40 }} />
                                ) : (
                                    <ErrorOutline sx={{ color: colors.danger, fontSize: 40 }} />
                                )}
                            </Box>

                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                {valid ? 'Verified Certificate' : 'Certificate Invalid'}
                            </Typography>
                            <Typography sx={{ color: colors.textSecondary, mb: 4 }}>
                                {valid
                                    ? 'This certificate was issued by Integritas and is valid.'
                                    : 'The status of this certificate is not active.'}
                            </Typography>

                            <Divider sx={{ borderColor: colors.border, mb: 3 }} />

                            <Stack spacing={2.5} sx={{ textAlign: 'left' }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
                                        Awarded To
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {certificate.learner?.name || certificate.user?.name || '—'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
                                        Course
                                    </Typography>
                                    <Typography variant="body1">{certificate.course?.title || '—'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
                                        Issued On
                                    </Typography>
                                    <Typography variant="body1">
                                        {certificate.issued_at
                                            ? new Date(certificate.issued_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })
                                            : '—'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
                                        Certificate ID
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: colors.textSecondary }}>
                                        {uuid}
                                    </Typography>
                                </Box>
                            </Stack>

                            {valid && (
                                <Button
                                    component="a"
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="contained"
                                    startIcon={<DownloadOutlined />}
                                    sx={{ mt: 4, bgcolor: colors.primary, textTransform: 'none', '&:hover': { bgcolor: '#1d4ed8' } }}
                                >
                                    View / Download PDF
                                </Button>
                            )}
                        </>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default CertificateVerifyPage;

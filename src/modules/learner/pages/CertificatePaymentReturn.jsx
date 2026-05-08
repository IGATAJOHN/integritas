import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Paper,
} from '@mui/material';
import { CheckCircleOutlined, ErrorOutline, ArrowBack } from '@mui/icons-material';
import { learnerCertificateService } from '../services';

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 12; // ~30 seconds

const CertificatePaymentReturn = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const certUuid =
        searchParams.get('certificate') ||
        searchParams.get('uuid') ||
        sessionStorage.getItem('pending_certificate_uuid') ||
        '';

    const [status, setStatus] = useState('verifying');
    const [error, setError] = useState('');
    const [certificate, setCertificate] = useState(null);

    useEffect(() => {
        if (!certUuid) {
            setStatus('error');
            setError('No certificate reference found.');
            return undefined;
        }

        let cancelled = false;
        let attempts = 0;

        const poll = async () => {
            attempts += 1;
            try {
                const cert = await learnerCertificateService.get(certUuid);
                if (cancelled) return;
                const certStatus = String(cert?.status || '').toLowerCase();
                if (certStatus === 'issued') {
                    setCertificate(cert);
                    setStatus('success');
                    sessionStorage.removeItem('pending_certificate_uuid');
                    sessionStorage.removeItem('pending_certificate_reference');
                    return;
                }
                if (attempts < MAX_POLL_ATTEMPTS) {
                    setTimeout(poll, POLL_INTERVAL_MS);
                } else {
                    setStatus('pending');
                }
            } catch (err) {
                if (cancelled) return;
                if (attempts < MAX_POLL_ATTEMPTS) {
                    setTimeout(poll, POLL_INTERVAL_MS);
                } else {
                    setStatus('error');
                    setError(err?.message || 'Could not verify the certificate payment.');
                }
            }
        };

        poll();
        return () => {
            cancelled = true;
        };
    }, [certUuid]);

    const handleDownload = async () => {
        if (!certificate?.uuid) return;
        try {
            await learnerCertificateService.downloadPdf(certificate.uuid);
        } catch (err) {
            setError(err?.message || 'Could not download the PDF.');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Paper
                variant="outlined"
                sx={{
                    maxWidth: 480,
                    width: '100%',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                }}
            >
                {status === 'verifying' && (
                    <>
                        <CircularProgress color="primary" sx={{ mb: 3 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                            Verifying your payment…
                        </Typography>
                        <Typography color="text.secondary">
                            We're confirming your certificate payment. This usually only takes a few seconds.
                        </Typography>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircleOutlined sx={{ color: 'success.main', fontSize: 56, mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                            Certificate ready!
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            Congratulations — your Fellow certificate has been issued.
                        </Typography>
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button onClick={handleDownload} variant="contained" sx={{ textTransform: 'none' }}>
                                Download PDF
                            </Button>
                            <Button onClick={() => navigate('/learner/certificates')} variant="outlined" sx={{ textTransform: 'none' }}>
                                My Certificates
                            </Button>
                        </Stack>
                    </>
                )}

                {status === 'pending' && (
                    <>
                        <CircularProgress sx={{ color: 'warning.main', mb: 3 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                            Still processing…
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            Your certificate will appear in your list once Paystack confirms the payment.
                        </Typography>
                        <Button onClick={() => navigate('/learner/certificates')} variant="contained" sx={{ textTransform: 'none' }}>
                            Go to Certificates
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <ErrorOutline sx={{ color: 'error.main', fontSize: 56, mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                            Something went wrong
                        </Typography>
                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                            {error}
                        </Alert>
                        <Button component={Link} to="/learner/certificates" variant="outlined" startIcon={<ArrowBack />} sx={{ textTransform: 'none' }}>
                            Back to Certificates
                        </Button>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default CertificatePaymentReturn;

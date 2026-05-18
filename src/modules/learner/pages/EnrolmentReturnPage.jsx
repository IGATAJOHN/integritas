import React, { useEffect, useRef, useState } from 'react';
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
import { learnerEnrollmentService } from '../services';
import { useAuth } from '../../../contexts';

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 15; // ~30 seconds

const EnrolmentReturnPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refreshUser } = useAuth();
    const refreshUserRef = useRef(refreshUser);

    const referenceFromQuery =
        searchParams.get('reference') ||
        searchParams.get('trxref') ||
        sessionStorage.getItem('pending_enrolment_reference') ||
        '';

    // Resolve the post-payment destination from session storage saved before
    // the Paystack redirect. Falls back to the foundational hub.
    const pendingCourseSlug = sessionStorage.getItem('pending_course_slug') || '';
    const pendingCourseType = sessionStorage.getItem('pending_course_type') || '';
    const learningPath = pendingCourseType === 'expert' && pendingCourseSlug
        ? `/explore/lesson/${pendingCourseSlug}`
        : '/learner/foundational';

    const [status, setStatus] = useState(referenceFromQuery ? 'verifying' : 'error');
    const [error, setError] = useState(
        referenceFromQuery ? '' : 'No payment reference found. If you completed payment, check your enrolments page in a moment.'
    );

    useEffect(() => {
        refreshUserRef.current = refreshUser;
    }, [refreshUser]);

    useEffect(() => {
        if (!referenceFromQuery) {
            return undefined;
        }

        let cancelled = false;
        let attempts = 0;

        const poll = async () => {
            attempts += 1;
            try {
                const result = await learnerEnrollmentService.verifyEnrolment(referenceFromQuery);
                if (cancelled) return;

                const verifiedStatus = String(result?.status || result?.enrolment?.status || '').toLowerCase();
                if (verifiedStatus === 'success' || verifiedStatus === 'paid' || verifiedStatus === 'active') {
                    setStatus('success');
                    sessionStorage.removeItem('pending_enrolment_reference');
                    sessionStorage.removeItem('pending_course_slug');
                    sessionStorage.removeItem('pending_course_id');
                    sessionStorage.removeItem('pending_course_type');
                    try {
                        await refreshUserRef.current();
                    } catch { /* best-effort account-state refresh */ }
                    setTimeout(() => {
                        if (!cancelled) navigate(learningPath, { replace: true });
                    }, 1500);
                    return;
                }
                if (verifiedStatus === 'failed' || verifiedStatus === 'cancelled') {
                    setStatus('failed');
                    setError(result?.message || 'Payment was not completed.');
                    return;
                }
                // Still pending — try again
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
                    setError(err?.message || 'We could not verify your payment. Please contact support.');
                }
            }
        };

        poll();
        return () => {
            cancelled = true;
        };
    }, [learningPath, navigate, referenceFromQuery]);

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
                            Hang tight while we confirm your enrolment with Paystack.
                        </Typography>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircleOutlined sx={{ color: 'success.main', fontSize: 56, mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                            You're enrolled!
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            Payment confirmed. Taking you to the course now…
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate(learningPath, { replace: true })}
                            sx={{ textTransform: 'none' }}
                        >
                            Start Learning
                        </Button>
                    </>
                )}

                {status === 'pending' && (
                    <>
                        <CircularProgress sx={{ color: 'warning.main', mb: 3 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                            Still confirming…
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            This is taking a little longer than usual. Your enrolment will appear in
                            your dashboard once Paystack confirms the payment.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/explore/enrollments')}
                            sx={{ textTransform: 'none' }}
                        >
                            Go to My Enrolments
                        </Button>
                    </>
                )}

                {(status === 'failed' || status === 'error') && (
                    <>
                        <ErrorOutline sx={{ color: 'error.main', fontSize: 56, mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                            Payment not completed
                        </Typography>
                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                            {error}
                        </Alert>
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                onClick={() => navigate(-1)}
                                sx={{ textTransform: 'none' }}
                            >
                                Try Again
                            </Button>
                            <Button
                                component={Link}
                                to="/learner"
                                variant="outlined"
                                startIcon={<ArrowBack />}
                                sx={{ textTransform: 'none' }}
                            >
                                Dashboard
                            </Button>
                        </Stack>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default EnrolmentReturnPage;

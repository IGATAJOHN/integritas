import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    Stack,
    useTheme,
    alpha,
    Divider,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    CheckCircleOutlined as CheckCircle,
    CreditCardOutlined as CreditCard
} from '@mui/icons-material';
import logo from '../../../assets/images/integritas_logo.jpg';
import { learnerEnrollmentService, courseCatalogService } from '../services';

const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const [searchParams] = useSearchParams();
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState(null);
    const [enrollment, setEnrollment] = useState(location.state?.enrollment || null);
    const [course, setCourse] = useState(location.state?.course || {});

    const trxref = searchParams.get('trxref');
    const reference = searchParams.get('reference');

    const fetchCourseIfMissing = async (enrollmentResult) => {
        if (enrollmentResult?.course?.title) return; // already have details
        const courseId = enrollmentResult?.course_id || enrollmentResult?.course?.id;
        if (!courseId) return;
        try {
            const data = await courseCatalogService.getCourseById(courseId);
            setCourse((prev) => ({
                ...prev,
                title: data?.title || prev.title,
                instructor: data?.instructor || prev.instructor,
                courseId,
            }));
        } catch (_) { /* best-effort */ }
    };

    useEffect(() => {
        // New flow: /payment/success?reference=ENR_... (enrollment callback)
        if (reference && !trxref) {
            const verify = async () => {
                setVerifying(true);
                setVerifyError(null);
                try {
                    const result = await learnerEnrollmentService.verifyPaymentStatus(reference);
                    setEnrollment(result);
                    await fetchCourseIfMissing(result);
                } catch (err) {
                    setVerifyError('Payment verification failed. Your enrollment may still be active — check My Enrollments.');
                } finally {
                    setVerifying(false);
                }
            };
            verify();
        }
        // Legacy flow: /payment-success?trxref=...&reference=... (Paystack redirect)
        else if (trxref && reference) {
            const verify = async () => {
                setVerifying(true);
                setVerifyError(null);
                try {
                    const result = await learnerEnrollmentService.verifyPayment({ trxref, reference });
                    setEnrollment(result);
                    await fetchCourseIfMissing(result);
                } catch (err) {
                    setVerifyError('Payment verification failed. Your enrollment may still be active — check My Enrollments.');
                } finally {
                    setVerifying(false);
                }
            };
            verify();
        }
    }, [trxref, reference]);

    // Build display data from real enrollment or fallback
    const orderDetails = {
        id: enrollment?.id || trxref || reference || '—',
        date: formatDate(enrollment?.enrolled_at || enrollment?.created_at),
        courseTitle: enrollment?.course?.title || course?.title || 'Your Course',
        instructor: enrollment?.course?.instructor || course?.instructor || '—',
        price: course?.price ?? 0,
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#0B1120',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <Box sx={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                px: { xs: 2, md: 4 },
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2
            }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                        component="img"
                        src={logo}
                        alt="Integritas"
                        sx={{ width: 32, height: 32, objectFit: 'contain' }}
                    />
                    <Typography variant="subtitle1" sx={{
                        fontWeight: 700,
                        color: '#fff',
                        display: { xs: 'none', sm: 'block' }
                    }}>
                        Integritas
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
                    {['Dashboard', 'Courses', 'Marketplace', 'Community'].map((item) => (
                        <Typography
                            key={item}
                            variant="body2"
                            sx={{
                                color: 'rgba(255,255,255,0.7)',
                                cursor: 'pointer',
                                '&:hover': { color: '#fff' }
                            }}
                        >
                            {item}
                        </Typography>
                    ))}
                </Stack>

                <Box sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
            </Box>

            {/* Content */}
            <Container maxWidth="md" sx={{ flex: 1, py: { xs: 4, md: 8 }, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: { sm: '700px !important' } }}>

                {/* Verifying state */}
                {verifying && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                        <CircularProgress sx={{ color: '#3B82F6' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            Verifying your payment...
                        </Typography>
                    </Box>
                )}

                {/* Verify error */}
                {verifyError && !verifying && (
                    <Alert severity="warning" sx={{ mb: 4, width: '100%', bgcolor: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                        {verifyError}
                    </Alert>
                )}

                {!verifying && (
                    <>
                        {/* Success Icon */}
                        <Box sx={{
                            width: 72,
                            height: 72,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3
                        }}>
                            <CheckCircle sx={{ fontSize: 40, color: '#3B82F6' }} />
                        </Box>

                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
                            {verifyError ? 'Enrollment Processed' : 'Payment Successful!'}
                        </Typography>

                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 6, textAlign: 'center' }}>
                            Thank you for your purchase. You are now enrolled and can start learning.
                        </Typography>

                        {/* Order Details Card */}
                        <Box sx={{
                            width: '100%',
                            bgcolor: 'rgba(255,255,255,0.05)',
                            borderRadius: 1,
                            border: '1px solid rgba(255,255,255,0.05)',
                            overflow: 'hidden',
                            mb: 4
                        }}>
                            {/* Card Header */}
                            <Box sx={{
                                p: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                bgcolor: 'rgba(40, 46, 57, 1)',
                            }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Enrollment Details
                                </Typography>
                            </Box>

                            {/* Order Meta */}
                            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(40, 46, 57, 1)' }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={4}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5, fontSize: 10, letterSpacing: 0.5 }}>
                                            ENROLLMENT ID
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#fff', wordBreak: 'break-all' }}>
                                            {orderDetails.id}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5, fontSize: 10, letterSpacing: 0.5 }}>
                                            DATE
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#fff' }}>
                                            {orderDetails.date}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5, fontSize: 10, letterSpacing: 0.5 }}>
                                            STATUS
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600 }}>
                                            {enrollment?.status || 'Enrolled'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Purchased Item */}
                            <Box sx={{ p: 3, pb: 0 }}>
                                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 2, fontWeight: 600, fontSize: 12, letterSpacing: 0.5, px: 2 }}>
                                    ENROLLED COURSE
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#000', p: 2, borderRadius: 1 }}>
                                    {course?.thumbnail ? (
                                        <Box
                                            component="img"
                                            src={course.thumbnail}
                                            alt={orderDetails.courseTitle}
                                            sx={{ width: 64, height: 48, borderRadius: 1, objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Box sx={{ width: 64, height: 48, borderRadius: 1, bgcolor: 'rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CreditCard sx={{ color: '#3B82F6', fontSize: 24 }} />
                                        </Box>
                                    )}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#fff' }}>
                                            {orderDetails.courseTitle}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                            {orderDetails.instructor}
                                        </Typography>
                                    </Box>
                                    {orderDetails.price > 0 && (
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>
                                            ${orderDetails.price.toFixed(2)}
                                        </Typography>
                                    )}
                                </Box>
                                <Divider sx={{ mt: 3, borderColor: 'rgba(255,255,255,0.05)' }} />
                            </Box>

                            {/* Total */}
                            {orderDetails.price > 0 && (
                                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                        Total Paid
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: '#3B82F6', fontWeight: 700 }}>
                                        ${orderDetails.price.toFixed(2)}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </>
                )}

                {/* Actions */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={() => {
                            const courseId =
                                enrollment?.course_id ||
                                enrollment?.course?.id ||
                                enrollment?.courseId ||
                                course?.courseId ||
                                course?.id ||
                                sessionStorage.getItem('pending_course_id');
                            sessionStorage.removeItem('pending_course_id');
                            navigate(courseId ? `/explore/lesson/${courseId}` : '/learner');
                        }}
                        startIcon={<CheckCircle sx={{ fontSize: 20 }} />}
                        sx={{
                            bgcolor: '#2563EB',
                            color: '#fff',
                            py: 1.5,
                            px: 4,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            '&:hover': { bgcolor: '#1D4ED8' }
                        }}
                    >
                        Start Learning Now
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/explore/courses')}
                        sx={{
                            color: '#fff',
                            borderColor: 'rgba(255,255,255,0.2)',
                            py: 1.5,
                            px: 4,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            '&:hover': {
                                borderColor: '#fff',
                                bgcolor: 'rgba(255,255,255,0.05)'
                            }
                        }}
                    >
                        Return to Marketplace
                    </Button>
                </Stack>

                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 4 }}>
                    Need help with your order? <Box component="span" sx={{ color: '#3B82F6', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Contact Support</Box>
                </Typography>

            </Container>

            {/* Footer */}
            <Box sx={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                px: 6,
                py: 3,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                    © 2024 Integritas. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
};

export default PaymentSuccess;

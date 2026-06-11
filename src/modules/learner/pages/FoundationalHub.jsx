import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    LinearProgress,
    Paper,
    Snackbar,
    Stack,
    Typography,
} from '@mui/material';
import {
    CheckCircle,
    ExpandMore,
    Lock,
    MenuBookOutlined,
    PaymentsOutlined,
    PlayArrow,
    QuizOutlined,
    SchoolOutlined,
    VerifiedUserOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts';
import { useThemeMode } from '../../../contexts';
import { courseCatalogService, learnerEnrollmentService } from '../services';
import Header from '../../../components/Header';
import theme from '../../../styles/theme';

const getColors = (isDark) => ({
    bg: isDark ? '#080D19' : '#F8FAFC',
    card: isDark ? '#111827' : '#FFFFFF',
    panel: isDark ? '#1A2230' : '#F1F5F9',
    border: isDark ? '#374151' : '#E2E8F0',
    text: isDark ? '#FFFFFF' : '#1E293B',
    muted: isDark ? '#9CA3AF' : '#64748B',
    brand: theme.colors.brand,
    success: '#10B981',
});

const getCourseSlug = (course) => course?.slug || course?.raw?.slug || course?.raw_data?.slug || '';
const getCourseId = (course) => course?.id || course?.raw?.id || course?.raw_data?.id;
const getModules = (course) => {
    const raw = course?.raw_data || course?.raw || course || {};
    const modules = raw.modules || raw.course_modules || course?.modules || [];
    return Array.isArray(modules) ? modules : [];
};

const countLessons = (modules) => modules.reduce((sum, module) => (
    sum + Number(module.lessons_count ?? (Array.isArray(module.lessons) ? module.lessons.length : 0))
), 0);

const getTutorName = (value) => (
    value?.name ||
    value?.full_name ||
    `${value?.first_name || ''} ${value?.last_name || ''}`.trim() ||
    value?.email ||
    'Foundational Tutor'
);

const getAssignedTutor = (lesson, tutors) => {
    const id = String(lesson?.assigned_tutor_id || lesson?.tutor_id || lesson?.assigned_tutor?.id || lesson?.tutor?.id || '');
    return lesson?.assigned_tutor || lesson?.tutor || tutors.find((tutor) => String(tutor.id || tutor.user_id) === id);
};

const getPaymentError = (error) => {
    const message = error?.data?.message || error?.message || '';
    const lower = message.toLowerCase();
    if (lower.includes('authorization bearer') || lower.includes('secret key') || lower.includes('paystack')) {
        return 'Payment is temporarily unavailable because the payment gateway is not configured correctly. Please contact support or try again later.';
    }
    return message || 'Failed to start payment. Please try again.';
};

const FoundationalHub = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { isDark } = useThemeMode();
    const colors = getColors(isDark);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [course, setCourse] = useState(null);
    const [tutors, setTutors] = useState([]);
    const [enrollment, setEnrollment] = useState(null);
    const [progress, setProgress] = useState(null);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [expanded, setExpanded] = useState('');

    const modules = useMemo(() => getModules(course), [course]);
    const lessonCount = useMemo(() => countLessons(modules), [modules]);
    const enrolled = ['active', 'enrolled', 'in_progress', 'completed'].includes(String(enrollment?.status || '').toLowerCase());
    const courseSlug = getCourseSlug(course);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const list = await courseCatalogService.listFoundationalCourses({ per_page: 25 });
            const courses = list.data || [];
            const selected = courses.find((item) => ['foundational course', 'foundational courses'].includes(String(item.title || '').trim().toLowerCase())) || courses[0];
            if (!selected) {
                setCourse(null);
                setError('The Foundational Courses are not available yet.');
                return;
            }

            const slug = getCourseSlug(selected) || selected.id;
            const detail = await courseCatalogService.getCourseById(slug);
            setCourse(detail);

            const detailSlug = getCourseSlug(detail) || slug;
            courseCatalogService.listCourseTutors(detailSlug)
                .then((res) => setTutors(res.data || []))
                .catch(() => setTutors([]));

            if (isAuthenticated) {
                const enrolments = await learnerEnrollmentService.getEnrollments({
                    course_id: getCourseId(detail),
                    course_slug: detailSlug,
                    per_page: 5,
                }).catch(() => ({ data: [] }));
                const found = (enrolments.data || []).find((item) => {
                    const itemCourse = item.course || {};
                    return String(item.course_id || itemCourse.id || '') === String(getCourseId(detail) || '') ||
                        String(item.course_slug || itemCourse.slug || '') === String(detailSlug || '');
                });
                setEnrollment(found || null);

                const status = String(found?.status || '').toLowerCase();
                if (['active', 'enrolled', 'in_progress', 'completed'].includes(status)) {
                    const progressData = await learnerEnrollmentService.getCourseProgress(detailSlug).catch(() => null);
                    setProgress(progressData);
                } else {
                    setProgress(null);
                }
            }
        } catch (err) {
            setError(err?.message || 'Failed to load the Foundational Courses.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        load();
    }, [load]);

    const startPayment = async () => {
        if (!courseSlug || !course) return;
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location } });
            return;
        }
        
        navigate('/checkout', {
            state: {
                courseId: course.id,
                courseSlug: courseSlug,
                title: course.title,
                instructor: getTutorName(tutors[0]),
                level: course.level || 'Foundational',
                thumbnail: course.image || course.thumbnail || null,
                price: course.price || 0,
                tax: course.tax || 0,
                fee: course.fee || 0,
            }
        });
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, color: colors.text }}>
                <Header />
                <Box sx={{ minHeight: 'calc(100vh - 84px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Stack alignItems="center" spacing={2}>
                        <CircularProgress sx={{ color: colors.brand }} />
                        <Typography sx={{ color: colors.muted }}>Loading Foundational Courses...</Typography>
                    </Stack>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, color: colors.text }}>
            <Header />
            <Box sx={{ maxWidth: '1280px', mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 4, pb: 8 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                    <Typography component="button" onClick={() => navigate('/')} sx={{ color: colors.muted, bgcolor: 'transparent', border: 0, p: 0, cursor: 'pointer', fontSize: '0.875rem', '&:hover': { color: colors.text } }}>
                        Home
                    </Typography>
                    <Typography sx={{ color: colors.muted }}>/</Typography>
                    <Typography sx={{ color: colors.brand, fontSize: '0.875rem' }}>Foundational Courses</Typography>
                </Stack>

                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4} alignItems="flex-start">
                <Box sx={{ flex: 1, width: '100%' }}>
                    <Box sx={{ mb: 4 }}>
                        <Chip label="Foundational Programme" icon={<VerifiedUserOutlined />} sx={{ bgcolor: 'rgba(17,82,212,0.18)', color: '#93C5FD', mb: 2 }} />
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.65rem', md: '2.35rem' } }}>
                            {course?.title || 'Foundational Courses'}
                        </Typography>
                        <Typography sx={{ color: colors.muted, fontSize: '1rem', lineHeight: 1.7, mb: 3, maxWidth: 760 }}>
                            {course?.description || course?.summary || 'Build the core governance and integrity foundations before moving into advanced learning.'}
                        </Typography>
                        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                            <Metric icon={<MenuBookOutlined />} label="Modules" value={modules.length} />
                            <Metric icon={<PlayArrow />} label="Lessons" value={lessonCount} />
                            <Metric icon={<SchoolOutlined />} label="Tutors" value={tutors.length} />
                        </Stack>
                    </Box>

                    {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

                    <Paper sx={{ bgcolor: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 2, p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>How access works</Typography>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            {[
                                ['1', 'Verify email', 'Use the verification link sent after registration.'],
                                ['2', 'Pay enrolment fee', 'Complete Paystack payment for the Foundational Courses.'],
                                ['3', 'Unlock lessons and CBT', 'Access every foundational module, lesson, tutor content, and quiz.'],
                            ].map(([step, title, body]) => (
                                <Paper key={step} sx={{ flex: 1, bgcolor: colors.card, border: `1px solid ${colors.border}`, p: 2 }}>
                                    <Avatar sx={{ bgcolor: colors.brand, mb: 1 }}>{step}</Avatar>
                                    <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
                                    <Typography sx={{ color: colors.muted, fontSize: '0.9rem' }}>{body}</Typography>
                                </Paper>
                            ))}
                        </Stack>
                    </Paper>

                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Modules and Lessons</Typography>
                    {modules.length === 0 ? (
                        <Paper sx={{ bgcolor: colors.panel, border: `1px solid ${colors.border}`, p: 4, color: colors.muted }}>
                            Modules are not available yet.
                        </Paper>
                    ) : modules.map((module, moduleIndex) => (
                        <Accordion
                            key={module.id || moduleIndex}
                            expanded={expanded === `module-${module.id || moduleIndex}`}
                            onChange={(_, isExpanded) => setExpanded(isExpanded ? `module-${module.id || moduleIndex}` : '')}
                            sx={{ bgcolor: colors.panel, border: `1px solid ${colors.border}`, mb: 1.5, '&:before': { display: 'none' } }}
                        >
                            <AccordionSummary expandIcon={<ExpandMore sx={{ color: colors.muted }} />}>
                                <Box>
                                    <Typography sx={{ fontWeight: 700 }}>{moduleIndex + 1}. {module.title || 'Untitled module'}</Typography>
                                    <Typography sx={{ color: colors.muted, fontSize: '0.85rem' }}>
                                        {module.lessons_count ?? (Array.isArray(module.lessons) ? module.lessons.length : 0)} lessons
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack spacing={1.25}>
                                    {(module.lessons || []).length === 0 ? (
                                        <Typography sx={{ color: colors.muted }}>Lessons will be available soon.</Typography>
                                    ) : module.lessons.map((lesson, lessonIndex) => {
                                        const tutor = getAssignedTutor(lesson, tutors);
                                        const canOpen = enrolled && lesson.slug;
                                        return (
                                            <Stack key={lesson.id || lessonIndex} direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ p: 1.5, bgcolor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 1 }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    {enrolled ? <CheckCircle sx={{ color: colors.success }} /> : <Lock sx={{ color: colors.muted }} />}
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 650 }}>{lesson.title || 'Untitled lesson'}</Typography>
                                                        <Typography sx={{ color: colors.muted, fontSize: '0.8rem' }}>
                                                            Tutor: {tutor ? getTutorName(tutor) : 'To be assigned'}
                                                            {lesson.duration_minutes ? ` - ${lesson.duration_minutes}m` : ''}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                                <Stack direction="row" spacing={1}>
                                                    {lesson.has_cbt || lesson.cbt_available ? (
                                                        <Chip size="small" icon={<QuizOutlined />} label="CBT" sx={{ color: '#A78BFA', bgcolor: 'rgba(167,139,250,0.14)' }} />
                                                    ) : null}
                                                    <Button disabled={!canOpen} onClick={() => navigate(`/explore/lesson/${courseSlug}/${lesson.slug || lesson.id}`)} sx={{ textTransform: 'none' }}>
                                                        {enrolled ? 'Open' : 'Locked'}
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                        );
                                    })}
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

                <Paper sx={{ width: { xs: '100%', lg: 360 }, bgcolor: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 1, p: 3, position: { lg: 'sticky' }, top: 100 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Programme Access</Typography>
                    <Typography sx={{ color: colors.muted, fontSize: '0.9rem', mb: 2 }}>
                        One enrolment unlocks all foundational modules and lessons.
                    </Typography>
                    {enrolled ? (
                        <>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <CheckCircle sx={{ color: colors.success }} />
                                <Typography sx={{ color: colors.success, fontWeight: 700 }}>Access active</Typography>
                            </Stack>
                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ color: colors.muted, fontSize: '0.8rem', mb: 0.5 }}>Progress</Typography>
                                <LinearProgress value={Number(progress?.progress_percent || progress?.progress || 0)} variant="determinate" sx={{ height: 8, borderRadius: 1 }} />
                            </Box>
                            <Button fullWidth variant="contained" startIcon={<PlayArrow />} onClick={() => navigate(`/explore/lesson/${courseSlug}`)} sx={{ textTransform: 'none', ...buttonSx }}>
                                Continue Learning
                            </Button>
                        </>
                    ) : !isAuthenticated ? (
                        <>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <Lock sx={{ color: '#FBBF24' }} />
                                <Typography sx={{ color: '#FBBF24', fontWeight: 700 }}>Preview mode</Typography>
                            </Stack>
                            <Button fullWidth variant="contained" disabled={!courseSlug} onClick={startPayment} sx={{ textTransform: 'none', ...buttonSx }}>
                                Login to Enrol
                            </Button>
                        </>
                    ) : (
                        <>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <PaymentsOutlined sx={{ color: '#FBBF24' }} />
                                <Typography sx={{ color: '#FBBF24', fontWeight: 700 }}>Waiting for payment</Typography>
                            </Stack>
                            <Button fullWidth variant="contained" disabled={paying || !courseSlug} onClick={startPayment} sx={{ textTransform: 'none', ...buttonSx }}>
                                {paying ? 'Starting payment...' : 'Pay and Enrol'}
                            </Button>
                        </>
                    )}
                    <Divider sx={{ borderColor: colors.border, my: 2 }} />
                    <Typography sx={{ color: colors.muted, fontSize: '0.85rem' }}>
                        Payment verification is automatic. If Paystack redirects you back before access appears, refresh this page after a moment.
                    </Typography>
                </Paper>
            </Stack>
            </Box>
            <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

const buttonSx = {
    bgcolor: colors.brand,
    '&:hover': { bgcolor: '#0D42AF' },
};

const Metric = ({ icon, label, value }) => (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ p: 1.5, bgcolor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 1 }}>
        <Avatar sx={{ bgcolor: 'rgba(17,82,212,0.16)', color: colors.brand, width: 34, height: 34 }}>{icon}</Avatar>
        <Box>
            <Typography sx={{ fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
            <Typography sx={{ color: colors.muted, fontSize: '0.78rem' }}>{label}</Typography>
        </Box>
    </Stack>
);

export default FoundationalHub;

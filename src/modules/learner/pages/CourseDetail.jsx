import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    Button,
    Chip,
    Card,
    CardContent,
    Avatar,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    LinearProgress,
    Rating,
    Divider,
    InputBase,
    IconButton
} from '@mui/material';
import {
    Search as SearchIcon,
    PlayCircle as PlayIcon,
    ExpandMore as ExpandMoreIcon,
    Check as CheckIcon,
    StarOutline as StarIcon,
    AccessTime as ClockIcon,
    SignalCellularAlt as LevelIcon,
    CardMembershipOutlined as CertificateIcon,
    CalendarToday as CalendarIcon,
    School as SchoolIcon,
    People as PeopleIcon,
    PlayLesson as LessonsIcon,
    Verified as VerifiedIcon,
    AccountBalance as GovernanceIcon,
    Gavel as EthicsIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Language as WorldIcon,
    AlternateEmail as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts';
import { useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import logo from '../../../assets/images/integritas_logo.png';
import Footer from '../../../components/Footer';
import { courseCatalogService, learnerEnrollmentService } from '../services';
import { apiService } from '../../../services/api';
import Header from '../../../components/Header';

const colors = {
    bg: '#0B0F19',
    paper: '#111827',
    card: '#1A1F2E',
    cardHover: '#232936',
    primary: '#2563EB',
    accent: '#3B82F6',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: 'rgba(255, 255, 255, 0.08)',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
};

const resolveTutorProfile = (course = {}) => {
    const listFields = [
        course?.tutors,
        course?.users,
        course?.course_tutors,
        course?.courseTutors,
        course?.tutor_users,
        course?.tutorUsers,
        course?.tutor_assignments,
        course?.tutorAssignments,
    ];

    const candidates = [
        course?.tutor,
        course?.user,
        course?.creator,
        course?.created_by,
        course?.createdBy,
        course?.instructor,
        course?.author,
        ...listFields.flatMap((value) => Array.isArray(value) ? value : []),
    ].filter(Boolean);

    return candidates.find((candidate) => {
        const source = candidate?.tutor && typeof candidate.tutor === 'object'
            ? candidate.tutor
            : candidate?.user && typeof candidate.user === 'object'
                ? candidate.user
                : candidate;

        return Boolean(
            source?.name ||
            source?.full_name ||
            source?.email ||
            source?.id
        );
    }) || null;
};

const readTutorName = (candidate) => {
    const source = candidate?.tutor && typeof candidate.tutor === 'object'
        ? candidate.tutor
        : candidate?.user && typeof candidate.user === 'object'
            ? candidate.user
            : candidate;

    const first = String(source?.first_name || source?.firstName || '').trim();
    const last = String(source?.last_name || source?.lastName || '').trim();
    if (first || last) return `${first} ${last}`.trim();

    return [
        source?.name,
        source?.full_name,
        source?.fullName,
        source?.display_name,
        source?.displayName,
        source?.username,
        source?.email,
    ]
        .map((value) => String(value || '').trim())
        .find(Boolean) || '';
};

const readTutorValue = (candidate, ...fields) => {
    const source = candidate?.tutor && typeof candidate.tutor === 'object'
        ? candidate.tutor
        : candidate?.user && typeof candidate.user === 'object'
            ? candidate.user
            : candidate;

    return fields
        .map((field) => String(source?.[field] || '').trim())
        .find(Boolean) || '';
};

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [expandedModule, setExpandedModule] = useState('module-1');
    const [searchQuery, setSearchQuery] = useState('');

    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const curriculumSummary = useMemo(() => {
        const modules = courseData?.modules || [];
        const moduleCount = modules.length;
        let lessonCount = 0;
        let totalMinutes = 0;
        modules.forEach((m) => {
            const lessons = Array.isArray(m.lessons) ? m.lessons : [];
            lessonCount += m.lessons_count ?? lessons.length;
            if (typeof m.duration_minutes === 'number') {
                totalMinutes += m.duration_minutes;
            } else {
                totalMinutes += lessons.reduce((sum, l) => sum + (Number(l.duration_minutes) || 0), 0);
            }
        });
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const durationLabel = totalMinutes > 0
            ? (hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`)
            : null;
        const parts = [
            `${moduleCount} ${moduleCount === 1 ? 'Module' : 'Modules'}`,
            `${lessonCount} ${lessonCount === 1 ? 'Lesson' : 'Lessons'}`,
        ];
        if (durationLabel) parts.push(`${durationLabel} total length`);
        return parts.join(' • ');
    }, [courseData]);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState(null);
    const [accessInfo, setAccessInfo] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        let active = true;
        const fetchCourseDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await courseCatalogService.getCourseById(courseId);
                if (!active) return;
                
                if (data) {
                    const raw = data.raw_data || data;
                    const tutorProfile = resolveTutorProfile(raw);

                    const coursePrice = data.price ? parseFloat(data.price) : 0;
                    const currency = raw.certificate?.currency || raw.currency || 'USD';

                    // Learning objectives: only use real API data
                    const rawObjectives = raw.learning_objectives;
                    const learningObjectives = Array.isArray(rawObjectives) && rawObjectives.length > 0
                        ? rawObjectives
                        : typeof rawObjectives === 'string' && rawObjectives.trim()
                            ? [rawObjectives]
                            : [];

                    setCourseData({
                        id: data.id,
                        title: data.title || 'Untitled Course',
                        description: data.description || 'No description available.',
                        price: coursePrice,
                        currency,
                        level: data.level || 'Intermediate',
                        duration: data.duration || 'TBD',
                        hasCertificate: raw.certificate?.enabled ?? false,
                        language: raw.language || '—',
                        startDate: raw.start_date || raw.published_at || 'Ongoing',
                        rating: data.rating || 0,
                        reviewCount: data.reviews || 0,
                        image: data.image || raw.thumbnail_url || raw.banner_url || '',
                        tags: Array.isArray(raw.tags) && raw.tags.length > 0
                            ? raw.tags.map(t => ({ label: t.name || t, icon: VerifiedIcon, iconColor: '#3B82F6', bgColor: '#374151' }))
                            : [],
                        learningObjectives,
                        modules: Array.isArray(raw.modules) ? raw.modules : [],
                        instructor: {
                            name: readTutorName(tutorProfile) || data.instructor || 'Integritas',
                            title: readTutorValue(tutorProfile, 'headline', 'title', 'profession') || 'Course Instructor',
                            bio: readTutorValue(tutorProfile, 'bio') || '',
                        },
                        reviews: [],
                        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                        trainingFor: Array.isArray(raw.target_audience) && raw.target_audience.length > 0
                            ? raw.target_audience
                            : [],
                    });

                    // Fetch lessons for modules that don't already include them
                    const rawModules = Array.isArray(raw.modules) ? raw.modules : [];
                    const modulesMissingLessons = rawModules.filter(
                        (m) => !Array.isArray(m.lessons) || m.lessons.length === 0
                    );
                    if (modulesMissingLessons.length > 0) {
                        Promise.all(rawModules.map(async (m) => {
                            if (Array.isArray(m.lessons) && m.lessons.length > 0) return m;
                            try {
                                const lessonsRes = await apiService.get(`/lms/modules/${m.id}/lessons`);
                                const rawLessons = Array.isArray(lessonsRes?.data)
                                    ? lessonsRes.data
                                    : Array.isArray(lessonsRes) ? lessonsRes : [];
                                return { ...m, lessons: rawLessons };
                            } catch {
                                return { ...m, lessons: [] };
                            }
                        })).then((modulesWithLessons) => {
                            if (!active) return;
                            setCourseData((prev) => prev ? { ...prev, modules: modulesWithLessons } : prev);
                        });
                    }
                } else {
                    setError('Course not found');
                }
            } catch (err) {
                if (!active) return;
                console.error('Failed to fetch course details:', err);
                setError(err?.status === 401
                    ? 'Please log in to view this course.'
                    : err?.message === 'Course not found'
                    ? 'Course not found'
                    : 'Failed to load course details. Please try again.');
            } finally {
                if (active) setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseDetail();
        }

        return () => {
            active = false;
        };
    }, [courseId]);

    // Fetch access info + enrollment status once authenticated
    useEffect(() => {
        if (!isAuthenticated || !courseId) return;
        learnerEnrollmentService.getCourseAccess(courseId)
            .then((data) => setAccessInfo(data))
            .catch(() => {});
        learnerEnrollmentService.getEnrollments({ course_id: courseId, per_page: 1 })
            .then((res) => {
                const enrollment = res.data?.[0];
                const status = String(enrollment?.status || '').toLowerCase();
                if (status === 'enrolled' || status === 'in_progress' || status === 'completed') {
                    setIsEnrolled(true);
                }
            })
            .catch(() => {});
    }, [isAuthenticated, courseId]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleModuleChange = (panel) => (event, isExpanded) => {
        setExpandedModule(isExpanded ? panel : false);
    };

    const hasCourseImage = Boolean(String(courseData?.image || '').trim());

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location } });
            return;
        }
        setEnrolling(true);
        setEnrollError(null);
        try {
            const enrollFn = accessInfo?.is_essential
                ? learnerEnrollmentService.enrollInEssentialCourse
                : learnerEnrollmentService.enrollInCourse;
            const result = await enrollFn(courseData.id);
            if (result?.payment_url) {
                sessionStorage.setItem('pending_course_id', courseData.id);
                window.location.href = result.payment_url;
            } else {
                navigate('/payment-success', { state: { enrollment: result, course: { courseId: courseData.id, title: courseData.title, price: courseData.price, thumbnail: courseData.image } } });
            }
        } catch (err) {
            setEnrollError(err?.message || 'Enrollment failed. Please try again.');
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <Box sx={{ bgcolor: colors.bg, color: colors.text, minHeight: '100vh' }}>
            
            <Header/>

            {/* Main Content */}
            <Box sx={{
                maxWidth: '1280px',
                mx: 'auto',
                px: { xs: 2, sm: 3, md: 4 },
                py: 4,
                pb: 8
            }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <Typography sx={{ color: colors.textSecondary }}>Loading course details...</Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <Typography sx={{ color: colors.error }}>{error}</Typography>
                    </Box>
                ) : courseData && (
                    <>
                {/* Breadcrumb */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                    <Typography component={Link} to="/" sx={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: colors.text } }}>Home</Typography>
                    <Typography sx={{ color: colors.textSecondary }}>/</Typography>
                    <Typography component={Link} to="/explore" sx={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: colors.text } }}>Courses</Typography>
                    <Typography sx={{ color: colors.textSecondary }}>/</Typography>
                    <Typography sx={{ color: colors.accent, fontSize: '0.875rem' }}>{courseData.title}</Typography>
                </Stack>

                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
                    {/* Left Content */}
                    <Box sx={{ flex: 1, maxWidth: { lg: 'calc(100% - 400px)' } }}>
                        {/* Course Title */}
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                            {courseData.title}
                        </Typography>

                        {/* Course Description */}
                        <Typography sx={{ color: colors.textSecondary, fontSize: '1rem', lineHeight: 1.7, mb: 3, maxWidth: '650px' }}>
                            {courseData.description}
                        </Typography>

                        {/* Tags */}
                        {courseData.tags.length > 0 && (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 1.5,
                            alignItems: 'center',
                            mb: 3
                        }}>
                            {courseData.tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    icon={<tag.icon sx={{ fontSize: 14, color: `${tag.iconColor} !important` }} />}
                                    label={tag.label}
                                    size="small"
                                    sx={{
                                        bgcolor: tag.bgColor,
                                        color: '#FFFFFF',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        borderRadius: '4px',
                                        px: 1,
                                        height: '32px',
                                        '& .MuiChip-icon': {
                                            marginLeft: '8px'
                                        }
                                    }}
                                />
                            ))}
                            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ ml: { xs: 0, sm: 1 } }}>
                                <StarIcon sx={{ color: colors.warning, fontSize: 20 }} />
                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                                    ({courseData.reviewCount.toLocaleString()} reviews)
                                </Typography>
                            </Stack>
                        </Box>
                        )}

                        {/* Tabs */}
                        <Box sx={{ borderBottom: `2px solid ${colors.border}`, mb: 4 }}>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                sx={{
                                    '& .MuiTab-root': {
                                        color: colors.textSecondary,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        minWidth: 'auto',
                                        px: 2,
                                        '&.Mui-selected': { color: colors.text }
                                    },
                                    '& .MuiTabs-indicator': { bgcolor: colors.primary, height: 3 }
                                }}
                            >
                                <Tab label="Overview" />
                                <Tab label="Curriculum" />
                                <Tab label="Instructor" />
                                <Tab label="Reviews" />
                            </Tabs>
                        </Box>

                        {/* Tab Content */}
                        {activeTab === 0 && (
                            <Box>
                                {/* Learning Objectives */}
                                {courseData.learningObjectives.length > 0 && (
                                    <>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>What you'll learn</Typography>
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                                            gap: 2,
                                            mb: 5
                                        }}>
                                            {courseData.learningObjectives.map((objective, index) => (
                                                <Card key={index} sx={{
                                                    bgcolor: colors.card,
                                                    border: `1px solid ${colors.border}`,
                                                    borderRadius: 1
                                                }}>
                                                    <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                                        <CheckIcon sx={{ color: colors.accent, fontSize: 20, mt: 0.25 }} />
                                                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', lineHeight: 1.5 }}>
                                                            {objective}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Box>
                                    </>
                                )}

                                {/* Course Image Banner */}
                                {hasCourseImage ? (
                                    <Box
                                        component="img"
                                        src={courseData.image}
                                        alt={courseData.title}
                                        sx={{ width: '100%', height: { xs: 180, md: 260 }, objectFit: 'cover', borderRadius: 2, mb: 4 }}
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                ) : (
                                    <Box sx={{ width: '100%', height: { xs: 180, md: 260 }, bgcolor: '#111827', borderRadius: 2, mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <SchoolIcon sx={{ fontSize: 72, color: 'rgba(255,255,255,0.1)' }} />
                                    </Box>
                                )}

                                {/* Curriculum Summary */}
                                {/* Course Content Header & Summary */}
                                <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 3 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Course content</Typography>
                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', fontWeight: 500 }}>
                                        {curriculumSummary}
                                    </Typography>
                                </Stack>

                                {/* Modules Accordion */}
                                <Box sx={{ mb: 5 }}>
                                    {courseData.modules.length === 0 ? (
                                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                                            Curriculum not yet available.
                                        </Typography>
                                    ) : courseData.modules.map((module) => (
                                        <Accordion
                                            key={module.id}
                                            expanded={expandedModule === `module-${module.id}`}
                                            onChange={handleModuleChange(`module-${module.id}`)}
                                            sx={{
                                                bgcolor: colors.card,
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '4px !important',
                                                mb: 2,
                                                '&:before': { display: 'none' },
                                                '&.Mui-expanded': { margin: '0 0 16px 0' }
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon sx={{ color: colors.textSecondary }} />}
                                                sx={{ px: 3, py: 1 }}
                                            >
                                                <Box>
                                                    <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>{module.title}</Typography>
                                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                                                        {module.lessons_count ?? (Array.isArray(module.lessons) ? module.lessons.length : module.lessons) ?? 0} Lessons
                                                        {module.duration_minutes ? ` • ${module.duration_minutes}m` : module.duration ? ` • ${module.duration}` : ''}
                                                    </Typography>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                                                {Array.isArray(module.lessons) && module.lessons.length > 0 ? (
                                                    <Stack spacing={1.5}>
                                                        {module.lessons.map((lesson, idx) => {
                                                            const lessonTitle = lesson.title || lesson.name || 'Untitled Lesson';
                                                            const lessonDuration = lesson.duration_minutes ?? lesson.duration;
                                                            return (
                                                                <Stack
                                                                    key={lesson.id ?? `${module.id}-lesson-${idx}`}
                                                                    direction="row"
                                                                    alignItems="center"
                                                                    spacing={1.5}
                                                                >
                                                                    <PlayIcon sx={{ color: colors.textSecondary, fontSize: '1.1rem' }} />
                                                                    <Typography sx={{ flex: 1, fontSize: '0.875rem', color: colors.text }}>
                                                                        {lessonTitle}
                                                                    </Typography>
                                                                    {lessonDuration ? (
                                                                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                                                                            {lessonDuration}m
                                                                        </Typography>
                                                                    ) : null}
                                                                </Stack>
                                                            );
                                                        })}
                                                    </Stack>
                                                ) : (
                                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                                                        Lessons will be available soon.
                                                    </Typography>
                                                )}
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Box>

                                {/* Instructor Header */}
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Instructor</Typography>

                                {/* Instructor Card */}
                                <Card sx={{
                                    bgcolor: colors.card,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 1,
                                    p: 3,
                                    mb: 5
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{courseData.instructor.name}</Typography>
                                    <Typography sx={{ color: colors.accent, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2 }}>
                                        {courseData.instructor.title}
                                    </Typography>
                                    {courseData.instructor.bio && (
                                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', lineHeight: 1.7 }}>
                                            {courseData.instructor.bio}
                                        </Typography>
                                    )}
                                </Card>

                                {/* Reviews Header */}
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Student Feedback</Typography>

                                {/* Reviews Section */}
                                <Card sx={{
                                    bgcolor: colors.card,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 1,
                                    p: 3
                                }}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                                        {/* Rating Summary */}
                                        <Box sx={{ minWidth: 150 }}>
                                            <Typography variant="h2" sx={{ fontWeight: 700, fontSize: '3rem', mb: 1 }}>{courseData.rating}</Typography>
                                            <Rating
                                                value={courseData.rating}
                                                precision={0.1}
                                                readOnly
                                                icon={<StarIcon fontSize="inherit" />}
                                                emptyIcon={<StarIcon fontSize="inherit" />}
                                                sx={{ color: colors.warning, mb: 1 }}
                                            />
                                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Course Rating</Typography>
                                        </Box>

                                        {/* Rating Breakdown */}
                                        <Box sx={{ flex: 1 }}>
                                            {[5, 4, 3, 2, 1].map((rating) => (
                                                <Stack key={rating} direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem', minWidth: 15 }}>{rating}</Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={courseData.ratingBreakdown[rating]}
                                                        sx={{
                                                            flex: 1,
                                                            height: 8,
                                                            borderRadius: 4,
                                                            bgcolor: colors.border,
                                                            '& .MuiLinearProgress-bar': { bgcolor: '#FFFFFF', borderRadius: 4 }
                                                        }}
                                                    />
                                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem', minWidth: 35 }}>{courseData.ratingBreakdown[rating]}%</Typography>
                                                </Stack>
                                            ))}
                                        </Box>
                                    </Stack>

                                    <Divider sx={{ borderColor: colors.border, my: 3 }} />

                                    {/* User Reviews */}
                                    {courseData.reviews.map((review) => (
                                        <Box key={review.id}>
                                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                                <Avatar sx={{ bgcolor: colors.primary, width: 40, height: 40 }}>{review.avatar}</Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                                                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{review.user}</Typography>
                                                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>• {review.date}</Typography>
                                                    </Stack>
                                                    <Rating value={review.rating} size="small" readOnly sx={{ color: colors.warning, mb: 1 }} />
                                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', lineHeight: 1.7 }}>
                                                        "{review.comment}"
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    ))}
                                </Card>
                            </Box>
                        )}

                        {activeTab === 1 && (
                            <Box>
                                <Typography sx={{ color: colors.textSecondary, mb: 3 }}>
                                    {curriculumSummary}
                                </Typography>
                                {courseData.modules.map((module) => (
                                    <Accordion
                                        key={module.id}
                                        expanded={expandedModule === `module-${module.id}`}
                                        onChange={handleModuleChange(`module-${module.id}`)}
                                        sx={{
                                            bgcolor: colors.card,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '12px !important',
                                            mb: 2,
                                            '&:before': { display: 'none' }
                                        }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: colors.textSecondary }} />} sx={{ px: 3 }}>
                                            <Box>
                                                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>{module.title}</Typography>
                                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                                                    {module.lessons_count ?? (Array.isArray(module.lessons) ? module.lessons.length : module.lessons) ?? 0} Lessons • {module.duration}
                                                </Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                                            {Array.isArray(module.lessons) && module.lessons.length > 0 ? (
                                                <Stack spacing={1.5}>
                                                    {module.lessons.map((lesson, idx) => {
                                                        const lessonTitle = lesson.title || lesson.name || 'Untitled Lesson';
                                                        const lessonDuration = lesson.duration_minutes ?? lesson.duration;
                                                        return (
                                                            <Stack
                                                                key={lesson.id ?? `${module.id}-lesson-${idx}`}
                                                                direction="row"
                                                                alignItems="center"
                                                                spacing={1.5}
                                                            >
                                                                <PlayIcon sx={{ color: colors.textSecondary, fontSize: '1.1rem' }} />
                                                                <Typography sx={{ flex: 1, fontSize: '0.875rem', color: colors.text }}>
                                                                    {lessonTitle}
                                                                </Typography>
                                                                {lessonDuration ? (
                                                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                                                                        {lessonDuration}m
                                                                    </Typography>
                                                                ) : null}
                                                            </Stack>
                                                        );
                                                    })}
                                                </Stack>
                                            ) : (
                                                <Typography sx={{ color: colors.textSecondary }}>Lessons will be available soon.</Typography>
                                            )}
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                        )}

                        {activeTab === 2 && (
                            <Card sx={{ bgcolor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 3, p: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{courseData.instructor.name}</Typography>
                                <Typography sx={{ color: colors.accent, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 2 }}>{courseData.instructor.title}</Typography>
                                {courseData.instructor.bio && (
                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', lineHeight: 1.7 }}>{courseData.instructor.bio}</Typography>
                                )}
                            </Card>
                        )}

                        {activeTab === 3 && (
                            <Card sx={{ bgcolor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 3, p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 3 }}>Student Reviews</Typography>
                                {courseData.reviews.map((review) => (
                                    <Box key={review.id}>
                                        <Stack direction="row" spacing={2}>
                                            <Avatar sx={{ bgcolor: colors.primary }}>{review.avatar}</Avatar>
                                            <Box>
                                                <Typography sx={{ fontWeight: 600 }}>{review.user}</Typography>
                                                <Rating value={review.rating} size="small" readOnly sx={{ color: colors.warning }} />
                                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mt: 1 }}>"{review.comment}"</Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                ))}
                            </Card>
                        )}
                    </Box>

                    {/* Right Sidebar */}
                    <Box sx={{
                        width: { xs: '100%', lg: '360px' },
                        flexShrink: 0,
                        position: { lg: 'sticky' },
                        top: { lg: 100 },
                        alignSelf: 'flex-start'
                    }}>
                        {/* Enroll Card */}
                        <Card sx={{
                            bgcolor: colors.card,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 1,
                            overflow: 'hidden'
                        }}>
                            {/* Preview Image */}
                            <Box sx={{ position: 'relative' }}>
                                {hasCourseImage ? (
                                    <>
                                        <Box
                                            component="img"
                                            src={courseData.image}
                                            alt="Course Thumbnail"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement.querySelector('.img-fallback').style.display = 'flex';
                                            }}
                                            sx={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                                        />
                                        <Box
                                            className="img-fallback"
                                            sx={{ display: 'none', width: '100%', height: 180, bgcolor: '#111827', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <SchoolIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.15)' }} />
                                        </Box>
                                    </>
                                ) : (
                                    <Box sx={{ width: '100%', height: 180, bgcolor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <SchoolIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.15)' }} />
                                    </Box>
                                )}
                            </Box>

                            <CardContent sx={{ p: 2.5 }}>
                                {/* Pricing */}
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                    {courseData.price > 0 ? (
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                            {courseData.currency === 'NGN' ? '₦' : '$'}{Number(courseData.price).toLocaleString()}
                                        </Typography>
                                    ) : (
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: colors.success }}>Free</Typography>
                                    )}
                                    {accessInfo && (
                                        <Chip
                                            label={accessInfo.is_essential ? 'Essential' : 'Standard'}
                                            size="small"
                                            sx={{
                                                bgcolor: accessInfo.is_essential ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                color: accessInfo.is_essential ? '#F59E0B' : '#10B981',
                                                border: `1px solid ${accessInfo.is_essential ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                            }}
                                        />
                                    )}
                                </Stack>

                                {/* Action Buttons */}
                                {accessInfo?.is_essential && !isEnrolled && (
                                    <Box sx={{
                                        bgcolor: 'rgba(245, 158, 11, 0.1)',
                                        border: '1px solid rgba(245, 158, 11, 0.3)',
                                        borderRadius: 1,
                                        p: 1.5,
                                        mb: 2
                                    }}>
                                        <Typography sx={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.8rem', mb: 0.5 }}>
                                            One-Time Payment — Unlimited Essential Access
                                        </Typography>
                                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.75rem', lineHeight: 1.5 }}>
                                            Paying for any Essential course gives you permanent access to all Essential courses on the platform.
                                        </Typography>
                                    </Box>
                                )}
                                {enrollError && (
                                    <Typography sx={{ color: colors.error, fontSize: '0.8rem', mb: 1.5 }}>
                                        {enrollError}
                                    </Typography>
                                )}
                                {isEnrolled ? (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => navigate(`/explore/lesson/${courseId}/`)}
                                        sx={{
                                            bgcolor: colors.success,
                                            py: 1.25,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            borderRadius: 1,
                                            mb: 1.5,
                                            fontSize: '0.95rem',
                                            '&:hover': { bgcolor: '#059669' }
                                        }}
                                    >
                                        Resume Course
                                    </Button>
                                ) : (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                        sx={{
                                            bgcolor: colors.primary,
                                            py: 1.25,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            borderRadius: 1,
                                            mb: 1.5,
                                            fontSize: '0.95rem',
                                            '&.Mui-disabled': { bgcolor: colors.primary, opacity: 0.7 }
                                        }}
                                    >
                                        {enrolling ? 'Processing...' : 'Enroll Now'}
                                    </Button>
                                )}

                                {/* <Button
                                    fullWidth
                                    variant="outlined"
                                    sx={{
                                        borderColor: colors.border,
                                        color: colors.text,
                                        py: 1.25,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        borderRadius: 1,
                                        mb: 2,
                                        '&:hover': { borderColor: colors.textSecondary, bgcolor: 'transparent' }
                                    }}
                                >
                                    Download Syllabus
                                </Button> */}

                                {/* Course Details */}
                                <Stack spacing={1.5}>
                                    {[
                                        { icon: LevelIcon, label: 'Level', value: courseData.level },
                                        { icon: ClockIcon, label: 'Duration', value: courseData.duration },
                                        { icon: CertificateIcon, label: 'Certificate', value: courseData.hasCertificate ? 'Yes, Official' : 'No' },
                                        { icon: WorldIcon, label: 'Language', value: courseData.language },
                                        { icon: CalendarIcon, label: 'Start Date', value: courseData.startDate }
                                    ].map((item, index) => (
                                        <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <item.icon sx={{ color: colors.textSecondary, fontSize: 18 }} />
                                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>{item.label}</Typography>
                                            </Stack>
                                            <Typography sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{item.value}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </CardContent>

                            {/* Money Back Guarantee - Card Footer */}
                            {/* <Box sx={{
                                bgcolor: alpha(colors.textSecondary, 0.1),
                                p: 1.5,
                                textAlign: 'center',
                                borderTop: `1px solid ${colors.border}`
                            }}>
                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.75rem' }}>
                                    30-Day Money-Back Guarantee
                                </Typography>
                            </Box> */}
                        </Card>

                        {/* Training For Card — only shown when API provides target_audience */}
                        {courseData.trainingFor.length > 0 && (
                            <Card sx={{
                                bgcolor: colors.card,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 1,
                                mt: 2,
                                p: 2.5
                            }}>
                                <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>Training For</Typography>
                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    {courseData.trainingFor.map((item, index) => (
                                        <Chip
                                            key={index}
                                            label={item}
                                            size="small"
                                            sx={{
                                                bgcolor: alpha(colors.primary, 0.2),
                                                color: colors.accent,
                                                fontSize: '0.75rem'
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Card>
                        )}
                    </Box>
                </Stack>
                </>
                )}
            </Box>

            {/* Footer */}
            <Footer />
        </Box>
    );
};

export default CourseDetail;

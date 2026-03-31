import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    LinearProgress,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Slider,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import {
    AccessTime as ClockIcon,
    ArrowBack,
    CalendarToday as CalendarIcon,
    CardMembershipOutlined as CertificateIcon,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    ExpandMore,
    Fullscreen,
    Language as LanguageIcon,
    Lock,
    Pause,
    PlayArrow,
    PlayCircleOutline,
    Settings,
    SignalCellularAlt as LevelIcon,
    Subtitles,
    VolumeUp,
} from '@mui/icons-material';
import logo from '../../../assets/images/GGH_logo.png';
import { courseCatalogService, learnerEnrollmentService } from '../services';

const colors = {
    bg: '#080D19',
    sidebar: '#0C1322',
    card: '#1A1F2E',
    border: 'rgba(255,255,255,0.06)',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    primary: '#2563EB',
    success: '#10B981',
};

const formatTime = (seconds) => {
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const parseDurationMinutes = (value) => {
    if (!value) return 0;
    const n = parseInt(String(value), 10);
    return Number.isFinite(n) ? n : 0;
};

const CourseLesson = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();

    const [courseData, setCourseData] = useState(null);
    const [modules, setModules] = useState([]);
    const [selectedLessonId, setSelectedLessonId] = useState(lessonId || null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lessonLoading, setLessonLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedModule, setExpandedModule] = useState(null);

    // Video player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration] = useState(900); // default 15 min placeholder

    const initialLessonLoaded = useRef(false);

    // --- Load course + modules on mount ---
    useEffect(() => {
        if (!courseId) return;
        let active = true;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await courseCatalogService.getCourseById(courseId);
                if (!active) return;

                const raw = data?.raw_data || data;
                setCourseData(data);

                // Extract modules + nested lessons from raw API response
                const rawModules = Array.isArray(raw?.modules) ? raw.modules : [];
                const moduleList = rawModules.map((m) => ({
                    id: String(m.id || ''),
                    title: String(m.title || m.name || 'Untitled Module'),
                    order: m.order || m.position || 0,
                    lessons: Array.isArray(m.lessons) ? m.lessons.map((l) => ({
                        id: String(l.id || ''),
                        title: String(l.title || l.name || 'Untitled Lesson'),
                        duration: l.duration || l.duration_minutes || 0,
                        order: l.order || l.position || 0,
                        video_url: l.video_url || l.video || '',
                        description: l.description || '',
                        content: l.content || '',
                    })) : [],
                }));

                setModules(moduleList);

                // Pick initial lesson
                if (!initialLessonLoaded.current) {
                    const allLessons = moduleList.flatMap((m) => m.lessons);
                    const target = lessonId
                        ? allLessons.find((l) => l.id === lessonId)
                        : allLessons[0];

                    if (target) {
                        setSelectedLessonId(target.id);
                        // Auto-expand that module
                        const ownerModule = moduleList.find((m) =>
                            m.lessons.some((l) => l.id === target.id)
                        );
                        if (ownerModule) setExpandedModule(ownerModule.id);
                    }
                    initialLessonLoaded.current = true;
                }

                // Non-blocking enrollment info
                learnerEnrollmentService.getEnrollmentStatus(courseId)
                    .then((res) => { if (active) setEnrollmentData(res); })
                    .catch(() => {});
            } catch (err) {
                if (active) setError(err?.message || 'Failed to load course.');
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        return () => { active = false; };
    }, [courseId]);

    // --- Load lesson detail when selectedLessonId changes ---
    useEffect(() => {
        if (!selectedLessonId) return;
        let active = true;

        // First try to populate from cached module data
        const cached = modules.flatMap((m) => m.lessons).find((l) => l.id === selectedLessonId);
        if (cached) setCurrentLesson(cached);

        setLessonLoading(true);
        setCurrentTime(0);
        setIsPlaying(false);

        courseCatalogService.getLessonById(selectedLessonId)
            .then((detail) => {
                if (!active) return;
                setCurrentLesson((prev) => ({ ...prev, ...detail }));
            })
            .catch(() => {}) // keep cached data on error
            .finally(() => { if (active) setLessonLoading(false); });

        return () => { active = false; };
    }, [selectedLessonId]); // eslint-disable-line react-hooks/exhaustive-deps

    const allLessons = useMemo(() => modules.flatMap((m) => m.lessons), [modules]);
    const currentIndex = useMemo(
        () => allLessons.findIndex((l) => l.id === selectedLessonId),
        [allLessons, selectedLessonId]
    );
    const prevLesson = allLessons[currentIndex - 1] || null;
    const nextLesson = allLessons[currentIndex + 1] || null;

    const remainingLessons = allLessons.slice(currentIndex + 1);
    const remainingMinutes = remainingLessons.reduce(
        (sum, l) => sum + parseDurationMinutes(l.duration), 0
    );

    const totalLessons = allLessons.length;
    const progressPercent = enrollmentData?.progress_percent
        ? Number(enrollmentData.progress_percent)
        : 0;
    const completedLessons = Math.round((progressPercent / 100) * totalLessons);

    const currentModule = modules.find((m) =>
        m.lessons.some((l) => l.id === selectedLessonId)
    );

    const handleSelectLesson = (lesson) => {
        setSelectedLessonId(lesson.id);
        navigate(`/explore/lesson/${courseId}/${lesson.id}`, { replace: true });
        const ownerModule = modules.find((m) => m.lessons.some((l) => l.id === lesson.id));
        if (ownerModule) setExpandedModule(ownerModule.id);
    };

    // --- Render ---
    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    const videoSrc = currentLesson?.video_url || currentLesson?.video || courseData?.image || '';
    const tags = Array.isArray(courseData?.raw?.tags) ? courseData.raw.tags : [];
    const cert = courseData?.raw?.certificate;
    const hasCertificate = cert?.enabled ?? Boolean(cert);
    const courseDuration = courseData?.duration || '—';
    const courseLevel = courseData?.level || '—';
    const courseLanguage = courseData?.raw?.language || '—';
    const courseStartDate = courseData?.raw?.start_date || courseData?.raw?.published_at || 'Ongoing';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, display: 'flex', flexDirection: 'column' }}>

            {/* ── Header ── */}
            <Box sx={{
                bgcolor: colors.sidebar,
                borderBottom: `1px solid ${colors.border}`,
                px: 3,
                py: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
            }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box component="img" src={logo} alt="Integritas Hub" sx={{ width: 30, height: 30, objectFit: 'contain' }} />
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: colors.textSecondary, fontSize: '0.82rem' }}>
                        <Typography
                            variant="body2"
                            sx={{ color: colors.textSecondary, cursor: 'pointer', '&:hover': { color: colors.text } }}
                            onClick={() => navigate('/explore/my-learning')}
                        >
                            My Learning
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>›</Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: colors.textSecondary, cursor: 'pointer', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', '&:hover': { color: colors.text } }}
                            onClick={() => navigate(`/explore/course/${courseId}`)}
                        >
                            {courseData?.title || 'Course'}
                        </Typography>
                        {currentModule && (
                            <>
                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>›</Typography>
                                <Typography variant="body2" sx={{ color: colors.text, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {currentModule.title}
                                </Typography>
                            </>
                        )}
                    </Stack>
                </Stack>

                <Button
                    startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
                    size="small"
                    onClick={() => navigate(`/explore/course/${courseId}`)}
                    sx={{ color: colors.textSecondary, textTransform: 'none', '&:hover': { color: colors.text } }}
                >
                    Back to Course
                </Button>
            </Box>

            {/* ── 3-panel body ── */}
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

                {/* LEFT SIDEBAR — module/lesson nav */}
                <Box sx={{
                    width: 280,
                    flexShrink: 0,
                    bgcolor: colors.sidebar,
                    borderRight: `1px solid ${colors.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    position: 'sticky',
                    top: 0,
                    overflowY: 'auto',
                }}>
                    {/* Course info + progress */}
                    <Box sx={{ p: 2.5, borderBottom: `1px solid ${colors.border}` }}>
                        <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                            Current Course
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: colors.text, fontWeight: 700, mt: 0.5, mb: 1.5, lineHeight: 1.3 }}>
                            {courseData?.title || 'Course'}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                            <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                                {progressPercent.toFixed(0)}% Complete
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                {completedLessons}/{totalLessons} Lessons
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={progressPercent}
                            sx={{
                                height: 5,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.08)',
                                '& .MuiLinearProgress-bar': { bgcolor: colors.primary, borderRadius: 3 },
                            }}
                        />
                    </Box>

                    {/* Module accordions */}
                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        {modules.length === 0 ? (
                            <Box sx={{ p: 2.5 }}>
                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>No modules available.</Typography>
                            </Box>
                        ) : modules.map((mod) => (
                            <Accordion
                                key={mod.id}
                                expanded={expandedModule === mod.id}
                                onChange={(_, open) => setExpandedModule(open ? mod.id : false)}
                                sx={{
                                    bgcolor: 'transparent',
                                    boxShadow: 'none',
                                    '&:before': { display: 'none' },
                                    '& .MuiAccordionSummary-root': {
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        minHeight: 52,
                                        '&.Mui-expanded': { minHeight: 52 },
                                    },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMore sx={{ color: colors.textSecondary, fontSize: 18 }} />}
                                    sx={{ px: 2.5 }}
                                >
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.text, lineHeight: 1.3 }}>
                                            {mod.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                            {mod.lessons.length} {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
                                        </Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                    <List disablePadding>
                                        {mod.lessons.map((l) => {
                                            const isActive = l.id === selectedLessonId;
                                            return (
                                                <ListItemButton
                                                    key={l.id}
                                                    onClick={() => handleSelectLesson(l)}
                                                    sx={{
                                                        py: 1.25,
                                                        pl: 2.5,
                                                        pr: 2,
                                                        bgcolor: isActive ? alpha(colors.primary, 0.12) : 'transparent',
                                                        borderLeft: `3px solid ${isActive ? colors.primary : 'transparent'}`,
                                                        '&:hover': { bgcolor: alpha(colors.primary, 0.07) },
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                                        {isActive ? (
                                                            <PlayCircleOutline sx={{ color: colors.primary, fontSize: 18 }} />
                                                        ) : (
                                                            <PlayCircleOutline sx={{ color: colors.textSecondary, fontSize: 18 }} />
                                                        )}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={l.title}
                                                        secondary={l.duration ? `${l.duration} min` : null}
                                                        primaryTypographyProps={{
                                                            variant: 'body2',
                                                            fontWeight: isActive ? 600 : 400,
                                                            color: isActive ? colors.primary : colors.text,
                                                            sx: { fontSize: '0.84rem' },
                                                        }}
                                                        secondaryTypographyProps={{
                                                            variant: 'caption',
                                                            sx: { color: colors.textSecondary },
                                                        }}
                                                    />
                                                </ListItemButton>
                                            );
                                        })}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>

                    {/* Back button */}
                    <Box sx={{ p: 2, borderTop: `1px solid ${colors.border}` }}>
                        <Button
                            fullWidth
                            startIcon={<ArrowBack />}
                            onClick={() => navigate(`/explore/course/${courseId}`)}
                            sx={{
                                justifyContent: 'flex-start',
                                color: colors.textSecondary,
                                textTransform: 'none',
                                bgcolor: 'rgba(255,255,255,0.04)',
                                borderRadius: 2,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: colors.text },
                            }}
                        >
                            Back to Course
                        </Button>
                    </Box>
                </Box>

                {/* MAIN CONTENT — video + lesson info */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 } }}>
                    {/* Video Player */}
                    <Box sx={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16/9',
                        bgcolor: '#000',
                        borderRadius: 2,
                        overflow: 'hidden',
                        mb: 3,
                    }}>
                        {/* Thumbnail / video area */}
                        <Box sx={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: videoSrc ? `url(${videoSrc})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            bgcolor: '#111827',
                            position: 'relative',
                        }}>
                            <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)' }} />

                            {lessonLoading ? (
                                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                                    <CircularProgress size={48} />
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%,-50%)',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setIsPlaying(!isPlaying)}
                                >
                                    <Box sx={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: '50%',
                                        bgcolor: colors.primary,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'transform 0.15s',
                                        '&:hover': { transform: 'scale(1.1)' },
                                    }}>
                                        {isPlaying
                                            ? <Pause sx={{ color: '#fff', fontSize: 32 }} />
                                            : <PlayArrow sx={{ color: '#fff', fontSize: 32, ml: 0.5 }} />
                                        }
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {/* Controls */}
                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.8)', p: 1.5 }}>
                            <Slider
                                value={(currentTime / duration) * 100}
                                onChange={(_, v) => setCurrentTime((v / 100) * duration)}
                                sx={{
                                    color: colors.primary,
                                    height: 4,
                                    p: 0,
                                    mb: 1,
                                    '& .MuiSlider-thumb': { width: 12, height: 12, '&:hover': { boxShadow: 'none' } },
                                    '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.3)' },
                                }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <IconButton size="small" sx={{ color: '#fff' }} onClick={() => setIsPlaying(!isPlaying)}>
                                        {isPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                                    </IconButton>
                                    <IconButton size="small" sx={{ color: '#fff' }}>
                                        <VolumeUp fontSize="small" />
                                    </IconButton>
                                    <Typography variant="caption" sx={{ color: '#fff', ml: 0.5 }}>
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={0.25}>
                                    <IconButton size="small" sx={{ color: '#fff' }}><Subtitles fontSize="small" /></IconButton>
                                    <IconButton size="small" sx={{ color: '#fff' }}><Settings fontSize="small" /></IconButton>
                                    <IconButton size="small" sx={{ color: '#fff' }}><Fullscreen fontSize="small" /></IconButton>
                                </Stack>
                            </Box>
                        </Box>
                    </Box>

                    {/* Lesson header + nav */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
                                {currentLesson?.title || 'Select a lesson'}
                            </Typography>
                            {currentLesson?.updated_at && (
                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                    Last updated {new Date(currentLesson.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Typography>
                            )}
                        </Box>
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                startIcon={<ChevronLeft />}
                                disabled={!prevLesson}
                                onClick={() => prevLesson && handleSelectLesson(prevLesson)}
                                sx={{ borderColor: 'rgba(255,255,255,0.15)', color: colors.text, textTransform: 'none', '&:hover': { borderColor: 'rgba(255,255,255,0.3)' }, '&.Mui-disabled': { color: colors.textSecondary, borderColor: 'rgba(255,255,255,0.06)' } }}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="contained"
                                endIcon={<ChevronRight />}
                                disabled={!nextLesson}
                                onClick={() => nextLesson && handleSelectLesson(nextLesson)}
                                sx={{ bgcolor: colors.primary, textTransform: 'none', '&:hover': { bgcolor: '#1D4ED8' } }}
                            >
                                Next Lesson
                            </Button>
                        </Stack>
                    </Box>

                    <Divider sx={{ borderColor: colors.border, mb: 3 }} />

                    {/* Lesson description */}
                    {currentLesson?.description && (
                        <Typography variant="body1" sx={{ color: colors.text, lineHeight: 1.8, mb: 3 }}>
                            {currentLesson.description}
                        </Typography>
                    )}

                    {/* Key Learning Outcomes */}
                    {(() => {
                        const content = currentLesson?.content;
                        if (!content) return null;
                        const items = Array.isArray(content) ? content : [];
                        if (items.length === 0) return null;
                        return (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.text, mb: 1.5 }}>
                                    Key Learning Outcomes
                                </Typography>
                                {items.map((item, i) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="body2" sx={{ color: colors.textSecondary, mr: 1 }}>•</Typography>
                                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                            {typeof item === 'string' ? item : JSON.stringify(item)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        );
                    })()}
                </Box>

                {/* RIGHT PANEL — course details + time remaining */}
                <Box sx={{
                    width: 300,
                    flexShrink: 0,
                    bgcolor: colors.sidebar,
                    borderLeft: `1px solid ${colors.border}`,
                    p: 2.5,
                    overflowY: 'auto',
                }}>
                    {/* Course Details */}
                    <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>
                        Course Details
                    </Typography>
                    <Box sx={{ bgcolor: colors.card, borderRadius: 2, p: 2, mb: 2.5 }}>
                        <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                                <LevelIcon sx={{ color: colors.primary, fontSize: 18 }} />
                                <Box>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', fontSize: '0.68rem', textTransform: 'uppercase' }}>Level</Typography>
                                    <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>{courseLevel}</Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                                <ClockIcon sx={{ color: colors.primary, fontSize: 18 }} />
                                <Box>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', fontSize: '0.68rem', textTransform: 'uppercase' }}>Total Duration</Typography>
                                    <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>{courseDuration}</Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                                <CertificateIcon sx={{ color: colors.primary, fontSize: 18 }} />
                                <Box>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', fontSize: '0.68rem', textTransform: 'uppercase' }}>Certificate</Typography>
                                    <Typography variant="body2" sx={{ color: hasCertificate ? colors.success : colors.textSecondary, fontWeight: 600 }}>
                                        {hasCertificate ? 'Available' : 'Not included'}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                                <LanguageIcon sx={{ color: colors.primary, fontSize: 18 }} />
                                <Box>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', fontSize: '0.68rem', textTransform: 'uppercase' }}>Language</Typography>
                                    <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>{courseLanguage}</Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                                <CalendarIcon sx={{ color: colors.primary, fontSize: 18 }} />
                                <Box>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', fontSize: '0.68rem', textTransform: 'uppercase' }}>Start Date</Typography>
                                    <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>{courseStartDate}</Typography>
                                </Box>
                            </Stack>
                        </Stack>
                    </Box>

                    {/* Time Remaining */}
                    <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>
                        Time Remaining
                    </Typography>
                    <Box sx={{ bgcolor: colors.card, borderRadius: 2, p: 2, mb: 2.5 }}>
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.25 }}>
                            <ClockIcon sx={{ color: colors.success, fontSize: 18 }} />
                            <Box>
                                <Typography variant="body2" sx={{ color: colors.text, fontWeight: 700 }}>
                                    {remainingLessons.length} {remainingLessons.length === 1 ? 'lesson' : 'lessons'} left
                                </Typography>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    {remainingMinutes > 0 ? `~${remainingMinutes} min remaining` : 'Last lesson'}
                                </Typography>
                            </Box>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={totalLessons > 0 ? ((totalLessons - remainingLessons.length) / totalLessons) * 100 : 0}
                            sx={{
                                height: 5,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.08)',
                                '& .MuiLinearProgress-bar': { bgcolor: colors.success, borderRadius: 3 },
                            }}
                        />
                    </Box>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <>
                            <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 700, mb: 1.25, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>
                                Topics
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={0.75}>
                                {tags.map((tag, i) => (
                                    <Chip
                                        key={i}
                                        label={tag?.name || tag}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(37,99,235,0.15)', color: '#93C5FD', fontSize: '0.72rem', height: 24 }}
                                    />
                                ))}
                            </Stack>
                        </>
                    )}
                </Box>

            </Box>
        </Box>
    );
};

export default CourseLesson;

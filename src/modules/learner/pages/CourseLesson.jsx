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
    InsertDriveFile,
    GetApp,
    MenuBook,
} from '@mui/icons-material';
import logo from '../../../assets/images/integritas_logo.jpg';
import { courseCatalogService, learnerEnrollmentService, learnerLessonService } from '../services';
import { apiService } from '../../../services/api';
import { getVideoUrl } from '../../../utils';


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

const toArray = (value) => (Array.isArray(value) ? value : []);

const getLessonIdentifier = (lesson) => String(lesson?.slug || lesson?.id || lesson?.lesson_id || '');

const matchesLessonIdentifier = (lesson, identifier) => {
    const value = String(identifier || '');
    if (!value) return false;
    return [lesson?.id, lesson?.lesson_id, lesson?.slug].some((candidate) => String(candidate || '') === value);
};

const normalizeLesson = (lesson) => {
    const videoUrl = lesson.video_url || lesson.video || '';
    const content = lesson.content || '';
    let derivedType = 'video';

    if (videoUrl) {
        const lowerUrl = videoUrl.toLowerCase();
        const docExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.txt', '.csv'];
        const isDoc = docExtensions.some(ext => lowerUrl.endsWith(ext) || lowerUrl.includes(ext + '?') || lowerUrl.includes(ext + '#'));
        if (isDoc) {
            derivedType = 'document';
        }
    } else if (content.trim()) {
        derivedType = 'text';
    }

    return {
        ...lesson,
        id: String(lesson.id || lesson.lesson_id || lesson.slug || ''),
        slug: lesson.slug || lesson.lesson_slug || '',
        title: String(lesson.title || lesson.name || 'Untitled Lesson'),
        duration: lesson.duration || lesson.duration_minutes || 0,
        order: lesson.order || lesson.position || 0,
        video_url: videoUrl,
        description: lesson.description || lesson.summary || '',
        content: content,
        type: lesson.type || lesson.lesson_type || derivedType,
    };
};

const normalizeModule = (module) => ({
    ...module,
    id: String(module.id || module.module_id || module.slug || ''),
    title: String(module.title || module.name || 'Untitled Module'),
    order: module.order || module.position || 0,
    lessons: toArray(module.lessons || module.course_lessons).map(normalizeLesson),
});

const extractModules = (payload) => {
    const candidates = [
        payload?.modules,
        payload?.course_modules,
        payload?.course?.modules,
        payload?.course?.course_modules,
        payload?.enrolment?.course?.modules,
        payload?.enrollment?.course?.modules,
        payload?.progress?.modules,
    ];
    const found = candidates.find((item) => Array.isArray(item));
    return toArray(found).map(normalizeModule);
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
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Bunny CDN signed playback URL — re-fetched when the lesson changes.
    const [signedPlaybackUrl, setSignedPlaybackUrl] = useState('');
    const lastReportedPosition = useRef(0);

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
                setCourseData(data);

                let moduleList = [];
                try {
                    const progress = await learnerEnrollmentService.getCourseProgress(courseId);
                    if (!active) return;
                    setEnrollmentData(progress?.enrolment || progress?.enrollment || progress);
                    moduleList = extractModules(progress);
                } catch {
                    moduleList = extractModules(data?.raw_data || data);
                }

                if (moduleList.length === 0) {
                    moduleList = extractModules(data?.raw_data || data);
                }

                if (moduleList.length === 0) {
                    const moduleCourseId = data?.raw_data?.id || data?.raw?.id || data?.id || courseId;
                    const modulesRes = await apiService.get(`/lms/courses/${moduleCourseId}/modules`);
                    if (!active) return;
                    const rawModules = Array.isArray(modulesRes?.data) ? modulesRes.data
                        : Array.isArray(modulesRes) ? modulesRes : [];

                    moduleList = rawModules.map((m) => normalizeModule(m));
                }
                if (!active) return;

                setModules(moduleList);

                // Pick initial lesson
                if (!initialLessonLoaded.current) {
                    const allLessons = moduleList.flatMap((m) => m.lessons);
                    const target = lessonId
                        ? allLessons.find((l) => matchesLessonIdentifier(l, lessonId))
                        : allLessons[0];

                    if (target) {
                        const targetIdentifier = getLessonIdentifier(target);
                        setSelectedLessonId(targetIdentifier);
                        // Auto-expand that module
                        const ownerModule = moduleList.find((m) =>
                            m.lessons.some((l) => matchesLessonIdentifier(l, targetIdentifier))
                        );
                        if (ownerModule) setExpandedModule(ownerModule.id);
                        if (targetIdentifier && targetIdentifier !== lessonId) {
                            navigate(`/explore/lesson/${courseId}/${targetIdentifier}`, { replace: true });
                        }
                    } else {
                        // No lessons found — check if this is an Exemplar Series course
                        // that uses a course-level video_url instead of individual lessons.
                        const courseTrack = String(data?.track || data?.raw?.track || data?.raw_data?.track || '').toLowerCase();
                        const courseVideoUrl = data?.video_url || data?.raw?.video_url || data?.raw_data?.video_url || '';
                        if ((courseTrack === 'experta' || courseTrack === 'expert') && courseVideoUrl) {
                            const virtualLesson = normalizeLesson({
                                id: `${courseId}-video`,
                                slug: `${courseId}-video`,
                                title: data?.title || 'Exemplar Video',
                                video_url: courseVideoUrl,
                                content: data?.description || data?.summary || '',
                                order: 0,
                                status: 'published',
                            });
                            const virtualModule = normalizeModule({
                                id: `${courseId}-module`,
                                title: data?.title || 'Exemplar Series',
                                order: 0,
                                lessons: [virtualLesson],
                            });
                            setModules([virtualModule]);
                            setSelectedLessonId(virtualLesson.id);
                            setCurrentLesson(virtualLesson);
                        }
                    }
                    initialLessonLoaded.current = true;
                }

                // Non-blocking enrollment info
                learnerEnrollmentService.getEnrollments({ course_slug: courseId, per_page: 1 })
                    .then((res) => { if (active) setEnrollmentData(res.data?.[0] || null); })
                    .catch(() => {});
            } catch (err) {
                if (active) setError(err?.message || 'Failed to load course.');
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        return () => { active = false; };
    }, [courseId, lessonId, navigate]);

    // --- Load lesson detail when selectedLessonId changes ---
    useEffect(() => {
        if (!selectedLessonId) return;
        let active = true;

        // First try to populate from cached module data
        const cached = modules.flatMap((m) => m.lessons).find((l) => matchesLessonIdentifier(l, selectedLessonId));
        if (cached) setCurrentLesson(cached);

        // Bypass API request for synthesized virtual lessons
        if (selectedLessonId && String(selectedLessonId).endsWith('-video')) {
            setLessonLoading(false);
            return;
        }

        setLessonLoading(true);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        if (videoRef.current) { videoRef.current.pause(); videoRef.current.src = ''; }

        const detailRequest = cached?.slug || !/^\d+$/.test(String(selectedLessonId || ''))
            ? learnerLessonService.getLesson(cached?.slug || selectedLessonId)
            : courseCatalogService.getLessonById(selectedLessonId);

        detailRequest
            .then((detail) => {
                if (!active) return;
                setCurrentLesson((prev) => ({
                    ...prev,
                    ...detail,
                    // preserve cached video_url if the detail endpoint returns null/empty
                    video_url: detail?.video_url || detail?.video || prev?.video_url || prev?.video || '',
                }));
            })
            .catch(() => {}) // keep cached data on error
            .finally(() => { if (active) setLessonLoading(false); });

        return () => { active = false; };
    }, [selectedLessonId, modules]);

    // When currentLesson changes, fetch a fresh Bunny CDN signed URL.
    useEffect(() => {
        let cancelled = false;
        setSignedPlaybackUrl('');
        const slug = currentLesson?.slug;
        if (!slug) return undefined;

        // Skip fetching playback URL for virtual lessons
        if (slug.endsWith('-video')) {
            return undefined;
        }

        learnerLessonService
            .getPlaybackUrl(slug)
            .then((res) => {
                if (cancelled) return;
                const url = res?.url || res?.playback_url || res?.video_url || '';
                if (url) setSignedPlaybackUrl(url);
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, [currentLesson?.slug]);

    // When currentLesson changes, force the native <video> element to reload the new src.
    useEffect(() => {
        if (!videoRef.current || !currentLesson) return;
        const src = signedPlaybackUrl || getVideoUrl(currentLesson.video_url || currentLesson.video || '');
        if (!src || /youtube\.com|youtu\.be|vimeo\.com/.test(src)) return;
        videoRef.current.load();
    }, [currentLesson, signedPlaybackUrl]);

    // Throttled playback position reporting — at most once per ~10 seconds.
    useEffect(() => {
        const slug = currentLesson?.slug;
        if (!slug) return undefined;
        lastReportedPosition.current = 0;
        const interval = setInterval(() => {
            const v = videoRef.current;
            if (!v || v.paused || !Number.isFinite(v.currentTime)) return;
            if (Math.abs(v.currentTime - lastReportedPosition.current) < 9) return;
            lastReportedPosition.current = v.currentTime;
            learnerLessonService.reportPosition(slug, v.currentTime).catch(() => {});
        }, 10000);
        return () => clearInterval(interval);
    }, [currentLesson?.slug]);

    const allLessons = useMemo(() => modules.flatMap((m) => m.lessons), [modules]);
    const currentIndex = useMemo(
        () => allLessons.findIndex((l) => matchesLessonIdentifier(l, selectedLessonId)),
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
        m.lessons.some((l) => matchesLessonIdentifier(l, selectedLessonId))
    );

    const handleSelectLesson = (lesson) => {
        const identifier = getLessonIdentifier(lesson);
        setSelectedLessonId(identifier);
        navigate(`/explore/lesson/${courseId}/${identifier}`, { replace: true });
        const ownerModule = modules.find((m) => m.lessons.some((l) => matchesLessonIdentifier(l, identifier)));
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

    const videoSrc = signedPlaybackUrl || getVideoUrl(currentLesson?.video_url || currentLesson?.video || '');

    const isYouTube = /youtube\.com|youtu\.be/.test(videoSrc);
    const isVimeo = /vimeo\.com/.test(videoSrc);
    const isEmbed = isYouTube || isVimeo;

    const getEmbedUrl = (url) => {
        if (isYouTube) {
            const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
            return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
        }
        if (isVimeo) {
            const match = url.match(/vimeo\.com\/(\d+)/);
            return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : url;
        }
        return url;
    };

    const handlePlayPause = () => {
        const v = videoRef.current;
        if (!v || !v.src) return;
        if (v.readyState === 0) return; // no source loaded yet
        if (v.paused) { v.play().catch(() => {}); } else { v.pause(); }
    };

    const handleSeek = (_, value) => {
        const v = videoRef.current;
        if (!v || !duration) return;
        const time = (value / 100) * duration;
        v.currentTime = time;
        setCurrentTime(time);
    };
    const tags = Array.isArray(courseData?.raw?.tags) ? courseData.raw.tags : [];
    const cert = courseData?.raw?.certificate;
    const hasCertificate = cert?.enabled ?? Boolean(cert);
    const courseDuration = courseData?.duration || '—';
    const courseLevel = courseData?.level || '—';
    const courseLanguage = courseData?.raw?.language || '—';
    const courseStartDate = courseData?.raw?.start_date || courseData?.raw?.published_at || 'Ongoing';
    const isFoundationalCourse = String(
        courseData?.type ||
        courseData?.track ||
        courseData?.raw_data?.type ||
        courseData?.raw?.type ||
        ''
    ).toLowerCase() === 'foundational' ||
        ['foundational course', 'foundational courses'].includes(String(courseData?.title || '').trim().toLowerCase());
    const courseOverviewPath = isFoundationalCourse ? '/learner/foundational' : `/explore/course/${courseId}`;
    const learningListPath = isFoundationalCourse ? '/learner/foundational' : '/explore/my-learning';

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
                    <Box component="img" src={logo} alt="Integritas" sx={{ width: 30, height: 30, objectFit: 'contain' }} />
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: colors.textSecondary, fontSize: '0.82rem' }}>
                        <Typography
                            variant="body2"
                            sx={{ color: colors.textSecondary, cursor: 'pointer', '&:hover': { color: colors.text } }}
                            onClick={() => navigate(learningListPath)}
                        >
                            {isFoundationalCourse ? 'Foundational' : 'My Learning'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>›</Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: colors.textSecondary, cursor: 'pointer', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', '&:hover': { color: colors.text } }}
                            onClick={() => navigate(courseOverviewPath)}
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
                    // onClick={() => navigate(`/explore/course/${courseId}`)}
                    onClick={() => navigate(courseOverviewPath)}
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
                                            const lessonIdentifier = getLessonIdentifier(l);
                                            const isActive = matchesLessonIdentifier(l, selectedLessonId);
                                            return (
                                                <ListItemButton
                                                    key={lessonIdentifier}
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
                            onClick={() => navigate(learningListPath)}
                            sx={{
                                justifyContent: 'flex-start',
                                color: colors.textSecondary,
                                textTransform: 'none',
                                bgcolor: 'rgba(255,255,255,0.04)',
                                borderRadius: 2,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: colors.text },
                            }}
                        >
                            Back to Courses
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
                        {(lessonLoading || !currentLesson) ? (
                            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#111827' }}>
                                <CircularProgress size={48} />
                            </Box>
                        ) : (currentLesson?.type === 'document' || currentLesson?.type === 'file') ? (
                            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#1F2937', p: 4, textAlign: 'center' }}>
                                <InsertDriveFile sx={{ fontSize: 64, color: '#178A83', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 650, mb: 1 }}>
                                    {currentLesson.title} - Study Document
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3, maxWidth: 400 }}>
                                    This lesson includes a document attachment. Click the button below to view or download the study material.
                                </Typography>
                                <Button
                                    variant="contained"
                                    href={videoSrc}
                                    target="_blank"
                                    download
                                    startIcon={<GetApp />}
                                    sx={{ bgcolor: '#178A83', '&:hover': { bgcolor: '#116B65' } }}
                                >
                                    Open / Download Material
                                </Button>
                            </Box>
                        ) : currentLesson?.type === 'text' ? (
                            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#1F2937', p: 4, textAlign: 'center' }}>
                                <MenuBook sx={{ fontSize: 64, color: '#178A83', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 650, mb: 1 }}>
                                    {currentLesson.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#9CA3AF', maxWidth: 450 }}>
                                    This is a reading/article-based lesson. Please review the text and key learning outcomes below.
                                </Typography>
                            </Box>
                        ) : !videoSrc ? (
                            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#111827', gap: 1.5 }}>
                                <PlayCircleOutline sx={{ fontSize: 56, color: colors.textSecondary }} />
                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.9rem' }}>No video available for this lesson</Typography>
                            </Box>
                        ) : isEmbed ? (
                            <Box
                                component="iframe"
                                src={getEmbedUrl(videoSrc)}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                allowFullScreen
                                sx={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                            />
                        ) : (
                            <>
                                <Box
                                    component="video"
                                    ref={videoRef}
                                    src={videoSrc}
                                    onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                                    onDurationChange={() => setDuration(videoRef.current?.duration || 0)}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onEnded={() => setIsPlaying(false)}
                                    sx={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
                                />
                                {/* Controls */}
                                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.8)', p: 1.5 }}>
                                    <Slider
                                        value={duration ? (currentTime / duration) * 100 : 0}
                                        onChange={handleSeek}
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
                                            <IconButton size="small" sx={{ color: '#fff' }} onClick={handlePlayPause}>
                                                {isPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                                            </IconButton>
                                            <IconButton size="small" sx={{ color: '#fff' }} onClick={() => { if (videoRef.current) videoRef.current.muted = !videoRef.current.muted; }}>
                                                <VolumeUp fontSize="small" />
                                            </IconButton>
                                            <Typography variant="caption" sx={{ color: '#fff', ml: 0.5 }}>
                                                {formatTime(currentTime)} / {formatTime(duration)}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={0.25}>
                                            <IconButton size="small" sx={{ color: '#fff' }}><Subtitles fontSize="small" /></IconButton>
                                            <IconButton size="small" sx={{ color: '#fff' }}><Settings fontSize="small" /></IconButton>
                                            <IconButton size="small" sx={{ color: '#fff' }} onClick={() => videoRef.current?.requestFullscreen?.()}><Fullscreen fontSize="small" /></IconButton>
                                        </Stack>
                                    </Box>
                                </Box>
                            </>
                        )}
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
                            {currentLesson?.slug && (
                                <Button
                                    variant="contained"
                                    onClick={() => navigate(`/learner/lessons/${currentLesson.slug}/cbt`)}
                                    sx={{ bgcolor: colors.success, textTransform: 'none', '&:hover': { bgcolor: '#059669' } }}
                                >
                                    Take Assessment
                                </Button>
                            )}
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

                {/* Course completion CTA — shown when on the last lesson */}
                {!nextLesson && currentLesson && (
                    <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 300,
                        bgcolor: 'rgba(16,185,129,0.12)',
                        borderTop: '1px solid rgba(16,185,129,0.3)',
                        px: 4,
                        py: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        flexWrap: 'wrap',
                    }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <CheckCircle sx={{ color: colors.success, fontSize: 22 }} />
                            <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.95rem' }}>
                                You've reached the last lesson!
                            </Typography>
                        </Stack>
                        <Button
                            variant="contained"
                            startIcon={<ArrowBack />}
                            onClick={() => navigate(courseOverviewPath)}
                            sx={{ bgcolor: colors.success, '&:hover': { bgcolor: '#059669' }, textTransform: 'none', fontWeight: 600 }}
                        >
                            Back to Course Overview
                        </Button>
                    </Box>
                )}

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

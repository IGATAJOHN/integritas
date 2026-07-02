import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Add,
    AssignmentTurnedIn,
    Close,
    Delete,
    Edit,
    MenuBookOutlined,
    MoreVert,
    Payments,
    PersonAddAlt,
    Quiz,
    Refresh,
    Save,
    SchoolOutlined,
    UploadFile,
    Visibility,
    PlayCircleOutline,
    GetApp,
    InsertDriveFile,
    MenuBook,
} from '@mui/icons-material';
import { adminCoursesService } from '../services/courseService';
import { adminFoundationalTutorService } from '../services/foundationalTutorService';
import { adminTransactionsService } from '../services/transactionsService';
import {
    modalStyle,
    paperStyle,
    primaryButtonStyle,
    scrollableModalBody,
    selectMenuProps,
    selectStyle,
    tableBodyCellStyle,
    tableHeaderCellStyle,
    textFieldStyle,
} from '../../../styles/formStyles';
import { getVideoUrl } from '../../../utils';
import theme from '../../../styles/theme';

const DEFAULT_COURSE = {
    title: 'Foundational Courses',
    summary: 'Foundational governance and integrity programme.',
    description: 'Foundational governance and integrity programme.',
};

const emptyModuleForm = { title: '', description: '' };
const emptyLessonForm = { title: '', description: '', assigned_tutor_id: '' };

const getCourseId = (course) => course?.id || course?.course_id || course?.slug;
const getLessonVersionId = (lesson) => (
    lesson?.id ||
    null
);

const getTutorId = (tutor) => tutor?.id || tutor?.user_id || tutor?.user?.id;
const getTutorName = (tutor) => (
    tutor?.name ||
    tutor?.full_name ||
    `${tutor?.first_name || ''} ${tutor?.last_name || ''}`.trim() ||
    tutor?.email ||
    'Unknown tutor'
);

const getAssignedTutorId = (lesson) => (
    lesson?.assigned_tutor_id ||
    lesson?.tutor_id ||
    lesson?.assigned_tutor?.id ||
    lesson?.assigned_tutor?.user_id ||
    lesson?.tutor?.id ||
    lesson?.tutor?.user_id ||
    ''
);

const normalizeModules = (course) => {
    const modules = course?.modules || course?.course_modules || [];
    return Array.isArray(modules)
        ? modules.map((module) => ({
            ...module,
            lessons: Array.isArray(module.lessons) ? module.lessons : [],
        }))
        : [];
};

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
};

const getErrorMessage = (error, fallback) => (
    error?.data?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
);

const FoundationalProgram = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [course, setCourse] = useState(null);
    const [duplicates, setDuplicates] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [enrolments, setEnrolments] = useState([]);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [setupOpen, setSetupOpen] = useState(false);
    const [setupForm, setSetupForm] = useState(DEFAULT_COURSE);
    const [moduleOpen, setModuleOpen] = useState(false);
    const [moduleForm, setModuleForm] = useState(emptyModuleForm);
    const [editingModule, setEditingModule] = useState(null);
    const [lessonOpen, setLessonOpen] = useState(false);
    const [lessonForm, setLessonForm] = useState(emptyLessonForm);
    const [selectedModule, setSelectedModule] = useState(null);
    const [editingLesson, setEditingLesson] = useState(null);
    const [previewLesson, setPreviewLesson] = useState(null);
    const [uploadingLessonId, setUploadingLessonId] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [expandedLessonPreviewId, setExpandedLessonPreviewId] = useState(null);

    const modules = useMemo(() => normalizeModules(course), [course]);
    const lessons = useMemo(() => modules.flatMap((module) => (
        (module.lessons || []).map((lesson) => ({ ...lesson, module }))
    )), [modules]);
    const stats = useMemo(() => ({
        modules: modules.length,
        lessons: lessons.length,
        assigned: lessons.filter((lesson) => getAssignedTutorId(lesson)).length,
        questionsReady: lessons.filter((lesson) => getLessonVersionId(lesson)).length,
    }), [modules, lessons]);

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const refresh = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [courseResult, tutorResult, enrolmentResult] = await Promise.allSettled([
                adminCoursesService.getFoundationalCourse(),
                adminFoundationalTutorService.listTutors({ type: 'foundational', per_page: 100 }),
                adminTransactionsService.listEnrolments({ per_page: 100 }),
            ]);

            if (courseResult.status === 'fulfilled') {
                setCourse(courseResult.value.course);
                setDuplicates(courseResult.value.duplicates || []);
                if (!courseResult.value.course) setSetupOpen(true);
            } else {
                setError(getErrorMessage(courseResult.reason, 'Failed to load foundational courses.'));
            }

            if (tutorResult.status === 'fulfilled') {
                setTutors(tutorResult.value.data || []);
            }

            if (enrolmentResult.status === 'fulfilled') {
                const courseId = getCourseId(courseResult.value?.course);
                setEnrolments((enrolmentResult.value.data || []).filter((item) => {
                    const enrolmentCourse = item.course || {};
                    return String(item.course_id || enrolmentCourse.id || enrolmentCourse.slug || '') === String(courseId || '') ||
                        String(enrolmentCourse.type || enrolmentCourse.track || '').toLowerCase() === 'foundational';
                }));
            }
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load foundational programme.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const reloadCourseOnly = async () => {
        const result = await adminCoursesService.getFoundationalCourse();
        setCourse(result.course);
        setDuplicates(result.duplicates || []);
    };

    const handleCreateCourse = async () => {
        setActionLoading(true);
        try {
            const created = await adminCoursesService.createFoundationalCourse(setupForm);
            setCourse(created);
            setSetupOpen(false);
            showMessage('Foundational Courses created.');
            await refresh();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to create foundational courses.'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const openModule = (module = null) => {
        setEditingModule(module);
        setModuleForm({
            title: module?.title || '',
            description: module?.description || module?.summary || '',
        });
        setModuleOpen(true);
    };

    const saveModule = async () => {
        if (!moduleForm.title.trim()) {
            showMessage('Module title is required.', 'error');
            return;
        }
        setActionLoading(true);
        try {
            const payload = {
                title: moduleForm.title.trim(),
                description: moduleForm.description.trim() || undefined,
            };
            if (editingModule) {
                await adminCoursesService.updateModule(editingModule.id, payload);
                showMessage('Module updated.');
            } else {
                await adminCoursesService.createModule(getCourseId(course), payload);
                showMessage('Module created.');
            }
            setModuleOpen(false);
            await reloadCourseOnly();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to save module.'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const deleteModule = async (module) => {
        if (!window.confirm('Delete this module and its lessons?')) return;
        setActionLoading(true);
        try {
            await adminCoursesService.deleteModule(module.id);
            showMessage('Module deleted.');
            await reloadCourseOnly();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to delete module.'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const openLesson = (module, lesson = null) => {
        setSelectedModule(module);
        setEditingLesson(lesson);
        setLessonForm({
            title: lesson?.title || '',
            description: lesson?.description || lesson?.summary || '',
            assigned_tutor_id: getAssignedTutorId(lesson),
        });
        setLessonOpen(true);
    };

    const saveLesson = async () => {
        if (!lessonForm.title.trim()) {
            showMessage('Lesson title is required.', 'error');
            return;
        }
        setActionLoading(true);
        try {
            const payload = {
                title: lessonForm.title.trim(),
                description: lessonForm.description.trim() || undefined,
                assigned_tutor_id: lessonForm.assigned_tutor_id || null,
            };
            if (editingLesson) {
                await adminCoursesService.updateLesson(editingLesson.id, payload);
                showMessage('Lesson updated.');
            } else {
                await adminCoursesService.createLesson(selectedModule.id, payload);
                showMessage('Lesson created.');
            }
            setLessonOpen(false);
            await reloadCourseOnly();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to save lesson.'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const publishLesson = async (lesson, shouldPublish) => {
        if (shouldPublish && !getAssignedTutorId(lesson)) {
            showMessage('Assign a foundational tutor before publishing this lesson.', 'error');
            return;
        }
        setActionLoading(true);
        try {
            if (shouldPublish) {
                await adminCoursesService.publishLesson(lesson.id);
                showMessage('Lesson published.');
            } else {
                await adminCoursesService.unpublishLesson(lesson.id);
                showMessage('Lesson unpublished.');
            }
            await reloadCourseOnly();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to update lesson status.'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const deleteLesson = async (lesson) => {
        if (!window.confirm('Delete this lesson?')) return;
        setActionLoading(true);
        try {
            await adminCoursesService.deleteLesson(lesson.id);
            showMessage('Lesson deleted.');
            await reloadCourseOnly();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to delete lesson.'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const uploadVideo = async (lesson, file) => {
        if (!file) return;
        const userStr = localStorage.getItem('user');
        const token = userStr ? JSON.parse(userStr)?.token : null;
        const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://integritas-backend.onrender.com/api/v1').replace(/\/$/, '');
        
        const formData = new FormData();
        formData.append('video', file);
        
        setUploadingLessonId(lesson.id);
        setUploadProgress(0);
        setActionLoading(true);
        
        try {
            await axios.post(
                `${baseUrl}/admin/lessons/${lesson.id}/video`,
                formData,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Accept': 'application/json',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                    },
                }
            );
            showMessage('Lesson video uploaded.');
            await reloadCourseOnly();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to upload video.'), 'error');
        } finally {
            setUploadingLessonId(null);
            setUploadProgress(0);
            setActionLoading(false);
        }
    };

    const uploadMaterial = async (lesson, file) => {
        if (!file) return;
        const userStr = localStorage.getItem('user');
        const token = userStr ? JSON.parse(userStr)?.token : null;
        const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://integritas-backend.onrender.com/api/v1').replace(/\/$/, '');
        
        const formData = new FormData();
        formData.append('video', file);
        
        setUploadingLessonId(lesson.id);
        setUploadProgress(0);
        setActionLoading(true);
        
        try {
            await axios.post(
                `${baseUrl}/admin/lessons/${lesson.id}/video`,
                formData,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Accept': 'application/json',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                    },
                }
            );
            showMessage('Lesson material uploaded successfully.');
            await reloadCourseOnly();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to upload material.'), 'error');
        } finally {
            setUploadingLessonId(null);
            setUploadProgress(0);
            setActionLoading(false);
        }
    };

    const assignedTutorName = (lesson) => {
        const id = String(getAssignedTutorId(lesson));
        const match = tutors.find((tutor) => String(getTutorId(tutor)) === id);
        return getTutorName(lesson.assigned_tutor || lesson.tutor || match);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
                <Box>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <SchoolOutlined sx={{ color: theme.colors.brand, fontSize: 30 }} />
                        <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 800 }}>
                            Foundational Programme
                        </Typography>
                    </Stack>
                    <Typography sx={{ color: '#9CA3AF', mt: 0.5 }}>
                        Manage the Foundational Courses, tutors, lesson assignments, content, and CBT.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button startIcon={<Refresh />} onClick={refresh} disabled={loading} sx={{ color: '#D1D5DB', textTransform: 'none' }}>
                        Refresh
                    </Button>
                    <Button variant="contained" startIcon={<Add />} onClick={() => openModule()} disabled={!course} sx={{ ...primaryButtonStyle, textTransform: 'none' }}>
                        Add Module
                    </Button>
                </Stack>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {duplicates.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Multiple foundational courses were found. This hub is using "{course?.title || 'Foundational Courses'}"; consolidate the extras to preserve the one-course flow.
                </Alert>
            )}

            {loading ? (
                <Stack alignItems="center" sx={{ py: 10 }}>
                    <CircularProgress sx={{ color: theme.colors.brand }} />
                    <Typography sx={{ color: '#9CA3AF', mt: 2 }}>Loading foundational programme...</Typography>
                </Stack>
            ) : !course ? (
                <SetupState onCreate={() => setSetupOpen(true)} />
            ) : (
                <>
                    <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3, borderBottom: '1px solid #1F2937' }}>
                        {['Overview', 'Course Content', 'Tutors', 'Assignments', 'CBT', 'Enrolments'].map((label) => (
                            <Tab key={label} label={label} sx={{ color: '#9CA3AF', textTransform: 'none', '&.Mui-selected': { color: '#FFFFFF' } }} />
                        ))}
                    </Tabs>

                    {tab === 0 && <OverviewTab course={course} stats={stats} tutors={tutors} enrolments={enrolments} />}
                    {tab === 1 && (
                        <ContentTab
                            modules={modules}
                            tutors={tutors}
                            actionLoading={actionLoading}
                            onAddModule={() => openModule()}
                            onEditModule={openModule}
                            onDeleteModule={deleteModule}
                            onAddLesson={openLesson}
                            onEditLesson={openLesson}
                            onDeleteLesson={deleteLesson}
                            onPublishLesson={publishLesson}
                            onUploadVideo={uploadVideo}
                            onUploadMaterial={uploadMaterial}
                            onQuiz={(lesson) => navigate(`/admin/content/courses/${getCourseId(course)}/lessons/${lesson.id}/quiz`)}
                            onPreviewLesson={setPreviewLesson}
                            assignedTutorName={assignedTutorName}
                            uploadingLessonId={uploadingLessonId}
                            uploadProgress={uploadProgress}
                            expandedLessonPreviewId={expandedLessonPreviewId}
                            setExpandedLessonPreviewId={setExpandedLessonPreviewId}
                        />
                    )}
                    {tab === 2 && <TutorsTab tutors={tutors} onManage={() => navigate('/admin/users/tutors?tab=foundational')} />}
                    {tab === 3 && <AssignmentsTab lessons={lessons} tutors={tutors} onAssign={(lesson) => openLesson(lesson.module, lesson)} assignedTutorName={assignedTutorName} />}
                    {tab === 4 && <CbtTab lessons={lessons} onManage={(lesson) => navigate(`/admin/content/courses/${getCourseId(course)}/lessons/${lesson.id}/quiz`)} />}
                    {tab === 5 && <EnrolmentsTab enrolments={enrolments} />}
                </>
            )}

            <CourseSetupDialog open={setupOpen} form={setupForm} setForm={setSetupForm} saving={actionLoading} onClose={() => setSetupOpen(false)} onSave={handleCreateCourse} />
            <ModuleDialog open={moduleOpen} form={moduleForm} setForm={setModuleForm} editing={!!editingModule} saving={actionLoading} onClose={() => setModuleOpen(false)} onSave={saveModule} />
            <LessonDialog open={lessonOpen} form={lessonForm} setForm={setLessonForm} tutors={tutors} editing={!!editingLesson} saving={actionLoading} onClose={() => setLessonOpen(false)} onSave={saveLesson} />
            <LessonPreviewDialog lesson={previewLesson} onClose={() => setPreviewLesson(null)} />
            <Snackbar open={snackbar.open} autoHideDuration={4500} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// LESSON PREVIEW DIALOG
// Opens when the admin clicks "Preview Lesson" from the action menu.
// Fetches fresh lesson detail + materials from the API so the preview
// is always up-to-date even if the course-list cache is stale.
// ─────────────────────────────────────────────────────────────────────────────
const LessonPreviewDialog = ({ lesson, onClose }) => {
    const open = !!lesson;
    const [detail, setDetail] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (!lesson) { setDetail(null); setError(''); return; }
        let cancelled = false;
        const load = async () => {
            setLoading(true); setError('');
            try {
                const lessonData = await adminCoursesService.getLesson(lesson.id);
                if (!cancelled) setDetail(lessonData || lesson);
            } catch (err) {
                if (!cancelled) { setError(getErrorMessage(err, 'Failed to load lesson details.')); setDetail(lesson); }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [lesson]);

    const info = detail || lesson || {};
    const isPublished = !!(info.published_at || info.is_published || info.status === 'published');

    // Resolve the video/content URL from all possible backend field names
    const rawVideoUrl = info.video_url || (typeof info.video === 'string' ? info.video : info.video?.url || info.video?.playback_url) || info.playback_url || info.content_url || null;
    const videoUrl = rawVideoUrl ? getVideoUrl(rawVideoUrl) : null;
    const lessonType = info.type || info.content_type || 'video';
    const isDocument = lessonType === 'document' || lessonType === 'file' || lessonType === 'pdf';
    const isPdf = videoUrl && videoUrl.toLowerCase().includes('.pdf');
    const isYouTube = videoUrl && /youtube\.com|youtu\.be/.test(videoUrl);
    const isVimeo = videoUrl && /vimeo\.com/.test(videoUrl);
    const isEmbed = isYouTube || isVimeo;
    const isMp4 = videoUrl && !isEmbed && (videoUrl.toLowerCase().includes('.mp4') || videoUrl.toLowerCase().includes('.webm'));

    // Build a synthetic "materials" list from what the lesson actually has
    const derivedMaterials = [];
    if (videoUrl && isDocument) {
        derivedMaterials.push({
            id: 'main-file',
            display_name: info.title ? `${info.title} - Study Document` : 'Study Document',
            file_url: videoUrl,
            created_at: info.updated_at || info.created_at,
        });
    }

    const getFileIcon = (url = '') => {
        const u = url.toLowerCase();
        if (u.endsWith('.pdf')) return <InsertDriveFile sx={{ color: '#F87171' }} />;
        if (u.match(/\.(mp4|webm|ogg|mov)$/)) return <PlayCircleOutline sx={{ color: '#60A5FA' }} />;
        return <MenuBook sx={{ color: '#FCD34D' }} />;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: '#0F172A',
                    backgroundImage: 'none',
                    border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: '16px',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                    overflow: 'hidden',
                },
            }}
        >
            {/* ── HEADER ── */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 3, py: 2,
                background: 'linear-gradient(135deg,rgba(99,102,241,0.15) 0%,rgba(16,185,129,0.08) 100%)',
                borderBottom: '1px solid rgba(99,102,241,0.2)',
            }}>
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#FFFFFF' }}>
                        {info.title || 'Lesson Preview'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip size="small" label={isPublished ? 'Published' : 'Draft'} sx={{ color: isPublished ? '#34D399' : '#FBBF24', bgcolor: isPublished ? 'rgba(16,185,129,0.12)' : 'rgba(251,191,36,0.12)', fontWeight: 600, fontSize: '0.7rem' }} />
                        {lessonType && <Chip size="small" label={lessonType.toUpperCase()} sx={{ color: '#93C5FD', bgcolor: 'rgba(147,197,253,0.1)', fontSize: '0.65rem' }} />}
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: '#9CA3AF', '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.08)' } }}>
                    <Close />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 0, bgcolor: '#0F172A' }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                        <CircularProgress sx={{ color: '#6366F1' }} />
                    </Box>
                )}
                {!loading && error && (
                    <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>
                )}
                {!loading && (
                    <Stack>
                        {/* ── MEDIA AREA ── */}
                        {!videoUrl ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, bgcolor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1F2937' }}>
                                <PlayCircleOutline sx={{ fontSize: 52, color: '#374151', mb: 1 }} />
                                <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>No video or file uploaded yet</Typography>
                            </Box>
                        ) : isPdf ? (
                            <Box sx={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                py: 6, px: 3, bgcolor: 'rgba(239,68,68,0.05)', borderBottom: '1px solid #1F2937', textAlign: 'center',
                            }}>
                                <InsertDriveFile sx={{ fontSize: 64, color: '#F87171', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 1 }}>
                                    PDF Study Material
                                </Typography>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem', mb: 3, maxWidth: 400 }}>
                                    This lesson contains a PDF study document. Click the button below to view or download it in a new tab.
                                </Typography>
                                <Button
                                    variant="contained"
                                    component="a"
                                    href={videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    startIcon={<GetApp />}
                                    sx={{
                                        bgcolor: '#EF4444',
                                        color: '#FFFFFF',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 4,
                                        py: 1.25,
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: '#DC2626' }
                                    }}
                                >
                                    Open PDF Document
                                </Button>
                            </Box>
                        ) : isEmbed ? (
                            <Box sx={{ position: 'relative', width: '100%', background: '#000', lineHeight: 0 }}>
                                <iframe
                                    src={isYouTube ? videoUrl.replace('watch?v=', 'embed/') : videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                                    title="Lesson Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ width: '100%', height: 360, border: 'none', display: 'block' }}
                                />
                            </Box>
                        ) : isMp4 ? (
                            <Box sx={{ width: '100%', background: '#000', lineHeight: 0 }}>
                                <video src={videoUrl} controls style={{ width: '100%', maxHeight: 380, outline: 'none', display: 'block' }} />
                            </Box>
                        ) : isDocument ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, bgcolor: 'rgba(248,113,113,0.05)', borderBottom: '1px solid #1F2937' }}>
                                <InsertDriveFile sx={{ fontSize: 52, color: '#F87171', mb: 1 }} />
                                <Typography sx={{ color: '#E5E7EB', fontWeight: 600, mb: 0.5 }}>Document Lesson</Typography>
                                <Typography sx={{ color: '#6B7280', fontSize: '0.8rem' }}>Click "Open File" below to view</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ width: '100%', background: '#000', lineHeight: 0 }}>
                                <video src={videoUrl} controls style={{ width: '100%', maxHeight: 380, outline: 'none', display: 'block' }} />
                            </Box>
                        )}

                        {/* ── DESCRIPTION ── */}
                        {info.description && (
                            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #1F2937' }}>
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6366F1', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                                    About this lesson
                                </Typography>
                                <Typography sx={{ color: '#D1D5DB', fontSize: '0.92rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                    {info.description}
                                </Typography>
                            </Box>
                        )}

                        {/* ── UPLOADED FILE (document type) ── */}
                        {derivedMaterials.length > 0 && (
                            <Box sx={{ px: 3, py: 2.5 }}>
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6366F1', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                                    Attached File
                                </Typography>
                                <Stack spacing={1}>
                                    {derivedMaterials.map((mat) => (
                                        <Box key={mat.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 2, borderRadius: '10px', bgcolor: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', '&:hover': { bgcolor: 'rgba(99,102,241,0.12)' } }}>
                                            {getFileIcon(mat.file_url)}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography sx={{ color: '#E5E7EB', fontSize: '0.88rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {mat.display_name}
                                                </Typography>
                                                {mat.created_at && (
                                                    <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                                        Uploaded {new Date(mat.created_at).toLocaleDateString()}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Tooltip title="Download / Open">
                                                <IconButton size="small" component="a" href={mat.file_url} target="_blank" rel="noopener noreferrer" sx={{ color: '#6366F1', '&:hover': { color: '#818CF8' } }}>
                                                    <GetApp fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                )}
            </DialogContent>

            <DialogActions sx={{ bgcolor: '#0F172A', px: 3, py: 2, borderTop: '1px solid #1F2937', gap: 1 }}>
                {videoUrl && (
                    <Button component="a" href={videoUrl} target="_blank" rel="noopener noreferrer" startIcon={isDocument ? <GetApp /> : <PlayCircleOutline />}
                        sx={{ color: '#60A5FA', textTransform: 'none', '&:hover': { bgcolor: 'rgba(96,165,250,0.08)' } }}>
                        {isDocument ? 'Open File' : 'Open Video'}
                    </Button>
                )}
                <Box sx={{ flex: 1 }} />
                <Button onClick={onClose} sx={{ color: '#9CA3AF', textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};




const SetupState = ({ onCreate }) => (
    <Paper sx={{ ...paperStyle, p: 6, textAlign: 'center' }}>
        <SchoolOutlined sx={{ fontSize: 56, color: theme.colors.brand, mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700 }}>No Foundational Courses yet</Typography>
        <Typography sx={{ color: '#9CA3AF', mt: 1, mb: 3 }}>
            Create the single programme course before adding modules, lessons, tutors, and quizzes.
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={onCreate} sx={{ ...primaryButtonStyle, textTransform: 'none' }}>
            Create Foundational Courses
        </Button>
    </Paper>
);

const OverviewTab = ({ course, stats, tutors, enrolments }) => (
    <Stack spacing={3}>
        <Paper sx={{ ...paperStyle, p: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Box>
                    <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 700 }}>{course.title}</Typography>
                    <Typography sx={{ color: '#9CA3AF', mt: 1 }}>{course.summary || course.description || 'No summary yet.'}</Typography>
                </Box>
                <Chip label={course.status || (course.published_at ? 'published' : 'draft')} sx={{ bgcolor: course.published_at || course.status === 'published' ? 'rgba(16,185,129,0.14)' : 'rgba(251,191,36,0.14)', color: course.published_at || course.status === 'published' ? '#34D399' : '#FBBF24', textTransform: 'capitalize' }} />
            </Stack>
        </Paper>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <StatCard icon={<MenuBookOutlined />} label="Modules" value={stats.modules} />
            <StatCard icon={<AssignmentTurnedIn />} label="Lessons" value={stats.lessons} />
            <StatCard icon={<PersonAddAlt />} label="Foundational Tutors" value={tutors.length} />
            <StatCard icon={<Quiz />} label="CBT-ready Lessons" value={stats.questionsReady} />
            <StatCard icon={<Payments />} label="Enrolments" value={enrolments.length} />
        </Stack>
    </Stack>
);

const StatCard = ({ icon, label, value }) => (
    <Paper sx={{ ...paperStyle, p: 2.5, flex: 1, minWidth: 160 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: 'rgba(17,82,212,0.16)', color: theme.colors.brand }}>{icon}</Avatar>
            <Box>
                <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 800 }}>{value}</Typography>
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{label}</Typography>
            </Box>
        </Stack>
    </Paper>
);

const actionMenuPaperSx = {
    bgcolor: '#111827',
    color: '#E5E7EB',
    border: '1px solid #374151',
    minWidth: 190,
    '& .MuiMenuItem-root': {
        fontSize: '0.875rem',
        gap: 1,
        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
    },
};

const ActionMenuButton = ({ label, children, disabled = false }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    return (
        <>
            <IconButton
                size="small"
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open ? 'true' : undefined}
                disabled={disabled}
                onClick={(event) => setAnchorEl(event.currentTarget)}
                sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#FFFFFF' } }}
            >
                <MoreVert fontSize="small" />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                PaperProps={{ sx: actionMenuPaperSx }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {children(() => setAnchorEl(null))}
            </Menu>
        </>
    );
};

const ModuleActionsMenu = ({ module, onEditModule, onDeleteModule }) => (
    <ActionMenuButton label={`Actions for ${module.title || 'module'}`}>
        {(closeMenu) => (
            <>
                <MenuItem onClick={() => { closeMenu(); onEditModule(module); }}>
                    <ListItemIcon sx={{ color: '#93C5FD', minWidth: 30 }}><Edit fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit Module</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { closeMenu(); onDeleteModule(module); }}>
                    <ListItemIcon sx={{ color: '#FCA5A5', minWidth: 30 }}><Delete fontSize="small" /></ListItemIcon>
                    <ListItemText>Delete Module</ListItemText>
                </MenuItem>
            </>
        )}
    </ActionMenuButton>
);

const LessonActionsMenu = ({
    module,
    lesson,
    disabled,
    onEditLesson,
    onDeleteLesson,
    onPublishLesson,
    onUploadVideo,
    onUploadMaterial,
    onQuiz,
    onPreviewLesson,
}) => {
    const published = !!(lesson.published_at || lesson.is_published || lesson.status === 'published');
    const videoInputRef = React.useRef(null);
    const materialInputRef = React.useRef(null);

    return (
        <>
            <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onUploadVideo(lesson, file);
                    event.target.value = '';
                }}
            />
            <input
                ref={materialInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onUploadMaterial(lesson, file);
                    event.target.value = '';
                }}
            />
            <ActionMenuButton label={`Actions for ${lesson.title || 'lesson'}`} disabled={disabled}>
                {(closeMenu) => (
                    <>
                        <MenuItem onClick={() => { closeMenu(); onPreviewLesson(lesson); }}>
                            <ListItemIcon sx={{ color: '#FCD34D', minWidth: 30 }}><Visibility fontSize="small" /></ListItemIcon>
                            <ListItemText>Preview Lesson</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => { closeMenu(); onEditLesson(module, lesson); }}>
                            <ListItemIcon sx={{ color: '#93C5FD', minWidth: 30 }}><Edit fontSize="small" /></ListItemIcon>
                            <ListItemText>Edit Lesson</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => { closeMenu(); setTimeout(() => videoInputRef.current?.click(), 150); }}>
                            <ListItemIcon sx={{ color: '#38BDF8', minWidth: 30 }}><UploadFile fontSize="small" /></ListItemIcon>
                            <ListItemText>Upload Video</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => { closeMenu(); setTimeout(() => materialInputRef.current?.click(), 150); }}>
                            <ListItemIcon sx={{ color: '#FBBF24', minWidth: 30 }}><MenuBookOutlined fontSize="small" /></ListItemIcon>
                            <ListItemText>Upload Material</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => { closeMenu(); onQuiz(lesson); }}>
                            <ListItemIcon sx={{ color: '#A78BFA', minWidth: 30 }}><Quiz fontSize="small" /></ListItemIcon>
                            <ListItemText>Manage CBT</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => { closeMenu(); onPublishLesson(lesson, !published); }}>
                            <ListItemIcon sx={{ color: '#34D399', minWidth: 30 }}><Save fontSize="small" /></ListItemIcon>
                            <ListItemText>{published ? 'Unpublish' : 'Publish'}</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => { closeMenu(); onDeleteLesson(lesson); }}>
                            <ListItemIcon sx={{ color: '#FCA5A5', minWidth: 30 }}><Delete fontSize="small" /></ListItemIcon>
                            <ListItemText>Delete Lesson</ListItemText>
                        </MenuItem>
                    </>
                )}
            </ActionMenuButton>
        </>
    );
};

const ContentTab = ({
    modules,
    actionLoading,
    onAddModule,
    onEditModule,
    onDeleteModule,
    onAddLesson,
    onEditLesson,
    onDeleteLesson,
    onPublishLesson,
    onUploadVideo,
    onUploadMaterial,
    onQuiz,
    onPreviewLesson,
    assignedTutorName,
    uploadingLessonId,
    uploadProgress,
    expandedLessonPreviewId,
    setExpandedLessonPreviewId,
}) => (
    <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700 }}>Course Content</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={onAddModule} sx={{ ...primaryButtonStyle, textTransform: 'none' }}>Add Module</Button>
        </Stack>
        {modules.length === 0 ? (
            <Paper sx={{ ...paperStyle, p: 5, textAlign: 'center', color: '#9CA3AF' }}>No modules yet.</Paper>
        ) : modules.map((module, moduleIndex) => (
            <Paper key={module.id || moduleIndex} sx={{ ...paperStyle, overflow: 'hidden' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, bgcolor: '#111827' }}>
                    <Box>
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 700 }}>{moduleIndex + 1}. {module.title}</Typography>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{module.description || module.summary || `${module.lessons?.length || 0} lessons`}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <ModuleActionsMenu
                            module={module}
                            onEditModule={onEditModule}
                            onDeleteModule={onDeleteModule}
                        />
                    </Stack>
                </Stack>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={tableHeaderCellStyle}>Lesson</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Tutor</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
                            <TableCell sx={tableHeaderCellStyle} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(module.lessons || []).map((lesson) => {
                            const hasVideo = !!(lesson.video_url || lesson.video);
                            const videoUrl = hasVideo ? getVideoUrl(lesson.video_url || lesson.video) : null;
                            const isExpanded = expandedLessonPreviewId === lesson.id;

                            return (
                                <React.Fragment key={lesson.id}>
                                    <TableRow sx={{ borderBottom: isExpanded ? 'none' : undefined }}>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#FFFFFF' }}>
                                            <Stack spacing={0.5}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography sx={{ fontWeight: 500 }}>{lesson.title}</Typography>
                                                    {hasVideo && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setExpandedLessonPreviewId(isExpanded ? null : lesson.id)}
                                                            sx={{
                                                                color: isExpanded ? '#EF4444' : '#60A5FA',
                                                                '&:hover': { bgcolor: 'rgba(96,165,250,0.1)' },
                                                                ml: 1,
                                                                p: 0.5
                                                            }}
                                                            title={isExpanded ? "Close Video Preview" : "Watch Video Preview"}
                                                        >
                                                            {isExpanded ? <Close sx={{ fontSize: 18 }} /> : <PlayCircleOutline sx={{ fontSize: 18 }} />}
                                                        </IconButton>
                                                    )}
                                                </Stack>

                                                {/* Uploading progress bar */}
                                                {uploadingLessonId === lesson.id && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, maxWidth: 280 }}>
                                                        <LinearProgress variant="determinate" value={uploadProgress} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#1F2937', '& .MuiLinearProgress-bar': { bgcolor: '#38BDF8' } }} />
                                                        <Typography sx={{ color: '#38BDF8', fontSize: '0.75rem', fontWeight: 650 }}>{uploadProgress}%</Typography>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>{assignedTutorName(lesson)}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Chip size="small" label={lesson.published_at || lesson.is_published || lesson.status === 'published' ? 'Published' : 'Draft'} sx={{ color: lesson.published_at || lesson.is_published || lesson.status === 'published' ? '#34D399' : '#FBBF24', bgcolor: lesson.published_at || lesson.is_published || lesson.status === 'published' ? 'rgba(16,185,129,0.12)' : 'rgba(251,191,36,0.12)' }} />
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle} align="right">
                                            <LessonActionsMenu
                                                module={module}
                                                lesson={lesson}
                                                disabled={actionLoading}
                                                onEditLesson={onEditLesson}
                                                onDeleteLesson={onDeleteLesson}
                                                onPublishLesson={onPublishLesson}
                                                onUploadVideo={onUploadVideo}
                                                onUploadMaterial={onUploadMaterial}
                                                onQuiz={onQuiz}
                                                onPreviewLesson={onPreviewLesson}
                                            />
                                        </TableCell>
                                    </TableRow>

                                    {/* Inline video / document preview row */}
                                    {isExpanded && videoUrl && (
                                        <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                                            <TableCell colSpan={4} sx={{ p: 2, borderBottom: '1px solid #1F2937' }}>
                                                <Box sx={{ maxWidth: 500, mx: 'auto', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(99,102,241,0.25)', bgcolor: '#000' }}>
                                                    {videoUrl.toLowerCase().includes('.pdf') ? (
                                                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#1E293B' }}>
                                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                                <InsertDriveFile sx={{ color: '#F87171' }} />
                                                                <Typography sx={{ color: '#E5E7EB', fontSize: '0.875rem' }}>PDF Material</Typography>
                                                            </Stack>
                                                            <Button size="small" component="a" href={videoUrl} target="_blank" rel="noopener noreferrer" startIcon={<GetApp />} sx={{ color: '#60A5FA', textTransform: 'none' }}>Open PDF</Button>
                                                        </Box>
                                                    ) : videoUrl.toLowerCase().includes('.mp4') || videoUrl.toLowerCase().includes('.webm') ? (
                                                        <video src={videoUrl} controls style={{ width: '100%', display: 'block', maxHeight: 280 }} />
                                                    ) : (
                                                        <iframe
                                                            src={videoUrl.replace('watch?v=', 'embed/').replace('vimeo.com/', 'player.vimeo.com/video/')}
                                                            title="Video Preview"
                                                            allowFullScreen
                                                            style={{ width: '100%', height: 280, border: 'none', display: 'block' }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        <TableRow>
                            <TableCell colSpan={4} sx={{ borderBottom: 'none' }}>
                                <Button fullWidth startIcon={<Add />} onClick={() => onAddLesson(module)} sx={{ color: theme.colors.brand, textTransform: 'none' }}>
                                    Add Lesson
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Paper>
        ))}
    </Stack>
);

const TutorsTab = ({ tutors, onManage }) => (
    <Paper sx={{ ...paperStyle, p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700 }}>Foundational Tutors</Typography>
            <Button startIcon={<PersonAddAlt />} variant="contained" onClick={onManage} sx={{ ...primaryButtonStyle, textTransform: 'none' }}>Manage Tutors</Button>
        </Stack>
        <Stack spacing={1}>
            {tutors.length === 0 ? <Typography sx={{ color: '#9CA3AF' }}>No foundational tutors yet.</Typography> : tutors.map((tutor) => (
                <Stack key={getTutorId(tutor)} direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5, border: '1px solid #374151', borderRadius: 1 }}>
                    <Avatar src={tutor.avatar_url}>{getTutorName(tutor).charAt(0)}</Avatar>
                    <Box>
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>{getTutorName(tutor)}</Typography>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{tutor.email || 'No email'}</Typography>
                    </Box>
                </Stack>
            ))}
        </Stack>
    </Paper>
);

const AssignmentsTab = ({ lessons, onAssign, assignedTutorName }) => (
    <Paper sx={{ ...paperStyle, p: 2 }}>
        <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>Lesson Assignments</Typography>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell sx={tableHeaderCellStyle}>Module</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Lesson</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Assigned Tutor</TableCell>
                    <TableCell sx={tableHeaderCellStyle} align="right">Action</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {lessons.map((lesson) => (
                    <TableRow key={lesson.id}>
                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>{lesson.module?.title || '-'}</TableCell>
                        <TableCell sx={{ ...tableBodyCellStyle, color: '#FFFFFF' }}>{lesson.title}</TableCell>
                        <TableCell sx={{ ...tableBodyCellStyle, color: getAssignedTutorId(lesson) ? '#D1D5DB' : '#FBBF24' }}>{getAssignedTutorId(lesson) ? assignedTutorName(lesson) : 'Unassigned'}</TableCell>
                        <TableCell sx={tableBodyCellStyle} align="right"><Button onClick={() => onAssign(lesson)} sx={{ textTransform: 'none' }}>Assign</Button></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Paper>
);

const CbtTab = ({ lessons, onManage }) => (
    <Paper sx={{ ...paperStyle, p: 2 }}>
        <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>CBT Question Banks</Typography>
        <Stack spacing={1}>
            {lessons.map((lesson) => (
                <Stack key={lesson.id} direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, border: '1px solid #374151', borderRadius: 1 }}>
                    <Box>
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>{lesson.title}</Typography>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{lesson.module?.title || '-'} - {getLessonVersionId(lesson) ? 'Question bank available' : 'Publish lesson to create a question bank'}</Typography>
                    </Box>
                    <Button disabled={!getLessonVersionId(lesson)} startIcon={<Quiz />} onClick={() => onManage(lesson)} sx={{ textTransform: 'none' }}>Manage Quiz</Button>
                </Stack>
            ))}
        </Stack>
    </Paper>
);

const EnrolmentsTab = ({ enrolments }) => (
    <Paper sx={{ ...paperStyle, p: 2 }}>
        <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>Foundational Enrolments</Typography>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell sx={tableHeaderCellStyle}>Learner</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Enrolled</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {enrolments.length === 0 ? (
                    <TableRow><TableCell colSpan={3} sx={{ color: '#9CA3AF', borderBottom: 'none' }}>No foundational enrolments yet.</TableCell></TableRow>
                ) : enrolments.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell sx={{ ...tableBodyCellStyle, color: '#FFFFFF' }}>{item.user?.name || item.learner?.name || item.user?.email || '-'}</TableCell>
                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>{item.status || '-'}</TableCell>
                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>{formatDate(item.enrolled_at || item.created_at)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Paper>
);

const dialogPaperSx = {
    ...modalStyle,
    position: 'relative',
    top: 'auto',
    left: 'auto',
    transform: 'none',
    width: '100%',
    maxWidth: 560,
};

const CourseSetupDialog = ({ open, form, setForm, saving, onClose, onSave }) => (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={{ color: '#FFFFFF', fontWeight: 700 }}>Create Foundational Courses</DialogTitle>
        <DialogContent sx={{ ...scrollableModalBody, pt: 1 }}>
            <Stack spacing={2}>
                <TextField label="Title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} sx={textFieldStyle} fullWidth />
                <TextField label="Summary" value={form.summary} onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))} sx={textFieldStyle} fullWidth />
                <TextField label="Description" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} sx={textFieldStyle} fullWidth multiline minRows={3} />
            </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #374151' }}>
            <Button onClick={onClose} sx={{ color: '#9CA3AF', textTransform: 'none' }}>Cancel</Button>
            <Button variant="contained" onClick={onSave} disabled={saving} sx={{ ...primaryButtonStyle, textTransform: 'none' }}>Create</Button>
        </DialogActions>
    </Dialog>
);

const ModuleDialog = ({ open, form, setForm, editing, saving, onClose, onSave }) => (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={{ bgcolor: '#111827', borderBottom: '1px solid #374151', px: 3, py: 2.25 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                    <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1rem' }}>
                        {editing ? 'Edit Module' : 'Add Module'}
                    </Typography>
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem', mt: 0.35 }}>
                        Group foundational lessons into a clear learning section.
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
                    <Close fontSize="small" />
                </IconButton>
            </Stack>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#0F1729', p: 3, overflowY: 'auto', ...scrollableModalBody }}>
            <Stack spacing={2.5}>
                <Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                        Module Title <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                    </Typography>
                    <TextField
                        autoFocus
                        placeholder="e.g. Introduction to Governance"
                        value={form.title}
                        onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                        sx={textFieldStyle}
                        fullWidth
                    />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                        Description <Box component="span" sx={{ color: '#9CA3AF', fontWeight: 400 }}>- optional</Box>
                    </Typography>
                    <TextField
                        placeholder="Brief overview of what this module covers."
                        value={form.description}
                        onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                        sx={textFieldStyle}
                        fullWidth
                        multiline
                        minRows={3}
                    />
                </Box>
            </Stack>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#111827', px: 3, py: 2, borderTop: '1px solid #374151', gap: 1 }}>
            <Button onClick={onClose} sx={{ color: '#9CA3AF', textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>Cancel</Button>
            <Button variant="contained" onClick={onSave} disabled={saving || !form.title.trim()} sx={{ ...primaryButtonStyle, boxShadow: 'none', textTransform: 'none', '&:disabled': { bgcolor: '#374151', color: '#9CA3AF' } }}>
                {saving ? 'Saving...' : editing ? 'Save Module' : 'Create Module'}
            </Button>
        </DialogActions>
    </Dialog>
);

const LessonDialog = ({ open, form, setForm, tutors, editing, saving, onClose, onSave }) => (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={{ bgcolor: '#111827', borderBottom: '1px solid #374151', px: 3, py: 2.25 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                    <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1rem' }}>
                        {editing ? 'Edit Lesson' : 'Add Lesson'}
                    </Typography>
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem', mt: 0.35 }}>
                        Add lesson content and assign a foundational tutor before publishing.
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
                    <Close fontSize="small" />
                </IconButton>
            </Stack>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#0F1729', p: 3, overflowY: 'auto', ...scrollableModalBody }}>
            <Stack spacing={2.5}>
                <Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                        Lesson Title <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                    </Typography>
                    <TextField
                        autoFocus
                        placeholder="e.g. Understanding Public Accountability"
                        value={form.title}
                        onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                        sx={textFieldStyle}
                        fullWidth
                    />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                        Assigned Tutor <Box component="span" sx={{ color: '#9CA3AF', fontWeight: 400 }}>- optional for draft</Box>
                    </Typography>
                    <FormControl fullWidth>
                        <Select value={form.assigned_tutor_id} onChange={(event) => setForm((prev) => ({ ...prev, assigned_tutor_id: event.target.value }))} displayEmpty sx={selectStyle} MenuProps={selectMenuProps}>
                            <MenuItem value="">Unassigned draft</MenuItem>
                            {tutors.map((tutor) => (
                                <MenuItem key={getTutorId(tutor)} value={getTutorId(tutor)}>{getTutorName(tutor)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                        Description <Box component="span" sx={{ color: '#9CA3AF', fontWeight: 400 }}>- optional</Box>
                    </Typography>
                    <TextField
                        placeholder="Brief overview of what this lesson covers."
                        value={form.description}
                        onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                        sx={textFieldStyle}
                        fullWidth
                        multiline
                        minRows={4}
                    />
                </Box>
            </Stack>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#111827', px: 3, py: 2, borderTop: '1px solid #374151', gap: 1 }}>
            <Button onClick={onClose} sx={{ color: '#9CA3AF', textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>Cancel</Button>
            <Button variant="contained" onClick={onSave} disabled={saving || !form.title.trim()} sx={{ ...primaryButtonStyle, boxShadow: 'none', textTransform: 'none', '&:disabled': { bgcolor: '#374151', color: '#9CA3AF' } }}>
                {saving ? 'Saving...' : editing ? 'Save Lesson' : 'Create Lesson'}
            </Button>
        </DialogActions>
    </Dialog>
);

export default FoundationalProgram;

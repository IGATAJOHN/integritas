import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import {
    Box, Typography, Stack, Button, IconButton, Paper,
    Tabs, Tab, Accordion, AccordionSummary, AccordionDetails,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    TextField, Chip, Alert, Snackbar, CircularProgress,
    FormControl, Select, MenuItem, Switch, Breadcrumbs
} from '@mui/material';
import {
    ArrowBack, Add, Edit, Delete, ExpandMore, Publish,
    School, Language, Timer, Payments, CheckCircle,
    Cancel, PlayCircleOutline, Close,
    CloudUpload, Quiz, VideoLibrary, DragIndicator,
} from '@mui/icons-material';
import { Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { adminCoursesService } from '../services/courseService';
import { getImageUrl } from '../../../utils';
import { paperStyle } from '../../../styles/formStyles';

const AdminCourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const muiTheme = useMuiTheme();
    const isDark = muiTheme.palette.mode === 'dark';

    const modalBg     = isDark ? '#111827' : '#FFFFFF';
    const modalBorder = isDark ? '#374151' : '#E2E8F0';
    const labelColor  = isDark ? '#E5E7EB' : '#374151';
    const inputSx = {
        '& .MuiOutlinedInput-root': {
            bgcolor: isDark ? '#1E293B' : '#F8FAFC',
            borderRadius: 1.5,
            '& fieldset': { borderColor: isDark ? '#374151' : '#CBD5E1' },
            '&:hover fieldset': { borderColor: isDark ? '#4B5563' : '#94A3B8' },
            '&.Mui-focused fieldset': { borderColor: '#178A83' },
        },
        '& .MuiInputBase-input': {
            py: 1.25, fontSize: '0.875rem',
            color: isDark ? '#FFFFFF' : '#1E293B',
            '&::placeholder': { color: '#9CA3AF', opacity: 1 },
        },
    };
    const selectSx = {
        bgcolor: isDark ? '#1E293B' : '#F8FAFC',
        borderRadius: 1.5,
        fontSize: '0.875rem',
        color: isDark ? '#FFFFFF' : '#1E293B',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#374151' : '#CBD5E1' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#4B5563' : '#94A3B8' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#178A83' },
        '& .MuiSvgIcon-root': { color: '#9CA3AF' },
    };

    // Data State
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Module Modal State
    const [moduleModalOpen, setModuleModalOpen] = useState(false);
    const [moduleTitle, setModuleTitle] = useState('');
    const [moduleDescription, setModuleDescription] = useState('');
    const [editingModuleId, setEditingModuleId] = useState(null);

    // Lesson Modal State
    const [lessonModalOpen, setLessonModalOpen] = useState(false);
    const [selectedModuleForLesson, setSelectedModuleForLesson] = useState(null);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonType, setLessonType] = useState('video');
    const [lessonContent, setLessonContent] = useState('');
    const [lessonDuration, setLessonDuration] = useState(0);
    const [lessonFile, setLessonFile] = useState(null);
    const [lessonFileName, setLessonFileName] = useState('');

    // Reject Modal State
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    // ── localStorage helpers ────────────────────────────────────────────────
    // The API does not embed modules in course detail, and may not embed
    // lessons in module detail. We persist the full module+lesson structure
    // in localStorage so everything survives page navigation and refresh.
    const storageKey = `course_data_${courseId}`;

    const persistModules = (mods) => {
        try {
            const slim = mods.map(m => ({
                id: m.id,
                title: m.title,
                summary: m.summary || '',
                is_published: m.is_published || false,
                lessons: (m.lessons || []).map(l => ({
                    id: l.id,
                    title: l.title,
                    type: l.type || 'video',
                    published_at: l.published_at || null,
                })),
            }));
            localStorage.setItem(storageKey, JSON.stringify(slim));
        } catch { /* quota */ }
    };

    const restoreModules = () => {
        try {
            const v = localStorage.getItem(storageKey);
            return v ? JSON.parse(v) : [];
        } catch { return []; }
    };

    const removeModule = (id) => {
        const mods = restoreModules().filter(m => m.id !== id);
        try { localStorage.setItem(storageKey, JSON.stringify(mods)); } catch { /* ignore */ }
    };
    // ────────────────────────────────────────────────────────────────────────

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            const courseData = await adminCoursesService.getCourseDetail(courseId);
            setCourse(courseData);

            // Restore from localStorage first so something shows immediately.
            const cached = restoreModules();

            // Try to get module IDs from the course detail response first
            // (some API versions embed them). If not, fall back to localStorage.
            const embeddedModules =
                courseData?.modules ||
                courseData?.course_modules ||
                [];

            let sourceModules = cached;

            if (Array.isArray(embeddedModules) && embeddedModules.length > 0) {
                // API returned modules — merge with cached to preserve lesson data
                sourceModules = embeddedModules.map(apiMod => {
                    const cached_mod = cached.find(c => c.id === apiMod.id) || {};
                    return { ...cached_mod, ...apiMod, lessons: apiMod.lessons || cached_mod.lessons || [] };
                });
            }

            if (sourceModules.length > 0) {
                const refreshed = await Promise.all(
                    sourceModules.map(async (cached_mod) => {
                        try {
                            const fresh = await adminCoursesService.getModuleDetail(cached_mod.id);
                            const lessons = (fresh?.lessons?.length > 0)
                                ? fresh.lessons
                                : cached_mod.lessons || [];
                            return { ...cached_mod, ...fresh, lessons };
                        } catch {
                            return cached_mod;
                        }
                    })
                );
                setModules(refreshed);
                persistModules(refreshed);
            }
        } catch (error) {
            console.error('Error fetching course data:', error);
            showSnackbar('Failed to load course data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // ── Drag-and-drop reorder ────────────────────────────────────────────────
    const [modDrag, setModDrag]       = useState({ dragIdx: null, overIdx: null });
    const [lessonDrag, setLessonDrag] = useState({ modId: null, dragIdx: null, overIdx: null });

    const onModDragStart = (e, idx) => {
        e.dataTransfer.effectAllowed = 'move';
        setModDrag({ dragIdx: idx, overIdx: null });
    };
    const onModDragOver = (e, idx) => {
        e.preventDefault();
        if (idx !== modDrag.dragIdx) setModDrag(s => ({ ...s, overIdx: idx }));
    };
    const onModDragEnd = () => setModDrag({ dragIdx: null, overIdx: null });
    const onModDrop = async (e, idx) => {
        e.preventDefault();
        const { dragIdx } = modDrag;
        setModDrag({ dragIdx: null, overIdx: null });
        if (dragIdx === null || dragIdx === idx) return;

        // Guard: API requires ALL module IDs of the course.
        // If modules_count doesn't match what we have loaded, the reorder will be rejected.
        const serverCount = course?.modules_count ?? modules.length;
        if (serverCount !== modules.length) {
            showSnackbar(
                `Cannot reorder — the server shows ${serverCount} modules but only ${modules.length} are loaded. ` +
                `Add all modules through this page first.`,
                'error'
            );
            return;
        }

        const prev = [...modules];
        const reordered = [...modules];
        const [item] = reordered.splice(dragIdx, 1);
        reordered.splice(idx, 0, item);
        setModules(reordered);
        persistModules(reordered);
        try {
            await adminCoursesService.reorderModules(courseId, reordered.map(m => Number(m.id)));
            showSnackbar('Modules reordered');
        } catch (err) {
            setModules(prev);
            persistModules(prev);
            showSnackbar(err?.message || 'Failed to reorder modules', 'error');
        }
    };

    const onLessonDragStart = (e, modId, idx) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        setLessonDrag({ modId, dragIdx: idx, overIdx: null });
    };
    const onLessonDragOver = (e, modId, idx) => {
        e.preventDefault();
        e.stopPropagation();
        if (modId === lessonDrag.modId && idx !== lessonDrag.dragIdx)
            setLessonDrag(s => ({ ...s, overIdx: idx }));
    };
    const onLessonDragEnd = (e) => { e.stopPropagation(); setLessonDrag({ modId: null, dragIdx: null, overIdx: null }); };
    const onLessonDrop = async (e, modId, idx) => {
        e.preventDefault();
        e.stopPropagation();
        const { dragIdx } = lessonDrag;
        setLessonDrag({ modId: null, dragIdx: null, overIdx: null });
        if (dragIdx === null || dragIdx === idx || modId !== lessonDrag.modId) return;
        const mod = modules.find(m => m.id === modId);
        const lessons = [...(mod?.lessons || [])];
        const [item] = lessons.splice(dragIdx, 1);
        lessons.splice(idx, 0, item);
        const prev = modules;
        const updated = modules.map(m => m.id === modId ? { ...m, lessons } : m);
        setModules(updated);
        persistModules(updated);
        try {
            await adminCoursesService.reorderLessons(modId, lessons.map(l => Number(l.id)));
            showSnackbar('Lessons reordered');
        } catch (err) {
            setModules(prev);
            persistModules(prev);
            showSnackbar(err?.message || 'Failed to reorder lessons', 'error');
        }
    };
    // ────────────────────────────────────────────────────────────────────────

    // --- Module Handlers ---

    const handleCreateModule = async () => {
        if (!moduleTitle.trim()) return;
        try {
            setActionLoading(true);
            // API field is `summary`, not `description`
            const payload = { title: moduleTitle.trim(), summary: moduleDescription.trim() };

            if (editingModuleId) {
                const updated = await adminCoursesService.updateModule(editingModuleId, payload);
                setModules(prev => prev.map(m =>
                    m.id === editingModuleId ? { ...m, ...updated, lessons: m.lessons } : m
                ));
                showSnackbar('Module updated');
            } else {
                const created = await adminCoursesService.createModule(courseId, payload);
                const newModule = { ...(created || {}), id: created?.id ?? Date.now(), title: moduleTitle.trim(), lessons: [] };
                setModules(prev => {
                    const updated = [...prev, newModule];
                    persistModules(updated);
                    return updated;
                });
                showSnackbar('Module created');
            }

            setModuleModalOpen(false);
            setModuleTitle('');
            setModuleDescription('');
            setEditingModuleId(null);
        } catch (error) {
            console.error('Module save error:', error);
            showSnackbar(error?.message || 'Failed to save module', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm('Are you sure? All lessons in this module will be deleted.')) return;
        try {
            setActionLoading(true);
            await adminCoursesService.deleteModule(moduleId);
            removeModule(moduleId);
            setModules(prev => {
                const updated = prev.filter(m => m.id !== moduleId);
                persistModules(updated);
                return updated;
            });
            showSnackbar('Module deleted');
        } catch (error) {
            showSnackbar('Failed to delete module', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePublishModule = async (moduleId, currentStatus) => {
        try {
            const updatedModules = modules.map(m =>
                m.id === moduleId ? { ...m, is_published: !currentStatus } : m
            );
            setModules(updatedModules);

            if (currentStatus) {
                await adminCoursesService.unpublishModule(courseId, moduleId);
                showSnackbar('Module unpublished');
            } else {
                await adminCoursesService.publishModule(courseId, moduleId);
                showSnackbar('Module published');
            }
        } catch (error) {
            // Revert optimistic update on failure
            setModules(prev => prev.map(m =>
                m.id === moduleId ? { ...m, is_published: currentStatus } : m
            ));
            showSnackbar('Failed to update module status', 'error');
        }
    };

    // --- Lesson Handlers ---

    const openAddLessonModal = (moduleId) => {
        setSelectedModuleForLesson(moduleId);
        setLessonTitle('');
        setLessonType('video');
        setLessonContent('');
        setLessonDuration(0);
        setLessonFile(null);
        setLessonFileName('');
        setLessonModalOpen(true);
    };

    const handleCreateLesson = async () => {
        if (!lessonTitle.trim()) {
            showSnackbar('Lesson title is required', 'error');
            return;
        }

        try {
            setActionLoading(true);

            // API: POST /admin/modules/{module}/lessons { title, description, assigned_tutor_id }
            const payload = {
                title: lessonTitle.trim(),
                description: lessonContent.trim() || undefined,
            };

            const newLesson = await adminCoursesService.createLesson(selectedModuleForLesson, payload);

            if ((lessonType === 'video' || lessonType === 'document') && lessonFile && newLesson?.id) {
                const formData = new FormData();
                formData.append('video', lessonFile);
                await adminCoursesService.uploadLessonMedia(newLesson.id, formData).catch(() => {});
            }

            // Append lesson directly to the correct module in state and persist
            const created = newLesson || { id: Date.now(), title: lessonTitle.trim(), type: lessonType, published_at: null };
            setModules(prev => {
                const updated = prev.map(m =>
                    m.id === selectedModuleForLesson
                        ? { ...m, lessons: [...(m.lessons || []), created] }
                        : m
                );
                persistModules(updated);
                return updated;
            });

            showSnackbar('Lesson created');
            setLessonModalOpen(false);
        } catch (error) {
            console.error('Create lesson error:', error);
            showSnackbar(error.message || 'Failed to create lesson', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm('Delete this lesson?')) return;
        try {
            setActionLoading(true);
            await adminCoursesService.deleteLesson(lessonId);
            setModules(prev => {
                const updated = prev.map(m => ({ ...m, lessons: (m.lessons || []).filter(l => l.id !== lessonId) }));
                persistModules(updated);
                return updated;
            });
            showSnackbar('Lesson deleted');
        } catch (error) {
            showSnackbar('Failed to delete lesson', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePublishLesson = async (moduleId, lessonId, currentStatus) => {
        // Optimistic update
        const toggle = (lessons) => lessons.map(l =>
            l.id === lessonId ? { ...l, published_at: currentStatus ? null : new Date().toISOString() } : l
        );
        setModules(prev => prev.map(m =>
            m.id === moduleId ? { ...m, lessons: toggle(m.lessons || []) } : m
        ));
        try {
            if (currentStatus) {
                await adminCoursesService.unpublishLesson(moduleId, lessonId);
                showSnackbar('Lesson unpublished');
            } else {
                await adminCoursesService.publishLesson(moduleId, lessonId);
                showSnackbar('Lesson published');
            }
        } catch (error) {
            // Revert
            setModules(prev => prev.map(m =>
                m.id === moduleId ? { ...m, lessons: toggle(m.lessons || []) } : m
            ));
            showSnackbar('Failed to update lesson status', 'error');
        }
    };

    // --- Course Actions ---

    const refreshCourse = async () => {
        try {
            const courseData = await adminCoursesService.getCourseDetail(courseId);
            setCourse(courseData);
        } catch { /* silently ignore */ }
    };

    const handlePublishCourse = async () => {
        try {
            setActionLoading(true);
            if (course.published_at) {
                await adminCoursesService.unpublishCourse(courseId);
                setCourse(prev => ({ ...prev, published_at: null }));
                showSnackbar('Course unpublished');
            } else {
                await adminCoursesService.publishCourse(courseId);
                setCourse(prev => ({ ...prev, published_at: new Date().toISOString() }));
                showSnackbar('Course published');
            }
        } catch (error) {
            showSnackbar('Failed to update course status', 'error');
            await refreshCourse();
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveCourse = async () => {
        if (!window.confirm('Approve this course? It will be marked as reviewed.')) return;
        try {
            setActionLoading(true);
            await adminCoursesService.updateCourse(courseId, { status: 'published' });
            setCourse(prev => ({ ...prev, status: 'published' }));
            showSnackbar('Course approved');
        } catch (error) {
            showSnackbar('Failed to approve course', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectCourse = async () => {
        if (!rejectionReason.trim()) {
            showSnackbar('Please provide a reason', 'error');
            return;
        }
        try {
            setActionLoading(true);
            await adminCoursesService.updateCourse(courseId, { status: 'rejected', rejection_reason: rejectionReason });
            setCourse(prev => ({ ...prev, status: 'rejected' }));
            showSnackbar('Course rejected');
            setRejectModalOpen(false);
        } catch (error) {
            showSnackbar('Failed to reject course', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteCourse = async () => {
        if (!window.confirm('CRITICAL: Delete this course permanently? This cannot be undone.')) return;
        try {
            setActionLoading(true);
            await adminCoursesService.deleteCourse(courseId);
            navigate('/admin/content/courses');
        } catch (error) {
            showSnackbar('Failed to delete course', 'error');
            setActionLoading(false);
        }
    };

    // --- Render Helpers ---

    const getLessonIcon = (type) => {
        switch (type) {
            case 'video': return <PlayCircleOutline />;
            case 'document': return <Description />;
            case 'text': return <Language />;
            case 'quiz': return <School />;
            default: return <VideoLibrary />;
        }
    };

    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency || 'NGN' }).format(amount);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0F1729' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!course) return null;

    const hasThumbnail = Boolean(String(course.thumbnail_url || '').trim());

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0F1729', minHeight: '100vh', color: '#fff' }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <IconButton onClick={() => navigate('/admin/content/courses')} sx={{ color: '#9CA3AF' }}>
                    <ArrowBack />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                    <Breadcrumbs separator="›" sx={{ color: '#6B7280', fontSize: '0.85rem', mb: 0.5 }}>
                        <Link to="/admin/content/courses" style={{ color: '#6B7280', textDecoration: 'none' }}>Courses</Link>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Details</Typography>
                    </Breadcrumbs>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#fff' }}>
                        {course.title}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Chip
                        label={course.status}
                        color={course.status === 'published' ? 'success' : course.status === 'rejected' ? 'error' : 'warning'}
                        sx={{ fontWeight: 600, borderRadius: 1 }}
                    />
                </Stack>
            </Stack>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Curriculum" sx={{ textTransform: 'none', color: '#9CA3AF' }} />
                    <Tab label="Details" sx={{ textTransform: 'none', color: '#9CA3AF' }} />
                    <Tab label="Settings" sx={{ textTransform: 'none', color: '#9CA3AF' }} />
                </Tabs>
            </Box>

            {/* TAB 0: CURRICULUM */}
            {activeTab === 0 && (
                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Course Content</Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => { setEditingModuleId(null); setModuleTitle(''); setModuleDescription(''); setModuleModalOpen(true); }}
                            sx={{ bgcolor: '#178A83', '&:hover': { bgcolor: '#126E68' }, textTransform: 'none', fontWeight: 600 }}
                        >
                            Add Module
                        </Button>
                    </Stack>

                    {/* Warn when server modules_count doesn't match loaded count */}
                    {course?.modules_count > 0 && modules.length < course.modules_count && (
                        <Alert
                            severity="warning"
                            sx={{ mb: 2, bgcolor: 'rgba(251,191,36,0.08)', color: '#FBBF24', '& .MuiAlert-icon': { color: '#FBBF24' } }}
                        >
                            The server shows <strong>{course.modules_count}</strong> modules for this course, but only{' '}
                            <strong>{modules.length}</strong> are loaded in this browser. Modules created in another session
                            are not visible here — dragging to reorder is disabled until all modules are loaded.
                        </Alert>
                    )}

                    {modules.length === 0 ? (
                        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#1A2230', border: '1px dashed #374151', borderRadius: 2 }}>
                            <School sx={{ fontSize: 60, color: '#374151', mb: 2 }} />
                            <Typography sx={{ color: '#9CA3AF', mb: 2 }}>No modules yet.</Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={2}>
                            {modules.map((mod, modIdx) => (
                                <Box
                                    key={mod.id}
                                    draggable
                                    onDragStart={e => onModDragStart(e, modIdx)}
                                    onDragOver={e => onModDragOver(e, modIdx)}
                                    onDragEnd={onModDragEnd}
                                    onDrop={e => onModDrop(e, modIdx)}
                                    sx={{
                                        borderRadius: 2,
                                        transition: 'opacity 0.15s, outline 0.1s',
                                        opacity: modDrag.dragIdx === modIdx ? 0.35 : 1,
                                        outline: modDrag.overIdx === modIdx && modDrag.dragIdx !== modIdx
                                            ? '2px solid #178A83' : '2px solid transparent',
                                    }}
                                >
                                <Paper sx={{ bgcolor: '#1A2230', overflow: 'hidden', border: '1px solid #374151', borderRadius: 2 }}>
                                    <Accordion disableGutters sx={{ bgcolor: 'transparent', boxShadow: 'none', '&:before': { display: 'none' } }}>
                                        <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#9CA3AF' }} />}>
                                            <Stack direction="row" alignItems="center" sx={{ width: '100%', mr: 2 }} spacing={1}>
                                                {/* Drag handle */}
                                                <Box
                                                    onClick={e => e.stopPropagation()}
                                                    sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', '&:active': { cursor: 'grabbing' } }}
                                                >
                                                    <DragIndicator sx={{ color: '#4B5563', fontSize: 20 }} />
                                                </Box>
                                                {/* Position number */}
                                                <Chip
                                                    label={modIdx + 1}
                                                    size="small"
                                                    sx={{ bgcolor: '#0C1322', color: '#6B7280', fontSize: '0.7rem', fontWeight: 700, height: 20, minWidth: 24 }}
                                                />
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                                        {mod.title}
                                                    </Typography>
                                                    {(mod.summary || mod.description) && (
                                                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                                                            {mod.summary || mod.description}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Stack direction="row" alignItems="center" spacing={1} onClick={e => e.stopPropagation()}>
                                                    <Switch
                                                        size="small"
                                                        checked={!!mod.is_published}
                                                        onChange={() => handlePublishModule(mod.id, mod.is_published)}
                                                        color="success"
                                                    />
                                                    <IconButton size="small" sx={{ color: '#3B82F6' }} onClick={() => { setEditingModuleId(mod.id); setModuleTitle(mod.title); setModuleDescription(mod.summary || mod.description || ''); setModuleModalOpen(true); }}>
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" sx={{ color: '#EF4444' }} onClick={() => handleDeleteModule(mod.id)}>
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </Stack>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ bgcolor: '#111827', borderTop: '1px solid #374151', p: 0 }}>
                                            <List>
                                                {mod.lessons && mod.lessons.map((lesson, lesIdx) => (
                                                    <Box
                                                        key={lesson.id}
                                                        draggable
                                                        onDragStart={e => onLessonDragStart(e, mod.id, lesIdx)}
                                                        onDragOver={e => onLessonDragOver(e, mod.id, lesIdx)}
                                                        onDragEnd={onLessonDragEnd}
                                                        onDrop={e => onLessonDrop(e, mod.id, lesIdx)}
                                                        sx={{
                                                            transition: 'opacity 0.15s, outline 0.1s',
                                                            opacity: lessonDrag.modId === mod.id && lessonDrag.dragIdx === lesIdx ? 0.35 : 1,
                                                            outline: lessonDrag.modId === mod.id && lessonDrag.overIdx === lesIdx && lessonDrag.dragIdx !== lesIdx
                                                                ? '2px solid #178A83' : '2px solid transparent',
                                                        }}
                                                    >
                                                    <ListItem disablePadding secondaryAction={
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Tooltip title="Manage quiz questions">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => navigate(`/admin/content/courses/${courseId}/lessons/${lesson.id}/quiz`)}
                                                                    sx={{ color: '#A78BFA', bgcolor: 'rgba(167,139,250,0.08)', '&:hover': { bgcolor: 'rgba(167,139,250,0.18)' } }}
                                                                >
                                                                    <Quiz fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Switch
                                                                size="small"
                                                                checked={!!lesson.published_at}
                                                                onChange={() => handlePublishLesson(mod.id, lesson.id, !!lesson.published_at)}
                                                                color="success"
                                                            />
                                                            <IconButton size="small" sx={{ color: '#EF4444' }} onClick={() => handleDeleteLesson(lesson.id)}>
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Stack>
                                                    }>
                                                        <ListItemButton>
                                                            {/* Lesson drag handle */}
                                                            <Box sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', mr: 1, '&:active': { cursor: 'grabbing' } }}>
                                                                <DragIndicator sx={{ color: '#374151', fontSize: 18 }} />
                                                            </Box>
                                                            {/* Lesson position number */}
                                                            <Typography sx={{ color: '#4B5563', fontSize: '0.7rem', fontWeight: 700, minWidth: 18, mr: 1 }}>
                                                                {lesIdx + 1}
                                                            </Typography>
                                                            <ListItemIcon sx={{ color: '#9CA3AF', minWidth: 36 }}>
                                                                {getLessonIcon(lesson.type)}
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={<Typography sx={{ color: '#E5E7EB', fontSize: '0.9rem' }}>{lesson.title}</Typography>}
                                                                secondary={
                                                                    <Typography sx={{ color: '#6B7280', fontSize: '0.8rem' }}>
                                                                        {lesson.type} • {lesson.duration || 0}m
                                                                    </Typography>
                                                                }
                                                            />
                                                        </ListItemButton>
                                                    </ListItem>
                                                    </Box>
                                                ))}
                                                {(!mod.lessons || mod.lessons.length === 0) && (
                                                    <ListItem>
                                                        <Typography sx={{ color: '#6B7280', fontSize: '0.85rem', p: 1, width: '100%', textAlign: 'center' }}>
                                                            No lessons yet
                                                        </Typography>
                                                    </ListItem>
                                                )}
                                                <ListItem>
                                                    <Button
                                                        fullWidth
                                                        startIcon={<Add />}
                                                        onClick={() => openAddLessonModal(mod.id)}
                                                        sx={{ color: '#3B82F6', bgcolor: 'rgba(59, 130, 246, 0.05)', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' } }}
                                                    >
                                                        Add Lesson
                                                    </Button>
                                                </ListItem>
                                            </List>
                                        </AccordionDetails>
                                    </Accordion>
                                </Paper>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>
            )}

            {/* TAB 1: DETAILS */}
            {activeTab === 1 && (
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Course Details</Typography>
                    <Stack spacing={3}>
                        <Paper sx={{ ...paperStyle, padding: 2 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1 }}>Thumbnail</Typography>
                            {hasThumbnail ? (
                                <Box component="img" src={getImageUrl(course.thumbnail_url)} sx={{ width: '100%', maxWidth: 400, borderRadius: 1 }} />
                            ) : (
                                <Box
                                    sx={{
                                        width: '100%',
                                        maxWidth: 400,
                                        aspectRatio: '1 / 1',
                                        bgcolor: '#000000',
                                        borderRadius: 1,
                                    }}
                                />
                            )}
                        </Paper>
                        <Paper sx={{ ...paperStyle, padding: 3 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Basic Info</Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Title</Typography>
                                    <Typography sx={{ color: '#fff' }}>{course.title}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Slug</Typography>
                                    <Typography sx={{ color: '#9CA3AF' }}>{course.slug || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Summary</Typography>
                                    <Typography sx={{ color: '#9CA3AF' }}>{course.summary || '-'}</Typography>
                                </Box>
                                {course.description && (
                                    <Box>
                                        <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Description</Typography>
                                        <Typography sx={{ color: '#9CA3AF' }} dangerouslySetInnerHTML={{ __html: course.description }} />
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                        <Paper sx={{ ...paperStyle, padding: 3 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Attributes</Typography>
                            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center"><School sx={{ fontSize: 16, color: '#6B7280' }} /><Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Level</Typography></Stack>
                                    <Typography sx={{ color: '#fff' }}>{course.level || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center"><Language sx={{ fontSize: 16, color: '#6B7280' }} /><Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Language</Typography></Stack>
                                    <Typography sx={{ color: '#fff' }}>{course.language || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center"><Timer sx={{ fontSize: 16, color: '#6B7280' }} /><Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Duration</Typography></Stack>
                                    <Typography sx={{ color: '#fff' }}>{course.duration_minutes || 0} min</Typography>
                                </Box>
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center"><Payments sx={{ fontSize: 16, color: '#6B7280' }} /><Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>Price</Typography></Stack>
                                    <Typography sx={{ color: '#fff' }}>{formatCurrency(course.price, course.currency)}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Stack>
                </Box>
            )}

            {/* TAB 2: SETTINGS */}
            {activeTab === 2 && (
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Course Settings</Typography>
                    <Stack spacing={3}>
                        <Paper sx={{ ...paperStyle, padding: 3 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Publication</Typography>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>{course.published_at ? 'Published' : 'Draft'}</Typography>
                                    <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>{course.published_at ? 'Visible to students' : 'Hidden from students'}</Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    color={course.published_at ? "warning" : "success"}
                                    onClick={handlePublishCourse}
                                    startIcon={<Publish />}
                                >
                                    {course.published_at ? 'Unpublish' : 'Publish'}
                                </Button>
                            </Stack>
                        </Paper>

                        <Paper sx={{ ...paperStyle, padding: 3 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 2 }}>Approval Status</Typography>
                            <Stack direction="row" spacing={2}>
                                <Button variant="contained" color="success" onClick={handleApproveCourse} startIcon={<CheckCircle />}>
                                    Approve Course
                                </Button>
                                <Button variant="outlined" color="error" onClick={() => setRejectModalOpen(true)} startIcon={<Cancel />}>
                                    Reject Course
                                </Button>
                            </Stack>
                        </Paper>

                        <Paper sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', p: 3, borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            <Typography sx={{ color: '#EF4444', fontSize: '0.85rem', mb: 2 }}>Danger Zone</Typography>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>Delete Course</Typography>
                                    <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>Irreversible action</Typography>
                                </Box>
                                <Button variant="outlined" color="error" onClick={handleDeleteCourse} startIcon={<Delete />}>
                                    Delete
                                </Button>
                            </Stack>
                        </Paper>
                    </Stack>
                </Box>
            )}


            {/* Module Dialog */}
            <Dialog
                open={moduleModalOpen}
                onClose={() => setModuleModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { bgcolor: modalBg, border: `1px solid ${modalBorder}`, borderRadius: 2 } }}
            >
                <DialogTitle sx={{ borderBottom: `1px solid ${modalBorder}`, pb: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                            {editingModuleId ? 'Edit Module' : 'Add Module'}
                        </Typography>
                        <IconButton onClick={() => setModuleModalOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
                            <Close fontSize="small" />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.75 }}>
                                Module Title <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="e.g. Introduction to Governance"
                                value={moduleTitle}
                                onChange={e => setModuleTitle(e.target.value)}
                                autoFocus
                                sx={inputSx}
                            />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.75 }}>
                                Description <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}> — optional</Box>
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Brief overview of what this module covers."
                                value={moduleDescription}
                                onChange={e => setModuleDescription(e.target.value)}
                                sx={inputSx}
                            />
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, borderTop: `1px solid ${modalBorder}`, pt: 2, gap: 1 }}>
                    <Button onClick={() => setModuleModalOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateModule}
                        disabled={actionLoading || !moduleTitle.trim()}
                        sx={{ bgcolor: '#178A83', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#126E68' }, '&:disabled': { bgcolor: isDark ? '#374151' : '#CBD5E1', color: '#9CA3AF' } }}
                    >
                        {actionLoading ? 'Saving…' : 'Save Module'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Lesson Dialog */}
            <Dialog
                open={lessonModalOpen}
                onClose={() => setLessonModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { bgcolor: modalBg, border: `1px solid ${modalBorder}`, borderRadius: 2 } }}
            >
                <DialogTitle sx={{ borderBottom: `1px solid ${modalBorder}`, pb: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Add Lesson</Typography>
                        <IconButton onClick={() => setLessonModalOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
                            <Close fontSize="small" />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.75 }}>
                                Lesson Title <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="e.g. What is Corporate Governance?"
                                value={lessonTitle}
                                onChange={e => setLessonTitle(e.target.value)}
                                autoFocus
                                sx={inputSx}
                            />
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.75 }}>
                                Lesson Type
                            </Typography>
                            <Select
                                fullWidth
                                value={lessonType}
                                onChange={e => setLessonType(e.target.value)}
                                sx={selectSx}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                                            border: `1px solid ${modalBorder}`,
                                            borderRadius: 1.5,
                                            mt: 0.5,
                                            '& .MuiMenuItem-root': {
                                                fontSize: '0.875rem',
                                                color: isDark ? '#FFFFFF' : '#1E293B',
                                                '&:hover': { bgcolor: isDark ? '#374151' : '#F1F5F9' },
                                                '&.Mui-selected': { bgcolor: 'rgba(23,138,131,0.12)' },
                                            },
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="video">Video</MenuItem>
                                <MenuItem value="text">Text / Article</MenuItem>
                                <MenuItem value="document">File Attachment</MenuItem>
                            </Select>
                        </Box>

                        {(lessonType === 'video' || lessonType === 'document') && (
                            <Box
                                sx={{
                                    border: `2px dashed ${isDark ? '#374151' : '#CBD5E1'}`,
                                    p: 2.5, borderRadius: 1.5, textAlign: 'center',
                                    bgcolor: isDark ? 'rgba(23,138,131,0.04)' : '#F8FAFC',
                                    '&:hover': { borderColor: '#178A83' },
                                    transition: 'border-color 0.15s',
                                }}
                            >
                                <input
                                    type="file"
                                    id="lesson-file-upload"
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) { setLessonFile(file); setLessonFileName(file.name); }
                                    }}
                                />
                                <label htmlFor="lesson-file-upload">
                                    <Stack spacing={0.5} alignItems="center">
                                        <CloudUpload sx={{ fontSize: 28, color: '#178A83' }} />
                                        <Button component="span" sx={{ color: '#178A83', textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                                            {lessonFileName || 'Choose file to upload'}
                                        </Button>
                                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                                            {lessonType === 'video' ? 'MP4, MOV, WebM' : 'PDF, DOCX, ZIP'}
                                        </Typography>
                                    </Stack>
                                </label>
                            </Box>
                        )}

                        {lessonType === 'text' && (
                            <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.75 }}>Content</Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    placeholder="Write the lesson content here…"
                                    value={lessonContent}
                                    onChange={e => setLessonContent(e.target.value)}
                                    sx={inputSx}
                                />
                            </Box>
                        )}

                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.75 }}>
                                Duration <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}> (minutes)</Box>
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                placeholder="e.g. 15"
                                value={lessonDuration}
                                onChange={e => setLessonDuration(e.target.value)}
                                inputProps={{ min: 0 }}
                                sx={inputSx}
                            />
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, borderTop: `1px solid ${modalBorder}`, pt: 2, gap: 1 }}>
                    <Button onClick={() => setLessonModalOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateLesson}
                        disabled={actionLoading || !lessonTitle.trim()}
                        sx={{ bgcolor: '#178A83', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#126E68' }, '&:disabled': { bgcolor: isDark ? '#374151' : '#CBD5E1', color: '#9CA3AF' } }}
                    >
                        {actionLoading ? 'Creating…' : 'Create Lesson'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Course Dialog */}
            <Dialog
                open={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { bgcolor: modalBg, border: `1px solid ${modalBorder}`, borderRadius: 2 } }}
            >
                <DialogTitle sx={{ borderBottom: `1px solid ${modalBorder}`, pb: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Reject Course</Typography>
                        <IconButton onClick={() => setRejectModalOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
                            <Close fontSize="small" />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.75 }}>
                        Reason for rejection <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Explain why this course is being rejected…"
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        sx={inputSx}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, borderTop: `1px solid ${modalBorder}`, pt: 2, gap: 1 }}>
                    <Button onClick={() => setRejectModalOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleRejectCourse}
                        disabled={actionLoading || !rejectionReason.trim()}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        {actionLoading ? 'Rejecting…' : 'Reject Course'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminCourseDetail;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Box, Typography, Stack, Button, IconButton, Paper,
    TextField, Chip, Alert, Snackbar, CircularProgress,
    Radio, RadioGroup, FormControlLabel, Divider, Breadcrumbs,
    Tooltip,
} from '@mui/material';
import {
    ArrowBack, Add, Delete, Quiz, CheckCircle,
    RadioButtonUnchecked, NavigateNext, HelpOutline,
} from '@mui/icons-material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { adminCoursesService } from '../services/courseService';
import appTheme from '../../../styles/theme';

// ── helpers ────────────────────────────────────────────────────────────────

const EMPTY_OPTIONS = [
    { body: '', is_correct: true  },
    { body: '', is_correct: false },
    { body: '', is_correct: false },
    { body: '', is_correct: false },
];

// ── component ──────────────────────────────────────────────────────────────

const AdminCbtQuestionsPage = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const muiTheme = useMuiTheme();
    const isDark = muiTheme.palette.mode === 'dark';

    const cardBg    = isDark ? '#1A2230' : '#F8FAFC';
    const border    = isDark ? '#374151' : '#E2E8F0';
    const inputBg   = isDark ? '#1E293B' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#1E293B';
    const mutedText = isDark ? '#9CA3AF' : '#6B7280';
    const labelCol  = isDark ? '#E5E7EB' : '#374151';

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            bgcolor: inputBg, borderRadius: 1.5,
            '& fieldset': { borderColor: border },
            '&:hover fieldset': { borderColor: isDark ? '#4B5563' : '#94A3B8' },
            '&.Mui-focused fieldset': { borderColor: appTheme.colors.brand },
        },
        '& .MuiInputBase-input': {
            fontSize: '0.875rem', color: textColor,
            '&::placeholder': { color: mutedText, opacity: 1 },
        },
    };

    // ── state ──
    const [lesson, setLesson]           = useState(null);
    const [versionId, setVersionId]     = useState(null);
    const [questions, setQuestions]     = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [saving, setSaving]           = useState(false);
    const [error, setError]             = useState('');
    const [snackbar, setSnackbar]       = useState({ open: false, message: '', severity: 'success' });

    // new-question form
    const [prompt, setPrompt]     = useState('');
    const [points, setPoints]     = useState(1);
    const [options, setOptions]   = useState(EMPTY_OPTIONS);

    // ── data loading ──
    const load = useCallback(async () => {
        setPageLoading(true);
        setError('');
        try {
            const detail = await adminCoursesService.getLesson(lessonId);
            setLesson(detail);

            const vid =
                detail?.current_version_id ??
                detail?.version_id ??
                detail?.current_version?.id ??
                null;
            setVersionId(vid);

            if (vid) {
                const res = await adminCoursesService.listCbtQuestions(vid);
                setQuestions(res.data || []);
            }
        } catch (e) {
            setError(e?.message || 'Failed to load lesson data.');
        } finally {
            setPageLoading(false);
        }
    }, [lessonId]);

    useEffect(() => { load(); }, [load]);

    // ── option handlers ──
    const setCorrect = (idx) =>
        setOptions(prev => prev.map((o, i) => ({ ...o, is_correct: i === idx })));

    const setOptionBody = (idx, val) =>
        setOptions(prev => prev.map((o, i) => i === idx ? { ...o, body: val } : o));

    const resetForm = () => {
        setPrompt('');
        setPoints(1);
        setOptions(EMPTY_OPTIONS);
    };

    // ── submit ──
    const handleAddQuestion = async () => {
        if (!versionId) return;
        if (!prompt.trim()) { setError('Enter the question prompt.'); return; }
        if (options.some(o => !o.body.trim())) { setError('Fill in all four answer options.'); return; }

        setSaving(true);
        setError('');
        try {
            await adminCoursesService.addCbtQuestion(versionId, {
                prompt: prompt.trim(),
                points: Number(points) || 1,
                options,
            });
            const res = await adminCoursesService.listCbtQuestions(versionId);
            setQuestions(res.data || []);
            resetForm();
            setSnackbar({ open: true, message: 'Question added.', severity: 'success' });
        } catch (e) {
            setError(e?.message || 'Failed to add question.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (questionId) => {
        try {
            await adminCoursesService.deleteCbtQuestion(questionId);
            setQuestions(prev => prev.filter(q => q.id !== questionId));
            setSnackbar({ open: true, message: 'Question deleted.', severity: 'success' });
        } catch (e) {
            setSnackbar({ open: true, message: e?.message || 'Delete failed.', severity: 'error' });
        }
    };

    // ── render ──
    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>

            {/* Breadcrumb */}
            <Breadcrumbs
                separator={<NavigateNext sx={{ fontSize: 16, color: mutedText }} />}
                sx={{ mb: 3 }}
            >
                <Typography
                    component={Link}
                    to="/admin/content/courses"
                    sx={{ fontSize: '0.875rem', color: mutedText, textDecoration: 'none', '&:hover': { color: '#fff' } }}
                >
                    Courses
                </Typography>
                <Typography
                    component={Link}
                    to={`/admin/content/courses/${courseId}`}
                    sx={{ fontSize: '0.875rem', color: mutedText, textDecoration: 'none', '&:hover': { color: '#fff' } }}
                >
                    Course Detail
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#fff' }}>
                    {lesson?.title || 'Quiz Questions'}
                </Typography>
            </Breadcrumbs>

            {/* Page header */}
            <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
                <IconButton
                    onClick={() => navigate(`/admin/content/courses/${courseId}`)}
                    sx={{ color: mutedText, '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.07)' }, mt: 0.5 }}
                >
                    <ArrowBack />
                </IconButton>
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Quiz sx={{ color: '#A78BFA', fontSize: 28 }} />
                        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                            Quiz Question Bank
                        </Typography>
                    </Stack>
                    <Typography sx={{ color: mutedText, fontSize: '0.9rem', mt: 0.5, ml: 5 }}>
                        {lesson?.title || '—'}
                    </Typography>
                </Box>
            </Stack>

            {pageLoading ? (
                <Stack alignItems="center" sx={{ py: 10 }}>
                    <CircularProgress sx={{ color: '#A78BFA' }} />
                    <Typography sx={{ color: mutedText, mt: 2 }}>Loading…</Typography>
                </Stack>
            ) : !versionId ? (
                <Paper sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: 2, p: 6, textAlign: 'center' }}>
                    <HelpOutline sx={{ fontSize: 52, color: '#374151', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: mutedText, fontWeight: 600, mb: 1 }}>
                        No Active Version
                    </Typography>
                    <Typography sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                        Publish this lesson first to enable its question bank.
                    </Typography>
                    <Button
                        sx={{ mt: 3, textTransform: 'none', color: appTheme.colors.brand }}
                        onClick={() => navigate(`/admin/content/courses/${courseId}`)}
                    >
                        ← Back to Course
                    </Button>
                </Paper>
            ) : (
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">

                    {/* ── LEFT: existing questions ─────────────────────────── */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography sx={{ color: labelCol, fontWeight: 600, fontSize: '0.9rem' }}>
                                Questions
                                <Chip
                                    label={questions.length}
                                    size="small"
                                    sx={{ ml: 1, bgcolor: 'rgba(167,139,250,0.12)', color: '#A78BFA', fontSize: '0.72rem' }}
                                />
                            </Typography>
                        </Stack>

                        {questions.length === 0 ? (
                            <Paper sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: 2, p: 5, textAlign: 'center' }}>
                                <Quiz sx={{ fontSize: 40, color: '#374151', mb: 1.5 }} />
                                <Typography sx={{ color: mutedText, fontSize: '0.875rem' }}>
                                    No questions yet. Add your first one →
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={2}>
                                {questions.map((q, idx) => (
                                    <Paper
                                        key={q.id}
                                        sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: 2, p: 3 }}
                                    >
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box sx={{ flex: 1, mr: 2 }}>
                                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                                                    <Chip
                                                        label={`Q${idx + 1}`}
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(167,139,250,0.12)', color: '#A78BFA', fontSize: '0.72rem', fontWeight: 700 }}
                                                    />
                                                    <Chip
                                                        label={`${q.points ?? 1} pt${(q.points ?? 1) !== 1 ? 's' : ''}`}
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(23,138,131,0.1)', color: appTheme.colors.brand, fontSize: '0.72rem' }}
                                                    />
                                                </Stack>

                                                <Typography sx={{ color: textColor, fontWeight: 600, fontSize: '0.9rem', mb: 1.5, lineHeight: 1.5 }}>
                                                    {q.prompt || q.question_text}
                                                </Typography>

                                                <Stack spacing={0.75}>
                                                    {(q.options || []).map((opt, oi) => (
                                                        <Stack key={oi} direction="row" alignItems="center" spacing={1}>
                                                            {opt.is_correct
                                                                ? <CheckCircle sx={{ color: '#22C55E', fontSize: 16, flexShrink: 0 }} />
                                                                : <RadioButtonUnchecked sx={{ color: border, fontSize: 16, flexShrink: 0 }} />
                                                            }
                                                            <Typography
                                                                sx={{
                                                                    fontSize: '0.85rem',
                                                                    color: opt.is_correct ? '#22C55E' : mutedText,
                                                                    fontWeight: opt.is_correct ? 600 : 400,
                                                                }}
                                                            >
                                                                {opt.body}
                                                            </Typography>
                                                        </Stack>
                                                    ))}
                                                </Stack>
                                            </Box>

                                            <Tooltip title="Delete question">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(q.id)}
                                                    sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' }, flexShrink: 0 }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </Box>

                    {/* ── RIGHT: add question form ─────────────────────────── */}
                    <Box sx={{ width: { xs: '100%', lg: 420 }, flexShrink: 0 }}>
                        <Paper
                            sx={{
                                bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: 2, p: 3,
                                position: { lg: 'sticky' }, top: { lg: 24 },
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                <Add sx={{ color: appTheme.colors.brand, fontSize: 20 }} />
                                <Typography sx={{ fontWeight: 700, color: textColor, fontSize: '0.95rem' }}>
                                    Add Question
                                </Typography>
                            </Stack>

                            {error && (
                                <Alert
                                    severity="error"
                                    sx={{ mb: 2, bgcolor: 'rgba(239,68,68,0.08)', color: '#FCA5A5', '& .MuiAlert-icon': { color: '#EF4444' } }}
                                    onClose={() => setError('')}
                                >
                                    {error}
                                </Alert>
                            )}

                            <Stack spacing={2.5}>
                                {/* Prompt */}
                                <Box>
                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: labelCol, mb: 0.75 }}>
                                        Question Prompt <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                                    </Typography>
                                    <TextField
                                        fullWidth multiline rows={3}
                                        placeholder="e.g. What is the primary purpose of corporate governance?"
                                        value={prompt}
                                        onChange={e => setPrompt(e.target.value)}
                                        sx={inputSx}
                                    />
                                </Box>

                                {/* Points */}
                                <Box>
                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: labelCol, mb: 0.75 }}>
                                        Points
                                    </Typography>
                                    <TextField
                                        type="number"
                                        value={points}
                                        onChange={e => setPoints(Math.max(1, Number(e.target.value)))}
                                        inputProps={{ min: 1 }}
                                        sx={{ ...inputSx, maxWidth: 100 }}
                                    />
                                </Box>

                                <Divider sx={{ borderColor: border }} />

                                {/* Options */}
                                <Box>
                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: labelCol, mb: 0.5 }}>
                                        Answer Options
                                        <Box component="span" sx={{ color: mutedText, fontWeight: 400 }}> — click radio to mark correct</Box>
                                    </Typography>
                                    <RadioGroup
                                        value={options.findIndex(o => o.is_correct)}
                                        onChange={e => setCorrect(Number(e.target.value))}
                                    >
                                        <Stack spacing={1.25}>
                                            {options.map((opt, idx) => (
                                                <Stack key={idx} direction="row" alignItems="center" spacing={1}>
                                                    <FormControlLabel
                                                        value={idx}
                                                        control={
                                                            <Radio
                                                                size="small"
                                                                sx={{
                                                                    color: border,
                                                                    '&.Mui-checked': { color: '#22C55E' },
                                                                    p: '6px',
                                                                }}
                                                            />
                                                        }
                                                        label=""
                                                        sx={{ m: 0, flexShrink: 0 }}
                                                    />
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        placeholder={`Option ${idx + 1}`}
                                                        value={opt.body}
                                                        onChange={e => setOptionBody(idx, e.target.value)}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                bgcolor: opt.is_correct
                                                                    ? 'rgba(34,197,94,0.06)'
                                                                    : inputBg,
                                                                borderRadius: 1.5,
                                                                '& fieldset': {
                                                                    borderColor: opt.is_correct
                                                                        ? 'rgba(34,197,94,0.4)'
                                                                        : border,
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: opt.is_correct ? '#22C55E' : (isDark ? '#4B5563' : '#94A3B8'),
                                                                },
                                                                '&.Mui-focused fieldset': {
                                                                    borderColor: opt.is_correct ? '#22C55E' : appTheme.colors.brand,
                                                                },
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '0.85rem',
                                                                color: opt.is_correct ? '#22C55E' : textColor,
                                                                py: 1,
                                                                '&::placeholder': { color: mutedText, opacity: 1 },
                                                            },
                                                        }}
                                                    />
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </RadioGroup>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    disabled={saving || !prompt.trim()}
                                    onClick={handleAddQuestion}
                                    startIcon={<Add />}
                                    sx={{
                                        bgcolor: '#A78BFA',
                                        color: '#fff',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 1.25,
                                        borderRadius: 1.5,
                                        boxShadow: 'none',
                                        '&:hover': { bgcolor: '#7C3AED', boxShadow: 'none' },
                                        '&:disabled': { bgcolor: isDark ? '#374151' : '#CBD5E1', color: mutedText },
                                    }}
                                >
                                    {saving ? 'Saving…' : 'Add Question'}
                                </Button>
                            </Stack>
                        </Paper>
                    </Box>
                </Stack>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3500}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminCbtQuestionsPage;

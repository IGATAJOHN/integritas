import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import {
    Box, Typography, Stack, Button, IconButton, Paper,
    TextField, Chip, CircularProgress, Alert, Snackbar,
    Divider, Radio, RadioGroup, FormControlLabel, Breadcrumbs,
    Tooltip,
} from '@mui/material';
import {
    ArrowBack, Delete, Add, Quiz, CheckCircle,
    RadioButtonUnchecked, RadioButtonChecked, NavigateNext,
    LightbulbOutlined,
} from '@mui/icons-material';
import { adminCoursesService } from '../services/courseService';
import appTheme from '../../../styles/theme';

const AdminCBTPage = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const muiTheme = useMuiTheme();
    const isDark = muiTheme.palette.mode === 'dark';

    const bg        = isDark ? '#0C1322' : '#F8FAFC';
    const cardBg    = isDark ? '#1A2230' : '#FFFFFF';
    const border    = isDark ? '#374151' : '#E2E8F0';
    const labelColor = isDark ? '#E5E7EB' : '#374151';
    const mutedColor = isDark ? '#9CA3AF' : '#6B7280';

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            bgcolor: isDark ? '#1E293B' : '#F1F5F9',
            borderRadius: 1.5,
            '& fieldset': { borderColor: border },
            '&:hover fieldset': { borderColor: isDark ? '#4B5563' : '#94A3B8' },
            '&.Mui-focused fieldset': { borderColor: appTheme.colors.brand },
        },
        '& .MuiInputBase-input': {
            fontSize: '0.875rem',
            color: isDark ? '#FFFFFF' : '#1E293B',
            '&::placeholder': { color: '#9CA3AF', opacity: 1 },
        },
    };

    // Data
    const [lesson, setLesson]           = useState(null);
    const [versionId, setVersionId]     = useState(null);
    const [questions, setQuestions]     = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');

    // New question form
    const [prompt, setPrompt]   = useState('');
    const [points, setPoints]   = useState(1);
    const [options, setOptions] = useState([
        { body: '', is_correct: true },
        { body: '', is_correct: false },
        { body: '', is_correct: false },
        { body: '', is_correct: false },
    ]);
    const [saving, setSaving] = useState(false);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const showSnack = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

    const resetForm = () => {
        setPrompt('');
        setPoints(1);
        setOptions([
            { body: '', is_correct: true },
            { body: '', is_correct: false },
            { body: '', is_correct: false },
            { body: '', is_correct: false },
        ]);
    };

    const loadPage = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const detail = await adminCoursesService.getLesson(lessonId);
            setLesson(detail);
            const vid = detail?.id ?? null;
            setVersionId(vid);
            if (vid) {
                const res = await adminCoursesService.listCbtQuestions(vid);
                setQuestions(res.data || []);
            }
        } catch (e) {
            setError(e?.message || 'Failed to load lesson questions.');
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => { loadPage(); }, [loadPage]);

    const handleOptionChange = (idx, field, value) => {
        setOptions(prev => prev.map((opt, i) => {
            if (field === 'is_correct') return { ...opt, is_correct: i === idx };
            return i === idx ? { ...opt, body: value } : opt;
        }));
    };

    const handleAddQuestion = async () => {
        if (!versionId) { showSnack('Lesson has no published version yet.', 'error'); return; }
        if (!prompt.trim()) { showSnack('Enter the question prompt.', 'error'); return; }
        if (options.some(o => !o.body.trim())) { showSnack('Fill in all four answer options.', 'error'); return; }
        setSaving(true);
        try {
            await adminCoursesService.addCbtQuestion(versionId, {
                prompt: prompt.trim(),
                points: Number(points) || 1,
                options,
            });
            const res = await adminCoursesService.listCbtQuestions(versionId);
            setQuestions(res.data || []);
            resetForm();
            showSnack('Question added');
        } catch (e) {
            showSnack(e?.message || 'Failed to add question.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (questionId) => {
        try {
            await adminCoursesService.deleteCbtQuestion(questionId);
            setQuestions(prev => prev.filter(q => q.id !== questionId));
            showSnack('Question removed');
        } catch (e) {
            showSnack(e?.message || 'Failed to delete question.', 'error');
        }
    };

    const lessonTitle = lesson?.title || 'Lesson';

    return (
        <Box sx={{ bgcolor: bg, minHeight: 'calc(100vh - 70px)', p: { xs: 2, md: 4 } }}>
            {/* Breadcrumb */}
            <Breadcrumbs
                separator={<NavigateNext fontSize="small" sx={{ color: mutedColor }} />}
                sx={{ mb: 3 }}
            >
                <Link
                    to="/admin/content/courses"
                    style={{ color: mutedColor, textDecoration: 'none', fontSize: '0.875rem' }}
                >
                    Courses
                </Link>
                <Link
                    to={`/admin/content/courses/${courseId}`}
                    style={{ color: mutedColor, textDecoration: 'none', fontSize: '0.875rem' }}
                >
                    Course Detail
                </Link>
                <Typography sx={{ color: appTheme.colors.brand, fontSize: '0.875rem', fontWeight: 600 }}>
                    Quiz Questions
                </Typography>
            </Breadcrumbs>

            {/* Header */}
            <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
                <IconButton
                    onClick={() => navigate(`/admin/content/courses/${courseId}`)}
                    sx={{
                        color: mutedColor, mt: 0.25,
                        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
                    }}
                >
                    <ArrowBack />
                </IconButton>
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                        <Quiz sx={{ color: '#A78BFA', fontSize: 28 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.4rem', md: '1.75rem' } }}>
                            Quiz Questions
                        </Typography>
                        <Chip
                            label={`${questions.length} question${questions.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(167,139,250,0.12)', color: '#A78BFA', fontWeight: 600 }}
                        />
                    </Stack>
                    <Typography sx={{ color: mutedColor, fontSize: '0.875rem' }}>
                        {lessonTitle}
                    </Typography>
                </Box>
            </Stack>

            {loading ? (
                <Stack alignItems="center" sx={{ py: 10 }}>
                    <CircularProgress sx={{ color: '#A78BFA' }} />
                    <Typography sx={{ color: mutedColor, mt: 2 }}>Loading questions…</Typography>
                </Stack>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            ) : !versionId ? (
                <Paper sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: 2, p: 4, textAlign: 'center' }}>
                    <LightbulbOutlined sx={{ fontSize: 48, color: '#FBBF24', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Lesson not published yet
                    </Typography>
                    <Typography sx={{ color: mutedColor, fontSize: '0.875rem', maxWidth: 420, mx: 'auto' }}>
                        Publish the lesson first to create its question bank.
                        Go back to the course detail and toggle the lesson's publish switch.
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(`/admin/content/courses/${courseId}`)}
                        sx={{ mt: 3, textTransform: 'none', borderColor: border, color: mutedColor }}
                    >
                        Back to Course
                    </Button>
                </Paper>
            ) : (
                <Stack spacing={4}>
                    {/* Existing questions */}
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>
                            Question Bank
                        </Typography>

                        {questions.length === 0 ? (
                            <Paper sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: 2, p: 5, textAlign: 'center' }}>
                                <Quiz sx={{ fontSize: 44, color: border, mb: 2 }} />
                                <Typography sx={{ color: mutedColor, fontSize: '0.875rem' }}>
                                    No questions yet. Add your first one below.
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={2}>
                                {questions.map((q, idx) => (
                                    <Paper
                                        key={q.id}
                                        sx={{
                                            bgcolor: cardBg,
                                            border: `1px solid ${border}`,
                                            borderRadius: 2,
                                            p: 3,
                                            transition: 'border-color 0.15s',
                                            '&:hover': { borderColor: isDark ? '#4B5563' : '#94A3B8' },
                                        }}
                                    >
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box sx={{ flex: 1, mr: 2 }}>
                                                {/* Question prompt */}
                                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                                    <Box
                                                        sx={{
                                                            width: 28, height: 28, borderRadius: '50%',
                                                            bgcolor: 'rgba(167,139,250,0.15)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#A78BFA' }}>
                                                            {idx + 1}
                                                        </Typography>
                                                    </Box>
                                                    <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', flex: 1 }}>
                                                        {q.prompt || q.question_text}
                                                    </Typography>
                                                    <Chip
                                                        label={`${q.points ?? 1} pt${(q.points ?? 1) !== 1 ? 's' : ''}`}
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(167,139,250,0.1)', color: '#A78BFA', fontSize: '0.72rem', fontWeight: 600, flexShrink: 0 }}
                                                    />
                                                </Stack>

                                                {/* Options */}
                                                <Stack spacing={1} sx={{ pl: 1 }}>
                                                    {(q.options || []).map((opt, oi) => (
                                                        <Stack key={oi} direction="row" alignItems="center" spacing={1.5}>
                                                            {opt.is_correct
                                                                ? <CheckCircle sx={{ color: '#22C55E', fontSize: 18, flexShrink: 0 }} />
                                                                : <RadioButtonUnchecked sx={{ color: border, fontSize: 18, flexShrink: 0 }} />}
                                                            <Typography
                                                                sx={{
                                                                    fontSize: '0.875rem',
                                                                    color: opt.is_correct ? '#22C55E' : mutedColor,
                                                                    fontWeight: opt.is_correct ? 600 : 400,
                                                                }}
                                                            >
                                                                {opt.body}
                                                            </Typography>
                                                            {opt.is_correct && (
                                                                <Chip label="Correct" size="small" sx={{ bgcolor: 'rgba(34,197,94,0.1)', color: '#22C55E', fontSize: '0.7rem', height: 20 }} />
                                                            )}
                                                        </Stack>
                                                    ))}
                                                </Stack>
                                            </Box>

                                            {/* Delete */}
                                            <Tooltip title="Remove question">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(q.id)}
                                                    sx={{
                                                        color: '#EF4444',
                                                        bgcolor: 'rgba(239,68,68,0.06)',
                                                        '&:hover': { bgcolor: 'rgba(239,68,68,0.14)' },
                                                        mt: '-2px',
                                                    }}
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

                    <Divider sx={{ borderColor: border }} />

                    {/* Add question form */}
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                            <Add sx={{ color: appTheme.colors.brand }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                Add New Question
                            </Typography>
                        </Stack>

                        <Paper sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: 2, p: 3 }}>
                            <Stack spacing={3}>
                                {/* Prompt */}
                                <Box>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.75 }}>
                                        Question Prompt <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="e.g. What is the primary role of a board of directors?"
                                        value={prompt}
                                        onChange={e => setPrompt(e.target.value)}
                                        sx={inputSx}
                                    />
                                </Box>

                                {/* Points */}
                                <Box sx={{ maxWidth: 140 }}>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.75 }}>
                                        Points
                                    </Typography>
                                    <TextField
                                        type="number"
                                        value={points}
                                        onChange={e => setPoints(Math.max(1, Number(e.target.value)))}
                                        inputProps={{ min: 1 }}
                                        size="small"
                                        sx={inputSx}
                                    />
                                </Box>

                                {/* Options */}
                                <Box>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.5 }}>
                                        Answer Options
                                        <Box component="span" sx={{ color: mutedColor, fontWeight: 400 }}>
                                            {' '}— click the radio button to mark the correct answer
                                        </Box>
                                    </Typography>

                                    <RadioGroup
                                        value={options.findIndex(o => o.is_correct)}
                                        onChange={e => handleOptionChange(Number(e.target.value), 'is_correct', true)}
                                    >
                                        <Stack spacing={1.5} sx={{ mt: 1 }}>
                                            {options.map((opt, idx) => (
                                                <Stack key={idx} direction="row" alignItems="center" spacing={1.5}>
                                                    <FormControlLabel
                                                        value={idx}
                                                        control={
                                                            <Radio
                                                                size="small"
                                                                checkedIcon={<RadioButtonChecked />}
                                                                icon={<RadioButtonUnchecked />}
                                                                sx={{
                                                                    color: border,
                                                                    '&.Mui-checked': { color: '#22C55E' },
                                                                    p: 0.5,
                                                                }}
                                                            />
                                                        }
                                                        label=""
                                                        sx={{ m: 0 }}
                                                    />
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                                        value={opt.body}
                                                        onChange={e => handleOptionChange(idx, 'body', e.target.value)}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                bgcolor: opt.is_correct
                                                                    ? (isDark ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.04)')
                                                                    : (isDark ? '#1E293B' : '#F1F5F9'),
                                                                borderRadius: 1.5,
                                                                '& fieldset': {
                                                                    borderColor: opt.is_correct ? 'rgba(34,197,94,0.45)' : border,
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: opt.is_correct ? '#22C55E' : (isDark ? '#4B5563' : '#94A3B8'),
                                                                },
                                                                '&.Mui-focused fieldset': {
                                                                    borderColor: opt.is_correct ? '#22C55E' : appTheme.colors.brand,
                                                                },
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '0.875rem',
                                                                color: isDark ? '#FFFFFF' : '#1E293B',
                                                                py: 1,
                                                            },
                                                        }}
                                                    />
                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            color: opt.is_correct ? '#22C55E' : 'transparent',
                                                            width: 52,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        Correct
                                                    </Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </RadioGroup>
                                </Box>

                                {/* Submit */}
                                <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                                    <Button
                                        onClick={resetForm}
                                        sx={{ textTransform: 'none', color: mutedColor, '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' } }}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleAddQuestion}
                                        disabled={saving || !prompt.trim() || options.some(o => !o.body.trim())}
                                        startIcon={saving ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <Add />}
                                        sx={{
                                            bgcolor: '#A78BFA',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            '&:hover': { bgcolor: '#7C3AED' },
                                            '&:disabled': { bgcolor: isDark ? '#374151' : '#E2E8F0', color: mutedColor },
                                        }}
                                    >
                                        {saving ? 'Saving…' : 'Add Question'}
                                    </Button>
                                </Stack>
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
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminCBTPage;

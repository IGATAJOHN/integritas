import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Breadcrumbs,
    Button,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Radio,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    Add,
    ArrowBack,
    CheckCircle,
    Delete,
    HelpOutline,
    MoreVert,
    NavigateNext,
    Quiz,
    RadioButtonUnchecked,
} from '@mui/icons-material';
import { adminCoursesService } from '../services/courseService';
import {
    paperStyle,
    primaryButtonStyle,
    textFieldStyle,
} from '../../../styles/formStyles';
import appTheme from '../../../styles/theme';

const EMPTY_OPTIONS = [
    { body: '', is_correct: true },
    { body: '', is_correct: false },
    { body: '', is_correct: false },
    { body: '', is_correct: false },
];

const getVersionId = (lesson) => (
    lesson?.id ||
    null
);

const getErrorMessage = (error, fallback) => error?.data?.message || error?.message || fallback;

const optionInputSx = (selected) => ({
    ...textFieldStyle,
    '& .MuiOutlinedInput-root': {
        ...textFieldStyle['& .MuiOutlinedInput-root'],
        bgcolor: selected ? 'rgba(16,185,129,0.08)' : '#1E293B',
        '& fieldset': {
            borderColor: selected ? 'rgba(52,211,153,0.55)' : '#374151',
        },
        '&:hover fieldset': {
            borderColor: selected ? '#34D399' : '#4B5563',
        },
        '&.Mui-focused fieldset': {
            borderColor: selected ? '#34D399' : appTheme.colors.brand,
        },
    },
});

const actionMenuPaperSx = {
    bgcolor: '#111827',
    color: '#E5E7EB',
    border: '1px solid #374151',
    minWidth: 180,
    '& .MuiMenuItem-root': {
        fontSize: '0.875rem',
        gap: 1,
        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
    },
};

const QuestionActionsMenu = ({ question, disabled, onDelete }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const closeMenu = () => setAnchorEl(null);

    return (
        <>
            <IconButton
                size="small"
                aria-label={`Actions for question ${question.id}`}
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
                onClose={closeMenu}
                PaperProps={{ sx: actionMenuPaperSx }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => { closeMenu(); onDelete(question.id); }}>
                    <ListItemIcon sx={{ color: '#FCA5A5', minWidth: 30 }}><Delete fontSize="small" /></ListItemIcon>
                    <ListItemText>Delete Question</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};

const AdminCbtQuestionsPage = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [versionId, setVersionId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [points, setPoints] = useState(1);
    const [options, setOptions] = useState(EMPTY_OPTIONS);
    const [pageLoading, setPageLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const resetForm = () => {
        setPrompt('');
        setPoints(1);
        setOptions(EMPTY_OPTIONS);
    };

    const load = useCallback(async () => {
        setPageLoading(true);
        setError('');
        try {
            const detail = await adminCoursesService.getLesson(lessonId);
            const vid = getVersionId(detail);
            setLesson(detail);
            setVersionId(vid);

            if (vid) {
                const res = await adminCoursesService.listCbtQuestions(vid);
                setQuestions(res.data || []);
            } else {
                setQuestions([]);
            }
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load lesson question bank.'));
        } finally {
            setPageLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        load();
    }, [load]);

    const setCorrect = (index) => {
        setOptions((prev) => prev.map((option, optionIndex) => ({
            ...option,
            is_correct: optionIndex === index,
        })));
    };

    const setOptionBody = (index, value) => {
        setOptions((prev) => prev.map((option, optionIndex) => (
            optionIndex === index ? { ...option, body: value } : option
        )));
    };

    const addQuestion = async () => {
        if (!versionId) {
            showMessage('Publish this lesson first to create its question bank.', 'error');
            return;
        }
        if (!prompt.trim()) {
            showMessage('Enter the question prompt.', 'error');
            return;
        }
        if (options.some((option) => !option.body.trim())) {
            showMessage('Fill in every answer option.', 'error');
            return;
        }

        setSaving(true);
        try {
            await adminCoursesService.addCbtQuestion(versionId, {
                prompt: prompt.trim(),
                points: Number(points) || 1,
                options,
            });
            resetForm();
            const res = await adminCoursesService.listCbtQuestions(versionId);
            setQuestions(res.data || []);
            showMessage('Question added.');
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to add question.'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const deleteQuestion = async (questionId) => {
        setSaving(true);
        try {
            await adminCoursesService.deleteCbtQuestion(questionId);
            setQuestions((prev) => prev.filter((question) => question.id !== questionId));
            showMessage('Question deleted.');
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to delete question.'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCsvUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setSaving(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            let successCount = 0;
            let failCount = 0;

            for (let line of lines) {
                if (!line.trim()) continue;
                
                // Parse CSV line considering basic quoting
                const parts = [];
                let current = '';
                let inQuotes = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        parts.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                parts.push(current.trim());

                if (parts.length < 7) continue;

                const csvPrompt = parts[0].replace(/^"|"$/g, '').trim();
                const csvPoints = Number(parts[1]) || 1;
                const opt1 = parts[2].replace(/^"|"$/g, '').trim();
                const opt2 = parts[3].replace(/^"|"$/g, '').trim();
                const opt3 = parts[4].replace(/^"|"$/g, '').trim();
                const opt4 = parts[5].replace(/^"|"$/g, '').trim();
                const correctIdx = Number(parts[6]) || 0;

                if (!csvPrompt) continue;

                const csvOptions = [
                    { body: opt1, is_correct: correctIdx === 0 },
                    { body: opt2, is_correct: correctIdx === 1 },
                    { body: opt3, is_correct: correctIdx === 2 },
                    { body: opt4, is_correct: correctIdx === 3 },
                ];

                try {
                    await adminCoursesService.addCbtQuestion(versionId, {
                        prompt: csvPrompt,
                        points: csvPoints,
                        options: csvOptions,
                    });
                    successCount++;
                } catch (err) {
                    failCount++;
                }
            }

            try {
                const res = await adminCoursesService.listCbtQuestions(versionId);
                setQuestions(res.data || []);
                showMessage(`CSV Import complete. Added ${successCount} questions.${failCount > 0 ? ` Failed to add ${failCount} questions.` : ''}`);
            } catch (err) {
                showMessage('CSV imported but failed to reload question list.', 'error');
            } finally {
                setSaving(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Breadcrumbs separator={<NavigateNext sx={{ fontSize: 16, color: '#9CA3AF' }} />} sx={{ mb: 3 }}>
                <Typography component={Link} to="/admin/content/courses" sx={{ fontSize: '0.875rem', color: '#9CA3AF', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}>
                    Courses
                </Typography>
                <Typography component={Link} to={`/admin/content/courses/${courseId}`} sx={{ fontSize: '0.875rem', color: '#9CA3AF', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}>
                    Course Detail
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#FFFFFF' }}>
                    Quiz Question Bank
                </Typography>
            </Breadcrumbs>

            <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
                <IconButton
                    onClick={() => navigate(`/admin/content/courses/${courseId}`)}
                    sx={{ color: '#9CA3AF', '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.07)' }, mt: 0.5 }}
                >
                    <ArrowBack />
                </IconButton>
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Quiz sx={{ color: '#A78BFA', fontSize: 28 }} />
                        <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                            Quiz Question Bank
                        </Typography>
                        <Chip label={questions.length} sx={{ bgcolor: 'rgba(167,139,250,0.12)', color: '#C4B5FD', fontWeight: 700 }} />
                    </Stack>
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.9rem', mt: 0.5, ml: 5 }}>
                        {lesson?.title || 'Lesson'}
                    </Typography>
                </Box>
            </Stack>

            {pageLoading ? (
                <Stack alignItems="center" sx={{ py: 10 }}>
                    <CircularProgress sx={{ color: '#A78BFA' }} />
                    <Typography sx={{ color: '#9CA3AF', mt: 2 }}>Loading question bank...</Typography>
                </Stack>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            ) : !versionId ? (
                <Paper sx={{ ...paperStyle, p: 6, textAlign: 'center' }}>
                    <HelpOutline sx={{ fontSize: 52, color: '#6B7280', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 1 }}>
                        No Active Lesson Version
                    </Typography>
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                        Publish this lesson first to enable CBT question management.
                    </Typography>
                    <Button
                        sx={{ mt: 3, textTransform: 'none', color: appTheme.colors.brand }}
                        onClick={() => navigate(`/admin/content/courses/${courseId}`)}
                    >
                        Back to Course
                    </Button>
                </Paper>
            ) : (
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">
                    <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                            <Typography sx={{ color: '#E5E7EB', fontWeight: 700 }}>
                                Questions
                            </Typography>
                            <Chip
                                label={`${questions.length} total`}
                                size="small"
                                sx={{ bgcolor: 'rgba(167,139,250,0.12)', color: '#C4B5FD', fontWeight: 600 }}
                            />
                            <Box sx={{ flexGrow: 1 }} />
                            <Button
                                component="label"
                                variant="outlined"
                                size="small"
                                sx={{
                                    borderColor: 'rgba(167,139,250,0.4)',
                                    color: '#C4B5FD',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    '&:hover': {
                                        borderColor: '#A78BFA',
                                        bgcolor: 'rgba(167,139,250,0.06)'
                                    }
                                }}
                            >
                                Import CSV
                                <input
                                    type="file"
                                    accept=".csv"
                                    hidden
                                    onChange={handleCsvUpload}
                                />
                            </Button>
                        </Stack>

                        {questions.length === 0 ? (
                            <Paper sx={{ ...paperStyle, p: 5, textAlign: 'center' }}>
                                <Quiz sx={{ fontSize: 40, color: '#374151', mb: 1.5 }} />
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                                    No questions yet. Add your first one from the panel.
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={2}>
                                {questions.map((question, questionIndex) => (
                                    <Paper key={question.id} sx={{ ...paperStyle, p: 3 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                                                    <Chip
                                                        label={`Q${questionIndex + 1}`}
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(167,139,250,0.12)', color: '#C4B5FD', fontSize: '0.72rem', fontWeight: 700 }}
                                                    />
                                                    <Chip
                                                        label={`${question.points ?? 1} pt${(question.points ?? 1) !== 1 ? 's' : ''}`}
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(17,82,212,0.16)', color: '#93C5FD', fontSize: '0.72rem', fontWeight: 600 }}
                                                    />
                                                </Stack>
                                                <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', mb: 1.5, lineHeight: 1.5 }}>
                                                    {question.prompt || question.question_text}
                                                </Typography>
                                                <Stack spacing={0.75}>
                                                    {(question.options || []).map((option, optionIndex) => (
                                                        <Stack key={option.id || optionIndex} direction="row" alignItems="center" spacing={1}>
                                                            {option.is_correct ? (
                                                                <CheckCircle sx={{ color: '#34D399', fontSize: 17, flexShrink: 0 }} />
                                                            ) : (
                                                                <RadioButtonUnchecked sx={{ color: '#4B5563', fontSize: 17, flexShrink: 0 }} />
                                                            )}
                                                            <Typography
                                                                sx={{
                                                                    color: option.is_correct ? '#34D399' : '#D1D5DB',
                                                                    fontWeight: option.is_correct ? 600 : 400,
                                                                    fontSize: '0.875rem',
                                                                }}
                                                            >
                                                                {option.body || option.text}
                                                            </Typography>
                                                        </Stack>
                                                    ))}
                                                </Stack>
                                            </Box>
                                            <QuestionActionsMenu question={question} disabled={saving} onDelete={deleteQuestion} />
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </Box>

                    <Box sx={{ width: { xs: '100%', lg: 440 }, flexShrink: 0 }}>
                        <Paper sx={{ ...paperStyle, p: 3, position: { lg: 'sticky' }, top: { lg: 24 } }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                <Add sx={{ color: appTheme.colors.brand, fontSize: 20 }} />
                                <Typography sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>
                                    Add Question
                                </Typography>
                            </Stack>

                            <Stack spacing={2.25}>
                                <Box>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                        Question Prompt <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        placeholder="Enter the question learners should answer."
                                        value={prompt}
                                        onChange={(event) => setPrompt(event.target.value)}
                                        sx={textFieldStyle}
                                    />
                                </Box>

                                <Box>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                        Points
                                    </Typography>
                                    <TextField
                                        type="number"
                                        value={points}
                                        onChange={(event) => setPoints(Math.max(1, Number(event.target.value) || 1))}
                                        inputProps={{ min: 1 }}
                                        sx={{ ...textFieldStyle, maxWidth: 120 }}
                                    />
                                </Box>

                                <Divider sx={{ borderColor: '#374151' }} />

                                <Box>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 1 }}>
                                        Answer Options <Box component="span" sx={{ color: '#9CA3AF', fontWeight: 400 }}>- select the correct answer</Box>
                                    </Typography>
                                    <Stack spacing={1.25}>
                                        {options.map((option, index) => (
                                            <Stack
                                                key={index}
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                sx={{
                                                    border: '1px solid #374151',
                                                    borderRadius: 1.25,
                                                    p: 1,
                                                    bgcolor: option.is_correct ? 'rgba(16,185,129,0.08)' : 'rgba(17,24,39,0.72)',
                                                }}
                                            >
                                                <Radio
                                                    checked={option.is_correct}
                                                    onChange={() => setCorrect(index)}
                                                    sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#34D399' } }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    placeholder={`Option ${index + 1}`}
                                                    value={option.body}
                                                    onChange={(event) => setOptionBody(index, event.target.value)}
                                                    sx={optionInputSx(option.is_correct)}
                                                />
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Box>

                                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                    <Button
                                        onClick={resetForm}
                                        sx={{ textTransform: 'none', color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Add />}
                                        onClick={addQuestion}
                                        disabled={saving || !prompt.trim() || options.some((option) => !option.body.trim())}
                                        sx={{
                                            ...primaryButtonStyle,
                                            boxShadow: 'none',
                                            textTransform: 'none',
                                            '&:disabled': { bgcolor: '#374151', color: '#9CA3AF' },
                                        }}
                                    >
                                        {saving ? 'Saving...' : 'Add Question'}
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
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
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

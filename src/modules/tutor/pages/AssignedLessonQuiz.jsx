import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Radio,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { Add, ArrowBack, Delete, Quiz } from '@mui/icons-material';
import { tutorAssignmentService } from '../services';
import { paperStyle, primaryButtonStyle, textFieldStyle } from '../../../styles/formStyles';

const emptyOptions = [
    { body: '', is_correct: true },
    { body: '', is_correct: false },
    { body: '', is_correct: false },
    { body: '', is_correct: false },
];

const getVersionId = (lesson) => (
    lesson?.current_version_id ||
    lesson?.version_id ||
    lesson?.current_version?.id ||
    lesson?.published_version_id ||
    null
);

const getErrorMessage = (error, fallback) => error?.data?.message || error?.message || fallback;

const AssignedLessonQuiz = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [versionId, setVersionId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [points, setPoints] = useState(1);
    const [options, setOptions] = useState(emptyOptions);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const showMessage = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await tutorAssignmentService.getAssignedLesson(lessonId);
            const vid = getVersionId(data);
            setLesson(data);
            setVersionId(vid);
            if (vid) {
                const res = await tutorAssignmentService.listCbtQuestions(vid);
                setQuestions(res.data || []);
            } else {
                setQuestions([]);
            }
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load quiz.'));
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        load();
    }, [load]);

    const setCorrect = (index) => {
        setOptions((prev) => prev.map((option, optionIndex) => ({ ...option, is_correct: optionIndex === index })));
    };

    const setOptionBody = (index, value) => {
        setOptions((prev) => prev.map((option, optionIndex) => optionIndex === index ? { ...option, body: value } : option));
    };

    const resetForm = () => {
        setPrompt('');
        setPoints(1);
        setOptions(emptyOptions);
    };

    const addQuestion = async () => {
        if (!versionId) return;
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
            await tutorAssignmentService.addCbtQuestion(versionId, {
                prompt: prompt.trim(),
                points: Number(points) || 1,
                options,
            });
            resetForm();
            const res = await tutorAssignmentService.listCbtQuestions(versionId);
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
            await tutorAssignmentService.deleteCbtQuestion(questionId);
            setQuestions((prev) => prev.filter((question) => question.id !== questionId));
            showMessage('Question deleted.');
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to delete question.'), 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Stack alignItems="center" sx={{ py: 10 }}>
                <CircularProgress />
            </Stack>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                <IconButton onClick={() => navigate('/tutor/lessons')}><ArrowBack /></IconButton>
                <Quiz color="primary" />
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Manage Lesson Quiz</Typography>
                    <Typography color="text.secondary" variant="body2">{lesson?.title || 'Assigned lesson'}</Typography>
                </Box>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {!versionId && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    This lesson does not have an active version yet. Ask an admin to publish or promote the lesson before adding CBT questions.
                </Alert>
            )}

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">
                <Paper sx={{ ...paperStyle, p: 3, flex: 1, width: '100%' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 700 }}>Questions</Typography>
                        <Chip label={questions.length} />
                    </Stack>
                    <Stack spacing={2}>
                        {questions.length === 0 ? (
                            <Typography color="text.secondary">No questions yet.</Typography>
                        ) : questions.map((question, index) => (
                            <Paper key={question.id} sx={{ bgcolor: '#111827', border: '1px solid #374151', p: 2 }}>
                                <Stack direction="row" justifyContent="space-between" spacing={2}>
                                    <Box>
                                        <Typography sx={{ color: '#FFFFFF', fontWeight: 700 }}>Q{index + 1}. {question.prompt || question.question_text}</Typography>
                                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>{question.points ?? 1} point(s)</Typography>
                                    </Box>
                                    <IconButton disabled={saving} onClick={() => deleteQuestion(question.id)} sx={{ color: '#EF4444' }}>
                                        <Delete />
                                    </IconButton>
                                </Stack>
                                <Stack spacing={0.75} sx={{ mt: 1 }}>
                                    {(question.options || []).map((option, optionIndex) => (
                                        <Typography key={option.id || optionIndex} sx={{ color: option.is_correct ? '#34D399' : '#D1D5DB', fontSize: '0.88rem' }}>
                                            {option.is_correct ? 'Correct: ' : ''}{option.body || option.text}
                                        </Typography>
                                    ))}
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                </Paper>

                <Paper sx={{ ...paperStyle, p: 3, width: { xs: '100%', lg: 420 } }}>
                    <Typography sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>Add Question</Typography>
                    <Stack spacing={2.25}>
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                Question Prompt <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                            </Typography>
                            <TextField
                                placeholder="Enter the question learners should answer."
                                value={prompt}
                                onChange={(event) => setPrompt(event.target.value)}
                                multiline
                                minRows={3}
                                sx={textFieldStyle}
                                fullWidth
                                disabled={!versionId}
                            />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                Points
                            </Typography>
                            <TextField
                                type="number"
                                value={points}
                                onChange={(event) => setPoints(event.target.value)}
                                sx={textFieldStyle}
                                fullWidth
                                disabled={!versionId}
                                inputProps={{ min: 1 }}
                            />
                        </Box>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB' }}>
                            Answer Options <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                        </Typography>
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
                                    disabled={!versionId}
                                    sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#34D399' } }}
                                />
                                <TextField
                                    placeholder={`Option ${index + 1}`}
                                    value={option.body}
                                    onChange={(event) => setOptionBody(index, event.target.value)}
                                    sx={textFieldStyle}
                                    fullWidth
                                    disabled={!versionId}
                                />
                            </Stack>
                        ))}
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={addQuestion}
                            disabled={saving || !versionId}
                            sx={{ ...primaryButtonStyle, boxShadow: 'none', textTransform: 'none', '&:disabled': { bgcolor: '#374151', color: '#9CA3AF' } }}
                        >
                            {saving ? 'Saving...' : 'Add Question'}
                        </Button>
                    </Stack>
                </Paper>
            </Stack>

            <Snackbar open={snackbar.open} autoHideDuration={4500} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default AssignedLessonQuiz;

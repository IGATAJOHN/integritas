import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Stack,
    Paper,
    Chip,
    IconButton,
    CircularProgress,
    TextField,
    Select,
    MenuItem,
    Breadcrumbs,
    Link,
    Divider,
    Snackbar,
    Alert,
    Tooltip,
} from '@mui/material';
import {
    ArrowBack,
    Add,
    Edit,
    Delete,
    DragIndicator,
    Save,
    Close,
    School,
    CheckCircle,
    InfoOutlined,
} from '@mui/icons-material';
import { tutorQuestionService } from '../services/questionService';
import { tutorLessonService } from '../services/lessonService';
import { tutorCoursesService } from '../services/courseService';
import { textFieldStyle, selectStyle, selectMenuProps, paperStyle, primaryButtonStyle } from '../../../styles/formStyles';
import theme from '../../../styles/theme';


const AddQuestion = () => {
    const { courseId, moduleId, lessonId } = useParams();
    const navigate = useNavigate();

    // State
    const [course, setCourse] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Form State for individual question
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState('multiple_choice');
    const [questionOptions, setQuestionOptions] = useState(['', '', '']);
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
    const [questionExplanation, setQuestionExplanation] = useState('');
    const [questionPoints, setQuestionPoints] = useState(1);
    const [draggedQuestion, setDraggedQuestion] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [courseData, questionsResp] = await Promise.all([
                    tutorCoursesService.getCourseDetail(courseId),
                    tutorQuestionService.listQuestions(lessonId)
                ]);

                setCourse(courseData);
                setQuestions(questionsResp.data || []);

                // Find lesson title
                courseData.modules?.forEach(mod => {
                    if (mod.id.toString() === moduleId) {
                        const l = mod.lessons?.find(item => item.id.toString() === lessonId);
                        if (l) setLesson(l);
                    }
                });
            } catch (err) {
                console.error("Error fetching data:", err);
                setSnackbar({ open: true, message: 'Failed to load lesson data', severity: 'error' });
            } finally {
                setLoading(false);
            }
        };

        if (courseId && lessonId) {
            fetchData();
        }
    }, [courseId, moduleId, lessonId]);

    const handleBack = () => {
        navigate(`/tutor/courses/${courseId}`);
    };

    const resetForm = () => {
        setQuestionText('');
        setQuestionType('multiple_choice');
        setQuestionOptions(['', '', '']);
        setCorrectAnswerIndex(0);
        setQuestionExplanation('');
        setQuestionPoints(1);
        setEditingQuestionId(null);
    };

    const handleEditQuestion = (q) => {
        setEditingQuestionId(q.id);
        setQuestionText(q.question || q.prompt || '');
        setQuestionType(q.type || 'multiple_choice');
        setQuestionOptions(q.options || ['', '', '']);

        // Correct answer index from array
        if (Array.isArray(q.correct_answer) && q.correct_answer.length > 0) {
            setCorrectAnswerIndex(q.correct_answer[0]);
        } else {
            setCorrectAnswerIndex(0);
        }

        setQuestionExplanation(q.explanation || '');
        setQuestionPoints(q.points || 1);
    };

    const handleSaveQuestion = async () => {
        const trimmedQuestion = String(questionText).trim();
        if (!trimmedQuestion) {
            setSnackbar({ open: true, message: 'Question text is required', severity: 'error' });
            return;
        }

        if (questionType === 'multiple_choice' || questionType === 'true_false') {
            const validOptions = questionOptions.filter(opt => String(opt).trim());
            if (validOptions.length < 2) {
                setSnackbar({ open: true, message: 'At least 2 answer options are required', severity: 'error' });
                return;
            }
        }

        try {
            setActionLoading(true);
            const payload = {
                prompt: trimmedQuestion,
                question: trimmedQuestion,
                type: questionType,
                points: questionPoints,
                explanation: questionExplanation.trim(),
            };

            if (questionType === 'multiple_choice' || questionType === 'true_false') {
                const options = questionOptions
                    .map(o => String(o).trim())
                    .filter(Boolean);

                payload.options = options;
                payload.correct_answer = [correctAnswerIndex];
            }

            let saved;
            if (editingQuestionId) {
                saved = await tutorQuestionService.updateQuestion(editingQuestionId, payload);
                setQuestions(prev => prev.map(q => q.id === editingQuestionId ? saved : q));
                setSnackbar({ open: true, message: 'Question updated successfully', severity: 'success' });
            } else {
                payload.position = questions.length + 1;
                saved = await tutorQuestionService.createQuestion(lessonId, payload);
                setQuestions(prev => [...prev, saved]);
                setSnackbar({ open: true, message: 'Question added successfully', severity: 'success' });
            }

            resetForm();
        } catch (err) {
            console.error('Error saving question:', err);
            setSnackbar({ open: true, message: err?.data?.message || err.message || 'Failed to save question', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            setActionLoading(true);
            await tutorQuestionService.deleteQuestion(id);
            setQuestions(prev => prev.filter(q => q.id !== id));
            if (editingQuestionId === id) resetForm();
            setSnackbar({ open: true, message: 'Question deleted', severity: 'success' });
        } catch (err) {
            console.error('Error deleting question:', err);
            setSnackbar({ open: true, message: 'Failed to delete question', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    // Reorder Logic
    const handleDragStart = (e, id) => {
        setDraggedQuestion(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, targetId) => {
        e.preventDefault();
        if (draggedQuestion === targetId) {
            setDraggedQuestion(null);
            return;
        }

        const draggedIdx = questions.findIndex(q => q.id === draggedQuestion);
        const targetIdx = questions.findIndex(q => q.id === targetId);

        if (draggedIdx > -1 && targetIdx > -1) {
            const newQuestions = [...questions];
            const [draggedItem] = newQuestions.splice(draggedIdx, 1);
            newQuestions.splice(targetIdx, 0, draggedItem);

            setQuestions(newQuestions);
            try {
                const items = newQuestions.map((q, index) => ({
                    id: q.id,
                    position: index + 1
                }));
                await tutorQuestionService.reorderQuestions(lessonId, items);
                setSnackbar({ open: true, message: 'Questions reordered', severity: 'success' });
            } catch (err) {
                console.error('Error reordering questions:', err);
                setSnackbar({ open: true, message: 'Failed to save new order', severity: 'error' });
            }
        }
        setDraggedQuestion(null);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#080D19' }}>
                <CircularProgress sx={{ color: theme.colors.brand }} />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#080D19', minHeight: '100vh', color: '#fff' }}>
            {/* Header / Navigation */}
            <Box sx={{
                px: 4, py: 2, borderBottom: '1px solid #1F2937', bgcolor: '#0C1322',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <IconButton onClick={handleBack} sx={{ color: '#9CA3AF' }}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Breadcrumbs separator="/" sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                            <Link underline="hover" color="inherit" onClick={() => navigate('/tutor/courses')} sx={{ cursor: 'pointer' }}>Courses</Link>
                            <Link underline="hover" color="inherit" onClick={handleBack} sx={{ cursor: 'pointer' }}>{course?.title}</Link>
                            <Typography sx={{ color: '#fff', fontWeight: 600 }}>Manage Questions</Typography>
                        </Breadcrumbs>
                        <Typography variant="h6" sx={{ color: '#fff', mt: 0.5, fontWeight: 700 }}>
                            {lesson?.title}
                        </Typography>
                    </Box>
                </Stack>
                <Button
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={handleBack}
                    sx={{ bgcolor: theme.colors.brand, textTransform: 'none', '&:hover': { bgcolor: '#0D42AF' } }}
                >
                    Done
                </Button>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ display: 'flex', height: 'calc(100vh - 85px)', overflow: 'hidden' }}>

                {/* Left Sidebar: Questions List */}
                <Box sx={{
                    width: 350,
                    borderRight: '1px solid #1F2937',
                    bgcolor: '#0C1322',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid #1F2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Questions ({questions.length})</Typography>
                        <Tooltip title="Reset Form">
                            <IconButton size="small" onClick={resetForm} sx={{ color: '#3B82F6' }}>
                                <Add />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                        {questions.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
                                <School sx={{ fontSize: 48, mb: 1 }} />
                                <Typography variant="body2">No questions yet</Typography>
                                <Typography variant="caption">Add your first question to the right</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1.5}>
                                {questions.map((q, idx) => (
                                    <Paper
                                        key={q.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, q.id)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, q.id)}
                                        onClick={() => handleEditQuestion(q)}
                                        sx={{
                                            ...paperStyle,
                                            p: 2,
                                            cursor: 'pointer',
                                            borderColor: editingQuestionId === q.id ? theme.colors.brand : '#374151',
                                            boxShadow: editingQuestionId === q.id ? `0 0 0 1px ${theme.colors.brand}` : 'none',
                                            bgcolor: draggedQuestion === q.id ? '#1E293B' : (editingQuestionId === q.id ? theme.colors.brandLight : '#1A2230'),
                                            opacity: draggedQuestion === q.id ? 0.5 : 1,
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: theme.colors.brand,
                                                bgcolor: 'rgba(17, 82, 212, 0.05)'
                                            }
                                        }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="flex-start">
                                            <DragIndicator sx={{ color: '#4B5563', mt: 0.2, cursor: 'move', fontSize: 18 }} />
                                            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                                <Typography variant="body2" sx={{
                                                    color: '#fff',
                                                    fontWeight: 500,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    mb: 1
                                                }}>
                                                    {idx + 1}. {q.question || q.prompt}
                                                </Typography>
                                                <Stack direction="row" spacing={1}>
                                                    <Chip
                                                        label={q.type?.replace('_', ' ')}
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', height: 20, fontSize: '0.7rem' }}
                                                    />
                                                    <Chip
                                                        label={`${q.points || 1} pts`}
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', height: 20, fontSize: '0.7rem' }}
                                                    />
                                                </Stack>
                                            </Box>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
                                                sx={{ color: '#EF4444', p: 0.5 }}
                                            >
                                                <Delete sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Box>

                {/* Right Side: Editor Area */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 6, bgcolor: '#080D19' }}>
                    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                                    {editingQuestionId ? 'Edit Question' : 'Add New Question'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                                    Create engaging assessments for your students
                                </Typography>
                            </Box>
                            {editingQuestionId && (
                                <Button startIcon={<Add />} onClick={resetForm} sx={{ color: '#3B82F6', textTransform: 'none' }}>
                                    Create New Question instead
                                </Button>
                            )}
                        </Stack>

                        <Paper sx={{ ...paperStyle, p: 4 }}>
                            <Stack spacing={4}>
                                {/* Question Text */}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ color: '#9CA3AF', mb: 1, fontWeight: 600 }}>Question Prompt</Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="What is the capital of France?"
                                        value={questionText}
                                        onChange={(e) => setQuestionText(e.target.value)}
                                        sx={textFieldStyle}
                                    />
                                </Box>

                                {/* Row: Type and Points */}
                                <Stack direction="row" spacing={3}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2" sx={{ color: '#9CA3AF', mb: 1, fontWeight: 600 }}>Question Type</Typography>
                                        <Select
                                            fullWidth
                                            value={questionType}
                                            onChange={(e) => {
                                                setQuestionType(e.target.value);
                                                if (e.target.value === 'true_false') {
                                                    setQuestionOptions(['True', 'False']);
                                                    setCorrectAnswerIndex(0);
                                                } else if (e.target.value === 'multiple_choice') {
                                                    setQuestionOptions(['', '', '']);
                                                    setCorrectAnswerIndex(0);
                                                }
                                            }}
                                            sx={selectStyle}
                                            MenuProps={selectMenuProps}
                                        >
                                            <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                                            <MenuItem value="true_false">True/False</MenuItem>
                                            <MenuItem value="short_answer">Short Answer</MenuItem>
                                            <MenuItem value="essay">Essay</MenuItem>
                                        </Select>
                                    </Box>
                                    <Box sx={{ width: 150 }}>
                                        <Typography variant="subtitle2" sx={{ color: '#9CA3AF', mb: 1, fontWeight: 600 }}>Points</Typography>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            value={questionPoints}
                                            onChange={(e) => setQuestionPoints(parseInt(e.target.value) || 1)}
                                            inputProps={{ min: 1 }}
                                            sx={textFieldStyle}
                                        />
                                    </Box>
                                </Stack>

                                <Divider sx={{ borderColor: '#1F2937' }} />

                                {/* Answer Options */}
                                {(questionType === 'multiple_choice' || questionType === 'true_false') && (
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ color: '#9CA3AF', fontWeight: 600 }}>Answer Options</Typography>
                                            <Typography variant="caption" sx={{ color: '#6B7280' }}>Select the correct answer using the radio button</Typography>
                                        </Stack>

                                        <Stack spacing={2}>
                                            {questionOptions.map((option, idx) => (
                                                <Stack key={idx} direction="row" spacing={2} alignItems="center">
                                                    <Box
                                                        onClick={() => setCorrectAnswerIndex(idx)}
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            border: '2px solid',
                                                            borderColor: correctAnswerIndex === idx ? theme.colors.brand : '#374151',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            flexShrink: 0,
                                                            bgcolor: correctAnswerIndex === idx ? 'rgba(17, 82, 212, 0.2)' : 'transparent',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {correctAnswerIndex === idx && <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.colors.brand }} />}
                                                    </Box>
                                                    <TextField
                                                        fullWidth
                                                        value={option}
                                                        onChange={(e) => {
                                                            if (questionType === 'true_false') return;
                                                            const newOptions = [...questionOptions];
                                                            newOptions[idx] = e.target.value;
                                                            setQuestionOptions(newOptions);
                                                        }}
                                                        disabled={questionType === 'true_false'}
                                                        placeholder={`Option ${idx + 1}`}
                                                        sx={textFieldStyle}
                                                    />
                                                    {questionType === 'multiple_choice' && questionOptions.length > 2 && (
                                                        <IconButton
                                                            onClick={() => setQuestionOptions(questionOptions.filter((_, i) => i !== idx))}
                                                            sx={{ color: '#EF4444' }}
                                                        >
                                                            <Close fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Stack>
                                            ))}
                                        </Stack>

                                        {questionType === 'multiple_choice' && (
                                            <Button
                                                startIcon={<Add />}
                                                onClick={() => setQuestionOptions([...questionOptions, ''])}
                                                sx={{ mt: 2, color: '#3B82F6', textTransform: 'none' }}
                                            >
                                                Add Option
                                            </Button>
                                        )}
                                    </Box>
                                )}

                                {/* Explanation */}
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                        <Typography variant="subtitle2" sx={{ color: '#9CA3AF', fontWeight: 600 }}>Explanation</Typography>
                                        <Tooltip title="Shown to students after they answer the question">
                                            <InfoOutlined sx={{ fontSize: 16, color: '#6B7280' }} />
                                        </Tooltip>
                                    </Stack>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="Explain why this is the correct answer..."
                                        value={questionExplanation}
                                        onChange={(e) => setQuestionExplanation(e.target.value)}
                                        sx={textFieldStyle}
                                    />
                                </Box>

                                <Box sx={{ pt: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                        onClick={handleSaveQuestion}
                                        disabled={actionLoading}
                                        sx={{
                                            ...primaryButtonStyle,
                                            py: 1.5,
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            textTransform: 'none'
                                        }}
                                    >
                                        {actionLoading ? 'Saving...' : (editingQuestionId ? 'Update Question' : 'Save Question')}
                                    </Button>
                                </Box>
                            </Stack>
                        </Paper>
                    </Box>
                </Box>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%', variant: 'filled' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AddQuestion;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Radio,
    RadioGroup,
    FormControlLabel,
    LinearProgress,
} from '@mui/material';
import {
    ArrowBack,
    CheckCircleOutlined,
    ErrorOutline,
    ReplayOutlined,
    NavigateNext,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { learnerCbtService, learnerLessonService } from '../services';

const CBTAttemptPage = () => {
    const { lessonSlug } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = {
        bg: theme.palette.background.default,
        card: theme.palette.background.paper,
        border: theme.palette.divider,
        text: theme.palette.text.primary,
        textSecondary: theme.palette.text.secondary,
        primary: theme.palette.primary.main,
        success: theme.palette.success.main,
        danger: theme.palette.error.main,
    };

    const [phase, setPhase] = useState('loading'); // loading | answering | submitting | result | error
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(null); // { id, questions: [{id, question_text, options: []}] }
    const [answers, setAnswers] = useState({}); // { [questionIndex]: optionIndex }
    const [result, setResult] = useState(null); // { passed, score, ... }
    const [lessonMeta, setLessonMeta] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const start = async () => {
            try {
                setPhase('loading');
                setError('');
                const [lesson, attemptData] = await Promise.all([
                    learnerLessonService.getLesson(lessonSlug).catch(() => null),
                    learnerCbtService.startAttempt(lessonSlug),
                ]);
                if (cancelled) return;
                setLessonMeta(lesson);
                setAttempt(attemptData);
                setPhase('answering');
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Could not start the assessment.');
                setPhase('error');
            }
        };

        start();
        return () => {
            cancelled = true;
        };
    }, [lessonSlug]);

    const questions = attempt?.questions || [];
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;
    const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

    const handleSelect = (questionIndex, optionIndex) => {
        setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
    };

    const handleSubmit = async () => {
        if (!attempt?.id) return;
        const orderedAnswers = questions.map((_q, idx) => Number(answers[idx] ?? -1));
        try {
            setPhase('submitting');
            const res = await learnerCbtService.submitAttempt(attempt.id, orderedAnswers);
            setResult(res);
            setPhase('result');
        } catch (err) {
            setError(err?.message || 'Failed to submit your answers. Please try again.');
            setPhase('answering');
        }
    };

    const handleRetry = async () => {
        setAnswers({});
        setResult(null);
        try {
            setPhase('loading');
            const attemptData = await learnerCbtService.startAttempt(lessonSlug);
            setAttempt(attemptData);
            setPhase('answering');
        } catch (err) {
            setError(err?.message || 'Could not start a new attempt.');
            setPhase('error');
        }
    };

    const handleNextLesson = () => {
        const nextSlug = result?.next_lesson_slug || result?.next_lesson?.slug;
        if (nextSlug) {
            navigate(`/explore/lesson/${nextSlug}`);
        } else if (lessonMeta?.course?.slug) {
            navigate(`/learner/courses/${lessonMeta.course.slug}`);
        } else {
            navigate('/learner/my-learning');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, color: colors.text, py: 4 }}>
            <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, md: 3 } }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ color: colors.textSecondary, textTransform: 'none', mb: 3 }}
                >
                    Back to Lesson
                </Button>

                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Lesson Assessment
                </Typography>
                {lessonMeta?.title && (
                    <Typography sx={{ color: colors.textSecondary, mb: 3 }}>
                        {lessonMeta.title}
                    </Typography>
                )}

                {error && (
                    <Alert
                        severity="error"
                        onClose={() => setError('')}
                        sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', color: '#FCA5A5' }}
                    >
                        {error}
                    </Alert>
                )}

                {phase === 'loading' && (
                    <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
                        <CircularProgress sx={{ color: colors.primary }} />
                        <Typography sx={{ color: colors.textSecondary }}>Preparing your questions…</Typography>
                    </Stack>
                )}

                {phase === 'error' && (
                    <Box
                        sx={{
                            bgcolor: colors.card,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                        }}
                    >
                        <ErrorOutline sx={{ color: colors.danger, fontSize: 48, mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            We couldn't start this assessment
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleRetry}
                            sx={{ bgcolor: colors.primary, textTransform: 'none' }}
                        >
                            Try Again
                        </Button>
                    </Box>
                )}

                {(phase === 'answering' || phase === 'submitting') && totalQuestions > 0 && (
                    <Box>
                        <Box sx={{ mb: 3 }}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    Progress
                                </Typography>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    {answeredCount}/{totalQuestions} answered
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={(answeredCount / totalQuestions) * 100}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.06)',
                                    '& .MuiLinearProgress-bar': { bgcolor: colors.primary },
                                }}
                            />
                        </Box>

                        <Stack spacing={3}>
                            {questions.map((q, qIdx) => (
                                <Box
                                    key={q.id || qIdx}
                                    sx={{
                                        bgcolor: colors.card,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 2,
                                        p: 3,
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 600, mb: 2 }}>
                                        {qIdx + 1}. {q.question_text || q.text}
                                    </Typography>
                                    <RadioGroup
                                        value={answers[qIdx] ?? ''}
                                        onChange={(e) => handleSelect(qIdx, Number(e.target.value))}
                                    >
                                        {(q.options || []).map((opt, optIdx) => {
                                            const label = typeof opt === 'string' ? opt : opt?.text || opt?.label || String(opt);
                                            return (
                                                <FormControlLabel
                                                    key={optIdx}
                                                    value={optIdx}
                                                    control={
                                                        <Radio
                                                            sx={{
                                                                color: colors.textSecondary,
                                                                '&.Mui-checked': { color: colors.primary },
                                                            }}
                                                        />
                                                    }
                                                    label={
                                                        <Typography sx={{ color: colors.text, fontSize: '0.95rem' }}>
                                                            {label}
                                                        </Typography>
                                                    }
                                                />
                                            );
                                        })}
                                    </RadioGroup>
                                </Box>
                            ))}
                        </Stack>

                        <Button
                            fullWidth
                            variant="contained"
                            disabled={!allAnswered || phase === 'submitting'}
                            onClick={handleSubmit}
                            sx={{
                                mt: 4,
                                py: 1.5,
                                bgcolor: colors.primary,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                '&:hover': { bgcolor: '#1d4ed8' },
                                '&.Mui-disabled': { bgcolor: '#374151', color: '#6B7280' },
                            }}
                        >
                            {phase === 'submitting' ? 'Submitting…' : 'Submit Answers'}
                        </Button>
                    </Box>
                )}

                {phase === 'result' && result && (
                    <Box
                        sx={{
                            bgcolor: colors.card,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                        }}
                    >
                        {result.passed ? (
                            <>
                                <CheckCircleOutlined sx={{ color: colors.success, fontSize: 56, mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                    You passed!
                                </Typography>
                                <Typography sx={{ color: colors.textSecondary, mb: 3 }}>
                                    Score: {result.score ?? '—'}
                                    {result.pass_mark != null ? ` / ${result.pass_mark}` : ''}
                                </Typography>
                                <Button
                                    variant="contained"
                                    endIcon={<NavigateNext />}
                                    onClick={handleNextLesson}
                                    sx={{ bgcolor: colors.primary, textTransform: 'none' }}
                                >
                                    Continue
                                </Button>
                            </>
                        ) : (
                            <>
                                <ErrorOutline sx={{ color: colors.danger, fontSize: 56, mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                    Not quite there yet
                                </Typography>
                                <Typography sx={{ color: colors.textSecondary, mb: 3 }}>
                                    Score: {result.score ?? '—'}
                                    {result.pass_mark != null ? ` / ${result.pass_mark}` : ''}
                                    {result.attempts_remaining != null
                                        ? ` — ${result.attempts_remaining} attempt(s) left`
                                        : ''}
                                </Typography>
                                <Stack direction="row" spacing={2} justifyContent="center">
                                    <Button
                                        variant="contained"
                                        startIcon={<ReplayOutlined />}
                                        disabled={result.attempts_remaining === 0}
                                        onClick={handleRetry}
                                        sx={{ bgcolor: colors.primary, textTransform: 'none' }}
                                    >
                                        Retry
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate(-1)}
                                        sx={{
                                            color: colors.text,
                                            borderColor: 'rgba(255,255,255,0.2)',
                                            textTransform: 'none',
                                        }}
                                    >
                                        Back to Lesson
                                    </Button>
                                </Stack>
                            </>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default CBTAttemptPage;

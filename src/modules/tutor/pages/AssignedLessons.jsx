import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import {
    BarChartOutlined,
    EditOutlined,
    MenuBookOutlined,
    MoreVert,
    QuizOutlined,
} from '@mui/icons-material';
import { tutorAssignmentService } from '../services';

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

const LessonActionsMenu = ({ lesson, onAction }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleAction = (action) => {
        setAnchorEl(null);
        onAction(action, lesson);
    };

    return (
        <>
            <IconButton
                size="small"
                aria-label={`Actions for ${lesson.title || 'lesson'}`}
                aria-controls={open ? `lesson-actions-${lesson.id}` : undefined}
                aria-haspopup="menu"
                aria-expanded={open ? 'true' : undefined}
                onClick={(event) => setAnchorEl(event.currentTarget)}
                sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#FFFFFF' } }}
            >
                <MoreVert fontSize="small" />
            </IconButton>
            <Menu
                id={`lesson-actions-${lesson.id}`}
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                PaperProps={{ sx: actionMenuPaperSx }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => handleAction('edit')}>
                    <ListItemIcon sx={{ color: '#93C5FD', minWidth: 30 }}><EditOutlined fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit Content</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleAction('quiz')}>
                    <ListItemIcon sx={{ color: '#A78BFA', minWidth: 30 }}><QuizOutlined fontSize="small" /></ListItemIcon>
                    <ListItemText>Manage Quiz</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleAction('stats')}>
                    <ListItemIcon sx={{ color: '#34D399', minWidth: 30 }}><BarChartOutlined fontSize="small" /></ListItemIcon>
                    <ListItemText>View Stats</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};

const AssignedLessons = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lessons, setLessons] = useState([]);

    const handleAction = (action, lesson) => {
        if (action === 'edit') navigate(`/tutor/lessons/${lesson.id}/edit`);
        if (action === 'quiz') navigate(`/tutor/lessons/${lesson.id}/quiz`);
        if (action === 'stats') navigate(`/tutor/lessons/${lesson.id}`);
    };

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await tutorAssignmentService.listAssignedLessons();
                if (cancelled) return;
                setLessons(res?.data || []);
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Failed to load assigned lessons.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <MenuBookOutlined color="primary" />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    My Assigned Lessons
                </Typography>
            </Stack>

            {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Stack alignItems="center" sx={{ py: 8 }}>
                    <CircularProgress />
                </Stack>
            ) : lessons.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        You haven't been assigned to any lessons yet. An admin will assign you when content is ready.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={1.5}>
                    {lessons.map((lesson) => (
                        <Paper
                            key={lesson.id}
                            variant="outlined"
                            sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                <Box>
                                    <Typography sx={{ fontWeight: 600 }}>{lesson.title || 'Untitled lesson'}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {lesson.course?.title || lesson.module?.course?.title || '-'}
                                        {lesson.module?.title ? ` - ${lesson.module.title}` : ''}
                                    </Typography>
                                </Box>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    {lesson.is_published != null && (
                                        <Chip
                                            label={lesson.is_published ? 'Published' : 'Draft'}
                                            size="small"
                                            color={lesson.is_published ? 'success' : 'default'}
                                            variant="outlined"
                                        />
                                    )}
                                    <LessonActionsMenu lesson={lesson} onAction={handleAction} />
                                </Stack>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default AssignedLessons;

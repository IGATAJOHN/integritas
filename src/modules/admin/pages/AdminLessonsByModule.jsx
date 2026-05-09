import React, { useMemo, useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    InputBase,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Snackbar,
    Stack,
    Typography,
} from '@mui/material';
import {
    ArticleOutlined,
    AttachFile,
    ExpandMore,
    PlayCircleOutline,
    QuizOutlined,
    Refresh,
    School,
    Search,
} from '@mui/icons-material';
import { adminCoursesService } from '../services/courseService';
import {
    paperStyle,
    primaryButtonStyle,
    searchBarStyle,
    searchInputStyle,
} from '../../../styles/formStyles';

const getLessonIcon = (type) => {
    const normalized = String(type || '').toLowerCase();
    if (normalized === 'video') return <PlayCircleOutline />;
    if (normalized === 'quiz') return <QuizOutlined />;
    if (normalized === 'document' || normalized === 'file') return <AttachFile />;
    return <ArticleOutlined />;
};

const AdminLessonsByModule = () => {
    const [moduleId, setModuleId] = useState('');
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const openSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const sortedLessons = useMemo(() => {
        return [...lessons].sort((a, b) => Number(a.position || 0) - Number(b.position || 0));
    }, [lessons]);

    const fetchLessons = async () => {
        if (!String(moduleId).trim()) {
            openSnackbar('Please provide a module ID.', 'error');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await adminCoursesService.listLessons(moduleId.trim());
            setLessons(response.data || []);
        } catch (err) {
            console.error('Failed to load lessons by module:', err);
            setError(err.message || 'Failed to load lessons.');
            setLessons([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Lessons by Admin
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Tutor-style lesson view for the admin module endpoint.
                    </Typography>
                </Box>

                <IconButton
                    onClick={fetchLessons}
                    disabled={loading || !moduleId.trim()}
                    sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
                >
                    <Refresh />
                </IconButton>
            </Stack>

            <Paper sx={{ ...paperStyle, p: 2, mb: 4 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                    <Box sx={{ ...searchBarStyle, maxWidth: 620 }}>
                        <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
                        <InputBase
                            placeholder="Enter module UUID..."
                            value={moduleId}
                            onChange={(event) => setModuleId(event.target.value)}
                            sx={searchInputStyle}
                        />
                    </Box>

                    <Button variant="contained" onClick={fetchLessons} disabled={loading} sx={primaryButtonStyle}>
                        {loading ? 'Loading...' : 'Load Lessons'}
                    </Button>
                </Stack>
            </Paper>

            {loading ? (
                <Paper sx={{ ...paperStyle, py: 8, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Paper>
            ) : error ? (
                <Paper sx={{ ...paperStyle, p: 2 }}>
                    <Alert severity="error" sx={{ bgcolor: 'transparent' }}>{error}</Alert>
                </Paper>
            ) : sortedLessons.length === 0 ? (
                <Paper sx={{ ...paperStyle, p: 6, textAlign: 'center', border: '1px dashed #374151' }}>
                    <School sx={{ fontSize: 60, color: '#374151', mb: 2 }} />
                    <Typography sx={{ color: '#9CA3AF' }}>No lessons loaded for this module.</Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    <Paper
                        sx={{
                            bgcolor: '#1A2230',
                            borderRadius: 2,
                            border: '1px solid #1F2937',
                            overflow: 'hidden',
                        }}
                    >
                        <Accordion
                            defaultExpanded
                            disableGutters
                            sx={{ bgcolor: 'transparent', boxShadow: 'none', '&:before': { display: 'none' } }}
                        >
                            <AccordionSummary
                                component="div"
                                expandIcon={<ExpandMore sx={{ color: '#6B7280' }} />}
                            >
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 2 }}>
                                    <Typography sx={{ color: '#E5E7EB', fontWeight: 600 }}>
                                        Module: {moduleId}
                                    </Typography>
                                    <Chip
                                        label={`${sortedLessons.length} lessons`}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#9CA3AF', height: 20, fontSize: '0.7rem' }}
                                    />
                                </Stack>
                            </AccordionSummary>

                            <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                                <List disablePadding>
                                    {sortedLessons.map((lesson) => (
                                        <ListItem key={lesson.id} disablePadding sx={{ mb: 1 }}>
                                            <ListItemButton
                                                sx={{
                                                    bgcolor: '#0F172A',
                                                    borderRadius: 1,
                                                    border: '1px solid transparent',
                                                    '&:hover': {
                                                        bgcolor: '#1E293B',
                                                        borderColor: 'rgba(59, 130, 246, 0.3)',
                                                    },
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    px: 1,
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 40, color: '#3B82F6' }}>
                                                    {getLessonIcon(lesson.type)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={lesson.title || 'Untitled lesson'}
                                                    secondary={
                                                        <Typography variant="caption" sx={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {lesson.type || 'lesson'} • {lesson.duration_minutes || lesson.duration || 0} min • position {lesson.position ?? '-'}
                                                        </Typography>
                                                    }
                                                    primaryTypographyProps={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}
                                                />
                                                <Chip
                                                    label={lesson.status || 'draft'}
                                                    size="small"
                                                    sx={{
                                                        textTransform: 'capitalize',
                                                        bgcolor: 'rgba(255,255,255,0.05)',
                                                        color: '#9CA3AF',
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    </Paper>
                </Stack>
            )}

            <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={closeSnackbar} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminLessonsByModule;

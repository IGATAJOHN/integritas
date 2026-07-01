import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    ArrowBack,
    Delete,
    Quiz,
    Save,
    UploadFile,
} from '@mui/icons-material';
import { tutorAssignmentService } from '../services';
import { paperStyle, primaryButtonStyle, textFieldStyle } from '../../../styles/formStyles';

const getErrorMessage = (error, fallback) => error?.data?.message || error?.message || fallback;

const AssignedLessonEditor = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [form, setForm] = useState({ title: '', description: '' });
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
            setLesson(data);
            setForm({
                title: data?.title || '',
                description: data?.description || data?.summary || data?.content || '',
            });
            const materialRes = await tutorAssignmentService.listMaterials(lessonId).catch(() => ({ data: [] }));
            setMaterials(materialRes.data || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load assigned lesson.'));
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        load();
    }, [load]);

    const saveLesson = async () => {
        if (!form.title.trim()) {
            showMessage('Lesson title is required.', 'error');
            return;
        }
        setSaving(true);
        try {
            const updated = await tutorAssignmentService.updateAssignedLesson(lessonId, {
                title: form.title.trim(),
                description: form.description.trim() || undefined,
            });
            setLesson((prev) => ({ ...prev, ...updated }));
            showMessage('Lesson updated.');
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to update lesson. Confirm this lesson is assigned to you.'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const uploadVideo = async (file) => {
        if (!file) return;
        setSaving(true);
        try {
            await tutorAssignmentService.uploadLessonVideo(lessonId, file);
            showMessage('Video uploaded.');
            await load();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to upload video.'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const uploadMaterial = async (file) => {
        if (!file) return;
        setSaving(true);
        try {
            await tutorAssignmentService.uploadLessonVideo(lessonId, file);
            showMessage('Material uploaded successfully.');
            await load();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to upload material.'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const deleteMaterial = async (materialId) => {
        setSaving(true);
        try {
            await tutorAssignmentService.deleteMaterial(materialId);
            setMaterials((prev) => prev.filter((item) => item.id !== materialId));
            showMessage('Material deleted.');
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to delete material.'), 'error');
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
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <IconButton onClick={() => navigate('/tutor/lessons')}><ArrowBack /></IconButton>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>Edit Assigned Lesson</Typography>
                        <Typography color="text.secondary" variant="body2">{lesson?.module?.title || lesson?.course?.title || 'Foundational lesson'}</Typography>
                    </Box>
                </Stack>
                <Button startIcon={<Quiz />} onClick={() => navigate(`/tutor/lessons/${lessonId}/quiz`)} sx={{ textTransform: 'none' }}>
                    Manage Quiz
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                <Paper sx={{ ...paperStyle, p: 3, flex: 1 }}>
                    <Typography sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>Lesson Content</Typography>
                    <Stack spacing={2}>
                        <TextField label="Title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} fullWidth sx={textFieldStyle} />
                        <TextField label="Description / content" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} fullWidth multiline minRows={8} sx={textFieldStyle} />
                        <Button variant="contained" startIcon={<Save />} disabled={saving} onClick={saveLesson} sx={{ ...primaryButtonStyle, textTransform: 'none', alignSelf: 'flex-start' }}>
                            Save Lesson
                        </Button>
                    </Stack>
                </Paper>

                <Paper sx={{ ...paperStyle, p: 3, width: { xs: '100%', lg: 360 } }}>
                    <Typography sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>Uploads</Typography>
                    <Stack spacing={1.5}>
                        <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={saving} sx={{ textTransform: 'none' }}>
                            Upload Video
                            <input hidden type="file" accept="video/*" onChange={(event) => uploadVideo(event.target.files?.[0])} />
                        </Button>
                        <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={saving} sx={{ textTransform: 'none' }}>
                            Upload Material
                            <input hidden type="file" onChange={(event) => uploadMaterial(event.target.files?.[0])} />
                        </Button>
                    </Stack>

                    {lesson?.video_url && (
                        <Box sx={{ mt: 2, p: 1.5, border: '1px solid #1F2937', borderRadius: 1, bgcolor: '#0C1322', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ minWidth: 0, mr: 1 }}>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>Current Media/Material File</Typography>
                                <Typography noWrap variant="body2" sx={{ color: '#34D399', fontWeight: 600 }}>
                                    {lesson.video_url.split('/').pop()}
                                </Typography>
                            </Box>
                            <Button size="small" href={lesson.video_url} target="_blank" rel="noopener noreferrer" sx={{ color: '#A78BFA', textTransform: 'none' }}>
                                View
                            </Button>
                        </Box>
                    )}

                    <Typography sx={{ color: '#FFFFFF', fontWeight: 700, mt: 3, mb: 1 }}>Materials</Typography>
                    <Stack spacing={1}>
                        {materials.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">No materials uploaded yet.</Typography>
                        ) : materials.map((material) => (
                            <Stack key={material.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ border: '1px solid #374151', borderRadius: 1, p: 1 }}>
                                <Typography sx={{ color: '#E5E7EB', fontSize: '0.88rem' }}>{material.display_name || material.name || material.file_name || 'Material'}</Typography>
                                <Tooltip title="Delete material">
                                    <IconButton size="small" onClick={() => deleteMaterial(material.id)} sx={{ color: '#EF4444' }}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        ))}
                    </Stack>
                </Paper>
            </Stack>

            <Snackbar open={snackbar.open} autoHideDuration={4500} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default AssignedLessonEditor;

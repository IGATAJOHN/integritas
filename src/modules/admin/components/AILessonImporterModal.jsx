import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Box,
    Typography,
    IconButton,
    Stack,
    Checkbox,
    MenuItem,
    Select,
    Alert,
    Divider,
    Paper
} from '@mui/material';
import {
    Close,
    CloudUpload,
    AutoAwesome,
    CheckCircle,
    PlayCircleOutline,
    InsertDriveFile,
    MenuBook,
    Edit
} from '@mui/icons-material';
import { apiService } from '../../../services/api';

const dialogPaperSx = {
    bgcolor: '#0F172A',
    backgroundImage: 'none',
    border: '1px solid #1E293B',
    borderRadius: 3,
    color: '#F3F4F6'
};

const scrollableModalBody = {
    '&::-webkit-scrollbar': { width: '6px' },
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': { background: '#334155', borderRadius: '4px' },
    '&::-webkit-scrollbar-thumb:hover': { background: '#475569' }
};

const inputStyle = {
    '& .MuiOutlinedInput-root': {
        color: '#F3F4F6',
        bgcolor: 'rgba(30, 41, 59, 0.5)',
        '& fieldset': { borderColor: '#334155' },
        '&:hover fieldset': { borderColor: '#475569' },
        '&.Mui-focused fieldset': { borderColor: '#178A83' }
    },
    '& .MuiInputLabel-root': { color: '#9CA3AF' }
};

const selectStyle = {
    color: '#F3F4F6',
    bgcolor: 'rgba(30, 41, 59, 0.5)',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#178A83' },
    '& .MuiSvgIcon-root': { color: '#9CA3AF' }
};

const AILessonImporterModal = ({ open, courseId, onClose, onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [parsing, setParsing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [parsedData, setParsedData] = useState([]); // Array of parsed modules

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
        }
    };

    const handleUploadAndParse = async () => {
        if (!file) return;
        setParsing(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Call backend parsing API
            const response = await apiService.post(
                `/courses/${encodeURIComponent(courseId)}/import-pdf`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            
            const data = response?.data ?? response;
            if (Array.isArray(data)) {
                // Initialize checked/enabled states for editing
                const initialModules = data.map((mod, modIdx) => ({
                    id: `mod-${modIdx}`,
                    title: mod.title || `Module ${modIdx + 1}`,
                    description: mod.description || '',
                    enabled: true,
                    lessons: (mod.lessons || []).map((les, lesIdx) => ({
                        id: `les-${modIdx}-${lesIdx}`,
                        title: les.title || `Lesson ${lesIdx + 1}`,
                        description: les.description || '',
                        type: ['video', 'document', 'text'].includes(les.type) ? les.type : 'video',
                        duration: Number(les.duration || 15),
                        enabled: true
                    }))
                }));
                setParsedData(initialModules);
            } else {
                throw new Error("Invalid format returned by AI. Expected an array of modules.");
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to extract modules from PDF.';
            setError(msg);
        } finally {
            setParsing(false);
        }
    };

    const handleModuleToggle = (modId) => {
        setParsedData(prev => prev.map(mod => 
            mod.id === modId ? { ...mod, enabled: !mod.enabled } : mod
        ));
    };

    const handleModuleFieldChange = (modId, field, value) => {
        setParsedData(prev => prev.map(mod => 
            mod.id === modId ? { ...mod, [field]: value } : mod
        ));
    };

    const handleLessonToggle = (modId, lesId) => {
        setParsedData(prev => prev.map(mod => {
            if (mod.id !== modId) return mod;
            return {
                ...mod,
                lessons: mod.lessons.map(les => 
                    les.id === lesId ? { ...les, enabled: !les.enabled } : les
                )
            };
        }));
    };

    const handleLessonFieldChange = (modId, lesId, field, value) => {
        setParsedData(prev => prev.map(mod => {
            if (mod.id !== modId) return mod;
            return {
                ...mod,
                lessons: mod.lessons.map(les => 
                    les.id === lesId ? { ...les, [field]: value } : les
                )
            };
        }));
    };

    const handleSaveOutline = async () => {
        setSaving(true);
        setError('');

        // Prepare finalized structure
        const finalModules = parsedData
            .filter(mod => mod.enabled)
            .map(mod => ({
                title: mod.title,
                description: mod.description,
                lessons: mod.lessons
                    .filter(les => les.enabled)
                    .map(les => ({
                        title: les.title,
                        description: les.description,
                        type: les.type,
                        duration: les.duration
                    }))
            }));

        if (finalModules.length === 0) {
            setError('Please enable at least one module and lesson to import.');
            setSaving(false);
            return;
        }

        try {
            await apiService.post(`/courses/${encodeURIComponent(courseId)}/import-save`, {
                modules: finalModules
            });
            setSuccess(true);
            setTimeout(() => {
                onImportSuccess();
                handleResetAndClose();
            }, 1500);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to import curriculum.';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleResetAndClose = () => {
        setFile(null);
        setParsing(false);
        setSaving(false);
        setError('');
        setSuccess(false);
        setParsedData([]);
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleResetAndClose} 
            fullWidth 
            maxWidth={parsedData.length > 0 ? "md" : "sm"} 
            PaperProps={{ sx: dialogPaperSx }}
        >
            <DialogTitle sx={{ borderBottom: '1px solid #1E293B', px: 3, py: 2.25 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.25} alignItems="center">
                        <AutoAwesome sx={{ color: '#178A83' }} />
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.05rem' }}>
                            AI Course Syllabus Importer
                        </Typography>
                    </Stack>
                    <IconButton onClick={handleResetAndClose} size="small" sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
                        <Close fontSize="small" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: 3, ...scrollableModalBody, maxHeight: '65vh', overflowY: 'auto' }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {error}
                    </Alert>
                )}

                {success ? (
                    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <CheckCircle sx={{ fontSize: 64, color: '#10B981', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                            Curriculum Imported Successfully!
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 1 }}>
                            The course outline is now created. Refreshing dashboard...
                        </Typography>
                    </Box>
                ) : parsedData.length === 0 ? (
                    // STEP 1: Upload File view
                    <Box>
                        <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
                            Upload your curriculum syllabus document (PDF). Our AI will analyze the structure, extract modules and study topics, and organize them into platform lessons. You will be able to review the syllabus before saving.
                        </Typography>

                        <Paper
                            variant="outlined"
                            component="label"
                            sx={{
                                border: '2px dashed #334155',
                                borderRadius: 3,
                                bgcolor: 'rgba(30, 41, 59, 0.25)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                py: 6,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: '#178A83',
                                    bgcolor: 'rgba(23, 138, 131, 0.05)'
                                }
                            }}
                        >
                            <input type="file" accept=".pdf" hidden onChange={handleFileChange} />
                            <CloudUpload sx={{ fontSize: 48, color: file ? '#178A83' : '#64748B', mb: 2 }} />
                            {file ? (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 600, px: 2 }}>
                                        {file.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, display: 'block' }}>
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Click to replace file
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ color: '#E2E8F0', fontWeight: 500 }}>
                                        Click to browse or drag PDF syllabus here
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', mt: 0.5, display: 'block' }}>
                                        Supports PDF formats up to 10MB
                                    </Typography>
                                </Box>
                            )}
                        </Paper>

                        {parsing && (
                            <Stack spacing={2} sx={{ mt: 4, alignItems: 'center', justifyContent: 'center' }}>
                                <CircularProgress size={32} sx={{ color: '#178A83' }} />
                                <Typography variant="body2" sx={{ color: '#178A83', fontWeight: 500 }}>
                                    AI is analyzing syllabus structure and extracting modules...
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                ) : (
                    // STEP 2: Review and Edit parsed tree
                    <Box>
                        <Stack spacing={1.5} direction="row" alignItems="center" sx={{ mb: 3 }}>
                            <Edit sx={{ color: '#178A83', fontSize: 18 }} />
                            <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                Review & Edit Extracted Outline ({parsedData.filter(m => m.enabled).length} Modules)
                            </Typography>
                        </Stack>

                        <Stack spacing={3}>
                            {parsedData.map((module, mIdx) => (
                                <Paper 
                                    key={module.id} 
                                    variant="outlined" 
                                    sx={{ 
                                        p: 2.5, 
                                        borderRadius: 2, 
                                        borderColor: module.enabled ? '#334155' : '#1E293B',
                                        bgcolor: module.enabled ? 'rgba(30, 41, 59, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                                        opacity: module.enabled ? 1 : 0.6,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {/* Module Row */}
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
                                        <Checkbox 
                                            checked={module.enabled}
                                            onChange={() => handleModuleToggle(module.id)}
                                            sx={{ color: '#334155', '&.Mui-checked': { color: '#178A83' }, p: 0.5, mt: 0.25 }}
                                        />
                                        <Stack spacing={1} sx={{ flexGrow: 1 }}>
                                            <TextField
                                                size="small"
                                                variant="outlined"
                                                placeholder={`Module ${mIdx + 1} Title`}
                                                value={module.title}
                                                disabled={!module.enabled}
                                                onChange={(e) => handleModuleFieldChange(module.id, 'title', e.target.value)}
                                                sx={{ ...inputStyle }}
                                                fullWidth
                                            />
                                            <TextField
                                                size="small"
                                                variant="outlined"
                                                multiline
                                                minRows={1}
                                                placeholder="Module description (optional)"
                                                value={module.description}
                                                disabled={!module.enabled}
                                                onChange={(e) => handleModuleFieldChange(module.id, 'description', e.target.value)}
                                                sx={{ ...inputStyle }}
                                                fullWidth
                                            />
                                        </Stack>
                                    </Stack>

                                    {module.enabled && (
                                        <Box sx={{ pl: 5, mt: 2 }}>
                                            <Divider sx={{ borderColor: '#1E293B', mb: 2 }} />
                                            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', mb: 1.5 }}>
                                                LESSONS IN THIS MODULE
                                            </Typography>
                                            <Stack spacing={2}>
                                                {module.lessons.map((lesson) => (
                                                    <Stack 
                                                        key={lesson.id} 
                                                        direction="row" 
                                                        spacing={2} 
                                                        alignItems="center" 
                                                        sx={{ 
                                                            p: 1.5, 
                                                            borderRadius: 1.5, 
                                                            bgcolor: 'rgba(15, 23, 42, 0.4)',
                                                            border: '1px solid #1E293B',
                                                            opacity: lesson.enabled ? 1 : 0.5 
                                                        }}
                                                    >
                                                        <Checkbox 
                                                            checked={lesson.enabled}
                                                            onChange={() => handleLessonToggle(module.id, lesson.id)}
                                                            sx={{ color: '#334155', '&.Mui-checked': { color: '#178A83' }, p: 0.5 }}
                                                        />
                                                        
                                                        {/* Icon based on type */}
                                                        {lesson.type === 'video' ? (
                                                            <PlayCircleOutline sx={{ color: '#10B981', fontSize: 20 }} />
                                                        ) : lesson.type === 'document' ? (
                                                            <InsertDriveFile sx={{ color: '#F59E0B', fontSize: 20 }} />
                                                        ) : (
                                                            <MenuBook sx={{ color: '#6366F1', fontSize: 20 }} />
                                                        )}

                                                        <TextField
                                                            size="small"
                                                            placeholder="Lesson Title"
                                                            value={lesson.title}
                                                            disabled={!lesson.enabled}
                                                            onChange={(e) => handleLessonFieldChange(module.id, lesson.id, 'title', e.target.value)}
                                                            sx={{ ...inputStyle, flexGrow: 1 }}
                                                        />

                                                        {/* Select Type */}
                                                        <Select
                                                            size="small"
                                                            value={lesson.type}
                                                            disabled={!lesson.enabled}
                                                            onChange={(e) => handleLessonFieldChange(module.id, lesson.id, 'type', e.target.value)}
                                                            sx={{ ...selectStyle, minWidth: 110, height: 40 }}
                                                        >
                                                            <MenuItem value="video">Video</MenuItem>
                                                            <MenuItem value="document">Document</MenuItem>
                                                            <MenuItem value="text">Text/Reading</MenuItem>
                                                        </Select>

                                                        {/* Duration */}
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            placeholder="Mins"
                                                            value={lesson.duration}
                                                            disabled={!lesson.enabled}
                                                            onChange={(e) => handleLessonFieldChange(module.id, lesson.id, 'duration', Number(e.target.value))}
                                                            InputProps={{ inputProps: { min: 1, style: { width: 45, textAlign: 'center' } } }}
                                                            sx={{ ...inputStyle, height: 40 }}
                                                        />
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #1E293B', gap: 1 }}>
                {!success && (
                    <>
                        <Button 
                            onClick={handleResetAndClose} 
                            disabled={parsing || saving}
                            sx={{ color: '#9CA3AF', textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}
                        >
                            Cancel
                        </Button>
                        {parsedData.length === 0 ? (
                            <Button 
                                variant="contained"
                                onClick={handleUploadAndParse}
                                disabled={!file || parsing}
                                startIcon={parsing ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />}
                                sx={{
                                    bgcolor: '#178A83',
                                    textTransform: 'none',
                                    px: 3,
                                    '&:hover': { bgcolor: '#116B65' },
                                    '&:disabled': { bgcolor: '#1E293B', color: '#64748B' }
                                }}
                            >
                                {parsing ? 'Analyzing PDF...' : 'Extract Outline'}
                            </Button>
                        ) : (
                            <Button 
                                variant="contained"
                                onClick={handleSaveOutline}
                                disabled={saving}
                                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                                sx={{
                                    bgcolor: '#178A83',
                                    textTransform: 'none',
                                    px: 3,
                                    '&:hover': { bgcolor: '#116B65' },
                                    '&:disabled': { bgcolor: '#1E293B', color: '#64748B' }
                                }}
                            >
                                {saving ? 'Importing Outline...' : 'Confirm & Import'}
                            </Button>
                        )}
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default AILessonImporterModal;

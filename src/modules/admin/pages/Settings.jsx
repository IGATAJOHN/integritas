import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Stack,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip,
    Divider,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    PlayCircleOutlined as PlayIcon,
    DeleteOutlined as DeleteIcon,
    CheckCircleOutlined as CheckIcon,
    ErrorOutlined as ErrorIcon,
    VideoCameraBack as VideoIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api';
import { useThemeMode } from '../../../contexts';
import appTheme from '../../../styles/theme';

/* ── helpers ─────────────────────────────────────────────── */
const HERO_VIDEO_ENDPOINT = '/site/hero-video';
const BACKEND_BASE = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
    : 'https://integritas-backend.onrender.com';

const formatBytes = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ── Main Component ──────────────────────────────────────── */
const Settings = () => {
    const { isDark } = useThemeMode();

    const colors = {
        bg: isDark ? '#0B0F19' : '#F8FAFC',
        paper: isDark ? '#111827' : '#FFFFFF',
        card: isDark ? '#1A1F2E' : '#FFFFFF',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        text: isDark ? '#FFFFFF' : '#1E293B',
        textSecondary: isDark ? '#9CA3AF' : '#64748B',
        brand: appTheme.colors.brand,
    };

    /* current video from backend */
    const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    /* upload state */
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const fileInputRef = useRef(null);

    /* ── fetch current hero video ── */
    const fetchCurrentVideo = async () => {
        setFetchLoading(true);
        setFetchError(null);
        try {
            const res = await apiService.get(HERO_VIDEO_ENDPOINT);
            const data = res?.data ?? res;
            setCurrentVideoUrl(data?.hero_video_url || null);
        } catch (err) {
            setFetchError('Could not load current hero video.');
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentVideo();
    }, []);

    /* ── file selection ── */
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            setUploadError('Please select a valid video file (MP4, WebM, MOV, etc.).');
            return;
        }
        if (file.size > 500 * 1024 * 1024) {
            setUploadError('File is too large. Maximum size is 500 MB.');
            return;
        }

        setSelectedFile(file);
        setUploadError(null);
        setUploadSuccess(false);

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const fakeEvent = { target: { files: [file] } };
            handleFileSelect(fakeEvent);
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    /* ── upload ── */
    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setUploadProgress(0);
        setUploadError(null);
        setUploadSuccess(false);

        try {
            const formData = new FormData();
            formData.append('hero_video', selectedFile);

            // Use fetch directly for progress tracking via XHR
            const token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
            const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
            const url = `${baseUrl}${HERO_VIDEO_ENDPOINT}`;

            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        setUploadProgress(Math.round((e.loaded / e.total) * 100));
                    }
                });

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            setCurrentVideoUrl(data.hero_video_url || null);
                        } catch (_) {}
                        resolve();
                    } else {
                        try {
                            const errData = JSON.parse(xhr.responseText);
                            reject(new Error(errData.message || `Upload failed (${xhr.status})`));
                        } catch (_) {
                            reject(new Error(`Upload failed (${xhr.status})`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error('Network error during upload.'));
                xhr.send(formData);
            });

            setUploadSuccess(true);
            setSelectedFile(null);
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            setUploadError(err.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleClearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadError(null);
        setUploadSuccess(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    /* ── render ── */
    return (
        <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', p: { xs: 2, md: 4 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
                System Settings
            </Typography>
            <Typography sx={{ color: colors.textSecondary, fontSize: '0.95rem', mb: 4 }}>
                Manage site-wide configuration and media assets.
            </Typography>

            {/* ── Hero Video Card ── */}
            <Box
                sx={{
                    bgcolor: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 3,
                    p: { xs: 2.5, md: 4 },
                    maxWidth: 780,
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <VideoIcon sx={{ color: colors.brand, fontSize: 26 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text }}>
                        Hero Video — Home Page
                    </Typography>
                </Stack>
                <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 3 }}>
                    This video appears in the welcome address section of the public home page. Upload a new MP4/WebM to replace it instantly.
                </Typography>

                <Divider sx={{ borderColor: colors.border, mb: 3 }} />

                {/* Current video preview */}
                <Typography sx={{ fontWeight: 600, color: colors.text, fontSize: '0.875rem', mb: 1.5 }}>
                    Current Hero Video
                </Typography>

                {fetchLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <CircularProgress size={18} />
                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.85rem' }}>Loading…</Typography>
                    </Box>
                ) : fetchError ? (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        {fetchError}
                        <Button size="small" onClick={fetchCurrentVideo} sx={{ ml: 1 }}>Retry</Button>
                    </Alert>
                ) : currentVideoUrl ? (
                    <Box sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                        <Box
                            component="video"
                            src={currentVideoUrl}
                            controls
                            sx={{ width: '100%', maxHeight: 300, bgcolor: '#000', display: 'block' }}
                        />
                        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                label="Live"
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(16,185,129,0.15)',
                                    color: '#10B981',
                                    border: '1px solid rgba(16,185,129,0.3)',
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                }}
                            />
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.78rem', wordBreak: 'break-all' }}>
                                {currentVideoUrl}
                            </Typography>
                            <Tooltip title="Refresh">
                                <IconButton size="small" onClick={fetchCurrentVideo} sx={{ ml: 'auto', color: colors.textSecondary }}>
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            mb: 3,
                            p: 3,
                            borderRadius: 2,
                            border: `1px dashed ${colors.border}`,
                            textAlign: 'center',
                            color: colors.textSecondary,
                        }}
                    >
                        <PlayIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                        <Typography sx={{ fontSize: '0.875rem' }}>No hero video uploaded yet.</Typography>
                    </Box>
                )}

                <Divider sx={{ borderColor: colors.border, mb: 3 }} />

                {/* Upload new video */}
                <Typography sx={{ fontWeight: 600, color: colors.text, fontSize: '0.875rem', mb: 1.5 }}>
                    Upload New Video
                </Typography>

                {/* Drop Zone */}
                {!selectedFile && (
                    <Box
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                            border: `2px dashed ${colors.brand}44`,
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            bgcolor: `${colors.brand}08`,
                            '&:hover': {
                                borderColor: colors.brand,
                                bgcolor: `${colors.brand}12`,
                            },
                            mb: 2,
                        }}
                    >
                        <UploadIcon sx={{ fontSize: 40, color: colors.brand, mb: 1.5 }} />
                        <Typography sx={{ color: colors.text, fontWeight: 600, mb: 0.5 }}>
                            Drag &amp; drop a video file here
                        </Typography>
                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                            or click to browse — MP4, WebM, MOV (max 500 MB)
                        </Typography>
                    </Box>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                />

                {/* Selected file preview */}
                {selectedFile && (
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${colors.brand}44`, mb: 1.5 }}>
                            <Box
                                component="video"
                                src={previewUrl}
                                controls
                                sx={{ width: '100%', maxHeight: 260, bgcolor: '#000', display: 'block' }}
                            />
                        </Box>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.875rem', mb: 0.25 }}>
                                    {selectedFile.name}
                                </Typography>
                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.78rem' }}>
                                    {formatBytes(selectedFile.size)} · {selectedFile.type}
                                </Typography>
                            </Box>
                            <Tooltip title="Remove">
                                <IconButton size="small" onClick={handleClearSelection} sx={{ color: '#EF4444' }}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                )}

                {/* Upload progress */}
                {uploading && (
                    <Box sx={{ mb: 2 }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.78rem' }}>Uploading…</Typography>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.78rem' }}>{uploadProgress}%</Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={uploadProgress}
                            sx={{
                                borderRadius: 2,
                                height: 6,
                                bgcolor: colors.border,
                                '& .MuiLinearProgress-bar': { bgcolor: colors.brand, borderRadius: 2 },
                            }}
                        />
                    </Box>
                )}

                {/* Alerts */}
                {uploadSuccess && (
                    <Alert
                        severity="success"
                        icon={<CheckIcon />}
                        sx={{ mb: 2 }}
                        onClose={() => setUploadSuccess(false)}
                    >
                        Hero video uploaded successfully! It is now live on the home page.
                    </Alert>
                )}
                {uploadError && (
                    <Alert
                        severity="error"
                        icon={<ErrorIcon />}
                        sx={{ mb: 2 }}
                        onClose={() => setUploadError(null)}
                    >
                        {uploadError}
                    </Alert>
                )}

                {/* Action buttons */}
                <Stack direction="row" spacing={2} alignItems="center">
                    {selectedFile ? (
                        <>
                            <Button
                                variant="contained"
                                startIcon={uploading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <UploadIcon />}
                                onClick={handleUpload}
                                disabled={uploading}
                                sx={{
                                    bgcolor: colors.brand,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    px: 3,
                                    '&:hover': { bgcolor: '#0e42b0' },
                                    '&.Mui-disabled': { bgcolor: colors.brand, opacity: 0.6 },
                                }}
                            >
                                {uploading ? `Uploading ${uploadProgress}%` : 'Upload Video'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleClearSelection}
                                disabled={uploading}
                                sx={{
                                    borderColor: colors.border,
                                    color: colors.textSecondary,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    '&:hover': { borderColor: colors.textSecondary },
                                }}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="outlined"
                            startIcon={<UploadIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                                borderColor: colors.brand,
                                color: colors.brand,
                                fontWeight: 600,
                                textTransform: 'none',
                                px: 3,
                                '&:hover': { bgcolor: `${colors.brand}10` },
                            }}
                        >
                            Choose Video File
                        </Button>
                    )}
                </Stack>
            </Box>
        </Box>
    );
};

export default Settings;

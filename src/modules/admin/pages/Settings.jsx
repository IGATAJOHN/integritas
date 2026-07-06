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
const SIGNATURE_ENDPOINT = '/site/cloudinary-signature';

const formatBytes = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

/* ── Main Component ──────────────────────────────────────── */
const Settings = () => {
    const { isDark } = useThemeMode();

    const colors = {
        bg: isDark ? '#0B0F19' : '#F8FAFC',
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

    /* file selection */
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    /* upload state */
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadPhase, setUploadPhase] = useState(''); // 'signing' | 'uploading' | 'saving'
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
        } catch {
            setFetchError('Could not load the current hero video.');
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => { fetchCurrentVideo(); }, []);

    /* ── file selection ── */
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            setUploadError('Please select a valid video file (MP4, WebM, MOV, etc.).');
            return;
        }
        setSelectedFile(file);
        setUploadError(null);
        setUploadSuccess(false);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect({ target: { files: [file] } });
    };

    const handleClearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadError(null);
        setUploadSuccess(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    /* ── Direct Cloudinary Upload ── */
    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setUploadProgress(0);
        setUploadError(null);
        setUploadSuccess(false);

        try {
            // 1. Get signed upload params from the backend (no file goes to Django)
            setUploadPhase('signing');
            const sigRes = await apiService.get(SIGNATURE_ENDPOINT);
            const sigData = sigRes?.data ?? sigRes;
            const { cloud_name, api_key, timestamp, folder, signature, upload_url } = sigData;

            if (!signature || !upload_url) {
                throw new Error(
                    sigData?.message ||
                    'Could not get upload credentials. Make sure Cloudinary environment variables are set on Render.'
                );
            }

            // 2. Upload video DIRECTLY to Cloudinary — Django never sees the file bytes
            setUploadPhase('uploading');
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('api_key', api_key);
            formData.append('timestamp', timestamp);
            formData.append('folder', folder);
            formData.append('signature', signature);
            formData.append('overwrite', 'true');
            formData.append('resource_type', 'video');

            const cloudinaryResult = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', upload_url);

                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        setUploadProgress(Math.round((e.loaded / e.total) * 100));
                    }
                });

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try { resolve(JSON.parse(xhr.responseText)); }
                        catch { resolve({}); }
                    } else {
                        try {
                            const err = JSON.parse(xhr.responseText);
                            reject(new Error(err?.error?.message || `Cloudinary upload failed (${xhr.status})`));
                        } catch {
                            reject(new Error(`Cloudinary upload failed (${xhr.status})`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error('Network error during upload. Check your internet connection.'));
                xhr.send(formData);
            });

            const videoUrl = cloudinaryResult.secure_url;
            const publicId = cloudinaryResult.public_id;

            if (!videoUrl) throw new Error('Cloudinary did not return a video URL.');

            // 3. Save just the URL to our backend (tiny payload, no timeout risk)
            setUploadPhase('saving');
            await apiService.post(HERO_VIDEO_ENDPOINT, {
                hero_video_url: videoUrl,
                public_id: publicId,
            });

            setCurrentVideoUrl(videoUrl);
            setUploadSuccess(true);
            handleClearSelection();

        } catch (err) {
            setUploadError(err.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            setUploadPhase('');
        }
    };

    /* ── phase label ── */
    const phaseLabel = {
        signing: 'Getting upload credentials…',
        uploading: `Uploading to Cloudinary CDN — ${uploadProgress}%`,
        saving: 'Saving to database…',
    }[uploadPhase] || 'Processing…';

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
                    maxWidth: 800,
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <VideoIcon sx={{ color: colors.brand, fontSize: 26 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text }}>
                        Hero Video — Home Page
                    </Typography>
                </Stack>
                <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 1 }}>
                    This video plays in the welcome section of the public home page.
                </Typography>



                <Divider sx={{ borderColor: colors.border, mb: 3 }} />

                {/* Current video */}
                <Typography sx={{ fontWeight: 600, color: colors.text, fontSize: '0.875rem', mb: 1.5 }}>
                    Currently Live
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
                        <Box component="video" src={currentVideoUrl} controls
                            sx={{ width: '100%', maxHeight: 320, bgcolor: '#000', display: 'block' }} />
                        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="Live on Cloudinary" size="small" sx={{
                                bgcolor: 'rgba(16,185,129,0.15)', color: '#10B981',
                                border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700, fontSize: '0.7rem',
                            }} />
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.75rem', wordBreak: 'break-all', flex: 1 }}>
                                {currentVideoUrl}
                            </Typography>
                            <Tooltip title="Refresh">
                                <IconButton size="small" onClick={fetchCurrentVideo} sx={{ color: colors.textSecondary }}>
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ mb: 3, p: 3, borderRadius: 2, border: `1px dashed ${colors.border}`,
                        textAlign: 'center', color: colors.textSecondary }}>
                        <PlayIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                        <Typography sx={{ fontSize: '0.875rem' }}>No hero video uploaded yet.</Typography>
                    </Box>
                )}

                <Divider sx={{ borderColor: colors.border, mb: 3 }} />

                {/* Upload new video */}
                <Typography sx={{ fontWeight: 600, color: colors.text, fontSize: '0.875rem', mb: 1.5 }}>
                    Upload New Video
                </Typography>

                {/* Drop zone */}
                {!selectedFile && !uploading && (
                    <Box
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                            border: `2px dashed ${colors.brand}55`,
                            borderRadius: 2, p: 5, textAlign: 'center', cursor: 'pointer',
                            bgcolor: `${colors.brand}08`, transition: 'all 0.2s',
                            '&:hover': { borderColor: colors.brand, bgcolor: `${colors.brand}12` },
                            mb: 2,
                        }}
                    >
                        <UploadIcon sx={{ fontSize: 44, color: colors.brand, mb: 1.5 }} />
                        <Typography sx={{ color: colors.text, fontWeight: 600, mb: 0.5 }}>
                            Drag &amp; drop your video here
                        </Typography>
                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                            MP4, WebM, MOV · Any size — uploads directly to Cloudinary CDN
                        </Typography>
                    </Box>
                )}

                <input ref={fileInputRef} type="file" accept="video/*"
                    style={{ display: 'none' }} onChange={handleFileSelect} />

                {/* File selected — preview */}
                {selectedFile && !uploading && (
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ borderRadius: 2, overflow: 'hidden',
                            border: `1px solid ${colors.brand}44`, mb: 1.5 }}>
                            <Box component="video" src={previewUrl} controls
                                sx={{ width: '100%', maxHeight: 280, bgcolor: '#000', display: 'block' }} />
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
                            <Tooltip title="Remove file">
                                <IconButton size="small" onClick={handleClearSelection} sx={{ color: '#EF4444' }}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                )}

                {/* Upload progress */}
                {uploading && (
                    <Box sx={{ mb: 2.5 }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                                {phaseLabel}
                            </Typography>
                            {uploadPhase === 'uploading' && (
                                <Typography sx={{ color: colors.brand, fontWeight: 700, fontSize: '0.8rem' }}>
                                    {uploadProgress}%
                                </Typography>
                            )}
                        </Stack>
                        <LinearProgress
                            variant={uploadPhase === 'uploading' ? 'determinate' : 'indeterminate'}
                            value={uploadPhase === 'uploading' ? uploadProgress : undefined}
                            sx={{
                                borderRadius: 2, height: 8,
                                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                                '& .MuiLinearProgress-bar': { bgcolor: colors.brand, borderRadius: 2 },
                            }}
                        />
                        {selectedFile && uploadPhase === 'uploading' && (
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.75rem', mt: 0.5 }}>
                                {formatBytes(Math.round(selectedFile.size * uploadProgress / 100))} of {formatBytes(selectedFile.size)}
                            </Typography>
                        )}
                    </Box>
                )}

                {/* Alerts */}
                {uploadSuccess && (
                    <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 2 }}
                        onClose={() => setUploadSuccess(false)}>
                        Hero video uploaded to Cloudinary and is now live on the home page! 🎉
                    </Alert>
                )}
                {uploadError && (
                    <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}
                        onClose={() => setUploadError(null)}>
                        {uploadError}
                    </Alert>
                )}

                {/* Buttons */}
                <Stack direction="row" spacing={2} alignItems="center">
                    {selectedFile && !uploading ? (
                        <>
                            <Button
                                variant="contained"
                                startIcon={<UploadIcon />}
                                onClick={handleUpload}
                                sx={{
                                    bgcolor: colors.brand, fontWeight: 600,
                                    textTransform: 'none', px: 3,
                                    '&:hover': { bgcolor: '#0e42b0' },
                                }}
                            >
                                Upload to Cloudinary
                            </Button>
                            <Button variant="outlined" onClick={handleClearSelection}
                                sx={{ borderColor: colors.border, color: colors.textSecondary,
                                    fontWeight: 600, textTransform: 'none' }}>
                                Cancel
                            </Button>
                        </>
                    ) : !uploading ? (
                        <Button
                            variant="outlined"
                            startIcon={<UploadIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                                borderColor: colors.brand, color: colors.brand,
                                fontWeight: 600, textTransform: 'none', px: 3,
                                '&:hover': { bgcolor: `${colors.brand}10` },
                            }}
                        >
                            Choose Video File
                        </Button>
                    ) : (
                        <Button variant="contained" disabled
                            startIcon={<CircularProgress size={16} sx={{ color: '#fff' }} />}
                            sx={{ bgcolor: colors.brand, fontWeight: 600, textTransform: 'none',
                                px: 3, '&.Mui-disabled': { bgcolor: colors.brand, opacity: 0.65 } }}>
                            {phaseLabel}
                        </Button>
                    )}
                </Stack>
            </Box>
        </Box>
    );
};

export default Settings;

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Stack, Card, CardContent, Grid,
    TextField, InputAdornment, Chip, Avatar, Skeleton, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Alert, CircularProgress, Select, MenuItem,
    FormControl, InputLabel,
} from '@mui/material';
import {
    Add, Search, Edit, Delete, OndemandVideo, PlayArrow,
    Close, AccessTime, CloudUpload, CheckCircle, Visibility,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { apiService } from '../../../services/api';

const TRACK = 'experta';

const STATUS_COLORS = {
    published: { label: 'Published', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    draft: { label: 'Draft', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    archived: { label: 'Archived', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
};

const CATEGORIES = [
    'Leadership & Governance',
    'Anti-Corruption',
    'Public Finance',
    'Ethics & Integrity',
    'Policy Making',
    'Institutional Accountability',
    'Civic Education',
    'Other',
];

const defaultForm = {
    title: '',
    description: '',
    category: '',
    duration: '',
    status: 'draft',
    thumbnail_url: '',
    video_url: '',
    tags: '',
    instructor: '',
};

const ExemplarSeriesAdmin = () => {
    const muiTheme = useTheme();
    const isDark = muiTheme.palette.mode === 'dark';

    const bg = isDark ? '#0C1322' : '#F8FAFC';
    const card = isDark ? '#111827' : '#FFFFFF';
    const border = isDark ? '#1F2937' : '#E2E8F0';
    const text = isDark ? '#FFFFFF' : '#1E293B';
    const textMuted = isDark ? '#9CA3AF' : '#64748B';
    const brand = '#1152D4';

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [alert, setAlert] = useState(null);

    const showAlert = (message, severity = 'success') => {
        setAlert({ message, severity });
        setTimeout(() => setAlert(null), 4000);
    };

    const fetchVideos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiService.get('/lms/courses', { params: { track: TRACK, per_page: 100 } });
            const items = Array.isArray(res?.data) ? res.data
                : Array.isArray(res?.data?.data) ? res.data.data
                : Array.isArray(res) ? res : [];
            setVideos(items);
        } catch {
            setVideos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchVideos(); }, [fetchVideos]);

    const openCreate = () => {
        setEditTarget(null);
        setForm(defaultForm);
        setDialogOpen(true);
    };

    const openEdit = (video) => {
        setEditTarget(video);
        setForm({
            title: video.title || '',
            description: video.description || '',
            category: video.category || '',
            duration: video.duration || '',
            status: video.status || 'draft',
            thumbnail_url: video.thumbnail_url || '',
            video_url: video.video_url || '',
            tags: Array.isArray(video.tags) ? video.tags.map(t => t.name || t).join(', ') : (video.tags || ''),
            instructor: video.instructor || video.tutor_name || '',
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.title.trim()) return showAlert('Title is required.', 'error');
        setSaving(true);
        const payload = {
            ...form,
            track: TRACK,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        };
        try {
            if (editTarget) {
                await apiService.put(`/lms/courses/${editTarget.id}`, payload);
                showAlert('Video updated successfully.');
            } else {
                await apiService.post('/lms/courses', payload);
                showAlert('Video created successfully.');
            }
            setDialogOpen(false);
            fetchVideos();
        } catch (err) {
            showAlert(err?.message || 'Failed to save. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await apiService.delete(`/lms/courses/${deleteTarget.id}`);
            showAlert('Video deleted.');
            setDeleteTarget(null);
            fetchVideos();
        } catch {
            showAlert('Failed to delete.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const filtered = videos.filter(v => {
        const matchSearch = !searchQuery
            || v.title?.toLowerCase().includes(searchQuery.toLowerCase())
            || v.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === 'all' || v.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const stats = {
        total: videos.length,
        published: videos.filter(v => v.status === 'published').length,
        draft: videos.filter(v => v.status === 'draft').length,
    };

    return (
        <Box sx={{ bgcolor: bg, minHeight: '100vh', color: text, p: { xs: 2, md: 4 } }}>
            {/* Header */}
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                        Exemplar Series
                    </Typography>
                    <Typography sx={{ color: textMuted, fontSize: '0.9rem' }}>
                        Manage expert video lessons for the Exemplar Series track.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={openCreate}
                    sx={{ bgcolor: brand, '&:hover': { bgcolor: '#0D3FA8' }, textTransform: 'none', fontWeight: 600, mt: { xs: 2, md: 0 }, borderRadius: 2 }}
                >
                    Add Video
                </Button>
            </Stack>

            {/* Alert */}
            {alert && (
                <Alert severity={alert.severity} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setAlert(null)}>
                    {alert.message}
                </Alert>
            )}

            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Videos', value: stats.total, color: brand, icon: <OndemandVideo /> },
                    { label: 'Published', value: stats.published, color: '#10B981', icon: <CheckCircle /> },
                    { label: 'Drafts', value: stats.draft, color: '#F59E0B', icon: <Edit /> },
                ].map(s => (
                    <Grid item xs={12} sm={4} key={s.label}>
                        <Card sx={{ bgcolor: card, border: `1px solid ${border}`, borderRadius: 2 }}>
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar sx={{ bgcolor: `${s.color}20`, color: s.color, borderRadius: 2 }}>{s.icon}</Avatar>
                                    <Box>
                                        <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: text, lineHeight: 1 }}>{s.value}</Typography>
                                        <Typography sx={{ color: textMuted, fontSize: '0.8rem' }}>{s.label}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Filters */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <TextField
                    placeholder="Search videos..."
                    size="small"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search sx={{ color: textMuted, fontSize: 20 }} /></InputAdornment>,
                    }}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { bgcolor: card, borderRadius: 2 } }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} label="Status"
                        sx={{ bgcolor: card, borderRadius: 2 }}>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="archived">Archived</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            {/* Video List */}
            {loading ? (
                <Stack spacing={2}>
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} variant="rounded" height={96} sx={{ bgcolor: border }} />
                    ))}
                </Stack>
            ) : filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <OndemandVideo sx={{ fontSize: 72, color: textMuted, mb: 2, opacity: 0.4 }} />
                    <Typography sx={{ color: textMuted, mb: 2 }}>
                        {searchQuery ? 'No videos match your search.' : 'No Exemplar Series videos yet.'}
                    </Typography>
                    <Button variant="outlined" startIcon={<Add />} onClick={openCreate}
                        sx={{ borderColor: brand, color: brand, textTransform: 'none' }}>
                        Add Your First Video
                    </Button>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {filtered.map(video => {
                        const st = STATUS_COLORS[video.status] || STATUS_COLORS.draft;
                        return (
                            <Card key={video.id} sx={{ bgcolor: card, border: `1px solid ${border}`, borderRadius: 2 }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                                        {/* Thumbnail */}
                                        <Box sx={{
                                            width: { xs: '100%', sm: 120 }, height: { xs: 120, sm: 72 },
                                            borderRadius: 1.5, overflow: 'hidden', flexShrink: 0,
                                            bgcolor: isDark ? '#1F2937' : '#E5E7EB',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {video.thumbnail_url ? (
                                                <Box component="img" src={video.thumbnail_url} alt={video.title}
                                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={e => { e.target.style.display = 'none'; }} />
                                            ) : (
                                                <PlayArrow sx={{ fontSize: 32, color: textMuted }} />
                                            )}
                                        </Box>
                                        {/* Info */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {video.title}
                                                </Typography>
                                                <Chip label={st.label} size="small"
                                                    sx={{ bgcolor: st.bg, color: st.color, fontWeight: 700, fontSize: '0.7rem', height: 22, flexShrink: 0 }} />
                                            </Stack>
                                            <Typography sx={{ color: textMuted, fontSize: '0.82rem', mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {video.description || 'No description'}
                                            </Typography>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                {video.duration && (
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <AccessTime sx={{ fontSize: 14, color: textMuted }} />
                                                        <Typography sx={{ fontSize: '0.8rem', color: textMuted }}>{video.duration}</Typography>
                                                    </Stack>
                                                )}
                                                {video.category && (
                                                    <Typography sx={{ fontSize: '0.8rem', color: textMuted }}>{video.category}</Typography>
                                                )}
                                            </Stack>
                                        </Box>
                                        {/* Actions */}
                                        <Stack direction="row" spacing={1} flexShrink={0}>
                                            <IconButton onClick={() => openEdit(video)} size="small"
                                                sx={{ color: brand, border: `1px solid ${border}`, borderRadius: 1.5 }}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton onClick={() => setDeleteTarget(video)} size="small"
                                                sx={{ color: '#EF4444', border: `1px solid ${border}`, borderRadius: 1.5 }}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { bgcolor: card, borderRadius: 3, border: `1px solid ${border}` } }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: text }}>
                        {editTarget ? 'Edit Video' : 'Add Exemplar Video'}
                    </Typography>
                    <IconButton onClick={() => !saving && setDialogOpen(false)} size="small" disabled={saving}>
                        <Close sx={{ color: textMuted }} />
                    </IconButton>
                </DialogTitle>
                <Divider sx={{ borderColor: border }} />
                <DialogContent sx={{ pt: 3 }}>
                    <Stack spacing={2.5}>
                        <TextField label="Title *" fullWidth size="small" value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                        <TextField label="Description" fullWidth multiline rows={3} size="small" value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} label="Category">
                                    {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} label="Status">
                                    <MenuItem value="draft">Draft</MenuItem>
                                    <MenuItem value="published">Published</MenuItem>
                                    <MenuItem value="archived">Archived</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField label="Duration (e.g. 24m)" size="small" fullWidth value={form.duration}
                                onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                            <TextField label="Instructor" size="small" fullWidth value={form.instructor}
                                onChange={e => setForm(p => ({ ...p, instructor: e.target.value }))} />
                        </Stack>
                        <TextField label="Thumbnail URL" size="small" fullWidth value={form.thumbnail_url}
                            onChange={e => setForm(p => ({ ...p, thumbnail_url: e.target.value }))}
                            InputProps={{ startAdornment: <InputAdornment position="start"><CloudUpload sx={{ fontSize: 18, color: textMuted }} /></InputAdornment> }} />
                        <TextField label="Video URL / Embed URL" size="small" fullWidth value={form.video_url}
                            onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))}
                            InputProps={{ startAdornment: <InputAdornment position="start"><PlayArrow sx={{ fontSize: 18, color: textMuted }} /></InputAdornment> }} />
                        <TextField label="Tags (comma-separated)" size="small" fullWidth value={form.tags}
                            onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                            placeholder="anti-corruption, leadership, governance" />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                    <Button onClick={() => setDialogOpen(false)} disabled={saving} sx={{ textTransform: 'none', color: textMuted }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}
                        sx={{ bgcolor: brand, '&:hover': { bgcolor: '#0D3FA8' }, textTransform: 'none', fontWeight: 600 }}>
                        {saving ? <CircularProgress size={20} color="inherit" /> : (editTarget ? 'Save Changes' : 'Create Video')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { bgcolor: card, borderRadius: 3, border: `1px solid ${border}` } }}>
                <DialogTitle sx={{ fontWeight: 700, color: text }}>Delete Video?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: textMuted }}>
                        Are you sure you want to delete <strong style={{ color: text }}>{deleteTarget?.title}</strong>?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDeleteTarget(null)} disabled={deleting} sx={{ textTransform: 'none', color: textMuted }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}
                        sx={{ textTransform: 'none', fontWeight: 600 }}>
                        {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExemplarSeriesAdmin;

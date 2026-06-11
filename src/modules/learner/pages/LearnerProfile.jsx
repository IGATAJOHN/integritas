import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Stack, Card, CardContent, Avatar,
    Button, TextField, Divider, Chip, Grid, CircularProgress,
    Alert, Tab, Tabs, LinearProgress, IconButton, Tooltip,
} from '@mui/material';
import {
    Edit, Save, Cancel, School, CheckCircle, AccessTime,
    EmojiEvents, Person, Email, Phone, LocationOn, LinkedIn,
    Twitter, Language, VerifiedUser, TrendingUp, MenuBook,
    ContentCopy, Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import { useAuth, useThemeMode } from '../../../contexts';
import { apiService } from '../../../services/api';
import theme from '../../../styles/theme';

const getColors = (isDark) => ({
    bg: isDark ? '#080D19' : '#F8FAFC',
    card: isDark ? '#111827' : '#FFFFFF',
    cardHover: isDark ? '#1A2230' : '#F1F5F9',
    border: isDark ? '#1F2937' : '#E2E8F0',
    text: isDark ? '#FFFFFF' : '#1E293B',
    muted: isDark ? '#9CA3AF' : '#64748B',
    inputBg: isDark ? '#1F2937' : '#F8FAFC',
    brand: theme.colors.brand,
    success: '#10B981',
    warning: '#F59E0B',
});

const LearnerProfile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { isDark } = useThemeMode();
    const colors = getColors(isDark);

    const [tab, setTab] = useState(0);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [form, setForm] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        location: user?.location || '',
        linkedin_url: user?.linkedin_url || '',
        twitter_url: user?.twitter_url || '',
        website_url: user?.website_url || '',
        organisation: user?.organisation || user?.organization || '',
        job_title: user?.job_title || '',
    });

    const showAlert = (message, severity = 'success') => {
        setAlert({ message, severity });
        setTimeout(() => setAlert(null), 4000);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiService.get('/lms/enrollments/me', { params: { per_page: 50 } });
                const items = Array.isArray(res?.data) ? res.data
                    : Array.isArray(res?.data?.data) ? res.data.data
                    : Array.isArray(res) ? res : [];
                setEnrollments(items);
            } catch {
                setEnrollments([]);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiService.put('/auth/profile', form);
            showAlert('Profile updated successfully!');
            setEditing(false);
        } catch (err) {
            showAlert(err?.message || 'Failed to update profile. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch {
            navigate('/login');
        }
    };

    const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.name || 'Learner';
    const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'L';

    const completedCount = enrollments.filter(e => ['completed', 'finished'].includes(String(e.status || '').toLowerCase())).length;
    const inProgressCount = enrollments.filter(e => ['active', 'in_progress', 'enrolled'].includes(String(e.status || '').toLowerCase())).length;
    const overallProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (Number(e.progress_percentage || 0)), 0) / enrollments.length)
        : 0;

    const profileFields = [
        { key: 'first_name', label: 'First Name', icon: <Person sx={{ fontSize: 18 }} />, type: 'text' },
        { key: 'last_name', label: 'Last Name', icon: <Person sx={{ fontSize: 18 }} />, type: 'text' },
        { key: 'email', label: 'Email', icon: <Email sx={{ fontSize: 18 }} />, type: 'email' },
        { key: 'phone', label: 'Phone', icon: <Phone sx={{ fontSize: 18 }} />, type: 'text' },
        { key: 'organisation', label: 'Organisation', icon: <School sx={{ fontSize: 18 }} />, type: 'text' },
        { key: 'job_title', label: 'Job Title', icon: <VerifiedUser sx={{ fontSize: 18 }} />, type: 'text' },
        { key: 'location', label: 'Location', icon: <LocationOn sx={{ fontSize: 18 }} />, type: 'text' },
    ];

    return (
        <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', color: colors.text }}>
            <Header />
            <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, py: 6 }}>

                {alert && (
                    <Alert severity={alert.severity} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setAlert(null)}>
                        {alert.message}
                    </Alert>
                )}

                {/* Profile Hero Card */}
                <Card sx={{ bgcolor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 3, mb: 4, overflow: 'visible' }}>
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }}>
                            {/* Avatar */}
                            <Box sx={{ position: 'relative', flexShrink: 0, alignSelf: { xs: 'center', md: 'flex-start' } }}>
                                <Avatar
                                    src={user?.avatar_url || user?.profile_picture}
                                    sx={{
                                        width: 96, height: 96,
                                        bgcolor: colors.brand,
                                        fontSize: '2rem', fontWeight: 700,
                                        border: `4px solid ${colors.border}`,
                                        boxShadow: '0 8px 32px rgba(17,82,212,0.2)',
                                    }}
                                >
                                    {initials}
                                </Avatar>
                                {user?.is_verified && (
                                    <CheckCircle sx={{
                                        position: 'absolute', bottom: 2, right: 2,
                                        color: colors.success, bgcolor: colors.card, borderRadius: '50%',
                                        fontSize: 22,
                                    }} />
                                )}
                            </Box>

                            {/* Info */}
                            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{fullName}</Typography>
                                <Typography sx={{ color: colors.muted, mb: 1, fontSize: '0.9rem' }}>
                                    {user?.job_title && `${user.job_title} • `}{user?.email}
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                                    {user?.organisation && (
                                        <Chip icon={<School sx={{ fontSize: 14 }} />} label={user.organisation} size="small"
                                            sx={{ bgcolor: `${colors.brand}18`, color: colors.brand, fontWeight: 600, fontSize: '0.75rem' }} />
                                    )}
                                    {user?.location && (
                                        <Chip icon={<LocationOn sx={{ fontSize: 14 }} />} label={user.location} size="small"
                                            sx={{ bgcolor: isDark ? '#1F2937' : '#F1F5F9', color: colors.muted, fontSize: '0.75rem' }} />
                                    )}
                                </Stack>
                            </Box>

                            {/* Actions */}
                            <Stack direction="column" spacing={1} flexShrink={0} alignItems={{ xs: 'stretch', md: 'flex-end' }}>
                                {!editing ? (
                                    <Button startIcon={<Edit />} variant="outlined" onClick={() => setEditing(true)}
                                        sx={{ borderColor: colors.brand, color: colors.brand, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <Stack direction="row" spacing={1}>
                                        <Button startIcon={<Cancel />} variant="outlined" onClick={() => setEditing(false)} disabled={saving}
                                            sx={{ borderColor: colors.border, color: colors.muted, textTransform: 'none', borderRadius: 2 }}>
                                            Cancel
                                        </Button>
                                        <Button startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                                            variant="contained" onClick={handleSave} disabled={saving}
                                            sx={{ bgcolor: colors.brand, '&:hover': { bgcolor: '#0D3FA8' }, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                                            Save
                                        </Button>
                                    </Stack>
                                )}
                                <Button startIcon={<Logout />} color="error" onClick={handleLogout}
                                    sx={{ textTransform: 'none', fontSize: '0.85rem' }}>
                                    Sign Out
                                </Button>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Stats Row */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[
                        { icon: <MenuBook />, label: 'Enrolled', value: enrollments.length, color: colors.brand },
                        { icon: <CheckCircle />, label: 'Completed', value: completedCount, color: colors.success },
                        { icon: <TrendingUp />, label: 'In Progress', value: inProgressCount, color: colors.warning },
                        { icon: <EmojiEvents />, label: 'Avg Progress', value: `${overallProgress}%`, color: '#A855F7' },
                    ].map(s => (
                        <Grid item xs={6} sm={3} key={s.label}>
                            <Card sx={{ bgcolor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 2.5, height: '100%' }}>
                                <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                                    <Avatar sx={{ bgcolor: `${s.color}18`, color: s.color, mx: 'auto', mb: 1, borderRadius: 2 }}>{s.icon}</Avatar>
                                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: colors.text }}>{loadingData ? '—' : s.value}</Typography>
                                    <Typography sx={{ color: colors.muted, fontSize: '0.78rem' }}>{s.label}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Tabs */}
                <Box sx={{ borderBottom: `1px solid ${colors.border}`, mb: 3 }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)}
                        sx={{
                            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, color: colors.muted, '&.Mui-selected': { color: colors.text } },
                            '& .MuiTabs-indicator': { bgcolor: colors.brand, height: 3 },
                        }}>
                        <Tab label="Personal Info" />
                        <Tab label="My Courses" />
                        <Tab label="Social Links" />
                    </Tabs>
                </Box>

                {/* Tab: Personal Info */}
                {tab === 0 && (
                    <Card sx={{ bgcolor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 3 }}>
                        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                            <Typography sx={{ fontWeight: 700, mb: 3, fontSize: '1rem', color: colors.text }}>
                                Profile Details
                            </Typography>
                            <Grid container spacing={2.5}>
                                {profileFields.map(field => (
                                    <Grid item xs={12} sm={6} key={field.key}>
                                        {editing ? (
                                            <TextField
                                                label={field.label}
                                                type={field.type}
                                                size="small"
                                                fullWidth
                                                value={form[field.key]}
                                                onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                                                InputProps={{
                                                    startAdornment: <Box sx={{ mr: 1, color: colors.muted }}>{field.icon}</Box>,
                                                }}
                                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: colors.inputBg, borderRadius: 2 } }}
                                            />
                                        ) : (
                                            <Box sx={{ p: 2, bgcolor: isDark ? '#1A2230' : '#F8FAFC', borderRadius: 2, border: `1px solid ${colors.border}` }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Box sx={{ color: colors.muted }}>{field.icon}</Box>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '0.72rem', color: colors.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            {field.label}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '0.9rem', color: colors.text }}>
                                                            {form[field.key] || <span style={{ color: colors.muted }}>Not set</span>}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        )}
                                    </Grid>
                                ))}
                                <Grid item xs={12}>
                                    {editing ? (
                                        <TextField
                                            label="Bio"
                                            multiline rows={4}
                                            size="small"
                                            fullWidth
                                            value={form.bio}
                                            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                                            placeholder="Tell us about yourself..."
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: colors.inputBg, borderRadius: 2 } }}
                                        />
                                    ) : (
                                        <Box sx={{ p: 2.5, bgcolor: isDark ? '#1A2230' : '#F8FAFC', borderRadius: 2, border: `1px solid ${colors.border}` }}>
                                            <Typography sx={{ fontSize: '0.72rem', color: colors.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Bio</Typography>
                                            <Typography sx={{ fontSize: '0.9rem', color: form.bio ? colors.text : colors.muted, lineHeight: 1.7 }}>
                                                {form.bio || 'No bio added yet.'}
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                )}

                {/* Tab: My Courses */}
                {tab === 1 && (
                    <Box>
                        {loadingData ? (
                            <Stack spacing={2}>
                                {[1, 2, 3].map(i => (
                                    <Card key={i} sx={{ bgcolor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 2.5 }}>
                                        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Box sx={{ width: 60, height: 60, bgcolor: colors.border, borderRadius: 1.5 }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ height: 16, bgcolor: colors.border, borderRadius: 1, mb: 1, width: '60%' }} />
                                                <Box sx={{ height: 12, bgcolor: colors.border, borderRadius: 1, width: '40%' }} />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        ) : enrollments.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <School sx={{ fontSize: 64, color: colors.muted, opacity: 0.4, mb: 2 }} />
                                <Typography sx={{ color: colors.muted, mb: 2 }}>You haven't enrolled in any courses yet.</Typography>
                                <Button variant="outlined" onClick={() => navigate('/explore')}
                                    sx={{ borderColor: colors.brand, color: colors.brand, textTransform: 'none' }}>
                                    Browse Courses
                                </Button>
                            </Box>
                        ) : (
                            <Stack spacing={2}>
                                {enrollments.map(enr => {
                                    const progress = Number(enr.progress_percentage || 0);
                                    const status = String(enr.status || '').toLowerCase();
                                    const statusColor = status === 'completed' ? colors.success
                                        : status === 'active' || status === 'in_progress' ? colors.brand
                                        : colors.muted;
                                    const statusLabel = status === 'completed' ? 'Completed'
                                        : status === 'in_progress' ? 'In Progress'
                                        : status === 'active' ? 'Active'
                                        : status || 'Enrolled';
                                    return (
                                        <Card key={enr.id} sx={{ bgcolor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 2.5, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: colors.brand } }}
                                            onClick={() => navigate(`/explore/course/${enr.course?.slug || enr.course?.id || enr.course_id}`)}>
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                                                    {/* Thumbnail */}
                                                    <Box sx={{ width: { xs: '100%', sm: 80 }, height: { xs: 120, sm: 60 }, borderRadius: 1.5, overflow: 'hidden', bgcolor: isDark ? '#1F2937' : '#E5E7EB', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {enr.course?.image ? (
                                                            <Box component="img" src={enr.course.image} alt={enr.course.title}
                                                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <School sx={{ color: colors.muted, fontSize: 28 }} />
                                                        )}
                                                    </Box>
                                                    {/* Info */}
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                                            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {enr.course?.title || 'Untitled Course'}
                                                            </Typography>
                                                            <Chip label={statusLabel} size="small"
                                                                sx={{ bgcolor: `${statusColor}18`, color: statusColor, fontWeight: 700, fontSize: '0.68rem', height: 20, flexShrink: 0 }} />
                                                        </Stack>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <LinearProgress variant="determinate" value={progress}
                                                                sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: colors.border, '& .MuiLinearProgress-bar': { bgcolor: statusColor, borderRadius: 3 } }} />
                                                            <Typography sx={{ fontSize: '0.78rem', color: colors.muted, flexShrink: 0 }}>{progress}%</Typography>
                                                        </Box>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                )}

                {/* Tab: Social Links */}
                {tab === 2 && (
                    <Card sx={{ bgcolor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 3 }}>
                        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                            <Typography sx={{ fontWeight: 700, mb: 3, fontSize: '1rem', color: colors.text }}>Social Links</Typography>
                            <Stack spacing={2.5}>
                                {[
                                    { key: 'linkedin_url', label: 'LinkedIn', icon: <LinkedIn sx={{ fontSize: 20, color: '#0A66C2' }} />, placeholder: 'https://linkedin.com/in/yourprofile' },
                                    { key: 'twitter_url', label: 'Twitter / X', icon: <Twitter sx={{ fontSize: 20, color: '#1DA1F2' }} />, placeholder: 'https://twitter.com/yourhandle' },
                                    { key: 'website_url', label: 'Website', icon: <Language sx={{ fontSize: 20, color: colors.brand }} />, placeholder: 'https://yourwebsite.com' },
                                ].map(field => (
                                    <Box key={field.key}>
                                        {editing ? (
                                            <TextField
                                                label={field.label}
                                                size="small"
                                                fullWidth
                                                value={form[field.key]}
                                                onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                                                placeholder={field.placeholder}
                                                InputProps={{ startAdornment: <Box sx={{ mr: 1 }}>{field.icon}</Box> }}
                                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: colors.inputBg, borderRadius: 2 } }}
                                            />
                                        ) : (
                                            <Box sx={{ p: 2.5, bgcolor: isDark ? '#1A2230' : '#F8FAFC', borderRadius: 2, border: `1px solid ${colors.border}` }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        {field.icon}
                                                        <Box>
                                                            <Typography sx={{ fontSize: '0.72rem', color: colors.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field.label}</Typography>
                                                            {form[field.key] ? (
                                                                <Typography component="a" href={form[field.key]} target="_blank" rel="noopener noreferrer"
                                                                    sx={{ fontSize: '0.875rem', color: colors.brand, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                                                    {form[field.key]}
                                                                </Typography>
                                                            ) : (
                                                                <Typography sx={{ fontSize: '0.875rem', color: colors.muted }}>Not set</Typography>
                                                            )}
                                                        </Box>
                                                    </Stack>
                                                    {form[field.key] && (
                                                        <Tooltip title="Copy link">
                                                            <IconButton size="small" onClick={() => navigator.clipboard.writeText(form[field.key])}>
                                                                <ContentCopy sx={{ fontSize: 16, color: colors.muted }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Stack>
                            {editing && (
                                <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                                    <Button onClick={() => setEditing(false)} disabled={saving} sx={{ textTransform: 'none', color: colors.muted }}>Cancel</Button>
                                    <Button variant="contained" onClick={handleSave} disabled={saving}
                                        sx={{ bgcolor: colors.brand, '&:hover': { bgcolor: '#0D3FA8' }, textTransform: 'none', fontWeight: 600 }}>
                                        {saving ? <CircularProgress size={18} color="inherit" /> : 'Save Changes'}
                                    </Button>
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Box>
    );
};

export default LearnerProfile;

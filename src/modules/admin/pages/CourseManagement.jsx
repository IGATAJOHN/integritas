import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { adminCoursesService } from '../services';
import { CircularProgress } from '@mui/material';
import { formatCurrency, getImageUrl } from '../../../utils';
import {
    searchBarStyle,
    searchInputStyle,
    tableHeaderCellStyle,
    tableBodyCellStyle,
    paperStyle,
} from '../../../styles/formStyles';
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    IconButton,
    Chip,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Modal,
    TextField,
    InputBase,
    Tooltip,
    Collapse,
    Divider,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    ToggleButton,
    ToggleButtonGroup,
    InputAdornment,
} from '@mui/material';
import {
    Search,
    Add,
    Info,
    Block,
    CheckCircle,
    Close,
    School,
    ExpandMore,
    ExpandLess,
    PlayCircleOutline,
    ArticleOutlined,
    QuizOutlined,
    History,
    StarBorderOutlined,
    EngineeringOutlined,
} from '@mui/icons-material';
import theme from '../../../styles/theme';

const TRACK_FOUNDATIONAL = 'foundational';
const TRACK_EXPERT = 'expert';

const trackChip = (track) => {
    const t = String(track || '').toLowerCase();
    if (t === TRACK_FOUNDATIONAL) return { label: 'Foundational', color: '#10B981', bg: 'rgba(16,185,129,0.15)' };
    if (t === TRACK_EXPERT) return { label: 'Expert', color: '#A855F7', bg: 'rgba(168,85,247,0.15)' };
    return { label: 'Untracked', color: '#9CA3AF', bg: 'rgba(156,163,175,0.15)' };
};



const CourseManagement = () => {
    const navigate = useNavigate();
    const muiTheme = useMuiTheme();
    const isDark = muiTheme.palette.mode === 'dark';

    // Input styling that matches LoginPage exactly, but adapts to dark/light
    const inputSx = {
        '& .MuiOutlinedInput-root': {
            bgcolor: isDark ? '#1E293B' : '#F8FAFC',
            borderRadius: 1.5,
            '& fieldset': { borderColor: isDark ? '#374151' : '#CBD5E1' },
            '&:hover fieldset': { borderColor: isDark ? '#4B5563' : '#94A3B8' },
            '&.Mui-focused fieldset': { borderColor: theme.colors.brand },
            '&.Mui-error fieldset': { borderColor: '#EF4444' },
        },
        '& .MuiInputBase-input': {
            py: 1.25,
            fontSize: '0.875rem',
            color: isDark ? '#FFFFFF' : '#1E293B',
            '&::placeholder': { color: '#9CA3AF', opacity: 1 },
        },
    };

    const modalBg    = isDark ? '#111827' : '#FFFFFF';
    const modalBorder = isDark ? '#374151' : '#E2E8F0';
    const cardBg     = isDark ? '#1E293B' : '#F1F5F9';
    const labelColor = isDark ? '#E5E7EB' : '#374151';
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [trackFilter, setTrackFilter] = useState('all');
    const [pendingChanges, setPendingChanges] = useState({}); // Map of courseId -> change

    // Create dialog state
    const [createOpen, setCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [form, setForm] = useState({
        title: '',
        summary: '',
        description: '',
        type: TRACK_FOUNDATIONAL,
        price: '',
    });

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const [coursesResp, changesResp] = await Promise.all([
                adminCoursesService.listCourses({
                    q: searchTerm,
                    track: trackFilter === 'all' ? undefined : trackFilter,
                }),
                adminCoursesService.listPriceChanges({ status: 'pending' })
            ]);

            setCourses(coursesResp.data || []);

            const changesMap = {};
            (changesResp?.data || changesResp || []).forEach(change => {
                changesMap[change.course_id] = change;
            });
            setPendingChanges(changesMap);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCourses();
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, trackFilter]);

    const handleViewCourse = (course) => {
        navigate(`/admin/content/courses/${course.id}`);
    };

    const resetCreateForm = () => {
        setForm({ title: '', summary: '', description: '', type: TRACK_FOUNDATIONAL, price: '' });
        setCreateError('');
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setCreateError('');
        const title = form.title.trim();
        const description = form.description.trim();
        if (title.length < 3) {
            setCreateError('Title must be at least 3 characters.');
            return;
        }
        if (!form.type) {
            setCreateError('Please select a course type.');
            return;
        }
        const priceNumber = form.price === '' ? 0 : Number(form.price);
        if (!Number.isFinite(priceNumber) || priceNumber < 0) {
            setCreateError('Price must be a non-negative number.');
            return;
        }
        try {
            setCreating(true);
            const created = await adminCoursesService.createCourse({
                type: form.type,
                title,
                summary: form.summary.trim(),
                description,
                price: priceNumber,
                currency: 'NGN',
            });
            setCreateOpen(false);
            resetCreateForm();
            setSnackbar({
                open: true,
                message: `Course "${title}" created.`,
                severity: 'success',
            });
            await fetchCourses();
            if (created?.id) {
                navigate(`/admin/content/courses/${created.id}`);
            }
        } catch (err) {
            setCreateError(err?.message || 'Failed to create course.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            {/* Header Section */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Course Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Manage all foundational and expert courses.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => { resetCreateForm(); setCreateOpen(true); }}
                    sx={{ textTransform: 'none', bgcolor: theme.colors.brand, '&:hover': { bgcolor: theme.colors.brandHover } }}
                >
                    Create Course
                </Button>
            </Stack>

            {/* Search + Track filter */}
            <Paper sx={{ ...paperStyle, p: 2, mb: 4 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={2} justifyContent="space-between">
                    <Box sx={{ ...searchBarStyle, maxWidth: 400, flex: 1 }}>
                        <Search sx={{ color: "#9CA3AF", fontSize: 20 }} />
                        <InputBase
                            placeholder="Search courses, tutors, categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={searchInputStyle}
                        />
                    </Box>
                    <ToggleButtonGroup
                        value={trackFilter}
                        exclusive
                        size="small"
                        onChange={(_e, v) => v && setTrackFilter(v)}
                        sx={{
                            '& .MuiToggleButton-root': {
                                color: '#9CA3AF',
                                borderColor: '#374151',
                                textTransform: 'none',
                                px: 2,
                                '&.Mui-selected': {
                                    bgcolor: theme.colors.brand,
                                    color: '#fff',
                                    '&:hover': { bgcolor: theme.colors.brandHover },
                                },
                            },
                        }}
                    >
                        <ToggleButton value="all">All</ToggleButton>
                        <ToggleButton value={TRACK_FOUNDATIONAL}>
                            <StarBorderOutlined sx={{ fontSize: 16, mr: 0.5 }} />
                            Foundational
                        </ToggleButton>
                        <ToggleButton value={TRACK_EXPERT}>
                            <EngineeringOutlined sx={{ fontSize: 16, mr: 0.5 }} />
                            Expert
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            </Paper>

            {/* Courses Table */}
            <TableContainer component={Paper} sx={paperStyle}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={tableHeaderCellStyle}>Course</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Track</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Tutor</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Students</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Price</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
                            <TableCell align="right" sx={tableHeaderCellStyle}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 8, color: '#9CA3AF' }}>
                                    No courses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            courses.map((course) => {
                                const isActive = course.status === 'active' || course.status === 'published';
                                const statusLabel = course.status ? course.status.charAt(0).toUpperCase() + course.status.slice(1) : 'Unknown';
                                // Determine a friendly category label from multiple possible response shapes
                                const categoryLabel = course.category?.name
                                    || course.category?.title
                                    || course.category_name
                                    || (course.categories && course.categories[0]?.name)
                                    || 'Uncategorized';

                                // Resolve tutor data and friendly display name
                                const tutorData = course.tutor || course.user || course.creator || course.created_by;
                                const tutorName = (() => {
                                    if (!tutorData) return null;
                                    if (typeof tutorData === 'string') {
                                        const s = String(tutorData).trim();
                                        return s || null;
                                    }
                                    const first = String(tutorData.first_name || tutorData.firstName || '').trim();
                                    const last = String(tutorData.last_name || tutorData.lastName || '').trim();
                                    if (first || last) return `${first} ${last}`.trim();
                                    const name = String(
                                        tutorData.name || tutorData.full_name || tutorData.fullName || tutorData.display_name || tutorData.displayName || tutorData.username || tutorData.email || ''
                                    ).trim();
                                    return name || null;
                                })();
                                const tutorInitial = (() => {
                                    if (!tutorData) return '?';
                                    if (typeof tutorData === 'string') return (tutorData[0] || '?');
                                    return (tutorData.first_name?.[0] || tutorData.firstName?.[0] || tutorData.name?.[0] || tutorData.username?.[0] || '?');
                                })();
                                return (
                                    <TableRow key={course.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#fff' }}>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 1.5,
                                                        bgcolor: theme.colors.brand,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {course.image_url ? (
                                                        <img src={getImageUrl(course.image_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <School sx={{ color: '#fff', fontSize: 20 }} />
                                                    )}
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>
                                                        {course.title}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                        {course.modules_count || 0} modules • {course.lessons_count || 0} lessons
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            {(() => {
                                                const t = trackChip(course.track);
                                                return (
                                                    <Chip
                                                        label={t.label}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: t.bg,
                                                            color: t.color,
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            border: `1px solid ${t.color}55`,
                                                        }}
                                                    />
                                                );
                                            })()}
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                {/* Check tutor, user, or creator (from with_audit) */}
                                                <>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#7C3AED', fontSize: '0.8rem' }} src={tutorData?.avatar_url || tutorData?.profile_photo_url}>
                                                        {tutorInitial}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ color: '#E5E7EB' }}>
                                                        {tutorName || 'Unknown'}
                                                    </Typography>
                                                </>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                                                    {course.students_count || 0}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                    enrolled
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                                                {course.price > 0
                                                    ? formatCurrency(course.price, course.currency)
                                                    : 'Free'}
                                            </Typography>
                                            {pendingChanges[course.id] && (
                                                <Tooltip title={`Pending Change: ${formatCurrency(pendingChanges[course.id].new_amount, pendingChanges[course.id].new_currency)}`}>
                                                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: '#3B82F6', mt: 0.5 }}>
                                                        <History sx={{ fontSize: 12 }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                            {formatCurrency(pendingChanges[course.id].new_amount, pendingChanges[course.id].new_currency)}
                                                        </Typography>
                                                    </Stack>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Chip
                                                icon={isActive ? <CheckCircle sx={{ fontSize: 14 }} /> : <Block sx={{ fontSize: 14 }} />}
                                                label={statusLabel}
                                                size="small"
                                                sx={{
                                                    bgcolor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                    color: isActive ? '#10B981' : '#EF4444',
                                                    fontSize: '0.75rem',
                                                    '& .MuiChip-icon': {
                                                        color: isActive ? '#10B981' : '#EF4444',
                                                    },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right" sx={tableBodyCellStyle}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleViewCourse(course)}
                                                startIcon={<Info fontSize="small" />}
                                                sx={{
                                                    bgcolor: '#1E293B',
                                                    color: '#3B82F6',
                                                    textTransform: 'none',
                                                    boxShadow: 'none',
                                                    '&:hover': { bgcolor: '#334155' }
                                                }}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create Course Dialog */}
            <Dialog
                open={createOpen}
                onClose={() => !creating && setCreateOpen(false)}
                maxWidth="sm"
                fullWidth
                disableRestoreFocus
                PaperProps={{
                    component: 'form',
                    onSubmit: handleCreateCourse,
                    sx: { bgcolor: modalBg, border: `1px solid ${modalBorder}`, borderRadius: 2 },
                }}
            >
                <DialogTitle sx={{ borderBottom: `1px solid ${modalBorder}`, pb: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar sx={{ bgcolor: theme.colors.brand, width: 36, height: 36 }}>
                                <School fontSize="small" />
                            </Avatar>
                            <Box>
                                <Typography sx={{ fontWeight: 700 }}>Create New Course</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Pick the type first — it cannot be changed later.
                                </Typography>
                            </Box>
                        </Stack>
                        <IconButton onClick={() => { setCreateOpen(false); resetCreateForm(); }} sx={{ color: 'text.secondary' }}>
                            <Close fontSize="small" />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
                    {createError && (
                        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setCreateError('')}>
                            {createError}
                        </Alert>
                    )}

                    <Stack spacing={3}>
                        {/* Type selector */}
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 1 }}>
                                Course Type <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                            </Typography>
                            <Stack direction="row" spacing={1.5}>
                                {[
                                    { value: TRACK_FOUNDATIONAL, icon: <StarBorderOutlined sx={{ fontSize: 18 }} />, label: 'Foundational', sub: 'Admin-managed · leads to certificate' },
                                    { value: TRACK_EXPERT, icon: <EngineeringOutlined sx={{ fontSize: 18 }} />, label: 'Expert', sub: 'Tutor-delivered · flexible structure' },
                                ].map(opt => {
                                    const selected = form.type === opt.value;
                                    return (
                                        <Box
                                            key={opt.value}
                                            onClick={() => setForm(prev => ({ ...prev, type: opt.value }))}
                                            sx={{
                                                flex: 1, p: 2, borderRadius: 2, cursor: 'pointer',
                                                border: `2px solid ${selected ? theme.colors.brand : modalBorder}`,
                                                bgcolor: selected ? 'rgba(23,138,131,0.08)' : cardBg,
                                                transition: 'border-color 0.15s',
                                                '&:hover': { borderColor: selected ? theme.colors.brand : theme.colors.brandMuted },
                                            }}
                                        >
                                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                                <Box sx={{ color: selected ? theme.colors.brand : 'text.secondary' }}>{opt.icon}</Box>
                                                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{opt.label}</Typography>
                                            </Stack>
                                            <Typography variant="caption" color="text.secondary">{opt.sub}</Typography>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Box>

                        {/* Title */}
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.75 }}>
                                Course Title <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="e.g. Introduction to Ethics in Governance"
                                value={form.title}
                                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                autoFocus
                                inputProps={{ maxLength: 160 }}
                                sx={inputSx}
                            />
                        </Box>

                        {/* Summary */}
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.75 }}>
                                Summary <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}> — shown in catalogue</Box>
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="One or two sentences about what this course covers."
                                value={form.summary}
                                onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
                                inputProps={{ maxLength: 300 }}
                                sx={inputSx}
                            />
                        </Box>

                        {/* Description */}
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.75 }}>
                                Full Description <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}> — optional</Box>
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Detailed overview, learning outcomes, prerequisites…"
                                value={form.description}
                                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                inputProps={{ maxLength: 2000 }}
                                sx={inputSx}
                            />
                        </Box>

                        {/* Price */}
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.75 }}>
                                {form.type === TRACK_FOUNDATIONAL ? 'Enrolment Fee' : 'Course Price'}
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                placeholder="0"
                                value={form.price}
                                onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                                inputProps={{ min: 0, step: 100 }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>₦</Typography></InputAdornment>,
                                }}
                                helperText={form.type === TRACK_FOUNDATIONAL ? 'Recommended: NGN 5,000' : 'Set 0 for a free course'}
                                sx={inputSx}
                            />
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${modalBorder}`, gap: 1 }}>
                    <Button
                        onClick={() => { setCreateOpen(false); resetCreateForm(); }}
                        disabled={creating}
                        sx={{ textTransform: 'none', color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={creating || !form.title.trim()}
                        sx={{
                            textTransform: 'none', fontWeight: 600,
                            bgcolor: theme.colors.brand,
                            '&:hover': { bgcolor: theme.colors.brandHover },
                            '&:disabled': { bgcolor: '#374151', color: '#9CA3AF' },
                        }}
                    >
                        {creating ? 'Creating…' : 'Create Course'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CourseManagement;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminCoursesService } from '../services';
import { CircularProgress } from '@mui/material';
import { formatCurrency, getImageUrl } from '../../../utils';
import {
    textFieldStyle,
    selectStyle,
    selectMenuProps,
    searchBarStyle,
    searchInputStyle,
    tableHeaderCellStyle,
    tableBodyCellStyle,
    paperStyle,
    primaryButtonStyle,
    scrollableModalBody,
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
    TextField,
    InputBase,
    Tooltip,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
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

const TYPE_FOUNDATIONAL = 'foundational';
const TYPE_EXPERT = 'expert';

const getCourseType = (course = {}) => String(course.type || course.track || course.course_type || '').toLowerCase();

const courseTypeChip = (courseType) => {
    const t = String(courseType || '').toLowerCase();
    if (t === TYPE_FOUNDATIONAL) return { label: 'Foundational', color: '#10B981', bg: 'rgba(16,185,129,0.15)' };
    if (t === TYPE_EXPERT) return { label: 'Expert', color: '#A855F7', bg: 'rgba(168,85,247,0.15)' };
    return { label: 'Unknown', color: '#9CA3AF', bg: 'rgba(156,163,175,0.15)' };
};

const getCourseStatus = (course = {}) => {
    const rawStatus = String(course.status || course.publication_status || course.publish_status || '').toLowerCase();
    const isPublished = Boolean(course.published_at || course.is_published || course.published);

    if (rawStatus === 'active') return { label: 'Published', state: 'published' };
    if (rawStatus === 'published') return { label: 'Published', state: 'published' };
    if (rawStatus === 'draft' || rawStatus === 'unpublished') return { label: 'Draft', state: 'draft' };
    if (rawStatus === 'rejected') return { label: 'Rejected', state: 'rejected' };
    if (rawStatus === 'pending' || rawStatus === 'pending_review') return { label: 'Pending', state: 'pending' };
    if (isPublished) return { label: 'Published', state: 'published' };
    return { label: 'Draft', state: 'draft' };
};

const statusChipStyle = (state) => {
    if (state === 'published') return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
    if (state === 'rejected') return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
    if (state === 'pending') return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
    return { color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.15)' };
};

const normalizeMoneyInput = (value) => String(value || '').replace(/[^\d]/g, '');

const formatMoneyInput = (value) => {
    const digits = normalizeMoneyInput(value);
    if (!digits) return '';
    return new Intl.NumberFormat('en-NG').format(Number(digits));
};

const toMoneyNumber = (value) => {
    const normalized = String(value ?? '').replace(/,/g, '');
    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
};

const readSettingValue = (settings, keys = []) => {
    const payload = settings?.data ?? settings;
    if (!payload) return undefined;

    if (Array.isArray(payload)) {
        const item = payload.find((entry) => keys.includes(String(entry?.key || entry?.name || '').toLowerCase()));
        return item?.value ?? item?.current_value ?? item?.default ?? item?.meta?.default;
    }

    if (typeof payload === 'object') {
        for (const key of keys) {
            const value = payload[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                return value.value ?? value.current_value ?? value.default ?? value.meta?.default;
            }
            if (value !== undefined && value !== null) return value;
        }
    }

    return undefined;
};

const firstMoneyValue = (values = []) => {
    for (const { value, divisor = 1 } of values) {
        const amount = toMoneyNumber(value);
        if (amount > 0) return amount / divisor;
    }
    return 0;
};

const getPricingSettingsFee = (settings) => firstMoneyValue([
    { value: readSettingValue(settings, ['foundational_enrolment_fee_kobo', 'foundational_enrollment_fee_kobo', 'enrolment_fee_kobo', 'enrollment_fee_kobo', 'course_enrolment_fee_kobo', 'course_enrollment_fee_kobo', 'course_fee_kobo', 'foundational_fee_kobo']), divisor: 100 },
    { value: readSettingValue(settings, ['foundational_enrolment_fee', 'foundational_enrollment_fee', 'enrolment_fee', 'enrollment_fee', 'course_enrolment_fee', 'course_enrollment_fee', 'course_fee', 'foundational_fee']) },
]);

const getCoursePrice = (course = {}, pricingSettings = null) => {
    const coursePrice = firstMoneyValue([
        { value: course.price },
        { value: course.amount },
        { value: course.fee_amount },
        { value: course.enrolment_fee },
        { value: course.enrollment_fee },
        { value: course.course_fee },
        { value: course.pricing?.price },
        { value: course.pricing?.amount },
        { value: course.pricing?.fee },
        { value: course.pricing?.enrolment_fee },
        { value: course.pricing?.enrollment_fee },
        { value: course.fees?.enrolment },
        { value: course.fees?.enrollment },
        { value: course.fees?.course },
        { value: course.enrolment?.fee },
        { value: course.enrollment?.fee },
        { value: course.price_kobo, divisor: 100 },
        { value: course.amount_kobo, divisor: 100 },
        { value: course.fee_amount_kobo, divisor: 100 },
        { value: course.enrolment_fee_kobo, divisor: 100 },
        { value: course.enrollment_fee_kobo, divisor: 100 },
        { value: course.course_fee_kobo, divisor: 100 },
        { value: course.pricing?.price_kobo, divisor: 100 },
        { value: course.pricing?.amount_kobo, divisor: 100 },
        { value: course.pricing?.fee_kobo, divisor: 100 },
        { value: course.pricing?.enrolment_fee_kobo, divisor: 100 },
        { value: course.pricing?.enrollment_fee_kobo, divisor: 100 },
    ]);

    if (coursePrice > 0) return coursePrice;
    return getCourseType(course) === TYPE_FOUNDATIONAL ? getPricingSettingsFee(pricingSettings) : 0;
};

const getCourseCurrency = (course = {}) => course.currency || course.pricing?.currency || course.fees?.currency || 'NGN';


const CourseManagement = () => {
    const navigate = useNavigate();
    const labelColor = '#E5E7EB';
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [pendingChanges, setPendingChanges] = useState({}); // Map of courseId -> change
    const [pricingSettings, setPricingSettings] = useState(null);

    // Create dialog state
    const [createOpen, setCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [form, setForm] = useState({
        title: '',
        summary: '',
        description: '',
        type: TYPE_EXPERT,
        price: '',
    });

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const [coursesResp, changesResp, settingsResp] = await Promise.all([
                adminCoursesService.listCourses({
                    q: searchTerm,
                    type: typeFilter === 'all' ? undefined : typeFilter,
                }),
                adminCoursesService.listPriceChanges({ status: 'pending' }),
                adminCoursesService.getPricingSettings().catch(() => null),
            ]);

            setCourses(coursesResp.data || []);
            setPricingSettings(settingsResp);

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
    }, [searchTerm, typeFilter]);

    const handleViewCourse = (course) => {
        navigate(`/admin/content/courses/${course.id}`);
    };

    const resetCreateForm = () => {
        setForm({ title: '', summary: '', description: '', type: TYPE_EXPERT, price: '' });
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
        const priceNumber = form.price === '' ? 0 : Number(normalizeMoneyInput(form.price));
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

            {/* Search + type filter */}
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
                        value={typeFilter}
                        exclusive
                        size="small"
                        onChange={(_e, v) => v && setTypeFilter(v)}
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
                        <ToggleButton value={TYPE_FOUNDATIONAL}>
                            <StarBorderOutlined sx={{ fontSize: 16, mr: 0.5 }} />
                            Foundational
                        </ToggleButton>
                        <ToggleButton value={TYPE_EXPERT}>
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
                            <TableCell sx={tableHeaderCellStyle}>Type</TableCell>
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
                                const courseStatus = getCourseStatus(course);
                                const statusStyle = statusChipStyle(courseStatus.state);
                                const courseType = getCourseType(course);
                                const coursePrice = getCoursePrice(course, pricingSettings);
                                const courseCurrency = getCourseCurrency(course);
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
                                                const t = courseTypeChip(courseType);
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
                                                {coursePrice > 0
                                                    ? formatCurrency(coursePrice, courseCurrency, 'en-NG')
                                                    : 'Free'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                {courseType === TYPE_FOUNDATIONAL ? 'Enrolment fee' : courseType === TYPE_EXPERT ? 'Course price' : 'Course fee'}
                                            </Typography>
                                            {pendingChanges[course.id] && (
                                                <Tooltip title={`Pending Change: ${formatCurrency(pendingChanges[course.id].new_amount, pendingChanges[course.id].new_currency, 'en-NG')}`}>
                                                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: '#3B82F6', mt: 0.5 }}>
                                                        <History sx={{ fontSize: 12 }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                            {formatCurrency(pendingChanges[course.id].new_amount, pendingChanges[course.id].new_currency, 'en-NG')}
                                                        </Typography>
                                                    </Stack>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Chip
                                                icon={courseStatus.state === 'published' ? <CheckCircle sx={{ fontSize: 14 }} /> : <Block sx={{ fontSize: 14 }} />}
                                                label={courseStatus.label}
                                                size="small"
                                                sx={{
                                                    bgcolor: statusStyle.bg,
                                                    color: statusStyle.color,
                                                    fontSize: '0.75rem',
                                                    '& .MuiChip-icon': {
                                                        color: statusStyle.color,
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
                slotProps={{
                    backdrop: {
                        sx: {
                            bgcolor: 'rgba(8,13,25,0.78)',
                            backdropFilter: 'blur(3px)',
                        },
                    },
                }}
                PaperProps={{
                    component: 'form',
                    onSubmit: handleCreateCourse,
                    sx: {
                        bgcolor: '#111827',
                        border: '1px solid #1F2937',
                        borderRadius: 2.5,
                        boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
                        overflow: 'hidden',
                    },
                }}
            >
                <DialogTitle sx={{ bgcolor: '#111827', borderBottom: '1px solid #1F2937', px: 3, py: 2.25 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar sx={{ bgcolor: theme.colors.brandLight, color: theme.colors.brand, width: 38, height: 38 }}>
                                <School fontSize="small" />
                            </Avatar>
                            <Box>
                                <Typography sx={{ fontWeight: 700, color: '#F9FAFB' }}>Create Course</Typography>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'none' }}>
                                    Pick the type first — it cannot be changed later.
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 0.25 }}>
                                Add a course shell, then manage modules and lessons.
                            </Typography>
                        </Stack>
                        <IconButton disabled={creating} onClick={() => { setCreateOpen(false); resetCreateForm(); }} sx={{ color: '#9CA3AF' }}>
                            <Close fontSize="small" />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{ bgcolor: '#0F1729', p: 3, overflowY: 'auto', ...scrollableModalBody }}>
                    {createError && (
                        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setCreateError('')}>
                            {createError}
                        </Alert>
                    )}

                    <Stack spacing={2}>
                        {/* Type selector */}
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 1 }}>
                                Course Type <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                            </Typography>
                            <Select
                                fullWidth
                                value={form.type}
                                onChange={(event) => setForm(prev => ({ ...prev, type: event.target.value }))}
                                sx={selectStyle}
                                MenuProps={selectMenuProps}
                            >
                                <MenuItem value={TYPE_EXPERT}>Expert</MenuItem>
                            </Select>
                            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 1 }}>
                                Foundational is managed from the dedicated Foundational menu to keep it as one programme course.
                            </Typography>
                            <Stack direction="row" spacing={1.5} sx={{ display: 'none' }}>
                                {[
                                    { value: TYPE_FOUNDATIONAL, icon: <StarBorderOutlined sx={{ fontSize: 18 }} />, label: 'Foundational', sub: 'Admin-managed · leads to certificate' },
                                    { value: TYPE_EXPERT, icon: <EngineeringOutlined sx={{ fontSize: 18 }} />, label: 'Expert', sub: 'Tutor-delivered · flexible structure' },
                                ].map(opt => {
                                    const selected = form.type === opt.value;
                                    return (
                                        <Box
                                            key={opt.value}
                                            onClick={() => setForm(prev => ({ ...prev, type: opt.value }))}
                                            sx={{
                                                flex: 1, p: 2, borderRadius: 2, cursor: 'pointer',
                                                border: `2px solid ${selected ? theme.colors.brand : '#374151'}`,
                                                bgcolor: selected ? 'rgba(23,138,131,0.08)' : '#1E293B',
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
                                sx={textFieldStyle}
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
                                sx={textFieldStyle}
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
                                sx={textFieldStyle}
                            />
                        </Box>

                        {/* Price */}
                        <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: labelColor, mb: 0.75 }}>
                                {form.type === TYPE_FOUNDATIONAL ? 'Enrolment Fee' : 'Course Price'}
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="0"
                                value={formatMoneyInput(form.price)}
                                onChange={e => setForm(prev => ({ ...prev, price: normalizeMoneyInput(e.target.value) }))}
                                inputProps={{ inputMode: 'numeric' }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>NGN</Typography></InputAdornment>,
                                }}
                                helperText={form.type === TYPE_FOUNDATIONAL ? 'Recommended: NGN 5,000' : 'Set 0 for a free course'}
                                sx={{
                                    ...textFieldStyle,
                                    '& .MuiFormHelperText-root': {
                                        color: '#9CA3AF',
                                        ml: 0,
                                        mt: 0.75,
                                        fontSize: '0.78rem',
                                    },
                                }}
                            />
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ bgcolor: '#111827', px: 3, py: 2, borderTop: '1px solid #1F2937', gap: 1 }}>
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
                            ...primaryButtonStyle,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: theme.colors.brandHover, boxShadow: 'none' },
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

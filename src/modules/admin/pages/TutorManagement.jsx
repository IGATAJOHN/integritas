import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    InputAdornment,
    InputBase,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AddPhotoAlternateOutlined,
    BlockOutlined,
    CheckCircleOutlined,
    CloudUploadOutlined,
    EditOutlined,
    HighlightOff,
    InfoOutlined,
    LockResetOutlined,
    MailOutline,
    OpenInNew,
    Person,
    PersonAddAlt1,
    Refresh,
    School,
    Search,
    VisibilityOffOutlined,
    VisibilityOutlined,
    VerifiedUser,
} from '@mui/icons-material';
import { adminFoundationalTutorService } from '../services/foundationalTutorService';
import {
    paperStyle,
    primaryButtonStyle,
    selectMenuProps,
    selectStyle,
    textFieldStyle,
} from '../../../styles/formStyles';
import theme from '../../../styles/theme';

const TABS = [
    { label: 'All Tutors', value: 'all' },
    { label: 'Foundational', value: 'foundational' },
    { label: 'Expert', value: 'expert' },
    { label: 'Invites', value: 'invites' },
];

const TYPE_FILTERS = [
    { label: 'All Types', value: '' },
    { label: 'Foundational', value: 'foundational' },
    { label: 'Expert', value: 'expert' },
];

const KYC_STATUS_OPTIONS = [
    { label: 'Any KYC Status', value: '' },
    { label: 'Not Submitted', value: 'not_submitted' },
    { label: 'Pending Review', value: 'pending_review' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
];

const KYC_CHIP = {
    not_submitted: { label: 'Not Submitted', color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
    pending_review: { label: 'Pending Review', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
    approved: { label: 'Approved', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
    rejected: { label: 'Rejected', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
};

const emptyCreateForm = {
    name: '',
    email: '',
    phone: '',
    bio: '',
    password: '',
    avatar: null,
    send_welcome_email: false,
};

const emptyInviteForm = {
    name: '',
    email: '',
};

const emptyEditForm = {
    name: '',
    email: '',
    phone: '',
    bio: '',
};

const emptyPasswordForm = {
    password: '',
    revoke_existing_sessions: true,
};

const tableHeadSx = {
    color: '#9CA3AF',
    borderBottom: '1px solid #374151',
    fontWeight: 600,
};

const tableBodySx = {
    borderBottom: '1px solid #374151',
};

const menuItemSx = {
    color: '#FFFFFF',
    fontSize: '0.875rem',
    '&:hover': { bgcolor: '#374151' },
    '&.Mui-selected': { bgcolor: 'rgba(23,138,131,0.16)' },
    '&.Mui-selected:hover': { bgcolor: 'rgba(23,138,131,0.24)' },
};

const dialogPaperSx = {
    bgcolor: '#0F1729',
    color: '#FFFFFF',
    border: '1px solid #1F2937',
    borderRadius: 2,
    boxShadow: '0 28px 70px rgba(0,0,0,0.55)',
    overflow: 'hidden',
};

const helperTextSx = {
    '& .MuiFormHelperText-root': {
        color: '#9CA3AF',
        ml: 0,
        mt: 0.75,
    },
};

const moduleScrollbarSx = {
    scrollbarWidth: 'thin',
    scrollbarColor: '#374151 #0C1322',
    '&::-webkit-scrollbar': { width: 8, height: 8 },
    '&::-webkit-scrollbar-track': { bgcolor: '#0C1322', borderRadius: 8 },
    '&::-webkit-scrollbar-thumb': {
        bgcolor: '#374151',
        borderRadius: 8,
        border: '2px solid #0C1322',
        '&:hover': { bgcolor: '#4B5563' },
    },
};

const getErrorMessage = (err, fallback = 'Something went wrong.') => {
    if (err?.data?.errors) return Object.values(err.data.errors).flat().join(' ');
    return err?.message || fallback;
};

const passwordIsValid = (password) =>
    password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);

const formatDate = (value) => {
    if (!value) return 'Never';
    try {
        return new Date(value).toLocaleDateString();
    } catch {
        return value;
    }
};

const formatDateTime = (value) => {
    if (!value) return 'Never';
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
};

const fullName = (tutor) => {
    if (tutor?.name) return tutor.name;
    return `${tutor?.first_name || ''} ${tutor?.last_name || ''}`.trim() || tutor?.email || 'Unknown';
};

const getInitials = (name = '') =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'TU';

const getTutorType = (tutor) => {
    const roles = (tutor?.roles || []).map((role) => (typeof role === 'string' ? role : role?.name || '').toLowerCase());
    if (roles.includes('expert_tutor') || roles.includes('expert tutor')) return 'expert';
    if (roles.includes('foundational_tutor') || roles.includes('foundational tutor')) return 'foundational';
    return tutor?.type?.toLowerCase() || 'foundational';
};

const getTutorId = (tutor) => tutor?.id || tutor?.user_id || tutor?.user?.id;

const getInviteStatus = (invite) =>
    String(invite.status || (invite.accepted_at ? 'accepted' : invite.revoked_at ? 'revoked' : 'pending')).toLowerCase();

const TutorManagement = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get('tab') || 'all';
    const initialTab = TABS.some((tab) => tab.value === tabFromUrl) ? tabFromUrl : 'all';

    const [tab, setTab] = useState(initialTab);
    const [tutors, setTutors] = useState([]);
    const [invites, setInvites] = useState([]);
    const [typeFilter, setTypeFilter] = useState('');
    const [kycStatus, setKycStatus] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [createOpen, setCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState(emptyCreateForm);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState(emptyInviteForm);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailTutor, setDetailTutor] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState(emptyEditForm);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const resolvedType = tab === 'foundational' || tab === 'expert' ? tab : typeFilter || undefined;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            if (tab === 'invites') {
                const res = await adminFoundationalTutorService.listInvites();
                setInvites(res.data || []);
                return;
            }

            const res = await adminFoundationalTutorService.listTutors({
                type: resolvedType,
                kyc_status: tab === 'foundational' ? undefined : kycStatus || undefined,
                q: search || undefined,
                per_page: 50,
            });
            setTutors(res.data || []);
        } catch (err) {
            setError(getErrorMessage(err, tab === 'invites' ? 'Failed to load invites.' : 'Failed to load tutors.'));
            if (tab === 'invites') setInvites([]);
            else setTutors([]);
        } finally {
            setLoading(false);
        }
    }, [kycStatus, resolvedType, search, tab]);

    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const stats = useMemo(() => {
        const foundational = tutors.filter((tutor) => getTutorType(tutor) === 'foundational').length;
        const expert = tutors.filter((tutor) => getTutorType(tutor) === 'expert').length;
        const pendingInvites = invites.filter((invite) => getInviteStatus(invite) === 'pending').length;
        return { total: tutors.length, foundational, expert, pendingInvites };
    }, [invites, tutors]);

    const handleTabChange = (_event, value) => {
        setTab(value);
        setError('');
        setKycStatus('');
        setSearchParams(value === 'all' ? {} : { tab: value });
    };

    const validateTutorForm = (form, requirePassword = false) => {
        if (form.name.trim().length < 2) return 'Enter the tutor name.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Enter a valid email address.';
        if (requirePassword && !passwordIsValid(form.password)) {
            return 'Password must be at least 8 characters and include upper-case, lower-case, and a number.';
        }
        return '';
    };

    const validateAvatar = (file) => {
        if (!file) return 'Choose a PNG or JPG avatar.';
        if (!['image/png', 'image/jpeg'].includes(file.type)) return 'Avatar must be a PNG or JPG image.';
        if (file.size > 4 * 1024 * 1024) return 'Avatar must be 4 MB or smaller.';
        return '';
    };

    const handleCreateTutor = async (event) => {
        event.preventDefault();
        const validation = validateTutorForm(createForm, true);
        if (validation) {
            showMessage(validation, 'error');
            return;
        }
        if (createForm.avatar) {
            const avatarValidation = validateAvatar(createForm.avatar);
            if (avatarValidation) {
                showMessage(avatarValidation, 'error');
                return;
            }
        }

        try {
            setBusy(true);
            await adminFoundationalTutorService.createFoundationalTutor({
                name: createForm.name.trim(),
                email: createForm.email.trim(),
                phone: createForm.phone.trim() || null,
                bio: createForm.bio.trim() || null,
                password: createForm.password,
                avatar: createForm.avatar,
                send_welcome_email: Boolean(createForm.send_welcome_email),
            });
            setCreateOpen(false);
            setCreateForm(emptyCreateForm);
            setTab('foundational');
            setSearchParams({ tab: 'foundational' });
            showMessage('Foundational tutor created.');
            await fetchData();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to create foundational tutor.'), 'error');
        } finally {
            setBusy(false);
        }
    };

    const handleCreateInvite = async (event) => {
        event.preventDefault();
        const validation = validateTutorForm({ ...inviteForm, password: 'ValidPass1' });
        if (validation) {
            showMessage(validation, 'error');
            return;
        }

        try {
            setBusy(true);
            await adminFoundationalTutorService.createInvite({
                name: inviteForm.name.trim(),
                email: inviteForm.email.trim(),
            });
            setInviteOpen(false);
            setInviteForm(emptyInviteForm);
            setTab('invites');
            setSearchParams({ tab: 'invites' });
            showMessage('Tutor invite sent.');
            await fetchData();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to send invite.'), 'error');
        } finally {
            setBusy(false);
        }
    };

    const handleRevokeInvite = async (invite) => {
        if (!window.confirm(`Revoke invite for ${invite.name || invite.email}?`)) return;
        try {
            setBusy(true);
            await adminFoundationalTutorService.revokeInvite(invite.id);
            showMessage('Invite revoked.');
            await fetchData();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to revoke invite.'), 'error');
        } finally {
            setBusy(false);
        }
    };

    const openDetails = async (tutor) => {
        setSelectedTutor(tutor);
        setDetailTutor(tutor);
        setDetailOpen(true);
        if (getTutorType(tutor) !== 'foundational') return;

        try {
            setDetailLoading(true);
            const detail = await adminFoundationalTutorService.getFoundationalTutor(getTutorId(tutor));
            setDetailTutor(detail || tutor);
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to load tutor details.'), 'error');
        } finally {
            setDetailLoading(false);
        }
    };

    const openEdit = (tutor) => {
        setSelectedTutor(tutor);
        setEditForm({
            name: fullName(tutor) === 'Unknown' ? '' : fullName(tutor),
            email: tutor.email || '',
            phone: tutor.phone || '',
            bio: tutor.bio || '',
        });
        setEditOpen(true);
    };

    const handleEditTutor = async (event) => {
        event.preventDefault();
        const validation = validateTutorForm({ ...editForm, password: 'ValidPass1' });
        if (validation) {
            showMessage(validation, 'error');
            return;
        }

        try {
            setBusy(true);
            await adminFoundationalTutorService.updateFoundationalTutor(getTutorId(selectedTutor), {
                name: editForm.name.trim(),
                email: editForm.email.trim(),
                phone: editForm.phone.trim() || null,
                bio: editForm.bio.trim() || null,
            });
            setEditOpen(false);
            setSelectedTutor(null);
            setEditForm(emptyEditForm);
            showMessage('Tutor profile updated.');
            await fetchData();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to update tutor profile.'), 'error');
        } finally {
            setBusy(false);
        }
    };

    const openAvatar = (tutor) => {
        setSelectedTutor(tutor);
        setAvatarFile(null);
        setAvatarOpen(true);
    };

    const handleAvatarUpload = async (event) => {
        event.preventDefault();
        const validation = validateAvatar(avatarFile);
        if (validation) {
            showMessage(validation, 'error');
            return;
        }

        try {
            setBusy(true);
            await adminFoundationalTutorService.uploadFoundationalAvatar(getTutorId(selectedTutor), avatarFile);
            setAvatarOpen(false);
            setSelectedTutor(null);
            setAvatarFile(null);
            showMessage('Tutor avatar updated.');
            await fetchData();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to upload avatar.'), 'error');
        } finally {
            setBusy(false);
        }
    };

    const openResetPassword = (tutor) => {
        setSelectedTutor(tutor);
        setPasswordForm(emptyPasswordForm);
        setPasswordOpen(true);
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();
        if (!passwordIsValid(passwordForm.password)) {
            showMessage('Password must be at least 8 characters and include upper-case, lower-case, and a number.', 'error');
            return;
        }

        try {
            setBusy(true);
            await adminFoundationalTutorService.resetFoundationalPassword(getTutorId(selectedTutor), {
                password: passwordForm.password,
                revoke_existing_sessions: Boolean(passwordForm.revoke_existing_sessions),
            });
            setPasswordOpen(false);
            setSelectedTutor(null);
            setPasswordForm(emptyPasswordForm);
            showMessage('Tutor password reset.');
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to reset password.'), 'error');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%', ...moduleScrollbarSx }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                        Tutor Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Create foundational tutors, manage invites, and review tutor records.
                    </Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <Button
                        variant="outlined"
                        startIcon={<MailOutline />}
                        onClick={() => setInviteOpen(true)}
                        sx={{ color: '#D1D5DB', borderColor: '#374151', textTransform: 'none', '&:hover': { borderColor: theme.colors.brand, bgcolor: theme.colors.brandLight } }}
                    >
                        Invite Tutor
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PersonAddAlt1 />}
                        onClick={() => setCreateOpen(true)}
                        sx={{ ...primaryButtonStyle, boxShadow: 'none', '&:hover': { bgcolor: theme.colors.brandHover, boxShadow: 'none' }, textTransform: 'none' }}
                    >
                        Create Foundational Tutor
                    </Button>
                    <Tooltip title="Refresh">
                        <span>
                            <IconButton onClick={fetchData} disabled={loading} sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                <Refresh />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                <StatCard label="Visible Tutors" value={stats.total} icon={<Person />} />
                <StatCard label="Foundational" value={stats.foundational} icon={<School />} />
                <StatCard label="Expert" value={stats.expert} icon={<VerifiedUser />} />
                <StatCard label="Pending Invites" value={stats.pendingInvites} icon={<MailOutline />} />
            </Box>

            <Paper sx={{ ...paperStyle, mb: 3 }}>
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    TabIndicatorProps={{ style: { backgroundColor: theme.colors.brand } }}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        px: 2,
                        borderBottom: '1px solid #374151',
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: '#9CA3AF',
                            minHeight: 50,
                            '&.Mui-selected': { color: theme.colors.brand },
                        },
                    }}
                >
                    {TABS.map((item) => <Tab key={item.value} label={item.label} value={item.value} />)}
                </Tabs>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2 }} alignItems={{ md: 'center' }}>
                    <Box sx={{
                        bgcolor: '#1F2937',
                        borderRadius: 1,
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        height: 42,
                        flex: 1,
                        border: '1px solid #374151',
                    }}>
                        <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
                        <InputBase
                            placeholder={tab === 'invites' ? 'Search invites...' : 'Search by name, email, or bio...'}
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            sx={{ color: '#FFFFFF', fontSize: '0.875rem', width: '100%', '& input::placeholder': { color: '#6B7280', opacity: 1 } }}
                        />
                    </Box>

                    {tab === 'all' && (
                        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
                            <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} displayEmpty sx={{ ...selectStyle, height: 42, fontSize: '0.875rem' }} MenuProps={selectMenuProps}>
                                {TYPE_FILTERS.map((option) => <MenuItem key={option.label} value={option.value} sx={menuItemSx}>{option.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                    )}

                    {(tab === 'all' || tab === 'expert') && (
                        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 200 } }}>
                            <Select value={kycStatus} onChange={(event) => setKycStatus(event.target.value)} displayEmpty sx={{ ...selectStyle, height: 42, fontSize: '0.875rem' }} MenuProps={selectMenuProps}>
                                {KYC_STATUS_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value} sx={menuItemSx}>{option.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                    )}
                </Stack>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {tab === 'invites' ? (
                <InvitesTable loading={loading} invites={invites} busy={busy} search={search} onRevoke={handleRevokeInvite} onRetry={fetchData} error={error} />
            ) : (
                <TutorsTable
                    loading={loading}
                    tutors={tutors}
                    search={search}
                    onRetry={fetchData}
                    error={error}
                    onDetails={openDetails}
                    onEdit={openEdit}
                    onAvatar={openAvatar}
                    onResetPassword={openResetPassword}
                    onReviewKyc={() => navigate('/admin/kycreview')}
                />
            )}

            <CreateTutorDialog open={createOpen} busy={busy} form={createForm} setForm={setCreateForm} onClose={() => { setCreateOpen(false); setCreateForm(emptyCreateForm); }} onSubmit={handleCreateTutor} />
            <InviteTutorDialog open={inviteOpen} busy={busy} form={inviteForm} setForm={setInviteForm} onClose={() => { setInviteOpen(false); setInviteForm(emptyInviteForm); }} onSubmit={handleCreateInvite} />
            <TutorDetailDialog open={detailOpen} loading={detailLoading} tutor={detailTutor} onClose={() => { setDetailOpen(false); setSelectedTutor(null); setDetailTutor(null); }} />
            <EditTutorDialog open={editOpen} busy={busy} form={editForm} setForm={setEditForm} onClose={() => { setEditOpen(false); setSelectedTutor(null); setEditForm(emptyEditForm); }} onSubmit={handleEditTutor} />
            <AvatarDialog open={avatarOpen} busy={busy} file={avatarFile} setFile={setAvatarFile} onClose={() => { setAvatarOpen(false); setSelectedTutor(null); setAvatarFile(null); }} onSubmit={handleAvatarUpload} />
            <PasswordDialog open={passwordOpen} busy={busy} form={passwordForm} setForm={setPasswordForm} onClose={() => { setPasswordOpen(false); setSelectedTutor(null); setPasswordForm(emptyPasswordForm); }} onSubmit={handleResetPassword} />

            <Snackbar open={snackbar.open} autoHideDuration={4500} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

const StatCard = ({ label, value, icon }) => (
    <Paper sx={{ ...paperStyle, p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: theme.colors.brandLight, color: theme.colors.brand, width: 38, height: 38 }}>
                {React.cloneElement(icon, { fontSize: 'small' })}
            </Avatar>
            <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>
                    {label}
                </Typography>
                <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 700, lineHeight: 1.1 }}>
                    {value}
                </Typography>
            </Box>
        </Stack>
    </Paper>
);

const TutorsTable = ({ loading, tutors, search, onRetry, error, onDetails, onEdit, onAvatar, onResetPassword, onReviewKyc }) => (
    <TableContainer component={Paper} sx={paperStyle}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell sx={tableHeadSx}>Tutor</TableCell>
                    <TableCell sx={tableHeadSx}>Type</TableCell>
                    <TableCell sx={tableHeadSx}>KYC Status</TableCell>
                    <TableCell sx={tableHeadSx}>Account State</TableCell>
                    <TableCell sx={tableHeadSx}>Created</TableCell>
                    <TableCell sx={tableHeadSx}>Last Login</TableCell>
                    <TableCell align="right" sx={tableHeadSx}>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {loading ? (
                    <TableState colSpan={7} icon={<CircularProgress size={36} sx={{ color: theme.colors.brand }} />} text="Loading tutors..." />
                ) : error ? (
                    <TableState colSpan={7} icon={<BlockOutlined sx={{ color: '#EF4444', fontSize: 44 }} />} text={error} action={<Button onClick={onRetry} sx={{ mt: 2, color: theme.colors.brand, textTransform: 'none' }}>Try Again</Button>} />
                ) : tutors.length === 0 ? (
                    <TableState colSpan={7} icon={<Person sx={{ fontSize: 48, color: '#374151' }} />} text={search ? 'No tutors match your search.' : 'No tutors found.'} />
                ) : tutors.map((tutor) => (
                    <TutorRow key={`${getTutorType(tutor)}-${getTutorId(tutor)}`} tutor={tutor} onDetails={onDetails} onEdit={onEdit} onAvatar={onAvatar} onResetPassword={onResetPassword} onReviewKyc={onReviewKyc} />
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

const TutorRow = ({ tutor, onDetails, onEdit, onAvatar, onResetPassword, onReviewKyc }) => {
    const type = getTutorType(tutor);
    const name = fullName(tutor);
    const kyc = tutor?.kyc_status || tutor?.kyc?.status || (type === 'foundational' ? null : 'not_submitted');
    const kycInfo = KYC_CHIP[kyc];

    return (
        <TableRow sx={{ '&:last-child td': { border: 0 } }}>
            <TableCell sx={tableBodySx}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar src={tutor.avatar_url || tutor.photo_url} sx={{ width: 40, height: 40, bgcolor: theme.colors.brand, fontSize: '0.85rem', fontWeight: 700 }}>
                        {getInitials(name)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff' }}>{name}</Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>{tutor.email || 'No email'}</Typography>
                        {tutor.phone && <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>{tutor.phone}</Typography>}
                    </Box>
                </Stack>
            </TableCell>
            <TableCell sx={tableBodySx}>
                <Chip
                    icon={type === 'expert' ? <VerifiedUser sx={{ fontSize: 14 }} /> : <School sx={{ fontSize: 14 }} />}
                    label={type === 'expert' ? 'Expert' : 'Foundational'}
                    size="small"
                    sx={{
                        bgcolor: type === 'expert' ? 'rgba(59,130,246,0.12)' : theme.colors.brandLight,
                        color: type === 'expert' ? '#60A5FA' : theme.colors.brand,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        '& .MuiChip-icon': { color: 'inherit' },
                    }}
                />
            </TableCell>
            <TableCell sx={tableBodySx}>
                {kycInfo ? <Chip label={kycInfo.label} size="small" sx={{ bgcolor: kycInfo.bg, color: kycInfo.color, fontSize: '0.72rem' }} /> : <MutedText>N/A</MutedText>}
            </TableCell>
            <TableCell sx={tableBodySx}>
                <Typography variant="body2" sx={{ color: tutor.suspended_at ? '#EF4444' : '#D1D5DB' }}>
                    {tutor.suspended_at ? 'Suspended' : tutor.account_state || 'Active'}
                </Typography>
            </TableCell>
            <TableCell sx={tableBodySx}><MutedText>{formatDate(tutor.created_at)}</MutedText></TableCell>
            <TableCell sx={tableBodySx}><MutedText>{formatDateTime(tutor.last_login_at)}</MutedText></TableCell>
            <TableCell align="right" sx={tableBodySx}>
                <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                    <ActionButton title="View details" icon={<InfoOutlined fontSize="small" />} onClick={() => onDetails(tutor)} />
                    {type === 'foundational' ? (
                        <>
                            <ActionButton title="Edit profile" icon={<EditOutlined fontSize="small" />} onClick={() => onEdit(tutor)} />
                            <ActionButton title="Upload avatar" icon={<AddPhotoAlternateOutlined fontSize="small" />} onClick={() => onAvatar(tutor)} />
                            <ActionButton title="Reset password" icon={<LockResetOutlined fontSize="small" />} onClick={() => onResetPassword(tutor)} />
                        </>
                    ) : (
                        <ActionButton title="Review KYC" icon={<OpenInNew fontSize="small" />} onClick={onReviewKyc} color="#FBBF24" />
                    )}
                </Stack>
            </TableCell>
        </TableRow>
    );
};

const InvitesTable = ({ loading, invites, busy, search, onRevoke, onRetry, error }) => {
    const term = search.toLowerCase();
    const visibleInvites = term
        ? invites.filter((invite) =>
            `${invite.name || ''} ${invite.email || ''}`.toLowerCase().includes(term))
        : invites;

    return (
        <TableContainer component={Paper} sx={paperStyle}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={tableHeadSx}>Invitee</TableCell>
                        <TableCell sx={tableHeadSx}>Status</TableCell>
                        <TableCell sx={tableHeadSx}>Invited</TableCell>
                        <TableCell sx={tableHeadSx}>Expires</TableCell>
                        <TableCell align="right" sx={tableHeadSx}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableState colSpan={5} icon={<CircularProgress size={36} sx={{ color: theme.colors.brand }} />} text="Loading invites..." />
                    ) : error ? (
                        <TableState colSpan={5} icon={<BlockOutlined sx={{ color: '#EF4444', fontSize: 44 }} />} text={error} action={<Button onClick={onRetry} sx={{ mt: 2, color: theme.colors.brand, textTransform: 'none' }}>Try Again</Button>} />
                    ) : visibleInvites.length === 0 ? (
                        <TableState colSpan={5} icon={<MailOutline sx={{ fontSize: 48, color: '#374151' }} />} text={search ? 'No invites match your search.' : 'No invites found.'} />
                    ) : visibleInvites.map((invite) => {
                        const status = getInviteStatus(invite);
                        const isAccepted = status === 'accepted';
                        const isRevoked = status === 'revoked';
                        const isExpired = status === 'expired';
                        return (
                            <TableRow key={invite.id} sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell sx={tableBodySx}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: theme.colors.brand, width: 40, height: 40, fontSize: '0.85rem', fontWeight: 700 }}>
                                            {getInitials(invite.name || invite.email)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 700 }}>{invite.name || invite.email}</Typography>
                                            <Typography variant="caption" sx={{ color: '#6B7280' }}>{invite.email}</Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell sx={tableBodySx}>
                                    <Chip
                                        size="small"
                                        icon={isAccepted ? <CheckCircleOutlined /> : isRevoked ? <BlockOutlined /> : isExpired ? <HighlightOff /> : <MailOutline />}
                                        label={isAccepted ? 'Accepted' : isRevoked ? 'Revoked' : isExpired ? 'Expired' : 'Pending'}
                                        sx={{
                                            bgcolor: isAccepted ? 'rgba(16,185,129,0.14)' : isRevoked ? 'rgba(239,68,68,0.14)' : isExpired ? 'rgba(156,163,175,0.12)' : 'rgba(251,191,36,0.14)',
                                            color: isAccepted ? '#10B981' : isRevoked ? '#EF4444' : isExpired ? '#9CA3AF' : '#FBBF24',
                                            fontSize: '0.72rem',
                                            '& .MuiChip-icon': { color: 'inherit' },
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={tableBodySx}><MutedText>{formatDate(invite.invited_at || invite.created_at)}</MutedText></TableCell>
                                <TableCell sx={tableBodySx}><MutedText>{formatDate(invite.expires_at)}</MutedText></TableCell>
                                <TableCell align="right" sx={tableBodySx}>
                                    {!isAccepted && !isRevoked && (
                                        <Button disabled={busy} onClick={() => onRevoke(invite)} color="error" sx={{ textTransform: 'none' }}>
                                            Revoke
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const TableState = ({ colSpan, icon, text, action }) => (
    <TableRow>
        <TableCell colSpan={colSpan} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
            {icon}
            <Typography sx={{ color: '#9CA3AF', mt: 1.5 }}>{text}</Typography>
            {action}
        </TableCell>
    </TableRow>
);

const ActionButton = ({ title, icon, onClick, color = '#9CA3AF' }) => (
    <Tooltip title={title}>
        <IconButton size="small" onClick={onClick} sx={{ color, bgcolor: 'rgba(255,255,255,0.04)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            {icon}
        </IconButton>
    </Tooltip>
);

const MutedText = ({ children }) => (
    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
        {children}
    </Typography>
);

const FieldLabel = ({ children }) => (
    <Typography sx={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 700, mb: 0.75 }}>
        {children}
    </Typography>
);

const DialogShell = ({ open, title, icon, children, actions, onClose, onSubmit, maxWidth = 'sm' }) => (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth={maxWidth}
        fullWidth
        slotProps={{ backdrop: { sx: { bgcolor: 'rgba(8,13,25,0.78)', backdropFilter: 'blur(3px)' } } }}
        PaperProps={{ component: onSubmit ? 'form' : 'div', onSubmit, sx: dialogPaperSx }}
    >
        <DialogTitle sx={{ bgcolor: '#111827', borderBottom: '1px solid #1F2937', px: 3, py: 2.25 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: theme.colors.brandLight, color: theme.colors.brand, width: 38, height: 38 }}>
                    {icon}
                </Avatar>
                <Typography sx={{ color: '#F9FAFB', fontWeight: 700 }}>{title}</Typography>
            </Stack>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#0F1729', pt: 3 }}>{children}</DialogContent>
        {actions && <DialogActions sx={{ bgcolor: '#111827', px: 3, py: 2, borderTop: '1px solid #1F2937' }}>{actions}</DialogActions>}
    </Dialog>
);

const CancelButton = ({ onClick, disabled }) => (
    <Button onClick={onClick} disabled={disabled} sx={{ color: '#9CA3AF', textTransform: 'none' }}>
        Cancel
    </Button>
);

const SaveButton = ({ children, busy }) => (
    <Button type="submit" variant="contained" disabled={busy} sx={{ ...primaryButtonStyle, boxShadow: 'none', '&:hover': { bgcolor: theme.colors.brandHover, boxShadow: 'none' }, textTransform: 'none' }}>
        {busy ? 'Saving...' : children}
    </Button>
);

const ProfileFields = ({ form, setForm, includePassword = false }) => (
    <>
        <Box>
            <FieldLabel>Name</FieldLabel>
            <TextField value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} fullWidth required placeholder="Prof. Linus Torvalds" sx={textFieldStyle} />
        </Box>
        <Box>
            <FieldLabel>Email</FieldLabel>
            <TextField type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} fullWidth required placeholder="linus@university.edu" sx={textFieldStyle} />
        </Box>
        <Box>
            <FieldLabel>Phone</FieldLabel>
            <TextField value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} fullWidth placeholder="+2348012345678" sx={textFieldStyle} />
        </Box>
        <Box>
            <FieldLabel>Bio</FieldLabel>
            <TextField value={form.bio} onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))} fullWidth multiline minRows={3} placeholder="Public bio shown on lesson pages." sx={textFieldStyle} />
        </Box>
        {includePassword && <PasswordInput value={form.password} onChange={(password) => setForm((prev) => ({ ...prev, password }))} label="Temporary Password" />}
    </>
);

const PasswordInput = ({ value, onChange, label = 'Password' }) => {
    const [showPassword, setShowPassword] = useState(false);
    const valid = passwordIsValid(value);
    const touched = value.length > 0;

    return (
        <Box>
            <FieldLabel>{label}</FieldLabel>
            <TextField
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                fullWidth
                required
                placeholder="TempPass1"
                helperText={valid ? 'Password meets the requirements.' : 'Min 8 characters with upper-case, lower-case, and a number.'}
                sx={{
                    ...textFieldStyle,
                    '& .MuiFormHelperText-root': {
                        color: valid ? '#10B981' : touched ? '#FBBF24' : '#9CA3AF',
                        ml: 0,
                        mt: 0.75,
                    },
                }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {valid && <CheckCircleOutlined sx={{ color: '#10B981', fontSize: 20, mr: 0.5 }} />}
                            <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((prev) => !prev)} edge="end" sx={{ color: '#9CA3AF', '&:hover': { color: '#FFFFFF' } }}>
                                {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    );
};

const CreateTutorDialog = ({ open, busy, form, setForm, onClose, onSubmit }) => (
    <DialogShell
        open={open}
        title="Create Foundational Tutor"
        icon={<PersonAddAlt1 fontSize="small" />}
        onClose={onClose}
        onSubmit={onSubmit}
        actions={<><CancelButton onClick={onClose} disabled={busy} /><SaveButton busy={busy}>Create Tutor</SaveButton></>}
    >
        <Stack spacing={2}>
            <ProfileFields form={form} setForm={setForm} includePassword />
            <AvatarPicker file={form.avatar} onChange={(avatar) => setForm((prev) => ({ ...prev, avatar }))} />
            <FormControlLabel
                control={<Checkbox checked={form.send_welcome_email} onChange={(event) => setForm((prev) => ({ ...prev, send_welcome_email: event.target.checked }))} sx={{ color: '#9CA3AF', '&.Mui-checked': { color: theme.colors.brand } }} />}
                label="Send welcome email"
                sx={{ color: '#D1D5DB' }}
            />
        </Stack>
    </DialogShell>
);

const InviteTutorDialog = ({ open, busy, form, setForm, onClose, onSubmit }) => (
    <DialogShell
        open={open}
        title="Invite Foundational Tutor"
        icon={<MailOutline fontSize="small" />}
        onClose={onClose}
        onSubmit={onSubmit}
        actions={<><CancelButton onClick={onClose} disabled={busy} /><SaveButton busy={busy}>Send Invite</SaveButton></>}
    >
        <Stack spacing={2}>
            <Box>
                <FieldLabel>Name</FieldLabel>
                <TextField value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} fullWidth required placeholder="Tutor name" sx={textFieldStyle} />
            </Box>
            <Box>
                <FieldLabel>Email</FieldLabel>
                <TextField type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} fullWidth required placeholder="tutor@example.com" helperText="The invite link is sent to this email." sx={{ ...textFieldStyle, ...helperTextSx }} />
            </Box>
        </Stack>
    </DialogShell>
);

const EditTutorDialog = ({ open, busy, form, setForm, onClose, onSubmit }) => (
    <DialogShell
        open={open}
        title="Edit Foundational Tutor"
        icon={<EditOutlined fontSize="small" />}
        onClose={onClose}
        onSubmit={onSubmit}
        actions={<><CancelButton onClick={onClose} disabled={busy} /><SaveButton busy={busy}>Save Changes</SaveButton></>}
    >
        <Stack spacing={2}>
            <ProfileFields form={form} setForm={setForm} />
        </Stack>
    </DialogShell>
);

const AvatarDialog = ({ open, busy, file, setFile, onClose, onSubmit }) => (
    <DialogShell
        open={open}
        title="Upload Tutor Avatar"
        icon={<AddPhotoAlternateOutlined fontSize="small" />}
        onClose={onClose}
        onSubmit={onSubmit}
        actions={<><CancelButton onClick={onClose} disabled={busy} /><SaveButton busy={busy}>Upload Avatar</SaveButton></>}
    >
        <Stack spacing={2}>
            <AvatarPicker file={file} onChange={setFile} />
        </Stack>
    </DialogShell>
);

const PasswordDialog = ({ open, busy, form, setForm, onClose, onSubmit }) => (
    <DialogShell
        open={open}
        title="Reset Tutor Password"
        icon={<LockResetOutlined fontSize="small" />}
        onClose={onClose}
        onSubmit={onSubmit}
        actions={<><CancelButton onClick={onClose} disabled={busy} /><SaveButton busy={busy}>Reset Password</SaveButton></>}
    >
        <Stack spacing={2}>
            <PasswordInput value={form.password} onChange={(password) => setForm((prev) => ({ ...prev, password }))} label="New Password" />
            <FormControlLabel
                control={<Checkbox checked={form.revoke_existing_sessions} onChange={(event) => setForm((prev) => ({ ...prev, revoke_existing_sessions: event.target.checked }))} sx={{ color: '#9CA3AF', '&.Mui-checked': { color: theme.colors.brand } }} />}
                label="Revoke existing sessions"
                sx={{ color: '#D1D5DB' }}
            />
        </Stack>
    </DialogShell>
);

const TutorDetailDialog = ({ open, loading, tutor, onClose }) => (
    <DialogShell
        open={open}
        title="Tutor Details"
        icon={<InfoOutlined fontSize="small" />}
        onClose={onClose}
        maxWidth="md"
        actions={<Button onClick={onClose} sx={{ color: '#9CA3AF', textTransform: 'none' }}>Close</Button>}
    >
        {loading ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
                <CircularProgress sx={{ color: theme.colors.brand }} />
            </Stack>
        ) : (
            <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={tutor?.avatar_url} sx={{ width: 56, height: 56, bgcolor: theme.colors.brand, fontWeight: 700 }}>
                        {getInitials(fullName(tutor))}
                    </Avatar>
                    <Box>
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 700 }}>{fullName(tutor)}</Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>{tutor?.email || 'No email'}</Typography>
                    </Box>
                </Stack>
                <DetailGrid tutor={tutor} />
            </Stack>
        )}
    </DialogShell>
);

const DetailGrid = ({ tutor }) => {
    const rows = [
        ['Phone', tutor?.phone || 'None'],
        ['Type', getTutorType(tutor) === 'expert' ? 'Expert' : 'Foundational'],
        ['Account State', tutor?.suspended_at ? 'Suspended' : tutor?.account_state || 'Active'],
        ['Created', formatDateTime(tutor?.created_at)],
        ['Last Login', formatDateTime(tutor?.last_login_at)],
        ['Bio', tutor?.bio || 'No bio'],
    ];

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.5 }}>
            {rows.map(([label, value]) => (
                <Paper key={label} sx={{ bgcolor: '#111827', border: '1px solid #1F2937', p: 1.5, borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>{label}</Typography>
                    <Typography variant="body2" sx={{ color: '#FFFFFF', mt: 0.5 }}>{value}</Typography>
                </Paper>
            ))}
        </Box>
    );
};

const AvatarPicker = ({ file, onChange }) => (
    <Box>
        <FieldLabel>Avatar</FieldLabel>
        <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadOutlined />}
            sx={{
                color: '#FFFFFF',
                borderColor: '#374151',
                textTransform: 'none',
                justifyContent: 'flex-start',
                py: 1.25,
                width: '100%',
                '&:hover': { borderColor: theme.colors.brand, bgcolor: theme.colors.brandLight },
            }}
        >
            Choose PNG or JPG
            <input hidden type="file" accept="image/png,image/jpeg" onChange={(event) => onChange(event.target.files?.[0] || null)} />
        </Button>
        <Typography variant="caption" sx={{ color: file ? '#FFFFFF' : '#9CA3AF', mt: 0.75, display: 'block' }}>
            {file ? file.name : 'Optional. Max size: 4 MB.'}
        </Typography>
    </Box>
);

export default TutorManagement;

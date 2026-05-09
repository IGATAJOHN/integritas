import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Paper,
    TextField,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    InputAdornment,
    Avatar,
    Tooltip,
    Divider,
    Grid,
    Autocomplete,
} from '@mui/material';
import {
    PersonAddAlt1,
    DeleteOutline,
    SchoolOutlined,
    SearchOutlined,
    MailOutline,
    PhoneOutlined,
    AssignmentIndOutlined,
    CheckCircleOutlined,
    AccessTimeOutlined,
    HighlightOff,
    BlockOutlined,
    RefreshOutlined,
    RotateLeftOutlined,
} from '@mui/icons-material';
import { adminFoundationalTutorService } from '../services';

const TABS = [
    { value: 'tutors', label: 'Tutors' },
    { value: 'invites', label: 'Pending Invites' },
];

const initials = (name = '') =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || '?';

const FoundationalTutorInvites = () => {
    const [tab, setTab] = useState('tutors');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [tutors, setTutors] = useState([]);
    const [invites, setInvites] = useState([]);

    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ email: '', name: '' });
    const [selectedTutor, setSelectedTutor] = useState(null);

    // Autocomplete options for the invite dialog (existing platform tutors)
    const [tutorOptions, setTutorOptions] = useState([]);
    const [tutorOptionsLoading, setTutorOptionsLoading] = useState(false);
    const [tutorOptionsInput, setTutorOptionsInput] = useState('');

    const refresh = async () => {
        try {
            setLoading(true);
            setError('');
            if (tab === 'tutors') {
                const res = await adminFoundationalTutorService.listTutors({
                    type: 'foundational',
                    q: search || undefined,
                });
                setTutors(res?.data || []);
            } else {
                const res = await adminFoundationalTutorService.listInvites();
                setInvites(res?.data || []);
            }
        } catch (err) {
            setError(err?.message || 'Failed to load.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, search]);

    // Debounce search input → applied search
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput.trim()), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Fetch tutor options for the invite autocomplete (debounced).
    useEffect(() => {
        if (!dialogOpen) return undefined;
        let cancelled = false;
        setTutorOptionsLoading(true);
        const t = setTimeout(async () => {
            try {
                const res = await adminFoundationalTutorService.listTutors({
                    q: tutorOptionsInput || undefined,
                    per_page: 25,
                });
                if (!cancelled) setTutorOptions(res?.data || []);
            } catch (_err) {
                if (!cancelled) setTutorOptions([]);
            } finally {
                if (!cancelled) setTutorOptionsLoading(false);
            }
        }, 250);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [dialogOpen, tutorOptionsInput]);

    const handleCreate = async (e) => {
        e.preventDefault();
        const email = form.email.trim();
        const name = form.name.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (name.length < 2) {
            setError('Please enter the tutor\'s name.');
            return;
        }
        try {
            setBusy(true);
            setError('');
            await adminFoundationalTutorService.createInvite({ email, name });
            setSuccess(`Invitation email sent to ${email}.`);
            setDialogOpen(false);
            setForm({ email: '', name: '' });
            setSelectedTutor(null);
            setTutorOptionsInput('');
            setTab('invites');
            await refresh();
        } catch (err) {
            if (err?.status === 409) {
                setError(
                    err.message ||
                    `An invite already exists for ${email}. Revoke the existing invite first, then try again.`
                );
            } else if (err?.status === 422) {
                const details = err?.data?.errors
                    ? Object.values(err.data.errors).flat().join(' ')
                    : err.message;
                setError(details || 'Please check the form and try again.');
            } else {
                setError(err?.message || 'Failed to send invite. Please try again.');
            }
        } finally {
            setBusy(false);
        }
    };

    const handleRevoke = async (id) => {
        if (!window.confirm('Revoke this invite? The tutor will not be able to use the link.')) return;
        try {
            setBusy(true);
            await adminFoundationalTutorService.revokeInvite(id);
            setSuccess('Invite revoked.');
            await refresh();
        } catch (err) {
            setError(err?.message || 'Failed to revoke invite.');
        } finally {
            setBusy(false);
        }
    };

    const handleReset = async (invite) => {
        if (!window.confirm(`Reset the invite link for ${invite.name || invite.email}? A new link will be sent to ${invite.email}.`)) return;
        try {
            setBusy(true);
            setError('');
            // Revoke the old invite then immediately create a fresh one
            await adminFoundationalTutorService.revokeInvite(invite.id);
            await adminFoundationalTutorService.createInvite({ email: invite.email, name: invite.name });
            setSuccess(`New invite link sent to ${invite.email}.`);
            await refresh();
        } catch (err) {
            setError(err?.message || 'Failed to reset invite link.');
        } finally {
            setBusy(false);
        }
    };

    const stats = useMemo(() => {
        const getStatus = (i) =>
            String(i.status || (i.accepted_at ? 'accepted' : i.revoked_at ? 'revoked' : 'pending')).toLowerCase();
        const accepted = invites.filter((i) => getStatus(i) === 'accepted').length;
        const pending  = invites.filter((i) => getStatus(i) === 'pending').length;
        return { tutors: tutors.length, pending, accepted };
    }, [tutors, invites]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Page header */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ sm: 'center' }}
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <SchoolOutlined />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            Foundational Tutors
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Invite, manage, and assign tutors for the foundational programme.
                        </Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshOutlined />}
                        onClick={refresh}
                        sx={{ textTransform: 'none' }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PersonAddAlt1 />}
                        onClick={() => setDialogOpen(true)}
                        sx={{ textTransform: 'none' }}
                    >
                        Invite Tutor
                    </Button>
                </Stack>
            </Stack>

            {/* Stat cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                            Active Tutors
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.tutors}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                            Pending Invites
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.pending}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                            Accepted Invites
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.accepted}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {/* Tabs + search */}
            <Paper variant="outlined" sx={{ mb: 2 }}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    alignItems={{ md: 'center' }}
                    justifyContent="space-between"
                    spacing={1.5}
                    sx={{ px: 2, pt: 1, pb: 0 }}
                >
                    <Tabs
                        value={tab}
                        onChange={(_e, v) => setTab(v)}
                        sx={{ minHeight: 40, '& .MuiTab-root': { textTransform: 'none', minHeight: 40 } }}
                    >
                        {TABS.map((t) => (
                            <Tab key={t.value} value={t.value} label={t.label} />
                        ))}
                    </Tabs>

                    {tab === 'tutors' && (
                        <TextField
                            size="small"
                            placeholder="Search by name or email…"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchOutlined fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: { md: 280 }, mb: 1 }}
                        />
                    )}
                </Stack>
                <Divider />

                {loading ? (
                    <Stack alignItems="center" sx={{ py: 8 }}>
                        <CircularProgress />
                    </Stack>
                ) : tab === 'tutors' ? (
                    <TutorList tutors={tutors} />
                ) : (
                    <InviteList invites={invites} busy={busy} onRevoke={handleRevoke} onReset={handleReset} />
                )}
            </Paper>

            {/* Invite dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setSelectedTutor(null);
                    setTutorOptionsInput('');
                }}
                maxWidth="sm"
                fullWidth
                disableRestoreFocus
                PaperProps={{ component: 'form', onSubmit: handleCreate }}
            >
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                            <PersonAddAlt1 fontSize="small" />
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontWeight: 700 }}>Invite Foundational Tutor</Typography>
                            <Typography variant="caption" color="text.secondary">
                                Pick someone already on the platform, or type a new email to invite.
                            </Typography>
                        </Box>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        {error && (
                            <Alert severity="error" onClose={() => setError('')}>
                                {error}
                            </Alert>
                        )}
                        <Autocomplete
                            freeSolo
                            value={selectedTutor}
                            inputValue={tutorOptionsInput}
                            onInputChange={(_e, value, reason) => {
                                setTutorOptionsInput(value);
                                if (reason === 'input') {
                                    // Treat free-text typing as a possible new email entry.
                                    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                                        setForm((prev) => ({ ...prev, email: value.trim() }));
                                    }
                                }
                            }}
                            onChange={(_e, value) => {
                                if (value && typeof value === 'object') {
                                    setSelectedTutor(value);
                                    setForm({
                                        name: value.name || '',
                                        email: value.email || '',
                                    });
                                } else if (typeof value === 'string') {
                                    // User typed a fresh string and pressed Enter
                                    setSelectedTutor(null);
                                    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                                        setForm((prev) => ({ ...prev, email: value.trim() }));
                                    }
                                } else {
                                    setSelectedTutor(null);
                                }
                            }}
                            options={tutorOptions}
                            loading={tutorOptionsLoading}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') return option;
                                return option?.email || option?.name || '';
                            }}
                            isOptionEqualToValue={(option, value) =>
                                option?.id != null && value?.id != null && option.id === value.id
                            }
                            renderOption={(props, option) => (
                                <Box component="li" {...props} key={option.id}>
                                    <Avatar
                                        src={option.avatar_url || option.photo_url}
                                        sx={{ width: 32, height: 32, mr: 1.5, bgcolor: 'primary.light', color: 'primary.contrastText', fontSize: '0.85rem' }}
                                    >
                                        {initials(option.name)}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {option.name || option.email}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {option.email}
                                            {option.type ? ` · ${option.type}` : ''}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search existing tutors or enter email"
                                    autoFocus
                                    placeholder="Type a name, email, or pick from the list"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {tutorOptionsLoading ? <CircularProgress size={16} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />

                        {/* Inline status + form fields — no extra borders */}
                        {(selectedTutor || form.email || form.name) && (
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ pl: 0.25 }}>
                                <Avatar
                                    src={selectedTutor?.avatar_url || selectedTutor?.photo_url}
                                    sx={{ width: 36, height: 36, bgcolor: 'primary.light', color: 'primary.contrastText', fontSize: '0.85rem' }}
                                >
                                    {initials(form.name || selectedTutor?.name || form.email)}
                                </Avatar>
                                <Chip
                                    size="small"
                                    label={selectedTutor ? 'Existing tutor — invite will be sent' : 'New invite'}
                                    color={selectedTutor ? 'success' : 'primary'}
                                    variant="outlined"
                                />
                            </Stack>
                        )}

                        <TextField
                            label="Full Name"
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            fullWidth
                            required
                            inputProps={{ maxLength: 120 }}
                        />
                        <TextField
                            label="Email Address"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                            fullWidth
                            required
                            inputProps={{ maxLength: 255 }}
                            helperText="The invite link is sent to this email."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={() => {
                            setDialogOpen(false);
                            setSelectedTutor(null);
                            setTutorOptionsInput('');
                        }}
                        disabled={busy}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={busy} sx={{ textTransform: 'none' }}>
                        {busy ? 'Sending…' : 'Send Invite'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const TutorList = ({ tutors }) => {
    if (tutors.length === 0) {
        return (
            <Box sx={{ p: 6, textAlign: 'center' }}>
                <AssignmentIndOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                <Typography color="text.secondary">
                    No tutors match your search. Try inviting one above.
                </Typography>
            </Box>
        );
    }

    return (
        <Stack divider={<Divider />}>
            {tutors.map((tutor) => (
                <Stack
                    key={tutor.id}
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ sm: 'center' }}
                    spacing={2}
                    sx={{ p: 2 }}
                >
                    <Avatar
                        src={tutor.avatar_url || tutor.photo_url}
                        sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', width: 44, height: 44 }}
                    >
                        {initials(tutor.name)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600 }}>{tutor.name || '—'}</Typography>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ color: 'text.secondary', flexWrap: 'wrap' }}>
                            {tutor.email && (
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <MailOutline fontSize="inherit" />
                                    <Typography variant="caption">{tutor.email}</Typography>
                                </Stack>
                            )}
                            {tutor.phone && (
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <PhoneOutlined fontSize="inherit" />
                                    <Typography variant="caption">{tutor.phone}</Typography>
                                </Stack>
                            )}
                        </Stack>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        {tutor.assigned_lessons_count != null && (
                            <Chip
                                size="small"
                                label={`${tutor.assigned_lessons_count} lesson${tutor.assigned_lessons_count === 1 ? '' : 's'}`}
                                variant="outlined"
                            />
                        )}
                        <Chip
                            size="small"
                            label="Foundational"
                            color="primary"
                            variant="outlined"
                        />
                    </Stack>
                </Stack>
            ))}
        </Stack>
    );
};

const InviteList = ({ invites, busy, onRevoke, onReset }) => {
    if (invites.length === 0) {
        return (
            <Box sx={{ p: 6, textAlign: 'center' }}>
                <MailOutline sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                <Typography color="text.secondary">
                    No invites yet. Click <strong>Invite Tutor</strong> above to send one.
                </Typography>
            </Box>
        );
    }

    return (
        <Stack divider={<Divider />}>
            {invites.map((invite) => {
                const status = String(invite.status || (invite.accepted_at ? 'accepted' : invite.revoked_at ? 'revoked' : 'pending')).toLowerCase();
                const isAccepted = status === 'accepted';
                const isExpired  = status === 'expired';
                const isRevoked  = status === 'revoked';
                return (
                    <Stack
                        key={invite.id}
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ sm: 'center' }}
                        spacing={2}
                        sx={{ p: 2 }}
                    >
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', width: 44, height: 44 }}>
                            {initials(invite.name || invite.email)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600 }}>{invite.name || invite.email}</Typography>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                                <MailOutline fontSize="inherit" />
                                <Typography variant="caption">{invite.email}</Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                {invite.invited_at
                                    ? `Invited ${new Date(invite.invited_at).toLocaleDateString()}`
                                    : invite.created_at
                                        ? `Invited ${new Date(invite.created_at).toLocaleDateString()}`
                                        : ''}
                                {invite.expires_at ? ` · Expires ${new Date(invite.expires_at).toLocaleDateString()}` : ''}
                            </Typography>
                        </Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Chip
                                size="small"
                                icon={
                                    isAccepted ? <CheckCircleOutlined /> :
                                    isRevoked  ? <BlockOutlined /> :
                                    isExpired  ? <HighlightOff /> :
                                                 <AccessTimeOutlined />
                                }
                                label={
                                    isAccepted ? 'Accepted' :
                                    isRevoked  ? 'Revoked' :
                                    isExpired  ? 'Expired' :
                                                 'Pending'
                                }
                                color={
                                    isAccepted ? 'success' :
                                    isRevoked  ? 'error' :
                                    isExpired  ? 'default' :
                                                 'warning'
                                }
                                variant="outlined"
                            />
                            {!isAccepted && (
                                <Tooltip title="Reset — revoke and send a new link">
                                    <span>
                                        <IconButton
                                            disabled={busy}
                                            onClick={() => onReset(invite)}
                                            aria-label="Reset invite link"
                                            sx={{ color: 'warning.main' }}
                                        >
                                            <RotateLeftOutlined />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                            {!isAccepted && !isRevoked && (
                                <Tooltip title="Revoke invite">
                                    <span>
                                        <IconButton
                                            color="error"
                                            disabled={busy}
                                            onClick={() => onRevoke(invite.id)}
                                            aria-label="Revoke invite"
                                        >
                                            <DeleteOutline />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                        </Stack>
                    </Stack>
                );
            })}
        </Stack>
    );
};

export default FoundationalTutorInvites;

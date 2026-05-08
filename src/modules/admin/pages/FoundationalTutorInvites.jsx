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
    RefreshOutlined,
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
            setTab('invites');
            await refresh();
        } catch (err) {
            setError(err?.message || 'Failed to send invite.');
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

    const stats = useMemo(() => {
        const accepted = invites.filter((i) => String(i.status || '').toLowerCase() === 'accepted' || i.accepted_at).length;
        const pending = invites.filter((i) => {
            const s = String(i.status || (i.accepted_at ? 'accepted' : 'pending')).toLowerCase();
            return s === 'pending';
        }).length;
        return {
            tutors: tutors.length,
            pending,
            accepted,
        };
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
                <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                            Active Tutors
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.tutors}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                            Pending Invites
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.pending}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
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
                    <InviteList invites={invites} busy={busy} onRevoke={handleRevoke} />
                )}
            </Paper>

            {/* Invite dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
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
                                We'll email a one-time link to set their password and bio.
                            </Typography>
                        </Box>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        <TextField
                            label="Full Name"
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            fullWidth
                            autoFocus
                            required
                            inputProps={{ maxLength: 120 }}
                            helperText="As it should appear on their profile."
                        />
                        <TextField
                            label="Email Address"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                            fullWidth
                            required
                            inputProps={{ maxLength: 255 }}
                            helperText="Used to send the invite and as their login."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} disabled={busy} sx={{ textTransform: 'none' }}>
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

const InviteList = ({ invites, busy, onRevoke }) => {
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
                const status = String(invite.status || (invite.accepted_at ? 'accepted' : 'pending')).toLowerCase();
                const isAccepted = status === 'accepted';
                const isExpired = status === 'expired';
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
                                    isAccepted
                                        ? <CheckCircleOutlined />
                                        : isExpired
                                            ? <HighlightOff />
                                            : <AccessTimeOutlined />
                                }
                                label={isAccepted ? 'Accepted' : isExpired ? 'Expired' : 'Pending'}
                                color={isAccepted ? 'success' : isExpired ? 'default' : 'warning'}
                                variant="outlined"
                            />
                            {!isAccepted && (
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

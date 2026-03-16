import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
    Fade,
    FormControl,
    IconButton,
    InputAdornment,
    InputBase,
    InputLabel,
    MenuItem,
    Modal,
    Paper,
    Popover,
    Select,
    Skeleton,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AddRounded,
    BlockRounded,
    BusinessOutlined,
    CloseRounded,
    EmailOutlined,
    FilterListRounded,
    MailOutlined,
    PeopleAltOutlined,
    RefreshRounded,
    ReplayRounded,
    SearchRounded,
    InfoOutlined,
} from '@mui/icons-material';
import { organizationService } from '../services/organizationService';
import { useOrganizationScope } from '../hooks/useOrganizationScope';
import OrganizationScopeToolbar from '../components/OrganizationScopeToolbar';
import {
    modalStyle,
    paperStyle,
    primaryButtonStyle,
    selectMenuProps,
    selectStyle,
    tableBodyCellStyle,
    tableHeaderCellStyle,
    textFieldStyle,
} from '../../../styles/formStyles';

const INVITE_STATUSES = ['pending', 'accepted', 'expired', 'revoked'];
const initialBatchForm = {
    expires_days: '7',
    emails_text: '',
};

const initialBulkActionForm = {
    action: 'resend',
    expires_days: '7',
    reason: 'Access revoked by admin',
};

const parseEmails = (value) =>
    String(value || '')
        .split(/[\n,;]/)
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

const normalizeDomain = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/^@+/, '');

const completeEmailWithDomain = (value, domain) => {
    const email = String(value || '').trim().toLowerCase();
    if (!email) return '';
    if (!domain) return email;
    if (email.endsWith('@')) return `${email}${domain}`;
    return email;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

const getBatchEmailSummary = (value, domain = '') => {
    const parsed = parseEmails(value).map((email) => completeEmailWithDomain(email, domain));
    const unique = [...new Set(parsed)];
    const valid = unique.filter(isValidEmail);
    const invalid = unique.filter((email) => !isValidEmail(email));

    return {
        valid,
        invalid,
        duplicatesRemoved: parsed.length - unique.length,
        totalParsed: parsed.length,
    };
};

const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
};

const FilterPopover = ({
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    return (
        <>
            <Tooltip title="Filters">
                <Button
                    startIcon={<FilterListRounded />}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                        bgcolor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid #1E293B',
                        color: '#E2E8F0',
                        textTransform: 'none',
                        px: 2,
                        '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.8)', borderColor: '#334155' },
                    }}
                >
                    Filters
                    {(statusFilter || searchTerm) && (
                        <Box
                            sx={{
                                ml: 1,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: '#3B82F6',
                                border: '2px solid #0F172A',
                            }}
                        />
                    )}
                </Button>
            </Tooltip>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        bgcolor: '#0F172A',
                        border: '1px solid #1E293B',
                        borderRadius: 2,
                        p: 2,
                        minWidth: 280,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    },
                }}
            >
                <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 700, mb: 2 }}>
                    Filter Invitations
                </Typography>
                <Stack spacing={2.5}>
                    <TextField
                        size="small"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={textFieldStyle}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRounded sx={{ color: '#64748B', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: '#94A3B8' }}>Status</InputLabel>
                        <Select
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All Statuses</MenuItem>
                            {INVITE_STATUSES.map((status) => (
                                <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                                    {status}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Divider sx={{ borderColor: '#1E293B' }} />

                    <Button
                        size="small"
                        fullWidth
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('');
                            setAnchorEl(null);
                        }}
                        sx={{ color: '#EF4444', textTransform: 'none', fontWeight: 600 }}
                    >
                        Reset Filters
                    </Button>
                </Stack>
            </Popover>
        </>
    );
};

const OrganizationInvitations = () => {
    const {
        organizations,
        selectedOrgId,
        selectedOrganization,
        setSelectedOrgId,
    } = useOrganizationScope();

    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [selectedInvitationIds, setSelectedInvitationIds] = useState([]);
    const [meta, setMeta] = useState({ total: 0 });

    const [openBatchModal, setOpenBatchModal] = useState(false);
    const [batchForm, setBatchForm] = useState(initialBatchForm);
    const [batchEmailInput, setBatchEmailInput] = useState('');

    const [openBulkModal, setOpenBulkModal] = useState(false);
    const [bulkForm, setBulkForm] = useState(initialBulkActionForm);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const selectedOrgDomain = useMemo(
        () => normalizeDomain(selectedOrganization?.email_domain),
        [selectedOrganization]
    );

    const batchSummary = useMemo(
        () => getBatchEmailSummary(batchForm.emails_text, selectedOrgDomain),
        [batchForm.emails_text, selectedOrgDomain]
    );

    const openSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const fetchInvitations = useCallback(async () => {
        if (!selectedOrgId) {
            setInvitations([]);
            setMeta({ total: 0 });
            return;
        }

        setLoading(true);
        try {
            const response = await organizationService.listInvitations(selectedOrgId, {
                q: searchTerm,
                status: statusFilter,
                per_page: 50,
            });

            setInvitations(response.data || []);
            setMeta(response.meta || { total: 0 });
        } catch (err) {
            console.error('Failed to list invitations:', err);
            setInvitations([]);
            setMeta({ total: 0 });
            openSnackbar(err.message || 'Failed to load invitations.', 'error');
        } finally {
            setLoading(false);
        }
    }, [selectedOrgId, searchTerm, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInvitations();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchInvitations]);

    useEffect(() => {
        setSelectedInvitationIds((prev) =>
            prev.filter((id) => invitations.some((invitation) => invitation.id === id))
        );
    }, [invitations]);

    const selectedInvitations = useMemo(
        () => invitations.filter((invitation) => selectedInvitationIds.includes(invitation.id)),
        [invitations, selectedInvitationIds]
    );

    const handleToggleSelectAll = () => {
        if (selectedInvitationIds.length === invitations.length && invitations.length > 0) {
            setSelectedInvitationIds([]);
            return;
        }

        setSelectedInvitationIds(invitations.map((invitation) => invitation.id));
    };

    const handleToggleRow = (id) => {
        setSelectedInvitationIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            }
            return [...prev, id];
        });
    };

    const handleBatchInvite = async () => {
        if (!selectedOrgId) {
            openSnackbar('Select an organization first.', 'error');
            return;
        }

        const emails = batchSummary.valid;
        if (emails.length === 0) {
            openSnackbar('Add at least one valid staff email address.', 'error');
            return;
        }

        setSaving(true);
        try {
            await organizationService.batchInviteStaff(selectedOrgId, {
                role: 'staff',
                expires_days: Number(batchForm.expires_days || 7),
                emails,
            });

            setBatchForm(initialBatchForm);
            setBatchEmailInput('');
            setOpenBatchModal(false);
            openSnackbar('Invitations sent successfully.');
            await fetchInvitations();
        } catch (err) {
            console.error('Failed to send invites:', err);
            openSnackbar(err.message || 'Failed to send invites.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleBatchEmailInputChange = (event) => {
        const nextValue = String(event.target.value || '');
        const completed = completeEmailWithDomain(nextValue, selectedOrgDomain);
        setBatchEmailInput(completed);
    };

    const handleAddBatchEmail = () => {
        const raw = String(batchEmailInput || '').trim().toLowerCase();
        if (!raw) return;

        const normalized = completeEmailWithDomain(raw, selectedOrgDomain);
        if (!normalized) return;

        const existing = new Set(parseEmails(batchForm.emails_text));
        if (existing.has(normalized)) {
            setBatchEmailInput('');
            return;
        }

        setBatchForm((prev) => {
            const next = prev.emails_text ? `${prev.emails_text}\n${normalized}` : normalized;
            return { ...prev, emails_text: next };
        });
        setBatchEmailInput('');
    };

    const handleRemoveBatchEmail = (emailToRemove) => {
        const nextEmails = parseEmails(batchForm.emails_text).filter((email) => email !== emailToRemove);
        setBatchForm((prev) => ({ ...prev, emails_text: nextEmails.join('\n') }));
    };

    const handleResendSingle = async (email) => {
        if (!selectedOrgId || !email) return;

        setActionLoading(email);
        try {
            await organizationService.resendSingleInvitation(selectedOrgId, {
                email,
                expires_days: 7,
            });
            openSnackbar(`Invitation resent to ${email}.`);
            await fetchInvitations();
        } catch (err) {
            console.error('Failed to resend invite:', err);
            openSnackbar(err.message || 'Failed to resend invitation.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRevokeSingle = async (invitation) => {
        if (!selectedOrgId || !invitation?.id) return;

        setActionLoading(invitation.id);
        try {
            await organizationService.revokeSingleInvitation(selectedOrgId, invitation.id, {
                reason: 'Invitation revoked by admin',
            });
            openSnackbar(`Invitation revoked for ${invitation.email}.`);
            await fetchInvitations();
        } catch (err) {
            console.error('Failed to revoke invitation:', err);
            openSnackbar(err.message || 'Failed to revoke invitation.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleExecuteBulkAction = async () => {
        if (!selectedOrgId || selectedInvitations.length === 0) {
            openSnackbar('Select one or more invitations first.', 'error');
            return;
        }

        const emails = selectedInvitations.map((item) => item.email).filter(Boolean);
        if (emails.length === 0) {
            openSnackbar('No valid emails selected.', 'error');
            return;
        }

        setSaving(true);
        try {
            if (bulkForm.action === 'resend') {
                await organizationService.resendBulkInvitations(selectedOrgId, {
                    emails,
                    expires_days: Number(bulkForm.expires_days || 7),
                });
                openSnackbar('Bulk resend completed.');
            } else {
                await organizationService.revokeBulkInvitations(selectedOrgId, {
                    emails,
                    reason: bulkForm.reason || 'Access revoked by admin',
                });
                openSnackbar('Bulk revoke completed.');
            }

            setOpenBulkModal(false);
            setSelectedInvitationIds([]);
            await fetchInvitations();
        } catch (err) {
            console.error('Failed bulk invitation action:', err);
            openSnackbar(err.message || 'Bulk invitation action failed.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2.5, md: 5 }, bgcolor: '#0F1729', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', md: 'center' }}
                spacing={3}
                sx={{ mb: 5 }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            color: '#F8FAFC',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        <MailOutlined sx={{ fontSize: 32, color: '#10B981' }} />
                        Organization Invitations
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 1, maxWidth: 600 }}>
                        Manage access to your organization. Invite staff quickly, use bulk tools to handle multiple invitations, and track status.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        startIcon={<AddRounded />}
                        onClick={() => setOpenBatchModal(true)}
                        disabled={!selectedOrgId}
                        sx={{
                            ...primaryButtonStyle,
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            height: 44,
                        }}
                    >
                        Invite Staff
                    </Button>

                    <Button
                        variant="soft"
                        startIcon={<ReplayRounded />}
                        onClick={() => {
                            setBulkForm(initialBulkActionForm);
                            setOpenBulkModal(true);
                        }}
                        disabled={!selectedOrgId || selectedInvitationIds.length === 0}
                        sx={{
                            bgcolor: 'rgba(99, 102, 241, 0.1)',
                            color: '#818CF8',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2,
                            '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' },
                            '&.Mui-disabled': { bgcolor: 'rgba(30, 41, 59, 0.4)', color: '#475569' },
                        }}
                    >
                        Bulk Action ({selectedInvitationIds.length})
                    </Button>

                    <Tooltip title="Refresh Data">
                        <IconButton
                            onClick={fetchInvitations}
                            sx={{
                                color: '#94A3B8',
                                bgcolor: 'rgba(30, 41, 59, 0.4)',
                                border: '1px solid #1E293B',
                                borderRadius: '10px',
                                '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.8)' },
                            }}
                        >
                            <RefreshRounded />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            <OrganizationScopeToolbar
                organizations={organizations}
                selectedOrgId={selectedOrgId}
                selectedOrganization={selectedOrganization}
                onChangeOrgId={setSelectedOrgId}
            />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                    Showing {invitations.length} of {meta.total || invitations.length} invitations
                </Typography>
                <FilterPopover
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
            </Stack>

            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    bgcolor: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    border: '1px solid #1E293B',
                    overflow: 'hidden',
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'rgba(30, 41, 59, 0.5)' }}>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5 }} padding="checkbox">
                                <Checkbox
                                    checked={invitations.length > 0 && selectedInvitationIds.length === invitations.length}
                                    indeterminate={selectedInvitationIds.length > 0 && selectedInvitationIds.length < invitations.length}
                                    onChange={handleToggleSelectAll}
                                    sx={{
                                        color: '#475569',
                                        '&.Mui-checked': { color: '#3B82F6' },
                                        '&.MuiCheckbox-indeterminate': { color: '#3B82F6' },
                                    }}
                                />
                            </TableCell>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Email</TableCell>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expires</TableCell>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accepted At</TableCell>
                            <TableCell align="right" sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} sx={{ borderBottom: '1px solid #1E293B' }}>
                                    <TableCell padding="checkbox"><Skeleton variant="rectangular" sx={{ bgcolor: '#1E293B', width: 20, height: 20, borderRadius: 0.5 }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: '60%', height: 24 }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="rectangular" sx={{ bgcolor: '#1E293B', width: 80, height: 24, borderRadius: 1 }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: 140 }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: 140 }} /></TableCell>
                                    <TableCell align="right" sx={tableBodyCellStyle}><Skeleton variant="rectangular" sx={{ bgcolor: '#1E293B', width: 120, height: 32, borderRadius: 1, ml: 'auto' }} /></TableCell>
                                </TableRow>
                            ))
                        ) : !selectedOrgId ? (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ p: 0 }}>
                                    <Box sx={{ py: 10, textAlign: 'center' }}>
                                        <BusinessOutlined sx={{ fontSize: 60, color: '#1E293B', mb: 2 }} />
                                        <Typography sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1 }}>No Organization Selected</Typography>
                                        <Typography sx={{ color: '#64748B', maxWidth: 300, mx: 'auto' }}>Please select an organization context above to manage pending and accepted invitations.</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : invitations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ p: 0 }}>
                                    <Box sx={{ py: 10, textAlign: 'center' }}>
                                        <PeopleAltOutlined sx={{ fontSize: 60, color: '#1E293B', mb: 2 }} />
                                        <Typography sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1 }}>No Invitations Found</Typography>
                                        <Typography sx={{ color: '#64748B', maxWidth: 300, mx: 'auto' }}>
                                            {searchTerm || statusFilter 
                                                ? "Try adjusting your filters or search terms to find what you're looking for."
                                                : "Start building your team by inviting members to join your organization."}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            invitations.map((invitation) => {
                                const rowLoading = actionLoading === invitation.id || actionLoading === invitation.email;
                                const isSelected = selectedInvitationIds.includes(invitation.id);

                                return (
                                    <TableRow
                                        key={invitation.id}
                                        sx={{
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                                            transition: 'background-color 0.2s ease',
                                            borderBottom: '1px solid #1E293B',
                                            bgcolor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                        }}
                                    >
                                        <TableCell sx={tableBodyCellStyle} padding="checkbox">
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={() => handleToggleRow(invitation.id)}
                                                sx={{
                                                    color: '#475569',
                                                    '&.Mui-checked': { color: '#3B82F6' },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <EmailOutlined sx={{ color: '#64748B', fontSize: 18 }} />
                                                <Typography sx={{ color: '#F1F5F9', fontWeight: 600, fontSize: '0.9rem' }}>
                                                    {invitation.email}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Chip
                                                size="small"
                                                label={invitation.status || 'unknown'}
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    bgcolor: invitation.status === 'accepted'
                                                        ? 'rgba(16, 185, 129, 0.1)'
                                                        : invitation.status === 'revoked'
                                                            ? 'rgba(239, 68, 68, 0.1)'
                                                            : invitation.status === 'pending'
                                                                ? 'rgba(245, 158, 11, 0.1)'
                                                                : 'rgba(100, 116, 139, 0.1)',
                                                    color:
                                                        invitation.status === 'accepted'
                                                            ? '#10B981'
                                                            : invitation.status === 'revoked'
                                                                ? '#EF4444'
                                                                : invitation.status === 'pending'
                                                                    ? '#F59E0B'
                                                                    : '#94A3B8',
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem',
                                                    borderRadius: '6px',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#94A3B8', fontSize: '0.85rem' }}>
                                            {formatDateTime(invitation.expires_at)}
                                        </TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#94A3B8', fontSize: '0.85rem' }}>
                                            {formatDateTime(invitation.accepted_at)}
                                        </TableCell>
                                        <TableCell align="right" sx={tableBodyCellStyle}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    onClick={() => handleResendSingle(invitation.email)}
                                                    disabled={rowLoading || invitation.status === 'accepted'}
                                                    sx={{
                                                        textTransform: 'none',
                                                        color: '#3B82F6',
                                                        fontWeight: 600,
                                                        fontSize: '0.8rem',
                                                        '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' },
                                                        '&.Mui-disabled': { color: '#334155' },
                                                    }}
                                                >
                                                    Resend
                                                </Button>
                                                <Button
                                                    size="small"
                                                    onClick={() => handleRevokeSingle(invitation)}
                                                    disabled={rowLoading || invitation.status === 'accepted' || invitation.status === 'revoked'}
                                                    sx={{
                                                        textTransform: 'none',
                                                        color: '#EF4444',
                                                        fontWeight: 600,
                                                        fontSize: '0.8rem',
                                                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' },
                                                        '&.Mui-disabled': { color: '#334155' },
                                                    }}
                                                >
                                                    Revoke
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Batch Invite Modal */}
            <Modal open={openBatchModal} onClose={() => !saving && setOpenBatchModal(false)}>
                <Box 
                    sx={{ 
                        ...modalStyle, 
                        width: { xs: '95%', md: 640 },
                        bgcolor: '#0F172A',
                        border: '1px solid #1E293B',
                        borderRadius: 3,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        p: 0,
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{ p: 3, borderBottom: '1px solid #1E293B', bgcolor: 'rgba(30, 41, 59, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                                Invite Staff Members
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
                                Add new members to your organization.
                            </Typography>
                        </Box>
                        <IconButton onClick={() => !saving && setOpenBatchModal(false)} sx={{ color: '#94A3B8' }}>
                            <CloseRounded />
                        </IconButton>
                    </Box>

                    <Stack spacing={3} sx={{ p: 3 }}>
                        <TextField
                            label="Expiration Period (Days)"
                            type="number"
                            value={batchForm.expires_days}
                            onChange={(event) => setBatchForm((prev) => ({ ...prev, expires_days: event.target.value }))}
                            sx={textFieldStyle}
                            fullWidth
                        />

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                            <TextField
                                label="Single Email Entry"
                                value={batchEmailInput}
                                onChange={handleBatchEmailInputChange}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        handleAddBatchEmail();
                                    }
                                }}
                                placeholder={selectedOrgDomain ? `user@` : 'user@company.com'}
                                sx={textFieldStyle}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailOutlined sx={{ color: '#64748B', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleAddBatchEmail}
                                sx={{ ...primaryButtonStyle, minWidth: 100, py: 0 }}
                            >
                                Add
                            </Button>
                        </Stack>

                        {!!selectedOrgDomain && (
                            <Box sx={{ p: 1, px: 1.5, borderRadius: 1.5, bgcolor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                <Typography sx={{ color: '#3B82F6', fontSize: '0.75rem', fontWeight: 600 }}>
                                    Domain Lock: @{selectedOrgDomain}
                                </Typography>
                            </Box>
                        )}

                        <TextField
                            label="Bulk Email Import"
                            multiline
                            rows={4}
                            value={batchForm.emails_text}
                            onChange={(event) => setBatchForm((prev) => ({ ...prev, emails_text: event.target.value }))}
                            sx={textFieldStyle}
                            placeholder={'user1@company.com\nuser2@company.com\nuser3@company.com'}
                            helperText="Separate emails by new lines or commas."
                        />

                        <Box>
                            <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem', mb: 1, fontWeight: 600 }}>
                                Validation Summary: {batchSummary.valid.length} Valid | {batchSummary.invalid.length} Invalid
                            </Typography>
                            
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                {batchSummary.valid.map((email) => (
                                    <Chip
                                        key={email}
                                        label={email}
                                        onDelete={() => handleRemoveBatchEmail(email)}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 600 }}
                                    />
                                ))}
                                {batchSummary.invalid.map((email) => (
                                    <Chip
                                        key={email}
                                        label={email}
                                        onDelete={() => handleRemoveBatchEmail(email)}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 600 }}
                                    />
                                ))}
                            </Stack>
                        </Box>

                        <Alert 
                            severity="info" 
                            icon={<InfoOutlined sx={{ color: '#3B82F6' }} />}
                            sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)', color: '#94A3B8', border: '1px solid rgba(59, 130, 246, 0.1)' }}
                        >
                            Paste directly from CSV or spreadsheets to invite multiple members at once.
                        </Alert>
                    </Stack>

                    <Box sx={{ p: 3, borderTop: '1px solid #1E293B', bgcolor: 'rgba(30, 41, 59, 0.5)', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={() => setOpenBatchModal(false)} disabled={saving} sx={{ color: '#94A3B8', textTransform: 'none', fontWeight: 600 }}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleBatchInvite} disabled={saving} sx={primaryButtonStyle}>
                            {saving ? 'Sending...' : 'Send Invitations'}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Bulk Action Modal */}
            <Modal open={openBulkModal} onClose={() => !saving && setOpenBulkModal(false)}>
                <Box 
                    sx={{ 
                        ...modalStyle, 
                        width: { xs: '95%', md: 520 },
                        bgcolor: '#0F172A',
                        border: '1px solid #1E293B',
                        borderRadius: 3,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        p: 0,
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{ p: 3, borderBottom: '1px solid #1E293B', bgcolor: 'rgba(30, 41, 59, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                            Bulk Action Control
                        </Typography>
                        <IconButton onClick={() => !saving && setOpenBulkModal(false)} sx={{ color: '#94A3B8' }}>
                            <CloseRounded />
                        </IconButton>
                    </Box>

                    <Stack spacing={3} sx={{ p: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: '#94A3B8' }}>Select Operation</InputLabel>
                            <Select
                                label="Select Operation"
                                value={bulkForm.action}
                                onChange={(event) => setBulkForm((prev) => ({ ...prev, action: event.target.value }))}
                                sx={selectStyle}
                                MenuProps={selectMenuProps}
                            >
                                <MenuItem value="resend">Resend Selected Invitations</MenuItem>
                                <MenuItem value="revoke">Revoke Selected Invitations</MenuItem>
                            </Select>
                        </FormControl>

                        {bulkForm.action === 'resend' ? (
                            <TextField
                                label="New Expiration Period (Days)"
                                type="number"
                                value={bulkForm.expires_days}
                                onChange={(event) => setBulkForm((prev) => ({ ...prev, expires_days: event.target.value }))}
                                sx={textFieldStyle}
                                fullWidth
                            />
                        ) : (
                            <TextField
                                label="Revocation Reason"
                                value={bulkForm.reason}
                                onChange={(event) => setBulkForm((prev) => ({ ...prev, reason: event.target.value }))}
                                sx={textFieldStyle}
                                fullWidth
                                placeholder="e.g. Access policy update"
                            />
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, borderRadius: 2, bgcolor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #1E293B' }}>
                            <PeopleAltOutlined sx={{ color: '#3B82F6' }} />
                            <Typography sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                                {selectedInvitationIds.length} members targeted for this action.
                            </Typography>
                        </Box>
                    </Stack>

                    <Box sx={{ p: 3, borderTop: '1px solid #1E293B', bgcolor: 'rgba(30, 41, 59, 0.5)', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={() => setOpenBulkModal(false)} disabled={saving} sx={{ color: '#94A3B8', textTransform: 'none', fontWeight: 600 }}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleExecuteBulkAction} disabled={saving} sx={{ ...primaryButtonStyle, bgcolor: bulkForm.action === 'revoke' ? '#EF4444' : '#3B82F6', '&:hover': { bgcolor: bulkForm.action === 'revoke' ? '#DC2626' : '#2563EB' } }}>
                            {saving ? 'Applying...' : 'Apply Bulk Action'}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={closeSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={closeSnackbar}
                    variant="filled"
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrganizationInvitations;

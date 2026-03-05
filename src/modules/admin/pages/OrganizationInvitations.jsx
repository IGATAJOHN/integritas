import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    FormControl,
    IconButton,
    InputBase,
    InputLabel,
    MenuItem,
    Modal,
    Paper,
    Select,
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
import { Add, Close, Refresh, Replay, Block } from '@mui/icons-material';
import { organizationService } from '../services/organizationService';
import { useOrganizationScope } from '../hooks/useOrganizationScope';
import OrganizationScopeToolbar from '../components/OrganizationScopeToolbar';
import {
    modalStyle,
    paperStyle,
    primaryButtonStyle,
    searchBarStyle,
    searchInputStyle,
    selectMenuProps,
    selectStyle,
    tableBodyCellStyle,
    tableHeaderCellStyle,
    textFieldStyle,
} from '../../../styles/formStyles';

const INVITE_STATUSES = ['pending', 'accepted', 'expired', 'revoked'];
const INVITE_ROLES = ['admin', 'manager', 'staff'];

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

const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
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
    const [roleFilter, setRoleFilter] = useState('');

    const [selectedInvitationIds, setSelectedInvitationIds] = useState([]);
    const [meta, setMeta] = useState({ total: 0 });

    const [openBatchModal, setOpenBatchModal] = useState(false);
    const [batchForm, setBatchForm] = useState(initialBatchForm);

    const [openBulkModal, setOpenBulkModal] = useState(false);
    const [bulkForm, setBulkForm] = useState(initialBulkActionForm);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
                role: roleFilter,
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
    }, [selectedOrgId, searchTerm, statusFilter, roleFilter]);

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
        if (selectedInvitationIds.length === invitations.length) {
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

        const emails = parseEmails(batchForm.emails_text);
        if (emails.length === 0) {
            openSnackbar('Add at least one email address.', 'error');
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
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Organization Invitations
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Invite staff, track invitation status, and manage resend/revoke operations.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenBatchModal(true)}
                        disabled={!selectedOrgId}
                        sx={primaryButtonStyle}
                    >
                        Invite Staff
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<Replay />}
                        onClick={() => {
                            setBulkForm(initialBulkActionForm);
                            setOpenBulkModal(true);
                        }}
                        disabled={!selectedOrgId || selectedInvitationIds.length === 0}
                        sx={{ borderColor: '#374151', color: '#E5E7EB' }}
                    >
                        Bulk Action ({selectedInvitationIds.length})
                    </Button>

                    <IconButton onClick={fetchInvitations} sx={{ color: '#9CA3AF' }}>
                        <Refresh />
                    </IconButton>
                </Stack>
            </Stack>

            <OrganizationScopeToolbar
                organizations={organizations}
                selectedOrgId={selectedOrgId}
                selectedOrganization={selectedOrganization}
                onChangeOrgId={setSelectedOrgId}
            />

            <Paper sx={{ ...paperStyle, p: 2, mb: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                    <Box sx={{ ...searchBarStyle, maxWidth: 420 }}>
                        <InputBase
                            placeholder="Search by email..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            sx={searchInputStyle}
                        />
                    </Box>

                    <FormControl sx={{ minWidth: 180 }}>
                        <InputLabel sx={{ color: '#9CA3AF' }}>Status</InputLabel>
                        <Select
                            label="Status"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All</MenuItem>
                            {INVITE_STATUSES.map((status) => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 180 }}>
                        <InputLabel sx={{ color: '#9CA3AF' }}>Role</InputLabel>
                        <Select
                            label="Role"
                            value={roleFilter}
                            onChange={(event) => setRoleFilter(event.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All</MenuItem>
                            {INVITE_ROLES.map((role) => (
                                <MenuItem key={role} value={role}>{role}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>
                        Total: {meta.total || invitations.length}
                    </Typography>
                </Stack>
            </Paper>

            <TableContainer component={Paper} sx={paperStyle}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={tableHeaderCellStyle} padding="checkbox">
                                <Checkbox
                                    checked={invitations.length > 0 && selectedInvitationIds.length === invitations.length}
                                    indeterminate={selectedInvitationIds.length > 0 && selectedInvitationIds.length < invitations.length}
                                    onChange={handleToggleSelectAll}
                                    sx={{ color: '#9CA3AF' }}
                                />
                            </TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Email</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Role</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Expires</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Accepted At</TableCell>
                            <TableCell align="right" sx={tableHeaderCellStyle}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!selectedOrgId ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ ...tableBodyCellStyle, py: 5, color: '#9CA3AF' }}>
                                    Select an organization to view invitations.
                                </TableCell>
                            </TableRow>
                        ) : loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ ...tableBodyCellStyle, py: 6 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : invitations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ ...tableBodyCellStyle, py: 5, color: '#9CA3AF' }}>
                                    No invitations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            invitations.map((invitation) => {
                                const statusColor =
                                    invitation.status === 'accepted'
                                        ? '#10B981'
                                        : invitation.status === 'pending'
                                            ? '#F59E0B'
                                            : invitation.status === 'revoked'
                                                ? '#EF4444'
                                                : '#9CA3AF';

                                const rowLoading = actionLoading === invitation.id || actionLoading === invitation.email;
                                const isSelected = selectedInvitationIds.includes(invitation.id);

                                return (
                                    <TableRow key={invitation.id}>
                                        <TableCell sx={tableBodyCellStyle} padding="checkbox">
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={() => handleToggleRow(invitation.id)}
                                                sx={{ color: '#9CA3AF' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#fff', fontWeight: 600 }}>
                                            {invitation.email}
                                        </TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB', textTransform: 'capitalize' }}>
                                            {invitation.role || '-'}
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Chip
                                                size="small"
                                                label={invitation.status || 'unknown'}
                                                sx={{
                                                    color: statusColor,
                                                    bgcolor: 'rgba(255,255,255,0.06)',
                                                    textTransform: 'capitalize',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>
                                            {formatDateTime(invitation.expires_at)}
                                        </TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>
                                            {formatDateTime(invitation.accepted_at)}
                                        </TableCell>
                                        <TableCell align="right" sx={tableBodyCellStyle}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="Resend">
                                                    <span>
                                                        <Button
                                                            size="small"
                                                            onClick={() => handleResendSingle(invitation.email)}
                                                            disabled={rowLoading || invitation.status === 'accepted'}
                                                            sx={{ color: '#3B82F6', textTransform: 'none' }}
                                                        >
                                                            Resend
                                                        </Button>
                                                    </span>
                                                </Tooltip>

                                                <Tooltip title="Revoke">
                                                    <span>
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            startIcon={<Block fontSize="small" />}
                                                            onClick={() => handleRevokeSingle(invitation)}
                                                            disabled={rowLoading || invitation.status === 'accepted' || invitation.status === 'revoked'}
                                                            sx={{ textTransform: 'none' }}
                                                        >
                                                            Revoke
                                                        </Button>
                                                    </span>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal open={openBatchModal} onClose={() => !saving && setOpenBatchModal(false)}>
                <Box sx={{ ...modalStyle, width: { xs: '95%', md: 640 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, borderBottom: '1px solid #374151' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 700 }}>Invite Staff</Typography>
                        <IconButton onClick={() => !saving && setOpenBatchModal(false)} sx={{ color: '#9CA3AF' }}>
                            <Close />
                        </IconButton>
                    </Stack>

                    <Stack spacing={2} sx={{ p: 2.5 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <TextField
                                label="Expires In (days)"
                                type="number"
                                value={batchForm.expires_days}
                                onChange={(event) => setBatchForm((prev) => ({ ...prev, expires_days: event.target.value }))}
                                sx={textFieldStyle}
                                fullWidth
                            />
                        </Stack>

                        <Alert severity="info" sx={{ bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#93C5FD' }}>
                            Role is fixed to <strong>staff</strong> for this endpoint.
                        </Alert>

                        <TextField
                            label="Emails (comma or newline separated)"
                            multiline
                            rows={6}
                            value={batchForm.emails_text}
                            onChange={(event) => setBatchForm((prev) => ({ ...prev, emails_text: event.target.value }))}
                            sx={textFieldStyle}
                            placeholder={'staff1@org.com\nstaff2@org.com'}
                        />

                        <Alert severity="info" sx={{ bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#93C5FD' }}>
                            Emails are normalized and duplicate invites are handled server-side.
                        </Alert>
                    </Stack>

                    <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ p: 2.5, borderTop: '1px solid #374151' }}>
                        <Button onClick={() => setOpenBatchModal(false)} disabled={saving} sx={{ color: '#9CA3AF', textTransform: 'none' }}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleBatchInvite} disabled={saving} sx={primaryButtonStyle}>
                            {saving ? 'Sending...' : 'Send Invitations'}
                        </Button>
                    </Stack>
                </Box>
            </Modal>

            <Modal open={openBulkModal} onClose={() => !saving && setOpenBulkModal(false)}>
                <Box sx={{ ...modalStyle, width: { xs: '95%', md: 580 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, borderBottom: '1px solid #374151' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 700 }}>Bulk Invitation Action</Typography>
                        <IconButton onClick={() => !saving && setOpenBulkModal(false)} sx={{ color: '#9CA3AF' }}>
                            <Close />
                        </IconButton>
                    </Stack>

                    <Stack spacing={2} sx={{ p: 2.5 }}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: '#9CA3AF' }}>Action</InputLabel>
                            <Select
                                label="Action"
                                value={bulkForm.action}
                                onChange={(event) => setBulkForm((prev) => ({ ...prev, action: event.target.value }))}
                                sx={selectStyle}
                                MenuProps={selectMenuProps}
                            >
                                <MenuItem value="resend">Resend Selected</MenuItem>
                                <MenuItem value="revoke">Revoke Selected</MenuItem>
                            </Select>
                        </FormControl>

                        {bulkForm.action === 'resend' ? (
                            <TextField
                                label="Expires In (days)"
                                type="number"
                                value={bulkForm.expires_days}
                                onChange={(event) => setBulkForm((prev) => ({ ...prev, expires_days: event.target.value }))}
                                sx={textFieldStyle}
                                fullWidth
                            />
                        ) : (
                            <TextField
                                label="Revoke Reason"
                                value={bulkForm.reason}
                                onChange={(event) => setBulkForm((prev) => ({ ...prev, reason: event.target.value }))}
                                sx={textFieldStyle}
                                fullWidth
                            />
                        )}

                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>
                            Selected invitations: {selectedInvitationIds.length}
                        </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ p: 2.5, borderTop: '1px solid #374151' }}>
                        <Button onClick={() => setOpenBulkModal(false)} disabled={saving} sx={{ color: '#9CA3AF', textTransform: 'none' }}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleExecuteBulkAction} disabled={saving} sx={primaryButtonStyle}>
                            {saving ? 'Applying...' : 'Apply Action'}
                        </Button>
                    </Stack>
                </Box>
            </Modal>

            <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={closeSnackbar} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrganizationInvitations;

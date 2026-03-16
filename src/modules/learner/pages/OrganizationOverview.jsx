import React, { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Fade,
    IconButton,
    InputAdornment,
    Modal,
    Paper,
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
    BusinessOutlined,
    CheckCircleRounded,
    CloseRounded,
    DeleteRounded,
    DomainRounded,
    InfoOutlined,
    LanguageRounded,
    LibraryAddRounded,
    RefreshRounded,
    VerifiedUserRounded,
} from '@mui/icons-material';
import { organizationService } from '../services/organizationService';
import { useOrganizationScope } from '../hooks/useOrganizationScope';
import OrganizationScopeToolbar from '../components/OrganizationScopeToolbar';
import {
    modalStyle,
    paperStyle,
    primaryButtonStyle,
    tableBodyCellStyle,
    tableHeaderCellStyle,
    textFieldStyle,
} from '../../../styles/formStyles';

const initialOrgForm = {
    name: '',
    email_domain: '',
    logo: null,
};

const getOrganizationAccessLabel = (organization = {}) => {
    const membershipRole = String(organization?.membership_role || '').trim().toLowerCase();

    if (organization?.is_owner || membershipRole === 'owner') return 'Owner';
    if (membershipRole === 'admin') return 'Admin';
    if (membershipRole === 'manager') return 'Manager';
    if (membershipRole === 'staff') return 'Invited Member';
    if (organization?.can_manage) return 'Manager Access';
    return 'Invited Member';
};

const OrganizationOverview = () => {
    const {
        organizations,
        selectedOrgId,
        selectedOrganization,
        setSelectedOrgId,
        refreshOrganizations,
        rememberOrganization,
        forgetOrganization,
    } = useOrganizationScope();

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [formData, setFormData] = useState(initialOrgForm);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false); // Simulated or actual refresh state

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const openSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            await refreshOrganizations();
        } finally {
            setTimeout(() => setLoading(false), 800);
        }
    };

    const handleCreateOrganization = async () => {
        if (!String(formData.name || '').trim() || !String(formData.email_domain || '').trim()) {
            openSnackbar('Organization name and email domain are required.', 'error');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: formData.name.trim(),
                email_domain: formData.email_domain.trim(),
                logo: formData.logo,
            };

            let created;
            if (formData.logo instanceof File) {
                created = await organizationService.createOrganizationMultipart(payload);
            } else {
                created = await organizationService.createOrganizationJson(payload);
            }

            rememberOrganization(created);
            setFormData(initialOrgForm);
            setOpenCreateModal(false);
            openSnackbar('Organization created and selected successfully.');
        } catch (err) {
            console.error('Failed to create organization:', err);
            openSnackbar(err.message || 'Failed to create organization.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const knownOrganizations = useMemo(
        () =>
            [...organizations].sort((left, right) => {
                const leftPriority = Number(Boolean(left?.is_owner || left?.can_manage));
                const rightPriority = Number(Boolean(right?.is_owner || right?.can_manage));
                if (leftPriority !== rightPriority) return rightPriority - leftPriority;
                return String(left?.name || '').localeCompare(String(right?.name || ''));
            }),
        [organizations]
    );

    const invitedOrganizations = useMemo(
        () => knownOrganizations.filter((organization) => !organization?.is_owner && !organization?.can_manage),
        [knownOrganizations]
    );

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
                        <BusinessOutlined sx={{ fontSize: 32, color: '#3B82F6' }} />
                        Organization Hub
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 1, maxWidth: 600 }}>
                        Manage your enterprise ecosystems. Switch between organizations, monitor access roles, and provision new workspaces from a centralized dashboard.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        startIcon={<AddRounded />}
                        onClick={() => setOpenCreateModal(true)}
                        sx={{
                            ...primaryButtonStyle,
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            height: 44,
                        }}
                    >
                        Add Organization
                    </Button>
                    <Tooltip title="Synchronize Records">
                        <IconButton
                            onClick={handleRefresh}
                            sx={{
                                color: '#94A3B8',
                                bgcolor: 'rgba(30, 41, 59, 0.4)',
                                border: '1px solid #1E293B',
                                borderRadius: '10px',
                                '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.8)' },
                            }}
                        >
                            <RefreshRounded sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                            <style>{`
                                @keyframes spin {
                                    from { transform: rotate(0deg); }
                                    to { transform: rotate(360deg); }
                                }
                            `}</style>
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            <OrganizationScopeToolbar
                title="Context Selector"
                subtitle="Override the active organization context to manage a different workspace."
                organizations={organizations}
                selectedOrgId={selectedOrgId}
                selectedOrganization={selectedOrganization}
                onChangeOrgId={setSelectedOrgId}
            />

            {invitedOrganizations.length > 0 && (
                <Fade in>
                    <Box
                        sx={{
                            p: 2,
                            mb: 4,
                            borderRadius: 2,
                            bgcolor: 'rgba(59, 130, 246, 0.05)',
                            border: '1px solid rgba(59, 130, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <VerifiedUserRounded sx={{ color: '#3B82F6' }} />
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                            You are currently part of <strong>{invitedOrganizations.length} invited organizations</strong>. Use the selector above to switch between them.
                        </Typography>
                    </Box>
                </Fade>
            )}

            <Typography variant="subtitle2" sx={{ color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                Organizational Repository
            </Typography>

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
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Workplace Name</TableCell>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Tier</TableCell>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sync Domain</TableCell>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Context Status</TableCell>
                            <TableCell align="right" sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Control</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i} sx={{ borderBottom: '1px solid #1E293B' }}>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: '70%', height: 24 }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="rectangular" sx={{ bgcolor: '#1E293B', width: 100, height: 24, borderRadius: 1 }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: '50%' }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="rectangular" sx={{ bgcolor: '#1E293B', width: 80, height: 24, borderRadius: 1 }} /></TableCell>
                                    <TableCell align="right" sx={tableBodyCellStyle}><Skeleton variant="rectangular" sx={{ bgcolor: '#1E293B', width: 120, height: 32, borderRadius: 1, ml: 'auto' }} /></TableCell>
                                </TableRow>
                            ))
                        ) : knownOrganizations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} sx={{ p: 0 }}>
                                    <Box sx={{ py: 12, textAlign: 'center' }}>
                                        <LibraryAddRounded sx={{ fontSize: 60, color: '#1E293B', mb: 2 }} />
                                        <Typography sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1 }}>Empty Repository</Typography>
                                        <Typography sx={{ color: '#64748B', maxWidth: 300, mx: 'auto' }}>You haven't provisioned or joined any organizations yet. Click "Add Organization" to begin.</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            knownOrganizations.map((organization) => {
                                const isActive = organization.id === selectedOrgId;
                                const accessLabel = getOrganizationAccessLabel(organization);
                                const isManager = organization?.is_owner || organization?.can_manage || accessLabel === 'Admin' || accessLabel === 'Owner' || accessLabel === 'Manager';

                                return (
                                    <TableRow
                                        key={organization.id}
                                        sx={{
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                                            transition: 'background-color 0.2s ease',
                                            borderBottom: '1px solid #1E293B',
                                            bgcolor: isActive ? 'rgba(59, 130, 246, 0.03)' : 'transparent'
                                        }}
                                    >
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '10px',
                                                        bgcolor: 'rgba(30, 41, 59, 0.5)',
                                                        border: '1px solid #1E293B',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: isActive ? '#3B82F6' : '#94A3B8'
                                                    }}
                                                >
                                                    <BusinessOutlined fontSize="small" />
                                                </Box>
                                                <Typography sx={{ color: '#F1F5F9', fontWeight: 600, fontSize: '0.95rem' }}>
                                                    {organization.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Chip
                                                size="small"
                                                label={accessLabel}
                                                sx={{
                                                    bgcolor: isManager ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                    color: isManager ? '#10B981' : '#3B82F6',
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem',
                                                    borderRadius: '6px',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#94A3B8', fontSize: '0.9rem' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LanguageRounded sx={{ fontSize: 16, color: '#334155' }} />
                                                {organization.email_domain || 'Internal Only'}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Chip
                                                size="small"
                                                label={isActive ? 'Active Context' : 'Available'}
                                                icon={isActive ? <CheckCircleRounded style={{ color: 'inherit', fontSize: 14 }} /> : undefined}
                                                sx={{
                                                    bgcolor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 41, 59, 0.5)',
                                                    color: isActive ? '#3B82F6' : '#64748B',
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem',
                                                    borderRadius: '6px',
                                                    '& .MuiChip-icon': { ml: 0.5 }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right" sx={tableBodyCellStyle}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    variant={isActive ? 'soft' : 'outlined'}
                                                    onClick={() => setSelectedOrgId(organization.id)}
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        fontSize: '0.8rem',
                                                        borderRadius: '8px',
                                                        px: 2,
                                                        ...(isActive ? {
                                                            bgcolor: 'rgba(59, 130, 246, 0.1)',
                                                            color: '#3B82F6',
                                                            pointerEvents: 'none'
                                                        } : {
                                                            borderColor: '#1E293B',
                                                            color: '#E2E8F0',
                                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.02)', borderColor: '#334155' }
                                                        })
                                                    }}
                                                >
                                                    {isActive ? 'Current Organization' : 'Switch Organization'}
                                                </Button>

                                                {organization?.can_delete && (
                                                    <Tooltip title="Forget Connection">
                                                        <IconButton
                                                            onClick={() => forgetOrganization(organization.id)}
                                                            sx={{ color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }, borderRadius: '8px' }}
                                                            size="small"
                                                        >
                                                            <DeleteRounded fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Creation Modal */}
            <Modal open={openCreateModal} onClose={() => !saving && setOpenCreateModal(false)}>
                <Box 
                    sx={{ 
                        ...modalStyle, 
                        width: { xs: '95%', md: 620 },
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
                                Add New Organization
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
                                Deploy a fresh organization instance for your workforce.
                            </Typography>
                        </Box>
                        <IconButton onClick={() => !saving && setOpenCreateModal(false)} sx={{ color: '#94A3B8' }}>
                            <CloseRounded />
                        </IconButton>
                    </Box>

                    <Stack spacing={3} sx={{ p: 3 }}>
                        <TextField
                            label="Organization Descriptor"
                            value={formData.name}
                            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                            fullWidth
                            sx={textFieldStyle}
                            placeholder="e.g. Acme Global Industries"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <BusinessOutlined sx={{ color: '#64748B', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="Corporate Email Domain"
                            value={formData.email_domain}
                            onChange={(event) => setFormData((prev) => ({ ...prev, email_domain: event.target.value }))}
                            fullWidth
                            placeholder="acme-global.com"
                            sx={textFieldStyle}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <DomainRounded sx={{ color: '#64748B', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mb: 1, display: 'block' }}>Identity Branding (Optional)</Typography>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<DomainRounded />}
                                fullWidth
                                sx={{
                                    height: 48,
                                    borderColor: '#1E293B',
                                    color: '#94A3B8',
                                    textTransform: 'none',
                                    justifyContent: 'flex-start',
                                    bgcolor: 'rgba(15, 23, 42, 0.4)',
                                    px: 2,
                                    '&:hover': { borderColor: '#334155', bgcolor: 'rgba(30, 41, 59, 0.5)' },
                                }}
                            >
                                <Typography noWrap sx={{ fontSize: '0.85rem' }}>
                                    {formData.logo ? formData.logo.name : 'Upload Core Branding (.svg, .png)'}
                                </Typography>
                                <input
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] || null;
                                        setFormData((prev) => ({ ...prev, logo: file }));
                                    }}
                                />
                            </Button>
                        </Box>

                        <Alert 
                            severity="info" 
                            icon={<InfoOutlined sx={{ color: '#3B82F6' }} />}
                            sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)', color: '#94A3B8', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: 2 }}
                        >
                            You will be assigned the <strong>Owner</strong> role for this organization automatically after deployment.
                        </Alert>
                    </Stack>

                    <Box sx={{ p: 3, borderTop: '1px solid #1E293B', bgcolor: 'rgba(30, 41, 59, 0.5)', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={() => setOpenCreateModal(false)} disabled={saving} sx={{ color: '#94A3B8', textTransform: 'none', fontWeight: 600 }}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleCreateOrganization} disabled={saving} sx={primaryButtonStyle}>
                            {saving ? <CircularProgress size={18} color="inherit" /> : 'Deploy Workspace'}
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

export default OrganizationOverview;

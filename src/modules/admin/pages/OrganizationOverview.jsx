import React, { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    Modal,
    Paper,
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
import { Add, Close, Delete, Refresh } from '@mui/icons-material';
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

const OrganizationOverview = () => {
    const {
        organizations,
        selectedOrgId,
        selectedOrganization,
        setSelectedOrgId,
        rememberOrganization,
        forgetOrganization,
    } = useOrganizationScope();

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [formData, setFormData] = useState(initialOrgForm);
    const [saving, setSaving] = useState(false);

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

    const knownOrganizations = useMemo(() => organizations, [organizations]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Organization Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Create organizations and manage active organization scope for invitations, paths, and assignments.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Tooltip title="Create Organization">
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setOpenCreateModal(true)}
                            sx={primaryButtonStyle}
                        >
                            New Organization
                        </Button>
                    </Tooltip>

                    <Tooltip title="Reload">
                        <IconButton sx={{ color: '#9CA3AF' }} onClick={() => setSelectedOrgId(selectedOrgId)}>
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            <OrganizationScopeToolbar
                title="Active Organization"
                subtitle="All organization endpoints require an org ID. Select or paste one here."
                organizations={organizations}
                selectedOrgId={selectedOrgId}
                selectedOrganization={selectedOrganization}
                onChangeOrgId={setSelectedOrgId}
            />

            <TableContainer component={Paper} sx={paperStyle}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={tableHeaderCellStyle}>Organization</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Email Domain</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Slug</TableCell>
                            <TableCell align="right" sx={tableHeaderCellStyle}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {knownOrganizations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ ...tableBodyCellStyle, py: 5, color: '#9CA3AF' }}>
                                    No organizations saved yet. Create one or paste an org ID above.
                                </TableCell>
                            </TableRow>
                        ) : (
                            knownOrganizations.map((organization) => {
                                const isActive = organization.id === selectedOrgId;
                                return (
                                    <TableRow key={organization.id}>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Typography sx={{ color: '#fff', fontWeight: 600 }}>{organization.name}</Typography>
                                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{organization.id}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>
                                            {organization.email_domain || '-'}
                                        </TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>
                                            {organization.slug || '-'}
                                        </TableCell>
                                        <TableCell align="right" sx={tableBodyCellStyle}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    variant={isActive ? 'contained' : 'outlined'}
                                                    onClick={() => setSelectedOrgId(organization.id)}
                                                    sx={isActive ? primaryButtonStyle : { borderColor: '#374151', color: '#E5E7EB' }}
                                                >
                                                    {isActive ? 'Active' : 'Set Active'}
                                                </Button>

                                                <IconButton
                                                    onClick={() => forgetOrganization(organization.id)}
                                                    sx={{ color: '#EF4444' }}
                                                    size="small"
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal open={openCreateModal} onClose={() => !saving && setOpenCreateModal(false)}>
                <Box sx={{ ...modalStyle, width: { xs: '95%', md: 620 }, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, borderBottom: '1px solid #374151' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 700 }}>Create Organization</Typography>
                        <IconButton onClick={() => !saving && setOpenCreateModal(false)} sx={{ color: '#9CA3AF' }}>
                            <Close />
                        </IconButton>
                    </Stack>

                    <Stack spacing={2} sx={{ p: 2.5 }}>
                        <TextField
                            label="Organization Name"
                            value={formData.name}
                            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                            fullWidth
                            sx={textFieldStyle}
                        />

                        <TextField
                            label="Email Domain"
                            value={formData.email_domain}
                            onChange={(event) => setFormData((prev) => ({ ...prev, email_domain: event.target.value }))}
                            fullWidth
                            placeholder="acme.com"
                            sx={textFieldStyle}
                        />

                        <Button
                            component="label"
                            variant="outlined"
                            sx={{
                                borderColor: '#374151',
                                color: '#E5E7EB',
                                textTransform: 'none',
                                justifyContent: 'flex-start',
                                '&:hover': { borderColor: '#4B5563', bgcolor: 'rgba(255,255,255,0.03)' },
                            }}
                        >
                            {formData.logo ? formData.logo.name : 'Attach Logo (optional)'}
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

                        <Alert severity="info" sx={{ bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#93C5FD' }}>
                            Creator is automatically added as organization owner.
                        </Alert>
                    </Stack>

                    <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ p: 2.5, borderTop: '1px solid #374151' }}>
                        <Button onClick={() => setOpenCreateModal(false)} disabled={saving} sx={{ color: '#9CA3AF', textTransform: 'none' }}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleCreateOrganization} disabled={saving} sx={primaryButtonStyle}>
                            {saving ? <CircularProgress size={18} color="inherit" /> : 'Create Organization'}
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

export default OrganizationOverview;

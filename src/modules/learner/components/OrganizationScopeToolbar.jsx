import React from 'react';
import {
    Alert,
    Box,
    Chip,
    FormControl,
    InputLabel,
    ListSubheader,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
} from '@mui/material';
import { selectMenuProps, selectStyle } from '../../../styles/formStyles';

const getOrganizationAccessLabel = (organization = {}) => {
    const membershipRole = String(organization?.membership_role || '').trim().toLowerCase();

    if (organization?.is_owner || membershipRole === 'owner') return 'Owner';
    if (membershipRole === 'admin') return 'Admin';
    if (membershipRole === 'manager') return 'Manager';
    if (membershipRole === 'staff') return 'Invited Member';
    if (organization?.can_manage) return 'Manager Access';
    return 'Invited Member';
};

const OrganizationScopeToolbar = ({
    title = 'Organization Scope',
    subtitle = 'Select an organization before performing org-level actions.',
    organizations = [],
    selectedOrgId = '',
    selectedOrganization = null,
    onChangeOrgId,
    actions = null,
}) => {
    const manageableOrganizations = organizations.filter(
        (organization) => Boolean(organization?.is_owner || organization?.can_manage)
    );
    const invitedOrganizations = organizations.filter(
        (organization) => !organization?.is_owner && !organization?.can_manage
    );

    return (
        <Paper sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151', p: 2.5, mb: 3 }}>
            <Stack spacing={2}>
                <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
                        {title}
                    </Typography>
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>
                        {subtitle}
                    </Typography>
                </Box>

                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', lg: 'center' }}>
                    <FormControl sx={{ minWidth: { xs: '100%', lg: 320 } }}>
                        <InputLabel sx={{ color: '#9CA3AF' }}>Known Organizations</InputLabel>
                        <Select
                            label="Known Organizations"
                            value={selectedOrgId}
                            onChange={(event) => onChangeOrgId?.(event.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">
                                <em>None selected</em>
                            </MenuItem>
                            {manageableOrganizations.length > 0 && (
                                <ListSubheader disableSticky sx={{ bgcolor: '#111827', color: '#9CA3AF' }}>
                                    Manageable Organizations
                                </ListSubheader>
                            )}
                            {manageableOrganizations.map((organization) => (
                                <MenuItem key={organization.id} value={organization.id}>
                                    {organization.name}
                                </MenuItem>
                            ))}
                            {invitedOrganizations.length > 0 && (
                                <ListSubheader disableSticky sx={{ bgcolor: '#111827', color: '#9CA3AF' }}>
                                    Invited Organizations
                                </ListSubheader>
                            )}
                            {invitedOrganizations.map((organization) => (
                                <MenuItem key={organization.id} value={organization.id}>
                                    {organization.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {actions}
                </Stack>

                {selectedOrganization ? (
                    <Alert severity="info" sx={{ bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#93C5FD' }}>
                        Active organization: <strong>{selectedOrganization.name}</strong>. Access: {getOrganizationAccessLabel(selectedOrganization)}.
                    </Alert>
                ) : (
                    <Alert severity="warning" sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                        No organization selected. Choose one to continue. Invited organizations appear below when available.
                    </Alert>
                )}

                {invitedOrganizations.length > 0 && (
                    <Box>
                        <Typography sx={{ color: '#E5E7EB', fontWeight: 600, fontSize: '0.82rem', mb: 1 }}>
                            Invited Organizations
                        </Typography>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            {invitedOrganizations.map((organization) => {
                                const isActive = organization.id === selectedOrgId;
                                return (
                                    <Chip
                                        key={organization.id}
                                        label={organization.name}
                                        onClick={() => onChangeOrgId?.(organization.id)}
                                        variant={isActive ? 'filled' : 'outlined'}
                                        sx={{
                                            bgcolor: isActive ? 'rgba(17,82,212,0.2)' : 'transparent',
                                            color: isActive ? '#93C5FD' : '#D1D5DB',
                                            borderColor: '#374151',
                                            fontWeight: 600,
                                        }}
                                    />
                                );
                            })}
                        </Stack>
                    </Box>
                )}
            </Stack>
        </Paper>
    );
};

export default OrganizationScopeToolbar;

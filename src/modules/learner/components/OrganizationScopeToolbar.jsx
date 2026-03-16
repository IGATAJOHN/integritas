import React from 'react';
import {
    Alert,
    Box,
    Chip,
    FormControl,
    ListSubheader,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
} from '@mui/material';
import { BusinessOutlined, ExpandMoreRounded } from '@mui/icons-material';
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
        <Paper
            elevation={0}
            sx={{
                bgcolor: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(8px)',
                borderRadius: 2,
                border: '1px solid #1E293B',
                p: { xs: 1.5, md: 2 },
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 280 }}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '10px',
                        bgcolor: selectedOrganization ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid',
                        borderColor: selectedOrganization ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <BusinessOutlined
                        sx={{
                            color: selectedOrganization ? '#60A5FA' : '#64748B',
                            fontSize: 22,
                        }}
                    />
                </Box>
                <Box>
                    <Typography sx={{ color: selectedOrganization ? '#F8FAFC' : '#E2E8F0', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.2 }}>
                        {selectedOrganization ? selectedOrganization.name : title}
                    </Typography>
                    <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem', mt: 0.5 }}>
                        {selectedOrganization
                            ? `Role: ${getOrganizationAccessLabel(selectedOrganization)}`
                            : subtitle}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 240 } }}>
                    <Select
                        displayEmpty
                        value={selectedOrgId}
                        onChange={(event) => onChangeOrgId?.(event.target.value)}
                        IconComponent={ExpandMoreRounded}
                        sx={{
                            ...selectStyle,
                            height: 42,
                            bgcolor: '#0B1120',
                            borderColor: '#1E293B',
                            borderRadius: '8px',
                            '&:hover': {
                                borderColor: '#334155',
                            },
                            '& .MuiSelect-select': {
                                py: 1,
                                px: 1.5,
                                color: selectedOrgId ? '#F8FAFC' : '#64748B',
                                fontSize: '0.9rem',
                            },
                        }}
                        MenuProps={selectMenuProps}
                    >
                        <MenuItem value="" disabled>
                            <em>Select Organization Context</em>
                        </MenuItem>
                        {manageableOrganizations.length > 0 && (
                            <ListSubheader disableSticky sx={{ bgcolor: '#0B1120', color: '#94A3B8', fontSize: '0.75rem', lineHeight: '32px' }}>
                                Manageable Organizations
                            </ListSubheader>
                        )}
                        {manageableOrganizations.map((organization) => (
                            <MenuItem key={organization.id} value={organization.id} sx={{ fontSize: '0.9rem' }}>
                                {organization.name}
                            </MenuItem>
                        ))}
                        {invitedOrganizations.length > 0 && (
                            <ListSubheader disableSticky sx={{ bgcolor: '#0B1120', color: '#94A3B8', fontSize: '0.75rem', lineHeight: '32px', borderTop: '1px solid #1E293B' }}>
                                Invited Organizations
                            </ListSubheader>
                        )}
                        {invitedOrganizations.map((organization) => (
                            <MenuItem key={organization.id} value={organization.id} sx={{ fontSize: '0.9rem' }}>
                                {organization.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {actions}
            </Box>
        </Paper>
    );
};

export default OrganizationScopeToolbar;

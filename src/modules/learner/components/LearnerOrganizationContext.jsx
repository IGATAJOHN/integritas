import React, { useMemo, useState } from 'react';
import {
    Alert,
    Avatar,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
} from '@mui/material';
import { Groups, School } from '@mui/icons-material';
import { useAuth } from '../../../contexts';
import { getOrganizationRole } from '../../../utils';
import { selectMenuProps, selectStyle } from '../../../styles/formStyles';

const STORAGE_KEY = 'ggh_learner_selected_org_id';

const getOrganizationLabel = (organization) => {
    if (!organization) return '-';
    return organization.name || organization.slug || organization.id || '-';
};

const LearnerOrganizationContext = () => {
    const { user } = useAuth();

    const organizations = useMemo(() => {
        if (Array.isArray(user?.organizations) && user.organizations.length > 0) {
            return user.organizations;
        }
        if (user?.organization && typeof user.organization === 'object') {
            return [user.organization];
        }
        return [];
    }, [user]);

    const [selectedOrgId, setSelectedOrgId] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = String(localStorage.getItem(STORAGE_KEY) || '').trim();
            if (stored) return stored;
        }
        const first = organizations[0];
        return String(first?.id || user?.organization_id || user?.org_id || '').trim();
    });

    const selectedOrganization = useMemo(() => {
        if (!selectedOrgId) return organizations[0] || null;
        return (
            organizations.find((organization) => String(organization?.id || '').trim() === selectedOrgId) ||
            organizations[0] ||
            null
        );
    }, [organizations, selectedOrgId]);

    const organizationRole = getOrganizationRole(user) || 'learner';

    const handleChangeOrganization = (event) => {
        const nextId = String(event.target.value || '').trim();
        setSelectedOrgId(nextId);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, nextId);
        }
    };

    return (
        <Paper sx={{ bgcolor: '#1A2230', border: '1px solid #374151', borderRadius: 2, p: 2, mb: 2.5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.18)', color: '#60A5FA', width: 34, height: 34 }}>
                        <Groups sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Stack spacing={0.25}>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                            Learner Organization Context
                        </Typography>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.78rem' }}>
                            Organization is module-level. Organization creation is user-owned.
                        </Typography>
                    </Stack>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ width: { xs: '100%', md: 'auto' } }}>
                    {organizations.length > 1 ? (
                        <FormControl sx={{ minWidth: { xs: '100%', sm: 280 } }}>
                            <InputLabel sx={{ color: '#9CA3AF' }}>Organization</InputLabel>
                            <Select
                                label="Organization"
                                value={String(selectedOrganization?.id || '')}
                                onChange={handleChangeOrganization}
                                sx={selectStyle}
                                MenuProps={selectMenuProps}
                            >
                                {organizations.map((organization) => (
                                    <MenuItem key={organization.id} value={String(organization.id)}>
                                        {getOrganizationLabel(organization)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : (
                        <Chip
                            label={getOrganizationLabel(selectedOrganization)}
                            sx={{ bgcolor: 'rgba(17, 82, 212, 0.2)', color: '#93C5FD', fontWeight: 600 }}
                        />
                    )}

                    <Chip
                        icon={<School sx={{ fontSize: 16 }} />}
                        label={`Role: ${organizationRole}`}
                        sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', textTransform: 'capitalize' }}
                    />
                </Stack>
            </Stack>

            {!selectedOrganization && (
                <Alert severity="warning" sx={{ mt: 1.75, bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' }}>
                    No organization linked to this learner account yet.
                </Alert>
            )}
        </Paper>
    );
};

export default LearnerOrganizationContext;

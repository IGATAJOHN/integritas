import React, { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { selectMenuProps, selectStyle, textFieldStyle } from '../../../styles/formStyles';

const OrganizationScopeToolbar = ({
    title = 'Organization Scope',
    subtitle = 'Select an organization before performing org-level actions.',
    organizations = [],
    selectedOrgId = '',
    selectedOrganization = null,
    onChangeOrgId,
    actions = null,
}) => {
    const [manualOrgId, setManualOrgId] = useState(selectedOrgId || '');

    const applyManualOrgId = () => {
        if (typeof onChangeOrgId !== 'function') return;
        onChangeOrgId(manualOrgId);
    };

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
                            {organizations.map((organization) => (
                                <MenuItem key={organization.id} value={organization.id}>
                                    {organization.name} ({organization.id})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Or paste Organization ID"
                        value={manualOrgId}
                        onChange={(event) => setManualOrgId(event.target.value)}
                        sx={{ ...textFieldStyle, flex: 1 }}
                        placeholder="019c6dfa-ea1c-731f-bc43-1993ebb25fb7"
                    />

                    <Button
                        variant="contained"
                        onClick={applyManualOrgId}
                        sx={{
                            bgcolor: '#1152D4',
                            '&:hover': { bgcolor: '#0D42AF' },
                            textTransform: 'none',
                            minHeight: 40,
                        }}
                    >
                        Apply Org ID
                    </Button>

                    {actions}
                </Stack>

                {selectedOrganization ? (
                    <Alert severity="info" sx={{ bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#93C5FD' }}>
                        Active organization: <strong>{selectedOrganization.name}</strong> ({selectedOrganization.id})
                    </Alert>
                ) : selectedOrgId ? (
                    <Alert severity="warning" sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                        Active organization ID: <strong>{selectedOrgId}</strong> (not in saved list yet).
                    </Alert>
                ) : (
                    <Alert severity="warning" sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                        No organization selected. Choose one to continue.
                    </Alert>
                )}
            </Stack>
        </Paper>
    );
};

export default OrganizationScopeToolbar;

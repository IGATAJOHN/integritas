import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Snackbar,
    Stack,
    Typography,
} from '@mui/material';
import {
    AddBusinessOutlined,
    AssignmentTurnedInOutlined,
    GroupAddOutlined,
    QueryStatsOutlined,
    RouteOutlined,
    TaskOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts';
import { canManageOrganization, getOrganizationRole, hasOrganizationAccess } from '../../../utils';
import OrganizationScopeToolbar from '../components/OrganizationScopeToolbar';
import { useOrganizationScope } from '../hooks/useOrganizationScope';
import organizationService from '../services/organizationService';
import { paperStyle, primaryButtonStyle } from '../../../styles/formStyles';

const resolveTotal = (response) => {
    if (typeof response?.meta?.total === 'number') return response.meta.total;
    if (Array.isArray(response?.data)) return response.data.length;
    return 0;
};

const StatCard = ({ title, value, subtitle, icon }) => (
    <Paper sx={{ ...paperStyle, p: 2.5, minHeight: 140 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem', mb: 1 }}>{title}</Typography>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.8rem', lineHeight: 1.1 }}>{value}</Typography>
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.78rem', mt: 1 }}>{subtitle}</Typography>
            </Box>
            <Box sx={{ color: '#1152D4', opacity: 0.95 }}>{icon}</Box>
        </Stack>
    </Paper>
);

const OrganizationDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const orgRole = getOrganizationRole(user);
    const hasOrgAccess = hasOrganizationAccess(user);
    const canManage = canManageOrganization(user);

    const {
        organizations,
        selectedOrgId,
        selectedOrganization,
        setSelectedOrgId,
    } = useOrganizationScope();

    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        invitations: 0,
        learningPaths: 0,
        assignments: 0,
        myAssignments: 0,
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const openSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const loadSummary = useCallback(async () => {
        if (!selectedOrgId) {
            setStats((prev) => ({ ...prev, invitations: 0, learningPaths: 0, assignments: 0 }));
            return;
        }

        setLoading(true);
        try {
            const requests = [];
            if (canManage) {
                requests.push(
                    organizationService.listInvitations(selectedOrgId, { per_page: 1 }),
                    organizationService.listLearningPaths(selectedOrgId, { per_page: 1 }),
                    organizationService.listAssignments(selectedOrgId, { per_page: 1 })
                );
            }

            requests.push(organizationService.listMyAssignments({ per_page: 1 }));

            const responses = await Promise.all(requests);

            if (canManage) {
                const [invitationResponse, pathResponse, assignmentResponse, myAssignmentsResponse] = responses;
                setStats({
                    invitations: resolveTotal(invitationResponse),
                    learningPaths: resolveTotal(pathResponse),
                    assignments: resolveTotal(assignmentResponse),
                    myAssignments: resolveTotal(myAssignmentsResponse),
                });
            } else {
                const [myAssignmentsResponse] = responses;
                setStats((prev) => ({
                    ...prev,
                    invitations: 0,
                    learningPaths: 0,
                    assignments: 0,
                    myAssignments: resolveTotal(myAssignmentsResponse),
                }));
            }
        } catch (error) {
            console.error('Failed to load organization summary:', error);
            openSnackbar(error.message || 'Failed to load dashboard summary.', 'error');
        } finally {
            setLoading(false);
        }
    }, [canManage, selectedOrgId]);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    const quickActions = useMemo(() => {
        const actions = [
            {
                label: 'Create Organization',
                icon: <AddBusinessOutlined />,
                onClick: () => navigate('/org/create'),
            },
            {
                label: 'My Assignments',
                icon: <TaskOutlined />,
                onClick: () => navigate('/org/my-assignments'),
                visible: hasOrgAccess,
            },
        ];

        if (canManage) {
            actions.push(
                { label: 'Manage Invitations', icon: <GroupAddOutlined />, onClick: () => navigate('/org/invitations') },
                { label: 'Manage Learning Paths', icon: <RouteOutlined />, onClick: () => navigate('/org/learning-paths') },
                { label: 'Manage Assignments', icon: <AssignmentTurnedInOutlined />, onClick: () => navigate('/org/assignments') },
                { label: 'View Reports', icon: <QueryStatsOutlined />, onClick: () => navigate('/org/reports') }
            );
        }

        return actions.filter((item) => item.visible !== false);
    }, [canManage, hasOrgAccess, navigate]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Organization Dashboard
                    </Typography>
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                        Collaborate with your organization team, assign content, and track progress from one workspace.
                    </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Role:</Typography>
                    <Typography sx={{ color: '#fff', textTransform: 'capitalize', fontWeight: 600 }}>
                        {orgRole || 'No organization role yet'}
                    </Typography>
                </Stack>
            </Stack>

            <OrganizationScopeToolbar
                organizations={organizations}
                selectedOrgId={selectedOrgId}
                selectedOrganization={selectedOrganization}
                onChangeOrgId={setSelectedOrgId}
                title="Active Organization Context"
                subtitle="Pick organization context for organization endpoints."
            />

            {!hasOrgAccess && (
                <Alert
                    severity="info"
                    sx={{
                        mb: 3,
                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                        color: '#93C5FD',
                        border: '1px solid rgba(59,130,246,0.3)',
                    }}
                >
                    You are authenticated but not yet attached to any organization role. Create one or accept an invitation.
                </Alert>
            )}

            {loading ? (
                <Paper sx={{ ...paperStyle, p: 6, textAlign: 'center', mb: 3 }}>
                    <CircularProgress />
                </Paper>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0,1fr))', xl: 'repeat(4, minmax(0,1fr))' },
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <StatCard
                        title="Pending Invitations"
                        value={stats.invitations}
                        subtitle="Invitation records in current organization."
                        icon={<GroupAddOutlined sx={{ fontSize: 34 }} />}
                    />
                    <StatCard
                        title="Learning Paths"
                        value={stats.learningPaths}
                        subtitle="Learning paths scoped to selected organization."
                        icon={<RouteOutlined sx={{ fontSize: 34 }} />}
                    />
                    <StatCard
                        title="Assignments"
                        value={stats.assignments}
                        subtitle="Assignments created by organization managers."
                        icon={<AssignmentTurnedInOutlined sx={{ fontSize: 34 }} />}
                    />
                    <StatCard
                        title="My Assignments"
                        value={stats.myAssignments}
                        subtitle="Assignments currently linked to your account."
                        icon={<TaskOutlined sx={{ fontSize: 34 }} />}
                    />
                </Box>
            )}

            <Paper sx={{ ...paperStyle, p: 2.5 }}>
                <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>Quick Actions</Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} sx={{ flexWrap: 'wrap' }}>
                    {quickActions.map((action) => (
                        <Button
                            key={action.label}
                            variant="contained"
                            onClick={action.onClick}
                            startIcon={action.icon}
                            sx={{ ...primaryButtonStyle, textTransform: 'none' }}
                        >
                            {action.label}
                        </Button>
                    ))}
                </Stack>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3500}
                onClose={closeSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={closeSnackbar} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrganizationDashboard;

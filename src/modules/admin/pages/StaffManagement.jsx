import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    IconButton,
    Chip,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Modal,
    TextField,
    MenuItem,
    Select,
    InputBase,
    Checkbox,
    FormControlLabel,
    Grid,
    Tooltip,
    CircularProgress,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Delete,
    AdminPanelSettings,
    Close,
    PersonAdd,
    CheckCircle,
    Block,
    Refresh,
    ContentCopy,
} from '@mui/icons-material';
import { textFieldStyle, selectStyle, modalStyle } from '../../../styles/formStyles';
import { staffService } from '../services/staffService';
import theme from '../../../styles/theme';


/**
 * StaffManagement Component
 * 
 * Manages internal company staff (admins) with the following features:
 * - List staff via GET /admins (with search and status filters)
 * - Create new staff via POST /admins
 * - Edit staff via PUT /admins/{id}
 * - Delete staff via DELETE /admins/{id}
 * 
 * Note: Requires super_admin role for all operations.
 */

const PRIVILEGES = [
    'manage_staff',
    'manage_learners',
    'manage_tutors',
    'manage_reviewers',
    'manage_courses',
    'review_submissions',
    'manage_payments',
    'view_reports',
    'system_settings',
];

const StaffManagement = () => {
    // Data state
    const [staff, setStaff] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Snackbar for notifications
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Credentials dialog (shows auto-generated password after create)
    const [credentials, setCredentials] = useState(null);

    // Role management (local for now - could be API later)
    const [roles, setRoles] = useState([
        { id: 1, name: 'Admin', description: 'Full system access', privileges: PRIVILEGES },
        { id: 2, name: 'Support', description: 'Can view reports and manage users', privileges: ['manage_learners', 'manage_tutors'] },
    ]);

    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDescription, setNewRoleDescription] = useState('');
    const [newRolePrivileges, setNewRolePrivileges] = useState([]);

    // Modal states
    const [openStaffModal, setOpenStaffModal] = useState(false);
    const [openRoleModal, setOpenRoleModal] = useState(false);
    const [currentStaff, setCurrentStaff] = useState(null);

    // Form state for new/edit staff
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: '',
        department: '',
        job_title: '',
        staff_no: '',
        status: 'Active',
    });

    /**
     * Fetch all staff from the API
     * GET /admins (with optional search and status filters)
     */
    const fetchStaff = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await staffService.listStaff({
                search: searchTerm || undefined,
                status: statusFilter || undefined
            });
            setStaff(response.data || []);
        } catch (err) {
            console.error('Error fetching staff:', err);
            setError(err.message || 'Failed to load staff');
            setSnackbar({ open: true, message: 'Failed to load staff', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter]);

    // Fetch staff on component mount and when filters change
    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    // Filter staff locally for immediate feedback (API also supports server-side filtering)
    const filteredStaff = staff.filter(user => {
        const name = user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : (user.user?.name || user.name || '');
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.user?.email || user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    });

    /**
     * Open staff modal for create/edit
     */
    const handleOpenStaffModal = (user = null) => {
        if (user) {
            // Edit mode - populate form with existing data
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.user?.email || user.email || '',
                phone: user.phone || '',
                gender: user.gender || '',
                department: user.department || '',
                job_title: user.job_title || '',
                staff_no: user.staff_no || '',
                status: user.status || 'Active',
            });
            setCurrentStaff(user);
        } else {
            // Create mode - reset form
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                gender: '',
                department: '',
                job_title: '',
                staff_no: '',
                status: 'Active',
            });
            setCurrentStaff(null);
        }
        setOpenStaffModal(true);
    };

    const handleCloseStaffModal = () => {
        setOpenStaffModal(false);
        setCurrentStaff(null);
    };

    /**
     * Create or update staff
     */
    const handleSaveStaff = async () => {
        if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
            setSnackbar({ open: true, message: 'First name, last name, and email are required', severity: 'error' });
            return;
        }

        setSaving(true);
        try {
            if (currentStaff) {
                // Update existing staff
                await staffService.updateStaff(currentStaff.id, formData);
                setSnackbar({ open: true, message: 'Staff updated successfully', severity: 'success' });
            } else {
                // Create new staff
                const response = await staffService.createStaff(formData);

                // Show credentials if auto-generated password was returned
                if (response.credentials) {
                    setCredentials(response.credentials);
                }

                setSnackbar({ open: true, message: 'Staff created successfully', severity: 'success' });
            }
            handleCloseStaffModal();
            await fetchStaff();
        } catch (err) {
            console.error('Error saving staff:', err);
            setSnackbar({ open: true, message: err.message || 'Failed to save staff', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    /**
     * Delete staff member
     */
    const handleDeleteStaff = async (user) => {
        const name = user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : (user.user?.name || 'this staff member');

        if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            return;
        }

        setActionLoading(user.id);
        try {
            await staffService.deleteStaff(user.id);
            setSnackbar({ open: true, message: 'Staff deleted successfully', severity: 'success' });
            await fetchStaff();
        } catch (err) {
            console.error('Error deleting staff:', err);
            setSnackbar({ open: true, message: err.message || 'Failed to delete staff', severity: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    /**
     * Copy credentials to clipboard
     */
    const handleCopyCredentials = () => {
        if (credentials) {
            const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
            navigator.clipboard.writeText(text);
            setSnackbar({ open: true, message: 'Credentials copied to clipboard', severity: 'success' });
        }
    };

    // Role management handlers (local)
    const handleOpenRoleModal = () => {
        setNewRoleName('');
        setNewRoleDescription('');
        setNewRolePrivileges([]);
        setOpenRoleModal(true);
    };

    const handleCloseRoleModal = () => {
        setOpenRoleModal(false);
    };

    const handlePrivilegeToggle = (privilege) => {
        setNewRolePrivileges(prev => {
            if (prev.includes(privilege)) {
                return prev.filter(item => item !== privilege);
            } else {
                return [...prev, privilege];
            }
        });
    };

    const handleAddRole = () => {
        if (newRoleName) {
            const newRole = {
                id: roles.length + 1,
                name: newRoleName,
                description: newRoleDescription,
                privileges: newRolePrivileges,
            };
            setRoles([...roles, newRole]);
            setNewRoleName('');
            setNewRoleDescription('');
            setNewRolePrivileges([]);
        }
    };

    const handleDeleteRole = (id) => {
        setRoles(roles.filter(role => role.id !== id));
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    /**
     * Get display name for a staff member
     */
    const getDisplayName = (user) => {
        if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`;
        }
        return user.user?.name || user.name || 'Unknown';
    };

    /**
     * Get initials for avatar
     */
    const getInitials = (user) => {
        if (user.first_name && user.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`;
        }
        const name = user.user?.name || user.name || '?';
        return name.split(' ').map(n => n[0]).join('');
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            {/* Header Section */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Staff Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Manage administrative staff and system roles.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Tooltip title="Refresh">
                        <IconButton
                            onClick={fetchStaff}
                            disabled={loading}
                            sx={{
                                color: '#9CA3AF',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="outlined"
                        startIcon={<AdminPanelSettings />}
                        onClick={handleOpenRoleModal}
                        sx={{
                            color: '#fff',
                            borderColor: '#374151',
                            '&:hover': { borderColor: '#4B5563', bgcolor: 'rgba(255,255,255,0.05)' }
                        }}
                    >
                        Manage Roles
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenStaffModal()}
                        sx={{
                            bgcolor: theme.colors.brand,
                            '&:hover': { bgcolor: '#0D42AF' },
                            boxShadow: '0 4px 14px rgba(17, 82, 212, 0.4)'
                        }}
                    >
                        Create Staff
                    </Button>
                </Stack>
            </Stack>

            {/* Search Section */}
            <Paper sx={{ p: 2, mb: 4, bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <Box sx={{
                        bgcolor: "#1F2937",
                        borderRadius: 1,
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        width: '100%',
                        maxWidth: 400,
                        height: '40px'
                    }}>
                        <Search sx={{ color: "#9CA3AF", fontSize: 20 }} />
                        <InputBase
                            placeholder="Search staff by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                color: "#FFFFFF",
                                fontSize: '0.9rem',
                                width: '100%',
                                '& input': {
                                    border: 'none',
                                    outline: 'none',
                                    '&::placeholder': { color: '#6B7280' }
                                }
                            }}
                        />
                    </Box>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        displayEmpty
                        sx={{
                            ...selectStyle,
                            minWidth: 150,
                            height: '40px',
                        }}
                    >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                </Stack>
            </Paper>

            {/* Staff Table */}
            <TableContainer component={Paper} sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Staff Member</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Department</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Job Title</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Status</TableCell>
                            <TableCell align="right" sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
                                    <CircularProgress size={40} sx={{ color: theme.colors.brand }} />
                                    <Typography sx={{ color: '#9CA3AF', mt: 2 }}>Loading staff...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 4 }}>
                                    <Alert severity="error" sx={{ bgcolor: 'transparent', justifyContent: 'center' }}>
                                        {error}
                                    </Alert>
                                    <Button onClick={fetchStaff} sx={{ mt: 2, color: theme.colors.brand }}>Try Again</Button>
                                </TableCell>
                            </TableRow>
                        ) : filteredStaff.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
                                    <AdminPanelSettings sx={{ fontSize: 48, color: '#374151', mb: 2 }} />
                                    <Typography sx={{ color: '#9CA3AF' }}>
                                        {searchTerm || statusFilter ? 'No staff match your filters' : 'No staff found. Click "Create Staff" to add one.'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : filteredStaff.map((user) => {
                            const isActionLoading = actionLoading === user.id;
                            const isActive = user.status?.toLowerCase() === 'active';
                            return (
                                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ color: '#fff', borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Avatar sx={{ width: 40, height: 40, bgcolor: '#7C3AED', fontSize: '0.9rem' }}>
                                                {getInitials(user)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>
                                                    {getDisplayName(user)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                    {user.user?.email || user.email || 'No email'}
                                                    {user.staff_no && ` • ${user.staff_no}`}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Typography variant="body2" sx={{ color: '#D1D5DB' }}>
                                            {user.department || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Chip
                                            icon={<AdminPanelSettings sx={{ fontSize: 14 }} />}
                                            label={user.job_title || 'Staff'}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(17, 82, 212, 0.15)',
                                                color: '#3B82F6',
                                                fontSize: '0.75rem',
                                                '& .MuiChip-icon': {
                                                    color: '#3B82F6',
                                                },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Chip
                                            icon={isActive ? <CheckCircle sx={{ fontSize: 14 }} /> : <Block sx={{ fontSize: 14 }} />}
                                            label={user.status || 'Unknown'}
                                            size="small"
                                            sx={{
                                                bgcolor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                color: isActive ? '#10B981' : '#EF4444',
                                                fontSize: '0.75rem',
                                                '& .MuiChip-icon': {
                                                    color: isActive ? '#10B981' : '#EF4444',
                                                },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Edit Staff">
                                                <IconButton
                                                    onClick={() => handleOpenStaffModal(user)}
                                                    disabled={isActionLoading}
                                                    sx={{
                                                        color: '#3B82F6',
                                                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                                                        '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }
                                                    }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Staff">
                                                <IconButton
                                                    onClick={() => handleDeleteStaff(user)}
                                                    disabled={isActionLoading}
                                                    sx={{
                                                        color: '#EF4444',
                                                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                                                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                                                    }}
                                                >
                                                    {isActionLoading ? (
                                                        <CircularProgress size={18} sx={{ color: 'inherit' }} />
                                                    ) : (
                                                        <Delete fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Staff Modal */}
            <Modal open={openStaffModal} onClose={handleCloseStaffModal}>
                <Box sx={{ ...modalStyle, maxHeight: '90vh', overflowY: 'auto' }}>
                    {/* Modal Header */}
                    <Box sx={{
                        background: '${theme.colors.brand} 0%, ${theme.colors.brandHover} 100%)',
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <PersonAdd sx={{ color: '#fff', fontSize: 28 }} />
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                {currentStaff ? 'Edit Staff Member' : 'Create Staff Member'}
                            </Typography>
                        </Stack>
                        <IconButton onClick={handleCloseStaffModal} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Modal Body */}
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={2.5}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                        First Name *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="e.g. John"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        sx={textFieldStyle}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                        Last Name *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="e.g. Doe"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        sx={textFieldStyle}
                                    />
                                </Grid>
                            </Grid>

                            <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                    Email Address *
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="name@organization.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!!currentStaff} // Can't change email after creation
                                    sx={textFieldStyle}
                                />
                            </Box>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                        Phone
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="08012345678"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        sx={textFieldStyle}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                        Gender
                                    </Typography>
                                    <Select
                                        fullWidth
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        displayEmpty
                                        sx={selectStyle}
                                    >
                                        <MenuItem value="">Select Gender</MenuItem>
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                    </Select>
                                </Grid>
                            </Grid>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                        Department
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="e.g. Academics"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        sx={textFieldStyle}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                        Job Title
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="e.g. Content Manager"
                                        value={formData.job_title}
                                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                        sx={textFieldStyle}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                        Staff Number
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="e.g. STF-1001"
                                        value={formData.staff_no}
                                        onChange={(e) => setFormData({ ...formData, staff_no: e.target.value })}
                                        sx={textFieldStyle}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                        Status
                                    </Typography>
                                    <Select
                                        fullWidth
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        sx={selectStyle}
                                    >
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Inactive">Inactive</MenuItem>
                                    </Select>
                                </Grid>
                            </Grid>

                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleSaveStaff}
                                disabled={!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim() || saving}
                                sx={{
                                    bgcolor: theme.colors.brand,
                                    py: 1.5,
                                    borderRadius: 1.5,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    boxShadow: '0 4px 14px rgba(17, 82, 212, 0.4)',
                                    '&:hover': { bgcolor: '#0D42AF' },
                                    '&:disabled': { bgcolor: '#1F2937', color: '#6B7280', boxShadow: 'none' }
                                }}
                            >
                                {saving ? (
                                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                                ) : currentStaff ? 'Update Staff' : 'Create Staff'}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>

            {/* Role Management Modal */}
            <Modal open={openRoleModal} onClose={handleCloseRoleModal}>
                <Box sx={{
                    ...modalStyle,
                    width: 600,
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Modal Header */}
                    <Box sx={{
                        background: '${theme.colors.brand} 0%, ${theme.colors.brandHover} 100%)',
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0
                    }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <AdminPanelSettings sx={{ color: '#fff', fontSize: 28 }} />
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                Roles & Permissions
                            </Typography>
                        </Stack>
                        <IconButton onClick={handleCloseRoleModal} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Modal Body - Scrollable */}
                    <Box sx={{
                        p: 3,
                        overflowY: 'auto',
                        flex: 1,
                        '&::-webkit-scrollbar': { width: '8px' },
                        '&::-webkit-scrollbar-track': { background: '#0C1322', borderRadius: '4px' },
                        '&::-webkit-scrollbar-thumb': { background: '#374151', borderRadius: '4px', '&:hover': { background: '#4B5563' } }
                    }}>
                        {/* Add New Role Section */}
                        <Box sx={{ mb: 4, p: 3, bgcolor: '#0C1322', borderRadius: '12px', border: '1px solid #374151' }}>
                            <Typography variant="subtitle1" sx={{ color: '#fff', mb: 2.5, fontWeight: 600 }}>Define New Role</Typography>
                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                        Role Name
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="e.g. Super Admin"
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        sx={textFieldStyle}
                                    />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                        Description
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Brief description of the role's responsibilities"
                                        value={newRoleDescription}
                                        onChange={(e) => setNewRoleDescription(e.target.value)}
                                        sx={textFieldStyle}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 1.5, fontWeight: 500 }}>
                                        Select Privileges
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {PRIVILEGES.map((privilege) => (
                                            <Grid size={{ xs: 6 }} key={privilege}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={newRolePrivileges.includes(privilege)}
                                                            onChange={() => handlePrivilegeToggle(privilege)}
                                                            size="small"
                                                            sx={{ color: '#6B7280', '&.Mui-checked': { color: theme.colors.brand } }}
                                                        />
                                                    }
                                                    label={<Typography variant="body2" sx={{ color: '#D1D5DB' }}>{privilege}</Typography>}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>

                                <Button
                                    variant="contained"
                                    onClick={handleAddRole}
                                    disabled={!newRoleName}
                                    sx={{
                                        bgcolor: theme.colors.brand,
                                        py: 1.5,
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        boxShadow: '0 4px 14px rgba(17, 82, 212, 0.4)',
                                        '&:hover': { bgcolor: '#0D42AF' },
                                        '&:disabled': { bgcolor: '#1F2937', color: '#6B7280', boxShadow: 'none' }
                                    }}
                                >
                                    Save Role
                                </Button>
                            </Stack>
                        </Box>

                        {/* Existing Roles List */}
                        <Typography variant="subtitle1" sx={{ color: '#9CA3AF', mb: 2, fontWeight: 600 }}>Existing Roles</Typography>
                        <Stack spacing={1.5}>
                            {roles.map((role) => (
                                <Paper key={role.id} sx={{
                                    p: 2,
                                    bgcolor: '#0C1322',
                                    border: '1px solid #374151',
                                    borderRadius: '12px',
                                    transition: 'border-color 0.2s',
                                    '&:hover': { borderColor: '#4B5563' }
                                }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box sx={{ width: '100%' }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600 }}>{role.name}</Typography>
                                                <IconButton size="small" onClick={() => handleDeleteRole(role.id)} sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1.5 }}>{role.description}</Typography>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>Privileges:</Typography>
                                                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                                    {role.privileges?.length > 0 ? role.privileges.map(perm => (
                                                        <Chip key={perm} label={perm} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#1F2937', color: '#D1D5DB', borderRadius: '6px' }} />
                                                    )) : <Typography variant="caption" sx={{ color: '#6B7280' }}>No specific privileges</Typography>}
                                                </Stack>
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                </Box>
            </Modal>

            {/* Credentials Dialog - Shows after creating a new staff */}
            <Modal open={!!credentials} onClose={() => setCredentials(null)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: '#1A2230',
                    borderRadius: 2,
                    border: '1px solid #374151',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                            Staff Created Successfully!
                        </Typography>
                        <IconButton onClick={() => setCredentials(null)} sx={{ color: '#9CA3AF' }}>
                            <Close />
                        </IconButton>
                    </Stack>

                    <Alert severity="success" sx={{ mb: 3 }}>
                        Please save these credentials securely. The password cannot be retrieved later.
                    </Alert>

                    <Box sx={{ bgcolor: '#0C1322', p: 2, borderRadius: 1, mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 0.5 }}>Email:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>{credentials?.email}</Typography>

                        <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 0.5 }}>Password:</Typography>
                        <Typography sx={{ color: '#10B981', fontWeight: 600, fontFamily: 'monospace' }}>{credentials?.password}</Typography>
                    </Box>

                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ContentCopy />}
                        onClick={handleCopyCredentials}
                        sx={{
                            bgcolor: theme.colors.brand,
                            '&:hover': { bgcolor: '#0D42AF' },
                        }}
                    >
                        Copy Credentials
                    </Button>
                </Box>
            </Modal>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StaffManagement;

import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { textFieldStyle, selectStyle, modalStyle, selectMenuProps } from '../../../styles/formStyles';

const MENU_ITEMS = [
    'Dashboard',
    'User Management',
    'Course Management',
    'Analytics',
    'Verifications',
    'Settings',
];

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
    const [staff, setStaff] = useState([
        { id: 1, name: 'Alice Brown', email: 'alice@example.com', role: 'Admin', status: 'Active', lastLogin: '2025-01-14 10:30 AM' },
        { id: 2, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Support', status: 'Active', lastLogin: '2025-01-15 08:15 AM' },
    ]);

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

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');

    // Filter staff logic
    const filteredStaff = staff.filter(user => {
        return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getStatusColor = (status) => {
        return status === 'Active' ? '#10B981' : '#EF4444';
    };

    const handleOpenStaffModal = (user = null) => {
        setCurrentStaff(user);
        setOpenStaffModal(true);
    };

    const handleCloseStaffModal = () => {
        setOpenStaffModal(false);
        setCurrentStaff(null);
    };

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
        // Prevent deleting if assigned (mock check)
        setRoles(roles.filter(role => role.id !== id));
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
                            bgcolor: '#1152D4',
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
                        placeholder="Search staff..."
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
            </Paper>

            {/* Staff Table */}
            <TableContainer component={Paper} sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Staff Member</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Role</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Last Login</TableCell>
                            <TableCell align="right" sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStaff.map((user) => (
                            <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ color: '#fff', borderBottom: '1px solid #374151' }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#7C3AED', fontSize: '0.9rem' }}>
                                            {user.name.split(' ').map(n => n[0]).join('')}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>
                                                {user.name}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                    <Chip
                                        icon={<AdminPanelSettings sx={{ fontSize: 14 }} />}
                                        label={user.role}
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
                                        icon={user.status === 'Active' ? <CheckCircle sx={{ fontSize: 14 }} /> : <Block sx={{ fontSize: 14 }} />}
                                        label={user.status}
                                        size="small"
                                        sx={{
                                            bgcolor: user.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                            color: user.status === 'Active' ? '#10B981' : '#EF4444',
                                            fontSize: '0.75rem',
                                            '& .MuiChip-icon': {
                                                color: user.status === 'Active' ? '#10B981' : '#EF4444',
                                            },
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151' }}>
                                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                                        {user.lastLogin}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ borderBottom: '1px solid #374151' }}>
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Tooltip title="Edit Staff">
                                            <IconButton
                                                onClick={() => handleOpenStaffModal(user)}
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
                                                sx={{
                                                    color: '#EF4444',
                                                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                                                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Staff Modal - Premium Design */}
            <Modal
                open={openStaffModal}
                onClose={handleCloseStaffModal}
                aria-labelledby="staff-modal-title"
            >
                <Box sx={modalStyle}>
                    {/* Modal Header with Gradient */}
                    <Box sx={{
                        background: 'linear-gradient(135deg, #1152D4 0%, #0D42AF 100%)',
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
                            <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                    Full Name
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="e.g. John Doe"
                                    defaultValue={currentStaff?.name}
                                    sx={textFieldStyle}
                                />
                            </Box>

                            <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                    Email Address
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="name@organization.com"
                                    defaultValue={currentStaff?.email}
                                    sx={textFieldStyle}
                                />
                            </Box>

                            <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                    Role
                                </Typography>
                                <Select
                                    fullWidth
                                    defaultValue={currentStaff?.role || ''}
                                    displayEmpty
                                    sx={selectStyle}
                                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1E293B', color: '#fff', border: '1px solid #374151', borderRadius: 1.5, mt: 0.5 } } }}
                                >
                                    <MenuItem value="" disabled sx={{ display: 'none' }}>Select Role</MenuItem>
                                    {roles.map(role => (
                                        <MenuItem key={role.id} value={role.name} sx={{ '&:hover': { bgcolor: '#374151' } }}>{role.name}</MenuItem>
                                    ))}
                                </Select>
                            </Box>

                            <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                    Status
                                </Typography>
                                <Select
                                    fullWidth
                                    defaultValue={currentStaff?.status || 'Active'}
                                    sx={selectStyle}
                                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1E293B', color: '#fff', border: '1px solid #374151', borderRadius: 1.5, mt: 0.5 } } }}
                                >
                                    <MenuItem value="Active" sx={{ '&:hover': { bgcolor: '#374151' } }}>Active</MenuItem>
                                    <MenuItem value="Suspended" sx={{ '&:hover': { bgcolor: '#374151' } }}>Suspended</MenuItem>
                                </Select>
                            </Box>

                            {currentStaff && (
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        borderColor: '#F59E0B',
                                        color: '#F59E0B',
                                        borderRadius: 1.5,
                                        py: 1.5,
                                        '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.1)', borderColor: '#F59E0B' }
                                    }}
                                >
                                    Reset Password
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                fullWidth
                                sx={{
                                    bgcolor: '#1152D4',
                                    py: 1.5,
                                    borderRadius: 1.5,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    boxShadow: '0 4px 14px rgba(17, 82, 212, 0.4)',
                                    '&:hover': { bgcolor: '#0D42AF' }
                                }}
                            >
                                {currentStaff ? 'Update Staff' : 'Create Staff'}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>

            {/* Role Management Modal - Premium Design */}
            <Modal
                open={openRoleModal}
                onClose={handleCloseRoleModal}
                aria-labelledby="role-modal-title"
            >
                <Box sx={{
                    ...modalStyle,
                    width: 600,
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Modal Header with Gradient - Fixed */}
                    <Box sx={{
                        background: 'linear-gradient(135deg, #1152D4 0%, #0D42AF 100%)',
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
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: '#0C1322',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: '#374151',
                            borderRadius: '4px',
                            '&:hover': {
                                background: '#4B5563',
                            }
                        }
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
                                            <Grid item xs={6} key={privilege}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={newRolePrivileges.includes(privilege)}
                                                            onChange={() => handlePrivilegeToggle(privilege)}
                                                            size="small"
                                                            sx={{ color: '#6B7280', '&.Mui-checked': { color: '#1152D4' } }}
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
                                        bgcolor: '#1152D4',
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
        </Box>
    );
};

export default StaffManagement;


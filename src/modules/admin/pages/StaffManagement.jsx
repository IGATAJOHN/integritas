import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Autocomplete,
    Avatar,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    InputAdornment,
    InputBase,
    MenuItem,
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
import {
    BadgeOutlined,
    Block,
    CheckCircle,
    CloudUploadOutlined,
    EditOutlined,
    GroupOutlined,
    LockResetOutlined,
    ManageAccountsOutlined,
    PersonAddAlt1,
    Refresh,
    RestartAltOutlined,
    Search,
    SecurityOutlined,
    TuneOutlined,
    VisibilityOffOutlined,
    VisibilityOutlined,
} from '@mui/icons-material';
import { staffService } from '../services';
import {
    paperStyle,
    primaryButtonStyle,
    selectMenuProps,
    selectStyle,
    textFieldStyle,
} from '../../../styles/formStyles';
import theme from '../../../styles/theme';

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'support', label: 'Support' },
];

const SUSPENDED_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'false', label: 'Active' },
    { value: 'true', label: 'Suspended' },
];

const PERMISSION_SUGGESTIONS = ['admins.manage', 'users.view', 'users.manage'];

const emptyCreateForm = {
    name: '',
    email: '',
    phone: '',
    bio: '',
    password: '',
    role: 'admin',
    send_welcome_email: false,
};

const emptyEditForm = {
    name: '',
    email: '',
    phone: '',
    bio: '',
};

const emptyPasswordForm = {
    password: '',
    revoke_existing_sessions: true,
};

const dialogPaperSx = {
    bgcolor: '#0F1729',
    color: '#FFFFFF',
    border: '1px solid #1F2937',
    borderRadius: 2,
    boxShadow: '0 28px 70px rgba(0,0,0,0.55)',
    overflow: 'hidden',
};

const moduleScrollbarSx = {
    scrollbarWidth: 'thin',
    scrollbarColor: '#374151 #0C1322',
    '&::-webkit-scrollbar': {
        width: 8,
        height: 8,
    },
    '&::-webkit-scrollbar-track': {
        bgcolor: '#0C1322',
        borderRadius: 8,
    },
    '&::-webkit-scrollbar-thumb': {
        bgcolor: '#374151',
        borderRadius: 8,
        border: '2px solid #0C1322',
        '&:hover': {
            bgcolor: '#4B5563',
        },
    },
};

const labelSx = {
    color: '#9CA3AF',
    fontSize: '0.75rem',
    fontWeight: 600,
    mb: 0.75,
};

const menuItemSx = {
    color: '#FFFFFF',
    fontSize: '0.875rem',
    '&:hover': { bgcolor: '#374151' },
    '&.Mui-selected': { bgcolor: 'rgba(17,82,212,0.18)' },
    '&.Mui-selected:hover': { bgcolor: 'rgba(17,82,212,0.26)' },
};

const tableHeadSx = {
    color: '#9CA3AF',
    borderBottom: '1px solid #374151',
    fontWeight: 600,
};

const tableBodySx = {
    borderBottom: '1px solid #374151',
};

const getErrorMessage = (err, fallback = 'Something went wrong.') => {
    if (err?.data?.errors) {
        return Object.values(err.data.errors).flat().join(' ');
    }
    return err?.message || fallback;
};

const normalizeList = (value) => {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => {
            if (typeof item === 'string') return item;
            return item?.name || item?.key || item?.value || '';
        })
        .filter(Boolean);
};

const getStaffName = (staff) => staff?.name || staff?.user?.name || 'Unknown Staff';

const getStaffEmail = (staff) => staff?.email || staff?.user?.email || 'No email';

const getStaffId = (staff) => staff?.id || staff?.user_id || staff?.user?.id;

const getInitials = (name = '') =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ST';

const getRoles = (staff) => normalizeList(staff?.roles || staff?.user?.roles);

const getDirectPermissions = (staff) =>
    normalizeList(staff?.direct_permissions || staff?.permissions || staff?.user?.direct_permissions);

const isStaffSuspended = (staff) =>
    Boolean(staff?.suspended_at || staff?.is_suspended || staff?.suspended || staff?.account_state === 'suspended');

const formatState = (value) => {
    if (!value) return 'Unknown';
    return String(value)
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const passwordIsValid = (password) =>
    password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [suspendedFilter, setSuspendedFilter] = useState('');

    const [createOpen, setCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState(emptyCreateForm);

    const [selectedStaff, setSelectedStaff] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState(emptyEditForm);

    const [rolesOpen, setRolesOpen] = useState(false);
    const [roleValues, setRoleValues] = useState([]);

    const [permissionsOpen, setPermissionsOpen] = useState(false);
    const [permissionValues, setPermissionValues] = useState([]);

    const [passwordOpen, setPasswordOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);

    const [avatarOpen, setAvatarOpen] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const fetchStaff = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const res = await staffService.listStaff({
                role: roleFilter || undefined,
                q: search || undefined,
                suspended: suspendedFilter || undefined,
                per_page: 25,
            });
            setStaff(res.data || []);
        } catch (err) {
            const message = getErrorMessage(err, 'Failed to load staff.');
            setError(message);
            setStaff([]);
        } finally {
            setLoading(false);
        }
    }, [roleFilter, search, suspendedFilter]);

    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const stats = useMemo(() => {
        const suspended = staff.filter(isStaffSuspended).length;
        const superAdmins = staff.filter((item) => getRoles(item).includes('super_admin')).length;
        return {
            total: staff.length,
            suspended,
            active: Math.max(staff.length - suspended, 0),
            superAdmins,
        };
    }, [staff]);

    const resetCreate = () => setCreateForm(emptyCreateForm);

    const closeCreate = () => {
        setCreateOpen(false);
        resetCreate();
    };

    const openEdit = (item) => {
        setSelectedStaff(item);
        setEditForm({
            name: getStaffName(item) === 'Unknown Staff' ? '' : getStaffName(item),
            email: getStaffEmail(item) === 'No email' ? '' : getStaffEmail(item),
            phone: item?.phone || item?.user?.phone || '',
            bio: item?.bio || item?.user?.bio || '',
        });
        setEditOpen(true);
    };

    const closeEdit = () => {
        setEditOpen(false);
        setSelectedStaff(null);
        setEditForm(emptyEditForm);
    };

    const openRoles = (item) => {
        setSelectedStaff(item);
        setRoleValues(getRoles(item));
        setRolesOpen(true);
    };

    const closeRoles = () => {
        setRolesOpen(false);
        setSelectedStaff(null);
        setRoleValues([]);
    };

    const openPermissions = (item) => {
        setSelectedStaff(item);
        setPermissionValues(getDirectPermissions(item));
        setPermissionsOpen(true);
    };

    const closePermissions = () => {
        setPermissionsOpen(false);
        setSelectedStaff(null);
        setPermissionValues([]);
    };

    const openPassword = (item) => {
        setSelectedStaff(item);
        setPasswordForm(emptyPasswordForm);
        setPasswordOpen(true);
    };

    const closePassword = () => {
        setPasswordOpen(false);
        setSelectedStaff(null);
        setPasswordForm(emptyPasswordForm);
    };

    const openAvatar = (item) => {
        setSelectedStaff(item);
        setAvatarFile(null);
        setAvatarOpen(true);
    };

    const closeAvatar = () => {
        setAvatarOpen(false);
        setSelectedStaff(null);
        setAvatarFile(null);
    };

    const validateStaffPayload = ({ name, email, password }, requirePassword = true) => {
        if (name.trim().length < 2) return 'Enter the staff member name.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address.';
        if (requirePassword && !passwordIsValid(password)) {
            return 'Password must be at least 8 characters and include upper-case, lower-case, and a number.';
        }
        return '';
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        const validation = validateStaffPayload(createForm, true);
        if (validation) {
            showMessage(validation, 'error');
            return;
        }

        try {
            setBusy(true);
            const payload = {
                name: createForm.name.trim(),
                email: createForm.email.trim(),
                phone: createForm.phone.trim() || null,
                bio: createForm.bio.trim() || null,
                password: createForm.password,
                role: createForm.role,
                send_welcome_email: Boolean(createForm.send_welcome_email),
            };
            await staffService.createStaff(payload);
            closeCreate();
            showMessage('Staff member created.');
            await fetchStaff();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to create staff member.'), 'error');
        } finally {
            setBusy(false);
        }
    };

    const handleEdit = async (event) => {
        event.preventDefault();
        const validation = validateStaffPayload({ ...editForm, password: 'ValidPass1' }, false);
        if (validation) {
            showMessage(validation, 'error');
            return;
        }

        try {
            setBusy(true);
            await staffService.updateStaff(getStaffId(selectedStaff), {
                name: editForm.name.trim(),
                email: editForm.email.trim(),
                phone: editForm.phone.trim() || null,
                bio: editForm.bio.trim() || null,
            });
            closeEdit();
            showMessage('Staff profile updated.');
            await fetchStaff();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to update staff member.'), 'error');
        } finally {
            setBusy(false);
        }
    };

    const handleRoles = async (event) => {
        event.preventDefault();
        if (roleValues.length === 0) {
            showMessage('Select at least one role.', 'error');
            return;
        }

        try {
            setBusy(true);
            await staffService.replaceRoles(getStaffId(selectedStaff), roleValues);
            closeRoles();
            showMessage('Staff roles updated.');
            await fetchStaff();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to update roles.'), 'error');
        } finally {
            setBusy(false);
        }
    };

    const handlePermissions = async (event) => {
        event.preventDefault();
        try {
            setBusy(true);
            await staffService.replacePermissions(getStaffId(selectedStaff), permissionValues);
            closePermissions();
            showMessage('Direct permissions updated.');
            await fetchStaff();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to update permissions.'), 'error');
        } finally {
            setBusy(false);
        }
    };

    const handlePassword = async (event) => {
        event.preventDefault();
        if (!passwordIsValid(passwordForm.password)) {
            showMessage('Password must be at least 8 characters and include upper-case, lower-case, and a number.', 'error');
            return;
        }

        try {
            setBusy(true);
            await staffService.resetPassword(getStaffId(selectedStaff), {
                password: passwordForm.password,
                revoke_existing_sessions: Boolean(passwordForm.revoke_existing_sessions),
            });
            closePassword();
            showMessage('Staff password reset.');
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to reset password.'), 'error');
        } finally {
            setBusy(false);
        }
    };

    const handleAvatar = async (event) => {
        event.preventDefault();
        if (!avatarFile) {
            showMessage('Choose a PNG or JPG avatar.', 'error');
            return;
        }
        if (!['image/png', 'image/jpeg'].includes(avatarFile.type)) {
            showMessage('Avatar must be a PNG or JPG image.', 'error');
            return;
        }
        if (avatarFile.size > 4 * 1024 * 1024) {
            showMessage('Avatar must be 4 MB or smaller.', 'error');
            return;
        }

        try {
            setBusy(true);
            await staffService.uploadAvatar(getStaffId(selectedStaff), avatarFile);
            closeAvatar();
            showMessage('Staff avatar updated.');
            await fetchStaff();
        } catch (err) {
            showMessage(getErrorMessage(err, 'Failed to upload avatar.'), 'error');
        } finally {
            setBusy(false);
        }
    };

    const handleSuspendToggle = async (item) => {
        const suspended = isStaffSuspended(item);
        const action = suspended ? 'unsuspend' : 'suspend';
        if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${getStaffName(item)}?`)) return;

        try {
            setBusy(true);
            if (suspended) {
                await staffService.unsuspendStaff(getStaffId(item));
            } else {
                await staffService.suspendStaff(getStaffId(item));
            }
            showMessage(`Staff member ${suspended ? 'unsuspended' : 'suspended'}.`);
            await fetchStaff();
        } catch (err) {
            showMessage(getErrorMessage(err, `Failed to ${action} staff member.`), 'error');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%', ...moduleScrollbarSx }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <GroupOutlined sx={{ color: theme.colors.brand, fontSize: 30 }} />
                    <Box>
                        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                            Staff Management
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                            Create staff accounts, manage access, and keep admin roles in sync.
                        </Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={1.5}>
                    <Tooltip title="Refresh">
                        <span>
                            <IconButton onClick={fetchStaff} disabled={loading} sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
                                <Refresh />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<PersonAddAlt1 />}
                        onClick={() => setCreateOpen(true)}
                        sx={{ ...primaryButtonStyle, boxShadow: 'none', '&:hover': { bgcolor: theme.colors.brandHover, boxShadow: 'none' }, textTransform: 'none' }}
                    >
                        Create Staff
                    </Button>
                </Stack>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                <StatCard label="Total Staff" value={stats.total} icon={<GroupOutlined />} />
                <StatCard label="Active" value={stats.active} icon={<CheckCircle />} />
                <StatCard label="Suspended" value={stats.suspended} icon={<Block />} />
                <StatCard label="Super Admins" value={stats.superAdmins} icon={<SecurityOutlined />} />
            </Box>

            <Paper sx={{ ...paperStyle, p: 2, mb: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                    <Box sx={{
                        bgcolor: '#1F2937',
                        borderRadius: 1,
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        height: 42,
                        flex: 1,
                        minWidth: { md: 280 },
                        border: '1px solid #374151',
                    }}>
                        <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
                        <InputBase
                            placeholder="Search by name or email..."
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            sx={{ color: '#FFFFFF', fontSize: '0.875rem', width: '100%', '& input::placeholder': { color: '#6B7280', opacity: 1 } }}
                        />
                    </Box>

                    <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
                        <Select
                            value={roleFilter}
                            onChange={(event) => setRoleFilter(event.target.value)}
                            displayEmpty
                            sx={{ ...selectStyle, height: 42, fontSize: '0.875rem' }}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="" sx={menuItemSx}>All Roles</MenuItem>
                            {ROLE_OPTIONS.map((role) => (
                                <MenuItem key={role.value} value={role.value} sx={menuItemSx}>
                                    {role.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
                        <Select
                            value={suspendedFilter}
                            onChange={(event) => setSuspendedFilter(event.target.value)}
                            displayEmpty
                            sx={{ ...selectStyle, height: 42, fontSize: '0.875rem' }}
                            MenuProps={selectMenuProps}
                        >
                            {SUSPENDED_OPTIONS.map((option) => (
                                <MenuItem key={option.label} value={option.value} sx={menuItemSx}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            <TableContainer component={Paper} sx={paperStyle}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={tableHeadSx}>Staff</TableCell>
                            <TableCell sx={tableHeadSx}>Role(s)</TableCell>
                            <TableCell sx={tableHeadSx}>Direct Permissions</TableCell>
                            <TableCell sx={tableHeadSx}>Account State</TableCell>
                            <TableCell sx={tableHeadSx}>MFA</TableCell>
                            <TableCell sx={tableHeadSx}>Status</TableCell>
                            <TableCell align="right" sx={tableHeadSx}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ ...tableBodySx, py: 6 }}>
                                    <CircularProgress size={36} sx={{ color: theme.colors.brand }} />
                                    <Typography sx={{ color: '#9CA3AF', mt: 2 }}>Loading staff...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ ...tableBodySx, py: 4 }}>
                                    <Alert severity="error" sx={{ bgcolor: 'transparent', justifyContent: 'center' }}>{error}</Alert>
                                    <Button onClick={fetchStaff} sx={{ mt: 2, color: theme.colors.brand, textTransform: 'none' }}>Try Again</Button>
                                </TableCell>
                            </TableRow>
                        ) : staff.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ ...tableBodySx, py: 6 }}>
                                    <GroupOutlined sx={{ fontSize: 48, color: '#374151', mb: 1 }} />
                                    <Typography sx={{ color: '#9CA3AF' }}>
                                        {search || roleFilter || suspendedFilter ? 'No staff match your filters.' : 'No staff members found.'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : staff.map((item) => (
                            <StaffRow
                                key={getStaffId(item)}
                                staff={item}
                                busy={busy}
                                onEdit={openEdit}
                                onRoles={openRoles}
                                onPermissions={openPermissions}
                                onPassword={openPassword}
                                onAvatar={openAvatar}
                                onSuspendToggle={handleSuspendToggle}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <StaffCreateDialog
                open={createOpen}
                busy={busy}
                form={createForm}
                setForm={setCreateForm}
                onClose={closeCreate}
                onSubmit={handleCreate}
            />
            <StaffEditDialog
                open={editOpen}
                busy={busy}
                form={editForm}
                setForm={setEditForm}
                onClose={closeEdit}
                onSubmit={handleEdit}
            />
            <RolesDialog
                open={rolesOpen}
                busy={busy}
                values={roleValues}
                setValues={setRoleValues}
                onClose={closeRoles}
                onSubmit={handleRoles}
            />
            <PermissionsDialog
                open={permissionsOpen}
                busy={busy}
                values={permissionValues}
                setValues={setPermissionValues}
                onClose={closePermissions}
                onSubmit={handlePermissions}
            />
            <PasswordDialog
                open={passwordOpen}
                busy={busy}
                form={passwordForm}
                setForm={setPasswordForm}
                onClose={closePassword}
                onSubmit={handlePassword}
            />
            <AvatarDialog
                open={avatarOpen}
                busy={busy}
                file={avatarFile}
                setFile={setAvatarFile}
                onClose={closeAvatar}
                onSubmit={handleAvatar}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4500}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

const StatCard = ({ label, value, icon }) => (
    <Paper sx={{ ...paperStyle, p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: 'rgba(17,82,212,0.16)', color: theme.colors.brand, width: 38, height: 38 }}>
                {React.cloneElement(icon, { fontSize: 'small' })}
            </Avatar>
            <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>
                    {label}
                </Typography>
                <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 700, lineHeight: 1.1 }}>
                    {value}
                </Typography>
            </Box>
        </Stack>
    </Paper>
);

const StaffRow = ({ staff, busy, onEdit, onRoles, onPermissions, onPassword, onAvatar, onSuspendToggle }) => {
    const name = getStaffName(staff);
    const email = getStaffEmail(staff);
    const roles = getRoles(staff);
    const permissions = getDirectPermissions(staff);
    const suspended = isStaffSuspended(staff);
    const accountState = staff?.account_state || staff?.user?.account_state || (suspended ? 'suspended' : 'active');
    const mfaRequired = Boolean(staff?.mfa_required || staff?.user?.mfa_required);

    return (
        <TableRow sx={{ '&:last-child td': { border: 0 } }}>
            <TableCell sx={tableBodySx}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                        src={staff?.avatar_url || staff?.photo_url || staff?.user?.avatar_url}
                        sx={{ width: 40, height: 40, bgcolor: theme.colors.brand, fontSize: '0.85rem', fontWeight: 700 }}
                    >
                        {getInitials(name)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                            {name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            {email}
                        </Typography>
                    </Box>
                </Stack>
            </TableCell>
            <TableCell sx={tableBodySx}>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                    {roles.length ? roles.map((role) => <RoleChip key={role} role={role} />) : <MutedText>None</MutedText>}
                </Stack>
            </TableCell>
            <TableCell sx={tableBodySx}>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75, maxWidth: 260 }}>
                    {permissions.length ? permissions.slice(0, 3).map((permission) => (
                        <Chip key={permission} label={permission} size="small" sx={{ bgcolor: 'rgba(59,130,246,0.12)', color: '#93C5FD', fontSize: '0.72rem' }} />
                    )) : <MutedText>None</MutedText>}
                    {permissions.length > 3 && (
                        <Chip label={`+${permissions.length - 3}`} size="small" sx={{ bgcolor: '#1F2937', color: '#9CA3AF', fontSize: '0.72rem' }} />
                    )}
                </Stack>
            </TableCell>
            <TableCell sx={tableBodySx}>
                <Typography variant="body2" sx={{ color: '#D1D5DB' }}>
                    {formatState(accountState)}
                </Typography>
            </TableCell>
            <TableCell sx={tableBodySx}>
                <Chip
                    label={mfaRequired ? 'Required' : 'Optional'}
                    size="small"
                    sx={{
                        bgcolor: mfaRequired ? 'rgba(16,185,129,0.14)' : 'rgba(156,163,175,0.12)',
                        color: mfaRequired ? '#10B981' : '#9CA3AF',
                        fontSize: '0.72rem',
                    }}
                />
            </TableCell>
            <TableCell sx={tableBodySx}>
                <Chip
                    icon={suspended ? <Block sx={{ fontSize: 14 }} /> : <CheckCircle sx={{ fontSize: 14 }} />}
                    label={suspended ? 'Suspended' : 'Active'}
                    size="small"
                    sx={{
                        bgcolor: suspended ? 'rgba(239,68,68,0.14)' : 'rgba(16,185,129,0.14)',
                        color: suspended ? '#EF4444' : '#10B981',
                        fontSize: '0.72rem',
                        '& .MuiChip-icon': { color: 'inherit' },
                    }}
                />
            </TableCell>
            <TableCell align="right" sx={tableBodySx}>
                <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                    <ActionButton title="Edit profile" onClick={() => onEdit(staff)} icon={<EditOutlined fontSize="small" />} disabled={busy} />
                    <ActionButton title="Roles" onClick={() => onRoles(staff)} icon={<ManageAccountsOutlined fontSize="small" />} disabled={busy} />
                    <ActionButton title="Permissions" onClick={() => onPermissions(staff)} icon={<TuneOutlined fontSize="small" />} disabled={busy} />
                    <ActionButton title="Reset password" onClick={() => onPassword(staff)} icon={<LockResetOutlined fontSize="small" />} disabled={busy} />
                    <ActionButton title="Upload avatar" onClick={() => onAvatar(staff)} icon={<CloudUploadOutlined fontSize="small" />} disabled={busy} />
                    <ActionButton
                        title={suspended ? 'Unsuspend staff' : 'Suspend staff'}
                        onClick={() => onSuspendToggle(staff)}
                        icon={suspended ? <RestartAltOutlined fontSize="small" /> : <Block fontSize="small" />}
                        disabled={busy}
                        color={suspended ? '#10B981' : '#EF4444'}
                    />
                </Stack>
            </TableCell>
        </TableRow>
    );
};

const ActionButton = ({ title, onClick, icon, disabled, color = '#9CA3AF' }) => (
    <Tooltip title={title}>
        <span>
            <IconButton
                size="small"
                onClick={onClick}
                disabled={disabled}
                sx={{
                    color,
                    bgcolor: 'rgba(255,255,255,0.04)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
            >
                {icon}
            </IconButton>
        </span>
    </Tooltip>
);

const MutedText = ({ children }) => (
    <Typography variant="caption" sx={{ color: '#6B7280' }}>
        {children}
    </Typography>
);

const RoleChip = ({ role }) => {
    const isSuper = role === 'super_admin';
    const isSupport = role === 'support';
    return (
        <Chip
            label={formatState(role)}
            size="small"
            sx={{
                bgcolor: isSuper ? 'rgba(251,191,36,0.14)' : isSupport ? 'rgba(59,130,246,0.14)' : 'rgba(17,82,212,0.16)',
                color: isSuper ? '#FBBF24' : isSupport ? '#60A5FA' : theme.colors.brand,
                fontSize: '0.72rem',
                fontWeight: 600,
            }}
        />
    );
};

const FieldLabel = ({ children }) => <Typography sx={labelSx}>{children}</Typography>;

const DialogShell = ({ open, title, icon, children, actions, onClose, onSubmit }) => (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
            backdrop: {
                sx: {
                    bgcolor: 'rgba(8,13,25,0.78)',
                    backdropFilter: 'blur(3px)',
                },
            },
        }}
        PaperProps={{ component: 'form', onSubmit, sx: dialogPaperSx }}
    >
        <DialogTitle sx={{ bgcolor: '#111827', borderBottom: '1px solid #1F2937', px: 3, py: 2.25 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ bgcolor: theme.colors.brandLight, color: theme.colors.brand, width: 38, height: 38 }}>
                    {icon}
                </Avatar>
                <Typography sx={{ fontWeight: 700, color: '#F9FAFB' }}>{title}</Typography>
            </Stack>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#0F1729', pt: 3 }}>
            {children}
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#111827', px: 3, py: 2, borderTop: '1px solid #1F2937' }}>
            {actions}
        </DialogActions>
    </Dialog>
);

const CancelButton = ({ onClick, disabled }) => (
    <Button onClick={onClick} disabled={disabled} sx={{ color: '#9CA3AF', textTransform: 'none' }}>
        Cancel
    </Button>
);

const SaveButton = ({ children, busy }) => (
    <Button type="submit" variant="contained" disabled={busy} sx={{ ...primaryButtonStyle, textTransform: 'none' }}>
        {busy ? 'Saving...' : children}
    </Button>
);

const StaffCreateDialog = ({ open, busy, form, setForm, onClose, onSubmit }) => (
    <DialogShell
        open={open}
        title="Create Staff"
        icon={<PersonAddAlt1 fontSize="small" />}
        onClose={onClose}
        onSubmit={onSubmit}
        actions={<><CancelButton onClick={onClose} disabled={busy} /><SaveButton busy={busy}>Create Staff</SaveButton></>}
    >
        <Stack spacing={2}>
            <StaffProfileFields form={form} setForm={setForm} includePassword />
            <Box>
                <FieldLabel>Role</FieldLabel>
                <Select
                    fullWidth
                    value={form.role}
                    onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                    sx={selectStyle}
                    MenuProps={selectMenuProps}
                >
                    {ROLE_OPTIONS.map((role) => (
                        <MenuItem key={role.value} value={role.value} sx={menuItemSx}>
                            {role.label}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={form.send_welcome_email}
                        onChange={(event) => setForm((prev) => ({ ...prev, send_welcome_email: event.target.checked }))}
                        sx={{ color: '#9CA3AF', '&.Mui-checked': { color: theme.colors.brand } }}
                    />
                }
                label="Send welcome email"
                sx={{ color: '#D1D5DB' }}
            />
        </Stack>
    </DialogShell>
);

const StaffEditDialog = ({ open, busy, form, setForm, onClose, onSubmit }) => (
    <DialogShell
        open={open}
        title="Edit Staff Profile"
        icon={<EditOutlined fontSize="small" />}
        onClose={onClose}
        onSubmit={onSubmit}
        actions={<><CancelButton onClick={onClose} disabled={busy} /><SaveButton busy={busy}>Save Changes</SaveButton></>}
    >
        <Stack spacing={2}>
            <StaffProfileFields form={form} setForm={setForm} />
        </Stack>
    </DialogShell>
);

const StaffProfileFields = ({ form, setForm, includePassword = false }) => {
    const [showPassword, setShowPassword] = useState(false);
    const passwordValid = includePassword && passwordIsValid(form.password);
    const passwordTouched = includePassword && form.password.length > 0;

    const passwordHelperText = passwordValid
        ? 'Password meets the requirements.'
        : 'Min 8 characters with upper-case, lower-case, and a number.';

    const passwordFieldSx = {
        ...textFieldStyle,
        '& .MuiFormHelperText-root': {
            color: passwordValid ? '#10B981' : passwordTouched ? '#FBBF24' : '#9CA3AF',
            ml: 0,
            mt: 0.75,
            fontSize: '0.78rem',
        },
    };

    return (
        <>
            <Box>
                <FieldLabel>Name</FieldLabel>
                <TextField
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    fullWidth
                    required
                    placeholder="Ada Lovelace"
                    sx={textFieldStyle}
                />
            </Box>
            <Box>
                <FieldLabel>Email</FieldLabel>
                <TextField
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    fullWidth
                    required
                    placeholder="ada@integritas.ng"
                    sx={textFieldStyle}
                />
            </Box>
            <Box>
                <FieldLabel>Phone</FieldLabel>
                <TextField
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                    fullWidth
                    placeholder="+2348012345678"
                    sx={textFieldStyle}
                />
            </Box>
            <Box>
                <FieldLabel>Bio</FieldLabel>
                <TextField
                    value={form.bio}
                    onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="Operations lead."
                    sx={textFieldStyle}
                />
            </Box>
            {includePassword && (
                <Box>
                    <FieldLabel>Temporary Password</FieldLabel>
                    <TextField
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                        fullWidth
                        required
                        placeholder="TempPass1"
                        helperText={passwordHelperText}
                        sx={passwordFieldSx}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {passwordValid && (
                                        <CheckCircle sx={{ color: '#10B981', fontSize: 20, mr: 0.5 }} />
                                    )}
                                    <IconButton
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        edge="end"
                                        sx={{ color: '#9CA3AF', '&:hover': { color: '#FFFFFF' } }}
                                    >
                                        {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            )}
        </>
    );
};

const RolesDialog = ({ open, busy, values, setValues, onClose, onSubmit }) => (
    <DialogShell
        open={open}
        title="Manage Roles"
        icon={<ManageAccountsOutlined fontSize="small" />}
        onClose={onClose}
        onSubmit={onSubmit}
        actions={<><CancelButton onClick={onClose} disabled={busy} /><SaveButton busy={busy}>Update Roles</SaveButton></>}
    >
        <Stack spacing={2}>
            <Box>
                <FieldLabel>Roles</FieldLabel>
                <Select
                    multiple
                    fullWidth
                    value={values}
                    onChange={(event) => setValues(typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value)}
                    renderValue={(selected) => (
                        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                            {selected.map((role) => <RoleChip key={role} role={role} />)}
                        </Stack>
                    )}
                    sx={selectStyle}
                    MenuProps={selectMenuProps}
                >
                    {ROLE_OPTIONS.map((role) => (
                        <MenuItem key={role.value} value={role.value} sx={menuItemSx}>
                            <Checkbox checked={values.includes(role.value)} sx={{ color: '#9CA3AF', '&.Mui-checked': { color: theme.colors.brand } }} />
                            {role.label}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Roles are replaced wholesale. Select the final role list this staff member should have.
            </Typography>
        </Stack>
    </DialogShell>
);

const PermissionsDialog = ({ open, busy, values, setValues, onClose, onSubmit }) => (
    <DialogShell
        open={open}
        title="Direct Permissions"
        icon={<TuneOutlined fontSize="small" />}
        onClose={onClose}
        onSubmit={onSubmit}
        actions={<><CancelButton onClick={onClose} disabled={busy} /><SaveButton busy={busy}>Update Permissions</SaveButton></>}
    >
        <Stack spacing={2}>
            <Box>
                <FieldLabel>Permissions</FieldLabel>
                <Autocomplete
                    multiple
                    freeSolo
                    options={PERMISSION_SUGGESTIONS}
                    value={values}
                    onChange={(_event, nextValues) => setValues(nextValues.map((value) => String(value).trim()).filter(Boolean))}
                    renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => (
                            <Chip
                                {...getTagProps({ index })}
                                key={option}
                                label={option}
                                size="small"
                                sx={{ bgcolor: 'rgba(59,130,246,0.12)', color: '#93C5FD' }}
                            />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Type permission and press Enter"
                            sx={textFieldStyle}
                        />
                    )}
                />
            </Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Leave empty to clear all direct grants. Role-derived permissions are not edited here.
            </Typography>
        </Stack>
    </DialogShell>
);

const PasswordDialog = ({ open, busy, form, setForm, onClose, onSubmit }) => (
    <DialogShell
        open={open}
        title="Reset Password"
        icon={<LockResetOutlined fontSize="small" />}
        onClose={onClose}
        onSubmit={onSubmit}
        actions={<><CancelButton onClick={onClose} disabled={busy} /><SaveButton busy={busy}>Reset Password</SaveButton></>}
    >
        <Stack spacing={2}>
            <Box>
                <FieldLabel>New Password</FieldLabel>
                <TextField
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    fullWidth
                    required
                    placeholder="NewPass2"
                    helperText="Min 8 characters with upper-case, lower-case, and a number."
                    sx={textFieldStyle}
                />
            </Box>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={form.revoke_existing_sessions}
                        onChange={(event) => setForm((prev) => ({ ...prev, revoke_existing_sessions: event.target.checked }))}
                        sx={{ color: '#9CA3AF', '&.Mui-checked': { color: theme.colors.brand } }}
                    />
                }
                label="Revoke existing sessions"
                sx={{ color: '#D1D5DB' }}
            />
        </Stack>
    </DialogShell>
);

const AvatarDialog = ({ open, busy, file, setFile, onClose, onSubmit }) => (
    <DialogShell
        open={open}
        title="Upload Avatar"
        icon={<BadgeOutlined fontSize="small" />}
        onClose={onClose}
        onSubmit={onSubmit}
        actions={<><CancelButton onClick={onClose} disabled={busy} /><SaveButton busy={busy}>Upload Avatar</SaveButton></>}
    >
        <Stack spacing={2}>
            <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadOutlined />}
                sx={{
                    color: '#FFFFFF',
                    borderColor: '#374151',
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    py: 1.25,
                    '&:hover': { borderColor: theme.colors.brand, bgcolor: 'rgba(17,82,212,0.08)' },
                }}
            >
                Choose PNG or JPG
                <input
                    hidden
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
            </Button>
            <Typography variant="body2" sx={{ color: file ? '#FFFFFF' : '#9CA3AF' }}>
                {file ? file.name : 'No file selected. Max size: 4 MB.'}
            </Typography>
        </Stack>
    </DialogShell>
);

export default StaffManagement;

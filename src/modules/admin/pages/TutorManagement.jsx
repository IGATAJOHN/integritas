import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    FormControl,
    IconButton,
    InputBase,
    InputLabel,
    MenuItem,
    Modal,
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
    Add,
    Article,
    Close,
    Delete,
    Edit,
    Refresh,
    Search,
    UploadFile,
    Visibility,
} from '@mui/icons-material';
import { optionAdminService } from '../services/optionAdminService';
import {
    modalStyle,
    paperStyle,
    primaryButtonStyle,
    searchBarStyle,
    searchInputStyle,
    selectMenuProps,
    selectStyle,
    tableBodyCellStyle,
    tableHeaderCellStyle,
    textFieldStyle,
} from '../../../styles/formStyles';
import theme from '../../../styles/theme';


const KYC_DOC_TYPES = ['id_front', 'id_back', 'certificate', 'utility_bill', 'passport'];
const ID_TYPE_OPTIONS = ['nin', 'passport', 'driver_license', 'national_id', 'voter_card', 'bvn'];
const EDUCATION_OPTIONS = ['secondary_school', 'diploma', 'bachelor', 'master', 'phd', 'other'];

const initialTutorForm = {
    name: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    address: '',
    bio: '',
    skills: '',
    highest_education: '',
    id_type: '',
    id_number: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    review_note: '',
    initial_doc_type: 'certificate',
    initial_doc_file: null,
};

const parseCommaList = (value) =>
    String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const stringifyList = (value) => {
    if (!Array.isArray(value)) return '';
    return value.filter(Boolean).join(', ');
};

const getDropdownOptions = (baseOptions = [], currentValue = '') => {
    const current = String(currentValue || '').trim();
    if (!current) return baseOptions;
    return baseOptions.includes(current) ? baseOptions : [...baseOptions, current];
};

const formatOptionLabel = (value) =>
    String(value || '')
        .split('_')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

const getTutorName = (tutor) => {
    if (!tutor) return 'Unknown Tutor';
    const directName = String(tutor.name || '').trim();
    if (directName) return directName;

    const firstName = String(tutor.first_name || tutor.firstName || '').trim();
    const lastName = String(tutor.last_name || tutor.lastName || '').trim();
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;

    const userName = String(tutor.user?.name || '').trim();
    if (userName) return userName;

    return String(tutor.email || tutor.user?.email || 'Unknown Tutor');
};

const getKycData = (tutor) => tutor?.kyc?.data || tutor?.kyc_data || {};

const getTutorDocuments = (tutor) => {
    if (Array.isArray(tutor?.kycDocuments)) return tutor.kycDocuments;
    if (Array.isArray(tutor?.kyc_documents)) return tutor.kyc_documents;
    if (Array.isArray(tutor?.kyc?.documents)) return tutor.kyc.documents;
    return [];
};

const getKycStatus = (tutor) =>
    String(tutor?.kyc?.status || tutor?.kyc_status || tutor?.status || 'unknown').toLowerCase();

const TutorManagement = () => {
    const [tutors, setTutors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');

    const [openFormModal, setOpenFormModal] = useState(false);
    const [editingTutor, setEditingTutor] = useState(null);
    const [formData, setFormData] = useState(initialTutorForm);

    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedTutor, setSelectedTutor] = useState(null);

    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [uploadTutorId, setUploadTutorId] = useState('');
    const [uploadType, setUploadType] = useState('certificate');
    const [uploadFile, setUploadFile] = useState(null);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const listTutors = useCallback(async (query = '') => {
        setLoading(true);
        setError('');

        try {
            const response = await optionAdminService.listTutors({
                q: query,
                per_page: 50,
            });
            setTutors(response.data || []);
        } catch (err) {
            console.error('Failed to fetch admin tutors:', err);
            setError(err.message || 'Failed to load tutors.');
            setTutors([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            listTutors(searchTerm);
        }, 350);

        return () => clearTimeout(timer);
    }, [searchTerm, listTutors]);

    const openSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const mappedTutors = useMemo(() => {
        return tutors.map((tutor) => {
            const docs = getTutorDocuments(tutor);
            const kycStatus = getKycStatus(tutor);
            const kycData = getKycData(tutor);

            return {
                ...tutor,
                _name: getTutorName(tutor),
                _email: tutor.email || tutor.user?.email || '-',
                _phone: tutor.phone || kycData.phone || '-',
                _kycStatus: kycStatus,
                _docsCount: docs.length,
            };
        });
    }, [tutors]);

    const loadTutorDetail = useCallback(async (tutorId, { openModal = false } = {}) => {
        setDetailLoading(true);
        try {
            const detail = await optionAdminService.getTutorById(tutorId);
            setSelectedTutor(detail);
            if (openModal) {
                setOpenDetailModal(true);
            }
            return detail;
        } catch (err) {
            console.error('Failed to load tutor detail:', err);
            openSnackbar(err.message || 'Failed to load tutor detail.', 'error');
            return null;
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const toFormData = (tutor) => {
        const kycData = getKycData(tutor);

        return {
            ...initialTutorForm,
            name: getTutorName(tutor),
            email: String(tutor.email || tutor.user?.email || ''),
            phone: String(tutor.phone || kycData.phone || ''),
            country: String(kycData.country || ''),
            state: String(kycData.state || ''),
            city: String(kycData.city || ''),
            address: String(kycData.address || ''),
            bio: String(kycData.bio || ''),
            skills: stringifyList(kycData.skills || tutor.skills || []),
            highest_education: String(kycData.highest_education || ''),
            id_type: String(kycData.id_type || ''),
            id_number: String(kycData.id_number || ''),
            bank_name: String(kycData.bank_name || ''),
            account_number: String(kycData.account_number || ''),
            account_name: String(kycData.account_name || ''),
            review_note: String(kycData.review_note || ''),
            password: '',
            initial_doc_type: 'certificate',
            initial_doc_file: null,
        };
    };

    const handleOpenCreateModal = () => {
        setEditingTutor(null);
        setFormData(initialTutorForm);
        setOpenFormModal(true);
    };

    const handleOpenEditModal = async (tutorId) => {
        setActionLoading(tutorId);
        try {
            const detail = await optionAdminService.getTutorById(tutorId);
            if (!detail) return;
            setEditingTutor(detail);
            setFormData(toFormData(detail));
            setOpenFormModal(true);
        } catch (err) {
            console.error('Failed to open edit modal:', err);
            openSnackbar(err.message || 'Unable to load tutor for editing.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleOpenUploadModal = (tutorId) => {
        setUploadTutorId(tutorId);
        setUploadType('certificate');
        setUploadFile(null);
        setOpenUploadModal(true);
    };

    const handleSaveTutor = async () => {
        const requiredFields = editingTutor
            ? ['name', 'phone']
            : [
                'name',
                'email',
                'password',
                'phone',
                'country',
                'state',
                'city',
                'address',
                'bio',
                'skills',
                'highest_education',
                'id_type',
                'id_number',
            ];

        const missingField = requiredFields.find((field) => !String(formData[field] || '').trim());
        if (missingField) {
            openSnackbar('Please fill all required fields.', 'error');
            return;
        }

        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password.trim(),
            phone: formData.phone.trim(),
            country: formData.country.trim(),
            state: formData.state.trim(),
            city: formData.city.trim(),
            address: formData.address.trim(),
            bio: formData.bio.trim(),
            skills: parseCommaList(formData.skills),
            highest_education: formData.highest_education.trim(),
            id_type: formData.id_type.trim(),
            id_number: formData.id_number.trim(),
            bank_name: formData.bank_name.trim(),
            account_number: formData.account_number.trim(),
            account_name: formData.account_name.trim(),
            review_note: formData.review_note.trim(),
        };

        if (formData.initial_doc_file) {
            payload.docs = [{ type: formData.initial_doc_type, file: formData.initial_doc_file }];
        }

        if (editingTutor) {
            delete payload.password;
            if (!payload.email) delete payload.email;
        }

        setSaving(true);
        try {
            if (editingTutor) {
                await optionAdminService.updateTutor(editingTutor.id, payload);
                openSnackbar('Tutor updated successfully.');
            } else {
                await optionAdminService.createTutor(payload);
                openSnackbar('Tutor created successfully.');
            }

            setOpenFormModal(false);
            setFormData(initialTutorForm);
            await listTutors(searchTerm);
        } catch (err) {
            console.error('Failed to save tutor:', err);
            openSnackbar(err.message || 'Failed to save tutor.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleUploadDoc = async () => {
        if (!uploadTutorId || !uploadType || !uploadFile) {
            openSnackbar('Please choose a document type and file.', 'error');
            return;
        }

        setSaving(true);
        try {
            await optionAdminService.uploadTutorKycDoc(uploadTutorId, {
                type: uploadType,
                file: uploadFile,
            });

            openSnackbar('KYC document uploaded successfully.');
            setOpenUploadModal(false);

            await listTutors(searchTerm);
            if (selectedTutor?.id === uploadTutorId) {
                await loadTutorDetail(uploadTutorId);
            }
        } catch (err) {
            console.error('Failed to upload KYC document:', err);
            openSnackbar(err.message || 'Failed to upload document.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteDoc = async (docId) => {
        if (!selectedTutor?.id) return;
        if (!window.confirm('Delete this KYC document?')) return;

        setActionLoading(docId);
        try {
            await optionAdminService.deleteTutorKycDoc(selectedTutor.id, docId);
            openSnackbar('KYC document removed successfully.');
            await loadTutorDetail(selectedTutor.id);
            await listTutors(searchTerm);
        } catch (err) {
            console.error('Failed to delete KYC document:', err);
            openSnackbar(err.message || 'Failed to delete document.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const selectedTutorDocs = useMemo(() => getTutorDocuments(selectedTutor), [selectedTutor]);
    const selectedTutorKycData = useMemo(() => getKycData(selectedTutor), [selectedTutor]);
    const idTypeOptions = useMemo(
        () => getDropdownOptions(ID_TYPE_OPTIONS, formData.id_type),
        [formData.id_type]
    );
    const educationOptions = useMemo(
        () => getDropdownOptions(EDUCATION_OPTIONS, formData.highest_education),
        [formData.highest_education]
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Tutor Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Manage tutors with full KYC profile and supporting documents.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Tooltip title="Refresh">
                        <IconButton
                            onClick={() => listTutors(searchTerm)}
                            disabled={loading}
                            sx={{ color: '#9CA3AF', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
                        >
                            <Refresh />
                        </IconButton>
                    </Tooltip>

                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpenCreateModal}
                        sx={primaryButtonStyle}
                    >
                        Add Tutor
                    </Button>
                </Stack>
            </Stack>

            <Paper sx={{ ...paperStyle, p: 2, mb: 4 }}>
                <Box sx={{ ...searchBarStyle, maxWidth: 420 }}>
                    <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
                    <InputBase
                        placeholder="Search tutors by name or email..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        sx={searchInputStyle}
                    />
                </Box>
            </Paper>

            <TableContainer component={Paper} sx={paperStyle}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={tableHeaderCellStyle}>Tutor</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Email</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Phone</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>KYC Status</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Documents</TableCell>
                            <TableCell align="right" sx={tableHeaderCellStyle}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ ...tableBodyCellStyle, py: 7 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ ...tableBodyCellStyle, py: 4 }}>
                                    <Alert severity="error" sx={{ bgcolor: 'transparent', justifyContent: 'center' }}>
                                        {error}
                                    </Alert>
                                </TableCell>
                            </TableRow>
                        ) : mappedTutors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ ...tableBodyCellStyle, py: 5, color: '#9CA3AF' }}>
                                    No tutors found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            mappedTutors.map((tutor) => {
                                const rowLoading = actionLoading === tutor.id;
                                const statusColor = tutor._kycStatus === 'approved' ? '#10B981' : tutor._kycStatus === 'submitted' ? '#F59E0B' : '#9CA3AF';

                                return (
                                    <TableRow key={tutor.id}>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Avatar sx={{ bgcolor: theme.colors.brand, width: 36, height: 36 }}>
                                                    {(tutor._name || '?').charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography sx={{ color: '#fff', fontWeight: 600 }}>{tutor._name}</Typography>
                                            </Stack>
                                        </TableCell>

                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>{tutor._email}</TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>{tutor._phone}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Typography sx={{ color: statusColor, textTransform: 'capitalize', fontWeight: 600 }}>
                                                {tutor._kycStatus}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>{tutor._docsCount}</TableCell>

                                        <TableCell align="right" sx={tableBodyCellStyle}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="View Details">
                                                    <span>
                                                        <IconButton
                                                            onClick={() => loadTutorDetail(tutor.id, { openModal: true })}
                                                            sx={{ color: '#3B82F6' }}
                                                            disabled={rowLoading}
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>

                                                <Tooltip title="Edit Tutor">
                                                    <span>
                                                        <IconButton
                                                            onClick={() => handleOpenEditModal(tutor.id)}
                                                            sx={{ color: '#F59E0B' }}
                                                            disabled={rowLoading}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>

                                                <Tooltip title="Upload KYC Doc">
                                                    <span>
                                                        <IconButton
                                                            onClick={() => handleOpenUploadModal(tutor.id)}
                                                            sx={{ color: '#10B981' }}
                                                            disabled={rowLoading}
                                                        >
                                                            <UploadFile fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal open={openFormModal} onClose={() => !saving && setOpenFormModal(false)}>
                <Box
                    sx={{
                        ...modalStyle,
                        width: { xs: '95%', md: 820 },
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, borderBottom: '1px solid #374151' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>
                            {editingTutor ? 'Update Tutor' : 'Create Tutor'}
                        </Typography>
                        <IconButton onClick={() => !saving && setOpenFormModal(false)} sx={{ color: '#9CA3AF' }}>
                            <Close />
                        </IconButton>
                    </Stack>

                    <Box sx={{ p: 2.5, overflowY: 'auto' }}>
                        <Stack spacing={2}>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                <TextField
                                    label="Name"
                                    value={formData.name}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                                    fullWidth
                                    sx={textFieldStyle}
                                />
                                <TextField
                                    label="Email"
                                    value={formData.email}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                                    fullWidth
                                    sx={textFieldStyle}
                                    disabled={Boolean(editingTutor)}
                                />
                            </Stack>

                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                <TextField
                                    label={editingTutor ? 'Password (optional)' : 'Password'}
                                    type="password"
                                    value={formData.password}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                                    fullWidth
                                    sx={textFieldStyle}
                                />
                                <TextField
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                                    fullWidth
                                    sx={textFieldStyle}
                                />
                            </Stack>

                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                <TextField
                                    label="Country"
                                    value={formData.country}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, country: event.target.value }))}
                                    fullWidth
                                    sx={textFieldStyle}
                                />
                                <TextField
                                    label="State"
                                    value={formData.state}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, state: event.target.value }))}
                                    fullWidth
                                    sx={textFieldStyle}
                                />
                                <TextField
                                    label="City"
                                    value={formData.city}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, city: event.target.value }))}
                                    fullWidth
                                    sx={textFieldStyle}
                                />
                            </Stack>

                            <TextField
                                label="Address"
                                value={formData.address}
                                onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
                                fullWidth
                                sx={textFieldStyle}
                            />

                            <TextField
                                label="Bio"
                                value={formData.bio}
                                onChange={(event) => setFormData((prev) => ({ ...prev, bio: event.target.value }))}
                                fullWidth
                                minRows={2}
                                multiline
                                sx={textFieldStyle}
                            />

                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                <TextField
                                    label="Skills (comma separated)"
                                    value={formData.skills}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, skills: event.target.value }))}
                                    fullWidth
                                    sx={textFieldStyle}
                                />
                                <FormControl fullWidth>
                                    <InputLabel sx={{ color: '#9CA3AF' }}>Highest Education</InputLabel>
                                    <Select
                                        label="Highest Education"
                                        value={formData.highest_education}
                                        onChange={(event) => setFormData((prev) => ({ ...prev, highest_education: event.target.value }))}
                                        sx={selectStyle}
                                        MenuProps={selectMenuProps}
                                    >
                                        {educationOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {formatOptionLabel(option)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                <FormControl fullWidth>
                                    <InputLabel sx={{ color: '#9CA3AF' }}>ID Type</InputLabel>
                                    <Select
                                        label="ID Type"
                                        value={formData.id_type}
                                        onChange={(event) => setFormData((prev) => ({ ...prev, id_type: event.target.value }))}
                                        sx={selectStyle}
                                        MenuProps={selectMenuProps}
                                    >
                                        {idTypeOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {formatOptionLabel(option)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="ID Number"
                                    value={formData.id_number}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, id_number: event.target.value }))}
                                    fullWidth
                                    sx={textFieldStyle}
                                />
                            </Stack>

                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                <TextField
                                    label="Bank Name"
                                    value={formData.bank_name}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, bank_name: event.target.value }))}
                                    fullWidth
                                    sx={textFieldStyle}
                                />
                                <TextField
                                    label="Account Number"
                                    value={formData.account_number}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, account_number: event.target.value }))}
                                    fullWidth
                                    sx={textFieldStyle}
                                />
                                <TextField
                                    label="Account Name"
                                    value={formData.account_name}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, account_name: event.target.value }))}
                                    fullWidth
                                    sx={textFieldStyle}
                                />
                            </Stack>

                            <TextField
                                label="Review Note"
                                value={formData.review_note}
                                onChange={(event) => setFormData((prev) => ({ ...prev, review_note: event.target.value }))}
                                fullWidth
                                minRows={2}
                                multiline
                                sx={textFieldStyle}
                            />

                            {!editingTutor && (
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: '#9CA3AF' }}>Initial Doc Type</InputLabel>
                                        <Select
                                            label="Initial Doc Type"
                                            value={formData.initial_doc_type}
                                            onChange={(event) => setFormData((prev) => ({ ...prev, initial_doc_type: event.target.value }))}
                                            sx={selectStyle}
                                            MenuProps={selectMenuProps}
                                        >
                                            {KYC_DOC_TYPES.map((docType) => (
                                                <MenuItem key={docType} value={docType}>{docType}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <Button
                                        component="label"
                                        variant="outlined"
                                        sx={{
                                            borderColor: '#374151',
                                            color: '#E5E7EB',
                                            textTransform: 'none',
                                            minHeight: 56,
                                            '&:hover': { borderColor: '#4B5563', bgcolor: 'rgba(255,255,255,0.03)' },
                                        }}
                                    >
                                        {formData.initial_doc_file ? formData.initial_doc_file.name : 'Attach Initial KYC Doc (optional)'}
                                        <input
                                            hidden
                                            type="file"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0] || null;
                                                setFormData((prev) => ({ ...prev, initial_doc_file: file }));
                                            }}
                                        />
                                    </Button>
                                </Stack>
                            )}
                        </Stack>
                    </Box>

                    <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ p: 2.5, borderTop: '1px solid #374151' }}>
                        <Button
                            onClick={() => setOpenFormModal(false)}
                            disabled={saving}
                            sx={{ color: '#9CA3AF', textTransform: 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSaveTutor}
                            disabled={saving}
                            sx={primaryButtonStyle}
                        >
                            {saving ? 'Saving...' : editingTutor ? 'Update Tutor' : 'Create Tutor'}
                        </Button>
                    </Stack>
                </Box>
            </Modal>

            <Modal open={openDetailModal} onClose={() => setOpenDetailModal(false)}>
                <Box
                    sx={{
                        ...modalStyle,
                        width: { xs: '95%', md: 760 },
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, borderBottom: '1px solid #374151' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>
                            Tutor Details
                        </Typography>
                        <IconButton onClick={() => setOpenDetailModal(false)} sx={{ color: '#9CA3AF' }}>
                            <Close />
                        </IconButton>
                    </Stack>

                    <Box sx={{ p: 2.5, overflowY: 'auto' }}>
                        {detailLoading ? (
                            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress />
                            </Box>
                        ) : selectedTutor ? (
                            <Stack spacing={2.5}>
                                <Paper sx={{ ...paperStyle, p: 2 }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>{getTutorName(selectedTutor)}</Typography>
                                    <Typography sx={{ color: '#D1D5DB', fontSize: '0.9rem' }}>Email: {selectedTutor.email || selectedTutor.user?.email || '-'}</Typography>
                                    <Typography sx={{ color: '#D1D5DB', fontSize: '0.9rem' }}>Phone: {selectedTutor.phone || selectedTutorKycData.phone || '-'}</Typography>
                                    <Typography sx={{ color: '#D1D5DB', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                                        KYC Status: {selectedTutor.kyc?.status || selectedTutor.kyc_status || 'unknown'}
                                    </Typography>
                                </Paper>

                                <Paper sx={{ ...paperStyle, p: 2 }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>KYC Profile</Typography>
                                    <Typography sx={{ color: '#D1D5DB', fontSize: '0.9rem' }}>Country: {selectedTutorKycData.country || '-'}</Typography>
                                    <Typography sx={{ color: '#D1D5DB', fontSize: '0.9rem' }}>State: {selectedTutorKycData.state || '-'}</Typography>
                                    <Typography sx={{ color: '#D1D5DB', fontSize: '0.9rem' }}>City: {selectedTutorKycData.city || '-'}</Typography>
                                    <Typography sx={{ color: '#D1D5DB', fontSize: '0.9rem' }}>Address: {selectedTutorKycData.address || '-'}</Typography>
                                    <Typography sx={{ color: '#D1D5DB', fontSize: '0.9rem' }}>Skills: {stringifyList(selectedTutorKycData.skills) || '-'}</Typography>
                                    <Typography sx={{ color: '#D1D5DB', fontSize: '0.9rem' }}>Highest Education: {selectedTutorKycData.highest_education || '-'}</Typography>
                                </Paper>

                                <Paper sx={{ ...paperStyle, p: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                        <Typography sx={{ color: '#fff', fontWeight: 700 }}>KYC Documents</Typography>
                                        <Button
                                            size="small"
                                            startIcon={<UploadFile />}
                                            onClick={() => {
                                                setOpenDetailModal(false);
                                                handleOpenUploadModal(selectedTutor.id);
                                            }}
                                            sx={{ color: '#10B981', textTransform: 'none' }}
                                        >
                                            Add Document
                                        </Button>
                                    </Stack>

                                    {selectedTutorDocs.length === 0 ? (
                                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                                            No documents uploaded.
                                        </Typography>
                                    ) : (
                                        <Stack spacing={1}>
                                            {selectedTutorDocs.map((doc) => {
                                                const docUrl = doc.url || doc.file_url || doc.path || '';
                                                return (
                                                    <Stack
                                                        key={doc.id}
                                                        direction={{ xs: 'column', md: 'row' }}
                                                        justifyContent="space-between"
                                                        alignItems={{ xs: 'flex-start', md: 'center' }}
                                                        spacing={1}
                                                        sx={{
                                                            p: 1.25,
                                                            borderRadius: 1,
                                                            bgcolor: '#0F1729',
                                                            border: '1px solid #374151',
                                                        }}
                                                    >
                                                        <Stack spacing={0.25}>
                                                            <Typography sx={{ color: '#E5E7EB', fontWeight: 600, fontSize: '0.9rem' }}>
                                                                {doc.type || 'document'}
                                                            </Typography>
                                                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                                                ID: {doc.id}
                                                            </Typography>
                                                            {docUrl ? (
                                                                <a href={docUrl} target="_blank" rel="noreferrer" style={{ color: '#60A5FA', fontSize: '0.8rem' }}>
                                                                    View file
                                                                </a>
                                                            ) : null}
                                                        </Stack>

                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            startIcon={<Delete />}
                                                            disabled={actionLoading === doc.id}
                                                            onClick={() => handleDeleteDoc(doc.id)}
                                                            sx={{ textTransform: 'none' }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </Stack>
                                                );
                                            })}
                                        </Stack>
                                    )}
                                </Paper>
                            </Stack>
                        ) : (
                            <Typography sx={{ color: '#9CA3AF' }}>No tutor selected.</Typography>
                        )}
                    </Box>
                </Box>
            </Modal>

            <Modal open={openUploadModal} onClose={() => !saving && setOpenUploadModal(false)}>
                <Box sx={{ ...modalStyle, width: { xs: '95%', md: 520 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, borderBottom: '1px solid #374151' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 700 }}>Upload KYC Document</Typography>
                        <IconButton onClick={() => !saving && setOpenUploadModal(false)} sx={{ color: '#9CA3AF' }}>
                            <Close />
                        </IconButton>
                    </Stack>

                    <Stack spacing={2} sx={{ p: 2.5 }}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: '#9CA3AF' }}>Document Type</InputLabel>
                            <Select
                                value={uploadType}
                                label="Document Type"
                                onChange={(event) => setUploadType(event.target.value)}
                                sx={selectStyle}
                                MenuProps={selectMenuProps}
                            >
                                {KYC_DOC_TYPES.map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<Article />}
                            sx={{
                                borderColor: '#374151',
                                color: '#E5E7EB',
                                textTransform: 'none',
                                justifyContent: 'flex-start',
                                '&:hover': { borderColor: '#4B5563', bgcolor: 'rgba(255,255,255,0.03)' },
                            }}
                        >
                            {uploadFile ? uploadFile.name : 'Choose File'}
                            <input
                                hidden
                                type="file"
                                onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                            />
                        </Button>

                        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ pt: 1 }}>
                            <Button onClick={() => setOpenUploadModal(false)} disabled={saving} sx={{ color: '#9CA3AF', textTransform: 'none' }}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={handleUploadDoc} disabled={saving} sx={primaryButtonStyle}>
                                {saving ? 'Uploading...' : 'Upload'}
                            </Button>
                        </Stack>
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

export default TutorManagement;

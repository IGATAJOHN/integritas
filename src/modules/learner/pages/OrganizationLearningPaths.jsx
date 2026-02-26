import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
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
import { Add, Close, Delete, Edit, Refresh, Visibility } from '@mui/icons-material';
import { organizationService } from '../services/organizationService';
import { useOrganizationScope } from '../hooks/useOrganizationScope';
import OrganizationScopeToolbar from '../components/OrganizationScopeToolbar';
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

const PATH_STATUSES = ['draft', 'published', 'archived'];

const initialPathForm = {
    title: '',
    description: '',
    status: 'draft',
};

const OrganizationLearningPaths = () => {
    const {
        organizations,
        selectedOrgId,
        selectedOrganization,
        setSelectedOrgId,
    } = useOrganizationScope();

    const [learningPaths, setLearningPaths] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [openPathModal, setOpenPathModal] = useState(false);
    const [editingPath, setEditingPath] = useState(null);
    const [pathForm, setPathForm] = useState(initialPathForm);

    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedPath, setSelectedPath] = useState(null);

    const [courseOptions, setCourseOptions] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [manualCourseId, setManualCourseId] = useState('');
    const [reorderDraft, setReorderDraft] = useState([]);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const openSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const listLearningPaths = useCallback(async () => {
        if (!selectedOrgId) {
            setLearningPaths([]);
            return;
        }

        setLoading(true);
        try {
            const response = await organizationService.listLearningPaths(selectedOrgId, {
                status: statusFilter,
                q: searchTerm,
                per_page: 50,
            });
            setLearningPaths(response.data || []);
        } catch (err) {
            console.error('Failed to list learning paths:', err);
            setLearningPaths([]);
            openSnackbar(err.message || 'Failed to load learning paths.', 'error');
        } finally {
            setLoading(false);
        }
    }, [selectedOrgId, statusFilter, searchTerm]);

    const listCourses = useCallback(async () => {
        try {
            const response = await organizationService.listCourses({ per_page: 100, org_id: selectedOrgId || undefined });
            setCourseOptions(response.data || []);
        } catch (err) {
            console.error('Failed to load courses for dropdown:', err);
            setCourseOptions([]);
        }
    }, [selectedOrgId]);

    useEffect(() => {
        listCourses();
    }, [listCourses]);

    useEffect(() => {
        const timer = setTimeout(() => {
            listLearningPaths();
        }, 300);

        return () => clearTimeout(timer);
    }, [listLearningPaths]);

    const openCreatePathModal = () => {
        setEditingPath(null);
        setPathForm(initialPathForm);
        setOpenPathModal(true);
    };

    const openEditPathModal = (path) => {
        setEditingPath(path);
        setPathForm({
            title: String(path?.title || ''),
            description: String(path?.description || ''),
            status: String(path?.status || 'draft'),
        });
        setOpenPathModal(true);
    };

    const handleSavePath = async () => {
        if (!selectedOrgId) {
            openSnackbar('Select an organization first.', 'error');
            return;
        }

        if (!String(pathForm.title || '').trim()) {
            openSnackbar('Learning path title is required.', 'error');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title: pathForm.title.trim(),
                description: pathForm.description.trim(),
                status: pathForm.status,
            };

            if (editingPath?.id) {
                await organizationService.updateLearningPath(selectedOrgId, editingPath.id, payload);
                openSnackbar('Learning path updated successfully.');
            } else {
                await organizationService.createLearningPath(selectedOrgId, payload);
                openSnackbar('Learning path created successfully.');
            }

            setOpenPathModal(false);
            setPathForm(initialPathForm);
            await listLearningPaths();
        } catch (err) {
            console.error('Failed to save learning path:', err);
            openSnackbar(err.message || 'Failed to save learning path.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const loadPathDetail = async (pathId, { openModal = false } = {}) => {
        if (!selectedOrgId || !pathId) return;

        setDetailLoading(true);
        try {
            const detail = await organizationService.getLearningPathById(selectedOrgId, pathId, { with_items: 1 });
            const items = Array.isArray(detail?.items) ? detail.items : [];

            setSelectedPath({ ...detail, items });
            setReorderDraft(
                items.map((item) => ({
                    id: item.id,
                    position: Number(item.position || 0) || 0,
                }))
            );

            if (openModal) {
                setOpenDetailModal(true);
            }

            return detail;
        } catch (err) {
            console.error('Failed to load learning path detail:', err);
            openSnackbar(err.message || 'Failed to load learning path details.', 'error');
            return null;
        } finally {
            setDetailLoading(false);
        }
    };

    const runPathAction = async (path, action) => {
        if (!selectedOrgId || !path?.id) return;

        setActionLoading(path.id);
        try {
            if (action === 'publish') {
                await organizationService.publishLearningPath(selectedOrgId, path.id);
                openSnackbar('Learning path published.');
            }

            if (action === 'archive') {
                await organizationService.archiveLearningPath(selectedOrgId, path.id);
                openSnackbar('Learning path archived.');
            }

            if (action === 'delete') {
                if (!window.confirm('Delete this learning path? This action cannot be undone.')) {
                    return;
                }
                await organizationService.deleteLearningPath(selectedOrgId, path.id);
                openSnackbar('Learning path deleted.');
            }

            await listLearningPaths();

            if (selectedPath?.id === path.id && action !== 'delete') {
                await loadPathDetail(path.id);
            }

            if (selectedPath?.id === path.id && action === 'delete') {
                setOpenDetailModal(false);
                setSelectedPath(null);
            }
        } catch (err) {
            console.error('Learning path action failed:', err);
            openSnackbar(err.message || 'Learning path action failed.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const addCourseToPath = async () => {
        if (!selectedOrgId || !selectedPath?.id) return;

        const courseId = String(selectedCourseId || manualCourseId || '').trim();
        if (!courseId) {
            openSnackbar('Select or paste a course ID first.', 'error');
            return;
        }

        setSaving(true);
        try {
            await organizationService.addCourseToLearningPath(selectedOrgId, selectedPath.id, {
                course_id: courseId,
            });

            setSelectedCourseId('');
            setManualCourseId('');
            openSnackbar('Course added to learning path.');
            await loadPathDetail(selectedPath.id);
            await listLearningPaths();
        } catch (err) {
            console.error('Failed to add course to path:', err);
            openSnackbar(err.message || 'Failed to add course.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const removePathItem = async (itemId) => {
        if (!selectedOrgId || !selectedPath?.id || !itemId) return;
        if (!window.confirm('Remove this item from the path?')) return;

        setActionLoading(itemId);
        try {
            await organizationService.removeLearningPathItem(selectedOrgId, selectedPath.id, itemId);
            openSnackbar('Item removed from learning path.');
            await loadPathDetail(selectedPath.id);
            await listLearningPaths();
        } catch (err) {
            console.error('Failed to remove path item:', err);
            openSnackbar(err.message || 'Failed to remove item.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const applyReorder = async () => {
        if (!selectedOrgId || !selectedPath?.id) return;

        const normalizedItems = reorderDraft
            .map((item) => ({ id: item.id, position: Number(item.position || 0) }))
            .filter((item) => item.id && item.position > 0);

        if (normalizedItems.length === 0) {
            openSnackbar('Provide valid positions starting from 1.', 'error');
            return;
        }

        setSaving(true);
        try {
            await organizationService.reorderLearningPathItems(selectedOrgId, selectedPath.id, {
                items: normalizedItems,
            });
            openSnackbar('Learning path items reordered.');
            await loadPathDetail(selectedPath.id);
        } catch (err) {
            console.error('Failed to reorder items:', err);
            openSnackbar(err.message || 'Failed to reorder items.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const sortedPathItems = useMemo(() => {
        const items = Array.isArray(selectedPath?.items) ? selectedPath.items : [];
        return [...items].sort((a, b) => Number(a.position || 0) - Number(b.position || 0));
    }, [selectedPath]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Organization Learning Paths
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Manage learning paths and courses inside each organization.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button variant="contained" startIcon={<Add />} onClick={openCreatePathModal} disabled={!selectedOrgId} sx={primaryButtonStyle}>
                        Create Learning Path
                    </Button>
                    <IconButton onClick={listLearningPaths} sx={{ color: '#9CA3AF' }}>
                        <Refresh />
                    </IconButton>
                </Stack>
            </Stack>

            <OrganizationScopeToolbar
                organizations={organizations}
                selectedOrgId={selectedOrgId}
                selectedOrganization={selectedOrganization}
                onChangeOrgId={setSelectedOrgId}
            />

            <Paper sx={{ ...paperStyle, p: 2, mb: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                    <Box sx={{ ...searchBarStyle, maxWidth: 420 }}>
                        <InputBase
                            placeholder="Search learning path title..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            sx={searchInputStyle}
                        />
                    </Box>

                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel sx={{ color: '#9CA3AF' }}>Status</InputLabel>
                        <Select
                            label="Status"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All</MenuItem>
                            {PATH_STATUSES.map((status) => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            <TableContainer component={Paper} sx={paperStyle}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={tableHeaderCellStyle}>Learning Path</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
                            <TableCell sx={tableHeaderCellStyle}>Items</TableCell>
                            <TableCell align="right" sx={tableHeaderCellStyle}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!selectedOrgId ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ ...tableBodyCellStyle, py: 5, color: '#9CA3AF' }}>
                                    Select an organization to manage learning paths.
                                </TableCell>
                            </TableRow>
                        ) : loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ ...tableBodyCellStyle, py: 6 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : learningPaths.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ ...tableBodyCellStyle, py: 5, color: '#9CA3AF' }}>
                                    No learning paths found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            learningPaths.map((path) => {
                                const rowLoading = actionLoading === path.id;
                                const statusColor =
                                    path.status === 'published'
                                        ? '#10B981'
                                        : path.status === 'archived'
                                            ? '#EF4444'
                                            : '#F59E0B';

                                return (
                                    <TableRow key={path.id}>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Typography sx={{ color: '#fff', fontWeight: 600 }}>{path.title || '-'}</Typography>
                                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{path.id}</Typography>
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Typography sx={{ color: statusColor, textTransform: 'capitalize', fontWeight: 600 }}>
                                                {path.status || 'unknown'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#D1D5DB' }}>
                                            {path.items_count ?? 0}
                                        </TableCell>
                                        <TableCell align="right" sx={tableBodyCellStyle}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <IconButton
                                                    onClick={() => loadPathDetail(path.id, { openModal: true })}
                                                    disabled={rowLoading}
                                                    sx={{ color: '#3B82F6' }}
                                                >
                                                    <Visibility fontSize="small" />
                                                </IconButton>

                                                <IconButton
                                                    onClick={() => openEditPathModal(path)}
                                                    disabled={rowLoading}
                                                    sx={{ color: '#F59E0B' }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>

                                                <Button
                                                    size="small"
                                                    onClick={() => runPathAction(path, 'publish')}
                                                    disabled={rowLoading || path.status === 'published'}
                                                    sx={{ color: '#10B981', textTransform: 'none' }}
                                                >
                                                    Publish
                                                </Button>

                                                <Button
                                                    size="small"
                                                    onClick={() => runPathAction(path, 'archive')}
                                                    disabled={rowLoading || path.status === 'archived'}
                                                    sx={{ color: '#EF4444', textTransform: 'none' }}
                                                >
                                                    Archive
                                                </Button>

                                                <IconButton
                                                    onClick={() => runPathAction(path, 'delete')}
                                                    disabled={rowLoading}
                                                    sx={{ color: '#EF4444' }}
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

            <Modal open={openPathModal} onClose={() => !saving && setOpenPathModal(false)}>
                <Box sx={{ ...modalStyle, width: { xs: '95%', md: 680 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, borderBottom: '1px solid #374151' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 700 }}>
                            {editingPath ? 'Update Learning Path' : 'Create Learning Path'}
                        </Typography>
                        <IconButton onClick={() => !saving && setOpenPathModal(false)} sx={{ color: '#9CA3AF' }}>
                            <Close />
                        </IconButton>
                    </Stack>

                    <Stack spacing={2} sx={{ p: 2.5 }}>
                        <TextField
                            label="Title"
                            value={pathForm.title}
                            onChange={(event) => setPathForm((prev) => ({ ...prev, title: event.target.value }))}
                            sx={textFieldStyle}
                            fullWidth
                        />

                        <TextField
                            label="Description"
                            value={pathForm.description}
                            onChange={(event) => setPathForm((prev) => ({ ...prev, description: event.target.value }))}
                            sx={textFieldStyle}
                            fullWidth
                            multiline
                            rows={4}
                        />

                        <FormControl fullWidth>
                            <InputLabel sx={{ color: '#9CA3AF' }}>Status</InputLabel>
                            <Select
                                label="Status"
                                value={pathForm.status}
                                onChange={(event) => setPathForm((prev) => ({ ...prev, status: event.target.value }))}
                                sx={selectStyle}
                                MenuProps={selectMenuProps}
                            >
                                {PATH_STATUSES.map((status) => (
                                    <MenuItem key={status} value={status}>{status}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ p: 2.5, borderTop: '1px solid #374151' }}>
                        <Button onClick={() => setOpenPathModal(false)} disabled={saving} sx={{ color: '#9CA3AF', textTransform: 'none' }}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleSavePath} disabled={saving} sx={primaryButtonStyle}>
                            {saving ? 'Saving...' : editingPath ? 'Update Path' : 'Create Path'}
                        </Button>
                    </Stack>
                </Box>
            </Modal>

            <Modal open={openDetailModal} onClose={() => setOpenDetailModal(false)}>
                <Box sx={{ ...modalStyle, width: { xs: '95%', md: 920 }, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, borderBottom: '1px solid #374151' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 700 }}>Learning Path Details</Typography>
                        <IconButton onClick={() => setOpenDetailModal(false)} sx={{ color: '#9CA3AF' }}>
                            <Close />
                        </IconButton>
                    </Stack>

                    <Box sx={{ p: 2.5, overflowY: 'auto' }}>
                        {detailLoading ? (
                            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress />
                            </Box>
                        ) : !selectedPath ? (
                            <Typography sx={{ color: '#9CA3AF' }}>No learning path selected.</Typography>
                        ) : (
                            <Stack spacing={2.5}>
                                <Paper sx={{ ...paperStyle, p: 2 }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>{selectedPath.title || '-'}</Typography>
                                    <Typography sx={{ color: '#D1D5DB', mb: 1 }}>{selectedPath.description || '-'}</Typography>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                                        Status: {selectedPath.status || '-'}
                                    </Typography>
                                </Paper>

                                <Paper sx={{ ...paperStyle, p: 2 }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>Add Course Item</Typography>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                                        <FormControl fullWidth>
                                            <InputLabel sx={{ color: '#9CA3AF' }}>Select Course</InputLabel>
                                            <Select
                                                label="Select Course"
                                                value={selectedCourseId}
                                                onChange={(event) => setSelectedCourseId(event.target.value)}
                                                sx={selectStyle}
                                                MenuProps={selectMenuProps}
                                            >
                                                {courseOptions.length === 0 ? (
                                                    <MenuItem value="" disabled>No courses found</MenuItem>
                                                ) : (
                                                    courseOptions.map((course) => (
                                                        <MenuItem key={course.id} value={course.id}>
                                                            {course.title || course.name || course.id}
                                                        </MenuItem>
                                                    ))
                                                )}
                                            </Select>
                                        </FormControl>

                                        <TextField
                                            label="Or paste Course ID"
                                            value={manualCourseId}
                                            onChange={(event) => setManualCourseId(event.target.value)}
                                            sx={textFieldStyle}
                                            fullWidth
                                        />

                                        <Button variant="contained" onClick={addCourseToPath} disabled={saving} sx={primaryButtonStyle}>
                                            Add
                                        </Button>
                                    </Stack>
                                </Paper>

                                <Paper sx={{ ...paperStyle, p: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                        <Typography sx={{ color: '#fff', fontWeight: 700 }}>Path Items</Typography>
                                        <Button
                                            size="small"
                                            onClick={applyReorder}
                                            disabled={saving || reorderDraft.length === 0}
                                            sx={{ color: '#3B82F6', textTransform: 'none' }}
                                        >
                                            Apply Reorder
                                        </Button>
                                    </Stack>

                                    {sortedPathItems.length === 0 ? (
                                        <Typography sx={{ color: '#9CA3AF' }}>No items in this learning path yet.</Typography>
                                    ) : (
                                        <Stack spacing={1.25}>
                                            {sortedPathItems.map((item) => {
                                                const draft = reorderDraft.find((entry) => entry.id === item.id);
                                                return (
                                                    <Stack
                                                        key={item.id}
                                                        direction={{ xs: 'column', md: 'row' }}
                                                        spacing={1.5}
                                                        alignItems={{ xs: 'stretch', md: 'center' }}
                                                        sx={{ p: 1.25, borderRadius: 1, bgcolor: '#0F1729', border: '1px solid #374151' }}
                                                    >
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography sx={{ color: '#E5E7EB', fontWeight: 600 }}>
                                                                {item.course?.title || item.course_id}
                                                            </Typography>
                                                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                                                Item ID: {item.id}
                                                            </Typography>
                                                        </Box>

                                                        <TextField
                                                            label="Position"
                                                            type="number"
                                                            value={draft?.position ?? item.position ?? ''}
                                                            onChange={(event) => {
                                                                const value = event.target.value;
                                                                setReorderDraft((prev) =>
                                                                    prev.map((entry) =>
                                                                        entry.id === item.id
                                                                            ? { ...entry, position: value }
                                                                            : entry
                                                                    )
                                                                );
                                                            }}
                                                            sx={{ ...textFieldStyle, width: { xs: '100%', md: 140 } }}
                                                        />

                                                        <Button
                                                            color="error"
                                                            startIcon={<Delete />}
                                                            onClick={() => removePathItem(item.id)}
                                                            disabled={actionLoading === item.id}
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
                        )}
                    </Box>
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

export default OrganizationLearningPaths;

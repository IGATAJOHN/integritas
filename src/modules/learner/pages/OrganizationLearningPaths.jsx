import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Fade,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Modal,
    Paper,
    Popover,
    Select,
    Pagination,
    Skeleton,
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
    AddRounded,
    ArchiveOutlined,
    AutoStoriesOutlined,
    BusinessOutlined,
    CloseRounded,
    DeleteRounded,
    EditRounded,
    FilterListRounded,
    InfoOutlined,
    LayersOutlined,
    PublishRounded,
    RefreshRounded,
    SearchRounded,
    VisibilityRounded,
} from '@mui/icons-material';
import { organizationService } from '../services/organizationService';
import { useOrganizationScope } from '../hooks/useOrganizationScope';
import OrganizationScopeToolbar from '../components/OrganizationScopeToolbar';
import {
    modalStyle,
    primaryButtonStyle,
    selectMenuProps,
    selectStyle,
    tableBodyCellStyle,
    tableHeaderCellStyle,
    textFieldStyle,
} from '../../../styles/formStyles';

const PATH_STATUSES = ['draft', 'published', 'archived'];
const PATHS_PER_PAGE = 20;

const initialPathForm = {
    title: '',
    description: '',
    status: 'draft',
};

const readCourseLabel = (course = {}) =>
    String(course?.title || course?.name || '').trim() || 'Untitled course';

const readLearningPathLabel = (path = {}) =>
    String(path?.title || path?.name || '').trim() || 'Untitled learning path';

const FilterPopover = ({
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    return (
        <>
            <Tooltip title="Filters">
                <Button
                    startIcon={<FilterListRounded />}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                        bgcolor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid #1E293B',
                        color: '#E2E8F0',
                        textTransform: 'none',
                        px: 2,
                        '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.8)', borderColor: '#334155' },
                    }}
                >
                    Filters
                    {(statusFilter || searchTerm) && (
                        <Box
                            sx={{
                                ml: 1,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: '#3B82F6',
                                border: '2px solid #0F172A',
                            }}
                        />
                    )}
                </Button>
            </Tooltip>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        bgcolor: '#0F172A',
                        border: '1px solid #1E293B',
                        borderRadius: 2,
                        p: 2,
                        minWidth: 280,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    },
                }}
            >
                <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 700, mb: 2 }}>
                    Filter Learning Paths
                </Typography>
                <Stack spacing={2.5}>
                    <TextField
                        size="small"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={textFieldStyle}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRounded sx={{ color: '#64748B', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: '#94A3B8' }}>Status</InputLabel>
                        <Select
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={selectStyle}
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="">All Statuses</MenuItem>
                            {PATH_STATUSES.map((status) => (
                                <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                                    {status}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Divider sx={{ borderColor: '#1E293B' }} />

                    <Button
                        size="small"
                        fullWidth
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('');
                            setAnchorEl(null);
                        }}
                        sx={{ color: '#EF4444', textTransform: 'none', fontWeight: 600 }}
                    >
                        Reset Filters
                    </Button>
                </Stack>
            </Popover>
        </>
    );
};

const OrganizationLearningPaths = () => {
    const {
        organizations,
        selectedOrgId,
        selectedOrganization,
        setSelectedOrgId,
    } = useOrganizationScope();
    const canManageLearningPaths = Boolean(selectedOrganization?.can_manage);

    const [learningPaths, setLearningPaths] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [accessDenied, setAccessDenied] = useState(false);
    const [page, setPage] = useState(1);
    const [paginationMeta, setPaginationMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: PATHS_PER_PAGE,
    });

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
            setAccessDenied(false);
            setPaginationMeta({
                current_page: 1,
                last_page: 1,
                total: 0,
                per_page: PATHS_PER_PAGE,
            });
            return;
        }

        if (!canManageLearningPaths) {
            setLearningPaths([]);
            setAccessDenied(true);
            setPaginationMeta({
                current_page: 1,
                last_page: 1,
                total: 0,
                per_page: PATHS_PER_PAGE,
            });
            return;
        }

        setLoading(true);
        try {
            const response = await organizationService.listLearningPaths(selectedOrgId, {
                status: statusFilter,
                q: searchTerm,
                per_page: PATHS_PER_PAGE,
                page,
            });
            setLearningPaths(response.data || []);
            setPaginationMeta({
                current_page: Number(response?.meta?.current_page) || page,
                last_page: Number(response?.meta?.last_page) || 1,
                total: Number(response?.meta?.total) || (response.data || []).length,
                per_page: Number(response?.meta?.per_page) || PATHS_PER_PAGE,
            });
            setAccessDenied(false);
        } catch (err) {
            setLearningPaths([]);
            setPaginationMeta({
                current_page: 1,
                last_page: 1,
                total: 0,
                per_page: PATHS_PER_PAGE,
            });
            if (err?.status === 403) {
                setAccessDenied(true);
                return;
            }
            console.error('Failed to list learning paths:', err);
            openSnackbar(err.message || 'Failed to load learning paths.', 'error');
        } finally {
            setLoading(false);
        }
    }, [canManageLearningPaths, page, searchTerm, selectedOrgId, statusFilter]);

    const listCourses = useCallback(async () => {
        if (!selectedOrgId || !canManageLearningPaths) {
            setCourseOptions([]);
            return;
        }

        try {
            const response = await organizationService.listCourses({ per_page: 100, org_id: selectedOrgId || undefined });
            setCourseOptions(response.data || []);
        } catch (err) {
            console.error('Failed to load courses for dropdown:', err);
            setCourseOptions([]);
        }
    }, [canManageLearningPaths, selectedOrgId]);

    useEffect(() => {
        listCourses();
    }, [listCourses]);

    useEffect(() => {
        const timer = setTimeout(() => {
            listLearningPaths();
        }, 300);

        return () => clearTimeout(timer);
    }, [listLearningPaths]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedOrgId, statusFilter]);

    useEffect(() => {
        if (selectedOrgId && canManageLearningPaths) return;

        setOpenPathModal(false);
        setOpenDetailModal(false);
        setEditingPath(null);
        setSelectedPath(null);
        setSelectedCourseId('');
        setReorderDraft([]);
    }, [canManageLearningPaths, selectedOrgId]);

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

        const courseId = String(selectedCourseId || '').trim();
        if (!courseId) {
            openSnackbar('Select a course first.', 'error');
            return;
        }

        setSaving(true);
        try {
            await organizationService.addCourseToLearningPath(selectedOrgId, selectedPath.id, {
                course_id: courseId,
            });

            setSelectedCourseId('');
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
        <Box sx={{ p: { xs: 2.5, md: 5 }, bgcolor: '#0F1729', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', md: 'center' }}
                spacing={3}
                sx={{ mb: 5 }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            color: '#F8FAFC',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        <LayersOutlined sx={{ fontSize: 32, color: '#6366F1' }} />
                        Learning Paths
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 1, maxWidth: 600 }}>
                        Curate specialized educational journeys. Oragnize courses into structured paths, manage status, and monitor deployment across your organization.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        startIcon={<AddRounded />}
                        onClick={openCreatePathModal}
                        disabled={!selectedOrgId || !canManageLearningPaths}
                        sx={{
                            ...primaryButtonStyle,
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            height: 44,
                        }}
                    >
                        Create Learning Path
                    </Button>
                    <Tooltip title="Refresh Data">
                        <IconButton
                            onClick={listLearningPaths}
                            sx={{
                                color: '#94A3B8',
                                bgcolor: 'rgba(30, 41, 59, 0.4)',
                                border: '1px solid #1E293B',
                                borderRadius: '10px',
                                '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.8)' },
                            }}
                        >
                            <RefreshRounded />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            <OrganizationScopeToolbar
                organizations={organizations}
                selectedOrgId={selectedOrgId}
                selectedOrganization={selectedOrganization}
                onChangeOrgId={setSelectedOrgId}
            />

            {selectedOrgId && accessDenied && (
                <Fade in>
                    <Box
                        sx={{
                            p: 2,
                            mb: 4,
                            borderRadius: 2,
                            bgcolor: 'rgba(59, 130, 246, 0.05)',
                            border: '1px solid rgba(59, 130, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <InfoOutlined sx={{ color: '#3B82F6' }} />
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                            You are not authorized to manage learning paths in this organization. Please contact your administrator for manager access.
                        </Typography>
                    </Box>
                </Fade>
            )}

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                    Showing {learningPaths.length} of {paginationMeta.total} learning paths
                </Typography>
                <FilterPopover
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
            </Stack>

            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    bgcolor: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    border: '1px solid #1E293B',
                    overflow: 'hidden',
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'rgba(30, 41, 59, 0.5)' }}>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Path Name</TableCell>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
                            <TableCell sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course Count</TableCell>
                            <TableCell align="right" sx={{ ...tableHeaderCellStyle, py: 2.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} sx={{ borderBottom: '1px solid #1E293B' }}>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: '60%', height: 24 }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="rectangular" sx={{ bgcolor: '#1E293B', width: 80, height: 24, borderRadius: 1 }} /></TableCell>
                                    <TableCell sx={tableBodyCellStyle}><Skeleton variant="text" sx={{ bgcolor: '#1E293B', width: 40 }} /></TableCell>
                                    <TableCell align="right" sx={tableBodyCellStyle}><Skeleton variant="rectangular" sx={{ bgcolor: '#1E293B', width: 140, height: 32, borderRadius: 1, ml: 'auto' }} /></TableCell>
                                </TableRow>
                            ))
                        ) : !selectedOrgId ? (
                            <TableRow>
                                <TableCell colSpan={4} sx={{ p: 0 }}>
                                    <Box sx={{ py: 10, textAlign: 'center' }}>
                                        <BusinessOutlined sx={{ fontSize: 60, color: '#1E293B', mb: 2 }} />
                                        <Typography sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1 }}>No Organization Selected</Typography>
                                        <Typography sx={{ color: '#64748B', maxWidth: 300, mx: 'auto' }}>Select an organization context to view and manage your curated learning paths.</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : learningPaths.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} sx={{ p: 0 }}>
                                    <Box sx={{ py: 10, textAlign: 'center' }}>
                                        <AutoStoriesOutlined sx={{ fontSize: 60, color: '#1E293B', mb: 2 }} />
                                        <Typography sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1 }}>No Paths Created</Typography>
                                        <Typography sx={{ color: '#64748B', maxWidth: 300, mx: 'auto' }}>
                                            {searchTerm || statusFilter 
                                                ? "No paths match your current filters. Try adjusting them."
                                                : "Create your first learning journey for this organization."}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            learningPaths.map((path) => {
                                const rowLoading = actionLoading === path.id;
                                return (
                                    <TableRow
                                        key={path.id}
                                        sx={{
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                                            transition: 'background-color 0.2s ease',
                                            borderBottom: '1px solid #1E293B',
                                        }}
                                    >
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Typography sx={{ color: '#F1F5F9', fontWeight: 600, fontSize: '0.9rem' }}>
                                                {readLearningPathLabel(path)}
                                            </Typography>
                                            {path.description && (
                                                <Typography sx={{ color: '#64748B', fontSize: '0.75rem', mt: 0.5, maxWidth: 350 }} noWrap>
                                                    {path.description}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Chip
                                                size="small"
                                                label={path.status || 'unknown'}
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    bgcolor: path.status === 'published'
                                                        ? 'rgba(16, 185, 129, 0.1)'
                                                        : path.status === 'archived'
                                                            ? 'rgba(239, 68, 68, 0.1)'
                                                            : 'rgba(245, 158, 11, 0.1)',
                                                    color:
                                                        path.status === 'published'
                                                            ? '#10B981'
                                                            : path.status === 'archived'
                                                                ? '#EF4444'
                                                                : '#F59E0B',
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem',
                                                    borderRadius: '6px',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ ...tableBodyCellStyle, color: '#94A3B8', fontSize: '0.9rem' }}>
                                            {path.items_count ?? 0} courses
                                        </TableCell>
                                        <TableCell align="right" sx={tableBodyCellStyle}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => loadPathDetail(path.id, { openModal: true })}
                                                        disabled={rowLoading}
                                                        sx={{ color: '#3B82F6', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' } }}
                                                    >
                                                        <VisibilityRounded fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit Metadata">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openEditPathModal(path)}
                                                        disabled={rowLoading}
                                                        sx={{ color: '#F59E0B', '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.1)' } }}
                                                    >
                                                        <EditRounded fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {path.status !== 'published' && (
                                                    <Tooltip title="Publish Path">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => runPathAction(path, 'publish')}
                                                            disabled={rowLoading}
                                                            sx={{ color: '#10B981', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' } }}
                                                        >
                                                            <PublishRounded fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {path.status !== 'archived' && (
                                                    <Tooltip title="Archive Path">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => runPathAction(path, 'archive')}
                                                            disabled={rowLoading}
                                                            sx={{ color: '#94A3B8', '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.1)' } }}
                                                        >
                                                            <ArchiveOutlined fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Delete Permanently">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => runPathAction(path, 'delete')}
                                                        disabled={rowLoading}
                                                        sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                                                    >
                                                        <DeleteRounded fontSize="small" />
                                                    </IconButton>
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

            {!accessDenied && paginationMeta.last_page > 1 && (
                <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                    <Pagination
                        page={paginationMeta.current_page}
                        count={paginationMeta.last_page}
                        onChange={(_, nextPage) => setPage(nextPage)}
                        color="primary"
                        shape="rounded"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: '#CBD5E1',
                                borderColor: '#334155',
                            },
                            '& .Mui-selected': {
                                bgcolor: 'rgba(59, 130, 246, 0.18)',
                                color: '#BFDBFE',
                            },
                        }}
                    />
                </Stack>
            )}

            {/* Path Creation/Edit Modal */}
            <Modal open={openPathModal} onClose={() => !saving && setOpenPathModal(false)}>
                <Box 
                    sx={{ 
                        ...modalStyle, 
                        width: { xs: '95%', md: 640 },
                        bgcolor: '#0F172A',
                        border: '1px solid #1E293B',
                        borderRadius: 3,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        p: 0,
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{ p: 3, borderBottom: '1px solid #1E293B', bgcolor: 'rgba(30, 41, 59, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                                {editingPath ? 'Update Learning Path' : 'Create New Learning Journey'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
                                {editingPath ? 'Modify path metadata and status.' : 'Define the name and context for your new path.'}
                            </Typography>
                        </Box>
                        <IconButton onClick={() => !saving && setOpenPathModal(false)} sx={{ color: '#94A3B8' }}>
                            <CloseRounded />
                        </IconButton>
                    </Box>

                    <Stack spacing={3} sx={{ p: 3 }}>
                        <TextField
                            label="Journey Title"
                            value={pathForm.title}
                            onChange={(event) => setPathForm((prev) => ({ ...prev, title: event.target.value }))}
                            sx={textFieldStyle}
                            fullWidth
                            placeholder="e.g. Senior Leadership Fundamentals"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LayersOutlined sx={{ color: '#64748B', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="Executive Summary"
                            value={pathForm.description}
                            onChange={(event) => setPathForm((prev) => ({ ...prev, description: event.target.value }))}
                            sx={textFieldStyle}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Provide a brief overview of the learning objectives."
                        />

                        <FormControl fullWidth>
                            <InputLabel sx={{ color: '#94A3B8' }}>Operational Status</InputLabel>
                            <Select
                                label="Operational Status"
                                value={pathForm.status}
                                onChange={(event) => setPathForm((prev) => ({ ...prev, status: event.target.value }))}
                                sx={selectStyle}
                                MenuProps={selectMenuProps}
                            >
                                {PATH_STATUSES.map((status) => (
                                    <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    <Box sx={{ p: 3, borderTop: '1px solid #1E293B', bgcolor: 'rgba(30, 41, 59, 0.5)', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={() => setOpenPathModal(false)} disabled={saving} sx={{ color: '#94A3B8', textTransform: 'none', fontWeight: 600 }}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleSavePath} disabled={saving} sx={primaryButtonStyle}>
                            {saving ? 'Synchronizing...' : editingPath ? 'Update Journey' : 'Begin Journey Creation'}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Item Management Modal (Detail) */}
            <Modal open={openDetailModal} onClose={() => setOpenDetailModal(false)}>
                <Box 
                    sx={{ 
                        ...modalStyle, 
                        width: { xs: '95%', md: 920 }, 
                        maxHeight: '92vh', 
                        display: 'flex', 
                        flexDirection: 'column',
                        bgcolor: '#0F172A',
                        border: '1px solid #1E293B',
                        borderRadius: 3,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        p: 0,
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{ p: 3, borderBottom: '1px solid #1E293B', bgcolor: 'rgba(30, 41, 59, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <LayersOutlined sx={{ color: '#6366F1' }} />
                            <Box>
                                <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                                    {selectedPath?.title || 'Journey Content Management'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                    Orchestrate courses and manage sequences.
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={() => setOpenDetailModal(false)} sx={{ color: '#94A3B8' }}>
                            <CloseRounded />
                        </IconButton>
                    </Box>

                    <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
                        {detailLoading ? (
                            <Box sx={{ py: 10, textAlign: 'center' }}>
                                <CircularProgress size={32} sx={{ color: '#3B82F6', mb: 2 }} />
                                <Typography sx={{ color: '#64748B' }}>Fetching journey architecture...</Typography>
                            </Box>
                        ) : !selectedPath ? (
                            <Box sx={{ py: 6, textAlign: 'center' }}>
                                <InfoOutlined sx={{ fontSize: 48, color: '#1E293B', mb: 2 }} />
                                <Typography sx={{ color: '#64748B' }}>Resource context lost. Please try reopening.</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={4}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                    <Paper sx={{ p: 2.5, bgcolor: 'rgba(30, 41, 59, 0.3)', border: '1px solid #1E293B', borderRadius: 2 }}>
                                        <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: '0.1em' }}>Add Course to Sequence</Typography>
                                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel sx={{ color: '#94A3B8' }}>Search Course</InputLabel>
                                                <Select
                                                    label="Search Course"
                                                    value={selectedCourseId}
                                                    onChange={(event) => setSelectedCourseId(event.target.value)}
                                                    sx={selectStyle}
                                                    MenuProps={selectMenuProps}
                                                >
                                                    {courseOptions.length === 0 ? (
                                                        <MenuItem value="" disabled>No compatible courses found</MenuItem>
                                                    ) : (
                                                        courseOptions.map((course) => (
                                                            <MenuItem key={course.id} value={course.id}>
                                                                {readCourseLabel(course)}
                                                            </MenuItem>
                                                        ))
                                                    )}
                                                </Select>
                                            </FormControl>
                                            <Button 
                                                variant="contained" 
                                                onClick={addCourseToPath} 
                                                disabled={saving} 
                                                sx={{ ...primaryButtonStyle, minWidth: 80, height: 40, py: 0 }}
                                            >
                                                {saving ? 'Adding...' : 'Inject'}
                                            </Button>
                                        </Stack>
                                    </Paper>

                                    <Paper sx={{ p: 2.5, bgcolor: 'rgba(30, 41, 59, 0.3)', border: '1px solid #1E293B', borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: '0.1em' }}>Journey Metrics</Typography>
                                        <Stack direction="row" spacing={4} sx={{ mt: 1.5 }}>
                                            <Box>
                                                <Typography variant="h4" sx={{ color: '#F1F5F9', fontWeight: 800 }}>{sortedPathItems.length}</Typography>
                                                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Total Items</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="h4" sx={{ color: '#3B82F6', fontWeight: 800 }}>{selectedPath.status === 'published' ? 'Active' : 'Offline'}</Typography>
                                                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Current Logic</Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Box>

                                <Box>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ color: '#F1F5F9', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AutoStoriesOutlined sx={{ fontSize: 20, color: '#3B82F6' }} />
                                            Sequence Architecture
                                        </Typography>
                                        <Button
                                            startIcon={<LayersOutlined />}
                                            onClick={applyReorder}
                                            disabled={saving || reorderDraft.length === 0}
                                            sx={{ color: '#3B82F6', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.05)' } }}
                                        >
                                            Apply Structural Change
                                        </Button>
                                    </Stack>

                                    {sortedPathItems.length === 0 ? (
                                        <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'rgba(30, 41, 59, 0.2)', border: '1px dashed #334155', borderRadius: 3 }}>
                                            <Typography sx={{ color: '#64748B' }}>No courses have been added to this path sequence.</Typography>
                                        </Box>
                                    ) : (
                                        <Stack spacing={1.5}>
                                            {sortedPathItems.map((item, index) => {
                                                const draft = reorderDraft.find((entry) => entry.id === item.id);
                                                const isLast = index === sortedPathItems.length - 1;
                                                return (
                                                    <Box key={item.id}>
                                                        <Paper
                                                            sx={{
                                                                p: 2,
                                                                bgcolor: '#0F172A',
                                                                border: '1px solid #1E293B',
                                                                borderRadius: 2,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 2,
                                                                transition: 'transform 0.2s ease, border-color 0.2s ease',
                                                                '&:hover': { transform: 'translateX(4px)', borderColor: '#334155' }
                                                            }}
                                                        >
                                                            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                                                                {item.position || index + 1}
                                                            </Box>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography sx={{ color: '#F1F5F9', fontWeight: 600 }}>{readCourseLabel(item.course)}</Typography>
                                                                <Typography sx={{ color: '#64748B', fontSize: '0.75rem' }}>Course ID: {item.course_id || 'Internal'}</Typography>
                                                            </Box>
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                <TextField
                                                                    size="small"
                                                                    label="Pos"
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
                                                                    sx={{ ...textFieldStyle, width: 80, '& .MuiInputBase-input': { py: 0.8, fontSize: '0.85rem' } }}
                                                                />
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => removePathItem(item.id)}
                                                                    disabled={actionLoading === item.id}
                                                                    sx={{ color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                                                                >
                                                                    <DeleteRounded fontSize="small" />
                                                                </IconButton>
                                                            </Stack>
                                                        </Paper>
                                                        {!isLast && (
                                                            <Box sx={{ ml: 3.8, width: 2, height: 12, bgcolor: '#1E293B' }} />
                                                        )}
                                                    </Box>
                                                );
                                            })}
                                        </Stack>
                                    )}
                                </Box>
                            </Stack>
                        )}
                    </Box>

                    <Box sx={{ p: 3, borderTop: '1px solid #1E293B', bgcolor: 'rgba(30, 41, 59, 0.5)', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => setOpenDetailModal(false)}
                            disabled={saving}
                            sx={{ color: '#94A3B8', borderColor: '#334155', textTransform: 'none', fontWeight: 600, px: 4, '&:hover': { borderColor: '#475569', bgcolor: 'rgba(255,255,255,0.05)' } }}
                        >
                            Return to Journey Repository
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={closeSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={closeSnackbar}
                    variant="filled"
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrganizationLearningPaths;

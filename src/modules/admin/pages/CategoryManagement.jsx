import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    IconButton,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Modal,
    TextField,
    InputBase,
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
    Close,
    Category,
    CheckCircle,
    Block,
    Refresh,
} from '@mui/icons-material';
import { textFieldStyle, modalStyle } from '../../../styles/formStyles';
import { categoryService } from '../../../services';
import theme from '../../../styles/theme';


const CategoryManagement = () => {
    // State for categories data
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Snackbar for notifications
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Modal state
    const [openModal, setOpenModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    /**
     * Fetch all categories from the API
     * GET /categories
     */
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await categoryService.listCategories({ per_page: 100 });
            // API returns { data: [...], meta: {...}, links: {...} }
            setCategories(response.data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err.message || 'Failed to load categories');
            setSnackbar({ open: true, message: 'Failed to load categories', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Filter categories based on search (client-side filtering)
    const filteredCategories = categories.filter(category =>
        (category.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description || '' });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
    };

    /**
     * Save category - Create or Update
     * POST /categories (create) or PUT /categories/{id} (update)
     */
    const handleSaveCategory = async () => {
        if (!formData.name.trim()) {
            setSnackbar({ open: true, message: 'Category name is required', severity: 'warning' });
            return;
        }

        setSaving(true);
        try {
            if (editingCategory) {
                // Update existing category
                // PUT /categories/{id}
                await categoryService.updateCategory(editingCategory.id, formData);
                setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
            } else {
                // Create new category
                // POST /categories
                await categoryService.createCategory(formData);
                setSnackbar({ open: true, message: 'Category created successfully', severity: 'success' });
            }
            handleCloseModal();
            // Refresh the list to show updated data
            await fetchCategories();
        } catch (err) {
            console.error('Error saving category:', err);
            setSnackbar({
                open: true,
                message: err.message || 'Failed to save category',
                severity: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    /**
     * Toggle category status (Note: API may not support this directly)
     * This is a placeholder - implement based on actual API support
     */
    const handleToggleStatus = async (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return;

        try {
            // Toggle status by updating the category
            // PUT /categories/{id}
            const newStatus = category.status === 'Active' ? 'Inactive' : 'Active';
            await categoryService.updateCategory(categoryId, {
                ...category,
                status: newStatus
            });
            setSnackbar({
                open: true,
                message: `Category ${newStatus === 'Active' ? 'activated' : 'deactivated'}`,
                severity: 'success'
            });
            await fetchCategories();
        } catch (err) {
            console.error('Error toggling status:', err);
            setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
        }
    };

    /**
     * Delete a category
     * DELETE /categories/{id}
     */
    const handleDeleteCategory = async (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return;

        // Check if category has courses (prevent deletion)
        if (category.courses_count > 0 || category.coursesCount > 0) {
            setSnackbar({
                open: true,
                message: 'Cannot delete category with existing courses. Please reassign courses first.',
                severity: 'warning'
            });
            return;
        }

        // Confirm deletion
        if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
            return;
        }

        try {
            await categoryService.deleteCategory(categoryId);
            setSnackbar({ open: true, message: 'Category deleted successfully', severity: 'success' });
            await fetchCategories();
        } catch (err) {
            console.error('Error deleting category:', err);
            setSnackbar({
                open: true,
                message: err.message || 'Failed to delete category',
                severity: 'error'
            });
        }
    };

    // Close snackbar handler
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };


    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            {/* Header Section */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Category Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Create and manage course categories for tutors to select.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Refresh">
                        <IconButton
                            onClick={fetchCategories}
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
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenModal()}
                        sx={{
                            bgcolor: theme.colors.brand,
                            '&:hover': { bgcolor: '#0D42AF' },
                            boxShadow: '0 4px 14px rgba(17, 82, 212, 0.4)'
                        }}
                    >
                        Add Category
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
                        placeholder="Search categories..."
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

            {/* Categories Table */}
            <TableContainer component={Paper} sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Category</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Description</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Courses</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Status</TableCell>
                            <TableCell align="right" sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
                                    <CircularProgress size={40} sx={{ color: '#7C3AED' }} />
                                    <Typography sx={{ color: '#9CA3AF', mt: 2 }}>Loading categories...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 4 }}>
                                    <Alert severity="error" sx={{ bgcolor: 'transparent', justifyContent: 'center' }}>
                                        {error}
                                    </Alert>
                                    <Button onClick={fetchCategories} sx={{ mt: 2, color: '#7C3AED' }}>Try Again</Button>
                                </TableCell>
                            </TableRow>
                        ) : filteredCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
                                    <Category sx={{ fontSize: 48, color: '#374151', mb: 2 }} />
                                    <Typography sx={{ color: '#9CA3AF' }}>
                                        {searchTerm ? 'No categories match your search' : 'No categories yet. Click "Add Category" to create one.'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : filteredCategories.map((category) => (
                            <TableRow key={category.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ color: '#fff', borderBottom: '1px solid #374151' }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 1.5,
                                                bgcolor: '#7C3AED',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Category sx={{ color: '#fff', fontSize: 20 }} />
                                        </Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>
                                            {category.name}
                                        </Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                    <Typography variant="body2" sx={{ color: '#9CA3AF', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {category.description}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                    <Chip
                                        label={`${category.coursesCount} courses`}
                                        size="small"
                                        sx={{
                                            bgcolor: '#374151',
                                            color: '#E5E7EB',
                                            fontSize: '0.75rem',
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                    <Chip
                                        icon={category.status === 'Active' ? <CheckCircle sx={{ fontSize: 14 }} /> : <Block sx={{ fontSize: 14 }} />}
                                        label={category.status}
                                        size="small"
                                        sx={{
                                            bgcolor: category.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                            color: category.status === 'Active' ? '#10B981' : '#EF4444',
                                            fontSize: '0.75rem',
                                            '& .MuiChip-icon': {
                                                color: category.status === 'Active' ? '#10B981' : '#EF4444',
                                            },
                                        }}
                                    />
                                </TableCell>
                                <TableCell align="right" sx={{ borderBottom: '1px solid #374151' }}>
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Tooltip title="Edit Category">
                                            <IconButton
                                                onClick={() => handleOpenModal(category)}
                                                sx={{
                                                    color: '#3B82F6',
                                                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                                                    '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }
                                                }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={category.status === 'Active' ? 'Deactivate' : 'Activate'}>
                                            <IconButton
                                                onClick={() => handleToggleStatus(category.id)}
                                                sx={{
                                                    color: category.status === 'Active' ? '#F59E0B' : '#10B981',
                                                    bgcolor: category.status === 'Active' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                    '&:hover': {
                                                        bgcolor: category.status === 'Active' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                                                    }
                                                }}
                                            >
                                                {category.status === 'Active' ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={category.coursesCount > 0 ? 'Cannot delete - has courses' : 'Delete Category'}>
                                            <span>
                                                <IconButton
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    disabled={category.coursesCount > 0}
                                                    sx={{
                                                        color: category.coursesCount > 0 ? '#4B5563' : '#EF4444',
                                                        bgcolor: category.coursesCount > 0 ? 'transparent' : 'rgba(239, 68, 68, 0.1)',
                                                        '&:hover': { bgcolor: category.coursesCount > 0 ? 'transparent' : 'rgba(239, 68, 68, 0.2)' },
                                                        '&.Mui-disabled': { color: '#4B5563' }
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Category Modal */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={modalStyle}>
                    {/* Modal Header */}
                    <Box sx={{
                        background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Category sx={{ color: '#fff', fontSize: 28 }} />
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </Typography>
                        </Stack>
                        <IconButton onClick={handleCloseModal} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Modal Body */}
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={2.5}>
                            <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                    Category Name
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="e.g. Political Science"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    sx={textFieldStyle}
                                />
                            </Box>

                            <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB', mb: 0.75 }}>
                                    Description
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Brief description of this category..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    sx={textFieldStyle}
                                />
                            </Box>

                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleSaveCategory}
                                disabled={!formData.name.trim() || saving}
                                sx={{
                                    bgcolor: '#7C3AED',
                                    py: 1.5,
                                    borderRadius: 1.5,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
                                    '&:hover': { bgcolor: '#6D28D9' },
                                    '&:disabled': { bgcolor: '#1F2937', color: '#6B7280', boxShadow: 'none' }
                                }}
                            >
                                {saving ? (
                                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                                ) : (
                                    editingCategory ? 'Update Category' : 'Create Category'
                                )}
                            </Button>
                        </Stack>
                    </Box>
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

export default CategoryManagement;

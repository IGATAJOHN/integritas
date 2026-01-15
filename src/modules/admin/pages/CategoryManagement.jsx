import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { textFieldStyle, modalStyle, searchBarStyle, searchInputStyle } from '../../../styles/formStyles';

// Mock categories data
const categoriesData = [
    { id: 1, name: 'Political Science', description: 'Study of politics and government systems', coursesCount: 12, status: 'Active', createdAt: '2024-01-10' },
    { id: 2, name: 'Economics', description: 'Economic theories and applications', coursesCount: 8, status: 'Active', createdAt: '2024-01-12' },
    { id: 3, name: 'Public Administration', description: 'Management of public programs and institutions', coursesCount: 15, status: 'Active', createdAt: '2024-01-15' },
    { id: 4, name: 'Law & Ethics', description: 'Legal frameworks and ethical governance', coursesCount: 6, status: 'Active', createdAt: '2024-01-20' },
    { id: 5, name: 'Leadership', description: 'Leadership development and management skills', coursesCount: 10, status: 'Active', createdAt: '2024-02-01' },
    { id: 6, name: 'Policy Analysis', description: 'Methods for analyzing public policies', coursesCount: 4, status: 'Inactive', createdAt: '2024-02-10' },
    { id: 7, name: 'International Relations', description: 'Global politics and diplomacy', coursesCount: 7, status: 'Active', createdAt: '2024-02-15' },
];

const CategoryManagement = () => {
    const [categories, setCategories] = useState(categoriesData);
    const [searchTerm, setSearchTerm] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    // Filter categories based on search
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description });
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

    const handleSaveCategory = () => {
        if (formData.name.trim() && formData.description.trim()) {
            if (editingCategory) {
                // Update existing
                setCategories(categories.map(cat =>
                    cat.id === editingCategory.id
                        ? { ...cat, name: formData.name, description: formData.description }
                        : cat
                ));
            } else {
                // Create new
                const newCategory = {
                    id: categories.length + 1,
                    name: formData.name,
                    description: formData.description,
                    coursesCount: 0,
                    status: 'Active',
                    createdAt: new Date().toISOString().split('T')[0],
                };
                setCategories([...categories, newCategory]);
            }
            handleCloseModal();
        }
    };

    const handleToggleStatus = (categoryId) => {
        setCategories(categories.map(cat => {
            if (cat.id === categoryId) {
                return { ...cat, status: cat.status === 'Active' ? 'Inactive' : 'Active' };
            }
            return cat;
        }));
    };

    const handleDeleteCategory = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        if (category.coursesCount > 0) {
            alert('Cannot delete category with existing courses. Please reassign courses first.');
            return;
        }
        setCategories(categories.filter(cat => cat.id !== categoryId));
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
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenModal()}
                    sx={{
                        bgcolor: '#1152D4',
                        '&:hover': { bgcolor: '#0D42AF' },
                        boxShadow: '0 4px 14px rgba(17, 82, 212, 0.4)'
                    }}
                >
                    Add Category
                </Button>
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
                        {filteredCategories.map((category) => (
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
                                disabled={!formData.name.trim() || !formData.description.trim()}
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
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default CategoryManagement;

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
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
    InputBase,
    Tooltip,
} from '@mui/material';
import {
    Search,
    Block,
    CheckCircle,
    Assignment,
    Visibility,
} from '@mui/icons-material';

const ReviewerManagement = () => {
    const [reviewers, setReviewers] = useState([
        { id: 1, name: 'Alex Thompson', email: 'alex@example.com', status: 'Active', assignedTasks: 12 },
        { id: 2, name: 'Maria Garcia', email: 'maria@example.com', status: 'Active', assignedTasks: 8 },
        { id: 3, name: 'David Lee', email: 'david@example.com', status: 'Suspended', assignedTasks: 0 },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredReviewers = reviewers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleStatus = (id) => {
        setReviewers(reviewers.map(reviewer => {
            if (reviewer.id === id) {
                return { ...reviewer, status: reviewer.status === 'Active' ? 'Suspended' : 'Active' };
            }
            return reviewer;
        }));
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            {/* Header Section */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Reviewer Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Manage content reviewers and their access.
                    </Typography>
                </Box>
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
                        placeholder="Search reviewers..."
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

            {/* Reviewers Table */}
            <TableContainer component={Paper} sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Reviewer</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Assigned Tasks</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Status</TableCell>
                            <TableCell align="right" sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredReviewers.map((user) => (
                            <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ color: '#fff', borderBottom: '1px solid #374151' }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#F59E0B', fontSize: '0.9rem' }}>
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
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Assignment sx={{ color: '#F59E0B', fontSize: 18 }} />
                                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                                            {user.assignedTasks}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                            tasks
                                        </Typography>
                                    </Stack>
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
                                <TableCell align="right" sx={{ borderBottom: '1px solid #374151' }}>
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Tooltip title="View Profile">
                                            <IconButton
                                                sx={{
                                                    color: '#3B82F6',
                                                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                                                    '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }
                                                }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={user.status === 'Active' ? 'Suspend Reviewer' : 'Activate Reviewer'}>
                                            <IconButton
                                                onClick={() => handleToggleStatus(user.id)}
                                                sx={{
                                                    color: user.status === 'Active' ? '#EF4444' : '#10B981',
                                                    bgcolor: user.status === 'Active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                    '&:hover': {
                                                        bgcolor: user.status === 'Active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                                                    }
                                                }}
                                            >
                                                {user.status === 'Active' ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ReviewerManagement;


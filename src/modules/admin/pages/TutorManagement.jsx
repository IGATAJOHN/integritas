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
    Visibility,
    Block,
    CheckCircle,
    School,
    People,
    HourglassEmpty,
} from '@mui/icons-material';

const TutorManagement = () => {
    const [tutors, setTutors] = useState([
        { id: 1, name: 'Dr. Sarah Wilson', email: 'sarah@example.com', status: 'Active', courses: 2, students: 45 },
        { id: 2, name: 'Prof. James Miller', email: 'james@example.com', status: 'Pending', courses: 0, students: 0 },
        { id: 3, name: 'Emily Davis', email: 'emily@example.com', status: 'Suspended', courses: 1, students: 12 },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredTutors = tutors.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Active':
                return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', icon: <CheckCircle sx={{ fontSize: 14 }} /> };
            case 'Suspended':
                return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', icon: <Block sx={{ fontSize: 14 }} /> };
            case 'Pending':
                return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', icon: <HourglassEmpty sx={{ fontSize: 14 }} /> };
            default:
                return { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)', icon: null };
        }
    };

    const handleToggleStatus = (id) => {
        setTutors(tutors.map(tutor => {
            if (tutor.id === id) {
                let newStatus = tutor.status;
                if (tutor.status === 'Active') newStatus = 'Suspended';
                else if (tutor.status === 'Suspended') newStatus = 'Active';
                else if (tutor.status === 'Pending') newStatus = 'Active';
                return { ...tutor, status: newStatus };
            }
            return tutor;
        }));
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            {/* Header Section */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Tutor Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Approve and manage course instructors.
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
                        placeholder="Search tutors..."
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

            {/* Tutors Table */}
            <TableContainer component={Paper} sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Tutor</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Courses</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Students</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Status</TableCell>
                            <TableCell align="right" sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTutors.map((user) => {
                            const statusConfig = getStatusConfig(user.status);
                            return (
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
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <School sx={{ color: '#1152D4', fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                                                {user.courses}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <People sx={{ color: '#10B981', fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                                                {user.students}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Chip
                                            icon={statusConfig.icon}
                                            label={user.status}
                                            size="small"
                                            sx={{
                                                bgcolor: statusConfig.bg,
                                                color: statusConfig.color,
                                                fontSize: '0.75rem',
                                                '& .MuiChip-icon': {
                                                    color: statusConfig.color,
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
                                            <Tooltip title={user.status === 'Active' ? 'Suspend Tutor' : user.status === 'Pending' ? 'Approve Tutor' : 'Activate Tutor'}>
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
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TutorManagement;


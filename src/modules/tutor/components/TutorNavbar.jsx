import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    TextField,
    InputAdornment,
    IconButton,
    Avatar,
    Badge,
    useTheme,
    useMediaQuery,
    InputBase,
} from '@mui/material';
import {
    Search,
    NotificationsOutlined,
    SettingsOutlined,
    Menu as MenuIcon,
} from '@mui/icons-material';

const DashboardNavbar = ({
    title = 'Dashboard',
    searchPlaceholder = 'Search...',
    user = { name: 'User', initials: 'U' },
    notificationCount = 0,
    showSearch = true,
    onDrawerToggle = () => { },
    kycStatus = 'approved', // draft, pending, approved, rejected
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [searchQuery, setSearchQuery] = useState('');

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return '#10B981'; // Green
            case 'pending':
            case 'submitted': return '#F59E0B'; // Yellow/Amber
            case 'rejected': return '#EF4444'; // Red
            default: return '#9CA3AF'; // Gray (Draft/None)
        }
    };

    return (
        <Box
            sx={{
                height: 70,
                bgcolor: '#0F1729',
                borderBottom: '1px solid #1F2937',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: { xs: 2, md: 4 },
                overflow: 'hidden',
            }}
        >
            <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 3 }}>
                <IconButton
                    onClick={onDrawerToggle}
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        color: '#FFFFFF',
                        mr: 1,
                    }}
                >
                    <MenuIcon />
                </IconButton>

                <Typography
                    sx={{
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: { xs: '1rem', md: '1.1rem' },
                    }}
                >
                    {title}
                </Typography>
                {showSearch && !isMobile && (
                    <Box sx={{
                        bgcolor: "#1F2937",
                        borderRadius: 1,
                        px: 2,
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        gap: 1,
                        width: '260px',
                        height: '40px'
                    }}>
                        <Search sx={{ color: "#9CA3AF", fontSize: 20 }} />
                        <InputBase
                            placeholder="Search courses"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                color: "#FFFFFF",
                                fontSize: '0.9rem',
                                width: '100%',
                                '& input': {
                                    border: 'none',
                                    outline: 'none',
                                    '&:focus': {
                                        border: 'none',
                                        outline: 'none'
                                    }
                                }
                            }}
                        />
                    </Box>
                )}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
                {/* KYC Status Indicator Pill */}
                {!isMobile && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            px: 1.5,
                            py: 0.75,
                            borderRadius: '50px',
                            border: '1px solid #1F2937',
                            mr: 1
                        }}
                    >
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: getStatusColor(kycStatus),
                                boxShadow: `0 0 8px ${getStatusColor(kycStatus)}`
                            }}
                        />
                        <Typography
                            sx={{
                                color: '#9CA3AF',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                        >
                            {kycStatus === 'submitted' ? 'Pending Verification' : kycStatus}
                        </Typography>
                    </Box>
                )}

                <IconButton
                    sx={{
                        color: '#6B7280',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                    }}
                >
                    <Badge badgeContent={notificationCount} color="error">
                        <NotificationsOutlined sx={{ fontSize: 24 }} />
                    </Badge>
                </IconButton>

                <Avatar
                    src={user.avatar}
                    sx={{
                        width: 40,
                        height: 40,
                        bgcolor: '#1152D4',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        ml: 1
                    }}
                >
                    {user.initials}
                </Avatar>
            </Stack>
        </Box>
    );
};

export default DashboardNavbar;

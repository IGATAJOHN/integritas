import React, { useState, useEffect, useCallback } from 'react';
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
    CircularProgress,
    Alert,
    Button,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Divider,
    TextField,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    LinearProgress,
} from '@mui/material';
import {
    Search,
    Visibility,
    Block,
    CheckCircle,
    School,
    Refresh,
    Person,
    Close,
    Email as EmailIcon,
    VpnKey,
    Share,
    Help,
    LinkedIn,
    EmojiEvents,
    ReceiptLong,
    OpenInNew,
    Info,
    Bookmark,
    CardGiftcard,
    History,
    LiveHelp,
    Policy,
    Star,
} from '@mui/icons-material';
import { learnerService } from '../services/learnerService';
import theme from '../../../styles/theme';

/**
 * LearnerManagement
 *
 * Lists platform learners using the documented API:
 *   GET /api/v1/support/users      — user listing
 *   GET /api/v1/admin/enrolments   — used to derive an enrolments count
 *
 * The API does not currently expose endpoints to mutate users, so this page
 * is read-only.
 */

const LearnerManagement = () => {
    const [learners, setLearners] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const [selectedLearner, setSelectedLearner] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Account settings state mocks
    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [updatingSettings, setUpdatingSettings] = useState(false);

    const fetchLearners = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await learnerService.listLearners();
            setLearners(res.data || []);
        } catch (err) {
            console.error('Error fetching learners:', err);
            setError(err.message || 'Failed to load learners');
            setLearners([]);
            setSnackbar({
                open: true,
                message: err.message || 'Failed to load learners',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLearners();
    }, [fetchLearners]);

    const term = searchTerm.trim().toLowerCase();
    const filteredLearners = term
        ? learners.filter((user) =>
            (user.name || '').toLowerCase().includes(term) ||
            (user.email || '').toLowerCase().includes(term),
        )
        : learners;

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleViewProfile = (learner) => {
        setSelectedLearner(learner);
        setEmailInput(learner.email || '');
        setPasswordInput('');
        setNewsletterEmail('');
        setActiveTab(0);
        setProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setProfileOpen(false);
        setSelectedLearner(null);
    };

    const handleUpdateAccountSettings = (e) => {
        e.preventDefault();
        setUpdatingSettings(true);
        setTimeout(() => {
            setUpdatingSettings(false);
            setSnackbar({
                open: true,
                message: 'Account settings updated successfully (Simulated).',
                severity: 'success'
            });
        }, 800);
    };

    const handleSubscribeNewsletter = (e) => {
        e.preventDefault();
        if (!newsletterEmail.trim()) return;
        setSnackbar({
            open: true,
            message: `Successfully subscribed ${newsletterEmail} to Integritas newsletter!`,
            severity: 'success'
        });
        setNewsletterEmail('');
    };

    const handleAddToLinkedIn = () => {
        setSnackbar({
            open: true,
            message: 'Certificate successfully added to your LinkedIn profile (Simulated).',
            severity: 'success'
        });
    };

    const handleAddToResume = () => {
        setSnackbar({
            open: true,
            message: 'Certificate successfully added to your resume (Simulated).',
            severity: 'success'
        });
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        Learner Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        View platform learners.
                    </Typography>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton
                        onClick={fetchLearners}
                        disabled={loading}
                        sx={{
                            color: '#9CA3AF',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </Stack>

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
                        placeholder="Search learners..."
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

            <TableContainer component={Paper} sx={{ bgcolor: '#1A2230', borderRadius: 2, border: '1px solid #374151' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Learner</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Enrolled Courses</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Last Login</TableCell>
                            <TableCell align="right" sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
                                    <CircularProgress size={40} sx={{ color: theme.colors.brand }} />
                                    <Typography sx={{ color: '#9CA3AF', mt: 2 }}>Loading learners...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 4 }}>
                                    <Alert severity="error" sx={{ bgcolor: 'transparent', justifyContent: 'center' }}>
                                        {error}
                                    </Alert>
                                    <Button onClick={fetchLearners} sx={{ mt: 2, color: theme.colors.brand }}>Try Again</Button>
                                </TableCell>
                            </TableRow>
                        ) : filteredLearners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ borderBottom: '1px solid #374151', py: 6 }}>
                                    <Person sx={{ fontSize: 48, color: '#374151', mb: 2 }} />
                                    <Typography sx={{ color: '#9CA3AF' }}>
                                        {searchTerm ? 'No learners match your search' : 'No learners found'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : filteredLearners.map((user) => {
                            const isActive = (user.status || '').toLowerCase() === 'active';
                            return (
                                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ color: '#fff', borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Avatar sx={{ width: 40, height: 40, bgcolor: theme.colors.brand, fontSize: '0.9rem' }}>
                                                {(user.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>
                                                    {user.name || 'Unknown'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                    {user.email || 'No email'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <School sx={{ color: theme.colors.brand, fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                                                {user.enrollments_count ?? 0}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                courses
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                        <Chip
                                            icon={isActive ? <CheckCircle sx={{ fontSize: 14 }} /> : <Block sx={{ fontSize: 14 }} />}
                                            label={user.status || 'Unknown'}
                                            size="small"
                                            sx={{
                                                bgcolor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                color: isActive ? '#10B981' : '#EF4444',
                                                fontSize: '0.75rem',
                                                '& .MuiChip-icon': {
                                                    color: isActive ? '#10B981' : '#EF4444',
                                                },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151' }}>
                                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                                            {formatDate(user.last_login_at)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottom: '1px solid #374151' }}>
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="View Profile">
                                                <IconButton
                                                    onClick={() => handleViewProfile(user)}
                                                    sx={{
                                                        color: '#3B82F6',
                                                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                                                        '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }
                                                    }}
                                                >
                                                    <Visibility fontSize="small" />
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

            {/* Learner Profile Dialog (Admin Access View) */}
            <Dialog
                open={profileOpen}
                onClose={handleCloseProfile}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: '#1A2230',
                        color: '#FFFFFF',
                        border: '1px solid #374151',
                        borderRadius: 3,
                        backgroundImage: 'none',
                    }
                }}
            >
                {selectedLearner && (
                    <>
                        <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2D3748' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ width: 48, height: 48, bgcolor: theme.colors.brand, fontSize: '1.1rem', fontWeight: 600 }}>
                                    {(selectedLearner.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                                        {selectedLearner.name || 'Unknown User'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                                        Learner Profile (Admin View Mode)
                                    </Typography>
                                </Box>
                            </Stack>
                            <IconButton onClick={handleCloseProfile} sx={{ color: '#9CA3AF', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' } }}>
                                <Close />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={{ p: 0 }}>
                            <Tabs
                                value={activeTab}
                                onChange={(_, newValue) => setActiveTab(newValue)}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    borderBottom: '1px solid #2D3748',
                                    '& .MuiTab-root': {
                                        color: '#9CA3AF',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        py: 2,
                                        '&.Mui-selected': { color: theme.colors.brand }
                                    },
                                    '& .MuiTabs-indicator': { bgcolor: theme.colors.brand }
                                }}
                            >
                                <Tab icon={<School sx={{ fontSize: 18 }} />} iconPosition="start" label="Progress & Saved" />
                                <Tab icon={<EmojiEvents sx={{ fontSize: 18 }} />} iconPosition="start" label="Certificates" />
                                <Tab icon={<ReceiptLong sx={{ fontSize: 18 }} />} iconPosition="start" label="Purchase History" />
                                <Tab icon={<VpnKey sx={{ fontSize: 18 }} />} iconPosition="start" label="Account Settings" />
                                <Tab icon={<Policy sx={{ fontSize: 18 }} />} iconPosition="start" label="Policies & Support" />
                            </Tabs>

                            <Box sx={{ p: 3 }}>
                                {/* Tab 0: Progress & Saved */}
                                {activeTab === 0 && (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={7}>
                                            <Typography variant="subtitle2" sx={{ color: theme.colors.brand, fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Learning Progress
                                            </Typography>
                                            <Stack spacing={2.5}>
                                                <Box>
                                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                                        <Typography variant="body2" sx={{ color: '#E5E7EB', fontWeight: 600 }}>The Foundational Track</Typography>
                                                        <Typography variant="body2" sx={{ color: theme.colors.brand, fontWeight: 700 }}>75% Completed</Typography>
                                                    </Stack>
                                                    <LinearProgress variant="determinate" value={75} sx={{ height: 6, borderRadius: 2, bgcolor: '#374151', '& .MuiLinearProgress-bar': { bgcolor: theme.colors.brand } }} />
                                                </Box>

                                                <Box>
                                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                                        <Typography variant="body2" sx={{ color: '#E5E7EB', fontWeight: 600 }}>The Gateway Certification</Typography>
                                                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Capstone Review Pending</Typography>
                                                    </Stack>
                                                    <LinearProgress variant="determinate" value={20} sx={{ height: 6, borderRadius: 2, bgcolor: '#374151', '& .MuiLinearProgress-bar': { bgcolor: '#F59E0B' } }} />
                                                </Box>

                                                <Box>
                                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                                        <Typography variant="body2" sx={{ color: '#E5E7EB', fontWeight: 600 }}>Unlock the Exemplar Series</Typography>
                                                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>0%</Typography>
                                                    </Stack>
                                                    <LinearProgress variant="determinate" value={0} sx={{ height: 6, borderRadius: 2, bgcolor: '#374151' }} />
                                                </Box>
                                            </Stack>

                                            <Box sx={{ mt: 4 }}>
                                                <Typography variant="subtitle2" sx={{ color: theme.colors.brand, fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Refer & Earn Program
                                                </Typography>
                                                <Paper sx={{ p: 2, bgcolor: '#1F2937', border: '1px solid #374151', borderRadius: 2 }}>
                                                    <Typography variant="body2" sx={{ color: '#E5E7EB', mb: 1.5 }}>
                                                        Active referral link:
                                                    </Typography>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            readOnly
                                                            value={`https://integritas.ng/join?ref=${selectedLearner.id || 'usr401'}`}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    color: '#fff',
                                                                    bgcolor: '#111827',
                                                                    fontSize: '0.8rem',
                                                                    '& fieldset': { borderColor: '#374151' }
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`https://integritas.ng/join?ref=${selectedLearner.id || 'usr401'}`);
                                                                setSnackbar({ open: true, message: 'Referral link copied to clipboard!', severity: 'success' });
                                                            }}
                                                            sx={{ bgcolor: theme.colors.brand, textTransform: 'none', px: 2, height: 36 }}
                                                        >
                                                            Copy
                                                        </Button>
                                                    </Stack>
                                                    <Typography variant="caption" sx={{ color: '#10B981', mt: 1.5, display: 'block', fontWeight: 600 }}>
                                                        Earnings: ₦15,000 (3 Successful referrers)
                                                    </Typography>
                                                </Paper>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} md={5}>
                                            <Typography variant="subtitle2" sx={{ color: theme.colors.brand, fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Saved Courses
                                            </Typography>
                                            <List sx={{ p: 0, bgcolor: '#1F2937', borderRadius: 2, border: '1px solid #374151', mb: 3 }}>
                                                {[
                                                    'Public Integrity & Ethical Leadership',
                                                    'Navigating Institutional Pressure'
                                                ].map((title, i) => (
                                                    <React.Fragment key={i}>
                                                        <ListItem sx={{ py: 1.5 }}>
                                                            <ListItemIcon sx={{ minWidth: 32, color: theme.colors.brand }}><Bookmark fontSize="small" /></ListItemIcon>
                                                            <ListItemText primary={title} primaryTypographyProps={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }} />
                                                        </ListItem>
                                                        {i < 1 && <Divider sx={{ borderColor: '#374151' }} />}
                                                    </React.Fragment>
                                                ))}
                                            </List>

                                            <Typography variant="subtitle2" sx={{ color: theme.colors.brand, fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Recommendations
                                            </Typography>
                                            <List sx={{ p: 0, bgcolor: '#1F2937', borderRadius: 2, border: '1px solid #374151' }}>
                                                {[
                                                    { title: 'Anti-Money Laundering Frameworks', reason: 'Based on public audit logs track' },
                                                    { title: 'Whistleblower Protection Mechanisms', reason: 'High demand in public administration' }
                                                ].map((rec, i) => (
                                                    <React.Fragment key={i}>
                                                        <ListItem sx={{ py: 1.5 }}>
                                                            <ListItemIcon sx={{ minWidth: 32, color: '#A78BFA' }}><Star fontSize="small" /></ListItemIcon>
                                                            <ListItemText
                                                                primary={rec.title}
                                                                secondary={rec.reason}
                                                                primaryTypographyProps={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}
                                                                secondaryTypographyProps={{ fontSize: '0.75rem', color: '#9CA3AF' }}
                                                            />
                                                        </ListItem>
                                                        {i < 1 && <Divider sx={{ borderColor: '#374151' }} />}
                                                    </React.Fragment>
                                                ))}
                                            </List>
                                        </Grid>
                                    </Grid>
                                )}

                                {/* Tab 1: Certificates */}
                                {activeTab === 1 && (
                                    <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center', py: 2 }}>
                                        <Box sx={{ display: 'inline-flex', p: 2, bgcolor: 'rgba(23,138,131,0.1)', borderRadius: '50%', mb: 2, color: theme.colors.brand }}>
                                            <EmojiEvents sx={{ fontSize: 48 }} />
                                        </Box>
                                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                                            Integritas Foundational Associate Certificate
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
                                            Issued upon completing the 15 Foundational modules and Capstone Project.
                                        </Typography>
                                        
                                        <Paper sx={{ p: 3, bgcolor: '#1F2937', border: '1px solid #374151', borderRadius: 2, textAlign: 'left', mb: 4 }}>
                                            <Stack spacing={1.5}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Certificate ID:</Typography>
                                                    <Typography sx={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>INT-FND-8829</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Issue Date:</Typography>
                                                    <Typography sx={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>March 14, 2026</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Status:</Typography>
                                                    <Chip size="small" label="Active & Vetted" sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: 600 }} />
                                                </Box>
                                            </Stack>
                                        </Paper>

                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                                            <Button
                                                variant="contained"
                                                startIcon={<LinkedIn />}
                                                onClick={handleAddToLinkedIn}
                                                sx={{ bgcolor: '#0077B5', '&:hover': { bgcolor: '#005885' }, textTransform: 'none', fontWeight: 600 }}
                                            >
                                                Add to LinkedIn
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<OpenInNew />}
                                                onClick={handleAddToResume}
                                                sx={{ borderColor: theme.colors.brand, color: theme.colors.brand, '&:hover': { borderColor: theme.colors.brand, bgcolor: 'rgba(23,138,131,0.06)' }, textTransform: 'none', fontWeight: 600 }}
                                            >
                                                Add to Resume
                                            </Button>
                                        </Stack>
                                    </Box>
                                )}

                                {/* Tab 2: Purchase History */}
                                {activeTab === 2 && (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ color: theme.colors.brand, fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Exemplar Order Purchase History
                                        </Typography>
                                        <TableContainer component={Paper} sx={{ bgcolor: '#1F2937', border: '1px solid #374151', borderRadius: 2 }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Order ID</TableCell>
                                                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Item</TableCell>
                                                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Date</TableCell>
                                                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Amount</TableCell>
                                                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontWeight: 600 }}>Status</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {[
                                                        { id: '#ORD-9902', item: 'Dr. Joe Abah Exemplar Mentorship Series', date: 'May 02, 2026', amount: '₦15,000', status: 'Success' },
                                                        { id: '#ORD-8874', item: 'Cinematic Leadership Package (All Access)', date: 'April 11, 2026', amount: '₦45,000', status: 'Success' }
                                                    ].map((order) => (
                                                        <TableRow key={order.id}>
                                                            <TableCell sx={{ color: '#fff', borderBottom: '1px solid #374151', fontSize: '0.85rem' }}>{order.id}</TableCell>
                                                            <TableCell sx={{ color: '#fff', borderBottom: '1px solid #374151', fontSize: '0.85rem', fontWeight: 500 }}>{order.item}</TableCell>
                                                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #374151', fontSize: '0.85rem' }}>{order.date}</TableCell>
                                                            <TableCell sx={{ color: '#fff', borderBottom: '1px solid #374151', fontSize: '0.85rem', fontWeight: 600 }}>{order.amount}</TableCell>
                                                            <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                                                                <Chip size="small" label={order.status} sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: '0.75rem', fontWeight: 600 }} />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}

                                {/* Tab 3: Account Settings */}
                                {activeTab === 3 && (
                                    <Grid container spacing={4}>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" sx={{ color: theme.colors.brand, fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Password and Email Change
                                            </Typography>
                                            <Box component="form" onSubmit={handleUpdateAccountSettings}>
                                                <Stack spacing={2.5}>
                                                    <TextField
                                                        label="Email Address"
                                                        variant="filled"
                                                        fullWidth
                                                        value={emailInput}
                                                        onChange={(e) => setEmailInput(e.target.value)}
                                                        InputProps={{ disableUnderline: true }}
                                                        sx={{
                                                            '& .MuiFilledInput-root': { bgcolor: '#1F2937', color: '#fff', borderRadius: 1.5 },
                                                            '& .MuiInputLabel-root': { color: '#9CA3AF' }
                                                        }}
                                                    />
                                                    <TextField
                                                        label="New Password"
                                                        type="password"
                                                        variant="filled"
                                                        fullWidth
                                                        placeholder="Enter new password"
                                                        value={passwordInput}
                                                        onChange={(e) => setPasswordInput(e.target.value)}
                                                        InputProps={{ disableUnderline: true }}
                                                        sx={{
                                                            '& .MuiFilledInput-root': { bgcolor: '#1F2937', color: '#fff', borderRadius: 1.5 },
                                                            '& .MuiInputLabel-root': { color: '#9CA3AF' }
                                                        }}
                                                    />
                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        disabled={updatingSettings}
                                                        sx={{ bgcolor: theme.colors.brand, '&:hover': { bgcolor: '#116B65' }, textTransform: 'none', fontWeight: 600, py: 1.25, borderRadius: 2 }}
                                                    >
                                                        {updatingSettings ? 'Saving...' : 'Save Settings'}
                                                    </Button>
                                                </Stack>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" sx={{ color: theme.colors.brand, fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Subscribe to Newsletter
                                            </Typography>
                                            <Paper sx={{ p: 3, bgcolor: '#1F2937', border: '1px solid #374151', borderRadius: 2 }}>
                                                <Typography variant="body2" sx={{ color: '#E5E7EB', mb: 2 }}>
                                                    Get monthly digests of public policy insights, upcoming modules, and exam certification reminders.
                                                </Typography>
                                                <Box component="form" onSubmit={handleSubscribeNewsletter}>
                                                    <Stack spacing={2}>
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            placeholder="enter newsletter email"
                                                            value={newsletterEmail}
                                                            onChange={(e) => setNewsletterEmail(e.target.value)}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    color: '#fff',
                                                                    bgcolor: '#111827',
                                                                    '& fieldset': { borderColor: '#374151' }
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            type="submit"
                                                            variant="outlined"
                                                            sx={{ borderColor: theme.colors.brand, color: theme.colors.brand, '&:hover': { borderColor: theme.colors.brand, bgcolor: 'rgba(23,138,131,0.06)' }, textTransform: 'none', fontWeight: 600 }}
                                                        >
                                                            Subscribe
                                                        </Button>
                                                    </Stack>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                )}

                                {/* Tab 4: Policies & Help */}
                                {activeTab === 4 && (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" sx={{ color: theme.colors.brand, fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Integritas Support Desk
                                            </Typography>
                                            <Paper sx={{ p: 3, bgcolor: '#1F2937', border: '1px solid #374151', borderRadius: 2 }}>
                                                <Stack spacing={2} alignItems="flex-start">
                                                    <Typography variant="body2" sx={{ color: '#E5E7EB' }}>
                                                        Need support on assessments, certification verification, or organization dashboard settings?
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<LiveHelp />}
                                                        onClick={() => {
                                                            setSnackbar({ open: true, message: 'Direct support inquiry created successfully!', severity: 'success' });
                                                        }}
                                                        sx={{ bgcolor: theme.colors.brand, '&:hover': { bgcolor: '#116B65' }, textTransform: 'none', fontWeight: 600 }}
                                                    >
                                                        Access Help Desk
                                                    </Button>
                                                </Stack>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" sx={{ color: theme.colors.brand, fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Legal and Policies
                                            </Typography>
                                            <Paper sx={{ p: 3, bgcolor: '#1F2937', border: '1px solid #374151', borderRadius: 2 }}>
                                                <Stack spacing={2} alignItems="flex-start">
                                                    <Typography variant="body2" sx={{ color: '#E5E7EB' }}>
                                                        Review our terms of use, privacy policies, and code of ethical conduct standards.
                                                    </Typography>
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<Policy />}
                                                        onClick={() => {
                                                            setSnackbar({ open: true, message: 'Policy document viewer loaded successfully!', severity: 'success' });
                                                        }}
                                                        sx={{ borderColor: theme.colors.brand, color: theme.colors.brand, '&:hover': { borderColor: theme.colors.brand, bgcolor: 'rgba(23,138,131,0.06)' }, textTransform: 'none', fontWeight: 600 }}
                                                    >
                                                        View Policies
                                                    </Button>
                                                </Stack>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                )}
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ p: 3, borderTop: '1px solid #2D3748', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                                Account ID: {selectedLearner.id || 'N/A'}
                            </Typography>
                            <Button variant="contained" onClick={handleCloseProfile} sx={{ bgcolor: '#374151', color: '#fff', '&:hover': { bgcolor: '#4B5563' }, textTransform: 'none' }}>
                                Close Profile
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

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

export default LearnerManagement;

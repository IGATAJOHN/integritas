import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Divider,
    Button,
    TextField,
    Chip,
    Stack,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    InputBase,
    Tooltip,
    Alert,
} from '@mui/material';
import {
    VisibilityOutlined as ViewIcon,
    DownloadOutlined as DownloadIcon,
    ArrowBack as BackIcon,
    CheckCircleOutline as ApprovedIcon,
    HighlightOff as RejectedIcon,
    DescriptionOutlined as DocIcon,
    Search,
    HourglassEmpty,
    PhoneOutlined as PhoneIcon,
    PublicOutlined as WorldIcon,
    LocationOnOutlined as LocationIcon,
    HomeOutlined as AddressIcon,
    HistoryEduOutlined as EducationIcon,
    EmailOutlined as EmailIcon,
    InfoOutlined as InfoIcon,
    BadgeOutlined as NameIcon,
} from '@mui/icons-material';
import { adminListKyc, adminGetKycById, adminApproveKyc, adminRejectKyc } from "../services/kyc";


const KycReview = () => {
    const navigate = useNavigate();

    const [view, setView] = useState('list');
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    const ui = {
        pageBg: '#0B1220',
        cardBg: '#111A2C',
        cardBg2: 'rgba(255,255,255,0.02)',
        border: 'rgba(148, 163, 184, 0.14)',
        borderStrong: 'rgba(148, 163, 184, 0.22)',
        text: '#E5E7EB',
        muted: '#94A3B8',
        dim: '#64748B',
        primary: '#3B82F6',
    };

    const [submissions, setSubmissions] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const filteredSubmissions = submissions;

    useEffect(() => {
    const fetchList = async () => {
        try {
        setLoadingList(true);
        setError("");

        const res = await adminListKyc({
            q: searchTerm,
            page,
        });

        setSubmissions(res?.data || []);
        } catch (e) {
        console.error(e);
        setError("Failed to load KYC submissions.");
        setSubmissions([]);
        } finally {
        setLoadingList(false);
        }
    };

    fetchList();
    }, [searchTerm, page]);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'approved':
                return {
                    color: '#10B981',
                    bg: 'rgba(16, 185, 129, 0.14)',
                    icon: <ApprovedIcon sx={{ fontSize: 16 }} />,
                };
            case 'rejected':
                return {
                    color: '#EF4444',
                    bg: 'rgba(239, 68, 68, 0.14)',
                    icon: <RejectedIcon sx={{ fontSize: 16 }} />,
                };
            case 'submitted':
                return {
                    color: '#F59E0B',
                    bg: 'rgba(245, 158, 11, 0.14)',
                    icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
                };
            default:
                return { color: ui.muted, bg: 'rgba(148,163,184,0.10)', icon: null };
        }
    };

    const handleViewDetail = async (row) => {
        try {
            setError("");
            setLoading(true);

            const detail = await adminGetKycById(row.id);

            setSelectedTutor({
                id: detail.id,
                status: detail.status,
                submitted_at: detail.submitted_at,
                reviewed_at: detail.reviewed_at,
                review_note: detail.review_note || "",
                user: detail.user,
                data: detail.data,
                documents: detail.documents || [],
            });

            setView("detail");
        } catch (e) {
            console.error(e);
            setError("Failed to load KYC details.");
        } finally {
            setLoading(false);
        }
    };


    const handleBackToList = () => {
        setView('list');
        setSelectedTutor(null);
        setError('');
    };

    const handleAction = async (newStatus) => {
        try {
            setError("");
            setLoading(true);

            if (newStatus === "rejected" && !selectedTutor.review_note?.trim()) {
            setError("Please provide a review note for rejection.");
            return;
            }

            if (newStatus === "approved") {
            await adminApproveKyc(selectedTutor.id, selectedTutor.review_note || "Approved.");
            } else {
            await adminRejectKyc(selectedTutor.id, selectedTutor.review_note);
            }

            const refreshed = await adminGetKycById(selectedTutor.id);
            setSelectedTutor({
                id: refreshed.id,
                status: refreshed.status,
                submitted_at: refreshed.submitted_at,
                reviewed_at: refreshed.reviewed_at,
                review_note: refreshed.review_note || "",
                user: refreshed.user,
                data: refreshed.data,
                documents: refreshed.documents || [],
            });

            const res = await adminListKyc({ q: searchTerm, page });
            setSubmissions(res?.data || []);
        } catch (e) {
            console.error(e);
            setError("Action failed. Check token/permissions and KYC status.");
        } finally {
            setLoading(false);
        }
    };


    if (view === 'detail' && selectedTutor) {
        const isSubmitted = selectedTutor.status === 'submitted';
        const isApproved = selectedTutor.status === 'approved';
        const status = getStatusConfig(selectedTutor.status);
        const kycUser = selectedTutor.user || {};
        const kycData = selectedTutor.data || {};

        return (
            <Box
                sx={{
                    p: { xs: 2, md: 4 },
                    bgcolor: ui.pageBg,
                    minHeight: 'calc(100vh - 70px)',
                    width: '100%',
                    boxSizing: 'border-box',
                }}
            >
                <Grid container spacing={3}>
                    {/* Header Item */}
                    <Grid size={{ xs: 12 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <IconButton
                                onClick={handleBackToList}
                                sx={{
                                    color: ui.text,
                                    bgcolor: 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${ui.border}`,
                                    borderRadius: 2,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
                                }}
                            >
                                <BackIcon />
                            </IconButton>

                            <Box sx={{ flex: 1 }}>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                    spacing={1.5}
                                >
                                    <Typography variant="h5" sx={{ color: ui.text, fontWeight: 800 }}>
                                        KYC Review
                                    </Typography>

                                    <Chip
                                        label={selectedTutor.status.toUpperCase()}
                                        icon={status.icon}
                                        sx={{
                                            bgcolor: status.bg,
                                            color: status.color,
                                            fontWeight: 800,
                                            fontSize: '0.75rem',
                                            height: 28,
                                            border: `1px solid ${ui.border}`,
                                            '& .MuiChip-icon': { color: 'inherit' },
                                        }}
                                    />
                                </Stack>

                                <Typography variant="caption" sx={{ color: ui.muted, fontWeight: 500 }}>
                                    Integritas • Tutor Verification • Submitted on {selectedTutor.submitted_at}
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Top Section: Comprehensive Information Card */}
                    <Grid size={{ xs: 12 }}>
                        <Paper
                            sx={{
                                p: { xs: 3, md: 4 },
                                bgcolor: ui.cardBg,
                                border: `1px solid ${ui.border}`,
                                borderRadius: 4,
                                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '2px',
                                    background: `linear-gradient(90deg, ${ui.primary}, transparent)`,
                                }
                            }}
                        >
                            {/* Identity (NO avatar) */}
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 2,
                                        bgcolor: 'rgba(59,130,246,0.12)',
                                        border: '1px solid rgba(59,130,246,0.35)',
                                        display: 'grid',
                                        placeItems: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <NameIcon sx={{ color: ui.primary }} />
                                </Box>

                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{ color: ui.text, fontWeight: 900, lineHeight: 1.2 }}
                                        noWrap
                                    >
                                        {kycUser.name || '—'}
                                    </Typography>

                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                        <EmailIcon sx={{ color: ui.dim, fontSize: 16 }} />
                                        <Typography variant="body2" sx={{ color: ui.muted }} noWrap>
                                            {kycUser.email || '—'}
                                        </Typography>

                                        {selectedTutor.reviewed_at && (
                                            <Chip
                                                size="small"
                                                label={`Reviewed: ${selectedTutor.reviewed_at}`}
                                                sx={{
                                                    ml: 1,
                                                    bgcolor: 'rgba(16,185,129,0.10)',
                                                    color: '#10B981',
                                                    border: `1px solid ${ui.border}`,
                                                    fontWeight: 700,
                                                    height: 24,
                                                }}
                                            />
                                        )}
                                    </Stack>
                                </Box>
                            </Stack>

                            <Divider sx={{ borderColor: ui.border, mb: 2.5 }} />

                            <Typography
                                variant="subtitle2"
                                sx={{
                                    color: ui.text,
                                    mb: 2,
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.9,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <InfoIcon sx={{ color: ui.primary, fontSize: 18 }} /> KYC Information
                            </Typography>

                            <Grid container spacing={2}>
                                {[
                                    { label: 'Phone Number', value: kycData.phone, icon: <PhoneIcon /> },
                                    { label: 'Country', value: kycData.country, icon: <WorldIcon /> },
                                    { label: 'State / Province', value: kycData.state, icon: <LocationIcon /> },
                                    { label: 'City', value: kycData.city, icon: <LocationIcon /> },
                                    { label: 'Residential Address', value: kycData.address, icon: <AddressIcon />, fullWidth: true },
                                    { label: 'Highest Education', value: kycData.highest_education, icon: <EducationIcon />, fullWidth: true },
                                ].map((item, idx) => (
                                    <Grid size={{ xs: 12, sm: item.fullWidth ? 12 : 6 }} key={idx}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                bgcolor: ui.cardBg2,
                                                borderRadius: 2,
                                                border: `1px solid ${ui.border}`,
                                            }}
                                        >
                                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                <Box sx={{ color: ui.primary, mt: 0.4 }}>{item.icon}</Box>
                                                <Box>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: ui.dim,
                                                            fontWeight: 800,
                                                            textTransform: 'uppercase',
                                                            fontSize: '0.65rem',
                                                            display: 'block',
                                                            mb: 0.4,
                                                            letterSpacing: 0.7,
                                                        }}
                                                    >
                                                        {item.label}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: ui.text, fontWeight: 600 }}>
                                                        {item.value}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    </Grid>
                                ))}

                                <Grid size={{ xs: 12 }}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: ui.cardBg2,
                                            borderRadius: 2,
                                            border: `1px solid ${ui.border}`,
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: ui.dim,
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                fontSize: '0.65rem',
                                                display: 'block',
                                                mb: 1,
                                                letterSpacing: 0.7,
                                            }}
                                        >
                                            Skills & Expertise
                                        </Typography>

                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                                            {(kycData.skills || []).map((skill) => (
                                                <Chip
                                                    key={skill}
                                                    label={skill}
                                                    size="small"
                                                    sx={{
                                                        color: ui.text,
                                                        bgcolor: 'rgba(59,130,246,0.10)',
                                                        border: '1px solid rgba(59,130,246,0.25)',
                                                        fontWeight: 700,
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            bgcolor: ui.cardBg2,
                                            borderRadius: 2,
                                            border: `1px solid ${ui.border}`,
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: ui.dim,
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                fontSize: '0.65rem',
                                                display: 'block',
                                                mb: 1,
                                                letterSpacing: 0.7,
                                            }}
                                        >
                                            Professional Bio
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: ui.muted, lineHeight: 1.8 }}>
                                            {kycData.bio}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Bottom Section: Side-by-Side Action Cards */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        {/* Review Status Card */}
                        <Paper
                            sx={{
                                p: 4,
                                bgcolor: ui.cardBg,
                                border: `1px solid ${ui.border}`,
                                borderRadius: 4,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography variant="h6" sx={{ color: ui.text, mb: 2, fontWeight: 900 }}>
                                Review Decision
                            </Typography>

                            {isSubmitted ? (
                                <Stack spacing={2.5}>
                                    <TextField
                                        label="Internal Review Note"
                                        multiline
                                        rows={5}
                                        placeholder="Provide detail on why this submission is approved or rejected..."
                                        value={selectedTutor.review_note}
                                        onChange={(e) =>
                                            setSelectedTutor((prev) => ({ ...prev, review_note: e.target.value }))
                                        }
                                        fullWidth
                                        error={!!error}
                                        helperText={error}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                color: ui.text,
                                                bgcolor: 'rgba(255,255,255,0.02)',
                                                '& fieldset': { borderColor: ui.borderStrong, borderRadius: 2 },
                                                '&:hover fieldset': { borderColor: 'rgba(148,163,184,0.35)' },
                                                '&.Mui-focused fieldset': { borderColor: ui.primary },
                                            },
                                            '& .MuiInputLabel-root': { color: ui.muted },
                                            '& .MuiFormHelperText-root': { color: '#FCA5A5' },
                                        }}
                                    />

                                    <Stack direction="column" spacing={1.5}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            startIcon={<ApprovedIcon />}
                                            sx={{
                                                bgcolor: '#10B981',
                                                py: 1.3,
                                                fontWeight: 900,
                                                borderRadius: 2,
                                                '&:hover': { bgcolor: '#059669' },
                                            }}
                                            onClick={() => handleAction('approved')}
                                        >
                                            Approve
                                        </Button>

                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            size="large"
                                            startIcon={<RejectedIcon />}
                                            sx={{
                                                color: '#EF4444',
                                                borderColor: 'rgba(239,68,68,0.65)',
                                                py: 1.3,
                                                fontWeight: 900,
                                                borderRadius: 2,
                                                '&:hover': {
                                                    bgcolor: 'rgba(239,68,68,0.06)',
                                                    borderColor: 'rgba(239,68,68,0.9)',
                                                },
                                            }}
                                            onClick={() => handleAction('rejected')}
                                        >
                                            Reject
                                        </Button>
                                    </Stack>
                                </Stack>
                            ) : (
                                <Stack spacing={2.5}>
                                    <Alert
                                        severity={isApproved ? 'success' : 'error'}
                                        variant="filled"
                                        sx={{
                                            borderRadius: 2,
                                            fontWeight: 800,
                                            bgcolor: isApproved ? '#10B981' : '#EF4444',
                                        }}
                                    >
                                        {isApproved ? 'Verification Successful' : 'Verification Rejected'}
                                    </Alert>

                                    <Box
                                        sx={{
                                            p: 2.5,
                                            bgcolor: ui.cardBg2,
                                            borderRadius: 2,
                                            border: `1px solid ${ui.border}`,
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: ui.muted,
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                fontSize: '0.65rem',
                                                display: 'block',
                                                mb: 1,
                                                letterSpacing: 0.7,
                                            }}
                                        >
                                            Decision Rationale
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: ui.text, fontStyle: selectedTutor.review_note ? 'normal' : 'italic' }}
                                        >
                                            {selectedTutor.review_note || 'No rationale provided.'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            )}
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 6 }}>
                        {/* Documents Card */}
                        <Paper
                            sx={{
                                p: 4,
                                bgcolor: ui.cardBg,
                                border: `1px solid ${ui.border}`,
                                borderRadius: 4,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography variant="h6" sx={{ color: ui.text, mb: 3, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Supporting Documents
                            </Typography>

                            <Stack spacing={2} sx={{ flex: 1 }}>
                                {selectedTutor.documents.map((doc) => (
                                    <Box
                                        key={doc.id}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 3,
                                            border: `1px solid ${ui.border}`,
                                            bgcolor: ui.cardBg2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 2,
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                borderColor: ui.primary,
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 4px 12px ${ui.primary}20`
                                            }
                                        }}
                                    >
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                                            <Box
                                                sx={{
                                                    p: 1.2,
                                                    bgcolor: 'rgba(59,130,246,0.12)',
                                                    border: '1px solid rgba(59,130,246,0.22)',
                                                    borderRadius: 2,
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <DocIcon sx={{ color: ui.primary, fontSize: 24 }} />
                                            </Box>

                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: ui.text, fontWeight: 800, mb: 0.5 }}
                                                    noWrap
                                                >
                                                    {doc.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: ui.dim, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                                                    {doc.type}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                                            <Tooltip title="View Document">
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        color: ui.primary,
                                                        bgcolor: 'rgba(59,130,246,0.06)',
                                                        '&:hover': { bgcolor: 'rgba(59,130,246,0.15)' },
                                                    }}
                                                    onClick={() => console.log('VIEW', doc)}
                                                >
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Download">
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        color: ui.primary,
                                                        bgcolor: 'rgba(59,130,246,0.06)',
                                                        '&:hover': { bgcolor: 'rgba(59,130,246,0.15)' },
                                                    }}
                                                    onClick={() => console.log('DOWNLOAD', doc)}
                                                >
                                                    <DownloadIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // --- List View Render ---
    return (
        <Box
            sx={{
                p: { xs: 2, md: 4 },
                bgcolor: ui.pageBg,
                minHeight: 'calc(100vh - 70px)',
                width: '100%',
                boxSizing: 'border-box',
            }}
        >
            {/* Title row */}
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Box>
                    <Typography variant="h4" sx={{ color: ui.text, fontWeight: 900, mb: 0.5 }}>
                        KYC Review
                    </Typography>
                    <Typography variant="body2" sx={{ color: ui.muted }}>
                        Integritas • Review and manage tutor verification submissions.
                    </Typography>
                </Box>

                {/* Stats chips */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                    <Chip
                        label={`Total: ${submissions.length}`}
                        sx={{
                        bgcolor: 'rgba(245,158,11,0.12)',
                        color: '#F59E0B',
                        border: `1px solid ${ui.border}`,
                        fontWeight: 900,
                        }}
                    />
                </Stack>
            </Stack>

            {/* Toolbar */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: ui.cardBg,
                    borderRadius: 3,
                    border: `1px solid ${ui.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        bgcolor: "#1F2937",
                        borderRadius: 1,
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        width: '100%',
                        maxWidth: 400,
                        height: '40px'
                    }}
                >
                    <Search sx={{ color: "#9CA3AF", fontSize: 20 }} />
                    <InputBase
                        placeholder="Search by name, email, or status..."
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

                {/* Optional: Add a status filter dropdown later */}
                {/* <Stack direction="row" spacing={2}></Stack> */}
            </Paper>

            {/* Table */}
            <TableContainer
                component={Paper}
                sx={{
                    bgcolor: ui.cardBg,
                    borderRadius: 3,
                    border: `1px solid ${ui.border}`,
                    overflow: 'hidden',
                }}
            >
                {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                )}

                {loadingList && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Loading submissions...
                </Alert>
                )}

                <Table>
                    <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                        <TableRow>
                            <TableCell
                                sx={{
                                    color: ui.muted,
                                    borderBottom: `1px solid ${ui.border}`,
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    letterSpacing: 0.9,
                                    py: 2,
                                }}
                            >
                            KYC ID
                            </TableCell>

                            <TableCell
                                sx={{
                                    color: ui.muted,
                                    borderBottom: `1px solid ${ui.border}`,
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    letterSpacing: 0.9,
                                    py: 2,
                                }}
                            >
                            Role
                            </TableCell>

                            <TableCell
                                sx={{
                                    color: ui.muted,
                                    borderBottom: `1px solid ${ui.border}`,
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    letterSpacing: 0.9,
                                    py: 2,
                                }}
                            >
                            Status
                            </TableCell>

                            <TableCell
                                align="right"
                                sx={{
                                    color: ui.muted,
                                    borderBottom: `1px solid ${ui.border}`,
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    letterSpacing: 0.9,
                                    py: 2,
                                }}
                            >
                            Action
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredSubmissions.map((s) => {
                            const st = getStatusConfig(s.status);
                            return (
                                <TableRow
                                    key={s.id}
                                    hover
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                                        transition: 'background-color 0.2s',
                                    }}
                                    >
                                    {/* KYC ID */}
                                    <TableCell sx={{ borderBottom: `1px solid ${ui.border}`, py: 1.6 }}>
                                        <Stack spacing={0.2}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: ui.text }}>
                                            {String(s.id).slice(0, 8)}...
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: ui.muted }}>
                                            {s.id}
                                        </Typography>
                                        </Stack>
                                    </TableCell>

                                    {/* Role */}
                                    <TableCell sx={{ borderBottom: `1px solid ${ui.border}`, py: 1.6 }}>
                                        <Chip
                                        size="small"
                                        label={(s.role || '—').toUpperCase()}
                                        sx={{
                                            bgcolor: 'rgba(59,130,246,0.10)',
                                            color: ui.text,
                                            border: `1px solid ${ui.border}`,
                                            fontWeight: 900,
                                            height: 26,
                                        }}
                                        />
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell sx={{ borderBottom: `1px solid ${ui.border}`, py: 1.6 }}>
                                        <Chip
                                        icon={st.icon}
                                        label={(s.status || '—').toUpperCase()}
                                        size="small"
                                        sx={{
                                            bgcolor: st.bg,
                                            color: st.color,
                                            fontWeight: 900,
                                            fontSize: '0.7rem',
                                            height: 26,
                                            border: `1px solid ${ui.border}`,
                                            '& .MuiChip-icon': { color: 'inherit' },
                                        }}
                                        />
                                    </TableCell>

                                    {/* Action */}
                                    <TableCell align="right" sx={{ borderBottom: `1px solid ${ui.border}`, py: 1.6 }}>
                                        <Tooltip title="Review">
                                        <IconButton
                                            onClick={() => handleViewDetail(s)}
                                            sx={{
                                            color: ui.primary,
                                            bgcolor: 'rgba(59,130,246,0.10)',
                                            border: '1px solid rgba(59,130,246,0.18)',
                                            borderRadius: 2,
                                            '&:hover': { bgcolor: 'rgba(59,130,246,0.18)' },
                                            }}
                                        >
                                            <ViewIcon fontSize="small" />
                                        </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                {filteredSubmissions.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography sx={{ color: ui.muted, fontWeight: 700 }}>
                            No submissions found.
                        </Typography>
                    </Box>
                )}
            </TableContainer>
        </Box>
    );
};

export default KycReview;

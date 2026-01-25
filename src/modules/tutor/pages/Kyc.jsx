import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    TextField,
    MenuItem,
    Paper,
    Select,
    Chip,
    Stack,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Alert,
    useTheme,
    useMediaQuery,
    Divider,
} from '@mui/material';
import {
    CloudUploadOutlined,
    DeleteOutline,
    DescriptionOutlined,
    SaveOutlined,
    CheckCircleOutline,
    CheckCircle,
    PersonOutline,
    AssignmentTurnedIn,
    ChevronRight,
    ArrowBack,
    ArrowForward,
    Send,
    Schedule,
    Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { textFieldStyle, selectStyle, selectMenuProps, paperStyle } from '../../../styles/formStyles';
import { useAuth } from '../../../contexts/AuthContext';
import { kycService } from '../services/kycService';
import { CircularProgress, Backdrop } from '@mui/material';

const steps = [
    { label: 'Step 1', sublabel: 'Personal Info', icon: PersonOutline },
    { label: 'Step 2', sublabel: 'Documents', icon: DescriptionOutlined },
    { label: 'Step 3', sublabel: 'Review', icon: AssignmentTurnedIn },
];

const Kyc = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Form State
    const [activeStep, setActiveStep] = useState(0);
    const [status, setStatus] = useState('draft'); // draft, submitted, approved, rejected
    const [lastSaved, setLastSaved] = useState(null);
    const [formData, setFormData] = useState({
        phone: '',
        country: '',
        state: '',
        city: '',
        address: '',
        bio: '',
        highest_education: '',
        skills: [],
    });
    const [skillInput, setSkillInput] = useState('');
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial Fetch
    useEffect(() => {
        const fetchKyc = async () => {
            setLoading(true);
            try {
                const data = await kycService.getKyc();
                if (data) {
                    setFormData({
                        phone: data.data?.phone || '',
                        country: data.data?.country || '',
                        state: data.data?.state || '',
                        city: data.data?.city || '',
                        address: data.data?.address || '',
                        bio: data.data?.bio || '',
                        highest_education: data.data?.highest_education || '',
                        skills: data.data?.skills || [],
                    });
                    setDocuments(data.documents || []);
                    setStatus(data.status || 'draft');
                }
            } catch (err) {
                console.error('Failed to fetch KYC:', err);
                setError('Failed to load your KYC data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchKyc();
    }, []);

    // Derived States
    const isReadOnly = status === 'submitted' || status === 'approved';

    // Auto-save draft simulation (Optional: can be replaced with actual API call if desired)
    useEffect(() => {
        if (status !== 'draft' && status !== 'rejected') return;

        const timer = setTimeout(async () => {
            if (formData.phone || formData.bio) {
                try {
                    await kycService.updateKyc(formData);
                    setLastSaved(new Date());
                } catch (err) {
                    console.error('Auto-save failed:', err);
                }
            }
        }, 5000); // 5 seconds for auto-save to be less aggressive
        return () => clearTimeout(timer);
    }, [formData, status]);

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSkillAdd = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData((prev) => ({
                    ...prev,
                    skills: [...prev.skills, skillInput.trim()],
                }));
            }
            setSkillInput('');
        }
    };

    const handleSkillDelete = (skillToDelete) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.filter((skill) => skill !== skillToDelete),
        }));
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const newDocs = files.map((file) => ({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            type: file.type,
            lastModified: file.lastModified,
        }));
        setDocuments((prev) => [...prev, ...newDocs]);
    };

    const handleRemoveDocument = async (index, docId) => {
        setLoading(true);
        try {
            // If docId is provided, call API. Otherwise, it might be a newly selected file not yet uploaded
            if (docId) {
                await kycService.deleteDocument(docId); // Note: service might need updating if ID is required
            }
            setDocuments((prev) => prev.filter((_, i) => i !== index));
        } catch (err) {
            setError(err.message || 'Failed to remove document.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        setLoading(true);
        setError(null);
        try {
            await kycService.updateKyc(formData);
            setLastSaved(new Date());
        } catch (err) {
            setError(err.message || 'Failed to save draft.');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (activeStep === 0) {
            // Save step 1 data
            setLoading(true);
            try {
                await kycService.updateKyc(formData);
                setLastSaved(new Date());
                setActiveStep((prev) => prev + 1);
            } catch (err) {
                setError(err.message || 'Failed to save progress.');
            } finally {
                setLoading(false);
            }
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await kycService.submitKyc();
            setStatus('submitted');
            console.log('Submitted response:', data);
        } catch (err) {
            if (err.status === 422 && err.data?.missing) {
                const missingList = err.data.missing.map(field => field.replace('document:', '')).join(', ');
                setError(`Submission failed. Missing required fields: ${missingList}`);
            } else {
                setError(err.message || 'Failed to submit KYC.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Validation
    const isStep1Valid = () => {
        const required = ['phone', 'country', 'state', 'city', 'address', 'highest_education'];
        return required.every((field) => formData[field]?.trim() !== '');
    };

    const isStep2Valid = () => {
        return documents.length > 0;
    };

    const canSubmit = isStep1Valid() && isStep2Valid();

    const renderPersonalInfo = () => (
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {/* Left Column: Personal details & Expertise */}
            <Box sx={{ flex: { xs: '1 1 100%', md: 1 }, minWidth: 0 }}>
                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                                Phone Number
                            </Typography>
                            <TextField
                                fullWidth
                                name="phone"
                                placeholder='08012345678'
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={isReadOnly}
                                sx={textFieldStyle}
                            />
                        </Box>
                        <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                                Highest Education
                            </Typography>
                            <TextField
                                fullWidth
                                name="highest_education"
                                placeholder="e.g. PhD in Political Science"
                                value={formData.highest_education}
                                onChange={handleInputChange}
                                disabled={isReadOnly}
                                sx={textFieldStyle}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                                Country
                            </Typography>
                            <TextField
                                fullWidth
                                name="country"
                                placeholder="Nigeria"
                                value={formData.country}
                                onChange={handleInputChange}
                                disabled={isReadOnly}
                                sx={textFieldStyle}
                            />
                        </Box>
                        <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                                State / Province
                            </Typography>
                            <TextField
                                fullWidth
                                name="state"
                                placeholder="Lagos"
                                value={formData.state}
                                onChange={handleInputChange}
                                disabled={isReadOnly}
                                sx={textFieldStyle}
                            />
                        </Box>
                    </Box>

                    <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                            City
                        </Typography>
                        <TextField
                            fullWidth
                            name="city"
                            placeholder="Ikeja"
                            value={formData.city}
                            onChange={handleInputChange}
                            disabled={isReadOnly}
                            sx={textFieldStyle}
                        />
                    </Box>

                    <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                            Areas of Expertise
                        </Typography>
                        <TextField
                            fullWidth
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillAdd}
                            disabled={isReadOnly}
                            placeholder="e.g. Governance, Public Policy, Ethical Leadership"
                            sx={textFieldStyle}
                        />
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                            {formData.skills.map((skill) => (
                                <Chip
                                    key={skill}
                                    label={skill}
                                    onDelete={isReadOnly ? undefined : () => handleSkillDelete(skill)}
                                    sx={{
                                        bgcolor: 'rgba(17, 82, 212, 0.15)',
                                        color: '#3B82F6',
                                        mb: 1,
                                        borderRadius: 1.5,
                                        border: '1px solid rgba(17, 82, 212, 0.3)',
                                        fontWeight: 500
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                </Stack>
            </Box>

            {/* Right Column: Address & Bio */}
            <Box sx={{ flex: { xs: '1 1 100%', md: 1 }, minWidth: 0 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                            Residential Address
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            name="address"
                            placeholder="Enter your full residential address"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={isReadOnly}
                            sx={textFieldStyle}
                        />
                    </Box>
                    <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mb: 1, fontWeight: 500 }}>
                            Short Bio
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={11}
                            name="bio"
                            placeholder="Tell us about yourself and your professional background..."
                            value={formData.bio}
                            onChange={handleInputChange}
                            disabled={isReadOnly}
                            sx={textFieldStyle}
                        />
                    </Box>
                </Stack>
            </Box>
        </Box>
    );

    const renderDocuments = () => (
        <Box>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                Verification Documents
            </Typography>
            <Alert
                severity="info"
                icon={<Info sx={{ color: '#3B82F6' }} />}
                sx={{
                    mb: 4,
                    bgcolor: 'rgba(59, 130, 246, 0.05)',
                    color: '#93C5FD',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    '& .MuiAlert-icon': { color: '#3B82F6' }
                }}
            >
                Please upload a clear copy of your <strong>Government-Issued ID</strong> (Passport, National ID, or Voter's Card) and your <strong>Academic Credentials</strong>.
            </Alert>

            {!isReadOnly && (
                <Box
                    sx={{
                        border: '2px dashed #374151',
                        borderRadius: 3,
                        p: 6,
                        textAlign: 'center',
                        mb: 4,
                        bgcolor: 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#1152D4', bgcolor: 'rgba(17, 82, 212, 0.02)' }
                    }}
                >
                    <input
                        accept="application/pdf,image/*"
                        style={{ display: 'none' }}
                        id="document-upload"
                        multiple
                        type="file"
                        onChange={handleFileSelect}
                    />
                    <label htmlFor="document-upload">
                        <Stack spacing={2} alignItems="center">
                            <Box sx={{ p: 2, bgcolor: 'rgba(17, 82, 212, 0.1)', borderRadius: '50%' }}>
                                <CloudUploadOutlined sx={{ fontSize: 40, color: '#1152D4' }} />
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem', mb: 0.5 }}>
                                    Click to upload documents
                                </Typography>
                                <Typography sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                                    or drag and drop files here (PDF, JPG, PNG up to 10MB)
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                component="span"
                                sx={{
                                    bgcolor: '#1152D4',
                                    textTransform: 'none',
                                    px: 4,
                                    '&:hover': { bgcolor: '#0D42AF' }
                                }}
                            >
                                Select Files
                            </Button>
                        </Stack>
                    </label>
                </Box>
            )}

            <Stack spacing={2}>
                {documents.map((doc, index) => (
                    <Paper
                        key={index}
                        sx={{
                            bgcolor: '#111827',
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid #374151',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1, bgcolor: 'rgba(17, 82, 212, 0.1)', borderRadius: 1.5, color: '#1152D4' }}>
                                <DescriptionOutlined />
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>{doc.name}</Typography>
                                <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>{doc.size} • {doc.type}</Typography>
                            </Box>
                        </Stack>
                        {!isReadOnly && (
                            <IconButton
                                onClick={() => handleRemoveDocument(index, doc.id)}
                                sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                            >
                                <DeleteOutline />
                            </IconButton>
                        )}
                    </Paper>
                ))}
                {documents.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography sx={{ color: '#4B5563', fontStyle: 'italic' }}>
                            No documents uploaded yet.
                        </Typography>
                    </Box>
                )}
            </Stack>
        </Box>
    );

    const renderReview = () => (
        <Box>
            <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
                Review Application
            </Typography>

            <Stack spacing={4}>
                {/* Personal Summary */}
                <Box>
                    <Typography sx={{ color: '#1152D4', fontWeight: 600, fontSize: '0.9rem', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonOutline sx={{ fontSize: 20 }} /> Personal Information
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography sx={{ color: '#6B7280', fontSize: '0.75rem', mb: 0.5 }}>Full Name</Typography>
                            <Typography sx={{ color: '#fff' }}>{user?.name || 'Tutor User'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography sx={{ color: '#6B7280', fontSize: '0.75rem', mb: 0.5 }}>Phone Number</Typography>
                            <Typography sx={{ color: '#fff' }}>{formData.phone || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography sx={{ color: '#6B7280', fontSize: '0.75rem', mb: 0.5 }}>Education</Typography>
                            <Typography sx={{ color: '#fff' }}>{formData.highest_education || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography sx={{ color: '#6B7280', fontSize: '0.75rem', mb: 0.5 }}>Location</Typography>
                            <Typography sx={{ color: '#fff' }}>
                                {formData.city && `${formData.city}, `}{formData.state && `${formData.state}, `}{formData.country}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ borderColor: '#374151' }} />

                {/* Expertise */}
                <Box>
                    <Typography sx={{ color: '#1152D4', fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>Areas of Expertise</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {formData.skills.map(s => (
                            <Chip key={s} label={s} size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: 1 }} />
                        ))}
                    </Stack>
                </Box>

                <Divider sx={{ borderColor: '#374151' }} />

                {/* Documents */}
                <Box>
                    <Typography sx={{ color: '#1152D4', fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>Attached Documents</Typography>
                    <Stack spacing={1}>
                        {documents.map((doc, i) => (
                            <Typography key={i} sx={{ color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleOutline sx={{ color: '#10B981', fontSize: 16 }} /> {doc.name}
                            </Typography>
                        ))}
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0C1322', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                        Tutor Verification (KYC)
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Complete your profile to start creating courses.
                    </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Chip
                        icon={status === 'draft' ? <Schedule sx={{ fontSize: 14 }} /> : <CheckCircleOutline sx={{ fontSize: 14 }} />}
                        label={status === 'submitted' ? 'Verification Pending' : lastSaved ? `Draft saved ${lastSaved.toLocaleTimeString()}` : 'Not Started'}
                        sx={{
                            bgcolor: status === 'submitted' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: status === 'submitted' ? '#3B82F6' : '#F59E0B',
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: 'inherit' },
                        }}
                    />
                </Stack>
            </Stack>

            {/* Stepper */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: '#1A2230',
                        borderRadius: '50px',
                        p: 0.5,
                        border: '1px solid #374151',
                        overflow: 'hidden',
                    }}
                >
                    {steps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isActive = index === activeStep;
                        const isCompleted = index < activeStep;
                        const isLast = index === steps.length - 1;

                        return (
                            <React.Fragment key={step.label}>
                                {/* Step Item */}
                                <Box
                                    onClick={() => {
                                        if (isCompleted) setActiveStep(index);
                                    }}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        py: 1.5,
                                        px: 2.5,
                                        borderRadius: '50px',
                                        bgcolor: isActive ? '#1152D4' : 'transparent',
                                        cursor: isCompleted ? 'pointer' : 'default',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: isCompleted && !isActive ? 'rgba(17, 82, 212, 0.15)' : isActive ? '#1152D4' : 'transparent',
                                        },
                                        flexShrink: 0,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: isActive ? 'rgba(255,255,255,0.2)' : isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                                            color: isActive ? '#fff' : isCompleted ? '#10B981' : '#6B7280',
                                        }}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle sx={{ fontSize: 18 }} />
                                        ) : (
                                            <StepIcon sx={{ fontSize: 18 }} />
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography
                                            sx={{
                                                color: isActive ? '#fff' : isCompleted ? '#10B981' : '#9CA3AF',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {step.label}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: isActive ? 'rgba(255,255,255,0.7)' : '#6B7280',
                                                fontSize: '0.7rem',
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {step.sublabel}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Chevron Separator */}
                                {!isLast && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: '#374151',
                                            flex: 1,
                                            justifyContent: 'center',
                                            minWidth: 40,
                                        }}
                                    >
                                        <ChevronRight sx={{ fontSize: 24 }} />
                                    </Box>
                                )}
                            </React.Fragment>
                        );
                    })}
                </Box>
            </Box>

            {/* Application Level Status Alerts */}
            {status === 'approved' && (
                <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    Your KYC has been approved! You are now a verified tutor.
                </Alert>
            )}
            {status === 'submitted' && (
                <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#93C5FD', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    Your application is under review. Our team will verify your details within 48 hours.
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Content Area */}
            <Paper sx={{ p: 4, mb: 4, bgcolor: '#1A2230', borderRadius: 4, border: '1px solid #374151', width: '100%' }}>
                {activeStep === 0 && renderPersonalInfo()}
                {activeStep === 1 && renderDocuments()}
                {activeStep === 2 && renderReview()}
            </Paper>

            {/* Navigation */}
            <Box sx={{ width: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Button
                        onClick={() => navigate('/tutor')}
                        sx={{ color: '#6B7280', textTransform: 'none', '&:hover': { color: '#fff' } }}
                    >
                        Cancel & Return
                    </Button>
                    <Stack direction="row" spacing={2}>
                        {activeStep > 0 && (
                            <Button
                                onClick={handleBack}
                                disabled={isReadOnly}
                                variant="outlined"
                                startIcon={<ArrowBack />}
                                sx={{ color: '#fff', borderColor: '#374151', '&:hover': { borderColor: '#4B5563' } }}
                            >
                                Back
                            </Button>
                        )}
                        {activeStep < steps.length - 1 ? (
                            <Button
                                variant="contained"
                                disabled={isReadOnly || (activeStep === 0 && !isStep1Valid()) || (activeStep === 1 && !isStep2Valid())}
                                onClick={handleNext}
                                endIcon={<ArrowForward />}
                                sx={{ bgcolor: '#1152D4', '&:hover': { bgcolor: '#0D42AF' } }}
                            >
                                Continue to {steps[activeStep + 1].sublabel}
                            </Button>
                        ) : (
                            status === 'draft' || status === 'rejected' ? (
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={!canSubmit}
                                    startIcon={<Send />}
                                    sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, px: 4 }}
                                >
                                    Submit for Verification
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    disabled
                                    startIcon={<CheckCircleOutline />}
                                    sx={{ bgcolor: 'rgba(16, 185, 129, 0.2) !important', color: '#10B981 !important' }}
                                >
                                    Submitted
                                </Button>
                            )
                        )}
                    </Stack>
                </Stack>
            </Box>
            {/* Loading Backdrop */}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
};

export default Kyc;

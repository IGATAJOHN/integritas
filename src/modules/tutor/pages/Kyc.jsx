import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Button,
    Grid,
    TextField,
    MenuItem,
    Paper,
    FormControl,
    InputLabel,
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
} from '@mui/material';
import {
    CloudUploadOutlined,
    DeleteOutline,
    DescriptionOutlined,
    SaveOutlined,
    CheckCircleOutline,
} from '@mui/icons-material';

const steps = ['KYC Information', 'Documents', 'Review & Submit'];

const Kyc = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Form State
    const [activeStep, setActiveStep] = useState(0);
    const [status, setStatus] = useState('draft'); // draft, submitted, approved, rejected
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

    // Derived States
    const isReadOnly = status === 'submitted' || status === 'approved';
    const isRejected = status === 'rejected';

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
            size: (file.size / 1024).toFixed(2) + ' KB',
            type: file.type,
            lastModified: file.lastModified,
        }));
        setDocuments((prev) => [...prev, ...newDocs]);
    };

    const handleRemoveDocument = (index) => {
        setDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSaveDraft = () => {
        console.log('Saved Draft:', { formData, documents, status });
    };

    const handleSubmit = () => {
        console.log('Submitted KYC:', { formData, documents, status: 'submitted' });
        setStatus('submitted');
        setActiveStep(0); // Optional: reset or stay on last step
    };

    // Validation
    const isStep1Valid = () => {
        const required = ['phone', 'country', 'state', 'city', 'address', 'highest_education'];
        return required.every((field) => formData[field]?.trim() !== '');
    };

    const isStep2Valid = () => {
        return documents.length > 0; // At least 1 document
    };

    const canSubmit = isStep1Valid() && isStep2Valid();

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Status Simulator - Dev Only */}
            <Paper
                sx={{
                    p: 2,
                    mb: 4,
                    bgcolor: '#1F2937',
                    border: '1px solid #374151',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography sx={{ color: '#9CA3AF' }}>Status Simulator</Typography>
                <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    size="small"
                    sx={{
                        color: '#fff',
                        '.MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6B7280' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1152D4' },
                        minWidth: 150,
                    }}
                >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
            </Paper>

            {/* Check Status Alert */}
            {status === 'approved' && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Your KYC has been approved! You are now a verified tutor.
                </Alert>
            )}
            {status === 'submitted' && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Your application is under review. You cannot make changes at this time.
                </Alert>
            )}
            {status === 'rejected' && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Your application was returned. Review Note: "Please upload a clearer ID document."
                </Alert>
            )}

            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
                {steps.map((label) => (
                    <Step key={label} sx={{
                        '& .MuiStepLabel-label': { color: '#9CA3AF' },
                        '& .MuiStepLabel-label.Mui-active': { color: '#1152D4' },
                        '& .MuiStepLabel-label.Mui-completed': { color: '#10B981' },
                    }}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Content */}
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                {activeStep === 0 && (
                    <Paper sx={{ p: 3, bgcolor: '#1F2937', color: '#fff' }}>
                        <Typography variant="h6" gutterBottom>
                            Personal Information
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Phone Number"
                                    fullWidth
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    sx={{ mb: 2 }}
                                    // Using default MUI dark theme adaptation or custom styling
                                    InputLabelProps={{ sx: { color: '#9CA3AF' } }}
                                    InputProps={{ sx: { color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' } } }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Highest Education"
                                    fullWidth
                                    name="highest_education"
                                    value={formData.highest_education}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    InputLabelProps={{ sx: { color: '#9CA3AF' } }}
                                    InputProps={{ sx: { color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' } } }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Country"
                                    fullWidth
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    InputLabelProps={{ sx: { color: '#9CA3AF' } }}
                                    InputProps={{ sx: { color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' } } }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="State"
                                    fullWidth
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    InputLabelProps={{ sx: { color: '#9CA3AF' } }}
                                    InputProps={{ sx: { color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' } } }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="City"
                                    fullWidth
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    InputLabelProps={{ sx: { color: '#9CA3AF' } }}
                                    InputProps={{ sx: { color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' } } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Residential Address"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    InputLabelProps={{ sx: { color: '#9CA3AF' } }}
                                    InputProps={{ sx: { color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' } } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Bio"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    placeholder="Tell us about yourself and your teaching experience..."
                                    InputLabelProps={{ sx: { color: '#9CA3AF' } }}
                                    InputProps={{ sx: { color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' } } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography sx={{ mb: 1, color: '#9CA3AF', fontSize: '0.875rem' }}>Skills (Press Enter to add)</Typography>
                                <TextField
                                    fullWidth
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={handleSkillAdd}
                                    disabled={isReadOnly}
                                    placeholder="e.g. Mathematics, Physics, React"
                                    InputProps={{ sx: { color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' } } }}
                                />
                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                                    {formData.skills.map((skill) => (
                                        <Chip
                                            key={skill}
                                            label={skill}
                                            onDelete={isReadOnly ? undefined : () => handleSkillDelete(skill)}
                                            sx={{ bgcolor: '#374151', color: '#fff', mb: 1 }}
                                        />
                                    ))}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {activeStep === 1 && (
                    <Paper sx={{ p: 3, bgcolor: '#1F2937', color: '#fff' }}>
                        <Typography variant="h6" gutterBottom>
                            Document Upload
                        </Typography>
                        <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#93C5FD' }}>
                            Please upload a valid <strong>Government Identity Document</strong> (Passport, National ID, or Driver's License).
                        </Alert>

                        {!isReadOnly && (
                            <Box sx={{ border: '2px dashed #4B5563', borderRadius: 2, p: 4, textAlign: 'center', mb: 4 }}>
                                <input
                                    accept="application/pdf,image/*"
                                    style={{ display: 'none' }}
                                    id="raised-button-file"
                                    multiple
                                    type="file"
                                    onChange={handleFileSelect}
                                />
                                <label htmlFor="raised-button-file">
                                    <Button
                                        variant="contained"
                                        component="span"
                                        startIcon={<CloudUploadOutlined />}
                                        sx={{ bgcolor: '#1152D4', '&:hover': { bgcolor: '#0D42AF' } }}
                                    >
                                        Select Document
                                    </Button>
                                </label>
                                <Typography sx={{ mt: 2, color: '#9CA3AF', fontSize: '0.875rem' }}>
                                    Supported formats: PDF, JPG, PNG (Max 5MB)
                                </Typography>
                            </Box>
                        )}

                        <List>
                            {documents.map((doc, index) => (
                                <ListItem
                                    key={index}
                                    sx={{ bgcolor: '#111827', mb: 1, borderRadius: 1 }}
                                >
                                    <Box sx={{ mr: 2, color: '#1152D4' }}>
                                        <DescriptionOutlined />
                                    </Box>
                                    <ListItemText
                                        primary={doc.name}
                                        secondary={`${doc.size} • ${doc.type}`}
                                        primaryTypographyProps={{ color: '#fff' }}
                                        secondaryTypographyProps={{ color: '#9CA3AF' }}
                                    />
                                    {!isReadOnly && (
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" onClick={() => handleRemoveDocument(index)} sx={{ color: '#EF4444' }}>
                                                <DeleteOutline />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    )}
                                </ListItem>
                            ))}
                            {documents.length === 0 && (
                                <Typography sx={{ textAlign: 'center', color: '#6B7280', py: 4 }}>
                                    No documents added yet.
                                </Typography>
                            )}
                        </List>
                    </Paper>
                )}

                {activeStep === 2 && (
                    <Paper sx={{ p: 3, bgcolor: '#1F2937', color: '#fff' }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleOutline sx={{ color: '#10B981' }} /> Review Application
                        </Typography>

                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" sx={{ color: '#1152D4', mb: 2, fontWeight: 600 }}>Personal Details</Typography>
                            <Grid container spacing={2}>
                                {Object.entries(formData).map(([key, value]) => (
                                    key !== 'skills' && (
                                        <Grid item xs={12} sm={6} key={key}>
                                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                                {key.replace('_', ' ')}
                                            </Typography>
                                            <Typography sx={{ color: '#fff' }}>{value || '-'}</Typography>
                                        </Grid>
                                    )
                                ))}
                                <Grid item xs={12}>
                                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Skills</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                        {formData.skills.map(s => <Chip key={s} label={s} size="small" sx={{ bgcolor: '#374151', color: '#fff' }} />)}
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ color: '#1152D4', mb: 2, fontWeight: 600 }}>Attached Documents</Typography>
                            <List disablePadding>
                                {documents.map((doc, index) => (
                                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                                        <DescriptionOutlined sx={{ fontSize: 18, mr: 1, color: '#9CA3AF' }} />
                                        <Typography sx={{ color: '#fff' }}>{doc.name}</Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Paper>
                )}

                {/* Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    {!isReadOnly && (
                        <Button
                            variant="outlined"
                            onClick={handleSaveDraft}
                            startIcon={<SaveOutlined />}
                            sx={{ color: '#9CA3AF', borderColor: '#4B5563' }}
                        >
                            Save Draft
                        </Button>
                    )}
                    <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                        {activeStep > 0 && (
                            <Button
                                onClick={handleBack}
                                sx={{ color: '#fff' }}
                                disabled={isReadOnly}
                            >
                                Back
                            </Button>
                        )}
                        {activeStep < steps.length - 1 ? (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={isReadOnly || (activeStep === 0 && !isStep1Valid()) || (activeStep === 1 && !isStep2Valid())}
                                sx={{ bgcolor: '#1152D4', '&:hover': { bgcolor: '#0D42AF' } }}
                            >
                                Next
                            </Button>
                        ) : (
                            status === 'draft' || status === 'rejected' ? (
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={!canSubmit}
                                    color="success"
                                    sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                                >
                                    Submit KYC
                                </Button>
                            ) : null
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Kyc;

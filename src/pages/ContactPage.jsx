import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    TextField,
    MenuItem,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Email,
    Phone,
    LocationOn,
    Send,
    BorderColor,
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useThemeMode } from '../contexts';

const getColors = (isDark) => ({
    bgDark: isDark ? '#0C1322' : '#FFFFFF',
    bgDarker: isDark ? '#080D19' : '#F8FAFC',
    bgCard: isDark ? '#111827' : '#FFFFFF',
    primary: 'rgba(17, 82, 212, 1)',
    primaryHover: 'rgba(13, 65, 170, 1)',
    primaryLight: 'rgba(17, 82, 212, 0.1)',
    textWhite: isDark ? '#FFFFFF' : '#1E293B',
    textLight: isDark ? '#F3F4F6' : '#334155',
    textMuted: isDark ? '#9CA3AF' : '#64748B',
    border: isDark ? '#1F2937' : '#E2E8F0',
    borderLight: isDark ? '#374151' : '#CBD5E1',
    inputBg: isDark ? '#1F2937' : '#F8FAFC',
});

const inquiryTypes = [
    'Sales Inquiry',
    'Partnership Opportunity',
    'Technical Support',
    'General Question',
    'Course Information',
    'Other',
];

const contactInfo = [
    {
        icon: <Email />,
        label: 'Email',
        value: 'contact@integritashub.com',
    },
    {
        icon: <Phone />,
        label: 'Phone',
        value: '+234 800 000 0000',
    },
    {
        icon: <LocationOn />,
        label: 'Address',
        value: 'Abuja, Nigeria',
    },
];

const ContactPage = () => {
    const { isDark } = useThemeMode();
    const colors = getColors(isDark);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        organization: '',
        inquiryType: '',
        message: '',
    });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = 'Enter a valid email address';
        }
        if (!form.inquiryType) newErrors.inquiryType = 'Please select an inquiry type';
        if (!form.message.trim()) newErrors.message = 'Message is required';
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setSubmitted(true);
        setSnackOpen(true);
        setForm({
            firstName: '',
            lastName: '',
            email: '',
            organization: '',
            inquiryType: '',
            message: '',
        });
        setErrors({});
    };

    const fieldLabel = (text) => (
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: colors.textMuted, mb: 0.75 }}>
            {text}
        </Typography>
    );

    const inputSx = {
        '& .MuiFilledInput-root': {
            borderRadius: 2,
            backgroundColor: colors.inputBg,
            border: 'none',
            '&:hover': { backgroundColor: colors.inputBg },
            '&.Mui-focused': { backgroundColor: colors.inputBg },
            '& input:-webkit-autofill': {
                WebkitBoxShadow: `0 0 0 100px ${colors.inputBg} inset`,
                WebkitTextFillColor: colors.textWhite,
            },
        },
        '& .MuiInputBase-input': { color: colors.textWhite, pt: 1.5, pb: 1.5 },
        '& .MuiInputBase-input::placeholder': { color: colors.textMuted, opacity: 1 },
        '& .MuiSvgIcon-root': { color: colors.textMuted },
        '& .MuiFormHelperText-root': { color: '#EF4444', mx: 0 },
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: colors.bgDark, color: colors.textWhite }}>
            <Header />

            {/* Hero */}
            <Box
                sx={{
                    py: { xs: 8, md: 12 },
                    px: { xs: 2, md: 4, lg: 6 },
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(40,46,57,1) 0%, rgba(20,25,35,1) 100%)'
                        : 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
                    textAlign: 'center',
                }}
            >
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: '2rem', md: '3rem' },
                        fontWeight: 800,
                        mb: 2,
                        color: colors.textWhite,
                    }}
                >
                    Contact{' '}
                    <Box component="span" sx={{ color: colors.primary }}>
                        Sales
                    </Box>
                </Typography>
                <Typography
                    sx={{
                        fontSize: '1.125rem',
                        color: colors.textMuted,
                        maxWidth: 520,
                        mx: 'auto',
                        lineHeight: 1.7,
                    }}
                >
                    Interested in Integritas Hub for your organization? Our team is ready to help you
                    find the right solution for your public service training needs.
                </Typography>
            </Box>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={{ xs: 6, md: 8 }}
                    alignItems="flex-start"
                >
                    {/* Contact Info Panel */}
                    <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: 280 } }}>
                        <Typography
                            sx={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                mb: 3,
                                color: colors.textWhite,
                            }}
                        >
                            Get in Touch
                        </Typography>
                        <Stack spacing={3}>
                            {contactInfo.map((item) => (
                                <Stack key={item.label} direction="row" spacing={2} alignItems="flex-start">
                                    <Box
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 2,
                                            bgcolor: colors.primaryLight,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: colors.primary,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: colors.textMuted,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                mb: 0.25,
                                            }}
                                        >
                                            {item.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.9375rem', color: colors.textWhite }}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>

                    {/* Form */}
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            flex: 1,
                            bgcolor: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 3,
                            p: { xs: 3, md: 5 },
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                mb: 4,
                                color: colors.textWhite,
                            }}
                        >
                            Send Us a Message
                        </Typography>

                        <Stack spacing={3}>
                            {/* Name row */}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Box sx={{ flex: 1 }}>
                                    {fieldLabel('First Name')}
                                    <TextField
                                        variant="filled"
                                        InputProps={{ disableUnderline: true }}
                                        placeholder="First Name"
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        error={!!errors.firstName}
                                        helperText={errors.firstName}
                                        fullWidth
                                        sx={inputSx}
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    {fieldLabel('Last Name')}
                                    <TextField
                                        variant="filled"
                                        InputProps={{ disableUnderline: true }}
                                        placeholder="Last Name"
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        error={!!errors.lastName}
                                        helperText={errors.lastName}
                                        fullWidth
                                        sx={inputSx}
                                    />
                                </Box>
                            </Stack>

                            <Box>
                                {fieldLabel('Email')}
                                <TextField
                                    variant="filled"
                                    InputProps={{ disableUnderline: true }}
                                    placeholder="you@example.com"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    fullWidth
                                    sx={inputSx}
                                />
                            </Box>

                            <Box>
                                {fieldLabel('Organization (optional)')}
                                <TextField
                                    variant="filled"
                                    InputProps={{ disableUnderline: true }}
                                    placeholder="Your organization"
                                    name="organization"
                                    value={form.organization}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={inputSx}
                                />
                            </Box>

                            <Box>
                                {fieldLabel('Inquiry Type')}
                                <TextField
                                    select
                                    variant="filled"
                                    name="inquiryType"
                                    value={form.inquiryType}
                                    onChange={handleChange}
                                    error={!!errors.inquiryType}
                                    helperText={errors.inquiryType}
                                    fullWidth
                                    sx={inputSx}
                                    InputProps={{ disableUnderline: true }}
                                    SelectProps={{
                                        displayEmpty: true,
                                        renderValue: (val) => val || <span style={{ color: colors.textMuted }}>Select inquiry type</span>,
                                        MenuProps: {
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: colors.bgCard,
                                                    border: `1px solid ${colors.border}`,
                                                    '& .MuiMenuItem-root': {
                                                        color: colors.textWhite,
                                                        '&:hover': { bgcolor: colors.primaryLight },
                                                        '&.Mui-selected': { bgcolor: colors.primaryLight },
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                >
                                    {inquiryTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            <Box>
                                {fieldLabel('Message')}
                                <TextField
                                    variant="filled"
                                    InputProps={{ disableUnderline: true }}
                                    placeholder="Tell us how we can help..."
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    error={!!errors.message}
                                    helperText={errors.message}
                                    fullWidth
                                    multiline
                                    rows={5}
                                    sx={inputSx}
                                />
                            </Box>

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                endIcon={<Send />}
                                sx={{
                                    bgcolor: colors.primary,
                                    '&:hover': { bgcolor: colors.primaryHover, color: '#FFFFFF' },
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    py: 1.5,
                                    borderRadius: 2,
                                    alignSelf: 'flex-start',
                                    px: 4,
                                }}
                            >
                                Send Message
                            </Button>
                        </Stack>
                    </Box>
                </Stack>
            </Container>

            <Footer />

            <Snackbar
                open={snackOpen}
                autoHideDuration={6000}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackOpen(false)}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    Your message has been sent! We'll get back to you shortly.
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ContactPage;

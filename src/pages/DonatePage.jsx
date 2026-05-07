import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Container,
    Divider,
    InputAdornment,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    ArrowBack,
    ArrowForward,
    Business,
    Email,
    FavoriteBorder,
    Notes,
    Person,
    VolunteerActivism,
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useThemeMode } from '../contexts';
import theme from '../styles/theme';

const getColors = (isDark) => ({
    bgDark: isDark ? '#0C1322' : '#FFFFFF',
    bgDarker: isDark ? '#080D19' : '#F8FAFC',
    bgCard: isDark ? '#111827' : '#FFFFFF',
    primary: theme.colors.brand,
    primaryHover: theme.colors.brandHover,
    primaryLight: theme.colors.brandLight,
    textWhite: isDark ? '#FFFFFF' : '#1E293B',
    textLight: isDark ? '#F3F4F6' : '#334155',
    textMuted: isDark ? '#9CA3AF' : '#64748B',
    textDark: isDark ? '#6B7280' : '#94A3B8',
    border: isDark ? '#1F2937' : '#E2E8F0',
    borderLight: isDark ? '#374151' : '#CBD5E1',
    inputBg: isDark ? '#1F2937' : '#F8FAFC',
    heroGradient: isDark
        ? 'linear-gradient(135deg, rgba(40, 46, 57, 1) 0%, rgba(30, 35, 45, 1) 50%, rgba(20, 25, 35, 1) 100%)'
        : 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F0FDF4 100%)',
});

const presetAmounts = [5000, 10000, 25000, 50000];

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG')}`;

const initialForm = {
    name: '',
    email: '',
    organization: '',
    note: '',
};

const DonatePage = () => {
    const { isDark } = useThemeMode();
    const colors = getColors(isDark);

    const [selectedAmount, setSelectedAmount] = useState(10000);
    const [customAmount, setCustomAmount] = useState('');
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [snackOpen, setSnackOpen] = useState(false);

    const donationAmount = selectedAmount || Number(customAmount || 0);

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

    const fieldLabel = (text) => (
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: colors.textMuted, mb: 0.75 }}>
            {text}
        </Typography>
    );

    const validate = () => {
        const nextErrors = {};

        if (!donationAmount || donationAmount < 1) {
            nextErrors.amount = 'Select or enter a donation amount';
        }

        if (!form.name.trim()) {
            nextErrors.name = 'Name is required';
        }

        if (!form.email.trim()) {
            nextErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            nextErrors.email = 'Enter a valid email address';
        }

        return nextErrors;
    };

    const handlePresetAmount = (amount) => {
        setSelectedAmount(amount);
        setCustomAmount('');
        if (errors.amount) {
            setErrors((prev) => ({ ...prev, amount: '' }));
        }
    };

    const handleCustomAmount = (event) => {
        const value = event.target.value.replace(/\D/g, '');
        setCustomAmount(value);
        setSelectedAmount(null);
        if (errors.amount) {
            setErrors((prev) => ({ ...prev, amount: '' }));
        }
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const nextErrors = validate();

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        setSnackOpen(true);
        setForm(initialForm);
        setErrors({});
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: colors.bgDark, color: colors.textWhite }}>
            <Header />

            <Box
                sx={{
                    py: { xs: 7, md: 10 },
                    px: { xs: 2, md: 4, lg: 6 },
                    background: colors.heroGradient,
                    borderBottom: `1px solid ${colors.border}`,
                }}
            >
                <Container maxWidth="lg">
                    <Button
                        component={Link}
                        to="/"
                        startIcon={<ArrowBack />}
                        sx={{
                            color: colors.textMuted,
                            textTransform: 'none',
                            fontWeight: 600,
                            mb: 4,
                            px: 0,
                            '&:hover': { bgcolor: 'transparent', color: colors.primary },
                        }}
                    >
                        Back to Home
                    </Button>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 5, md: 8 }} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.15em',
                                    color: colors.primary,
                                    mb: 2,
                                }}
                            >
                                Support the Mission
                            </Typography>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '2.25rem', md: '3.25rem' },
                                    fontWeight: 800,
                                    color: colors.textWhite,
                                    lineHeight: 1.12,
                                    mb: 3,
                                }}
                            >
                                Fund Integrity Education That Reaches Further
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '1.0625rem',
                                    color: colors.textMuted,
                                    lineHeight: 1.8,
                                    maxWidth: 620,
                                }}
                            >
                                Your contribution helps Integritas make civic education, mentorship,
                                and accountability training more accessible to learners and public-minded
                                institutions.
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                width: { xs: '100%', md: 340 },
                                bgcolor: colors.bgCard,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 3,
                                p: 3,
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2,
                                        bgcolor: colors.primaryLight,
                                        color: colors.primary,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <VolunteerActivism />
                                </Box>
                                <Box>
                                    <Typography sx={{ color: colors.textWhite, fontWeight: 700 }}>
                                        Donation Summary
                                    </Typography>
                                    <Typography sx={{ color: colors.textMuted, fontSize: '0.875rem' }}>
                                        Payment integration coming soon
                                    </Typography>
                                </Box>
                            </Stack>
                            <Divider sx={{ borderColor: colors.border, mb: 2.5 }} />
                            <Typography sx={{ color: colors.textDark, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', mb: 1 }}>
                                Selected Amount
                            </Typography>
                            <Typography sx={{ color: colors.textWhite, fontSize: '2rem', fontWeight: 800, lineHeight: 1.1, mb: 1 }}>
                                {formatNaira(donationAmount)}
                            </Typography>
                            <Typography sx={{ color: colors.textMuted, fontSize: '0.9rem', lineHeight: 1.7 }}>
                                Support for civic learning access, mentorship, and public integrity education.
                            </Typography>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, md: 4 } }}>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        bgcolor: colors.bgCard,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 3,
                        p: { xs: 3, md: 5 },
                    }}
                >
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 5, md: 7 }} alignItems="flex-start">
                        <Box sx={{ flex: 1, width: '100%' }}>
                            <Typography
                                variant="h2"
                                sx={{
                                    color: colors.textWhite,
                                    fontSize: { xs: '1.5rem', md: '1.875rem' },
                                    fontWeight: 700,
                                    mb: 1,
                                }}
                            >
                                Choose Your Donation
                            </Typography>
                            <Typography sx={{ color: colors.textMuted, lineHeight: 1.7, mb: 4 }}>
                                Select a suggested amount or enter a custom contribution.
                            </Typography>

                            <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 3 }}>
                                {presetAmounts.map((amount) => {
                                    const isSelected = selectedAmount === amount;
                                    return (
                                        <Button
                                            key={amount}
                                            type="button"
                                            variant={isSelected ? 'contained' : 'outlined'}
                                            onClick={() => handlePresetAmount(amount)}
                                            sx={{
                                                minWidth: 118,
                                                py: 1.25,
                                                borderRadius: 2,
                                                bgcolor: isSelected ? colors.primary : 'transparent',
                                                borderColor: isSelected ? colors.primary : colors.borderLight,
                                                color: isSelected ? '#FFFFFF' : colors.textWhite,
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                '&:hover': {
                                                    bgcolor: isSelected ? colors.primaryHover : colors.primaryLight,
                                                    borderColor: colors.primary,
                                                    color: isSelected ? '#FFFFFF' : colors.textWhite,
                                                },
                                            }}
                                        >
                                            {formatNaira(amount)}
                                        </Button>
                                    );
                                })}
                            </Stack>

                            <Box sx={{ mb: 3 }}>
                                {fieldLabel('Custom Amount')}
                                <TextField
                                    variant="filled"
                                    name="customAmount"
                                    value={customAmount ? Number(customAmount).toLocaleString('en-NG') : ''}
                                    onChange={handleCustomAmount}
                                    placeholder="Enter amount"
                                    error={!!errors.amount}
                                    helperText={errors.amount}
                                    fullWidth
                                    InputProps={{
                                        disableUnderline: true,
                                        startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                                        inputMode: 'numeric',
                                    }}
                                    sx={inputSx}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1, width: '100%' }}>
                            <Typography
                                variant="h2"
                                sx={{
                                    color: colors.textWhite,
                                    fontSize: { xs: '1.5rem', md: '1.875rem' },
                                    fontWeight: 700,
                                    mb: 1,
                                }}
                            >
                                Donor Details
                            </Typography>
                            <Typography sx={{ color: colors.textMuted, lineHeight: 1.7, mb: 4 }}>
                                This form is prepared for the payment flow, but it does not submit to a backend yet.
                            </Typography>

                            <Stack spacing={3}>
                                <Box>
                                    {fieldLabel('Full Name')}
                                    <TextField
                                        variant="filled"
                                        name="name"
                                        value={form.name}
                                        onChange={handleFormChange}
                                        placeholder="Your name"
                                        error={!!errors.name}
                                        helperText={errors.name}
                                        fullWidth
                                        InputProps={{
                                            disableUnderline: true,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Person />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={inputSx}
                                    />
                                </Box>

                                <Box>
                                    {fieldLabel('Email Address')}
                                    <TextField
                                        variant="filled"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleFormChange}
                                        placeholder="you@example.com"
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        fullWidth
                                        InputProps={{
                                            disableUnderline: true,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Email />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={inputSx}
                                    />
                                </Box>

                                <Box>
                                    {fieldLabel('Organization (optional)')}
                                    <TextField
                                        variant="filled"
                                        name="organization"
                                        value={form.organization}
                                        onChange={handleFormChange}
                                        placeholder="Your organization"
                                        fullWidth
                                        InputProps={{
                                            disableUnderline: true,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Business />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={inputSx}
                                    />
                                </Box>

                                <Box>
                                    {fieldLabel('Note (optional)')}
                                    <TextField
                                        variant="filled"
                                        name="note"
                                        value={form.note}
                                        onChange={handleFormChange}
                                        placeholder="Leave a short note"
                                        multiline
                                        rows={4}
                                        fullWidth
                                        InputProps={{
                                            disableUnderline: true,
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                                    <Notes />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={inputSx}
                                    />
                                </Box>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForward />}
                                    sx={{
                                        bgcolor: colors.primary,
                                        '&:hover': { bgcolor: colors.primaryHover, color: '#FFFFFF' },
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        py: 1.5,
                                        borderRadius: 2,
                                        alignSelf: 'flex-start',
                                        px: 4,
                                    }}
                                >
                                    Continue Donation
                                </Button>
                            </Stack>
                        </Box>
                    </Stack>
                </Box>

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    sx={{ mt: 4 }}
                >
                    {[
                        'Expand learner access',
                        'Support mentor-led civic education',
                        'Strengthen public integrity training',
                    ].map((item) => (
                        <Stack
                            key={item}
                            direction="row"
                            spacing={1.25}
                            alignItems="center"
                            sx={{
                                flex: 1,
                                color: colors.textMuted,
                                bgcolor: colors.bgDarker,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 2,
                                px: 2,
                                py: 1.5,
                            }}
                        >
                            <FavoriteBorder sx={{ color: colors.primary, fontSize: 20 }} />
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                {item}
                            </Typography>
                        </Stack>
                    ))}
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
                    Donation details received. Payment integration coming soon.
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default DonatePage;

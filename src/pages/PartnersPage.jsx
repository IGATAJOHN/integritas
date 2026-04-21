import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Avatar,
    Grid,
    Chip,
} from '@mui/material';
import {
    Handshake,
    ArrowForward,
    ArrowBack as ArrowBackIcon,
    Business,
    AccountBalance,
    School,
    Groups,
    Public,
    VerifiedUser,
    EmojiEvents,
    TrendingUp,
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
    heroGradient: isDark
        ? 'linear-gradient(135deg, rgba(40, 46, 57, 1) 0%, rgba(30, 35, 45, 1) 50%, rgba(20, 25, 35, 1) 100%)'
        : 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F0FDF4 100%)',
});

const partnerCategories = [
    {
        icon: <AccountBalance sx={{ fontSize: 26 }} />,
        color: theme.colors.brand,
        bgColor: theme.colors.brandLight,
        label: 'Government Agencies',
        typeKey: 'Government Agency',
    },
    {
        icon: <School sx={{ fontSize: 26 }} />,
        color: '#0891B2',
        bgColor: 'rgba(8, 145, 178, 0.1)',
        label: 'Academic Institutions',
        typeKey: 'Academic Institution',
    },
    {
        icon: <Business sx={{ fontSize: 26 }} />,
        color: '#7C3AED',
        bgColor: 'rgba(124, 58, 237, 0.1)',
        label: 'Private Sector',
        typeKey: 'Private Sector',
    },
    {
        icon: <Public sx={{ fontSize: 26 }} />,
        color: '#059669',
        bgColor: 'rgba(5, 150, 105, 0.1)',
        label: 'International Bodies',
        typeKey: 'International Body',
    },
];

const partners = [
    {
        name: 'Federal Ministry of Finance',
        type: 'Government Agency',
        country: 'Nigeria',
        description: 'Collaborating on financial governance and public expenditure management programs for civil servants.',
        initials: 'FMF',
        color: theme.colors.brand,
    },
    {
        name: 'University of Lagos',
        type: 'Academic Institution',
        country: 'Nigeria',
        description: 'Joint certification programs in public administration and policy development.',
        initials: 'UL',
        color: '#0891B2',
    },
    {
        name: 'African Development Bank',
        type: 'International Body',
        country: 'Pan-African',
        description: 'Supporting capacity building initiatives for institutional leaders across the continent.',
        initials: 'ADB',
        color: '#059669',
    },
    {
        name: 'Ghana Revenue Authority',
        type: 'Government Agency',
        country: 'Ghana',
        description: 'Delivering training programs on taxation policy, compliance, and revenue administration.',
        initials: 'GRA',
        color: '#7C3AED',
    },
    {
        name: 'Strathmore Business School',
        type: 'Academic Institution',
        country: 'Kenya',
        description: 'Co-developing executive education programs for senior public sector officials.',
        initials: 'SBS',
        color: '#D97706',
    },
    {
        name: 'ECOWAS Commission',
        type: 'International Body',
        country: 'West Africa',
        description: 'Training diplomatic staff and regional policy experts on economic community standards.',
        initials: 'ECO',
        color: '#DC2626',
    },
];

const benefits = [
    {
        icon: <VerifiedUser sx={{ fontSize: 28 }} />,
        color: '#22D3EE',
        bgColor: 'rgba(34, 211, 238, 0.1)',
        title: 'Co-Branded Certification',
        description: 'Offer your learners certificates that carry both your institution\'s brand and Integritas\'s accreditation.',
    },
    {
        icon: <Groups sx={{ fontSize: 28 }} />,
        color: '#34D399',
        bgColor: 'rgba(52, 211, 153, 0.1)',
        title: 'Custom Learning Paths',
        description: 'We build tailored training programs designed specifically for your team\'s needs and organizational goals.',
    },
    {
        icon: <TrendingUp sx={{ fontSize: 28 }} />,
        color: theme.colors.brand,
        bgColor: theme.colors.brandLight,
        title: 'Analytics & Reporting',
        description: 'Real-time dashboards and progress reports so your organization can track and measure learning outcomes.',
    },
    {
        icon: <EmojiEvents sx={{ fontSize: 28 }} />,
        color: '#FBBF24',
        bgColor: 'rgba(251, 191, 36, 0.1)',
        title: 'Priority Support',
        description: 'Dedicated account management and priority technical support to ensure seamless delivery for your teams.',
    },
];

const stats = [
    { value: '120+', label: 'Partner Institutions' },
    { value: '30+', label: 'Countries Reached' },
    { value: '200+', label: 'Joint Programs' },
    { value: '15k+', label: 'Professionals Trained' },
];

const PartnersPage = () => {
    const { isDark } = useThemeMode();
    const colors = getColors(isDark);
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState(null);

    const filteredPartners = activeCategory
        ? partners.filter((p) => p.type === activeCategory)
        : partners;

    return (
        <Box sx={{ bgcolor: colors.bgDark, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            {/* Hero */}
            <Box
                sx={{
                    background: colors.heroGradient,
                    borderBottom: `1px solid ${colors.border}`,
                    py: { xs: 10, md: 14 },
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="md">
                    <Typography
                        variant="overline"
                        sx={{
                            color: theme.colors.brand,
                            fontWeight: 700,
                            letterSpacing: '0.15em',
                            fontSize: '0.8rem',
                            display: 'block',
                            mb: 2,
                        }}
                    >
                        Stronger Together
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            color: colors.textWhite,
                            fontSize: { xs: '2rem', md: '3rem' },
                            lineHeight: 1.2,
                            mb: 3,
                        }}
                    >
                        Our{' '}
                        <Box component="span" sx={{ color: theme.colors.brand }}>
                            Partners
                        </Box>{' '}
                        &amp; Collaborators
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '1.125rem',
                            color: colors.textMuted,
                            lineHeight: 1.8,
                            maxWidth: 620,
                            mx: 'auto',
                            mb: 5,
                        }}
                    >
                        We build meaningful partnerships with government bodies, academic institutions, international organizations, and private sector leaders to deliver world-class public sector education.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                        <Button
                            component={Link}
                            to="/signup"
                            variant="contained"
                            endIcon={<ArrowForward />}
                            sx={{
                                bgcolor: theme.colors.brand,
                                '&:hover': { bgcolor: theme.colors.brandHover, color: '#ffff'},
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                            }}
                        >
                            Become a Partner
                        </Button>
                        <Button
                            component={Link}
                            to="/explore/courses"
                            variant="outlined"
                            sx={{
                                borderColor: colors.borderLight,
                                color: colors.textWhite,
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                '&:hover': { borderColor: colors.textWhite, color:'#fff', bgcolor: 'transparent' },
                            }}
                        >
                            View Courses
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Stats */}
            <Box sx={{ py: 8, borderBottom: `1px solid ${colors.border}` }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3} justifyContent="center">
                        {stats.map((stat) => (
                            <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: '2rem', md: '2.75rem' },
                                            fontWeight: 800,
                                            color: theme.colors.brand,
                                            lineHeight: 1,
                                            mb: 0.5,
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                    <Typography sx={{ color: colors.textMuted, fontSize: '0.9rem', fontWeight: 500 }}>
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Partner Categories */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: colors.bgDarker, borderBottom: `1px solid ${colors.border}` }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 7 }}>
                        <Typography
                            variant="overline"
                            sx={{ color: theme.colors.brand, fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.8rem', display: 'block', mb: 1.5 }}
                        >
                            Who We Work With
                        </Typography>
                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 800, color: colors.textWhite, fontSize: { xs: '1.75rem', md: '2.25rem' } }}
                        >
                            Partner Categories
                        </Typography>
                    </Box>
                    <Grid container spacing={3} justifyContent="center">
                        {partnerCategories.map((cat) => {
                            const isActive = activeCategory === cat.typeKey;
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={cat.label}>
                                    <Box
                                        onClick={() => setActiveCategory(isActive ? null : cat.typeKey)}
                                        sx={{
                                            bgcolor: isActive ? cat.bgColor : colors.bgCard,
                                            border: `2px solid ${isActive ? cat.color : colors.border}`,
                                            borderRadius: 3,
                                            p: 4,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            '&:hover': { borderColor: cat.color, transform: 'translateY(-4px)' },
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: isActive ? cat.color : cat.bgColor,
                                                color: isActive ? '#fff' : cat.color,
                                                width: 64,
                                                height: 64,
                                                mx: 'auto',
                                                mb: 2,
                                                borderRadius: 2,
                                                transition: 'all 0.3s',
                                            }}
                                        >
                                            {cat.icon}
                                        </Avatar>
                                        <Typography sx={{ fontWeight: 700, color: isActive ? cat.color : colors.textWhite, fontSize: '1rem' }}>
                                            {cat.label}
                                        </Typography>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Container>
            </Box>

            {/* Featured Partners */}
            <Box sx={{ py: { xs: 8, md: 12 }, borderBottom: `1px solid ${colors.border}` }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            variant="overline"
                            sx={{ color: theme.colors.brand, fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.8rem', display: 'block', mb: 1.5 }}
                        >
                            Trusted By
                        </Typography>
                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 800, color: colors.textWhite, fontSize: { xs: '1.75rem', md: '2.25rem' } }}
                        >
                            {activeCategory
                                ? partnerCategories.find((c) => c.typeKey === activeCategory)?.label
                                : 'Featured Partners'}
                        </Typography>
                        {activeCategory && (
                            <Button
                                size="small"
                                onClick={() => setActiveCategory(null)}
                                sx={{ mt: 1.5, color: colors.textMuted, textTransform: 'none', fontSize: '0.8rem' }}
                            >
                                Clear filter
                            </Button>
                        )}
                    </Box>
                    <Grid container spacing={3}>
                        {filteredPartners.map((partner) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={partner.name}>
                                <Box
                                    sx={{
                                        bgcolor: colors.bgCard,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 3,
                                        p: 3.5,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        transition: 'all 0.3s',
                                        '&:hover': { borderColor: colors.borderLight, transform: 'translateY(-4px)' },
                                    }}
                                >
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar
                                            sx={{
                                                bgcolor: partner.color,
                                                width: 52,
                                                height: 52,
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {partner.initials}
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ fontWeight: 700, color: colors.textWhite, lineHeight: 1.3, fontSize: '0.95rem' }}>
                                                {partner.name}
                                            </Typography>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                <Chip
                                                    label={partner.type}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: theme.colors.brandLight,
                                                        color: theme.colors.brand,
                                                        fontWeight: 600,
                                                        fontSize: '0.68rem',
                                                        height: 20,
                                                    }}
                                                />
                                                <Typography sx={{ color: colors.textDark, fontSize: '0.75rem' }}>
                                                    {partner.country}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                    <Typography sx={{ color: colors.textMuted, fontSize: '0.875rem', lineHeight: 1.75 }}>
                                        {partner.description}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                        {filteredPartners.length === 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Typography sx={{ color: colors.textMuted, textAlign: 'center', py: 4 }}>
                                    No partners found for this category.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Container>
            </Box>

            {/* Partnership Benefits */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: colors.bgDarker, borderBottom: `1px solid ${colors.border}` }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            variant="overline"
                            sx={{ color: theme.colors.brand, fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.8rem', display: 'block', mb: 1.5 }}
                        >
                            Why Partner With Us
                        </Typography>
                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 800, color: colors.textWhite, fontSize: { xs: '1.75rem', md: '2.25rem' } }}
                        >
                            Partnership Benefits
                        </Typography>
                        <Typography
                            sx={{ color: colors.textMuted, mt: 2, maxWidth: 560, mx: 'auto', lineHeight: 1.8 }}
                        >
                            We offer flexible partnership models designed to create lasting value for your institution and the learners you serve.
                        </Typography>
                    </Box>
                    <Grid container spacing={3}>
                        {benefits.map((benefit) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={benefit.title}>
                                <Box
                                    sx={{
                                        bgcolor: colors.bgCard,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 3,
                                        p: 3.5,
                                        display: 'flex',
                                        gap: 2.5,
                                        alignItems: 'flex-start',
                                        height: '100%',
                                        transition: 'all 0.3s',
                                        '&:hover': { borderColor: colors.borderLight },
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            bgcolor: benefit.bgColor,
                                            color: benefit.color,
                                            width: 56,
                                            height: 56,
                                            borderRadius: 2,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {benefit.icon}
                                    </Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, color: colors.textWhite, mb: 0.75 }}>
                                            {benefit.title}
                                        </Typography>
                                        <Typography sx={{ color: colors.textMuted, fontSize: '0.9rem', lineHeight: 1.75 }}>
                                            {benefit.description}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA */}
            <Box sx={{ py: { xs: 10, md: 14 }, textAlign: 'center', bgcolor: colors.bgDark }}>
                <Container maxWidth="md">
                    <Avatar
                        sx={{
                            bgcolor: theme.colors.brandLight,
                            width: 72,
                            height: 72,
                            mx: 'auto',
                            mb: 3,
                        }}
                    >
                        <Handshake sx={{ fontSize: 36, color: theme.colors.brand }} />
                    </Avatar>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            color: colors.textWhite,
                            fontSize: { xs: '1.75rem', md: '2.5rem' },
                            mb: 2,
                            lineHeight: 1.25,
                        }}
                    >
                        Let's Build Something{' '}
                        <Box component="span" sx={{ color: theme.colors.brand }}>
                            Meaningful Together
                        </Box>
                    </Typography>
                    <Typography
                        sx={{
                            color: colors.textMuted,
                            fontSize: '1.05rem',
                            lineHeight: 1.8,
                            mb: 5,
                            maxWidth: 560,
                            mx: 'auto',
                        }}
                    >
                        Whether you're a government ministry, a university, or an international organization, we'd love to explore how we can work together to train the next generation of public sector leaders.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                        {/* <Button
                            component={Link}
                            to="/signup"
                            variant="contained"
                            endIcon={<ArrowForward />}
                            sx={{
                                bgcolor: theme.colors.brand,
                                '&:hover': { bgcolor: theme.colors.brandHover },
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                            }}
                        >
                            Get in Touch
                        </Button> */}
                        {/* <Button
                            component={Link}
                            to="/about-us"
                            variant="outlined"
                            sx={{
                                borderColor: colors.borderLight,
                                color: colors.textWhite,
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                '&:hover': { borderColor: colors.textWhite, bgcolor: 'transparent' },
                            }}
                        >
                            Learn About Us
                        </Button> */}
                    </Stack>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
};

export default PartnersPage;

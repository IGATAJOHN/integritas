import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    Stack,
    Divider,
    Avatar,
    IconButton,
    Skeleton,
} from '@mui/material';
import {
    School,
    Verified,
    Analytics,
    ArrowForward,
    FormatQuote,
    VolunteerActivism,
    ChevronLeft,
    ChevronRight,
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useThemeMode } from '../contexts';
import { courseCatalogService } from '../modules/learner/services';

import heroImage from "../assets/images/hero-screen.png"
import theme from '../styles/theme';


// Theme-aware colors function
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
    rating: '#FBBF24',
    heroGradient: isDark
        ? 'linear-gradient(135deg, rgba(40, 46, 57, 1) 0%, rgba(30, 35, 45, 1) 50%, rgba(20, 25, 35, 1) 100%)'
        : 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F0FDF4 100%)',
});


const LandingPage = () => {
    const { isDark } = useThemeMode();
    const colors = getColors(isDark);

    const [essentialCourses, setEssentialCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);

    useEffect(() => {
        // Show a small mix of foundational + featured courses on the landing page.
        courseCatalogService.listCourses({ per_page: 3, sort: 'popular' })
            .then(res => setEssentialCourses(res.data || []))
            .catch(() => setEssentialCourses([]))
            .finally(() => setCoursesLoading(false));
    }, []);

    const stats = [
        { value: '15k+', label: 'Active Learners' },
        { value: '45k+', label: 'Courses Completed' },
        { value: '120+', label: 'Partner Institutions' },
    ];

    const features = [
        {
            icon: <School sx={{ fontSize: 28, color: colors.primary }} />,
            title: 'Public Servants & Policy Makers',
            description: 'Learn to enforce institutional accountability, protect the public purse, and deploy data-driven tools like the Transparency and Integrity Index (TII).',
        },
        {
            icon: <Verified sx={{ fontSize: 28, color: '#22D3EE' }} />,
            title: 'The Private Sector & Entrepreneurs',
            description: 'Restore trust as your primary economic currency. Learn to build clean supply chains, honor contracts, and scale profitable businesses without paying kickbacks.',
        },
        {
            icon: <Analytics sx={{ fontSize: 28, color: '#818CF8' }} />,
            title: 'The Youth Vanguard',
            description: 'Survive the early-stage pressure cookers of campus life and the NYSC. Reject cybercrime, leverage ethical tech, and become the next generation of uncompromised leaders.',
        },
    ];


    const testimonials = [
        {
            quote: "The Integritas has transformed how our department approaches policy making. The rigorous curriculum and practical tools are unmatched in the field of public service education.",
            name: 'CEO Integritas',
            title: 'Senior Policy adviser',
            avatar: '',
        },
        {
            quote: "Umar has eloquently, even if not intentionally, argued for a fourth arm of government-the Integrity arm. We need strong institutions led by people with character.",
            name: ' Kole Shettima,',
            title: 'Country Director, MacArthur Foundation, Nigeria',
            avatar: '',
        },
    ];

    const [testiIndex, setTestiIndex] = useState(0);

    useEffect(() => {
        if (!testimonials || testimonials.length <= 1) return;
        const t = setInterval(() => {
            setTestiIndex((p) => (p + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(t);
    }, [testimonials.length]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: colors.bgDark, color: colors.textWhite }}>
            {/* Header */}
            <Header />

            {/* Hero Section */}
            <Box
                sx={{
                    py: { xs: 6, md: 10 },
                    px: { xs: 2, md: 4, lg: 6 },
                    background: colors.heroGradient,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Container maxWidth="xl">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', lg: 'row' },
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 6,
                        }}
                    >
                        {/* Left Content */}
                        <Box sx={{ flex: '0 0 auto', maxWidth: { xs: '100%', lg: '45%' } }}>
                            {/* Title */}
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    fontWeight: 800,
                                    lineHeight: 1.1,
                                    mb: 3,
                                    color: colors.textWhite,
                                }}
                            >
                                Anchoring a Future on
                                <br />
                                <Box component="span" sx={{ color: theme.colors.brand }}>
                                    Integrity
                                </Box>
                            </Typography>

                            {/* Description */}
                            <Typography
                                sx={{
                                    fontSize: '1.125rem',
                                    color: colors.textMuted,
                                    lineHeight: 1.7,
                                    mb: 4,
                                    maxWidth: 450,
                                }}
                            >
                                Nigeria's premier digital learning platform. Master the tools
                                of transparency, the philosophy of accountability, and the
                                dignity to act without compromise.
                            </Typography>

                            {/* Buttons */}
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                sx={{ mb: 4 }}
                            >
                                <Button
                                    component={Link}
                                    to="/explore"
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForward />}
                                    sx={{
                                        bgcolor: theme.colors.brand,
                                        '&:hover': {
                                            bgcolor: theme.colors.brandHover,
                                            color: '#FFFFFF',
                                        },
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 1.5,
                                        px: 3,
                                        borderRadius: 2,
                                    }}
                                >
                                    Start the Foundational Track
                                </Button>

                                <Button
                                    component={Link}
                                    to="#"
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        borderColor: colors.border,
                                        color: colors.textWhite,
                                        bgcolor: 'transparent',
                                        '&:hover': {
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                            color: '#FFFFFF',
                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 1.5,
                                        px: 3,
                                        borderRadius: 2,
                                    }}
                                >
                                    View Syllabus
                                </Button>
                            </Stack>

                            {/* Trust text */}
                            <Typography
                                sx={{
                                    fontSize: '0.75rem',
                                    color: colors.textDark,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    fontWeight: 500,
                                }}
                            >
                                Trusted by officials from
                            </Typography>
                        </Box>

                        {/* Right - Hero Image */}
                        <Box
                            sx={{
                                flex: '0 0 auto',
                                maxWidth: { xs: '100%', lg: '50%' },
                                display: { xs: 'none', lg: 'block' },
                            }}
                        >
                            <Box
                                component="img"
                                src={heroImage}
                                alt="Integritas Platform Dashboard"
                                sx={{
                                    width: '100%',
                                    maxWidth: 550,
                                    height: 'auto',
                                    borderRadius: 2,
                                }}
                            />
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Core Philosophy Section */}
            <Box
                sx={{
                    py: { xs: 8, md: 10 },
                    px: { xs: 2, md: 4, lg: 6 },
                    bgcolor: colors.bgCard,
                    borderTop: `1px solid ${colors.border}`,
                    borderBottom: `1px solid ${colors.border}`,
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="md">
                    <Typography
                        sx={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            color: theme.colors.brand,
                            mb: 2,
                        }}
                    >
                        The Core Philosophy
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '1.75rem', md: '2.25rem' },
                            fontWeight: 700,
                            color: colors.textWhite,
                            mb: 3,
                            lineHeight: 1.3,
                        }}
                    >
                        Anchoring a Future{' '}
                        <Box component="span" sx={{ color: theme.colors.brand }}>
                            on Integrity.
                        </Box>
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '1.0625rem',
                            color: colors.textMuted,
                            lineHeight: 1.8,
                            maxWidth: 720,
                            mx: 'auto',
                        }}
                    >
                        In a landscape where the &ldquo;Nigerian Factor&rdquo; is often used as an excuse for compromise, technical skills alone are not enough. INTEGRITAS bridges rigorous compliance training with high-impact experiential mentorship. We transform public ethics from an abstract concept into a verifiable, professional standard.
                    </Typography>
                </Container>
            </Box>

            {/* Stats Bar */}
            {/* <Box
                sx={{
                    bgcolor: colors.bgDarker,
                    borderTop: `1px solid ${colors.border}`,
                    borderBottom: `1px solid ${colors.border}`,
                    py: 6,
                    px: { xs: 2, md: 4, lg: 6 },
                }}
            >
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={{ xs: 5, md: 0 }}
                    justifyContent="space-around"
                    alignItems="center"
                    divider={
                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{
                                bgcolor: colors.border,
                                display: { xs: 'none', md: 'block' },
                            }}
                        />
                    }
                >
                    {stats.map((stat) => (
                        <Box key={stat.label} sx={{ textAlign: 'center', minWidth: 150 }}>
                            <Typography
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3rem' },
                                    fontWeight: 700,
                                    color: colors.textWhite,
                                    lineHeight: 1.1,
                                }}
                            >
                                {stat.value}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '0.875rem',
                                    color: colors.textMuted,
                                    mt: 1.5,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                {stat.label}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </Box> */}


            {/* Why Choose Section */}
            <Box sx={{ py: 10, bgcolor: colors.bgDark, px: { xs: 2, md: 4, lg: 6 } }}>
                <Box sx={{ mb: 5 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '1.75rem', md: '2rem' },
                            fontWeight: 700,
                            mb: 1,
                            color: colors.textWhite,
                        }}
                    >
                        Who Is This For?
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '1rem',
                            color: colors.textMuted,
                            lineHeight: 1.6,
                        }}
                    >
                        Designed for the unique challenges of the public and private sector, 
                        our platform combines technical rigor with practical application to build a resilient future
                    </Typography>
                </Box>


                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    sx={{ width: '100%' }}
                >
                    {features.map((feature) => (
                        <Box key={feature.title} sx={{ flex: 1 }}>

                            <Card
                                sx={{
                                    bgcolor: colors.bgCard,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 3,
                                    height: '100%',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        borderColor: colors.borderLight,
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 4 }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            bgcolor: colors.primaryLight,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 2.5,
                                        }}
                                    >
                                        {feature.icon}
                                    </Box>
                                    <Typography
                                        sx={{
                                            fontSize: '1.125rem',
                                            fontWeight: 600,
                                            color: colors.textWhite,
                                            mb: 1.5
                                        }}
                                    >
                                        {feature.title}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '0.875rem',
                                            color: colors.textMuted,
                                            lineHeight: 1.7
                                        }}
                                    >
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                </Stack>

            </Box>


            {/* The Learning Journey Section */}
            <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 2, md: 4, lg: 6 }, bgcolor: colors.bgDarker }}>
                <Container maxWidth="lg">
                    {/* Section Header */}
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            sx={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em',
                                color: theme.colors.brand,
                                mb: 2,
                            }}
                        >
                            How It Works
                        </Typography>
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: '1.75rem', md: '2.25rem' },
                                fontWeight: 700,
                                color: colors.textWhite,
                                lineHeight: 1.3,
                                mb: 4,
                            }}
                        >
                            The Learning Journey
                        </Typography>

                        {/* Progression bar */}
                        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                            <Stack direction="row" alignItems="center" spacing={0}>
                                {['01', '02', '03'].map((n, i) => (
                                    <React.Fragment key={n}>
                                        {/* Step dot */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
                                            <Box
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: '50%',
                                                    bgcolor: theme.colors.brand,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                                                    {n}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {/* Connector */}
                                        {i < 2 && (
                                            <Box sx={{ flex: 1, position: 'relative', height: 2, bgcolor: colors.border, mx: 0 }}>
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: 0,
                                                        height: '100%',
                                                        width: '100%',
                                                        bgcolor: 'rgba(17, 82, 212, 0.4)',
                                                    }}
                                                />
                                                {/* Arrow head */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        right: -6,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: 0,
                                                        height: 0,
                                                        borderTop: '5px solid transparent',
                                                        borderBottom: '5px solid transparent',
                                                        borderLeft: '7px solid rgba(17, 82, 212, 0.4)',
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </React.Fragment>
                                ))}
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1, px: -6, }}>
                                {['The Foundational Track', 'The Gateway Certification', 'Unlock the Exemplar Class'].map((label) => (
                                    <Typography key={label} sx={{ fontSize: '0.65rem', color: colors.textDark, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {label}
                                    </Typography>
                                ))}
                            </Stack>
                        </Box>
                    </Box>

                    {/* Steps */}
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={{ xs: 4, md: 3 }}
                        alignItems={{ xs: 'stretch', md: 'flex-start' }}
                        sx={{ position: 'relative' }}
                    >
                        {[
                            {
                                step: '01',
                                title: 'The Foundational Track',
                                description: 'From navigating family pressures to surviving the political arena, master the 15 core modules that bridge international compliance standards with local realities.',
                            },
                            {
                                step: '02',
                                title: 'The Gateway Certification',
                                description: 'Complete the INT 115 Capstone Project—your personal "Integritas Action Plan"—to prove your technical capability and moral conviction, earning your official certification as an Integritas Associate.',
                            },
                            {
                                step: '03',
                                title: 'Unlock the Exemplar Class',
                                description: "Gain exclusive access to high-production, cinematic mentorship from vetted national leaders. These aren't lectures; they are raw survival guides from leaders who fought the system and won with clean hands.",
                            },
                        ].map((item) => (
                            <Box key={item.step} sx={{ flex: 1, display: 'flex' }}>
                                <Box
                                    sx={{
                                        bgcolor: colors.bgCard,
                                        border: `1px solid ${colors.border}`,
                                        borderTop: `3px solid ${theme.colors.brand}`,
                                        borderRadius: 3,
                                        p: { xs: 3, md: 4 },
                                        width: '100%',
                                        height:300,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            borderColor: 'rgba(17, 82, 212, 0.5)',
                                            borderTopColor: theme.colors.brand,
                                            transform: 'translateY(-4px)',
                                        },
                                    }}
                                >
                                    {/* Step number */}
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            bgcolor: theme.colors.brand,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 3,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: '0.875rem',
                                                fontWeight: 800,
                                                color: '#FFFFFF',
                                            }}
                                        >
                                            {item.step}
                                        </Typography>
                                    </Box>

                                    {/* Title */}
                                    <Typography
                                        sx={{
                                            fontSize: '1.125rem',
                                            fontWeight: 700,
                                            color: colors.textWhite,
                                            mb: 2,
                                        }}
                                    >
                                        {item.title}
                                    </Typography>

                                    {/* Description */}
                                    <Typography
                                        sx={{
                                            fontSize: '0.9rem',
                                            color: colors.textMuted,
                                            lineHeight: 1.75,
                                        }}
                                    >
                                        {item.description}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                </Container>
            </Box>

            {/* Essential Courses Section */}
            <Box sx={{ bgcolor: colors.bgDarker }}>
                <Divider sx={{ borderColor: colors.border }} />
                <Box sx={{ py: 10, px: { xs: 2, md: 4, lg: 6 } }}>

                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        sx={{ mb: 5 }}
                    >
                        <Box>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '1.75rem', md: '2rem' },
                                    fontWeight: 700,
                                    mb: 1,
                                    color: colors.textWhite,
                                }}
                            >
                                Foundational Courses
                            </Typography>
                            <Typography sx={{ color: colors.textMuted }}>
                                Core courses recommended for every public service professional.
                            </Typography>
                        </Box>
                        <Button
                            component={Link}
                            to="/explore"
                            endIcon={<ArrowForward />}
                            sx={{
                                color: colors.primary,
                                textTransform: 'none',
                                fontWeight: 600,
                                mt: { xs: 2, md: 0 },
                                '&:hover': { bgcolor: 'transparent' },
                            }}
                        >
                            View All Courses
                        </Button>
                    </Stack>

                    {coursesLoading ? (
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                            {[1, 2, 3].map(i => (
                                <Box key={i} sx={{ flex: 1 }}>
                                    <Skeleton variant="rounded" height={200} sx={{ mb: 1, bgcolor: colors.border }} />
                                    <Skeleton variant="text" height={28} sx={{ bgcolor: colors.border }} />
                                    <Skeleton variant="text" height={20} sx={{ bgcolor: colors.border }} />
                                    <Skeleton variant="text" width="60%" height={20} sx={{ bgcolor: colors.border }} />
                                </Box>
                            ))}
                        </Stack>
                    ) : essentialCourses.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography sx={{ color: colors.textMuted, mb: 2 }}>
                                No foundational courses available at this time.
                            </Typography>
                            <Button
                                component={Link}
                                to="/explore/courses"
                                variant="outlined"
                                endIcon={<ArrowForward />}
                                sx={{
                                    borderColor: colors.primary,
                                    color: colors.primary,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: '10px',
                                    '&:hover': { bgcolor: colors.primaryLight },
                                }}
                            >
                                Browse All Courses
                            </Button>
                        </Box>
                    ) : (
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={3}
                            sx={{ width: '100%' }}
                        >
                            {essentialCourses.map((course) => (
                                <Box key={course.id} sx={{ flex: 1 }}>
                                    <Card
                                        component={Link}
                                        to={`/explore/course/${course.id}`}
                                        sx={{
                                            bgcolor: colors.bgCard,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            height: '100%',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                borderColor: colors.borderLight,
                                            },
                                        }}
                                    >
                                        <Box sx={{ position: 'relative' }}>
                                            {course.image ? (
                                                <CardMedia
                                                    component="img"
                                                    height="200"
                                                    image={course.image}
                                                    alt={course.title}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <Box sx={{
                                                height: 200,
                                                bgcolor: '#111827',
                                                display: course.image ? 'none' : 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <School sx={{ fontSize: 64, color: 'rgba(255,255,255,0.15)' }} />
                                            </Box>
                                            {course.duration && course.duration !== 'TBD' && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 16,
                                                        right: 16,
                                                        bgcolor: 'rgba(0,0,0,0.6)',
                                                        color: '#FFFFFF',
                                                        px: 1.5,
                                                        py: 0.5,
                                                        borderRadius: 1,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {course.duration}
                                                </Box>
                                            )}
                                        </Box>
                                        <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            {course.topic && (
                                                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 2 }}>
                                                    <School sx={{ fontSize: 14, color: '#F97316' }} />
                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            color: '#F97316',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                        }}
                                                    >
                                                        {course.topic}
                                                    </Typography>
                                                </Stack>
                                            )}

                                            <Typography
                                                sx={{
                                                    fontSize: '1.125rem',
                                                    fontWeight: 600,
                                                    color: colors.textWhite,
                                                    mb: 1.5
                                                }}
                                            >
                                                {course.title}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.875rem',
                                                    color: colors.textMuted,
                                                    lineHeight: 1.6,
                                                    mb: 3,
                                                    minHeight: 60,
                                                    flex: 1,
                                                }}
                                            >
                                                {course.description}
                                            </Typography>

                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            bgcolor: colors.primary,
                                                            fontSize: '0.75rem',
                                                        }}
                                                    >
                                                        {course.instructor ? course.instructor.split(' ').map(n => n[0]).join('') : 'IH'}
                                                    </Avatar>
                                                    <Typography sx={{ fontSize: '0.875rem', color: colors.textMuted }}>
                                                        {course.instructor || 'Integritas'}
                                                    </Typography>
                                                </Stack>
                                                {course.price > 0 && (
                                                    <Typography
                                                        sx={{
                                                            fontSize: '1.125rem',
                                                            fontWeight: 700,
                                                            color: colors.textWhite,
                                                        }}
                                                    >
                                                        ${course.price}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Box>


            {/* Testimonial Section (sliding) */}
            {/* Testimonial Section */}
<Box
    sx={{
        py: { xs: 8, md: 12 },
        px: { xs: 2, md: 4 },
        bgcolor: colors.bgDark,
        overflow: 'hidden',
    }}
>
    <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
                sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: theme.colors.brand,
                    mb: 2,
                }}
            >
                Testimonials
            </Typography>

            <Typography
                variant="h2"
                sx={{
                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                    fontWeight: 700,
                    color: colors.textWhite,
                }}
            >
                What People Are Saying
            </Typography>
        </Box>

        <Box
            sx={{
                position: 'relative',
                maxWidth: 900,
                mx: 'auto',
            }}
        >
            {/* Slider */}
            <Box
                sx={{
                    overflow: 'hidden',
                    borderRadius: 4,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        width: `${testimonials.length * 100}%`,
                        transform: `translateX(-${testiIndex * (100 / testimonials.length)}%)`,
                        transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                >
                    {testimonials.map((t, i) => (
                        <Box
                            key={i}
                            sx={{
                                width: `${100 / testimonials.length}%`,
                                px: { xs: 1, md: 2 },
                                flexShrink: 0,
                            }}
                        >
                            <Card
                                sx={{
                                    bgcolor: colors.bgCard,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 4,
                                    p: { xs: 3, md: 5 },
                                    minHeight: 320,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Box>
                                    <FormatQuote
                                        sx={{
                                            fontSize: 50,
                                            color: colors.primary,
                                            mb: 3,
                                        }}
                                    />

                                    <Typography
                                        sx={{
                                            fontSize: {
                                                xs: '1rem',
                                                md: '1.2rem',
                                            },
                                            lineHeight: 1.9,
                                            color: colors.textLight,
                                            fontStyle: 'italic',
                                        }}
                                    >
                                        "{t.quote}"
                                    </Typography>
                                </Box>

                                <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                    sx={{ mt: 4 }}
                                >
                                    {t.avatar ? (
                                        <Avatar
                                            src={t.avatar}
                                            alt={t.name}
                                            sx={{
                                                width: 56,
                                                height: 56,
                                            }}
                                        />
                                    ) : (
                                        <Avatar
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                bgcolor: colors.primary,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {t.name
                                                ?.split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .slice(0, 2)}
                                        </Avatar>
                                    )}

                                    <Box>
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                color: colors.textWhite,
                                            }}
                                        >
                                            {t.name}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize: '0.9rem',
                                                color: colors.textMuted,
                                            }}
                                        >
                                            {t.title}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Card>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Navigation */}
            <IconButton
                onClick={() =>
                    setTestiIndex(
                        (prev) =>
                            (prev - 1 + testimonials.length) %
                            testimonials.length
                    )
                }
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: { xs: -10, md: -25 },
                    transform: 'translateY(-50%)',
                    bgcolor: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    '&:hover': {
                        bgcolor: colors.bgCard,
                    },
                }}
            >
                <ChevronLeft sx={{ color: colors.textWhite }} />
            </IconButton>

            <IconButton
                onClick={() =>
                    setTestiIndex(
                        (prev) => (prev + 1) % testimonials.length
                    )
                }
                sx={{
                    position: 'absolute',
                    top: '50%',
                    right: { xs: -10, md: -25 },
                    transform: 'translateY(-50%)',
                    bgcolor: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    '&:hover': {
                        bgcolor: colors.bgCard,
                    },
                }}
            >
                <ChevronRight sx={{ color: colors.textWhite }} />
            </IconButton>

            {/* Dots */}
            <Stack
                direction="row"
                spacing={1.5}
                justifyContent="center"
                sx={{ mt: 4 }}
            >
                {testimonials.map((_, i) => (
                    <Box
                        key={i}
                        onClick={() => setTestiIndex(i)}
                        sx={{
                            width: i === testiIndex ? 28 : 10,
                            height: 10,
                            borderRadius: 999,
                            bgcolor:
                                i === testiIndex
                                    ? colors.primary
                                    : colors.border,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                        }}
                    />
                ))}
            </Stack>
        </Box>
    </Container>
</Box>

            {/* Donation CTA Section */}
            <Box
                sx={{
                    py: { xs: 8, md: 10 },
                    px: { xs: 2, md: 4, lg: 6 },
                    bgcolor: colors.bgDarker,
                    borderTop: `1px solid ${colors.border}`,
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            bgcolor: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 3,
                            p: { xs: 3, md: 5 },
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: { xs: 'flex-start', md: 'center' },
                            justifyContent: 'space-between',
                            gap: 4,
                        }}
                    >
                        <Stack direction="row" spacing={2.5} alignItems="flex-start" sx={{ maxWidth: 680 }}>
                            <Box
                                sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 2,
                                    bgcolor: colors.primaryLight,
                                    color: colors.primary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <VolunteerActivism sx={{ fontSize: 28 }} />
                            </Box>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em',
                                        color: theme.colors.brand,
                                        mb: 1.5,
                                    }}
                                >
                                    Support the Mission
                                </Typography>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontSize: { xs: '1.75rem', md: '2.25rem' },
                                        fontWeight: 700,
                                        mb: 2,
                                        color: colors.textWhite,
                                        lineHeight: 1.25,
                                    }}
                                >
                                    Help Build a Culture of Integrity
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '1rem',
                                        color: colors.textMuted,
                                        lineHeight: 1.8,
                                    }}
                                >
                                    Your donation helps expand access to civic education, practical mentorship,
                                    and learning tools for young leaders, public servants, and communities
                                    committed to accountable leadership.
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack
                            direction={{ xs: 'column', sm: 'row', md: 'column', lg: 'row' }}
                            spacing={2}
                            sx={{ width: { xs: '100%', md: 'auto' }, flexShrink: 0 }}
                        >
                            <Button
                                component={Link}
                                to="/donate"
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForward />}
                                sx={{
                                    bgcolor: theme.colors.brand,
                                    '&:hover': {
                                        bgcolor: theme.colors.brandHover,
                                        color: '#FFFFFF',
                                    },
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    py: 1.5,
                                    px: 3,
                                    borderRadius: 2,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Make a Donation
                            </Button>
                            <Button
                                component={Link}
                                to="/contact"
                                variant="outlined"
                                size="large"
                                sx={{
                                    borderColor: colors.borderLight,
                                    color: colors.textWhite,
                                    '&:hover': {
                                        borderColor: theme.colors.brand,
                                        bgcolor: colors.primaryLight,
                                        color: colors.textWhite,
                                    },
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    py: 1.5,
                                    px: 3,
                                    borderRadius: 2,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Contact Us
                            </Button>
                        </Stack>
                    </Box>
                </Container>
            </Box>



            {/* Footer */}
            <Footer />
        </Box >

    );
};

export default LandingPage;

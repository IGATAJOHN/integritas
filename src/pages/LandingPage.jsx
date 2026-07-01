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
    useTheme,
    useMediaQuery,
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


const FALLBACK_MODULES = [
    { id: 1, title: 'Introduction to Public Ethics & Integrity', description: 'Understand the foundational pillars of public service ethics, accountability, and the consequences of moral compromise.', tutor: 'Dr. Joe Abah' },
    { id: 2, title: 'Systemic Pressure & Decision Making', description: 'Learn tactical frameworks to withstand systemic institutional pressures and make uncompromised decisions under stress.', tutor: 'Mrs. Obiageli Ezekwesili' },
    { id: 3, title: 'Anti-Corruption Frameworks in Nigeria', description: 'Analyze the legal and structural anti-corruption instruments in Nigeria, including EFCC, ICPC, and the Code of Conduct Bureau.', tutor: 'Prof. Bolaji Owasanoye' },
    { id: 4, title: 'Public Procurement & Fiscal Responsibility', description: 'Master public finance management laws, procurement processes, and tools to identify and plug institutional leakage.', tutor: 'Mr. Soji Apampa' },
    { id: 5, title: 'Code of Conduct & Public Service Rules', description: 'In-depth study of conflict of interest, asset declaration guidelines, and statutory regulations governing public service.', tutor: 'Barr. Femi Falana' },
    { id: 6, title: 'Whistleblowing & Safeguarding Protocols', description: 'How to report wrongdoing safely, navigate reporting channels, and understand protection rights under current legal policies.', tutor: 'Dr. Chido Onumah' },
    { id: 7, title: 'Open Contracting & Transparency Indices', description: 'Utilizing open data standards and the Transparency and Integrity Index (TII) to audit public spending and contracts.', tutor: 'Seun Onigbinde' },
    { id: 8, title: 'Managing Extortion & Kickbacks', description: 'Practical negotiation skills and behavioral tactics to refuse bribery and extortion requests without losing operational capacity.', tutor: 'Mallam Nuhu Ribadu' },
    { id: 9, title: 'Corporate Governance & Business Ethics', description: 'Building clean business models, supply chain integrity, and maintaining ethical competence in private-public interactions.', tutor: 'Toyin Sanni' },
    { id: 10, title: 'Asset Declaration & Verification', description: 'A step-by-step operational guide to declaring assets correctly, verifying declarations, and maintaining financial clarity.', tutor: 'Ekpo Nta' },
    { id: 11, title: 'Compliance in Supply Chain Management', description: 'Auditing procurement lines, verification of vendor compliance, and establishing ethical guardrails in enterprise operations.', tutor: 'Dr. Alimou Diallo' },
    { id: 12, title: 'Digital Tools for Transparency & Civic Audit', description: 'Leveraging GovTech platforms, civic audits, and digital tools to monitor public works and report execution anomalies.', tutor: 'Gbenga Sesan' },
    { id: 13, title: 'Financial Crime Investigation & Forensic Audit', description: 'Fundamentals of tracking money trails, detecting shell companies, and recognizing white-collar financial crimes.', tutor: 'Mr. Ibrahim Magu' },
    { id: 14, title: 'Restoring Trust in Public Institutions', description: 'Rebuilding institutional legitimacy through open communication, merit-based governance, and public service competence.', tutor: 'Prof. Attahiru Jega' },
    { id: 15, title: 'Integritas Action Plan & Capstone', description: 'Synthesize your training into a practical, tactical blueprint to resolve a specific inefficiency in your field of work.', tutor: 'Dr. Igata John' },
];


const LandingPage = () => {
    const { isDark } = useThemeMode();
    const colors = getColors(isDark);

    const theme = useTheme();
    const isMd = useMediaQuery(theme.breakpoints.up('md'));
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));
    const cardsToShow = isMd ? 3 : isSm ? 2 : 1;

    const [modules, setModules] = useState([]);
    const [modulesLoading, setModulesLoading] = useState(true);
    const [slideIndex, setSlideIndex] = useState(0);

    const handlePrev = () => {
        setSlideIndex((prev) => {
            if (prev <= 0) return Math.max(0, modules.length - cardsToShow);
            return prev - 1;
        });
    };

    const handleNext = () => {
        setSlideIndex((prev) => {
            if (prev >= modules.length - cardsToShow) return 0;
            return prev + 1;
        });
    };

    const [essentialCourses, setEssentialCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);

    useEffect(() => {
        const loadModules = async () => {
            setModulesLoading(true);
            try {
                const list = await courseCatalogService.listFoundationalCourses({ per_page: 25 });
                const courses = list.data || [];
                const selected = courses.find((item) => ['foundational course', 'foundational courses'].includes(String(item.title || '').trim().toLowerCase())) || courses[0];
                if (selected) {
                    const slug = selected.slug || selected.id;
                    const detail = await courseCatalogService.getCourseById(slug);
                    const courseTutors = await courseCatalogService.listCourseTutors(slug).catch(() => ({ data: [] }));
                    
                    const loadedModules = detail.modules || detail.course_modules || [];
                    if (loadedModules.length > 0) {
                        const mapped = loadedModules.map((mod, idx) => {
                            let tutorName = 'Foundational Tutor';
                            if (mod.lessons && mod.lessons.length > 0) {
                                const firstLesson = mod.lessons[0];
                                const id = String(firstLesson?.assigned_tutor_id || firstLesson?.tutor_id || firstLesson?.assigned_tutor?.id || firstLesson?.tutor?.id || '');
                                const assigned = firstLesson?.assigned_tutor || firstLesson?.tutor || (courseTutors.data || []).find((tutor) => String(tutor.id || tutor.user_id) === id);
                                if (assigned) {
                                    tutorName = assigned.name || assigned.full_name || `${assigned.first_name || ''} ${assigned.last_name || ''}`.trim() || assigned.email || tutorName;
                                }
                            }
                            if (tutorName === 'Foundational Tutor' && (courseTutors.data || []).length > 0) {
                                const tutor = (courseTutors.data || [])[idx % (courseTutors.data || []).length];
                                tutorName = tutor?.name || tutor?.full_name || `${tutor?.first_name || ''} ${tutor?.last_name || ''}`.trim() || tutor?.email || tutorName;
                            }
                            return {
                                id: mod.id || idx,
                                title: mod.title || `Module ${idx + 1}`,
                                description: mod.description || (mod.lessons && mod.lessons.length > 0 ? mod.lessons.map(l => l.title).join(', ') : 'Governance and compliance modules built for integrity.'),
                                tutor: tutorName
                            };
                        });
                        setModules(mapped);
                    } else {
                        setModules(FALLBACK_MODULES);
                    }
                } else {
                    setModules(FALLBACK_MODULES);
                }
            } catch {
                setModules(FALLBACK_MODULES);
            } finally {
                setModulesLoading(false);
            }
        };

        loadModules();
    }, []);

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

                        </Box>

                        {/* Right - Welcome Address Video */}
                        <Box
                            sx={{
                                flex: '0 0 auto',
                                width: '100%',
                                maxWidth: { xs: '100%', lg: '50%' },
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    maxWidth: 550,
                                    aspectRatio: '16/9',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    bgcolor: '#080D19',
                                    border: `1px solid ${colors.border}`,
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-4px) scale(1.01)',
                                        boxShadow: `0 30px 60px rgba(0,0,0,0.6), 0 0 20px ${theme.colors.brand}22`,
                                        borderColor: 'rgba(17, 82, 212, 0.4)',
                                    },
                                }}
                            >
                                <Box
                                    component="video"
                                    controls
                                    poster={heroImage}
                                    src="/welcome_address.mp4"
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block',
                                    }}
                                >
                                    Your browser does not support the video tag.
                                </Box>
                            </Box>
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
                        In a landscape where the &ldquo;Nigerian Factor&rdquo; is often used as an excuse for compromise, technical skills alone are not enough. INTEGRITAS bridges rigorous compliance training with high-impact experiential mentorship. We transform integrity from an abstract concept into a verifiable, professional standard.
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
                                {['The Foundational Track', 'The Gateway Certification', 'Unlock the Exemplar Series'].map((label) => (
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
                                title: 'Unlock the Exemplar Series',
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
                                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                                    fontWeight: 850,
                                    mb: 1.5,
                                    color: colors.textWhite,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                Foundational Track Modules
                            </Typography>
                            <Typography sx={{ color: colors.textMuted, fontSize: '1rem', maxWidth: 600 }}>
                                Master the 15 core modules that bridge international compliance standards with local realities.
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1.5} sx={{ mt: { xs: 3, md: 0 } }} alignItems="center">
                            <IconButton
                                onClick={handlePrev}
                                sx={{
                                    bgcolor: colors.bgCard,
                                    border: `1px solid ${colors.border}`,
                                    color: colors.textWhite,
                                    width: 44,
                                    height: 44,
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        bgcolor: colors.primary,
                                        borderColor: colors.primary,
                                        transform: 'scale(1.05)',
                                    },
                                }}
                                disabled={modules.length === 0}
                            >
                                <ChevronLeft />
                            </IconButton>
                            <IconButton
                                onClick={handleNext}
                                sx={{
                                    bgcolor: colors.bgCard,
                                    border: `1px solid ${colors.border}`,
                                    color: colors.textWhite,
                                    width: 44,
                                    height: 44,
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        bgcolor: colors.primary,
                                        borderColor: colors.primary,
                                        transform: 'scale(1.05)',
                                    },
                                }}
                                disabled={modules.length === 0}
                            >
                                <ChevronRight />
                            </IconButton>
                            <Button
                                component={Link}
                                to="/learner/foundational"
                                variant="contained"
                                endIcon={<ArrowForward />}
                                sx={{
                                    ml: 1,
                                    bgcolor: colors.primary,
                                    '&:hover': { bgcolor: colors.primaryHover },
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    py: 1.25,
                                    px: 2.5,
                                    borderRadius: '10px',
                                    color: '#FFFFFF',
                                }}
                            >
                                Go to Hub
                            </Button>
                        </Stack>
                    </Stack>

                    {modulesLoading ? (
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                            {[1, 2, 3].map(i => (
                                <Box key={i} sx={{ flex: 1 }}>
                                    <Skeleton variant="rounded" height={240} sx={{ mb: 1, bgcolor: colors.border, borderRadius: 3 }} />
                                    <Skeleton variant="text" height={28} sx={{ bgcolor: colors.border }} />
                                    <Skeleton variant="text" height={20} sx={{ bgcolor: colors.border }} />
                                    <Skeleton variant="text" width="60%" height={20} sx={{ bgcolor: colors.border }} />
                                </Box>
                            ))}
                        </Stack>
                    ) : modules.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography sx={{ color: colors.textMuted, mb: 2 }}>
                                No foundational course modules available at this time.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ overflow: 'hidden', width: '100%', px: 1.5, mx: 'auto' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    mx: -1.5,
                                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                                    transform: `translateX(-${slideIndex * (100 / cardsToShow)}%)`,
                                }}
                            >
                                {modules.map((mod, idx) => (
                                    <Box
                                        key={mod.id}
                                        sx={{
                                            flexShrink: 0,
                                            width: {
                                                xs: '100%',
                                                sm: '50%',
                                                md: '33.3333%'
                                            },
                                            px: 1.5,
                                            boxSizing: 'border-box',
                                        }}
                                    >
                                        <Card
                                            sx={{
                                                bgcolor: colors.bgCard,
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: 3,
                                                p: { xs: 3, md: 3.5 },
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                minHeight: 300,
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    borderColor: colors.borderLight,
                                                    boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                                                },
                                            }}
                                        >
                                            <Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography
                                                        sx={{
                                                            display: 'inline-block',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            color: colors.primary,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.1em',
                                                            bgcolor: `${colors.primary}15`,
                                                            px: 1.5,
                                                            py: 0.5,
                                                            borderRadius: 1,
                                                        }}
                                                    >
                                                        Module {String(idx + 1).padStart(2, '0')}
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="h3"
                                                    sx={{
                                                        fontSize: '1.15rem',
                                                        fontWeight: 700,
                                                        color: colors.textWhite,
                                                        mb: 1.5,
                                                        lineHeight: 1.4,
                                                    }}
                                                >
                                                    {mod.title}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: '0.875rem',
                                                        color: colors.textMuted,
                                                        lineHeight: 1.6,
                                                        mb: 3,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {mod.description}
                                                </Typography>
                                            </Box>

                                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${colors.border}` }}>
                                                <Avatar
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        bgcolor: colors.primary,
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {mod.tutor ? mod.tutor.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'FT'}
                                                </Avatar>
                                                <Box>
                                                    <Typography sx={{ fontSize: '0.7rem', color: colors.textDark, fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        Tutor
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.875rem', color: colors.textWhite, fontWeight: 600 }}>
                                                        {mod.tutor}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Card>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>


            {/* Founder's Message Section */}
            <Box
                sx={{
                    py: { xs: 8, md: 12 },
                    px: { xs: 2, md: 4, lg: 6 },
                    bgcolor: colors.bgDark,
                    borderTop: `1px solid ${colors.border}`,
                    borderBottom: `1px solid ${colors.border}`,
                }}
            >
                <Container maxWidth="xl">
                    {/* Header */}
                    <Box sx={{ mb: { xs: 5, md: 7 } }}>
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
                            Founder's Message
                        </Typography>
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: '1.75rem', md: '2.25rem' },
                                fontWeight: 700,
                                color: colors.textWhite,
                                lineHeight: 1.3,
                                maxWidth: 700,
                            }}
                        >
                            Anchoring a Future on Integrity,{' '}
                            <Box component="span" sx={{ color: theme.colors.brand }}>
                                Let us Begin Now.
                            </Box>
                        </Typography>
                    </Box>

                    {/* Two-column layout */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', lg: 'row' },
                            gap: { xs: 5, lg: 8 },
                            alignItems: 'flex-start',
                        }}
                    >
                        {/* Left column — first 4 paragraphs */}
                        <Box
                            sx={{
                                flex: 1,
                                borderLeft: `3px solid ${theme.colors.brand}`,
                                pl: { xs: 3, md: 4 },
                                position: 'relative',
                            }}
                        >
                            <FormatQuote
                                sx={{
                                    fontSize: 64,
                                    color: theme.colors.brand,
                                    opacity: 0.15,
                                    position: 'absolute',
                                    top: -16,
                                    left: 8,
                                }}
                            />
                            <Stack spacing={3}>
                                {[
                                    'Qualifications are the minimum, but character is the anchor. Brilliance without boundaries is a liability.',
                                    'For too long, the "Nigerian Factor" has been used as a convenient excuse for compromise. Across both the public and private sectors, we have been conditioned to believe that surviving the system means bending our principles, and that integrity is a theoretical luxury we cannot afford in the real world.',
                                    'INTEGRITAS was built to dismantle that narrative.',
                                    'We recognized that treating public ethics as an abstract moral aspiration was failing. Technical skills are entirely useless if you lack the moral courage to deploy them correctly. We built this Trust Utility to shift public ethics out of the realm of abstract morality and forge it into a non-negotiable institutional baseline.',
                                ].map((para, i) => (
                                    <Typography
                                        key={i}
                                        sx={{
                                            fontSize: { xs: '0.95rem', md: '1.0625rem' },
                                            color: i === 2 ? colors.textWhite : colors.textMuted,
                                            lineHeight: 1.85,
                                            fontWeight: i === 2 ? 600 : 400,
                                        }}
                                    >
                                        {para}
                                    </Typography>
                                ))}
                            </Stack>
                        </Box>

                        {/* Right column — remaining paragraphs + attribution */}
                        <Box sx={{ flex: 1 }}>
                            <Stack spacing={3}>
                                {[
                                    'This platform is a ground from transition of perceptivity to action and engagement. The 15-module pathway provides the exact frameworks required to navigate systemic pressure, maintain rigorous training on integrity, ethics, service and competence. But theoretical knowledge is only the start.',
                                    'To earn the Integritas Associate credential, you must design a tactical blueprint to combat inefficiency in your specific field. To elevate to an Integritas Fellow, you must take that blueprint into the real world and deliver verifiable proof of impact. Earning this credential is a declaration of operational intent — it proves to employers, partners, and the public that you possess the resilience to lead without compromise. More importantly, it improves you.',
                                    "That's why we do not want you to simply survive a broken system. We are calling on you to reform it.",
                                    'The standard has been set. Welcome to the vanguard. Welcome to INTEGRITAS.',
                                ].map((para, i) => (
                                    <Typography
                                        key={i}
                                        sx={{
                                            fontSize: { xs: '0.95rem', md: '1.0625rem' },
                                            color: i === 3 ? colors.textWhite : colors.textMuted,
                                            lineHeight: 1.85,
                                            fontWeight: i === 3 ? 600 : 400,
                                        }}
                                    >
                                        {para}
                                    </Typography>
                                ))}
                            </Stack>

                            <Divider sx={{ borderColor: colors.border, my: 4 }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        bgcolor: theme.colors.brand,
                                        fontWeight: 700,
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    UY
                                </Avatar>
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: colors.textWhite }}>
                                        Umar Yakubu
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted }}>
                                        Founder, INTEGRITAS &nbsp;·&nbsp; Executive Director, CeFTPI
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Container>
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
                                to="/learner/foundational"
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
                                Foundational Courses
                            </Button>
                            <Button
                                component={Link}
                                to="/explore/experta"
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
                                Exemplar Series
                            </Button>
                            <Button
                                component={Link}
                                to="/donate"
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
                                Make a Donation
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

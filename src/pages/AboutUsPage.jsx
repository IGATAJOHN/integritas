import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Avatar,
    Divider,
    Grid,
} from '@mui/material';
import {
    School,
    Verified,
    Analytics,
    Groups,
    EmojiEvents,
    Public,
    ArrowForward,
    ArrowBack as ArrowBackIcon,
    Lightbulb,
    Handshake,
    Security,
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
    textDark: isDark ? '#6B7280' : '#94A3B8',
    border: isDark ? '#1F2937' : '#E2E8F0',
    borderLight: isDark ? '#374151' : '#CBD5E1',
    heroGradient: isDark
        ? 'linear-gradient(135deg, rgba(40, 46, 57, 1) 0%, rgba(30, 35, 45, 1) 50%, rgba(20, 25, 35, 1) 100%)'
        : 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F0FDF4 100%)',
});

const stats = [
    { value: '15k+', label: 'Active Learners' },
    { value: '120+', label: 'Partner Institutions' },
    { value: '45k+', label: 'Courses Completed' },
    { value: '98%', label: 'Satisfaction Rate' },
];

const values = [
    {
        icon: <Lightbulb sx={{ fontSize: 28 }} />,
        color: '#FBBF24',
        bgColor: 'rgba(251, 191, 36, 0.1)',
        title: 'Innovation',
        description: 'We continuously evolve our curriculum and platform to reflect the latest developments in governance, policy, and public sector leadership.',
    },
    {
        icon: <Verified sx={{ fontSize: 28 }} />,
        color: '#22D3EE',
        bgColor: 'rgba(34, 211, 238, 0.1)',
        title: 'Integrity',
        description: 'Our name says it all. We hold ourselves to the highest standards of transparency, accountability, and ethical practice in everything we do.',
    },
    {
        icon: <Handshake sx={{ fontSize: 28 }} />,
        color: '#34D399',
        bgColor: 'rgba(52, 211, 153, 0.1)',
        title: 'Partnership',
        description: 'We collaborate with government agencies, institutions, and experts to co-create learning experiences that are grounded in real-world practice.',
    },
    {
        icon: <Security sx={{ fontSize: 28 }} />,
        color: 'rgba(17, 82, 212, 1)',
        bgColor: 'rgba(17, 82, 212, 0.1)',
        title: 'Excellence',
        description: 'We are committed to delivering world-class education that empowers public servants and institutional leaders to perform at their very best.',
    },
];

const team = [
    {
        name: 'Dr. Amina Okafor',
        role: 'Co-Founder & Chief Executive Officer',
        bio: 'Former Director-General at the Federal Ministry of Finance with over 20 years of public sector experience.',
        initials: 'AO',
        avatarColor: 'rgba(17, 82, 212, 1)',
    },
    {
        name: 'Emeka Chukwu',
        role: 'Co-Founder & Chief Learning Officer',
        bio: 'A seasoned educator and policy analyst who has designed learning programs for over 30 government agencies across Africa.',
        initials: 'EC',
        avatarColor: '#0891B2',
    },
    {
        name: 'Fatima Al-Hassan',
        role: 'Head of Partnerships',
        bio: 'Brings extensive experience in institutional capacity building and stakeholder engagement across West Africa.',
        initials: 'FA',
        avatarColor: '#7C3AED',
    },
    {
        name: 'Oluwaseun Adeyemi',
        role: 'Head of Technology',
        bio: 'Full-stack engineer and EdTech specialist dedicated to building accessible and impactful digital learning environments.',
        initials: 'OA',
        avatarColor: '#059669',
    },
];

const AboutUsPage = () => {
    const { isDark } = useThemeMode();
    const colors = getColors(isDark);
    const navigate = useNavigate();

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
                            color: 'rgba(17, 82, 212, 1)',
                            fontWeight: 700,
                            letterSpacing: '0.15em',
                            fontSize: '0.8rem',
                            display: 'block',
                            mb: 2,
                        }}
                    >
                        Our Story
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
                        Empowering Public Servants{' '}
                        <Box component="span" sx={{ color: 'rgba(17, 82, 212, 1)' }}>
                            Through Knowledge
                        </Box>
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '1.125rem',
                            color: colors.textMuted,
                            lineHeight: 1.8,
                            maxWidth: 640,
                            mx: 'auto',
                            mb: 5,
                        }}
                    >
                        Integritas was founded with a singular mission: to bridge the gap between public sector potential and professional excellence through world-class, accessible education.
                    </Typography>
                    <Button
                        component={Link}
                        to="/explore/courses"
                        variant="contained"
                        endIcon={<ArrowForward />}
                        sx={{
                            bgcolor: 'rgba(17, 82, 212, 1)',
                            '&:hover': { bgcolor: 'rgba(13, 65, 170, 1)', color:'#fff' },
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            fontSize: '1rem',
                        }}
                    >
                        Explore Our Courses
                    </Button>
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
                                            color: 'rgba(17, 82, 212, 1)',
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

            {/* Our Mission */}
            <Box sx={{ py: { xs: 8, md: 12 }, borderBottom: `1px solid ${colors.border}` }}>
                <Container maxWidth="md">
                    <Typography
                        variant="overline"
                        sx={{ color: 'rgba(17, 82, 212, 1)', fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.8rem', display: 'block', mb: 2 }}
                    >
                        Who We Are
                    </Typography>

                    {/* Block 1 */}
                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 800, color: colors.textWhite, fontSize: { xs: '1.5rem', md: '2rem' }, mb: 2, lineHeight: 1.3 }}
                    >
                        Our Mission: Rebuilding the Currency of Trust
                    </Typography>
                    <Typography sx={{ color: colors.textMuted, lineHeight: 1.9, fontSize: '1rem', mb: 2 }}>
                        Nigeria does not suffer from a lack of talent, brilliance, or technical capability. We suffer from a systemic trust deficit. For too long, the &ldquo;Nigerian Factor&rdquo; has been used as an excuse to normalize compromise, corner-cutting, and institutional leakage.
                    </Typography>
                    <Typography sx={{ color: colors.textMuted, lineHeight: 1.9, fontSize: '1rem', mb: 6 }}>
                        We are here to rewrite that narrative.
                    </Typography>

                    <Divider sx={{ borderColor: colors.border, mb: 6 }} />

                    {/* Block 2 */}
                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 800, color: colors.textWhite, fontSize: { xs: '1.5rem', md: '2rem' }, mb: 2, lineHeight: 1.3 }}
                    >
                        Transparency is the Tool.{' '}
                        <Box component="span" sx={{ color: 'rgba(17, 82, 212, 1)' }}>
                            Integrity is the Outcome.
                        </Box>
                    </Typography>
                    <Typography sx={{ color: colors.textMuted, lineHeight: 1.9, fontSize: '1rem', mb: 2 }}>
                        Developed by the Center for Fiscal Transparency and Public Integrity (CeFTPI), INTEGRITAS is not just another e-learning site. It is a behavioral intervention and a verifiable &ldquo;Trust Utility.&rdquo;
                    </Typography>
                    <Typography sx={{ color: colors.textMuted, lineHeight: 1.9, fontSize: '1rem', mb: 6 }}>
                        While existing programs teach the academic laws of compliance, we focus on the raw, human element of moral courage. We believe that transparency frameworks — like budgets, the FOI Act, and the TII — are merely instruments; they require individuals of uncompromised character to wield them effectively.
                    </Typography>

                    <Divider sx={{ borderColor: colors.border, mb: 6 }} />

                    {/* Block 3 */}
                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 800, color: colors.textWhite, fontSize: { xs: '1.5rem', md: '2rem' }, mb: 2, lineHeight: 1.3 }}
                    >
                        Building the{' '}
                        <Box component="span" sx={{ color: 'rgba(17, 82, 212, 1)' }}>
                            Institutional Immune System
                        </Box>
                    </Typography>
                    <Typography sx={{ color: colors.textMuted, lineHeight: 1.9, fontSize: '1rem', mb: 2 }}>
                        We are building a new moral infrastructure for the nation. Through our rigorous 15-module Foundational Track and the Capstone Gateway Project, we are training a new breed of professionals — Integritas Associates.
                    </Typography>
                    <Typography sx={{ color: colors.textMuted, lineHeight: 1.9, fontSize: '1rem', mb: 6 }}>
                        By deploying a critical mass of these certified professionals across the public service, the private sector, and the youth vanguard, we are creating a localised &ldquo;institutional immune system.&rdquo; This network will share the same ethical language and possess the courage to collectively resist, expose, and neutralize corruption from the inside out.
                    </Typography>

                    <Divider sx={{ borderColor: colors.border, mb: 6 }} />

                    {/* Block 4 */}
                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 800, color: colors.textWhite, fontSize: { xs: '1.5rem', md: '2rem' }, mb: 2, lineHeight: 1.3 }}
                    >
                        Success Without Compromise{' '}
                        <Box component="span" sx={{ color: 'rgba(17, 82, 212, 1)' }}>
                            is Possible.
                        </Box>
                    </Typography>
                    <Typography sx={{ color: colors.textMuted, lineHeight: 1.9, fontSize: '1rem', mb: 5 }}>
                        For graduates who pass the Gateway Project, INTEGRITAS unlocks the Experta Class — a cinematic library of survival guides from vetted Nigerian leaders. These &ldquo;Integrity Icons&rdquo; provide the ultimate proof that you can reach the highest levels of government and enterprise in Nigeria without dirtying your hands.
                    </Typography>
                    

                    <Divider sx={{ borderColor: colors.border, my: 6 }} />

                    {/* Join the Vanguard */}
                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 800, color: colors.textWhite, fontSize: { xs: '1.5rem', md: '2rem' }, mb: 2, lineHeight: 1.3 }}
                    >
                        Join the{' '}
                        <Box component="span" sx={{ color: 'rgba(17, 82, 212, 1)' }}>
                            Vanguard
                        </Box>
                    </Typography>
                    <Typography sx={{ color: colors.textMuted, lineHeight: 1.9, fontSize: '1rem', mb: 3 }}>
                        Whether you are a university student navigating your first ethical dilemma, a civil servant protecting the public purse, or a corporate executive building a clean supply chain, this platform is your anchor.
                    </Typography>
                    <Typography
                        sx={{
                            color: colors.textWhite,
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            fontStyle: 'italic',
                            mb: 4,
                        }}
                    >
                        Are you ready to lead with clean hands?
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button
                            component={Link}
                            to="/explore"
                            variant="contained"
                            size="large"
                            endIcon={<ArrowForward />}
                            sx={{
                                bgcolor: 'rgba(17, 82, 212, 1)',
                                '&:hover': { bgcolor: 'rgba(13, 65, 170, 1)', color: '#FFFFFF' },
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
                            to="/partners"
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
                            Partner as an Organization
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* CTA */}
            <Box sx={{ py: { xs: 10, md: 14 }, textAlign: 'center', bgcolor: colors.bgDarker }}>
                <Container maxWidth="md">
                    <Avatar
                        sx={{
                            bgcolor: 'rgba(17, 82, 212, 0.12)',
                            width: 72,
                            height: 72,
                            mx: 'auto',
                            mb: 3,
                        }}
                    >
                        <Groups sx={{ fontSize: 36, color: 'rgba(17, 82, 212, 1)' }} />
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
                        Ready to Start Your Learning Journey?
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
                        Join thousands of public servants and institutional leaders who are advancing their careers through Integritas.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                        <Button
                            component={Link}
                            to="/explore/courses"
                            variant="contained"
                            endIcon={<ArrowForward />}
                            sx={{
                                bgcolor: 'rgba(17, 82, 212, 1)',
                                '&:hover': { bgcolor: 'rgba(13, 65, 170, 1)', color:'#fff' },
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                            }}
                        >
                            Browse Courses
                        </Button>
                        <Button
                            component={Link}
                            to="/signup"
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
                                '&:hover': { borderColor: colors.textWhite, color: colors.textWhite, bgcolor: 'transparent' },
                            }}
                        >
                            Create Free Account
                        </Button>
                    </Stack>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
};

export default AboutUsPage;

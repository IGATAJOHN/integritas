import React from 'react';
import { Link } from 'react-router-dom';
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
                        Integritas Hub was founded with a singular mission: to bridge the gap between public sector potential and professional excellence through world-class, accessible education.
                    </Typography>
                    <Button
                        component={Link}
                        to="/explore/courses"
                        variant="contained"
                        endIcon={<ArrowForward />}
                        sx={{
                            bgcolor: 'rgba(17, 82, 212, 1)',
                            '&:hover': { bgcolor: 'rgba(13, 65, 170, 1)' },
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

            {/* Mission & Vision */}
            <Box sx={{ py: { xs: 8, md: 12 }, borderBottom: `1px solid ${colors.border}` }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography
                                variant="overline"
                                sx={{ color: 'rgba(17, 82, 212, 1)', fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.8rem' }}
                            >
                                Who We Are
                            </Typography>
                            <Typography
                                variant="h3"
                                sx={{ fontWeight: 800, color: colors.textWhite, fontSize: { xs: '1.75rem', md: '2.25rem' }, mt: 1, mb: 3, lineHeight: 1.3 }}
                            >
                                Our Mission
                            </Typography>
                            <Typography sx={{ color: colors.textMuted, lineHeight: 1.9, fontSize: '1rem', mb: 3 }}>
                                At Integritas Hub, our mission is to equip public servants, institutional leaders, and government professionals with the knowledge, skills, and certifications they need to drive meaningful change in their communities and organizations.
                            </Typography>
                            <Typography sx={{ color: colors.textMuted, lineHeight: 1.9, fontSize: '1rem' }}>
                                We believe that a well-trained public sector is the backbone of a thriving nation. Every course we design, every partnership we forge, and every certificate we issue is a step toward that vision of capable, accountable, and impactful governance.
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box
                                sx={{
                                    bgcolor: colors.bgCard,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 3,
                                    p: { xs: 3, md: 5 },
                                }}
                            >
                                <Stack spacing={4}>
                                    {[
                                        {
                                            icon: <School sx={{ color: 'rgba(17, 82, 212, 1)', fontSize: 28 }} />,
                                            bg: 'rgba(17, 82, 212, 0.1)',
                                            title: 'Expert-Led Learning',
                                            desc: 'Every course is designed and delivered by practitioners with deep real-world experience in the public sector.',
                                        },
                                        {
                                            icon: <EmojiEvents sx={{ color: '#FBBF24', fontSize: 28 }} />,
                                            bg: 'rgba(251, 191, 36, 0.1)',
                                            title: 'Recognized Certifications',
                                            desc: 'Our certificates are recognized by government bodies and institutions across Africa.',
                                        },
                                        {
                                            icon: <Public sx={{ color: '#34D399', fontSize: 28 }} />,
                                            bg: 'rgba(52, 211, 153, 0.1)',
                                            title: 'African Reach',
                                            desc: 'Serving learners and institutions across Africa.',
                                        },
                                    ].map((item) => (
                                        <Stack direction="row" spacing={2.5} alignItems="flex-start" key={item.title}>
                                            <Avatar sx={{ bgcolor: item.bg, width: 52, height: 52, borderRadius: 2, flexShrink: 0 }}>
                                                {item.icon}
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ fontWeight: 700, color: colors.textWhite, mb: 0.5 }}>
                                                    {item.title}
                                                </Typography>
                                                <Typography sx={{ color: colors.textMuted, fontSize: '0.9rem', lineHeight: 1.7 }}>
                                                    {item.desc}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Values */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: colors.bgDarker, borderBottom: `1px solid ${colors.border}` }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            variant="overline"
                            sx={{ color: 'rgba(17, 82, 212, 1)', fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.8rem', display: 'block', mb: 1.5 }}
                        >
                            What Drives Us
                        </Typography>
                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 800, color: colors.textWhite, fontSize: { xs: '1.75rem', md: '2.25rem' } }}
                        >
                            Our Core Values
                        </Typography>
                    </Box>
                    <Grid container spacing={3}>
                        {values.map((val) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={val.title}>
                                <Box
                                    sx={{
                                        bgcolor: colors.bgCard,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 3,
                                        p: 3.5,
                                        height: '100%',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            borderColor: colors.borderLight,
                                            transform: 'translateY(-4px)',
                                        },
                                    }}
                                >
                                    <Avatar sx={{ bgcolor: val.bgColor, color: val.color, width: 56, height: 56, mb: 2.5, borderRadius: 2 }}>
                                        {val.icon}
                                    </Avatar>
                                    <Typography sx={{ fontWeight: 700, color: colors.textWhite, mb: 1.25, fontSize: '1.05rem' }}>
                                        {val.title}
                                    </Typography>
                                    <Typography sx={{ color: colors.textMuted, fontSize: '0.9rem', lineHeight: 1.75 }}>
                                        {val.description}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Team */}
            {/* <Box sx={{ py: { xs: 8, md: 12 }, borderBottom: `1px solid ${colors.border}` }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            variant="overline"
                            sx={{ color: 'rgba(17, 82, 212, 1)', fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.8rem', display: 'block', mb: 1.5 }}
                        >
                            The People Behind the Platform
                        </Typography>
                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 800, color: colors.textWhite, fontSize: { xs: '1.75rem', md: '2.25rem' } }}
                        >
                            Meet Our Team
                        </Typography>
                    </Box>
                    <Grid container spacing={3} justifyContent="center">
                        {team.map((member) => (
                            <Grid item xs={12} sm={6} md={3} key={member.name}>
                                <Box
                                    sx={{
                                        bgcolor: colors.bgCard,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 3,
                                        p: 3.5,
                                        textAlign: 'center',
                                        height: '100%',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            borderColor: colors.borderLight,
                                            transform: 'translateY(-4px)',
                                        },
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 72,
                                            height: 72,
                                            bgcolor: member.avatarColor,
                                            fontSize: '1.4rem',
                                            fontWeight: 700,
                                            mx: 'auto',
                                            mb: 2,
                                        }}
                                    >
                                        {member.initials}
                                    </Avatar>
                                    <Typography sx={{ fontWeight: 700, color: colors.textWhite, mb: 0.5 }}>
                                        {member.name}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: 'rgba(17, 82, 212, 1)',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            mb: 1.5,
                                        }}
                                    >
                                        {member.role}
                                    </Typography>
                                    <Divider sx={{ borderColor: colors.border, mb: 1.5 }} />
                                    <Typography sx={{ color: colors.textMuted, fontSize: '0.875rem', lineHeight: 1.7 }}>
                                        {member.bio}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box> */}

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
                        Join thousands of public servants and institutional leaders who are advancing their careers through Integritas Hub.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                        <Button
                            component={Link}
                            to="/explore/courses"
                            variant="contained"
                            endIcon={<ArrowForward />}
                            sx={{
                                bgcolor: 'rgba(17, 82, 212, 1)',
                                '&:hover': { bgcolor: 'rgba(13, 65, 170, 1)' },
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
                                '&:hover': { borderColor: colors.textWhite, bgcolor: 'transparent' },
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

import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Stack,
    Divider,
    Avatar,
    IconButton,
} from '@mui/material';
import {
    MenuBook,
    EmojiEvents,
    Analytics,
    Star,
    ArrowForward,
    Twitter,
    LinkedIn,
    YouTube,
} from '@mui/icons-material';
import Header from '../components/Header';


// Theme colors from Figma
const colors = {
    bgDark: '#0C1322',
    bgDarker: '#080D19',
    bgCard: '#111827',
    primary: 'rgba(17, 82, 212, 1)',
    primaryHover: 'rgba(13, 65, 170, 1)',
    primaryLight: 'rgba(17, 82, 212, 0.1)',
    textWhite: '#FFFFFF',
    textLight: '#F3F4F6',
    textMuted: '#9CA3AF',
    textDark: '#6B7280',
    border: '#1F2937',
    borderLight: '#374151',
    rating: '#FBBF24',
};

const LandingPage = () => {
    const stats = [
        { value: '15k+', label: 'Active Learners' },
        { value: '45k+', label: 'Courses Completed' },
        { value: '120+', label: 'Partner Institutions' },
    ];

    const features = [
        {
            icon: <MenuBook sx={{ fontSize: 28, color: colors.primary }} />,
            title: 'Expert-Led Curriculum',
            description: 'Courses taught by top government officials and policy experts with real-world experience in public sector challenges.',
        },
        {
            icon: <EmojiEvents sx={{ fontSize: 28, color: colors.primary }} />,
            title: 'Certified Accreditation',
            description: 'Earn certifications recognized by government bodies, enhancing your credibility and career advancement opportunities.',
        },
        {
            icon: <Analytics sx={{ fontSize: 28, color: colors.primary }} />,
            title: 'Data-Driven Policy Tools',
            description: 'Access cutting-edge tools for policy analysis, implementation monitoring, and data-driven decision making.',
        },
    ];

    const courses = [
        {
            image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop',
            category: 'Governance',
            duration: '8 Weeks',
            title: 'Ethics in Modern Governance',
            description: 'Learn ethical frameworks for transparent and accountable public administration.',
            instructor: 'Dr. A. Okafor',
            rating: '4.8',
            price: '$499',
        },
        {
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
            category: 'Policy',
            duration: '6 Weeks',
            title: 'Public Policy Analysis 101',
            description: 'Master evidence-based policy analysis using quantitative methods.',
            instructor: 'Prof. M. Adebayo',
            rating: '4.9',
            price: '$399',
        },
        {
            image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop',
            category: 'Technology',
            duration: '10 Weeks',
            title: 'Digital Transformation in Gov',
            description: 'Navigate digital transformation creating digital-first public services.',
            instructor: 'Dr. I. Bello',
            rating: '4.7',
            price: '$599',
        },
    ];

    const testimonial = {
        quote: "The Good Governance Hub has transformed how our department approaches policy making. The rigorous curriculum and practical tools are unmatched in the field of public service education.",
        name: 'James Okonkwo',
        title: 'Senior Policy Analyst, Ministry of Finance',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: colors.bgDark, color: colors.textWhite }}>
            {/* Header */}
            <Header />

            {/* Hero Section */}
            <Box
                sx={{
                    py: { xs: 6, md: 10 },
                    bgcolor: 'rgba(40, 46, 57, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center" justifyContent="space-between">
                        <Grid item xs={12} lg={5}>

                            {/* Badge */}
                            <Box
                                sx={{
                                    bgcolor: 'rgba(17, 82, 212, 0.15)',
                                    color: 'rgba(17, 82, 212, 1)',
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 50,
                                    display: 'inline-block',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    mb: 3,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                New Courses Available
                            </Box>

                            {/* Title */}
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    fontWeight: 800,
                                    lineHeight: 1.1,
                                    mb: 3,
                                    color: '#FFFFFF',
                                }}
                            >
                                Empowering Public<br />
                                Service Through<br />
                                <Box component="span" sx={{ color: 'rgba(17, 82, 212, 1)' }}>
                                    Excellence
                                </Box>
                            </Typography>

                            {/* Description */}
                            <Typography
                                sx={{
                                    fontSize: '1.125rem',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    lineHeight: 1.7,
                                    mb: 4,
                                    maxWidth: 450,
                                }}
                            >
                                The premier learning platform for policy professionals,
                                government officials, and civic leaders. Master the skills needed
                                for modern governance.
                            </Typography>

                            {/* Buttons */}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                                <Button
                                    component={Link}
                                    to="/courses"
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForward />}
                                    sx={{
                                        bgcolor: 'rgba(17, 82, 212, 1)',
                                        '&:hover': {
                                            bgcolor: 'rgba(13, 65, 170, 1)',
                                        },
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 1.5,
                                        px: 3,
                                        borderRadius: 2,
                                    }}
                                >
                                    Explore Courses
                                </Button>
                                <Button
                                    component={Link}
                                    to="/demo"
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        color: '#FFFFFF',
                                        bgcolor: 'transparent',
                                        '&:hover': {
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
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
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    fontWeight: 500,
                                }}
                            >
                                Trusted by officials from
                            </Typography>
                        </Grid>

                        {/* Hero Image */}
                        <Grid
                            item
                            xs={12}
                            lg={6}
                            sx={{
                                display: { xs: 'none', lg: 'flex' },
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                            }}
                        >
                            <Box
                                component="img"
                                src="/src/assets/images/hero-screen.png"
                                alt="GGH Platform Dashboard"
                                sx={{
                                    width: '100%',
                                    maxWidth: 550,
                                    height: 'auto',
                                    borderRadius: 2,
                                }}
                            />
                        </Grid>



                    </Grid>
                </Container>
            </Box>



            {/* Stats Bar */}
            <Box
                sx={{
                    bgcolor: colors.bgDarker,
                    borderTop: `1px solid ${colors.border}`,
                    borderBottom: `1px solid ${colors.border}`,
                    py: 5,
                }}
            >
                <Container maxWidth="lg">
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={{ xs: 4, md: 0 }}
                        justifyContent="center"
                        alignItems="center"
                        divider={
                            <Divider
                                orientation="vertical"
                                flexItem
                                sx={{
                                    bgcolor: colors.border,
                                    display: { xs: 'none', md: 'block' },
                                    mx: 8,
                                }}
                            />
                        }
                    >
                        {stats.map((stat) => (
                            <Box key={stat.label} sx={{ textAlign: 'center' }}>
                                <Typography
                                    sx={{
                                        fontSize: '3rem',
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
                                        mt: 1,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    {stat.label}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Container>
            </Box>

            {/* Why Choose Section */}
            <Box sx={{ py: 10 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography variant="h2" sx={{ fontSize: '2rem', fontWeight: 700, mb: 2 }}>
                            Why Choose Good Governance Hub?
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '1.0625rem',
                                color: colors.textMuted,
                                maxWidth: 600,
                                mx: 'auto',
                                lineHeight: 1.6,
                            }}
                        >
                            Designed for the unique challenges of the public sector, our platform combines
                            academic rigor with practical application.
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {features.map((feature) => (
                            <Grid item xs={12} md={4} key={feature.title}>
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
                                                width: 56,
                                                height: 56,
                                                bgcolor: colors.primaryLight,
                                                borderRadius: 3,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 2.5,
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Typography
                                            sx={{ fontSize: '1.25rem', fontWeight: 600, color: colors.textWhite, mb: 1.5 }}
                                        >
                                            {feature.title}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.9375rem', color: colors.textMuted, lineHeight: 1.6 }}>
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Featured Courses Section */}
            <Box sx={{ py: 10, bgcolor: colors.bgDarker }}>
                <Container maxWidth="lg">
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'flex-end' }}
                        sx={{ mb: 4 }}
                    >
                        <Box>
                            <Typography variant="h2" sx={{ fontSize: '2rem', fontWeight: 700, mb: 1 }}>
                                Featured Courses
                            </Typography>
                            <Typography sx={{ color: colors.textMuted }}>
                                Hand-picked courses for governance professionals
                            </Typography>
                        </Box>
                        <Button
                            component={Link}
                            to="/courses"
                            endIcon={<ArrowForward />}
                            sx={{
                                color: colors.primary,
                                textTransform: 'none',
                                fontWeight: 600,
                                mt: { xs: 2, md: 0 },
                            }}
                        >
                            View All Courses
                        </Button>
                    </Stack>

                    <Grid container spacing={4}>
                        {courses.map((course) => (
                            <Grid item xs={12} md={4} key={course.title}>
                                <Card
                                    sx={{
                                        bgcolor: colors.bgCard,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            borderColor: colors.borderLight,
                                        },
                                    }}
                                >
                                    <Box sx={{ position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height="180"
                                            image={course.image}
                                            alt={course.title}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 16,
                                                left: 16,
                                                bgcolor: colors.primary,
                                                color: colors.textWhite,
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 50,
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {course.category}
                                        </Box>
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 16,
                                                right: 16,
                                                bgcolor: 'rgba(0,0,0,0.7)',
                                                color: colors.textWhite,
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 50,
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            {course.duration}
                                        </Box>
                                    </Box>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.textWhite, mb: 1 }}>
                                            {course.title}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.875rem', color: colors.textMuted, lineHeight: 1.5, mb: 2 }}>
                                            {course.description}
                                        </Typography>
                                        <Divider sx={{ borderColor: colors.border, mb: 2 }} />
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Avatar sx={{ width: 28, height: 28, bgcolor: colors.border }}>
                                                    <Typography sx={{ fontSize: '0.75rem' }}>👤</Typography>
                                                </Avatar>
                                                <Typography sx={{ fontSize: '0.8125rem', color: colors.textMuted }}>
                                                    {course.instructor}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <Star sx={{ fontSize: 16, color: colors.rating }} />
                                                    <Typography sx={{ fontSize: '0.8125rem', color: colors.textMuted }}>
                                                        {course.rating}
                                                    </Typography>
                                                </Stack>
                                                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: colors.primary }}>
                                                    {course.price}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Testimonial Section */}
            <Box sx={{ py: 10 }}>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '3rem', color: colors.primary, mb: 3 }}>❝</Typography>
                        <Typography
                            sx={{
                                fontSize: '1.375rem',
                                color: colors.textLight,
                                lineHeight: 1.7,
                                fontStyle: 'italic',
                                mb: 4,
                            }}
                        >
                            "{testimonial.quote}"
                        </Typography>
                        <Stack direction="column" alignItems="center" spacing={1.5}>
                            <Avatar
                                src={testimonial.avatar}
                                alt={testimonial.name}
                                sx={{ width: 56, height: 56 }}
                            />
                            <Box>
                                <Typography sx={{ fontWeight: 600, color: colors.textWhite }}>
                                    {testimonial.name}
                                </Typography>
                                <Typography sx={{ fontSize: '0.875rem', color: colors.textMuted }}>
                                    {testimonial.title}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box
                sx={{
                    py: 10,
                    background: `linear-gradient(135deg, ${colors.primary}, #059669)`,
                }}
            >
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography
                            variant="h2"
                            sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 700, mb: 2 }}
                        >
                            Ready to Elevate Your Public Service Career?
                        </Typography>
                        <Typography sx={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.9)', mb: 4 }}>
                            Join thousands of governance professionals accessing world-class education today.
                        </Typography>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            justifyContent="center"
                            sx={{ mb: 3 }}
                        >
                            <Button
                                component={Link}
                                to="/signup"
                                variant="contained"
                                size="large"
                                sx={{
                                    bgcolor: colors.textWhite,
                                    color: colors.primary,
                                    '&:hover': { bgcolor: '#f1f5f9' },
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    py: 1.5,
                                    px: 4,
                                }}
                            >
                                Get Started Now
                            </Button>
                            <Button
                                component={Link}
                                to="/contact"
                                variant="outlined"
                                size="large"
                                sx={{
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    color: colors.textWhite,
                                    '&:hover': {
                                        borderColor: colors.textWhite,
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                    },
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    py: 1.5,
                                    px: 4,
                                }}
                            >
                                Contact Sales
                            </Button>
                        </Stack>
                        <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
                            No credit card required for trial
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box component="footer" sx={{ bgcolor: colors.bgDarker, py: 8 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} sx={{ mb: 6 }}>
                        <Grid item xs={12} lg={4}>
                            <Stack spacing={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                                    <span>🏛️</span>
                                    <span>Good Governance Hub</span>
                                </Box>
                                <Typography sx={{ color: colors.textMuted, fontSize: '0.9375rem', lineHeight: 1.6 }}>
                                    Empowering civil servants and public leaders with
                                    world-class education for better governance.
                                </Typography>
                                <Stack direction="row" spacing={1.5}>
                                    <IconButton
                                        sx={{ bgcolor: colors.border, '&:hover': { bgcolor: colors.borderLight } }}
                                    >
                                        <Twitter sx={{ fontSize: 18, color: colors.textWhite }} />
                                    </IconButton>
                                    <IconButton
                                        sx={{ bgcolor: colors.border, '&:hover': { bgcolor: colors.borderLight } }}
                                    >
                                        <LinkedIn sx={{ fontSize: 18, color: colors.textWhite }} />
                                    </IconButton>
                                    <IconButton
                                        sx={{ bgcolor: colors.border, '&:hover': { bgcolor: colors.borderLight } }}
                                    >
                                        <YouTube sx={{ fontSize: 18, color: colors.textWhite }} />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} lg={8}>
                            <Grid container spacing={4}>
                                {[
                                    { title: 'Platform', links: ['Browse Courses', 'Certificates', 'For Instructors', 'Pricing'] },
                                    { title: 'Company', links: ['About Us', 'Careers', 'Partners', 'Press'] },
                                    { title: 'Resources', links: ['Blog', 'Help Center', 'Community', 'Contact'] },
                                ].map((col) => (
                                    <Grid item xs={6} md={4} key={col.title}>
                                        <Typography
                                            sx={{
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                color: colors.textWhite,
                                                mb: 2.5,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                            }}
                                        >
                                            {col.title}
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            {col.links.map((link) => (
                                                <Box
                                                    key={link}
                                                    component={Link}
                                                    to={`/${link.toLowerCase().replace(' ', '-')}`}
                                                    sx={{
                                                        color: colors.textMuted,
                                                        textDecoration: 'none',
                                                        fontSize: '0.9375rem',
                                                        '&:hover': { color: colors.textWhite },
                                                    }}
                                                >
                                                    {link}
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>

                    <Divider sx={{ borderColor: colors.border, mb: 4 }} />

                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                    >
                        <Typography sx={{ fontSize: '0.875rem', color: colors.textDark }}>
                            © 2026 Good Governance Hub. All rights reserved.
                        </Typography>
                        <Stack direction="row" spacing={4}>
                            {['Privacy Policy', 'Terms of Service', 'Cookies'].map((item) => (
                                <Box
                                    key={item}
                                    component={Link}
                                    to={`/${item.toLowerCase().replace(' ', '-')}`}
                                    sx={{
                                        color: colors.textDark,
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        '&:hover': { color: colors.textWhite },
                                    }}
                                >
                                    {item}
                                </Box>
                            ))}
                        </Stack>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    Button,
    Chip,
    Card,
    CardContent,
    Avatar,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    LinearProgress,
    Rating,
    Divider,
    InputBase,
    IconButton
} from '@mui/material';
import {
    Search as SearchIcon,
    PlayCircle as PlayIcon,
    ExpandMore as ExpandMoreIcon,
    Check as CheckIcon,
    StarOutline as StarIcon,
    AccessTime as ClockIcon,
    SignalCellularAlt as LevelIcon,
    CardMembershipOutlined as CertificateIcon,
    CalendarToday as CalendarIcon,
    School as SchoolIcon,
    People as PeopleIcon,
    PlayLesson as LessonsIcon,
    Verified as VerifiedIcon,
    AccountBalance as GovernanceIcon,
    Gavel as EthicsIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Language as WorldIcon,
    AlternateEmail as EmailIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import logo from '../../../assets/images/Integritas Hub_logo.png';
import Footer from '../../../components/Footer';

const colors = {
    bg: '#0B0F19',
    paper: '#111827',
    card: '#1A1F2E',
    cardHover: '#232936',
    primary: '#2563EB',
    accent: '#3B82F6',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: 'rgba(255, 255, 255, 0.08)',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
};

// Sample course data
const courseData = {
    id: 1,
    title: 'Ethics in Public Administration',
    description: 'Master the principles of transparency, accountability, and ethical decision-making in modern government sectors. Designed for civil servants and policy makers.',
    price: 499,
    originalPrice: 650,
    discount: 23,
    offerEndsIn: 2,
    level: 'Intermediate',
    duration: '12 Weeks',
    certificate: 'Yes, Official',
    startDate: 'Nov 15, 2023',
    rating: 4.8,
    reviewCount: 1240,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    tags: [
        { label: 'VERIFIED COURSE', icon: VerifiedIcon, iconColor: '#3B82F6', bgColor: '#374151' },
        { label: 'GOVERNANCE', icon: GovernanceIcon, iconColor: '#9CA3AF', bgColor: '#374151' },
        { label: 'ETHICS', icon: EthicsIcon, iconColor: '#9CA3AF', bgColor: '#374151' }
    ],
    learningObjectives: [
        'Navigate complex ethical dilemmas in public office scenarios.',
        'Implement anti-corruption frameworks within your organization.',
        'Develop transparent budgeting and procurement strategies.',
        'Understand the legal responsibilities of public servants.',
        'Foster a culture of accountability and whistle-blower protection.',
        'Analyze case studies of successful governance reforms globally.'
    ],
    modules: [
        { id: 1, title: 'Module 1: Foundations of Governance', lessons: 3, duration: '4h 45m' },
        { id: 2, title: 'Module 2: Compliance Frameworks', lessons: 4, duration: '2h 30m' },
        { id: 3, title: 'Module 3: Leadership & Decision Making', lessons: 5, duration: '3h 15m' }
    ],
    instructor: {
        name: 'Dr. Elena Vance',
        title: 'SENIOR POLICY ADVISOR',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
        bio: 'Dr. Vance has over 15 years of experience advising federal agencies on transparency protocols. She served as the lead architect for the 2018 Open Data Initiative and currently lectures at the School of Global Governance.',
        credentials: 'PhD Public Policy',
        students: '15K',
        courses: 12
    },
    reviews: [
        {
            id: 1,
            user: 'Marcus Jenkins',
            avatar: 'MJ',
            rating: 5,
            date: '2 weeks ago',
            comment: 'Incredible insight into the mechanics of policy making. Dr. Vance explains complex topics with clarity. The module on Anti-corruption frameworks was particularly relevant to my work in local council.'
        }
    ],
    ratingBreakdown: {
        5: 80,
        4: 12,
        3: 5,
        2: 2,
        1: 1
    },
    trainingFor: ['Government Officials', 'Policy Makers', 'Civil Servants', 'NGO Leaders']
};

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [expandedModule, setExpandedModule] = useState('module-1');
    const [searchQuery, setSearchQuery] = useState('');

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleModuleChange = (panel) => (event, isExpanded) => {
        setExpandedModule(isExpanded ? panel : false);
    };

    return (
        <Box sx={{ bgcolor: colors.bg, color: colors.text, minHeight: '100vh' }}>
            {/* Header */}
            <Box component="header" sx={{
                bgcolor: colors.paper,
                px: { xs: 2, md: '40px' },
                py: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${colors.border}`,
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <Stack direction="row" alignItems="center" spacing={{ xs: 2, sm: 3, md: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} component={Link} to="/" sx={{ textDecoration: 'none', color: colors.text }}>
                        <Box component="img" src={logo} alt="Integritas Hub Logo" sx={{ width: 32, height: 32, objectFit: 'contain' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>Integritas Hub</Typography>
                    </Stack>

                    <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
                        {['Courses', 'Community', 'Resources', 'About'].map((link) => (
                            <Typography
                                key={link}
                                component={Link}
                                to={`/${link.toLowerCase()}`}
                                sx={{
                                    color: colors.textSecondary,
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    '&:hover': { color: colors.text }
                                }}
                            >
                                {link}
                            </Typography>
                        ))}
                    </Stack>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{
                        bgcolor: colors.card,
                        borderRadius: 1,
                        px: 2,
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        gap: 1,
                        width: '260px',
                        height: '40px'
                    }}>
                        <SearchIcon sx={{ color: colors.textSecondary, fontSize: 20 }} />
                        <InputBase
                            placeholder="Search courses"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                color: colors.text,
                                fontSize: '0.9rem',
                                width: '100%',
                                '& input': {
                                    border: 'none',
                                    outline: 'none',
                                    '&:focus': {
                                        border: 'none',
                                        outline: 'none'
                                    }
                                }
                            }}
                        />
                    </Box>
                    <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                        sx={{
                            bgcolor: colors.primary,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 1,
                            px: 3
                        }}
                    >
                        Log in
                    </Button>
                </Stack>
            </Box>

            {/* Main Content */}
            <Box sx={{
                maxWidth: '1280px',
                mx: 'auto',
                px: { xs: 2, sm: 3, md: 4 },
                py: 4,
                pb: 8
            }}>
                {/* Breadcrumb */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                    <Typography component={Link} to="/" sx={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: colors.text } }}>Home</Typography>
                    <Typography sx={{ color: colors.textSecondary }}>/</Typography>
                    <Typography component={Link} to="/explore" sx={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: colors.text } }}>Courses</Typography>
                    <Typography sx={{ color: colors.textSecondary }}>/</Typography>
                    <Typography sx={{ color: colors.accent, fontSize: '0.875rem' }}>{courseData.title}</Typography>
                </Stack>

                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
                    {/* Left Content */}
                    <Box sx={{ flex: 1, maxWidth: { lg: 'calc(100% - 400px)' } }}>
                        {/* Course Title */}
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                            {courseData.title}
                        </Typography>

                        {/* Course Description */}
                        <Typography sx={{ color: colors.textSecondary, fontSize: '1rem', lineHeight: 1.7, mb: 3, maxWidth: '650px' }}>
                            {courseData.description}
                        </Typography>

                        {/* Tags */}
                        {/* Tags */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 1.5,
                            alignItems: 'center',
                            mb: 3
                        }}>
                            {courseData.tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    icon={<tag.icon sx={{ fontSize: 14, color: `${tag.iconColor} !important` }} />}
                                    label={tag.label}
                                    size="small"
                                    sx={{
                                        bgcolor: tag.bgColor,
                                        color: '#FFFFFF',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        borderRadius: '4px',
                                        px: 1,
                                        height: '32px',
                                        '& .MuiChip-icon': {
                                            marginLeft: '8px'
                                        }
                                    }}
                                />
                            ))}
                            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ ml: { xs: 0, sm: 1 } }}>
                                <StarIcon sx={{ color: colors.warning, fontSize: 20 }} />
                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                                    ({courseData.reviewCount.toLocaleString()} reviews)
                                </Typography>
                            </Stack>
                        </Box>

                        {/* Tabs */}
                        <Box sx={{ borderBottom: `2px solid ${colors.border}`, mb: 4 }}>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                sx={{
                                    '& .MuiTab-root': {
                                        color: colors.textSecondary,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        minWidth: 'auto',
                                        px: 2,
                                        '&.Mui-selected': { color: colors.text }
                                    },
                                    '& .MuiTabs-indicator': { bgcolor: colors.primary, height: 3 }
                                }}
                            >
                                <Tab label="Overview" />
                                <Tab label="Curriculum" />
                                <Tab label="Instructor" />
                                <Tab label="Reviews" />
                            </Tabs>
                        </Box>

                        {/* Tab Content */}
                        {activeTab === 0 && (
                            <Box>
                                {/* Learning Objectives */}
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>What you'll learn</Typography>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                                    gap: 2,
                                    mb: 5
                                }}>
                                    {courseData.learningObjectives.map((objective, index) => (
                                        <Card key={index} sx={{
                                            bgcolor: colors.card,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: 1
                                        }}>
                                            <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                                <CheckIcon sx={{ color: colors.accent, fontSize: 20, mt: 0.25 }} />
                                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', lineHeight: 1.5 }}>
                                                    {objective}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>

                                {/* Curriculum Summary */}
                                {/* Course Content Header & Summary */}
                                <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 3 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Course content</Typography>
                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', fontWeight: 500 }}>
                                        5 Modules • 24 Lessons • 12h 30m total length
                                    </Typography>
                                </Stack>

                                {/* Modules Accordion */}
                                <Box sx={{ mb: 5 }}>
                                    {courseData.modules.map((module) => (
                                        <Accordion
                                            key={module.id}
                                            expanded={expandedModule === `module-${module.id}`}
                                            onChange={handleModuleChange(`module-${module.id}`)}
                                            sx={{
                                                bgcolor: colors.card,
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '4px !important',
                                                mb: 2,
                                                '&:before': { display: 'none' },
                                                '&.Mui-expanded': { margin: '0 0 16px 0' }
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon sx={{ color: colors.textSecondary }} />}
                                                sx={{ px: 3, py: 1 }}
                                            >
                                                <Box>
                                                    <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>{module.title}</Typography>
                                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                                                        {module.lessons} Lessons • {module.duration}
                                                    </Typography>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ px: 3, pb: 3 }}>
                                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                                                    Lesson content will be displayed here...
                                                </Typography>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Box>

                                {/* Instructor Header */}
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Instructor</Typography>

                                {/* Instructor Card */}
                                <Card sx={{
                                    bgcolor: colors.card,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 1,
                                    p: 3,
                                    mb: 5
                                }}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                        <Stack spacing={2} alignItems="center">
                                            <Avatar
                                                src={courseData.instructor.avatar}
                                                sx={{ width: 100, height: 100, border: `3px solid ${colors.primary}` }}
                                            />
                                            <Stack direction="row" spacing={1.5}>
                                                <Box sx={{
                                                    p: 0.5,
                                                    borderRadius: 1,
                                                    bgcolor: alpha(colors.textSecondary, 0.1),
                                                    color: colors.textSecondary,
                                                    cursor: 'pointer',
                                                    '&:hover': { color: colors.primary, bgcolor: alpha(colors.primary, 0.1) }
                                                }}>
                                                    <WorldIcon sx={{ fontSize: 20 }} />
                                                </Box>
                                                <Box sx={{
                                                    p: 0.5,
                                                    borderRadius: 1,
                                                    bgcolor: alpha(colors.textSecondary, 0.1),
                                                    color: colors.textSecondary,
                                                    cursor: 'pointer',
                                                    '&:hover': { color: colors.primary, bgcolor: alpha(colors.primary, 0.1) }
                                                }}>
                                                    <EmailIcon sx={{ fontSize: 20 }} />
                                                </Box>
                                            </Stack>
                                        </Stack>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{courseData.instructor.name}</Typography>
                                            <Typography sx={{ color: colors.accent, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2 }}>
                                                {courseData.instructor.title}
                                            </Typography>
                                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', lineHeight: 1.7, mb: 3 }}>
                                                {courseData.instructor.bio}
                                            </Typography>
                                            <Stack direction="row" spacing={3} flexWrap="wrap">
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <SchoolIcon sx={{ color: colors.textSecondary, fontSize: 18 }} />
                                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>{courseData.instructor.credentials}</Typography>
                                                </Stack>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <PeopleIcon sx={{ color: colors.textSecondary, fontSize: 18 }} />
                                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>{courseData.instructor.students} Students</Typography>
                                                </Stack>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <LessonsIcon sx={{ color: colors.textSecondary, fontSize: 18 }} />
                                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>{courseData.instructor.courses} Courses</Typography>
                                                </Stack>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </Card>

                                {/* Reviews Header */}
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Student Feedback</Typography>

                                {/* Reviews Section */}
                                <Card sx={{
                                    bgcolor: colors.card,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 1,
                                    p: 3
                                }}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                                        {/* Rating Summary */}
                                        <Box sx={{ minWidth: 150 }}>
                                            <Typography variant="h2" sx={{ fontWeight: 700, fontSize: '3rem', mb: 1 }}>{courseData.rating}</Typography>
                                            <Rating
                                                value={courseData.rating}
                                                precision={0.1}
                                                readOnly
                                                icon={<StarIcon fontSize="inherit" />}
                                                emptyIcon={<StarIcon fontSize="inherit" />}
                                                sx={{ color: colors.warning, mb: 1 }}
                                            />
                                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Course Rating</Typography>
                                        </Box>

                                        {/* Rating Breakdown */}
                                        <Box sx={{ flex: 1 }}>
                                            {[5, 4, 3, 2, 1].map((rating) => (
                                                <Stack key={rating} direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem', minWidth: 15 }}>{rating}</Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={courseData.ratingBreakdown[rating]}
                                                        sx={{
                                                            flex: 1,
                                                            height: 8,
                                                            borderRadius: 4,
                                                            bgcolor: colors.border,
                                                            '& .MuiLinearProgress-bar': { bgcolor: '#FFFFFF', borderRadius: 4 }
                                                        }}
                                                    />
                                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem', minWidth: 35 }}>{courseData.ratingBreakdown[rating]}%</Typography>
                                                </Stack>
                                            ))}
                                        </Box>
                                    </Stack>

                                    <Divider sx={{ borderColor: colors.border, my: 3 }} />

                                    {/* User Reviews */}
                                    {courseData.reviews.map((review) => (
                                        <Box key={review.id}>
                                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                                <Avatar sx={{ bgcolor: colors.primary, width: 40, height: 40 }}>{review.avatar}</Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                                                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{review.user}</Typography>
                                                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>• {review.date}</Typography>
                                                    </Stack>
                                                    <Rating value={review.rating} size="small" readOnly sx={{ color: colors.warning, mb: 1 }} />
                                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', lineHeight: 1.7 }}>
                                                        "{review.comment}"
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    ))}
                                </Card>
                            </Box>
                        )}

                        {activeTab === 1 && (
                            <Box>
                                <Typography sx={{ color: colors.textSecondary, mb: 3 }}>
                                    5 Modules • 24 Lessons • 12h 30m total length
                                </Typography>
                                {courseData.modules.map((module) => (
                                    <Accordion
                                        key={module.id}
                                        expanded={expandedModule === `module-${module.id}`}
                                        onChange={handleModuleChange(`module-${module.id}`)}
                                        sx={{
                                            bgcolor: colors.card,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '12px !important',
                                            mb: 2,
                                            '&:before': { display: 'none' }
                                        }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: colors.textSecondary }} />} sx={{ px: 3 }}>
                                            <Box>
                                                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>{module.title}</Typography>
                                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                                                    {module.lessons} Lessons • {module.duration}
                                                </Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ px: 3, pb: 3 }}>
                                            <Typography sx={{ color: colors.textSecondary }}>Lesson content...</Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                        )}

                        {activeTab === 2 && (
                            <Card sx={{ bgcolor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 3, p: 3 }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                    <Avatar src={courseData.instructor.avatar} sx={{ width: 100, height: 100, border: `3px solid ${colors.primary}` }} />
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{courseData.instructor.name}</Typography>
                                        <Typography sx={{ color: colors.accent, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 2 }}>{courseData.instructor.title}</Typography>
                                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', lineHeight: 1.7 }}>{courseData.instructor.bio}</Typography>
                                    </Box>
                                </Stack>
                            </Card>
                        )}

                        {activeTab === 3 && (
                            <Card sx={{ bgcolor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 3, p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 3 }}>Student Reviews</Typography>
                                {courseData.reviews.map((review) => (
                                    <Box key={review.id}>
                                        <Stack direction="row" spacing={2}>
                                            <Avatar sx={{ bgcolor: colors.primary }}>{review.avatar}</Avatar>
                                            <Box>
                                                <Typography sx={{ fontWeight: 600 }}>{review.user}</Typography>
                                                <Rating value={review.rating} size="small" readOnly sx={{ color: colors.warning }} />
                                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mt: 1 }}>"{review.comment}"</Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                ))}
                            </Card>
                        )}
                    </Box>

                    {/* Right Sidebar */}
                    <Box sx={{
                        width: { xs: '100%', lg: '360px' },
                        flexShrink: 0,
                        position: { lg: 'sticky' },
                        top: { lg: 100 },
                        alignSelf: 'flex-start'
                    }}>
                        {/* Enroll Card */}
                        <Card sx={{
                            bgcolor: colors.card,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 1,
                            overflow: 'hidden'
                        }}>
                            {/* Preview Image */}
                            <Box sx={{ position: 'relative' }}>
                                <Box
                                    component="img"
                                    src={courseData.image}
                                    alt="Course Preview"
                                    sx={{ width: '100%', height: 180, objectFit: 'cover' }}
                                />
                                <Box sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    bgcolor: 'rgba(0,0,0,0.6)',
                                    borderRadius: '50%',
                                    p: 1,
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                                }}>
                                    <PlayIcon sx={{ fontSize: 28, color: colors.text }} />
                                </Box>
                                <Chip
                                    label="Preview"
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 10,
                                        left: 10,
                                        bgcolor: colors.primary,
                                        color: colors.text,
                                        fontWeight: 600,
                                        fontSize: '0.65rem'
                                    }}
                                />
                            </Box>

                            <CardContent sx={{ p: 2.5 }}>
                                {/* Pricing */}
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                    <Stack direction="row" alignItems="baseline" spacing={1}>
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>${courseData.price}</Typography>
                                        <Typography sx={{ color: colors.textSecondary, textDecoration: 'line-through', fontSize: '1rem' }}>${courseData.originalPrice}</Typography>
                                    </Stack>
                                    <Typography sx={{ color: colors.success, fontWeight: 600, fontSize: '0.8rem' }}>{courseData.discount}% OFF</Typography>
                                </Stack>

                                {/* Offer Timer */}
                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
                                    <ClockIcon sx={{ color: colors.error, fontSize: 16 }} />
                                    <Typography sx={{ color: colors.error, fontSize: '0.8rem', fontWeight: 500 }}>
                                        Offer ends in {courseData.offerEndsIn} days
                                    </Typography>
                                </Stack>

                                {/* Action Buttons */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => navigate('/checkout')}
                                    sx={{
                                        bgcolor: colors.primary,
                                        py: 1.25,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        borderRadius: 1,
                                        mb: 1.5,
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Enroll Now
                                </Button>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    sx={{
                                        borderColor: colors.border,
                                        color: colors.text,
                                        py: 1.25,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        borderRadius: 1,
                                        mb: 2,
                                        '&:hover': { borderColor: colors.textSecondary, bgcolor: 'transparent' }
                                    }}
                                >
                                    Download Syllabus
                                </Button>

                                {/* Course Details */}
                                <Stack spacing={1.5}>
                                    {[
                                        { icon: LevelIcon, label: 'Level', value: courseData.level },
                                        { icon: ClockIcon, label: 'Duration', value: courseData.duration },
                                        { icon: CertificateIcon, label: 'Certificate', value: courseData.certificate },
                                        { icon: CalendarIcon, label: 'Start Date', value: courseData.startDate }
                                    ].map((item, index) => (
                                        <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <item.icon sx={{ color: colors.textSecondary, fontSize: 18 }} />
                                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>{item.label}</Typography>
                                            </Stack>
                                            <Typography sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{item.value}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </CardContent>

                            {/* Money Back Guarantee - Card Footer */}
                            <Box sx={{
                                bgcolor: alpha(colors.textSecondary, 0.1),
                                p: 1.5,
                                textAlign: 'center',
                                borderTop: `1px solid ${colors.border}`
                            }}>
                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.75rem' }}>
                                    30-Day Money-Back Guarantee
                                </Typography>
                            </Box>
                        </Card>

                        {/* Training For Card */}
                        <Card sx={{
                            bgcolor: colors.card,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 1,
                            mt: 2,
                            p: 2.5
                        }}>
                            <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>Training For</Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {courseData.trainingFor.map((item, index) => (
                                    <Chip
                                        key={index}
                                        label={item}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(colors.primary, 0.2),
                                            color: colors.accent,
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Card>
                    </Box>
                </Stack>
            </Box>

            {/* Footer */}
            <Footer />
        </Box>
    );
};

export default CourseDetail;

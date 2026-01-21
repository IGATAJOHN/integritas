import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    InputBase,
    IconButton,
    Stack,
    Button,
    Chip,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Avatar,
    Checkbox,
    FormControlLabel,
    Radio,
    RadioGroup,
    useTheme,
    alpha,
    Divider,
    Menu,
    MenuItem,
    Collapse
} from '@mui/material';
import {
    Search as SearchIcon,
    NotificationsNone as BellIcon,
    PersonOutline as UserIcon,
    PlayArrow as PlayIcon,
    BookmarkBorder as BookmarkIcon,
    CheckCircle as CheckCircleIcon,
    Star as StarIcon,
    AccessTime as ClockIcon,
    FilterList as FilterIcon,
    ExpandMore as ChevronDownIcon,
    School as SchoolIcon,
    SignalCellularAlt as LevelIcon,
    Sort as SortIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { Drawer } from '@mui/material';
import logo from '../../../assets/images/GGH_icon.png';
import CourseCard from '../components/CourseCard';

class Course {
    constructor(id, title, description, instructor, type, level, rating, reviews, duration, image) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.instructor = instructor;
        this.type = type;
        this.level = level;
        this.rating = rating;
        this.reviews = reviews;
        this.duration = duration;
        this.image = image;
    }
}

const Explore = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [activeTopic, setActiveTopic] = useState('All Topics');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        Topic: ['Public Administration'],
        Level: [],
        Rating: 0
    });
    const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const [sortBy, setSortBy] = useState('Most Popular');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [expandedFilters, setExpandedFilters] = useState({
        Topic: true,
        Level: true,
        Rating: true
    });

    const toggleFilterSection = (section) => {
        setExpandedFilters(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleSortClick = (event) => {
        setSortAnchorEl(event.currentTarget);
    };

    const handleSortClose = (option) => {
        if (typeof option === 'string') setSortBy(option);
        setSortAnchorEl(null);
    };

    const handleFilterChange = (sectionTitle, item, type) => {
        setFilters(prev => {
            if (type === 'radio') {
                return { ...prev, [sectionTitle]: item };
            } else {
                const current = prev[sectionTitle] || [];
                const next = current.includes(item)
                    ? current.filter(i => i !== item)
                    : [...current, item];
                return { ...prev, [sectionTitle]: next };
            }
        });
    };

    const resetFilters = () => {
        setFilters({
            Topic: [],
            Level: [],
            Rating: ''
        });
    };

    const topics = [
        'All Topics', 'Ethics', 'Public Administration', 'Digital Governance', 'Leadership', 'Policy Making'
    ];

    const courses = [
        new Course(
            1,
            'Cybersecurity for Public Sector',
            'Protecting critical infrastructure and sensitive citizen data from modern cyber threats.',
            'Tech Institute',
            'institution',
            'Advanced',
            4.5,
            230,
            '20h 00m',
            'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80'
        ),
        new Course(
            2,
            'Ethical Leadership in Government',
            'A comprehensive guide to maintaining integrity and ethical standards in public office.',
            'Prof. J. Doe',
            'individual',
            'Beginner',
            4.9,
            85,
            '8h 15m',
            'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80'
        ),
        new Course(
            3,
            'Introduction to Civic Data Analytics',
            'Learn how to leverage big data to make informed policy decisions and optimize public services.',
            'Dr. A. Smith',
            'individual',
            'Intermediate',
            4.8,
            120,
            '12h 30m',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80'
        ),
        new Course(
            4,
            'Public Policy Fundamentals',
            'Understanding the principles and processes behind effective policy-making in democratic societies.',
            'Policy Academy',
            'institution',
            'Beginner',
            4.7,
            312,
            '10h 45m',
            'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80'
        ),
        new Course(
            5,
            'Digital Transformation in Government',
            'Strategies for modernizing public services through technology and innovation.',
            'Dr. M. Johnson',
            'individual',
            'Intermediate',
            4.6,
            198,
            '15h 20m',
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80'
        )
    ];

    const colors = {
        bg: '#080D19',
        paper: '#0C1322',
        card: 'rgba(28, 31, 39, 1)',
        text: '#FFFFFF',
        textSecondary: '#94A3B8',
        primary: '#2563EB',
        accent: '#3B82F6',
        warning: '#F59E0B'
    };

    const FilterContent = () => (
        <>
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Filters
                    </Typography>
                    <Typography
                        variant="caption"
                        onClick={resetFilters}
                        sx={{ color: colors.primary, cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                    >
                        Reset
                    </Typography>
                </Stack>
            </Box>

            {[
                { title: 'Topic', items: ['Ethics & Integrity', 'Public Administration', 'Digital Governance', 'Civic Leadership', 'Policy Analysis'], type: 'checkbox' },
                { title: 'Level', items: ['Beginner', 'Intermediate', 'Expert'], type: 'checkbox' }
            ].map((section, index, array) => (
                <React.Fragment key={section.title}>
                    <Box>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            onClick={() => toggleFilterSection(section.title)}
                            sx={{
                                mb: 2,
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 }
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {section.title}
                            </Typography>
                            <ChevronDownIcon sx={{
                                fontSize: 16,
                                color: colors.textSecondary,
                                transform: expandedFilters[section.title] ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease'
                            }} />
                        </Stack>
                        <Collapse in={expandedFilters[section.title]}>
                            <Stack spacing={1}>
                                {section.items.map((item) => (
                                    <FormControlLabel
                                        key={item}
                                        control={
                                            section.type === 'checkbox' ? (
                                                <Checkbox
                                                    size="small"
                                                    checked={filters[section.title]?.includes(item)}
                                                    onChange={() => handleFilterChange(section.title, item, 'checkbox')}
                                                    sx={{ color: colors.textSecondary, '&.Mui-checked': { color: colors.primary } }}
                                                />
                                            ) : (
                                                <Radio
                                                    size="small"
                                                    checked={filters[section.title] === item}
                                                    onChange={() => handleFilterChange(section.title, item, 'radio')}
                                                    sx={{ color: colors.textSecondary, '&.Mui-checked': { color: colors.primary } }}
                                                />
                                            )
                                        }
                                        label={
                                            section.title === 'Rating' ? (
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    {[1, 2, 3, 4, 5].map((star) => {
                                                        const ratingValue = parseFloat(item.split(' ')[0]);
                                                        return (
                                                            <StarIcon
                                                                key={star}
                                                                sx={{
                                                                    fontSize: 16,
                                                                    color: star <= Math.floor(ratingValue) ? colors.warning :
                                                                        star === Math.ceil(ratingValue) && ratingValue % 1 !== 0 ? colors.warning :
                                                                            'rgba(255, 255, 255, 0.2)'
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                    <Typography variant="body2" sx={{
                                                        color: filters[section.title] === item ? colors.text : colors.textSecondary,
                                                        fontSize: '0.85rem',
                                                        ml: 0.5
                                                    }}>
                                                        {item}
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                <Typography variant="body2" sx={{ color: (section.type === 'checkbox' ? filters[section.title]?.includes(item) : filters[section.title] === item) ? colors.text : colors.textSecondary, fontSize: '0.85rem' }}>
                                                    {item}
                                                </Typography>
                                            )
                                        }
                                        sx={{ m: 0 }}
                                    />
                                ))}
                            </Stack>
                        </Collapse>
                    </Box>
                    {index < array.length - 1 && (
                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', mb: 4 }} />
                    )}
                </React.Fragment>
            ))}

            {/* Rating Section with Interactive Stars */}
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', mb: 4 }} />
            <Box sx={{ mb: 4 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    onClick={() => toggleFilterSection('Rating')}
                    sx={{
                        mb: 2,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                    }}
                >
                    <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Rating
                    </Typography>
                    <ChevronDownIcon sx={{
                        fontSize: 16,
                        color: colors.textSecondary,
                        transform: expandedFilters['Rating'] ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                    }} />
                </Stack>
                <Collapse in={expandedFilters['Rating']}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <IconButton
                                key={star}
                                onClick={() => setFilters(prev => ({ ...prev, Rating: prev.Rating === star ? 0 : star }))}
                                sx={{
                                    p: 0.5,
                                    '&:hover': { bgcolor: 'transparent' }
                                }}
                            >
                                <StarIcon
                                    sx={{
                                        fontSize: 24,
                                        color: star <= filters.Rating ? colors.warning : 'rgba(255, 255, 255, 0.2)',
                                        cursor: 'pointer',
                                        transition: 'color 0.2s ease',
                                        '&:hover': { color: colors.warning }
                                    }}
                                />
                            </IconButton>
                        ))}
                        {filters.Rating > 0 && (
                            <Typography variant="body2" sx={{ color: colors.textSecondary, ml: 1 }}>
                                {filters.Rating}+ stars
                            </Typography>
                        )}
                    </Stack>
                </Collapse>
            </Box>
        </>
    );

    return (
        <Box sx={{ bgcolor: colors.bg, color: colors.text, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box component="header" sx={{
                bgcolor: colors.paper,
                px: { xs: 2, md: '40px' },
                py: '12px',
                height: { xs: 'auto', md: '65px' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxSizing: 'border-box',
                gap: 2
            }}>
                <Stack direction="row" alignItems="center" spacing={{ xs: 2, sm: 3, md: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box component="img" src={logo} alt="GGH Logo" sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 }, objectFit: 'contain' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: { xs: '0.9rem', sm: '1rem' } }}>Good Governance Hub</Typography>
                    </Stack>

                    <Box sx={{
                        bgcolor: colors.card,
                        borderRadius: 2,
                        px: 2,
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        gap: 1,
                        width: '231px',
                        height: '40px',
                        boxSizing: 'border-box'
                    }}>
                        <SearchIcon sx={{ color: colors.textSecondary, fontSize: 20 }} />
                        <InputBase
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                color: colors.text,
                                fontSize: '0.9rem',
                                width: '100%',
                                height: '100%',
                                '& input': { border: 'none', padding: 0, outline: 'none', height: '100%' },
                                '& .MuiInputBase-input:focus': { outline: 'none', boxShadow: 'none' }
                            }}
                        />
                    </Box>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
                    <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', lg: 'flex' }, mr: 2 }}>
                        {['Explore', 'My Learning', 'Community', 'Resources'].map((link) => (
                            <Typography
                                key={link}
                                component="a"
                                href="#"
                                sx={{
                                    color: link === 'Explore' ? colors.text : colors.textSecondary,
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
                    <Stack direction="row" spacing={{ xs: 1, sm: 2 }}>
                        <IconButton sx={{ bgcolor: colors.card, color: colors.text, borderRadius: 2, '&:hover': { bgcolor: alpha(colors.card, 0.8) } }}>
                            <BellIcon fontSize="small" />
                        </IconButton>
                        <IconButton sx={{ bgcolor: colors.card, color: colors.text, borderRadius: 2, '&:hover': { bgcolor: alpha(colors.card, 0.8) } }}>
                            <UserIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            onClick={() => setIsMobileFilterOpen(true)}
                            sx={{
                                display: { xs: 'flex', md: 'none' },
                                bgcolor: colors.card,
                                color: colors.text,
                                borderRadius: 2,
                                '&:hover': { bgcolor: alpha(colors.card, 0.8) }
                            }}
                        >
                            <FilterIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Stack>
            </Box>

            <Box sx={{ display: 'flex', flex: 1 }}>
                {/* Mobile Filter Drawer */}
                <Drawer
                    anchor="left"
                    open={isMobileFilterOpen}
                    onClose={() => setIsMobileFilterOpen(false)}
                    PaperProps={{
                        sx: {
                            width: 280,
                            bgcolor: colors.paper,
                            color: colors.text,
                            p: 3,
                            boxSizing: 'border-box'
                        }
                    }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Filters</Typography>
                        <IconButton onClick={() => setIsMobileFilterOpen(false)} sx={{ color: colors.text }}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                    <FilterContent />
                </Drawer>

                {/* Desktop Sidebar */}
                <Box component="aside" sx={{
                    width: 290,
                    p: 3,
                    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                    bgcolor: colors.paper,
                    display: { xs: 'none', md: 'block' },
                    position: 'sticky',
                    top: '65px',
                    height: 'calc(100vh - 65px)',
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                    <FilterContent />
                </Box>

                {/* Content Area */}
                <Box component="main" sx={{
                    flex: 1,
                    px: { xs: 2, md: '48px' },
                    pb: { xs: 4, md: '48px' },
                    pt: 4,
                    maxWidth: 1640,
                    mx: 'auto',
                    minHeight: { md: '1186px' },
                    boxSizing: 'border-box',
                    width: '100%'
                }}>
                    {/* Featured Banner */}
                    <Card sx={{
                        bgcolor: colors.card,
                        borderRadius: '16px',
                        p: { xs: 3, md: '32px' },
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '24px',
                        mb: 6,
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: 'none',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxSizing: 'border-box'
                    }}>
                        <Box sx={{
                            zIndex: 1,
                            width: { xs: '100%', md: '50%' },
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '24px'
                        }}>
                            <Box
                                sx={{
                                    bgcolor: alpha(colors.primary, 0.2),
                                    color: colors.accent,
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 50,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    width: 'fit-content',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: colors.accent,
                                    }}
                                />
                                Featured Course
                            </Box>
                            <Box sx={{
                                height: { md: '146px' },
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                justifyContent: 'center'
                            }}>
                                <Typography variant="h3" sx={{
                                    fontWeight: 900,
                                    fontSize: { xs: '24px', sm: '30px', md: '36px' },
                                    lineHeight: { xs: '32px', md: '40px' },
                                    letterSpacing: '-0.9px'
                                }}>
                                    Mastering Public Policy: Advanced Strategies
                                </Typography>
                                <Typography variant="body1" sx={{
                                    color: colors.textSecondary,
                                    fontWeight: 400,
                                    fontSize: { xs: '14px', md: '18px' },
                                    lineHeight: { xs: '22px', md: '28px' },
                                    letterSpacing: '0%',
                                    maxWidth: '672px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    Enhance your governance skills with our top-rated curriculum designed for modern public servants. Learn from world-class experts.
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/explore/course/1')}
                                    sx={{
                                        bgcolor: colors.primary,
                                        color: colors.text,
                                        width: '144px',
                                        height: '48px',
                                        pt: '11.5px',
                                        pr: '24px',
                                        pb: '12.5px',
                                        pl: '24px',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        borderRadius: '8px'
                                    }}>
                                    View Course
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => setIsPlayingTrailer(true)}
                                    sx={{
                                        borderColor: 'rgba(255, 255, 255, 0.1)',
                                        color: colors.text,
                                        height: '48px',
                                        px: 3,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)' }
                                    }}
                                >
                                    Watch Trailer
                                </Button>
                            </Stack>
                        </Box>
                        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: { xs: '100%', md: '50%' } }}>
                            <Box sx={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '16/9',
                                maxWidth: '615px'
                            }}>
                                {isPlayingTrailer ? (
                                    <Box sx={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                                            title="Course Trailer"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                        <IconButton
                                            onClick={() => setIsPlayingTrailer(false)}
                                            sx={{
                                                position: 'absolute',
                                                top: -40,
                                                right: 0,
                                                color: colors.text,
                                                bgcolor: 'rgba(0,0,0,0.5)',
                                                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                                            }}
                                        >
                                            <ChevronDownIcon sx={{ transform: 'rotate(90deg)' }} />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <>
                                        <Box
                                            component="img"
                                            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80"
                                            alt="Course Preview"
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '12px',
                                                objectFit: 'cover',
                                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                                            }}
                                        />
                                        <Box
                                            onClick={() => setIsPlayingTrailer(true)}
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: 60,
                                                height: 60,
                                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                                backdropFilter: 'blur(4px)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: colors.text,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                                                    transform: 'translate(-50%, -50%) scale(1.1)'
                                                }
                                            }}
                                        >
                                            <PlayIcon sx={{ fontSize: 32 }} />
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Card>

                    {/* Explore Courses Heading & Filters */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        sx={{
                            mb: 4,
                            height: { xs: 'auto', sm: '56px' },
                            width: '100%',
                            maxWidth: '1640px',
                            gap: 2
                        }}
                    >
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, color: colors.text }}>
                                Explore Courses
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                Find the perfect course to advance your career
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                            <Box sx={{
                                bgcolor: colors.card,
                                borderRadius: 2,
                                px: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                width: { xs: '100%', sm: '276px' },
                                height: '42px',
                                boxSizing: 'border-box'
                            }}>
                                <SearchIcon sx={{ color: colors.textSecondary, fontSize: 18 }} />
                                <InputBase
                                    placeholder="Search topics, instructors..."
                                    sx={{
                                        color: colors.text,
                                        fontSize: '0.85rem',
                                        width: '100%',
                                        height: '100%',
                                        '& input': { border: 'none', padding: 0, outline: 'none', height: '100%' },
                                        '& .MuiInputBase-input:focus': { outline: 'none', boxShadow: 'none' }
                                    }}
                                />
                            </Box>
                            <Box
                                onClick={handleSortClick}
                                sx={{
                                    bgcolor: colors.card,
                                    borderRadius: '8px',
                                    px: 2,
                                    width: { xs: '100%', sm: '180px' },
                                    height: '42px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 1,
                                    cursor: 'pointer',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxSizing: 'border-box',
                                    '&:hover': {
                                        bgcolor: alpha(colors.card, 0.8)
                                    }
                                }}
                            >
                                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500, color: colors.text }}>
                                    {sortBy}
                                </Typography>
                                <SortIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                            </Box>
                            <Menu
                                anchorEl={sortAnchorEl}
                                open={Boolean(sortAnchorEl)}
                                onClose={() => handleSortClose()}
                                PaperProps={{
                                    sx: {
                                        bgcolor: colors.card,
                                        color: colors.text,
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        mt: 1,
                                        '& .MuiMenuItem-root': {
                                            fontSize: '0.85rem',
                                            '&:hover': {
                                                bgcolor: alpha(colors.primary, 0.1)
                                            }
                                        }
                                    }
                                }}
                            >
                                {['Most Popular', 'Newest', 'Highest Rated', 'Price: Low to High'].map((option) => (
                                    <MenuItem
                                        key={option}
                                        onClick={() => handleSortClose(option)}
                                        selected={sortBy === option}
                                    >
                                        {option}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Stack>
                    </Stack>

                    {/* Topic Chips */}
                    <Stack direction="row" spacing={1.5} sx={{ mb: 4, flexWrap: 'wrap', gap: 1.5 }}>
                        {topics.map(topic => (
                            <Chip
                                key={topic}
                                label={topic}
                                onClick={() => setActiveTopic(topic)}
                                sx={{
                                    bgcolor: activeTopic === topic ? colors.primary : colors.card,
                                    color: activeTopic === topic ? colors.text : colors.textSecondary,
                                    fontWeight: 500,
                                    px: 1,
                                    '&:hover': { bgcolor: activeTopic === topic ? colors.primary : alpha(colors.card, 0.8) }
                                }}
                            />
                        ))}
                    </Stack>

                    {/* Course Grid */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            lg: 'repeat(3, 1fr)'
                        },
                        gap: 3
                    }}>
                        {courses.map(course => (
                            <CourseCard key={course.id} course={course} colors={colors} />
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box >
    );
};

export default Explore;

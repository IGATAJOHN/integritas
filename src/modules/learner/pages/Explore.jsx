import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    Checkbox,
    Chip,
    CircularProgress,
    Divider,
    Drawer,
    FormControlLabel,
    IconButton,
    InputBase,
    Menu,
    MenuItem,
    Stack,
    Typography,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Close as CloseIcon,
    FilterList as FilterIcon,
    OpenInNew as OpenInNewIcon,
    School as SchoolIcon,
    Search as SearchIcon,
    Sort as SortIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import CourseCard from '../components/CourseCard';
import { courseCatalogService } from '../services';
import Header from '../../../components/Header';
import { useThemeMode } from '../../../contexts';
import appTheme from '../../../styles/theme';

const SORT_OPTIONS = ['Most Popular', 'Newest', 'Highest Rated', 'Price: Low to High'];

const mapSortBy = (value) => {
    if (value === 'Newest') return 'newest';
    if (value === 'Highest Rated') return 'highest_rated';
    if (value === 'Price: Low to High') return 'price_asc';
    return 'popular';
};

const PAGE_TITLES = {
    foundational: { heading: 'Foundational Courses', sub: 'Core governance and policy foundations.' },
    experta: { heading: 'Exemplar Class', sub: 'Advanced expert-level governance courses.' },
    default: { heading: 'Explore Courses', sub: 'Discover governance and policy courses.' },
};

const Explore = ({ type }) => {
    const navigate = useNavigate();
    const { isDark } = useThemeMode();

    const colors = {
        bg: isDark ? '#080D19' : '#F1F5F9',
        paper: isDark ? '#0C1322' : '#FFFFFF',
        card: isDark ? 'rgba(28, 31, 39, 1)' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1E293B',
        textSecondary: isDark ? '#94A3B8' : '#64748B',
        primary: appTheme.colors.brand,
        warning: '#F59E0B',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    };
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('Most Popular');
    const [activeTopic, setActiveTopic] = useState('All Topics');
    const [selectedLevels, setSelectedLevels] = useState([]);
    const [minimumRating, setMinimumRating] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortAnchorEl, setSortAnchorEl] = useState(null);

    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [accessMap, setAccessMap] = useState({});
    const [featuredCourse, setFeaturedCourse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Guards so featured course and categories are only populated from the
    // first unfiltered load — prevents re-render loops.
    const featuredSet = useRef(false);
    const categoriesSet = useRef(false);

    const topics = useMemo(() => ['All Topics', ...categories.map((c) => c.name).filter(Boolean)], [categories]);

    const levels = useMemo(() => {
        const values = new Set();
        courses.forEach((course) => {
            const level = String(course?.level || '').trim();
            if (level) values.add(level);
        });
        selectedLevels.forEach((level) => values.add(level));
        return Array.from(values);
    }, [courses, selectedLevels]);

    useEffect(() => {
        let active = true;

        const timer = setTimeout(async () => {
            setLoading(true);
            setError('');
            try {
                // Derive slug from topic label directly — avoids needing `categories`
                // in the deps array, which would cause a re-run loop on first load.
                const selectedCategory = activeTopic === 'All Topics'
                    ? undefined
                    : activeTopic.toLowerCase().replace(/\s+/g, '-');

                const fetchParams = {
                    q: searchTerm.trim() || undefined,
                    level: selectedLevels[0] || undefined,
                    sort: mapSortBy(sortBy),
                    per_page: 30,
                };

                const response = type === 'foundational'
                    ? await courseCatalogService.listFoundationalCourses(fetchParams)
                    : type === 'experta'
                        ? await courseCatalogService.listExpertiaCourses(fetchParams)
                        : await courseCatalogService.listCourses({ ...fetchParams, category: selectedCategory });

                if (!active) return;

                let rows = response.data || [];
                if (selectedLevels.length > 0) rows = rows.filter((c) => selectedLevels.includes(c.level));
                if (minimumRating > 0) rows = rows.filter((c) => Number(c.rating || 0) >= minimumRating);
                setCourses(rows);

                // Essential-course badges removed — track is now exposed directly
                // on each course (foundational | expert).
                if (rows.length > 0) {
                    const map = {};
                    rows.forEach((c) => {
                        map[c.id] = { track: c.track || c.raw?.track };
                    });
                    setAccessMap(map);
                }

                // Set featured course once from the first batch of results.
                if (!featuredSet.current && rows.length > 0) {
                    featuredSet.current = true;
                    setFeaturedCourse(rows[0]);
                }

                // Derive categories once from the initial unfiltered load.
                if (!categoriesSet.current && activeTopic === 'All Topics' && !searchTerm && selectedLevels.length === 0) {
                    const names = new Set();
                    rows.forEach((c) => (c.topics || []).forEach((t) => { if (t) names.add(t); }));
                    if (names.size > 0) {
                        categoriesSet.current = true;
                        setCategories(Array.from(names).map((name) => ({
                            id: name.toLowerCase().replace(/\s+/g, '-'),
                            name,
                            slug: name.toLowerCase().replace(/\s+/g, '-'),
                        })));
                    }
                }
            } catch (requestError) {
                if (!active) return;
                setCourses([]);
                setError(requestError?.status === 401
                    ? 'Please log in to view courses.'
                    : (requestError?.message || 'Failed to load courses.'));
            } finally {
                if (active) setLoading(false);
            }
        }, 250);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    // `categories` intentionally excluded — slug is derived from activeTopic directly.
    // `featuredCourse` intentionally excluded — guarded by featuredSet ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTopic, minimumRating, searchTerm, selectedLevels, sortBy]);

    const resetFilters = () => {
        setActiveTopic('All Topics');
        setSelectedLevels([]);
        setMinimumRating(0);
    };

    const toggleLevel = (level) => {
        setSelectedLevels((prev) => prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]);
    };

    const featuredCourseId = String(featuredCourse?.id || '').trim();

    const renderFilters = () => (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ color: colors.text, fontWeight: 700, fontSize: '0.85rem' }}>Filters</Typography>
                <Typography onClick={resetFilters} sx={{ color: colors.primary, cursor: 'pointer', fontSize: '0.8rem' }}>Reset</Typography>
            </Stack>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
            <Typography sx={{ color: colors.textSecondary, mb: 1, fontSize: '0.8rem' }}>Level</Typography>
            <Stack>
                {levels.length === 0 ? (
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.85rem' }}>No levels available yet.</Typography>
                ) : levels.map((level) => (
                    <FormControlLabel
                        key={level}
                        control={<Checkbox checked={selectedLevels.includes(level)} onChange={() => toggleLevel(level)} sx={{ color: colors.textSecondary, '&.Mui-checked': { color: colors.primary } }} />}
                        label={<Typography sx={{ color: colors.text, fontSize: '0.85rem' }}>{level}</Typography>}
                    />
                ))}
            </Stack>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2 }} />
            <Typography sx={{ color: colors.textSecondary, mb: 1, fontSize: '0.8rem' }}>Minimum Rating</Typography>
            <Stack direction="row" spacing={0.5}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <IconButton key={star} onClick={() => setMinimumRating((prev) => (prev === star ? 0 : star))} sx={{ p: 0.5 }}>
                        <StarIcon sx={{ color: star <= minimumRating ? colors.warning : colors.border }} />
                    </IconButton>
                ))}
            </Stack>
        </Box>
    );

    return (
        <Box sx={{ bgcolor: colors.bg, color: colors.text, minHeight: '100%' }}>
            <Header />
            <Drawer open={isFilterOpen} onClose={() => setIsFilterOpen(false)} PaperProps={{ sx: { width: 280, p: 3, bgcolor: colors.paper, color: colors.text } }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography sx={{ color: colors.text, fontWeight: 700 }}>Filters</Typography>
                    <IconButton onClick={() => setIsFilterOpen(false)} sx={{ color: colors.text }}><CloseIcon /></IconButton>
                </Stack>
                {renderFilters()}
            </Drawer>

            <Box sx={{ display: 'flex' }}>
                {/* Sidebar filters — desktop */}
                <Box sx={{ width: 280, p: 3, bgcolor: colors.paper, borderRight: `1px solid ${colors.border}`, display: { xs: 'none', md: 'block' } }}>
                    {renderFilters()}
                </Box>

                <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {/* Featured Course Banner */}
                    <Card sx={{ bgcolor: colors.card, p: 3, mb: 3, border: `1px solid ${colors.border}` }}>
                        {!featuredCourse && loading ? (
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <CircularProgress size={20} />
                                <Typography sx={{ color: colors.textSecondary }}>Loading featured course...</Typography>
                            </Stack>
                        ) : (
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                                <Box sx={{ maxWidth: 760 }}>
                                    <Typography sx={{ color: colors.primary, fontSize: '0.78rem', fontWeight: 700, mb: 1 }}>FEATURED COURSE</Typography>
                                    <Typography variant="h4" sx={{ color: colors.text, fontWeight: 800, mb: 1 }}>
                                        {featuredCourse?.title || 'No featured course available'}
                                    </Typography>
                                    <Typography sx={{ color: colors.textSecondary, mb: 2 }}>
                                        {featuredCourse?.description || 'Courses will appear here once available.'}
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant="contained"
                                            onClick={() => featuredCourseId && navigate(`/explore/course/${featuredCourseId}`)}
                                            disabled={!featuredCourseId}
                                            sx={{ textTransform: 'none', bgcolor: colors.primary }}
                                        >
                                            View Course
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => window.open(featuredCourse?.trailerUrl, '_blank', 'noopener,noreferrer')}
                                            disabled={!featuredCourse?.trailerUrl}
                                            endIcon={<OpenInNewIcon />}
                                            sx={{ textTransform: 'none', color: colors.text, borderColor: colors.border }}
                                        >
                                            Watch Trailer
                                        </Button>
                                    </Stack>
                                </Box>
                                {featuredCourse?.image ? (
                                    <Box
                                        component="img"
                                        src={featuredCourse.image}
                                        alt={featuredCourse.title || 'featured'}
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        sx={{ width: { xs: '100%', md: 320 }, height: { xs: 180, md: 190 }, objectFit: 'cover', borderRadius: 2 }}
                                    />
                                ) : (
                                    <Box sx={{ width: { xs: '100%', md: 320 }, height: { xs: 180, md: 190 }, borderRadius: 2, bgcolor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <SchoolIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.15)' }} />
                                    </Box>
                                )}
                            </Stack>
                        )}
                    </Card>

                    {/* Heading + Search + Sort */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
                        <Box>
                            <Typography variant="h5" sx={{ color: colors.text, fontWeight: 800 }}>{(PAGE_TITLES[type] || PAGE_TITLES.default).heading}</Typography>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.9rem' }}>{(PAGE_TITLES[type] || PAGE_TITLES.default).sub}</Typography>
                        </Box>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                            <Box sx={{ bgcolor: colors.card, px: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', minWidth: 260 }}>
                                <SearchIcon sx={{ color: colors.textSecondary, mr: 1 }} />
                                <InputBase
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search courses..."
                                    sx={{ color: colors.text, width: '100%' }}
                                />
                            </Box>
                            <Button
                                onClick={(e) => setSortAnchorEl(e.currentTarget)}
                                startIcon={<SortIcon />}
                                sx={{ color: colors.text, border: `1px solid ${colors.border}`, textTransform: 'none' }}
                            >
                                {sortBy}
                            </Button>
                            <IconButton
                                onClick={() => setIsFilterOpen(true)}
                                sx={{ display: { xs: 'inline-flex', md: 'none' }, color: colors.text, border: `1px solid ${colors.border}` }}
                            >
                                <FilterIcon />
                            </IconButton>
                            <Menu
                                anchorEl={sortAnchorEl}
                                open={Boolean(sortAnchorEl)}
                                onClose={() => setSortAnchorEl(null)}
                                PaperProps={{ sx: { bgcolor: colors.card, color: colors.text } }}
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <MenuItem
                                        key={option}
                                        selected={sortBy === option}
                                        onClick={() => { setSortBy(option); setSortAnchorEl(null); }}
                                    >
                                        {option}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Stack>
                    </Stack>

                    {/* Topic filter chips */}
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 3 }}>
                        {topics.map((topic) => (
                            <Chip
                                key={topic}
                                label={topic}
                                onClick={() => setActiveTopic(topic)}
                                sx={{ bgcolor: activeTopic === topic ? colors.primary : colors.card, color: colors.text }}
                            />
                        ))}
                    </Stack>

                    {/* Course grid */}
                    {loading ? (
                        <Box sx={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : courses.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', border: `1px dashed ${colors.border}`, borderRadius: 2 }}>
                            <Typography sx={{ color: colors.text, fontWeight: 600 }}>No courses found</Typography>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Try another search or filter.</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 2.5 }}>
                            {courses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    colors={colors}
                                    access={accessMap[course.id] || null}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Explore;

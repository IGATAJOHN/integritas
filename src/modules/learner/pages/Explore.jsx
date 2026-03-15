import React, { useEffect, useMemo, useState } from 'react';
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
    Close as CloseIcon,
    FilterList as FilterIcon,
    OpenInNew as OpenInNewIcon,
    Search as SearchIcon,
    Sort as SortIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import CourseCard from '../components/CourseCard';
import { courseCatalogService } from '../services';

const SORT_OPTIONS = ['Most Popular', 'Newest', 'Highest Rated', 'Price: Low to High'];

const colors = {
    bg: '#080D19',
    paper: '#0C1322',
    card: 'rgba(28, 31, 39, 1)',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    primary: '#2563EB',
    warning: '#F59E0B',
};

const mapSortBy = (value) => {
    if (value === 'Newest') return 'newest';
    if (value === 'Highest Rated') return 'highest_rated';
    if (value === 'Price: Low to High') return 'price_asc';
    return 'popular';
};

const Explore = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('Most Popular');
    const [activeTopic, setActiveTopic] = useState('All Topics');
    const [selectedLevels, setSelectedLevels] = useState([]);
    const [minimumRating, setMinimumRating] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortAnchorEl, setSortAnchorEl] = useState(null);

    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [featuredCourse, setFeaturedCourse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingFeatured, setLoadingFeatured] = useState(false);
    const [error, setError] = useState('');

    const featuredCoursePathId = String(featuredCourse?.id || '').trim();

    const topics = useMemo(() => ['All Topics', ...categories.map((item) => item.name).filter(Boolean)], [categories]);
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

        const loadMeta = async () => {
            setLoadingFeatured(true);
            try {
                const [categoryRes, featuredRes] = await Promise.all([
                    courseCatalogService.listCategories(),
                    courseCatalogService.getFeaturedCourses({ limit: 1 }),
                ]);
                if (!active) return;
                setCategories(categoryRes.data || []);
                setFeaturedCourse(featuredRes.data?.[0] || null);
            } catch (requestError) {
                if (!active) return;
                setError(requestError?.status === 401
                    ? 'Please log in to view courses.'
                    : (requestError?.message || 'Failed to load explore metadata.'));
            } finally {
                if (active) {
                    setLoadingFeatured(false);
                }
            }
        };

        loadMeta();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        let active = true;

        const timer = setTimeout(async () => {
            setLoading(true);
            setError('');
            try {
                const selectedCategory = activeTopic === 'All Topics'
                    ? undefined
                    : (categories.find((item) => item.name === activeTopic)?.slug || activeTopic);

                const response = await courseCatalogService.listCourses({
                    q: searchTerm.trim() || undefined,
                    category: selectedCategory,
                    level: selectedLevels[0] || undefined,
                    sort: mapSortBy(sortBy),
                    per_page: 30,
                });

                if (!active) return;

                let rows = response.data || [];
                if (selectedLevels.length > 0) rows = rows.filter((course) => selectedLevels.includes(course.level));
                if (minimumRating > 0) rows = rows.filter((course) => Number(course.rating || 0) >= minimumRating);
                setCourses(rows);
                if (!featuredCourse && rows.length > 0) setFeaturedCourse(rows[0]);
            } catch (requestError) {
                if (!active) return;
                setCourses([]);
                setError(requestError?.status === 401
                    ? 'Please log in to view courses.'
                    : (requestError?.message || 'Failed to load courses.'));
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }, 250);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [activeTopic, categories, featuredCourse, minimumRating, searchTerm, selectedLevels, sortBy]);

    const resetFilters = () => {
        setActiveTopic('All Topics');
        setSelectedLevels([]);
        setMinimumRating(0);
    };

    const toggleLevel = (level) => {
        setSelectedLevels((prev) => prev.includes(level) ? prev.filter((item) => item !== level) : [...prev, level]);
    };

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
                        <StarIcon sx={{ color: star <= minimumRating ? colors.warning : 'rgba(255,255,255,0.2)' }} />
                    </IconButton>
                ))}
            </Stack>
        </Box>
    );

    return (
        <Box sx={{ bgcolor: colors.bg, color: colors.text, minHeight: '100%' }}>
            <Drawer open={isFilterOpen} onClose={() => setIsFilterOpen(false)} PaperProps={{ sx: { width: 280, p: 3, bgcolor: colors.paper } }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography sx={{ color: colors.text, fontWeight: 700 }}>Filters</Typography>
                    <IconButton onClick={() => setIsFilterOpen(false)} sx={{ color: colors.text }}><CloseIcon /></IconButton>
                </Stack>
                {renderFilters()}
            </Drawer>

            <Box sx={{ display: 'flex' }}>
                <Box sx={{ width: 280, p: 3, bgcolor: colors.paper, borderRight: '1px solid rgba(255,255,255,0.05)', display: { xs: 'none', md: 'block' } }}>
                    {renderFilters()}
                </Box>

                <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Card sx={{ bgcolor: colors.card, p: 3, mb: 3, border: '1px solid rgba(255,255,255,0.08)' }}>
                        {loadingFeatured ? (
                            <Stack direction="row" spacing={1.5} alignItems="center"><CircularProgress size={20} /><Typography sx={{ color: colors.textSecondary }}>Loading featured course...</Typography></Stack>
                        ) : (
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                                <Box sx={{ maxWidth: 760 }}>
                                    <Typography sx={{ color: colors.primary, fontSize: '0.78rem', fontWeight: 700, mb: 1 }}>FEATURED COURSE</Typography>
                                    <Typography variant="h4" sx={{ color: colors.text, fontWeight: 800, mb: 1 }}>{featuredCourse?.title || 'No featured course available'}</Typography>
                                    <Typography sx={{ color: colors.textSecondary, mb: 2 }}>{featuredCourse?.description || 'Courses will appear here once available.'}</Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Button variant="contained" onClick={() => featuredCoursePathId && navigate(`/explore/course/${featuredCoursePathId}`)} disabled={!featuredCoursePathId} sx={{ textTransform: 'none', bgcolor: colors.primary }}>View Course</Button>
                                        <Button variant="outlined" onClick={() => window.open(featuredCourse?.trailerUrl, '_blank', 'noopener,noreferrer')} disabled={!featuredCourse?.trailerUrl} endIcon={<OpenInNewIcon />} sx={{ textTransform: 'none', color: colors.text, borderColor: 'rgba(255,255,255,0.18)' }}>Watch Trailer</Button>
                                    </Stack>
                                </Box>
                                <Box component="img" src={featuredCourse?.image || ''} alt={featuredCourse?.title || 'featured'} sx={{ width: { xs: '100%', md: 320 }, height: { xs: 180, md: 190 }, objectFit: 'cover', borderRadius: 2, bgcolor: '#111827' }} />
                            </Stack>
                        )}
                    </Card>

                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
                        <Box>
                            <Typography variant="h5" sx={{ color: colors.text, fontWeight: 800 }}>Explore Courses</Typography>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.9rem' }}>All course data is loaded from API endpoints.</Typography>
                        </Box>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                            <Box sx={{ bgcolor: colors.card, px: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', minWidth: 260 }}>
                                <SearchIcon sx={{ color: colors.textSecondary, mr: 1 }} />
                                <InputBase value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search courses..." sx={{ color: colors.text, width: '100%' }} />
                            </Box>
                            <Button onClick={(event) => setSortAnchorEl(event.currentTarget)} startIcon={<SortIcon />} sx={{ color: colors.text, border: '1px solid rgba(255,255,255,0.2)', textTransform: 'none' }}>{sortBy}</Button>
                            <IconButton onClick={() => setIsFilterOpen(true)} sx={{ display: { xs: 'inline-flex', md: 'none' }, color: colors.text, border: '1px solid rgba(255,255,255,0.2)' }}>
                                <FilterIcon />
                            </IconButton>
                            <Menu anchorEl={sortAnchorEl} open={Boolean(sortAnchorEl)} onClose={() => setSortAnchorEl(null)} PaperProps={{ sx: { bgcolor: colors.card, color: colors.text } }}>
                                {SORT_OPTIONS.map((option) => (
                                    <MenuItem key={option} selected={sortBy === option} onClick={() => { setSortBy(option); setSortAnchorEl(null); }}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 3 }}>
                        {topics.map((topic) => (
                            <Chip key={topic} label={topic} onClick={() => setActiveTopic(topic)} sx={{ bgcolor: activeTopic === topic ? colors.primary : colors.card, color: colors.text }} />
                        ))}
                    </Stack>

                    {loading ? (
                        <Box sx={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
                    ) : courses.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 2 }}>
                            <Typography sx={{ color: colors.text, fontWeight: 600 }}>No courses found</Typography>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Try another search or filter.</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 2.5 }}>
                            {courses.map((course) => (
                                <CourseCard key={course.id} course={course} colors={colors} />
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Explore;

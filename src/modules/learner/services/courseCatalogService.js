import { apiService } from '../../../services/api';
import { getImageUrl } from '../../../utils';

const toTrimmedString = (value) => String(value ?? '').trim();

const toNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const normalizeLevel = (value) => {
    const normalized = toTrimmedString(value).toLowerCase();
    if (!normalized) return 'Unspecified';
    if (normalized === 'beginner') return 'Beginner';
    if (normalized === 'intermediate') return 'Intermediate';
    if (normalized === 'advanced') return 'Advanced';
    if (normalized === 'expert') return 'Expert';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatDuration = (value) => {
    if (!value && value !== 0) return 'TBD';

    if (typeof value === 'number') {
        const totalMinutes = Math.max(0, Math.round(value));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours === 0) return `${minutes}m`;
        return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }

    const text = toTrimmedString(value);
    if (!text) return 'TBD';
    return text;
};

const unwrapList = (res) => {
    if (!res) return { data: [], meta: {}, links: {} };

    if (Array.isArray(res)) {
        return { data: res, meta: {}, links: {} };
    }

    if (Array.isArray(res.data)) {
        return { data: res.data, meta: res.meta || {}, links: res.links || {} };
    }

    if (res.data && Array.isArray(res.data.data)) {
        return {
            data: res.data.data,
            meta: {
                current_page: res.data.current_page,
                from: res.data.from,
                last_page: res.data.last_page,
                path: res.data.path,
                per_page: res.data.per_page,
                to: res.data.to,
                total: res.data.total,
                links: res.data.links || [],
            },
            links: {
                first: res.data.first_page_url,
                last: res.data.last_page_url,
                prev: res.data.prev_page_url,
                next: res.data.next_page_url,
            },
        };
    }

    if (Array.isArray(res.courses)) {
        return { data: res.courses, meta: res.meta || {}, links: res.links || {} };
    }

    if (Array.isArray(res.results)) {
        return { data: res.results, meta: res.meta || {}, links: res.links || {} };
    }

    return { data: [], meta: res.meta || {}, links: res.links || {} };
};

const readCategoryNames = (course = {}) => {
    const fromCategories = Array.isArray(course.categories)
        ? course.categories
            .map((item) => toTrimmedString(item?.name || item?.title || item?.slug || item))
            .filter(Boolean)
        : [];

    const direct = [
        course.category_name,
        course.category,
        course.topic,
    ]
        .map((item) => toTrimmedString(item?.name || item?.title || item?.slug || item))
        .filter(Boolean);

    const unique = new Set([...fromCategories, ...direct]);
    return Array.from(unique);
};

const normalizeCourse = (course = {}) => {
    const slug = toTrimmedString(course.slug);
    const id = toTrimmedString(course.id || course.course_id || slug || course.uuid);
    const categoryNames = readCategoryNames(course);
    const rating = toNumber(
        course.rating?.average ??
        course.average_rating ??
        course.avg_rating ??
        course.rating
    );
    const reviews = toNumber(
        course.rating?.count ??
        course.review_count ??
        course.reviews_count ??
        course.ratings_count
    );

    const instructorName = toTrimmedString(
        course.tutor?.name ||
        course.user?.name ||
        course.creator?.name ||
        course.created_by?.name ||
        course.tutor?.user?.name ||
        course.user?.full_name ||
        course.creator?.full_name ||
        course.created_by?.full_name ||
        course.tutors?.[0]?.name ||
        course.tutors?.[0]?.user?.name ||
        course.instructor?.name ||
        course.author?.name ||
        course.organization?.name ||
        course.org?.name
    ) || 'Integritas';

    const description =
        toTrimmedString(course.short_description) ||
        toTrimmedString(course.summary) ||
        toTrimmedString(course.description) ||
        'No description available yet.';

    const level = normalizeLevel(course.level || course.difficulty || course.difficulty_level);
    const image = getImageUrl(
        course.thumbnail_url ||
        course.thumbnail ||
        course.cover_image_url ||
        course.cover_image ||
        course.image_url ||
        course.image
    );

    return {
        id,
        raw: course,
        slug,
        title: toTrimmedString(course.title || course.name || 'Untitled Course'),
        description,
        instructor: instructorName,
        type: course.organization || course.org || course.organization_id ? 'institution' : 'individual',
        level,
        rating,
        reviews,
        duration: formatDuration(
            course.duration_text ||
            course.duration ||
            course.total_duration ||
            course.duration_minutes
        ),
        image,
        topics: categoryNames,
        topic: categoryNames[0] || '',
        trailerUrl: getImageUrl(
            course.trailer_url ||
            course.preview_video_url ||
            course.intro_video_url
        ),
        createdAt: course.created_at || course.createdAt || null,
        price: toNumber(course.price, 0),
    };
};

const buildQuery = (params = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        search.append(key, String(value));
    });
    const query = search.toString();
    return query ? `?${query}` : '';
};

const mapSortToApi = (sort) => {
    const normalized = toTrimmedString(sort).toLowerCase();
    if (!normalized) return undefined;
    if (normalized === 'newest') return 'newest';
    if (normalized === 'highest_rated' || normalized === 'highest rated') return 'highest_rated';
    if (normalized === 'price_asc' || normalized.includes('low')) return 'price_asc';
    if (normalized === 'price_desc' || normalized.includes('high')) return 'price_desc';
    return 'popular';
};

const matchesCategory = (course, category) => {
    const target = toTrimmedString(category).toLowerCase();
    if (!target) return true;

    const categoryValues = [
        ...(course.topics || []),
        course.topic,
        course.raw?.category_name,
        course.raw?.category?.name,
        course.raw?.category?.slug,
        ...(Array.isArray(course.raw?.categories)
            ? course.raw.categories.flatMap((item) => [item?.name, item?.slug, item?.title])
            : []),
    ]
        .map((value) => toTrimmedString(value).toLowerCase())
        .filter(Boolean);

    return categoryValues.includes(target);
};

const sortCourses = (courses = [], sort) => {
    const normalized = mapSortToApi(sort);
    const items = [...courses];

    if (normalized === 'newest') {
        return items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    if (normalized === 'highest_rated') {
        return items.sort((a, b) => {
            const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0);
            if (ratingDiff !== 0) return ratingDiff;
            return Number(b.reviews || 0) - Number(a.reviews || 0);
        });
    }

    if (normalized === 'price_asc') {
        return items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (normalized === 'price_desc') {
        return items.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    return items;
};

export const courseCatalogService = {
    listCourses: async ({
        q,
        category,
        level,
        sort = 'popular',
        status,
        language,
        page,
        per_page = 30,
        track,
    } = {}) => {
        const query = buildQuery({
            q,
            status,
            level,
            language,
            page,
            per_page,
            track,
        });

        const res = await apiService.get(`/catalogue/courses${query}`);
        const normalized = unwrapList(res);
        const filtered = (normalized.data || [])
            .map((item) => normalizeCourse(item))
            .filter((item) => item.id)
            .filter((item) => matchesCategory(item, category));

        return {
            data: sortCourses(filtered, sort),
            meta: normalized.meta || {},
            links: normalized.links || {},
        };
    },

    getCourseById: async (id) => {
        const originalIdentifier = toTrimmedString(id);
        let identifier = originalIdentifier;
        let res;
        if (/^\d+$/.test(originalIdentifier)) {
            const list = await courseCatalogService.listCourses({ per_page: 100 });
            const match = (list.data || []).find((course) => (
                String(course.raw?.id || course.raw?.course_id || course.id) === originalIdentifier
            ));
            if (match?.slug) {
                identifier = match.slug;
            } else {
                const notFoundError = new Error('Course not found');
                notFoundError.status = 404;
                throw notFoundError;
            }
        }

        try {
            res = await apiService.get(`/catalogue/courses/${encodeURIComponent(identifier)}`);
        } catch (error) {
            if (error?.status === 404 && /^\d+$/.test(originalIdentifier)) {
                const list = await courseCatalogService.listCourses({ per_page: 100 });
                const match = (list.data || []).find((course) => (
                    String(course.raw?.id || course.raw?.course_id || course.id) === originalIdentifier
                ));
                if (match?.slug) {
                    identifier = match.slug;
                    res = await apiService.get(`/catalogue/courses/${encodeURIComponent(identifier)}`);
                } else {
                    const notFoundError = new Error('Course not found');
                    notFoundError.status = 404;
                    throw notFoundError;
                }
            } else if (error?.status === 404) {
                const notFoundError = new Error('Course not found');
                notFoundError.status = 404;
                throw notFoundError;
            } else {
                throw error;
            }
        }

        const rawCourse = res.data ? res.data : res;
        return {
             ...rawCourse,
             ...normalizeCourse(rawCourse),
             raw_data: rawCourse,
        };
    },

    getLessonById: async (lessonId) => {
        const res = await apiService.get(`/catalogue/lessons/${encodeURIComponent(toTrimmedString(lessonId))}`);
        return res?.data ? res.data : res;
    },

    listCourseTutors: async (courseSlug) => {
        const res = await apiService.get(`/catalogue/courses/${encodeURIComponent(toTrimmedString(courseSlug))}/tutors`);
        return unwrapList(res);
    },

    getFeaturedCourses: async ({ limit = 1 } = {}) => {
        return courseCatalogService.listCourses({ per_page: limit, sort: 'popular' });
    },

    listFoundationalCourses: async ({ per_page = 30, page, sort } = {}) => {
        return courseCatalogService.listCourses({ per_page, page, sort, track: 'foundational' });
    },

    listExpertiaCourses: async ({ per_page = 30, page, sort } = {}) => {
        return courseCatalogService.listCourses({ per_page, page, sort, track: 'expert' });
    },


    listCategories: async () => {
        const courses = await courseCatalogService.listCourses({ per_page: 100, status: 'published' });
        const names = new Set();
        courses.data.forEach((course) => {
            (course.topics || []).forEach((topic) => {
                const value = toTrimmedString(topic);
                if (value) names.add(value);
            });
        });

        return {
            data: Array.from(names).map((name) => ({
                id: name.toLowerCase().replace(/\s+/g, '-'),
                name,
                slug: name.toLowerCase().replace(/\s+/g, '-'),
            })),
            meta: {},
            links: {},
        };
    },
};

export default courseCatalogService;

import { apiService } from '../../../services/api';
import { categoryService } from '../../../services/categoryService';

const RECOVERABLE_STATUS_CODES = new Set([401, 403, 404, 405]);

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
    const id = toTrimmedString(course.id || course.course_id || course.slug || course.uuid);
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
        course.instructor?.name ||
        course.tutor?.name ||
        course.author?.name ||
        course.organization?.name ||
        course.org?.name
    ) || 'Integritas Hub';

    const description =
        toTrimmedString(course.short_description) ||
        toTrimmedString(course.summary) ||
        toTrimmedString(course.description) ||
        'No description available yet.';

    const level = normalizeLevel(course.level || course.difficulty || course.difficulty_level);
    const image = toTrimmedString(
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
        slug: toTrimmedString(course.slug),
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
        trailerUrl: toTrimmedString(
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

const tryGet = async (endpoints = []) => {
    for (const endpoint of endpoints) {
        try {
            return await apiService.get(endpoint);
        } catch (error) {
            if (!RECOVERABLE_STATUS_CODES.has(error?.status)) throw error;
        }
    }
    return null;
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

export const courseCatalogService = {
    listCourses: async ({
        q,
        category,
        level,
        sort = 'popular',
        page,
        per_page = 30,
    } = {}) => {
        const apiSort = mapSortToApi(sort);

        const publicQuery = buildQuery({
            q,
            category,
            level,
            sort: apiSort,
            page,
            per_page,
        });

        const lmsQuery = buildQuery({
            q,
            level,
            page,
            per_page,
            status: 'published',
            with_categories: 1,
            with_tutor: 1,
        });

        const fallbackQuery = buildQuery({
            q,
            category,
            level,
            sort: apiSort,
            page,
            per_page,
        });

        const res = await tryGet([
            `/public/courses${publicQuery}`,
            `/lms/courses${lmsQuery}`,
            `/courses${fallbackQuery}`,
        ]);

        const normalized = unwrapList(res);
        return {
            data: (normalized.data || [])
                .map((item) => normalizeCourse(item))
                .filter((item) => item.id),
            meta: normalized.meta || {},
            links: normalized.links || {},
        };
    },

    getFeaturedCourses: async ({ limit = 1 } = {}) => {
        const query = buildQuery({ limit });
        const featuredRes = await tryGet([
            `/public/featured-courses${query}`,
        ]);

        if (featuredRes) {
            const list = unwrapList(featuredRes);
            const data = (list.data || [])
                .map((item) => normalizeCourse(item))
                .filter((item) => item.id);
            if (data.length > 0) {
                return { data, meta: list.meta || {}, links: list.links || {} };
            }
        }

        return courseCatalogService.listCourses({ per_page: limit, sort: 'popular' });
    },

    listCategories: async () => {
        try {
            const list = await categoryService.listCategories({ per_page: 100 });
            const categories = (list.data || [])
                .map((item) => ({
                    id: toTrimmedString(item?.id || item?.slug || item?.name),
                    name: toTrimmedString(item?.name || item?.title || item?.slug),
                    slug: toTrimmedString(item?.slug),
                }))
                .filter((item) => item.name);

            if (categories.length > 0) {
                return { data: categories, meta: list.meta || {}, links: list.links || {} };
            }
        } catch (error) {
            if (!RECOVERABLE_STATUS_CODES.has(error?.status)) throw error;
        }

        const courses = await courseCatalogService.listCourses({ per_page: 100 });
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

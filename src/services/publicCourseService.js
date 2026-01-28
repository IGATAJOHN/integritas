/**
 * Public Course Service
 * 
 * Handles all public (unauthenticated) API calls for course browsing.
 * These endpoints do not require authentication and are used for
 * the public-facing parts of the platform.
 * 
 * API Base: /public/*
 */

import { apiService } from "./api";

// --- Response Normalization Helpers ---

/**
 * Normalizes a course object from response.
 */
const unwrapCourse = (res) => {
    if (!res) return null;
    return res.data ? res.data : res;
};

/**
 * Normalizes a list response to { data, meta, links }.
 */
const unwrapList = (res) => {
    if (!res) return { data: [], meta: {}, links: {} };
    return {
        data: res.data || [],
        meta: res.meta || {},
        links: res.links || {}
    };
};

// --- Public Course Service Exports ---

export const publicCourseService = {
    /**
     * List all published courses
     * GET /public/courses
     * 
     * @param {Object} options - Query options
     * @param {number} [options.page] - Page number
     * @param {number} [options.per_page] - Items per page
     * @param {string} [options.q] - Search query
     * @param {string} [options.category] - Filter by category slug or ID
     * @param {string} [options.level] - Filter by difficulty level
     * @param {string} [options.language] - Filter by language
     * @param {string} [options.sort] - Sort field (e.g., 'newest', 'popular')
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    listCourses: async ({
        page,
        per_page = 20,
        q,
        category,
        level,
        language,
        sort
    } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);
        if (q) params.append('q', q);
        if (category) params.append('category', category);
        if (level) params.append('level', level);
        if (language) params.append('language', language);
        if (sort) params.append('sort', sort);

        const queryString = params.toString();
        const endpoint = queryString ? `/public/courses?${queryString}` : '/public/courses';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    /**
     * Get course details by slug (for public viewing)
     * GET /public/courses/{slug}
     * 
     * @param {string} slug - The course slug (URL-friendly identifier)
     * @returns {Promise<Object>} - Course details including modules/lessons preview
     */
    getCourseBySlug: async (slug) => {
        const res = await apiService.get(`/public/courses/${slug}`);
        return unwrapCourse(res);
    },

    /**
     * List featured courses
     * GET /public/featured-courses
     * 
     * @param {Object} options - Query options
     * @param {number} [options.limit] - Number of featured courses to return
     * @returns {Promise<{data: Array}>}
     */
    getFeaturedCourses: async ({ limit = 6 } = {}) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit);

        const queryString = params.toString();
        const endpoint = queryString ? `/public/featured-courses?${queryString}` : '/public/featured-courses';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    /**
     * Search courses with advanced filters
     * GET /public/courses
     * 
     * @param {string} searchQuery - Search term
     * @param {Object} filters - Additional filters
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    searchCourses: async (searchQuery, filters = {}) => {
        return publicCourseService.listCourses({
            q: searchQuery,
            ...filters
        });
    },
};

export default publicCourseService;

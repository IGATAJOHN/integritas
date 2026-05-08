/**
 * Public Course Service
 *
 * Handles all public (unauthenticated) catalogue browsing endpoints.
 * Backend: /catalogue/* (no auth required)
 */

import { apiService } from "./api";

const unwrap = (res) => (res && res.data ? res.data : res);

const unwrapList = (res) => {
    if (!res) return { data: [], meta: {}, links: {} };
    if (Array.isArray(res)) return { data: res, meta: {}, links: {} };
    return {
        data: res.data || [],
        meta: res.meta || {},
        links: res.links || {},
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

export const publicCourseService = {
    /**
     * GET /catalogue/courses
     */
    listCourses: async ({ page, per_page = 20, q, category, level, language, sort, track } = {}) => {
        const query = buildQuery({ page, per_page, q, category, level, language, sort, track });
        const res = await apiService.get(`/catalogue/courses${query}`);
        return unwrapList(res);
    },

    /**
     * GET /catalogue/courses/{slug}
     */
    getCourseBySlug: async (slug) => {
        const res = await apiService.get(`/catalogue/courses/${encodeURIComponent(slug)}`);
        return unwrap(res);
    },

    /**
     * GET /catalogue/lessons/{slug}
     */
    getLessonBySlug: async (slug) => {
        const res = await apiService.get(`/catalogue/lessons/${encodeURIComponent(slug)}`);
        return unwrap(res);
    },

    /**
     * GET /catalogue/tutors/{user_id}
     */
    getTutorProfile: async (userId) => {
        const res = await apiService.get(`/catalogue/tutors/${encodeURIComponent(userId)}`);
        return unwrap(res);
    },

    getFeaturedCourses: async ({ limit = 6 } = {}) => {
        const res = await publicCourseService.listCourses({ per_page: limit, sort: 'popular' });
        return res;
    },

    searchCourses: async (searchQuery, filters = {}) =>
        publicCourseService.listCourses({ q: searchQuery, ...filters }),
};

export default publicCourseService;

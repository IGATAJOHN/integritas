/**
 * Review Log Service for Admin Module
 * 
 * Handles API calls related to course review audit logs.
 * Review logs track the history of course reviews and approvals.
 * 
 * API Base: /lms/review-logs
 */

import { apiService } from "../../../services/api";

// --- Response Normalization Helpers ---

/**
 * Normalizes a review log object from response.
 */
const unwrapReviewLog = (res) => {
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

// --- Review Log Service Exports ---

export const reviewLogService = {
    /**
     * List all review logs
     * GET /lms/review-logs
     * 
     * @param {Object} options - Query options
     * @param {number} [options.page] - Page number
     * @param {number} [options.per_page] - Items per page
     * @param {string|number} [options.course_id] - Filter by course ID
     * @param {string|number} [options.reviewer_id] - Filter by reviewer ID
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    listReviewLogs: async ({ page, per_page = 20, course_id, reviewer_id } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);
        if (course_id) params.append('course_id', course_id);
        if (reviewer_id) params.append('reviewer_id', reviewer_id);

        const queryString = params.toString();
        const endpoint = queryString ? `/lms/review-logs?${queryString}` : '/lms/review-logs';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    /**
     * Create a new review log entry
     * POST /lms/review-logs
     * 
     * @param {Object} payload - Review log data
     * @param {string|number} payload.course_id - The course ID being reviewed
     * @param {string} payload.action - The action taken (approved, rejected, etc.)
     * @param {string} [payload.comment] - Review comment
     * @param {string} [payload.status] - Review status
     * @returns {Promise<Object>} - Created review log data
     */
    createReviewLog: async (payload) => {
        const res = await apiService.post('/lms/review-logs', payload);
        return unwrapReviewLog(res);
    },
};

export default reviewLogService;

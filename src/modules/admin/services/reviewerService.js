/**
 * Reviewer Service for Admin Module
 * 
 * Handles API calls for:
 * 1. Reviewer's own actions (logs) - /reviewer/*
 * 2. Admin management of reviewers - /reviewers/*
 * 
 * API Endpoints:
 * Reviewer Actions:
 * - GET /reviewer/logs - List reviewer's own logs
 * - POST /reviewer/logs - Create review log
 * 
 * Admin Management:
 * - GET /reviewers - List all reviewers
 * - POST /reviewers - Create new reviewer
 * - GET /reviewers/{id} - Get reviewer details
 * - PUT /reviewers/{id} - Update reviewer
 * - PATCH /reviewers/{id}/status - Update status only
 * - DELETE /reviewers/{id} - Delete reviewer
 */

import { apiService } from "../../../services/api";

// --- Response Normalization Helpers ---

/**
 * Normalizes a single object from response.
 */
const unwrapData = (res) => {
    if (!res) return null;
    return res.data || res.reviewer || res;
};

/**
 * Normalizes a list response to { data, meta, links }.
 * Handles multiple response formats:
 * - Direct array: [item1, item2]
 * - Wrapped: { data: [...] }
 * - Named: { reviewers: [...] }
 */
const unwrapList = (res) => {
    if (!res) return { data: [], meta: {}, links: {} };

    // If the response is already an array, wrap it
    if (Array.isArray(res)) {
        return { data: res, meta: {}, links: {} };
    }

    return {
        data: res.data || res.reviewers || [],
        meta: res.meta || {},
        links: res.links || {}
    };
};

// --- Reviewer Service Exports ---

export const reviewerService = {
    // ============ REVIEWER OWN ACTIONS ============

    /**
     * List reviewer's own logs
     * GET /reviewer/logs
     * 
     * @param {Object} options - Query options
     * @param {number} [options.page] - Page number
     * @param {number} [options.per_page] - Items per page
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    listMyLogs: async ({ page, per_page = 20 } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);

        const queryString = params.toString();
        const endpoint = queryString ? `/reviewer/logs?${queryString}` : '/reviewer/logs';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    /**
     * Create a review log (by reviewer)
     * POST /reviewer/logs
     * 
     * @param {Object} payload - Review log data
     * @param {string|number} payload.course_id - The course ID being reviewed
     * @param {string} payload.action - The action taken (approved, rejected, etc.)
     * @param {string} [payload.comment] - Review comment or feedback
     * @param {string} [payload.status] - Review status
     * @returns {Promise<Object>} - Created review log data
     */
    createLog: async (payload) => {
        const res = await apiService.post('/reviewer/logs', payload);
        return unwrapData(res);
    },

    // ============ ADMIN MANAGEMENT OF REVIEWERS ============

    /**
     * List all reviewers (Admin)
     * GET /reviewers
     * 
     * @param {Object} options - Query options
     * @param {string} [options.search] - Search by name or email
     * @param {string} [options.status] - Filter by status ('Active' or 'Inactive')
     * @param {number} [options.page] - Page number
     * @param {number} [options.per_page] - Items per page
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    listReviewers: async ({ search, status, page, per_page } = {}) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);

        const queryString = params.toString();
        const endpoint = queryString ? `/reviewers?${queryString}` : '/reviewers';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    /**
     * Create a new reviewer (Admin)
     * POST /reviewers
     * 
     * @param {Object} payload - Reviewer data
     * @param {string} payload.email - Reviewer email
     * @param {string} payload.first_name - First name
     * @param {string} payload.last_name - Last name
     * @param {string} [payload.phone] - Phone number
     * @param {string} [payload.specialization] - Specialization area
     * @param {number} [payload.max_assignments] - Maximum assignments
     * @param {boolean} [payload.can_publish] - Whether reviewer can publish
     * @returns {Promise<Object>} - Created reviewer with credentials
     */
    createReviewer: async (payload) => {
        const res = await apiService.post('/reviewers', payload);
        return res; // Return full response including credentials
    },

    /**
     * Get reviewer details by ID (Admin)
     * GET /reviewers/{id}
     * 
     * @param {string} reviewerId - The reviewer ID
     * @returns {Promise<Object>} - Reviewer details with user account
     */
    getReviewerById: async (reviewerId) => {
        const res = await apiService.get(`/reviewers/${reviewerId}`);
        return unwrapData(res);
    },

    /**
     * Update a reviewer (Admin)
     * PUT /reviewers/{id}
     * 
     * @param {string} reviewerId - The reviewer ID
     * @param {Object} payload - Reviewer data to update
     * @returns {Promise<Object>} - Updated reviewer data
     */
    updateReviewer: async (reviewerId, payload) => {
        const res = await apiService.put(`/reviewers/${reviewerId}`, payload);
        return unwrapData(res);
    },

    /**
     * Update reviewer status only (Admin)
     * PATCH /reviewers/{id}/status
     * 
     * @param {string} reviewerId - The reviewer ID
     * @param {string} status - New status ('Active' or 'Inactive')
     * @returns {Promise<Object>} - Updated reviewer data
     * 
     * Notes:
     * - Requires admin
     * - Temporarily disables reviewer
     * - Does NOT delete review history
     * - Inactive reviewers should not receive new assignments
     */
    updateStatus: async (reviewerId, status) => {
        const res = await apiService.patch(`/reviewers/${reviewerId}/status`, { status });
        return unwrapData(res);
    },

    /**
     * Delete a reviewer (Admin)
     * DELETE /reviewers/{id}
     * 
     * @param {string} reviewerId - The reviewer ID
     * @returns {Promise<{success: boolean}>}
     * 
     * Notes:
     * - Requires admin
     * - Removes reviewer profile and Spatie reviewer role
     * - Review history can remain linked via user_id if needed
     * - Recommended to disable first before delete
     */
    deleteReviewer: async (reviewerId) => {
        const res = await apiService.delete(`/reviewers/${reviewerId}`);
        return { success: true, ...res };
    },
};

export default reviewerService;


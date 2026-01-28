/**
 * Admin Service
 * 
 * Handles all administrative API calls including dashboard, user management
 * (tutors, students, reviewers), payouts, audit logs, and system settings.
 * 
 * API Base: /admin/*
 */

import { apiService } from "../../../services/api";

// --- Response Normalization Helpers ---

/**
 * Normalizes a single object from response.
 */
const unwrapData = (res) => {
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

// --- Admin Service Exports ---

export const adminService = {
    // ============ DASHBOARD ============

    /**
     * Get admin dashboard data
     * GET /admin/dashboard
     * 
     * @returns {Promise<Object>} - Dashboard statistics and data
     */
    getDashboard: async () => {
        const res = await apiService.get('/admin/dashboard');
        return unwrapData(res);
    },

    /**
     * Get admin statistics
     * GET /admin/stats
     * 
     * @returns {Promise<Object>} - Statistics data
     */
    getStats: async () => {
        const res = await apiService.get('/admin/stats');
        return unwrapData(res);
    },

    // ============ TUTOR MANAGEMENT ============

    /**
     * List all tutors
     * GET /admin/tutors
     * 
     * @param {Object} options - Query options
     * @param {number} [options.page] - Page number
     * @param {number} [options.per_page] - Items per page
     * @param {string} [options.status] - Filter by status (pending, approved, etc.)
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    listTutors: async ({ page, per_page = 20, status } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);
        if (status) params.append('status', status);

        const queryString = params.toString();
        const endpoint = queryString ? `/admin/tutors?${queryString}` : '/admin/tutors';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    /**
     * Get tutor details
     * GET /admin/tutors/{id}
     * 
     * @param {string|number} tutorId - The tutor ID
     * @returns {Promise<Object>} - Tutor details
     */
    getTutorById: async (tutorId) => {
        const res = await apiService.get(`/admin/tutors/${tutorId}`);
        return unwrapData(res);
    },

    /**
     * Delete a tutor
     * DELETE /admin/tutors/{id}
     * 
     * @param {string|number} tutorId - The tutor ID
     * @returns {Promise<{success: boolean}>}
     */
    deleteTutor: async (tutorId) => {
        const res = await apiService.delete(`/admin/tutors/${tutorId}`);
        return { success: true, ...res };
    },

    /**
     * Approve a tutor
     * POST /admin/tutors/{id}/approve
     * 
     * @param {string|number} tutorId - The tutor ID
     * @returns {Promise<Object>} - Updated tutor data
     */
    approveTutor: async (tutorId) => {
        const res = await apiService.post(`/admin/tutors/${tutorId}/approve`);
        return unwrapData(res);
    },

    /**
     * Reject a tutor
     * POST /admin/tutors/{id}/reject
     * 
     * @param {string|number} tutorId - The tutor ID
     * @param {string} [reason] - Rejection reason
     * @returns {Promise<Object>} - Updated tutor data
     */
    rejectTutor: async (tutorId, reason) => {
        const res = await apiService.post(`/admin/tutors/${tutorId}/reject`, { reason });
        return unwrapData(res);
    },

    /**
     * Suspend a tutor
     * POST /admin/tutors/{id}/suspend
     * 
     * @param {string|number} tutorId - The tutor ID
     * @param {string} [reason] - Suspension reason
     * @returns {Promise<Object>} - Updated tutor data
     */
    suspendTutor: async (tutorId, reason) => {
        const res = await apiService.post(`/admin/tutors/${tutorId}/suspend`, { reason });
        return unwrapData(res);
    },

    /**
     * Unsuspend a tutor
     * POST /admin/tutors/{id}/unsuspend
     * 
     * @param {string|number} tutorId - The tutor ID
     * @returns {Promise<Object>} - Updated tutor data
     */
    unsuspendTutor: async (tutorId) => {
        const res = await apiService.post(`/admin/tutors/${tutorId}/unsuspend`);
        return unwrapData(res);
    },

    // ============ REVIEWER MANAGEMENT ============

    /**
     * List all reviewers
     * GET /admin/reviewers
     * 
     * @param {Object} options - Query options
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    listReviewers: async ({ page, per_page = 20 } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);

        const queryString = params.toString();
        const endpoint = queryString ? `/admin/reviewers?${queryString}` : '/admin/reviewers';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    /**
     * Create a new auditor/reviewer
     * POST /admin/reviewers
     * 
     * @param {Object} payload - Reviewer data
     * @param {string} payload.name - Reviewer name
     * @param {string} payload.email - Reviewer email
     * @param {string} [payload.password] - Reviewer password
     * @returns {Promise<Object>} - Created reviewer data
     */
    createReviewer: async (payload) => {
        const res = await apiService.post('/admin/reviewers', payload);
        return unwrapData(res);
    },

    /**
     * Get reviewer details
     * GET /admin/reviewers/{id}
     * 
     * @param {string|number} reviewerId - The reviewer ID
     * @returns {Promise<Object>} - Reviewer details
     */
    getReviewerById: async (reviewerId) => {
        const res = await apiService.get(`/admin/reviewers/${reviewerId}`);
        return unwrapData(res);
    },

    /**
     * Delete a reviewer
     * DELETE /admin/reviewers/{id}
     * 
     * @param {string|number} reviewerId - The reviewer ID
     * @returns {Promise<{success: boolean}>}
     */
    deleteReviewer: async (reviewerId) => {
        const res = await apiService.delete(`/admin/reviewers/${reviewerId}`);
        return { success: true, ...res };
    },

    // ============ STUDENT MANAGEMENT ============

    /**
     * List all students
     * GET /admin/students
     * 
     * @param {Object} options - Query options
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    listStudents: async ({ page, per_page = 20, q } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);
        if (q) params.append('q', q);

        const queryString = params.toString();
        const endpoint = queryString ? `/admin/students?${queryString}` : '/admin/students';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    /**
     * Get student details
     * GET /admin/students/{id}
     * 
     * @param {string|number} studentId - The student ID
     * @returns {Promise<Object>} - Student details
     */
    getStudentById: async (studentId) => {
        const res = await apiService.get(`/admin/students/${studentId}`);
        return unwrapData(res);
    },

    /**
     * Delete a student
     * DELETE /admin/students/{id}
     * 
     * @param {string|number} studentId - The student ID
     * @returns {Promise<{success: boolean}>}
     */
    deleteStudent: async (studentId) => {
        const res = await apiService.delete(`/admin/students/${studentId}`);
        return { success: true, ...res };
    },

    // ============ WITHDRAWALS & PAYOUTS ============

    /**
     * List all withdraw requests
     * GET /admin/withdraw-requests
     * 
     * @param {Object} options - Query options
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    listWithdrawRequests: async ({ page, per_page = 20, status } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);
        if (status) params.append('status', status);

        const queryString = params.toString();
        const endpoint = queryString ? `/admin/withdraw-requests?${queryString}` : '/admin/withdraw-requests';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    /**
     * Process a payout
     * POST /admin/payouts
     * 
     * @param {Object} payload - Payout data
     * @param {string|number} payload.withdraw_request_id - The withdraw request ID
     * @param {string} [payload.reference] - Payment reference
     * @returns {Promise<Object>} - Payout result
     */
    processPayout: async (payload) => {
        const res = await apiService.post('/admin/payouts', payload);
        return unwrapData(res);
    },

    // ============ AUDIT & SETTINGS ============

    /**
     * Get audit logs
     * GET /admin/audit-logs
     * 
     * @param {Object} options - Query options
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    getAuditLogs: async ({ page, per_page = 50 } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);

        const queryString = params.toString();
        const endpoint = queryString ? `/admin/audit-logs?${queryString}` : '/admin/audit-logs';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    /**
     * Get system settings
     * GET /admin/settings
     * 
     * @returns {Promise<Object>} - System settings
     */
    getSettings: async () => {
        const res = await apiService.get('/admin/settings');
        return unwrapData(res);
    },

    /**
     * Update system settings
     * POST /admin/settings
     * 
     * @param {Object} payload - Settings data
     * @returns {Promise<Object>} - Updated settings
     */
    updateSettings: async (payload) => {
        const res = await apiService.post('/admin/settings', payload);
        return unwrapData(res);
    },
};

export default adminService;

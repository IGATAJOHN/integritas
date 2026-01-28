/**
 * Enrollment Service for Learner Module
 * 
 * Handles all API calls related to course enrollment and progress tracking.
 * This service is used by learners to enroll in courses, track progress,
 * and request certificates upon completion.
 * 
 * API Base: /lms/courses/{id}/* and /lms/my-enrollments
 */

import { apiService } from "../../../services/api";

// --- Response Normalization Helpers ---

/**
 * Normalizes an enrollment object from response.
 */
const unwrapEnrollment = (res) => {
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

/**
 * For actions that might return data or just { success: true }.
 */
const okOrData = (res) => {
    if (!res) return { success: true };
    if (res.data || res.id) return unwrapEnrollment(res);
    return { success: true };
};

// --- Enrollment Service Exports ---

export const learnerEnrollmentService = {
    /**
     * Enroll in a course
     * POST /lms/courses/{id}/enroll
     * 
     * @param {string|number} courseId - The course ID to enroll in
     * @returns {Promise<Object>} - Enrollment data
     */
    enrollInCourse: async (courseId) => {
        const res = await apiService.post(`/lms/courses/${courseId}/enroll`);
        return unwrapEnrollment(res);
    },

    /**
     * Get all enrollments for the authenticated user
     * GET /lms/my-enrollments
     * 
     * @param {Object} options - Query options
     * @param {number} [options.page] - Page number for pagination
     * @param {number} [options.per_page] - Items per page
     * @param {string} [options.status] - Filter by enrollment status (active, completed, etc.)
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    getMyEnrollments: async ({ page, per_page = 20, status } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);
        if (status) params.append('status', status);

        const queryString = params.toString();
        const endpoint = queryString ? `/lms/my-enrollments?${queryString}` : '/lms/my-enrollments';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    /**
     * Unenroll from a course
     * POST /lms/courses/{id}/unenroll
     * 
     * @param {string|number} courseId - The course ID to unenroll from
     * @returns {Promise<{success: boolean}>}
     */
    unenrollFromCourse: async (courseId) => {
        const res = await apiService.post(`/lms/courses/${courseId}/unenroll`);
        return { success: true, ...res };
    },

    /**
     * Check enrollment status for a specific course
     * GET /lms/courses/{id}/enrollment-status
     * 
     * @param {string|number} courseId - The course ID
     * @returns {Promise<Object>} - Enrollment status data
     */
    getEnrollmentStatus: async (courseId) => {
        const res = await apiService.get(`/lms/courses/${courseId}/enrollment-status`);
        return unwrapEnrollment(res);
    },

    /**
     * Mark a lesson as completed
     * POST /lms/lessons/{id}/complete
     * 
     * @param {string|number} lessonId - The lesson ID
     * @returns {Promise<Object>} - Completion data
     */
    completeLesson: async (lessonId) => {
        const res = await apiService.post(`/lms/lessons/${lessonId}/complete`);
        return okOrData(res);
    },

    /**
     * Mark a module as completed
     * POST /lms/modules/{id}/complete
     * 
     * @param {string|number} moduleId - The module ID
     * @returns {Promise<Object>} - Completion data
     */
    completeModule: async (moduleId) => {
        const res = await apiService.post(`/lms/modules/${moduleId}/complete`);
        return okOrData(res);
    },

    /**
     * Mark a course as completed
     * POST /lms/courses/{id}/complete
     * 
     * @param {string|number} courseId - The course ID
     * @returns {Promise<Object>} - Completion data
     */
    completeCourse: async (courseId) => {
        const res = await apiService.post(`/lms/courses/${courseId}/complete`);
        return okOrData(res);
    },

    /**
     * Request a certificate for a completed course
     * POST /lms/courses/{id}/certificate
     * 
     * @param {string|number} courseId - The course ID
     * @returns {Promise<Object>} - Certificate data (may include URL or status)
     */
    requestCertificate: async (courseId) => {
        const res = await apiService.post(`/lms/courses/${courseId}/certificate`);
        return unwrapEnrollment(res);
    },

    /**
     * Get completion status for a specific course
     * GET /lms/courses/{id}/completion-status
     * 
     * @param {string|number} courseId - The course ID
     * @returns {Promise<Object>} - Completion status with progress data
     */
    getCompletionStatus: async (courseId) => {
        const res = await apiService.get(`/lms/courses/${courseId}/completion-status`);
        return unwrapEnrollment(res);
    },
};

export default learnerEnrollmentService;

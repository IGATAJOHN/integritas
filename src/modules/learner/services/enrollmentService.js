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
     * Check course access for the authenticated user
     * GET /lms/courses/{id}/access
     *
     * @param {string} courseId
     * @returns {Promise<{course_id, is_essential, can_access, pay_type, message}>}
     */
    getCourseAccess: async (courseId) => {
        const res = await apiService.get(`/lms/courses/${courseId}/access`);
        return res?.data ? res.data : res;
    },

    /**
     * Enroll in a course
     * POST /lms/courses/{id}/enroll
     *
     * @param {string|number} courseId - The course ID to enroll in
     * @returns {Promise<Object>} - Enrollment data (may include payment_url for paid courses)
     */
    enrollInCourse: async (courseId) => {
        const res = await apiService.post(`/lms/courses/${courseId}/enroll`);
        return unwrapEnrollment(res);
    },

    /**
     * Enroll in an essential course
     * POST /lms/essential/enroll
     *
     * @param {string|number} courseId - The course ID to enroll in
     * @returns {Promise<Object>} - Enrollment data (may include payment_url for paid courses)
     */
    enrollInEssentialCourse: async (courseId) => {
        const res = await apiService.post('/lms/essential/enroll', { course_id: courseId });
        return unwrapEnrollment(res);
    },

    /**
     * Get paginated list of enrollments with optional filters
     * GET /lms/enrollments
     *
     * @param {Object} options - Query options
     * @param {string} [options.user_id] - Filter by user UUID
     * @param {string} [options.course_id] - Filter by course UUID
     * @param {string} [options.status] - Filter by enrollment status
     * @param {number} [options.per_page] - Items per page
     * @param {number} [options.page] - Page number
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    getEnrollments: async ({ user_id, course_id, status, per_page = 20, page } = {}) => {
        const params = new URLSearchParams();
        if (user_id) params.append('user_id', user_id);
        if (course_id) params.append('course_id', course_id);
        if (status) params.append('status', status);
        if (per_page) params.append('per_page', per_page);
        if (page) params.append('page', page);
        const qs = params.toString();
        const res = await apiService.get(`/lms/enrollments${qs ? `?${qs}` : ''}`);
        return unwrapList(res);
    },

    /**
     * Verify a payment after Paystack redirect
     * GET /payments/verify?trxref=...&reference=...
     *
     * @param {Object} params
     * @param {string} params.trxref - Transaction reference from Paystack
     * @param {string} params.reference - Payment reference
     * @returns {Promise<Object>} - Verification result with enrollment data
     */
    verifyPayment: async ({ trxref, reference }) => {
        const res = await apiService.get(`/payments/verify?trxref=${trxref}&reference=${reference}`);
        return res?.data ? res.data : res;
    },

    /**
     * Verify payment status after enrollment payment callback
     * GET /payments/verify-status?reference=ENR_...
     *
     * Called when the backend redirects to /payment/success?reference=...
     *
     * @param {string} reference - The enrollment payment reference (e.g. ENR_17749600101498)
     * @returns {Promise<Object>} - Verification result with enrollment/payment status
     */
    verifyPaymentStatus: async (reference) => {
        const res = await apiService.get(`/payments/verify-status?reference=${encodeURIComponent(reference)}`);
        return res?.data ? res.data : res;
    },

    /**
     * Get the authenticated learner's enrolled courses
     * GET /lms/my/courses/enrolled
     *
     * @param {Object} options
     * @param {number} [options.per_page]
     * @param {number} [options.page]
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    getMyEnrolledCourses: async ({ per_page = 50, page } = {}) => {
        const params = new URLSearchParams();
        if (per_page) params.append('per_page', per_page);
        if (page) params.append('page', page);
        const qs = params.toString();
        const res = await apiService.get(`/lms/my/courses/enrolled${qs ? `?${qs}` : ''}`);
        return unwrapList(res);
    },

    /**
     * @deprecated Use getEnrollments instead
     */
    getMyEnrollments: async ({ page, per_page = 20, status } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);
        if (status) params.append('status', status);
        const queryString = params.toString();
        const endpoint = queryString ? `/lms/enrollments?${queryString}` : '/lms/enrollments';
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

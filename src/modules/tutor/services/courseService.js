import { apiService } from "../../../services/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// --- Shared Helpers ---

const getAuthToken = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const parsed = JSON.parse(user);
        return parsed.token;
    }
    return null;
};

// --- Response Normalization Helpers ---

/**
 * Normalizes a course object from various response shapes.
 * Handles { data: { ... } } or top-level object.
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

/**
 * For actions that might return a course or just { success: true }.
 */
const okOrCourse = (res) => {
    if (!res) return { success: true };
    if (res.data || res.id) return unwrapCourse(res);
    return { success: true };
};

/**
 * Helper to handle multipart/form-data requests manually
 * to avoid apiService stringifying the body.
 */
const requestMultipart = async (endpoint, method, formData) => {
    const token = getAuthToken();
    const headers = {
        'Accept': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: formData,
    });

    if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            // Surface server message for 422
            if (response.status === 422 && errorData.message) {
                errorMessage = errorData.message;
            }
        } catch (e) {
            errorMessage = response.statusText;
        }
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
    }

    // Some endpoints might return 204 No Content
    if (response.status === 204) return null;

    return response.json();
};


// --- Exports ---

export const tutorCoursesService = {
    // A) LIST COURSES
    listCourses: async ({
        page,
        per_page = 20,
        q,
        status,
        level,
        language,
        with_categories = 1,
        with_audit = 1
    } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);
        if (q) params.append('q', q);
        if (status) params.append('status', status);
        if (level) params.append('level', level);
        if (language) params.append('language', language);
        if (with_categories) params.append('with_categories', with_categories);
        if (with_audit) params.append('with_audit', with_audit);

        const res = await apiService.get(`/lms/courses?${params.toString()}`);
        return unwrapList(res);
    },

    // B) CREATE COURSE (JSON)
    createCourseJson: async (payload) => {
        const res = await apiService.post('/lms/courses', payload);
        return unwrapCourse(res);
    },

    // C) CREATE COURSE (Multipart)
    createCourseMultipart: async (formData) => {
        const res = await requestMultipart('/lms/courses', 'POST', formData);
        return okOrCourse(res);
    },

    // D) SHOW COURSE DETAIL (Nested)
    getCourseDetail: async (courseId) => {
        const res = await apiService.get(`/lms/courses/${courseId}`);
        return unwrapCourse(res);
    },

    // E) GET COURSE (BY ID) with includes
    getCourseById: async (courseId, { with_categories = 1, with_audit = 1 } = {}) => {
        const params = new URLSearchParams();
        if (with_categories) params.append('with_categories', with_categories);
        if (with_audit) params.append('with_audit', with_audit);

        const res = await apiService.get(`/lms/courses/${courseId}?${params.toString()}`);
        return unwrapCourse(res);
    },

    // F) UPDATE COURSE (JSON)
    updateCourseJson: async (courseId, payload) => {
        const res = await apiService.put(`/lms/courses/${courseId}`, payload);
        return unwrapCourse(res);
    },

    // G) UPDATE COURSE (Multipart)
    updateCourseMultipart: async (courseId, formData) => {
        const res = await requestMultipart(`/lms/courses/${courseId}`, 'PATCH', formData);
        return unwrapCourse(res);
    },

    // H) PUBLISH COURSE
    publishCourse: async (courseId) => {
        const res = await apiService.post(`/lms/courses/${courseId}/publish`);
        return unwrapCourse(res);
    },

    // I) UNPUBLISH COURSE
    unpublishCourse: async (courseId) => {
        try {
            const res = await apiService.post(`/lms/courses/${courseId}/unpublish`);
            return unwrapCourse(res);
        } catch (error) {
            // "If 422: throw error with readable message if available"
            // The apiService already throws errors with messages from the server
            throw error;
        }
    },

    // J) ARCHIVE COURSE
    archiveCourse: async (courseId) => {
        const res = await apiService.post(`/lms/courses/${courseId}/archive`);
        return unwrapCourse(res);
    },

    /**
     * Reject a course and record rejection reason
     * POST /lms/courses/{courseId}/reject
     * 
     * Rejects a course and records the reason in meta.review.
     * This action:
     * - Clears approvals (approved_at = null, approved_by = null)
     * - Forces course back to draft status
     * - Sets published_at = null
     * 
     * @param {string|number} courseId - The course ID to reject
     * @param {string} reason - The rejection reason (e.g., "Needs better intro video")
     * @returns {Promise<Object>} - Updated course data
     */
    rejectCourse: async (courseId, reason) => {
        const res = await apiService.post(`/lms/courses/${courseId}/reject`, { reason });
        return unwrapCourse(res);
    },

    // K) DELETE COURSE MEDIA
    deleteCourseMedia: async (courseId, mediaType) => {
        const res = await apiService.delete(`/lms/courses/${courseId}/media/${mediaType}`);
        return unwrapCourse(res);
    },

    // M) DELETE COURSE
    deleteCourse: async (courseId) => {
        const res = await apiService.delete(`/lms/courses/${courseId}`);
        // Response may be empty or message object
        return { success: true, ...res };
    },
};

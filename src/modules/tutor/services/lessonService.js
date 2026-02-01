/**
 * Lesson Service for Tutor Module
 * 
 * Handles all API calls related to lesson management within modules.
 * Lessons are the individual content units that make up a module.
 * 
 * API Base: /lms/modules/{module_id}/lessons and /lms/lessons/{id}
 */

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
 * Normalizes a lesson object from response.
 */
const unwrapLesson = (res) => {
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
 * For actions that might return a lesson or just { success: true }.
 */
const okOrLesson = (res) => {
    if (!res) return { success: true };
    if (res.data || res.id) return unwrapLesson(res);
    return { success: true };
};

/**
 * Helper to handle multipart/form-data requests for media uploads.
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
        } catch (e) {
            errorMessage = response.statusText;
        }
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
    }

    if (response.status === 204) return null;
    return response.json();
};

// --- Lesson Service Exports ---

export const tutorLessonService = {
    /**
     * List all lessons for a specific module
     * GET /lms/modules/{module_id}/lessons
     * 
     * @param {string|number} moduleId - The module ID
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    listLessons: async (moduleId) => {
        const res = await apiService.get(`/lms/modules/${moduleId}/lessons`);
        return unwrapList(res);
    },

    /**
     * Create a new lesson in a module
     * POST /lms/modules/{module_id}/lessons
     * 
     * @param {string|number} moduleId - The module ID
     * @param {Object} payload - Lesson data
     * @param {string} payload.title - Lesson title (required)
     * @param {string} [payload.content] - Lesson content/description
     * @param {string} [payload.type] - Lesson type (video, text, quiz, etc.)
     * @param {number} [payload.duration] - Duration in minutes
     * @param {number} [payload.position] - Lesson position/order
     * @returns {Promise<Object>} - Created lesson data
     */
    createLesson: async (moduleId, payload) => {
        const res = await apiService.post(`/lms/modules/${moduleId}/lessons`, payload);
        return unwrapLesson(res);
    },

    /**
     * Get lesson details by ID
     * GET /lms/lessons/{id}
     * 
     * @param {string|number} lessonId - The lesson ID
     * @returns {Promise<Object>} - Lesson details
     */
    getLessonById: async (lessonId) => {
        const res = await apiService.get(`/lms/lessons/${lessonId}`);
        return unwrapLesson(res);
    },

    /**
     * Update a lesson
     * PUT /lms/lessons/{id}
     * 
     * @param {string|number} lessonId - The lesson ID
     * @param {Object} payload - Updated lesson data
     * @returns {Promise<Object>} - Updated lesson data
     */
    updateLesson: async (lessonId, payload) => {
        const res = await apiService.put(`/lms/lessons/${lessonId}`, payload);
        return unwrapLesson(res);
    },

    /**
     * Delete a lesson
     * DELETE /lms/lessons/{id}
     * 
     * @param {string|number} lessonId - The lesson ID
     * @returns {Promise<{success: boolean}>}
     */
    deleteLesson: async (lessonId) => {
        const res = await apiService.delete(`/lms/lessons/${lessonId}`);
        return { success: true, ...res };
    },

    /**
     * List all media files for a lesson
     * GET /lms/lessons/{id}/media
     * 
     * @param {string|number} lessonId - The lesson ID
     * @returns {Promise<{data: Array}>}
     */
    listLessonMedia: async (lessonId) => {
        const res = await apiService.get(`/lms/lessons/${lessonId}/media`);
        return unwrapList(res);
    },

    /**
     * Upload media to a lesson (multipart/form-data)
     * POST /lms/lessons/{id}/media
     * 
     * @param {string|number} lessonId - The lesson ID
     * @param {FormData} formData - FormData with media file
     * @returns {Promise<Object>} - Uploaded media data
     */
    uploadLessonMedia: async (lessonId, formData) => {
        const res = await requestMultipart(`/lms/lessons/${lessonId}/media`, 'POST', formData);
        return okOrLesson(res);
    },

    /**
     * Delete a media file from a lesson
     * DELETE /lms/lessons/media/{id}
     * 
     * @param {string|number} mediaId - The media ID
     * @returns {Promise<{success: boolean}>}
     */
    deleteLessonMedia: async (mediaId) => {
        const res = await apiService.delete(`/lms/lessons/media/${mediaId}`);
        return { success: true, ...res };
    },

    /**
     * Reorder lessons within a module
     * POST /lms/modules/{module_id}/lessons/reorder
     * 
     * @param {string|number} moduleId - The module ID
     * @param {Array<{id: number, position: number}>} order - Array of lesson IDs with new positions
     * @returns {Promise<{success: boolean}>}
     */
    reorderLessons: async (moduleId, order) => {
        const res = await apiService.post(`/lms/modules/${moduleId}/lessons/reorder`, { order });
        return okOrLesson(res);
    },

    /**
     * Publish a lesson (make it visible to learners)
     * POST /lms/modules/{moduleId}/lessons/{lessonId}/publish
     * 
     * Marks a lesson as published within a specific module.
     * 
     * Auth & Permission:
     * - Auth: Required
     * - Permission: lms.lessons.publish
     * 
     * @param {string|number} moduleId - The module ID
     * @param {string|number} lessonId - The lesson ID
     * @returns {Promise<Object>} - Updated lesson data
     */
    publishLesson: async (moduleId, lessonId) => {
        const res = await apiService.post(`/lms/modules/${moduleId}/lessons/${lessonId}/publish`);
        return unwrapLesson(res);
    },

    /**
     * Unpublish a lesson (hide from learners)
     * POST /lms/modules/{moduleId}/lessons/{lessonId}/unpublish
     * 
     * Marks a lesson as unpublished within a specific module.
     * 
     * Auth & Permission:
     * - Auth: Required
     * - Permission: lms.lessons.publish
     * 
     * @param {string|number} moduleId - The module ID
     * @param {string|number} lessonId - The lesson ID
     * @returns {Promise<Object>} - Updated lesson data
     */
    unpublishLesson: async (moduleId, lessonId) => {
        const res = await apiService.post(`/lms/modules/${moduleId}/lessons/${lessonId}/unpublish`);
        return unwrapLesson(res);
    },
};

export default tutorLessonService;

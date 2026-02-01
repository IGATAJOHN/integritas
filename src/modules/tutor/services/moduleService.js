/**
 * Module Service for Tutor Module
 * 
 * Handles all API calls related to course modules management.
 * Modules are structural sections within a course that contain lessons.
 * 
 * API Base: /lms/courses/{course_id}/modules and /lms/modules/{id}
 */

import { apiService } from "../../../services/api";

// --- Response Normalization Helpers ---

/**
 * Normalizes a module object from response.
 * Handles { data: { ... } } or top-level object.
 */
const unwrapModule = (res) => {
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
 * For actions that might return a module or just { success: true }.
 */
const okOrModule = (res) => {
    if (!res) return { success: true };
    if (res.data || res.id) return unwrapModule(res);
    return { success: true };
};

// --- Module Service Exports ---

export const tutorModuleService = {
    /**
     * List all modules for a specific course
     * GET /lms/courses/{course_id}/modules
     * 
     * @param {string|number} courseId - The course ID
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    listModules: async (courseId) => {
        const res = await apiService.get(`/lms/courses/${courseId}/modules`);
        return unwrapList(res);
    },

    /**
     * Create a new module for a course
     * POST /lms/courses/{course_id}/modules
     * 
     * @param {string|number} courseId - The course ID
     * @param {Object} payload - Module data
     * @param {string} payload.title - Module title (required)
     * @param {string} [payload.description] - Module description
     * @param {number} [payload.position] - Module position/order
     * @returns {Promise<Object>} - Created module data
     */
    createModule: async (courseId, payload) => {
        const res = await apiService.post(`/lms/courses/${courseId}/modules`, payload);
        return unwrapModule(res);
    },

    /**
     * Get module details by ID
     * GET /lms/modules/{id}
     * 
     * @param {string|number} moduleId - The module ID
     * @returns {Promise<Object>} - Module details including lessons
     */
    getModuleById: async (moduleId) => {
        const res = await apiService.get(`/lms/modules/${moduleId}`);
        return unwrapModule(res);
    },

    /**
     * Update a module
     * PUT /lms/modules/{id}
     * 
     * @param {string|number} moduleId - The module ID
     * @param {Object} payload - Updated module data
     * @param {string} [payload.title] - Updated title
     * @param {string} [payload.description] - Updated description
     * @returns {Promise<Object>} - Updated module data
     */
    updateModule: async (moduleId, payload) => {
        const res = await apiService.put(`/lms/modules/${moduleId}`, payload);
        return unwrapModule(res);
    },

    /**
     * Delete a module
     * DELETE /lms/modules/{id}
     * 
     * @param {string|number} moduleId - The module ID
     * @returns {Promise<{success: boolean}>}
     */
    deleteModule: async (moduleId) => {
        const res = await apiService.delete(`/lms/modules/${moduleId}`);
        return { success: true, ...res };
    },

    /**
     * Reorder modules within a course
     * POST /lms/courses/{course_id}/modules/reorder
     * 
     * @param {string|number} courseId - The course ID
     * @param {Array<{id: number, position: number}>} order - Array of module IDs with new positions
     * @returns {Promise<{success: boolean}>}
     */
    reorderModules: async (courseId, order) => {
        const res = await apiService.post(`/lms/courses/${courseId}/modules/reorder`, { order });
        return okOrModule(res);
    },

    /**
     * Publish a module (make it visible to learners)
     * POST /lms/courses/{courseId}/modules/{moduleId}/publish
     * 
     * Marks a module as published within a specific course.
     * 
     * Auth & Permission:
     * - Auth: Required
     * - Permission: lms.modules.publish
     * 
     * @param {string|number} courseId - The course ID
     * @param {string|number} moduleId - The module ID
     * @returns {Promise<Object>} - Updated module data
     */
    publishModule: async (courseId, moduleId) => {
        const res = await apiService.post(`/lms/courses/${courseId}/modules/${moduleId}/publish`);
        return unwrapModule(res);
    },

    /**
     * Unpublish a module (hide from learners)
     * POST /lms/courses/{courseId}/modules/{moduleId}/unpublish
     * 
     * Marks a module as unpublished within a specific course.
     * 
     * Auth & Permission:
     * - Auth: Required
     * - Permission: lms.modules.publish
     * 
     * @param {string|number} courseId - The course ID
     * @param {string|number} moduleId - The module ID
     * @returns {Promise<Object>} - Updated module data
     */
    unpublishModule: async (courseId, moduleId) => {
        const res = await apiService.post(`/lms/courses/${courseId}/modules/${moduleId}/unpublish`);
        return unwrapModule(res);
    },
};

export default tutorModuleService;

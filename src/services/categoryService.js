/**
 * Category Service (Shared)
 * 
 * Handles all API calls related to course categories.
 * Categories are used to organize courses and can be used by
 * tutors when creating courses and by learners when browsing.
 * 
 * API Base: /categories
 */

import { apiService } from "./api";

// --- Response Normalization Helpers ---

/**
 * Normalizes a category object from response.
 */
const unwrapCategory = (res) => {
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

// --- Category Service Exports ---

export const categoryService = {
    /**
     * List all categories
     * GET /categories
     * 
     * @param {Object} options - Query options
     * @param {number} [options.page] - Page number
     * @param {number} [options.per_page] - Items per page
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    listCategories: async ({ page, per_page = 50 } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);

        const queryString = params.toString();
        const endpoint = queryString ? `/categories?${queryString}` : '/categories';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    /**
     * Get all categories (without pagination for dropdowns)
     * GET /categories
     * 
     * @returns {Promise<Array>} - Array of category objects
     */
    getAllCategories: async () => {
        const res = await apiService.get('/categories?per_page=100');
        const list = unwrapList(res);
        return list.data;
    },

    /**
     * Create a new category
     * POST /categories
     * 
     * @param {Object} payload - Category data
     * @param {string} payload.name - Category name (required)
     * @param {string} [payload.description] - Category description
     * @param {string} [payload.slug] - URL-friendly slug
     * @param {number} [payload.parent_id] - Parent category ID for subcategories
     * @returns {Promise<Object>} - Created category data
     */
    createCategory: async (payload) => {
        const res = await apiService.post('/categories', payload);
        return unwrapCategory(res);
    },

    /**
     * Get category details by ID
     * GET /categories/{id}
     * 
     * @param {string|number} categoryId - The category ID
     * @returns {Promise<Object>} - Category details
     */
    getCategoryById: async (categoryId) => {
        const res = await apiService.get(`/categories/${categoryId}`);
        return unwrapCategory(res);
    },

    /**
     * Update a category
     * PUT /categories/{id}
     * 
     * @param {string|number} categoryId - The category ID
     * @param {Object} payload - Updated category data
     * @returns {Promise<Object>} - Updated category data
     */
    updateCategory: async (categoryId, payload) => {
        const res = await apiService.put(`/categories/${categoryId}`, payload);
        return unwrapCategory(res);
    },

    /**
     * Delete a category
     * DELETE /categories/{id}
     * 
     * @param {string|number} categoryId - The category ID
     * @returns {Promise<{success: boolean}>}
     */
    deleteCategory: async (categoryId) => {
        const res = await apiService.delete(`/categories/${categoryId}`);
        return { success: true, ...res };
    },
};

export default categoryService;

/**
 * Staff/Admin Service
 * 
 * Handles all staff (internal admin) management API calls.
 * Staff are internal company employees with admin access.
 * 
 * API Endpoints:
 * - GET /admins - List all admins (with search, status filters)
 * - POST /admins - Create new staff/admin
 * - GET /admins/{id} - Get admin details (assumed)
 * - PUT /admins/{id} - Update admin (assumed)
 * - DELETE /admins/{id} - Delete admin (assumed)
 * 
 * Note: Requires super_admin role for all operations.
 */

import { apiService } from "../../../services/api";

// --- Response Normalization Helpers ---

/**
 * Normalizes a single object from response.
 */
const unwrapData = (res) => {
    if (!res) return null;
    return res.data || res.admin || res;
};

/**
 * Normalizes a list response to { data, meta, links }.
 * Handles multiple response formats:
 * - Direct array: [item1, item2] -> { data: [...], meta: {}, links: {} }
 * - Wrapped: { data: [...] } -> { data: [...], meta: {}, links: {} }
 * - Named: { admins: [...] } -> { data: [...], meta: {}, links: {} }
 */
const unwrapList = (res) => {
    if (!res) return { data: [], meta: {}, links: {} };

    // If the response is already an array, wrap it
    if (Array.isArray(res)) {
        return { data: res, meta: {}, links: {} };
    }

    return {
        data: res.data || res.admins || [],
        meta: res.meta || {},
        links: res.links || {}
    };
};

// --- Staff Service Exports ---

export const staffService = {
    /**
     * List all staff/admins
     * GET /admins
     * 
     * @param {Object} options - Query options
     * @param {string} [options.search] - Search by name or email
     * @param {string} [options.status] - Filter by status ('Active' or 'Inactive')
     * @param {number} [options.page] - Page number (if pagination added later)
     * @param {number} [options.per_page] - Items per page
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     * 
     * Notes:
     * - Requires super_admin role
     * - Returns staff profile + linked user account
     * - Does NOT return passwords
     */
    listStaff: async ({ search, status, page, per_page } = {}) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);

        const queryString = params.toString();
        const endpoint = queryString ? `/admins?${queryString}` : '/admins';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    /**
     * Create a new staff/admin
     * POST /admins
     * 
     * @param {Object} payload - Staff data
     * @param {string} payload.email - Staff email (must be unique)
     * @param {string} [payload.password] - Password (auto-generated if not provided)
     * @param {string} [payload.staff_no] - Staff number (must be unique)
     * @param {string} payload.first_name - First name
     * @param {string} payload.last_name - Last name
     * @param {string} [payload.phone] - Phone number
     * @param {string} [payload.gender] - Gender (Male/Female)
     * @param {string} [payload.department] - Department
     * @param {string} [payload.job_title] - Job title
     * @param {string} [payload.status] - Status (defaults to 'Active')
     * @returns {Promise<Object>} - Created admin with credentials
     * 
     * Response includes:
     * - message: Success message
     * - credentials: { email, password } (auto-generated password if not provided)
     * - admin: Staff profile with linked user account
     * 
     * Notes:
     * - Requires super_admin role
     * - Creates users record and admins staff profile
     * - Assigns Spatie role 'admin'
     * - users.name is auto-composed from first + last name
     */
    createStaff: async (payload) => {
        const res = await apiService.post('/admins', payload);
        return res; // Return full response including credentials
    },

    /**
     * Get staff/admin details by ID
     * GET /admins/{id}
     * 
     * @param {string|number} adminId - The admin ID
     * @returns {Promise<Object>} - Admin details with user account
     */
    getStaffById: async (adminId) => {
        const res = await apiService.get(`/admins/${adminId}`);
        return unwrapData(res);
    },

    /**
     * Update a staff/admin
     * PUT /admins/{id}
     * 
     * @param {string|number} adminId - The admin ID
     * @param {Object} payload - Staff data to update
     * @returns {Promise<Object>} - Updated admin data
     */
    updateStaff: async (adminId, payload) => {
        const res = await apiService.put(`/admins/${adminId}`, payload);
        return unwrapData(res);
    },

    /**
     * Delete a staff/admin
     * DELETE /admins/{id}
     * 
     * @param {string|number} adminId - The admin ID
     * @returns {Promise<{success: boolean}>}
     */
    deleteStaff: async (adminId) => {
        const res = await apiService.delete(`/admins/${adminId}`);
        return { success: true, ...res };
    },

    /**
     * Toggle staff status (Active/Inactive)
     * PUT /admins/{id}
     * 
     * @param {string|number} adminId - The admin ID
     * @param {string} newStatus - New status ('Active' or 'Inactive')
     * @returns {Promise<Object>} - Updated admin data
     */
    toggleStatus: async (adminId, newStatus) => {
        const res = await apiService.put(`/admins/${adminId}`, { status: newStatus });
        return unwrapData(res);
    },
};

export default staffService;

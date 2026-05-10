import { apiService } from '../../../services/api';

const STAFF_ENDPOINT = '/admin/staff';

const unwrapData = (res) => {
    if (!res) return null;
    return res.data || res.staff || res.user || res;
};

const unwrapList = (res) => {
    if (!res) return { data: [], meta: {}, links: {} };
    if (Array.isArray(res)) return { data: res, meta: {}, links: {} };

    return {
        data: res.data || res.staff || res.users || [],
        meta: res.meta || {},
        links: res.links || {},
    };
};

const buildQuery = (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        searchParams.append(key, String(value));
    });
    const query = searchParams.toString();
    return query ? `?${query}` : '';
};

export const staffService = {
    listStaff: async ({ role, q, suspended, per_page = 25 } = {}) => {
        const query = buildQuery({ role, q, suspended, per_page });
        const res = await apiService.get(`${STAFF_ENDPOINT}${query}`);
        return unwrapList(res);
    },

    createStaff: async (payload) => {
        const res = await apiService.post(STAFF_ENDPOINT, payload);
        return unwrapData(res);
    },

    getStaffById: async (userId) => {
        const res = await apiService.get(`${STAFF_ENDPOINT}/${userId}`);
        return unwrapData(res);
    },

    updateStaff: async (userId, payload) => {
        const res = await apiService.patch(`${STAFF_ENDPOINT}/${userId}`, payload);
        return unwrapData(res);
    },

    replaceRoles: async (userId, roles) => {
        const res = await apiService.patch(`${STAFF_ENDPOINT}/${userId}/roles`, { roles });
        return unwrapData(res);
    },

    replacePermissions: async (userId, permissions) => {
        const res = await apiService.patch(`${STAFF_ENDPOINT}/${userId}/permissions`, { permissions });
        return unwrapData(res);
    },

    resetPassword: async (userId, payload) => {
        const res = await apiService.post(`${STAFF_ENDPOINT}/${userId}/reset-password`, payload);
        return unwrapData(res);
    },

    suspendStaff: async (userId) => {
        const res = await apiService.post(`${STAFF_ENDPOINT}/${userId}/suspend`);
        return unwrapData(res);
    },

    unsuspendStaff: async (userId) => {
        const res = await apiService.post(`${STAFF_ENDPOINT}/${userId}/unsuspend`);
        return unwrapData(res);
    },

    uploadAvatar: async (userId, file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const res = await apiService.post(`${STAFF_ENDPOINT}/${userId}/avatar`, formData);
        return unwrapData(res);
    },
};

export default staffService;

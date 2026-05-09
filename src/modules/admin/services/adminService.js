import { apiService } from "../../../services/api";

const unwrapList = (res) => {
    if (!res) return { data: [], meta: {}, links: {} };
    return {
        data: res.data || [],
        meta: res.meta || {},
        links: res.links || {}
    };
};

export const adminService = {
    // No /admin/dashboard or /admin/stats endpoint exists on the backend.
    // Dashboard.jsx now fetches real counts directly from documented endpoints.
    getDashboard: async () => ({}),
    getStats: async () => ({}),

    // /admin/students doesn't exist; LearnerManagement uses /support/users instead.
    listStudents: async () => ({ data: [], meta: {}, links: {} }),
};

export default adminService;

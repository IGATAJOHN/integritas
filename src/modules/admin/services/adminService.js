import { apiService } from "../../../services/api";

const unwrapData = (res) => {
    if (!res) return null;
    return res.data ? res.data : res;
};


const unwrapList = (res) => {
    if (!res) return { data: [], meta: {}, links: {} };
    return {
        data: res.data || [],
        meta: res.meta || {},
        links: res.links || {}
    };
};


export const adminService = {

    getDashboard: async () => {
        const res = await apiService.get('/admin/dashboard');
        return unwrapData(res);
    },

    getStats: async () => {
        const res = await apiService.get('/admin/stats');
        return unwrapData(res);
    },

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

    getTutorById: async (tutorId) => {
        const res = await apiService.get(`/admin/tutors/${tutorId}`);
        return unwrapData(res);
    },
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

   
    getTutorById: async (tutorId) => {
        const res = await apiService.get(`/admin/tutors/${tutorId}`);
        return unwrapData(res);
    },

    deleteTutor: async (tutorId) => {
        const res = await apiService.delete(`/admin/tutors/${tutorId}`);
        return { success: true, ...res };
    },

    approveTutor: async (tutorId) => {
        const res = await apiService.post(`/admin/tutors/${tutorId}/approve`);
        return unwrapData(res);
    },

    rejectTutor: async (tutorId, reason) => {
        const res = await apiService.post(`/admin/tutors/${tutorId}/reject`, { reason });
        return unwrapData(res);
    },

    suspendTutor: async (tutorId, reason) => {
        const res = await apiService.post(`/admin/tutors/${tutorId}/suspend`, { reason });
        return unwrapData(res);
    },

    unsuspendTutor: async (tutorId) => {
        const res = await apiService.post(`/admin/tutors/${tutorId}/unsuspend`);
        return unwrapData(res);
    },

    // ============ REVIEWER MANAGEMENT ============


    listReviewers: async ({ page, per_page = 20 } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);

        const queryString = params.toString();
        const endpoint = queryString ? `/admin/reviewers?${queryString}` : '/admin/reviewers';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    createReviewer: async (payload) => {
        const res = await apiService.post('/admin/reviewers', payload);
        return unwrapData(res);
    },

    getReviewerById: async (reviewerId) => {
        const res = await apiService.get(`/admin/reviewers/${reviewerId}`);
        return unwrapData(res);
    },

    deleteReviewer: async (reviewerId) => {
        const res = await apiService.delete(`/admin/reviewers/${reviewerId}`);
        return { success: true, ...res };
    },

    // ============ STUDENT MANAGEMENT ============

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

    getStudentById: async (studentId) => {
        const res = await apiService.get(`/admin/students/${studentId}`);
        return unwrapData(res);
    },

    deleteStudent: async (studentId) => {
        const res = await apiService.delete(`/admin/students/${studentId}`);
        return { success: true, ...res };
    },

    // ============ WITHDRAWALS & PAYOUTS ============

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

    processPayout: async (payload) => {
        const res = await apiService.post('/admin/payouts', payload);
        return unwrapData(res);
    },

    // ============ AUDIT & SETTINGS ============

    getAuditLogs: async ({ page, per_page = 50 } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);

        const queryString = params.toString();
        const endpoint = queryString ? `/admin/audit-logs?${queryString}` : '/admin/audit-logs';
        const res = await apiService.get(endpoint);
        return unwrapList(res);
    },

    getSettings: async () => {
        const res = await apiService.get('/admin/settings');
        return unwrapData(res);
    },

    updateSettings: async (payload) => {
        const res = await apiService.post('/admin/settings', payload);
        return unwrapData(res);
    },
};

export default adminService;

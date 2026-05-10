import { apiService } from '../../../services/api';

const unwrap = (res) => (res && res.data ? res.data : res);

const unwrapList = (res) => {
    if (!res) return { data: [], meta: {}, links: {} };
    if (Array.isArray(res)) return { data: res, meta: {}, links: {} };
    return {
        data: res.data || [],
        meta: res.meta || {},
        links: res.links || {},
    };
};

const buildQuery = (params = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        search.append(key, String(value));
    });
    const query = search.toString();
    return query ? `?${query}` : '';
};

const appendIfPresent = (formData, key, value) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, value);
};

export const adminFoundationalTutorService = {
    listTutors: async ({ type, kyc_status, q, per_page = 25, page } = {}) => {
        const query = buildQuery({ type, kyc_status, q, per_page, page });
        const res = await apiService.get(`/admin/tutors${query}`);
        return unwrapList(res);
    },

    listInvites: async () => {
        const res = await apiService.get('/admin/foundational-tutors/invites');
        return unwrapList(res);
    },

    createInvite: async ({ email, name }) => {
        const res = await apiService.post('/admin/foundational-tutors/invites', { email, name });
        return unwrap(res);
    },

    revokeInvite: async (id) => {
        const res = await apiService.delete(`/admin/foundational-tutors/invites/${encodeURIComponent(id)}`);
        return unwrap(res);
    },

    createFoundationalTutor: async (payload) => {
        const formData = new FormData();
        appendIfPresent(formData, 'name', payload.name);
        appendIfPresent(formData, 'email', payload.email);
        appendIfPresent(formData, 'phone', payload.phone);
        appendIfPresent(formData, 'bio', payload.bio);
        appendIfPresent(formData, 'password', payload.password);
        formData.append('send_welcome_email', payload.send_welcome_email ? '1' : '0');
        if (payload.avatar) formData.append('avatar', payload.avatar);

        const res = await apiService.post('/admin/foundational-tutors', formData);
        return unwrap(res);
    },

    getFoundationalTutor: async (userId) => {
        const res = await apiService.get(`/admin/foundational-tutors/${encodeURIComponent(userId)}`);
        return unwrap(res);
    },

    updateFoundationalTutor: async (userId, payload) => {
        const res = await apiService.patch(`/admin/foundational-tutors/${encodeURIComponent(userId)}`, payload);
        return unwrap(res);
    },

    uploadFoundationalAvatar: async (userId, avatar) => {
        const formData = new FormData();
        formData.append('avatar', avatar);
        const res = await apiService.post(`/admin/foundational-tutors/${encodeURIComponent(userId)}/avatar`, formData);
        return unwrap(res);
    },

    resetFoundationalPassword: async (userId, payload) => {
        const res = await apiService.post(`/admin/foundational-tutors/${encodeURIComponent(userId)}/reset-password`, payload);
        return unwrap(res);
    },
};

export default adminFoundationalTutorService;

/**
 * Admin Tutor + Foundational Tutor Invites Service
 *
 * Endpoints:
 *   GET    /admin/tutors                                       (search list)
 *   GET    /admin/foundational-tutors/invites                  (invite list)
 *   POST   /admin/foundational-tutors/invites { email, name }  (create invite)
 *   DELETE /admin/foundational-tutors/invites/{id}             (revoke)
 */

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

export const adminFoundationalTutorService = {
    /**
     * GET /admin/tutors
     * @param {object} opts
     * @param {'foundational'|'expert'} [opts.type]
     * @param {'not_submitted'|'pending_review'|'approved'|'rejected'} [opts.kyc_status]
     * @param {string} [opts.q]
     * @param {number} [opts.per_page]
     * @param {number} [opts.page]
     */
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
};

export default adminFoundationalTutorService;

/**
 * Admin Transactions / Enrolments / Refunds Service
 *
 * Endpoints:
 *   GET  /admin/transactions
 *   GET  /admin/transactions/{id}
 *   GET  /admin/enrolments
 *   GET  /admin/refund-requests
 *   POST /admin/refund-requests/{id}/approve
 *   POST /admin/refund-requests/{id}/reject
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

export const adminTransactionsService = {
    listTransactions: async ({ page, per_page = 20, status, type } = {}) => {
        const query = buildQuery({ page, per_page, status, type });
        const res = await apiService.get(`/admin/transactions${query}`);
        return unwrapList(res);
    },

    getTransaction: async (id) => {
        const res = await apiService.get(`/admin/transactions/${encodeURIComponent(id)}`);
        return unwrap(res);
    },

    listEnrolments: async ({ page, per_page = 20 } = {}) => {
        const query = buildQuery({ page, per_page });
        const res = await apiService.get(`/admin/enrolments${query}`);
        return unwrapList(res);
    },

    listRefundRequests: async ({ page, per_page = 20, status } = {}) => {
        const query = buildQuery({ page, per_page, status });
        const res = await apiService.get(`/admin/refund-requests${query}`);
        return unwrapList(res);
    },

    approveRefund: async (id, notes = '') => {
        const res = await apiService.post(
            `/admin/refund-requests/${encodeURIComponent(id)}/approve`,
            { notes }
        );
        return unwrap(res);
    },

    rejectRefund: async (id, notes = '') => {
        const res = await apiService.post(
            `/admin/refund-requests/${encodeURIComponent(id)}/reject`,
            { notes }
        );
        return unwrap(res);
    },
};

export default adminTransactionsService;

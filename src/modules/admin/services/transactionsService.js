/**
 * Admin Transactions / Enrolments / Refunds / Certificates Service
 *
 * Documented endpoints:
 *   GET  /admin/transactions
 *   GET  /admin/transactions/{id}
 *   POST /admin/transactions/{id}/manual-refund
 *   GET  /admin/enrolments
 *   POST /admin/enrolments/{id}/cancel
 *   POST /admin/enrolments/{id}/reinstate
 *   GET  /admin/refund-requests
 *   POST /admin/refund-requests/{id}/approve
 *   POST /admin/refund-requests/{id}/reject
 *   POST /support/transactions/{id}/flag-refund
 *   POST /admin/learners/{user_id}/comp-enrol
 *   GET  /admin/certificates
 *   GET  /admin/certificates/{uuid}
 *   POST /admin/certificates/{uuid}/revoke
 *   POST /admin/certificates/{uuid}/unrevoke
 *   POST /admin/certificates/{uuid}/regenerate-pdf
 *   POST /admin/certificates/{uuid}/reissue
 *   GET  /admin/audit-logs
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

    // ── Transactions ─────────────────────────────────────────────────────────

    listTransactions: async ({ page, per_page = 20, status, type } = {}) => {
        const query = buildQuery({ page, per_page, status, type });
        const res = await apiService.get(`/admin/transactions${query}`);
        return unwrapList(res);
    },

    getTransaction: async (id) => {
        const res = await apiService.get(`/admin/transactions/${encodeURIComponent(id)}`);
        return unwrap(res);
    },

    /**
     * POST /admin/transactions/{id}/manual-refund
     * Used when Paystack is unavailable or refund was processed externally.
     * @param {string|number} id
     * @param {{ reason: string, external_reference?: string, notes?: string }} payload
     */
    manualRefund: async (id, { reason, external_reference, notes } = {}) => {
        const res = await apiService.post(
            `/admin/transactions/${encodeURIComponent(id)}/manual-refund`,
            { reason, external_reference, notes }
        );
        return unwrap(res);
    },

    // ── Enrolments ────────────────────────────────────────────────────────────

    listEnrolments: async ({ page, per_page = 20 } = {}) => {
        const query = buildQuery({ page, per_page });
        const res = await apiService.get(`/admin/enrolments${query}`);
        return unwrapList(res);
    },

    /**
     * POST /admin/enrolments/{id}/cancel
     * Cancels a learner's enrolment.
     * @param {string|number} id - Enrolment ID
     * @param {string} reason
     */
    cancelEnrolment: async (id, reason) => {
        const res = await apiService.post(
            `/admin/enrolments/${encodeURIComponent(id)}/cancel`,
            { reason }
        );
        return unwrap(res);
    },

    /**
     * POST /admin/enrolments/{id}/reinstate
     * Reinstates a previously cancelled enrolment.
     * @param {string|number} id - Enrolment ID
     * @param {string} [notes]
     */
    reinstateEnrolment: async (id, notes = '') => {
        const res = await apiService.post(
            `/admin/enrolments/${encodeURIComponent(id)}/reinstate`,
            { notes }
        );
        return unwrap(res);
    },

    /**
     * POST /admin/learners/{user_id}/comp-enrol
     * Grants a learner free/complementary access to a course.
     * @param {string|number} userId
     * @param {{ course_slug: string, reason: string }} payload
     */
    compEnrol: async (userId, { course_slug, reason }) => {
        const res = await apiService.post(
            `/admin/learners/${encodeURIComponent(userId)}/comp-enrol`,
            { course_slug, reason }
        );
        return unwrap(res);
    },

    // ── Refund Requests ───────────────────────────────────────────────────────

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

    // ── Support: Flag for Refund ──────────────────────────────────────────────

    flagForRefund: async (id, reason = '') => {
        const res = await apiService.post(
            `/support/transactions/${encodeURIComponent(id)}/flag-refund`,
            { reason }
        );
        return unwrap(res);
    },

    // ── Admin Certificates ────────────────────────────────────────────────────

    /**
     * GET /admin/certificates
     * @param {{ status?, course_id?, user_id?, q?, per_page? }} opts
     */
    listCertificates: async ({ status, course_id, user_id, q, per_page = 25 } = {}) => {
        const query = buildQuery({ status, course_id, user_id, q, per_page });
        const res = await apiService.get(`/admin/certificates${query}`);
        return unwrapList(res);
    },

    getCertificate: async (uuid) => {
        const res = await apiService.get(`/admin/certificates/${encodeURIComponent(uuid)}`);
        return unwrap(res);
    },

    /** POST /admin/certificates/{uuid}/revoke — { reason } */
    revokeCertificate: async (uuid, reason) => {
        const res = await apiService.post(`/admin/certificates/${encodeURIComponent(uuid)}/revoke`, { reason });
        return unwrap(res);
    },

    /** POST /admin/certificates/{uuid}/unrevoke — { notes } */
    unrevokeCertificate: async (uuid, notes = '') => {
        const res = await apiService.post(`/admin/certificates/${encodeURIComponent(uuid)}/unrevoke`, { notes });
        return unwrap(res);
    },

    /** POST /admin/certificates/{uuid}/regenerate-pdf */
    regenerateCertificatePdf: async (uuid) => {
        const res = await apiService.post(`/admin/certificates/${encodeURIComponent(uuid)}/regenerate-pdf`);
        return unwrap(res);
    },

    /** POST /admin/certificates/{uuid}/reissue — { reason } */
    reissueCertificate: async (uuid, reason) => {
        const res = await apiService.post(`/admin/certificates/${encodeURIComponent(uuid)}/reissue`, { reason });
        return unwrap(res);
    },

    // ── Audit Logs ────────────────────────────────────────────────────────────

    /**
     * GET /admin/audit-logs
     * @param {{ action?, action_prefix?, actor_id?, auditable_type?, auditable_id?, request_id?, from?, to?, per_page? }} opts
     */
    getAuditLogs: async ({ action, action_prefix, actor_id, auditable_type, auditable_id, request_id, from, to, per_page = 50 } = {}) => {
        const query = buildQuery({ action, action_prefix, actor_id, auditable_type, auditable_id, request_id, from, to, per_page });
        const res = await apiService.get(`/admin/audit-logs${query}`);
        return unwrapList(res);
    },
};

export default adminTransactionsService;

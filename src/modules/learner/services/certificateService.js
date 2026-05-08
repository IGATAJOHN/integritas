/**
 * Certificate Service — wired to the new Integritas backend.
 *
 * Endpoints:
 *   GET  /learner/certificates                                    -> list
 *   GET  /learner/certificates/{uuid}                             -> single record
 *   POST /learner/certificates/{uuid}/initiate-payment            -> { authorization_url, reference }
 *   GET  /learner/certificates/{uuid}/pdf                         -> PDF binary (auth required)
 *
 * Public verification (no auth):
 *   GET /verify/{uuid}                                            -> { learner, course, status, ... }
 *   GET /verify/{uuid}/pdf                                        -> PDF binary
 */

import { apiService, newIdempotencyKey, authFetch, buildBackendUrl } from '../../../services/api';

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

export const learnerCertificateService = {
    list: async () => {
        const res = await apiService.get('/learner/certificates');
        return unwrapList(res);
    },

    get: async (uuid) => {
        const res = await apiService.get(`/learner/certificates/${encodeURIComponent(uuid)}`);
        return unwrap(res);
    },

    initiatePayment: async (uuid, { idempotencyKey } = {}) => {
        const key = idempotencyKey || newIdempotencyKey();
        const res = await apiService.post(
            `/learner/certificates/${encodeURIComponent(uuid)}/initiate-payment`,
            { idempotency_key: key },
            { idempotencyKey: key }
        );
        return unwrap(res);
    },

    /**
     * Triggers a download of the PDF file. Uses an authed fetch + blob so the
     * Authorization header is sent.
     */
    downloadPdf: async (uuid, filename = 'certificate.pdf') => {
        const response = await authFetch(`/learner/certificates/${encodeURIComponent(uuid)}/pdf`);
        if (!response.ok) {
            throw new Error(`Failed to download certificate (${response.status})`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    verifyPublic: async (uuid) => {
        // Public verification endpoint lives at /verify/{uuid} — no auth required.
        const res = await apiService.get(`/verify/${encodeURIComponent(uuid)}`);
        return unwrap(res);
    },

    publicPdfUrl: (uuid) => buildBackendUrl(`/verify/${encodeURIComponent(uuid)}/pdf`),
};

export default learnerCertificateService;

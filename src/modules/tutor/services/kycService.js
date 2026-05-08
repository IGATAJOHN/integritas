import { apiService, authFetch } from '../../../services/api';

/**
 * Tutor KYC service — wired to the new Integritas backend.
 *
 * Endpoints:
 *   GET   /me/expert/profile
 *   POST  /me/expert/kyc                      multipart { government_id, qualification, photo }
 *   PATCH /me/expert/banking                  { bank_name, account_name, account_number }
 *   GET   /me/expert/earnings
 */

export const kycService = {
    getProfile: () => apiService.get('/me/expert/profile'),

    /**
     * Single multipart submission of all three KYC documents.
     * @param {{ government_id: File, qualification: File, photo: File }} files
     */
    submitKyc: async (files = {}) => {
        const form = new FormData();
        if (files.government_id) form.append('government_id', files.government_id);
        if (files.qualification) form.append('qualification', files.qualification);
        if (files.photo) form.append('photo', files.photo);
        const response = await authFetch('/me/expert/kyc', {
            method: 'POST',
            body: form,
        });
        if (!response.ok) {
            let msg = 'Failed to submit KYC';
            try {
                const d = await response.json();
                msg = d.message || msg;
            } catch (_e) {
                /* ignore */
            }
            const err = new Error(msg);
            err.status = response.status;
            throw err;
        }
        if (response.status === 204) return null;
        return response.json();
    },

    updateBanking: ({ bank_name, account_name, account_number }) =>
        apiService.patch('/me/expert/banking', { bank_name, account_name, account_number }),

    getEarnings: () => apiService.get('/me/expert/earnings'),

    // Backwards-compatible aliases for legacy callers (Kyc.jsx etc.)
    getKyc: () => apiService.get('/me/expert/profile'),
    updateKyc: (payload) => apiService.patch('/me/expert/banking', payload),
    deleteDocument: async () => ({
        success: false,
        message: 'Document deletion is not supported on the new backend; resubmit instead.',
    }),

    /**
     * Legacy single-document upload kept as a no-op shim that routes everything
     * through the new multipart endpoint. Callers that buffered a single file
     * per type should switch to submitKyc({ government_id, qualification, photo }).
     */
    uploadDocument: async (file, type) => {
        const map = {
            id_front: 'government_id',
            id: 'government_id',
            government_id: 'government_id',
            qualification: 'qualification',
            certificate: 'qualification',
            photo: 'photo',
            avatar: 'photo',
        };
        const field = map[type] || 'government_id';
        const form = new FormData();
        form.append(field, file);
        const response = await authFetch('/me/expert/kyc', { method: 'POST', body: form });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || 'Failed to upload document');
            error.status = response.status;
            error.data = errorData;
            throw error;
        }
        return response.json();
    },
};

export default kycService;

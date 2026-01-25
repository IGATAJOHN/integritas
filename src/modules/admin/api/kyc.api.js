import { api } from '../../../api/client';

/**
 * @param {string|number} kycId 
 * @returns {Promise<Object>}
 */
export const adminGetKycById = async (kycId) => {
    try {
        const data = await api.get(`/admin/kyc/${kycId}`);
        return data;
    } catch (error) {
        console.error(`Error fetching KYC ${kycId}:`, error);
        throw error;
    }
};

/**
 * Approves a KYC submission.
 * @param {string|number} kycId - The ID of the KYC submission.
 * @param {string} [reviewNote] - Optional note for the approval.
 * @returns {Promise<Object>} The server response.
 */
export const adminApproveKyc = async (kycId, reviewNote) => {
    try {
        const data = await api.post(`/admin/kyc/${kycId}/approve`, {
            review_note: reviewNote || "Approved.",
        });
        return data;
    } catch (error) {
        console.error(`Error approving KYC ${kycId}:`, error);
        throw error;
    }
};

/**
 * Rejects a KYC submission.
 * @param {string|number} kycId - The ID of the KYC submission.
 * @param {string} reviewNote - The reason for rejection.
 * @returns {Promise<Object>} The server response.
 */
export const adminRejectKyc = async (kycId, reviewNote) => {
    try {
        const data = await api.post(`/admin/kyc/${kycId}/reject`, {
            review_note: reviewNote,
        });
        return data;
    } catch (error) {
        console.error(`Error rejecting KYC ${kycId}:`, error);
        throw error;
    }
};

/**
 * Downloads a KYC document as a blob.
 * TODO: confirm endpoint path from Postman.
 * @param {string|number} documentId - The ID of the document to download.
 * @returns {Promise<Blob>} The document content as a Blob.
 */
export const adminDownloadKycDocument = async (documentId) => {
    try {
        // Calling the GET endpoint for the document
        const response = await api.get(`/admin/kyc/documents/${documentId}`, {
            responseType: 'blob',
        });
        return response; // axios client is configured to return response.data in its interceptor, but for blobs it might need the full response or just the blob
    } catch (error) {
        console.error(`Error downloading document ${documentId}:`, error);
        throw error;
    }
};

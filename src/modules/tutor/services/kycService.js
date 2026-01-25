import { apiService } from '../../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthToken = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const parsed = JSON.parse(user);
        return parsed.token;
    }
    return null;
};

export const kycService = {

    getKyc: () => apiService.get('/kyc/me'),

    updateKyc: (data) => apiService.put('/kyc/me', data),

    deleteDocument: (documentId) => apiService.delete(`/kyc/documents/${documentId}`),

    submitKyc: () => apiService.post('/kyc/submit'),

    /**
     * Upload a KYC document with a specific type
     * @param {File} file - The file to upload
     * @param {string} type - Document type: 'id_front', 'id_back', 'certificate', etc.
     * @returns {Promise<Object>} The uploaded document data
     */
    uploadDocument: async (file, type) => {
        const formData = new FormData();
        formData.append('file', file);  // Backend expects 'file' field
        formData.append('type', type);

        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/kyc/documents`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Accept': 'application/json',
            },
            body: formData,
        });

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
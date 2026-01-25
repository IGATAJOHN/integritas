import { apiService } from '../../../services/api';

export const kycService = {

    getKyc: () => apiService.get('/kyc/me'),

    updateKyc: (data) => apiService.put('/kyc/me', data),

    deleteDocument: (documentId) => apiService.delete(`/kyc/documents/${documentId}`),

    submitKyc: () => apiService.post('/kyc/submit'),
};

export default kycService;
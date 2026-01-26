import { apiService } from "../../../services/api";

export const adminListKyc = async ({
  status,
  role,
  q = "",
  page = 1,
} = {}) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (role) params.append("role", role);
  if (q !== undefined) params.append("q", q);
  if (page) params.append("page", String(page));

  return apiService.get(`/admin/kyc?${params.toString()}`);
};

export const adminGetKycById = async (kycId) => {
  return apiService.get(`/admin/kyc/${kycId}`);
};

export const adminApproveKyc = async (kycId, reviewNote = "Approved.") => {
  return apiService.post(`/admin/kyc/${kycId}/approve`, {
    review_note: reviewNote,
  });
};

export const adminRejectKyc = async (kycId, reviewNote) => {
  return apiService.post(`/admin/kyc/${kycId}/reject`, {
    review_note: reviewNote,
  });
};
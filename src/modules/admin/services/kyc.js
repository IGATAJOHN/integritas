import { apiService } from "../../../services/api";

const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const adminListKyc = async ({ status, role, q, page, per_page = 20 } = {}) => {
  const query = buildQuery({ status, role, q, page, per_page });
  return apiService.get(`/admin/kyc-queue${query}`);
};

export const adminGetKycById = async (kycId) => {
  return apiService.get(`/admin/kyc-queue/${encodeURIComponent(kycId)}`);
};

export const adminApproveKyc = async (kycId, reviewNote = "Approved.") => {
  return apiService.post(`/admin/kyc-queue/${encodeURIComponent(kycId)}/approve`, {
    review_note: reviewNote,
  });
};

export const adminRejectKyc = async (kycId, reviewNote) => {
  return apiService.post(`/admin/kyc-queue/${encodeURIComponent(kycId)}/reject`, {
    review_note: reviewNote,
  });
};

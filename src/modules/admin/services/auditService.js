import { apiService } from '../../../services/api';

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

export const auditService = {
    list: async (params = {}) => {
        const query = buildQuery(params);
        const res = await apiService.get(`/admin/audit-logs${query}`);
        return unwrapList(res);
    },
};

export default auditService;

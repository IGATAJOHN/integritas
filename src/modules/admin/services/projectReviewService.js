/**
 * Admin Project Submission Service
 *
 * Endpoints:
 *   GET  /admin/project-submissions
 *   GET  /admin/project-submissions/{id}
 *   POST /admin/project-submissions/{id}/grade { score, feedback }
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

export const adminProjectReviewService = {
    list: async ({ status, page, per_page = 20 } = {}) => {
        const query = buildQuery({ status, page, per_page });
        const res = await apiService.get(`/admin/project-submissions${query}`);
        return unwrapList(res);
    },

    get: async (id) => {
        const res = await apiService.get(`/admin/project-submissions/${encodeURIComponent(id)}`);
        return unwrap(res);
    },

    /**
     * Grade a project submission.
     * Backend: POST /admin/project-submissions/{id}/grade
     * Body: { passed: boolean, score_percent: number (0..100), feedback: string }
     */
    grade: async (id, { passed, score_percent, feedback }) => {
        const res = await apiService.post(
            `/admin/project-submissions/${encodeURIComponent(id)}/grade`,
            {
                passed: Boolean(passed),
                score_percent: Number(score_percent),
                feedback: feedback || '',
            }
        );
        return unwrap(res);
    },
};

export default adminProjectReviewService;

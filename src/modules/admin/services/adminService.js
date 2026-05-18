import { apiService } from "../../../services/api";

const unwrapList = (res) => {
    if (!res) return { data: [], meta: {}, links: {} };
    return {
        data: res.data || [],
        meta: res.meta || {},
        links: res.links || {}
    };
};

export const adminService = {
    // No /admin/dashboard or /admin/stats endpoint exists on the backend.
    // Dashboard.jsx now fetches real counts directly from documented endpoints.
    getDashboard: async () => ({}),
    getStats: async () => ({}),

    // /admin/students doesn't exist; LearnerManagement uses /support/users instead.
    listStudents: async () => ({ data: [], meta: {}, links: {} }),

    // Comp enrolment — grant a learner free access to a course
    // POST /admin/learners/{user_id}/comp-enrol { course_slug, reason }
    compEnrol: async (userId, courseSlug, reason) => {
        const res = await apiService.post(
            `/admin/learners/${encodeURIComponent(userId)}/comp-enrol`,
            { course_slug: courseSlug, reason }
        );
        return res?.data ?? res;
    },

    // Audit logs — now confirmed in the API docs
    // GET /admin/audit-logs?action=&action_prefix=&actor_id=&auditable_type=&auditable_id=&request_id=&from=&to=&per_page=
    getAuditLogs: async ({ action, action_prefix, actor_id, auditable_type, auditable_id, request_id, from, to, per_page = 50 } = {}) => {
        const params = new URLSearchParams();
        const add = (k, v) => { if (v !== undefined && v !== null && v !== '') params.append(k, v); };
        add('action', action); add('action_prefix', action_prefix); add('actor_id', actor_id);
        add('auditable_type', auditable_type); add('auditable_id', auditable_id);
        add('request_id', request_id); add('from', from); add('to', to); add('per_page', per_page);
        const query = params.toString() ? `?${params}` : '';
        const res = await apiService.get(`/admin/audit-logs${query}`);
        return unwrapList(res);
    },
};

export default adminService;

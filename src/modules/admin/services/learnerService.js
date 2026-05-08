/**
 * Learner Service for Admin Module
 *
 * Backed by the documented public API:
 * - GET /api/v1/support/users      — list users visible to support/admin
 * - GET /api/v1/admin/enrolments   — list all enrolments (used to derive per-learner counts)
 *
 * The API does not expose endpoints to fetch, update, or delete an individual
 * user, so this service is read-only.
 */

import { apiService } from '../../../services/api';

const LEARNER_ROLES = new Set(['learner', 'student']);

const normalizeRoles = (user) => {
    const raw = user?.roles ?? user?.role ?? [];
    if (Array.isArray(raw)) {
        return raw
            .map((entry) => (typeof entry === 'string' ? entry : entry?.name))
            .filter(Boolean)
            .map((r) => r.toLowerCase());
    }
    if (typeof raw === 'string') return [raw.toLowerCase()];
    return [];
};

const isLearner = (user) => {
    const roles = normalizeRoles(user);
    if (roles.length === 0) return true;
    return roles.some((role) => LEARNER_ROLES.has(role));
};

const fullName = (user) => {
    if (user?.name) return user.name;
    const first = user?.first_name || '';
    const last = user?.last_name || '';
    const joined = `${first} ${last}`.trim();
    return joined || user?.email || 'Unknown';
};

const normalizeStatus = (user) => {
    const raw = user?.status ?? (user?.deleted_at ? 'Inactive' : 'Active');
    if (typeof raw !== 'string') return 'Active';
    const lower = raw.toLowerCase();
    if (lower === 'active' || lower === 'inactive' || lower === 'suspended') {
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
    return raw;
};

const unwrapList = (res) => {
    if (!res) return { data: [], meta: {}, links: {} };
    if (Array.isArray(res)) return { data: res, meta: {}, links: {} };
    return {
        data: res.data || res.users || [],
        meta: res.meta || {},
        links: res.links || {},
    };
};

const buildEnrolmentCountMap = (enrolments) => {
    const counts = new Map();
    enrolments.forEach((enrolment) => {
        const userId =
            enrolment?.user_id ??
            enrolment?.user?.id ??
            enrolment?.learner_id ??
            enrolment?.learner?.id;
        if (userId == null) return;
        counts.set(userId, (counts.get(userId) || 0) + 1);
    });
    return counts;
};

export const learnerService = {
    /**
     * List learners.
     * GET /api/v1/support/users
     *
     * The endpoint returns all users visible to support/admin; this method
     * filters down to learners by role (or keeps the user when no role info
     * is present, since some payloads omit the field for plain learners).
     *
     * @param {Object} [options]
     * @param {string} [options.search]   - Client-side search across name and email.
     * @param {number} [options.page]
     * @param {number} [options.per_page]
     * @param {boolean} [options.withEnrolmentCounts=true] - Pull /admin/enrolments
     *        to compute an enrolments_count per learner. Disable to skip the call.
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    listLearners: async ({
        search,
        page,
        per_page,
        withEnrolmentCounts = true,
    } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);
        const qs = params.toString();
        const endpoint = qs ? `/support/users?${qs}` : '/support/users';

        const usersRes = await apiService.get(endpoint);
        const list = unwrapList(usersRes);

        let enrolmentCounts = new Map();
        if (withEnrolmentCounts) {
            try {
                const enrolmentsRes = await apiService.get('/admin/enrolments');
                const enrolments = unwrapList(enrolmentsRes).data;
                enrolmentCounts = buildEnrolmentCountMap(enrolments);
            } catch {
                enrolmentCounts = new Map();
            }
        }

        const term = (search || '').trim().toLowerCase();

        const learners = list.data
            .filter(isLearner)
            .map((user) => ({
                id: user.id,
                name: fullName(user),
                email: user.email || '',
                status: normalizeStatus(user),
                enrollments_count:
                    user.enrollments_count ??
                    user.enrolments_count ??
                    enrolmentCounts.get(user.id) ??
                    0,
                last_login_at:
                    user.last_login_at ?? user.last_seen_at ?? user.updated_at ?? null,
                raw: user,
            }))
            .filter((user) => {
                if (!term) return true;
                return (
                    user.name.toLowerCase().includes(term) ||
                    user.email.toLowerCase().includes(term)
                );
            });

        return { data: learners, meta: list.meta, links: list.links };
    },
};

export default learnerService;

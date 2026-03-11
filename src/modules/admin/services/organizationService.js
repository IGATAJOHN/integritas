import { apiService } from '../../../services/api';

const unwrapData = (res) => {
    if (!res) return null;
    if (res.data && !Array.isArray(res.data)) return res.data;
    return res;
};

const unwrapList = (res, fallbackKeys = []) => {
    if (!res) return { data: [], meta: {}, links: {} };

    if (Array.isArray(res)) {
        return { data: res, meta: {}, links: {} };
    }

    if (Array.isArray(res.data)) {
        return {
            data: res.data,
            meta: res.meta || {},
            links: res.links || {},
        };
    }

    // Handles { data: { data: [], ...pagination } }
    if (res.data && Array.isArray(res.data.data)) {
        return {
            data: res.data.data,
            meta: {
                current_page: res.data.current_page,
                from: res.data.from,
                last_page: res.data.last_page,
                path: res.data.path,
                per_page: res.data.per_page,
                to: res.data.to,
                total: res.data.total,
                links: res.data.links || [],
            },
            links: {
                first: res.data.first_page_url,
                last: res.data.last_page_url,
                prev: res.data.prev_page_url,
                next: res.data.next_page_url,
            },
        };
    }

    for (const key of fallbackKeys) {
        if (Array.isArray(res[key])) {
            return {
                data: res[key],
                meta: res.meta || {},
                links: res.links || {},
            };
        }
    }

    return {
        data: [],
        meta: res.meta || {},
        links: res.links || {},
    };
};

const appendIfPresent = (formData, key, value) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, value);
};

const buildQueryString = (params = {}) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        searchParams.append(key, value);
    });

    const query = searchParams.toString();
    return query ? `?${query}` : '';
};

const INVITE_TOKEN_KEYS = ['token', 'invitation_token', 'invite_token', 'accept_token', 'acceptance_token'];
const INVITE_URL_KEYS = ['invite_url', 'accept_url', 'url', 'link'];
const INVITE_USER_KEYS = ['email', 'name', 'role', 'id'];

const collectInviteDebugEntries = (value, entries = []) => {
    if (!value) return entries;

    if (Array.isArray(value)) {
        value.forEach((item) => collectInviteDebugEntries(item, entries));
        return entries;
    }

    if (typeof value !== 'object') return entries;

    const entry = {};
    let hasInterestingField = false;

    INVITE_USER_KEYS.forEach((key) => {
        if (value[key] === undefined || value[key] === null || value[key] === '') return;
        entry[key] = value[key];
        hasInterestingField = true;
    });

    INVITE_TOKEN_KEYS.forEach((key) => {
        const fieldValue = value[key];
        if (typeof fieldValue !== 'string' || !fieldValue.trim()) return;
        entry[key] = fieldValue;
        hasInterestingField = true;
    });

    INVITE_URL_KEYS.forEach((key) => {
        const fieldValue = value[key];
        if (typeof fieldValue !== 'string' || !fieldValue.trim()) return;
        entry[key] = fieldValue;
        hasInterestingField = true;
    });

    if (hasInterestingField) {
        entries.push(entry);
    }

    Object.values(value).forEach((child) => collectInviteDebugEntries(child, entries));
    return entries;
};

const dedupeInviteDebugEntries = (entries = []) => {
    const seen = new Set();
    return entries.filter((entry) => {
        const key = JSON.stringify(entry);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const logInviteDebug = ({ source, orgId, payload, response }) => {
    const emails = Array.isArray(payload?.emails) ? payload.emails : [];
    const entries = dedupeInviteDebugEntries(collectInviteDebugEntries(response));

    console.groupCollapsed(`[Invite Debug] ${source} (org: ${orgId})`);
    console.log('Requested emails:', emails);

    if (entries.length > 0) {
        console.table(entries);
    } else {
        console.warn('No invite token fields found in response. Raw response logged below.');
    }

    console.log('Raw invite response:', response);
    console.groupEnd();
};

export const organizationService = {
    // -------- Organizations --------
    createOrganizationJson: async (payload) => {
        const res = await apiService.post('/orgs', payload);
        return unwrapData(res);
    },

    createOrganizationMultipart: async (payload = {}) => {
        const formData = new FormData();
        appendIfPresent(formData, 'name', payload.name);
        appendIfPresent(formData, 'email_domain', payload.email_domain);

        if (payload.logo instanceof File) {
            formData.append('logo', payload.logo);
        }

        const res = await apiService.post('/orgs', formData);
        return unwrapData(res);
    },

    // -------- Invitations --------
    batchInviteStaff: async (orgId, payload) => {
        const res = await apiService.post(`/orgs/${orgId}/invitations`, payload);
        const data = unwrapData(res);
        logInviteDebug({ source: 'batchInviteStaff', orgId, payload, response: data });
        return data;
    },

    acceptInvitationPublic: async (payload) => {
        const res = await apiService.post('/org-invitations/public/accept', payload);
        return unwrapData(res);
    },

    acceptInvitationLoggedIn: async (payload) => {
        const res = await apiService.post('/org-invitations/public/accept', payload);
        return unwrapData(res);
    },

    resendSingleInvitation: async (orgId, payload) => {
        const res = await apiService.post(`/orgs/${orgId}/invitations/resend`, payload);
        return unwrapData(res);
    },

    resendBulkInvitations: async (orgId, payload) => {
        const res = await apiService.post(`/orgs/${orgId}/invitations/resend-bulk`, payload);
        return unwrapData(res);
    },

    listInvitations: async (orgId, {
        status,
        role,
        q,
        per_page = 20,
        page,
    } = {}) => {
        const query = buildQueryString({ status, role, q, per_page, page });
        const res = await apiService.get(`/orgs/${orgId}/invitations${query}`);
        return unwrapList(res);
    },

    revokeSingleInvitation: async (orgId, invitationId, payload = {}) => {
        const res = await apiService.post(`/orgs/${orgId}/invitations/${invitationId}/revoke`, payload);
        return unwrapData(res);
    },

    revokeBulkInvitations: async (orgId, payload) => {
        const res = await apiService.post(`/orgs/${orgId}/invitations/revoke-bulk`, payload);
        return unwrapData(res);
    },

    // -------- Learning Paths --------
    listLearningPaths: async (orgId, {
        status,
        q,
        per_page = 20,
        page,
    } = {}) => {
        const query = buildQueryString({ status, q, per_page, page });
        const res = await apiService.get(`/orgs/${orgId}/learning-paths${query}`);
        return unwrapList(res);
    },

    createLearningPath: async (orgId, payload) => {
        const res = await apiService.post(`/orgs/${orgId}/learning-paths`, payload);
        return unwrapData(res);
    },

    getLearningPathById: async (orgId, learningPathId, { with_items = 1 } = {}) => {
        const query = buildQueryString({ with_items });
        const res = await apiService.get(`/orgs/${orgId}/learning-paths/${learningPathId}${query}`);
        return unwrapData(res);
    },

    updateLearningPath: async (orgId, learningPathId, payload) => {
        const res = await apiService.patch(`/orgs/${orgId}/learning-paths/${learningPathId}`, payload);
        return unwrapData(res);
    },

    publishLearningPath: async (orgId, learningPathId) => {
        const res = await apiService.post(`/orgs/${orgId}/learning-paths/${learningPathId}/publish`);
        return unwrapData(res);
    },

    archiveLearningPath: async (orgId, learningPathId) => {
        const res = await apiService.post(`/orgs/${orgId}/learning-paths/${learningPathId}/archive`);
        return unwrapData(res);
    },

    deleteLearningPath: async (orgId, learningPathId) => {
        const res = await apiService.delete(`/orgs/${orgId}/learning-paths/${learningPathId}`);
        return unwrapData(res);
    },

    listLearningPathItems: async (orgId, learningPathId) => {
        const res = await apiService.get(`/orgs/${orgId}/learning-paths/${learningPathId}/items`);
        return unwrapList(res, ['items']);
    },

    addCourseToLearningPath: async (orgId, learningPathId, payload) => {
        const res = await apiService.post(`/orgs/${orgId}/learning-paths/${learningPathId}/items`, payload);
        return unwrapData(res);
    },

    removeLearningPathItem: async (orgId, learningPathId, itemId) => {
        // Postman request entry is broken, but docs describe DELETE.
        const res = await apiService.delete(`/orgs/${orgId}/learning-paths/${learningPathId}/items/${itemId}`);
        return unwrapData(res);
    },

    reorderLearningPathItems: async (orgId, learningPathId, payload) => {
        const res = await apiService.post(`/orgs/${orgId}/learning-paths/${learningPathId}/items/reorder`, payload);
        return unwrapData(res);
    },

    // -------- Organization Assignments --------
    assignToUsers: async (orgId, payload) => {
        const res = await apiService.post(`/orgs/${orgId}/assignments`, payload);
        return unwrapData(res);
    },

    listAssignments: async (orgId, {
        type,
        status,
        per_page = 20,
        page,
    } = {}) => {
        const query = buildQueryString({ type, status, per_page, page });
        const res = await apiService.get(`/orgs/${orgId}/assignments${query}`);
        return unwrapList(res);
    },

    revokeAssignment: async (orgId, assignmentId) => {
        // Request entry says GET, description says POST. Try POST then fallback to GET.
        try {
            const res = await apiService.post(`/orgs/${orgId}/assignments/${assignmentId}/revoke`);
            return unwrapData(res);
        } catch (err) {
            if (err?.status === 404 || err?.status === 405) {
                const res = await apiService.get(`/orgs/${orgId}/assignments/${assignmentId}/revoke`);
                return unwrapData(res);
            }
            throw err;
        }
    },

    listMyAssignments: async ({
        status,
        type,
        per_page = 20,
        page,
    } = {}) => {
        const query = buildQueryString({ status, type, per_page, page });
        const res = await apiService.get(`/my/assignments${query}`);
        return unwrapList(res);
    },

    getProgressReport: async (orgId, {
        course_id,
        user_id,
        per_page = 20,
        page,
    } = {}) => {
        const query = buildQueryString({ course_id, user_id, per_page, page });
        const res = await apiService.get(`/orgs/${orgId}/reports/progress${query}`);
        return unwrapList(res);
    },

    // -------- Helpers for dropdowns --------
    listUsers: async ({ q, per_page = 100, page } = {}) => {
        const query = buildQueryString({ q, per_page, page });
        const res = await apiService.get(`/users${query}`);

        if (Array.isArray(res)) return { data: res, meta: {}, links: {} };
        if (Array.isArray(res?.data)) return { data: res.data, meta: res.meta || {}, links: res.links || {} };
        return { data: [], meta: {}, links: {} };
    },

    listCourses: async ({ q, per_page = 100, page } = {}) => {
        const query = buildQueryString({ q, per_page, page });
        const res = await apiService.get(`/lms/courses${query}`);
        return unwrapList(res, ['courses']);
    },
};

export default organizationService;

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

const INVITE_EMAIL_KEYS = ['email', 'user_email', 'invited_email'];
const INVITE_TOKEN_KEYS = ['token', 'invite_token', 'invitation_token', 'accept_token'];

const readFirstString = (obj, keys = []) => {
    for (const key of keys) {
        const value = obj?.[key];
        if (value === undefined || value === null) continue;
        const text = String(value).trim();
        if (text) return text;
    }
    return '';
};

const extractInvitationDebugRows = (payload) => {
    const rows = [];
    const queue = [payload];
    const seen = new Set();

    while (queue.length > 0) {
        const current = queue.shift();
        if (!current || typeof current !== 'object') continue;
        if (seen.has(current)) continue;
        seen.add(current);

        if (Array.isArray(current)) {
            current.forEach((item) => queue.push(item));
            continue;
        }

        const email = readFirstString(current, INVITE_EMAIL_KEYS);
        const token = readFirstString(current, INVITE_TOKEN_KEYS);
        const id = current?.id ?? current?.invitation_id ?? null;
        const role = current?.role ?? current?.invited_role ?? null;
        const status = current?.status ?? null;

        if (email || token || id) {
            rows.push({
                email: email || null,
                token: token || null,
                invitation_id: id,
                role,
                status,
            });
        }

        Object.values(current).forEach((value) => {
            if (value && typeof value === 'object') queue.push(value);
        });
    }

    const unique = new Map();
    rows.forEach((row) => {
        const key = `${row.email || ''}::${row.token || ''}::${row.invitation_id || ''}`;
        if (!unique.has(key)) unique.set(key, row);
    });
    return Array.from(unique.values());
};

const buildAcceptInviteLink = (token) => {
    const safeToken = String(token || '').trim();
    if (!safeToken) return '';

    const encoded = encodeURIComponent(safeToken);
    if (typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin}/accept-invite?token=${encoded}`;
    }
    return `/accept-invite?token=${encoded}`;
};

const logInvitationDebug = (responseData, requestPayload) => {
    try {
        const rows = extractInvitationDebugRows(responseData);

        console.groupCollapsed('[Learner Org Invite] Invite response debug');
        console.log('requestPayload:', requestPayload);
        console.log('rawResponse:', responseData);

        if (!rows.length) {
            console.warn('No invitation token or invited user info was found in this response.');
            console.groupEnd();
            return;
        }

        const output = rows.map((row) => ({
            invited_email: row.email,
            token: row.token,
            invitation_id: row.invitation_id,
            role: row.role,
            status: row.status,
            accept_link: buildAcceptInviteLink(row.token),
        }));

        console.table(output);
        console.groupEnd();
    } catch (error) {
        console.warn('[Learner Org Invite] Failed to log invite debug info:', error);
    }
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

const emptyList = () => ({ data: [], meta: {}, links: {} });

const isRecoverableLookupError = (error) => [401, 403, 404, 405].includes(error?.status);

const tryListEndpoints = async (endpoints = []) => {
    for (const endpoint of endpoints) {
        try {
            const res = await apiService.get(endpoint);
            return res;
        } catch (error) {
            if (!isRecoverableLookupError(error)) throw error;
        }
    }
    return null;
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
    inviteOrganizationMembers: async (orgId, payload) => {
        const res = await apiService.post(`/orgs/${orgId}/invitations`, payload);
        const data = unwrapData(res);
        logInvitationDebug(data, payload);
        return data;
    },

    batchInviteStaff: async (orgId, payload) => {
        const res = await apiService.post(`/orgs/${orgId}/invitations`, payload);
        const data = unwrapData(res);
        logInvitationDebug(data, payload);
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

    acceptOrganizationInvitationPublic: async (payload) => {
        const res = await apiService.post('/org-invitations/public/accept', payload);
        return unwrapData(res);
    },

    acceptOrganizationInvitationLoggedIn: async (payload) => {
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

    listOrganizationInvitations: async (orgId, params = {}) => {
        const query = buildQueryString({
            status: params.status,
            role: params.role,
            q: params.q,
            per_page: params.per_page ?? 20,
            page: params.page,
        });
        const res = await apiService.get(`/orgs/${orgId}/invitations${query}`);
        return unwrapList(res);
    },

    revokeSingleInvitation: async (orgId, invitationId, payload = {}) => {
        const res = await apiService.post(`/orgs/${orgId}/invitations/${invitationId}/revoke`, payload);
        return unwrapData(res);
    },

    revokeOrganizationInvitation: async (orgId, invitationId, payload = {}) => {
        const res = await apiService.post(`/orgs/${orgId}/invitations/${invitationId}/revoke`, payload);
        return unwrapData(res);
    },

    revokeBulkInvitations: async (orgId, payload) => {
        const res = await apiService.post(`/orgs/${orgId}/invitations/revoke-bulk`, payload);
        return unwrapData(res);
    },

    revokeOrganizationInvitationsBulk: async (orgId, payload) => {
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
        org_id,
        organization_id,
    } = {}) => {
        const query = buildQueryString({ status, type, per_page, page });
        const scopedOrgId = String(organization_id || org_id || '').trim();

        if (scopedOrgId) {
            try {
                const res = await apiService.get(`/orgs/${scopedOrgId}/assignments${query}`);
                return unwrapList(res);
            } catch (error) {
                if (error?.status !== 404 && error?.status !== 405) throw error;
                return emptyList();
            }
        }

        try {
            const res = await apiService.get(`/my/assignments${query}`);
            return unwrapList(res);
        } catch (error) {
            if (error?.status !== 404 && error?.status !== 405) throw error;
            return emptyList();
        }
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
    listUsers: async ({ q, per_page = 100, page, org_id, organization_id } = {}) => {
        const query = buildQueryString({ q, per_page, page });
        const scopedOrgId = String(organization_id || org_id || '').trim();
        const endpoints = [];

        if (scopedOrgId) {
            endpoints.push(`/orgs/${scopedOrgId}/users${query}`, `/orgs/${scopedOrgId}/members${query}`);
        }

        endpoints.push(`/users${query}`, `/admin/students${query}`);
        const res = await tryListEndpoints(endpoints);

        if (Array.isArray(res)) return { data: res, meta: {}, links: {} };
        if (Array.isArray(res?.data)) return { data: res.data, meta: res.meta || {}, links: res.links || {} };
        if (res?.data && Array.isArray(res.data.data)) {
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
        return emptyList();
    },

    listCourses: async ({ q, per_page = 100, page, org_id, organization_id } = {}) => {
        const query = buildQueryString({ q, per_page, page });
        const scopedOrgId = String(organization_id || org_id || '').trim();
        const endpoints = [];

        if (scopedOrgId) {
            endpoints.push(`/orgs/${scopedOrgId}/courses${query}`);
        }

        endpoints.push(`/lms/courses${query}`, `/courses${query}`);
        const res = await tryListEndpoints(endpoints);
        return unwrapList(res, ['courses']);
    },

    // Extra helper retained for learner module UX.
    getInvitationByEmail: async (orgId, email) => {
        const list = await organizationService.listInvitations(orgId, { q: email, per_page: 20 });
        const found = (list.data || []).find((invitation) =>
            String(invitation?.email || '').toLowerCase() === String(email || '').toLowerCase()
        );
        return found || null;
    },
};

// Backward-compatible alias used by existing learner pages.
export const learnerOrganizationService = organizationService;

export default organizationService;

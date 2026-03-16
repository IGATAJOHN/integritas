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

const OWNED_ORGANIZATION_KEYS = ['owned_organizations', 'ownedOrganizations', 'owned'];
const MEMBER_ORGANIZATION_KEYS = [
    'membered_organizations',
    'member_organizations',
    'memberOrganizations',
    'membered',
    'memberships',
    'member_of',
    'memberOf',
    'member_of_organizations',
    'memberOfOrganizations',
];
const GENERIC_ORGANIZATION_KEYS = ['organizations'];

const normalizeOrganizationRole = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return '';
    if (normalized === 'org_owner' || normalized === 'organization_owner') return 'owner';
    if (normalized === 'org_admin' || normalized === 'organization_admin') return 'admin';
    if (normalized === 'org_manager' || normalized === 'organization_manager') return 'manager';
    if (normalized === 'org_staff' || normalized === 'organization_staff') return 'staff';
    return normalized;
};

const normalizeOrganizationEntry = (entry = {}, source = '') => {
    const baseOrganization =
        entry?.organization && typeof entry.organization === 'object'
            ? entry.organization
            : entry;
    const pivot = entry?.pivot || baseOrganization?.pivot || null;
    const id = String(
        baseOrganization?.id ||
        baseOrganization?.organization_id ||
        baseOrganization?.org_id ||
        entry?.organization_id ||
        ''
    ).trim();

    if (!id) return null;

    const role = normalizeOrganizationRole(
        pivot?.role ||
        entry?.membership_role ||
        baseOrganization?.membership_role ||
        entry?.organization_role ||
        baseOrganization?.organization_role ||
        entry?.role ||
        baseOrganization?.role
    );
    const isOwner = source === 'owned' || role === 'owner';
    const membershipRole = isOwner ? 'owner' : role;

    return {
        ...baseOrganization,
        id,
        pivot,
        membership_role: membershipRole,
        membership_source: source || (isOwner ? 'owned' : 'membered'),
        is_owner: isOwner,
        can_delete: isOwner,
        can_manage: ['owner', 'admin', 'manager'].includes(membershipRole),
    };
};

const collectOrganizationsFromPayload = (payload) => {
    const entries = [];
    const appendEntries = (value, source = '') => {
        if (!Array.isArray(value)) return;
        value.forEach((entry) => {
            const normalized = normalizeOrganizationEntry(entry, source);
            if (normalized) entries.push(normalized);
        });
    };

    appendEntries(Array.isArray(payload) ? payload : [], '');
    appendEntries(Array.isArray(payload?.data) ? payload.data : [], '');

    OWNED_ORGANIZATION_KEYS.forEach((key) => {
        appendEntries(payload?.[key], 'owned');
        appendEntries(payload?.data?.[key], 'owned');
    });

    MEMBER_ORGANIZATION_KEYS.forEach((key) => {
        appendEntries(payload?.[key], 'membered');
        appendEntries(payload?.data?.[key], 'membered');
    });

    GENERIC_ORGANIZATION_KEYS.forEach((key) => {
        appendEntries(payload?.[key], '');
        appendEntries(payload?.data?.[key], '');
    });

    return entries;
};

const dedupeOrganizations = (entries = []) => {
    const unique = new Map();

    entries.forEach((entry) => {
        const id = String(entry?.id || '').trim();
        if (!id) return;

        const existing = unique.get(id) || {};
        const isOwner = Boolean(existing.is_owner || entry.is_owner);
        const membershipRole = isOwner ? 'owner' : entry.membership_role || existing.membership_role || '';

        unique.set(id, {
            ...existing,
            ...entry,
            id,
            membership_role: membershipRole,
            membership_source: entry.membership_source || existing.membership_source || '',
            is_owner: isOwner,
            can_delete: Boolean(existing.can_delete || entry.can_delete || isOwner),
            can_manage: Boolean(existing.can_manage || entry.can_manage || ['owner', 'admin', 'manager'].includes(membershipRole)),
        });
    });

    return Array.from(unique.values());
};

const normalizeOrganizationMember = (entry = {}) => {
    const nestedUser =
        entry?.user && typeof entry.user === 'object'
            ? entry.user
            : entry?.member && typeof entry.member === 'object'
                ? entry.member
                : null;

    const source = nestedUser ? { ...entry, ...nestedUser, pivot: entry?.pivot || nestedUser?.pivot || null } : entry;
    const id = String(
        source?.id ||
        source?.user_id ||
        source?.member_id ||
        source?.pivot?.user_id ||
        ''
    ).trim();

    if (!id) return null;

    return {
        ...source,
        id,
        name: String(source?.name || '').trim(),
        email: String(source?.email || '').trim(),
        role: String(source?.pivot?.role || source?.role || '').trim(),
        status: String(source?.pivot?.status || source?.status || '').trim(),
        joined_at: source?.pivot?.joined_at || source?.joined_at || null,
    };
};

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

    listUserOrganizations: async () => {
        try {
            const res = await apiService.get('/orgs/user/organizations');
            const data = dedupeOrganizations(collectOrganizationsFromPayload(res));
            return {
                data,
                meta: { total: data.length },
                links: {},
            };
        } catch (error) {
            if (isRecoverableLookupError(error)) return emptyList();
            throw error;
        }
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
        const res = await apiService.get(`/learning-path/${orgId}/learning-paths${query}`);
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
            const res = await apiService.get(`/learning-path/my/assignments${query}`);
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

    listOrganizationMembers: async (orgId, { q, per_page = 100, page } = {}) => {
        const scopedOrgId = String(orgId || '').trim();
        if (!scopedOrgId) return emptyList();

        const query = buildQueryString({ q, per_page, page });
        const res = await tryListEndpoints([
            `/orgs/organizations/${scopedOrgId}/members${query}`,
            `/orgs/${scopedOrgId}/members${query}`,
        ]);

        if (!res) return emptyList();

        const list = unwrapList(res, ['members', 'users']);
        const queryText = String(q || '').trim().toLowerCase();
        let data = (list.data || []).map((entry) => normalizeOrganizationMember(entry)).filter(Boolean);

        if (queryText) {
            data = data.filter((user) => {
                const id = String(user?.id || '').toLowerCase();
                const name = String(user?.name || '').toLowerCase();
                const email = String(user?.email || '').toLowerCase();
                return id.includes(queryText) || name.includes(queryText) || email.includes(queryText);
            });
        }

        const total = Number(
            res?.total_members ||
            res?.data?.total_members ||
            list?.meta?.total ||
            data.length
        );

        return {
            data,
            meta: {
                ...list.meta,
                total,
                current_page: Number(page) || list?.meta?.current_page || 1,
                per_page: Number(per_page) || list?.meta?.per_page || data.length || 0,
                organization_name: res?.organization_name || res?.data?.organization_name || '',
            },
            links: list.links || {},
        };
    },

    // -------- Helpers for dropdowns --------
    listUsers: async ({ q, per_page = 100, page, org_id, organization_id } = {}) => {
        const scopedOrgId = String(organization_id || org_id || '').trim();
        if (!scopedOrgId) return emptyList();
        return organizationService.listOrganizationMembers(scopedOrgId, { q, per_page, page });
    },

    listCourses: async ({ q, per_page = 100, page } = {}) => {
        const query = buildQueryString({ q, per_page, page });
        const res = await tryListEndpoints([
            `/public/courses${query}`,
            `/lms/courses${query}`,
            `/courses${query}`,
        ]);
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

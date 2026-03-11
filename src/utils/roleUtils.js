const normalizeRoleName = (value) => String(value || '').trim().toLowerCase();

const ROLE_ALIASES = {
    administrator: 'admin',
    super_admin: 'admin',
    'super-admin': 'admin',
    superadmin: 'admin',
    student: 'learner',
    org_owner: 'owner',
    org_admin: 'organization_admin',
    org_manager: 'manager',
    org_staff: 'staff',
};

const ORG_ROLE_SET = new Set([
    'owner',
    'manager',
    'staff',
    'organization_owner',
    'organization_admin',
    'organization_manager',
    'organization_staff',
]);

const LEARNER_ROLE_SET = new Set(['learner']);
const TUTOR_ROLE_SET = new Set(['tutor']);
const ADMIN_ROLE_SET = new Set(['admin']);

const normalizeWithAlias = (value) => {
    const normalized = normalizeRoleName(value);
    return ROLE_ALIASES[normalized] || normalized;
};

const pluckRoleNames = (user) => {
    if (!Array.isArray(user?.roles)) return [];

    return user.roles
        .map((item) => normalizeWithAlias(item?.name || item))
        .filter(Boolean);
};

const getOrgRoleFromMembership = (user) => {
    const directCandidates = [
        user?.organization_role,
        user?.organizationRole,
        user?.org_role,
        user?.orgRole,
        user?.organization_user?.role,
        user?.organizationUser?.role,
        user?.organization?.pivot?.role,
    ];

    for (const candidate of directCandidates) {
        const normalized = normalizeWithAlias(candidate);
        if (ORG_ROLE_SET.has(normalized)) {
            return normalized === 'organization_admin' ? 'admin' : normalized;
        }
    }

    if (Array.isArray(user?.organizations)) {
        for (const organization of user.organizations) {
            const normalized = normalizeWithAlias(organization?.pivot?.role || organization?.role);
            if (ORG_ROLE_SET.has(normalized)) {
                return normalized === 'organization_admin' ? 'admin' : normalized;
            }
        }
    }

    return null;
};

export const getOrganizationRole = (user) => {
    const fromMembership = getOrgRoleFromMembership(user);
    if (fromMembership) return fromMembership;

    const roleNames = pluckRoleNames(user);
    if (roleNames.includes('owner')) return 'owner';
    if (roleNames.includes('organization_admin')) return 'admin';
    if (roleNames.includes('manager')) return 'manager';
    if (roleNames.includes('staff')) return 'staff';
    return null;
};

export const hasOrganizationAccess = (user) => !!getOrganizationRole(user);

export const canManageOrganization = (user) => {
    const role = getOrganizationRole(user);
    return role === 'owner' || role === 'admin' || role === 'manager';
};

export const getPrimaryRole = (user) => {
    const explicit = normalizeWithAlias(user?.role || user?.userType);

    if (ADMIN_ROLE_SET.has(explicit)) return 'admin';
    if (getOrganizationRole(user)) return 'organization';
    if (ORG_ROLE_SET.has(explicit)) return 'organization';
    if (TUTOR_ROLE_SET.has(explicit)) return 'tutor';
    if (LEARNER_ROLE_SET.has(explicit)) return 'learner';

    const roleNames = pluckRoleNames(user);
    if (roleNames.some((role) => ADMIN_ROLE_SET.has(role))) return 'admin';
    if (getOrganizationRole(user)) return 'organization';
    if (roleNames.some((role) => TUTOR_ROLE_SET.has(role))) return 'tutor';
    if (roleNames.some((role) => LEARNER_ROLE_SET.has(role))) return 'learner';

    return null;
};

export const getDashboardRoute = (userOrRole) => {
    if (typeof userOrRole === 'string') {
        const normalized = normalizeWithAlias(userOrRole);
        if (normalized === 'admin') return '/admin';
        if (normalized === 'organization') return '/learner/organization';
        if (ORG_ROLE_SET.has(normalized)) return '/learner/organization';
        if (normalized === 'tutor') return '/tutor';
        if (normalized === 'learner') return '/learner';
        return '/learner';
    }

    const primaryRole = getPrimaryRole(userOrRole);
    if (primaryRole === 'admin') return '/admin';
    if (primaryRole === 'organization') return '/learner/organization';
    if (primaryRole === 'tutor') return '/tutor';
    return '/learner';
};

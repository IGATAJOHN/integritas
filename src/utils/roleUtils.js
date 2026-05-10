const normalizeRoleName = (value) => String(value || '').trim().toLowerCase();

const ROLE_ALIASES = {
    administrator: 'admin',
    super_admin: 'admin',
    'super-admin': 'admin',
    superadmin: 'admin',
    student: 'learner',
    foundational_tutor: 'tutor',
    'foundational-tutor': 'tutor',
    expert_tutor: 'tutor',
    'expert-tutor': 'tutor',
    org_owner: 'owner',
    org_admin: 'organization_admin',
    org_manager: 'manager',
    org_staff: 'staff',
};

export const TUTOR_VARIANTS = {
    FOUNDATIONAL: 'foundational_tutor',
    EXPERT: 'expert_tutor',
};

export const getTutorVariant = (user) => {
    const candidates = [
        user?.role,
        user?.userType,
        user?.tutor_type,
        user?.tutorType,
        user?.type,
        user?.profile_type,
        user?.profileType,
        user?.tutor_profile?.type,
        user?.tutorProfile?.type,
        user?.profile?.type,
        user?.is_foundational_tutor ? 'foundational_tutor' : null,
        user?.is_expert_tutor ? 'expert_tutor' : null,
        ...(Array.isArray(user?.roles) ? user.roles.map((r) => r?.name || r) : []),
    ];
    for (const candidate of candidates) {
        const normalized = String(candidate || '').trim().toLowerCase();
        if (normalized === 'foundational_tutor' || normalized === 'foundational-tutor') return TUTOR_VARIANTS.FOUNDATIONAL;
        if (normalized === 'expert_tutor' || normalized === 'expert-tutor') return TUTOR_VARIANTS.EXPERT;
    }
    return null;
};

export const isFoundationalTutor = (user) => getTutorVariant(user) === TUTOR_VARIANTS.FOUNDATIONAL;
export const isExpertTutor = (user) => getTutorVariant(user) === TUTOR_VARIANTS.EXPERT;

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
const SUPPORT_ROLE_SET = new Set(['support']);

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

export const getAccountState = (user) =>
    normalizeRoleName(user?.account_state || user?.accountState || user?.state);

export const getPrimaryRole = (user) => {
    const explicit = normalizeWithAlias(user?.role || user?.userType);

    if (ADMIN_ROLE_SET.has(explicit)) return 'admin';
    if (SUPPORT_ROLE_SET.has(explicit)) return 'support';
    if (getOrganizationRole(user)) return 'organization';
    if (ORG_ROLE_SET.has(explicit)) return 'organization';
    if (TUTOR_ROLE_SET.has(explicit)) return 'tutor';
    if (LEARNER_ROLE_SET.has(explicit)) return 'learner';

    const roleNames = pluckRoleNames(user);
    if (roleNames.some((role) => ADMIN_ROLE_SET.has(role))) return 'admin';
    if (roleNames.some((role) => SUPPORT_ROLE_SET.has(role))) return 'support';
    if (getOrganizationRole(user)) return 'organization';
    if (roleNames.some((role) => TUTOR_ROLE_SET.has(role))) return 'tutor';
    if (roleNames.some((role) => LEARNER_ROLE_SET.has(role))) return 'learner';

    return null;
};

export const isReturnToAllowedForUser = (returnTo, user) => {
    if (!returnTo) return false;
    const pathname = typeof returnTo === 'string' ? returnTo : returnTo?.pathname;
    if (!pathname) return false;

    const primaryRole = getPrimaryRole(user);

    // Never bounce a logged-in user back to onboarding pages.
    if (pathname === '/verify' || pathname.startsWith('/verify/')) return false;
    if (pathname === '/login' || pathname === '/signup') return false;
    if (pathname === '/forgot-password' || pathname === '/reset-password') return false;

    if (pathname.startsWith('/admin')) return primaryRole === 'admin' || primaryRole === 'support';
    if (pathname.startsWith('/tutor')) return primaryRole === 'tutor';
    if (pathname.startsWith('/learner/organization') || pathname.startsWith('/org')) {
        return primaryRole === 'organization';
    }
    return true;
};

export const isLearnerUser = (user) => getPrimaryRole(user) === 'learner';

export const isLearnerPendingPayment = (user) => {
    if (!isLearnerUser(user)) return false;
    const state = getAccountState(user);
    return state === 'pending_payment' || state === 'waiting_for_payment' || state === 'payment_pending';
};

export const getDashboardRoute = (userOrRole) => {
    if (typeof userOrRole === 'string') {
        const normalized = normalizeWithAlias(userOrRole);
        if (normalized === 'admin') return '/admin';
        if (normalized === 'support') return '/admin';
        if (normalized === 'organization') return '/learner/organization';
        if (ORG_ROLE_SET.has(normalized)) return '/learner/organization';
        if (normalized === 'tutor') return '/tutor';
        if (normalized === 'learner') return '/learner';
        return '/learner';
    }

    const primaryRole = getPrimaryRole(userOrRole);
    if (primaryRole === 'admin') return '/admin';
    if (primaryRole === 'support') return '/admin';
    if (primaryRole === 'organization') return '/learner/organization';
    if (primaryRole === 'tutor') return '/tutor';
    return '/learner';
};

export const getPostAuthRoute = (userOrRole) => {
    if (typeof userOrRole !== 'string' && isLearnerPendingPayment(userOrRole)) {
        return '/learner/foundational';
    }
    return getDashboardRoute(userOrRole);
};

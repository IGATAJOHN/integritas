import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    readSelectedOrganizationId,
    writeSelectedOrganizationId,
} from '../../../utils/organizationScopeStorage';
import { useAuth } from '../../../contexts';
import { organizationService } from '../services/organizationService';

const KNOWN_ORGS_STORAGE_KEY = 'Integritas Hub_admin_known_orgs';

const safeParse = (value, fallback) => {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const normalizeOrganization = (organization = {}) => {
    const id = String(organization.id || organization.organization_id || organization.org_id || '').trim();
    if (!id) return null;

    const membershipRole = String(organization.membership_role || '').trim();
    const isOwner = Boolean(organization.is_owner) || membershipRole === 'owner';
    const canManage = Boolean(organization.can_manage) || ['owner', 'admin', 'manager'].includes(membershipRole);

    return {
        id,
        name: String(organization.name || organization.slug || id).trim() || id,
        slug: String(organization.slug || '').trim(),
        email_domain: String(organization.email_domain || '').trim(),
        membership_role: membershipRole,
        membership_source: String(organization.membership_source || '').trim(),
        is_owner: isOwner,
        can_delete: Boolean(organization.can_delete) || isOwner,
        can_manage: canManage,
    };
};

const mergeOrganizations = (organizations = []) => {
    const merged = new Map();

    organizations.forEach((organization) => {
        const normalized = normalizeOrganization(organization);
        if (!normalized) return;

        const existing = merged.get(normalized.id) || {};
        const membershipRole = normalized.membership_role || existing.membership_role || '';
        const isOwner = Boolean(existing.is_owner || normalized.is_owner || membershipRole === 'owner');

        merged.set(normalized.id, {
            ...existing,
            ...normalized,
            membership_role: membershipRole,
            is_owner: isOwner,
            can_delete: Boolean(existing.can_delete || normalized.can_delete || isOwner),
            can_manage: Boolean(
                existing.can_manage ||
                normalized.can_manage ||
                ['owner', 'admin', 'manager'].includes(membershipRole)
            ),
        });
    });

    return Array.from(merged.values());
};

const readKnownOrgs = () => {
    if (typeof window === 'undefined') return [];

    const raw = localStorage.getItem(KNOWN_ORGS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = safeParse(raw, []);
    if (!Array.isArray(parsed)) return [];

    return mergeOrganizations(parsed);
};

const saveKnownOrgs = (organizations) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KNOWN_ORGS_STORAGE_KEY, JSON.stringify(organizations));
};

const isRecoverableOrganizationLookupError = (error) => [401, 403, 404, 405].includes(error?.status);

const pickDefaultOrganization = (organizations = []) =>
    organizations.find((organization) => organization?.is_owner || organization?.can_manage) ||
    organizations[0] ||
    null;

export const useOrganizationScope = () => {
    const { user } = useAuth();
    const [organizations, setOrganizations] = useState(() => readKnownOrgs());
    const [selectedOrgId, setSelectedOrgIdState] = useState(() => readSelectedOrganizationId());

    const refreshOrganizations = useCallback(async () => {
        try {
            const response = await organizationService.listUserOrganizations();
            const remoteOrganizations = mergeOrganizations(response?.data || []);

            let nextOrganizations = remoteOrganizations;
            setOrganizations((prev) => {
                const next = mergeOrganizations([...prev, ...remoteOrganizations]);
                saveKnownOrgs(next);
                nextOrganizations = next;
                return next;
            });

            return nextOrganizations;
        } catch (error) {
            if (!isRecoverableOrganizationLookupError(error)) {
                console.error('Failed to load user organizations:', error);
            }
            return [];
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        const timeoutId = setTimeout(() => {
            void refreshOrganizations();
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [refreshOrganizations, user]);

    const setSelectedOrgId = useCallback((orgId) => {
        const normalized = String(orgId || '').trim();
        setSelectedOrgIdState(normalized);
        writeSelectedOrganizationId(normalized);
    }, []);

    const resolvedSelectedOrgId = useMemo(() => {
        const hasSelectedOrganization = organizations.some((organization) => organization.id === selectedOrgId);
        if (hasSelectedOrganization) return selectedOrgId;
        return String(pickDefaultOrganization(organizations)?.id || '').trim();
    }, [organizations, selectedOrgId]);

    const rememberOrganization = useCallback((organization) => {
        const normalized = normalizeOrganization(organization);
        if (!normalized) return;

        setOrganizations((prev) => {
            const next = mergeOrganizations([normalized, ...prev]);
            saveKnownOrgs(next);
            return next;
        });
        setSelectedOrgId(normalized.id);
    }, [setSelectedOrgId]);

    const forgetOrganization = useCallback((orgId) => {
        const normalized = String(orgId || '').trim();
        if (!normalized) return;

        setOrganizations((prev) => {
            const next = prev.filter((organization) => organization.id !== normalized);
            saveKnownOrgs(next);
            return next;
        });

        if (resolvedSelectedOrgId === normalized) {
            setSelectedOrgId('');
        }
    }, [resolvedSelectedOrgId, setSelectedOrgId]);

    const selectedOrganization = useMemo(
        () => organizations.find((organization) => organization.id === resolvedSelectedOrgId) || null,
        [organizations, resolvedSelectedOrgId]
    );

    return {
        organizations,
        selectedOrgId: resolvedSelectedOrgId,
        selectedOrganization,
        setSelectedOrgId,
        refreshOrganizations,
        rememberOrganization,
        forgetOrganization,
    };
};

export default useOrganizationScope;

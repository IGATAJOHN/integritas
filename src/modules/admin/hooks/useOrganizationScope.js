import { useCallback, useMemo, useState } from 'react';
import {
    readSelectedOrganizationId,
    writeSelectedOrganizationId,
} from '../../../utils/organizationScopeStorage';

const KNOWN_ORGS_STORAGE_KEY = 'ggh_admin_known_orgs';

const safeParse = (value, fallback) => {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const normalizeOrganization = (organization = {}) => {
    const id = String(organization.id || '').trim();
    if (!id) return null;

    return {
        id,
        name: String(organization.name || organization.slug || id).trim() || id,
        slug: String(organization.slug || '').trim(),
        email_domain: String(organization.email_domain || '').trim(),
    };
};

const readKnownOrgs = () => {
    if (typeof window === 'undefined') return [];

    const raw = localStorage.getItem(KNOWN_ORGS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = safeParse(raw, []);
    if (!Array.isArray(parsed)) return [];

    return parsed
        .map((organization) => normalizeOrganization(organization))
        .filter(Boolean);
};

const saveKnownOrgs = (organizations) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KNOWN_ORGS_STORAGE_KEY, JSON.stringify(organizations));
};

export const useOrganizationScope = () => {
    const [organizations, setOrganizations] = useState(() => readKnownOrgs());
    const [selectedOrgId, setSelectedOrgIdState] = useState(() => readSelectedOrganizationId());

    const setSelectedOrgId = useCallback((orgId) => {
        const normalized = String(orgId || '').trim();
        setSelectedOrgIdState(normalized);
        writeSelectedOrganizationId(normalized);
    }, []);

    const rememberOrganization = useCallback((organization) => {
        const normalized = normalizeOrganization(organization);
        if (!normalized) return;

        setOrganizations((prev) => {
            const existing = prev.find((item) => item.id === normalized.id);
            let next;

            if (existing) {
                next = prev.map((item) => (item.id === normalized.id ? { ...item, ...normalized } : item));
            } else {
                next = [normalized, ...prev];
            }

            saveKnownOrgs(next);
            return next;
        });

        setSelectedOrgId(normalized.id);
    }, [setSelectedOrgId]);

    const forgetOrganization = useCallback((orgId) => {
        const normalized = String(orgId || '').trim();
        if (!normalized) return;

        setOrganizations((prev) => {
            const next = prev.filter((item) => item.id !== normalized);
            saveKnownOrgs(next);
            return next;
        });

        if (selectedOrgId === normalized) {
            setSelectedOrgId('');
        }
    }, [selectedOrgId, setSelectedOrgId]);

    const selectedOrganization = useMemo(
        () => organizations.find((organization) => organization.id === selectedOrgId) || null,
        [organizations, selectedOrgId]
    );

    return {
        organizations,
        selectedOrgId,
        selectedOrganization,
        setSelectedOrgId,
        rememberOrganization,
        forgetOrganization,
    };
};

export default useOrganizationScope;

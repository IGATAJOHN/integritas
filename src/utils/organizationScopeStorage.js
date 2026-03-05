const SELECTED_ORG_STORAGE_KEY = 'ggh_admin_selected_org_id';

export const readSelectedOrganizationId = () => {
    if (typeof window === 'undefined') return '';
    return String(localStorage.getItem(SELECTED_ORG_STORAGE_KEY) || '').trim();
};

export const writeSelectedOrganizationId = (orgId) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SELECTED_ORG_STORAGE_KEY, String(orgId || '').trim());
};

export const clearSelectedOrganizationId = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SELECTED_ORG_STORAGE_KEY);
};

export { SELECTED_ORG_STORAGE_KEY };

/**
 * Notifications Service (shared across all roles)
 *
 * Endpoints:
 *   GET  /me/notifications
 *   GET  /me/notifications/unread-count
 *   POST /me/notifications/read-all
 *   POST /me/notifications/{id}/read
 */

import { apiService } from './api';

const unwrap = (res) => (res && res.data ? res.data : res);

const unwrapList = (res) => {
    if (!res) return { data: [], meta: {}, links: {} };
    if (Array.isArray(res)) return { data: res, meta: {}, links: {} };
    return {
        data: res.data || [],
        meta: res.meta || {},
        links: res.links || {},
    };
};

export const notificationsService = {
    list: async ({ page, per_page = 20 } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);
        const qs = params.toString();
        const res = await apiService.get(`/me/notifications${qs ? `?${qs}` : ''}`);
        return unwrapList(res);
    },

    unreadCount: async () => {
        const res = await apiService.get('/me/notifications/unread-count');
        const data = unwrap(res);
        return Number(data?.unread_count ?? data?.count ?? data ?? 0);
    },

    markRead: async (id) => {
        const res = await apiService.post(`/me/notifications/${encodeURIComponent(id)}/read`);
        return unwrap(res);
    },

    markAllRead: async () => {
        const res = await apiService.post('/me/notifications/read-all');
        return unwrap(res);
    },
};

export default notificationsService;

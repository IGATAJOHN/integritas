/**
 * Tutor Assigned Lessons Service
 *
 * Endpoints:
 *   GET /tutor/lessons              -> list of lessons assigned to the tutor
 *   GET /tutor/lessons/{id}/stats   -> per-lesson learner stats
 */

import { apiService } from '../../../services/api';

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

export const tutorAssignmentService = {
    listAssignedLessons: async () => {
        const res = await apiService.get('/tutor/lessons');
        return unwrapList(res);
    },

    getLessonStats: async (lessonId) => {
        const res = await apiService.get(`/tutor/lessons/${encodeURIComponent(lessonId)}/stats`);
        return unwrap(res);
    },
};

export default tutorAssignmentService;

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

const rethrowWithForbiddenMessage = (error, message) => {
    if (error?.status === 403) {
        error.message = message;
        error.data = { ...(error.data || {}), message };
    }
    throw error;
};

export const tutorAssignmentService = {
    listAssignedLessons: async () => {
        const res = await apiService.get('/tutor/lessons');
        return unwrapList(res);
    },

    getAssignedLesson: async (lessonId) => {
        const list = await tutorAssignmentService.listAssignedLessons();
        const assigned = (list.data || []).find((lesson) => String(lesson.id) === String(lessonId));
        if (!assigned) {
            const error = new Error('This lesson is not assigned to you.');
            error.status = 403;
            throw error;
        }
        try {
            const detail = await apiService.get(`/admin/lessons/${encodeURIComponent(lessonId)}`);
            return { ...assigned, ...unwrap(detail) };
        } catch {
            return assigned;
        }
    },

    updateAssignedLesson: async (lessonId, payload) => {
        const res = await apiService.patch(`/admin/lessons/${encodeURIComponent(lessonId)}`, payload);
        return unwrap(res);
    },

    uploadLessonVideo: async (lessonId, file) => {
        const formData = new FormData();
        formData.append('video', file);
        const res = await apiService.post(`/admin/lessons/${encodeURIComponent(lessonId)}/video`, formData);
        return unwrap(res);
    },

    listMaterials: async (lessonId) => {
        const res = await apiService.get(`/admin/lessons/${encodeURIComponent(lessonId)}/materials`);
        return unwrapList(res);
    },

    addMaterial: async (lessonId, file, displayName) => {
        const formData = new FormData();
        formData.append('file', file);
        if (displayName) formData.append('display_name', displayName);
        const res = await apiService.post(`/admin/lessons/${encodeURIComponent(lessonId)}/materials`, formData);
        return unwrap(res);
    },

    deleteMaterial: async (materialId) => {
        const res = await apiService.delete(`/admin/materials/${encodeURIComponent(materialId)}`);
        return { success: true, ...(res || {}) };
    },

    listCbtQuestions: async (lessonVersionId) => {
        try {
            const res = await apiService.get(`/admin/lesson-versions/${encodeURIComponent(lessonVersionId)}/cbt-questions`);
            return unwrapList(res);
        } catch (error) {
            rethrowWithForbiddenMessage(
                error,
                'Your tutor account is not allowed to manage CBT questions for this lesson yet. Ask an admin to confirm the lesson assignment or backend tutor permissions.'
            );
        }
    },

    addCbtQuestion: async (lessonVersionId, payload) => {
        try {
            const res = await apiService.post(`/admin/lesson-versions/${encodeURIComponent(lessonVersionId)}/cbt-questions`, payload);
            return unwrap(res);
        } catch (error) {
            rethrowWithForbiddenMessage(
                error,
                'Your tutor account is not allowed to add CBT questions for this lesson yet. Ask an admin to confirm the lesson assignment or backend tutor permissions.'
            );
        }
    },

    deleteCbtQuestion: async (questionId) => {
        try {
            const res = await apiService.delete(`/admin/cbt-questions/${encodeURIComponent(questionId)}`);
            return { success: true, ...(res || {}) };
        } catch (error) {
            rethrowWithForbiddenMessage(
                error,
                'Your tutor account is not allowed to delete CBT questions for this lesson yet. Ask an admin to confirm the lesson assignment or backend tutor permissions.'
            );
        }
    },

    getLessonStats: async (lessonId) => {
        const res = await apiService.get(`/tutor/lessons/${encodeURIComponent(lessonId)}/stats`);
        return unwrap(res);
    },
};

export default tutorAssignmentService;

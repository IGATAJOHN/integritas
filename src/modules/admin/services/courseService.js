/**
 * Admin Course / Module / Lesson / Materials / CBT Service
 * Wired to the new Integritas backend (/admin/* endpoints).
 */

import { apiService, authFetch } from "../../../services/api";

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

const buildQuery = (params = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        search.append(key, String(value));
    });
    const query = search.toString();
    return query ? `?${query}` : '';
};

export const adminCoursesService = {
    // ===== COURSES =====
    listCourses: async ({ page, per_page = 20, q, status, level, language, track } = {}) => {
        const query = buildQuery({ page, per_page, q, status, level, language, track });
        const res = await apiService.get(`/admin/courses${query}`);
        return unwrapList(res);
    },

    getCourseDetail: async (courseId) => {
        const res = await apiService.get(`/admin/courses/${encodeURIComponent(courseId)}`);
        return unwrap(res);
    },

    createCourse: async (payload) => {
        const res = await apiService.post('/admin/courses', payload);
        return unwrap(res);
    },

    updateCourse: async (courseId, payload) => {
        const res = await apiService.patch(`/admin/courses/${encodeURIComponent(courseId)}`, payload);
        return unwrap(res);
    },

    deleteCourse: async (courseId) => {
        const res = await apiService.delete(`/admin/courses/${encodeURIComponent(courseId)}`);
        return { success: true, ...(res || {}) };
    },

    publishCourse: async (courseId) => {
        const res = await apiService.post(`/admin/courses/${encodeURIComponent(courseId)}/publish`);
        return unwrap(res);
    },

    unpublishCourse: async (courseId) => {
        const res = await apiService.post(`/admin/courses/${encodeURIComponent(courseId)}/unpublish`);
        return unwrap(res);
    },

    // ===== MODULES =====
    getCourseModules: async (courseId) => {
        // Modules are typically returned within the course detail; this is a
        // convenience helper for callers that only need the module list.
        const detail = await adminCoursesService.getCourseDetail(courseId);
        return detail?.modules || [];
    },

    createModule: async (courseId, payload) => {
        const res = await apiService.post(
            `/admin/courses/${encodeURIComponent(courseId)}/modules`,
            payload
        );
        return unwrap(res);
    },

    reorderModules: async (courseId, order) => {
        const res = await apiService.post(
            `/admin/courses/${encodeURIComponent(courseId)}/modules/reorder`,
            { order }
        );
        return unwrap(res);
    },

    updateModule: async (moduleId, payload) => {
        const res = await apiService.patch(`/admin/modules/${encodeURIComponent(moduleId)}`, payload);
        return unwrap(res);
    },

    deleteModule: async (moduleId) => {
        const res = await apiService.delete(`/admin/modules/${encodeURIComponent(moduleId)}`);
        return { success: true, ...(res || {}) };
    },

    // ===== LESSONS =====
    listLessons: async (moduleId) => {
        const res = await apiService.get(`/admin/modules/${encodeURIComponent(moduleId)}`);
        const data = unwrap(res);
        return { data: data?.lessons || [], meta: {}, links: {} };
    },

    createLesson: async (moduleId, payload) => {
        const res = await apiService.post(
            `/admin/modules/${encodeURIComponent(moduleId)}/lessons`,
            payload
        );
        return unwrap(res);
    },

    reorderLessons: async (moduleId, order) => {
        const res = await apiService.post(
            `/admin/modules/${encodeURIComponent(moduleId)}/lessons/reorder`,
            { order }
        );
        return unwrap(res);
    },

    getLesson: async (lessonId) => {
        const res = await apiService.get(`/admin/lessons/${encodeURIComponent(lessonId)}`);
        return unwrap(res);
    },

    updateLesson: async (lessonId, payload) => {
        const res = await apiService.patch(`/admin/lessons/${encodeURIComponent(lessonId)}`, payload);
        return unwrap(res);
    },

    deleteLesson: async (lessonId) => {
        const res = await apiService.delete(`/admin/lessons/${encodeURIComponent(lessonId)}`);
        return { success: true, ...(res || {}) };
    },

    publishLesson: async (lessonId) => {
        const res = await apiService.post(`/admin/lessons/${encodeURIComponent(lessonId)}/publish`);
        return unwrap(res);
    },

    unpublishLesson: async (lessonId) => {
        const res = await apiService.post(`/admin/lessons/${encodeURIComponent(lessonId)}/unpublish`);
        return unwrap(res);
    },

    /**
     * Backwards-compatible signature: existing callers pass (moduleId, lessonId).
     */
    publishLessonInModule: async (_moduleId, lessonId) => adminCoursesService.publishLesson(lessonId),
    unpublishLessonInModule: async (_moduleId, lessonId) => adminCoursesService.unpublishLesson(lessonId),

    /**
     * Upload the lesson video. Backend: POST /admin/lessons/{id}/video (multipart)
     * Accepts either a File or a FormData payload (existing callers send FormData).
     */
    uploadLessonMedia: async (lessonId, formDataOrFile, fieldName = 'video') => {
        let body = formDataOrFile;
        if (!(typeof FormData !== 'undefined' && formDataOrFile instanceof FormData)) {
            body = new FormData();
            body.append(fieldName, formDataOrFile);
        }
        const response = await authFetch(`/admin/lessons/${encodeURIComponent(lessonId)}/video`, {
            method: 'POST',
            body,
        });
        if (!response.ok) {
            let msg = 'Upload failed';
            try {
                const d = await response.json();
                msg = d.message || msg;
            } catch (_e) {
                /* ignore */
            }
            throw new Error(msg);
        }
        if (response.status === 204) return null;
        return response.json();
    },

    // ===== MATERIALS =====
    listMaterials: async (lessonId) => {
        const res = await apiService.get(`/admin/lessons/${encodeURIComponent(lessonId)}/materials`);
        return unwrapList(res);
    },

    addMaterial: async (lessonId, file, { display_name, title } = {}) => {
        const form = new FormData();
        form.append('file', file);
        const name = display_name ?? title;
        if (name) form.append('display_name', name);
        const res = await apiService.post(
            `/admin/lessons/${encodeURIComponent(lessonId)}/materials`,
            form
        );
        return unwrap(res);
    },

    deleteMaterial: async (materialId) => {
        const res = await apiService.delete(`/admin/materials/${encodeURIComponent(materialId)}`);
        return { success: true, ...(res || {}) };
    },

    // ===== CBT QUESTIONS (per lesson version) =====
    listCbtQuestions: async (lessonVersionId) => {
        const res = await apiService.get(
            `/admin/lesson-versions/${encodeURIComponent(lessonVersionId)}/cbt-questions`
        );
        return unwrapList(res);
    },

    /**
     * Create a CBT question on a lesson version.
     * Backend: POST /admin/lesson-versions/{id}/cbt-questions
     * Body: { prompt, points, options: [{ body, is_correct }, ...] }
     *
     * Accepts either the documented shape or the legacy
     * { question_text, options: ['a','b'], correct_option: 0 } shape and
     * normalizes to the documented shape.
     */
    addCbtQuestion: async (lessonVersionId, payload = {}) => {
        const prompt = payload.prompt ?? payload.question_text ?? '';
        const points = Number(payload.points ?? 1);

        let options;
        if (Array.isArray(payload.options) && payload.options.length > 0 && typeof payload.options[0] === 'object') {
            options = payload.options.map((o) => ({
                body: o.body ?? o.text ?? '',
                is_correct: Boolean(o.is_correct),
            }));
        } else {
            const correctIndex = Number(payload.correct_option);
            options = (payload.options || []).map((opt, idx) => ({
                body: typeof opt === 'string' ? opt : (opt?.body ?? opt?.text ?? ''),
                is_correct: idx === correctIndex,
            }));
        }

        const res = await apiService.post(
            `/admin/lesson-versions/${encodeURIComponent(lessonVersionId)}/cbt-questions`,
            { prompt, points, options }
        );
        return unwrap(res);
    },

    deleteCbtQuestion: async (questionId) => {
        const res = await apiService.delete(`/admin/cbt-questions/${encodeURIComponent(questionId)}`);
        return { success: true, ...(res || {}) };
    },

    // ===== Legacy/no-op: Certificate price changes — endpoints not present in
    // the new backend. Existing UI page calls these; surface a no-op so the
    // page renders without throwing.
    listPriceChanges: async () => ({ data: [], meta: {}, links: {} }),
    approvePriceChange: async () => ({ success: false, message: 'Not supported on the new backend.' }),
    rejectPriceChange: async () => ({ success: false, message: 'Not supported on the new backend.' }),
    approveCourse: async (courseId) => adminCoursesService.publishCourse(courseId),
    rejectCourse: async (courseId) => adminCoursesService.unpublishCourse(courseId),

    // Module publish/unpublish helpers (legacy callers)
    publishModule: async (_courseId, moduleId) =>
        adminCoursesService.updateModule(moduleId, { is_published: true }),
    unpublishModule: async (_courseId, moduleId) =>
        adminCoursesService.updateModule(moduleId, { is_published: false }),
};

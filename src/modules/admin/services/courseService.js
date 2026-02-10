import { apiService } from "../../../services/api";

// --- Response Normalization Helpers ---

const unwrapCourse = (res) => {
    if (!res) return null;
    return res.data ? res.data : res;
};

const unwrapList = (res) => {
    if (!res) return { data: [], meta: {}, links: {} };
    return {
        data: res.data || [],
        meta: res.meta || {},
        links: res.links || {}
    };
};

// --- Exports ---

export const adminCoursesService = {
    // A) LIST COURSES (Admin view)
    listCourses: async ({
        page,
        per_page = 20,
        q,
        status,
        level,
        language,
        with_categories = 1,
        with_tutor = 1,
        with_audit = 1
    } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);
        if (q) params.append('q', q);
        if (status) params.append('status', status);
        if (level) params.append('level', level);
        if (language) params.append('language', language);
        if (with_categories) params.append('with_categories', with_categories);
        if (with_tutor) params.append('with_tutor', with_tutor);
        if (with_audit) params.append('with_audit', with_audit);

        const res = await apiService.get(`/lms/courses?${params.toString()}`);
        return unwrapList(res);
    },

    // D) SHOW COURSE DETAIL
    // Using this for admin preview/review purposes
    getCourseDetail: async (courseId) => {
        const res = await apiService.get(`/lms/courses/${courseId}`);
        return unwrapCourse(res);
    },

    // D-1) GET COURSE MODULES
    getCourseModules: async (courseId) => {
        const res = await apiService.get(`/lms/courses/${courseId}/modules?with_lessons=1`);
        // If response is a list object (data, meta), return data array
        return res.data || res || [];
    },

    // A-1) APPROVE COURSE (Admin specific)
    approveCourse: async (courseId) => {
        const res = await apiService.post(`/lms/courses/${courseId}/approve`);
        return unwrapCourse(res);
    },

    // L) REJECT COURSE (Admin specific)
    rejectCourse: async (courseId, reason) => {
        const res = await apiService.post(`/lms/courses/${courseId}/reject`, { reason });
        // Return normalized course if returned, else success
        if (res && (res.data || res.id)) {
            return unwrapCourse(res);
        }
        return { success: true };
    },

    // K) UPDATE COURSE (Admin override)
    updateCourse: async (courseId, payload) => {
        const res = await apiService.put(`/lms/courses/${courseId}`, payload);
        return unwrapCourse(res);
    },

    // M) DELETE COURSE (Admin override/hard delete if needed)
    deleteCourse: async (courseId) => {
        const res = await apiService.delete(`/lms/courses/${courseId}`);
        return { success: true, ...res };
    },

    // N) CERTIFICATE PRICE CHANGES
    listPriceChanges: async ({ status = 'pending', page, per_page = 20, with_course = 1 } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (page) params.append('page', page);
        if (per_page) params.append('per_page', per_page);
        if (with_course) params.append('with_course', with_course);
        const res = await apiService.get(`/lms/certificate-price-changes?${params.toString()}`);
        return res; // Usually contains current_page, data, etc.
    },

    approvePriceChange: async (changeId) => {
        const res = await apiService.post(`/lms/certificate-price-changes/${changeId}/approve`);
        return res;
    },

    rejectPriceChange: async (changeId, rejection_reason) => {
        const res = await apiService.post(`/lms/certificate-price-changes/${changeId}/reject`, { rejection_reason });
        return res;
    },

    // ============ MODULE MANAGEMENT ============

    /**
     * Create a new module for a course
     * POST /lms/courses/{courseId}/modules
     */
    createModule: async (courseId, payload) => {
        const res = await apiService.post(`/lms/courses/${courseId}/modules`, payload);
        return unwrapCourse(res);
    },

    /**
     * Update a module
     * PUT /lms/modules/{moduleId}
     */
    updateModule: async (moduleId, payload) => {
        const res = await apiService.put(`/lms/modules/${moduleId}`, payload);
        return unwrapCourse(res);
    },

    /**
     * Delete a module
     * DELETE /lms/modules/{moduleId}
     */
    deleteModule: async (moduleId) => {
        const res = await apiService.delete(`/lms/modules/${moduleId}`);
        return { success: true, ...res };
    },

    // ============ LESSON MANAGEMENT ============

    listLessons: async (moduleId) => {
        const res = await apiService.get(`/lms/modules/${moduleId}/lessons`);
        return unwrapList(res);
    },

    createLesson: async (moduleId, payload) => {
        const res = await apiService.post(`/lms/modules/${moduleId}/lessons`, payload);
        return unwrapCourse(res);
    },

    deleteLesson: async (lessonId) => {
        const res = await apiService.delete(`/lms/lessons/${lessonId}`);
        return { success: true, ...res };
    },

    publishLesson: async (moduleId, lessonId) => {
        const res = await apiService.post(`/lms/modules/${moduleId}/lessons/${lessonId}/publish`);
        return unwrapCourse(res);
    },

    unpublishLesson: async (moduleId, lessonId) => {
        const res = await apiService.post(`/lms/modules/${moduleId}/lessons/${lessonId}/unpublish`);
        return unwrapCourse(res);
    },

    uploadLessonMedia: async (lessonId, formData) => {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
        const user = localStorage.getItem('user');
        const token = user ? JSON.parse(user).token : null;
        const headers = { 'Accept': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/lms/lessons/${lessonId}/media`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            let msg = 'Upload failed';
            try { const d = await response.json(); msg = d.message || msg; } catch (e) { }
            throw new Error(msg);
        }
        if (response.status === 204) return null;
        return response.json();
    },

    // ============ MODULE PUBLISH ============

    publishModule: async (courseId, moduleId) => {
        const res = await apiService.post(`/lms/courses/${courseId}/modules/${moduleId}/publish`);
        return unwrapCourse(res);
    },

    unpublishModule: async (courseId, moduleId) => {
        const res = await apiService.post(`/lms/courses/${courseId}/modules/${moduleId}/unpublish`);
        return unwrapCourse(res);
    },
};

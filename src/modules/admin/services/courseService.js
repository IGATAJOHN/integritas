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
};

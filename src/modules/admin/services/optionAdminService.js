import { apiService } from '../../../services/api';

const unwrapData = (res) => {
    if (!res) return null;
    if (res.data && !Array.isArray(res.data)) return res.data;
    return res;
};

const unwrapList = (res, fallbackKeys = []) => {
    if (!res) return { data: [], meta: {}, links: {} };

    if (Array.isArray(res)) {
        return { data: res, meta: {}, links: {} };
    }

    if (Array.isArray(res.data)) {
        return {
            data: res.data,
            meta: res.meta || {},
            links: res.links || {},
        };
    }

    if (res.data && Array.isArray(res.data.data)) {
        return {
            data: res.data.data,
            meta: res.data.meta || res.meta || {},
            links: res.data.links || res.links || {},
        };
    }

    for (const key of fallbackKeys) {
        if (Array.isArray(res[key])) {
            return {
                data: res[key],
                meta: res.meta || {},
                links: res.links || {},
            };
        }
    }

    return {
        data: [],
        meta: res.meta || {},
        links: res.links || {},
    };
};

const appendIfPresent = (formData, key, value) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, value);
};

const appendArrayAsIndexedFields = (formData, key, values = []) => {
    if (!Array.isArray(values)) return;
    values.forEach((value, index) => {
        if (value === undefined || value === null || value === '') return;
        formData.append(`${key}[${index}]`, value);
    });
};

const appendArrayAsBracketFields = (formData, key, values = []) => {
    if (!Array.isArray(values)) return;
    values.forEach((value) => {
        if (value === undefined || value === null || value === '') return;
        formData.append(`${key}[]`, value);
    });
};

const buildTutorCreateFormData = (payload = {}) => {
    const formData = new FormData();

    const textFields = [
        'name',
        'email',
        'password',
        'phone',
        'country',
        'state',
        'city',
        'address',
        'bio',
        'highest_education',
        'id_type',
        'id_number',
        'bank_name',
        'account_number',
        'account_name',
        'review_note',
    ];

    textFields.forEach((field) => appendIfPresent(formData, field, payload[field]));
    appendArrayAsBracketFields(formData, 'skills', payload.skills || []);

    if (Array.isArray(payload.docs)) {
        payload.docs.forEach((doc, index) => {
            if (!doc) return;
            appendIfPresent(formData, `docs[${index}][type]`, doc.type);
            if (doc.file) {
                formData.append(`docs[${index}][file]`, doc.file);
            }
        });
    }

    return formData;
};

const buildEssentialCourseFormData = (payload = {}) => {
    const formData = new FormData();

    const textFields = [
        'title',
        'summary',
        'description',
        'level',
        'language',
        'duration_minutes',
        'status',
        'thumbnail_url',
        'banner_url',
        'intro_video_url',
    ];

    textFields.forEach((field) => appendIfPresent(formData, field, payload[field]));

    appendArrayAsIndexedFields(formData, 'tutor_ids', payload.tutor_ids || []);
    appendArrayAsIndexedFields(formData, 'category_ids', payload.category_ids || []);
    appendArrayAsIndexedFields(formData, 'tags', payload.tags || []);
    appendArrayAsIndexedFields(formData, 'learning_objectives', payload.learning_objectives || []);
    appendArrayAsIndexedFields(formData, 'requirements', payload.requirements || []);
    appendArrayAsIndexedFields(formData, 'target_audience', payload.target_audience || []);

    if (payload.thumbnail instanceof File) {
        formData.append('thumbnail', payload.thumbnail);
    }

    if (payload.banner instanceof File) {
        formData.append('banner', payload.banner);
    }

    if (payload.intro_video instanceof File) {
        formData.append('intro_video', payload.intro_video);
    }

    return formData;
};

const buildQueryString = (params = {}) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        searchParams.append(key, value);
    });

    const query = searchParams.toString();
    return query ? `?${query}` : '';
};

export const optionAdminService = {
    // -------- Tutors by Admin --------
    listTutors: async ({ q, per_page = 20, page } = {}) => {
        const query = buildQueryString({ q, per_page, page });
        const res = await apiService.get(`/option/admin/tutors${query}`);
        return unwrapList(res, ['tutors']);
    },

    getTutorById: async (tutorId) => {
        const res = await apiService.get(`/option/admin/tutors/${tutorId}`);
        return unwrapData(res);
    },

    createTutor: async (payload) => {
        const formData = buildTutorCreateFormData(payload);
        const res = await apiService.post('/option/admin/tutors', formData);
        return unwrapData(res);
    },

    updateTutor: async (tutorId, payload) => {
        const res = await apiService.put(`/option/admin/tutors/${tutorId}`, payload);
        return unwrapData(res);
    },

    uploadTutorKycDoc: async (tutorId, { type, file }) => {
        const formData = new FormData();
        appendIfPresent(formData, 'type', type);
        if (file) formData.append('file', file);

        const res = await apiService.post(`/option/admin/tutors/${tutorId}/kyc/docs`, formData);
        return unwrapData(res);
    },

    deleteTutorKycDoc: async (tutorId, docId) => {
        const res = await apiService.delete(`/option/admin/tutors/${tutorId}/kyc/docs/${docId}`);
        return unwrapData(res);
    },

    // -------- Essential Courses by Admin --------
    listEssentialCourses: async ({
        q,
        status,
        level,
        language,
        category_id,
        with_categories = 1,
        with_audit = 1,
        with_tutors = 1,
        per_page = 20,
        page,
    } = {}) => {
        const query = buildQueryString({
            q,
            status,
            level,
            language,
            category_id,
            with_categories,
            with_audit,
            with_tutors,
            per_page,
            page,
        });

        const res = await apiService.get(`/option/admin/courses${query}`);
        return unwrapList(res, ['courses']);
    },

    getEssentialCourseById: async (courseId, {
        with_categories = 1,
        with_audit = 1,
        with_tutors = 1,
    } = {}) => {
        const query = buildQueryString({ with_categories, with_audit, with_tutors });
        const res = await apiService.get(`/option/admin/courses/${courseId}${query}`);
        return unwrapData(res);
    },

    createEssentialCourseJson: async (payload) => {
        const res = await apiService.post('/option/admin/courses', payload);
        return unwrapData(res);
    },

    createEssentialCourseMultipart: async (payload) => {
        const formData = buildEssentialCourseFormData(payload);
        const res = await apiService.post('/option/admin/courses', formData);
        return unwrapData(res);
    },

    updateEssentialCourseJson: async (courseId, payload) => {
        const res = await apiService.patch(`/option/admin/courses/${courseId}`, payload);
        return unwrapData(res);
    },

    updateEssentialCourseMultipart: async (courseId, payload) => {
        const formData = buildEssentialCourseFormData(payload);
        const res = await apiService.patch(`/option/admin/courses/${courseId}`, formData);
        return unwrapData(res);
    },

    addTutorsToCourse: async (courseId, tutor_ids = []) => {
        const res = await apiService.post(`/option/admin/courses/${courseId}/tutors`, { tutor_ids });
        return unwrapData(res);
    },

    syncCourseTutors: async (courseId, tutor_ids = []) => {
        const res = await apiService.put(`/option/admin/courses/${courseId}/tutors`, { tutor_ids });
        return unwrapData(res);
    },

    removeTutorFromCourse: async (courseId, tutorId) => {
        const res = await apiService.delete(`/option/admin/courses/${courseId}/tutors/${tutorId}`);
        return unwrapData(res);
    },

    // -------- Lessons by Admin --------
    listLessonsByModule: async (moduleId) => {
        const res = await apiService.get(`/option/admin/modules/${moduleId}/lessons`);
        return unwrapList(res, ['lessons']);
    },
};

export default optionAdminService;

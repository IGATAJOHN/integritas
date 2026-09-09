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

const VIDEO_EXTENSIONS = new Set([
    '3g2', '3gp', 'avi', 'flv', 'm2ts', 'm4v', 'mkv', 'mov',
    'mp4', 'mpeg', 'mpg', 'mts', 'mxf', 'ogv', 'ts', 'webm', 'wmv'
]);
const LARGE_VIDEO_UPLOAD_THRESHOLD = 90 * 1024 * 1024;
const CLOUDINARY_CHUNK_SIZE = 20 * 1024 * 1024;
const CLOUDINARY_VIDEO_SIZE_LIMIT = 100 * 1024 * 1024;

const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 MB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const getFileExtension = (file) => {
    const name = String(file?.name || '').toLowerCase();
    const match = name.match(/\.([a-z0-9]+)$/);
    return match ? match[1] : '';
};

const isVideoFile = (file) => {
    const mime = String(file?.type || '').toLowerCase();
    return mime.startsWith('video/') || VIDEO_EXTENSIONS.has(getFileExtension(file));
};

const createUploadId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const adminCoursesService = {
    // ===== COURSES =====
    listCourses: async ({ page, per_page = 20, q, status, level, language, type, track } = {}) => {
        let mappedType = type || track;
        if (mappedType === 'expert') mappedType = 'experta';
        const query = buildQuery({ page, per_page, q, status, level, language, type: mappedType });
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

    // ===== SETTINGS =====
    getPricingSettings: async () => {
        const res = await apiService.get('/admin/settings?group=pricing');
        return unwrap(res);
    },

    // ===== MODULES =====

    // GET /admin/modules/{id} — returns the module object including its lessons.
    getModuleDetail: async (moduleId) => {
        const res = await apiService.get(`/admin/modules/${encodeURIComponent(moduleId)}`);
        const data = unwrap(res);
        // Normalise: ensure lessons array is always present.
        return { ...data, lessons: data?.lessons || [] };
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
     * Upload the lesson video using Cloudinary direct upload.
     * Flow: fetch signed credentials → upload file straight to Cloudinary CDN
     *       → save the resulting URL to our backend (tiny payload, no timeout).
     *
     * @param {number} lessonId
     * @param {File|FormData} formDataOrFile  — the raw video File or FormData containing it
     * @param {string} fieldName              — FormData field key (default 'video')
     * @param {function} onProgress           — optional callback(percent: number)
     */
    uploadToCloudinary: async (file, resourceType = 'raw', folder = 'integritas/media', onProgress = null) => {
        const normalizedResourceType = resourceType === 'video' || isVideoFile(file) ? 'video' : resourceType;

        if (normalizedResourceType === 'video' && file.size > CLOUDINARY_VIDEO_SIZE_LIMIT) {
            throw new Error(
                `Video is ${formatBytes(file.size)}. Your current Cloudinary upload limit is ${formatBytes(CLOUDINARY_VIDEO_SIZE_LIMIT)}. Compress the video or increase the Cloudinary account upload limit.`
            );
        }

        const uploadViaBackend = async () => {
            const proxyForm = new FormData();
            proxyForm.append('file', file);
            proxyForm.append('resource_type', normalizedResourceType);
            proxyForm.append('folder', folder);

            const res = await authFetch('/site/cloudinary-upload', {
                method: 'POST',
                body: proxyForm,
            });

            let data = null;
            try { data = await res.json(); } catch { data = null; }

            if (!res.ok) {
                throw new Error(data?.message || `Cloudinary upload failed (${res.status})`);
            }

            const secureUrl = data?.secure_url || data?.url;
            if (!secureUrl) throw new Error('Cloudinary did not return a media URL.');
            return secureUrl;
        };

        // 1. Get signed signature
        const sigRes = await apiService.get(
            `/site/cloudinary-signature?resource_type=${normalizedResourceType}&folder=${encodeURIComponent(folder)}`
        );
        const sig = sigRes?.data ?? sigRes;

        if (!sig?.signature || !sig?.upload_url) {
            throw new Error(
                sig?.message ||
                'Could not get Cloudinary upload credentials. Ensure CLOUDINARY_URL is set on Render.'
            );
        }

        const uploadChunked = async () => {
            const uploadId = createUploadId();
            const totalSize = file.size;
            let finalResult = null;

            for (let start = 0; start < totalSize; start += CLOUDINARY_CHUNK_SIZE) {
                const endExclusive = Math.min(start + CLOUDINARY_CHUNK_SIZE, totalSize);
                const chunk = file.slice(start, endExclusive, file.type || 'application/octet-stream');
                const chunkForm = new FormData();
                chunkForm.append('file', chunk, file.name);
                chunkForm.append('api_key', sig.api_key);
                chunkForm.append('timestamp', sig.timestamp);
                chunkForm.append('folder', sig.folder);
                chunkForm.append('signature', sig.signature);
                chunkForm.append('overwrite', 'true');
                chunkForm.append('resource_type', normalizedResourceType);

                finalResult = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', sig.upload_url);
                    xhr.setRequestHeader('X-Unique-Upload-Id', uploadId);
                    xhr.setRequestHeader('Content-Range', `bytes ${start}-${endExclusive - 1}/${totalSize}`);

                    xhr.upload.addEventListener('progress', (event) => {
                        if (onProgress && event.lengthComputable) {
                            const uploaded = start + event.loaded;
                            onProgress(Math.min(99, Math.round((uploaded / totalSize) * 100)));
                        }
                    });

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({}); }
                        } else {
                            try {
                                const err = JSON.parse(xhr.responseText);
                                reject(new Error(err?.error?.message || `Cloudinary upload failed (${xhr.status})`));
                            } catch {
                                reject(new Error(`Cloudinary upload failed (${xhr.status})`));
                            }
                        }
                    };
                    xhr.onerror = () => reject(new Error('Network error during chunked upload. Check your connection.'));
                    xhr.send(chunkForm);
                });
            }

            if (onProgress) onProgress(100);
            return finalResult;
        };

        if (normalizedResourceType === 'video' && file.size > LARGE_VIDEO_UPLOAD_THRESHOLD) {
            return (await uploadChunked()).secure_url;
        }

        // 2. Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sig.api_key);
        formData.append('timestamp', sig.timestamp);
        formData.append('folder', sig.folder);
        formData.append('signature', sig.signature);
        formData.append('overwrite', 'true');
        formData.append('resource_type', normalizedResourceType);

        const cloudinaryResult = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', sig.upload_url);

            if (onProgress) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
                });
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({}); }
                } else {
                    try {
                        const err = JSON.parse(xhr.responseText);
                        reject(new Error(err?.error?.message || `Cloudinary upload failed (${xhr.status})`));
                    } catch {
                        reject(new Error(`Cloudinary upload failed (${xhr.status})`));
                    }
                }
            };
            xhr.onerror = () => reject(new Error('Network error during upload. Check your connection.'));
            xhr.send(formData);
        }).catch(async (error) => {
            if (normalizedResourceType === 'video') {
                if (String(error?.message || '').includes('413')) {
                    return uploadChunked();
                }
                return { secure_url: await uploadViaBackend() };
            }
            throw error;
        });

        return cloudinaryResult.secure_url;
    },

    uploadLessonMedia: async (lessonId, formDataOrFile, fieldName = 'video', onProgress = null) => {
        // Extract the raw File from FormData if needed
        let file = formDataOrFile;
        if (typeof FormData !== 'undefined' && formDataOrFile instanceof FormData) {
            file = formDataOrFile.get(fieldName) || formDataOrFile.get('video') || formDataOrFile.get('file');
        }
        if (!file || typeof file === 'string') {
            throw new Error('No video file provided for upload.');
        }

        const resourceType = isVideoFile(file) ? 'video' : 'raw';
        const folder = 'integritas/lessons';

        const videoUrl = await adminCoursesService.uploadToCloudinary(file, resourceType, folder, onProgress);

        if (!videoUrl) throw new Error('Cloudinary did not return a video URL.');

        // 3. Save just the URL to our backend — tiny JSON payload, no timeout risk
        const saveRes = await authFetch(`/admin/lessons/${encodeURIComponent(lessonId)}/video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_url: videoUrl }),
        });

        if (!saveRes.ok) {
            let msg = 'Failed to save video URL';
            try { const d = await saveRes.json(); msg = d.message || msg; } catch { /* ignore */ }
            throw new Error(msg);
        }
        return saveRes.status === 204 ? null : saveRes.json();
    },

    uploadLessonMaterial: async (lessonId, file, onProgress = null) => {
        if (!file) throw new Error('No study material file provided for upload.');

        const resourceType = 'raw';
        const folder = 'integritas/materials';

        // 1. Get signed upload credential from backend
        const sigRes = await apiService.get(
            `/site/cloudinary-signature?resource_type=${resourceType}&folder=${encodeURIComponent(folder)}`
        );
        const sig = sigRes?.data ?? sigRes;

        if (!sig?.signature || !sig?.upload_url) {
            throw new Error(
                sig?.message ||
                'Could not get Cloudinary upload credentials. Ensure CLOUDINARY_URL is set on Render.'
            );
        }

        // 2. Upload file directly to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sig.api_key);
        formData.append('timestamp', sig.timestamp);
        formData.append('folder', sig.folder);
        formData.append('signature', sig.signature);
        formData.append('overwrite', 'true');
        formData.append('resource_type', resourceType);

        const cloudinaryResult = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', sig.upload_url);

            if (onProgress) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
                });
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({}); }
                } else {
                    try {
                        const err = JSON.parse(xhr.responseText);
                        reject(new Error(err?.error?.message || `Cloudinary upload failed (${xhr.status})`));
                    } catch {
                        reject(new Error(`Cloudinary upload failed (${xhr.status})`));
                    }
                }
            };
            xhr.onerror = () => reject(new Error('Network error during upload. Check your connection.'));
            xhr.send(formData);
        });

        const materialUrl = cloudinaryResult.secure_url;
        if (!materialUrl) throw new Error('Cloudinary did not return a study material URL.');

        // 3. Save URL to backend (LessonMaterialUploadView accepts JSON now)
        const saveRes = await authFetch(`/admin/lessons/${encodeURIComponent(lessonId)}/material`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ material_url: materialUrl }),
        });

        if (!saveRes.ok) {
            let msg = 'Failed to save material URL';
            try { const d = await saveRes.json(); msg = d.message || msg; } catch { /* ignore */ }
            throw new Error(msg);
        }
        return saveRes.status === 204 ? null : saveRes.json();
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

    // ===== FOUNDATIONAL SINGLETON HELPERS =====
    getFoundationalCourse: async () => {
        const list = await adminCoursesService.listCourses({ type: 'foundational', per_page: 25 });
        const courses = list.data || [];
        const exact = courses.find((course) => String(course.title || '').toLowerCase().includes('foundational'));
        const course = exact || courses[0] || null;
        if (!course) return { course: null, courses, duplicates: [] };
        const detail = await adminCoursesService.getCourseDetail(course.id || course.slug);
        return {
            course: detail || course,
            courses,
            duplicates: courses.filter((item) => String(item.id) !== String(course.id)),
        };
    },

    createFoundationalCourse: async (payload = {}) => adminCoursesService.createCourse({
        type: 'foundational',
        title: payload.title || 'Foundational Courses',
        summary: payload.summary || 'Foundational governance and integrity programme.',
        description: payload.description || payload.summary || 'Foundational governance and integrity programme.',
        price: payload.price === '' || payload.price === undefined ? 0.00 : parseFloat(String(payload.price).replace(/[^\d.]/g, '')),
    }),

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

    // ===== LESSON VERSIONS =====
    duplicateLessonVersion: async (lessonId) => {
        const res = await apiService.post(
            `/admin/lessons/${encodeURIComponent(lessonId)}/versions/duplicate`
        );
        return unwrap(res);
    },

    promoteLessonVersion: async (lessonId, versionId, payload = {}) => {
        const res = await apiService.post(
            `/admin/lessons/${encodeURIComponent(lessonId)}/versions/${encodeURIComponent(versionId)}/promote`,
            payload
        );
        return unwrap(res);
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

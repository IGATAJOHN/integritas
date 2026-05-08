/**
 * Project Submission Service — wired to the new Integritas backend.
 *
 * Endpoints:
 *   GET  /learner/courses/{slug}/project   -> { brief, requirements, status, submission, ... }
 *   POST /learner/courses/{slug}/project   -> multipart { description, files[] } (max 50 MB)
 */

import { apiService } from '../../../services/api';

const unwrap = (res) => (res && res.data ? res.data : res);

export const learnerProjectService = {
    getProject: async (courseSlug) => {
        const res = await apiService.get(`/learner/courses/${encodeURIComponent(courseSlug)}/project`);
        return unwrap(res);
    },

    submitProject: async (courseSlug, { description, files = [] }) => {
        const form = new FormData();
        form.append('description', description || '');
        files.forEach((file) => {
            if (file) form.append('files[]', file);
        });
        const res = await apiService.post(
            `/learner/courses/${encodeURIComponent(courseSlug)}/project`,
            form
        );
        return unwrap(res);
    },
};

export default learnerProjectService;

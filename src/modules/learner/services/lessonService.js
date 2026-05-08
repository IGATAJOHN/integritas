/**
 * Learner Lesson Service — wired to the new Integritas backend.
 *
 * Lesson video URLs come from Bunny CDN as short-lived signed URLs that must
 * be re-fetched on each player mount. Playback position is reported back to
 * the server so the learner can resume from where they left off.
 */

import { apiService } from '../../../services/api';

const unwrap = (res) => (res && res.data ? res.data : res);

export const learnerLessonService = {
    /**
     * GET /learner/lessons/{slug}
     * Returns lesson metadata, materials list, and CBT availability flags.
     */
    getLesson: async (slug) => {
        const res = await apiService.get(`/learner/lessons/${encodeURIComponent(slug)}`);
        return unwrap(res);
    },

    /**
     * GET /learner/lessons/{slug}/video/playback-url
     * Returns a Bunny CDN signed URL with a short TTL.
     */
    getPlaybackUrl: async (slug) => {
        const res = await apiService.get(`/learner/lessons/${encodeURIComponent(slug)}/video/playback-url`);
        return unwrap(res);
    },

    /**
     * POST /learner/lessons/{slug}/video/playback
     * Reports the current playback position so resume works on revisit.
     * Throttle/debounce calls to roughly every 10 seconds in the player.
     */
    reportPosition: async (slug, positionSeconds) => {
        const res = await apiService.post(
            `/learner/lessons/${encodeURIComponent(slug)}/video/playback`,
            { position_seconds: Math.max(0, Math.min(86400, Math.floor(positionSeconds || 0))) }
        );
        return unwrap(res);
    },

    /**
     * GET /learner/courses/{slug}/progress
     * Returns the learner's full progress through the course (modules, lessons,
     * completion %, project status, certificate status).
     */
    getCourseProgress: async (courseSlug) => {
        const res = await apiService.get(`/learner/courses/${encodeURIComponent(courseSlug)}/progress`);
        return unwrap(res);
    },
};

export default learnerLessonService;

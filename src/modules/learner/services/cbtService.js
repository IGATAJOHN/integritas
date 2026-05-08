/**
 * CBT Attempt Service — wired to the new Integritas backend.
 *
 * Flow:
 *   1. POST /learner/lessons/{slug}/cbt/attempts          -> { attempt_id, questions[] }
 *   2. (UI renders questions)
 *   3. POST /learner/cbt/attempts/{id}/submit { answers } -> { passed, score, ... }
 *
 * On a passing submit the backend marks the lesson complete and unlocks the
 * next lesson — no separate completion call is required from the client.
 */

import { apiService } from '../../../services/api';

const unwrap = (res) => (res && res.data ? res.data : res);

export const learnerCbtService = {
    startAttempt: async (lessonSlug) => {
        const res = await apiService.post(
            `/learner/lessons/${encodeURIComponent(lessonSlug)}/cbt/attempts`
        );
        return unwrap(res);
    },

    getAttempt: async (attemptId) => {
        const res = await apiService.get(`/learner/cbt/attempts/${encodeURIComponent(attemptId)}`);
        return unwrap(res);
    },

    /**
     * `answers` must be an array of integer indices, one per question, in the
     * same order returned by the start/get attempt endpoints.
     */
    submitAttempt: async (attemptId, answers) => {
        const payload = { answers: Array.isArray(answers) ? answers.map((n) => Number(n)) : [] };
        const res = await apiService.post(
            `/learner/cbt/attempts/${encodeURIComponent(attemptId)}/submit`,
            payload
        );
        return unwrap(res);
    },
};

export default learnerCbtService;

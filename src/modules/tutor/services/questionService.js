/**
 * Question Service for Tutor Module
 * 
 * Handles all API calls related to quiz questions within lessons.
 * Questions are used to create assessments and quizzes for learners.
 * 
 * API Base: /lms/lessons/{lesson_id}/questions and /lms/questions/{id}
 */

import { apiService } from "../../../services/api";

// --- Response Normalization Helpers ---

/**
 * Normalizes a question object from response.
 */
const unwrapQuestion = (res) => {
    if (!res) return null;
    return res.data ? res.data : res;
};

/**
 * Normalizes a list response to { data, meta, links }.
 */
const unwrapList = (res) => {
  if (!res) return { data: [], meta: {}, links: {} };

  const root = res.data ?? res;

  if (Array.isArray(root)) return { data: root, meta: {}, links: {} };

  return {
    data: root.data ?? root.results ?? [],
    meta: root.meta ?? {},
    links: root.links ?? {},
  };
};


/**
 * For actions that might return a question or just { success: true }.
 */
const okOrQuestion = (res) => {
    if (!res) return { success: true };
    if (res.data || res.id) return unwrapQuestion(res);
    return { success: true };
};

// --- Question Service Exports ---

export const tutorQuestionService = {
    /**
     * List all questions for a specific lesson
     * GET /lms/lessons/{lesson_id}/questions
     * 
     * @param {string|number} lessonId - The lesson ID
     * @returns {Promise<{data: Array, meta: Object, links: Object}>}
     */
    listQuestions: async (lessonId) => {
        const res = await apiService.get(`/lms/lessons/${lessonId}/questions`);
        return unwrapList(res);
    },

    /**
     * Create a new question for a lesson
     * POST /lms/lessons/{id}/questions
     * 
     * @param {string|number} lessonId - The lesson ID
     * @param {Object} payload - Question data
     * @param {string} payload.question - The question text (required)
     * @param {string} [payload.type] - Question type (multiple_choice, true_false, etc.)
     * @param {Array} [payload.options] - Answer options for multiple choice
     * @param {string|number} [payload.correct_answer] - The correct answer or index
     * @param {string} [payload.explanation] - Explanation for the correct answer
     * @param {number} [payload.points] - Points for correct answer
     * @param {number} [payload.position] - Question position/order
     * @returns {Promise<Object>} - Created question data
     */
    createQuestion: async (lessonId, payload) => {
    const prompt = String(payload.prompt ?? payload.question ?? "").trim();

    // Normalize correct_answer to array (API requires array)
    const rawCA = payload.correct_answer ?? payload.correctAnswer ?? payload.answer ?? null;

    const correct_answer =
        rawCA == null ? [] :
        Array.isArray(rawCA) ? rawCA :
        [rawCA];

    const body = {
        prompt,
        type: payload.type ?? "multiple_choice",
        options: payload.options ?? [],
        correct_answer,
        explanation: payload.explanation ?? null,
        points: payload.points ?? 1,
        position: payload.position ?? null,
    };

    const res = await apiService.post(`/lms/lessons/${lessonId}/questions`, body);
    return unwrapQuestion(res);
    },


    /**
     * Get question details by ID
     * GET /lms/questions/{id}
     * 
     * @param {string|number} questionId - The question ID
     * @returns {Promise<Object>} - Question details
     */
    getQuestionById: async (questionId) => {
        const res = await apiService.get(`/lms/questions/${questionId}`);
        return unwrapQuestion(res);
    },

    /**
     * Update a question
     * PUT /lms/questions/{id}
     * 
     * @param {string|number} questionId - The question ID
     * @param {Object} payload - Updated question data
     * @returns {Promise<Object>} - Updated question data
     */
    updateQuestion: async (questionId, payload) => {
        const res = await apiService.put(`/lms/questions/${questionId}`, payload);
        return unwrapQuestion(res);
    },

    /**
     * Delete a question
     * DELETE /lms/questions/{id}
     * 
     * @param {string|number} questionId - The question ID
     * @returns {Promise<{success: boolean}>}
     */
    deleteQuestion: async (questionId) => {
        const res = await apiService.delete(`/lms/questions/${questionId}`);
        return { success: true, ...res };
    },

    /**
     * Reorder questions within a lesson
     * POST /lms/lessons/{id}/questions/reorder
     * 
     * @param {string|number} lessonId - The lesson ID
     * @param {Array<{id: string, position: number}>} items - Array of question IDs with new positions
     * @returns {Promise<{success: boolean}>}
     */
    reorderQuestions: async (lessonId, items) => {
        const res = await apiService.post(`/lms/lessons/${lessonId}/questions/reorder`, { items });
        return okOrQuestion(res);
    },
};

export default tutorQuestionService;

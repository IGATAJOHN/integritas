/**
 * Enrolment & Payments — wired to the new Integritas backend.
 *
 * Course enrolment is a two-step flow:
 *   1. POST /enrolment/initiate { course_slug, idempotency_key } -> { authorization_url, reference }
 *   2. POST /enrolment/verify   { reference }                    -> { enrolment, status }
 *
 * Lesson/module/course completion is no longer a client-side concern; the backend
 * marks completion automatically when the corresponding CBT attempt is submitted
 * with a passing score. Helpers for that live in cbtService.js.
 */

import { apiService, newIdempotencyKey } from "../../../services/api";

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

export const learnerEnrollmentService = {
    /**
     * POST /enrolment/initiate
     * Returns { authorization_url, reference, ... }; redirect the user to the URL.
     */
    initiateEnrolment: async (courseSlug, { idempotencyKey } = {}) => {
        const key = idempotencyKey || newIdempotencyKey();
        const res = await apiService.post(
            '/enrolment/initiate',
            { course_slug: courseSlug, idempotency_key: key },
            { idempotencyKey: key }
        );
        return unwrap(res);
    },

    /**
     * POST /enrolment/verify
     * Called from the Paystack return page with the reference from query string.
     */
    verifyEnrolment: async (reference) => {
        const res = await apiService.post('/enrolment/verify', { reference });
        return unwrap(res);
    },

    /**
     * POST /learner/expert-courses/{slug}/enrol
     * Free enrolment path for tutor-listed expert courses.
     */
    enrolFreeExpertCourse: async (courseSlug) => {
        const res = await apiService.post(`/learner/expert-courses/${encodeURIComponent(courseSlug)}/enrol`);
        return unwrap(res);
    },

    /**
     * GET /me/enrolments — authenticated learner's enrolments
     */
    getMyEnrolments: async ({ page, per_page = 20, status } = {}) => {
        const query = buildQuery({ page, per_page, status });
        const res = await apiService.get(`/me/enrolments${query}`);
        return unwrapList(res);
    },

    /**
     * GET /me/transactions — payment history
     */
    getMyTransactions: async ({ page, per_page = 20 } = {}) => {
        const query = buildQuery({ page, per_page });
        const res = await apiService.get(`/me/transactions${query}`);
        return unwrapList(res);
    },

    /**
     * GET /learner/courses/{slug}/progress
     */
    getCourseProgress: async (courseSlug) => {
        const res = await apiService.get(`/learner/courses/${encodeURIComponent(courseSlug)}/progress`);
        return unwrap(res);
    },

    // -------------------------------------------------------------------
    // Backwards-compatible aliases used by existing pages. Resolve to the
    // new endpoints above so we don't have to touch every call site at once.
    // -------------------------------------------------------------------

    enrollInCourse: async (courseSlugOrId) => learnerEnrollmentService.initiateEnrolment(courseSlugOrId),
    getEnrollments: async (opts) => learnerEnrollmentService.getMyEnrolments(opts),
    getMyEnrolledCourses: async (opts) => learnerEnrollmentService.getMyEnrolments(opts),

    /**
     * Replaces the legacy /payments/verify-status?reference=ENR_... call.
     */
    verifyPaymentStatus: async (reference) => learnerEnrollmentService.verifyEnrolment(reference),
    verifyPayment: async ({ reference }) => learnerEnrollmentService.verifyEnrolment(reference),
    getEnrollmentStatus: async (courseSlug) => learnerEnrollmentService.getCourseProgress(courseSlug),
    getCompletionStatus: async (courseSlug) => learnerEnrollmentService.getCourseProgress(courseSlug),

    // Lesson / module / course completion is now driven server-side by CBT
    // submissions. These helpers stay as no-ops to keep callers compiling
    // until their pages are migrated to read progress from the server.
    completeLesson: async () => ({ success: true, deprecated: true }),
    completeModule: async () => ({ success: true, deprecated: true }),
    completeCourse: async () => ({ success: true, deprecated: true }),
    unenrollFromCourse: async () => ({ success: false, message: 'Unenroll is not supported on the new backend.' }),

    /**
     * Legacy single-call certificate request — replaced by the new certificate
     * service (see certificateService.js). Left here as a thin shim that
     * returns the existing certificate record for the course if any.
     */
    requestCertificate: async () => ({
        success: false,
        message: 'Use the Certificates page to pay and download.',
    }),
};

export default learnerEnrollmentService;

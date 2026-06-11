const API_BASE_URL = (() => {
    const base = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    if (base.startsWith('/') && !import.meta.env.DEV) {
        const origin = import.meta.env.VITE_BACKEND_ORIGIN || 'https://api.theintegritas.org';
        return `${origin.replace(/\/$/, '')}${base}`;
    }
    return base;
})();

export const API_BASE = API_BASE_URL;

const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

const getAuthToken = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const parsed = JSON.parse(user);
        return parsed.token;
    }
    return null;
};

const createHeaders = (customHeaders = {}, { isFormData = false } = {}) => {
    const headers = { ...defaultHeaders, ...customHeaders };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (isFormData) {
        delete headers['Content-Type'];
        delete headers['content-type'];
    }

    return headers;
};

const readResponsePayload = async (response, { allowPlainText = false } = {}) => {
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    const isJson = contentType.includes('application/json');
    const text = await response.text();
    const trimmed = text.trim();

    if (!trimmed) {
        return {
            contentType,
            isJson,
            text,
            data: null,
        };
    }

    if (isJson) {
        try {
            return {
                contentType,
                isJson,
                text,
                data: JSON.parse(text),
            };
        } catch {
            throw new Error('Invalid response format: expected JSON');
        }
    }

    try {
        return {
            contentType,
            isJson,
            text,
            data: JSON.parse(text),
        };
    } catch {
        if (allowPlainText) {
            return {
                contentType,
                isJson,
                text,
                data: text,
            };
        }

        throw new Error('Invalid response format: expected JSON');
    }
};

const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const config = {
        ...options,
        headers: createHeaders(options.headers, { isFormData }),
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            let error;
            let errorMessage = 'An error occurred';

            try {
                const payload = await readResponsePayload(response, { allowPlainText: true });
                error = payload.data && typeof payload.data === 'object' ? payload.data : null;

                if (payload.isJson && payload.data && typeof payload.data === 'object') {
                    errorMessage = payload.data.message || errorMessage;
                } else if (payload.text) {
                    console.error('Non-JSON error response:', payload.text.substring(0, 200));
                    errorMessage = response.statusText || `Server error (${response.status})`;
                } else {
                    errorMessage = response.statusText || errorMessage;
                }
            } catch {
                errorMessage = response.statusText || errorMessage;
            }

            const apiError = new Error(errorMessage);
            apiError.status = response.status;
            apiError.data = error;
            throw apiError;
        }

        if (response.status === 204 || response.status === 205) {
            return null;
        }

        const payload = await readResponsePayload(response);
        if (payload.data === null) return null;
        return payload.data;
    } catch (error) {
        if (error.status) {
            throw error;
        }
        console.error('API Error:', error);
        throw error;
    }
};

const buildExtraHeaders = (opts = {}) => {
    const headers = {};
    if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey;
    if (opts.headers) Object.assign(headers, opts.headers);
    return headers;
};

export const apiService = {
    get: (endpoint, opts = {}) => apiRequest(endpoint, { method: 'GET', headers: buildExtraHeaders(opts) }),

    post: (endpoint, data, opts = {}) => {
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
        return apiRequest(endpoint, {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data),
            headers: buildExtraHeaders(opts),
        });
    },

    put: (endpoint, data, opts = {}) => {
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
        return apiRequest(endpoint, {
            method: 'PUT',
            body: isFormData ? data : JSON.stringify(data),
            headers: buildExtraHeaders(opts),
        });
    },

    patch: (endpoint, data, opts = {}) => {
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
        return apiRequest(endpoint, {
            method: 'PATCH',
            body: isFormData ? data : JSON.stringify(data),
            headers: buildExtraHeaders(opts),
        });
    },

    delete: (endpoint, opts = {}) => apiRequest(endpoint, { method: 'DELETE', headers: buildExtraHeaders(opts) }),
};

export const newIdempotencyKey = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const buildBackendUrl = (path) => {
    const cleanPath = String(path || '').replace(/^\//, '');
    return `${API_BASE_URL}/${cleanPath}`;
};

export const authFetch = async (path, options = {}) => {
    const url = path.startsWith('http') ? path : buildBackendUrl(path);
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const config = {
        ...options,
        headers: createHeaders(options.headers, { isFormData }),
    };
    return fetch(url, config);
};

const defaultDeviceName = () => {
    if (typeof navigator === 'undefined') return 'web';
    const platform = navigator.platform || 'web';
    return `${platform}-web`.slice(0, 60);
};

export const authService = {
    login: (credentials) =>
        apiService.post('/auth/login', {
            device_name: defaultDeviceName(),
            ...credentials,
        }),
    twoFactorChallenge: (challenge_token, code) =>
        apiService.post('/auth/2fa/challenge', { challenge_token, code }),
    register: (userData) => apiService.post('/auth/register', userData),
    registerExpertTutor: (userData) => apiService.post('/auth/tutor/expert/register', userData),
    acceptTutorInvite: (payload) => apiService.post('/auth/tutor/accept-invite', payload),
    logout: () => apiService.post('/auth/logout'),
    logoutAll: () => apiService.post('/auth/logout-all'),
    getCurrentUser: () => apiService.get('/auth/me'),
    verifyEmail: (endpoint) => apiService.get(endpoint),
    resendEmail: () => apiService.post('/auth/email/verify/resend'),
    enableTwoFactor: () => apiService.post('/auth/2fa/enable'),
    confirmTwoFactor: (code) => apiService.post('/auth/2fa/confirm', { code }),
    disableTwoFactor: () => apiService.post('/auth/2fa/disable'),
    regenerateRecoveryCodes: () => apiService.post('/auth/2fa/recovery-codes'),
    forgotPassword: (email) => apiService.post('/auth/password/forgot', { email }),
    resetPassword: (email, token, password, password_confirmation) =>
        apiService.post('/auth/password/reset', { email, token, password, password_confirmation }),
    changePassword: (current_password, password, password_confirmation) =>
        apiService.post('/auth/password/change', { current_password, password, password_confirmation }),
    setPublicVerifiable: (is_publicly_verifiable) =>
        apiService.patch('/me/profile/public-verification', { is_publicly_verifiable }),
};

export const userService = {
    getAll: () => apiService.get('/users'),
    getById: (id) => apiService.get(`/users/${id}`),
    create: (userData) => apiService.post('/users', userData),
    update: (id, userData) => apiService.put(`/users/${id}`, userData),
    delete: (id) => apiService.delete(`/users/${id}`),
};

export const courseService = {
    getAll: () => apiService.get('/courses'),
    getById: (id) => apiService.get(`/courses/${id}`),
    create: (courseData) => apiService.post('/courses', courseData),
    update: (id, courseData) => apiService.put(`/courses/${id}`, courseData),
    delete: (id) => apiService.delete(`/courses/${id}`),
    enroll: (courseId) => apiService.post(`/courses/${courseId}/enroll`),
};

export default apiService;

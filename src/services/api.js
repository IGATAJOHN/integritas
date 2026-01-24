const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.DEV ? '/api' : 'http://localhost:3001/api');

const defaultHeaders = {
    'Content-Type': 'application/json',
};

const getAuthToken = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const parsed = JSON.parse(user);
        return parsed.token;
    }
    return null;
};

const createHeaders = (customHeaders = {}) => {
    const headers = { ...defaultHeaders, ...customHeaders };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        ...options,
        headers: createHeaders(options.headers),
    };

    try {
        const response = await fetch(url, config);

        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        if (!response.ok) {
            let error;
            let errorMessage = 'An error occurred';
            
            if (isJson) {
                try {
                    error = await response.json();
                    errorMessage = error.message || errorMessage;
                } catch (parseError) {
                    errorMessage = response.statusText || errorMessage;
                }
            } else {
                const text = await response.text();
                console.error('Non-JSON error response:', text.substring(0, 200));
                errorMessage = `Server error (${response.status}): ${response.statusText}`;
            }
            
            const apiError = new Error(errorMessage);
            apiError.status = response.status;
            apiError.data = error;
            throw apiError;
        }

        // Parse JSON response
        if (isJson) {
            return await response.json();
        } else {
            // If response is not JSON, try to parse anyway or return text
            const text = await response.text();
            console.warn('Non-JSON response received:', text.substring(0, 200));
            try {
                return JSON.parse(text);
            } catch {
                throw new Error('Invalid response format: expected JSON');
            }
        }
    } catch (error) {
        if (error.status) {
            throw error;
        }
        console.error('API Error:', error);
        throw error;
    }
};

export const apiService = {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),

    post: (endpoint, data) => apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    put: (endpoint, data) => apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    patch: (endpoint, data) => apiRequest(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),

    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

export const authService = {
    login: (credentials) => apiService.post('/auth/login', credentials),
    register: (userData) => apiService.post('/auth/signup', userData),
    logout: () => apiService.post('/auth/logout'),
    getCurrentUser: () => apiService.get('/auth/me'),
    verifyEmail: (endpoint) => apiService.get(endpoint),
    resendEmail: () => apiService.post('/auth/email/resend'),
    forgotPassword: (email) => apiService.post('/auth/password/forgot', { email }),
    verifyPasswordOtp: (email, otp) => apiService.post('/auth/password/verify-otp', { email, otp }),
    resetPassword: (email, otp, password, password_confirmation) => 
        apiService.post('/auth/password/reset', { email, otp, password, password_confirmation }),
    changePassword: (current_password, password, password_confirmation) => 
        apiService.post('/auth/password/change', { current_password, password, password_confirmation }),
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

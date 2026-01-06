// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Default headers
const defaultHeaders = {
    'Content-Type': 'application/json',
};

// Get auth token from storage
const getAuthToken = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const parsed = JSON.parse(user);
        return parsed.token;
    }
    return null;
};

// Create headers with auth token
const createHeaders = (customHeaders = {}) => {
    const headers = { ...defaultHeaders, ...customHeaders };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        ...options,
        headers: createHeaders(options.headers),
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'An error occurred');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// API Service Methods
export const apiService = {
    // GET request
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),

    // POST request
    post: (endpoint, data) => apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    // PUT request
    put: (endpoint, data) => apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    // PATCH request
    patch: (endpoint, data) => apiRequest(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),

    // DELETE request
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

// Auth Service
export const authService = {
    login: (credentials) => apiService.post('/auth/login', credentials),
    register: (userData) => apiService.post('/auth/register', userData),
    logout: () => apiService.post('/auth/logout'),
    getCurrentUser: () => apiService.get('/auth/me'),
};

// User Service
export const userService = {
    getAll: () => apiService.get('/users'),
    getById: (id) => apiService.get(`/users/${id}`),
    create: (userData) => apiService.post('/users', userData),
    update: (id, userData) => apiService.put(`/users/${id}`, userData),
    delete: (id) => apiService.delete(`/users/${id}`),
};

// Course Service
export const courseService = {
    getAll: () => apiService.get('/courses'),
    getById: (id) => apiService.get(`/courses/${id}`),
    create: (courseData) => apiService.post('/courses', courseData),
    update: (id, courseData) => apiService.put(`/courses/${id}`, courseData),
    delete: (id) => apiService.delete(`/courses/${id}`),
    enroll: (courseId) => apiService.post(`/courses/${courseId}/enroll`),
};

export default apiService;

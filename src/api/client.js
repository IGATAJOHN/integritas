import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to add the auth token toทุก request
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            const parsed = JSON.parse(user);
            if (parsed.token) {
                config.headers.Authorization = `Bearer ${parsed.token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        console.error('API Error:', message);

        // Handle 401 Unauthorized if needed
        if (error.response?.status === 401) {
            // Optional: Redirect to login or clear session
            // localStorage.removeItem('user');
            // window.location.href = '/login';
        }

        return Promise.reject({
            status: error.response?.status,
            data: error.response?.data,
            message: message
        });
    }
);

export default api;
export { api };

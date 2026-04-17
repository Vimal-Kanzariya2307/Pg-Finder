import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const existingAuth = config.headers?.Authorization || config.headers?.authorization;
  if (!existingAuth) {
    const stored = localStorage.getItem('pgfinder-auth');
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch {
        localStorage.removeItem('pgfinder-auth');
      }
    }
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pgfinder-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

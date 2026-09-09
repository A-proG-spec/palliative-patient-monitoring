import axios from 'axios';
import { API_URL } from './config';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    // Dynamically import store to avoid circular deps
    try {
      const raw = localStorage.getItem('auth-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // no token available
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — unwrap envelope, handle 401
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap { statusCode, success, message, data } envelope
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state
      try {
        localStorage.removeItem('auth-storage');
      } catch {
        // ignore
      }
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

import axios from 'axios';
import { store } from '../stores/store';
import { logout } from '../stores/authSlice';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

// Request interceptor to add the Bearer token
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if unauthorized, but don't force redirect on every 401
      // For instance, the initial getProfile check will return 401 if not logged in.
      store.dispatch(logout());

      const isAuthRoute = window.location.pathname.includes('/login');
      const isCheckingProfile = error.config?.url?.includes('/auth/profile') || error.config?.url?.includes('/users/me');

      if (!isAuthRoute && !isCheckingProfile) {
        const loginPath = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

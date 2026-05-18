import axios from 'axios';
import { CSRF_COOKIE } from './securityConstants.js';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
});

const ASSETS_BASE = baseURL || '';
export const asset = (path) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${ASSETS_BASE}${path}`;
};

function getCookie(name) {
  const safe = name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&');
  const m = document.cookie.match(new RegExp(`(?:^|; )${safe}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : '';
}

api.interceptors.request.use((config) => {
  const csrf = getCookie(CSRF_COOKIE);
  if (csrf) {
    config.headers = config.headers || {};
    config.headers['X-CSRF-Token'] = csrf;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalConfig = error.config;
    if (!originalConfig || originalConfig._retry) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401) {
      const url = originalConfig.url || '';
      if (
        url.includes('/auth/login') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/me')
      ) {
        return Promise.reject(error);
      }
      originalConfig._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalConfig);
      } catch {
        /* sesión terminada */
      }
    }
    return Promise.reject(error);
  }
);

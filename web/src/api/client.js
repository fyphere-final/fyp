import axios from 'axios';
import { t } from '../lib/strings';

export const TOKEN_KEY = 'oq.token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const isLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('oq:unauthorized'));
    }
    return Promise.reject(error);
  }
);

/** Human-readable message from any failed request. `fallback` is used for non-network errors without a message. */
export function errorMessage(error, fallback = t.errorTitle) {
  if (!error) return fallback;
  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') return t.networkError;
  return error.response?.data?.error?.message || fallback;
}
export const errorStatus = (e) => e?.response?.status;

export default api;

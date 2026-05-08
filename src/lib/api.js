/**
 * api.js — Axios instance with auth interceptors.
 *
 * - Attaches the access token (from AuthContext) to every request.
 * - On 401 response: attempts a silent token refresh, then retries once.
 * - On second 401: clears auth state and redirects to /login.
 *
 * We use a module-level `getToken` / `setToken` approach (rather than
 * importing AuthContext directly) to avoid a circular dependency between
 * this module and AuthContext.
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Token accessors — set by AuthContext on mount and after every refresh.
let _accessToken = null;
let _onTokenRefreshed = null; // called by AuthContext to set the new token

export function setAccessToken(token) {
  _accessToken = token;
}

export function onTokenRefresh(callback) {
  _onTokenRefreshed = callback;
}

// ── Axios instance ────────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send HttpOnly refresh cookie on every request
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach Bearer token ─────────────────────────────────
api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// ── Response interceptor — handle 401 and retry ───────────────────────────────
let isRefreshing = false;
let failedQueue = []; // requests waiting while we refresh

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only retry on 401, not on the refresh endpoint itself.
    if (
      error.response?.status === 401 &&
      !original._retry &&
      original.url !== '/api/auth/refresh'
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post('/api/auth/refresh');
        const newToken = res.data.accessToken;
        _accessToken = newToken;
        if (_onTokenRefreshed) _onTokenRefreshed(res.data);

        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr);
        _accessToken = null;
        if (_onTokenRefreshed) _onTokenRefreshed(null);
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// src/api/client.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Interceptor: adjuntar token JWT en cada request ───────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('techfix_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Interceptor: manejar 401 (sesión expirada) ────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('techfix_token');
      localStorage.removeItem('techfix_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

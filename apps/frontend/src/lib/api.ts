import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  // Try zustand store first, fallback to localStorage
  let token: string | null = null;
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) token = JSON.parse(stored)?.state?.token;
  } catch {}
  if (!token) token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

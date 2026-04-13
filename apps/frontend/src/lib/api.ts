import axios from 'axios';
import type { AnalysisResult, IdeaAnalysis } from '@ai-analyzer/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL || undefined,
  baseURL: API_URL,
  withCredentials: true, // Send httpOnly cookies with every request
});

// CSRF token management: read from cookie and attach to state-changing requests
function getCsrfToken(): string | null {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match?.[1] ?? null;
}

// Attach CSRF token to all state-changing requests
api.interceptors.request.use((config) => {
  if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  // Fallback: if bearer token exists in localStorage, add it (for backwards compat)
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

export const getAnalysis = async (id: string): Promise<AnalysisResult> => {
  const { data } = await api.get(`/analysis/${id}`);
  return data as AnalysisResult;
};

export const getIdeaAnalysis = async (id: string): Promise<IdeaAnalysis | null> => {
  const { data } = await api.get(`/analysis/${id}/idea-analysis`);
  return data as IdeaAnalysis | null;
};

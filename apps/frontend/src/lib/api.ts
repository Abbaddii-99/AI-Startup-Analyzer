import axios from 'axios';
import type { AnalysisResult, IdeaAnalysis } from '@ai-analyzer/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send httpOnly cookies with every request
});

// Fallback: if bearer token exists in localStorage, add it (for backwards compat during transition)
api.interceptors.request.use((config) => {
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

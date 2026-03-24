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

export const getAnalysis = async (id: string): Promise<AnalysisDto> => {
  const response = await fetch(`/api/analysis/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch analysis');
  }
  return response.json();
};

export const getIdeaAnalysis = async (id: string): Promise<IdeaAnalysis | null> => {
  const response = await fetch(`/api/analysis/${id}/idea-analysis`);
  if (!response.ok) {
    throw new Error('Failed to fetch idea analysis');
  }
  return response.json();
};

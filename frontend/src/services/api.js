import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

// Request interceptor - attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('neuronotes_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('neuronotes_token');
      localStorage.removeItem('neuronotes_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updatePreferences: (data) => API.put('/auth/preferences', data),
};

// Notes
export const notesAPI = {
  getAll: (params) => API.get('/notes', { params }),
  getOne: (id) => API.get(`/notes/${id}`),
  create: (data) => API.post('/notes', data),
  update: (id, data) => API.put(`/notes/${id}`, data),
  delete: (id) => API.delete(`/notes/${id}`),
  search: (q) => API.get('/notes/search', { params: { q } }),
  getMeta: () => API.get('/notes/meta'),
};

// AI
export const aiAPI = {
  enhance: (data) => API.post('/ai/enhance', data),
  summarize: (data) => API.post('/ai/summarize', data),
  autoTag: (data) => API.post('/ai/tag', data),
  getSuggestions: (data) => API.post('/ai/suggestions', data),
  format: (data) => API.post('/ai/format', data),
  chat: (data) => API.post('/ai/chat', data),
  generateFlashcards: (data) => API.post('/ai/flashcards', data),
  processAll: (data) => API.post('/ai/process-all', data),
  semanticSearch: (data) => API.post('/ai/semantic-search', data),
};

// Dashboard
export const dashboardAPI = {
  getInsights: () => API.get('/dashboard/insights'),
};

export default API;

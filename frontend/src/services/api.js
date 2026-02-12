import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  search: (query) => api.get(`/tasks/search?q=${query}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

// Comments API
export const commentsAPI = {
  getByTask: (taskId) => api.get(`/comments/${taskId}`),
  create: (taskId, commentData) => api.post(`/comments/${taskId}`, commentData),
  update: (commentId, commentData) => api.put(`/comments/${commentId}`, commentData),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
};

// Preferences API
export const preferencesAPI = {
  get: () => api.get('/preferences'),
  update: (preferences) => api.put('/preferences', preferences),
};

// Admin API
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  changeRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
};

export default api;

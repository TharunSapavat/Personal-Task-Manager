import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

export const taskAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTodayTasks: () => api.get('/tasks/today'),
  getTaskStats: () => api.get('/tasks/stats'),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (taskId, updates) => api.put(`/tasks/${taskId}`, updates),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  deleteAllTasks: () => api.delete('/tasks'),
};

export const streakAPI = {
  getStreakData: () => api.get('/streaks'),
  getStreakStats: () => api.get('/streaks/stats'),
};

export const quoteAPI = {
  getDailyQuote: () => api.get('/quotes/daily'),
  getAllQuotes: () => api.get('/quotes/all'),
};

export const achievementAPI = {
  checkAchievements: () => api.post('/achievements/check'),
  getAllAchievements: () => api.get('/achievements'),
  getUnnotified: () => api.get('/achievements/unnotified'),
  markNotified: (achievementIds) => api.post('/achievements/mark-notified', { achievementIds }),
  getProfileStats: () => api.get('/achievements/profile-stats'),
};

export default api;

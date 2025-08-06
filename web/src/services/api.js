import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (token) => {
    const response = await apiClient.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  updateProfile: async (profileData, token) => {
    const response = await apiClient.put('/auth/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  logout: async (token) => {
    const response = await apiClient.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (resetToken, newPassword) => {
    const response = await apiClient.post(`/auth/reset-password/${resetToken}`, {
      password: newPassword,
    });
    return response.data;
  },
};

// Animals API
export const animalsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/animals');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/animals/${id}`);
    return response.data;
  },

  create: async (animalData) => {
    const response = await apiClient.post('/animals', animalData);
    return response.data;
  },

  update: async (id, animalData) => {
    const response = await apiClient.put(`/animals/${id}`, animalData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/animals/${id}`);
    return response.data;
  },

  uploadPhoto: async (id, photoData) => {
    const formData = new FormData();
    formData.append('photo', photoData);
    const response = await apiClient.post(`/animals/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  addHealthRecord: async (id, healthData) => {
    const response = await apiClient.post(`/animals/${id}/health`, healthData);
    return response.data;
  },

  updateHealthRecord: async (id, recordId, healthData) => {
    const response = await apiClient.put(`/animals/${id}/health/${recordId}`, healthData);
    return response.data;
  },
};

// Schedules API
export const schedulesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/schedules');
    return response.data;
  },

  create: async (scheduleData) => {
    const response = await apiClient.post('/schedules', scheduleData);
    return response.data;
  },

  update: async (id, scheduleData) => {
    const response = await apiClient.put(`/schedules/${id}`, scheduleData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/schedules/${id}`);
    return response.data;
  },

  complete: async (id, completionData) => {
    const response = await apiClient.patch(`/schedules/${id}/complete`, completionData);
    return response.data;
  },

  getUpcoming: async (days = 7) => {
    const response = await apiClient.get(`/schedules/upcoming?days=${days}`);
    return response.data;
  },
};

// Inventory API
export const inventoryAPI = {
  getAll: async () => {
    const response = await apiClient.get('/inventory');
    return response.data;
  },

  create: async (itemData) => {
    const response = await apiClient.post('/inventory', itemData);
    return response.data;
  },

  update: async (id, itemData) => {
    const response = await apiClient.put(`/inventory/${id}`, itemData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/inventory/${id}`);
    return response.data;
  },

  getLowStock: async () => {
    const response = await apiClient.get('/inventory/low-stock');
    return response.data;
  },

  getExpiring: async (days = 30) => {
    const response = await apiClient.get(`/inventory/expiring?days=${days}`);
    return response.data;
  },
};

// Marketplace API
export const marketplaceAPI = {
  getListings: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/marketplace?${params}`);
    return response.data;
  },

  getMyListings: async () => {
    const response = await apiClient.get('/marketplace/my-listings');
    return response.data;
  },

  createListing: async (listingData) => {
    const response = await apiClient.post('/marketplace', listingData);
    return response.data;
  },

  updateListing: async (id, listingData) => {
    const response = await apiClient.put(`/marketplace/${id}`, listingData);
    return response.data;
  },

  deleteListing: async (id) => {
    const response = await apiClient.delete(`/marketplace/${id}`);
    return response.data;
  },

  sendInquiry: async (id, message) => {
    const response = await apiClient.post(`/marketplace/${id}/inquire`, { message });
    return response.data;
  },

  getInquiries: async () => {
    const response = await apiClient.get('/marketplace/inquiries');
    return response.data;
  },

  respondToInquiry: async (id, response) => {
    const result = await apiClient.post(`/marketplace/inquiries/${id}/respond`, { response });
    return result.data;
  },
};

// Dashboard/Statistics API
export const dashboardAPI = {
  getStats: async () => {
    const response = await apiClient.get('/users/dashboard-stats');
    return response.data;
  },

  getRecentActivity: async (limit = 10) => {
    const response = await apiClient.get(`/users/recent-activity?limit=${limit}`);
    return response.data;
  },

  getWeatherData: async () => {
    const response = await apiClient.get('/weather/current');
    return response.data;
  },
};

// File upload utility
export const uploadFile = async (file, endpoint) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data;
};

// Export the configured axios instance for custom requests
export default apiClient; 
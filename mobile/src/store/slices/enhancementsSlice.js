import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

// Async thunks for weather
export const getCurrentWeather = createAsyncThunk(
  'enhancements/getCurrentWeather',
  async ({ latitude, longitude }, { rejectWithValue }) => {
    try {
      const response = await api.get('/weather/current', {
        params: { latitude, longitude }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get weather data');
    }
  }
);

export const getWeatherRecommendations = createAsyncThunk(
  'enhancements/getWeatherRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/weather/recommendations');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get weather recommendations');
    }
  }
);

// Async thunks for sensors
export const getSensors = createAsyncThunk(
  'enhancements/getSensors',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/sensors', { params: filters });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get sensors');
    }
  }
);

export const addSensorReading = createAsyncThunk(
  'enhancements/addSensorReading',
  async ({ sensorId, value, unit, quality }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/sensors/${sensorId}/readings`, {
        value,
        unit,
        quality
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add sensor reading');
    }
  }
);

// Async thunks for health monitoring
export const getHealthAssessments = createAsyncThunk(
  'enhancements/getHealthAssessments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/health/assessments', { params: filters });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get health assessments');
    }
  }
);

export const createHealthAssessment = createAsyncThunk(
  'enhancements/createHealthAssessment',
  async (assessmentData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Add basic fields
      Object.keys(assessmentData).forEach(key => {
        if (key === 'images') {
          // Handle image files
          assessmentData.images?.forEach((image, index) => {
            formData.append('images', image);
          });
        } else if (typeof assessmentData[key] === 'object') {
          // Stringify objects
          formData.append(key, JSON.stringify(assessmentData[key]));
        } else {
          formData.append(key, assessmentData[key]);
        }
      });

      const response = await api.post('/health/assessments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create health assessment');
    }
  }
);

export const getHealthTrends = createAsyncThunk(
  'enhancements/getHealthTrends',
  async ({ animalId, days = 30 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/health/trends/${animalId}`, {
        params: { days }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get health trends');
    }
  }
);

// Async thunks for financial management
export const getFinancialDashboard = createAsyncThunk(
  'enhancements/getFinancialDashboard',
  async (period = '30days', { rejectWithValue }) => {
    try {
      const response = await api.get('/financial/dashboard', {
        params: { period }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get financial dashboard');
    }
  }
);

export const createExpense = createAsyncThunk(
  'enhancements/createExpense',
  async (expenseData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      Object.keys(expenseData).forEach(key => {
        if (key === 'receipt' && expenseData[key]) {
          formData.append('receipt', expenseData[key]);
        } else {
          formData.append(key, expenseData[key]);
        }
      });

      const response = await api.post('/financial/expenses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create expense');
    }
  }
);

export const createRevenue = createAsyncThunk(
  'enhancements/createRevenue',
  async (revenueData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      Object.keys(revenueData).forEach(key => {
        if (key === 'invoice' && revenueData[key]) {
          formData.append('invoice', revenueData[key]);
        } else {
          formData.append(key, revenueData[key]);
        }
      });

      const response = await api.post('/financial/revenue', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create revenue entry');
    }
  }
);

// Async thunks for community
export const getForumPosts = createAsyncThunk(
  'enhancements/getForumPosts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/community/forum/posts', { params: filters });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get forum posts');
    }
  }
);

export const createForumPost = createAsyncThunk(
  'enhancements/createForumPost',
  async (postData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      Object.keys(postData).forEach(key => {
        if (key === 'images') {
          postData.images?.forEach((image) => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, postData[key]);
        }
      });

      const response = await api.post('/community/forum/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create forum post');
    }
  }
);

export const getKnowledgeArticles = createAsyncThunk(
  'enhancements/getKnowledgeArticles',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/community/knowledge', { params: filters });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get knowledge articles');
    }
  }
);

// Async thunks for farm profile management
export const getFarmProfile = createAsyncThunk(
  'enhancements/getFarmProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/farm-profile');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get farm profile');
    }
  }
);

export const setupFarmProfile = createAsyncThunk(
  'enhancements/setupFarmProfile',
  async (farmData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Add basic farm information
      Object.keys(farmData).forEach(key => {
        if (key === 'farmLogo' && farmData[key]) {
          formData.append('farmLogo', farmData[key]);
        } else if (key === 'documents' && farmData[key]) {
          // Handle multiple document uploads
          farmData[key].forEach((doc, index) => {
            formData.append('documents', doc.file);
            formData.append('documentTypes', doc.type);
            formData.append('documentNames', doc.name);
            formData.append('documentNumbers', doc.number || '');
            formData.append('issuingAuthorities', doc.issuingAuthority || '');
            formData.append('issuedDates', doc.issuedDate || '');
            formData.append('expiryDates', doc.expiryDate || '');
          });
        } else if (typeof farmData[key] === 'object') {
          formData.append(key, JSON.stringify(farmData[key]));
        } else {
          formData.append(key, farmData[key]);
        }
      });

      const response = await api.post('/farm-profile/setup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to setup farm profile');
    }
  }
);

export const updateFarmProfile = createAsyncThunk(
  'enhancements/updateFarmProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      Object.keys(profileData).forEach(key => {
        if (key === 'farmLogo' && profileData[key]) {
          formData.append('farmLogo', profileData[key]);
        } else if (typeof profileData[key] === 'object') {
          formData.append(key, JSON.stringify(profileData[key]));
        } else {
          formData.append(key, profileData[key]);
        }
      });

      const response = await api.put('/farm-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update farm profile');
    }
  }
);

export const getFarmDocuments = createAsyncThunk(
  'enhancements/getFarmDocuments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/farm-profile/documents', { params: filters });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get farm documents');
    }
  }
);

export const uploadFarmDocument = createAsyncThunk(
  'enhancements/uploadFarmDocument',
  async (documentData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      Object.keys(documentData).forEach(key => {
        if (key === 'document' && documentData[key]) {
          formData.append('document', documentData[key]);
        } else {
          formData.append(key, documentData[key]);
        }
      });

      const response = await api.post('/farm-profile/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

const initialState = {
  // Weather state
  weather: {
    current: null,
    forecast: [],
    recommendations: [],
    alerts: [],
    isLoading: false,
    error: null,
    lastUpdated: null
  },
  
  // Sensors state
  sensors: {
    list: [],
    dashboard: null,
    isLoading: false,
    error: null
  },
  
  // Health monitoring state
  health: {
    assessments: [],
    trends: null,
    predictions: [],
    recommendations: [],
    dashboard: null,
    isLoading: false,
    error: null
  },
  
  // Financial state
  financial: {
    dashboard: null,
    expenses: [],
    revenue: [],
    budgets: [],
    isLoading: false,
    error: null
  },
  
  // Community state
  community: {
    forumPosts: [],
    knowledgeArticles: [],
    experts: [],
    cooperatives: [],
    isLoading: false,
    error: null
  },
  
  // Farm profile state
  farmProfile: {
    profile: null,
    documents: [],
    isLoading: false,
    error: null,
    setupCompleted: false
  }
};

const enhancementsSlice = createSlice({
  name: 'enhancements',
  initialState,
  reducers: {
    clearWeatherData: (state) => {
      state.weather.current = null;
      state.weather.forecast = [];
      state.weather.recommendations = [];
      state.weather.alerts = [];
      state.weather.error = null;
    },
    
    clearHealthData: (state) => {
      state.health.assessments = [];
      state.health.trends = null;
      state.health.predictions = [];
      state.health.recommendations = [];
      state.health.error = null;
    },
    
    clearFinancialData: (state) => {
      state.financial.dashboard = null;
      state.financial.expenses = [];
      state.financial.revenue = [];
      state.financial.budgets = [];
      state.financial.error = null;
    },
    
    clearCommunityData: (state) => {
      state.community.forumPosts = [];
      state.community.knowledgeArticles = [];
      state.community.experts = [];
      state.community.cooperatives = [];
      state.community.error = null;
    },
    
    clearFarmProfileData: (state) => {
      state.farmProfile.profile = null;
      state.farmProfile.documents = [];
      state.farmProfile.error = null;
      state.farmProfile.setupCompleted = false;
    },
    
    setFarmSetupCompleted: (state, action) => {
      state.farmProfile.setupCompleted = action.payload;
    },
    
    updateSensorReading: (state, action) => {
      const { sensorId, reading } = action.payload;
      const sensor = state.sensors.list.find(s => s.sensorId === sensorId);
      if (sensor) {
        sensor.readings = sensor.readings || [];
        sensor.readings.unshift(reading);
        sensor.lastSeen = new Date().toISOString();
      }
    }
  },
  
  extraReducers: (builder) => {
    // Weather reducers
    builder
      .addCase(getCurrentWeather.pending, (state) => {
        state.weather.isLoading = true;
        state.weather.error = null;
      })
      .addCase(getCurrentWeather.fulfilled, (state, action) => {
        state.weather.isLoading = false;
        state.weather.current = action.payload.current;
        state.weather.forecast = action.payload.forecast;
        state.weather.alerts = action.payload.alerts;
        state.weather.lastUpdated = action.payload.lastUpdated;
      })
      .addCase(getCurrentWeather.rejected, (state, action) => {
        state.weather.isLoading = false;
        state.weather.error = action.payload;
      })
      
      .addCase(getWeatherRecommendations.fulfilled, (state, action) => {
        state.weather.recommendations = action.payload;
      })
      
      // Sensors reducers
      .addCase(getSensors.pending, (state) => {
        state.sensors.isLoading = true;
        state.sensors.error = null;
      })
      .addCase(getSensors.fulfilled, (state, action) => {
        state.sensors.isLoading = false;
        state.sensors.list = action.payload;
      })
      .addCase(getSensors.rejected, (state, action) => {
        state.sensors.isLoading = false;
        state.sensors.error = action.payload;
      })
      
      .addCase(addSensorReading.fulfilled, (state, action) => {
        const { sensor } = action.payload;
        const existingSensorIndex = state.sensors.list.findIndex(s => s._id === sensor._id);
        if (existingSensorIndex !== -1) {
          state.sensors.list[existingSensorIndex] = sensor;
        }
      })
      
      // Health monitoring reducers
      .addCase(getHealthAssessments.pending, (state) => {
        state.health.isLoading = true;
        state.health.error = null;
      })
      .addCase(getHealthAssessments.fulfilled, (state, action) => {
        state.health.isLoading = false;
        state.health.assessments = action.payload;
      })
      .addCase(getHealthAssessments.rejected, (state, action) => {
        state.health.isLoading = false;
        state.health.error = action.payload;
      })
      
      .addCase(createHealthAssessment.fulfilled, (state, action) => {
        state.health.assessments.unshift(action.payload);
      })
      
      .addCase(getHealthTrends.fulfilled, (state, action) => {
        state.health.trends = action.payload;
      })
      
      // Financial reducers
      .addCase(getFinancialDashboard.pending, (state) => {
        state.financial.isLoading = true;
        state.financial.error = null;
      })
      .addCase(getFinancialDashboard.fulfilled, (state, action) => {
        state.financial.isLoading = false;
        state.financial.dashboard = action.payload;
      })
      .addCase(getFinancialDashboard.rejected, (state, action) => {
        state.financial.isLoading = false;
        state.financial.error = action.payload;
      })
      
      .addCase(createExpense.fulfilled, (state, action) => {
        state.financial.expenses.unshift(action.payload);
      })
      
      .addCase(createRevenue.fulfilled, (state, action) => {
        state.financial.revenue.unshift(action.payload);
      })
      
      // Community reducers
      .addCase(getForumPosts.pending, (state) => {
        state.community.isLoading = true;
        state.community.error = null;
      })
      .addCase(getForumPosts.fulfilled, (state, action) => {
        state.community.isLoading = false;
        state.community.forumPosts = action.payload;
      })
      .addCase(getForumPosts.rejected, (state, action) => {
        state.community.isLoading = false;
        state.community.error = action.payload;
      })
      
      .addCase(createForumPost.fulfilled, (state, action) => {
        state.community.forumPosts.unshift(action.payload);
      })
      
      .addCase(getKnowledgeArticles.fulfilled, (state, action) => {
        state.community.knowledgeArticles = action.payload;
      })
      
      // Farm profile reducers
      .addCase(getFarmProfile.pending, (state) => {
        state.farmProfile.isLoading = true;
        state.farmProfile.error = null;
      })
      .addCase(getFarmProfile.fulfilled, (state, action) => {
        state.farmProfile.isLoading = false;
        state.farmProfile.profile = action.payload;
        state.farmProfile.setupCompleted = !!(action.payload?.basicInfo?.farmName);
      })
      .addCase(getFarmProfile.rejected, (state, action) => {
        state.farmProfile.isLoading = false;
        state.farmProfile.error = action.payload;
      })
      
      .addCase(setupFarmProfile.pending, (state) => {
        state.farmProfile.isLoading = true;
        state.farmProfile.error = null;
      })
      .addCase(setupFarmProfile.fulfilled, (state, action) => {
        state.farmProfile.isLoading = false;
        state.farmProfile.profile = action.payload.farmProfile;
        state.farmProfile.documents = action.payload.documents || [];
        state.farmProfile.setupCompleted = true;
      })
      .addCase(setupFarmProfile.rejected, (state, action) => {
        state.farmProfile.isLoading = false;
        state.farmProfile.error = action.payload;
      })
      
      .addCase(updateFarmProfile.fulfilled, (state, action) => {
        state.farmProfile.profile = action.payload;
      })
      
      .addCase(getFarmDocuments.fulfilled, (state, action) => {
        state.farmProfile.documents = action.payload;
      })
      
      .addCase(uploadFarmDocument.fulfilled, (state, action) => {
        state.farmProfile.documents.unshift(action.payload);
      });
  }
});

export const {
  clearWeatherData,
  clearHealthData,
  clearFinancialData,
  clearCommunityData,
  clearFarmProfileData,
  setFarmSetupCompleted,
  updateSensorReading
} = enhancementsSlice.actions;

export default enhancementsSlice.reducer; 
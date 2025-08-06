import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Async thunks
export const fetchSchedules = createAsyncThunk(
  'schedules/fetchSchedules',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_BASE_URL}/api/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedules');
    }
  }
);

export const createSchedule = createAsyncThunk(
  'schedules/createSchedule',
  async (scheduleData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_BASE_URL}/api/schedules`, scheduleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create schedule');
    }
  }
);

export const updateSchedule = createAsyncThunk(
  'schedules/updateSchedule',
  async ({ scheduleId, scheduleData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${API_BASE_URL}/api/schedules/${scheduleId}`, scheduleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update schedule');
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  'schedules/deleteSchedule',
  async (scheduleId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`${API_BASE_URL}/api/schedules/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return scheduleId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete schedule');
    }
  }
);

export const completeSchedule = createAsyncThunk(
  'schedules/completeSchedule',
  async ({ scheduleId, completionData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.patch(`${API_BASE_URL}/api/schedules/${scheduleId}/complete`, completionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete schedule');
    }
  }
);

const initialState = {
  schedules: [],
  isLoading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'all',
    priority: 'all',
    dateRange: 'all',
  },
  stats: {
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
  },
};

const schedulesSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateStats: (state) => {
      const now = new Date();
      state.stats = {
        total: state.schedules.length,
        pending: state.schedules.filter(s => s.status === 'pending').length,
        completed: state.schedules.filter(s => s.status === 'completed').length,
        overdue: state.schedules.filter(s => 
          s.status === 'pending' && new Date(s.scheduledDate) < now
        ).length,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Schedules
      .addCase(fetchSchedules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schedules = action.payload;
        state.error = null;
        // Update stats
        const now = new Date();
        state.stats = {
          total: action.payload.length,
          pending: action.payload.filter(s => s.status === 'pending').length,
          completed: action.payload.filter(s => s.status === 'completed').length,
          overdue: action.payload.filter(s => 
            s.status === 'pending' && new Date(s.scheduledDate) < now
          ).length,
        };
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Schedule
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.schedules.unshift(action.payload);
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Schedule
      .addCase(updateSchedule.fulfilled, (state, action) => {
        const index = state.schedules.findIndex(schedule => schedule._id === action.payload._id);
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete Schedule
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.schedules = state.schedules.filter(schedule => schedule._id !== action.payload);
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Complete Schedule
      .addCase(completeSchedule.fulfilled, (state, action) => {
        const index = state.schedules.findIndex(schedule => schedule._id === action.payload._id);
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
      })
      .addCase(completeSchedule.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilters, updateStats } = schedulesSlice.actions;
export default schedulesSlice.reducer; 
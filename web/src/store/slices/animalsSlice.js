import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Async thunks
export const fetchAnimals = createAsyncThunk(
  'animals/fetchAnimals',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_BASE_URL}/api/animals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch animals');
    }
  }
);

export const fetchAnimalById = createAsyncThunk(
  'animals/fetchAnimalById',
  async (animalId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_BASE_URL}/api/animals/${animalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch animal');
    }
  }
);

export const createAnimal = createAsyncThunk(
  'animals/createAnimal',
  async (animalData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_BASE_URL}/api/animals`, animalData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create animal');
    }
  }
);

export const updateAnimal = createAsyncThunk(
  'animals/updateAnimal',
  async ({ animalId, animalData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${API_BASE_URL}/api/animals/${animalId}`, animalData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update animal');
    }
  }
);

export const deleteAnimal = createAsyncThunk(
  'animals/deleteAnimal',
  async (animalId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`${API_BASE_URL}/api/animals/${animalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return animalId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete animal');
    }
  }
);

const initialState = {
  animals: [],
  currentAnimal: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  filters: {
    category: 'all',
    gender: 'all',
    status: 'all',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 10,
  },
};

const animalsSlice = createSlice({
  name: 'animals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentAnimal: (state) => {
      state.currentAnimal = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Animals
      .addCase(fetchAnimals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnimals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.animals = action.payload;
        state.error = null;
      })
      .addCase(fetchAnimals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Animal by ID
      .addCase(fetchAnimalById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnimalById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAnimal = action.payload;
        state.error = null;
      })
      .addCase(fetchAnimalById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Animal
      .addCase(createAnimal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAnimal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.animals.unshift(action.payload);
        state.error = null;
      })
      .addCase(createAnimal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Animal
      .addCase(updateAnimal.fulfilled, (state, action) => {
        const index = state.animals.findIndex(animal => animal._id === action.payload._id);
        if (index !== -1) {
          state.animals[index] = action.payload;
        }
        if (state.currentAnimal && state.currentAnimal._id === action.payload._id) {
          state.currentAnimal = action.payload;
        }
      })
      .addCase(updateAnimal.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete Animal
      .addCase(deleteAnimal.fulfilled, (state, action) => {
        state.animals = state.animals.filter(animal => animal._id !== action.payload);
        if (state.currentAnimal && state.currentAnimal._id === action.payload) {
          state.currentAnimal = null;
        }
      })
      .addCase(deleteAnimal.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilters, setPagination, clearCurrentAnimal } = animalsSlice.actions;
export default animalsSlice.reducer; 
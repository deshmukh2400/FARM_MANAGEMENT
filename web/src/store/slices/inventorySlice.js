import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Async thunks
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_BASE_URL}/api/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory');
    }
  }
);

export const createInventoryItem = createAsyncThunk(
  'inventory/createInventoryItem',
  async (itemData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_BASE_URL}/api/inventory`, itemData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create inventory item');
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateInventoryItem',
  async ({ itemId, itemData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${API_BASE_URL}/api/inventory/${itemId}`, itemData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update inventory item');
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteInventoryItem',
  async (itemId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`${API_BASE_URL}/api/inventory/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return itemId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete inventory item');
    }
  }
);

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  filters: {
    category: 'all',
    status: 'all',
    search: '',
  },
  stats: {
    total: 0,
    lowStock: 0,
    nearExpiry: 0,
    expired: 0,
    totalValue: 0,
  },
};

const inventorySlice = createSlice({
  name: 'inventory',
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
      let totalValue = 0;
      
      state.items.forEach(item => {
        if (item.pricing?.costPerUnit && item.stock?.currentQuantity) {
          totalValue += item.pricing.costPerUnit * item.stock.currentQuantity;
        }
      });

      state.stats = {
        total: state.items.length,
        lowStock: state.items.filter(item => item.alerts?.lowStock).length,
        nearExpiry: state.items.filter(item => item.alerts?.nearExpiry).length,
        expired: state.items.filter(item => item.alerts?.expired).length,
        totalValue,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inventory
      .addCase(fetchInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
        
        // Update stats
        let totalValue = 0;
        action.payload.forEach(item => {
          if (item.pricing?.costPerUnit && item.stock?.currentQuantity) {
            totalValue += item.pricing.costPerUnit * item.stock.currentQuantity;
          }
        });

        state.stats = {
          total: action.payload.length,
          lowStock: action.payload.filter(item => item.alerts?.lowStock).length,
          nearExpiry: action.payload.filter(item => item.alerts?.nearExpiry).length,
          expired: action.payload.filter(item => item.alerts?.expired).length,
          totalValue,
        };
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Inventory Item
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(createInventoryItem.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Inventory Item
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete Inventory Item
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilters, updateStats } = inventorySlice.actions;
export default inventorySlice.reducer; 
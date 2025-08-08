import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Async thunks
export const fetchListings = createAsyncThunk(
  'marketplace/fetchListings',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_BASE_URL}/api/marketplace`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch listings');
    }
  }
);

export const fetchMyListings = createAsyncThunk(
  'marketplace/fetchMyListings',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_BASE_URL}/api/marketplace/my-listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my listings');
    }
  }
);

export const createListing = createAsyncThunk(
  'marketplace/createListing',
  async (listingData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_BASE_URL}/api/marketplace`, listingData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create listing');
    }
  }
);

export const updateListing = createAsyncThunk(
  'marketplace/updateListing',
  async ({ listingId, listingData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${API_BASE_URL}/api/marketplace/${listingId}`, listingData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update listing');
    }
  }
);

export const deleteListing = createAsyncThunk(
  'marketplace/deleteListing',
  async (listingId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`${API_BASE_URL}/api/marketplace/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return listingId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete listing');
    }
  }
);

export const sendInquiry = createAsyncThunk(
  'marketplace/sendInquiry',
  async ({ listingId, message }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_BASE_URL}/api/marketplace/${listingId}/inquire`, 
        { message }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send inquiry');
    }
  }
);

export const fetchInquiries = createAsyncThunk(
  'marketplace/fetchInquiries',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_BASE_URL}/api/marketplace/inquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inquiries');
    }
  }
);

const initialState = {
  listings: [],
  myListings: [],
  inquiries: [],
  currentListing: null,
  isLoading: false,
  error: null,
  filters: {
    type: 'all',
    category: 'all',
    priceRange: 'all',
    location: 'all',
    search: '',
  },
  inquiryStatus: null,
};

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setCurrentListing: (state, action) => {
      state.currentListing = action.payload;
    },
    clearCurrentListing: (state) => {
      state.currentListing = null;
    },
    clearInquiryStatus: (state) => {
      state.inquiryStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Listings
      .addCase(fetchListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listings = action.payload;
        state.error = null;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch My Listings
      .addCase(fetchMyListings.fulfilled, (state, action) => {
        state.myListings = action.payload;
      })
      .addCase(fetchMyListings.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Create Listing
      .addCase(createListing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listings.unshift(action.payload);
        state.myListings.unshift(action.payload);
        state.error = null;
      })
      .addCase(createListing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Listing
      .addCase(updateListing.fulfilled, (state, action) => {
        const listingIndex = state.listings.findIndex(listing => listing._id === action.payload._id);
        if (listingIndex !== -1) {
          state.listings[listingIndex] = action.payload;
        }
        
        const myListingIndex = state.myListings.findIndex(listing => listing._id === action.payload._id);
        if (myListingIndex !== -1) {
          state.myListings[myListingIndex] = action.payload;
        }
        
        if (state.currentListing && state.currentListing._id === action.payload._id) {
          state.currentListing = action.payload;
        }
      })
      .addCase(updateListing.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete Listing
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.listings = state.listings.filter(listing => listing._id !== action.payload);
        state.myListings = state.myListings.filter(listing => listing._id !== action.payload);
        if (state.currentListing && state.currentListing._id === action.payload) {
          state.currentListing = null;
        }
      })
      .addCase(deleteListing.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Send Inquiry
      .addCase(sendInquiry.pending, (state) => {
        state.inquiryStatus = 'sending';
        state.error = null;
      })
      .addCase(sendInquiry.fulfilled, (state) => {
        state.inquiryStatus = 'sent';
      })
      .addCase(sendInquiry.rejected, (state, action) => {
        state.inquiryStatus = 'failed';
        state.error = action.payload;
      })

      // Fetch Inquiries
      .addCase(fetchInquiries.fulfilled, (state, action) => {
        state.inquiries = action.payload;
      })
      .addCase(fetchInquiries.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  setCurrentListing, 
  clearCurrentListing, 
  clearInquiryStatus 
} = marketplaceSlice.actions;

// Export aliases for backward compatibility
export const fetchMarketplace = fetchListings;
export const createInquiry = sendInquiry;

export default marketplaceSlice.reducer; 
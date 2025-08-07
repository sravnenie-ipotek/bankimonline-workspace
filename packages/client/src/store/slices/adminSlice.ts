/**
 * Admin Redux Slice
 * Manages admin authentication and state
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Admin user interface
interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  type: 'admin';
}

// Admin state interface
interface AdminState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  stats: {
    totalClients: number;
    totalAdmins: number;
    totalBanks: number;
    totalApplications: number;
    lastUpdated: string | null;
  };
}

// Initial state
const initialState: AdminState = {
  user: null,
  token: localStorage.getItem('adminToken'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  stats: {
    totalClients: 0,
    totalAdmins: 0,
    totalBanks: 0,
    totalApplications: 0,
    lastUpdated: null,
  },
};

// API base URL
const API_BASE_URL = 'https://bankimonline.com/api';

/**
 * Admin Login Async Thunk
 */
export const adminLogin = createAsyncThunk(
  'admin/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('adminToken', data.data.token);

      return data.data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

/**
 * Get Admin Profile Async Thunk
 */
export const getAdminProfile = createAsyncThunk(
  'admin/getProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { admin: AdminState };
      const token = state.admin.token;

      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('adminToken');
        }
        return rejectWithValue(data.message || 'Failed to get profile');
      }

      return data.data.admin;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

/**
 * Get Admin Stats Async Thunk
 */
export const getAdminStats = createAsyncThunk(
  'admin/getStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { admin: AdminState };
      const token = state.admin.token;

      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to get stats');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

/**
 * Admin Slice
 */
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Clear admin state (logout)
    clearAdmin: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('adminToken');
    },
    
    // Clear admin error
    clearAdminError: (state) => {
      state.error = null;
    },
    
    // Set admin token (for auto-login)
    setAdminToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('adminToken', action.payload);
    },
  },
  extraReducers: (builder) => {
    // Admin Login
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.admin;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Get Admin Profile
    builder
      .addCase(getAdminProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAdminProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getAdminProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });

    // Get Admin Stats
    builder
      .addCase(getAdminStats.pending, (state) => {
        // Don't set loading for stats (non-blocking)
      })
      .addCase(getAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getAdminStats.rejected, (state, action) => {
        console.error('Failed to load admin stats:', action.payload);
      });
  },
});

// Export actions
export const { clearAdmin, clearAdminError, setAdminToken } = adminSlice.actions;

// Export selectors
export const selectAdminUser = (state: { admin: AdminState }) => state.admin.user;
export const selectAdminToken = (state: { admin: AdminState }) => state.admin.token;
export const selectAdminIsAuthenticated = (state: { admin: AdminState }) => state.admin.isAuthenticated;
export const selectAdminIsLoading = (state: { admin: AdminState }) => state.admin.isLoading;
export const selectAdminError = (state: { admin: AdminState }) => state.admin.error;
export const selectAdminStats = (state: { admin: AdminState }) => state.admin.stats;

// Export reducer
export default adminSlice.reducer;
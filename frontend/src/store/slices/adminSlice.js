import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

// Async thunks
export const getTrains = createAsyncThunk(
  'admin/getTrains',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/trains`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addTrain = createAsyncThunk(
  'admin/addTrain',
  async (trainData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/admin/trains`, trainData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTrain = createAsyncThunk(
  'admin/updateTrain',
  async ({ id, ...trainData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/admin/trains/${id}`, trainData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteTrain = createAsyncThunk(
  'admin/deleteTrain',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/admin/trains/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getBookings = createAsyncThunk(
  'admin/getBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/bookings`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'admin/updateBookingStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/admin/bookings/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getUsers = createAsyncThunk(
  'admin/getUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/admin/users/${id}/role`, {
        role,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  trains: [],
  bookings: [],
  users: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Trains
      .addCase(getTrains.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTrains.fulfilled, (state, action) => {
        state.loading = false;
        state.trains = action.payload;
      })
      .addCase(getTrains.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch trains';
      })
      // Add Train
      .addCase(addTrain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTrain.fulfilled, (state, action) => {
        state.loading = false;
        state.trains.push(action.payload);
      })
      .addCase(addTrain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add train';
      })
      // Update Train
      .addCase(updateTrain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrain.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.trains.findIndex((train) => train._id === action.payload._id);
        if (index !== -1) {
          state.trains[index] = action.payload;
        }
      })
      .addCase(updateTrain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update train';
      })
      // Delete Train
      .addCase(deleteTrain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrain.fulfilled, (state, action) => {
        state.loading = false;
        state.trains = state.trains.filter((train) => train._id !== action.payload);
      })
      .addCase(deleteTrain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete train';
      })
      // Get Bookings
      .addCase(getBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch bookings';
      })
      // Update Booking Status
      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(
          (booking) => booking._id === action.payload._id
        );
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update booking status';
      })
      // Get Users
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch users';
      })
      // Update User Role
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((user) => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update user role';
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer; 
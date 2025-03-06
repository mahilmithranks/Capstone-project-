import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL, API_ENDPOINTS } from '../../config';

// Async thunks
export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}${API_ENDPOINTS.bookings.create}`, bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getMyBookings = createAsyncThunk(
  'bookings/getMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}${API_ENDPOINTS.bookings.list}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getBookingDetails = createAsyncThunk(
  'bookings/getDetails',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}${API_ENDPOINTS.bookings.details(bookingId)}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}${API_ENDPOINTS.bookings.cancel(bookingId)}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const processPayment = createAsyncThunk(
  'bookings/processPayment',
  async ({ bookingId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}${API_ENDPOINTS.bookings.payment(bookingId)}`,
        paymentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
  paymentStatus: null,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    clearPaymentStatus: (state) => {
      state.paymentStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
        state.selectedBooking = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create booking';
      })
      // Get My Bookings
      .addCase(getMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(getMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get bookings';
      })
      // Get Booking Details
      .addCase(getBookingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = action.payload;
      })
      .addCase(getBookingDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get booking details';
      })
      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to cancel booking';
      })
      // Process Payment
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentStatus = 'success';
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Payment processing failed';
        state.paymentStatus = 'failed';
      });
  },
});

export const { clearError, clearSelectedBooking, clearPaymentStatus } = bookingSlice.actions;
export default bookingSlice.reducer; 
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

// Async thunks
export const searchTrains = createAsyncThunk(
  'trains/searchTrains',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/trains/search`, {
        params: searchParams,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getTrainDetails = createAsyncThunk(
  'trains/getTrainDetails',
  async (trainId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/trains/${trainId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getTrainSchedule = createAsyncThunk(
  'trains/getTrainSchedule',
  async (trainId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/trains/${trainId}/schedule`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getTrainSeats = createAsyncThunk(
  'trains/getTrainSeats',
  async (trainId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/trains/${trainId}/seats`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  trains: [],
  selectedTrain: null,
  trainSchedule: null,
  availableSeats: null,
  loading: false,
  error: null,
};

const trainSlice = createSlice({
  name: 'trains',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedTrain: (state) => {
      state.selectedTrain = null;
      state.trainSchedule = null;
      state.availableSeats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Trains
      .addCase(searchTrains.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchTrains.fulfilled, (state, action) => {
        state.loading = false;
        state.trains = action.payload;
      })
      .addCase(searchTrains.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to search trains';
      })
      // Get Train Details
      .addCase(getTrainDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTrainDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTrain = action.payload;
      })
      .addCase(getTrainDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get train details';
      })
      // Get Train Schedule
      .addCase(getTrainSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTrainSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.trainSchedule = action.payload;
      })
      .addCase(getTrainSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get train schedule';
      })
      // Get Train Seats
      .addCase(getTrainSeats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTrainSeats.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSeats = action.payload;
      })
      .addCase(getTrainSeats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get available seats';
      });
  },
});

export const { clearError, clearSelectedTrain } = trainSlice.actions;
export default trainSlice.reducer; 
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { openDB } from 'idb';
import { APP_CONFIG } from '../../config';

// Initialize IndexedDB
const initDB = async () => {
  const db = await openDB(APP_CONFIG.offline.storageName, APP_CONFIG.offline.version, {
    upgrade(db) {
      // Create stores
      if (!db.objectStoreNames.contains('bookings')) {
        db.createObjectStore('bookings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('trains')) {
        db.createObjectStore('trains', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
  return db;
};

// Async thunks
export const saveOffline = createAsyncThunk(
  'offline/save',
  async ({ type, data }, { rejectWithValue }) => {
    try {
      const db = await initDB();
      await db.put(type, data);
      return { type, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getOfflineData = createAsyncThunk(
  'offline/get',
  async (type, { rejectWithValue }) => {
    try {
      const db = await initDB();
      const data = await db.getAll(type);
      return { type, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToSyncQueue = createAsyncThunk(
  'offline/addToSyncQueue',
  async (action, { rejectWithValue }) => {
    try {
      const db = await initDB();
      await db.add('syncQueue', {
        action,
        timestamp: new Date().toISOString(),
        status: 'pending',
      });
      return action;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const processSyncQueue = createAsyncThunk(
  'offline/processSyncQueue',
  async (_, { rejectWithValue }) => {
    try {
      const db = await initDB();
      const queue = await db.getAll('syncQueue');
      const pendingActions = queue.filter((item) => item.status === 'pending');

      for (const item of pendingActions) {
        try {
          // Process the action (e.g., make API call)
          await processAction(item.action);
          // Mark as completed
          await db.put('syncQueue', { ...item, status: 'completed' });
        } catch (error) {
          // Mark as failed
          await db.put('syncQueue', {
            ...item,
            status: 'failed',
            error: error.message,
          });
        }
      }

      return pendingActions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isOnline: navigator.onLine,
  offlineData: {
    bookings: [],
    trains: [],
  },
  syncQueue: [],
  loading: false,
  error: null,
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Save Offline
      .addCase(saveOffline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveOffline.fulfilled, (state, action) => {
        state.loading = false;
        const { type, data } = action.payload;
        state.offlineData[type] = data;
      })
      .addCase(saveOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Offline Data
      .addCase(getOfflineData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOfflineData.fulfilled, (state, action) => {
        state.loading = false;
        const { type, data } = action.payload;
        state.offlineData[type] = data;
      })
      .addCase(getOfflineData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to Sync Queue
      .addCase(addToSyncQueue.fulfilled, (state, action) => {
        state.syncQueue.push({
          id: Date.now(),
          action: action.payload,
          timestamp: new Date().toISOString(),
          status: 'pending',
        });
      })
      // Process Sync Queue
      .addCase(processSyncQueue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processSyncQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.syncQueue = state.syncQueue.map((item) => {
          const processed = action.payload.find((p) => p.id === item.id);
          return processed ? { ...item, status: processed.status } : item;
        });
      })
      .addCase(processSyncQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setOnlineStatus, clearError } = offlineSlice.actions;
export default offlineSlice.reducer; 
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import trainReducer from './slices/trainSlice';
import bookingReducer from './slices/bookingSlice';
import offlineReducer from './slices/offlineSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trains: trainReducer,
    bookings: bookingReducer,
    offline: offlineReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['socket/connected', 'socket/disconnected'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.socket'],
      },
    }),
}); 
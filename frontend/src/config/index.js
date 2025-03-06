export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const APP_CONFIG = {
  name: 'Train Ticket Booking',
  version: '1.0.0',
  description: 'AI-powered offline train ticket booking system',
  features: {
    offlineMode: true,
    aiRecommendations: true,
    realTimeUpdates: true,
  },
  theme: {
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    backgroundColor: '#f5f5f5',
  },
  booking: {
    maxPassengers: 6,
    minAdvanceBooking: 1, // days
    maxAdvanceBooking: 120, // days
    cancellationPolicy: {
      refundPercentage: {
        moreThan7Days: 75,
        moreThan3Days: 50,
        moreThan1Day: 25,
      },
    },
  },
  offline: {
    storageName: 'trainBookingDB',
    version: 1,
    syncInterval: 5 * 60 * 1000, // 5 minutes
  },
  ai: {
    modelPath: '/models/recommendation-model',
    trainingBatchSize: 32,
    trainingEpochs: 100,
  },
};

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  search: '/search',
  bookings: '/bookings',
  profile: '/profile',
  admin: {
    dashboard: '/admin',
    trains: '/admin/trains',
    bookings: '/admin/bookings',
  },
};

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh-token',
    profile: '/auth/profile',
  },
  trains: {
    search: '/trains/search',
    list: '/trains',
    details: (id) => `/trains/${id}`,
    schedule: (id) => `/trains/${id}/schedule`,
    seats: (id) => `/trains/${id}/seats`,
  },
  bookings: {
    create: '/bookings',
    list: '/bookings/my-bookings',
    details: (id) => `/bookings/${id}`,
    cancel: (id) => `/bookings/${id}/cancel`,
    payment: (id) => `/bookings/${id}/payment`,
  },
  recommendations: {
    personalized: '/recommendations/personalized',
    rate: '/recommendations/rate',
    popularRoutes: '/recommendations/popular-routes',
    patterns: '/recommendations/patterns',
  },
};

export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  server: 'Server error. Please try again later.',
  unauthorized: 'Unauthorized access. Please login.',
  forbidden: 'Access forbidden.',
  notFound: 'Resource not found.',
  validation: 'Please check your input and try again.',
  offline: 'You are offline. Some features may be limited.',
  sync: 'Error syncing data. Please try again.',
};

export const SUCCESS_MESSAGES = {
  login: 'Successfully logged in.',
  register: 'Registration successful.',
  logout: 'Successfully logged out.',
  booking: 'Booking created successfully.',
  payment: 'Payment processed successfully.',
  cancellation: 'Booking cancelled successfully.',
  sync: 'Data synced successfully.',
}; 
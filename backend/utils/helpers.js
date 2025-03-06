const crypto = require('crypto');
const config = require('../config/config');

// Generate a random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Format date to ISO string
const formatDate = (date) => {
  return new Date(date).toISOString();
};

// Calculate time difference in minutes
const calculateTimeDifference = (date1, date2) => {
  return Math.abs(new Date(date1) - new Date(date2)) / (1000 * 60);
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Generate booking reference
const generateBookingReference = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TR${year}${month}${random}`;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Generate pagination metadata
const generatePaginationMetadata = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

// Format error response
const formatErrorResponse = (error, statusCode = 500) => {
  const response = {
    success: false,
    message: error.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  };

  if (config.nodeEnv === 'development') {
    response.stack = error.stack;
  }

  return {
    statusCode,
    response
  };
};

// Format success response
const formatSuccessResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    statusCode,
    response: {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    }
  };
};

// Check if application is online
const isOnline = () => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Generate QR code data for ticket
const generateTicketQRData = (booking) => {
  return {
    bookingId: booking._id,
    bookingReference: booking.bookingReference,
    trainNumber: booking.train.number,
    journeyDate: booking.journeyDate,
    passengerCount: booking.passengers.length,
    totalFare: booking.totalFare
  };
};

// Validate date range
const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

// Calculate age
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

module.exports = {
  generateRandomString,
  formatDate,
  calculateTimeDifference,
  formatCurrency,
  generateBookingReference,
  isValidEmail,
  isValidPhoneNumber,
  sanitizeInput,
  generatePaginationMetadata,
  formatErrorResponse,
  formatSuccessResponse,
  isOnline,
  debounce,
  throttle,
  generateTicketQRData,
  isValidDateRange,
  calculateAge
}; 
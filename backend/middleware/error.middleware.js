const { formatErrorResponse } = require('../utils/helpers');
const config = require('../config/config');

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const { statusCode, response } = formatErrorResponse(err, 400);
    return res.status(statusCode).json(response);
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const { statusCode, response } = formatErrorResponse(
      new Error('Duplicate key error'),
      409
    );
    return res.status(statusCode).json(response);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const { statusCode, response } = formatErrorResponse(
      new Error('Invalid token'),
      401
    );
    return res.status(statusCode).json(response);
  }

  if (err.name === 'TokenExpiredError') {
    const { statusCode, response } = formatErrorResponse(
      new Error('Token expired'),
      401
    );
    return res.status(statusCode).json(response);
  }

  // Handle custom application errors
  if (err.isCustomError) {
    const { statusCode, response } = formatErrorResponse(err, err.statusCode);
    return res.status(statusCode).json(response);
  }

  // Handle other errors
  const { statusCode, response } = formatErrorResponse(err);
  res.status(statusCode).json(response);
};

// Not found middleware
const notFoundHandler = (req, res, next) => {
  const { statusCode, response } = formatErrorResponse(
    new Error('Route not found'),
    404
  );
  res.status(statusCode).json(response);
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true
    });

    if (error) {
      const { statusCode, response } = formatErrorResponse(
        new Error(error.details.map(detail => detail.message).join(', ')),
        400
      );
      return res.status(statusCode).json(response);
    }

    next();
  };
};

// Rate limiting middleware
const rateLimiter = (windowMs, max) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    // Clean up old requests
    for (const [key, value] of requests.entries()) {
      if (now - value.timestamp > windowMs) {
        requests.delete(key);
      }
    }

    // Check if IP has exceeded limit
    const ipRequests = requests.get(ip);
    if (ipRequests && ipRequests.count >= max) {
      const { statusCode, response } = formatErrorResponse(
        new Error('Too many requests'),
        429
      );
      return res.status(statusCode).json(response);
    }

    // Update request count
    if (ipRequests) {
      ipRequests.count++;
      ipRequests.timestamp = now;
    } else {
      requests.set(ip, {
        count: 1,
        timestamp: now
      });
    }

    next();
  };
};

// Offline mode middleware
const offlineModeHandler = (req, res, next) => {
  if (!config.features.offlineMode) {
    return next();
  }

  const isOffline = !req.app.locals.isOnline;
  req.isOffline = isOffline;
  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validateRequest,
  rateLimiter,
  offlineModeHandler,
  requestLogger,
  securityHeaders
}; 
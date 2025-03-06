require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/train-booking',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },

  // Frontend Configuration
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // AI Model Configuration
  ai: {
    modelPath: process.env.AI_MODEL_PATH || './models/recommendation-model',
    trainingBatchSize: parseInt(process.env.AI_TRAINING_BATCH_SIZE) || 32,
    trainingEpochs: parseInt(process.env.AI_TRAINING_EPOCHS) || 100
  },

  // Offline Storage Configuration
  offlineStorage: {
    name: process.env.OFFLINE_STORAGE_NAME || 'trainBookingDB',
    version: parseInt(process.env.OFFLINE_STORAGE_VERSION) || 1
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log'
  },

  // Payment Gateway Configuration
  payment: {
    gatewayApiKey: process.env.PAYMENT_GATEWAY_API_KEY,
    gatewaySecret: process.env.PAYMENT_GATEWAY_SECRET
  },

  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    from: process.env.EMAIL_FROM || 'noreply@trainbooking.com'
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 3600,
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD) || 600
  },

  // Rate Limiting
  rateLimit: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW) || 15,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Feature Flags
  features: {
    offlineMode: true,
    aiRecommendations: true,
    realTimeUpdates: true,
    emailNotifications: process.env.SMTP_HOST ? true : false
  },

  // API Configuration
  api: {
    prefix: '/api',
    version: 'v1',
    timeout: 30000
  },

  // Security Configuration
  security: {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    helmet: {
      enabled: true,
      options: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://api.example.com']
          }
        }
      }
    }
  }
};

// Validate required configuration
const validateConfig = () => {
  const requiredFields = [
    'mongodb.uri',
    'jwt.secret',
    'payment.gatewayApiKey',
    'payment.gatewaySecret'
  ];

  const missingFields = requiredFields.filter(field => {
    const value = field.split('.').reduce((obj, key) => obj && obj[key], config);
    return !value;
  });

  if (missingFields.length > 0) {
    throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
  }
};

// Validate configuration on startup
validateConfig();

module.exports = config; 
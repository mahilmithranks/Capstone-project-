const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const offlineService = require('./offline.service');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = '24h';
    this.refreshTokenExpiresIn = '7d';
  }

  // Register a new user
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Save user to offline storage
      await offlineService.saveUser({
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences
      });

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferences: user.preferences
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Error in register:', error);
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferences: user.preferences
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  }

  // Generate access and refresh tokens
  generateTokens(user) {
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

    const refreshToken = jwt.sign(
      {
        id: user._id
      },
      this.jwtSecret,
      { expiresIn: this.refreshTokenExpiresIn }
    );

    return { accessToken, refreshToken };
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }

      const { accessToken } = this.generateTokens(user);
      return accessToken;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  // Update user preferences
  async updatePreferences(userId, preferences) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.preferences = {
        ...user.preferences,
        ...preferences
      };

      await user.save();

      // Update offline storage
      await offlineService.saveUser({
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences
      });

      // Add to sync queue
      await offlineService.addToSyncQueue({
        type: 'UPDATE_USER_PREFERENCES',
        data: {
          userId,
          preferences: user.preferences
        }
      });

      return user.preferences;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Logout user
  async logout(userId) {
    try {
      // Clear offline data for the user
      await offlineService.clearOfflineData();
      return true;
    } catch (error) {
      console.error('Error in logout:', error);
      throw error;
    }
  }

  // Middleware to verify authentication
  authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    try {
      const decoded = this.verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Invalid access token' });
    }
  }

  // Middleware to check admin role
  checkAdminRole(req, res, next) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  }
}

module.exports = new AuthService(); 
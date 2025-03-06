const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateRegistration = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number')
];

const validateLogin = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const validatePreferences = [
  body('preferredClass')
    .isIn(['First Class', 'Second Class', 'Third Class', 'Sleeper'])
    .withMessage('Invalid class preference'),
  body('preferredTime')
    .isIn(['Morning', 'Afternoon', 'Evening', 'Night', 'Any'])
    .withMessage('Invalid time preference'),
  body('preferredSeat')
    .isIn(['Window', 'Aisle', 'Any'])
    .withMessage('Invalid seat preference')
];

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Refresh access token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const accessToken = await authService.refreshAccessToken(refreshToken);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Update user preferences
router.put(
  '/preferences',
  authService.authenticateToken,
  validatePreferences,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const preferences = await authService.updatePreferences(
        req.user.id,
        req.body
      );
      res.json(preferences);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Change password
router.post(
  '/change-password',
  authService.authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await authService.changePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword
      );
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Logout user
router.post('/logout', authService.authenticateToken, async (req, res) => {
  try {
    await authService.logout(req.user.id);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', authService.authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
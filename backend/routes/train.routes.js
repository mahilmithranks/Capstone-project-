const express = require('express');
const router = express.Router();
const Train = require('../models/train.model');
const bookingService = require('../services/booking.service');
const authService = require('../services/auth.service');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateTrainSearch = [
  body('source').notEmpty().withMessage('Source station is required'),
  body('destination').notEmpty().withMessage('Destination station is required'),
  body('date').isISO8601().withMessage('Invalid date format')
];

const validateTrainCreation = [
  body('number').notEmpty().withMessage('Train number is required'),
  body('name').notEmpty().withMessage('Train name is required'),
  body('type').isIn(['Express', 'Superfast', 'Local', 'Metro']).withMessage('Invalid train type'),
  body('source.name').notEmpty().withMessage('Source station name is required'),
  body('source.code').notEmpty().withMessage('Source station code is required'),
  body('destination.name').notEmpty().withMessage('Destination station name is required'),
  body('destination.code').notEmpty().withMessage('Destination station code is required'),
  body('schedule').isArray().withMessage('Schedule must be an array'),
  body('classes').isArray().withMessage('Classes must be an array'),
  body('fare').isObject().withMessage('Fare must be an object')
];

// Search trains
router.post('/search', validateTrainSearch, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const trains = await bookingService.searchTrains(
      req.body.source,
      req.body.destination,
      req.body.date
    );

    res.json(trains);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all trains (admin only)
router.get('/', authService.authenticateToken, authService.checkAdminRole, async (req, res) => {
  try {
    const trains = await Train.find();
    res.json(trains);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get train by ID
router.get('/:id', async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }
    res.json(train);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new train (admin only)
router.post('/', authService.authenticateToken, authService.checkAdminRole, validateTrainCreation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const train = new Train(req.body);
    await train.save();
    res.status(201).json(train);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update train (admin only)
router.put('/:id', authService.authenticateToken, authService.checkAdminRole, async (req, res) => {
  try {
    const train = await Train.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    res.json(train);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete train (admin only)
router.delete('/:id', authService.authenticateToken, authService.checkAdminRole, async (req, res) => {
  try {
    const train = await Train.findByIdAndDelete(req.params.id);

    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    res.json({ message: 'Train deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get train schedule
router.get('/:id/schedule', async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    res.json(train.schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available seats
router.get('/:id/seats', async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    const { class: trainClass } = req.query;
    if (!trainClass) {
      return res.status(400).json({ message: 'Class is required' });
    }

    const availableSeats = train.getAvailableSeatsByClass(trainClass);
    res.json(availableSeats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update train status (admin only)
router.patch('/:id/status', authService.authenticateToken, authService.checkAdminRole, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Inactive', 'Delayed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const train = await Train.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    res.json(train);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get train statistics (admin only)
router.get('/stats/overview', authService.authenticateToken, authService.checkAdminRole, async (req, res) => {
  try {
    const stats = await Train.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
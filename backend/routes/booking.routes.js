const express = require('express');
const router = express.Router();
const bookingService = require('../services/booking.service');
const authService = require('../services/auth.service');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateBooking = [
  body('trainId').notEmpty().withMessage('Train ID is required'),
  body('journeyDate').isISO8601().withMessage('Invalid journey date'),
  body('passengers').isArray().withMessage('Passengers must be an array'),
  body('passengers.*.name').notEmpty().withMessage('Passenger name is required'),
  body('passengers.*.age').isInt({ min: 1, max: 120 }).withMessage('Invalid age'),
  body('passengers.*.gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('passengers.*.seatNumber').notEmpty().withMessage('Seat number is required'),
  body('passengers.*.seatClass').isIn(['First Class', 'Second Class', 'Third Class', 'Sleeper']).withMessage('Invalid seat class'),
  body('paymentMethod').isIn(['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash']).withMessage('Invalid payment method')
];

const validatePayment = [
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
  body('paymentStatus').isIn(['Completed', 'Failed']).withMessage('Invalid payment status')
];

// Create new booking
router.post('/', authService.authenticateToken, validateBooking, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await bookingService.createBooking(req.user.id, req.body);
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's bookings
router.get('/my-bookings', authService.authenticateToken, async (req, res) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user.id);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking details
router.get('/:id', authService.authenticateToken, async (req, res) => {
  try {
    const booking = await bookingService.getBookingDetails(req.params.id);
    
    // Check if user is authorized to view this booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking
router.post('/:id/cancel', authService.authenticateToken, async (req, res) => {
  try {
    const booking = await bookingService.getBookingDetails(req.params.id);
    
    // Check if user is authorized to cancel this booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to cancel this booking' });
    }

    const cancelledBooking = await bookingService.cancelBooking(
      req.user.id,
      req.params.id,
      req.body.reason
    );
    res.json(cancelledBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Process payment
router.post('/:id/payment', authService.authenticateToken, validatePayment, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await bookingService.processPayment(req.params.id, req.body);
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get booking statistics (admin only)
router.get('/stats/overview', authService.authenticateToken, authService.checkAdminRole, async (req, res) => {
  try {
    const stats = await bookingService.getBookingStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get offline bookings (admin only)
router.get('/offline/pending', authService.authenticateToken, authService.checkAdminRole, async (req, res) => {
  try {
    const offlineBookings = await Booking.findPendingOfflineBookings();
    res.json(offlineBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sync offline bookings (admin only)
router.post('/offline/sync', authService.authenticateToken, authService.checkAdminRole, async (req, res) => {
  try {
    const result = await offlineService.syncData();
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking history
router.get('/history/:userId', authService.authenticateToken, authService.checkAdminRole, async (req, res) => {
  try {
    const bookings = await Booking.findByUser(req.params.userId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking status (admin only)
router.patch('/:id/status', authService.authenticateToken, authService.checkAdminRole, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await bookingService.updateBookingStatus(req.params.id, status);
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 
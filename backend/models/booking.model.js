const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  seatNumber: {
    type: String,
    required: true
  },
  seatClass: {
    type: String,
    enum: ['First Class', 'Second Class', 'Third Class', 'Sleeper'],
    required: true
  }
});

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  transactionId: String,
  paymentDate: Date
});

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  train: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Train',
    required: true
  },
  journeyDate: {
    type: Date,
    required: true
  },
  passengers: [passengerSchema],
  source: {
    name: String,
    code: String,
    departureTime: String
  },
  destination: {
    name: String,
    code: String,
    arrivalTime: String
  },
  totalFare: {
    type: Number,
    required: true
  },
  payment: paymentSchema,
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  bookingReference: {
    type: String,
    unique: true,
    required: true
  },
  isOfflineBooking: {
    type: Boolean,
    default: false
  },
  offlineSyncStatus: {
    type: String,
    enum: ['Pending', 'Synced', 'Failed'],
    default: 'Pending'
  },
  cancellationReason: String,
  cancellationDate: Date,
  refundAmount: Number,
  specialRequests: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate unique booking reference
bookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.bookingReference = `TR${year}${month}${random}`;
  }
  next();
});

// Method to calculate refund amount
bookingSchema.methods.calculateRefund = function() {
  const cancellationDate = new Date();
  const journeyDate = new Date(this.journeyDate);
  const daysUntilJourney = Math.floor((journeyDate - cancellationDate) / (1000 * 60 * 60 * 24));
  
  let refundPercentage = 0;
  
  if (daysUntilJourney > 7) {
    refundPercentage = 0.75; // 75% refund
  } else if (daysUntilJourney > 3) {
    refundPercentage = 0.50; // 50% refund
  } else if (daysUntilJourney > 1) {
    refundPercentage = 0.25; // 25% refund
  }
  
  this.refundAmount = this.totalFare * refundPercentage;
  return this.refundAmount;
};

// Method to cancel booking
bookingSchema.methods.cancelBooking = async function(reason) {
  this.status = 'Cancelled';
  this.cancellationReason = reason;
  this.cancellationDate = new Date();
  this.calculateRefund();
  await this.save();
};

// Method to update offline sync status
bookingSchema.methods.updateOfflineSyncStatus = async function(status) {
  this.offlineSyncStatus = status;
  this.lastUpdated = new Date();
  await this.save();
};

// Static method to find bookings by user
bookingSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId })
    .populate('train')
    .sort({ journeyDate: 1 });
};

// Static method to find pending offline bookings
bookingSchema.statics.findPendingOfflineBookings = function() {
  return this.find({
    isOfflineBooking: true,
    offlineSyncStatus: 'Pending'
  });
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 
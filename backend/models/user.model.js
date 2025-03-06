const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  phone: {
    type: String,
    trim: true
  },
  preferences: {
    preferredClass: {
      type: String,
      enum: ['First Class', 'Second Class', 'Third Class', 'Sleeper'],
      default: 'Second Class'
    },
    preferredSeat: {
      type: String,
      enum: ['Window', 'Aisle', 'Any'],
      default: 'Any'
    },
    preferredTime: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night', 'Any'],
      default: 'Any'
    }
  },
  bookingHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  offlineData: {
    lastSync: Date,
    pendingBookings: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }]
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to get user preferences for AI recommendations
userSchema.methods.getPreferencesForAI = function() {
  return {
    preferredClass: this.preferences.preferredClass,
    preferredSeat: this.preferences.preferredSeat,
    preferredTime: this.preferences.preferredTime,
    bookingHistory: this.bookingHistory
  };
};

// Method to update offline data
userSchema.methods.updateOfflineData = async function(bookingId) {
  this.offlineData.pendingBookings.push(bookingId);
  this.offlineData.lastSync = new Date();
  await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User; 
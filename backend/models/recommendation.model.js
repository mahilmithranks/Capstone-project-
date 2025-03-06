const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recommendedTrains: [{
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Train',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    reasons: [{
      type: String,
      enum: [
        'Matches preferred class',
        'Matches preferred time',
        'Matches preferred seat type',
        'Based on booking history',
        'Popular route',
        'Good price point',
        'Convenient schedule'
      ]
    }]
  }],
  preferences: {
    preferredClass: {
      type: String,
      enum: ['First Class', 'Second Class', 'Third Class', 'Sleeper'],
      required: true
    },
    preferredTime: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night', 'Any'],
      required: true
    },
    preferredSeat: {
      type: String,
      enum: ['Window', 'Aisle', 'Any'],
      required: true
    },
    priceRange: {
      min: Number,
      max: Number
    }
  },
  bookingHistory: [{
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Train'
    },
    date: Date,
    class: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to update recommendation score
recommendationSchema.methods.updateRecommendationScore = function(trainId, score, reasons) {
  const recommendation = this.recommendedTrains.find(r => r.train.toString() === trainId.toString());
  if (recommendation) {
    recommendation.score = score;
    recommendation.reasons = reasons;
  } else {
    this.recommendedTrains.push({
      train: trainId,
      score,
      reasons
    });
  }
  this.lastUpdated = new Date();
};

// Method to add booking to history
recommendationSchema.methods.addBookingToHistory = async function(trainId, bookingClass, rating) {
  this.bookingHistory.push({
    train: trainId,
    date: new Date(),
    class: bookingClass,
    rating
  });
  
  // Keep only last 10 bookings for analysis
  if (this.bookingHistory.length > 10) {
    this.bookingHistory.shift();
  }
  
  await this.save();
};

// Method to get top recommendations
recommendationSchema.methods.getTopRecommendations = function(limit = 5) {
  return this.recommendedTrains
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// Method to analyze booking patterns
recommendationSchema.methods.analyzeBookingPatterns = function() {
  const patterns = {
    preferredClasses: {},
    preferredTimes: {},
    averageRating: 0
  };
  
  this.bookingHistory.forEach(booking => {
    // Count preferred classes
    patterns.preferredClasses[booking.class] = (patterns.preferredClasses[booking.class] || 0) + 1;
    
    // Calculate average rating
    patterns.averageRating += booking.rating;
  });
  
  patterns.averageRating = this.bookingHistory.length > 0 
    ? patterns.averageRating / this.bookingHistory.length 
    : 0;
  
  return patterns;
};

// Static method to find recommendations by user
recommendationSchema.statics.findByUser = function(userId) {
  return this.findOne({ user: userId })
    .populate('recommendedTrains.train')
    .populate('bookingHistory.train');
};

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation; 
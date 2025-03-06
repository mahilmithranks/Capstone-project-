const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true
  },
  class: {
    type: String,
    enum: ['First Class', 'Second Class', 'Third Class', 'Sleeper'],
    required: true
  },
  type: {
    type: String,
    enum: ['Window', 'Aisle', 'Middle'],
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
});

const scheduleSchema = new mongoose.Schema({
  station: {
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    }
  },
  arrivalTime: {
    type: String,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  distance: {
    type: Number,
    required: true
  }
});

const trainSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Express', 'Superfast', 'Local', 'Metro'],
    required: true
  },
  source: {
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    }
  },
  destination: {
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    }
  },
  schedule: [scheduleSchema],
  seats: [seatSchema],
  classes: [{
    type: String,
    enum: ['First Class', 'Second Class', 'Third Class', 'Sleeper'],
    required: true
  }],
  amenities: [{
    type: String,
    enum: ['WiFi', 'AC', 'Food Service', 'Power Outlets', 'Entertainment']
  }],
  fare: {
    'First Class': Number,
    'Second Class': Number,
    'Third Class': Number,
    'Sleeper': Number
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Delayed', 'Cancelled'],
    default: 'Active'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to check seat availability
trainSchema.methods.checkSeatAvailability = function(seatNumber) {
  const seat = this.seats.find(s => s.number === seatNumber);
  return seat ? seat.isAvailable : false;
};

// Method to update seat status
trainSchema.methods.updateSeatStatus = async function(seatNumber, isAvailable) {
  const seat = this.seats.find(s => s.number === seatNumber);
  if (seat) {
    seat.isAvailable = isAvailable;
    this.lastUpdated = new Date();
    await this.save();
    return true;
  }
  return false;
};

// Method to get available seats by class
trainSchema.methods.getAvailableSeatsByClass = function(trainClass) {
  return this.seats.filter(seat => 
    seat.class === trainClass && seat.isAvailable
  );
};

// Method to calculate fare
trainSchema.methods.calculateFare = function(trainClass, distance) {
  const baseFare = this.fare[trainClass] || 0;
  const distanceRate = 0.5; // Rate per kilometer
  return baseFare + (distance * distanceRate);
};

// Static method to search trains
trainSchema.statics.searchTrains = function(source, destination, date) {
  return this.find({
    'source.code': source,
    'destination.code': destination,
    status: 'Active'
  });
};

const Train = mongoose.model('Train', trainSchema);

module.exports = Train; 
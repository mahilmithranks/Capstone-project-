const mongoose = require('mongoose');
const config = require('../config/config');
const Train = require('../models/train.model');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// Sample train data
const sampleTrains = [
  {
    number: 'TR001',
    name: 'Express One',
    type: 'Express',
    source: {
      name: 'New York',
      code: 'NYC'
    },
    destination: {
      name: 'Boston',
      code: 'BOS'
    },
    schedule: [
      {
        station: {
          name: 'New York',
          code: 'NYC'
        },
        arrivalTime: '08:00',
        departureTime: '08:30',
        distance: 0
      },
      {
        station: {
          name: 'Boston',
          code: 'BOS'
        },
        arrivalTime: '12:00',
        departureTime: '12:00',
        distance: 215
      }
    ],
    seats: generateSeats(),
    classes: ['First Class', 'Second Class', 'Third Class'],
    amenities: ['WiFi', 'AC', 'Food Service', 'Power Outlets'],
    fare: {
      'First Class': 150,
      'Second Class': 100,
      'Third Class': 75
    },
    status: 'Active'
  },
  {
    number: 'TR002',
    name: 'Superfast Two',
    type: 'Superfast',
    source: {
      name: 'Boston',
      code: 'BOS'
    },
    destination: {
      name: 'Washington DC',
      code: 'WDC'
    },
    schedule: [
      {
        station: {
          name: 'Boston',
          code: 'BOS'
        },
        arrivalTime: '09:00',
        departureTime: '09:30',
        distance: 0
      },
      {
        station: {
          name: 'Washington DC',
          code: 'WDC'
        },
        arrivalTime: '14:00',
        departureTime: '14:00',
        distance: 450
      }
    ],
    seats: generateSeats(),
    classes: ['First Class', 'Second Class'],
    amenities: ['WiFi', 'AC', 'Food Service', 'Power Outlets', 'Entertainment'],
    fare: {
      'First Class': 200,
      'Second Class': 150
    },
    status: 'Active'
  }
];

// Sample user data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '+1234567890',
    preferences: {
      preferredClass: 'First Class',
      preferredSeat: 'Window',
      preferredTime: 'Morning'
    },
    role: 'user'
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    phone: '+1987654321',
    preferences: {
      preferredClass: 'Second Class',
      preferredSeat: 'Aisle',
      preferredTime: 'Any'
    },
    role: 'admin'
  }
];

// Generate sample seats
function generateSeats() {
  const seats = [];
  const classes = ['First Class', 'Second Class', 'Third Class'];
  const seatTypes = ['Window', 'Aisle', 'Middle'];

  classes.forEach(trainClass => {
    const seatCount = trainClass === 'First Class' ? 20 :
                     trainClass === 'Second Class' ? 40 : 60;

    for (let i = 1; i <= seatCount; i++) {
      seats.push({
        number: `${trainClass[0]}${i.toString().padStart(2, '0')}`,
        class: trainClass,
        type: seatTypes[i % 3],
        isAvailable: true
      });
    }
  });

  return seats;
}

// Seed database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Train.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Insert sample trains
    const trains = await Train.insertMany(sampleTrains);
    console.log('Inserted sample trains');

    // Hash passwords and insert sample users
    const hashedUsers = await Promise.all(
      sampleUsers.map(async user => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    const users = await User.insertMany(hashedUsers);
    console.log('Inserted sample users');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed script
seedDatabase(); 
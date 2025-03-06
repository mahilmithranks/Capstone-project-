// AI-powered seat allocation logic
const tf = require('@tensorflow/tfjs-node');

function allocateSeats(passengers, availableSeats) {
  // Example: Simple seat allocation based on passenger count
  return passengers.slice(0, availableSeats.length);
}

module.exports = { allocateSeats };

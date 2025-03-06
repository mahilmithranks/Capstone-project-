const tf = require('@tensorflow/tfjs-node');
const User = require('../models/user.model');
const Train = require('../models/train.model');
const Recommendation = require('../models/recommendation.model');

class AIService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
  }

  // Initialize the recommendation model
  async initializeModel() {
    try {
      // Create a simple neural network for recommendations
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [10], units: 16, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      // Compile the model
      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      this.isModelLoaded = true;
      console.log('AI model initialized successfully');
    } catch (error) {
      console.error('Error initializing AI model:', error);
      throw error;
    }
  }

  // Generate features from user preferences and booking history
  generateFeatures(userPreferences, bookingHistory) {
    const features = new Array(10).fill(0);
    
    // Encode preferred class
    const classEncoding = {
      'First Class': 1,
      'Second Class': 0.75,
      'Third Class': 0.5,
      'Sleeper': 0.25
    };
    features[0] = classEncoding[userPreferences.preferredClass] || 0;

    // Encode preferred time
    const timeEncoding = {
      'Morning': 1,
      'Afternoon': 0.75,
      'Evening': 0.5,
      'Night': 0.25,
      'Any': 0.5
    };
    features[1] = timeEncoding[userPreferences.preferredTime] || 0;

    // Encode preferred seat
    const seatEncoding = {
      'Window': 1,
      'Aisle': 0.5,
      'Any': 0.75
    };
    features[2] = seatEncoding[userPreferences.preferredSeat] || 0;

    // Add booking history features
    if (bookingHistory && bookingHistory.length > 0) {
      const recentBookings = bookingHistory.slice(-5);
      features[3] = recentBookings.reduce((acc, booking) => acc + booking.rating, 0) / recentBookings.length;
      
      // Add class preference from history
      const classCounts = {};
      recentBookings.forEach(booking => {
        classCounts[booking.class] = (classCounts[booking.class] || 0) + 1;
      });
      const mostFrequentClass = Object.entries(classCounts)
        .sort(([,a], [,b]) => b - a)[0];
      if (mostFrequentClass) {
        features[4] = classEncoding[mostFrequentClass[0]] || 0;
      }
    }

    return features;
  }

  // Generate recommendations for a user
  async generateRecommendations(userId, limit = 5) {
    try {
      if (!this.isModelLoaded) {
        await this.initializeModel();
      }

      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's booking history
      const bookingHistory = await Recommendation.findByUser(userId);
      const history = bookingHistory ? bookingHistory.bookingHistory : [];

      // Get all active trains
      const trains = await Train.find({ status: 'Active' });

      // Generate recommendations
      const recommendations = [];
      for (const train of trains) {
        const features = this.generateFeatures(user.preferences, history);
        const tensor = tf.tensor2d([features]);
        
        // Get prediction score
        const prediction = await this.model.predict(tensor).data();
        const score = prediction[0];

        // Generate reasons for recommendation
        const reasons = this.generateRecommendationReasons(user.preferences, train, score);

        recommendations.push({
          train: train._id,
          score,
          reasons
        });
      }

      // Sort by score and get top recommendations
      const topRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // Update user's recommendations
      await this.updateUserRecommendations(userId, topRecommendations);

      return topRecommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  // Generate reasons for recommendation
  generateRecommendationReasons(userPreferences, train, score) {
    const reasons = [];

    // Check class preference
    if (train.classes.includes(userPreferences.preferredClass)) {
      reasons.push('Matches preferred class');
    }

    // Check time preference
    const departureTime = new Date(train.schedule[0].departureTime);
    const hour = departureTime.getHours();
    const timeOfDay = hour < 12 ? 'Morning' : 
                      hour < 17 ? 'Afternoon' : 
                      hour < 21 ? 'Evening' : 'Night';
    
    if (userPreferences.preferredTime === 'Any' || 
        userPreferences.preferredTime === timeOfDay) {
      reasons.push('Matches preferred time');
    }

    // Check seat preference
    const availableSeats = train.getAvailableSeatsByClass(userPreferences.preferredClass);
    const hasPreferredSeat = availableSeats.some(seat => 
      userPreferences.preferredSeat === 'Any' || 
      seat.type === userPreferences.preferredSeat
    );
    
    if (hasPreferredSeat) {
      reasons.push('Matches preferred seat type');
    }

    // Add price-based reason if applicable
    if (train.fare[userPreferences.preferredClass] <= userPreferences.priceRange?.max) {
      reasons.push('Good price point');
    }

    return reasons;
  }

  // Update user's recommendations in the database
  async updateUserRecommendations(userId, recommendations) {
    try {
      let userRecommendations = await Recommendation.findOne({ user: userId });
      
      if (!userRecommendations) {
        userRecommendations = new Recommendation({
          user: userId,
          recommendedTrains: recommendations
        });
      } else {
        userRecommendations.recommendedTrains = recommendations;
      }

      await userRecommendations.save();
    } catch (error) {
      console.error('Error updating user recommendations:', error);
      throw error;
    }
  }

  // Train the model with user feedback
  async trainModel(userId, trainId, rating) {
    try {
      if (!this.isModelLoaded) {
        await this.initializeModel();
      }

      const user = await User.findById(userId);
      const bookingHistory = await Recommendation.findByUser(userId);
      const history = bookingHistory ? bookingHistory.bookingHistory : [];

      // Generate features
      const features = this.generateFeatures(user.preferences, history);
      const tensor = tf.tensor2d([features]);

      // Create label (normalize rating to 0-1)
      const label = tf.tensor2d([[rating / 5]]);

      // Train the model
      await this.model.fit(tensor, label, {
        epochs: 1,
        verbose: 0
      });

      // Clean up tensors
      tensor.dispose();
      label.dispose();
    } catch (error) {
      console.error('Error training model:', error);
      throw error;
    }
  }
}

module.exports = new AIService(); 
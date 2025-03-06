const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');
const authService = require('../services/auth.service');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateRating = [
  body('trainId').notEmpty().withMessage('Train ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
];

// Get personalized recommendations
router.get('/personalized', authService.authenticateToken, async (req, res) => {
  try {
    const recommendations = await aiService.generateRecommendations(req.user.id);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rate a train
router.post('/rate', authService.authenticateToken, validateRating, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await aiService.trainModel(req.user.id, req.body.trainId, req.body.rating);
    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get popular routes
router.get('/popular-routes', async (req, res) => {
  try {
    const popularRoutes = await Train.aggregate([
      {
        $group: {
          _id: {
            source: '$source.code',
            destination: '$destination.code'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(popularRoutes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recommended trains by class
router.get('/by-class/:class', authService.authenticateToken, async (req, res) => {
  try {
    const recommendations = await aiService.generateRecommendations(req.user.id);
    const filteredRecommendations = recommendations.filter(
      rec => rec.train.classes.includes(req.params.class)
    );
    res.json(filteredRecommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recommended trains by time
router.get('/by-time/:time', authService.authenticateToken, async (req, res) => {
  try {
    const recommendations = await aiService.generateRecommendations(req.user.id);
    const filteredRecommendations = recommendations.filter(rec => {
      const departureTime = new Date(rec.train.schedule[0].departureTime);
      const hour = departureTime.getHours();
      const timeOfDay = hour < 12 ? 'Morning' : 
                        hour < 17 ? 'Afternoon' : 
                        hour < 21 ? 'Evening' : 'Night';
      return timeOfDay === req.params.time;
    });
    res.json(filteredRecommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's booking patterns
router.get('/patterns', authService.authenticateToken, async (req, res) => {
  try {
    const userRecommendations = await Recommendation.findByUser(req.user.id);
    if (!userRecommendations) {
      return res.json({
        preferredClasses: {},
        preferredTimes: {},
        averageRating: 0
      });
    }

    const patterns = userRecommendations.analyzeBookingPatterns();
    res.json(patterns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get similar trains
router.get('/similar/:trainId', async (req, res) => {
  try {
    const train = await Train.findById(req.params.trainId);
    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    const similarTrains = await Train.find({
      'source.code': train.source.code,
      'destination.code': train.destination.code,
      _id: { $ne: train._id }
    }).limit(5);

    res.json(similarTrains);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seasonal recommendations
router.get('/seasonal', async (req, res) => {
  try {
    const currentMonth = new Date().getMonth();
    const season = currentMonth >= 2 && currentMonth <= 4 ? 'Spring' :
                   currentMonth >= 5 && currentMonth <= 7 ? 'Summer' :
                   currentMonth >= 8 && currentMonth <= 10 ? 'Fall' : 'Winter';

    const seasonalTrains = await Train.find({
      'amenities': {
        $in: season === 'Summer' ? ['AC'] :
             season === 'Winter' ? ['Heating'] : []
      }
    }).limit(10);

    res.json({
      season,
      trains: seasonalTrains
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get price-based recommendations
router.get('/price-range', authService.authenticateToken, async (req, res) => {
  try {
    const { min, max } = req.query;
    if (!min || !max) {
      return res.status(400).json({ message: 'Price range is required' });
    }

    const recommendations = await aiService.generateRecommendations(req.user.id);
    const filteredRecommendations = recommendations.filter(rec => {
      const fare = rec.train.fare[rec.train.classes[0]];
      return fare >= min && fare <= max;
    });

    res.json(filteredRecommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
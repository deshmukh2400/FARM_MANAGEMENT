const express = require('express');
const { query, validationResult } = require('express-validator');
const { WeatherData, WeatherRecommendation, FarmAlert } = require('../models/Weather');
const weatherService = require('../services/weatherService');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/weather/current
// @desc    Get current weather for user's location
// @access  Private
router.get('/current', protect, [
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { latitude, longitude } = req.query;

    // Check if we have recent weather data (within last 30 minutes)
    const recentData = await WeatherData.findOne({
      'location.latitude': { $gte: latitude - 0.01, $lte: latitude + 0.01 },
      'location.longitude': { $gte: longitude - 0.01, $lte: longitude + 0.01 },
      lastUpdated: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
    }).sort({ lastUpdated: -1 });

    let weatherData;

    if (recentData) {
      weatherData = recentData;
    } else {
      // Fetch fresh weather data
      const freshData = await weatherService.fetchWeatherData(parseFloat(latitude), parseFloat(longitude));
      
      // Save to database
      weatherData = await WeatherData.create(freshData);
      
      // Generate recommendations
      const animalTypes = req.user.farmDetails?.animalTypes || ['all'];
      await weatherService.generateRecommendations(req.user.id, freshData, animalTypes);
      
      // Create alerts if necessary
      await weatherService.createWeatherAlerts(req.user.id, freshData);
    }

    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    console.error('Get current weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting weather data'
    });
  }
});

// @route   GET /api/weather/forecast
// @desc    Get weather forecast
// @access  Private
router.get('/forecast', protect, [
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  query('days').optional().isInt({ min: 1, max: 7 }).withMessage('Days must be between 1 and 7')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { latitude, longitude, days = 5 } = req.query;

    // Get weather data (will fetch if not recent)
    const weatherData = await weatherService.fetchWeatherData(parseFloat(latitude), parseFloat(longitude));

    // Filter forecast to requested days
    const forecast = weatherData.forecast.slice(0, parseInt(days));

    res.json({
      success: true,
      data: {
        location: weatherData.location,
        forecast,
        lastUpdated: weatherData.lastUpdated
      }
    });
  } catch (error) {
    console.error('Get weather forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting weather forecast'
    });
  }
});

// @route   GET /api/weather/recommendations
// @desc    Get weather-based farming recommendations
// @access  Private
router.get('/recommendations', protect, async (req, res) => {
  try {
    const recommendations = await WeatherRecommendation.find({
      owner: req.user.id,
      isActive: true,
      validUntil: { $gte: new Date() }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get weather recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting weather recommendations'
    });
  }
});

// @route   GET /api/weather/alerts
// @desc    Get active weather alerts
// @access  Private
router.get('/alerts', protect, async (req, res) => {
  try {
    const alerts = await FarmAlert.find({
      owner: req.user.id,
      type: 'weather',
      status: { $in: ['active', 'acknowledged'] },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Get weather alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting weather alerts'
    });
  }
});

// @route   POST /api/weather/alerts/:id/acknowledge
// @desc    Acknowledge a weather alert
// @access  Private
router.post('/alerts/:id/acknowledge', protect, async (req, res) => {
  try {
    const alert = await FarmAlert.findOne({
      _id: req.params.id,
      owner: req.user.id,
      type: 'weather'
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Weather alert not found'
      });
    }

    alert.status = 'acknowledged';
    alert.acknowledgedBy = req.user.id;
    alert.acknowledgedAt = new Date();

    await alert.save();

    res.json({
      success: true,
      message: 'Weather alert acknowledged',
      data: alert
    });
  } catch (error) {
    console.error('Acknowledge weather alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error acknowledging weather alert'
    });
  }
});

// @route   GET /api/weather/historical
// @desc    Get historical weather data
// @access  Private
router.get('/historical', protect, [
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { latitude, longitude, startDate, endDate } = req.query;

    const historicalData = await WeatherData.find({
      'location.latitude': { $gte: latitude - 0.01, $lte: latitude + 0.01 },
      'location.longitude': { $gte: longitude - 0.01, $lte: longitude + 0.01 },
      lastUpdated: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ lastUpdated: 1 });

    // Process data for trends
    const trends = {
      temperature: historicalData.map(d => ({
        date: d.lastUpdated,
        value: d.current.temperature
      })),
      humidity: historicalData.map(d => ({
        date: d.lastUpdated,
        value: d.current.humidity
      })),
      precipitation: historicalData.map(d => ({
        date: d.lastUpdated,
        value: d.forecast[0]?.precipitation.amount || 0
      }))
    };

    res.json({
      success: true,
      data: {
        historical: historicalData,
        trends,
        period: {
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    console.error('Get historical weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting historical weather data'
    });
  }
});

// @route   GET /api/weather/impact-analysis
// @desc    Analyze weather impact on farm operations
// @access  Private
router.get('/impact-analysis', protect, [
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  query('days').optional().isInt({ min: 7, max: 30 }).withMessage('Days must be between 7 and 30')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { latitude, longitude, days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get weather data for analysis period
    const weatherData = await WeatherData.find({
      'location.latitude': { $gte: latitude - 0.01, $lte: latitude + 0.01 },
      'location.longitude': { $gte: longitude - 0.01, $lte: longitude + 0.01 },
      lastUpdated: { $gte: startDate }
    }).sort({ lastUpdated: 1 });

    if (weatherData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No weather data available for analysis'
      });
    }

    // Calculate impact metrics
    const analysis = {
      temperatureStress: {
        heatStressDays: weatherData.filter(d => d.current.temperature > 30).length,
        coldStressDays: weatherData.filter(d => d.current.temperature < 5).length,
        optimalDays: weatherData.filter(d => d.current.temperature >= 15 && d.current.temperature <= 25).length
      },
      precipitation: {
        totalRainfall: weatherData.reduce((sum, d) => sum + (d.forecast[0]?.precipitation.amount || 0), 0),
        rainDays: weatherData.filter(d => (d.forecast[0]?.precipitation.amount || 0) > 1).length,
        droughtRisk: weatherData.filter(d => (d.forecast[0]?.precipitation.amount || 0) === 0).length > (days * 0.7)
      },
      humidity: {
        averageHumidity: weatherData.reduce((sum, d) => sum + d.current.humidity, 0) / weatherData.length,
        highHumidityDays: weatherData.filter(d => d.current.humidity > 80).length,
        diseaseRiskDays: weatherData.filter(d => d.current.humidity > 75 && d.current.temperature > 20).length
      },
      wind: {
        averageWindSpeed: weatherData.reduce((sum, d) => sum + (d.current.windSpeed || 0), 0) / weatherData.length,
        strongWindDays: weatherData.filter(d => (d.current.windSpeed || 0) > 15).length
      },
      recommendations: []
    };

    // Generate impact-based recommendations
    if (analysis.temperatureStress.heatStressDays > days * 0.3) {
      analysis.recommendations.push({
        type: 'heat_management',
        priority: 'high',
        message: 'Consider installing additional shade structures and cooling systems'
      });
    }

    if (analysis.precipitation.droughtRisk) {
      analysis.recommendations.push({
        type: 'water_management',
        priority: 'high',
        message: 'Implement water conservation measures and backup water sources'
      });
    }

    if (analysis.humidity.diseaseRiskDays > days * 0.4) {
      analysis.recommendations.push({
        type: 'disease_prevention',
        priority: 'medium',
        message: 'Increase ventilation and monitor animals for respiratory issues'
      });
    }

    res.json({
      success: true,
      data: {
        analysis,
        period: {
          days,
          startDate,
          endDate: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Weather impact analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error analyzing weather impact'
    });
  }
});

module.exports = router; 
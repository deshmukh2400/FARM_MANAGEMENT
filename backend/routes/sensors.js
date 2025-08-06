const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { SensorData, FarmAlert } = require('../models/Weather');
const { protect, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/sensors
// @desc    Get all sensors for the authenticated user
// @access  Private
router.get('/', protect, [
  query('type').optional().isString(),
  query('status').optional().isIn(['active', 'inactive', 'maintenance', 'error']),
  query('location').optional().isString()
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

    const { type, status, location } = req.query;

    // Build query
    const query = { owner: req.user.id };
    if (type) query.sensorType = type;
    if (status) query.status = status;
    if (location) query['location.name'] = new RegExp(location, 'i');

    const sensors = await SensorData.find(query)
      .sort({ createdAt: -1 });

    // Add virtual fields and latest readings
    const sensorsWithDetails = sensors.map(sensor => {
      const sensorObj = sensor.toObject({ virtuals: true });
      return sensorObj;
    });

    res.json({
      success: true,
      data: sensorsWithDetails
    });
  } catch (error) {
    console.error('Get sensors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting sensors'
    });
  }
});

// @route   GET /api/sensors/:id
// @desc    Get single sensor with detailed readings
// @access  Private
router.get('/:id', protect, checkOwnership(SensorData), async (req, res) => {
  try {
    const sensor = await SensorData.findById(req.params.id);

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    res.json({
      success: true,
      data: sensor.toObject({ virtuals: true })
    });
  } catch (error) {
    console.error('Get sensor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting sensor'
    });
  }
});

// @route   POST /api/sensors
// @desc    Register new sensor
// @access  Private
router.post('/', protect, [
  body('sensorId').notEmpty().withMessage('Sensor ID is required'),
  body('sensorType').isIn(['temperature', 'humidity', 'air_quality', 'water_level', 'soil_moisture', 'light', 'motion', 'weight_scale', 'ph_sensor']),
  body('location.name').notEmpty().withMessage('Location name is required')
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

    // Check if sensor ID already exists
    const existingSensor = await SensorData.findOne({ sensorId: req.body.sensorId });
    if (existingSensor) {
      return res.status(400).json({
        success: false,
        message: 'Sensor with this ID already exists'
      });
    }

    const sensorData = {
      owner: req.user.id,
      ...req.body
    };

    const sensor = await SensorData.create(sensorData);

    res.status(201).json({
      success: true,
      message: 'Sensor registered successfully',
      data: sensor.toObject({ virtuals: true })
    });
  } catch (error) {
    console.error('Register sensor error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Sensor ID must be unique'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error registering sensor'
    });
  }
});

// @route   PUT /api/sensors/:id
// @desc    Update sensor configuration
// @access  Private
router.put('/:id', protect, checkOwnership(SensorData), [
  body('location.name').optional().notEmpty(),
  body('thresholds.min.value').optional().isNumeric(),
  body('thresholds.max.value').optional().isNumeric(),
  body('status').optional().isIn(['active', 'inactive', 'maintenance', 'error'])
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

    const sensor = await SensorData.findById(req.params.id);

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key.includes('.')) {
        // Handle nested fields
        const keys = key.split('.');
        let current = sensor;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = req.body[key];
      } else {
        sensor[key] = req.body[key];
      }
    });

    await sensor.save();

    res.json({
      success: true,
      message: 'Sensor updated successfully',
      data: sensor.toObject({ virtuals: true })
    });
  } catch (error) {
    console.error('Update sensor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating sensor'
    });
  }
});

// @route   POST /api/sensors/:id/readings
// @desc    Add new sensor reading
// @access  Private
router.post('/:id/readings', protect, checkOwnership(SensorData), [
  body('value').isNumeric().withMessage('Reading value must be numeric'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('quality').optional().isIn(['good', 'fair', 'poor'])
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

    const sensor = await SensorData.findById(req.params.id);

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    const { value, unit, quality = 'good' } = req.body;

    // Add reading and check thresholds
    const reading = await sensor.addReading(value, unit, quality);

    res.json({
      success: true,
      message: 'Reading added successfully',
      data: {
        reading,
        sensor: sensor.toObject({ virtuals: true })
      }
    });
  } catch (error) {
    console.error('Add sensor reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding sensor reading'
    });
  }
});

// @route   GET /api/sensors/:id/readings
// @desc    Get sensor readings with optional filtering
// @access  Private
router.get('/:id/readings', protect, checkOwnership(SensorData), [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 1000 })
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

    const { startDate, endDate, limit = 100 } = req.query;

    const sensor = await SensorData.findById(req.params.id);

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    let readings = sensor.readings;

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      readings = readings.filter(reading => 
        reading.timestamp >= start && reading.timestamp <= end
      );
    }

    // Sort by timestamp (newest first) and limit
    readings = readings
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        sensorId: sensor.sensorId,
        sensorType: sensor.sensorType,
        location: sensor.location,
        readings,
        total: readings.length
      }
    });
  } catch (error) {
    console.error('Get sensor readings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting sensor readings'
    });
  }
});

// @route   GET /api/sensors/dashboard
// @desc    Get sensor dashboard data
// @access  Private
router.get('/dashboard/overview', protect, async (req, res) => {
  try {
    const sensors = await SensorData.find({ owner: req.user.id });

    const dashboard = {
      totalSensors: sensors.length,
      activeSensors: sensors.filter(s => s.status === 'active').length,
      offlineSensors: sensors.filter(s => {
        const hoursSinceLastSeen = (new Date() - new Date(s.lastSeen)) / (1000 * 60 * 60);
        return hoursSinceLastSeen > 24;
      }).length,
      lowBatterySensors: sensors.filter(s => s.batteryLevel && s.batteryLevel < 20).length,
      sensorsByType: sensors.reduce((acc, sensor) => {
        acc[sensor.sensorType] = (acc[sensor.sensorType] || 0) + 1;
        return acc;
      }, {}),
      sensorsByLocation: sensors.reduce((acc, sensor) => {
        const location = sensor.location.name || 'Unknown';
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {}),
      recentAlerts: await FarmAlert.find({
        owner: req.user.id,
        type: 'sensor',
        status: 'active'
      }).sort({ createdAt: -1 }).limit(5),
      latestReadings: sensors.map(sensor => {
        const latestReading = sensor.latestReading;
        return {
          sensorId: sensor.sensorId,
          sensorType: sensor.sensorType,
          location: sensor.location.name,
          latestReading,
          healthStatus: sensor.healthStatus,
          batteryLevel: sensor.batteryLevel
        };
      }).filter(s => s.latestReading)
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Get sensor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting sensor dashboard'
    });
  }
});

// @route   POST /api/sensors/:id/calibrate
// @desc    Calibrate sensor
// @access  Private
router.post('/:id/calibrate', protect, checkOwnership(SensorData), [
  body('offset').optional().isNumeric(),
  body('multiplier').optional().isNumeric()
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

    const sensor = await SensorData.findById(req.params.id);

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    const { offset = 0, multiplier = 1 } = req.body;

    sensor.calibration.offset = offset;
    sensor.calibration.multiplier = multiplier;
    sensor.calibration.lastCalibrated = new Date();

    await sensor.save();

    res.json({
      success: true,
      message: 'Sensor calibrated successfully',
      data: sensor.toObject({ virtuals: true })
    });
  } catch (error) {
    console.error('Calibrate sensor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error calibrating sensor'
    });
  }
});

// @route   DELETE /api/sensors/:id
// @desc    Remove sensor
// @access  Private
router.delete('/:id', protect, checkOwnership(SensorData), async (req, res) => {
  try {
    const sensor = await SensorData.findById(req.params.id);

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    await sensor.remove();

    res.json({
      success: true,
      message: 'Sensor removed successfully'
    });
  } catch (error) {
    console.error('Remove sensor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing sensor'
    });
  }
});

// @route   GET /api/sensors/analytics/:id
// @desc    Get sensor analytics and trends
// @access  Private
router.get('/analytics/:id', protect, checkOwnership(SensorData), [
  query('period').optional().isIn(['24h', '7d', '30d', '90d'])
], async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    const sensor = await SensorData.findById(req.params.id);

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    // Filter readings by date range
    const readings = sensor.readings.filter(reading => 
      reading.timestamp >= startDate
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (readings.length === 0) {
      return res.json({
        success: true,
        data: {
          message: 'No readings available for the selected period',
          period,
          readingCount: 0
        }
      });
    }

    // Calculate analytics
    const values = readings.map(r => r.value);
    const analytics = {
      period,
      readingCount: readings.length,
      statistics: {
        min: Math.min(...values),
        max: Math.max(...values),
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)]
      },
      trends: {
        direction: readings.length > 1 ? 
          (readings[readings.length - 1].value > readings[0].value ? 'increasing' : 'decreasing') : 'stable',
        changePercent: readings.length > 1 ? 
          ((readings[readings.length - 1].value - readings[0].value) / readings[0].value * 100) : 0
      },
      thresholdViolations: {
        aboveMax: sensor.thresholds.max.value ? 
          readings.filter(r => r.value > sensor.thresholds.max.value).length : 0,
        belowMin: sensor.thresholds.min.value ? 
          readings.filter(r => r.value < sensor.thresholds.min.value).length : 0
      },
      dataQuality: {
        good: readings.filter(r => r.quality === 'good').length,
        fair: readings.filter(r => r.quality === 'fair').length,
        poor: readings.filter(r => r.quality === 'poor').length
      },
      chartData: readings.map(r => ({
        timestamp: r.timestamp,
        value: r.value,
        quality: r.quality
      }))
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get sensor analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting sensor analytics'
    });
  }
});

module.exports = router; 
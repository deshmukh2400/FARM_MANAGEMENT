const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { HealthAssessment, DiseasePrediction, BehavioralPattern, HealthRecommendation } = require('../models/AIHealthMonitoring');
const { protect, checkOwnership } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for health image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/health/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// HEALTH ASSESSMENT ROUTES

// @route   GET /api/health/assessments
// @desc    Get health assessments for user's animals
// @access  Private
router.get('/assessments', protect, [
  query('animal').optional().isMongoId(),
  query('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('status').optional().isIn(['pending', 'analyzed', 'reviewed', 'action_taken', 'resolved']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const { animal, riskLevel, status, page = 1, limit = 20 } = req.query;

    const query = { owner: req.user.id };
    if (animal) query.animal = animal;
    if (riskLevel) query['aiAnalysis.riskLevel'] = riskLevel;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [assessments, total] = await Promise.all([
      HealthAssessment.find(query)
        .populate('animal', 'basicInfo.name registrationNumber basicInfo.category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      HealthAssessment.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: assessments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get health assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting health assessments'
    });
  }
});

// @route   POST /api/health/assessments
// @desc    Create new health assessment
// @access  Private
router.post('/assessments', protect, upload.array('images', 5), [
  body('animal').isMongoId().withMessage('Valid animal ID is required'),
  body('assessmentType').isIn(['visual_inspection', 'behavioral_analysis', 'vital_signs', 'automated_detection', 'manual_entry']),
  body('method').optional().isIn(['computer_vision', 'sensor_data', 'manual_observation', 'wearable_device', 'smart_camera'])
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

    const assessmentData = {
      owner: req.user.id,
      ...req.body
    };

    // Process uploaded images
    if (req.files && req.files.length > 0) {
      assessmentData.images = req.files.map(file => ({
        url: `/uploads/health/${file.filename}`,
        filename: file.originalname,
        capturedAt: new Date()
      }));
    }

    // Parse JSON fields if they exist
    if (req.body.vitalSigns) {
      try {
        assessmentData.vitalSigns = JSON.parse(req.body.vitalSigns);
      } catch (e) {
        console.error('Error parsing vital signs:', e);
      }
    }

    if (req.body.behavioralMetrics) {
      try {
        assessmentData.behavioralMetrics = JSON.parse(req.body.behavioralMetrics);
      } catch (e) {
        console.error('Error parsing behavioral metrics:', e);
      }
    }

    if (req.body.environmentalFactors) {
      try {
        assessmentData.environmentalFactors = JSON.parse(req.body.environmentalFactors);
      } catch (e) {
        console.error('Error parsing environmental factors:', e);
      }
    }

    const assessment = await HealthAssessment.create(assessmentData);

    // Simulate AI analysis (in real implementation, this would call ML models)
    if (assessmentData.images && assessmentData.images.length > 0) {
      assessment.aiAnalysis = {
        overallHealthScore: Math.floor(Math.random() * 40) + 60, // 60-100
        riskLevel: 'low',
        detectedConditions: [],
        earlyWarnings: [],
        trends: { stable: true },
        modelVersion: '1.0.0',
        processingTime: 1500,
        lastUpdated: new Date()
      };
    }

    await assessment.save();

    // Check and trigger alerts
    await assessment.checkAndTriggerAlerts();

    await assessment.populate('animal', 'basicInfo.name registrationNumber basicInfo.category');

    res.status(201).json({
      success: true,
      message: 'Health assessment created successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Create health assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating health assessment'
    });
  }
});

// @route   GET /api/health/assessments/:id
// @desc    Get single health assessment
// @access  Private
router.get('/assessments/:id', protect, checkOwnership(HealthAssessment), async (req, res) => {
  try {
    const assessment = await HealthAssessment.findById(req.params.id)
      .populate('animal', 'basicInfo.name registrationNumber basicInfo.category')
      .populate('veterinaryReview.reviewedBy', 'name');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Health assessment not found'
      });
    }

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Get health assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting health assessment'
    });
  }
});

// @route   GET /api/health/trends/:animalId
// @desc    Get health trends for an animal
// @access  Private
router.get('/trends/:animalId', protect, [
  query('days').optional().isInt({ min: 7, max: 365 })
], async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Verify animal ownership
    const Animal = require('../models/Animal');
    const animal = await Animal.findOne({ _id: req.params.animalId, owner: req.user.id });
    
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }

    const trends = await HealthAssessment.getHealthTrends(req.params.animalId, parseInt(days));

    res.json({
      success: true,
      data: {
        animalId: req.params.animalId,
        animalName: animal.basicInfo.name,
        period: {
          days: parseInt(days),
          startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          endDate: new Date()
        },
        trends
      }
    });
  } catch (error) {
    console.error('Get health trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting health trends'
    });
  }
});

// DISEASE PREDICTION ROUTES

// @route   GET /api/health/predictions
// @desc    Get disease predictions for user's animals
// @access  Private
router.get('/predictions', protect, [
  query('animal').optional().isMongoId(),
  query('status').optional().isIn(['active', 'outdated', 'verified', 'false_positive'])
], async (req, res) => {
  try {
    const { animal, status } = req.query;

    const query = { owner: req.user.id };
    if (animal) query.animal = animal;
    if (status) query.status = status;

    const predictions = await DiseasePrediction.find(query)
      .populate('animal', 'basicInfo.name registrationNumber basicInfo.category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    console.error('Get disease predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting disease predictions'
    });
  }
});

// @route   POST /api/health/predictions
// @desc    Generate disease prediction for an animal
// @access  Private
router.post('/predictions', protect, [
  body('animal').isMongoId().withMessage('Valid animal ID is required')
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

    // Verify animal ownership
    const Animal = require('../models/Animal');
    const animal = await Animal.findOne({ _id: req.body.animal, owner: req.user.id });
    
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }

    // Get recent health assessments for this animal
    const recentAssessments = await HealthAssessment.find({
      owner: req.user.id,
      animal: req.body.animal,
      createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
    }).sort({ createdAt: -1 }).limit(10);

    // Simulate disease prediction (in real implementation, this would use ML models)
    const predictionData = {
      owner: req.user.id,
      animal: req.body.animal,
      predictionModel: {
        name: 'FarmAI Disease Predictor',
        version: '2.1.0',
        accuracy: 87.5,
        lastTrained: new Date('2024-01-01')
      },
      inputData: {
        historicalHealth: recentAssessments.map(a => a._id),
        environmentalData: {},
        geneticFactors: {},
        nutritionalData: {},
        vaccinationHistory: {}
      },
      predictions: [
        {
          disease: {
            name: 'Respiratory Infection',
            category: 'respiratory',
            icdCode: 'R06.9'
          },
          probability: 0.15,
          confidence: 0.78,
          timeframe: '1-4_weeks',
          riskFactors: [
            { factor: 'High humidity environment', weight: 0.6, modifiable: true },
            { factor: 'Seasonal pattern', weight: 0.3, modifiable: false }
          ],
          preventionMeasures: [
            {
              action: 'Improve ventilation in housing',
              priority: 'high',
              effectiveness: 0.8,
              cost: 'medium'
            }
          ],
          earlyWarningSignsToWatch: ['Coughing', 'Nasal discharge', 'Reduced appetite']
        }
      ],
      recommendations: {
        immediate: ['Monitor respiratory signs closely'],
        shortTerm: ['Improve housing ventilation', 'Consider preventive treatment'],
        longTerm: ['Regular health checks', 'Environmental monitoring'],
        veterinaryConsultation: {
          recommended: false,
          urgency: 'routine',
          reasons: ['Routine health monitoring']
        }
      },
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
      accuracy: 0.875
    };

    const prediction = await DiseasePrediction.create(predictionData);

    await prediction.populate('animal', 'basicInfo.name registrationNumber basicInfo.category');

    res.status(201).json({
      success: true,
      message: 'Disease prediction generated successfully',
      data: prediction
    });
  } catch (error) {
    console.error('Generate disease prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating disease prediction'
    });
  }
});

// HEALTH RECOMMENDATIONS ROUTES

// @route   GET /api/health/recommendations
// @desc    Get health recommendations
// @access  Private
router.get('/recommendations', protect, [
  query('animal').optional().isMongoId(),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent', 'emergency']),
  query('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled', 'expired'])
], async (req, res) => {
  try {
    const { animal, priority, status } = req.query;

    const query = { owner: req.user.id };
    if (animal) query.animal = animal;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    const recommendations = await HealthRecommendation.find(query)
      .populate('animal', 'basicInfo.name registrationNumber basicInfo.category')
      .sort({ priority: 1, createdAt: -1 }); // Sort by priority first, then date

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get health recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting health recommendations'
    });
  }
});

// @route   POST /api/health/recommendations
// @desc    Create health recommendation
// @access  Private
router.post('/recommendations', protect, [
  body('recommendationType').isIn(['preventive', 'treatment', 'nutrition', 'housing', 'breeding', 'emergency']),
  body('priority').isIn(['low', 'medium', 'high', 'urgent', 'emergency']),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString()
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

    const recommendationData = {
      owner: req.user.id,
      ...req.body
    };

    const recommendation = await HealthRecommendation.create(recommendationData);

    if (recommendation.animal) {
      await recommendation.populate('animal', 'basicInfo.name registrationNumber basicInfo.category');
    }

    res.status(201).json({
      success: true,
      message: 'Health recommendation created successfully',
      data: recommendation
    });
  } catch (error) {
    console.error('Create health recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating health recommendation'
    });
  }
});

// @route   PUT /api/health/recommendations/:id/status
// @desc    Update recommendation status
// @access  Private
router.put('/recommendations/:id/status', protect, checkOwnership(HealthRecommendation), [
  body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled', 'expired']),
  body('notes').optional().isString()
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

    const recommendation = await HealthRecommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Health recommendation not found'
      });
    }

    recommendation.status = req.body.status;
    
    if (req.body.status === 'in_progress' && !recommendation.implementation.started) {
      recommendation.implementation.started = true;
      recommendation.implementation.startDate = new Date();
    }

    if (req.body.notes) {
      if (!recommendation.implementation.modifications) {
        recommendation.implementation.modifications = [];
      }
      recommendation.implementation.modifications.push(req.body.notes);
    }

    await recommendation.save();

    res.json({
      success: true,
      message: 'Recommendation status updated successfully',
      data: recommendation
    });
  } catch (error) {
    console.error('Update recommendation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating recommendation status'
    });
  }
});

// @route   GET /api/health/dashboard
// @desc    Get health dashboard data
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const [
      totalAssessments,
      highRiskAnimals,
      pendingRecommendations,
      recentAlerts,
      activePredictions
    ] = await Promise.all([
      HealthAssessment.countDocuments({ owner: req.user.id }),
      HealthAssessment.countDocuments({ 
        owner: req.user.id, 
        'aiAnalysis.riskLevel': { $in: ['high', 'critical'] },
        status: { $ne: 'resolved' }
      }),
      HealthRecommendation.countDocuments({ 
        owner: req.user.id, 
        status: { $in: ['pending', 'in_progress'] }
      }),
      HealthAssessment.find({ 
        owner: req.user.id,
        'alerts.triggered': true,
        'alerts.acknowledged': false
      })
      .populate('animal', 'basicInfo.name registrationNumber')
      .sort({ createdAt: -1 })
      .limit(5),
      DiseasePrediction.countDocuments({
        owner: req.user.id,
        status: 'active',
        validUntil: { $gte: new Date() }
      })
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalAssessments,
          highRiskAnimals,
          pendingRecommendations,
          activePredictions
        },
        recentAlerts: recentAlerts.map(assessment => ({
          id: assessment._id,
          animalName: assessment.animal.basicInfo.name,
          animalId: assessment.animal._id,
          alerts: assessment.alerts.filter(alert => alert.triggered && !alert.acknowledged),
          createdAt: assessment.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get health dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting health dashboard'
    });
  }
});

module.exports = router; 
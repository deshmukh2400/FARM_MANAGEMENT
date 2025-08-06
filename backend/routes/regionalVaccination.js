const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { RegionalVaccination, VaccinationRecord, VaccinationAlert } = require('../models/RegionalVaccination');
const vaccinationService = require('../services/vaccinationService');
const regionalizationService = require('../services/regionalizationService');
const { protect, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/vaccination/regional-schedule
// @desc    Get vaccination schedule for user's region and animal type
// @access  Private
router.get('/regional-schedule', protect, [
  query('animalType').notEmpty().withMessage('Animal type is required'),
  query('region').optional().isString(),
  query('country').optional().isString()
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

    const { animalType, region: queryRegion, country: queryCountry } = req.query;

    // Detect user's region if not provided
    const region = queryRegion || await regionalizationService.detectUserRegion(req);
    const country = queryCountry || await getUserCountry(req.user.id);

    const schedule = await vaccinationService.getRegionalVaccinationSchedule(
      region,
      country,
      animalType
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: `No vaccination schedule found for ${animalType} in ${region}/${country}`
      });
    }

    res.json({
      success: true,
      data: {
        schedule,
        region,
        country,
        animalType
      }
    });
  } catch (error) {
    console.error('Get regional vaccination schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting vaccination schedule'
    });
  }
});

// @route   POST /api/vaccination/generate-schedule
// @desc    Generate vaccination schedule for a new animal
// @access  Private
router.post('/generate-schedule', protect, [
  body('animalId').isMongoId().withMessage('Valid animal ID is required')
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

    const { animalId } = req.body;

    const scheduledVaccinations = await vaccinationService.generateAnimalVaccinationSchedule(
      animalId,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: 'Vaccination schedule generated successfully',
      data: {
        scheduledVaccinations,
        totalScheduled: scheduledVaccinations.length
      }
    });
  } catch (error) {
    console.error('Generate vaccination schedule error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error generating vaccination schedule'
    });
  }
});

// @route   GET /api/vaccination/schedule/:animalId
// @desc    Get vaccination schedule for specific animal
// @access  Private
router.get('/schedule/:animalId', protect, async (req, res) => {
  try {
    const { animalId } = req.params;
    const { status, upcoming } = req.query;

    let query = {
      animal: animalId,
      owner: req.user.id
    };

    if (status) {
      query.status = status;
    }

    let vaccinations = await VaccinationRecord.find(query)
      .populate('animal', 'basicInfo.name basicInfo.type registrationNumber')
      .sort({ scheduledDate: 1, administrationDate: -1 });

    // Filter for upcoming vaccinations if requested
    if (upcoming === 'true') {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 90); // Next 90 days

      vaccinations = vaccinations.filter(vaccination => {
        const dueDate = vaccination.nextDueDate || vaccination.scheduledDate;
        return dueDate >= today && dueDate <= futureDate;
      });
    }

    // Add calculated fields
    const vaccinationsWithStatus = vaccinations.map(vaccination => ({
      ...vaccination.toObject({ virtuals: true }),
      dueStatus: getDueStatus(vaccination),
      urgency: getUrgency(vaccination)
    }));

    res.json({
      success: true,
      data: vaccinationsWithStatus
    });
  } catch (error) {
    console.error('Get animal vaccination schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting vaccination schedule'
    });
  }
});

// @route   POST /api/vaccination/record
// @desc    Record a completed vaccination
// @access  Private
router.post('/record', protect, [
  body('animalId').isMongoId().withMessage('Valid animal ID is required'),
  body('vaccineName').notEmpty().withMessage('Vaccine name is required'),
  body('administrationDate').isISO8601().withMessage('Valid administration date is required'),
  body('administeredBy.name').notEmpty().withMessage('Administrator name is required')
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

    const vaccinationData = {
      ...req.body,
      ownerId: req.user.id,
      region: await regionalizationService.detectUserRegion(req),
      country: await getUserCountry(req.user.id)
    };

    const vaccinationRecord = await vaccinationService.recordVaccination(vaccinationData);

    res.status(201).json({
      success: true,
      message: 'Vaccination recorded successfully',
      data: vaccinationRecord
    });
  } catch (error) {
    console.error('Record vaccination error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error recording vaccination'
    });
  }
});

// @route   GET /api/vaccination/recommendations/:animalId
// @desc    Get vaccination recommendations for an animal
// @access  Private
router.get('/recommendations/:animalId', protect, async (req, res) => {
  try {
    const { animalId } = req.params;
    const { season, region, country } = req.query;

    const recommendations = await vaccinationService.getVaccinationRecommendations(
      req.user.id,
      animalId,
      { season, region, country }
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get vaccination recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting vaccination recommendations'
    });
  }
});

// @route   GET /api/vaccination/alerts
// @desc    Get vaccination alerts for user
// @access  Private
router.get('/alerts', protect, [
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('alertType').optional().isIn(['due_soon', 'overdue', 'seasonal_reminder', 'emergency', 'booster_due']),
  query('isRead').optional().isBoolean()
], async (req, res) => {
  try {
    const { priority, alertType, isRead } = req.query;

    let query = { owner: req.user.id };

    if (priority) query.priority = priority;
    if (alertType) query.alertType = alertType;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const alerts = await VaccinationAlert.find(query)
      .populate('animal', 'basicInfo.name basicInfo.type registrationNumber')
      .sort({ priority: -1, dueDate: 1, createdAt: -1 });

    // Group alerts by priority
    const groupedAlerts = {
      critical: alerts.filter(alert => alert.priority === 'critical'),
      high: alerts.filter(alert => alert.priority === 'high'),
      medium: alerts.filter(alert => alert.priority === 'medium'),
      low: alerts.filter(alert => alert.priority === 'low')
    };

    res.json({
      success: true,
      data: {
        alerts,
        grouped: groupedAlerts,
        summary: {
          total: alerts.length,
          unread: alerts.filter(alert => !alert.isRead).length,
          overdue: alerts.filter(alert => alert.alertType === 'overdue').length,
          dueSoon: alerts.filter(alert => alert.alertType === 'due_soon').length
        }
      }
    });
  } catch (error) {
    console.error('Get vaccination alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting vaccination alerts'
    });
  }
});

// @route   PUT /api/vaccination/alerts/:alertId/read
// @desc    Mark vaccination alert as read
// @access  Private
router.put('/alerts/:alertId/read', protect, checkOwnership(VaccinationAlert), async (req, res) => {
  try {
    const alert = await VaccinationAlert.findByIdAndUpdate(
      req.params.alertId,
      { 
        isRead: true,
        $push: {
          remindersSent: {
            method: 'manual_read',
            sentAt: new Date(),
            status: 'acknowledged'
          }
        }
      },
      { new: true }
    ).populate('animal', 'basicInfo.name basicInfo.type');

    res.json({
      success: true,
      message: 'Alert marked as read',
      data: alert
    });
  } catch (error) {
    console.error('Mark alert as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking alert as read'
    });
  }
});

// @route   PUT /api/vaccination/alerts/:alertId/action
// @desc    Mark vaccination alert as actioned (vaccination completed)
// @access  Private
router.put('/alerts/:alertId/action', protect, checkOwnership(VaccinationAlert), [
  body('vaccinationRecordId').optional().isMongoId().withMessage('Valid vaccination record ID required if provided')
], async (req, res) => {
  try {
    const { vaccinationRecordId } = req.body;

    const updateData = {
      isActioned: true,
      actionedDate: new Date(),
      isRead: true
    };

    const alert = await VaccinationAlert.findByIdAndUpdate(
      req.params.alertId,
      updateData,
      { new: true }
    ).populate('animal', 'basicInfo.name basicInfo.type');

    res.json({
      success: true,
      message: 'Alert marked as actioned',
      data: alert
    });
  } catch (error) {
    console.error('Mark alert as actioned error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking alert as actioned'
    });
  }
});

// @route   GET /api/vaccination/overdue
// @desc    Get overdue vaccinations for user
// @access  Private
router.get('/overdue', protect, async (req, res) => {
  try {
    const overdueVaccinations = await VaccinationRecord.findOverdue(req.user.id);

    const overdueWithDetails = overdueVaccinations.map(vaccination => ({
      ...vaccination.toObject({ virtuals: true }),
      daysOverdue: vaccination.daysSinceDue,
      urgencyLevel: vaccination.daysSinceDue > 30 ? 'critical' : 
                   vaccination.daysSinceDue > 14 ? 'high' : 'medium'
    }));

    res.json({
      success: true,
      data: {
        overdueVaccinations: overdueWithDetails,
        summary: {
          total: overdueWithDetails.length,
          critical: overdueWithDetails.filter(v => v.urgencyLevel === 'critical').length,
          high: overdueWithDetails.filter(v => v.urgencyLevel === 'high').length,
          medium: overdueWithDetails.filter(v => v.urgencyLevel === 'medium').length
        }
      }
    });
  } catch (error) {
    console.error('Get overdue vaccinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting overdue vaccinations'
    });
  }
});

// @route   PUT /api/vaccination/update-location
// @desc    Update vaccination schedules when user changes location
// @access  Private
router.put('/update-location', protect, [
  body('region').notEmpty().withMessage('Region is required'),
  body('country').notEmpty().withMessage('Country is required')
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

    const { region, country } = req.body;

    const updateResult = await vaccinationService.updateScheduleForLocationChange(
      req.user.id,
      region,
      country
    );

    res.json({
      success: true,
      message: 'Vaccination schedules updated for new location',
      data: updateResult
    });
  } catch (error) {
    console.error('Update vaccination location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating vaccination schedules'
    });
  }
});

// @route   GET /api/vaccination/dashboard
// @desc    Get vaccination dashboard data
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const [
      upcomingVaccinations,
      overdueVaccinations,
      recentVaccinations,
      alerts
    ] = await Promise.all([
      // Upcoming vaccinations (next 30 days)
      VaccinationRecord.find({
        owner: req.user.id,
        status: 'scheduled',
        nextDueDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }).populate('animal', 'basicInfo.name basicInfo.type').limit(10),

      // Overdue vaccinations
      VaccinationRecord.findOverdue(req.user.id).limit(10),

      // Recent vaccinations (last 30 days)
      VaccinationRecord.find({
        owner: req.user.id,
        status: 'completed',
        administrationDate: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }).populate('animal', 'basicInfo.name basicInfo.type').sort({ administrationDate: -1 }).limit(10),

      // Unread alerts
      VaccinationAlert.find({
        owner: req.user.id,
        isRead: false
      }).populate('animal', 'basicInfo.name basicInfo.type').sort({ priority: -1, createdAt: -1 }).limit(10)
    ]);

    // Calculate compliance rate
    const totalScheduled = await VaccinationRecord.countDocuments({
      owner: req.user.id,
      status: { $in: ['scheduled', 'completed', 'overdue'] }
    });

    const completedOnTime = await VaccinationRecord.countDocuments({
      owner: req.user.id,
      status: 'completed',
      administrationDate: { $lte: '$nextDueDate' }
    });

    const complianceRate = totalScheduled > 0 ? Math.round((completedOnTime / totalScheduled) * 100) : 100;

    res.json({
      success: true,
      data: {
        summary: {
          upcomingCount: upcomingVaccinations.length,
          overdueCount: overdueVaccinations.length,
          recentCount: recentVaccinations.length,
          alertsCount: alerts.length,
          complianceRate
        },
        upcomingVaccinations,
        overdueVaccinations,
        recentVaccinations,
        alerts
      }
    });
  } catch (error) {
    console.error('Get vaccination dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting vaccination dashboard'
    });
  }
});

// Helper functions
function getDueStatus(vaccination) {
  const dueDate = vaccination.nextDueDate || vaccination.scheduledDate;
  if (!dueDate) return 'unknown';
  
  const today = new Date();
  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'due_today';
  if (diffDays <= 7) return 'due_soon';
  if (diffDays <= 30) return 'upcoming';
  return 'scheduled';
}

function getUrgency(vaccination) {
  const status = getDueStatus(vaccination);
  
  switch (status) {
    case 'overdue':
      return 'critical';
    case 'due_today':
    case 'due_soon':
      return 'high';
    case 'upcoming':
      return 'medium';
    default:
      return 'low';
  }
}

async function getUserCountry(userId) {
  // This would typically get the user's country from their profile
  // For now, returning a default - should be implemented based on user data
  return 'US';
}

module.exports = router; 
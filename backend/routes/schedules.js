const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Schedule = require('../models/Schedule');
const Animal = require('../models/Animal');
const { protect, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/schedules
// @desc    Get all schedules for the authenticated user
// @access  Private
router.get('/', protect, [
  query('type').optional().isIn(['vaccination', 'deworming', 'mating', 'health_check', 'breeding', 'other']),
  query('status').optional().isIn(['pending', 'completed', 'overdue', 'cancelled']),
  query('animal').optional().isMongoId(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

    const {
      type,
      status,
      animal,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = { owner: req.user.id };

    if (type) query.type = type;
    if (status) query.status = status;
    if (animal) query.animal = animal;
    
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [schedules, total] = await Promise.all([
      Schedule.find(query)
        .populate('animal', 'basicInfo.name basicInfo.category registrationNumber')
        .populate('completedBy', 'name')
        .sort({ scheduledDate: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Schedule.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: schedules,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting schedules'
    });
  }
});

// @route   GET /api/schedules/:id
// @desc    Get single schedule
// @access  Private
router.get('/:id', protect, checkOwnership(Schedule), async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('animal', 'basicInfo.name basicInfo.category registrationNumber')
      .populate('completedBy', 'name')
      .populate('details.partner', 'basicInfo.name registrationNumber');

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting schedule'
    });
  }
});

// @route   POST /api/schedules
// @desc    Create new schedule
// @access  Private
router.post('/', protect, [
  body('animal').isMongoId().withMessage('Valid animal ID is required'),
  body('type').isIn(['vaccination', 'deworming', 'mating', 'health_check', 'breeding', 'other']).withMessage('Invalid schedule type'),
  body('title').notEmpty().withMessage('Title is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
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

    // Verify animal belongs to user
    const animal = await Animal.findOne({ _id: req.body.animal, owner: req.user.id });
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found or not owned by user'
      });
    }

    const scheduleData = {
      owner: req.user.id,
      animal: req.body.animal,
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      scheduledDate: req.body.scheduledDate,
      priority: req.body.priority || 'medium',
      details: req.body.details || {},
      recurring: req.body.recurring || { isRecurring: false }
    };

    const schedule = await Schedule.create(scheduleData);

    // Handle recurring schedules
    if (schedule.recurring.isRecurring) {
      await Schedule.createRecurringSchedules(schedule);
    }

    await schedule.populate([
      { path: 'animal', select: 'basicInfo.name basicInfo.category registrationNumber' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating schedule'
    });
  }
});

// @route   PUT /api/schedules/:id
// @desc    Update schedule
// @access  Private
router.put('/:id', protect, checkOwnership(Schedule), async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Don't allow changing owner or animal
    delete updates.owner;
    delete updates.animal;

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: 'animal', select: 'basicInfo.name basicInfo.category registrationNumber' },
      { path: 'completedBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating schedule'
    });
  }
});

// @route   PUT /api/schedules/:id/complete
// @desc    Mark schedule as completed
// @access  Private
router.put('/:id/complete', protect, checkOwnership(Schedule), [
  body('completedDate').optional().isISO8601().withMessage('Valid completion date is required'),
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

    const updates = {
      status: 'completed',
      completedDate: req.body.completedDate || new Date(),
      completedBy: req.user.id
    };

    if (req.body.notes) {
      updates['details.notes'] = req.body.notes;
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate([
      { path: 'animal', select: 'basicInfo.name basicInfo.category registrationNumber' },
      { path: 'completedBy', select: 'name' }
    ]);

    // If this is a vaccination or deworming, add it to animal's medical history
    if (schedule.type === 'vaccination' && schedule.details.vaccineName) {
      const animal = await Animal.findById(schedule.animal._id);
      animal.medicalHistory.vaccinations.push({
        vaccineName: schedule.details.vaccineName,
        dateAdministered: schedule.completedDate,
        nextDueDate: schedule.details.nextDueDate,
        batchNumber: schedule.details.batchNumber,
        veterinarian: schedule.details.veterinarian,
        notes: schedule.details.notes
      });
      await animal.save();
    } else if (schedule.type === 'deworming' && schedule.details.medicine) {
      const animal = await Animal.findById(schedule.animal._id);
      animal.medicalHistory.dewormings.push({
        medicine: schedule.details.medicine,
        dateAdministered: schedule.completedDate,
        nextDueDate: schedule.details.nextDueDate,
        dosage: schedule.details.dosage,
        veterinarian: schedule.details.veterinarian,
        notes: schedule.details.notes
      });
      await animal.save();
    }

    res.json({
      success: true,
      message: 'Schedule marked as completed',
      data: schedule
    });
  } catch (error) {
    console.error('Complete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error completing schedule'
    });
  }
});

// @route   DELETE /api/schedules/:id
// @desc    Delete schedule
// @access  Private
router.delete('/:id', protect, checkOwnership(Schedule), async (req, res) => {
  try {
    await Schedule.findByIdAndUpdate(req.params.id, { status: 'cancelled' });

    res.json({
      success: true,
      message: 'Schedule cancelled successfully'
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting schedule'
    });
  }
});

// @route   GET /api/schedules/upcoming
// @desc    Get upcoming schedules (next 30 days)
// @access  Private
router.get('/upcoming', protect, async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const upcomingSchedules = await Schedule.find({
      owner: req.user.id,
      status: 'pending',
      scheduledDate: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow
      }
    })
    .populate('animal', 'basicInfo.name basicInfo.category registrationNumber')
    .sort({ scheduledDate: 1 })
    .limit(20);

    res.json({
      success: true,
      data: upcomingSchedules
    });
  } catch (error) {
    console.error('Get upcoming schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting upcoming schedules'
    });
  }
});

// @route   GET /api/schedules/overdue
// @desc    Get overdue schedules
// @access  Private
router.get('/overdue', protect, async (req, res) => {
  try {
    const overdueSchedules = await Schedule.find({
      owner: req.user.id,
      status: 'overdue'
    })
    .populate('animal', 'basicInfo.name basicInfo.category registrationNumber')
    .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      data: overdueSchedules
    });
  } catch (error) {
    console.error('Get overdue schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting overdue schedules'
    });
  }
});

// @route   GET /api/schedules/stats
// @desc    Get schedule statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalSchedules,
      pendingSchedules,
      overdueSchedules,
      completedThisMonth,
      schedulesByType,
      upcomingByPriority
    ] = await Promise.all([
      Schedule.countDocuments({ owner: userId }),
      Schedule.countDocuments({ owner: userId, status: 'pending' }),
      Schedule.countDocuments({ owner: userId, status: 'overdue' }),
      Schedule.countDocuments({
        owner: userId,
        status: 'completed',
        completedDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      Schedule.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Schedule.aggregate([
        {
          $match: {
            owner: userId,
            status: 'pending',
            scheduledDate: {
              $gte: new Date(),
              $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalSchedules,
        pendingSchedules,
        overdueSchedules,
        completedThisMonth,
        schedulesByType,
        upcomingByPriority
      }
    });
  } catch (error) {
    console.error('Get schedule stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting schedule statistics'
    });
  }
});

// @route   POST /api/schedules/vaccination-template
// @desc    Create vaccination schedule template for animal category
// @access  Private
router.post('/vaccination-template', protect, [
  body('category').isIn(['goat', 'cattle', 'sheep', 'horse', 'pig', 'chicken']).withMessage('Invalid category'),
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

    const { category, animal } = req.body;

    // Verify animal belongs to user
    const animalDoc = await Animal.findOne({ _id: animal, owner: req.user.id });
    if (!animalDoc) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found or not owned by user'
      });
    }

    // Vaccination templates by category
    const vaccinationTemplates = {
      goat: [
        { name: 'CDT (Clostridium perfringens)', ageInDays: 42, recurring: true, intervalMonths: 12 },
        { name: 'Pneumonia', ageInDays: 60, recurring: true, intervalMonths: 12 },
        { name: 'Rabies', ageInDays: 90, recurring: true, intervalMonths: 36 }
      ],
      cattle: [
        { name: 'IBR/BVD', ageInDays: 90, recurring: true, intervalMonths: 12 },
        { name: 'Clostridial (7-way)', ageInDays: 60, recurring: true, intervalMonths: 12 },
        { name: 'Rabies', ageInDays: 120, recurring: true, intervalMonths: 36 }
      ],
      sheep: [
        { name: 'CDT', ageInDays: 42, recurring: true, intervalMonths: 12 },
        { name: 'Ovine EAE', ageInDays: 60, recurring: true, intervalMonths: 12 }
      ]
    };

    const templates = vaccinationTemplates[category] || [];
    const birthDate = new Date(animalDoc.basicInfo.dateOfBirth);
    const schedules = [];

    for (const template of templates) {
      const scheduledDate = new Date(birthDate);
      scheduledDate.setDate(scheduledDate.getDate() + template.ageInDays);

      const scheduleData = {
        owner: req.user.id,
        animal: animal,
        type: 'vaccination',
        title: `${template.name} Vaccination`,
        scheduledDate: scheduledDate,
        priority: 'medium',
        details: {
          vaccineName: template.name,
          route: 'subcutaneous'
        },
        recurring: {
          isRecurring: template.recurring,
          frequency: 'monthly',
          interval: template.intervalMonths
        }
      };

      const schedule = await Schedule.create(scheduleData);
      schedules.push(schedule);
    }

    res.status(201).json({
      success: true,
      message: 'Vaccination schedule template created successfully',
      data: schedules
    });
  } catch (error) {
    console.error('Create vaccination template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating vaccination template'
    });
  }
});

module.exports = router; 
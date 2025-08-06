const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Animal = require('../models/Animal');
const { protect, checkOwnership } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/animals/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

// @route   GET /api/animals
// @desc    Get all animals for the authenticated user
// @access  Private
router.get('/', protect, [
  query('category').optional().isIn(['goat', 'cattle', 'sheep', 'horse', 'pig', 'chicken', 'other']),
  query('gender').optional().isIn(['male', 'female']),
  query('healthStatus').optional().isIn(['healthy', 'sick', 'injured', 'pregnant', 'lactating', 'deceased']),
  query('isForSale').optional().isBoolean(),
  query('isAvailableForMating').optional().isBoolean(),
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
      category,
      gender,
      healthStatus,
      isForSale,
      isAvailableForMating,
      page = 1,
      limit = 20,
      search
    } = req.query;

    // Build query
    const query = { owner: req.user.id, isActive: true };

    if (category) query['basicInfo.category'] = category;
    if (gender) query['basicInfo.gender'] = gender;
    if (healthStatus) query['currentStatus.healthStatus'] = healthStatus;
    if (isForSale) query['currentStatus.isForSale'] = isForSale === 'true';
    if (isAvailableForMating) query['currentStatus.isAvailableForMating'] = isAvailableForMating === 'true';

    // Add search functionality
    if (search) {
      query.$or = [
        { 'basicInfo.name': { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { 'basicInfo.breed': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [animals, total] = await Promise.all([
      Animal.find(query)
        .populate('parentage.mother.animalId', 'basicInfo.name registrationNumber')
        .populate('parentage.father.animalId', 'basicInfo.name registrationNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Animal.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: animals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get animals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting animals'
    });
  }
});

// @route   GET /api/animals/:id
// @desc    Get single animal
// @access  Private
router.get('/:id', protect, checkOwnership(Animal), async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id)
      .populate('owner', 'name farmDetails.farmName')
      .populate('parentage.mother.animalId', 'basicInfo.name registrationNumber')
      .populate('parentage.father.animalId', 'basicInfo.name registrationNumber')
      .populate('reproductiveHistory.matings.partner.animalId', 'basicInfo.name registrationNumber')
      .populate('reproductiveHistory.matings.partner.owner', 'name farmDetails.farmName')
      .populate('reproductiveHistory.pregnancies.offspring', 'basicInfo.name registrationNumber')
      .populate('growthRecords.recordedBy', 'name');

    res.json({
      success: true,
      data: animal
    });
  } catch (error) {
    console.error('Get animal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting animal'
    });
  }
});

// @route   POST /api/animals
// @desc    Register new animal
// @access  Private
router.post('/', protect, upload.array('photos', 5), [
  body('registrationNumber').notEmpty().withMessage('Registration number is required'),
  body('basicInfo.name').notEmpty().withMessage('Animal name is required'),
  body('basicInfo.category').isIn(['goat', 'cattle', 'sheep', 'horse', 'pig', 'chicken', 'other']).withMessage('Invalid category'),
  body('basicInfo.breed').notEmpty().withMessage('Breed is required'),
  body('basicInfo.gender').isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('basicInfo.dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('birthDetails.weightAtBirth').isFloat({ min: 0 }).withMessage('Weight at birth must be a positive number'),
  body('birthDetails.birthType').isIn(['single', 'twins', 'triplets', 'quadruplets']).withMessage('Invalid birth type')
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

    // Check if registration number already exists
    const existingAnimal = await Animal.findOne({ registrationNumber: req.body.registrationNumber });
    if (existingAnimal) {
      return res.status(400).json({
        success: false,
        message: 'Registration number already exists'
      });
    }

    // Process uploaded photos
    const photos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        photos.push({
          url: `/uploads/animals/${file.filename}`,
          caption: req.body.photoCaption || ''
        });
      });
    }

    const animalData = {
      owner: req.user.id,
      registrationNumber: req.body.registrationNumber,
      basicInfo: req.body.basicInfo,
      parentage: req.body.parentage || {},
      birthDetails: req.body.birthDetails,
      currentStatus: req.body.currentStatus || {},
      media: {
        photos: photos,
        videos: req.body.videos || []
      },
      medicalHistory: req.body.medicalHistory || {
        vaccinations: [],
        dewormings: [],
        treatments: [],
        injuries: []
      },
      reproductiveHistory: req.body.reproductiveHistory || {
        matings: [],
        pregnancies: [],
        lactationPeriods: []
      },
      growthRecords: req.body.growthRecords || [],
      tags: req.body.tags || [],
      notes: req.body.notes || ''
    };

    const animal = await Animal.create(animalData);

    // Populate the response
    await animal.populate([
      { path: 'owner', select: 'name farmDetails.farmName' },
      { path: 'parentage.mother.animalId', select: 'basicInfo.name registrationNumber' },
      { path: 'parentage.father.animalId', select: 'basicInfo.name registrationNumber' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Animal registered successfully',
      data: animal
    });
  } catch (error) {
    console.error('Create animal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating animal'
    });
  }
});

// @route   PUT /api/animals/:id
// @desc    Update animal
// @access  Private
router.put('/:id', protect, checkOwnership(Animal), upload.array('photos', 5), async (req, res) => {
  try {
    const updates = { ...req.body };

    // Process new uploaded photos
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => ({
        url: `/uploads/animals/${file.filename}`,
        caption: req.body.photoCaption || ''
      }));

      // Merge with existing photos
      if (updates.media && updates.media.photos) {
        updates.media.photos = [...updates.media.photos, ...newPhotos];
      } else {
        updates.media = { photos: newPhotos };
      }
    }

    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: 'owner', select: 'name farmDetails.farmName' },
      { path: 'parentage.mother.animalId', select: 'basicInfo.name registrationNumber' },
      { path: 'parentage.father.animalId', select: 'basicInfo.name registrationNumber' }
    ]);

    res.json({
      success: true,
      message: 'Animal updated successfully',
      data: animal
    });
  } catch (error) {
    console.error('Update animal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating animal'
    });
  }
});

// @route   DELETE /api/animals/:id
// @desc    Delete animal (soft delete)
// @access  Private
router.delete('/:id', protect, checkOwnership(Animal), async (req, res) => {
  try {
    await Animal.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Animal deleted successfully'
    });
  } catch (error) {
    console.error('Delete animal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting animal'
    });
  }
});

// @route   POST /api/animals/:id/growth-record
// @desc    Add growth record
// @access  Private
router.post('/:id/growth-record', protect, checkOwnership(Animal), [
  body('weight').isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('height').optional().isFloat({ min: 0 }).withMessage('Height must be a positive number'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('bodyConditionScore').optional().isInt({ min: 1, max: 5 }).withMessage('Body condition score must be between 1-5')
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

    const growthRecord = {
      date: req.body.date || new Date(),
      weight: req.body.weight,
      height: req.body.height,
      bodyConditionScore: req.body.bodyConditionScore,
      notes: req.body.notes,
      recordedBy: req.user.id
    };

    const animal = await Animal.findById(req.params.id);
    animal.growthRecords.push(growthRecord);
    await animal.save();

    res.json({
      success: true,
      message: 'Growth record added successfully',
      data: animal.growthRecords[animal.growthRecords.length - 1]
    });
  } catch (error) {
    console.error('Add growth record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding growth record'
    });
  }
});

// @route   POST /api/animals/:id/vaccination
// @desc    Add vaccination record
// @access  Private
router.post('/:id/vaccination', protect, checkOwnership(Animal), [
  body('vaccineName').notEmpty().withMessage('Vaccine name is required'),
  body('dateAdministered').isISO8601().withMessage('Valid date is required'),
  body('nextDueDate').optional().isISO8601().withMessage('Valid next due date is required')
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

    const vaccination = {
      vaccineName: req.body.vaccineName,
      dateAdministered: req.body.dateAdministered,
      nextDueDate: req.body.nextDueDate,
      batchNumber: req.body.batchNumber,
      veterinarian: req.body.veterinarian,
      notes: req.body.notes
    };

    const animal = await Animal.findById(req.params.id);
    animal.medicalHistory.vaccinations.push(vaccination);
    await animal.save();

    res.json({
      success: true,
      message: 'Vaccination record added successfully',
      data: animal.medicalHistory.vaccinations[animal.medicalHistory.vaccinations.length - 1]
    });
  } catch (error) {
    console.error('Add vaccination error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding vaccination record'
    });
  }
});

// @route   POST /api/animals/:id/deworming
// @desc    Add deworming record
// @access  Private
router.post('/:id/deworming', protect, checkOwnership(Animal), [
  body('medicine').notEmpty().withMessage('Medicine name is required'),
  body('dateAdministered').isISO8601().withMessage('Valid date is required'),
  body('nextDueDate').optional().isISO8601().withMessage('Valid next due date is required')
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

    const deworming = {
      medicine: req.body.medicine,
      dateAdministered: req.body.dateAdministered,
      nextDueDate: req.body.nextDueDate,
      dosage: req.body.dosage,
      veterinarian: req.body.veterinarian,
      notes: req.body.notes
    };

    const animal = await Animal.findById(req.params.id);
    animal.medicalHistory.dewormings.push(deworming);
    await animal.save();

    res.json({
      success: true,
      message: 'Deworming record added successfully',
      data: animal.medicalHistory.dewormings[animal.medicalHistory.dewormings.length - 1]
    });
  } catch (error) {
    console.error('Add deworming error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding deworming record'
    });
  }
});

// @route   GET /api/animals/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalAnimals,
      animalsByCategory,
      healthStatusStats,
      recentGrowthRecords,
      upcomingVaccinations,
      pregnantAnimals,
      animalsForSale
    ] = await Promise.all([
      // Total animals count
      Animal.countDocuments({ owner: userId, isActive: true }),
      
      // Animals by category
      Animal.aggregate([
        { $match: { owner: userId, isActive: true } },
        { $group: { _id: '$basicInfo.category', count: { $sum: 1 } } }
      ]),
      
      // Health status statistics
      Animal.aggregate([
        { $match: { owner: userId, isActive: true } },
        { $group: { _id: '$currentStatus.healthStatus', count: { $sum: 1 } } }
      ]),
      
      // Recent growth records (last 30 days)
      Animal.find({
        owner: userId,
        isActive: true,
        'growthRecords.date': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).select('basicInfo.name growthRecords').limit(10),
      
      // Upcoming vaccinations (next 30 days)
      Animal.find({
        owner: userId,
        isActive: true,
        'medicalHistory.vaccinations.nextDueDate': { 
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }).select('basicInfo.name medicalHistory.vaccinations').limit(10),
      
      // Pregnant animals
      Animal.countDocuments({
        owner: userId,
        isActive: true,
        'currentStatus.healthStatus': 'pregnant'
      }),
      
      // Animals for sale
      Animal.countDocuments({
        owner: userId,
        isActive: true,
        'currentStatus.isForSale': true
      })
    ]);

    res.json({
      success: true,
      data: {
        totalAnimals,
        animalsByCategory,
        healthStatusStats,
        recentGrowthRecords,
        upcomingVaccinations,
        pregnantAnimals,
        animalsForSale
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting dashboard statistics'
    });
  }
});

module.exports = router; 
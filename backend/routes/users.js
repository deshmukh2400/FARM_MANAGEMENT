const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const Animal = require('../models/Animal');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/farmers
// @desc    Get list of farmers (public)
// @access  Public/Private
router.get('/farmers', optionalAuth, [
  query('location').optional().isString(),
  query('specialization').optional().isString(),
  query('verified').optional().isBoolean(),
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

    const {
      location,
      specialization,
      verified,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = { 
      isActive: true,
      role: 'farmer',
      'preferences.privacy.showAnimalsPublicly': true
    };

    if (location) {
      query.$or = [
        { 'farmDetails.location.city': { $regex: location, $options: 'i' } },
        { 'farmDetails.location.state': { $regex: location, $options: 'i' } }
      ];
    }

    if (specialization) {
      query['profile.specialization'] = { $in: [specialization] };
    }

    if (verified === 'true') {
      query['profile.verified'] = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'farmDetails.farmName': { $regex: search, $options: 'i' } },
        { 'profile.specialization': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [farmers, total] = await Promise.all([
      User.find(query)
        .select('name farmDetails.farmName farmDetails.location profile.avatar profile.verified profile.specialization profile.experience createdAt')
        .populate('animalsCount')
        .sort({ 'profile.verified': -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: farmers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting farmers list'
    });
  }
});

// @route   GET /api/users/farmers/:id
// @desc    Get farmer profile (public)
// @access  Public/Private
router.get('/farmers/:id', optionalAuth, async (req, res) => {
  try {
    const farmer = await User.findOne({
      _id: req.params.id,
      isActive: true,
      role: 'farmer',
      'preferences.privacy.showAnimalsPublicly': true
    })
    .select('name farmDetails profile createdAt')
    .populate('animalsCount');

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found or profile is private'
      });
    }

    // Get farmer's animals that are publicly visible
    const animals = await Animal.find({
      owner: req.params.id,
      isActive: true
    })
    .select('basicInfo.name basicInfo.category basicInfo.breed basicInfo.gender currentStatus.isForSale currentStatus.isAvailableForMating media.photos registrationNumber')
    .limit(20)
    .sort({ createdAt: -1 });

    // Get animals by category stats
    const animalStats = await Animal.aggregate([
      { $match: { owner: farmer._id, isActive: true } },
      { $group: { _id: '$basicInfo.category', count: { $sum: 1 } } }
    ]);

    const farmerProfile = {
      ...farmer.toObject(),
      animals,
      animalStats,
      totalAnimals: animals.length
    };

    res.json({
      success: true,
      data: farmerProfile
    });
  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting farmer profile'
    });
  }
});

// @route   GET /api/users/farmers/:id/animals
// @desc    Get farmer's animals (public)
// @access  Public/Private
router.get('/farmers/:id/animals', optionalAuth, [
  query('category').optional().isIn(['goat', 'cattle', 'sheep', 'horse', 'pig', 'chicken', 'other']),
  query('forSale').optional().isBoolean(),
  query('forMating').optional().isBoolean(),
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

    // Verify farmer exists and allows public viewing
    const farmer = await User.findOne({
      _id: req.params.id,
      isActive: true,
      role: 'farmer',
      'preferences.privacy.showAnimalsPublicly': true
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found or animals are private'
      });
    }

    const {
      category,
      forSale,
      forMating,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {
      owner: req.params.id,
      isActive: true
    };

    if (category) query['basicInfo.category'] = category;
    if (forSale === 'true') query['currentStatus.isForSale'] = true;
    if (forMating === 'true') query['currentStatus.isAvailableForMating'] = true;

    const skip = (page - 1) * limit;

    const [animals, total] = await Promise.all([
      Animal.find(query)
        .select('basicInfo currentStatus.isForSale currentStatus.isAvailableForMating currentStatus.salePrice currentStatus.matingFee media.photos registrationNumber age')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Animal.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: animals,
      farmer: {
        name: farmer.name,
        farmName: farmer.farmDetails.farmName,
        location: farmer.farmDetails.location
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get farmer animals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting farmer animals'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users by name or farm name
// @access  Private
router.get('/search', protect, [
  query('q').notEmpty().withMessage('Search query is required'),
  query('role').optional().isIn(['farmer', 'veterinarian']),
  query('limit').optional().isInt({ min: 1, max: 20 })
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

    const { q, role, limit = 10 } = req.query;

    const query = {
      isActive: true,
      _id: { $ne: req.user.id }, // Exclude current user
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { 'farmDetails.farmName': { $regex: q, $options: 'i' } }
      ]
    };

    if (role) query.role = role;

    const users = await User.find(query)
      .select('name farmDetails.farmName profile.avatar role')
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching users'
    });
  }
});

// @route   GET /api/users/nearby
// @desc    Get nearby farmers
// @access  Private
router.get('/nearby', protect, [
  query('radius').optional().isFloat({ min: 1, max: 500 }).withMessage('Radius must be between 1 and 500 km'),
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

    const { radius = 50, limit = 20 } = req.query;

    // Get current user's coordinates
    const currentUser = await User.findById(req.user.id);
    const userCoords = currentUser.farmDetails.location.coordinates;

    if (!userCoords || !userCoords.latitude || !userCoords.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please set your farm location coordinates to find nearby farmers'
      });
    }

    // Find nearby farmers using MongoDB geospatial query
    const nearbyFarmers = await User.find({
      _id: { $ne: req.user.id },
      isActive: true,
      role: 'farmer',
      'farmDetails.location.coordinates': { $exists: true },
      'preferences.privacy.showAnimalsPublicly': true
    })
    .select('name farmDetails.farmName farmDetails.location profile.avatar profile.verified')
    .limit(parseInt(limit));

    // Calculate distances (simple approximation)
    const farmersWithDistance = nearbyFarmers
      .map(farmer => {
        const farmerCoords = farmer.farmDetails.location.coordinates;
        if (!farmerCoords.latitude || !farmerCoords.longitude) return null;

        // Simple distance calculation (not precise, but good enough for basic proximity)
        const latDiff = userCoords.latitude - farmerCoords.latitude;
        const lonDiff = userCoords.longitude - farmerCoords.longitude;
        const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111; // Rough km conversion

        return {
          ...farmer.toObject(),
          distance: Math.round(distance * 10) / 10 // Round to 1 decimal
        };
      })
      .filter(farmer => farmer && farmer.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: farmersWithDistance,
      userLocation: {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude
      },
      searchRadius: radius
    });
  } catch (error) {
    console.error('Get nearby farmers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error finding nearby farmers'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get platform statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const [
      totalFarmers,
      totalAnimals,
      totalListings,
      animalsByCategory,
      farmersByLocation
    ] = await Promise.all([
      User.countDocuments({ isActive: true, role: 'farmer' }),
      
      Animal.countDocuments({ isActive: true }),
      
      // This would need the Marketplace model, but we'll approximate
      Animal.countDocuments({ 
        isActive: true, 
        $or: [
          { 'currentStatus.isForSale': true },
          { 'currentStatus.isAvailableForMating': true }
        ]
      }),
      
      Animal.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$basicInfo.category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      User.aggregate([
        { $match: { isActive: true, role: 'farmer' } },
        { $group: { _id: '$farmDetails.location.state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalFarmers,
        totalAnimals,
        totalListings,
        animalsByCategory,
        topStates: farmersByLocation
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting platform statistics'
    });
  }
});

module.exports = router; 
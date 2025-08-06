const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Marketplace, Inquiry } = require('../models/Marketplace');
const Animal = require('../models/Animal');
const { protect, checkOwnership, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/marketplace
// @desc    Browse marketplace listings (public with optional auth)
// @access  Public/Private
router.get('/', optionalAuth, [
  query('type').optional().isIn(['sale', 'mating_service', 'lease', 'exchange']),
  query('category').optional().isIn(['goat', 'cattle', 'sheep', 'horse', 'pig', 'chicken', 'other']),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('location').optional().isString(),
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
      type,
      category,
      minPrice,
      maxPrice,
      location,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      type,
      category,
      minPrice,
      maxPrice,
      location,
      tags: req.query.tags ? req.query.tags.split(',') : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const skip = (page - 1) * limit;

    let listings = await Marketplace.searchListings(filters)
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out listings from current user if authenticated
    if (req.user) {
      listings = listings.filter(listing => 
        listing.seller._id.toString() !== req.user.id.toString()
      );
    }

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      listings = listings.filter(listing => 
        searchRegex.test(listing.description) ||
        searchRegex.test(listing.animal?.basicInfo?.name) ||
        searchRegex.test(listing.animal?.basicInfo?.breed)
      );
    }

    const total = listings.length;

    res.json({
      success: true,
      data: listings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Browse marketplace error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error browsing marketplace'
    });
  }
});

// @route   GET /api/marketplace/:id
// @desc    Get single marketplace listing
// @access  Public/Private
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const listing = await Marketplace.findById(req.params.id)
      .populate('seller', 'name farmDetails.farmName profile.avatar profile.verified')
      .populate('animal');

    if (!listing || listing.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or not active'
      });
    }

    // Increment view count (but not for owner)
    if (!req.user || req.user.id.toString() !== listing.seller._id.toString()) {
      await listing.incrementViews();
    }

    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('Get marketplace listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting listing'
    });
  }
});

// @route   POST /api/marketplace
// @desc    Create new marketplace listing
// @access  Private
router.post('/', protect, [
  body('animal').isMongoId().withMessage('Valid animal ID is required'),
  body('type').isIn(['sale', 'mating_service', 'lease', 'exchange']).withMessage('Invalid listing type'),
  body('description').notEmpty().isLength({ max: 1000 }).withMessage('Description is required and must be under 1000 characters'),
  body('pricing.price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('pricing.matingFee').optional().isFloat({ min: 0 }).withMessage('Mating fee must be a positive number')
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

    // Verify animal belongs to user and is not already listed
    const animal = await Animal.findOne({ 
      _id: req.body.animal, 
      owner: req.user.id,
      isActive: true 
    });
    
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found or not owned by user'
      });
    }

    // Check if animal is already listed
    const existingListing = await Marketplace.findOne({
      animal: req.body.animal,
      status: 'active'
    });

    if (existingListing) {
      return res.status(400).json({
        success: false,
        message: 'Animal is already listed in marketplace'
      });
    }

    const listingData = {
      seller: req.user.id,
      animal: req.body.animal,
      type: req.body.type,
      description: req.body.description,
      pricing: req.body.pricing || {},
      highlights: req.body.highlights || [],
      location: req.body.location || req.user.farmDetails.location,
      availability: req.body.availability || {},
      requirements: req.body.requirements || {},
      media: req.body.media || {},
      tags: req.body.tags || []
    };

    const listing = await Marketplace.create(listingData);

    // Update animal status
    if (req.body.type === 'sale') {
      animal.currentStatus.isForSale = true;
      animal.currentStatus.salePrice = req.body.pricing.price;
    } else if (req.body.type === 'mating_service') {
      animal.currentStatus.isAvailableForMating = true;
      animal.currentStatus.matingFee = req.body.pricing.matingFee;
    }
    await animal.save();

    await listing.populate([
      { path: 'seller', select: 'name farmDetails.farmName' },
      { path: 'animal' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing
    });
  } catch (error) {
    console.error('Create marketplace listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating listing'
    });
  }
});

// @route   PUT /api/marketplace/:id
// @desc    Update marketplace listing
// @access  Private
router.put('/:id', protect, checkOwnership(Marketplace, 'id'), async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Don't allow changing seller or animal
    delete updates.seller;
    delete updates.animal;

    const listing = await Marketplace.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: 'seller', select: 'name farmDetails.farmName' },
      { path: 'animal' }
    ]);

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: listing
    });
  } catch (error) {
    console.error('Update marketplace listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating listing'
    });
  }
});

// @route   DELETE /api/marketplace/:id
// @desc    Remove marketplace listing
// @access  Private
router.delete('/:id', protect, checkOwnership(Marketplace, 'id'), async (req, res) => {
  try {
    const listing = await Marketplace.findById(req.params.id).populate('animal');
    
    // Update listing status
    listing.status = 'cancelled';
    await listing.save();

    // Update animal status
    if (listing.type === 'sale') {
      listing.animal.currentStatus.isForSale = false;
      listing.animal.currentStatus.salePrice = undefined;
    } else if (listing.type === 'mating_service') {
      listing.animal.currentStatus.isAvailableForMating = false;
      listing.animal.currentStatus.matingFee = undefined;
    }
    await listing.animal.save();

    res.json({
      success: true,
      message: 'Listing removed successfully'
    });
  } catch (error) {
    console.error('Delete marketplace listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing listing'
    });
  }
});

// @route   POST /api/marketplace/:id/inquiry
// @desc    Create inquiry for a listing
// @access  Private
router.post('/:id/inquiry', protect, [
  body('type').isIn(['purchase_inquiry', 'mating_request', 'lease_inquiry', 'exchange_proposal']).withMessage('Invalid inquiry type'),
  body('message').notEmpty().isLength({ max: 500 }).withMessage('Message is required and must be under 500 characters'),
  body('offerPrice').optional().isFloat({ min: 0 }).withMessage('Offer price must be positive'),
  body('femaleAnimal').optional().isMongoId().withMessage('Valid female animal ID required for mating requests')
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

    const listing = await Marketplace.findById(req.params.id);
    if (!listing || listing.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or not active'
      });
    }

    // Can't inquire about own listing
    if (listing.seller.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot inquire about your own listing'
      });
    }

    // For mating requests, verify female animal ownership
    if (req.body.type === 'mating_request' && req.body.femaleAnimal) {
      const femaleAnimal = await Animal.findOne({
        _id: req.body.femaleAnimal,
        owner: req.user.id,
        'basicInfo.gender': 'female'
      });

      if (!femaleAnimal) {
        return res.status(404).json({
          success: false,
          message: 'Female animal not found or not owned by you'
        });
      }
    }

    const inquiryData = {
      listing: req.params.id,
      inquirer: req.user.id,
      type: req.body.type,
      message: req.body.message,
      offerPrice: req.body.offerPrice,
      proposedDates: req.body.proposedDates,
      femaleAnimal: req.body.femaleAnimal,
      offeredAnimals: req.body.offeredAnimals
    };

    const inquiry = await listing.createInquiry(inquiryData);

    await inquiry.populate([
      { path: 'inquirer', select: 'name farmDetails.farmName profile.avatar' },
      { path: 'femaleAnimal', select: 'basicInfo.name registrationNumber' },
      { path: 'offeredAnimals', select: 'basicInfo.name registrationNumber' }
    ]);

    // TODO: Send notification to seller

    res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating inquiry'
    });
  }
});

// @route   GET /api/marketplace/my-listings
// @desc    Get user's marketplace listings
// @access  Private
router.get('/my-listings', protect, [
  query('status').optional().isIn(['active', 'sold', 'reserved', 'expired', 'cancelled']),
  query('type').optional().isIn(['sale', 'mating_service', 'lease', 'exchange'])
], async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = { seller: req.user.id };

    if (status) query.status = status;
    if (type) query.type = type;

    const listings = await Marketplace.find(query)
      .populate('animal', 'basicInfo.name basicInfo.category registrationNumber media.photos')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: listings
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting your listings'
    });
  }
});

// @route   GET /api/marketplace/my-inquiries
// @desc    Get user's inquiries (sent and received)
// @access  Private
router.get('/my-inquiries', protect, [
  query('type').optional().isIn(['sent', 'received']),
  query('status').optional().isIn(['pending', 'accepted', 'declined', 'negotiating', 'completed'])
], async (req, res) => {
  try {
    const { type = 'both', status } = req.query;
    let query = {};

    if (type === 'sent') {
      query.inquirer = req.user.id;
    } else if (type === 'received') {
      // Find inquiries for listings owned by user
      const userListings = await Marketplace.find({ seller: req.user.id }).select('_id');
      query.listing = { $in: userListings.map(l => l._id) };
    } else {
      // Both sent and received
      const userListings = await Marketplace.find({ seller: req.user.id }).select('_id');
      query.$or = [
        { inquirer: req.user.id },
        { listing: { $in: userListings.map(l => l._id) } }
      ];
    }

    if (status) query.status = status;

    const inquiries = await Inquiry.find(query)
      .populate('listing', 'type pricing description animal')
      .populate('inquirer', 'name farmDetails.farmName profile.avatar')
      .populate('femaleAnimal', 'basicInfo.name registrationNumber')
      .populate('offeredAnimals', 'basicInfo.name registrationNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting inquiries'
    });
  }
});

// @route   PUT /api/marketplace/inquiries/:id/respond
// @desc    Respond to an inquiry (seller only)
// @access  Private
router.put('/inquiries/:id/respond', protect, [
  body('status').isIn(['accepted', 'declined', 'negotiating']).withMessage('Invalid response status'),
  body('message').optional().isString(),
  body('counterOffer').optional().isFloat({ min: 0 })
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

    const inquiry = await Inquiry.findById(req.params.id)
      .populate('listing');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Verify user owns the listing
    if (inquiry.listing.seller.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this inquiry'
      });
    }

    inquiry.status = req.body.status;
    inquiry.sellerResponse = {
      message: req.body.message,
      respondedAt: new Date(),
      counterOffer: req.body.counterOffer
    };

    if (req.body.meetingDetails) {
      inquiry.meetingDetails = req.body.meetingDetails;
    }

    await inquiry.save();

    // TODO: Send notification to inquirer

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Respond to inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error responding to inquiry'
    });
  }
});

module.exports = router; 
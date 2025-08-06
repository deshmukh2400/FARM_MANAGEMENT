const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { 
  ForumCategory, 
  ForumPost, 
  ForumReply, 
  KnowledgeArticle, 
  ExpertProfile, 
  Mentorship, 
  Cooperative 
} = require('../models/Community');
const { protect, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for community uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/community/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed!'), false);
    }
  }
});

// FORUM ROUTES

// @route   GET /api/community/forum/categories
// @desc    Get forum categories
// @access  Public
router.get('/forum/categories', async (req, res) => {
  try {
    const categories = await ForumCategory.find({ isActive: true })
      .populate('lastPost', 'title createdAt')
      .sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get forum categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting forum categories'
    });
  }
});

// @route   GET /api/community/forum/posts
// @desc    Get forum posts
// @access  Public
router.get('/forum/posts', [
  query('category').optional().isMongoId(),
  query('type').optional().isIn(['question', 'discussion', 'experience_share', 'tip', 'alert', 'market_info']),
  query('animalType').optional().isIn(['cattle', 'goat', 'sheep', 'horse', 'pig', 'chicken', 'other']),
  query('search').optional().isString(),
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

    const { category, type, animalType, search, page = 1, limit = 20 } = req.query;

    const query = { status: 'active', isApproved: true };
    if (category) query.category = category;
    if (type) query.type = type;
    if (animalType) query.animalTypes = animalType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      ForumPost.find(query)
        .populate('author', 'name farmDetails.farmName')
        .populate('category', 'name')
        .populate('lastReply', 'content createdAt')
        .sort({ isPinned: -1, lastActivity: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ForumPost.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting forum posts'
    });
  }
});

// @route   GET /api/community/forum/posts/:id
// @desc    Get single forum post with replies
// @access  Public
router.get('/forum/posts/:id', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name farmDetails.farmName')
      .populate('category', 'name')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name farmDetails.farmName'
        }
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting forum post'
    });
  }
});

// @route   POST /api/community/forum/posts
// @desc    Create new forum post
// @access  Private
router.post('/forum/posts', protect, upload.array('images', 5), [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('category').isMongoId().withMessage('Valid category is required'),
  body('type').optional().isIn(['question', 'discussion', 'experience_share', 'tip', 'alert', 'market_info'])
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

    const postData = {
      author: req.user.id,
      ...req.body
    };

    // Process uploaded images
    if (req.files && req.files.length > 0) {
      postData.images = req.files.map(file => ({
        url: `/uploads/community/${file.filename}`,
        filename: file.originalname
      }));
    }

    // Parse arrays from form data
    if (req.body.tags && typeof req.body.tags === 'string') {
      postData.tags = req.body.tags.split(',').map(tag => tag.trim());
    }
    if (req.body.animalTypes && typeof req.body.animalTypes === 'string') {
      postData.animalTypes = req.body.animalTypes.split(',');
    }

    const post = await ForumPost.create(postData);

    // Update category post count
    await ForumCategory.findByIdAndUpdate(postData.category, {
      $inc: { postCount: 1 },
      lastPost: post._id,
      lastActivity: new Date()
    });

    await post.populate([
      { path: 'author', select: 'name farmDetails.farmName' },
      { path: 'category', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Forum post created successfully',
      data: post
    });
  } catch (error) {
    console.error('Create forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating forum post'
    });
  }
});

// @route   POST /api/community/forum/posts/:id/replies
// @desc    Reply to forum post
// @access  Private
router.post('/forum/posts/:id/replies', protect, upload.array('images', 3), [
  body('content').notEmpty().withMessage('Content is required')
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

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    const replyData = {
      author: req.user.id,
      post: req.params.id,
      content: req.body.content,
      parentReply: req.body.parentReply || null
    };

    // Process uploaded images
    if (req.files && req.files.length > 0) {
      replyData.images = req.files.map(file => ({
        url: `/uploads/community/${file.filename}`,
        filename: file.originalname
      }));
    }

    const reply = await ForumReply.create(replyData);

    // Update post with new reply
    post.replies.push(reply._id);
    post.replyCount += 1;
    post.lastReply = reply._id;
    post.lastActivity = new Date();
    await post.save();

    await reply.populate('author', 'name farmDetails.farmName');

    res.status(201).json({
      success: true,
      message: 'Reply posted successfully',
      data: reply
    });
  } catch (error) {
    console.error('Create forum reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating reply'
    });
  }
});

// @route   POST /api/community/forum/posts/:id/like
// @desc    Like/unlike forum post
// @access  Private
router.post('/forum/posts/:id/like', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    const existingLike = post.likes.find(like => 
      like.user.toString() === req.user.id.toString()
    );

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(like => 
        like.user.toString() !== req.user.id.toString()
      );
    } else {
      // Like
      post.likes.push({ user: req.user.id });
    }

    await post.save();

    res.json({
      success: true,
      message: existingLike ? 'Post unliked' : 'Post liked',
      data: {
        liked: !existingLike,
        likeCount: post.likes.length
      }
    });
  } catch (error) {
    console.error('Like forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error liking post'
    });
  }
});

// KNOWLEDGE BASE ROUTES

// @route   GET /api/community/knowledge
// @desc    Get knowledge base articles
// @access  Public
router.get('/knowledge', [
  query('category').optional().isIn(['animal_care', 'breeding', 'nutrition', 'health', 'equipment', 'business', 'regulations', 'sustainability']),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  query('animalType').optional().isIn(['cattle', 'goat', 'sheep', 'horse', 'pig', 'chicken', 'general']),
  query('search').optional().isString(),
  query('featured').optional().isBoolean(),
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

    const { category, difficulty, animalType, search, featured, page = 1, limit = 20 } = req.query;

    const query = { isPublished: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (animalType) query.animalTypes = animalType;
    if (featured) query.featured = featured === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      KnowledgeArticle.find(query)
        .populate('author', 'name')
        .sort(search ? { score: { $meta: 'textScore' } } : { featured: -1, averageRating: -1, views: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      KnowledgeArticle.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: articles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get knowledge articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting knowledge articles'
    });
  }
});

// @route   GET /api/community/knowledge/:id
// @desc    Get single knowledge article
// @access  Public
router.get('/knowledge/:id', async (req, res) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id)
      .populate('author', 'name farmDetails.farmName')
      .populate('contributors.user', 'name')
      .populate('relatedArticles', 'title summary averageRating');

    if (!article || !article.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge article not found'
      });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Get knowledge article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting knowledge article'
    });
  }
});

// @route   POST /api/community/knowledge/:id/rate
// @desc    Rate knowledge article
// @access  Private
router.post('/knowledge/:id/rate', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isString()
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

    const article = await KnowledgeArticle.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge article not found'
      });
    }

    // Remove existing rating from this user
    article.ratings = article.ratings.filter(rating => 
      rating.user.toString() !== req.user.id.toString()
    );

    // Add new rating
    article.ratings.push({
      user: req.user.id,
      rating: req.body.rating,
      review: req.body.review
    });

    await article.save(); // This will trigger the pre-save middleware to calculate average

    res.json({
      success: true,
      message: 'Article rated successfully',
      data: {
        averageRating: article.averageRating,
        ratingCount: article.ratings.length
      }
    });
  } catch (error) {
    console.error('Rate knowledge article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rating article'
    });
  }
});

// EXPERT PROFILE ROUTES

// @route   GET /api/community/experts
// @desc    Get expert profiles
// @access  Public
router.get('/experts', [
  query('specialization').optional().isIn(['veterinary', 'nutrition', 'breeding', 'dairy', 'meat_production', 'organic_farming', 'animal_behavior', 'farm_management', 'equipment', 'business']),
  query('animalExpertise').optional().isIn(['cattle', 'goat', 'sheep', 'horse', 'pig', 'chicken', 'other']),
  query('isVerified').optional().isBoolean(),
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

    const { specialization, animalExpertise, isVerified, page = 1, limit = 20 } = req.query;

    const query = { verificationStatus: 'verified' };
    if (specialization) query.specializations = specialization;
    if (animalExpertise) query.animalExpertise = animalExpertise;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const skip = (page - 1) * limit;

    const [experts, total] = await Promise.all([
      ExpertProfile.find(query)
        .populate('user', 'name farmDetails.farmName')
        .sort({ averageRating: -1, totalConsultations: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ExpertProfile.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: experts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get experts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting experts'
    });
  }
});

// COOPERATIVE ROUTES

// @route   GET /api/community/cooperatives
// @desc    Get cooperatives
// @access  Public
router.get('/cooperatives', [
  query('type').optional().isIn(['buying_group', 'equipment_sharing', 'knowledge_sharing', 'marketing', 'processing', 'multi_purpose']),
  query('animalFocus').optional().isIn(['cattle', 'goat', 'sheep', 'horse', 'pig', 'chicken', 'mixed']),
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

    const { type, animalFocus, location, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };
    if (type) query.type = type;
    if (animalFocus) query.animalFocus = animalFocus;
    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.region': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [cooperatives, total] = await Promise.all([
      Cooperative.find(query)
        .populate('founder', 'name farmDetails.farmName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Cooperative.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: cooperatives,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get cooperatives error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting cooperatives'
    });
  }
});

// @route   POST /api/community/cooperatives
// @desc    Create new cooperative
// @access  Private
router.post('/cooperatives', protect, [
  body('name').notEmpty().withMessage('Cooperative name is required'),
  body('type').isIn(['buying_group', 'equipment_sharing', 'knowledge_sharing', 'marketing', 'processing', 'multi_purpose']),
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

    const cooperativeData = {
      founder: req.user.id,
      administrators: [req.user.id],
      members: [{
        user: req.user.id,
        role: 'coordinator'
      }],
      ...req.body
    };

    const cooperative = await Cooperative.create(cooperativeData);

    await cooperative.populate([
      { path: 'founder', select: 'name farmDetails.farmName' },
      { path: 'members.user', select: 'name farmDetails.farmName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Cooperative created successfully',
      data: cooperative
    });
  } catch (error) {
    console.error('Create cooperative error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating cooperative'
    });
  }
});

module.exports = router; 
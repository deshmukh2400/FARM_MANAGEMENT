const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Inventory = require('../models/Inventory');
const { protect, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/inventory
// @desc    Get all inventory items for the authenticated user
// @access  Private
router.get('/', protect, [
  query('category').optional().isIn(['medicine', 'vaccine', 'feed', 'supplement', 'equipment', 'other']),
  query('lowStock').optional().isBoolean(),
  query('nearExpiry').optional().isBoolean(),
  query('expired').optional().isBoolean(),
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
      lowStock,
      nearExpiry,
      expired,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = { owner: req.user.id, isActive: true };

    if (category) query.category = category;
    if (lowStock === 'true') query['alerts.lowStock'] = true;
    if (nearExpiry === 'true') query['alerts.nearExpiry'] = true;
    if (expired === 'true') query['alerts.expired'] = true;

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Inventory.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Inventory.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting inventory'
    });
  }
});

// @route   GET /api/inventory/:id
// @desc    Get single inventory item
// @access  Private
router.get('/:id', protect, checkOwnership(Inventory), async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate('transactions.animal', 'basicInfo.name registrationNumber')
      .populate('transactions.performedBy', 'name');

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting inventory item'
    });
  }
});

// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Private
router.post('/', protect, [
  body('name').notEmpty().withMessage('Item name is required'),
  body('category').isIn(['medicine', 'vaccine', 'feed', 'supplement', 'equipment', 'other']).withMessage('Invalid category'),
  body('stock.currentQuantity').isFloat({ min: 0 }).withMessage('Current quantity must be a positive number'),
  body('stock.unit').isIn(['kg', 'grams', 'pounds', 'liters', 'ml', 'pieces', 'doses', 'bags', 'bales']).withMessage('Invalid unit'),
  body('stock.minThreshold').optional().isFloat({ min: 0 }).withMessage('Min threshold must be a positive number')
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

    const itemData = {
      owner: req.user.id,
      ...req.body
    };

    // Add initial purchase transaction
    if (req.body.stock.currentQuantity > 0) {
      itemData.transactions = [{
        type: 'purchase',
        quantity: req.body.stock.currentQuantity,
        date: req.body.dates?.purchaseDate || new Date(),
        cost: req.body.pricing?.costPerUnit * req.body.stock.currentQuantity,
        performedBy: req.user.id,
        notes: 'Initial stock'
      }];
    }

    const item = await Inventory.create(itemData);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: item
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating inventory item'
    });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private
router.put('/:id', protect, checkOwnership(Inventory), async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Don't allow direct quantity updates (use transactions instead)
    if (updates.stock && updates.stock.currentQuantity !== undefined) {
      delete updates.stock.currentQuantity;
    }

    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating inventory item'
    });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item (soft delete)
// @access  Private
router.delete('/:id', protect, checkOwnership(Inventory), async (req, res) => {
  try {
    await Inventory.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting inventory item'
    });
  }
});

// @route   POST /api/inventory/:id/transaction
// @desc    Add transaction (purchase, usage, waste, etc.)
// @access  Private
router.post('/:id/transaction', protect, checkOwnership(Inventory), [
  body('type').isIn(['purchase', 'usage', 'waste', 'transfer', 'adjustment']).withMessage('Invalid transaction type'),
  body('quantity').isFloat().withMessage('Quantity must be a number'),
  body('date').optional().isISO8601().withMessage('Valid date is required')
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

    const transaction = {
      type: req.body.type,
      quantity: req.body.quantity,
      date: req.body.date || new Date(),
      animal: req.body.animal,
      notes: req.body.notes,
      cost: req.body.cost,
      performedBy: req.user.id
    };

    const item = await Inventory.findById(req.params.id);
    await item.addTransaction(transaction);

    res.json({
      success: true,
      message: 'Transaction added successfully',
      data: {
        transaction: item.transactions[item.transactions.length - 1],
        currentQuantity: item.stock.currentQuantity,
        stockStatus: item.stockStatus
      }
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding transaction'
    });
  }
});

// @route   GET /api/inventory/alerts/low-stock
// @desc    Get low stock items
// @access  Private
router.get('/alerts/low-stock', protect, async (req, res) => {
  try {
    const lowStockItems = await Inventory.getLowStockItems(req.user.id);

    res.json({
      success: true,
      data: lowStockItems
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting low stock items'
    });
  }
});

// @route   GET /api/inventory/alerts/expiring
// @desc    Get items near expiry
// @access  Private
router.get('/alerts/expiring', protect, [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
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

    const days = parseInt(req.query.days) || 30;
    const expiringItems = await Inventory.getItemsNearExpiry(req.user.id, days);

    res.json({
      success: true,
      data: expiringItems
    });
  } catch (error) {
    console.error('Get expiring items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting expiring items'
    });
  }
});

// @route   GET /api/inventory/stats/dashboard
// @desc    Get inventory dashboard statistics
// @access  Private
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalItems,
      itemsByCategory,
      lowStockCount,
      nearExpiryCount,
      expiredCount,
      totalValue,
      recentTransactions
    ] = await Promise.all([
      Inventory.countDocuments({ owner: userId, isActive: true }),
      
      Inventory.aggregate([
        { $match: { owner: userId, isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      
      Inventory.countDocuments({ owner: userId, isActive: true, 'alerts.lowStock': true }),
      
      Inventory.countDocuments({ owner: userId, isActive: true, 'alerts.nearExpiry': true }),
      
      Inventory.countDocuments({ owner: userId, isActive: true, 'alerts.expired': true }),
      
      Inventory.aggregate([
        { $match: { owner: userId, isActive: true } },
        {
          $project: {
            value: {
              $multiply: ['$stock.currentQuantity', '$pricing.costPerUnit']
            }
          }
        },
        { $group: { _id: null, totalValue: { $sum: '$value' } } }
      ]),
      
      Inventory.find({
        owner: userId,
        isActive: true,
        'transactions.0': { $exists: true }
      })
      .select('name transactions')
      .sort({ 'transactions.date': -1 })
      .limit(10)
    ]);

    res.json({
      success: true,
      data: {
        totalItems,
        itemsByCategory,
        alerts: {
          lowStock: lowStockCount,
          nearExpiry: nearExpiryCount,
          expired: expiredCount
        },
        totalValue: totalValue.length > 0 ? totalValue[0].totalValue : 0,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting inventory statistics'
    });
  }
});

// @route   GET /api/inventory/usage-report
// @desc    Get usage report for a specific period
// @access  Private
router.get('/usage-report', protect, [
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required'),
  query('category').optional().isIn(['medicine', 'vaccine', 'feed', 'supplement', 'equipment', 'other'])
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

    const { startDate, endDate, category } = req.query;
    const matchQuery = {
      owner: req.user.id,
      isActive: true,
      'transactions.date': {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (category) {
      matchQuery.category = category;
    }

    const usageReport = await Inventory.aggregate([
      { $match: matchQuery },
      { $unwind: '$transactions' },
      {
        $match: {
          'transactions.date': {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          'transactions.type': 'usage'
        }
      },
      {
        $group: {
          _id: {
            itemId: '$_id',
            name: '$name',
            category: '$category',
            unit: '$stock.unit'
          },
          totalUsage: { $sum: '$transactions.quantity' },
          totalCost: { $sum: '$transactions.cost' },
          usageCount: { $sum: 1 }
        }
      },
      { $sort: { totalUsage: -1 } }
    ]);

    res.json({
      success: true,
      data: usageReport,
      period: {
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Get usage report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting usage report'
    });
  }
});

module.exports = router; 
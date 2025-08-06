const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Expense, Revenue, Budget, FinancialReport } = require('../models/Financial');
const { protect, checkOwnership } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for receipt/invoice uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/financial/');
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

// EXPENSE ROUTES

// @route   GET /api/financial/expenses
// @desc    Get all expenses for the authenticated user
// @access  Private
router.get('/expenses', protect, [
  query('category').optional().isString(),
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
      category,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = { owner: req.user.id };

    if (category) query.category = category;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'vendor.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate('relatedAnimals', 'basicInfo.name registrationNumber')
        .populate('relatedInventory', 'name category')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Expense.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting expenses'
    });
  }
});

// @route   POST /api/financial/expenses
// @desc    Create new expense
// @access  Private
router.post('/expenses', protect, upload.single('receipt'), [
  body('category').isIn(['feed', 'veterinary', 'equipment', 'labor', 'utilities', 'maintenance', 'transport', 'insurance', 'supplies', 'other']),
  body('description').notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
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

    const expenseData = {
      owner: req.user.id,
      ...req.body
    };

    // Add receipt if uploaded
    if (req.file) {
      expenseData.receipt = {
        url: `/uploads/financial/${req.file.filename}`,
        filename: req.file.originalname
      };
    }

    const expense = await Expense.create(expenseData);

    await expense.populate([
      { path: 'relatedAnimals', select: 'basicInfo.name registrationNumber' },
      { path: 'relatedInventory', select: 'name category' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating expense'
    });
  }
});

// REVENUE ROUTES

// @route   GET /api/financial/revenue
// @desc    Get all revenue for the authenticated user
// @access  Private
router.get('/revenue', protect, [
  query('type').optional().isString(),
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
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = { owner: req.user.id };

    if (type) query.type = type;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [revenues, total] = await Promise.all([
      Revenue.find(query)
        .populate('relatedAnimals', 'basicInfo.name registrationNumber')
        .populate('customer.userId', 'name farmDetails.farmName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Revenue.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: revenues,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting revenue'
    });
  }
});

// @route   POST /api/financial/revenue
// @desc    Create new revenue entry
// @access  Private
router.post('/revenue', protect, upload.single('invoice'), [
  body('type').isIn(['animal_sale', 'milk_sale', 'breeding_service', 'consultation', 'equipment_rental', 'other']),
  body('description').notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
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

    const revenueData = {
      owner: req.user.id,
      ...req.body
    };

    // Add invoice if uploaded
    if (req.file) {
      revenueData.invoice = {
        url: `/uploads/financial/${req.file.filename}`,
        filename: req.file.originalname,
        number: req.body.invoiceNumber || `INV-${Date.now()}`
      };
    }

    const revenue = await Revenue.create(revenueData);

    await revenue.populate([
      { path: 'relatedAnimals', select: 'basicInfo.name registrationNumber' },
      { path: 'customer.userId', select: 'name farmDetails.farmName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Revenue entry created successfully',
      data: revenue
    });
  } catch (error) {
    console.error('Create revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating revenue entry'
    });
  }
});

// ANALYTICS & REPORTS

// @route   GET /api/financial/dashboard
// @desc    Get financial dashboard data
// @access  Private
router.get('/dashboard', protect, [
  query('period').optional().isIn(['7days', '30days', '90days', '1year'])
], async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    const userId = req.user.id;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const [
      totalRevenue,
      totalExpenses,
      revenueByType,
      expensesByCategory,
      recentTransactions,
      cashFlow
    ] = await Promise.all([
      Revenue.aggregate([
        { $match: { owner: userId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      Expense.aggregate([
        { $match: { owner: userId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      Revenue.aggregate([
        { $match: { owner: userId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      
      Expense.aggregate([
        { $match: { owner: userId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      
      // Recent transactions (combined revenue and expenses)
      Promise.all([
        Revenue.find({ owner: userId }).sort({ date: -1 }).limit(5)
          .populate('relatedAnimals', 'basicInfo.name'),
        Expense.find({ owner: userId }).sort({ date: -1 }).limit(5)
          .populate('relatedAnimals', 'basicInfo.name')
      ]),
      
      Revenue.getCashFlow(userId, startDate, endDate, 'weekly')
    ]);

    const revenueTotal = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    const expensesTotal = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
    const netProfit = revenueTotal - expensesTotal;
    const profitMargin = revenueTotal > 0 ? (netProfit / revenueTotal) * 100 : 0;

    // Combine and sort recent transactions
    const [recentRevenue, recentExpenses] = recentTransactions;
    const allTransactions = [
      ...recentRevenue.map(r => ({ ...r.toObject(), type: 'revenue' })),
      ...recentExpenses.map(e => ({ ...e.toObject(), type: 'expense' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: revenueTotal,
          totalExpenses: expensesTotal,
          netProfit,
          profitMargin: Math.round(profitMargin * 100) / 100
        },
        revenueByType,
        expensesByCategory,
        recentTransactions: allTransactions,
        cashFlow,
        period
      }
    });
  } catch (error) {
    console.error('Get financial dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting financial dashboard'
    });
  }
});

// @route   GET /api/financial/profit-loss
// @desc    Get profit & loss report
// @access  Private
router.get('/profit-loss', protect, [
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

    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    const profitLoss = await Expense.getProfitLoss(
      userId,
      new Date(startDate),
      new Date(endDate)
    );

    // Calculate additional metrics
    const grossProfitMargin = profitLoss.totalRevenue > 0 ? 
      (profitLoss.netProfit / profitLoss.totalRevenue) * 100 : 0;

    const expenseRatio = profitLoss.totalRevenue > 0 ? 
      (profitLoss.totalExpenses / profitLoss.totalRevenue) * 100 : 0;

    res.json({
      success: true,
      data: {
        ...profitLoss,
        grossProfitMargin: Math.round(grossProfitMargin * 100) / 100,
        expenseRatio: Math.round(expenseRatio * 100) / 100,
        period: {
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    console.error('Get profit loss error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating profit & loss report'
    });
  }
});

// @route   GET /api/financial/cash-flow
// @desc    Get cash flow report
// @access  Private
router.get('/cash-flow', protect, [
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required'),
  query('interval').optional().isIn(['daily', 'weekly', 'monthly'])
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

    const { startDate, endDate, interval = 'monthly' } = req.query;
    const userId = req.user.id;

    const cashFlow = await Revenue.getCashFlow(
      userId,
      new Date(startDate),
      new Date(endDate),
      interval
    );

    // Calculate running balance
    let runningBalance = 0;
    const cashFlowWithBalance = cashFlow.map(item => {
      runningBalance += item.netCashFlow;
      return {
        ...item,
        runningBalance
      };
    });

    res.json({
      success: true,
      data: {
        cashFlow: cashFlowWithBalance,
        period: {
          startDate,
          endDate
        },
        interval
      }
    });
  } catch (error) {
    console.error('Get cash flow error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating cash flow report'
    });
  }
});

// BUDGET ROUTES

// @route   GET /api/financial/budgets
// @desc    Get all budgets
// @access  Private
router.get('/budgets', protect, async (req, res) => {
  try {
    const budgets = await Budget.find({ owner: req.user.id })
      .sort({ startDate: -1 });

    res.json({
      success: true,
      data: budgets
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting budgets'
    });
  }
});

// @route   POST /api/financial/budgets
// @desc    Create new budget
// @access  Private
router.post('/budgets', protect, [
  body('name').notEmpty().withMessage('Budget name is required'),
  body('period').isIn(['monthly', 'quarterly', 'yearly']).withMessage('Invalid period'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('categories').isArray().withMessage('Categories must be an array'),
  body('totalBudget').isFloat({ min: 0 }).withMessage('Total budget must be positive')
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

    const budgetData = {
      owner: req.user.id,
      ...req.body
    };

    const budget = await Budget.create(budgetData);

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: budget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating budget'
    });
  }
});

module.exports = router; 
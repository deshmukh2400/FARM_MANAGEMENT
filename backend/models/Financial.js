const mongoose = require('mongoose');

// Expense Schema
const expenseSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['feed', 'veterinary', 'equipment', 'labor', 'utilities', 'maintenance', 'transport', 'insurance', 'supplies', 'other']
  },
  subcategory: String,
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'bank_transfer', 'check', 'mobile_payment', 'other'],
    default: 'cash'
  },
  vendor: {
    name: String,
    contact: String,
    address: String
  },
  relatedAnimals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal'
  }],
  relatedInventory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory'
  }],
  receipt: {
    url: String,
    filename: String
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly']
    },
    nextDate: Date,
    endDate: Date
  },
  tags: [String],
  notes: String,
  isApproved: {
    type: Boolean,
    default: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Revenue Schema
const revenueSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['animal_sale', 'milk_sale', 'breeding_service', 'consultation', 'equipment_rental', 'other']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'bank_transfer', 'check', 'mobile_payment', 'other'],
    default: 'cash'
  },
  customer: {
    name: String,
    contact: String,
    address: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  relatedAnimals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal'
  }],
  quantity: {
    type: Number,
    default: 1
  },
  unitPrice: Number,
  invoice: {
    number: String,
    url: String,
    filename: String
  },
  taxes: {
    amount: {
      type: Number,
      default: 0
    },
    rate: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Budget Schema
const budgetSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  period: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  categories: [{
    category: {
      type: String,
      required: true
    },
    budgetedAmount: {
      type: Number,
      required: true,
      min: 0
    },
    actualAmount: {
      type: Number,
      default: 0
    },
    variance: {
      type: Number,
      default: 0
    }
  }],
  totalBudget: {
    type: Number,
    required: true,
    min: 0
  },
  totalActual: {
    type: Number,
    default: 0
  },
  totalVariance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  notes: String
}, {
  timestamps: true
});

// Financial Report Schema
const financialReportSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    required: true,
    enum: ['profit_loss', 'cash_flow', 'balance_sheet', 'expense_analysis', 'revenue_analysis', 'budget_variance']
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  data: {
    totalRevenue: Number,
    totalExpenses: Number,
    netProfit: Number,
    profitMargin: Number,
    expensesByCategory: [{
      category: String,
      amount: Number,
      percentage: Number
    }],
    revenueByType: [{
      type: String,
      amount: Number,
      percentage: Number
    }],
    trends: [{
      period: String,
      revenue: Number,
      expenses: Number,
      profit: Number
    }],
    kpis: [{
      name: String,
      value: Number,
      unit: String,
      trend: String // 'up', 'down', 'stable'
    }]
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  fileUrl: String
}, {
  timestamps: true
});

// Indexes
expenseSchema.index({ owner: 1, date: -1 });
expenseSchema.index({ owner: 1, category: 1, date: -1 });
revenueSchema.index({ owner: 1, date: -1 });
revenueSchema.index({ owner: 1, type: 1, date: -1 });
budgetSchema.index({ owner: 1, period: 1, startDate: 1 });
financialReportSchema.index({ owner: 1, reportType: 1, 'period.startDate': -1 });

// Virtual for expense per animal
expenseSchema.virtual('costPerAnimal').get(function() {
  if (this.relatedAnimals && this.relatedAnimals.length > 0) {
    return this.amount / this.relatedAnimals.length;
  }
  return null;
});

// Pre-save middleware for budget calculations
budgetSchema.pre('save', function(next) {
  // Calculate total actual and variance
  this.totalActual = this.categories.reduce((sum, cat) => sum + (cat.actualAmount || 0), 0);
  this.totalVariance = this.totalActual - this.totalBudget;
  
  // Calculate variance for each category
  this.categories.forEach(cat => {
    cat.variance = (cat.actualAmount || 0) - cat.budgetedAmount;
  });
  
  next();
});

// Static method to calculate profit/loss for a period
expenseSchema.statics.getProfitLoss = async function(ownerId, startDate, endDate) {
  const Revenue = mongoose.model('Revenue');
  
  const [expenses, revenues] = await Promise.all([
    this.aggregate([
      {
        $match: {
          owner: ownerId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]),
    Revenue.aggregate([
      {
        $match: {
          owner: ownerId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ])
  ]);
  
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.total, 0);
  const totalRevenue = revenues.reduce((sum, rev) => sum + rev.total, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    expensesByCategory: expenses,
    revenueByType: revenues
  };
};

// Static method to get cash flow
revenueSchema.statics.getCashFlow = async function(ownerId, startDate, endDate, interval = 'monthly') {
  const Expense = mongoose.model('Expense');
  
  const dateFormat = interval === 'monthly' ? '%Y-%m' : interval === 'weekly' ? '%Y-%U' : '%Y-%m-%d';
  
  const [revenueFlow, expenseFlow] = await Promise.all([
    this.aggregate([
      {
        $match: {
          owner: ownerId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$date' } },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Expense.aggregate([
      {
        $match: {
          owner: ownerId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$date' } },
          expenses: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);
  
  // Merge revenue and expense data
  const cashFlow = {};
  revenueFlow.forEach(item => {
    cashFlow[item._id] = { period: item._id, revenue: item.revenue, expenses: 0, netCashFlow: item.revenue };
  });
  
  expenseFlow.forEach(item => {
    if (cashFlow[item._id]) {
      cashFlow[item._id].expenses = item.expenses;
      cashFlow[item._id].netCashFlow = cashFlow[item._id].revenue - item.expenses;
    } else {
      cashFlow[item._id] = { period: item._id, revenue: 0, expenses: item.expenses, netCashFlow: -item.expenses };
    }
  });
  
  return Object.values(cashFlow).sort((a, b) => a.period.localeCompare(b.period));
};

const Expense = mongoose.model('Expense', expenseSchema);
const Revenue = mongoose.model('Revenue', revenueSchema);
const Budget = mongoose.model('Budget', budgetSchema);
const FinancialReport = mongoose.model('FinancialReport', financialReportSchema);

module.exports = { Expense, Revenue, Budget, FinancialReport }; 
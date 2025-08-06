const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['medicine', 'vaccine', 'feed', 'supplement', 'equipment', 'other']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  brand: String,
  
  // Medicine/Vaccine specific fields
  activeIngredient: String,
  concentration: String,
  dosageForm: {
    type: String,
    enum: ['tablet', 'liquid', 'injection', 'powder', 'capsule', 'other']
  },
  
  // Feed specific fields
  feedType: {
    type: String,
    enum: ['hay', 'grain', 'pellets', 'silage', 'pasture', 'concentrate', 'other']
  },
  nutritionalInfo: {
    protein: Number, // percentage
    fat: Number, // percentage
    fiber: Number, // percentage
    moisture: Number, // percentage
    energy: Number // Mcal/kg
  },
  
  stock: {
    currentQuantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'grams', 'pounds', 'liters', 'ml', 'pieces', 'doses', 'bags', 'bales']
    },
    minThreshold: {
      type: Number,
      default: 0
    },
    maxCapacity: Number
  },
  
  pricing: {
    costPerUnit: {
      type: Number,
      min: [0, 'Cost cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    lastPurchasePrice: Number,
    averageCost: Number
  },
  
  supplier: {
    name: String,
    contact: String,
    address: String,
    email: String,
    phone: String
  },
  
  dates: {
    purchaseDate: Date,
    expiryDate: Date,
    manufacturingDate: Date,
    lastRestockDate: Date
  },
  
  storage: {
    location: String,
    conditions: {
      temperature: String, // e.g., "2-8°C", "Room temperature"
      humidity: String,
      lightConditions: String, // e.g., "Dark", "Away from direct sunlight"
      specialInstructions: String
    }
  },
  
  batchInfo: {
    batchNumber: String,
    lotNumber: String,
    serialNumber: String
  },
  
  usage: {
    targetAnimals: [{
      type: String,
      enum: ['goat', 'cattle', 'sheep', 'horse', 'pig', 'chicken', 'all']
    }],
    dosageInstructions: String,
    withdrawalPeriod: String, // for medicines
    frequency: String
  },
  
  transactions: [{
    type: {
      type: String,
      enum: ['purchase', 'usage', 'waste', 'transfer', 'adjustment'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal'
    },
    notes: String,
    cost: Number,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  alerts: {
    lowStock: {
      type: Boolean,
      default: false
    },
    nearExpiry: {
      type: Boolean,
      default: false
    },
    expired: {
      type: Boolean,
      default: false
    }
  },
  
  tags: [String],
  notes: String,
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
inventorySchema.index({ owner: 1, category: 1 });
inventorySchema.index({ name: 1, owner: 1 });
inventorySchema.index({ 'dates.expiryDate': 1 });
inventorySchema.index({ 'stock.currentQuantity': 1, 'stock.minThreshold': 1 });

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  const current = this.stock.currentQuantity;
  const min = this.stock.minThreshold;
  
  if (current === 0) return 'out_of_stock';
  if (current <= min) return 'low_stock';
  if (this.stock.maxCapacity && current >= this.stock.maxCapacity * 0.9) return 'overstocked';
  return 'in_stock';
});

// Virtual for expiry status
inventorySchema.virtual('expiryStatus').get(function() {
  if (!this.dates.expiryDate) return 'no_expiry';
  
  const now = new Date();
  const expiryDate = new Date(this.dates.expiryDate);
  const daysToExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysToExpiry < 0) return 'expired';
  if (daysToExpiry <= 30) return 'near_expiry';
  if (daysToExpiry <= 90) return 'approaching_expiry';
  return 'fresh';
});

// Pre-save middleware to update alerts
inventorySchema.pre('save', function(next) {
  // Update stock alerts
  this.alerts.lowStock = this.stock.currentQuantity <= this.stock.minThreshold;
  
  // Update expiry alerts
  if (this.dates.expiryDate) {
    const now = new Date();
    const expiryDate = new Date(this.dates.expiryDate);
    const daysToExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    this.alerts.expired = daysToExpiry < 0;
    this.alerts.nearExpiry = daysToExpiry >= 0 && daysToExpiry <= 30;
  }
  
  next();
});

// Method to add transaction and update stock
inventorySchema.methods.addTransaction = function(transaction) {
  this.transactions.push(transaction);
  
  // Update current quantity based on transaction type
  switch (transaction.type) {
    case 'purchase':
      this.stock.currentQuantity += transaction.quantity;
      this.stock.lastRestockDate = transaction.date;
      break;
    case 'usage':
    case 'waste':
      this.stock.currentQuantity -= transaction.quantity;
      break;
    case 'adjustment':
      // Adjustment can be positive or negative
      this.stock.currentQuantity += transaction.quantity;
      break;
  }
  
  // Ensure quantity doesn't go below 0
  this.stock.currentQuantity = Math.max(0, this.stock.currentQuantity);
  
  return this.save();
};

// Static method to get low stock items
inventorySchema.statics.getLowStockItems = function(ownerId) {
  return this.find({
    owner: ownerId,
    $expr: { $lte: ['$stock.currentQuantity', '$stock.minThreshold'] },
    isActive: true
  });
};

// Static method to get items near expiry
inventorySchema.statics.getItemsNearExpiry = function(ownerId, days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    owner: ownerId,
    'dates.expiryDate': { $lte: futureDate, $gte: new Date() },
    isActive: true
  });
};

module.exports = mongoose.model('Inventory', inventorySchema); 
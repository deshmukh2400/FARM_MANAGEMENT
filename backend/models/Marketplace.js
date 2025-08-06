const mongoose = require('mongoose');

const marketplaceSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['sale', 'mating_service', 'lease', 'exchange']
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'reserved', 'expired', 'cancelled'],
    default: 'active'
  },
  pricing: {
    price: {
      type: Number,
      required: function() {
        return this.type === 'sale' || this.type === 'lease';
      },
      min: [0, 'Price cannot be negative']
    },
    matingFee: {
      type: Number,
      required: function() {
        return this.type === 'mating_service';
      },
      min: [0, 'Mating fee cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    negotiable: {
      type: Boolean,
      default: true
    },
    leaseDuration: {
      type: Number, // in days
      required: function() {
        return this.type === 'lease';
      }
    }
  },
  description: {
    type: String,
    required: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  highlights: [String], // Key selling points
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  availability: {
    availableFrom: {
      type: Date,
      default: Date.now
    },
    availableUntil: Date,
    immediateAvailable: {
      type: Boolean,
      default: true
    }
  },
  requirements: {
    // For mating services
    femaleRequirements: {
      minAge: Number, // in months
      maxAge: Number,
      healthCertificateRequired: {
        type: Boolean,
        default: false
      },
      vaccinationRequired: [String],
      breedRestrictions: [String]
    },
    // For sales
    buyerRequirements: {
      experienceLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'expert', 'any'],
        default: 'any'
      },
      farmType: [String],
      references: {
        type: Boolean,
        default: false
      }
    }
  },
  media: {
    featuredImage: String,
    images: [String],
    videos: [String]
  },
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    inquiries: {
      type: Number,
      default: 0
    },
    favorites: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  promotionExpiry: Date,
  
  // For completed transactions
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  soldDate: Date,
  finalPrice: Number,
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Inquiry/Request schema for interested buyers
const inquirySchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Marketplace',
    required: true
  },
  inquirer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase_inquiry', 'mating_request', 'lease_inquiry', 'exchange_proposal'],
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  offerPrice: {
    type: Number,
    min: [0, 'Offer price cannot be negative']
  },
  proposedDates: [{
    type: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'negotiating', 'completed'],
    default: 'pending'
  },
  sellerResponse: {
    message: String,
    respondedAt: Date,
    counterOffer: Number
  },
  meetingDetails: {
    scheduledDate: Date,
    location: String,
    notes: String
  },
  // For mating requests
  femaleAnimal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal'
  },
  expectedDueDate: Date,
  
  // For exchange proposals
  offeredAnimals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal'
  }],
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for marketplace
marketplaceSchema.index({ seller: 1, type: 1 });
marketplaceSchema.index({ type: 1, status: 1 });
marketplaceSchema.index({ 'location.city': 1, 'location.state': 1 });
marketplaceSchema.index({ 'pricing.price': 1 });
marketplaceSchema.index({ featured: 1, createdAt: -1 });

// Indexes for inquiry
inquirySchema.index({ listing: 1, inquirer: 1 });
inquirySchema.index({ inquirer: 1, status: 1 });

// Virtual for days since posted
marketplaceSchema.virtual('daysSincePosted').get(function() {
  const now = new Date();
  const posted = new Date(this.createdAt);
  return Math.floor((now - posted) / (1000 * 60 * 60 * 24));
});

// Method to increment view count
marketplaceSchema.methods.incrementViews = function() {
  this.metrics.views += 1;
  return this.save();
};

// Method to add to favorites
marketplaceSchema.methods.addToFavorites = function() {
  this.metrics.favorites += 1;
  return this.save();
};

// Method to create inquiry
marketplaceSchema.methods.createInquiry = async function(inquiryData) {
  const Inquiry = mongoose.model('Inquiry');
  this.metrics.inquiries += 1;
  await this.save();
  
  return await Inquiry.create({
    listing: this._id,
    ...inquiryData
  });
};

// Static method to search listings
marketplaceSchema.statics.searchListings = function(filters) {
  const query = { status: 'active', isActive: true };
  
  if (filters.type) query.type = filters.type;
  if (filters.category) {
    // Need to populate animal and filter by category
    return this.find(query).populate({
      path: 'animal',
      match: { 'basicInfo.category': filters.category }
    });
  }
  if (filters.minPrice) query['pricing.price'] = { $gte: filters.minPrice };
  if (filters.maxPrice) {
    if (query['pricing.price']) {
      query['pricing.price'].$lte = filters.maxPrice;
    } else {
      query['pricing.price'] = { $lte: filters.maxPrice };
    }
  }
  if (filters.location) {
    query.$or = [
      { 'location.city': new RegExp(filters.location, 'i') },
      { 'location.state': new RegExp(filters.location, 'i') }
    ];
  }
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  return this.find(query)
    .populate('seller', 'name farmDetails.farmName profile.avatar')
    .populate('animal')
    .sort({ featured: -1, createdAt: -1 });
};

// Pre-save middleware to update status based on availability
marketplaceSchema.pre('save', function(next) {
  if (this.availability.availableUntil && new Date() > this.availability.availableUntil) {
    this.status = 'expired';
  }
  next();
});

const Marketplace = mongoose.model('Marketplace', marketplaceSchema);
const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = { Marketplace, Inquiry }; 
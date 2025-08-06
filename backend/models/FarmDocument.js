const mongoose = require('mongoose');

// Farm Document Schema for managing official farm documents
const farmDocumentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: [
      'business_license',
      'farm_registration', 
      'tax_certificate',
      'veterinary_license',
      'organic_certificate',
      'insurance_policy',
      'land_ownership',
      'lease_agreement',
      'animal_health_certificate',
      'feed_registration',
      'water_rights',
      'environmental_permit',
      'building_permit',
      'zoning_certificate',
      'other'
    ]
  },
  documentCategory: {
    type: String,
    enum: ['legal', 'financial', 'operational', 'compliance', 'certification'],
    required: true
  },
  documentName: {
    type: String,
    required: true,
    trim: true
  },
  documentNumber: String,
  description: String,
  issuingAuthority: {
    name: String,
    department: String,
    contactInfo: {
      phone: String,
      email: String,
      address: String
    }
  },
  issuedDate: Date,
  expiryDate: Date,
  reminderSettings: {
    enableReminder: {
      type: Boolean,
      default: true
    },
    reminderDays: {
      type: Number,
      default: 30 // Remind 30 days before expiry
    },
    lastReminderSent: Date
  },
  fileDetails: {
    originalFilename: String,
    filename: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  versions: [{
    version: {
      type: Number,
      required: true
    },
    filename: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changeReason: String,
    isActive: {
      type: Boolean,
      default: false
    }
  }],
  verificationStatus: {
    status: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected', 'expired', 'requires_update'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    rejectionReason: String,
    verificationNotes: String,
    verificationHistory: [{
      status: String,
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      changedAt: {
        type: Date,
        default: Date.now
      },
      notes: String
    }]
  },
  complianceInfo: {
    isRequired: {
      type: Boolean,
      default: true
    },
    complianceLevel: {
      type: String,
      enum: ['federal', 'state', 'local', 'industry', 'voluntary']
    },
    regulatoryBody: String,
    penaltyForNonCompliance: String
  },
  accessControl: {
    isPublic: {
      type: Boolean,
      default: false
    },
    sharedWith: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      accessLevel: {
        type: String,
        enum: ['view', 'edit', 'admin'],
        default: 'view'
      },
      sharedAt: {
        type: Date,
        default: Date.now
      },
      sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  tags: [String],
  notes: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived', 'deleted'],
    default: 'active'
  },
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'viewed', 'downloaded', 'shared', 'verified', 'archived', 'deleted']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    details: String,
    ipAddress: String,
    userAgent: String
  }]
}, {
  timestamps: true
});

// Document Reminder Schema for tracking renewal reminders
const documentReminderSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FarmDocument',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reminderType: {
    type: String,
    enum: ['expiry_warning', 'renewal_due', 'compliance_check', 'verification_required'],
    required: true
  },
  reminderDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notificationMethods: [{
    method: {
      type: String,
      enum: ['email', 'sms', 'push_notification', 'in_app']
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    deliveryStatus: {
      type: String,
      enum: ['pending', 'delivered', 'failed', 'bounced']
    }
  }],
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedAt: Date,
  snoozedUntil: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Farm Profile Schema for enhanced farm information
const farmProfileSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  basicInfo: {
    farmName: {
      type: String,
      required: true,
      trim: true
    },
    farmLogo: {
      url: String,
      filename: String,
      uploadedAt: Date
    },
    tagline: String,
    description: String,
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String
    }
  },
  operationalDetails: {
    farmSize: {
      value: Number,
      unit: {
        type: String,
        enum: ['acres', 'hectares', 'square_feet', 'square_meters'],
        default: 'acres'
      }
    },
    farmType: {
      type: String,
      enum: ['dairy', 'beef', 'mixed', 'goat', 'sheep', 'poultry', 'swine', 'organic', 'conventional', 'other'],
      required: true
    },
    primaryProducts: [String],
    animalCapacity: {
      current: Number,
      maximum: Number
    },
    operatingHours: {
      weekdays: {
        open: String,
        close: String
      },
      weekends: {
        open: String,
        close: String
      },
      holidays: String
    },
    seasonalOperations: {
      isYearRound: {
        type: Boolean,
        default: true
      },
      operationalMonths: [String]
    }
  },
  locationDetails: {
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    climateZone: String,
    averageRainfall: Number,
    averageTemperature: {
      min: Number,
      max: Number
    },
    soilType: String,
    waterSource: [String]
  },
  legalInformation: {
    businessStructure: {
      type: String,
      enum: ['sole_proprietorship', 'partnership', 'llc', 'corporation', 'cooperative', 'other']
    },
    registrationNumber: String,
    taxId: String,
    establishedYear: Number,
    licenses: [String]
  },
  sustainability: {
    practicesUsed: [String],
    certifications: [String],
    environmentalGoals: [String],
    sustainabilityScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  marketingInfo: {
    isPubliclyVisible: {
      type: Boolean,
      default: false
    },
    allowDirectSales: {
      type: Boolean,
      default: false
    },
    deliveryOptions: [String],
    paymentMethods: [String],
    minimumOrder: Number,
    servingRadius: Number // in miles/kilometers
  },
  verificationStatus: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationLevel: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'enterprise']
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationBadges: [String]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
farmDocumentSchema.index({ owner: 1, documentType: 1 });
farmDocumentSchema.index({ owner: 1, expiryDate: 1 });
farmDocumentSchema.index({ owner: 1, 'verificationStatus.status': 1 });
farmDocumentSchema.index({ expiryDate: 1, 'reminderSettings.enableReminder': 1 });

documentReminderSchema.index({ owner: 1, reminderDate: 1 });
documentReminderSchema.index({ document: 1, isActive: 1 });

farmProfileSchema.index({ owner: 1 });
farmProfileSchema.index({ 'basicInfo.farmName': 'text', 'basicInfo.description': 'text' });
farmProfileSchema.index({ 'operationalDetails.farmType': 1, 'marketingInfo.isPubliclyVisible': 1 });

// Virtual for document status
farmDocumentSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

farmDocumentSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to add audit trail entry
farmDocumentSchema.methods.addAuditEntry = function(action, performedBy, details, req) {
  this.auditTrail.push({
    action,
    performedBy,
    details,
    ipAddress: req?.ip,
    userAgent: req?.get('User-Agent')
  });
  return this.save();
};

// Method to create new version
farmDocumentSchema.methods.createNewVersion = function(fileData, uploadedBy, changeReason) {
  // Deactivate current version
  this.versions.forEach(version => {
    version.isActive = false;
  });

  // Add new version
  const newVersion = {
    version: this.versions.length + 1,
    filename: fileData.filename,
    fileUrl: fileData.fileUrl,
    uploadedBy,
    changeReason,
    isActive: true
  };

  this.versions.push(newVersion);
  
  // Update main file details
  this.fileDetails = {
    ...this.fileDetails,
    ...fileData
  };

  return this.save();
};

// Static method to find expiring documents
farmDocumentSchema.statics.findExpiringDocuments = function(daysAhead = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return this.find({
    expiryDate: {
      $lte: futureDate,
      $gte: new Date()
    },
    status: 'active',
    'reminderSettings.enableReminder': true
  }).populate('owner', 'name email phone');
};

// Pre-save middleware to update verification history
farmDocumentSchema.pre('save', function(next) {
  if (this.isModified('verificationStatus.status')) {
    this.verificationStatus.verificationHistory.push({
      status: this.verificationStatus.status,
      changedAt: new Date()
    });
  }
  next();
});

const FarmDocument = mongoose.model('FarmDocument', farmDocumentSchema);
const DocumentReminder = mongoose.model('DocumentReminder', documentReminderSchema);
const FarmProfile = mongoose.model('FarmProfile', farmProfileSchema);

module.exports = {
  FarmDocument,
  DocumentReminder,
  FarmProfile
}; 
const mongoose = require('mongoose');

// Regional Configuration Schema
const regionalConfigSchema = new mongoose.Schema({
  region: {
    type: String,
    required: true,
    unique: true,
    enum: ['north_america', 'europe', 'south_asia', 'africa', 'latin_america', 'east_asia', 'southeast_asia', 'middle_east', 'oceania', 'global_default']
  },
  countries: [{
    code: {
      type: String,
      required: true
    }, // ISO country code (US, IN, BR, etc.)
    name: {
      type: String,
      required: true
    },
    currency: String,
    language: String,
    timezone: String
  }],
  
  // Localization settings
  localization: {
    defaultLanguage: {
      type: String,
      default: 'en'
    },
    supportedLanguages: [String],
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      default: '12h'
    },
    numberFormat: {
      decimalSeparator: {
        type: String,
        default: '.'
      },
      thousandsSeparator: {
        type: String,
        default: ','
      }
    }
  },

  // Regional animal breeds and types
  animalBreeds: {
    cattle: [{
      name: String,
      localName: String,
      characteristics: [String],
      commonUses: [String]
    }],
    goat: [{
      name: String,
      localName: String,
      characteristics: [String],
      commonUses: [String]
    }],
    sheep: [{
      name: String,
      localName: String,
      characteristics: [String],
      commonUses: [String]
    }],
    poultry: [{
      name: String,
      localName: String,
      characteristics: [String],
      commonUses: [String]
    }],
    swine: [{
      name: String,
      localName: String,
      characteristics: [String],
      commonUses: [String]
    }],
    buffalo: [{
      name: String,
      localName: String,
      characteristics: [String],
      commonUses: [String]
    }]
  },

  // Regional farming practices
  farmingPractices: {
    commonCrops: [String],
    seasonalPatterns: [{
      season: String,
      months: [String],
      activities: [String],
      weatherPattern: String
    }],
    traditionalMethods: [String],
    modernTechniques: [String]
  },

  // Regional regulations and compliance
  regulations: {
    animalRegistration: {
      required: {
        type: Boolean,
        default: false
      },
      authority: String,
      process: String,
      fees: [{
        type: String,
        amount: Number,
        currency: String
      }]
    },
    vaccinationMandatory: {
      cattle: [String],
      goat: [String],
      sheep: [String],
      poultry: [String],
      swine: [String],
      buffalo: [String]
    },
    movementRestrictions: {
      domesticMovement: String,
      internationalMovement: String,
      quarantineRequirements: String
    },
    recordKeeping: {
      mandatory: {
        type: Boolean,
        default: false
      },
      retentionPeriod: String,
      digitalAcceptance: {
        type: Boolean,
        default: true
      }
    }
  },

  // Regional market information
  marketInfo: {
    commonMarkets: [String],
    pricingUnits: {
      weight: {
        type: String,
        default: 'kg'
      },
      volume: {
        type: String,
        default: 'liter'
      },
      currency: String
    },
    tradingPlatforms: [String],
    seasonalDemand: [{
      product: String,
      peakMonths: [String],
      averagePrice: Number
    }]
  },

  // Weather and climate data
  climate: {
    type: {
      type: String,
      enum: ['tropical', 'subtropical', 'temperate', 'continental', 'polar', 'arid', 'semi-arid']
    },
    averageTemperature: {
      summer: Number,
      winter: Number,
      unit: {
        type: String,
        default: 'celsius'
      }
    },
    rainfall: {
      annual: Number,
      rainyMonths: [String],
      unit: {
        type: String,
        default: 'mm'
      }
    },
    humidity: {
      average: Number,
      seasonal: [{
        season: String,
        level: Number
      }]
    }
  },

  // Emergency and disaster information
  emergencyInfo: {
    commonDisasters: [String],
    emergencyContacts: [{
      service: String,
      number: String,
      availability: String
    }],
    evacuationProcedures: String,
    animalRescueProtocols: String
  },

  // System configuration
  systemConfig: {
    measurementSystem: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    },
    defaultCurrency: String,
    taxSettings: {
      applicableTaxes: [String],
      taxRates: [{
        category: String,
        rate: Number
      }]
    },
    businessHours: {
      start: String,
      end: String,
      workingDays: [String]
    }
  },

  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dataSource: {
    organization: String,
    reference: String,
    validityPeriod: Date
  },
  version: {
    type: String,
    default: '1.0.0'
  }
}, {
  timestamps: true
});

// Indexes for better performance
regionalConfigSchema.index({ region: 1 });
regionalConfigSchema.index({ 'countries.code': 1 });
regionalConfigSchema.index({ isActive: 1 });

// Methods
regionalConfigSchema.methods.getLocalizedBreeds = function(animalType) {
  return this.animalBreeds[animalType] || [];
};

regionalConfigSchema.methods.getRegulationsFor = function(category) {
  return this.regulations[category] || {};
};

regionalConfigSchema.methods.getSupportedLanguages = function() {
  return this.localization.supportedLanguages || ['en'];
};

// Static methods
regionalConfigSchema.statics.findByCountryCode = function(countryCode) {
  return this.findOne({ 'countries.code': countryCode });
};

regionalConfigSchema.statics.getActiveRegions = function() {
  return this.find({ isActive: true }).select('region countries');
};

module.exports = mongoose.model('RegionalConfig', regionalConfigSchema); 
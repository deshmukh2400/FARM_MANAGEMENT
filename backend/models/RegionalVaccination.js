const mongoose = require('mongoose');

// Regional Vaccination Schedule Schema
const regionalVaccinationSchema = new mongoose.Schema({
  region: {
    type: String,
    required: true,
    enum: ['north_america', 'europe', 'south_asia', 'africa', 'latin_america', 'east_asia', 'southeast_asia', 'middle_east', 'oceania', 'global_default']
  },
  countries: [{
    code: String, // ISO country code (US, IN, BR, etc.)
    name: String
  }],
  animalType: {
    type: String,
    required: true,
    enum: ['cattle', 'goat', 'sheep', 'poultry', 'swine', 'buffalo', 'horse', 'camel']
  },
  vaccinations: [{
    vaccineName: {
      type: String,
      required: true
    },
    localNames: {
      type: Map,
      of: String // Different language translations
    },
    diseasesPrevented: [String],
    vaccineType: {
      type: String,
      enum: ['live_attenuated', 'inactivated', 'subunit', 'toxoid', 'conjugate', 'recombinant'],
      required: true
    },
    schedule: {
      primarySeries: [{
        ageInDays: Number,
        ageDescription: String, // "2-3 months", "6-8 weeks"
        doseNumber: Number,
        isRequired: {
          type: Boolean,
          default: true
        },
        notes: String
      }],
      boosters: [{
        frequency: String, // "annual", "biannual", "every_3_years"
        frequencyInDays: Number,
        lastVaccinationGap: Number, // Days after last primary dose
        isRequired: {
          type: Boolean,
          default: true
        },
        notes: String
      }]
    },
    administrationRoute: {
      type: String,
      enum: ['intramuscular', 'subcutaneous', 'intranasal', 'oral', 'eye_drop', 'drinking_water'],
      required: true
    },
    dosage: {
      amount: Number,
      unit: String, // "ml", "doses", "tablets"
      weightBased: Boolean,
      dosagePerKg: Number
    },
    seasonalRecommendations: [{
      season: String,
      months: [Number],
      reason: String,
      isPriority: Boolean
    }],
    contraindications: [String],
    sideEffects: [String],
    storageRequirements: {
      temperature: {
        min: Number,
        max: Number,
        unit: String // "celsius", "fahrenheit"
      },
      specialRequirements: [String]
    },
    availability: {
      isAvailable: {
        type: Boolean,
        default: true
      },
      commonBrands: [String],
      averageCost: {
        amount: Number,
        currency: String
      },
      suppliers: [String]
    },
    regulatoryInfo: {
      isRequired: {
        type: Boolean,
        default: false
      },
      requiredBy: [String], // Regulatory bodies
      certificateRequired: Boolean,
      withdrawalPeriod: {
        meat: Number, // Days
        milk: Number, // Days
        eggs: Number  // Days
      }
    },
    efficacy: {
      protectionRate: Number, // Percentage
      durationOfImmunity: Number, // Days
      onsetOfImmunity: Number // Days after vaccination
    }
  }],
  specialPrograms: [{
    programName: String,
    description: String,
    targetAnimals: [String],
    isGovernmentSponsored: Boolean,
    eligibilityCriteria: [String],
    benefits: [String],
    applicationProcess: String,
    contactInfo: {
      organization: String,
      phone: String,
      email: String,
      website: String
    }
  }],
  emergencyVaccinations: [{
    diseaseName: String,
    triggerConditions: [String],
    vaccineName: String,
    urgencyLevel: {
      type: String,
      enum: ['immediate', 'within_24h', 'within_week']
    },
    reportingRequired: Boolean,
    quarantineRequired: Boolean,
    contactAuthorities: [{
      organization: String,
      phone: String,
      email: String
    }]
  }],
  veterinaryRequirements: {
    veterinarianRequired: Boolean,
    certificationRequired: Boolean,
    recordKeepingMandatory: Boolean,
    reportingToAuthorities: Boolean
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
  }
}, {
  timestamps: true
});

// Vaccination Record Schema (for individual animals)
const vaccinationRecordSchema = new mongoose.Schema({
  animal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  region: String,
  country: String,
  vaccineName: {
    type: String,
    required: true
  },
  vaccineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RegionalVaccination'
  },
  administrationDate: {
    type: Date,
    required: true
  },
  scheduledDate: Date,
  doseNumber: Number,
  isBooster: {
    type: Boolean,
    default: false
  },
  batchNumber: String,
  manufacturer: String,
  expiryDate: Date,
  administeredBy: {
    name: String,
    qualification: String,
    licenseNumber: String,
    contact: String
  },
  administrationSite: String,
  dosageGiven: {
    amount: Number,
    unit: String
  },
  animalWeight: Number, // At time of vaccination
  preVaccinationHealth: {
    temperature: Number,
    generalCondition: String,
    notes: String
  },
  postVaccinationObservations: [{
    observationDate: Date,
    observations: String,
    sideEffects: [String],
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    actionTaken: String
  }],
  nextDueDate: Date,
  certificateIssued: {
    issued: {
      type: Boolean,
      default: false
    },
    certificateNumber: String,
    issuingAuthority: String,
    validUntil: Date
  },
  cost: {
    vaccineCost: Number,
    administrationFee: Number,
    totalCost: Number,
    currency: String
  },
  compliance: {
    meetsRegionalRequirements: {
      type: Boolean,
      default: true
    },
    regulatoryApproval: String,
    deviationReason: String
  },
  photos: [{
    url: String,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'overdue', 'cancelled', 'adverse_reaction'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

// Vaccination Alert Schema
const vaccinationAlertSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal',
    required: true
  },
  vaccineName: String,
  alertType: {
    type: String,
    enum: ['due_soon', 'overdue', 'seasonal_reminder', 'emergency', 'booster_due'],
    required: true
  },
  dueDate: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  message: String,
  isRead: {
    type: Boolean,
    default: false
  },
  isActioned: {
    type: Boolean,
    default: false
  },
  actionedDate: Date,
  remindersSent: [{
    method: String, // 'email', 'sms', 'push'
    sentAt: Date,
    status: String
  }],
  expiryDate: Date, // When alert becomes irrelevant
  metadata: {
    region: String,
    country: String,
    animalAge: Number,
    lastVaccination: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
regionalVaccinationSchema.index({ region: 1, animalType: 1 });
regionalVaccinationSchema.index({ 'countries.code': 1, animalType: 1 });
regionalVaccinationSchema.index({ 'vaccinations.vaccineName': 1 });

vaccinationRecordSchema.index({ animal: 1, administrationDate: -1 });
vaccinationRecordSchema.index({ owner: 1, nextDueDate: 1 });
vaccinationRecordSchema.index({ owner: 1, status: 1 });

vaccinationAlertSchema.index({ owner: 1, dueDate: 1 });
vaccinationAlertSchema.index({ owner: 1, isRead: 1, priority: 1 });

// Virtual for overdue status
vaccinationRecordSchema.virtual('isOverdue').get(function() {
  return this.nextDueDate && new Date() > this.nextDueDate;
});

vaccinationRecordSchema.virtual('daysSinceDue').get(function() {
  if (!this.nextDueDate) return null;
  const today = new Date();
  const dueDate = new Date(this.nextDueDate);
  return Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
});

// Methods for regional vaccination
regionalVaccinationSchema.methods.getVaccinationSchedule = function(animalAge) {
  const schedules = [];
  
  this.vaccinations.forEach(vaccination => {
    // Primary series
    vaccination.schedule.primarySeries.forEach(dose => {
      if (animalAge <= dose.ageInDays) {
        schedules.push({
          vaccineName: vaccination.vaccineName,
          dueDate: new Date(Date.now() + (dose.ageInDays - animalAge) * 24 * 60 * 60 * 1000),
          doseNumber: dose.doseNumber,
          isRequired: dose.isRequired,
          type: 'primary',
          notes: dose.notes
        });
      }
    });
  });
  
  return schedules.sort((a, b) => a.dueDate - b.dueDate);
};

// Static method to get vaccination schedule for specific country
regionalVaccinationSchema.statics.getCountrySchedule = async function(countryCode, animalType) {
  return await this.find({
    'countries.code': countryCode,
    animalType: animalType
  });
};

// Method to calculate next vaccination due date
vaccinationRecordSchema.methods.calculateNextDue = function() {
  // This would be implemented based on the vaccination schedule
  // For now, returning a simple calculation
  if (this.isBooster) {
    // Annual booster by default
    return new Date(this.administrationDate.getTime() + 365 * 24 * 60 * 60 * 1000);
  } else {
    // Next dose in primary series or first booster
    return new Date(this.administrationDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
};

// Pre-save middleware to calculate next due date
vaccinationRecordSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('administrationDate')) {
    this.nextDueDate = this.calculateNextDue();
  }
  next();
});

// Static method to find overdue vaccinations
vaccinationRecordSchema.statics.findOverdue = function(ownerId) {
  return this.find({
    owner: ownerId,
    nextDueDate: { $lt: new Date() },
    status: { $in: ['scheduled', 'completed'] }
  }).populate('animal', 'basicInfo.name registrationNumber');
};

const RegionalVaccination = mongoose.model('RegionalVaccination', regionalVaccinationSchema);
const VaccinationRecord = mongoose.model('VaccinationRecord', vaccinationRecordSchema);
const VaccinationAlert = mongoose.model('VaccinationAlert', vaccinationAlertSchema);

module.exports = {
  RegionalVaccination,
  VaccinationRecord,
  VaccinationAlert
}; 
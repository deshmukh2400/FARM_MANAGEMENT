const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Animal must belong to an owner']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true
  },
  basicInfo: {
    name: {
      type: String,
      required: [true, 'Animal name is required'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    category: {
      type: String,
      required: [true, 'Animal category is required'],
      enum: ['goat', 'cattle', 'sheep', 'horse', 'pig', 'chicken', 'other'],
      lowercase: true
    },
    breed: {
      type: String,
      required: [true, 'Breed is required'],
      trim: true
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['male', 'female'],
      lowercase: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: function(value) {
          return value <= new Date();
        },
        message: 'Date of birth cannot be in the future'
      }
    },
    color: {
      type: String,
      trim: true
    },
    markings: {
      type: String,
      trim: true
    }
  },
  parentage: {
    mother: {
      animalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Animal'
      },
      name: String,
      registrationNumber: String
    },
    father: {
      animalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Animal'
      },
      name: String,
      registrationNumber: String
    }
  },
  birthDetails: {
    weightAtBirth: {
      type: Number,
      required: [true, 'Weight at birth is required'],
      min: [0, 'Weight cannot be negative']
    },
    birthType: {
      type: String,
      required: [true, 'Birth type is required'],
      enum: ['single', 'twins', 'triplets', 'quadruplets'],
      lowercase: true
    },
    birthComplications: String,
    assistedBirth: {
      type: Boolean,
      default: false
    }
  },
  currentStatus: {
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    },
    healthStatus: {
      type: String,
      enum: ['healthy', 'sick', 'injured', 'pregnant', 'lactating', 'deceased'],
      default: 'healthy'
    },
    location: {
      paddock: String,
      barn: String,
      section: String
    },
    isForSale: {
      type: Boolean,
      default: false
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative']
    },
    isAvailableForMating: {
      type: Boolean,
      default: false
    },
    matingFee: {
      type: Number,
      min: [0, 'Mating fee cannot be negative']
    }
  },
  media: {
    photos: [{
      url: String,
      caption: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    videos: [{
      url: String,
      caption: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  medicalHistory: {
    vaccinations: [{
      vaccineName: {
        type: String,
        required: true
      },
      dateAdministered: {
        type: Date,
        required: true
      },
      nextDueDate: Date,
      batchNumber: String,
      veterinarian: String,
      notes: String
    }],
    dewormings: [{
      medicine: {
        type: String,
        required: true
      },
      dateAdministered: {
        type: Date,
        required: true
      },
      nextDueDate: Date,
      dosage: String,
      veterinarian: String,
      notes: String
    }],
    treatments: [{
      condition: String,
      treatment: String,
      dateStarted: Date,
      dateEnded: Date,
      veterinarian: String,
      medications: [String],
      notes: String,
      cost: Number
    }],
    injuries: [{
      description: String,
      dateOccurred: Date,
      treatment: String,
      healed: {
        type: Boolean,
        default: false
      },
      notes: String
    }]
  },
  reproductiveHistory: {
    matings: [{
      partner: {
        animalId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Animal'
        },
        name: String,
        registrationNumber: String,
        owner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      },
      matingDate: Date,
      method: {
        type: String,
        enum: ['natural', 'artificial_insemination'],
        default: 'natural'
      },
      successful: Boolean,
      notes: String
    }],
    pregnancies: [{
      matingId: {
        type: mongoose.Schema.Types.ObjectId
      },
      conceptionDate: Date,
      expectedDueDate: Date,
      actualBirthDate: Date,
      numberOfOffspring: Number,
      complications: String,
      offspring: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Animal'
      }]
    }],
    lactationPeriods: [{
      startDate: Date,
      endDate: Date,
      averageDailyMilk: Number,
      totalMilkProduced: Number
    }]
  },
  growthRecords: [{
    date: {
      type: Date,
      required: true
    },
    weight: {
      type: Number,
      required: true,
      min: [0, 'Weight cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    },
    bodyConditionScore: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  tags: [String],
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
animalSchema.index({ owner: 1, category: 1 });
animalSchema.index({ registrationNumber: 1 });
animalSchema.index({ 'basicInfo.category': 1, 'currentStatus.isForSale': 1 });
animalSchema.index({ 'basicInfo.category': 1, 'currentStatus.isAvailableForMating': 1 });

// Virtual for age calculation
animalSchema.virtual('age').get(function() {
  if (!this.basicInfo.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.basicInfo.dateOfBirth);
  const ageInMs = today - birthDate;
  const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
  
  if (ageInDays < 30) {
    return `${ageInDays} days`;
  } else if (ageInDays < 365) {
    const months = Math.floor(ageInDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(ageInDays / 365);
    const remainingDays = ageInDays % 365;
    const months = Math.floor(remainingDays / 30);
    return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months} month${months > 1 ? 's' : ''}` : ''}`;
  }
});

// Virtual for latest weight
animalSchema.virtual('latestWeight').get(function() {
  if (this.currentStatus.weight) return this.currentStatus.weight;
  if (this.growthRecords && this.growthRecords.length > 0) {
    const sortedRecords = this.growthRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedRecords[0].weight;
  }
  return this.birthDetails.weightAtBirth;
});

// Pre-save middleware to update current weight/height from latest growth record
animalSchema.pre('save', function(next) {
  if (this.growthRecords && this.growthRecords.length > 0) {
    const latestRecord = this.growthRecords.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    this.currentStatus.weight = latestRecord.weight;
    if (latestRecord.height) {
      this.currentStatus.height = latestRecord.height;
    }
  }
  next();
});

module.exports = mongoose.model('Animal', animalSchema); 
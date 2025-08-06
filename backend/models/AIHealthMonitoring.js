const mongoose = require('mongoose');

// Health Assessment Schema
const healthAssessmentSchema = new mongoose.Schema({
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
  assessmentType: {
    type: String,
    required: true,
    enum: ['visual_inspection', 'behavioral_analysis', 'vital_signs', 'automated_detection', 'manual_entry']
  },
  method: {
    type: String,
    enum: ['computer_vision', 'sensor_data', 'manual_observation', 'wearable_device', 'smart_camera']
  },
  images: [{
    url: String,
    filename: String,
    capturedAt: {
      type: Date,
      default: Date.now
    },
    analysisResults: {
      eyeCondition: {
        score: Number, // 0-100, higher is healthier
        issues: [String], // e.g., 'discharge', 'redness', 'cloudiness'
        confidence: Number // 0-1
      },
      skinCondition: {
        score: Number,
        issues: [String], // e.g., 'lesions', 'parasites', 'wounds'
        confidence: Number
      },
      posture: {
        score: Number,
        issues: [String], // e.g., 'hunched', 'limping', 'favoring_leg'
        confidence: Number
      },
      bodyCondition: {
        score: Number, // Body Condition Score 1-5
        weight_estimate: Number,
        confidence: Number
      }
    }
  }],
  vitalSigns: {
    temperature: {
      value: Number,
      unit: {
        type: String,
        default: '°C'
      },
      status: {
        type: String,
        enum: ['normal', 'low', 'high', 'critical']
      }
    },
    heartRate: {
      value: Number,
      unit: {
        type: String,
        default: 'bpm'
      },
      status: {
        type: String,
        enum: ['normal', 'low', 'high', 'critical']
      }
    },
    respiratoryRate: {
      value: Number,
      unit: {
        type: String,
        default: 'breaths/min'
      },
      status: {
        type: String,
        enum: ['normal', 'low', 'high', 'critical']
      }
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      status: {
        type: String,
        enum: ['normal', 'low', 'high', 'critical']
      }
    }
  },
  behavioralMetrics: {
    activityLevel: {
      score: Number, // 0-100
      description: String,
      comparedToBaseline: {
        type: String,
        enum: ['much_lower', 'lower', 'normal', 'higher', 'much_higher']
      }
    },
    feedingBehavior: {
      appetite: {
        type: String,
        enum: ['poor', 'reduced', 'normal', 'increased', 'excessive']
      },
      feedingDuration: Number, // minutes
      feedConsumption: Number, // kg or percentage of normal
    },
    socialBehavior: {
      isolation: Boolean,
      aggression: Boolean,
      normalInteraction: Boolean,
      dominanceChanges: Boolean
    },
    movementPatterns: {
      gaitScore: Number, // 1-5, locomotion scoring
      lamenessDetected: Boolean,
      favoredLimbs: [String],
      movementRestriction: Boolean
    },
    restingBehavior: {
      lyingTime: Number, // hours per day
      standingTime: Number,
      restlessness: Boolean,
      normalSleep: Boolean
    }
  },
  environmentalFactors: {
    temperature: Number,
    humidity: Number,
    weatherCondition: String,
    housingCondition: String,
    feedQuality: String,
    waterAvailability: String
  },
  aiAnalysis: {
    overallHealthScore: {
      type: Number,
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    detectedConditions: [{
      condition: String,
      confidence: Number, // 0-1
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe', 'critical']
      },
      recommendations: [String]
    }],
    earlyWarnings: [{
      type: String,
      description: String,
      probability: Number, // 0-1
      timeframe: String // e.g., '24-48 hours', '3-7 days'
    }],
    trends: {
      improving: Boolean,
      declining: Boolean,
      stable: Boolean,
      rapidChange: Boolean
    },
    modelVersion: String,
    processingTime: Number, // milliseconds
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  veterinaryReview: {
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    vetComments: String,
    diagnosisConfirmed: Boolean,
    recommendedActions: [String],
    followUpRequired: Boolean,
    followUpDate: Date
  },
  alerts: [{
    type: {
      type: String,
      enum: ['health_decline', 'disease_risk', 'injury_detected', 'behavioral_change', 'vital_signs_abnormal']
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical', 'emergency']
    },
    message: String,
    triggered: {
      type: Boolean,
      default: false
    },
    triggeredAt: Date,
    acknowledged: {
      type: Boolean,
      default: false
    }
  }],
  notes: String,
  followUpScheduled: Date,
  status: {
    type: String,
    enum: ['pending', 'analyzed', 'reviewed', 'action_taken', 'resolved'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Disease Prediction Schema
const diseasePredictionSchema = new mongoose.Schema({
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
  predictionModel: {
    name: String,
    version: String,
    accuracy: Number, // Model accuracy percentage
    lastTrained: Date
  },
  inputData: {
    historicalHealth: [mongoose.Schema.Types.ObjectId], // References to HealthAssessment
    environmentalData: mongoose.Schema.Types.Mixed,
    geneticFactors: mongoose.Schema.Types.Mixed,
    nutritionalData: mongoose.Schema.Types.Mixed,
    vaccinationHistory: mongoose.Schema.Types.Mixed
  },
  predictions: [{
    disease: {
      name: String,
      category: {
        type: String,
        enum: ['infectious', 'metabolic', 'genetic', 'nutritional', 'parasitic', 'respiratory', 'digestive', 'reproductive']
      },
      icdCode: String // International Classification of Diseases for animals
    },
    probability: {
      type: Number,
      min: 0,
      max: 1
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    timeframe: {
      type: String,
      enum: ['immediate', '1-7_days', '1-4_weeks', '1-6_months', 'long_term']
    },
    riskFactors: [{
      factor: String,
      weight: Number, // Contribution to risk (0-1)
      modifiable: Boolean
    }],
    preventionMeasures: [{
      action: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent']
      },
      effectiveness: Number, // 0-1
      cost: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    }],
    earlyWarningSignsToWatch: [String]
  }],
  recommendations: {
    immediate: [String],
    shortTerm: [String], // 1-4 weeks
    longTerm: [String], // 1+ months
    veterinaryConsultation: {
      recommended: Boolean,
      urgency: {
        type: String,
        enum: ['routine', 'soon', 'urgent', 'emergency']
      },
      reasons: [String]
    }
  },
  validUntil: Date,
  accuracy: {
    type: Number,
    min: 0,
    max: 1
  },
  status: {
    type: String,
    enum: ['active', 'outdated', 'verified', 'false_positive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Behavioral Pattern Schema
const behavioralPatternSchema = new mongoose.Schema({
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
  patternType: {
    type: String,
    required: true,
    enum: ['feeding', 'movement', 'social', 'resting', 'reproductive', 'stress_indicators']
  },
  baselineData: {
    establishedDate: Date,
    dataPoints: Number,
    averageValues: mongoose.Schema.Types.Mixed,
    normalRanges: mongoose.Schema.Types.Mixed,
    seasonalVariations: mongoose.Schema.Types.Mixed
  },
  currentPattern: {
    period: {
      start: Date,
      end: Date
    },
    dataPoints: Number,
    averageValues: mongoose.Schema.Types.Mixed,
    deviationFromBaseline: {
      percentage: Number,
      significance: {
        type: String,
        enum: ['insignificant', 'minor', 'moderate', 'major', 'severe']
      }
    }
  },
  anomalies: [{
    detectedAt: Date,
    type: String,
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'major', 'critical']
    },
    description: String,
    possibleCauses: [String],
    duration: Number, // hours
    resolved: Boolean,
    resolvedAt: Date
  }],
  trends: {
    direction: {
      type: String,
      enum: ['improving', 'declining', 'stable', 'fluctuating']
    },
    rate: Number, // rate of change per day
    confidence: Number, // 0-1
    projectedOutcome: String
  },
  alerts: [{
    triggerCondition: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical', 'emergency']
    },
    message: String,
    actionRequired: Boolean,
    triggeredAt: Date,
    acknowledged: Boolean
  }],
  metadata: {
    dataSource: {
      type: String,
      enum: ['wearable_sensor', 'camera_system', 'manual_observation', 'feeding_system', 'environmental_sensor']
    },
    updateFrequency: String, // e.g., 'hourly', 'daily', 'continuous'
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Health Recommendation Schema
const healthRecommendationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal'
  },
  recommendationType: {
    type: String,
    required: true,
    enum: ['preventive', 'treatment', 'nutrition', 'housing', 'breeding', 'emergency']
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent', 'emergency']
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  detailedInstructions: String,
  basedOn: {
    healthAssessments: [mongoose.Schema.Types.ObjectId],
    predictions: [mongoose.Schema.Types.ObjectId],
    behavioralPatterns: [mongoose.Schema.Types.ObjectId],
    expertKnowledge: Boolean,
    researchData: Boolean
  },
  timeframe: {
    implement: {
      type: String,
      enum: ['immediate', 'within_24h', 'within_week', 'within_month', 'ongoing']
    },
    duration: String, // e.g., '7 days', '2 weeks', 'ongoing'
    followUp: Date
  },
  resources: [{
    type: {
      type: String,
      enum: ['medication', 'supplement', 'equipment', 'service', 'consultation']
    },
    name: String,
    quantity: String,
    estimatedCost: Number,
    supplier: String,
    notes: String
  }],
  expectedOutcomes: {
    primary: String,
    secondary: [String],
    timeline: String,
    successMetrics: [String]
  },
  risks: [{
    description: String,
    probability: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    mitigation: String
  }],
  alternatives: [{
    option: String,
    pros: [String],
    cons: [String],
    suitability: String
  }],
  implementation: {
    started: Boolean,
    startDate: Date,
    completedSteps: [String],
    nextSteps: [String],
    obstacles: [String],
    modifications: [String]
  },
  results: {
    outcome: {
      type: String,
      enum: ['successful', 'partially_successful', 'unsuccessful', 'ongoing', 'abandoned']
    },
    improvements: [String],
    sideEffects: [String],
    lessons: String,
    wouldRecommendAgain: Boolean
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for performance
healthAssessmentSchema.index({ owner: 1, animal: 1, createdAt: -1 });
healthAssessmentSchema.index({ 'aiAnalysis.riskLevel': 1, status: 1 });
healthAssessmentSchema.index({ 'alerts.triggered': 1, 'alerts.acknowledged': 1 });

diseasePredictionSchema.index({ owner: 1, animal: 1, validUntil: -1 });
diseasePredictionSchema.index({ status: 1, 'predictions.probability': -1 });

behavioralPatternSchema.index({ owner: 1, animal: 1, patternType: 1 });
behavioralPatternSchema.index({ 'anomalies.detectedAt': -1, 'anomalies.resolved': 1 });

healthRecommendationSchema.index({ owner: 1, priority: 1, status: 1 });
healthRecommendationSchema.index({ animal: 1, recommendationType: 1, createdAt: -1 });

// Virtual for overall health status
healthAssessmentSchema.virtual('overallStatus').get(function() {
  if (this.aiAnalysis && this.aiAnalysis.riskLevel) {
    return this.aiAnalysis.riskLevel;
  }
  return 'unknown';
});

// Method to trigger alerts
healthAssessmentSchema.methods.checkAndTriggerAlerts = async function() {
  const FarmAlert = mongoose.model('FarmAlert');
  const triggeredAlerts = [];

  for (const alert of this.alerts) {
    if (!alert.triggered && this.shouldTriggerAlert(alert)) {
      alert.triggered = true;
      alert.triggeredAt = new Date();

      // Create farm alert
      const farmAlert = await FarmAlert.create({
        owner: this.owner,
        type: 'animal_health',
        category: alert.severity,
        title: `Health Alert: ${alert.type}`,
        message: alert.message,
        source: `health_assessment_${this._id}`,
        relatedEntities: [{
          entityType: 'animal',
          entityId: this.animal
        }]
      });

      triggeredAlerts.push(farmAlert);
    }
  }

  await this.save();
  return triggeredAlerts;
};

// Helper method to determine if alert should be triggered
healthAssessmentSchema.methods.shouldTriggerAlert = function(alert) {
  switch (alert.type) {
    case 'health_decline':
      return this.aiAnalysis && this.aiAnalysis.overallHealthScore < 60;
    case 'disease_risk':
      return this.aiAnalysis && this.aiAnalysis.riskLevel === 'high';
    case 'vital_signs_abnormal':
      return this.hasAbnormalVitalSigns();
    case 'behavioral_change':
      return this.hasSignificantBehavioralChanges();
    default:
      return false;
  }
};

// Helper method to check vital signs
healthAssessmentSchema.methods.hasAbnormalVitalSigns = function() {
  if (!this.vitalSigns) return false;
  
  return Object.values(this.vitalSigns).some(vital => 
    vital.status && ['high', 'low', 'critical'].includes(vital.status)
  );
};

// Helper method to check behavioral changes
healthAssessmentSchema.methods.hasSignificantBehavioralChanges = function() {
  if (!this.behavioralMetrics) return false;
  
  const { activityLevel, feedingBehavior, socialBehavior } = this.behavioralMetrics;
  
  return (
    (activityLevel && ['much_lower', 'much_higher'].includes(activityLevel.comparedToBaseline)) ||
    (feedingBehavior && ['poor', 'excessive'].includes(feedingBehavior.appetite)) ||
    (socialBehavior && (socialBehavior.isolation || socialBehavior.aggression))
  );
};

// Static method to get health trends for an animal
healthAssessmentSchema.statics.getHealthTrends = async function(animalId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const assessments = await this.find({
    animal: animalId,
    createdAt: { $gte: startDate }
  }).sort({ createdAt: 1 });

  const trends = {
    healthScore: assessments.map(a => ({
      date: a.createdAt,
      score: a.aiAnalysis?.overallHealthScore || null
    })),
    riskLevel: assessments.map(a => ({
      date: a.createdAt,
      level: a.aiAnalysis?.riskLevel || 'unknown'
    })),
    detectedConditions: assessments.reduce((acc, a) => {
      if (a.aiAnalysis?.detectedConditions) {
        a.aiAnalysis.detectedConditions.forEach(condition => {
          if (!acc[condition.condition]) {
            acc[condition.condition] = [];
          }
          acc[condition.condition].push({
            date: a.createdAt,
            confidence: condition.confidence,
            severity: condition.severity
          });
        });
      }
      return acc;
    }, {})
  };

  return trends;
};

const HealthAssessment = mongoose.model('HealthAssessment', healthAssessmentSchema);
const DiseasePrediction = mongoose.model('DiseasePrediction', diseasePredictionSchema);
const BehavioralPattern = mongoose.model('BehavioralPattern', behavioralPatternSchema);
const HealthRecommendation = mongoose.model('HealthRecommendation', healthRecommendationSchema);

module.exports = {
  HealthAssessment,
  DiseasePrediction,
  BehavioralPattern,
  HealthRecommendation
}; 
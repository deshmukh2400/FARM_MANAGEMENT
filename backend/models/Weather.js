const mongoose = require('mongoose');

// Weather Data Schema
const weatherDataSchema = new mongoose.Schema({
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    city: String,
    country: String
  },
  current: {
    temperature: {
      type: Number,
      required: true
    },
    feelsLike: Number,
    humidity: {
      type: Number,
      required: true
    },
    pressure: Number,
    windSpeed: Number,
    windDirection: Number,
    visibility: Number,
    uvIndex: Number,
    cloudCover: Number,
    dewPoint: Number,
    condition: {
      main: String, // e.g., 'Clear', 'Rain', 'Snow'
      description: String, // e.g., 'clear sky', 'light rain'
      icon: String
    }
  },
  forecast: [{
    date: {
      type: Date,
      required: true
    },
    tempMin: Number,
    tempMax: Number,
    humidity: Number,
    precipitation: {
      probability: Number, // percentage
      amount: Number // mm
    },
    windSpeed: Number,
    condition: {
      main: String,
      description: String,
      icon: String
    }
  }],
  alerts: [{
    type: {
      type: String,
      enum: ['heat_warning', 'cold_warning', 'storm_warning', 'flood_warning', 'drought_warning', 'frost_warning'],
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'extreme'],
      required: true
    },
    title: String,
    description: String,
    startTime: Date,
    endTime: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'OpenWeatherMap'
  }
}, {
  timestamps: true
});

// Environmental Sensor Data Schema
const sensorDataSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sensorId: {
    type: String,
    required: true,
    unique: true
  },
  sensorType: {
    type: String,
    required: true,
    enum: ['temperature', 'humidity', 'air_quality', 'water_level', 'soil_moisture', 'light', 'motion', 'weight_scale', 'ph_sensor']
  },
  location: {
    name: String, // e.g., 'Barn 1', 'Pasture A', 'Water Tank 1'
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    zone: String // e.g., 'indoor', 'outdoor', 'water_source'
  },
  readings: [{
    timestamp: {
      type: Date,
      default: Date.now,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    quality: {
      type: String,
      enum: ['good', 'fair', 'poor'],
      default: 'good'
    }
  }],
  thresholds: {
    min: {
      value: Number,
      alertEnabled: {
        type: Boolean,
        default: false
      }
    },
    max: {
      value: Number,
      alertEnabled: {
        type: Boolean,
        default: false
      }
    },
    optimal: {
      min: Number,
      max: Number
    }
  },
  calibration: {
    offset: {
      type: Number,
      default: 0
    },
    multiplier: {
      type: Number,
      default: 1
    },
    lastCalibrated: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'error'],
    default: 'active'
  },
  batteryLevel: Number, // percentage for battery-powered sensors
  signalStrength: Number, // dBm for wireless sensors
  lastSeen: {
    type: Date,
    default: Date.now
  },
  metadata: {
    manufacturer: String,
    model: String,
    firmwareVersion: String,
    installationDate: Date,
    maintenanceSchedule: String
  }
}, {
  timestamps: true
});

// Farm Alert Schema
const farmAlertSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['weather', 'sensor', 'animal_health', 'schedule', 'inventory', 'system']
  },
  category: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'critical', 'emergency']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  source: {
    type: String, // sensor ID, weather station, animal ID, etc.
    required: true
  },
  relatedEntities: [{
    entityType: {
      type: String,
      enum: ['animal', 'sensor', 'schedule', 'inventory', 'user']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedEntities.entityType'
    }
  }],
  recommendations: [{
    action: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent']
    },
    description: String
  }],
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'dismissed'],
    default: 'active'
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: Date,
  resolvedAt: Date,
  expiresAt: Date,
  notificationsSent: [{
    method: {
      type: String,
      enum: ['push', 'email', 'sms']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    }
  }]
}, {
  timestamps: true
});

// Weather Recommendation Schema
const weatherRecommendationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weatherConditions: {
    temperature: Number,
    humidity: Number,
    precipitation: Number,
    windSpeed: Number,
    condition: String
  },
  recommendations: [{
    category: {
      type: String,
      enum: ['grazing', 'feeding', 'shelter', 'health', 'breeding', 'general'],
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    title: String,
    description: String,
    actionRequired: Boolean,
    timeframe: String, // e.g., 'immediate', 'within 24 hours', 'this week'
    applicableAnimals: [{
      type: String,
      enum: ['all', 'goat', 'cattle', 'sheep', 'horse', 'pig', 'chicken']
    }]
  }],
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
weatherDataSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
weatherDataSchema.index({ lastUpdated: -1 });

sensorDataSchema.index({ owner: 1, sensorType: 1 });
sensorDataSchema.index({ sensorId: 1 });
sensorDataSchema.index({ 'readings.timestamp': -1 });
sensorDataSchema.index({ status: 1, lastSeen: -1 });

farmAlertSchema.index({ owner: 1, status: 1, createdAt: -1 });
farmAlertSchema.index({ type: 1, category: 1 });
farmAlertSchema.index({ expiresAt: 1 });

weatherRecommendationSchema.index({ owner: 1, isActive: 1, validUntil: 1 });

// Virtual for latest sensor reading
sensorDataSchema.virtual('latestReading').get(function() {
  if (this.readings && this.readings.length > 0) {
    return this.readings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  }
  return null;
});

// Virtual for sensor health status
sensorDataSchema.virtual('healthStatus').get(function() {
  const now = new Date();
  const lastSeen = new Date(this.lastSeen);
  const hoursSinceLastSeen = (now - lastSeen) / (1000 * 60 * 60);

  if (this.status !== 'active') return this.status;
  if (hoursSinceLastSeen > 24) return 'offline';
  if (this.batteryLevel && this.batteryLevel < 20) return 'low_battery';
  if (this.signalStrength && this.signalStrength < -80) return 'weak_signal';
  return 'healthy';
});

// Method to add sensor reading and check thresholds
sensorDataSchema.methods.addReading = async function(value, unit, quality = 'good') {
  const reading = {
    timestamp: new Date(),
    value: value * this.calibration.multiplier + this.calibration.offset,
    unit,
    quality
  };

  this.readings.push(reading);
  this.lastSeen = new Date();

  // Keep only last 1000 readings to prevent collection from growing too large
  if (this.readings.length > 1000) {
    this.readings = this.readings.slice(-1000);
  }

  // Check thresholds and create alerts if necessary
  const alerts = [];
  const adjustedValue = reading.value;

  if (this.thresholds.min.alertEnabled && adjustedValue < this.thresholds.min.value) {
    alerts.push({
      type: 'sensor',
      category: 'warning',
      title: `${this.sensorType} Below Minimum Threshold`,
      message: `${this.location.name} ${this.sensorType} reading (${adjustedValue} ${unit}) is below minimum threshold (${this.thresholds.min.value} ${unit})`,
      source: this.sensorId
    });
  }

  if (this.thresholds.max.alertEnabled && adjustedValue > this.thresholds.max.value) {
    alerts.push({
      type: 'sensor',
      category: 'warning',
      title: `${this.sensorType} Above Maximum Threshold`,
      message: `${this.location.name} ${this.sensorType} reading (${adjustedValue} ${unit}) is above maximum threshold (${this.thresholds.max.value} ${unit})`,
      source: this.sensorId
    });
  }

  await this.save();

  // Create alerts
  if (alerts.length > 0) {
    const FarmAlert = mongoose.model('FarmAlert');
    for (const alertData of alerts) {
      await FarmAlert.create({
        owner: this.owner,
        ...alertData
      });
    }
  }

  return reading;
};

// Static method to get weather recommendations
weatherDataSchema.statics.generateRecommendations = function(weatherData, animalTypes = []) {
  const recommendations = [];
  const { current } = weatherData;

  // Temperature-based recommendations
  if (current.temperature > 30) { // Hot weather
    recommendations.push({
      category: 'shelter',
      priority: 'high',
      title: 'Provide Adequate Shade',
      description: 'High temperatures detected. Ensure animals have access to shade and fresh water.',
      actionRequired: true,
      timeframe: 'immediate',
      applicableAnimals: ['all']
    });
  }

  if (current.temperature < 5) { // Cold weather
    recommendations.push({
      category: 'shelter',
      priority: 'high',
      title: 'Cold Weather Protection',
      description: 'Low temperatures detected. Provide windbreaks and additional bedding.',
      actionRequired: true,
      timeframe: 'immediate',
      applicableAnimals: ['all']
    });
  }

  // Humidity-based recommendations
  if (current.humidity > 80) {
    recommendations.push({
      category: 'health',
      priority: 'medium',
      title: 'Monitor for Respiratory Issues',
      description: 'High humidity can increase risk of respiratory problems. Ensure good ventilation.',
      actionRequired: false,
      timeframe: 'within 24 hours',
      applicableAnimals: ['all']
    });
  }

  // Wind-based recommendations
  if (current.windSpeed > 15) {
    recommendations.push({
      category: 'shelter',
      priority: 'medium',
      title: 'Strong Wind Warning',
      description: 'Strong winds detected. Secure loose items and provide windbreaks.',
      actionRequired: true,
      timeframe: 'immediate',
      applicableAnimals: ['all']
    });
  }

  return recommendations;
};

// Pre-save middleware to clean up old readings
sensorDataSchema.pre('save', function(next) {
  // Keep only readings from last 30 days for performance
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  this.readings = this.readings.filter(reading => reading.timestamp > thirtyDaysAgo);
  next();
});

// Auto-expire alerts
farmAlertSchema.pre('save', function(next) {
  if (this.expiresAt && new Date() > this.expiresAt && this.status === 'active') {
    this.status = 'dismissed';
  }
  next();
});

const WeatherData = mongoose.model('WeatherData', weatherDataSchema);
const SensorData = mongoose.model('SensorData', sensorDataSchema);
const FarmAlert = mongoose.model('FarmAlert', farmAlertSchema);
const WeatherRecommendation = mongoose.model('WeatherRecommendation', weatherRecommendationSchema);

module.exports = {
  WeatherData,
  SensorData,
  FarmAlert,
  WeatherRecommendation
}; 
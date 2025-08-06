const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['vaccination', 'deworming', 'mating', 'health_check', 'breeding', 'other']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: Date,
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  details: {
    // For vaccination schedules
    vaccineName: String,
    dosage: String,
    route: {
      type: String,
      enum: ['intramuscular', 'subcutaneous', 'oral', 'nasal', 'other']
    },
    
    // For deworming schedules
    medicine: String,
    weight: Number,
    
    // For mating schedules
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal'
    },
    method: {
      type: String,
      enum: ['natural', 'artificial_insemination']
    },
    
    // General details
    veterinarian: String,
    cost: Number,
    location: String,
    notes: String
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms'],
      required: true
    },
    sentAt: Date,
    scheduledFor: Date
  }],
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
    },
    interval: {
      type: Number,
      default: 1
    },
    endDate: Date,
    nextOccurrence: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    type: String, // URLs to documents/images
    description: String
  }]
}, {
  timestamps: true
});

// Indexes
scheduleSchema.index({ owner: 1, scheduledDate: 1 });
scheduleSchema.index({ animal: 1, type: 1 });
scheduleSchema.index({ status: 1, scheduledDate: 1 });

// Update status based on dates
scheduleSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.completedDate) {
    this.status = 'completed';
  } else if (this.scheduledDate < now && this.status === 'pending') {
    this.status = 'overdue';
  }
  
  next();
});

// Static method to create recurring schedules
scheduleSchema.statics.createRecurringSchedules = async function(baseSchedule) {
  if (!baseSchedule.recurring.isRecurring) return;
  
  const schedules = [];
  let currentDate = new Date(baseSchedule.scheduledDate);
  const endDate = baseSchedule.recurring.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year default
  
  while (currentDate <= endDate) {
    const newSchedule = new this({
      ...baseSchedule.toObject(),
      _id: undefined,
      scheduledDate: new Date(currentDate),
      status: 'pending',
      completedDate: undefined,
      completedBy: undefined
    });
    
    schedules.push(newSchedule);
    
    // Calculate next occurrence
    switch (baseSchedule.recurring.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + baseSchedule.recurring.interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (7 * baseSchedule.recurring.interval));
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + baseSchedule.recurring.interval);
        break;
      case 'quarterly':
        currentDate.setMonth(currentDate.getMonth() + (3 * baseSchedule.recurring.interval));
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + baseSchedule.recurring.interval);
        break;
    }
  }
  
  return await this.insertMany(schedules);
};

module.exports = mongoose.model('Schedule', scheduleSchema); 
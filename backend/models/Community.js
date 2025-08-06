const mongoose = require('mongoose');

// Forum Category Schema
const forumCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  icon: String,
  color: String,
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumCategory'
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumCategory'
  }],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  lastPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost'
  },
  lastActivity: Date,
  tags: [String],
  settings: {
    allowAnonymous: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowAttachments: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Forum Post Schema
const forumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumCategory',
    required: true
  },
  tags: [String],
  type: {
    type: String,
    enum: ['question', 'discussion', 'experience_share', 'tip', 'alert', 'market_info'],
    default: 'discussion'
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'announcement'],
    default: 'normal'
  },
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  images: [{
    url: String,
    caption: String,
    filename: String
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number], // [longitude, latitude]
    address: String,
    city: String,
    region: String,
    country: String
  },
  animalTypes: [{
    type: String,
    enum: ['cattle', 'goat', 'sheep', 'horse', 'pig', 'chicken', 'other']
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumReply'
  }],
  replyCount: {
    type: Number,
    default: 0
  },
  lastReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumReply'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted', 'pending'],
    default: 'active'
  },
  expertAnswered: {
    type: Boolean,
    default: false
  },
  isSolved: {
    type: Boolean,
    default: false
  },
  bestAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumReply'
  }
}, {
  timestamps: true
});

// Forum Reply Schema
const forumReplySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
    required: true
  },
  parentReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumReply'
  },
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  images: [{
    url: String,
    caption: String,
    filename: String
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isExpertAnswer: {
    type: Boolean,
    default: false
  },
  isBestAnswer: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  editHistory: [{
    editedAt: Date,
    reason: String,
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'deleted', 'pending'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Knowledge Base Article Schema
const knowledgeArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  summary: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contributors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contribution: String,
    contributedAt: {
      type: Date,
      default: Date.now
    }
  }],
  category: {
    type: String,
    required: true,
    enum: ['animal_care', 'breeding', 'nutrition', 'health', 'equipment', 'business', 'regulations', 'sustainability']
  },
  subcategory: String,
  animalTypes: [{
    type: String,
    enum: ['cattle', 'goat', 'sheep', 'horse', 'pig', 'chicken', 'general']
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  estimatedReadTime: Number, // minutes
  tags: [String],
  images: [{
    url: String,
    caption: String,
    alt: String
  }],
  videos: [{
    url: String,
    title: String,
    duration: Number, // seconds
    thumbnail: String
  }],
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    description: String
  }],
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeArticle'
  }],
  references: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['research_paper', 'website', 'book', 'video', 'other']
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  lastReviewed: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  changeLog: [{
    version: Number,
    changes: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  expertVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Expert Profile Schema
const expertProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specializations: [{
    type: String,
    enum: ['veterinary', 'nutrition', 'breeding', 'dairy', 'meat_production', 'organic_farming', 'animal_behavior', 'farm_management', 'equipment', 'business']
  }],
  animalExpertise: [{
    type: String,
    enum: ['cattle', 'goat', 'sheep', 'horse', 'pig', 'chicken', 'other']
  }],
  credentials: [{
    type: String,
    institution: String,
    year: Number,
    verified: {
      type: Boolean,
      default: false
    },
    verificationDocument: String
  }],
  experience: {
    years: Number,
    description: String,
    previousRoles: [String]
  },
  languages: [String],
  availability: {
    consultationHours: String,
    timezone: String,
    responseTime: String, // e.g., "within 24 hours"
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  consultationRates: {
    perHour: Number,
    perSession: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    consultationType: String,
    ratedAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalConsultations: {
    type: Number,
    default: 0
  },
  articlesWritten: {
    type: Number,
    default: 0
  },
  forumContributions: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  badgeEarned: [String], // e.g., 'Top Contributor', 'Verified Expert'
  socialLinks: {
    website: String,
    linkedin: String,
    twitter: String,
    youtube: String
  }
}, {
  timestamps: true
});

// Mentorship Program Schema
const mentorshipSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  program: {
    name: String,
    duration: Number, // weeks
    focusAreas: [String],
    goals: [String]
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  startDate: Date,
  endDate: Date,
  sessions: [{
    scheduledAt: Date,
    duration: Number, // minutes
    type: {
      type: String,
      enum: ['video_call', 'phone_call', 'in_person', 'messaging']
    },
    agenda: String,
    notes: String,
    completed: {
      type: Boolean,
      default: false
    },
    feedback: {
      mentorFeedback: String,
      menteeFeedback: String,
      rating: Number
    }
  }],
  progress: {
    milestones: [{
      title: String,
      description: String,
      targetDate: Date,
      completed: Boolean,
      completedDate: Date
    }],
    overallProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  communication: {
    preferredMethod: {
      type: String,
      enum: ['video_call', 'phone_call', 'messaging', 'email']
    },
    frequency: String, // e.g., 'weekly', 'bi-weekly'
    timezone: String
  },
  finalEvaluation: {
    mentorRating: Number,
    menteeRating: Number,
    mentorReview: String,
    menteeReview: String,
    goalsAchieved: [String],
    recommendations: String
  }
}, {
  timestamps: true
});

// Cooperative Group Schema
const cooperativeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    required: true,
    enum: ['buying_group', 'equipment_sharing', 'knowledge_sharing', 'marketing', 'processing', 'multi_purpose']
  },
  founder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  administrators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'coordinator', 'treasurer', 'secretary'],
      default: 'member'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  location: {
    region: String,
    city: String,
    country: String,
    radius: Number // km for local groups
  },
  animalFocus: [{
    type: String,
    enum: ['cattle', 'goat', 'sheep', 'horse', 'pig', 'chicken', 'mixed']
  }],
  activities: [{
    type: {
      type: String,
      enum: ['bulk_purchasing', 'equipment_rental', 'joint_marketing', 'training', 'field_trips', 'meetings']
    },
    title: String,
    description: String,
    scheduledDate: Date,
    location: String,
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    cost: Number,
    status: {
      type: String,
      enum: ['planned', 'active', 'completed', 'cancelled']
    }
  }],
  resources: {
    sharedEquipment: [{
      name: String,
      description: String,
      owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      condition: String,
      rentalRate: Number,
      availability: String,
      bookings: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        startDate: Date,
        endDate: Date,
        status: {
          type: String,
          enum: ['requested', 'confirmed', 'in_use', 'returned', 'cancelled']
        }
      }]
    }],
    bulkPurchases: [{
      item: String,
      description: String,
      coordinator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      targetQuantity: Number,
      currentCommitments: Number,
      pricePerUnit: Number,
      deadline: Date,
      supplier: String,
      participants: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        quantity: Number,
        committed: Boolean
      }]
    }]
  },
  finances: {
    membershipFee: {
      amount: Number,
      frequency: {
        type: String,
        enum: ['one_time', 'monthly', 'quarterly', 'yearly']
      }
    },
    treasury: {
      currentBalance: Number,
      transactions: [{
        type: {
          type: String,
          enum: ['income', 'expense']
        },
        amount: Number,
        description: String,
        date: Date,
        member: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }]
    }
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: true
    },
    maxMembers: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
forumPostSchema.index({ category: 1, createdAt: -1 });
forumPostSchema.index({ author: 1, createdAt: -1 });
forumPostSchema.index({ tags: 1 });
forumPostSchema.index({ 'location.coordinates': '2dsphere' });
forumPostSchema.index({ title: 'text', content: 'text' });

forumReplySchema.index({ post: 1, createdAt: 1 });
forumReplySchema.index({ author: 1, createdAt: -1 });

knowledgeArticleSchema.index({ category: 1, isPublished: 1 });
knowledgeArticleSchema.index({ tags: 1 });
knowledgeArticleSchema.index({ title: 'text', content: 'text', summary: 'text' });
knowledgeArticleSchema.index({ averageRating: -1, views: -1 });

expertProfileSchema.index({ specializations: 1, isVerified: 1 });
expertProfileSchema.index({ animalExpertise: 1, averageRating: -1 });

mentorshipSchema.index({ mentor: 1, status: 1 });
mentorshipSchema.index({ mentee: 1, status: 1 });

cooperativeSchema.index({ type: 1, 'location.country': 1 });
cooperativeSchema.index({ animalFocus: 1, isActive: 1 });

// Virtual for forum post like count
forumPostSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for knowledge article rating count
knowledgeArticleSchema.virtual('ratingCount').get(function() {
  return this.ratings ? this.ratings.length : 0;
});

// Pre-save middleware to calculate average ratings
knowledgeArticleSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  }
  next();
});

expertProfileSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  }
  next();
});

const ForumCategory = mongoose.model('ForumCategory', forumCategorySchema);
const ForumPost = mongoose.model('ForumPost', forumPostSchema);
const ForumReply = mongoose.model('ForumReply', forumReplySchema);
const KnowledgeArticle = mongoose.model('KnowledgeArticle', knowledgeArticleSchema);
const ExpertProfile = mongoose.model('ExpertProfile', expertProfileSchema);
const Mentorship = mongoose.model('Mentorship', mentorshipSchema);
const Cooperative = mongoose.model('Cooperative', cooperativeSchema);

module.exports = {
  ForumCategory,
  ForumPost,
  ForumReply,
  KnowledgeArticle,
  ExpertProfile,
  Mentorship,
  Cooperative
}; 
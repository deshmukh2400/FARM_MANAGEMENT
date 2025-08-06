// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Animal Categories
export const ANIMAL_CATEGORIES = [
  { value: 'goat', label: 'Goat', icon: '🐐' },
  { value: 'cattle', label: 'Cattle', icon: '🐄' },
  { value: 'sheep', label: 'Sheep', icon: '🐑' },
  { value: 'horse', label: 'Horse', icon: '🐎' },
  { value: 'pig', label: 'Pig', icon: '🐷' },
  { value: 'chicken', label: 'Chicken', icon: '🐔' },
  { value: 'other', label: 'Other', icon: '🐾' }
];

// Animal Genders
export const ANIMAL_GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
];

// Birth Types
export const BIRTH_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'twins', label: 'Twins' },
  { value: 'triplets', label: 'Triplets' },
  { value: 'quadruplets', label: 'Quadruplets' }
];

// Health Status
export const HEALTH_STATUS = [
  { value: 'healthy', label: 'Healthy', color: '#4CAF50' },
  { value: 'sick', label: 'Sick', color: '#FF9800' },
  { value: 'injured', label: 'Injured', color: '#F44336' },
  { value: 'pregnant', label: 'Pregnant', color: '#9C27B0' },
  { value: 'lactating', label: 'Lactating', color: '#2196F3' },
  { value: 'deceased', label: 'Deceased', color: '#424242' }
];

// Schedule Types
export const SCHEDULE_TYPES = [
  { value: 'vaccination', label: 'Vaccination', icon: '💉' },
  { value: 'deworming', label: 'Deworming', icon: '💊' },
  { value: 'mating', label: 'Mating', icon: '💕' },
  { value: 'health_check', label: 'Health Check', icon: '🩺' },
  { value: 'breeding', label: 'Breeding', icon: '🐣' },
  { value: 'other', label: 'Other', icon: '📋' }
];

// Schedule Status
export const SCHEDULE_STATUS = [
  { value: 'pending', label: 'Pending', color: '#FF9800' },
  { value: 'completed', label: 'Completed', color: '#4CAF50' },
  { value: 'overdue', label: 'Overdue', color: '#F44336' },
  { value: 'cancelled', label: 'Cancelled', color: '#9E9E9E' }
];

// Priority Levels
export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#4CAF50' },
  { value: 'medium', label: 'Medium', color: '#FF9800' },
  { value: 'high', label: 'High', color: '#F44336' },
  { value: 'urgent', label: 'Urgent', color: '#9C27B0' }
];

// Inventory Categories
export const INVENTORY_CATEGORIES = [
  { value: 'medicine', label: 'Medicine', icon: '💊' },
  { value: 'vaccine', label: 'Vaccine', icon: '💉' },
  { value: 'feed', label: 'Feed', icon: '🌾' },
  { value: 'supplement', label: 'Supplement', icon: '🧪' },
  { value: 'equipment', label: 'Equipment', icon: '🔧' },
  { value: 'other', label: 'Other', icon: '📦' }
];

// Units of Measurement
export const MEASUREMENT_UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'grams', label: 'Grams (g)' },
  { value: 'pounds', label: 'Pounds (lbs)' },
  { value: 'liters', label: 'Liters (L)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'doses', label: 'Doses' },
  { value: 'bags', label: 'Bags' },
  { value: 'bales', label: 'Bales' }
];

// Marketplace Types
export const MARKETPLACE_TYPES = [
  { value: 'sale', label: 'For Sale', icon: '💰' },
  { value: 'mating_service', label: 'Mating Service', icon: '💕' },
  { value: 'lease', label: 'For Lease', icon: '📋' },
  { value: 'exchange', label: 'Exchange', icon: '🔄' }
];

// User Roles
export const USER_ROLES = [
  { value: 'farmer', label: 'Farmer' },
  { value: 'veterinarian', label: 'Veterinarian' },
  { value: 'admin', label: 'Administrator' }
];

// Vaccination Routes
export const VACCINATION_ROUTES = [
  { value: 'intramuscular', label: 'Intramuscular (IM)' },
  { value: 'subcutaneous', label: 'Subcutaneous (SC)' },
  { value: 'oral', label: 'Oral' },
  { value: 'nasal', label: 'Nasal' },
  { value: 'other', label: 'Other' }
];

// Common Vaccines by Animal Type
export const VACCINES_BY_ANIMAL = {
  goat: [
    'CDT (Clostridium perfringens)',
    'Pneumonia',
    'Rabies',
    'Caseous Lymphadenitis',
    'Chlamydia'
  ],
  cattle: [
    'IBR/BVD',
    'Clostridial (7-way)',
    'Rabies',
    'Brucellosis',
    'Anthrax',
    'Blackleg'
  ],
  sheep: [
    'CDT',
    'Ovine EAE',
    'Rabies',
    'Caseous Lymphadenitis'
  ],
  horse: [
    'Tetanus',
    'Eastern/Western Encephalitis',
    'West Nile Virus',
    'Rabies',
    'Influenza',
    'Rhinopneumonitis'
  ],
  pig: [
    'Erysipelas',
    'Parvovirus',
    'Leptospirosis',
    'PRRS',
    'Mycoplasma'
  ],
  chicken: [
    'Newcastle Disease',
    'Infectious Bronchitis',
    'Marek\'s Disease',
    'Fowl Pox',
    'Infectious Bursal Disease'
  ]
};

// Common Dewormers
export const COMMON_DEWORMERS = [
  'Ivermectin',
  'Fenbendazole',
  'Albendazole',
  'Moxidectin',
  'Levamisole',
  'Doramectin'
];

// Dosage Forms
export const DOSAGE_FORMS = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'liquid', label: 'Liquid' },
  { value: 'injection', label: 'Injection' },
  { value: 'powder', label: 'Powder' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'other', label: 'Other' }
];

// Feed Types
export const FEED_TYPES = [
  { value: 'hay', label: 'Hay' },
  { value: 'grain', label: 'Grain' },
  { value: 'pellets', label: 'Pellets' },
  { value: 'silage', label: 'Silage' },
  { value: 'pasture', label: 'Pasture' },
  { value: 'concentrate', label: 'Concentrate' },
  { value: 'other', label: 'Other' }
];

// Currencies
export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'INR', label: 'Indian Rupee (₹)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' }
];

// Date Formats
export const DATE_FORMATS = {
  short: 'MMM dd, yyyy',
  long: 'MMMM dd, yyyy',
  withTime: 'MMM dd, yyyy HH:mm',
  time: 'HH:mm'
};

// Pagination
export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100]
};

// File Upload
export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/webm'],
  maxImages: 5,
  maxVideos: 2
}; 
const validator = require('validator');
const mongoSanitize = require('express-mongo-sanitize');

// Comprehensive input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any keys that start with '$' or contain '.'
  mongoSanitize()(req, res, () => {});

  // Recursively sanitize all string inputs
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          // Escape HTML and remove potential script injections
          obj[key] = validator.escape(obj[key]);
          
          // Remove potential MongoDB operators
          obj[key] = obj[key].replace(/\$\w+/g, '');
          
          // Trim whitespace
          obj[key] = obj[key].trim();
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    }
    return obj;
  };

  // Sanitize request body, query, and params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Specific sanitization for search queries
const sanitizeSearchQuery = (req, res, next) => {
  if (req.query.search) {
    // Escape regex special characters to prevent ReDoS attacks
    req.query.search = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Limit search query length
    if (req.query.search.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Search query too long'
      });
    }
  }
  next();
};

// Validate ObjectId parameters
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !validator.isMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    next();
  };
};

// Rate limiting for search operations
const searchRateLimit = require('express-rate-limit')({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 search requests per minute
  message: {
    success: false,
    message: 'Too many search requests, please try again later'
  }
});

module.exports = {
  sanitizeInput,
  sanitizeSearchQuery,
  validateObjectId,
  searchRateLimit
}; 
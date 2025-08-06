const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// File type signatures (magic numbers) for validation
const FILE_SIGNATURES = {
  // Images
  'ffd8ffe0': 'jpeg',
  'ffd8ffe1': 'jpeg',
  'ffd8ffe2': 'jpeg',
  'ffd8ffe3': 'jpeg',
  'ffd8ffe8': 'jpeg',
  '89504e47': 'png',
  '47494638': 'gif',
  '424d': 'bmp',
  '52494646': 'webp',
  
  // Documents
  '25504446': 'pdf',
  '504b0304': 'zip', // Also used for docx, xlsx
  'd0cf11e0': 'doc',
  
  // Videos (if needed)
  '000001ba': 'mpg',
  '000001b3': 'mpg',
  '66747970': 'mp4',
  '1a45dfa3': 'mkv'
};

// Get file signature from buffer
const getFileSignature = (buffer) => {
  if (!buffer || buffer.length < 4) return null;
  return buffer.toString('hex', 0, 4).toLowerCase();
};

// Validate file signature against MIME type
const validateFileSignature = (buffer, mimetype, allowedTypes) => {
  const signature = getFileSignature(buffer);
  if (!signature) return false;
  
  // Check 8-byte signatures for some formats
  const signature8 = buffer.length >= 8 ? buffer.toString('hex', 0, 8).toLowerCase() : signature;
  
  const detectedType = FILE_SIGNATURES[signature] || FILE_SIGNATURES[signature8];
  
  if (!detectedType) return false;
  
  // Verify the detected type matches the MIME type and is allowed
  const mimeTypeMap = {
    'jpeg': ['image/jpeg', 'image/jpg'],
    'png': ['image/png'],
    'gif': ['image/gif'],
    'bmp': ['image/bmp'],
    'webp': ['image/webp'],
    'pdf': ['application/pdf'],
    'zip': ['application/zip'],
    'doc': ['application/msword'],
    'mp4': ['video/mp4'],
    'mpg': ['video/mpeg']
  };
  
  const allowedMimeTypes = mimeTypeMap[detectedType] || [];
  return allowedMimeTypes.includes(mimetype) && allowedTypes.includes(detectedType);
};

// Secure storage configuration
const createSecureStorage = (uploadPath, allowedTypes = ['jpeg', 'png', 'pdf']) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      // Ensure upload directory exists
      const fullPath = path.join(__dirname, '..', uploadPath);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      // Generate secure random filename
      const uniqueName = `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });
};

// Secure file filter
const createSecureFileFilter = (allowedTypes = ['jpeg', 'png', 'pdf']) => {
  return (req, file, cb) => {
    // First check MIME type
    const allowedMimeTypes = {
      'jpeg': ['image/jpeg', 'image/jpg'],
      'png': ['image/png'],
      'gif': ['image/gif'],
      'pdf': ['application/pdf'],
      'webp': ['image/webp']
    };
    
    const isValidMimeType = allowedTypes.some(type => 
      allowedMimeTypes[type] && allowedMimeTypes[type].includes(file.mimetype)
    );
    
    if (!isValidMimeType) {
      return cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
    
    // File signature validation will be done after upload
    cb(null, true);
  };
};

// Middleware to validate uploaded file signatures
const validateUploadedFiles = (allowedTypes = ['jpeg', 'png', 'pdf']) => {
  return (req, res, next) => {
    if (!req.files && !req.file) {
      return next();
    }
    
    const files = req.files || [req.file];
    
    try {
      for (const file of files) {
        if (file && file.path) {
          const buffer = fs.readFileSync(file.path);
          
          if (!validateFileSignature(buffer, file.mimetype, allowedTypes)) {
            // Delete the invalid file
            fs.unlinkSync(file.path);
            
            return res.status(400).json({
              success: false,
              message: 'Invalid file format. File signature does not match the declared type.'
            });
          }
        }
      }
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error validating uploaded files'
      });
    }
  };
};

// Secure upload configurations for different file types
const secureUploads = {
  // For animal photos/videos
  animals: multer({
    storage: createSecureStorage('uploads/animals/', ['jpeg', 'png', 'webp']),
    fileFilter: createSecureFileFilter(['jpeg', 'png', 'webp']),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5
    }
  }),
  
  // For farm documents
  documents: multer({
    storage: createSecureStorage('uploads/farm-documents/', ['pdf', 'jpeg', 'png']),
    fileFilter: createSecureFileFilter(['pdf', 'jpeg', 'png']),
    limits: {
      fileSize: 15 * 1024 * 1024, // 15MB
      files: 1
    }
  }),
  
  // For farm logos
  logos: multer({
    storage: createSecureStorage('uploads/farm-logos/', ['jpeg', 'png', 'webp']),
    fileFilter: createSecureFileFilter(['jpeg', 'png', 'webp']),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1
    }
  }),
  
  // For financial receipts
  financial: multer({
    storage: createSecureStorage('uploads/financial/', ['pdf', 'jpeg', 'png']),
    fileFilter: createSecureFileFilter(['pdf', 'jpeg', 'png']),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 1
    }
  }),
  
  // For health assessment images
  health: multer({
    storage: createSecureStorage('uploads/health/', ['jpeg', 'png']),
    fileFilter: createSecureFileFilter(['jpeg', 'png']),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5
    }
  })
};

module.exports = {
  secureUploads,
  validateUploadedFiles,
  validateFileSignature,
  getFileSignature
}; 
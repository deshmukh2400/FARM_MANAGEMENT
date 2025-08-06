const express = require('express');
const { body, validationResult } = require('express-validator');
const { FarmDocument, DocumentReminder, FarmProfile } = require('../models/FarmDocument');
const User = require('../models/User');
const { protect, checkOwnership } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for farm documents and logo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = file.fieldname === 'farmLogo' ? 'uploads/farm-logos/' : 'uploads/farm-documents/';
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'farmLogo') {
      // Only allow images for logo
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Farm logo must be an image file!'), false);
      }
    } else {
      // Allow images and PDFs for documents
      if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only image and PDF files are allowed for documents!'), false);
      }
    }
  }
});

// FARM PROFILE ROUTES

// @route   GET /api/farm-profile
// @desc    Get farm profile
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let farmProfile = await FarmProfile.findOne({ owner: req.user.id });
    
    if (!farmProfile) {
      // Create default farm profile from user data
      const user = await User.findById(req.user.id);
      farmProfile = await FarmProfile.create({
        owner: req.user.id,
        basicInfo: {
          farmName: user.farmDetails?.farmName || '',
          farmLogo: user.farmDetails?.farmLogo || null
        },
        operationalDetails: {
          farmSize: {
            value: user.farmDetails?.farmSize || 0,
            unit: 'acres'
          },
          farmType: user.farmDetails?.farmType || 'mixed',
          primaryProducts: user.farmDetails?.animalTypes || []
        },
        locationDetails: {
          address: user.farmDetails?.location || {},
          coordinates: user.farmDetails?.location?.coordinates || {}
        },
        legalInformation: {
          establishedYear: user.farmDetails?.establishedYear,
          registrationNumber: user.farmDetails?.registrationNumber,
          taxId: user.farmDetails?.taxId
        }
      });
    }

    res.json({
      success: true,
      data: farmProfile
    });
  } catch (error) {
    console.error('Get farm profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting farm profile'
    });
  }
});

// @route   POST /api/farm-profile/setup
// @desc    Complete farm profile setup during registration
// @access  Private
router.post('/setup', protect, upload.fields([
  { name: 'farmLogo', maxCount: 1 },
  { name: 'documents', maxCount: 10 }
]), [
  body('farmName').notEmpty().withMessage('Farm name is required'),
  body('farmType').isIn(['dairy', 'beef', 'mixed', 'goat', 'sheep', 'poultry', 'swine', 'organic', 'conventional', 'other']),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.country').notEmpty().withMessage('Country is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      farmName,
      tagline,
      description,
      farmType,
      farmSize,
      primaryProducts,
      address,
      coordinates,
      businessStructure,
      registrationNumber,
      taxId,
      establishedYear,
      website,
      socialMedia
    } = req.body;

    // Handle farm logo upload
    let farmLogoData = null;
    if (req.files && req.files.farmLogo) {
      const logoFile = req.files.farmLogo[0];
      farmLogoData = {
        url: `/uploads/farm-logos/${logoFile.filename}`,
        filename: logoFile.originalname,
        uploadedAt: new Date()
      };
    }

    // Create or update farm profile
    let farmProfile = await FarmProfile.findOne({ owner: req.user.id });
    
    if (farmProfile) {
      // Update existing profile
      farmProfile.basicInfo = {
        farmName,
        farmLogo: farmLogoData || farmProfile.basicInfo.farmLogo,
        tagline,
        description,
        website,
        socialMedia: socialMedia ? JSON.parse(socialMedia) : undefined
      };
      
      farmProfile.operationalDetails = {
        farmSize: {
          value: farmSize,
          unit: 'acres'
        },
        farmType,
        primaryProducts: primaryProducts ? primaryProducts.split(',').map(p => p.trim()) : []
      };
      
      farmProfile.locationDetails = {
        address: JSON.parse(address),
        coordinates: coordinates ? JSON.parse(coordinates) : undefined
      };
      
      farmProfile.legalInformation = {
        businessStructure,
        registrationNumber,
        taxId,
        establishedYear: parseInt(establishedYear)
      };
      
      await farmProfile.save();
    } else {
      // Create new profile
      farmProfile = await FarmProfile.create({
        owner: req.user.id,
        basicInfo: {
          farmName,
          farmLogo: farmLogoData,
          tagline,
          description,
          website,
          socialMedia: socialMedia ? JSON.parse(socialMedia) : {}
        },
        operationalDetails: {
          farmSize: {
            value: farmSize,
            unit: 'acres'
          },
          farmType,
          primaryProducts: primaryProducts ? primaryProducts.split(',').map(p => p.trim()) : []
        },
        locationDetails: {
          address: JSON.parse(address),
          coordinates: coordinates ? JSON.parse(coordinates) : {}
        },
        legalInformation: {
          businessStructure,
          registrationNumber,
          taxId,
          establishedYear: parseInt(establishedYear)
        }
      });
    }

    // Handle document uploads
    const uploadedDocuments = [];
    if (req.files && req.files.documents) {
      const documentFiles = req.files.documents;
      const documentTypes = req.body.documentTypes ? req.body.documentTypes.split(',') : [];
      const documentNames = req.body.documentNames ? req.body.documentNames.split(',') : [];
      const documentNumbers = req.body.documentNumbers ? req.body.documentNumbers.split(',') : [];
      const issuingAuthorities = req.body.issuingAuthorities ? req.body.issuingAuthorities.split(',') : [];
      const issuedDates = req.body.issuedDates ? req.body.issuedDates.split(',') : [];
      const expiryDates = req.body.expiryDates ? req.body.expiryDates.split(',') : [];

      for (let i = 0; i < documentFiles.length; i++) {
        const file = documentFiles[i];
        const documentData = {
          owner: req.user.id,
          documentType: documentTypes[i] || 'other',
          documentCategory: this.getCategoryForDocumentType(documentTypes[i] || 'other'),
          documentName: documentNames[i] || file.originalname,
          documentNumber: documentNumbers[i] || '',
          issuingAuthority: {
            name: issuingAuthorities[i] || ''
          },
          issuedDate: issuedDates[i] ? new Date(issuedDates[i]) : null,
          expiryDate: expiryDates[i] ? new Date(expiryDates[i]) : null,
          fileDetails: {
            originalFilename: file.originalname,
            filename: file.filename,
            fileUrl: `/uploads/farm-documents/${file.filename}`,
            fileSize: file.size,
            mimeType: file.mimetype
          },
          versions: [{
            version: 1,
            filename: file.filename,
            fileUrl: `/uploads/farm-documents/${file.filename}`,
            uploadedBy: req.user.id,
            changeReason: 'Initial upload',
            isActive: true
          }],
          auditTrail: [{
            action: 'created',
            performedBy: req.user.id,
            details: 'Document uploaded during farm registration',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          }]
        };

        const document = await FarmDocument.create(documentData);
        uploadedDocuments.push(document);
      }
    }

    // Update user's farm details
    await User.findByIdAndUpdate(req.user.id, {
      'farmDetails.farmName': farmName,
      'farmDetails.farmLogo': farmLogoData,
      'farmDetails.farmType': farmType,
      'farmDetails.farmSize': farmSize,
      'farmDetails.location.address': JSON.parse(address).street,
      'farmDetails.location.city': JSON.parse(address).city,
      'farmDetails.location.state': JSON.parse(address).state,
      'farmDetails.location.country': JSON.parse(address).country,
      'farmDetails.location.zipCode': JSON.parse(address).zipCode,
      'farmDetails.location.coordinates': coordinates ? JSON.parse(coordinates) : undefined,
      'farmDetails.registrationNumber': registrationNumber,
      'farmDetails.taxId': taxId,
      'farmDetails.establishedYear': parseInt(establishedYear),
      'farmDetails.animalTypes': primaryProducts ? primaryProducts.split(',').map(p => p.trim()) : []
    });

    res.status(201).json({
      success: true,
      message: 'Farm profile setup completed successfully',
      data: {
        farmProfile,
        uploadedDocuments: uploadedDocuments.length,
        documents: uploadedDocuments
      }
    });
  } catch (error) {
    console.error('Farm profile setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error setting up farm profile'
    });
  }
});

// @route   PUT /api/farm-profile
// @desc    Update farm profile
// @access  Private
router.put('/', protect, upload.single('farmLogo'), async (req, res) => {
  try {
    let farmProfile = await FarmProfile.findOne({ owner: req.user.id });
    
    if (!farmProfile) {
      return res.status(404).json({
        success: false,
        message: 'Farm profile not found'
      });
    }

    // Handle farm logo update
    if (req.file) {
      farmProfile.basicInfo.farmLogo = {
        url: `/uploads/farm-logos/${req.file.filename}`,
        filename: req.file.originalname,
        uploadedAt: new Date()
      };
    }

    // Update other fields
    const updateFields = [
      'basicInfo.farmName',
      'basicInfo.tagline', 
      'basicInfo.description',
      'basicInfo.website',
      'operationalDetails.farmSize',
      'operationalDetails.farmType',
      'operationalDetails.primaryProducts',
      'locationDetails.address',
      'locationDetails.coordinates',
      'legalInformation.businessStructure',
      'legalInformation.registrationNumber',
      'legalInformation.taxId',
      'legalInformation.establishedYear',
      'marketingInfo.isPubliclyVisible',
      'marketingInfo.allowDirectSales'
    ];

    updateFields.forEach(field => {
      const keys = field.split('.');
      let current = farmProfile;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      const value = req.body[keys.join('.')];
      if (value !== undefined) {
        current[keys[keys.length - 1]] = value;
      }
    });

    await farmProfile.save();

    res.json({
      success: true,
      message: 'Farm profile updated successfully',
      data: farmProfile
    });
  } catch (error) {
    console.error('Update farm profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating farm profile'
    });
  }
});

// FARM DOCUMENTS ROUTES

// @route   GET /api/farm-profile/documents
// @desc    Get all farm documents
// @access  Private
router.get('/documents', protect, async (req, res) => {
  try {
    const { documentType, status, category } = req.query;
    
    const query = { owner: req.user.id, status: { $ne: 'deleted' } };
    if (documentType) query.documentType = documentType;
    if (status) query['verificationStatus.status'] = status;
    if (category) query.documentCategory = category;

    const documents = await FarmDocument.find(query)
      .sort({ createdAt: -1 })
      .populate('verificationStatus.verifiedBy', 'name')
      .populate('versions.uploadedBy', 'name');

    // Add expiry status
    const documentsWithStatus = documents.map(doc => ({
      ...doc.toObject({ virtuals: true }),
      expiryStatus: doc.isExpired ? 'expired' : 
                   doc.daysUntilExpiry !== null && doc.daysUntilExpiry <= 30 ? 'expiring_soon' : 'valid'
    }));

    res.json({
      success: true,
      data: documentsWithStatus
    });
  } catch (error) {
    console.error('Get farm documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting farm documents'
    });
  }
});

// @route   POST /api/farm-profile/documents
// @desc    Upload new farm document
// @access  Private
router.post('/documents', protect, upload.single('document'), [
  body('documentType').notEmpty().withMessage('Document type is required'),
  body('documentName').notEmpty().withMessage('Document name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Document file is required'
      });
    }

    const documentData = {
      owner: req.user.id,
      documentType: req.body.documentType,
      documentCategory: this.getCategoryForDocumentType(req.body.documentType),
      documentName: req.body.documentName,
      documentNumber: req.body.documentNumber,
      description: req.body.description,
      issuingAuthority: {
        name: req.body.issuingAuthorityName,
        department: req.body.issuingAuthorityDepartment,
        contactInfo: {
          phone: req.body.authorityPhone,
          email: req.body.authorityEmail,
          address: req.body.authorityAddress
        }
      },
      issuedDate: req.body.issuedDate ? new Date(req.body.issuedDate) : null,
      expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
      fileDetails: {
        originalFilename: req.file.originalname,
        filename: req.file.filename,
        fileUrl: `/uploads/farm-documents/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      },
      versions: [{
        version: 1,
        filename: req.file.filename,
        fileUrl: `/uploads/farm-documents/${req.file.filename}`,
        uploadedBy: req.user.id,
        changeReason: 'Initial upload',
        isActive: true
      }],
      priority: req.body.priority || 'medium',
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
    };

    const document = await FarmDocument.create(documentData);
    
    // Add audit trail entry
    await document.addAuditEntry('created', req.user.id, 'Document uploaded', req);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading document'
    });
  }
});

// @route   GET /api/farm-profile/documents/:id
// @desc    Get single document with full details
// @access  Private
router.get('/documents/:id', protect, checkOwnership(FarmDocument), async (req, res) => {
  try {
    const document = await FarmDocument.findById(req.params.id)
      .populate('verificationStatus.verifiedBy', 'name email')
      .populate('versions.uploadedBy', 'name')
      .populate('auditTrail.performedBy', 'name');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Add audit trail entry for viewing
    await document.addAuditEntry('viewed', req.user.id, 'Document viewed', req);

    res.json({
      success: true,
      data: {
        ...document.toObject({ virtuals: true }),
        expiryStatus: document.isExpired ? 'expired' : 
                     document.daysUntilExpiry !== null && document.daysUntilExpiry <= 30 ? 'expiring_soon' : 'valid'
      }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting document'
    });
  }
});

// @route   PUT /api/farm-profile/documents/:id/new-version
// @desc    Upload new version of document
// @access  Private
router.put('/documents/:id/new-version', protect, checkOwnership(FarmDocument), upload.single('document'), [
  body('changeReason').notEmpty().withMessage('Change reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Document file is required'
      });
    }

    const document = await FarmDocument.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const fileData = {
      originalFilename: req.file.originalname,
      filename: req.file.filename,
      fileUrl: `/uploads/farm-documents/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date()
    };

    await document.createNewVersion(fileData, req.user.id, req.body.changeReason);
    await document.addAuditEntry('updated', req.user.id, `New version uploaded: ${req.body.changeReason}`, req);

    res.json({
      success: true,
      message: 'New document version uploaded successfully',
      data: document
    });
  } catch (error) {
    console.error('Upload document version error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading document version'
    });
  }
});

// @route   GET /api/farm-profile/documents/expiring
// @desc    Get documents expiring soon
// @access  Private
router.get('/documents/expiring', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const expiringDocuments = await FarmDocument.find({
      owner: req.user.id,
      expiryDate: {
        $lte: new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000),
        $gte: new Date()
      },
      status: 'active'
    }).sort({ expiryDate: 1 });

    res.json({
      success: true,
      data: expiringDocuments.map(doc => ({
        ...doc.toObject({ virtuals: true }),
        expiryStatus: 'expiring_soon'
      }))
    });
  } catch (error) {
    console.error('Get expiring documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting expiring documents'
    });
  }
});

// Helper method to categorize document types
router.getCategoryForDocumentType = function(documentType) {
  const categoryMap = {
    'business_license': 'legal',
    'farm_registration': 'legal',
    'tax_certificate': 'financial',
    'veterinary_license': 'compliance',
    'organic_certificate': 'certification',
    'insurance_policy': 'financial',
    'land_ownership': 'legal',
    'lease_agreement': 'legal',
    'animal_health_certificate': 'compliance',
    'feed_registration': 'operational',
    'water_rights': 'legal',
    'environmental_permit': 'compliance',
    'building_permit': 'legal',
    'zoning_certificate': 'legal'
  };
  
  return categoryMap[documentType] || 'operational';
};

module.exports = router; 
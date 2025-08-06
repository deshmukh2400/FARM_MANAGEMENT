# 🏡 Enhanced Farm Registration Process

This document outlines the comprehensive farm registration process that includes farm logo upload, detailed farm information, and official document management.

## 📋 **Registration Flow Overview**

The farm registration process is now divided into two main steps:

### **Step 1: Basic User Registration**
- User personal information (name, email, password, phone)
- Role selection (farmer, veterinarian, supplier, buyer)
- Account creation with basic authentication

### **Step 2: Farm Profile Setup**
- Farm logo upload
- Detailed farm information
- Official document uploads
- Legal and operational details

## 🚀 **Step 1: Basic User Registration**

### **API Endpoint**
```
POST /api/auth/register
```

### **Required Fields**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "role": "farmer"
}
```

### **Response**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "farmer",
    "farmDetails": {
      "farmName": "",
      "farmType": "mixed"
    }
  }
}
```

## 🏢 **Step 2: Farm Profile Setup**

### **API Endpoint**
```
POST /api/farm-profile/setup
Content-Type: multipart/form-data
```

### **Required Information**

#### **Basic Farm Information**
- **Farm Name**: Official name of the farm
- **Farm Logo**: Image file (JPG, PNG, GIF)
- **Farm Type**: dairy, beef, mixed, goat, sheep, poultry, swine, organic, conventional, other
- **Farm Size**: Numeric value with unit (acres/hectares)
- **Primary Products**: List of main farm products

#### **Location Details**
```json
{
  "address": {
    "street": "123 Farm Road",
    "city": "Farmville",
    "state": "Iowa",
    "country": "USA",
    "zipCode": "12345"
  },
  "coordinates": {
    "latitude": 41.5868,
    "longitude": -93.6250
  }
}
```

#### **Legal Information**
- **Business Structure**: sole_proprietorship, partnership, llc, corporation, cooperative, other
- **Registration Number**: Official farm registration number
- **Tax ID**: Tax identification number
- **Established Year**: Year the farm was established

#### **Optional Information**
- **Tagline**: Short description of the farm
- **Description**: Detailed farm description
- **Website**: Farm website URL
- **Social Media**: Facebook, Instagram, Twitter, YouTube links

### **Document Upload Requirements**

#### **Supported Document Types**
1. **business_license** - Business operating license
2. **farm_registration** - Official farm registration certificate
3. **tax_certificate** - Tax registration certificate
4. **veterinary_license** - Veterinary practice license (if applicable)
5. **organic_certificate** - Organic farming certification
6. **insurance_policy** - Farm insurance policy
7. **land_ownership** - Property ownership documents
8. **lease_agreement** - Land lease agreements
9. **animal_health_certificate** - Animal health certificates
10. **feed_registration** - Feed manufacturing/distribution license
11. **water_rights** - Water usage rights documentation
12. **environmental_permit** - Environmental compliance permits
13. **building_permit** - Construction/building permits
14. **zoning_certificate** - Zoning compliance certificate
15. **other** - Other relevant documents

#### **Document Information Required**
For each document:
- **Document File**: PDF or image file (max 10MB)
- **Document Name**: Descriptive name
- **Document Number**: Official document number (if applicable)
- **Issuing Authority**: Organization that issued the document
- **Issue Date**: Date the document was issued
- **Expiry Date**: Document expiration date (if applicable)

### **Example Farm Setup Request**

```javascript
const formData = new FormData();

// Basic farm information
formData.append('farmName', 'Green Valley Farm');
formData.append('farmType', 'dairy');
formData.append('farmSize', '150');
formData.append('primaryProducts', 'milk,cheese,beef');
formData.append('tagline', 'Sustainable dairy farming since 1985');
formData.append('description', 'Family-owned dairy farm focusing on sustainable practices...');
formData.append('website', 'https://greenvalleyfarm.com');

// Farm logo
formData.append('farmLogo', logoFile);

// Address information
formData.append('address', JSON.stringify({
  street: '123 Farm Road',
  city: 'Farmville',
  state: 'Iowa',
  country: 'USA',
  zipCode: '12345'
}));

// Coordinates
formData.append('coordinates', JSON.stringify({
  latitude: 41.5868,
  longitude: -93.6250
}));

// Legal information
formData.append('businessStructure', 'llc');
formData.append('registrationNumber', 'FR-2023-001234');
formData.append('taxId', '12-3456789');
formData.append('establishedYear', '1985');

// Social media
formData.append('socialMedia', JSON.stringify({
  facebook: 'https://facebook.com/greenvalleyfarm',
  instagram: 'https://instagram.com/greenvalleyfarm'
}));

// Documents
formData.append('documents', businessLicenseFile);
formData.append('documents', farmRegistrationFile);
formData.append('documents', insurancePolicyFile);

// Document metadata
formData.append('documentTypes', 'business_license,farm_registration,insurance_policy');
formData.append('documentNames', 'Business License 2023,Farm Registration Certificate,Farm Insurance Policy');
formData.append('documentNumbers', 'BL-2023-5678,FR-2023-001234,INS-789012');
formData.append('issuingAuthorities', 'State Business Bureau,Department of Agriculture,Farm Insurance Co');
formData.append('issuedDates', '2023-01-15,2023-02-01,2023-03-10');
formData.append('expiryDates', '2024-01-15,2025-02-01,2024-03-10');
```

### **Successful Setup Response**
```json
{
  "success": true,
  "message": "Farm profile setup completed successfully",
  "data": {
    "farmProfile": {
      "_id": "farm_profile_id",
      "basicInfo": {
        "farmName": "Green Valley Farm",
        "farmLogo": {
          "url": "/uploads/farm-logos/logo-123456.jpg",
          "filename": "farm-logo.jpg",
          "uploadedAt": "2023-12-01T10:00:00Z"
        },
        "tagline": "Sustainable dairy farming since 1985",
        "description": "Family-owned dairy farm...",
        "website": "https://greenvalleyfarm.com"
      },
      "operationalDetails": {
        "farmSize": {
          "value": 150,
          "unit": "acres"
        },
        "farmType": "dairy",
        "primaryProducts": ["milk", "cheese", "beef"]
      },
      "locationDetails": {
        "address": {
          "street": "123 Farm Road",
          "city": "Farmville",
          "state": "Iowa",
          "country": "USA",
          "zipCode": "12345"
        },
        "coordinates": {
          "latitude": 41.5868,
          "longitude": -93.6250
        }
      },
      "legalInformation": {
        "businessStructure": "llc",
        "registrationNumber": "FR-2023-001234",
        "taxId": "12-3456789",
        "establishedYear": 1985
      }
    },
    "uploadedDocuments": 3,
    "documents": [
      {
        "_id": "doc_id_1",
        "documentType": "business_license",
        "documentName": "Business License 2023",
        "documentNumber": "BL-2023-5678",
        "fileDetails": {
          "fileUrl": "/uploads/farm-documents/doc-123456.pdf",
          "originalFilename": "business-license.pdf"
        },
        "verificationStatus": {
          "status": "pending"
        },
        "expiryDate": "2024-01-15T00:00:00Z"
      }
      // ... more documents
    ]
  }
}
```

## 📱 **Mobile App Integration**

### **Registration Flow in Mobile App**

1. **Initial Registration Screen**
   - Name, email, password, phone inputs
   - Role selection
   - Terms and conditions acceptance

2. **Farm Setup Screen**
   - Farm logo selection from camera/gallery
   - Farm information form
   - Document upload interface
   - Progress indicator

3. **Document Upload Interface**
   - Document type selection
   - Camera/file picker integration
   - Document information form
   - Upload progress tracking

### **Redux State Management**

```javascript
// Farm profile state structure
farmProfile: {
  profile: null,
  documents: [],
  isLoading: false,
  error: null,
  setupCompleted: false
}

// Available actions
dispatch(setupFarmProfile({
  farmName: 'Green Valley Farm',
  farmType: 'dairy',
  farmSize: '150',
  farmLogo: logoImageFile,
  address: addressObject,
  documents: documentsArray
}));
```

## 🌐 **Web Application Integration**

### **Registration Wizard**

1. **Step 1: Account Creation**
   - User information form
   - Email verification
   - Password strength validation

2. **Step 2: Farm Information**
   - Farm details form
   - Logo upload with preview
   - Address autocomplete
   - Map integration for coordinates

3. **Step 3: Document Upload**
   - Drag-and-drop interface
   - Document type categorization
   - Bulk upload support
   - Preview and edit capabilities

4. **Step 4: Review and Submit**
   - Summary of all information
   - Document verification status
   - Terms acceptance
   - Final submission

## 📊 **Document Management Features**

### **Document Categories**
- **Legal**: Business licenses, registrations, permits
- **Financial**: Tax certificates, insurance policies
- **Operational**: Health certificates, feed registrations
- **Compliance**: Environmental permits, zoning certificates
- **Certification**: Organic certificates, quality assurance

### **Document Lifecycle Management**
1. **Upload**: Initial document submission
2. **Verification**: Admin/authority review process
3. **Active**: Document is valid and verified
4. **Expiry Warning**: Automated reminders before expiry
5. **Renewal**: Process for updating expired documents
6. **Archive**: Historical document storage

### **Automated Features**
- **Expiry Notifications**: Email/SMS/push notifications before document expiry
- **Renewal Reminders**: Automated renewal process initiation
- **Compliance Tracking**: Monitor regulatory compliance status
- **Audit Trail**: Complete history of document actions
- **Version Control**: Track document updates and changes

## 🔒 **Security and Privacy**

### **Document Security**
- **Encrypted Storage**: All documents encrypted at rest
- **Access Control**: Role-based access to sensitive documents
- **Audit Logging**: Complete audit trail for all document access
- **Secure Upload**: HTTPS upload with file type validation
- **Data Retention**: Configurable document retention policies

### **Privacy Controls**
- **Document Visibility**: Control who can view specific documents
- **Sharing Permissions**: Granular sharing controls
- **Data Export**: User can export their document data
- **Right to Deletion**: Users can request document deletion

## 🚀 **Implementation Guide**

### **Backend Setup**

1. **Create Upload Directories**
```bash
mkdir -p backend/uploads/farm-logos
mkdir -p backend/uploads/farm-documents
```

2. **Configure Environment Variables**
```env
# Add to .env file
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif
ALLOWED_DOCUMENT_TYPES=application/pdf,image/jpeg,image/png
```

3. **Database Indexes**
```javascript
// Add these indexes for better performance
db.farmprofiles.createIndex({ owner: 1 });
db.farmdocuments.createIndex({ owner: 1, documentType: 1 });
db.farmdocuments.createIndex({ owner: 1, expiryDate: 1 });
```

### **Frontend Integration**

1. **Install Required Dependencies**
```bash
# For mobile (React Native)
npm install react-native-image-picker react-native-document-picker

# For web (React)
npm install react-dropzone react-image-crop
```

2. **File Upload Component**
```javascript
import { setupFarmProfile } from '../store/slices/enhancementsSlice';

const FarmSetupForm = () => {
  const dispatch = useDispatch();
  
  const handleSubmit = async (formData) => {
    const result = await dispatch(setupFarmProfile(formData));
    if (result.type === 'enhancements/setupFarmProfile/fulfilled') {
      // Navigate to dashboard or next step
    }
  };
};
```

## 📈 **Benefits of Enhanced Registration**

### **For Farmers**
- **Professional Presence**: Farm logo and detailed profile
- **Document Organization**: Centralized document management
- **Compliance Tracking**: Automated compliance monitoring
- **Credibility**: Verified farm status increases trust
- **Marketplace Access**: Enhanced profile for marketplace features

### **For Platform**
- **Data Quality**: Comprehensive farm information
- **Trust & Safety**: Verified farms and documents
- **Regulatory Compliance**: Meet agricultural regulations
- **Analytics**: Better insights into farm operations
- **Revenue Opportunities**: Premium verification services

### **For Partners**
- **Verified Suppliers**: Access to verified farm suppliers
- **Due Diligence**: Complete farm documentation available
- **Risk Assessment**: Document verification reduces risk
- **Compliance Assurance**: Regulatory compliance verification

## 🔧 **API Endpoints Summary**

```
# Farm Profile Management
GET    /api/farm-profile              # Get farm profile
POST   /api/farm-profile/setup        # Complete farm setup
PUT    /api/farm-profile              # Update farm profile

# Document Management
GET    /api/farm-profile/documents    # Get all documents
POST   /api/farm-profile/documents    # Upload new document
GET    /api/farm-profile/documents/:id # Get document details
PUT    /api/farm-profile/documents/:id/new-version # Upload new version
GET    /api/farm-profile/documents/expiring # Get expiring documents

# Enhanced Registration
POST   /api/auth/register             # Basic user registration
```

## 📞 **Support and Troubleshooting**

### **Common Issues**
1. **File Upload Errors**: Check file size and type restrictions
2. **Document Verification Delays**: Contact admin for manual review
3. **Missing Required Documents**: Check document requirements by region
4. **Logo Upload Issues**: Ensure image meets size and format requirements

### **Best Practices**
- Upload high-quality, legible documents
- Keep document information up-to-date
- Set up expiry notifications
- Regularly review and update farm information
- Maintain backup copies of important documents

---

*This enhanced farm registration process ensures comprehensive farm documentation, regulatory compliance, and professional presentation while maintaining security and user privacy.* 
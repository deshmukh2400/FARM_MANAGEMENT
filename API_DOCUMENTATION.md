# 📚 Farm Management System - API Documentation

## 🌟 **Overview**

The Farm Management System API provides comprehensive endpoints for managing livestock farms, including animal registration, health tracking, breeding schedules, inventory management, and marketplace features.

**Base URL**: `http://localhost:5000` (Development) | `https://api.farmmanagement.com` (Production)  
**API Version**: v1  
**Authentication**: JWT Bearer Token  

---

## 🔗 **Interactive Documentation**

Access the interactive Swagger UI documentation:
- **Development**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Production**: [https://api.farmmanagement.com/api-docs](https://api.farmmanagement.com/api-docs)

---

## 🔐 **Authentication**

### **Authentication Flow**
1. **Register** or **Login** to get JWT token
2. Include token in **Authorization** header: `Bearer <token>`
3. Token expires after configured time (default: 30 days)

### **Headers Required**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 📋 **API Endpoints Overview**

| Category | Endpoints | Description |
|----------|-----------|-------------|
| **Authentication** | 6 endpoints | User registration, login, profile management |
| **Animals** | 8 endpoints | Animal registration, management, health records |
| **Schedules** | 6 endpoints | Vaccination, breeding, and care schedules |
| **Inventory** | 7 endpoints | Medicine, feed, and supply management |
| **Marketplace** | 5 endpoints | Animal trading and marketplace features |
| **Financial** | 8 endpoints | Revenue tracking, expense management |
| **Health** | 4 endpoints | AI health monitoring and analysis |
| **Weather** | 6 endpoints | Weather data and forecasting |
| **Community** | 7 endpoints | Forums, knowledge sharing |

**Total**: 57+ API endpoints

---

## 🔑 **Authentication Endpoints**

### **POST /api/auth/register**
Register a new user with farm details.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "phone": "+1234567890",
  "role": "farmer"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64a7b8c9d1e2f3a4b5c6d7e8",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "farmer",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **POST /api/auth/login**
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64a7b8c9d1e2f3a4b5c6d7e8",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "farmer",
      "lastLogin": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **GET /api/auth/profile**
Get current user profile information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64a7b8c9d1e2f3a4b5c6d7e8",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "role": "farmer",
      "farmDetails": {
        "farmName": "Green Valley Farm",
        "location": {
          "address": "123 Farm Road",
          "city": "Farmville",
          "state": "CA",
          "country": "USA"
        },
        "farmSize": 50,
        "farmType": "livestock"
      },
      "profile": {
        "bio": "Experienced livestock farmer",
        "experience": 15,
        "specialization": ["goats", "cattle"]
      }
    }
  }
}
```

---

## 🐄 **Animals Endpoints**

### **POST /api/animals**
Register a new animal.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "registrationNumber": "REG001",
  "basicInfo": {
    "name": "Bella",
    "category": "goat",
    "breed": "Boer",
    "gender": "female",
    "dateOfBirth": "2023-01-15",
    "color": "white and brown"
  },
  "physicalCharacteristics": {
    "currentWeight": 45.5,
    "currentHeight": 75.2,
    "birthWeight": 3.2
  },
  "parentage": {
    "motherId": "MOTHER001",
    "fatherId": "FATHER001"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Animal registered successfully",
  "data": {
    "animal": {
      "_id": "64a7b8c9d1e2f3a4b5c6d7e9",
      "owner": "64a7b8c9d1e2f3a4b5c6d7e8",
      "registrationNumber": "REG001",
      "basicInfo": {
        "name": "Bella",
        "category": "goat",
        "breed": "Boer",
        "gender": "female",
        "dateOfBirth": "2023-01-15T00:00:00Z"
      },
      "status": {
        "health": "healthy",
        "location": "Pasture A",
        "isActive": true
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### **GET /api/animals**
Get all animals for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by animal category
- `health` (optional): Filter by health status
- `search` (optional): Search by name or registration number

**Response (200):**
```json
{
  "success": true,
  "data": {
    "animals": [
      {
        "_id": "64a7b8c9d1e2f3a4b5c6d7e9",
        "registrationNumber": "REG001",
        "basicInfo": {
          "name": "Bella",
          "category": "goat",
          "breed": "Boer",
          "gender": "female"
        },
        "status": {
          "health": "healthy",
          "location": "Pasture A"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalAnimals": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### **GET /api/animals/:id**
Get detailed information about a specific animal.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "animal": {
      "_id": "64a7b8c9d1e2f3a4b5c6d7e9",
      "registrationNumber": "REG001",
      "basicInfo": {
        "name": "Bella",
        "category": "goat",
        "breed": "Boer",
        "gender": "female",
        "dateOfBirth": "2023-01-15T00:00:00Z"
      },
      "healthRecords": {
        "vaccinations": [
          {
            "vaccineName": "CDT Vaccine",
            "dateAdministered": "2024-01-01T00:00:00Z",
            "nextDueDate": "2025-01-01T00:00:00Z",
            "veterinarian": "Dr. Smith"
          }
        ],
        "medicalTreatments": []
      },
      "growthRecords": [
        {
          "date": "2024-01-15T00:00:00Z",
          "weight": 45.5,
          "height": 75.2
        }
      ]
    }
  }
}
```

---

## 📅 **Schedules Endpoints**

### **POST /api/schedules**
Create a new schedule for animal care.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "animal": "64a7b8c9d1e2f3a4b5c6d7e9",
  "type": "vaccination",
  "title": "Annual CDT Vaccination",
  "description": "Annual vaccination for Clostridial diseases",
  "scheduledDate": "2024-02-15T09:00:00Z",
  "priority": "high",
  "reminder": {
    "enabled": true,
    "reminderTime": 24
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Schedule created successfully",
  "data": {
    "schedule": {
      "_id": "64a7b8c9d1e2f3a4b5c6d7ea",
      "user": "64a7b8c9d1e2f3a4b5c6d7e8",
      "animal": "64a7b8c9d1e2f3a4b5c6d7e9",
      "type": "vaccination",
      "title": "Annual CDT Vaccination",
      "scheduledDate": "2024-02-15T09:00:00Z",
      "status": "pending",
      "priority": "high"
    }
  }
}
```

### **GET /api/schedules**
Get all schedules for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type` (optional): Filter by schedule type
- `status` (optional): Filter by status
- `date` (optional): Filter by date (YYYY-MM-DD)
- `animal` (optional): Filter by animal ID

---

## 📦 **Inventory Endpoints**

### **POST /api/inventory**
Add new inventory item.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Penicillin Injectable",
  "category": "medicine",
  "quantity": 10,
  "unit": "vials",
  "expiryDate": "2025-06-30",
  "supplier": "VetMed Supplies",
  "costPerUnit": 15.50,
  "minimumStock": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Inventory item added successfully",
  "data": {
    "item": {
      "_id": "64a7b8c9d1e2f3a4b5c6d7eb",
      "user": "64a7b8c9d1e2f3a4b5c6d7e8",
      "name": "Penicillin Injectable",
      "category": "medicine",
      "quantity": 10,
      "unit": "vials",
      "expiryDate": "2025-06-30T00:00:00Z",
      "status": "in_stock"
    }
  }
}
```

---

## 🏪 **Marketplace Endpoints**

### **POST /api/marketplace/listings**
Create a new marketplace listing.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "animal": "64a7b8c9d1e2f3a4b5c6d7e9",
  "type": "sale",
  "price": 500,
  "currency": "USD",
  "description": "Healthy female Boer goat, excellent breeding stock",
  "location": {
    "city": "Farmville",
    "state": "CA"
  },
  "negotiable": true
}
```

---

## 💰 **Financial Endpoints**

### **POST /api/financial/transactions**
Record a financial transaction.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "expense",
  "category": "medicine",
  "amount": 155.00,
  "description": "Purchased antibiotics for sick animals",
  "date": "2024-01-15",
  "relatedAnimal": "64a7b8c9d1e2f3a4b5c6d7e9",
  "paymentMethod": "credit_card"
}
```

---

## 🏥 **Health Monitoring Endpoints**

### **POST /api/health/analyze**
Submit animal data for AI health analysis.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "animal": "64a7b8c9d1e2f3a4b5c6d7e9",
  "symptoms": ["lethargy", "loss_of_appetite"],
  "vitalSigns": {
    "temperature": 102.5,
    "heartRate": 80,
    "respiratoryRate": 20
  },
  "behaviorChanges": ["reduced_activity", "isolation"]
}
```

---

## 🌤️ **Weather Endpoints**

### **GET /api/weather/current**
Get current weather for user's farm location.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "current": {
      "temperature": 22.5,
      "humidity": 65,
      "windSpeed": 10.2,
      "conditions": "partly_cloudy",
      "timestamp": "2024-01-15T15:30:00Z"
    },
    "location": {
      "city": "Farmville",
      "state": "CA",
      "coordinates": {
        "lat": 40.7128,
        "lon": -74.0060
      }
    }
  }
}
```

---

## 🏘️ **Community Endpoints**

### **GET /api/community/forums**
Get community forums and discussions.

**Headers:** `Authorization: Bearer <token>`

---

## ❌ **Error Responses**

### **Common Error Codes**

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request data or validation failed |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 422 | Unprocessable Entity | Invalid data format |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### **Error Response Format**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### **Authentication Errors**
```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

---

## 📊 **Response Formats**

### **Success Response Structure**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "meta": {
    // Optional metadata (pagination, counts, etc.)
  }
}
```

### **Pagination Format**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 🔒 **Security Features**

### **Implemented Security Measures**
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **Rate Limiting** - Prevents brute force attacks
- ✅ **Input Sanitization** - MongoDB injection prevention
- ✅ **CORS Protection** - Configured for specific origins
- ✅ **Helmet Security** - HTTP security headers
- ✅ **Request Validation** - express-validator middleware
- ✅ **Environment Variables** - Sensitive data protection

### **Rate Limiting**
- **Authentication endpoints**: 5 requests per 15 minutes
- **General API**: 100 requests per 15 minutes
- **File uploads**: 10 requests per hour

---

## 📈 **API Usage Examples**

### **Complete Authentication Flow**
```javascript
// 1. Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123!',
    phone: '+1234567890'
  })
});

const { data } = await registerResponse.json();
const token = data.token;

// 2. Use token for authenticated requests
const animalsResponse = await fetch('/api/animals', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### **Animal Registration Flow**
```javascript
// 1. Register animal
const animalData = {
  registrationNumber: 'REG001',
  basicInfo: {
    name: 'Bella',
    category: 'goat',
    breed: 'Boer',
    gender: 'female',
    dateOfBirth: '2023-01-15'
  }
};

const response = await fetch('/api/animals', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(animalData)
});

// 2. Schedule vaccination
const scheduleData = {
  animal: animalId,
  type: 'vaccination',
  title: 'CDT Vaccine',
  scheduledDate: '2024-02-15T09:00:00Z'
};

await fetch('/api/schedules', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(scheduleData)
});
```

---

## 🚀 **Getting Started**

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Access API documentation**:
   Visit [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

3. **Test endpoints**:
   Use the interactive Swagger UI or tools like Postman/Insomnia

4. **Authentication**:
   - Register a new user via `/api/auth/register`
   - Use the returned token for authenticated endpoints

---

## 📞 **Support**

- **Documentation**: [Swagger UI](http://localhost:5000/api-docs)
- **Testing Guide**: See `TESTING_GUIDE.md`
- **Issues**: Create an issue in the repository
- **Email**: support@farmmanagement.com

---

**API Version**: 1.0.0  
**Last Updated**: January 2024  
**Total Endpoints**: 57+ 
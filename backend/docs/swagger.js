const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Farm Management System API',
      version: '1.0.0',
      description: 'A comprehensive API for managing livestock farms, including animal registration, health tracking, breeding schedules, inventory management, and marketplace features.',
      contact: {
        name: 'Farm Management Team',
        email: 'support@farmmanagement.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.farmmanagement.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'phone'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the user'
            },
            name: {
              type: 'string',
              maxLength: 50,
              description: 'Full name of the user'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address (must be unique)'
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Password (must contain uppercase, lowercase, number, and special character)'
            },
            phone: {
              type: 'string',
              description: 'Phone number'
            },
            role: {
              type: 'string',
              enum: ['farmer', 'veterinarian', 'admin'],
              default: 'farmer',
              description: 'User role'
            },
            farmDetails: {
              type: 'object',
              required: ['farmName', 'location'],
              properties: {
                farmName: {
                  type: 'string',
                  description: 'Name of the farm'
                },
                location: {
                  type: 'object',
                  required: ['address', 'city', 'state', 'country'],
                  properties: {
                    address: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    country: { type: 'string' },
                    coordinates: {
                      type: 'object',
                      properties: {
                        latitude: { type: 'number' },
                        longitude: { type: 'number' }
                      }
                    }
                  }
                },
                farmSize: {
                  type: 'number',
                  description: 'Farm size in acres'
                },
                farmType: {
                  type: 'string',
                  enum: ['livestock', 'dairy', 'poultry', 'mixed'],
                  description: 'Type of farming'
                }
              }
            },
            profile: {
              type: 'object',
              properties: {
                bio: { type: 'string', maxLength: 500 },
                avatar: { type: 'string', format: 'uri' },
                experience: { type: 'number', minimum: 0 },
                specialization: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            lastLogin: {
              type: 'string',
              format: 'date-time'
            },
            isActive: {
              type: 'boolean',
              default: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Animal: {
          type: 'object',
          required: ['owner', 'registrationNumber', 'basicInfo'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the animal'
            },
            owner: {
              type: 'string',
              description: 'User ID of the animal owner'
            },
            registrationNumber: {
              type: 'string',
              description: 'Unique registration number'
            },
            basicInfo: {
              type: 'object',
              required: ['name', 'category', 'breed', 'gender', 'dateOfBirth'],
              properties: {
                name: {
                  type: 'string',
                  maxLength: 50,
                  description: 'Animal name'
                },
                category: {
                  type: 'string',
                  enum: ['goat', 'cattle', 'sheep', 'horse', 'pig', 'chicken', 'other'],
                  description: 'Animal category'
                },
                breed: {
                  type: 'string',
                  description: 'Animal breed'
                },
                gender: {
                  type: 'string',
                  enum: ['male', 'female'],
                  description: 'Animal gender'
                },
                dateOfBirth: {
                  type: 'string',
                  format: 'date',
                  description: 'Date of birth'
                },
                color: {
                  type: 'string',
                  description: 'Animal color/markings'
                }
              }
            },
            physicalCharacteristics: {
              type: 'object',
              properties: {
                currentWeight: { type: 'number', minimum: 0 },
                currentHeight: { type: 'number', minimum: 0 },
                birthWeight: { type: 'number', minimum: 0 }
              }
            },
            parentage: {
              type: 'object',
              properties: {
                motherId: { type: 'string' },
                fatherId: { type: 'string' }
              }
            },
            healthRecords: {
              type: 'object',
              properties: {
                vaccinations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      vaccineName: { type: 'string' },
                      dateAdministered: { type: 'string', format: 'date' },
                      nextDueDate: { type: 'string', format: 'date' },
                      veterinarian: { type: 'string' },
                      notes: { type: 'string' }
                    }
                  }
                },
                medicalTreatments: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      condition: { type: 'string' },
                      treatment: { type: 'string' },
                      startDate: { type: 'string', format: 'date' },
                      endDate: { type: 'string', format: 'date' },
                      veterinarian: { type: 'string' },
                      medication: { type: 'string' },
                      dosage: { type: 'string' },
                      notes: { type: 'string' }
                    }
                  }
                }
              }
            },
            status: {
              type: 'object',
              properties: {
                health: {
                  type: 'string',
                  enum: ['healthy', 'sick', 'injured', 'pregnant', 'lactating', 'deceased'],
                  default: 'healthy'
                },
                location: { type: 'string' },
                isActive: { type: 'boolean', default: true }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Schedule: {
          type: 'object',
          required: ['user', 'animal', 'type', 'scheduledDate'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the schedule'
            },
            user: {
              type: 'string',
              description: 'User ID who created the schedule'
            },
            animal: {
              type: 'string',
              description: 'Animal ID for the scheduled activity'
            },
            type: {
              type: 'string',
              enum: ['vaccination', 'deworming', 'breeding', 'health_check', 'grooming', 'feeding'],
              description: 'Type of scheduled activity'
            },
            title: {
              type: 'string',
              maxLength: 100,
              description: 'Schedule title'
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'Detailed description'
            },
            scheduledDate: {
              type: 'string',
              format: 'date-time',
              description: 'Scheduled date and time'
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'missed', 'cancelled'],
              default: 'pending'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              default: 'medium'
            },
            reminder: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean', default: true },
                reminderTime: { type: 'number', default: 24 }
              }
            },
            completedAt: {
              type: 'string',
              format: 'date-time'
            },
            notes: {
              type: 'string',
              maxLength: 1000
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Validation failed'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    example: 'Please provide a valid email'
                  }
                }
              }
            }
          }
        },
        UnauthorizedError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Access denied. No token provided'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Animals',
        description: 'Animal management endpoints'
      },
      {
        name: 'Schedules',
        description: 'Schedule management endpoints'
      },
      {
        name: 'Inventory',
        description: 'Inventory management endpoints'
      },
      {
        name: 'Marketplace',
        description: 'Marketplace and trading endpoints'
      },
      {
        name: 'Financial',
        description: 'Financial management endpoints'
      },
      {
        name: 'Health',
        description: 'Health monitoring and AI analysis endpoints'
      },
      {
        name: 'Weather',
        description: 'Weather information endpoints'
      },
      {
        name: 'Community',
        description: 'Community features and social endpoints'
      }
    ]
  },
  apis: ['./routes/*.js', './models/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
}; 
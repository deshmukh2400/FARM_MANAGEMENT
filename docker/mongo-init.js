// MongoDB initialization script for Farm Management System
// This script runs when MongoDB container starts for the first time

// Switch to the farm management database
db = db.getSiblingDB('farmmanagement');

// Create application user with appropriate permissions
db.createUser({
  user: 'farmapp',
  pwd: 'farmapppass123', // Change this in production
  roles: [
    {
      role: 'readWrite',
      db: 'farmmanagement'
    }
  ]
});

// Create indexes for better performance
print('Creating indexes for better performance...');

// User collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "phone": 1 });
db.users.createIndex({ "farmDetails.farmName": 1 });
db.users.createIndex({ "isActive": 1 });
db.users.createIndex({ "createdAt": -1 });

// Animal collection indexes
db.animals.createIndex({ "owner": 1 });
db.animals.createIndex({ "basicInfo.category": 1 });
db.animals.createIndex({ "basicInfo.breed": 1 });
db.animals.createIndex({ "basicInfo.gender": 1 });
db.animals.createIndex({ "basicInfo.name": "text", "registrationNumber": "text", "basicInfo.breed": "text" });
db.animals.createIndex({ "currentStatus.healthStatus": 1 });
db.animals.createIndex({ "currentStatus.isForSale": 1 });
db.animals.createIndex({ "currentStatus.isAvailableForMating": 1 });
db.animals.createIndex({ "isActive": 1 });
db.animals.createIndex({ "createdAt": -1 });

// Schedule collection indexes
db.schedules.createIndex({ "owner": 1 });
db.schedules.createIndex({ "animalId": 1 });
db.schedules.createIndex({ "type": 1 });
db.schedules.createIndex({ "status": 1 });
db.schedules.createIndex({ "priority": 1 });
db.schedules.createIndex({ "scheduledDate": 1 });
db.schedules.createIndex({ "owner": 1, "scheduledDate": 1 });
db.schedules.createIndex({ "createdAt": -1 });

// Inventory collection indexes
db.inventories.createIndex({ "owner": 1 });
db.inventories.createIndex({ "category": 1 });
db.inventories.createIndex({ "name": "text", "brand": "text", "description": "text" });
db.inventories.createIndex({ "alerts.lowStock": 1 });
db.inventories.createIndex({ "alerts.nearExpiry": 1 });
db.inventories.createIndex({ "alerts.expired": 1 });
db.inventories.createIndex({ "expiryDate": 1 });
db.inventories.createIndex({ "isActive": 1 });
db.inventories.createIndex({ "createdAt": -1 });

// Marketplace collection indexes
db.marketplaces.createIndex({ "sellerId": 1 });
db.marketplaces.createIndex({ "animalDetails.category": 1 });
db.marketplaces.createIndex({ "animalDetails.breed": 1 });
db.marketplaces.createIndex({ "animalDetails.gender": 1 });
db.marketplaces.createIndex({ "listingType": 1 });
db.marketplaces.createIndex({ "price": 1 });
db.marketplaces.createIndex({ "location": 1 });
db.marketplaces.createIndex({ "status": 1 });
db.marketplaces.createIndex({ "featured": 1 });
db.marketplaces.createIndex({ "createdAt": -1 });

// Inquiry collection indexes
db.inquiries.createIndex({ "listingId": 1 });
db.inquiries.createIndex({ "buyerId": 1 });
db.inquiries.createIndex({ "sellerId": 1 });
db.inquiries.createIndex({ "status": 1 });
db.inquiries.createIndex({ "inquiryType": 1 });
db.inquiries.createIndex({ "createdAt": -1 });

// Financial collections indexes
db.expenses.createIndex({ "owner": 1 });
db.expenses.createIndex({ "category": 1 });
db.expenses.createIndex({ "date": -1 });
db.expenses.createIndex({ "owner": 1, "date": -1 });

db.revenues.createIndex({ "owner": 1 });
db.revenues.createIndex({ "source": 1 });
db.revenues.createIndex({ "date": -1 });
db.revenues.createIndex({ "owner": 1, "date": -1 });

db.budgets.createIndex({ "owner": 1 });
db.budgets.createIndex({ "category": 1 });
db.budgets.createIndex({ "period.startDate": 1, "period.endDate": 1 });

// Weather and sensor data indexes
db.weatherdatas.createIndex({ "location": "2dsphere" });
db.weatherdatas.createIndex({ "timestamp": -1 });

db.sensordatas.createIndex({ "owner": 1 });
db.sensordatas.createIndex({ "sensorType": 1 });
db.sensordatas.createIndex({ "location.coordinates": "2dsphere" });
db.sensordatas.createIndex({ "timestamp": -1 });
db.sensordatas.createIndex({ "owner": 1, "timestamp": -1 });

// Health monitoring indexes
db.healthassessments.createIndex({ "animalId": 1 });
db.healthassessments.createIndex({ "assessmentType": 1 });
db.healthassessments.createIndex({ "timestamp": -1 });
db.healthassessments.createIndex({ "animalId": 1, "timestamp": -1 });

// Community features indexes
db.forumposts.createIndex({ "categoryId": 1 });
db.forumposts.createIndex({ "authorId": 1 });
db.forumposts.createIndex({ "title": "text", "content": "text" });
db.forumposts.createIndex({ "createdAt": -1 });
db.forumposts.createIndex({ "isPinned": 1, "createdAt": -1 });

db.knowledgearticles.createIndex({ "category": 1 });
db.knowledgearticles.createIndex({ "tags": 1 });
db.knowledgearticles.createIndex({ "title": "text", "content": "text" });
db.knowledgearticles.createIndex({ "publishedAt": -1 });

// Regional vaccination indexes
db.regionalvaccinations.createIndex({ "country": 1 });
db.regionalvaccinations.createIndex({ "animalCategory": 1 });
db.regionalvaccinations.createIndex({ "country": 1, "animalCategory": 1 });

db.vaccinationrecords.createIndex({ "animalId": 1 });
db.vaccinationrecords.createIndex({ "vaccineId": 1 });
db.vaccinationrecords.createIndex({ "administeredDate": -1 });
db.vaccinationrecords.createIndex({ "animalId": 1, "administeredDate": -1 });

print('Database initialization completed successfully!');
print('Created indexes for all collections to optimize query performance.');
print('Remember to change default passwords in production environment.');

// Insert some initial data for testing (optional)
print('Inserting sample data for testing...');

// Sample regional vaccination data
db.regionalvaccinations.insertMany([
  {
    country: 'US',
    animalCategory: 'cattle',
    vaccines: [
      {
        name: 'BVDV',
        description: 'Bovine Viral Diarrhea Virus',
        ageGroups: [
          { minAge: 3, maxAge: 6, schedule: 'initial', dosage: '2ml' },
          { minAge: 12, maxAge: 15, schedule: 'annual', dosage: '2ml' }
        ]
      }
    ]
  },
  {
    country: 'IN',
    animalCategory: 'goat',
    vaccines: [
      {
        name: 'PPR',
        description: 'Peste des Petits Ruminants',
        ageGroups: [
          { minAge: 4, maxAge: 6, schedule: 'initial', dosage: '1ml' },
          { minAge: 12, maxAge: 18, schedule: 'annual', dosage: '1ml' }
        ]
      }
    ]
  }
]);

// Sample forum categories
db.forumcategories.insertMany([
  {
    name: 'General Discussion',
    description: 'General farming topics and discussions',
    slug: 'general',
    isActive: true,
    createdAt: new Date()
  },
  {
    name: 'Animal Health',
    description: 'Discuss animal health, diseases, and treatments',
    slug: 'animal-health',
    isActive: true,
    createdAt: new Date()
  },
  {
    name: 'Breeding & Genetics',
    description: 'Breeding programs, genetics, and reproduction',
    slug: 'breeding',
    isActive: true,
    createdAt: new Date()
  },
  {
    name: 'Feed & Nutrition',
    description: 'Animal nutrition, feed quality, and supplements',
    slug: 'nutrition',
    isActive: true,
    createdAt: new Date()
  }
]);

print('Sample data inserted successfully!');
print('Farm Management System database is ready for use.'); 
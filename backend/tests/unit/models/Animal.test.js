const mongoose = require('mongoose');
const Animal = require('../../../models/Animal');
const User = require('../../../models/User');

describe('Animal Model', () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user for animal ownership
    testUser = new User({
      name: 'Test Farmer',
      email: 'farmer@example.com',
      password: 'Password123!',
      phone: '+1234567890',
      farmDetails: {
        farmName: 'Test Farm',
        location: {
          address: '123 Test Road',
          city: 'Test City',
          state: 'TS',
          country: 'USA'
        }
      }
    });
    await testUser.save();
  });

  describe('Animal Schema Validation', () => {
    it('should create a valid animal with all required fields', async () => {
      const animalData = {
        owner: testUser._id,
        registrationNumber: 'REG001',
        basicInfo: {
          name: 'Bella',
          category: 'goat',
          breed: 'Boer',
          gender: 'female',
          dateOfBirth: new Date('2023-01-15'),
          color: 'white'
        },
        physicalCharacteristics: {
          currentWeight: 45.5,
          currentHeight: 75.2,
          birthWeight: 3.2
        },
        parentage: {
          motherId: 'MOTHER001',
          fatherId: 'FATHER001'
        }
      };

      const animal = new Animal(animalData);
      await animal.validate();

      expect(animal.owner.toString()).toBe(testUser._id.toString());
      expect(animal.registrationNumber).toBe('REG001');
      expect(animal.basicInfo.name).toBe('Bella');
      expect(animal.basicInfo.category).toBe('goat');
      expect(animal.basicInfo.gender).toBe('female');
    });

    it('should fail validation without required fields', async () => {
      const animal = new Animal({});
      await expect(animal.validate()).rejects.toThrow();
    });

    it('should fail validation without owner', async () => {
      const animalData = {
        registrationNumber: 'REG001',
        basicInfo: {
          name: 'Bella',
          category: 'goat',
          breed: 'Boer',
          gender: 'female',
          dateOfBirth: new Date('2023-01-15')
        }
      };

      const animal = new Animal(animalData);
      await expect(animal.validate()).rejects.toThrow('Animal must belong to an owner');
    });

    it('should validate animal categories', async () => {
      const validCategories = ['goat', 'cattle', 'sheep', 'horse', 'pig', 'chicken', 'other'];
      
      for (const category of validCategories) {
        const animalData = {
          owner: testUser._id,
          registrationNumber: `REG${category.toUpperCase()}`,
          basicInfo: {
            name: `Test ${category}`,
            category: category,
            breed: 'Test Breed',
            gender: 'male',
            dateOfBirth: new Date('2023-01-15')
          }
        };

        const animal = new Animal(animalData);
        await animal.validate();
        expect(animal.basicInfo.category).toBe(category);
      }
    });

    it('should reject invalid animal category', async () => {
      const animalData = {
        owner: testUser._id,
        registrationNumber: 'REG001',
        basicInfo: {
          name: 'Invalid Animal',
          category: 'invalid-category',
          breed: 'Test Breed',
          gender: 'male',
          dateOfBirth: new Date('2023-01-15')
        }
      };

      const animal = new Animal(animalData);
      await expect(animal.validate()).rejects.toThrow();
    });

    it('should validate gender values', async () => {
      const validGenders = ['male', 'female'];
      
      for (const gender of validGenders) {
        const animalData = {
          owner: testUser._id,
          registrationNumber: `REG${gender.toUpperCase()}`,
          basicInfo: {
            name: `Test ${gender}`,
            category: 'goat',
            breed: 'Test Breed',
            gender: gender,
            dateOfBirth: new Date('2023-01-15')
          }
        };

        const animal = new Animal(animalData);
        await animal.validate();
        expect(animal.basicInfo.gender).toBe(gender);
      }
    });

    it('should reject future date of birth', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const animalData = {
        owner: testUser._id,
        registrationNumber: 'REG001',
        basicInfo: {
          name: 'Future Animal',
          category: 'goat',
          breed: 'Test Breed',
          gender: 'male',
          dateOfBirth: futureDate
        }
      };

      const animal = new Animal(animalData);
      await expect(animal.validate()).rejects.toThrow('Date of birth cannot be in the future');
    });

    it('should validate registration number uniqueness', async () => {
      const animalData = {
        owner: testUser._id,
        registrationNumber: 'DUPLICATE001',
        basicInfo: {
          name: 'First Animal',
          category: 'goat',
          breed: 'Boer',
          gender: 'male',
          dateOfBirth: new Date('2023-01-15')
        }
      };

      // Create first animal
      const animal1 = new Animal(animalData);
      await animal1.save();

      // Try to create second animal with same registration number
      const animal2 = new Animal({
        ...animalData,
        basicInfo: { ...animalData.basicInfo, name: 'Second Animal' }
      });
      
      await expect(animal2.save()).rejects.toThrow();
    });
  });

  describe('Animal Health Records', () => {
    let animal;

    beforeEach(async () => {
      animal = new Animal({
        owner: testUser._id,
        registrationNumber: 'HEALTH001',
        basicInfo: {
          name: 'Healthy Animal',
          category: 'goat',
          breed: 'Boer',
          gender: 'female',
          dateOfBirth: new Date('2023-01-15')
        }
      });
      await animal.save();
    });

    it('should add vaccination record', async () => {
      const vaccinationRecord = {
        vaccineName: 'CDT Vaccine',
        dateAdministered: new Date(),
        nextDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        veterinarian: 'Dr. Smith',
        notes: 'Annual vaccination'
      };

      animal.healthRecords.vaccinations.push(vaccinationRecord);
      await animal.save();

      expect(animal.healthRecords.vaccinations).toHaveLength(1);
      expect(animal.healthRecords.vaccinations[0].vaccineName).toBe('CDT Vaccine');
    });

    it('should add medical treatment record', async () => {
      const treatmentRecord = {
        condition: 'Respiratory infection',
        treatment: 'Antibiotics',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        veterinarian: 'Dr. Johnson',
        medication: 'Penicillin',
        dosage: '5ml twice daily',
        notes: 'Monitor for improvement'
      };

      animal.healthRecords.medicalTreatments.push(treatmentRecord);
      await animal.save();

      expect(animal.healthRecords.medicalTreatments).toHaveLength(1);
      expect(animal.healthRecords.medicalTreatments[0].condition).toBe('Respiratory infection');
    });
  });

  describe('Animal Growth Tracking', () => {
    let animal;

    beforeEach(async () => {
      animal = new Animal({
        owner: testUser._id,
        registrationNumber: 'GROWTH001',
        basicInfo: {
          name: 'Growing Animal',
          category: 'goat',
          breed: 'Boer',
          gender: 'male',
          dateOfBirth: new Date('2023-01-15')
        },
        physicalCharacteristics: {
          birthWeight: 3.5,
          currentWeight: 25.0,
          currentHeight: 60.0
        }
      });
      await animal.save();
    });

    it('should add growth record', async () => {
      const growthRecord = {
        date: new Date(),
        weight: 30.5,
        height: 65.2,
        notes: 'Good growth progress'
      };

      animal.growthRecords.push(growthRecord);
      await animal.save();

      expect(animal.growthRecords).toHaveLength(1);
      expect(animal.growthRecords[0].weight).toBe(30.5);
      expect(animal.growthRecords[0].height).toBe(65.2);
    });

    it('should calculate age correctly', () => {
      const birthDate = new Date('2023-01-15');
      const testAnimal = new Animal({
        owner: testUser._id,
        registrationNumber: 'AGE001',
        basicInfo: {
          name: 'Age Test',
          category: 'goat',
          breed: 'Boer',
          gender: 'male',
          dateOfBirth: birthDate
        }
      });

      const age = testAnimal.calculateAge();
      const expectedAge = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      expect(age).toBe(expectedAge);
    });
  });

  describe('Animal Breeding Records', () => {
    let femaleAnimal;

    beforeEach(async () => {
      femaleAnimal = new Animal({
        owner: testUser._id,
        registrationNumber: 'BREED001',
        basicInfo: {
          name: 'Breeding Female',
          category: 'goat',
          breed: 'Boer',
          gender: 'female',
          dateOfBirth: new Date('2022-01-15')
        }
      });
      await femaleAnimal.save();
    });

    it('should add breeding record for female animal', async () => {
      const breedingRecord = {
        matingDate: new Date(),
        malePartner: 'MALE001',
        expectedDueDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000), // 150 days from now
        breedingMethod: 'natural',
        notes: 'First breeding'
      };

      femaleAnimal.breedingRecords.push(breedingRecord);
      await femaleAnimal.save();

      expect(femaleAnimal.breedingRecords).toHaveLength(1);
      expect(femaleAnimal.breedingRecords[0].malePartner).toBe('MALE001');
    });

    it('should validate breeding method', async () => {
      const validMethods = ['natural', 'artificial'];
      
      for (const method of validMethods) {
        const breedingRecord = {
          matingDate: new Date(),
          malePartner: `MALE${method.toUpperCase()}`,
          expectedDueDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
          breedingMethod: method
        };

        femaleAnimal.breedingRecords = [breedingRecord];
        await femaleAnimal.validate();
        
        expect(femaleAnimal.breedingRecords[0].breedingMethod).toBe(method);
      }
    });
  });

  describe('Animal Status Management', () => {
    it('should validate health status values', async () => {
      const validStatuses = ['healthy', 'sick', 'injured', 'pregnant', 'lactating', 'deceased'];
      
      for (const status of validStatuses) {
        const animal = new Animal({
          owner: testUser._id,
          registrationNumber: `STATUS${status.toUpperCase()}`,
          basicInfo: {
            name: `${status} Animal`,
            category: 'goat',
            breed: 'Boer',
            gender: 'female',
            dateOfBirth: new Date('2023-01-15')
          },
          status: {
            health: status,
            location: 'Pasture A'
          }
        });

        await animal.validate();
        expect(animal.status.health).toBe(status);
      }
    });

    it('should update animal location', async () => {
      const animal = new Animal({
        owner: testUser._id,
        registrationNumber: 'LOCATION001',
        basicInfo: {
          name: 'Mobile Animal',
          category: 'goat',
          breed: 'Boer',
          gender: 'male',
          dateOfBirth: new Date('2023-01-15')
        },
        status: {
          health: 'healthy',
          location: 'Pasture A'
        }
      });

      await animal.save();
      
      animal.status.location = 'Barn 1';
      await animal.save();

      expect(animal.status.location).toBe('Barn 1');
    });
  });
}); 
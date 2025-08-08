const mongoose = require('mongoose');
const User = require('../../../models/User');

describe('User Model', () => {
  describe('User Schema Validation', () => {
    it('should create a valid user with all required fields', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        phone: '+1234567890',
        farmDetails: {
          farmName: 'Green Valley Farm',
          location: {
            address: '123 Farm Road',
            city: 'Farmville',
            state: 'CA',
            country: 'USA',
            coordinates: {
              latitude: 40.7128,
              longitude: -74.0060
            }
          },
          farmSize: 50,
          farmType: 'livestock'
        }
      };

      const user = new User(userData);
      await user.validate();

      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email.toLowerCase());
      expect(user.phone).toBe(userData.phone);
      expect(user.role).toBe('farmer'); // default value
      expect(user.farmDetails.farmName).toBe(userData.farmDetails.farmName);
    });

    it('should fail validation without required fields', async () => {
      const user = new User({});

      await expect(user.validate()).rejects.toThrow();
    });

    it('should fail validation with invalid email format', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123!',
        phone: '+1234567890',
        farmDetails: {
          farmName: 'Green Valley Farm',
          location: {
            address: '123 Farm Road',
            city: 'Farmville',
            state: 'CA',
            country: 'USA'
          }
        }
      };

      const user = new User(userData);
      await expect(user.validate()).rejects.toThrow('Please provide a valid email');
    });

    it('should fail validation with weak password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
        phone: '+1234567890',
        farmDetails: {
          farmName: 'Green Valley Farm',
          location: {
            address: '123 Farm Road',
            city: 'Farmville',
            state: 'CA',
            country: 'USA'
          }
        }
      };

      const user = new User(userData);
      await expect(user.validate()).rejects.toThrow();
    });

    it('should validate password strength requirements', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        farmDetails: {
          farmName: 'Green Valley Farm',
          location: {
            address: '123 Farm Road',
            city: 'Farmville',
            state: 'CA',
            country: 'USA'
          }
        }
      };

      // Test various invalid passwords
      const invalidPasswords = [
        'password', // no uppercase, number, special char
        'PASSWORD', // no lowercase, number, special char
        'Password', // no number, special char
        'Password123', // no special char
        'Pass123!', // too short
      ];

      for (const password of invalidPasswords) {
        const user = new User({ ...userData, password });
        await expect(user.validate()).rejects.toThrow();
      }
    });

    it('should accept valid role values', async () => {
      const baseUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        phone: '+1234567890',
        farmDetails: {
          farmName: 'Green Valley Farm',
          location: {
            address: '123 Farm Road',
            city: 'Farmville',
            state: 'CA',
            country: 'USA'
          }
        }
      };

      const validRoles = ['farmer', 'veterinarian', 'admin'];

      for (const role of validRoles) {
        const user = new User({ ...baseUser, email: `${role}@example.com`, role });
        await user.validate();
        expect(user.role).toBe(role);
      }
    });

    it('should reject invalid role values', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        phone: '+1234567890',
        role: 'invalid-role',
        farmDetails: {
          farmName: 'Green Valley Farm',
          location: {
            address: '123 Farm Road',
            city: 'Farmville',
            state: 'CA',
            country: 'USA'
          }
        }
      };

      const user = new User(userData);
      await expect(user.validate()).rejects.toThrow();
    });
  });

  describe('User Methods', () => {
    let user;

    beforeEach(async () => {
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
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
      await user.save();
    });

    it('should hash password before saving', async () => {
      expect(user.password).not.toBe('Password123!');
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    });

    it('should compare password correctly', async () => {
      const isMatch = await user.comparePassword('Password123!');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });

    it('should generate password reset token', () => {
      const resetToken = user.getResetPasswordToken();
      
      expect(resetToken).toBeDefined();
      expect(typeof resetToken).toBe('string');
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpire).toBeDefined();
      expect(user.resetPasswordExpire.getTime()).toBeGreaterThan(Date.now());
    });

    it('should update lastLogin when user logs in', async () => {
      const originalLastLogin = user.lastLogin;
      
      // Simulate login
      user.lastLogin = new Date();
      await user.save();
      
      expect(user.lastLogin.getTime()).toBeGreaterThan(originalLastLogin?.getTime() || 0);
    });
  });

  describe('User Indexes', () => {
    it('should enforce unique email constraint', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
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
      };

      // Create first user
      const user1 = new User(userData);
      await user1.save();

      // Try to create second user with same email
      const user2 = new User({ ...userData, name: 'Another User' });
      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('User Profile Management', () => {
    it('should update profile information correctly', async () => {
      const user = new User({
        name: 'Original Name',
        email: 'original@example.com',
        password: 'Password123!',
        phone: '+1234567890',
        farmDetails: {
          farmName: 'Original Farm',
          location: {
            address: '123 Original Road',
            city: 'Original City',
            state: 'OR',
            country: 'USA'
          }
        }
      });

      await user.save();

      // Update profile
      user.name = 'Updated Name';
      user.farmDetails.farmName = 'Updated Farm';
      user.profile.bio = 'Updated bio';
      
      await user.save();

      expect(user.name).toBe('Updated Name');
      expect(user.farmDetails.farmName).toBe('Updated Farm');
      expect(user.profile.bio).toBe('Updated bio');
    });
  });
}); 
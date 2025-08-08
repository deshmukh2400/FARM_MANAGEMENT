const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/User');

// Mock external services for testing
jest.mock('../../middleware/auth', () => ({
  ...jest.requireActual('../../middleware/auth'),
  // Keep the actual auth middleware but mock any external calls if needed
}));

describe('Auth Endpoints', () => {
  let server;

  beforeAll(async () => {
    // Start server for testing
    server = app.listen(0); // Use random port for testing
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      phone: '+1234567890',
      role: 'farmer'
    };

    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registered successfully');
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe(validUserData.email.toLowerCase());
      expect(response.body.data.user.name).toBe(validUserData.name);
      expect(response.body.data).toHaveProperty('token');
      
      // Verify user was created in database
      const user = await User.findOne({ email: validUserData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(validUserData.name);
    });

    it('should not register user with invalid email', async () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should not register user with weak password', async () => {
      const weakPasswordData = { ...validUserData, email: 'weak@example.com', password: 'weak' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should not register user with duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, email: 'duplicate@example.com' })
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, email: 'duplicate@example.com', name: 'Another User' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should not register user with missing required fields', async () => {
      const incompleteData = { name: 'Test User' }; // Missing email, password, phone
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should validate role enum values', async () => {
      const invalidRoleData = { ...validUserData, email: 'role@example.com', role: 'invalid-role' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidRoleData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;
    const userCredentials = {
      email: 'login@example.com',
      password: 'Password123!'
    };

    beforeEach(async () => {
      // Create a test user for login tests
      testUser = await User.create({
        name: 'Login Test User',
        email: userCredentials.email,
        password: userCredentials.password,
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
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(userCredentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Login successful');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe(userCredentials.email);
      
      // Verify lastLogin was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.lastLogin).toBeDefined();
    });

    it('should not login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: userCredentials.password
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userCredentials.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should not login without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: userCredentials.email }) // Missing password
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email-format',
          password: userCredentials.password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/auth/profile', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      // Create and login test user
      testUser = await User.create({
        name: 'Profile Test User',
        email: 'profile@example.com',
        password: 'Password123!',
        phone: '+1234567890',
        farmDetails: {
          farmName: 'Profile Test Farm',
          location: {
            address: '123 Profile Road',
            city: 'Profile City',
            state: 'PR',
            country: 'USA'
          }
        }
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'profile@example.com',
          password: 'Password123!'
        });
      
      authToken = loginResponse.body.data.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe('profile@example.com');
      expect(response.body.data.user.name).toBe('Profile Test User');
      expect(response.body.data.user).not.toHaveProperty('password'); // Password should not be returned
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    it('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    it('should not get profile with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Update Test User',
        email: 'update@example.com',
        password: 'Password123!',
        phone: '+1234567890',
        farmDetails: {
          farmName: 'Update Test Farm',
          location: {
            address: '123 Update Road',
            city: 'Update City',
            state: 'UP',
            country: 'USA'
          }
        }
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'update@example.com',
          password: 'Password123!'
        });
      
      authToken = loginResponse.body.data.token;
    });

    it('should update user profile with valid data', async () => {
      const updateData = {
        name: 'Updated Name',
        phone: '+9876543210',
        farmDetails: {
          farmName: 'Updated Farm Name',
          location: {
            address: '456 Updated Road',
            city: 'Updated City',
            state: 'UP',
            country: 'USA'
          }
        }
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.phone).toBe(updateData.phone);
      expect(response.body.data.user.farmDetails.farmName).toBe(updateData.farmDetails.farmName);
      
      // Verify update in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.name).toBe(updateData.name);
    });

    it('should not update profile without authentication', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({ name: 'Should Not Update' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate updated data', async () => {
      const invalidData = {
        name: '', // Empty name should fail validation
        email: 'invalid-email'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Forgot Password User',
        email: 'forgot@example.com',
        password: 'Password123!',
        phone: '+1234567890',
        farmDetails: {
          farmName: 'Forgot Test Farm',
          location: {
            address: '123 Forgot Road',
            city: 'Forgot City',
            state: 'FG',
            country: 'USA'
          }
        }
      });
    });

    it('should initiate password reset for valid email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'forgot@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset email sent');
      
      // Verify reset token was generated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.resetPasswordToken).toBeDefined();
      expect(updatedUser.resetPasswordExpire).toBeDefined();
    });

    it('should handle forgot password for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No user found');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/logout', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Logout Test User',
        email: 'logout@example.com',
        password: 'Password123!',
        phone: '+1234567890',
        farmDetails: {
          farmName: 'Logout Test Farm',
          location: {
            address: '123 Logout Road',
            city: 'Logout City',
            state: 'LO',
            country: 'USA'
          }
        }
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logout@example.com',
          password: 'Password123!'
        });
      
      authToken = loginResponse.body.data.token;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
    });

    it('should handle logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
}); 
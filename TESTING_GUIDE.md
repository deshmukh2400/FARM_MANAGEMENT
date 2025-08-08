# 🧪 Farm Management System - Testing Guide

This guide covers all testing procedures, frameworks, and best practices for the Farm Management System.

## 📋 **Testing Overview**

### **Testing Stack**
- **Backend**: Jest + Supertest + MongoDB Memory Server
- **Frontend**: Jest + React Testing Library + MSW
- **Mobile**: Jest + React Native Testing Library (future implementation)
- **E2E**: Planned for future implementation

### **Test Types**
1. **Unit Tests** - Individual functions, components, and models
2. **Integration Tests** - API endpoints and component interactions
3. **System Tests** - Full application workflows
4. **Performance Tests** - Load testing and optimization

---

## 🔧 **Setup and Installation**

### **Install Testing Dependencies**

```bash
# Install all dependencies for all projects
npm run install-all

# Backend testing dependencies (already configured)
cd backend
npm install jest supertest mongodb-memory-server @types/jest cross-env --save-dev

# Frontend testing dependencies (already configured)
cd ../web
npm install @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom msw --save-dev
```

### **Environment Setup**

Create test environment files:

```bash
# Backend test environment
cp backend/env.example backend/.env.test

# Edit .env.test for testing
NODE_ENV=test
JWT_SECRET=test-jwt-secret-key-for-testing-only
JWT_EXPIRE=1h
MONGODB_URI=memory://test
```

---

## 🚀 **Running Tests**

### **All Tests**
```bash
# Run all tests (backend + frontend)
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### **Backend Tests**
```bash
# All backend tests
npm run test:backend

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# With coverage
npm run test:backend:coverage

# Watch mode
npm run test:backend:watch
```

### **Frontend Tests**
```bash
# All frontend tests
npm run test:web

# With coverage
npm run test:web:coverage

# Watch mode
npm run test:web:watch
```

---

## 🧪 **Backend Testing**

### **Test Structure**
```
backend/tests/
├── setup.js                 # Jest configuration
├── unit/
│   ├── models/
│   │   ├── User.test.js     # User model tests
│   │   └── Animal.test.js   # Animal model tests
│   └── middleware/
│       └── auth.test.js     # Auth middleware tests
└── integration/
    ├── auth.test.js         # Auth API tests
    ├── animals.test.js      # Animals API tests
    └── schedules.test.js    # Schedules API tests
```

### **Writing Backend Tests**

#### **Model Tests Example**
```javascript
const User = require('../../../models/User');

describe('User Model', () => {
  it('should create a valid user', async () => {
    const userData = {
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
    };

    const user = new User(userData);
    await user.validate();

    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email.toLowerCase());
  });
});
```

#### **API Tests Example**
```javascript
const request = require('supertest');
const app = require('../../server');

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      phone: '+1234567890'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(userData.email);
  });
});
```

### **Backend Test Configuration**

#### **Jest Configuration (backend/package.json)**
```json
{
  "jest": {
    "testEnvironment": "node",
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
    "testMatch": ["<rootDir>/tests/**/*.test.js"],
    "collectCoverageFrom": [
      "routes/**/*.js",
      "models/**/*.js",
      "middleware/**/*.js",
      "services/**/*.js",
      "!node_modules/**"
    ]
  }
}
```

---

## 🎨 **Frontend Testing**

### **Test Structure**
```
web/src/
├── setupTests.js
├── components/
│   └── __tests__/
│       └── LoadingScreen.test.js
├── pages/
│   └── __tests__/
│       └── LoginPage.test.js
├── store/
│   └── __tests__/
│       └── authSlice.test.js
└── services/
    └── __tests__/
        └── api.test.js
```

### **Writing Frontend Tests**

#### **Component Tests Example**
```javascript
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme/appleTheme';
import LoadingScreen from '../LoadingScreen';

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('LoadingScreen', () => {
  it('renders with default message', () => {
    renderWithTheme(<LoadingScreen />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

#### **Redux Store Tests Example**
```javascript
import { configureStore } from '@reduxjs/toolkit';
import authSlice, { login, logout } from '../authSlice';

describe('Auth Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { auth: authSlice }
    });
  });

  it('should handle login action', () => {
    const userData = { id: 1, name: 'Test User' };
    store.dispatch(login(userData));
    
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(userData);
  });
});
```

### **Mocking External Dependencies**

#### **API Service Mocking**
```javascript
// Mock API service
jest.mock('../../services/api', () => ({
  login: jest.fn(),
  register: jest.fn(),
  getProfile: jest.fn(),
}));
```

#### **Router Mocking**
```javascript
import { BrowserRouter } from 'react-router-dom';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};
```

---

## 📊 **API Documentation**

### **Swagger/OpenAPI Documentation**

Access the interactive API documentation:
- **Development**: http://localhost:5000/api-docs
- **Production**: https://api.farmmanagement.com/api-docs

### **API Documentation Features**
- ✅ Interactive API explorer
- ✅ Request/response examples
- ✅ Authentication testing
- ✅ Schema validation
- ✅ Error response documentation

### **Adding Documentation to New Endpoints**

```javascript
/**
 * @swagger
 * /api/animals:
 *   post:
 *     summary: Register a new animal
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Animal'
 *     responses:
 *       201:
 *         description: Animal registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', protect, async (req, res) => {
  // Route implementation
});
```

---

## 🎯 **Testing Best Practices**

### **Backend Testing**
1. **Use descriptive test names** - Clearly state what is being tested
2. **Test edge cases** - Invalid inputs, boundary conditions, error scenarios
3. **Mock external services** - Database, email, cloud services
4. **Test authentication** - Both authenticated and unauthenticated scenarios
5. **Validate responses** - Check status codes, response structure, data types

### **Frontend Testing**
1. **Test user interactions** - Clicks, form submissions, navigation
2. **Test component states** - Loading, error, success states
3. **Test accessibility** - Screen readers, keyboard navigation
4. **Mock API calls** - Use MSW for realistic API mocking
5. **Test responsive design** - Different screen sizes and devices

### **General Guidelines**
1. **Follow AAA pattern** - Arrange, Act, Assert
2. **Keep tests independent** - Each test should be able to run in isolation
3. **Use meaningful assertions** - Test behavior, not implementation
4. **Maintain test coverage** - Aim for 70%+ coverage
5. **Regular test maintenance** - Update tests when features change

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Backend Tests**
```bash
# MongoDB connection issues
Error: connect ECONNREFUSED 127.0.0.1:27017

# Solution: Ensure MongoDB Memory Server is properly configured
# Check tests/setup.js for proper database setup
```

#### **Frontend Tests**
```bash
# Module not found errors
Cannot resolve module 'some-module'

# Solution: Add to setupTests.js or create manual mocks
jest.mock('some-module', () => ({}));
```

#### **General Issues**
```bash
# Port already in use
Error: listen EADDRINUSE :::5000

# Solution: Use different port for testing or kill existing process
lsof -ti:5000 | xargs kill -9
```

---

## 📈 **Coverage Reports**

### **Viewing Coverage**
```bash
# Generate coverage reports
npm run test:coverage

# Open HTML coverage report
open backend/coverage/lcov-report/index.html
open web/coverage/lcov-report/index.html
```

### **Coverage Thresholds**
- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

### **Coverage Goals by Module**
| Module | Current | Target |
|--------|---------|--------|
| Models | 95% | 95% |
| Routes | 85% | 90% |
| Middleware | 90% | 95% |
| Components | 80% | 85% |
| Services | 75% | 80% |

---

## 🔄 **Continuous Integration**

### **GitHub Actions Configuration**
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm run install-all
      - run: npm run test:coverage
      - run: npm run lint
```

### **Pre-commit Hooks**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run test",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

---

## 📚 **Additional Resources**

### **Documentation**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)

### **Testing Tools**
- [Testing Playground](https://testing-playground.com/) - Query testing
- [Jest Preview](https://www.jest-preview.com/) - Visual debugging
- [Swagger Editor](https://editor.swagger.io/) - API documentation editing

---

## 🎉 **Getting Started**

1. **Install dependencies**: `npm run install-all`
2. **Run all tests**: `npm test`
3. **View API docs**: Start backend and visit http://localhost:5000/api-docs
4. **Add your first test**: Follow the examples in this guide
5. **Check coverage**: `npm run test:coverage`

**Happy Testing! 🚀** 
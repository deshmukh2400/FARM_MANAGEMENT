# Farm Management System

A comprehensive mobile and web application for managing goat, cattle, and other livestock farms.

## Features

### Core Features
- 🔐 **Authentication** - Secure login for mobile and web platforms
- 🐄 **Animal Registration** - Complete animal profiles with detailed information
- 💉 **Vaccination Management** - Scheduled vaccinations based on animal type
- 🪱 **Deworming Schedule** - Automated deworming reminders and tracking
- 📊 **Growth Tracking** - Record periodic weight and height measurements
- 📦 **Inventory Management** - Track medicines and fodder supplies
- 💕 **Mating Schedule** - Manage breeding schedules for female animals

### Marketplace Features
- 🛒 **Animal Marketplace** - Browse and purchase animals from other farmers
- 🤝 **Mating Requests** - Request breeding services from stud owners

## Tech Stack

### Mobile App (iOS & Android)
- React Native with Expo
- React Navigation
- Expo Camera (for photos)
- AsyncStorage for local data

### Web Application
- React.js
- Material-UI / Chakra UI
- React Router

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Socket.io for real-time features

## Project Structure

```
farm-management/
├── backend/          # Node.js API server
├── mobile/           # React Native mobile app
├── web/             # React web application
└── shared/          # Shared utilities and types
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- MongoDB (local or cloud)

### Installation

1. Clone the repository
2. Install all dependencies:
   ```bash
   npm run install-all
   ```

3. Set up environment variables in each project folder

4. Start all services:
   ```bash
   npm run dev
   ```

### Individual Services

#### Backend
```bash
cd backend
npm run dev
```

#### Mobile App
```bash
cd mobile
npm start
```

#### Web App
```bash
cd web
npm start
```

## Animal Registration Fields

- Animal Category (Goat/Cattle/Horse/etc.)
- Gender (Male/Female)
- Date of Birth
- Breed
- Mother & Father Details
- Weight at Birth
- Photo
- Birth Type (Single/Twins/Triplets)
- Vaccination Dates
- Deworming Dates
- Registration Number
- Current Weight & Height
- Health Status

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile

### Animals
- GET `/api/animals` - Get all animals
- POST `/api/animals` - Register new animal
- GET `/api/animals/:id` - Get animal details
- PUT `/api/animals/:id` - Update animal
- DELETE `/api/animals/:id` - Delete animal

### Schedules
- GET `/api/schedules/vaccination` - Get vaccination schedules
- GET `/api/schedules/deworming` - Get deworming schedules
- GET `/api/schedules/mating` - Get mating schedules

### Marketplace
- GET `/api/marketplace/animals` - Browse available animals
- POST `/api/marketplace/purchase` - Purchase request
- POST `/api/marketplace/mating-request` - Mating service request

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 
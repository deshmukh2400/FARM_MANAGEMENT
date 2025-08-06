# Farm Management System - Deployment Guide

## Overview

This guide covers the deployment of the Farm Management System, which consists of three main components:
- Backend API (Node.js/Express)
- Mobile App (React Native with Expo)
- Web Application (React)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Expo CLI for mobile app deployment
- Domain name and hosting service for web deployment

## Environment Setup

### Backend (.env file)

Create a `.env` file in the `backend` directory:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farm_management
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=30d

# Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URLs (for CORS)
CLIENT_URL=https://yourdomain.com
MOBILE_URL=https://yourmobileapp.com
```

### Web Application

Create a `.env` file in the `web` directory:

```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_ENVIRONMENT=production
```

### Mobile Application

Update the `app.json` file with your actual app details and create environment-specific configuration.

## Backend Deployment

### Option 1: Heroku

1. Install Heroku CLI
2. Create a new Heroku app:
   ```bash
   cd backend
   heroku create your-farm-api
   ```
3. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   # ... set other variables
   ```
4. Deploy:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 2: Digital Ocean/AWS/Google Cloud

1. Create a server instance
2. Install Node.js and PM2:
   ```bash
   sudo apt update
   sudo apt install nodejs npm
   sudo npm install -g pm2
   ```
3. Clone and setup:
   ```bash
   git clone your-repo
   cd farm-management/backend
   npm install --production
   ```
4. Create ecosystem file for PM2:
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'farm-api',
       script: 'server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       }
     }]
   };
   ```
5. Start with PM2:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Option 3: Docker

1. Create Dockerfile in backend directory:
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["node", "server.js"]
   ```
2. Build and run:
   ```bash
   docker build -t farm-api .
   docker run -p 5000:5000 --env-file .env farm-api
   ```

## Web Application Deployment

### Option 1: Netlify

1. Build the app:
   ```bash
   cd web
   npm run build
   ```
2. Deploy to Netlify:
   - Drag and drop the `build` folder to Netlify
   - Or connect your GitHub repo for automatic deployments

### Option 2: Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Deploy:
   ```bash
   cd web
   vercel --prod
   ```

### Option 3: Traditional Hosting

1. Build the app:
   ```bash
   cd web
   npm run build
   ```
2. Upload the `build` folder contents to your web server
3. Configure your web server to serve the React app

## Mobile Application Deployment

### Expo Managed Workflow

1. Install EAS CLI:
   ```bash
   npm install -g @expo/eas-cli
   ```

2. Configure EAS Build:
   ```bash
   cd mobile
   eas build:configure
   ```

3. Build for production:
   ```bash
   # For iOS
   eas build --platform ios --profile production
   
   # For Android
   eas build --platform android --profile production
   
   # For both
   eas build --platform all --profile production
   ```

4. Submit to app stores:
   ```bash
   # iOS App Store
   eas submit --platform ios
   
   # Google Play Store
   eas submit --platform android
   ```

### Bare React Native (if ejected)

Follow the standard React Native deployment process for iOS and Android.

## Database Setup

### MongoDB Atlas (Recommended)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your server IP addresses
5. Get the connection string and add it to your environment variables

### Self-hosted MongoDB

1. Install MongoDB on your server
2. Configure authentication and security
3. Create the database and user
4. Update the connection string in your environment

## SSL Certificate

For production, ensure you have SSL certificates:

### Let's Encrypt (Free)

```bash
sudo apt install certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Monitoring and Logging

### Backend Monitoring

1. Set up application monitoring (e.g., New Relic, DataDog)
2. Configure error tracking (e.g., Sentry)
3. Set up log aggregation (e.g., Winston + CloudWatch)

### Database Monitoring

1. Enable MongoDB monitoring
2. Set up alerts for performance issues
3. Configure automated backups

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set secure JWT secrets
- [ ] Enable CORS only for trusted domains
- [ ] Use environment variables for sensitive data
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database authentication enabled
- [ ] Input validation and sanitization
- [ ] File upload restrictions

## Backup Strategy

### Database Backups

```bash
# Automated daily backups
mongodump --uri="your_mongodb_uri" --out=/backup/$(date +%Y%m%d)
```

### File Backups

- Set up automated backups for uploaded files
- Use cloud storage with versioning
- Regular backup testing

## Performance Optimization

### Backend

- Enable compression middleware
- Use CDN for static assets
- Implement caching (Redis)
- Database indexing
- Connection pooling

### Web Application

- Code splitting
- Image optimization
- Bundle analysis
- Service worker for caching

### Mobile Application

- Optimize images and assets
- Use Expo's optimization features
- Implement proper state management

## Scaling Considerations

### Horizontal Scaling

- Load balancer setup
- Multiple server instances
- Database sharding/clustering
- CDN implementation

### Vertical Scaling

- Server resource monitoring
- Database performance tuning
- Memory and CPU optimization

## Troubleshooting

### Common Issues

1. **CORS errors**: Check environment variables and allowed origins
2. **Database connection**: Verify connection string and network access
3. **File uploads**: Check file size limits and storage configuration
4. **Mobile app crashes**: Check Expo logs and error boundaries

### Debugging

- Enable debug logging in production (with caution)
- Use application monitoring tools
- Set up health check endpoints
- Monitor server resources

## Maintenance

### Regular Tasks

- [ ] Security updates
- [ ] Dependency updates
- [ ] Database maintenance
- [ ] Backup verification
- [ ] Performance monitoring
- [ ] Log cleanup
- [ ] SSL certificate renewal

### Update Process

1. Test updates in staging environment
2. Schedule maintenance windows
3. Create rollback plan
4. Monitor after deployment
5. Update documentation

## Support and Documentation

- Keep deployment documentation updated
- Document configuration changes
- Maintain runbooks for common issues
- Set up monitoring alerts
- Create incident response procedures 
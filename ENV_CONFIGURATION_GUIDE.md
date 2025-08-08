# 🔧 Environment Configuration Guide

## 📋 Overview

This guide provides the complete `.env` file configuration for deploying the Farm Management System. Create a `.env` file in your project root with these values.

## 🚨 Security First

**CRITICAL SECURITY NOTES:**
- ❌ **NEVER** commit `.env` files to version control
- ✅ Use strong, unique passwords (minimum 12 characters)
- ✅ Use different secrets for JWT, database, and Redis  
- ✅ Set file permissions: `chmod 600 .env`
- ✅ Regularly rotate secrets and passwords

## 📝 Complete .env File Template

Create a `.env` file in your project root with these contents:

```bash
# ========================================
# 🐳 FARM MANAGEMENT SYSTEM - PRODUCTION ENVIRONMENT
# ========================================
# Copy this template and update with your actual values

# ========================================
# 🏗️ APPLICATION CONFIGURATION
# ========================================
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# ========================================
# 🗄️ DATABASE CONFIGURATION
# ========================================
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-super-secure-mongo-password-min-12-chars
MONGO_DB_NAME=farmmanagement

# Full MongoDB URI for Docker deployment
MONGODB_URI=mongodb://admin:your-super-secure-mongo-password-min-12-chars@mongodb:27017/farmmanagement?authSource=admin

# Redis Configuration
REDIS_PASSWORD=your-secure-redis-password-min-12-chars
REDIS_URL=redis://:your-secure-redis-password-min-12-chars@redis:6379

# ========================================
# 🔐 SECURITY CONFIGURATION
# ========================================
# JWT Configuration (CRITICAL - Use strong secret)
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters-long-random-string
JWT_EXPIRE=7d

# Password Hashing (Higher for production)
BCRYPT_ROUNDS=12

# ========================================
# 🌐 FRONTEND URLS (CORS Configuration)
# ========================================
# Web Application URL
CLIENT_URL=https://your-domain.com

# Mobile Application URL
MOBILE_URL=https://your-domain.com

# React App Configuration (Build-time variables)
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_ENVIRONMENT=production
APP_VERSION=1.0.0

# Mobile App Configuration (Expo)
EXPO_PUBLIC_API_URL=https://api.your-domain.com

# ========================================
# ☁️ CLOUDINARY (Image/File Storage)
# ========================================
# Get these from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# ========================================
# 📧 EMAIL SERVICE (SendGrid Recommended)
# ========================================
# SendGrid Configuration (Recommended)
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@your-domain.com

# Alternative: Gmail SMTP (Less reliable for production)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-gmail-app-password

# ========================================
# ☁️ AWS SERVICES (S3 Storage & More)
# ========================================
# AWS Configuration for file storage and backups
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET=your-s3-bucket-name
AWS_REGION=us-east-1

# Backup S3 Bucket (Optional - for automated backups)
BACKUP_S3_BUCKET=your-backup-s3-bucket-name

# ========================================
# 🌤️ EXTERNAL API SERVICES
# ========================================
# OpenWeather API (for weather data)
# Get from: https://openweathermap.org/api
OPENWEATHER_API_KEY=your-openweather-api-key

# ========================================
# 📊 MONITORING & LOGGING (Optional)
# ========================================
# Sentry for error tracking (Optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Grafana Configuration (if using monitoring)
GRAFANA_USER=admin
GRAFANA_PASSWORD=your-secure-grafana-password

# ========================================
# 🔧 FILE SERVICE CONFIGURATION
# ========================================
# File Upload Configuration
MAX_FILE_SIZE=50MB
ALLOWED_FILE_TYPES=image/*,video/*,application/pdf,text/*

# ========================================
# 🌍 DOMAIN CONFIGURATION
# ========================================
# Your domain name (for SSL and nginx)
DOMAIN=your-domain.com
```

## 🔑 How to Get API Keys and Credentials

### 1. **MongoDB & Redis Passwords**
```bash
# Generate strong passwords
openssl rand -base64 32
# Or use online generator: https://passwordsgenerator.net/
```

### 2. **JWT Secret**
```bash
# Generate secure JWT secret (minimum 32 characters)
openssl rand -base64 48
# Or use: https://jwtsecret.com/generate
```

### 3. **Cloudinary (Image Storage)**
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard → Account Details
3. Copy: Cloud Name, API Key, API Secret

### 4. **SendGrid (Email Service)**
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Go to Settings → API Keys
3. Create new API key with full access
4. Verify sender email address

### 5. **AWS S3 (File Storage)**
1. Sign up at [AWS](https://aws.amazon.com/)
2. Create IAM user with S3 permissions
3. Create S3 bucket
4. Get Access Key ID and Secret Access Key

### 6. **OpenWeather API (Weather Data)**
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Go to API Keys section
3. Copy your API key

## 🚀 Environment-Specific Configurations

### **Development Environment**
```bash
NODE_ENV=development
CLIENT_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000
EXPO_PUBLIC_API_URL=http://localhost:5000
LOG_LEVEL=debug
BCRYPT_ROUNDS=10
```

### **Staging Environment**
```bash
NODE_ENV=staging
CLIENT_URL=https://staging.your-domain.com
REACT_APP_API_URL=https://api-staging.your-domain.com
LOG_LEVEL=info
```

### **Production Environment**
```bash
NODE_ENV=production
CLIENT_URL=https://your-domain.com
REACT_APP_API_URL=https://api.your-domain.com
LOG_LEVEL=warn
BCRYPT_ROUNDS=12
```

## 📝 Example Production Values

**⚠️ DO NOT USE THESE EXACT VALUES - They are examples only!**

```bash
# Example strong passwords (generate your own!)
MONGO_ROOT_PASSWORD=FarmMgmt2024!SecureDB#789
REDIS_PASSWORD=Cache2024$Secure!Redis#456
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Example domain configuration
DOMAIN=farm.yourcompany.com
CLIENT_URL=https://farm.yourcompany.com
REACT_APP_API_URL=https://api.farm.yourcompany.com
```

## 🔍 Validation Checklist

Before deployment, verify your `.env` file:

- [ ] All passwords are at least 12 characters
- [ ] JWT secret is at least 32 characters
- [ ] Domain URLs match your actual domain
- [ ] All API keys are valid and active
- [ ] File permissions set: `chmod 600 .env`
- [ ] No example/default values used
- [ ] All required services (Cloudinary, SendGrid, etc.) configured

## 🛠️ Testing Your Configuration

### **1. Test Database Connection**
```bash
# Start only database services
docker-compose up -d mongodb redis

# Check connection
docker-compose exec backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err.message));
"
```

### **2. Test API Keys**
```bash
# Test Cloudinary
curl "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload" \
  -X POST \
  -d "upload_preset=YOUR_PRESET" \
  -d "api_key=YOUR_API_KEY"

# Test SendGrid
curl -X POST "https://api.sendgrid.com/v3/mail/send" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

## 🚨 Security Best Practices

1. **File Permissions**
   ```bash
   chmod 600 .env
   chown root:root .env  # If running as root
   ```

2. **Docker Secrets (Advanced)**
   ```bash
   # Use Docker secrets for sensitive data
   echo "your-jwt-secret" | docker secret create jwt_secret -
   echo "your-db-password" | docker secret create db_password -
   ```

3. **Environment Isolation**
   - Use different credentials for dev/staging/production
   - Never reuse production credentials in other environments

4. **Regular Rotation**
   - Rotate JWT secrets monthly
   - Rotate database passwords quarterly
   - Update API keys when services recommend

## 🆘 Troubleshooting

### **Common Issues**

1. **MongoDB Connection Failed**
   - Check MONGODB_URI format
   - Verify credentials match docker-compose.yml
   - Ensure MongoDB container is running

2. **CORS Errors**
   - Verify CLIENT_URL and MOBILE_URL match your domains
   - Check protocol (http vs https)

3. **File Upload Errors**
   - Verify Cloudinary credentials
   - Check file size limits (MAX_FILE_SIZE)

4. **Email Not Sending**
   - Verify SendGrid API key
   - Check sender email verification
   - Test with curl command above

### **Debug Commands**
```bash
# Check environment variables in container
docker-compose exec backend printenv | grep -E "(MONGO|REDIS|JWT|CLOUDINARY)"

# Test API endpoint
curl http://localhost/api/health

# View logs
docker-compose logs backend
```

---

**🎯 Ready for Deployment!** Once your `.env` file is configured, you can deploy using:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
``` 
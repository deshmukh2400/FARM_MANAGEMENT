@echo off
echo 🔧 Farm Management System - Docker Fix Script (Windows)
echo =======================================================

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "logs\backend" mkdir logs\backend
if not exist "logs\nginx" mkdir logs\nginx
if not exist "logs\mongodb" mkdir logs\mongodb
if not exist "logs\redis" mkdir logs\redis

REM Clean Docker cache
echo 🧹 Cleaning Docker cache...
docker system prune -f
docker builder prune -f

REM Remove existing containers and volumes
echo 🗑️  Removing existing containers and volumes...
docker-compose -f docker-compose.simple.yml down -v --remove-orphans 2>nul

REM Pull base images
echo 📥 Pulling base images...
docker pull node:18-alpine
docker pull mongo:6.0
docker pull redis:7-alpine
docker pull nginx:alpine

REM Build backend image
echo 🏗️  Building backend image...
docker build -t farm-backend ./backend --target production

if %ERRORLEVEL% neq 0 (
    echo ❌ Backend build failed
    pause
    exit /b 1
)

echo ✅ Backend build successful

REM Build web image
echo 🏗️  Building web image...
docker build -t farm-web ./web --target production --build-arg REACT_APP_API_URL=http://localhost:5000 --build-arg REACT_APP_ENVIRONMENT=production --build-arg REACT_APP_VERSION=1.0.0

if %ERRORLEVEL% neq 0 (
    echo ❌ Web build failed
    echo 🔍 Checking web directory structure...
    dir web\
    echo 🔍 Checking package.json...
    type web\package.json | more
    pause
    exit /b 1
)

echo ✅ Web build successful

REM Start services
echo 🚀 Starting services...
docker-compose -f docker-compose.simple.yml up -d

echo ✅ All services started successfully!
echo 🌐 Access your application:
echo    Web App: http://localhost:3000
echo    API: http://localhost:5000
echo    MongoDB: localhost:27017
echo    Redis: localhost:6379

echo 📊 Service status:
docker-compose -f docker-compose.simple.yml ps

pause 
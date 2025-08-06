#!/bin/bash

# Docker Fix Script for Farm Management System
# This script helps resolve common Docker build issues

echo "🔧 Farm Management System - Docker Fix Script"
echo "=============================================="

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads logs logs/backend logs/nginx logs/mongodb logs/redis

# Set permissions
echo "🔐 Setting permissions..."
chmod -R 755 uploads logs

# Clean Docker cache and build fresh
echo "🧹 Cleaning Docker cache..."
docker system prune -f
docker builder prune -f

# Remove existing containers and volumes if they exist
echo "🗑️  Removing existing containers and volumes..."
docker-compose -f docker-compose.simple.yml down -v --remove-orphans 2>/dev/null || true

# Pull base images
echo "📥 Pulling base images..."
docker pull node:18-alpine
docker pull mongo:6.0
docker pull redis:7-alpine
docker pull nginx:alpine

# Build images one by one to identify issues
echo "🏗️  Building backend image..."
docker build -t farm-backend ./backend --target production

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

echo "🏗️  Building web image..."
docker build -t farm-web ./web --target production \
    --build-arg REACT_APP_API_URL=http://localhost:5000 \
    --build-arg REACT_APP_ENVIRONMENT=production \
    --build-arg REACT_APP_VERSION=1.0.0

if [ $? -eq 0 ]; then
    echo "✅ Web build successful"
else
    echo "❌ Web build failed"
    echo "🔍 Checking web directory structure..."
    ls -la web/
    echo "🔍 Checking package.json..."
    head -20 web/package.json
    exit 1
fi

echo "🚀 Starting services..."
docker-compose -f docker-compose.simple.yml up -d

echo "✅ All services started successfully!"
echo "🌐 Access your application:"
echo "   Web App: http://localhost:3000"
echo "   API: http://localhost:5000"
echo "   MongoDB: localhost:27017"
echo "   Redis: localhost:6379"

echo "📊 Service status:"
docker-compose -f docker-compose.simple.yml ps 
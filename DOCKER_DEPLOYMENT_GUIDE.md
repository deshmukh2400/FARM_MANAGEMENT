# 🐳 **Farm Management System - Docker Deployment Guide**

This guide provides complete instructions for deploying the Farm Management System using Docker and Docker Compose.

## 📋 **Prerequisites**

### **System Requirements**
- **Docker**: 20.10+ 
- **Docker Compose**: 2.0+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB minimum, 50GB recommended
- **CPU**: 2 cores minimum, 4 cores recommended

### **Operating System Support**
- ✅ Linux (Ubuntu 20.04+, CentOS 8+, RHEL 8+)
- ✅ macOS 10.15+
- ✅ Windows 10/11 with WSL2

## 🚀 **Quick Start**

### **1. Clone and Setup**
```bash
# Clone the repository
git clone https://github.com/your-org/farm-management.git
cd farm-management

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### **2. Basic Development Setup**
```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Access services
# Web App: http://localhost:3000
# API: http://localhost:5000
# MongoDB: localhost:27017
# Redis: localhost:6379
```

### **3. Production Deployment**
```bash
# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Access application
# Web App: http://localhost
# API: http://localhost/api
```

## 🔧 **Configuration**

### **Environment Variables**

Create a `.env` file with the following essential variables:

```bash
# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password
MONGO_DB_NAME=farmmanagement

# Redis
REDIS_PASSWORD=your-redis-password

# JWT Security
JWT_SECRET=your-super-secure-jwt-secret-min-32-characters
JWT_EXPIRE=7d

# URLs
CLIENT_URL=https://your-domain.com
REACT_APP_API_URL=https://api.your-domain.com

# Email Service (SendGrid recommended)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@your-domain.com

# File Storage (AWS S3 recommended)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name
AWS_REGION=us-east-1

# External APIs
OPENWEATHER_API_KEY=your-openweather-api-key
```

## 🏗️ **Deployment Configurations**

### **Development Environment**
```bash
# Full development stack with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Include development tools
docker-compose --profile tools -f docker-compose.yml -f docker-compose.dev.yml up -d

# Available tools:
# - Mongo Express: http://localhost:8081
# - Redis Commander: http://localhost:8082
# - MailHog: http://localhost:8025
# - File Browser: http://localhost:8080
```

### **Production Environment**
```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With monitoring
docker-compose --profile monitoring -f docker-compose.yml -f docker-compose.prod.yml up -d

# With backup service
docker-compose --profile backup -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### **Staging Environment**
```bash
# Create staging-specific override
cp docker-compose.prod.yml docker-compose.staging.yml

# Modify staging.yml for staging-specific settings
# Then deploy:
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

## 🔒 **Security Configuration**

### **SSL/TLS Setup**

1. **Obtain SSL Certificates**
```bash
# Using Let's Encrypt (recommended)
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
mkdir -p docker/nginx/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/nginx/ssl/key.pem
```

2. **Update Nginx Configuration**
```bash
# Edit docker/nginx/nginx.conf
# Uncomment SSL server block and HTTP redirect
```

### **Firewall Configuration**
```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### **Security Hardening**
```bash
# Set secure file permissions
chmod 600 .env
chmod -R 700 docker/nginx/ssl/
chmod -R 755 uploads/

# Use Docker secrets for production (recommended)
echo "your-jwt-secret" | docker secret create jwt_secret -
echo "your-db-password" | docker secret create db_password -
```

## 📊 **Monitoring and Logging**

### **Health Checks**
```bash
# Check service health
docker-compose ps

# View health status
docker inspect farm_backend --format='{{.State.Health.Status}}'

# Manual health check
curl http://localhost/health
```

### **Logging**
```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f backend
docker-compose logs -f web
docker-compose logs -f nginx

# Log rotation is configured automatically
# Logs are stored in ./logs/ directory
```

### **Monitoring Stack**
```bash
# Start monitoring services
docker-compose --profile monitoring -f docker-compose.yml -f docker-compose.prod.yml up -d

# Access monitoring tools:
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
```

## 💾 **Backup and Recovery**

### **Database Backup**
```bash
# Manual backup
docker-compose exec mongodb mongodump --host localhost --port 27017 --username admin --password your-password --out /data/backup

# Automated backup (production)
docker-compose --profile backup -f docker-compose.yml -f docker-compose.prod.yml up -d backup

# Backup to S3
docker-compose exec backup /backup.sh
```

### **File Backup**
```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/

# Sync to S3
aws s3 sync uploads/ s3://your-backup-bucket/uploads/
```

### **Recovery**
```bash
# Stop services
docker-compose down

# Restore database
docker-compose up -d mongodb
docker-compose exec mongodb mongorestore --host localhost --port 27017 --username admin --password your-password /data/backup

# Restore files
tar -xzf uploads-backup-YYYYMMDD.tar.gz

# Start services
docker-compose up -d
```

## 🔄 **Updates and Maintenance**

### **Application Updates**
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose build --no-cache
docker-compose up -d

# Or rolling update (zero downtime)
docker-compose up -d --scale backend=2
docker-compose up -d --scale backend=1
```

### **Database Migration**
```bash
# Run database migrations
docker-compose exec backend npm run migrate

# Or manual migration
docker-compose exec mongodb mongo farmmanagement --eval "db.runCommand({...})"
```

### **System Updates**
```bash
# Update Docker images
docker-compose pull

# Clean up old images
docker image prune -a

# Clean up old volumes (be careful!)
docker volume prune
```

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Port Already in Use**
```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :5000

# Kill process or change port in docker-compose.yml
```

2. **Permission Denied**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod -R 755 uploads/
```

3. **Database Connection Issues**
```bash
# Check MongoDB status
docker-compose exec mongodb mongo --eval "db.adminCommand('ismaster')"

# Reset database
docker-compose down -v
docker-compose up -d
```

4. **Memory Issues**
```bash
# Check Docker memory usage
docker stats

# Increase Docker memory limit
# Docker Desktop: Settings > Resources > Memory
```

### **Debug Mode**
```bash
# Enable debug logging
export LOG_LEVEL=debug

# Run single service for debugging
docker-compose run --rm backend npm run debug

# Access container shell
docker-compose exec backend sh
```

## 📈 **Performance Optimization**

### **Production Optimizations**
```bash
# Enable production optimizations in .env
NODE_ENV=production
BCRYPT_ROUNDS=12

# Use production Docker images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Enable Nginx caching
# Edit docker/nginx/nginx.conf to enable proxy_cache
```

### **Resource Limits**
```yaml
# Add to docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

## 🌐 **Load Balancing and Scaling**

### **Horizontal Scaling**
```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Scale with Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml farm-stack
```

### **Load Balancer Setup**
```bash
# Using external load balancer (nginx, HAProxy, AWS ALB)
# Configure upstream servers in nginx.conf:

upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}
```

## 🚀 **Cloud Deployment**

### **AWS Deployment**
```bash
# Using Docker Compose on EC2
# 1. Launch EC2 instance (t3.medium or larger)
# 2. Install Docker and Docker Compose
# 3. Configure security groups (ports 80, 443)
# 4. Deploy using production compose file

# Using AWS ECS
aws ecs create-cluster --cluster-name farm-management
# Create task definitions and services
```

### **Azure Deployment**
```bash
# Using Azure Container Instances
az container create --resource-group myResourceGroup \
  --name farm-management \
  --image your-registry/farm-management:latest
```

### **Google Cloud Deployment**
```bash
# Using Google Cloud Run
gcloud run deploy farm-management \
  --image gcr.io/your-project/farm-management \
  --platform managed
```

## 📝 **Best Practices**

### **Security**
- ✅ Use strong, unique passwords
- ✅ Enable SSL/TLS in production
- ✅ Regularly update Docker images
- ✅ Use Docker secrets for sensitive data
- ✅ Implement proper firewall rules
- ✅ Regular security audits

### **Performance**
- ✅ Use production Docker images
- ✅ Enable Nginx caching
- ✅ Implement proper logging levels
- ✅ Monitor resource usage
- ✅ Regular database maintenance
- ✅ Use CDN for static assets

### **Reliability**
- ✅ Implement health checks
- ✅ Set up monitoring and alerting
- ✅ Regular backups
- ✅ Test disaster recovery
- ✅ Use restart policies
- ✅ Implement graceful shutdowns

## 🆘 **Support and Troubleshooting**

### **Getting Help**
- 📖 Check application logs: `docker-compose logs`
- 🐛 Report issues: GitHub Issues
- 💬 Community support: Discord/Slack
- 📧 Professional support: support@farmmanager.com

### **Useful Commands**
```bash
# Complete system status
docker-compose ps
docker system df
docker stats

# Cleanup commands
docker-compose down --volumes --remove-orphans
docker system prune -a --volumes

# Export/Import configurations
docker-compose config > docker-compose.resolved.yml
```

---

**🎉 Congratulations!** You now have a production-ready Farm Management System running with Docker. For additional help, consult the troubleshooting section or contact support. 
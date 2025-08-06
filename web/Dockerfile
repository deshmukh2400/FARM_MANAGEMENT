# Multi-stage Dockerfile for Farm Management Web App
# Stage 1: Base image with Node.js
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies and tools
RUN apk add --no-cache \
    curl \
    git \
    python3 \
    make \
    g++ \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Set npm configuration for better reliability
RUN npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-retries 3

# Copy package files
COPY package*.json ./

# Stage 2: Install dependencies
FROM base AS dependencies

# Install dependencies with legacy peer deps to handle conflicts
RUN npm install --legacy-peer-deps --silent --no-audit --no-fund \
    && npm cache clean --force

# Stage 3: Development image
FROM base AS development

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start development server
CMD ["npm", "start"]

# Stage 4: Build for production
FROM base AS build

# Set build arguments
ARG REACT_APP_API_URL
ARG REACT_APP_ENVIRONMENT
ARG REACT_APP_VERSION

# Set environment variables
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_ENVIRONMENT=$REACT_APP_ENVIRONMENT
ENV REACT_APP_VERSION=$REACT_APP_VERSION
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV INLINE_RUNTIME_CHUNK=false
ENV CI=true

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application with increased memory
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Stage 5: Production image with Nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx user and set permissions
RUN addgroup -g 1001 -S nginx-user \
    && adduser -S nginx-user -u 1001 \
    && chown -R nginx-user:nginx-user /usr/share/nginx/html \
    && chown -R nginx-user:nginx-user /var/cache/nginx \
    && chown -R nginx-user:nginx-user /var/log/nginx \
    && chown -R nginx-user:nginx-user /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx-user:nginx-user /var/run/nginx.pid

# Switch to non-root user
USER nginx-user

# Expose port
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 
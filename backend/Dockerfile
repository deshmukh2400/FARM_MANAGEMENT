# Multi-stage Dockerfile for Farm Management Backend
# Stage 1: Base image with dependencies
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies for better security and performance
RUN apk add --no-cache \
    curl \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Stage 2: Development dependencies
FROM base AS dependencies

# Install all dependencies (including dev dependencies)
RUN npm ci --only=production --silent && npm cache clean --force

# Stage 3: Development image
FROM base AS development

# Copy all dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start development server
CMD ["dumb-init", "npm", "run", "dev"]

# Stage 4: Production build
FROM base AS build

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Remove development files
RUN rm -rf \
    tests/ \
    *.test.js \
    *.spec.js \
    .env.example \
    README.md \
    docker/ \
    .git/ \
    .gitignore \
    .dockerignore

# Stage 5: Production image
FROM base AS production

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Create app directory
RUN mkdir -p /app/uploads /app/logs \
    && chown -R nodejs:nodejs /app

# Copy production dependencies
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=build --chown=nodejs:nodejs /app .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start production server
CMD ["dumb-init", "node", "server.js"] 
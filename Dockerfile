# Multi-stage build for production
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./

# Copy built application
COPY --from=builder /app/.next ./.next

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy public folder
COPY --from=builder /app/public ./public

# Copy entrypoint script for runtime env injection
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Use entrypoint script to inject runtime env vars
ENTRYPOINT ["docker-entrypoint.sh"]

# Start the application
CMD ["npm", "start"]
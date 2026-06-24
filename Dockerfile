# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy project files
COPY . .

# Build the frontend and backend
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

# Copy configuration files (with wildcard to avoid failure if missing)
COPY config.json* ./

# Expose the application port
EXPOSE 3000

# Start the full-stack application
CMD ["npm", "start"]

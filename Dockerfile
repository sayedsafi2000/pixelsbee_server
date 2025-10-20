########################################
# Stage 1: Install production dependencies
########################################
FROM node:18-alpine AS deps

WORKDIR /app

# Install only production dependencies (prefer npm ci when lockfile exists)
COPY package*.json ./
RUN npm ci --only=production || npm install --only=production

########################################
# Stage 2: Runtime
########################################
FROM node:18-alpine AS runner

WORKDIR /app

# Runtime environment
ENV NODE_ENV=production

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Use non-root user for better security
USER node

# Expose the application port (defaults to 5080; app also reads PORT env)
EXPOSE 5080

# Start the server
CMD ["node", "src/index.js"]


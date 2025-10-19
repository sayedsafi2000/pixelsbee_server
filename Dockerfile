FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment to production by default
ENV NODE_ENV=production

# Install dependencies only (use npm ci when lockfile exists)
COPY package*.json ./
RUN npm ci --only=production || npm install --only=production

# Copy the rest of the server source code
COPY . .

# Expose the application port
EXPOSE 5001

# Start the server
CMD ["node", "src/index.js"]



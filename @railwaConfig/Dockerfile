FROM node:20-alpine

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install root dependencies (server)
RUN npm install --no-cache --prefer-offline

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install --no-cache --prefer-offline

# Go back to root and copy all source files
WORKDIR /app
COPY . .

# Build frontend app
WORKDIR /app/frontend
RUN npm run build

# Go back to root for final setup
WORKDIR /app

# Expose port
EXPOSE 8003

# Start server
CMD ["node", "server.js"] 
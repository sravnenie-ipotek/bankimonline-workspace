FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY mainapp/package*.json ./mainapp/

# Install root dependencies (server)
RUN npm install --no-cache --prefer-offline

# Install mainapp dependencies (React)
WORKDIR /app/mainapp
RUN npm install --no-cache --prefer-offline

# Build React app
RUN npm run build

# Go back to root
WORKDIR /app

# Copy all source files
COPY . .

# Expose port
EXPOSE 8003

# Start server
CMD ["node", "server-db.js"] 
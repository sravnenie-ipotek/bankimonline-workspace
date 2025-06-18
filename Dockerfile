FROM node:20-alpine

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY mainapp/package*.json ./mainapp/

# Install root dependencies (server)
RUN npm install --no-cache --prefer-offline

# Install mainapp dependencies (React)
WORKDIR /app/mainapp
RUN npm install --no-cache --prefer-offline

# Go back to root and copy all source files
WORKDIR /app
COPY . .

# Now build React app (after source files are copied)
WORKDIR /app/mainapp
RUN npm run build

# Go back to root for final setup
WORKDIR /app

# Expose port
EXPOSE 8003

# Start server
CMD ["node", "server-db.js"] 
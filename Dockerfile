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

# Verify build was created and show contents
RUN echo "=== Build verification ==="
RUN ls -la || echo "Current directory contents:"
RUN ls -la build/ 2>/dev/null || echo "No build directory found"
RUN ls -la dist/ 2>/dev/null || echo "No dist directory found"

# Go back to root for final setup
WORKDIR /app

# Ensure the build directory exists where server expects it
RUN echo "=== Final directory check ==="
RUN ls -la mainapp/ || echo "Mainapp directory contents:"
RUN ls -la mainapp/build/ 2>/dev/null || echo "No mainapp/build directory found"

# Expose port
EXPOSE 8003

# Start server
CMD ["node", "server/server-db.js"] 
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

# Clean install with exact versions
RUN npm install --no-package-lock --omit=dev --legacy-peer-deps

# Bundle app source
COPY . .

# Expose port
EXPOSE 3001

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
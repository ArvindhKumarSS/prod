FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

# Use npm ci for more reliable dependency installation
RUN npm ci --no-package-lock

# Bundle app source
COPY . .

# Expose port
EXPOSE 3002

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3002/api/health || exit 1

# Start the application
CMD ["node", "mcp/server.js"]
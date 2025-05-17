FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy MCP server files
COPY mcp/ ./mcp/
COPY db.js ./

# Create directory for public files
RUN mkdir -p mcp/public

# Expose MCP port
EXPOSE 3002

# Start MCP server
CMD ["node", "mcp/server.js"] 
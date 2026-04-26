# Use Node.js 18 LTS Alpine for smaller image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY pnpm-workspace.yaml* ./

# Copy source code
COPY . .

# Install dependencies for frontend
WORKDIR /app/artifacts/campusmart
RUN npm install

# Build frontend
RUN npm run build

# Copy built frontend to root
WORKDIR /app
RUN cp -r artifacts/campusmart/dist ./

# Install production dependencies for server
RUN npm install --only=production

# Create database directory
RUN mkdir -p /app/data

# Expose port
EXPOSE $PORT

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3001) + '/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the server
CMD ["npm", "start"]
# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Copy all source code
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the API server
WORKDIR /app/artifacts/api-server
RUN pnpm run build

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the server
CMD ["npm", "start"]
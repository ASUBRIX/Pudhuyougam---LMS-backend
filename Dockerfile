FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Make the start script executable
RUN chmod +x ./bin/www

# Set NODE_ENV
ENV NODE_ENV=production

# Expose port from environment variable
EXPOSE 4001

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-4001}/health || exit 1

# Start the application
CMD ["npm", "start"] 
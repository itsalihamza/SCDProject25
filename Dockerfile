# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Expose port (if you add a web interface later)
EXPOSE 3000

# Set environment variables (defaults, override with docker run -e or docker-compose)
ENV NODE_ENV=production

# Run the application
CMD ["node", "main.js"]

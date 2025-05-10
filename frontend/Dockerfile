FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# Expose port for Next.js
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

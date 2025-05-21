# Use Node.js base image
FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose port (adjust if needed)
EXPOSE 5008

# Start the app
CMD ["npm", "run","dev"]

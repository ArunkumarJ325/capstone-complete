# Use Node.js base image
FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

RUN npm install -g nodemon

# Copy app source
COPY . .

# Expose port (adjust if needed)
EXPOSE 3001

# Start the app
CMD ["npm", "run","dev"]

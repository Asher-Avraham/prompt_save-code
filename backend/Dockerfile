# Use an official Node.js runtime as a parent image
# The 'alpine' version is a lightweight distribution, perfect for production
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Your app binds to port 5001, so you need to expose it
EXPOSE 5001

# Define the command to run your app
CMD [ "node", "server.js" ]

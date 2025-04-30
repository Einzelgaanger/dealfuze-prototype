#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building project..."
npm run build

# Start the application
echo "Starting application..."
npm start 
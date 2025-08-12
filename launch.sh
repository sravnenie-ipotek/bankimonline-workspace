#!/bin/bash

echo "========================================"
echo "Starting BankDev2 Project"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/4] Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install root dependencies"
    exit 1
fi

# Install mainapp dependencies
echo "Installing mainapp dependencies..."
cd mainapp
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install mainapp dependencies"
    exit 1
fi
cd ..

echo ""
echo "[2/4] Building React application..."
cd mainapp
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to build React application"
    exit 1
fi
cd ..

echo ""
echo "[3/4] Starting servers..."
echo ""

# Use the existing start-dev.js script which handles both servers
echo "Starting API server on port 8003 and File server on port 3001..."
node server/start-dev.js

# If the servers exit, show message
echo ""
echo "Servers stopped."
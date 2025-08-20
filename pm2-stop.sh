#!/bin/bash

# PM2 Stop Script for BankIM Application

echo "🛑 Stopping BankIM Application PM2 processes..."

# Stop all PM2 processes
pm2 stop all

# Show status
pm2 status

echo ""
echo "✅ PM2 processes stopped"
echo ""
echo "Use './pm2-start.sh' to restart the application"
echo "Use 'pm2 delete all' to completely remove processes from PM2"
echo ""
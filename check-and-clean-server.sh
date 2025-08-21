#!/bin/bash

# Check and clean disk space on the server

SSH_USER="dev"
SSH_HOST="45.83.42.74"
SSH_PORT="33322"

echo "🔍 Checking disk space on server..."
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "df -h"

echo ""
echo "📁 Checking deployment directory sizes..."
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "du -sh /var/www/bankim/releases/* 2>/dev/null | tail -10"

echo ""
echo "🗑️  Cleaning up old releases (keeping last 3)..."
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "cd /var/www/bankim/releases && ls -t | tail -n +4 | xargs -r rm -rf"

echo ""
echo "🧹 Cleaning npm cache..."
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "npm cache clean --force"

echo ""
echo "🧹 Cleaning system logs and tmp files..."
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "sudo find /tmp -type f -atime +7 -delete 2>/dev/null || true"
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "sudo find /var/log -type f -name '*.log' -exec truncate -s 0 {} \; 2>/dev/null || true"

echo ""
echo "✅ After cleanup - disk space:"
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "df -h"
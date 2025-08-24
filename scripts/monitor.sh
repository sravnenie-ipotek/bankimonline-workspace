#!/bin/bash
LOG_FILE="/var/www/bankim/monitor.log"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
log() { echo "[$TIMESTAMP] $1" >> $LOG_FILE; }

if ! pm2 status | grep -q "bankim-api.*online"; then
  log "❌ PM2 restart required"
  pm2 restart bankim-api
fi
if ! curl -s http://localhost:8003/api/health > /dev/null; then
  log "❌ API restart required"
  pm2 restart bankim-api
fi
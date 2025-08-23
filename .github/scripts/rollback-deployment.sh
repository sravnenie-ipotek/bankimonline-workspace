#!/bin/bash

# Automated Rollback Script
# Quickly reverts to previous deployment if issues detected

set -e

HOST=$1
REASON=$2

echo "🔄 Initiating rollback on $HOST..."
echo "   Reason: $REASON"

ssh root@$HOST << 'EOF'
    # Get current deployment
    CURRENT=$(readlink /var/www/bankim/current | xargs basename)
    
    # Determine previous deployment
    if [ "$CURRENT" = "blue" ]; then
        PREVIOUS="green"
    else
        PREVIOUS="blue"
    fi
    
    echo "   Rolling back from $CURRENT to $PREVIOUS..."
    
    # Switch symlink back
    ln -sfn /var/www/bankim/$PREVIOUS /var/www/bankim/current
    
    # Restart previous version
    pm2 stop bankim-$CURRENT 2>/dev/null || true
    pm2 restart bankim-$PREVIOUS --name bankim-api
    
    # Reload nginx
    nginx -s reload || systemctl reload nginx
    
    # Verify rollback
    sleep 3
    if curl -f http://localhost:8003/api/health; then
        echo "✅ Rollback successful!"
        
        # Log rollback event
        echo "$(date): Rollback from $CURRENT to $PREVIOUS - Reason: $REASON" >> /var/www/bankim/rollback.log
    else
        echo "❌ Rollback failed - Manual intervention required!"
        exit 1
    fi
EOF
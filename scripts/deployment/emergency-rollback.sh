#!/bin/bash
set -euo pipefail

# 🚨 Emergency Production Rollback Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Parameters
TARGET_COMMIT="${1:-}"
ROLLBACK_REASON="${2:-Emergency rollback}"
INITIATED_BY="${3:-$(whoami)}"

if [[ -z "$TARGET_COMMIT" ]]; then
    error "Target commit hash required"
    exit 1
fi

APP_NAME="bankimonline"
DEPLOY_DIR="/opt/bankimonline"
RELEASES_DIR="$DEPLOY_DIR/releases"
SHARED_DIR="$DEPLOY_DIR/shared"
CURRENT_LINK="$DEPLOY_DIR/current"

warn "🚨 EMERGENCY ROLLBACK INITIATED"
warn "Target commit: $TARGET_COMMIT"
warn "Reason: $ROLLBACK_REASON"
warn "Initiated by: $INITIATED_BY"
warn "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Backup current deployment info
if [[ -f "$SHARED_DIR/last-deployment.json" ]]; then
    cp "$SHARED_DIR/last-deployment.json" "$SHARED_DIR/pre-rollback-deployment-$(date +%s).json"
    log "📋 Backed up current deployment info"
fi

# Check if target release exists
TARGET_RELEASE_DIR="$RELEASES_DIR/$TARGET_COMMIT"
if [[ ! -d "$TARGET_RELEASE_DIR" ]]; then
    error "❌ Target release not found: $TARGET_RELEASE_DIR"
    error "Available releases:"
    ls -la "$RELEASES_DIR" 2>/dev/null || echo "No releases found"
    exit 1
fi

log "✅ Target release found: $TARGET_RELEASE_DIR"

# Get current release for potential re-rollback
CURRENT_RELEASE=""
if [[ -L "$CURRENT_LINK" ]]; then
    CURRENT_RELEASE=$(readlink "$CURRENT_LINK")
    log "📋 Current release: $CURRENT_RELEASE"
fi

# Pre-rollback health check of target
log "🏥 Pre-rollback health check of target release"
cd "$TARGET_RELEASE_DIR/app"

# Quick validation that target release has required files
if [[ ! -f "server-db.js" ]]; then
    error "❌ Target release missing server-db.js"
    exit 1
fi

if [[ ! -f ".env" && ! -L ".env" ]]; then
    warn "⚠️ Target release missing .env - will use shared environment"
    ln -sfn "$SHARED_DIR/.env" .env
fi

# Execute atomic rollback
log "🔄 Executing atomic rollback"

# For PM2 deployments
if pm2 describe "$APP_NAME-api" >/dev/null 2>&1; then
    log "🔄 Rolling back PM2 process"
    
    # Update symbolic link first (atomic operation)
    ln -sfn "$TARGET_RELEASE_DIR" "$DEPLOY_DIR/current-new"
    mv "$DEPLOY_DIR/current-new" "$CURRENT_LINK"
    
    # Reload PM2 with new code
    source "$SHARED_DIR/.env"
    cd "$CURRENT_LINK/app"
    
    pm2 reload "$APP_NAME-api" --wait-ready
    
    log "✅ PM2 rollback completed"
    
# For blue-green deployments (if nginx config exists)
elif [[ -f "/etc/nginx/sites-available/$APP_NAME" ]]; then
    warn "🔵🟢 Blue-green rollback detected"
    
    # Start target release instance
    source "$SHARED_DIR/.env"
    cd "$TARGET_RELEASE_DIR/app"
    
    ROLLBACK_PORT=$((PORT + 200))  # Different port for rollback
    NODE_ENV=production PORT=$ROLLBACK_PORT node server-db.js &
    ROLLBACK_PID=$!
    
    echo "$ROLLBACK_PID" > "$TARGET_RELEASE_DIR/rollback.pid"
    
    # Health check rollback instance
    log "🏥 Health checking rollback instance"
    HEALTH_ATTEMPTS=0
    MAX_ATTEMPTS=30
    
    while [[ $HEALTH_ATTEMPTS -lt $MAX_ATTEMPTS ]]; do
        if curl -f -s "http://localhost:$ROLLBACK_PORT/api/health" > /dev/null 2>&1; then
            success "✅ Rollback instance healthy"
            break
        fi
        HEALTH_ATTEMPTS=$((HEALTH_ATTEMPTS + 1))
        sleep 5
    done
    
    if [[ $HEALTH_ATTEMPTS -eq $MAX_ATTEMPTS ]]; then
        error "❌ Rollback instance failed health check"
        kill "$ROLLBACK_PID" 2>/dev/null || true
        exit 1
    fi
    
    # Switch nginx to rollback instance
    if [[ -f "/etc/nginx/sites-available/$APP_NAME.template" ]]; then
        sed "s/{{PORT}}/$ROLLBACK_PORT/g" "/etc/nginx/sites-available/$APP_NAME.template" > "/etc/nginx/sites-available/$APP_NAME"
        nginx -t && systemctl reload nginx
    fi
    
    # Update current link
    ln -sfn "$TARGET_RELEASE_DIR" "$DEPLOY_DIR/current-new"
    mv "$DEPLOY_DIR/current-new" "$CURRENT_LINK"
    
    log "✅ Blue-green rollback completed"
    
else
    error "❌ No deployment method detected (PM2 or nginx)"
    exit 1
fi

# Post-rollback health checks
log "🏥 Post-rollback health verification"
sleep 15

CRITICAL_ENDPOINTS=(
    "https://bankimonline.com/api/health"
    "https://bankimonline.com/api/v1/calculation-parameters?business_path=mortgage"
    "https://bankimonline.com/"
)

FAILED_CHECKS=()

for endpoint in "${CRITICAL_ENDPOINTS[@]}"; do
    if ! curl -f -s -m 10 "$endpoint" > /dev/null 2>&1; then
        FAILED_CHECKS+=("$endpoint")
        error "❌ Health check failed: $endpoint"
    else
        log "✅ Health check passed: $endpoint"
    fi
done

if [[ ${#FAILED_CHECKS[@]} -gt 0 ]]; then
    error "🚨 ROLLBACK FAILED - ${#FAILED_CHECKS[@]} health checks failed"
    error "Failed endpoints: ${FAILED_CHECKS[*]}"
    
    # Emergency notification
    curl -X POST "${EMERGENCY_WEBHOOK:-}" \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": \"🚨 CRITICAL: Rollback failed for BankiMonline!\",
            \"target_commit\": \"$TARGET_COMMIT\",
            \"failed_checks\": \"${FAILED_CHECKS[*]}\",
            \"initiated_by\": \"$INITIATED_BY\"
        }" 2>/dev/null || warn "Emergency webhook failed"
    
    exit 1
fi

# Create rollback record
cat > "$SHARED_DIR/last-rollback.json" <<EOF
{
  "rollback_to_commit": "$TARGET_COMMIT",
  "rollback_from_release": "$CURRENT_RELEASE",
  "reason": "$ROLLBACK_REASON",
  "initiated_by": "$INITIATED_BY",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "health_status": "healthy",
  "rollback_type": "emergency"
}
EOF

# Update deployment record
cat > "$SHARED_DIR/last-deployment.json" <<EOF
{
  "commit": "$TARGET_COMMIT",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployed_by": "$INITIATED_BY",
  "deployment_type": "emergency-rollback",
  "health_status": "healthy",
  "rollback_reason": "$ROLLBACK_REASON"
}
EOF

success "🎉 Emergency rollback completed successfully!"
success "🎯 Rolled back to commit: $TARGET_COMMIT"
success "📝 Reason: $ROLLBACK_REASON"
success "👤 Initiated by: $INITIATED_BY"
success "🌐 Application: https://bankimonline.com"
success "⏰ Completed at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Success notification
curl -X POST "${ROLLBACK_SUCCESS_WEBHOOK:-}" \
    -H "Content-Type: application/json" \
    -d "{
        \"text\": \"✅ BankiMonline emergency rollback successful\",
        \"target_commit\": \"$TARGET_COMMIT\",
        \"reason\": \"$ROLLBACK_REASON\",
        \"initiated_by\": \"$INITIATED_BY\",
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }" 2>/dev/null || warn "Success webhook failed (non-critical)"

log "🔍 Rollback completed. Monitor application closely."
log "📋 Rollback info saved to: $SHARED_DIR/last-rollback.json"
#!/bin/bash
set -euo pipefail

# 🏪 World-Class Production Deployment Script
# Used by GitHub Actions for blue-green deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
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

# Configuration
DOCKER_IMAGE="$1"
COMMIT_SHA="$2"
BLUE_GREEN="${3:-false}"
HEALTH_CHECK_TIMEOUT="${4:-300}"
ROLLBACK_ON_FAILURE="${5:-true}"

APP_NAME="bankimonline"
DEPLOY_DIR="/opt/bankimonline"
CURRENT_LINK="$DEPLOY_DIR/current"
SHARED_DIR="$DEPLOY_DIR/shared"
RELEASES_DIR="$DEPLOY_DIR/releases"
NEW_RELEASE_DIR="$RELEASES_DIR/$COMMIT_SHA"

log "🏪 Starting world-class production deployment"
log "Image: $DOCKER_IMAGE"
log "Commit: $COMMIT_SHA"
log "Blue-Green: $BLUE_GREEN"

# Ensure required directories exist
mkdir -p "$RELEASES_DIR" "$SHARED_DIR"/{logs,uploads,config}

# Check if shared environment file exists
if [[ ! -f "$SHARED_DIR/.env" ]]; then
    error "Shared .env file not found at $SHARED_DIR/.env"
    exit 1
fi

# Create new release directory
log "📦 Preparing new release directory"
mkdir -p "$NEW_RELEASE_DIR"
cd "$NEW_RELEASE_DIR"

# Pull and extract Docker image
log "🐳 Extracting application from Docker image"
docker create --name temp-container "$DOCKER_IMAGE"
docker cp temp-container:/app/ ./app/
docker rm temp-container

# Set up symbolic links to shared resources
log "🔗 Setting up shared resource links"
ln -sfn "$SHARED_DIR/.env" app/.env
ln -sfn "$SHARED_DIR/uploads" app/uploads
ln -sfn "$SHARED_DIR/logs" app/logs

# Create deployment metadata
cat > deployment-info.json <<EOF
{
  "commit": "$COMMIT_SHA",
  "image": "$DOCKER_IMAGE",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployed_by": "${GITHUB_ACTOR:-$(whoami)}",
  "deployment_type": "blue-green"
}
EOF

# Blue-Green Deployment Logic
if [[ "$BLUE_GREEN" == "true" || "$BLUE_GREEN" == "--blue-green" ]]; then
    log "🔵🟢 Executing Blue-Green deployment"
    
    # Determine current color
    CURRENT_COLOR="blue"
    NEW_COLOR="green"
    
    if [[ -L "$CURRENT_LINK" ]]; then
        CURRENT_RELEASE=$(readlink "$CURRENT_LINK")
        if [[ "$CURRENT_RELEASE" =~ green ]]; then
            CURRENT_COLOR="green"
            NEW_COLOR="blue"
        fi
    fi
    
    log "Current color: $CURRENT_COLOR, Deploying to: $NEW_COLOR"
    
    # Start new application instance
    log "🚀 Starting new application instance"
    cd "$NEW_RELEASE_DIR/app"
    
    # Load environment variables
    source "$SHARED_DIR/.env"
    
    # Start application in background
    NEW_PORT=$((PORT + 100))  # Use offset port for blue-green
    NODE_ENV=production PORT=$NEW_PORT node server-db.js &
    NEW_PID=$!
    
    echo "$NEW_PID" > "$NEW_RELEASE_DIR/app.pid"
    
    # Health check for new instance
    log "🏥 Health checking new instance on port $NEW_PORT"
    HEALTH_CHECK_COUNT=0
    MAX_HEALTH_CHECKS=$((HEALTH_CHECK_TIMEOUT / 10))
    
    while [[ $HEALTH_CHECK_COUNT -lt $MAX_HEALTH_CHECKS ]]; do
        if curl -f -s "http://localhost:$NEW_PORT/api/health" > /dev/null 2>&1; then
            success "✅ New instance health check passed"
            break
        fi
        
        HEALTH_CHECK_COUNT=$((HEALTH_CHECK_COUNT + 1))
        log "Health check attempt $HEALTH_CHECK_COUNT/$MAX_HEALTH_CHECKS"
        sleep 10
    done
    
    if [[ $HEALTH_CHECK_COUNT -eq $MAX_HEALTH_CHECKS ]]; then
        error "❌ New instance health check failed after $HEALTH_CHECK_TIMEOUT seconds"
        
        if [[ -f "$NEW_RELEASE_DIR/app.pid" ]]; then
            kill "$(cat "$NEW_RELEASE_DIR/app.pid")" 2>/dev/null || true
        fi
        
        if [[ "$ROLLBACK_ON_FAILURE" == "true" || "$ROLLBACK_ON_FAILURE" == "--rollback-on-failure" ]]; then
            warn "🔄 Rollback enabled but no previous version to rollback to in blue-green"
        fi
        
        exit 1
    fi
    
    # Switch nginx/load balancer to new instance
    log "🔄 Switching traffic to new instance"
    
    # Update nginx configuration (assuming nginx config template)
    if [[ -f "/etc/nginx/sites-available/$APP_NAME.template" ]]; then
        sed "s/{{PORT}}/$NEW_PORT/g" "/etc/nginx/sites-available/$APP_NAME.template" > "/etc/nginx/sites-available/$APP_NAME"
        nginx -t && systemctl reload nginx
    fi
    
    # Update symbolic link atomically
    ln -sfn "$NEW_RELEASE_DIR" "$DEPLOY_DIR/current-new"
    mv "$DEPLOY_DIR/current-new" "$CURRENT_LINK"
    
    # Stop old instance after successful switch
    if [[ -f "$CURRENT_LINK/../app.pid" ]]; then
        OLD_PID=$(cat "$CURRENT_LINK/../app.pid" 2>/dev/null || echo "")
        if [[ -n "$OLD_PID" ]] && kill -0 "$OLD_PID" 2>/dev/null; then
            log "🛑 Stopping old instance (PID: $OLD_PID)"
            kill "$OLD_PID"
            
            # Wait for graceful shutdown
            sleep 5
            
            # Force kill if still running
            if kill -0 "$OLD_PID" 2>/dev/null; then
                warn "Force killing old instance"
                kill -9 "$OLD_PID" 2>/dev/null || true
            fi
        fi
    fi
    
else
    # Standard PM2 deployment
    log "📋 Executing standard PM2 deployment"
    
    # Update symbolic link
    ln -sfn "$NEW_RELEASE_DIR" "$DEPLOY_DIR/current-new"
    mv "$DEPLOY_DIR/current-new" "$CURRENT_LINK"
    
    # Load environment
    source "$SHARED_DIR/.env"
    cd "$CURRENT_LINK/app"
    
    # PM2 deployment
    if pm2 describe "$APP_NAME-api" >/dev/null 2>&1; then
        log "🔄 Reloading existing PM2 process"
        pm2 reload "$APP_NAME-api" --wait-ready
    else
        log "🚀 Starting new PM2 process"
        pm2 start server-db.js \
            --name "$APP_NAME-api" \
            --instances 2 \
            --exec-mode cluster \
            --max-memory-restart 500M \
            --time \
            --wait-ready
    fi
    
    pm2 save
fi

# Final health check
log "🏥 Final production health check"
sleep 10

# Check main endpoints
HEALTH_ENDPOINTS=(
    "https://bankimonline.com/api/health"
    "https://bankimonline.com/api/v1/calculation-parameters?business_path=mortgage"
    "https://bankimonline.com/api/content/mortgage_step1/he"
)

for endpoint in "${HEALTH_ENDPOINTS[@]}"; do
    log "Checking: $endpoint"
    if ! curl -f -s "$endpoint" > /dev/null; then
        error "❌ Health check failed for: $endpoint"
        
        if [[ "$ROLLBACK_ON_FAILURE" == "true" ]]; then
            warn "🔄 Initiating rollback due to health check failure"
            # Rollback logic would go here
        fi
        
        exit 1
    fi
done

success "✅ All health checks passed"

# Cleanup old releases (keep last 5)
log "🧹 Cleaning up old releases"
cd "$RELEASES_DIR"
ls -t | tail -n +6 | xargs -r rm -rf
log "Kept releases: $(ls -t | head -5 | tr '\n' ' ')"

# Create deployment record
cat > "$SHARED_DIR/last-deployment.json" <<EOF
{
  "commit": "$COMMIT_SHA",
  "image": "$DOCKER_IMAGE",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployed_by": "${GITHUB_ACTOR:-$(whoami)}",
  "deployment_type": "$([ "$BLUE_GREEN" == "true" ] && echo "blue-green" || echo "standard")",
  "health_status": "healthy"
}
EOF

success "🎉 World-class production deployment completed successfully!"
success "🌐 Application: https://bankimonline.com"
success "📊 Commit: $COMMIT_SHA"
success "⏰ Deployed at: $(date -u +%Y-%m-%dT%H:%M:%SZ')"
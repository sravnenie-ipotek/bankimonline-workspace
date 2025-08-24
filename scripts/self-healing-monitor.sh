#!/bin/bash

# 🛡️ SELF-HEALING DEPLOYMENT MONITORING SYSTEM
# Runs every 2 minutes to detect and automatically fix common deployment issues
# Based on DevOps Master "ultrathink" analysis for bulletproof deployments

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/www/bankim/self-healing.log"
ALERT_LOG="/var/www/bankim/alerts.log"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Server detection
SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "unknown")
if [[ "$SERVER_IP" == "45.83.42.74" ]] || [[ -f "/var/www/bankim/.test-server" ]]; then
    SERVER_TYPE="test"
    DOMAIN="dev2.bankimonline.com"
elif [[ "$SERVER_IP" == "185.253.72.80" ]] || [[ -f "/var/www/bankim/.prod-server" ]]; then
    SERVER_TYPE="production"
    DOMAIN="bankimonline.com"
else
    SERVER_TYPE="unknown"
    DOMAIN="localhost"
fi

API_PORT="8003"

# Logging functions
log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

alert() {
    echo "[$TIMESTAMP] ALERT: $1" | tee -a "$LOG_FILE" | tee -a "$ALERT_LOG"
}

# Recovery action counter (prevent infinite loops)
RECOVERY_COUNT_FILE="/tmp/bankim-recovery-count"
get_recovery_count() {
    [[ -f "$RECOVERY_COUNT_FILE" ]] && cat "$RECOVERY_COUNT_FILE" || echo "0"
}

increment_recovery_count() {
    local count=$(get_recovery_count)
    echo $((count + 1)) > "$RECOVERY_COUNT_FILE"
}

reset_recovery_count() {
    echo "0" > "$RECOVERY_COUNT_FILE"
}

# Check if too many recovery attempts
check_recovery_limit() {
    local count=$(get_recovery_count)
    if [[ $count -gt 5 ]]; then
        alert "⚠️ Recovery attempt limit reached ($count). Manual intervention required."
        return 1
    fi
    return 0
}

# Test functions
test_pm2_status() {
    pm2 status 2>/dev/null | grep -q "bankim-api.*online"
}

test_api_health() {
    curl -s -f --max-time 10 "http://localhost:$API_PORT/api/health" >/dev/null 2>&1
}

test_nginx_status() {
    systemctl is-active nginx >/dev/null 2>&1
}

test_https_frontend() {
    if [[ "$DOMAIN" != "localhost" ]]; then
        curl -s -f --max-time 10 "https://$DOMAIN/" >/dev/null 2>&1
    else
        return 0  # Skip for unknown servers
    fi
}

test_https_api() {
    if [[ "$DOMAIN" != "localhost" ]]; then
        curl -s -f --max-time 10 "https://$DOMAIN/api/health" >/dev/null 2>&1
    else
        return 0  # Skip for unknown servers
    fi
}

# Recovery functions
recover_pm2() {
    log "🔄 Attempting PM2 recovery..."
    
    # Try restart first
    if pm2 restart bankim-api 2>/dev/null; then
        sleep 5
        if test_pm2_status; then
            log "✅ PM2 restart successful"
            return 0
        fi
    fi
    
    # If restart fails, try full process recovery
    log "🔄 Full PM2 process recovery..."
    pm2 delete bankim-api 2>/dev/null || true
    cd /var/www/bankim/current || return 1
    
    if [[ "$SERVER_TYPE" == "production" ]]; then
        pm2 start ecosystem.config.js --env production
    else
        pm2 start ecosystem.config.js --env test
    fi
    
    sleep 5
    if test_pm2_status; then
        log "✅ PM2 full recovery successful"
        return 0
    else
        alert "❌ PM2 recovery failed"
        return 1
    fi
}

recover_nginx() {
    log "🔄 Attempting NGINX recovery..."
    
    # Test configuration first
    if nginx -t 2>/dev/null; then
        systemctl reload nginx
        sleep 3
        if test_nginx_status; then
            log "✅ NGINX reload successful"
            return 0
        fi
    fi
    
    # Try restart
    systemctl restart nginx
    sleep 5
    if test_nginx_status; then
        log "✅ NGINX restart successful"
        return 0
    else
        alert "❌ NGINX recovery failed"
        return 1
    fi
}

recover_full_stack() {
    log "🔄 Attempting full stack recovery..."
    
    # Stop services gracefully
    pm2 stop bankim-api 2>/dev/null || true
    
    # Restart NGINX first
    if ! recover_nginx; then
        return 1
    fi
    
    # Then restart PM2
    if ! recover_pm2; then
        return 1
    fi
    
    # Wait and verify
    sleep 10
    if test_api_health && test_https_frontend && test_https_api; then
        log "✅ Full stack recovery successful"
        return 0
    else
        alert "❌ Full stack recovery failed"
        return 1
    fi
}

# Main monitoring logic
run_monitoring_cycle() {
    log "🔍 Starting monitoring cycle for $SERVER_TYPE server ($DOMAIN)"
    
    local issues_detected=0
    local recovery_needed=false
    
    # Check PM2 status
    if ! test_pm2_status; then
        log "❌ PM2 issue detected"
        ((issues_detected++))
        recovery_needed=true
    fi
    
    # Check API health
    if ! test_api_health; then
        log "❌ API health issue detected"
        ((issues_detected++))
        recovery_needed=true
    fi
    
    # Check NGINX status
    if ! test_nginx_status; then
        log "❌ NGINX issue detected"
        ((issues_detected++))
        recovery_needed=true
    fi
    
    # Check HTTPS frontend (only for known domains)
    if [[ "$DOMAIN" != "localhost" ]] && ! test_https_frontend; then
        log "❌ HTTPS frontend issue detected"
        ((issues_detected++))
        recovery_needed=true
    fi
    
    # Check HTTPS API proxy (only for known domains)  
    if [[ "$DOMAIN" != "localhost" ]] && ! test_https_api; then
        log "❌ HTTPS API proxy issue detected"
        ((issues_detected++))
        recovery_needed=true
    fi
    
    # Handle recovery if needed
    if [[ "$recovery_needed" == true ]]; then
        alert "🚨 $issues_detected issues detected - initiating recovery"
        
        if ! check_recovery_limit; then
            return 1
        fi
        
        increment_recovery_count
        
        # Determine recovery strategy based on issue severity
        if [[ $issues_detected -ge 3 ]]; then
            log "🔄 Multiple issues detected - full stack recovery"
            recover_full_stack
        elif [[ $issues_detected -ge 2 ]]; then
            log "🔄 Service-level recovery needed"
            recover_pm2 && recover_nginx
        else
            log "🔄 Single service recovery"
            if ! test_pm2_status; then
                recover_pm2
            elif ! test_nginx_status; then
                recover_nginx
            fi
        fi
        
        # Verify recovery
        sleep 10
        local recovery_success=true
        
        if ! test_pm2_status; then
            alert "❌ PM2 still failing after recovery"
            recovery_success=false
        fi
        
        if ! test_api_health; then
            alert "❌ API still failing after recovery"
            recovery_success=false
        fi
        
        if [[ "$DOMAIN" != "localhost" ]] && ! test_https_frontend; then
            alert "❌ HTTPS frontend still failing after recovery"
            recovery_success=false
        fi
        
        if [[ "$recovery_success" == true ]]; then
            log "✅ Recovery successful - resetting counters"
            reset_recovery_count
        else
            alert "🚨 Recovery failed - manual intervention required"
        fi
        
    else
        log "✅ All systems operational"
        reset_recovery_count
    fi
}

# Disk space monitoring
check_disk_space() {
    local usage=$(df /var/www 2>/dev/null | tail -1 | awk '{print $5}' | sed 's/%//' || echo "0")
    if [[ $usage -gt 90 ]]; then
        alert "🚨 Disk space critical: ${usage}%"
        # Basic cleanup
        find /var/www/bankim -name "*.log" -mtime +7 -delete 2>/dev/null || true
        find /tmp -name "deployment-*.tar.gz" -mtime +1 -delete 2>/dev/null || true
    elif [[ $usage -gt 80 ]]; then
        log "⚠️ Disk space warning: ${usage}%"
    fi
}

# Memory monitoring
check_memory_usage() {
    local memory_usage=$(free | awk 'FNR==2{printf "%.1f", $3/($3+$4)*100}' 2>/dev/null || echo "0")
    local memory_int=${memory_usage%.*}
    
    if [[ $memory_int -gt 90 ]]; then
        alert "🚨 Memory usage critical: ${memory_usage}%"
        # Restart PM2 to free memory
        pm2 restart bankim-api
    elif [[ $memory_int -gt 80 ]]; then
        log "⚠️ Memory usage high: ${memory_usage}%"
    fi
}

# Performance monitoring
check_api_response_time() {
    local start_time=$(date +%s.%N)
    if curl -s -f --max-time 5 "http://localhost:$API_PORT/api/health" >/dev/null 2>&1; then
        local end_time=$(date +%s.%N)
        local response_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")
        local response_ms=$(echo "$response_time * 1000" | bc -l 2>/dev/null || echo "0")
        
        # Log if response time is > 2 seconds
        local response_int=${response_ms%.*}
        if [[ $response_int -gt 2000 ]]; then
            log "⚠️ Slow API response: ${response_int}ms"
        fi
    fi
}

# Main execution
main() {
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Run all monitoring checks
    run_monitoring_cycle
    check_disk_space
    check_memory_usage
    check_api_response_time
    
    # Log completion
    log "✅ Monitoring cycle completed"
}

# Trap errors
trap 'alert "🚨 Monitoring script error on line $LINENO"' ERR

# Execute main function
main "$@"
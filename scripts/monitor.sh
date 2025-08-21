#!/bin/bash

# 📊 Continuous Monitoring Script for Professional CI/CD Pipeline
# Usage: ./scripts/monitor.sh [--interval 60] [--alert-webhook URL] [--log-file path]
# Designed for cron: */5 * * * * /app/scripts/monitor.sh --log-file /app/logs/monitor.log

set -e

# Default configuration
INTERVAL=300  # 5 minutes
LOG_FILE=""
ALERT_WEBHOOK=""
HEALTH_CHECK_SCRIPT="/app/scripts/health-check.sh"
QUIET=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --interval)
            INTERVAL="$2"
            shift 2
            ;;
        --log-file)
            LOG_FILE="$2"
            shift 2
            ;;
        --alert-webhook)
            ALERT_WEBHOOK="$2"
            shift 2
            ;;
        --quiet)
            QUIET=true
            shift
            ;;
        --help)
            echo "Continuous Monitoring Script for BankiMonline"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --interval      Monitoring interval in seconds [default: 300]"
            echo "  --log-file      Log file path [default: stdout]"
            echo "  --alert-webhook Webhook URL for alerts"
            echo "  --quiet         Suppress console output"
            echo "  --help          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Basic monitoring"
            echo "  $0 --interval 60 --quiet             # Every minute, quiet mode"
            echo "  $0 --log-file /app/logs/monitor.log  # Log to file"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Logging function
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_entry="[$timestamp] [$level] $message"
    
    if [ "$QUIET" = false ]; then
        echo "$log_entry"
    fi
    
    if [ -n "$LOG_FILE" ]; then
        echo "$log_entry" >> "$LOG_FILE"
    fi
}

# Send alert function
send_alert() {
    local title="$1"
    local message="$2"
    local severity="$3"
    
    log_message "ALERT" "$title: $message"
    
    if [ -n "$ALERT_WEBHOOK" ]; then
        local payload=$(cat <<EOF
{
    "title": "$title",
    "message": "$message",
    "severity": "$severity",
    "timestamp": "$(date -Iseconds)",
    "service": "bankimonline",
    "environment": "production"
}
EOF
)
        
        curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "$payload" \
            "$ALERT_WEBHOOK" >/dev/null 2>&1 || \
            log_message "ERROR" "Failed to send alert to webhook"
    fi
}

# Health check function
perform_health_check() {
    local result
    local exit_code
    
    if [ -f "$HEALTH_CHECK_SCRIPT" ]; then
        result=$(timeout 60 "$HEALTH_CHECK_SCRIPT" --json 2>&1)
        exit_code=$?
    else
        # Fallback basic health check
        if curl -sf http://localhost:8003/api/health >/dev/null 2>&1; then
            result='{"overall_status": "healthy", "timestamp": "'$(date -Iseconds)'"}'
            exit_code=0
        else
            result='{"overall_status": "unhealthy", "timestamp": "'$(date -Iseconds)'", "error": "Basic health check failed"}'
            exit_code=1
        fi
    fi
    
    echo "$result"
    return $exit_code
}

# Container status check
check_container_status() {
    if ! command -v docker >/dev/null 2>&1; then
        return 0  # Skip if Docker not available
    fi
    
    local blue_status="missing"
    local green_status="missing"
    
    if docker ps --format "{{.Names}}" | grep -q "bankimonline-blue"; then
        blue_status="running"
    elif docker ps -a --format "{{.Names}}" | grep -q "bankimonline-blue"; then
        blue_status="stopped"
    fi
    
    if docker ps --format "{{.Names}}" | grep -q "bankimonline-green"; then
        green_status="running"
    elif docker ps -a --format "{{.Names}}" | grep -q "bankimonline-green"; then
        green_status="stopped"
    fi
    
    # Check if at least one container is running
    if [ "$blue_status" != "running" ] && [ "$green_status" != "running" ]; then
        send_alert "Container Alert" "No BankiMonline containers are running" "critical"
        return 1
    fi
    
    log_message "INFO" "Container status - Blue: $blue_status, Green: $green_status"
    return 0
}

# Resource usage check
check_resource_usage() {
    # Check disk space
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 85 ]; then
        send_alert "Resource Alert" "Disk usage is ${disk_usage}%" "warning"
    fi
    
    # Check memory usage
    if command -v free >/dev/null 2>&1; then
        local memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
        if [ "$memory_usage" -gt 90 ]; then
            send_alert "Resource Alert" "Memory usage is ${memory_usage}%" "warning"
        fi
    fi
    
    # Check if containers are consuming too much memory
    if command -v docker >/dev/null 2>&1; then
        docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}" | \
        grep bankimonline | while read -r line; do
            local container=$(echo "$line" | awk '{print $1}')
            local mem_perc=$(echo "$line" | awk '{print $3}' | sed 's/%//')
            
            if [ "${mem_perc%.*}" -gt 80 ]; then
                send_alert "Container Resource Alert" "Container $container memory usage is ${mem_perc}%" "warning"
            fi
        done
    fi
}

# Certificate expiry check
check_certificate_expiry() {
    local cert_info
    local expiry_date
    local days_until_expiry
    
    # Check SSL certificate for dev2.bankimonline.com
    cert_info=$(echo | openssl s_client -connect dev2.bankimonline.com:443 -servername dev2.bankimonline.com 2>/dev/null | \
                openssl x509 -noout -enddate 2>/dev/null || echo "")
    
    if [ -n "$cert_info" ]; then
        expiry_date=$(echo "$cert_info" | cut -d= -f2)
        days_until_expiry=$(( ($(date -d "$expiry_date" +%s) - $(date +%s)) / 86400 ))
        
        if [ "$days_until_expiry" -lt 30 ]; then
            send_alert "Certificate Alert" "SSL certificate expires in $days_until_expiry days" "warning"
        elif [ "$days_until_expiry" -lt 7 ]; then
            send_alert "Certificate Alert" "SSL certificate expires in $days_until_expiry days" "critical"
        fi
        
        log_message "INFO" "SSL certificate expires in $days_until_expiry days"
    fi
}

# Main monitoring loop
main_monitor() {
    log_message "INFO" "Starting monitoring with interval ${INTERVAL}s"
    
    while true; do
        local overall_healthy=true
        
        # Perform health check
        log_message "INFO" "Performing health check..."
        local health_result
        
        if health_result=$(perform_health_check); then
            local status=$(echo "$health_result" | grep -o '"overall_status":"[^"]*"' | cut -d'"' -f4)
            
            if [ "$status" = "healthy" ]; then
                log_message "INFO" "Health check passed"
            else
                log_message "WARNING" "Health check failed: $status"
                send_alert "Health Check Failed" "Application health check returned: $status" "critical"
                overall_healthy=false
            fi
        else
            log_message "ERROR" "Health check script failed"
            send_alert "Health Check Error" "Health check script execution failed" "critical"
            overall_healthy=false
        fi
        
        # Check container status
        if ! check_container_status; then
            overall_healthy=false
        fi
        
        # Check resource usage
        check_resource_usage
        
        # Check certificate expiry (once per day)
        local current_hour=$(date +%H)
        local current_minute=$(date +%M)
        if [ "$current_hour" = "09" ] && [ "$current_minute" -lt 10 ]; then
            check_certificate_expiry
        fi
        
        # Log overall status
        if [ "$overall_healthy" = true ]; then
            log_message "INFO" "All systems operational"
        else
            log_message "WARNING" "System issues detected"
        fi
        
        # Wait for next iteration
        sleep "$INTERVAL"
    done
}

# Signal handlers
cleanup() {
    log_message "INFO" "Monitoring stopped"
    exit 0
}

trap cleanup SIGTERM SIGINT

# One-time monitoring (for cron)
if [ "$INTERVAL" = "0" ]; then
    log_message "INFO" "Running one-time health check"
    
    if perform_health_check >/dev/null; then
        log_message "INFO" "One-time health check passed"
        exit 0
    else
        log_message "ERROR" "One-time health check failed"
        send_alert "Scheduled Health Check Failed" "Cron health check detected system issues" "critical"
        exit 1
    fi
fi

# Start main monitoring loop
main_monitor
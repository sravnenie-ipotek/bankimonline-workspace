#!/bin/bash

# Kill All Development Ports Script
# This script kills processes running on common development ports

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local process=$(lsof -ti:$port)
    if [ ! -z "$process" ]; then
        echo "🔫 Killing process on port $port (PID: $process)"
        kill -9 $process
        return 0
    else
        echo "ℹ️  No process found on port $port"
        return 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] [PORT1 PORT2 ...]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -a, --all      Kill all common development ports (default)"
    echo "  -n, --node     Also kill all Node.js processes"
    echo "  -p, --process  Also kill all npm/yarn/pnpm processes"
    echo ""
    echo "Examples:"
    echo "  $0                    # Kill all common development ports"
    echo "  $0 3000 5173         # Kill processes on ports 3000 and 5173"
    echo "  $0 -n                # Kill all common ports + Node.js processes"
    echo "  $0 -p 8080           # Kill port 8080 + all package managers"
    echo ""
    echo "Common development ports:"
    echo "  3000, 5173, 8080, 5000, 4000, 9000, 4200"
}

# Default ports to kill
DEFAULT_PORTS=(
    3000    # React development server
    3001    # Alternative React port
    5173    # Vite development server
    5174    # Alternative Vite port
    8000    # Python/Django development
    8003    # Server development port
    8080    # Alternative development port
    5000    # Flask development
    4000    # Alternative development port
    9000    # Alternative development port
    4200    # Angular development
    3006    # Alternative React port
    3007    # Alternative React port
    3008    # Alternative React port
    3009    # Alternative React port
    3010    # Alternative React port
    8081    # Alternative development port
    8082    # Alternative development port
    8083    # Alternative development port
    8084    # Alternative development port
    8085    # Alternative development port
    9001    # Alternative development port
    9002    # Alternative development port
    9003    # Alternative development port
    9004    # Alternative development port
    9005    # Alternative development port
    4001    # Alternative development port
    4002    # Alternative development port
    4003    # Alternative development port
    4004    # Alternative development port
    4005    # Alternative development port
    5001    # Alternative development port
    5002    # Alternative development port
    5003    # Alternative development port
    5004    # Alternative development port
    5005    # Alternative development port
    6001    # Alternative development port
    6002    # Alternative development port
    6003    # Alternative development port
    6004    # Alternative development port
    6005    # Alternative development port
    7001    # Alternative development port
    7002    # Alternative development port
    7003    # Alternative development port
    7004    # Alternative development port
    7005    # Alternative development port
)

# Parse command line arguments
KILL_NODE=false
KILL_PROCESSES=false
SPECIFIC_PORTS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -a|--all)
            # Use default ports (this is the default behavior)
            shift
            ;;
        -n|--node)
            KILL_NODE=true
            shift
            ;;
        -p|--process)
            KILL_PROCESSES=true
            shift
            ;;
        -*)
            echo "❌ Unknown option: $1"
            show_usage
            exit 1
            ;;
        *)
            # Check if it's a valid port number
            if [[ $1 =~ ^[0-9]+$ ]] && [ $1 -ge 1 ] && [ $1 -le 65535 ]; then
                SPECIFIC_PORTS+=($1)
            else
                echo "❌ Invalid port number: $1"
                exit 1
            fi
            shift
            ;;
    esac
done

# Determine which ports to kill
if [ ${#SPECIFIC_PORTS[@]} -gt 0 ]; then
    PORTS_TO_KILL=("${SPECIFIC_PORTS[@]}")
    echo "🎯 Killing specific ports: ${SPECIFIC_PORTS[*]}"
else
    PORTS_TO_KILL=("${DEFAULT_PORTS[@]}")
    echo "🔫 Killing all common development ports..."
fi

# Kill processes on each port
killed_count=0
for port in "${PORTS_TO_KILL[@]}"; do
    if kill_port $port; then
        ((killed_count++))
    fi
done

# Kill Node.js processes if requested
if [ "$KILL_NODE" = true ]; then
    echo ""
    echo "🔫 Killing all Node.js processes..."
    NODE_PROCESSES=$(pgrep -f "node" | wc -l)
    if [ $NODE_PROCESSES -gt 0 ]; then
        pkill -f "node"
        echo "✅ Killed $NODE_PROCESSES Node.js processes"
    else
        echo "ℹ️  No Node.js processes found"
    fi
fi

# Kill package manager processes if requested
if [ "$KILL_PROCESSES" = true ]; then
    echo ""
    echo "🔫 Killing all package manager processes..."
    
    # Kill npm processes
    NPM_PROCESSES=$(pgrep -f "npm" | wc -l)
    if [ $NPM_PROCESSES -gt 0 ]; then
        pkill -f "npm"
        echo "✅ Killed $NPM_PROCESSES npm processes"
    fi
    
    # Kill yarn processes
    YARN_PROCESSES=$(pgrep -f "yarn" | wc -l)
    if [ $YARN_PROCESSES -gt 0 ]; then
        pkill -f "yarn"
        echo "✅ Killed $YARN_PROCESSES yarn processes"
    fi
    
    # Kill pnpm processes
    PNPM_PROCESSES=$(pgrep -f "pnpm" | wc -l)
    if [ $PNPM_PROCESSES -gt 0 ]; then
        pkill -f "pnpm"
        echo "✅ Killed $PNPM_PROCESSES pnpm processes"
    fi
fi

echo ""
echo "✅ Port killing completed!"
echo "📊 Summary:"
echo "   - Killed processes on $killed_count ports"
if [ "$KILL_NODE" = true ]; then
    echo "   - Killed Node.js processes"
fi
if [ "$KILL_PROCESSES" = true ]; then
    echo "   - Killed package manager processes"
fi

echo ""
echo "💡 Usage examples:"
echo "   ./kill-ports.sh                    # Kill all common ports"
echo "   ./kill-ports.sh 3000 5173         # Kill specific ports"
echo "   ./kill-ports.sh -n                 # Kill all ports + Node.js"
echo "   ./kill-ports.sh -p 8080           # Kill port 8080 + package managers"
echo "   ./kill-ports.sh -h                 # Show help"

#!/bin/bash

# Simple alias script to kill all development ports
# This script calls the main kill-ports.sh script with default settings

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Call the main kill-ports script
"$PROJECT_ROOT/kill-ports.sh" "$@"

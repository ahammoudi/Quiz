#!/bin/bash

# ============================================================
# Quick Start - Interactive Quiz Platform (macOS/Linux)
# ============================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo -e "${RED}❌ Python not found! Please install Python first.${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "Install with: brew install python"
        else
            echo "Install with: sudo apt install python3 (Ubuntu/Debian)"
        fi
        read -p "Press Enter to exit..."
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

# Check if we're in the right directory (check for required files)
if [[ ! -f "final_server.py" ]]; then
    echo -e "${RED}❌ Required files not found in: $SCRIPT_DIR${NC}"
    echo "Please ensure this script is in the Quiz directory"
    read -p "Press Enter to exit..."
    exit 1
fi

echo -e "${BLUE}🚀 Starting Quiz Platform...${NC}"

# Start server in background
$PYTHON_CMD final_server.py &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Open browser
echo -e "${GREEN}🌐 Opening browser...${NC}"

# Open browser (cross-platform)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:8080"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:8080"
    elif command -v gnome-open &> /dev/null; then
        gnome-open "http://localhost:8080"
    else
        echo "Please open http://localhost:8080 in your browser"
    fi
fi

echo -e "${GREEN}✅ Quiz Platform started!${NC}"
echo -e "${CYAN}📖 Main Quiz: http://localhost:8080${NC}"
echo -e "${CYAN}⚙️  Management: http://localhost:8080/config.html${NC}"
echo
echo -e "${YELLOW}Keep this terminal open. Press any key to stop the server.${NC}"

# Cleanup function
cleanup() {
    echo
    echo -e "${YELLOW}🛑 Stopping server...${NC}"
    kill $SERVER_PID 2>/dev/null || true
    # Also kill any python processes running final_server.py
    pkill -f "final_server.py" 2>/dev/null || true
    echo -e "${GREEN}🛑 Server stopped.${NC}"
    exit 0
}

# Set up signal handler
trap cleanup SIGINT SIGTERM

# Wait for user input
read -n 1 -s
cleanup

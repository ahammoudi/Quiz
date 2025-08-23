#!/bin/bash

# ============================================================
# Interactive Quiz Platform - Startup Script (macOS/Linux)
# ============================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}          Interactive Quiz Platform - Startup${NC}"
echo -e "${BLUE}============================================================${NC}"
echo

# Get the directory where this script is located and go there
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo -e "📁 Script location: ${CYAN}$SCRIPT_DIR${NC}"
cd "$SCRIPT_DIR"

# Check if we're in the correct directory
if [[ ! -f "final_server.py" ]]; then
    echo -e "${RED}❌ Error: Required files not found!${NC}"
    echo "Script directory: $SCRIPT_DIR"
    echo "Expected files: final_server.py, index.html"
    echo
    echo "Please ensure this script is in the Quiz directory"
    echo "with all the required files."
    echo
    read -p "Press Enter to exit..."
    exit 1
fi

# Check for Python installation
echo -e "🔍 Checking for Python installation..."
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo -e "${RED}❌ Python is not installed or not in PATH!${NC}"
        echo
        echo -e "${YELLOW}📋 To fix this:${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "1. Install Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            echo "2. Install Python: brew install python"
        else
            echo "1. Ubuntu/Debian: sudo apt update && sudo apt install python3"
            echo "2. CentOS/RHEL: sudo yum install python3"
            echo "3. Fedora: sudo dnf install python3"
        fi
        echo "4. Restart this script after installation"
        echo
        read -p "Press Enter to exit..."
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
echo -e "${GREEN}✅ Found: $PYTHON_VERSION${NC}"

# Check Python version (require 3.6+)
PYTHON_MAJOR=$($PYTHON_CMD -c "import sys; print(sys.version_info[0])")
PYTHON_MINOR=$($PYTHON_CMD -c "import sys; print(sys.version_info[1])")

if [[ $PYTHON_MAJOR -lt 3 ]] || [[ $PYTHON_MAJOR -eq 3 && $PYTHON_MINOR -lt 6 ]]; then
    echo -e "${RED}❌ Python version too old. Required: Python 3.6+${NC}"
    echo "Please update Python and try again."
    read -p "Press Enter to exit..."
    exit 1
fi

# Check for required files
echo
echo -e "🔍 Checking for required files..."
MISSING_FILES=0

check_file() {
    if [[ ! -f "$1" ]]; then
        echo -e "${RED}❌ Missing: $1${NC}"
        MISSING_FILES=1
    fi
}

check_file "index.html"
check_file "config.html"
check_file "final_server.py"
check_file "assets/css/quiz.css"
check_file "assets/js/quiz.js"
check_file "assets/data/quiz-config.json"

if [[ $MISSING_FILES -eq 1 ]]; then
    echo
    echo -e "${RED}❌ Some required files are missing!${NC}"
    echo "Please ensure all quiz platform files are present."
    read -p "Press Enter to exit..."
    exit 1
else
    echo -e "${GREEN}✅ All required files found${NC}"
fi

# Check if server is already running
echo
echo -e "🔍 Checking if server is already running..."

if lsof -i :8080 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Port 8080 appears to be in use.${NC}"
    echo "This might mean:"
    echo "- The server is already running"
    echo "- Another application is using port 8080"
    echo
    echo "Opening browser anyway..."
    sleep 2
    
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
    
    echo
    echo -e "${GREEN}✅ Browser opened. If the quiz doesn't load, check if${NC}"
    echo "   the server is running or restart it manually."
    read -p "Press Enter to exit..."
    exit 0
fi

# Start the server
echo
echo -e "${PURPLE}🚀 Starting Quiz Platform Server...${NC}"
echo -e "${BLUE}============================================================${NC}"
echo -e "${CYAN}📡 Server will start at: http://localhost:8080${NC}"
echo -e "${CYAN}🏠 Main Quiz: http://localhost:8080${NC}"
echo -e "${CYAN}⚙️  Management: http://localhost:8080/config.html${NC}"
echo -e "${BLUE}============================================================${NC}"
echo
echo -e "${YELLOW}📝 Note: Keep this terminal open while using the quiz platform${NC}"
echo -e "${YELLOW}🛑 Press Ctrl+C to stop the server${NC}"
echo

# Wait a moment for the message to be visible
sleep 3

# Start the server in background
echo -e "🔄 Launching server..."
$PYTHON_CMD final_server.py &
SERVER_PID=$!

# Wait for server to start up
echo -e "⏳ Waiting for server to initialize..."
RETRY_COUNT=0
while [[ $RETRY_COUNT -lt 15 ]]; do
    if curl -s "http://localhost:8080" > /dev/null 2>&1; then
        break
    fi
    sleep 1
    ((RETRY_COUNT++))
done

if [[ $RETRY_COUNT -eq 15 ]]; then
    echo -e "${RED}❌ Server failed to start within 15 seconds${NC}"
    echo "Please check for errors and try again."
    kill $SERVER_PID 2>/dev/null || true
    read -p "Press Enter to exit..."
    exit 1
fi

# Server is running, open browser
echo -e "${GREEN}✅ Server is running!${NC}"
echo -e "🌐 Opening browser..."

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

echo
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}🎉 Quiz Platform is ready!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo -e "${CYAN}📖 Main Quiz Interface: http://localhost:8080${NC}"
echo -e "${CYAN}⚙️  Quiz Management: http://localhost:8080/config.html${NC}"
echo
echo -e "${YELLOW}💡 Tips:${NC}"
echo "- Use config.html to upload and manage quiz files"
echo "- Keep this terminal open while using the platform"
echo "- Press Ctrl+C to stop the server when done"
echo -e "${GREEN}============================================================${NC}"
echo

# Cleanup function
cleanup() {
    echo
    echo -e "${YELLOW}🛑 Shutting down server...${NC}"
    kill $SERVER_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Server stopped.${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running and show server status
echo -e "${PURPLE}📊 Server Status Monitor - Press Ctrl+C to stop${NC}"
echo -e "${BLUE}============================================================${NC}"

while true; do
    sleep 10
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo
        echo -e "${RED}❌ Server appears to have stopped!${NC}"
        echo "Attempting to restart..."
        $PYTHON_CMD final_server.py &
        SERVER_PID=$!
        sleep 3
    fi
done

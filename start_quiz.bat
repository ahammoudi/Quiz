@echo off
setlocal enabledelayedexpansion

:: ============================================================
:: Interactive Quiz Platform - Startup Script
:: ============================================================
echo.
echo ============================================================
echo          Interactive Quiz Platform - Startup
echo ============================================================
echo.

:: Get the directory where this batch file is located and go there
set SCRIPT_DIR=%~dp0
echo 📁 Script location: %SCRIPT_DIR%
cd /d "%SCRIPT_DIR%"

:: Check if we're in the correct directory
if not exist "final_server.py" (
    echo ❌ Error: Required files not found!
    echo Script directory: %SCRIPT_DIR%
    echo Expected files: final_server.py, index.html
    echo.
    echo Please ensure this batch file is in the Quiz directory
    echo with all the required files.
    echo.
    pause
    exit /b 1
)

:: Check for Python installation
echo 🔍 Checking for Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH!
    echo.
    echo 📋 To fix this:
    echo 1. Download Python from https://python.org/downloads/
    echo 2. During installation, check "Add Python to PATH"
    echo 3. Restart this script after installation
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo ✅ Found: !PYTHON_VERSION!
)

:: Check Python version (require 3.6+)
for /f "tokens=2 delims=. " %%a in ('python --version 2^>^&1') do set MAJOR_VERSION=%%a
if !MAJOR_VERSION! LSS 3 (
    echo ❌ Python version too old. Required: Python 3.6+
    echo Please update Python and try again.
    pause
    exit /b 1
)

:: Check for required files
echo.
echo 🔍 Checking for required files...
set MISSING_FILES=0

if not exist "index.html" (
    echo ❌ Missing: index.html
    set MISSING_FILES=1
)
if not exist "config.html" (
    echo ❌ Missing: config.html
    set MISSING_FILES=1
)
if not exist "final_server.py" (
    echo ❌ Missing: final_server.py
    set MISSING_FILES=1
)
if not exist "assets\css\quiz.css" (
    echo ❌ Missing: assets\css\quiz.css
    set MISSING_FILES=1
)
if not exist "assets\js\quiz.js" (
    echo ❌ Missing: assets\js\quiz.js
    set MISSING_FILES=1
)
if not exist "assets\data\quiz-config.json" (
    echo ❌ Missing: assets\data\quiz-config.json
    set MISSING_FILES=1
)

if !MISSING_FILES! == 1 (
    echo.
    echo ❌ Some required files are missing!
    echo Please ensure all quiz platform files are present.
    pause
    exit /b 1
) else (
    echo ✅ All required files found
)

:: Check if server is already running
echo.
echo 🔍 Checking if server is already running...
netstat -an | findstr ":8080" >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Port 8080 appears to be in use.
    echo This might mean:
    echo - The server is already running
    echo - Another application is using port 8080
    echo.
    echo Opening browser anyway...
    timeout /t 2 >nul
    start http://localhost:8080
    echo.
    echo ✅ Browser opened. If the quiz doesn't load, check if
    echo    the server is running or restart it manually.
    pause
    exit /b 0
)

:: Start the server
echo.
echo 🚀 Starting Quiz Platform Server...
echo ============================================================
echo 📡 Server will start at: http://localhost:8080
echo 🏠 Main Quiz: http://localhost:8080
echo ⚙️  Management: http://localhost:8080/config.html
echo ============================================================
echo.
echo 📝 Note: Keep this window open while using the quiz platform
echo 🛑 Press Ctrl+C to stop the server
echo.

:: Wait a moment for the message to be visible
timeout /t 3 >nul

:: Start the server in background and capture the process ID
echo 🔄 Launching server...
start /b python final_server.py

:: Wait for server to start up
echo ⏳ Waiting for server to initialize...
set RETRY_COUNT=0
:check_server
set /a RETRY_COUNT+=1
if !RETRY_COUNT! GTR 15 (
    echo ❌ Server failed to start within 15 seconds
    echo Please check for errors and try again.
    pause
    exit /b 1
)

:: Try to connect to the server
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8080' -TimeoutSec 1 -UseBasicParsing | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    timeout /t 1 >nul
    goto check_server
)

:: Server is running, open browser
echo ✅ Server is running!
echo 🌐 Opening browser...
start http://localhost:8080

echo.
echo ============================================================
echo 🎉 Quiz Platform is ready!
echo ============================================================
echo 📖 Main Quiz Interface: http://localhost:8080
echo ⚙️  Quiz Management: http://localhost:8080/config.html
echo.
echo 💡 Tips:
echo - Use config.html to upload and manage quiz files
echo - Keep this window open while using the platform
echo - Press Ctrl+C to stop the server when done
echo ============================================================
echo.

:: Keep the window open and show server status
echo 📊 Server Status Monitor - Press Ctrl+C to stop
echo ============================================================
:monitor_loop
timeout /t 10 >nul
netstat -an | findstr ":8080" >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Server appears to have stopped!
    echo Attempting to restart...
    start /b python final_server.py
    timeout /t 3 >nul
)
goto monitor_loop

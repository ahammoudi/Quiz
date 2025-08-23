@echo off
:: ============================================================
:: Quick Start - Interactive Quiz Platform
:: ============================================================

:: Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

:: Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python first.
    pause
    exit /b 1
)

:: Check if we're in the right directory (check for required files)
if not exist "final_server.py" (
    echo ❌ Required files not found in: %SCRIPT_DIR%
    echo Please ensure this batch file is in the Quiz directory
    pause
    exit /b 1
)

echo 🚀 Starting Quiz Platform...

:: Start server in background
start /b python final_server.py

:: Wait a moment for server to start
timeout /t 3 >nul

:: Open browser
echo 🌐 Opening browser...
start http://localhost:8080

echo ✅ Quiz Platform started!
echo 📖 Main Quiz: http://localhost:8080
echo ⚙️  Management: http://localhost:8080/config.html
echo.
echo Keep this window open. Press any key to stop the server.
pause >nul

:: Try to find and kill the Python server process
taskkill /f /im python.exe 2>nul
echo 🛑 Server stopped.
pause

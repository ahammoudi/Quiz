# Platform Setup Guide

## Cross-Platform Quiz Platform Installation

This guide will help you set up the Quiz Platform on Windows, macOS, or Linux.

## 📋 Prerequisites

- **Python 3.6 or higher**
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Command line access** (Terminal on macOS/Linux, PowerShell on Windows)

## 🖥️ Windows Setup

### Step 1: Install Python
1. Download Python from https://python.org/downloads/
2. **IMPORTANT**: During installation, check "Add Python to PATH"
3. Restart your computer
4. Test installation: Open PowerShell and run `python --version`

### Step 2: Run Quiz Platform
```powershell
# Navigate to Quiz directory
cd path\to\Quiz

# Option 1: Double-click start_quiz.bat (easiest)
# Option 2: Run from PowerShell
.\start_quiz.bat

# Option 3: Quick start
.\quick_start.bat
```

### Windows Troubleshooting
- **Script blocked by antivirus**: Add Quiz folder to antivirus exceptions
- **PowerShell execution policy**: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- **Python not found**: Reinstall Python with "Add to PATH" checked

## 🍎 macOS Setup

### Step 1: Install Python
```bash
# Option 1: Using Homebrew (recommended)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install python

# Option 2: Download from python.org
# Visit https://python.org/downloads/ and download macOS installer

# Test installation
python3 --version
```

### Step 2: Setup Quiz Platform
```bash
# Navigate to Quiz directory
cd /path/to/Quiz

# Make scripts executable (first time only)
chmod +x start_quiz.sh quick_start.sh

# Run the platform
./start_quiz.sh

# Or for quick start
./quick_start.sh
```

### macOS Troubleshooting
- **Permission denied**: Run `chmod +x *.sh` in Quiz directory
- **Gatekeeper blocking**: Go to System Preferences → Security & Privacy → Allow
- **Python command not found**: Use `python3` instead of `python`

## 🐧 Linux Setup

### Step 1: Install Python

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install python3 python3-pip
```

#### CentOS/RHEL:
```bash
sudo yum install python3 python3-pip
```

#### Fedora:
```bash
sudo dnf install python3 python3-pip
```

#### Arch Linux:
```bash
sudo pacman -S python python-pip
```

### Step 2: Setup Quiz Platform
```bash
# Navigate to Quiz directory
cd /path/to/Quiz

# Make scripts executable (first time only)
chmod +x start_quiz.sh quick_start.sh

# Run the platform
./start_quiz.sh

# Or for quick start
./quick_start.sh
```

### Linux Troubleshooting
- **Browser not opening**: Install `xdg-utils` package
- **Permission issues**: Ensure scripts are executable with `chmod +x *.sh`
- **Python not found**: Use `python3` command instead of `python`

## 🌐 Browser Compatibility

The Quiz Platform works with all modern browsers:
- ✅ Google Chrome (recommended)
- ✅ Mozilla Firefox
- ✅ Safari (macOS)
- ✅ Microsoft Edge
- ✅ Opera

## 🔧 Manual Startup (All Platforms)

If the automated scripts don't work, you can start manually:

```bash
# Start the server
python final_server.py
# or on some systems:
python3 final_server.py

# Open your browser and go to:
http://localhost:8080
```

## 📊 Verification

After startup, you should see:
1. Terminal/Command Prompt shows "Server running on port 8080"
2. Browser opens to http://localhost:8080
3. Quiz platform loads with quiz selection dropdown

## 🆘 Getting Help

If you encounter issues:

1. **Check Python installation**: Run `python --version` or `python3 --version`
2. **Check file permissions**: Ensure script files are executable
3. **Check firewall**: Allow Python through firewall when prompted
4. **Check port usage**: Ensure port 8080 is not used by another application

## 📝 Notes

- Keep the terminal/command prompt window open while using the quiz
- The platform runs locally on your computer (no internet required after download)
- Your quiz progress is saved locally in your browser
- All platforms use the same web interface once started

---

*For advanced users: The platform uses a simple HTTP server on localhost:8080 with no external dependencies beyond Python's standard library.*

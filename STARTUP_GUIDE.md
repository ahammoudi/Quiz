# Startup Scripts Summary

## Available Startup Options

This quiz platform includes startup scripts for all major operating systems:

### 🖥️ Windows Users
- **`start_quiz.bat`** - Full featured startup with comprehensive system checks
- **`quick_start.bat`** - Simple, fast startup for regular use

**Usage:**
- Double-click the batch file in File Explorer
- Or run from PowerShell: `.\start_quiz.bat`

### 🍎 macOS & 🐧 Linux Users  
- **`start_quiz.sh`** - Full featured startup with comprehensive system checks
- **`quick_start.sh`** - Simple, fast startup for regular use

**Usage:**
```bash
# Make executable (first time only)
chmod +x start_quiz.sh quick_start.sh

# Run the script
./start_quiz.sh
# or
./quick_start.sh
```

## Feature Comparison

| Feature | Full Startup (`start_quiz.*`) | Quick Start (`quick_start.*`) |
|---------|------------------------------|------------------------------|
| Python Version Check | ✅ Full validation | ✅ Basic check |
| File Existence Check | ✅ All required files | ✅ Essential files only |
| Error Messages | ✅ Detailed troubleshooting | ⚠️ Basic errors |
| Server Monitoring | ✅ Continuous monitoring | ❌ Start and exit |
| Browser Auto-open | ✅ Cross-platform | ✅ Cross-platform |
| Startup Time | ~5-10 seconds | ~2-3 seconds |
| Best For | First-time setup, troubleshooting | Daily use, experienced users |

## Cross-Platform Features

### Automatic Browser Opening
- **Windows**: Uses `start` command
- **macOS**: Uses `open` command
- **Linux**: Uses `xdg-open` or `gnome-open`

### Python Detection
- **Windows**: Checks for `python` command
- **macOS/Linux**: Checks for `python3` then falls back to `python`

### Colorized Output
- **Windows**: Standard console colors
- **macOS/Linux**: ANSI color codes for better readability

### Process Management
- **Windows**: Uses `taskkill` for cleanup
- **macOS/Linux**: Uses `pkill` and process signals

## Troubleshooting Quick Reference

### Script Won't Run
**Windows:**
- Right-click → "Run as administrator"
- Check antivirus settings
- Use PowerShell instead of Command Prompt

**macOS/Linux:**
```bash
chmod +x *.sh  # Make executable
./start_quiz.sh  # Run with ./
```

### Python Not Found
- **Windows**: Reinstall Python with "Add to PATH"
- **macOS**: `brew install python`
- **Linux**: `sudo apt install python3` (Ubuntu/Debian)

### Port 8080 Busy
- **Windows**: `taskkill /f /im python.exe`
- **macOS/Linux**: `pkill -f final_server.py`

## File Structure

```
Quiz/
├── start_quiz.bat      # Windows full startup
├── quick_start.bat     # Windows quick startup  
├── start_quiz.sh       # macOS/Linux full startup
├── quick_start.sh      # macOS/Linux quick startup
├── PLATFORM_SETUP.md  # Detailed setup instructions
├── README.md           # Main documentation
└── final_server.py     # Quiz platform server
```

## Development Notes

- All scripts check for Python 3.6+ compatibility
- Cross-platform browser opening implemented
- Consistent error handling across platforms
- UTF-8 encoding support maintained
- Process cleanup on script termination

---

**Recommendation:** Use the full startup scripts (`start_quiz.*`) for initial setup and when troubleshooting. Use quick start scripts (`quick_start.*`) for daily usage once everything is working.

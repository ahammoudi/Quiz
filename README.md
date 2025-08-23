# Generic Quiz Platform

A fully automated, web-based quiz platform with dynamic scoring and automated quiz management. Works with any topic or subject matter.

This tool was created to address a need for a better way to identify knowledge gaps in specific training material. After finding existing solutions to be either overpriced or unsuitable, I developed this tool and am now making it publicly available.

## ⚠️ Important Notice

**All questions in this platform are AI-generated** and are designed specifically to help identify knowledge gaps in training material. These questions are **not intended to simulate actual exams** and should be used exclusively for educational and self-assessment purposes. The content is meant to support learning and knowledge reinforcement, not exam preparation.

## 🌐 Live Demo

**Try it now**: <a href="https://quiz-dyc.pages.dev" target="_blank" rel="noopener noreferrer">https://quiz-dyc.pages.dev</a>

> **Note**: The live demo on Cloudflare Pages runs in **read-only mode**. The quiz management features (creating/deleting quizzes) require Python server functionality and are only available when running locally. The demo includes pre-loaded sample quizzes for testing.

## 🚀 Features

- **Cross-Platform**: Native startup scripts for Windows, macOS, and Linux
- **Dynamic Scoring System**: 1000-point total with 75% passing threshold
- **Automated Quiz Creation**: Convert text files to JSON format automatically  
- **Web-based Management**: Create and delete quizzes through browser interface
- **Generic Platform**: Works with any topic, not limited to specific subjects
- **Answer Parsing**: Supports multiple answer formats including "Hint Answer:", "Answer:", "Correct:"
- **Modern UI**: Responsive design with progress tracking and skip functionality

## 📁 Project Structure

```
Quiz/
├── index.html              # Main quiz application
├── config.html             # Quiz management interface
├── final_server.py         # Backend HTTP server
├── quiz_automation.py      # Text-to-JSON conversion script
├── start_quiz.bat          # Windows startup script (full)
├── quick_start.bat         # Windows startup script (quick)
├── start_quiz.sh           # macOS/Linux startup script (full)
├── quick_start.sh          # macOS/Linux startup script (quick)
├── PLATFORM_SETUP.md       # Platform-specific setup guide
├── STARTUP_GUIDE.md        # Startup scripts documentation
├── README.md               # This file
├── AIGeneratedQuestions/   # AI-generated quiz examples
└── assets/
    ├── css/
    │   └── quiz.css        # Styling
    ├── js/
    │   ├── quiz.js         # Main quiz logic
    │   └── config.js       # Management interface logic
    └── data/
        ├── quiz-config.json # Quiz configuration
        └── quiz_*.json      # Quiz question files
```

## 🚀 Quick Start

### 🌐 Try Online (No Installation)
**Live Demo**: [https://quiz-dyc.pages.dev](https://quiz-dyc.pages.dev)
- Instant access with pre-loaded sample quizzes
- No setup required - works in any browser
- **Limitation**: Quiz management features not available (read-only)

### 💻 Local Installation (Full Features)

#### Windows Users

#### Option 1: One-Click Startup (Recommended)
**Double-click** `start_quiz.bat` or `quick_start.bat`
- Automatically checks for Python and required files
- Starts the server and opens your browser
- Includes helpful error messages and troubleshooting

#### Script Options:
- **`start_quiz.bat`**: Full featured startup with comprehensive checks and monitoring
- **`quick_start.bat`**: Simple, fast startup for regular use

### macOS & Linux Users

#### Option 1: One-Click Startup (Recommended)
```bash
# Make scripts executable (first time only)
chmod +x start_quiz.sh quick_start.sh

# Run the startup script
./start_quiz.sh
# or for quick start
./quick_start.sh
```

#### Script Options:
- **`start_quiz.sh`**: Full featured startup with comprehensive checks and monitoring
- **`quick_start.sh`**: Simple, fast startup for regular use

### Universal Manual Startup
1. **Start the server**: `python final_server.py` (or `python3 final_server.py`)
2. **Open browser**: Navigate to `http://localhost:8080`
3. **Access management**: Go to `http://localhost:8080/config.html`

### Platform Requirements
- **Python**: 3.6+ required
- **Browser**: Any modern web browser
- **OS**: Windows, macOS, or Linux

## ⚙️ Configuration

- **Scoring**: 1000 points total, 75% (750 points) required to pass
- **Points per question**: Automatically calculated as 1000 ÷ question_count
- **Multiple answers**: Supported with comma separation (e.g., "A, C")


## 🔧 Technical Details

- **Backend**: Python with HTTP server
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Data Format**: JSON for quiz storage
- **Encoding**: UTF-8 support for international characters
- **Answer Detection**: Regex-based parsing with flexible pattern matching

## 📝 Notes

- Quiz files are automatically validated during creation
- Incomplete questions are skipped with detailed logging
- Configuration is automatically updated when quizzes are added/removed
- Platform supports unlimited quiz sets and questions

## 🎓 Usage Tips

**Getting Started:**
1. **Easy Setup:** Use platform-specific startup scripts for one-click launching
2. **Quiz Creation:** Upload text files through the web interface for instant quiz creation
3. **Management:** Add, delete, and preview quizzes through the config interface

**Quiz Features:**
- **Responsive Design:** Works on desktop, tablet, and mobile
- **Progress Tracking:** See completion percentage and remaining questions
- **Flexible Timing:** Pause/resume functionality for study breaks
- **Skip Option:** Mark difficult questions to revisit later
- **Dynamic Scoring:** Points automatically calculated based on question count

## 🤖 Creating & Managing Quizzes

> **💡 Deployment Note**: Quiz creation and management features require Python server functionality and are **only available when running locally**. The [live demo](https://quiz-dyc.pages.dev) runs on Cloudflare Pages (serverless) and operates in read-only mode with pre-loaded quizzes.

**Create new quizzes instantly through the web interface (local installation only):**

### Web-Based Quiz Creation (Local Installation)
1. **Start the platform**: Use startup scripts or navigate to `http://localhost:8080`
2. **Open management**: Go to `http://localhost:8080/config.html`
3. **Upload text file**: Click "Choose File" and select your quiz questions
4. **Enter details**: Provide quiz name and description
5. **Create**: Click "Create Quiz" - fully automated processing!

### Supported Question Formats
```
Question #: 1
Your question text here?

A. Option one
B. Option two
C. Option three
D. Option four

Answer: B

Question #: 2
Multiple choice question (Choose two.)

A. First option
B. Second option
C. Third option

Answer: A, C
```

**Supported answer formats:**
- `Answer: B`
- `Hint Answer: B`
- `Correct: B`
- `Correct Answer: B`

**✅ What happens automatically:**
- Converts text files to JSON quiz format
- Validates question structure and answers
- Updates configuration automatically
- Adds question count to quiz names
- Makes quiz immediately available in the interface

**🔧 For Advanced Users:**
Command-line automation is also available: `python quiz_automation.py [file] [name]`

## 🤖 AI-Generated Quiz Questions

**Use AI to generate custom quiz questions for any topic!**

### 💡 How to Ask AI for Questions

You can use any AI assistant (ChatGPT, Claude, Gemini, etc.) to generate questions using this proven prompt template:

### 📝 Sample AI Prompt

```
I need practice questions for [YOUR TOPIC HERE]. Please generate a set of multiple-choice questions about [SPECIFIC SUBJECT AREAS].

The questions should follow this exact structure, accommodating both single-answer and multiple-answer questions (e.g., "Choose TWO").

Question #: [Number]
[Question Text]

A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]
E. [Option E, if necessary]

Answer: [Correct Letter(s)]

Please provide [NUMBER] questions in this format, and output as text/markdown that I can download.
```

### 🎯 Customization Examples

**Replace the bracketed sections with your content:**
- **Technical Certifications**: "AWS Certified Solutions Architect", "CompTIA Security+", "Cisco CCNA"
- **Academic Subjects**: "Calculus", "World History", "Organic Chemistry"
- **Professional Training**: "Project Management", "Digital Marketing", "Data Analysis"
- **Language Learning**: "Spanish Grammar", "French Vocabulary", "German Pronunciation"

**Example prompts:**
```
- "Computer Science fundamentals including algorithms, data structures, and programming"
- "Medical terminology and anatomy for nursing certification"
- "Financial accounting principles and bookkeeping practices"
- "Safe driving practices and traffic regulations"
```

### 📋 Workflow

1. **Generate**: Use the prompt with your AI assistant
2. **Download**: Get the text/markdown file from AI
3. **Upload**: Use the "Add Quiz" feature in `config.html`
4. **Start Learning**: Questions are automatically processed and ready to use!

### ✨ Benefits

- **Targeted Study**: Focus on specific topics or subjects
- **Unlimited Content**: Generate as many questions as needed
- **Current Information**: AI uses up-to-date knowledge
- **Custom Difficulty**: Adjust complexity by modifying your prompt
- **Multiple Formats**: Works with various AI assistants

---

## ✅ Platform Overview

Your quiz platform is complete with:
- ✅ **Cross-platform startup scripts** for Windows, macOS, and Linux
- ✅ **Automated quiz creation** from text files (local installation)
- ✅ **Web-based management** interface (local installation)
- ✅ **Modern responsive design** with progress tracking
- ✅ **Dynamic scoring system** with configurable thresholds
- ✅ **Generic platform** that works with any subject matter
- ✅ **Live demo deployment** on Cloudflare Pages: [quiz-dyc.pages.dev](https://quiz-dyc.pages.dev)

### 🚀 Deployment Options

**🌐 Live Demo (Cloudflare Pages)**
- **URL**: [https://quiz-dyc.pages.dev](https://quiz-dyc.pages.dev)
- **Features**: Quiz taking with pre-loaded sample questions
- **Limitations**: Read-only mode - no quiz creation/management (serverless environment)
- **Best for**: Trying the platform, sharing with others, demonstration purposes

**💻 Local Installation**
- **Features**: Full functionality including quiz creation and management
- **Requirements**: Python 3.6+ and local server
- **Best for**: Personal use, custom quiz creation, full feature access

## 📚 Documentation

- **`PLATFORM_SETUP.md`** - Detailed setup instructions for all platforms
- **`STARTUP_GUIDE.md`** - Comprehensive guide to startup scripts
- **`README.md`** - This overview document

---

## 🛠️ Troubleshooting

### Common Issues

#### Python Not Found
**Windows:**
- Download Python from https://python.org/downloads/
- During installation, check "Add Python to PATH"
- Restart command prompt/PowerShell

**macOS:**
```bash
# Using Homebrew (recommended)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install python

# Using pyenv
curl https://pyenv.run | bash
pyenv install 3.11.0
pyenv global 3.11.0
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install python3

# CentOS/RHEL
sudo yum install python3

# Fedora
sudo dnf install python3
```

#### Permission Denied (macOS/Linux)
```bash
# Make scripts executable
chmod +x start_quiz.sh quick_start.sh

# Run the script
./start_quiz.sh
```

#### Port Already in Use
- Check if another instance is running
- Kill existing processes: `pkill -f final_server.py` (macOS/Linux) or `taskkill /f /im python.exe` (Windows)
- Change port in `final_server.py` if needed

#### Browser Doesn't Open Automatically
- **Windows**: Scripts use `start` command
- **macOS**: Scripts use `open` command  
- **Linux**: Scripts try `xdg-open`, then `gnome-open`
- **Manual**: Open http://localhost:8080 in any browser

#### Script Won't Execute (Windows)
- Right-click script → "Run as administrator"
- Check if antivirus is blocking execution
- Use PowerShell instead of Command Prompt

### Platform-Specific Notes

**Windows:**
- Use PowerShell for best compatibility
- Some antivirus software may flag Python scripts
- Windows Defender may require approval for network access

**macOS:**
- Gatekeeper may block downloaded scripts initially
- Use `chmod +x` to make scripts executable
- Python 3 might be installed as `python3` command

**Linux:**
- Different distributions use different package managers
- Desktop environments vary in browser opening methods
- May need to install `python3-pip` separately

---

## ⚠️ Disclaimer

**Educational Use Notice:**
- Practice questions are provided **AS-IS** for educational purposes only
- **No guarantee** is made regarding accuracy, completeness, or correctness of content
- While efforts are made to validate questions, **some may contain inaccuracies**
- This platform is **NOT** affiliated with any certification body or educational institution
- **Use at your own discretion** - always verify answers with official sources
- **Recommendation:** Use as supplementary material alongside official study resources

---

*Generic Quiz Platform - Ready for any subject matter*
*Platform completed: August 23, 2025*

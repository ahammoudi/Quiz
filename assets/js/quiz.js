// AWS SAA-C03 Practice Quiz JavaScript

// Global variables
let questions = [];
let selectedQuestions = [];
let current = 0;
let answers = [];
let timer = 100 * 60; // Default 100 minutes in seconds
let originalTimer = 100 * 60; // Store original time for display
let interval = null;
let paused = false;
let score = 0;
let maxScore = 1000; // Always 1000 points total
let passScore = 750; // Always 750 points to pass (75%)
let pointsPerQuestion = 20; // Will be recalculated based on question count
let questionCount = 50; // Default question count
let timeLimit = 100; // Default time limit in minutes
let availableQuizSets = {}; // Store available quiz sets
let selectedQuizSet = null; // Will be set to the default from config

// Load quiz configuration and available sets
async function loadAvailableQuizSets() {
  try {
    // Try to load quiz configuration file
    const configResponse = await fetch('assets/data/quiz-config.json');
    if (configResponse.ok) {
      const config = await configResponse.json();
      availableQuizSets = config['quiz-sets'];
      
      // Find the default quiz set
      for (const [filename, quizConfig] of Object.entries(availableQuizSets)) {
        if (quizConfig.default === true) {
          selectedQuizSet = filename;
          break;
        }
      }
      
      // If no default found, use the first available quiz set
      if (!selectedQuizSet && Object.keys(availableQuizSets).length > 0) {
        selectedQuizSet = Object.keys(availableQuizSets)[0];
      }
    } else {
      // Fallback: auto-detect quiz files
      await autoDetectQuizSets();
    }
    
    // Populate the question set dropdown
    populateQuestionSetDropdown();
    
    // Load the default quiz set
    await loadQuestionSet(selectedQuizSet);
    
  } catch (error) {
    console.error('Error loading quiz configuration:', error);
    // Fallback: try to load master quiz
    await loadQuestionSet('quiz-config.json');
  }
}

async function autoDetectQuizSets() {
  // Try to detect common quiz file names
  const commonNames = ['quiz1.json', 'quiz2.json', 'quiz3.json', 'quiz4.json', 'quiz5.json'];
  availableQuizSets = {};
  
  for (let i = 0; i < commonNames.length; i++) {
    try {
      const response = await fetch(`assets/data/${commonNames[i]}`, { method: 'HEAD' });
      if (response.ok) {
        const setLetter = String.fromCharCode(65 + i); // A, B, C, D, E
        availableQuizSets[commonNames[i]] = {
          name: `Question Set ${setLetter}`,
          description: `AWS practice questions - Set ${setLetter}`,
          difficulty: 'Mixed'
        };
      }
    } catch (error) {
      // File doesn't exist, skip it
    }
  }
}

function populateQuestionSetDropdown() {
  const dropdown = document.getElementById('questionSet');
  dropdown.innerHTML = '';
  
  if (Object.keys(availableQuizSets).length === 0) {
    dropdown.innerHTML = '<option value="">No quiz sets found</option>';
    return;
  }
  
  // Add options for each available quiz set
  Object.entries(availableQuizSets).forEach(([filename, config]) => {
    const option = document.createElement('option');
    option.value = filename;
    option.textContent = config.name;
    if (filename === selectedQuizSet) {
      option.selected = true;
    }
    dropdown.appendChild(option);
  });
  
  // Add event listener for set selection change
  dropdown.addEventListener('change', onQuestionSetChange);
  
  // Update description for initial selection
  updateSetDescription();
}

async function onQuestionSetChange(event) {
  const newSet = event.target.value;
  if (newSet && newSet !== selectedQuizSet) {
    selectedQuizSet = newSet;
    updateSetDescription();
    await loadQuestionSet(selectedQuizSet);
  }
}

function updateSetDescription() {
  const descDiv = document.getElementById('setDescription');
  if (availableQuizSets[selectedQuizSet]) {
    const config = availableQuizSets[selectedQuizSet];
    descDiv.innerHTML = `
      <div class="alert alert-light border">
        <div class="row">
          <div class="col-md-8">
            <strong>${config.name}</strong><br>
            <small class="text-muted">${config.description}</small>
          </div>
          <div class="col-md-4 text-end">
            <span class="badge bg-primary">${config.difficulty}</span><br>
            <small class="text-muted">${questions.length} questions available</small>
          </div>
        </div>
      </div>
    `;
  } else {
    descDiv.innerHTML = '';
  }
}

async function loadQuestionSet(filename) {
  try {
    const response = await fetch(`assets/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    questions = await response.json();
    
    // Update question count dropdown
    updateQuestionCountOptions();
    
    // Update set description with actual question count
    updateSetDescription();
    
    console.log(`Loaded ${questions.length} questions from ${filename}`);
  } catch (error) {
    console.error('Error loading question set:', error);
    document.getElementById('quizSetup').innerHTML = `
      <div class="alert alert-danger error-message" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle-fill me-2"></i>Error Loading Quiz</h4>
        <p><strong>File Error:</strong> Cannot load ${filename}.</p>
        <hr>
        <h5><i class="bi bi-tools me-2"></i>Solutions:</h5>
        <ol class="mb-0">
          <li><strong>Use Local Server (Recommended):</strong>
            <ul class="mt-2">
              <li>Double-click <code class="text-primary">start_quiz_server.bat</code> to start server</li>
              <li>Or run: <code class="text-primary">python -m http.server 8080</code> in the quiz folder</li>
              <li>Then open: <a href="http://localhost:8080" target="_blank" class="alert-link">http://localhost:8080</a></li>
            </ul>
          </li>
          <li class="mt-2"><strong>Check Files:</strong> Ensure ${filename} exists in assets/data/ folder</li>
        </ol>
      </div>
    `;
  }
}

function updateQuestionCountOptions() {
  const dropdown = document.getElementById('questionCount');
  const currentValue = dropdown.value;
  
  // Update the "All Questions" option to show actual count
  const allOption = dropdown.querySelector('option[value="all"]');
  if (allOption) {
    allOption.textContent = `All Questions (${questions.length})`;
  }
  
  // Restore previous selection if still valid
  dropdown.value = currentValue;
}

// Function to ensure proper UI state on page load
function initializeUIState() {
  // Make sure manage button is visible on setup screen
  const manageBtn = document.getElementById('manageQuizBtn');
  if (manageBtn) {
    manageBtn.style.display = 'inline-block';
  }
  
  // Make sure quiz setup is visible and quiz content is hidden
  const quizSetup = document.getElementById('quizSetup');
  const quizContent = document.getElementById('quizContent');
  if (quizSetup) quizSetup.style.display = 'block';
  if (quizContent) quizContent.style.display = 'none';
}

// Initialize the application
initializeUIState();
loadAvailableQuizSets();

function startQuizWithConfig() {
  // Get configuration values
  const questionSetSelect = document.getElementById('questionSet');
  const questionCountSelect = document.getElementById('questionCount');
  const timeLimitSelect = document.getElementById('timeLimit');
  
  // Validate question set selection
  if (!questionSetSelect.value) {
    alert('Please select a question set first.');
    return;
  }
  
  // Check if we need to reload questions for the selected set
  if (questionSetSelect.value !== selectedQuizSet) {
    selectedQuizSet = questionSetSelect.value;
    // Need to reload the question set - make this async
    loadQuestionSet(selectedQuizSet).then(() => {
      continueStartQuiz(questionCountSelect, timeLimitSelect);
    }).catch(error => {
      console.error('Error loading question set:', error);
      alert('Error loading the selected quiz set. Please try again.');
    });
    return;
  }
  
  continueStartQuiz(questionCountSelect, timeLimitSelect);
}

function continueStartQuiz(questionCountSelect, timeLimitSelect) {
  // Validate that questions are loaded
  if (!Array.isArray(questions) || questions.length === 0) {
    alert('Error: Quiz questions are not loaded properly. Please refresh the page and try again.');
    return;
  }
  
  questionCount = questionCountSelect.value === 'all' ? questions.length : parseInt(questionCountSelect.value);
  timeLimit = timeLimitSelect.value === 'unlimited' ? 0 : parseInt(timeLimitSelect.value);
  
  // Validate we have enough questions
  if (questionCount > questions.length) {
    questionCount = questions.length;
  }
  
  // Set timer based on selection
  if (timeLimit > 0) {
    timer = timeLimit * 60; // Convert minutes to seconds
    originalTimer = timer;
  } else {
    timer = 0; // Unlimited time
    originalTimer = 0;
  }
  
  // Update scoring based on question count
  maxScore = 1000; // Always 1000 points total
  passScore = 750; // Always 750 points to pass (75%)
  pointsPerQuestion = Math.floor(maxScore / questionCount); // Adjust points per question
  
  // Hide setup screen and manage button, show quiz
  document.getElementById('quizSetup').style.display = 'none';
  document.getElementById('manageQuizBtn').style.display = 'none';
  document.getElementById('quizContent').style.display = 'block';
  
  startQuiz();
}

function startQuiz() {
  // Validate that questions is an array
  if (!Array.isArray(questions) || questions.length === 0) {
    console.error('Questions not loaded properly. questions:', questions);
    alert('Error: Quiz questions are not loaded properly. Please refresh the page and try again.');
    return;
  }
  
  // Randomly select the specified number of questions
  selectedQuestions = questions.sort(() => Math.random() - 0.5).slice(0, questionCount);
  current = 0;
  answers = [];
  score = 0;
  showQuestion();
  if (timeLimit > 0) {
    startTimer();
  }
}

function startTimer() {
  interval = setInterval(() => {
    if (!paused) {
      timer--;
      updateTimer();
      if (timer <= 0) {
        clearInterval(interval);
        submitAll();
      }
    }
  }, 1000);
  updateTimer();
}

function updateTimer() {
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    if (timeLimit > 0) {
      let min = Math.floor(timer / 60);
      let sec = timer % 60;
      timerElement.textContent = `Time left: ${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    } else {
      timerElement.textContent = 'Unlimited Time';
    }
  }
}

function showQuestion() {
  let q = selectedQuestions[current];
  let quizDiv = document.getElementById('quiz');
  let controlsDiv = document.getElementById('controls');
  let pauseResumeDiv = document.getElementById('pauseResumeContainer');
  let resultDiv = document.getElementById('result');
  let reviewDiv = document.getElementById('review');
  
  // Clear content divs
  quizDiv.innerHTML = '';
  controlsDiv.innerHTML = '';
  
  // Only clear result/review if not all questions answered
  if (current < selectedQuestions.length) {
    resultDiv.innerHTML = '';
    reviewDiv.innerHTML = '';
  }
  if (!q) return;
  
  // Only set up the pauseResumeContainer once, or if it's empty
  if (!pauseResumeDiv.innerHTML || !pauseResumeDiv.querySelector('#timer')) {
    let progress = ((current) / selectedQuestions.length) * 100;
    let timerDisplay = timeLimit > 0 ? 'Time left: --:--' : 'Unlimited Time';
    let pauseButtonHtml = timeLimit > 0 ? `
      <button class="btn btn-warning btn-pause" id="pauseResumeBtn" onclick="togglePauseResume()">
        <i class="bi bi-pause-fill me-1"></i>Pause
      </button>
    ` : '';
    
    let progressHtml = `
      <div class="progress-indicator">
        <div class="progress-bar-custom" style="width: ${progress}%"></div>
      </div>
      <div class="text-center mb-3">
        <small class="text-muted">Question ${current + 1} of ${selectedQuestions.length}</small>
      </div>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div id="timer" class="badge ${timeLimit > 0 ? 'bg-secondary' : 'bg-success'} fs-6">${timerDisplay}</div>
        ${pauseButtonHtml}
      </div>
    `;
    pauseResumeDiv.innerHTML = progressHtml;
  } else {
    // Just update the progress bar and question counter
    let progress = ((current) / selectedQuestions.length) * 100;
    const progressBar = pauseResumeDiv.querySelector('.progress-bar-custom');
    const questionCounter = pauseResumeDiv.querySelector('.text-muted');
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (questionCounter) questionCounter.textContent = `Question ${current + 1} of ${selectedQuestions.length}`;
  }
  
  // Show question with multiple choice indicator
  let questionText = `
    <div class="question">
      <span class="question-number">Q${current+1}:</span> ${q.question}
      ${q.multiple ? '<span class="multiple-choice-indicator"><i class="bi bi-check2-square me-1"></i>Multiple Answers</span>' : ''}
    </div>
  `;
  quizDiv.innerHTML = questionText;
  
  let opts = '<div class="options">';
  q.options.forEach((opt, i) => {
    let type = q.multiple ? 'checkbox' : 'radio';
    let letter = String.fromCharCode(65 + i); // A, B, C, D, E
    opts += `
      <label class="option" for="option_${i}">
        <input type="${type}" name="option" value="${i}" id="option_${i}"> 
        <span class="option-letter">${letter}</span>
        ${opt}
      </label>
    `;
  });
  opts += '</div>';
  quizDiv.innerHTML += opts;
  controlsDiv.innerHTML = `
    <div class="d-flex gap-2 justify-content-center">
      <button class="btn btn-primary btn-custom" onclick="submitAnswer()">
        <i class="bi bi-check-circle me-2"></i>Submit Answer
      </button>
      <button class="btn btn-outline-secondary btn-custom" onclick="skipQuestion()">
        <i class="bi bi-skip-forward me-2"></i>Skip Question
      </button>
    </div>
  `;
}

function submitAnswer() {
  let q = selectedQuestions[current];
  let selected = [];
  let inputs = document.querySelectorAll('input[name="option"]:checked');
  inputs.forEach(input => selected.push(Number(input.value)));
  
  // Remove any existing alerts first
  const existingAlerts = document.querySelectorAll('.alert');
  existingAlerts.forEach(alert => alert.remove());
  
  // Validation - ensure answer is provided
  if (selected.length === 0) {
    // Bootstrap alert
    const alertHtml = `
      <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Please select at least one answer before submitting.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    document.getElementById('controls').insertAdjacentHTML('beforebegin', alertHtml);
    return;
  }
  
  // For multiple choice, warn if they might have missed some answers
  if (q.multiple && selected.length === 1 && q.correctAnswers.length > 1) {
    const alertHtml = `
      <div class="alert alert-info alert-dismissible fade show" role="alert">
        <i class="bi bi-info-circle me-2"></i>
        This question requires multiple answers. You've only selected one. Please select all correct answers or click Submit again to continue.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    document.getElementById('controls').insertAdjacentHTML('beforebegin', alertHtml);
    return;
  }
  
  answers[current] = selected;
  current++;
  if (current < selectedQuestions.length) {
    showQuestion();
  } else {
    clearInterval(interval);
    submitAll();
  }
}

function skipQuestion() {
  // Remove any existing alerts
  const existingAlerts = document.querySelectorAll('.alert');
  existingAlerts.forEach(alert => alert.remove());
  
  // Record as skipped (empty array)
  answers[current] = [];
  current++;
  if (current < selectedQuestions.length) {
    showQuestion();
  } else {
    clearInterval(interval);
    submitAll();
  }
}

function togglePauseResume() {
  paused = !paused;
  const btn = document.getElementById('pauseResumeBtn');
  if (paused) {
    btn.innerHTML = '<i class="bi bi-play-fill me-1"></i>Resume';
    btn.classList.remove('btn-warning', 'btn-pause');
    btn.classList.add('btn-success', 'btn-resume');
  } else {
    btn.innerHTML = '<i class="bi bi-pause-fill me-1"></i>Pause';
    btn.classList.remove('btn-success', 'btn-resume');
    btn.classList.add('btn-warning', 'btn-pause');
  }
}

function submitAll() {
  let correct = 0;
  let skipped = 0;
  for (let i = 0; i < selectedQuestions.length; i++) {
    let q = selectedQuestions[i];
    let userAns = answers[i] || [];
    if (userAns.length === 0) {
      skipped++;
    } else {
      let correctAns = q.correctAnswers;
      // Compare arrays - both length and content must match
      let isRight = userAns.length === correctAns.length && 
                   userAns.sort().every((val, idx) => val === correctAns.sort()[idx]);
      if (isRight) correct++;
    }
  }
  score = correct * pointsPerQuestion;
  let passed = score >= passScore;
  let percentage = Math.round((correct / selectedQuestions.length) * 100);
  let attempted = selectedQuestions.length - skipped;
  
  let resultClass = passed ? 'success' : 'fail';
  let resultIcon = passed ? 'bi-trophy-fill' : 'bi-x-circle-fill';
  let resultText = passed ? 'PASSED' : 'FAILED';
  
  document.getElementById('result').innerHTML = `
    <div class="score ${resultClass} text-center">
      <i class="${resultIcon}" style="font-size: 2rem; margin-bottom: 15px;"></i>
      <h3>Quiz Complete!</h3>
      <div class="row mt-3">
        <div class="col-md-2">
          <div class="fw-bold">Correct</div>
          <div class="fs-4">${correct}/${selectedQuestions.length}</div>
        </div>
        <div class="col-md-2">
          <div class="fw-bold">Attempted</div>
          <div class="fs-4">${attempted}/${selectedQuestions.length}</div>
        </div>
        <div class="col-md-2">
          <div class="fw-bold">Skipped</div>
          <div class="fs-4 ${skipped > 0 ? 'text-warning' : ''}">${skipped}</div>
        </div>
        <div class="col-md-2">
          <div class="fw-bold">Percentage</div>
          <div class="fs-4">${percentage}%</div>
        </div>
        <div class="col-md-2">
          <div class="fw-bold">Score</div>
          <div class="fs-4">${score}/${maxScore}</div>
        </div>
        <div class="col-md-2">
          <div class="fw-bold">Result</div>
          <div class="fs-4">${resultText}</div>
        </div>
      </div>
      ${passed ? '<div class="mt-3"><i class="bi bi-emoji-smile"></i> Congratulations!</div>' : '<div class="mt-3"><i class="bi bi-emoji-frown"></i> Keep practicing!</div>'}
    </div>`;
  showReview();
}

function showReview() {
  let reviewDiv = document.getElementById('review');
  let html = '<div class="mt-4"><h2 class="text-center mb-4"><i class="bi bi-clipboard-check me-2"></i>Answer Review</h2>';
  
  for (let i = 0; i < selectedQuestions.length; i++) {
    let q = selectedQuestions[i];
    let userAns = answers[i] || [];
    let correctAns = q.correctAnswers;
    let isRight = userAns.length === correctAns.length && 
                 userAns.sort().every((val, idx) => val === correctAns.sort()[idx]);
    
    // Convert indices to letters for display
    let userLetters = userAns.map(idx => String.fromCharCode(65 + idx)).sort();
    let correctLetters = correctAns.map(idx => String.fromCharCode(65 + idx)).sort();
    
    html += `<div class="review-item ${isRight ? 'correct' : 'incorrect'}">`;
    html += `<div class="review-header">
      <strong>Q${i+1}:</strong> ${q.question}
    </div>`;
    
    html += '<div class="review-options">';
    // Show options with indicators
    q.options.forEach((opt, idx) => {
      let letter = String.fromCharCode(65 + idx);
      let userSel = userAns.includes(idx);
      let correctSel = correctAns.includes(idx);
      let optionClass = '';
      let icon = '';
      
      if (userSel && correctSel) {
        optionClass = 'review-option user-correct';
        icon = '<i class="bi bi-check-circle-fill text-success me-2"></i>';
      } else if (userSel && !correctSel) {
        optionClass = 'review-option user-incorrect';
        icon = '<i class="bi bi-x-circle-fill text-danger me-2"></i>';
      } else if (!userSel && correctSel) {
        optionClass = 'review-option missed-correct';
        icon = '<i class="bi bi-star-fill text-warning me-2"></i>';
      } else {
        optionClass = 'review-option';
        icon = '<i class="bi bi-circle me-2 text-muted"></i>';
      }
      
      html += `<div class="${optionClass}">
        ${icon}<strong>${letter}.</strong> ${opt}
      </div>`;
    });
    
    html += `<div class="review-summary">
      <div class="row">
        <div class="col-md-6">
          <strong>Your answer(s):</strong> 
          <span class="badge ${userLetters.length > 0 ? 'bg-secondary' : 'bg-warning'}">${userLetters.length > 0 ? userLetters.join(', ') : 'Skipped'}</span>
        </div>
        <div class="col-md-6">
          <strong>Correct answer(s):</strong> 
          <span class="badge bg-success">${correctLetters.join(', ')}</span>
        </div>
      </div>
      <div class="mt-2">
        ${isRight ? 
          '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Correct</span>' : 
          '<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>Incorrect</span>'
        }
      </div>
    </div>`;
    
    html += '</div></div>';
  }
  
  html += `<div class="text-center mt-4">
    <button class="btn btn-primary btn-custom" onclick="location.reload()">
      <i class="bi bi-arrow-clockwise me-2"></i>Take Quiz Again
    </button>
  </div></div>`;
  
  reviewDiv.innerHTML = html;
}

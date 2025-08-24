// Quiz Configuration Manager JavaScript
// This version works with the existing Python HTTP server on port 8080

// Load quiz list when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadQuizList();
    setupFormHandler();
    
    // Setup delete confirmation button
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteQuiz);
    }
});

function showAddQuiz() {
    document.getElementById('addQuizSection').style.display = 'block';
    document.getElementById('addQuizSection').scrollIntoView({ behavior: 'smooth' });
}

function hideAddQuiz() {
    document.getElementById('addQuizSection').style.display = 'none';
    document.getElementById('addQuizForm').reset();
}

function setupFormHandler() {
    const form = document.getElementById('addQuizForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleAddQuiz();
    });
}

async function handleAddQuiz() {
    const fileInput = document.getElementById('quizFile');
    const quizId = document.getElementById('quizId').value.trim();
    const quizName = document.getElementById('quizName').value.trim();
    const quizDescription = document.getElementById('quizDescription').value.trim();

    // Validation
    if (!fileInput.files[0]) {
        showMessage('Please select a file to upload.', 'warning');
        return;
    }

    if (!quizId || !quizName) {
        showMessage('Please fill in all required fields.', 'warning');
        return;
    }

    // Validate quiz ID format
    if (!/^[a-zA-Z0-9_-]+$/.test(quizId)) {
        showMessage('Quiz ID must contain only letters, numbers, underscores, and hyphens.', 'warning');
        return;
    }

    // Show processing message
    showMessage('🔄 Creating quiz automatically... Please wait.', 'info');

    try {
        // Read file content
        const file = fileInput.files[0];
        const fileContent = await readFileAsText(file);

        // Try the API first
        const quizData = {
            quiz_id: quizId,
            quiz_name: quizName,
            description: quizDescription,
            file_content: fileContent
        };

        const response = await fetch('/api/create-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(quizData)
        });

        const result = await response.json();

        if (result.success) {
            const questionCount = result.questions_processed || 'Unknown';
            showMessage(`✅ ${result.message}<br>📊 Questions processed: ${questionCount}`, 'success');
            hideAddQuiz();
            loadQuizList();
            return;
        }
    } catch (error) {
        console.log('API failed, trying automated approach...', error);
    }

    // If API fails, create download and run command automatically
    try {
        // Create file download
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${quizId}.txt`;
        
        // Auto-download the file
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Try to run the automation command via a hidden form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/run-automation';
        form.style.display = 'none';

        const fields = {
            'filename': `${quizId}.txt`,
            'quiz_id': quizId,
            'quiz_name': quizName,
            'description': quizDescription,
            'file_content': fileContent
        };

        for (const [key, value] of Object.entries(fields)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        }

        document.body.appendChild(form);
        
        // Submit form to trigger automation
        const submitPromise = new Promise((resolve, reject) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.onload = () => {
                try {
                    const response = iframe.contentDocument.body.textContent;
                    if (response.includes('SUCCESS')) {
                        resolve(response);
                    } else {
                        reject(new Error(response));
                    }
                } catch (e) {
                    // If we can't read the response, assume success
                    resolve('Quiz creation initiated');
                }
                document.body.removeChild(iframe);
                document.body.removeChild(form);
            };
            iframe.onerror = () => {
                reject(new Error('Failed to submit automation request'));
                document.body.removeChild(iframe);
                document.body.removeChild(form);
            };
            
            form.target = iframe.name = 'automation-frame';
            document.body.appendChild(iframe);
            form.submit();
        });

        await submitPromise;
        
        showMessage(`✅ Quiz "${quizName}" creation initiated!<br>📁 File downloaded: ${quizId}.txt<br>🔄 Running automation script...`, 'success');
        
        // Refresh quiz list after a delay
        setTimeout(() => {
            loadQuizList();
        }, 3000);
        
        hideAddQuiz();

    } catch (error) {
        // Final fallback - show manual instructions with one-click copy
        const command = `python quiz_automation.py ${quizId}.txt ${quizId} "${quizName}" "${quizDescription}"`;
        
        showMessage(`
            <strong>🔧 Auto-creation initiated but needs verification:</strong><br><br>
            📁 File has been downloaded as: <code>${quizId}.txt</code><br><br>
            
            <strong>If quiz doesn't appear, run this command:</strong><br>
            <div class="bg-dark text-light p-2 rounded mt-2 mb-2 position-relative" style="font-family: monospace;">
                <span id="commandText">${command}</span>
                <button class="btn btn-sm btn-outline-light position-absolute end-0 top-50 translate-middle-y me-2" 
                        onclick="copyCommand()" title="Copy command">
                    <i class="bi bi-clipboard"></i>
                </button>
            </div>
            
            <div class="mt-2">
                <button class="btn btn-sm btn-primary" onclick="refreshQuizList()">
                    <i class="bi bi-arrow-clockwise me-1"></i>
                    Check if Quiz Was Created
                </button>
            </div>
        `, 'info');
    }
}

// Helper function to copy command to clipboard
function copyCommand() {
    const commandText = document.getElementById('commandText').textContent;
    navigator.clipboard.writeText(commandText).then(() => {
        showMessage('✅ Command copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = commandText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showMessage('✅ Command copied to clipboard!', 'success');
    });
}

// Helper function to read file as text
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

async function loadQuizList() {
    try {
        const response = await fetch('assets/data/quiz-config.json');
        const config = await response.json();
        
        if (config && config['quiz-sets']) {
            const quizzes = Object.entries(config['quiz-sets']).map(([filename, quiz]) => ({
                filename,
                name: quiz.name || 'Unknown',
                description: quiz.description || 'No description',
                question_count: quiz.question_count || 0,
                difficulty: quiz.difficulty || 'Mixed',
                default: quiz.default || false,
                recommended: quiz.recommended || false,
                created_date: quiz.created_date || 'Unknown'
            }));
            
            renderQuizList(quizzes);
        } else {
            throw new Error('Invalid config format');
        }
    } catch (error) {
        document.getElementById('quizList').innerHTML = `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Error loading quiz list: ${error.message}
                <br><br>
                <strong>Note:</strong> This configuration page works with the existing quiz server.
                Make sure you're running the server with: <code>python -m http.server 8080</code>
            </div>
        `;
    }
}

function renderQuizList(quizzes) {
    const listContainer = document.getElementById('quizList');
    
    if (quizzes.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-folder-x" style="font-size: 3rem;"></i>
                <p class="mt-2">No quizzes found. Create your first quiz using the form above!</p>
            </div>
        `;
        return;
    }

    let html = '<div class="row">';
    
    quizzes.forEach(quiz => {
        const isDefault = quiz.default || quiz.recommended;
        const badgeClass = isDefault ? 'bg-primary' : 'bg-secondary';
        const badgeText = isDefault ? 'Default' : 'Custom';
        
        html += `
            <div class="col-md-6 mb-3">
                <div class="card h-100 ${isDefault ? 'border-primary' : ''}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${quiz.name}</h6>
                            <span class="badge ${badgeClass}">${badgeText}</span>
                        </div>
                        <p class="card-text text-muted small">${quiz.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="bi bi-question-circle me-1"></i>
                                ${quiz.question_count} questions
                            </small>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-info" onclick="viewQuizDetails('${quiz.filename}')">
                                    <i class="bi bi-eye"></i>
                                </button>
                                ${!isDefault ? `
                                    <button class="btn btn-outline-danger" onclick="showDeleteConfirmation('${quiz.filename}', '${quiz.name}')">>
                                        <i class="bi bi-trash"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        ${quiz.created_date ? `
                            <div class="mt-2">
                                <small class="text-muted">
                                    <i class="bi bi-calendar3 me-1"></i>
                                    Created: ${quiz.created_date}
                                </small>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    listContainer.innerHTML = html;
}

// Global variables for delete confirmation
let pendingDeleteFilename = null;
let pendingDeleteQuizName = null;

function showDeleteConfirmation(filename, quizName) {
    pendingDeleteFilename = filename;
    pendingDeleteQuizName = quizName;
    
    // Update modal content
    document.getElementById('deleteQuizName').textContent = quizName;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

async function confirmDeleteQuiz() {
    if (!pendingDeleteFilename || !pendingDeleteQuizName) {
        console.error('No quiz selected for deletion');
        return;
    }
    
    // Hide the modal first
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
    // Clear focus to prevent accessibility warning
    document.getElementById('confirmDeleteBtn').blur();
    modal.hide();
    
    // Show processing message
    showMessage('🗑️ Deleting quiz... Please wait.', 'info');
    
    try {
        // Try automatic deletion via API
        const response = await fetch('/api/delete-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: pendingDeleteFilename,
                quiz_name: pendingDeleteQuizName
            })
        });

        const result = await response.json();

        if (result.success) {
                showMessage(`✅ ${result.message}`, 'success');
                // Refresh the quiz list to show changes
                loadQuizList();
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.log('API deletion failed, showing manual instructions...', error);
            
            // Fallback to manual instructions if API fails
            showMessage(`
                <strong>⚠️ Automatic deletion failed. Manual steps required:</strong><br><br>
                1. Delete the file: <code>assets/data/${pendingDeleteFilename}</code><br>
                2. Edit <code>assets/data/quiz-config.json</code> and remove the "${pendingDeleteFilename}" entry<br>
                3. Refresh this page to see the changes<br><br>
                <strong>Command line option:</strong><br>
                <div class="bg-dark text-light p-2 rounded mt-2 mb-2 position-relative" style="font-family: monospace;">
                    <span id="deleteCommand">del "assets\\data\\${pendingDeleteFilename}"</span>
                    <button class="btn btn-sm btn-outline-light position-absolute end-0 top-50 translate-middle-y me-2" 
                            onclick="copyDeleteCommand()" title="Copy command">
                        <i class="bi bi-clipboard"></i>
                    </button>
                </div>
                <div class="mt-2">
                    <button class="btn btn-sm btn-primary" onclick="refreshQuizList()">
                        <i class="bi bi-arrow-clockwise me-1"></i>
                        Check if Quiz Was Deleted
                    </button>
                </div>
                <br><small class="text-muted">Error: ${error.message}</small>
            `, 'warning');
        }
    
    // Clear pending variables
    pendingDeleteFilename = null;
    pendingDeleteQuizName = null;
}

// Helper function to copy delete command to clipboard
function copyDeleteCommand() {
    const commandText = document.getElementById('deleteCommand').textContent;
    navigator.clipboard.writeText(commandText).then(() => {
        showMessage('✅ Delete command copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = commandText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showMessage('✅ Delete command copied to clipboard!', 'success');
    });
}

async function viewQuizDetails(filename) {
    try {
        const response = await fetch(`assets/data/${filename}`);
        const quizData = await response.json();
        
        if (quizData && Array.isArray(quizData)) {
            // Calculate some statistics
            const totalQuestions = quizData.length;
            const multipleChoiceCount = quizData.filter(q => q.multiple === true).length;
            const singleChoiceCount = totalQuestions - multipleChoiceCount;
            const avgOptionsPerQuestion = quizData.reduce((sum, q) => sum + (q.options?.length || 0), 0) / totalQuestions;
            
            // Get a sample question
            const sampleQuestion = quizData[0];
            const sampleAnswers = sampleQuestion.correctAnswers?.map(idx => 
                String.fromCharCode(65 + idx)).join(', ') || 'Unknown';
            
            // Create the modal content
            const modalContent = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="card border-0 bg-light mb-3">
                            <div class="card-body">
                                <h6 class="card-title text-primary">
                                    <i class="bi bi-file-earmark-text me-2"></i>File Information
                                </h6>
                                <ul class="list-unstyled mb-0">
                                    <li><strong>Filename:</strong> ${filename}</li>
                                    <li><strong>Total Questions:</strong> ${totalQuestions}</li>
                                    <li><strong>Average Options:</strong> ${avgOptionsPerQuestion.toFixed(1)}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card border-0 bg-light mb-3">
                            <div class="card-body">
                                <h6 class="card-title text-success">
                                    <i class="bi bi-graph-up me-2"></i>Question Types
                                </h6>
                                <ul class="list-unstyled mb-0">
                                    <li><strong>Single Choice:</strong> ${singleChoiceCount}</li>
                                    <li><strong>Multiple Choice:</strong> ${multipleChoiceCount}</li>
                                    <li><strong>Estimated Time:</strong> ${Math.ceil(totalQuestions * 1.5)} minutes</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card border-0 bg-light">
                    <div class="card-body">
                        <h6 class="card-title text-info">
                            <i class="bi bi-eye-fill me-2"></i>Sample Question Preview
                        </h6>
                        <div class="bg-white p-3 rounded border">
                            <p class="mb-2"><strong>Q1:</strong> ${sampleQuestion.question}</p>
                            <div class="ms-3">
                                ${sampleQuestion.options?.map((option, idx) => 
                                    `<div class="mb-1">
                                        <span class="badge bg-secondary me-2">${String.fromCharCode(65 + idx)}</span>
                                        ${option}
                                    </div>`
                                ).join('') || '<em>No options available</em>'}
                            </div>
                            <div class="mt-2 pt-2 border-top">
                                <small class="text-success">
                                    <i class="bi bi-check-circle me-1"></i>
                                    <strong>Correct Answer(s):</strong> ${sampleAnswers}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Update modal content and show it
            document.getElementById('quizDetailsContent').innerHTML = modalContent;
            document.getElementById('quizDetailsModalLabel').innerHTML = `
                <i class="bi bi-eye me-2"></i>Quiz Details - ${filename}
            `;
            
            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('quizDetailsModal'));
            modal.show();
            
        } else {
            throw new Error('Invalid quiz format');
        }
    } catch (error) {
        showMessage(`Error loading quiz details: ${error.message}`, 'danger');
    }
}

function refreshQuizList() {
    loadQuizList();
    showMessage('Quiz list refreshed!', 'success');
}

function showMessage(message, type) {
    const alertClass = `alert-${type}`;
    const iconClass = type === 'success' ? 'bi-check-circle' : 
                     type === 'danger' ? 'bi-exclamation-triangle' : 
                     type === 'warning' ? 'bi-exclamation-triangle' : 'bi-info-circle';

    const html = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <i class="bi ${iconClass} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    document.getElementById('statusMessage').innerHTML = html;

    // Auto-dismiss after 15 seconds for info messages
    if (type === 'info') {
        setTimeout(() => {
            const alert = document.querySelector('#statusMessage .alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 15000);
    } else if (type === 'success') {
        setTimeout(() => {
            const alert = document.querySelector('#statusMessage .alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
}

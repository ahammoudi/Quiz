#!/usr/bin/env python3
"""
Final Working Server - Handles all encoding issues
"""

import os
import sys
import json
import subprocess
import urllib.parse
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
import mimetypes

class FinalWorkingHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        print(f"GET request: {self.path}")
        
        # Handle root and config with query parameters
        if self.path == '/' or self.path.startswith('/?'):
            file_path = 'index.html'
        elif self.path == '/config' or self.path.startswith('/config?'):
            file_path = 'config.html'
        else:
            # Remove query parameters
            clean_path = self.path.split('?')[0]
            file_path = clean_path.lstrip('/')
        
        try:
            if os.path.isfile(file_path):
                self.send_response(200)
                
                # Determine content type
                content_type, _ = mimetypes.guess_type(file_path)
                if content_type:
                    self.send_header('Content-type', content_type)
                else:
                    self.send_header('Content-type', 'text/plain')
                
                self.end_headers()
                
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
                    
                print(f"✅ Served: {file_path}")
            else:
                print(f"❌ File not found: {file_path}")
                self.send_response(404)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(b'<h1>404 - File Not Found</h1>')
                
        except Exception as e:
            print(f"❌ Error serving {file_path}: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(f'<h1>500 - Server Error</h1><p>{str(e)}</p>'.encode())

    def do_POST(self):
        """Handle POST requests"""
        print(f"📨 POST request: {self.path}")
        
        try:
            if self.path == '/api/create-quiz':
                self.handle_create_quiz()
            elif self.path == '/api/delete-quiz':
                self.handle_delete_quiz()
            else:
                print(f"❌ Unknown POST endpoint: {self.path}")
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {'success': False, 'error': f'Unknown endpoint: {self.path}'}
                self.wfile.write(json.dumps(response).encode())
                
        except Exception as e:
            print(f"❌ POST error: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {'success': False, 'error': f'Server error: {str(e)}'}
            self.wfile.write(json.dumps(response).encode())

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        print("🔄 OPTIONS request (CORS preflight)")
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def handle_create_quiz(self):
        """Handle quiz creation API"""
        try:
            print("🔄 Processing quiz creation...")
            
            # Read JSON data
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                raise ValueError("No data received")
                
            post_data = self.rfile.read(content_length)
            print(f"📦 Received {content_length} bytes of data")
            
            # Parse JSON
            try:
                data = json.loads(post_data.decode('utf-8'))
                print("✅ JSON parsed successfully")
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON: {e}")
            
            # Extract fields
            quiz_id = data.get('quiz_id', '').strip()
            quiz_name = data.get('quiz_name', '').strip()
            description = data.get('description', '').strip()
            file_content = data.get('file_content', '').strip()
            
            print(f"📋 Quiz ID: {quiz_id}")
            print(f"📋 Quiz Name: {quiz_name}")
            print(f"📄 Content length: {len(file_content)} characters")
            
            # Validate
            if not all([quiz_id, quiz_name, file_content]):
                missing = []
                if not quiz_id: missing.append('quiz_id')
                if not quiz_name: missing.append('quiz_name')
                if not file_content: missing.append('file_content')
                raise ValueError(f"Missing required fields: {', '.join(missing)}")
            
            # Save file with proper encoding
            filename = f"{quiz_id}.txt"
            print(f"💾 Saving file: {filename}")
            
            # Write file with UTF-8 encoding, no BOM
            with open(filename, 'w', encoding='utf-8', newline='\n') as f:
                f.write(file_content)
            print(f"✅ File saved: {filename}")
            
            # Run automation with proper environment
            print(f"🔄 Running automation script...")
            
            # Set environment for UTF-8 support
            env = os.environ.copy()
            env['PYTHONIOENCODING'] = 'utf-8'
            
            # Run with batch file to handle encoding properly
            batch_content = f'''@echo off
chcp 65001 > nul
cd /d "{os.getcwd()}"
python quiz_automation.py "{filename}" "{quiz_id}" "{quiz_name}" "{description}"
'''
            
            batch_file = f"{quiz_id}_automation.bat"
            with open(batch_file, 'w', encoding='utf-8') as f:
                f.write(batch_content)
            
            try:
                result = subprocess.run(
                    [batch_file],
                    capture_output=True,
                    text=True,
                    timeout=30,
                    shell=True,
                    env=env,
                    encoding='utf-8',
                    errors='replace'
                )
                
                print(f"📤 Exit code: {result.returncode}")
                if result.stdout:
                    print(f"📤 Stdout: {result.stdout[:500]}...")  # Truncate long output
                if result.stderr:
                    print(f"⚠️  Stderr: {result.stderr[:500]}...")
                
                # Clean up files
                try:
                    os.remove(filename)
                    os.remove(batch_file)
                    print(f"🗑️  Cleaned up: {filename}, {batch_file}")
                except:
                    pass
                
                # Check if quiz was created successfully
                quiz_file = f"assets/data/quiz_{quiz_id}.json"  # Correct path where automation script saves
                if os.path.exists(quiz_file):
                    # Count questions
                    try:
                        with open(quiz_file, 'r', encoding='utf-8') as f:
                            quiz_data = json.load(f)
                            question_count = len(quiz_data.get('questions', []))
                        print(f"📊 Questions processed: {question_count}")
                        
                        response = {
                            'success': True,
                            'message': f'Quiz "{quiz_name}" created successfully!',
                            'questions_processed': question_count,
                            'output': f'Quiz created with {question_count} questions'
                        }
                        print("✅ Success response prepared")
                    except Exception as e:
                        print(f"⚠️  Error reading created quiz: {e}")
                        response = {
                            'success': True,
                            'message': f'Quiz "{quiz_name}" created successfully!',
                            'questions_processed': 0,
                            'output': 'Quiz file created but could not count questions'
                        }
                else:
                    # Quiz file not created, check error
                    error_msg = result.stderr or result.stdout or 'Unknown error - quiz file not created'
                    response = {
                        'success': False,
                        'error': f'Quiz creation failed: {error_msg}',
                        'returncode': result.returncode
                    }
                    print(f"❌ Error response prepared: {error_msg}")
                
            except subprocess.TimeoutExpired:
                print("⏱️  Process timed out")
                response = {'success': False, 'error': 'Quiz creation timed out (30 seconds)'}
                
            # Send response
            self.send_response(200 if response.get('success') else 500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response_json = json.dumps(response)
            self.wfile.write(response_json.encode())
            print(f"📡 Response sent: {len(response_json)} bytes")
            
        except Exception as e:
            print(f"❌ Exception in handle_create_quiz: {e}")
            response = {'success': False, 'error': str(e)}
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

    def handle_delete_quiz(self):
        """Handle quiz deletion API"""
        try:
            print("🗑️  Processing quiz deletion...")
            
            # Read JSON data
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                raise ValueError("No data received")
                
            post_data = self.rfile.read(content_length)
            print(f"📦 Received {content_length} bytes of data")
            
            # Parse JSON
            try:
                data = json.loads(post_data.decode('utf-8'))
                print("✅ JSON parsed successfully")
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON: {e}")
            
            # Extract filename
            filename = data.get('filename', '').strip()
            quiz_name = data.get('quiz_name', '').strip()
            
            print(f"🗑️  Deleting quiz: {filename}")
            print(f"📋 Quiz Name: {quiz_name}")
            
            # Validate
            if not filename:
                raise ValueError("Missing required field: filename")
            
            # Construct file paths
            quiz_file_path = os.path.join('assets', 'data', filename)
            config_file_path = os.path.join('assets', 'data', 'quiz-config.json')
            
            # Check if quiz file exists
            if not os.path.exists(quiz_file_path):
                raise ValueError(f"Quiz file not found: {quiz_file_path}")
            
            # Check if config file exists
            if not os.path.exists(config_file_path):
                raise ValueError(f"Config file not found: {config_file_path}")
            
            # Read and update config file
            print("📝 Updating configuration...")
            with open(config_file_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            # Remove quiz from config
            if 'quiz-sets' in config and filename in config['quiz-sets']:
                del config['quiz-sets'][filename]
                config['metadata']['total_quiz_sets'] = len(config['quiz-sets'])
                config['metadata']['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                print(f"✅ Removed {filename} from configuration")
            else:
                print(f"⚠️  Quiz {filename} not found in configuration")
            
            # Save updated config
            with open(config_file_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            print("✅ Configuration updated successfully")
            
            # Delete quiz file
            os.remove(quiz_file_path)
            print(f"✅ Deleted quiz file: {quiz_file_path}")
            
            # Prepare success response
            response = {
                'success': True,
                'message': f'Quiz "{quiz_name or filename}" deleted successfully!',
                'filename': filename
            }
            print("✅ Delete response prepared")
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response_json = json.dumps(response)
            self.wfile.write(response_json.encode())
            print(f"📡 Delete response sent: {len(response_json)} bytes")
            
        except Exception as e:
            print(f"❌ Exception in handle_delete_quiz: {e}")
            response = {'success': False, 'error': str(e)}
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

    def log_message(self, format, *args):
        """Custom logging"""
        print(f"🌐 [{self.address_string()}] {format % args}")

def main():
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    port = 8080
    server_address = ('', port)
    
    print("=" * 60)
    print("🚀 FINAL WORKING SERVER")
    print("=" * 60)
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"📡 Server: http://localhost:{port}")
    print(f"🏠 Quiz App: http://localhost:{port}")
    print(f"⚙️  Config Page: http://localhost:{port}/config")
    print(f"🔧 API Endpoint: http://localhost:{port}/api/create-quiz")
    print("=" * 60)
    print("✅ Features:")
    print("   • Complete encoding support for Windows")
    print("   • Batch file automation for proper UTF-8 handling")
    print("   • Robust error handling and validation")
    print("   • File cleanup and proper responses")
    print("=" * 60)
    
    try:
        httpd = HTTPServer(server_address, FinalWorkingHandler)
        print(f"🎯 Server running! Visit http://localhost:{port}/config")
        print("📋 All requests will be logged below:")
        print("-" * 60)
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")

if __name__ == '__main__':
    main()

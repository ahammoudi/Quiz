#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AWS Quiz Automation Script
Converts questions.txt to JSON format, validates it, and updates configuration.

Usage: python quiz_automation.py [questions_file.txt] [output_name]
Example: python quiz_automation.py questions.txt new_quiz
"""

import json
import os
import sys

# Set UTF-8 encoding for Windows console
if sys.platform == "win32":
    import locale
    try:
        # Try to set console to UTF-8
        os.system("chcp 65001 > nul")
        # Set stdout encoding to UTF-8
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except:
        # If that fails, just use replace mode for errors
        sys.stdout.reconfigure(errors='replace')
        # Replace emojis with simple text
        import builtins
        original_print = builtins.print
        def safe_print(*args, **kwargs):
            try:
                # Convert emojis to text
                safe_args = []
                for arg in args:
                    if isinstance(arg, str):
                        arg = arg.replace("🚀", "[START]")
                        arg = arg.replace("✅", "[SUCCESS]")
                        arg = arg.replace("❌", "[ERROR]")
                        arg = arg.replace("⚠️", "[WARNING]")
                        arg = arg.replace("📊", "[STATS]")
                        arg = arg.replace("🔄", "[PROCESSING]")
                        arg = arg.replace("🎯", "[TARGET]")
                        arg = arg.replace("📝", "[NOTE]")
                    safe_args.append(arg)
                original_print(*safe_args, **kwargs)
            except:
                # Last resort: just print without emojis
                original_print(*[str(arg).encode('ascii', 'ignore').decode('ascii') for arg in args], **kwargs)
        builtins.print = safe_print

import re
from datetime import datetime
from pathlib import Path

class QuizAutomation:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.data_dir = self.base_dir / "assets" / "data"
        self.config_file = self.data_dir / "quiz-config.json"
        
    def parse_questions_txt(self, file_path):
        """Convert questions.txt to JSON format"""
        print(f"📖 Reading questions from: {file_path}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read().strip()
        except FileNotFoundError:
            raise FileNotFoundError(f"❌ File not found: {file_path}")
        except Exception as e:
            raise Exception(f"❌ Error reading file: {e}")
        
        # Handle multiple question formats:
        # - "Question #: 1" (number after colon)
        # - "Question 1:" (number before colon) 
        # - "1." (simple numbering)
        # Add newline at start to ensure first question is captured
        content = '\n' + content
        question_pattern = r'\n\s*(?:Question\s*#?:?\s*(\d+)|Question\s*#?\s*(\d+):|(\d+)\.)\s*'
        parts = re.split(question_pattern, content)
        
        questions = []
        skipped_questions = []
        total_found = 0
        
        # Process each question block - start from index 1 (skip empty first part)
        # With 3 capture groups for question numbers, we have 4 parts per question (3 groups + content)
        for i in range(1, len(parts), 4):
            if i + 3 < len(parts):
                try:
                    # Get question number from any of the three capture groups
                    question_num = parts[i] or parts[i + 1] or parts[i + 2]
                    question_content = parts[i + 3]
                    
                    if question_num and question_content:
                        total_found += 1
                        question_data = self._parse_single_question(question_content, int(question_num))
                        if question_data:
                            questions.append(question_data)
                        else:
                            skipped_questions.append(int(question_num))
                            print(f"⚠️  Skipped question {question_num}: insufficient content")
                except Exception as e:
                    if question_num:
                        skipped_questions.append(int(question_num))
                        print(f"⚠️  Warning: Failed to parse question {question_num}: {e}")
                    continue
        
        print(f"📊 Total questions found: {total_found}")
        print(f"✅ Successfully parsed: {len(questions)} questions")
        if skipped_questions:
            print(f"⚠️  Skipped questions: {len(skipped_questions)} - {skipped_questions[:10]}{'...' if len(skipped_questions) > 10 else ''}")
        
        return questions
        return questions
    
    def _parse_single_question(self, block, question_id):
        """Parse a single question block including explanation"""
        lines = [line.strip() for line in block.split('\n') if line.strip()]
        
        if len(lines) < 3:  # Minimum: question + 2 options
            return None
        
        # Find question text, options, and explanation
        question_text = ""
        options = []
        correct_answers = []
        explanation = ""
        
        option_pattern = re.compile(r'^([A-Z])[\.\)]\s*(.+)$')
        answer_pattern = re.compile(r'^(?:Answer|Correct(?:\s+Answer)?s?|Hint\s+Answer):\s*([A-Z,\s]+)', re.IGNORECASE)
        explanation_pattern = re.compile(r'^Explanation:\s*(.*)', re.IGNORECASE)
        
        current_section = "question"
        
        for line in lines:
            # Check if this is an explanation line
            explanation_match = explanation_pattern.match(line)
            if explanation_match:
                current_section = "explanation"
                explanation_text = explanation_match.group(1)
                if explanation_text:
                    explanation = explanation_text
                continue
            
            # Check if this is an answer line
            answer_match = answer_pattern.match(line)
            if answer_match:
                answer_letters = re.findall(r'[A-Z]', answer_match.group(1))
                correct_answers = [ord(letter) - ord('A') for letter in answer_letters]
                current_section = "answer"
                continue
            
            # Check if this is an option
            option_match = option_pattern.match(line)
            if option_match:
                current_section = "options"
                options.append(option_match.group(2))
                continue
            
            # Handle continuation based on current section
            if current_section == "question":
                if question_text:
                    question_text += " " + line
                else:
                    question_text = line
            elif current_section == "explanation":
                if explanation:
                    explanation += " " + line
                else:
                    explanation = line
        
        # If no explicit correct answers found, assume first option (for safety)
        if not correct_answers:
            print(f"⚠️  No correct answer specified for question {question_id}, defaulting to option A")
            correct_answers = [0]
        
        # Validate we have enough data
        if not question_text or len(options) < 2:
            print(f"⚠️  Skipping incomplete question {question_id}: question='{question_text}', options={len(options)}")
            return None
        
        # Build question object
        question_obj = {
            "id": question_id,
            "question": question_text,
            "options": options,
            "correctAnswers": correct_answers,
            "multiple": len(correct_answers) > 1
        }
        
        # Add explanation if available (clean up separators)
        if explanation:
            # Remove common separators and trim whitespace
            explanation = explanation.replace("---", "").strip()
            if explanation:
                question_obj["explanation"] = explanation
        
        return question_obj
    
    def validate_json(self, questions_data):
        """Validate the JSON structure"""
        print("🔍 Validating JSON structure...")
        
        if not isinstance(questions_data, list):
            raise ValueError("❌ Questions data must be a list")
        
        if len(questions_data) == 0:
            raise ValueError("❌ No questions found in data")
        
        required_fields = ['id', 'question', 'options', 'correctAnswers', 'multiple']
        optional_fields = ['explanation']
        
        for i, question in enumerate(questions_data):
            # Check required fields
            for field in required_fields:
                if field not in question:
                    raise ValueError(f"❌ Question {i+1} missing required field: {field}")
            
            # Validate field types
            if not isinstance(question['id'], int):
                raise ValueError(f"❌ Question {i+1}: 'id' must be integer")
            
            if not isinstance(question['question'], str) or not question['question'].strip():
                raise ValueError(f"❌ Question {i+1}: 'question' must be non-empty string")
            
            if not isinstance(question['options'], list) or len(question['options']) < 2:
                raise ValueError(f"❌ Question {i+1}: 'options' must be list with at least 2 items")
            
            if not isinstance(question['correctAnswers'], list) or len(question['correctAnswers']) == 0:
                raise ValueError(f"❌ Question {i+1}: 'correctAnswers' must be non-empty list")
            
            # Validate correct answer indices
            max_index = len(question['options']) - 1
            for answer_idx in question['correctAnswers']:
                if not isinstance(answer_idx, int) or answer_idx < 0 or answer_idx > max_index:
                    raise ValueError(f"❌ Question {i+1}: Invalid answer index {answer_idx}")
            
            # Validate multiple flag
            if not isinstance(question['multiple'], bool):
                raise ValueError(f"❌ Question {i+1}: 'multiple' must be boolean")
            
            # Validate optional explanation field
            if 'explanation' in question and not isinstance(question['explanation'], str):
                raise ValueError(f"❌ Question {i+1}: 'explanation' must be string")
        
        # Count questions with explanations
        with_explanations = sum(1 for q in questions_data if 'explanation' in q and q['explanation'])
        print(f"✅ JSON validation passed - {len(questions_data)} questions are valid")
        print(f"📝 Questions with explanations: {with_explanations}/{len(questions_data)}")
        return True
    
    def save_quiz_json(self, questions_data, output_name):
        """Save questions to JSON file"""
        output_file = self.data_dir / f"quiz_{output_name}.json"
        
        print(f"💾 Saving quiz to: {output_file}")
        
        try:
            with open(output_file, 'w', encoding='utf-8') as file:
                json.dump(questions_data, file, indent=2, ensure_ascii=False)
            
            print(f"✅ Quiz saved successfully: {output_file}")
            return output_file
        except Exception as e:
            raise Exception(f"❌ Failed to save JSON file: {e}")
    
    def update_config(self, quiz_filename, question_count, quiz_name=None, description=None):
        """Update quiz-config.json with new quiz"""
        print("🔧 Updating configuration...")
        
        try:
            # Load current config
            with open(self.config_file, 'r', encoding='utf-8') as file:
                config = json.load(file)
            
            # Generate quiz metadata
            quiz_key = quiz_filename.name
            
            if not quiz_name:
                # Auto-generate name from filename
                base_name = quiz_key.replace('quiz_', '').replace('.json', '').replace('_', ' ').title()
                quiz_name = f"{base_name} ({question_count} questions)"
            else:
                # Add question count to provided name if not already present
                if "questions)" not in quiz_name and "question)" not in quiz_name:
                    if "(" in quiz_name:
                        # If there are already parentheses, add count before them
                        quiz_name = quiz_name.replace("(", f"({question_count} questions, ", 1)
                    else:
                        # Add question count at the end
                        quiz_name = f"{quiz_name} ({question_count} questions)"
            
            if not description:
                description = f"Practice questions for {quiz_name.split(' (')[0]}"
            
            # Add new quiz to config
            config['quiz-sets'][quiz_key] = {
                "name": quiz_name,
                "description": description,
                "difficulty": "Mixed",
                "question_count": question_count,
                "auto_generated": True,
                "created_date": datetime.now().strftime("%Y-%m-%d"),
                "source": "automated_conversion"
            }
            
            # Update metadata
            config['metadata']['total_quiz_sets'] = len(config['quiz-sets'])
            config['metadata']['last_updated'] = datetime.now().strftime("%Y-%m-%d")
            
            # Add topics if not exists
            if 'topics_available' not in config['metadata']:
                config['metadata']['topics_available'] = []
            
            # Save updated config
            with open(self.config_file, 'w', encoding='utf-8') as file:
                json.dump(config, file, indent=2, ensure_ascii=False)
            
            print(f"✅ Configuration updated successfully")
            print(f"   📋 Added: {quiz_name}")
            print(f"   📊 Total quiz sets: {config['metadata']['total_quiz_sets']}")
            
        except Exception as e:
            raise Exception(f"❌ Failed to update configuration: {e}")
    
    def process_quiz(self, input_file, output_name, quiz_name=None, description=None):
        """Main processing function"""
        print("[AUTOMATION] Starting quiz automation process...")
        print("=" * 50)
        
        try:
            # Step 1: Parse questions from text file
            questions_data = self.parse_questions_txt(input_file)
            
            # Step 2: Validate JSON structure
            self.validate_json(questions_data)
            
            # Step 3: Save JSON file
            output_file = self.save_quiz_json(questions_data, output_name)
            
            # Step 4: Update configuration
            self.update_config(output_file, len(questions_data), quiz_name, description)
            
            print("=" * 50)
            print("🎉 Quiz automation completed successfully!")
            print(f"   📄 Source: {input_file}")
            print(f"   📋 Questions: {len(questions_data)}")
            print(f"   💾 Output: {output_file}")
            print(f"   ⚙️  Config: Updated")
            
            return True
            
        except Exception as e:
            print("=" * 50)
            print(f"❌ Quiz automation failed: {e}")
            return False

def main():
    """Command line interface"""
    automation = QuizAutomation()
    
    # Default values
    input_file = "questions.txt"
    output_name = "auto_generated"
    quiz_name = None
    description = None
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_name = sys.argv[2]
    if len(sys.argv) > 3:
        quiz_name = sys.argv[3]
    if len(sys.argv) > 4:
        description = sys.argv[4]
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        print("📝 Usage: python quiz_automation.py [input_file] [output_name] [quiz_name] [description]")
        print("📝 Example: python quiz_automation.py questions.txt aws_security \"AWS Security Quiz\" \"Security focused questions\"")
        return False
    
    # Process the quiz
    success = automation.process_quiz(input_file, output_name, quiz_name, description)
    
    if success:
        print("\n🌟 Ready to use! Start your server and check the updated quiz list.")
    else:
        print("\n💡 Please check the error messages above and try again.")
    
    return success

if __name__ == "__main__":
    main()

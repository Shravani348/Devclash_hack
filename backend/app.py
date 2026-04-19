import os
import subprocess
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.github_routes import github_bp
from analyzer import ProfileAnalyzer
from resume_llm_auditor import LLMResumeAuditor

app = Flask(__name__)
CORS(app)

# Register GitHub Analysis Blueprint (Port 8000 logic)
app.register_blueprint(github_bp, url_prefix="/api/github")

# Global Analyzers
analyzer = ProfileAnalyzer()
llm_auditor = LLMResumeAuditor()

# Resume-based simple analysis (Legacy/Teammate)
@app.route('/analyze', methods=['POST'])
def analyze_profile():
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400
    
    file = request.files['resume']
    github_url = request.form.get('github', '')
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Please upload a PDF file'}), 400

    temp_dir = '/tmp' if os.name != 'nt' else os.environ.get('TEMP', './')
    temp_path = os.path.join(temp_dir, file.filename)
    file.save(temp_path)

    try:
        from analyzer import analyze
        result = analyze(temp_path, github_url)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# Module 3 - Complex AI Resume Audit
@app.route('/api/resume/audit', methods=['POST'])
def resume_audit():
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400
    
    file = request.files['resume']
    jd = request.form.get('jd', '')
    
    if file.filename == '' or not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Please upload a valid PDF file'}), 400

    temp_path = os.path.join('/tmp' if os.name != 'nt' else os.environ.get('TEMP', './'), file.filename)
    file.save(temp_path)

    try:
        # We use our integrated resume_service which matches our UI requirements
        from services.resume_service import audit_resume
        result = audit_resume(temp_path, jd)
        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# Live App Auditor Route
@app.route('/audit', methods=['POST'])
def audit_app():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'No URL provided'}), 400
    
    url = data['url']
    try:
        # Run Playwright in an entirely isolated process
        cmd = ['python', 'auditor.py', url]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        try:
            output_json = json.loads(result.stdout.strip())
            return jsonify(output_json)
        except json.JSONDecodeError:
            return jsonify({'error': f"Failed to parse auditor response. Raw output: {result.stdout}"}), 500
    except subprocess.CalledProcessError as e:
        return jsonify({'error': f"Auditor crashed: {e.stderr}"}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# LeetCode Analysis Unified Route
@app.route('/api/leetcode/analyze', methods=['POST'])
def leetcode_analyze():
    data = request.get_json()
    username = data.get('username', 'Unknown')
    
    # Dummy logic matching the original Node.js implementation
    dummy_response = {
        'username': username,
        'level': "Intermediate",
        'ranking': 12345,
        'skillScore': 75,
        'problemsSolved': {
            'easy': 120,
            'medium': 80,
            'hard': 25,
            'total': 225
        }
    }
    return jsonify({'success': True, 'data': dummy_response})

if __name__ == "__main__":
    # Unified Backend on Port 8000
    app.run(debug=True, port=8000)

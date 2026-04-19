import os
import subprocess
import json
import re
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Import blueprints and services
try:
    from routes.github_routes import github_bp
    from analyzer import ProfileAnalyzer
    from services.code_quality_service import audit_github_user
    from services.resume_service import audit_resume
except ImportError as e:
    print(f"CRITICAL IMPORT ERROR: {e}")
    github_bp = None
    ProfileAnalyzer = None

app = Flask(__name__)
CORS(app)

# Configure Gemini
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_KEY:
    try:
        genai.configure(api_key=GEMINI_KEY)
        # Using the standard model name available in this project
        model = genai.GenerativeModel('gemini-2.0-flash')
    except Exception as e:
        print(f"GEMINI CONFIG ERROR: {e}")
        model = None
else:
    print("WARNING: GEMINI_API_KEY not found in .env")

# Register Blueprints
if github_bp:
    app.register_blueprint(github_bp, url_prefix="/api/github")

# Global Analyzers
analyzer = ProfileAnalyzer() if ProfileAnalyzer else None

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'port': 8000, 'ai': 'gemini' if GEMINI_KEY else 'none'})

@app.route('/analyze', methods=['POST'])
def analyze_profile():
    if not analyzer:
        return jsonify({'error': 'Profile Analyzer module not loaded.'}), 500
        
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400
    
    file = request.files['resume']
    github_url = request.form.get('github', '')
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    temp_dir = '/tmp' if os.name != 'nt' else os.environ.get('TEMP', './')
    temp_path = os.path.join(temp_dir, file.filename)
    file.save(temp_path)

    try:
        result = analyzer.analyze(temp_path, github_url)
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/api/resume/audit', methods=['POST'])
def resume_audit_api():
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400
    
    file = request.files['resume']
    jd = request.form.get('jd', '')
    
    temp_dir = '/tmp' if os.name != 'nt' else os.environ.get('TEMP', './')
    temp_path = os.path.join(temp_dir, file.filename)
    file.save(temp_path)

    try:
        result = audit_resume(temp_path, jd)
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/audit', methods=['POST'])
def audit_app():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'No URL provided'}), 400
    
    url = data['url']
    try:
        cmd = ['python', 'auditor.py', url]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return jsonify(json.loads(result.stdout.strip()))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/leetcode/analyze', methods=['POST'])
def leetcode_analyze():
    data = request.get_json()
    username = data.get('username', 'Unknown')
    dummy_response = {
        'username': username,
        'level': "Intermediate",
        'ranking': 12345,
        'skillScore': 75,
        'problemsSolved': {'easy': 120, 'medium': 80, 'hard': 25, 'total': 225}
    }
    return jsonify({'success': True, 'data': dummy_response})

@app.route('/api/code/analyze', methods=['POST'])
def code_analyze():
    data = request.get_json()
    username = data.get('username')
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    try:
        result = audit_github_user(username)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/strategy', methods=['POST'])
def dashboard_strategy():
    data = request.get_json()
    summaries = data.get('summaries', [])
    if not summaries:
        return jsonify({'error': 'No data points found.'}), 400

    summary_text = "\n".join([f"- {s.get('title')}: {s.get('mainStat')}" for s in summaries])
    
    prompt = f"Analyze these career data points and give a 5-sentence summary and a 90-day roadmap:\n{summary_text}\nOutput Rules: Use 'SUMMARY' and 'ROADMAP' as headers."

    try:
        if not GEMINI_KEY:
            return jsonify({'error': 'GEMINI_API_KEY is not set.'}), 500
            
        try:
            response = model.generate_content(prompt)
            content = response.text
        except Exception as e:
            if "404" in str(e) or "not found" in str(e).lower():
                print("Gemini 2.0 Flash not found, falling back to gemini-flash-latest")
                fallback_model = genai.GenerativeModel('gemini-flash-latest')
                response = fallback_model.generate_content(prompt)
                content = response.text
            else:
                raise e
        
        s_match = re.search(r"(?:SUMMARY|### SUMMARY|SUMMARY:)(.*?)(?:ROADMAP|### ROADMAP|$)", content, re.DOTALL | re.I)
        r_match = re.search(r"(?:ROADMAP|### ROADMAP|ROADMAP:)(.*)", content, re.DOTALL | re.I)
        
        return jsonify({
            'overall_summary': s_match.group(1).strip() if s_match else content[:200],
            'roadmap': r_match.group(1).strip() if r_match else content[200:]
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8000)

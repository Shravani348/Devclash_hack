import os
import subprocess
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.github_routes import github_bp

app = Flask(__name__)
CORS(app)

# Register GitHub Analysis Blueprint (Port 8000 logic)
app.register_blueprint(github_bp, url_prefix="/api/github")

# Teammate's Analyze Route (Resume based)
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

    # Save temp file
    temp_dir = '/tmp' if os.name != 'nt' else os.environ.get('TEMP', './')
    temp_path = os.path.join(temp_dir, file.filename)
    file.save(temp_path)

    try:
        # Import analyzer here to avoid circular imports or missing file issues
        from analyzer import analyze
        result = analyze(temp_path, github_url)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# Teammate's Live App Auditor Route
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

if __name__ == "__main__":
    # We use 8000 to keep compatibility with the existing GitHub analyzer frontend
    app.run(debug=True, port=8000)

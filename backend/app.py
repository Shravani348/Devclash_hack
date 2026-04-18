import subprocess
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from analyzer import ProfileAnalyzer

app = Flask(__name__)
CORS(app)

analyzer = ProfileAnalyzer()

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
    temp_path = os.path.join('/tmp' if os.name != 'nt' else os.environ.get('TEMP', './'), file.filename)
    file.save(temp_path)

    try:
        # Run local model analysis
        result = analyzer.analyze(temp_path, github_url)
        return jsonify(result)
    except Exception as e:
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
        # Run Playwright in an entirely isolated process to bypass asyncio threading restrictions in Flask
        cmd = ['python', 'auditor.py', url]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        # Parse the JSON output from the auditor
        try:
            output_json = json.loads(result.stdout.strip())
            return jsonify(output_json)
        except json.JSONDecodeError:
            return jsonify({'error': f"Failed to parse auditor response. Raw output: {result.stdout}"}), 500
    except subprocess.CalledProcessError as e:
        return jsonify({'error': f"Auditor crashed: {e.stderr}"}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

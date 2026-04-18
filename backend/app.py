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

if __name__ == '__main__':
    app.run(debug=True, port=5000)

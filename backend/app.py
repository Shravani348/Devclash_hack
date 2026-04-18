from flask import Flask
from flask_cors import CORS
from routes.github_routes import github_bp

app = Flask(__name__)

# 🔥 THIS LINE FIXES YOUR ERROR
CORS(app)

app.register_blueprint(github_bp, url_prefix="/api/github")

if __name__ == "__main__":
    app.run(debug=True, port=8000)
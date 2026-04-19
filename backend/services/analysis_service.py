import requests
import os
import re
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# Configure Gemini
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_KEY:
    try:
        genai.configure(api_key=GEMINI_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')
    except:
        model = None
else:
    model = None

# GitHub API Headers
HEADERS = {"Accept": "application/vnd.github.v3+json"}
if os.getenv("GITHUB_TOKEN"):
    HEADERS["Authorization"] = f"token {os.getenv('GITHUB_TOKEN')}"

# ---------------------------------------------------------
# ⚡ ADAPTIVE ANALYSIS CONFIGURATION
# ---------------------------------------------------------
CONFIDENCE_THRESHOLD = 80
MAX_REPOS = 3
MAX_FILES_PER_REPO = 12

PRIORITY_FILES = {
    'backend': ['server.js', 'app.py', 'main.py', 'index.js', 'wsgi.py', 'manage.py', 'routes.py', 'controller.js', 'models.py'],
    'auth': ['passport.js', 'auth.js', 'jwt.py', 'middleware.js', 'login.js', 'session.py'],
    'testing': ['pytest.ini', 'jest.config.js', 'conftest.py', 'test_', '.test.'],
    'api': ['axios.js', 'fetch.js', 'api.js', 'requests.py', 'service.js']
}

KEYWORDS = {
    'backend': [r'express\(', r'flask', r'django', r'fastapi', r'app\.listen', r'router\.', r'@restcontroller'],
    'auth': [r'jwt', r'passport', r'bcrypt', r'login', r'oauth', r'auth0', r'cognito'],
    'testing': [r'describe\(', r'it\(', r'pytest', r'unittest', r'jest', r'expect\('],
    'api': [r'fetch\(', r'axios\.', r'requests\.', r'httpclient', r'gql`', r'apollo']
}

def analyze_repos(repos):
    confidences = {"backend": 0, "auth": 0, "testing": 0, "api": 0}
    has_readme = False
    target_repos = [r for r in repos if not r.get('fork', False)][:MAX_REPOS]
    
    for repo in target_repos:
        owner = repo.get("owner", {}).get("login")
        repo_name = repo.get("name")
        branch = repo.get("default_branch", "main")
        
        tree_url = f"https://api.github.com/repos/{owner}/{repo_name}/git/trees/{branch}?recursive=1"
        try:
            tree_data = requests.get(tree_url, headers=HEADERS, timeout=5).json()
            items = tree_data.get("tree", [])
        except: continue

        repo_files = []
        for item in items:
            if item.get("type") != "blob": continue
            path = item.get("path", "")
            name = path.split("/")[-1].lower()
            
            if any(x in name for x in ['.png', '.jpg', '.lock', '.json', '.svg', '.md', '.css']):
                if "readme.md" in name: has_readme = True
                continue

            for cat, patterns in PRIORITY_FILES.items():
                if any(p in name for p in patterns):
                    confidences[cat] += 25
            
            repo_files.append(item)

        if all(c >= CONFIDENCE_THRESHOLD for c in confidences.values()):
            continue

        for file in repo_files[:MAX_FILES_PER_REPO]:
            if all(confidences[cat] >= CONFIDENCE_THRESHOLD for cat in confidences):
                break

            path = file.get("path")
            needed_cats = [cat for cat, conf in confidences.items() if conf < CONFIDENCE_THRESHOLD]
            raw_url = f"https://raw.githubusercontent.com/{owner}/{repo_name}/{branch}/{path}"
            try:
                content = requests.get(raw_url, timeout=3).text.lower()
                for cat in needed_cats:
                    for pattern in KEYWORDS[cat]:
                        if re.search(pattern, content):
                            confidences[cat] += 40
                            break
            except: continue

    for cat in confidences:
        confidences[cat] = min(confidences[cat], 100)

    result = {
        "has_backend": confidences["backend"] >= 40,
        "has_auth": confidences["auth"] >= 40,
        "has_testing": confidences["testing"] >= 40,
        "has_readme": has_readme,
        "has_api_calls": confidences["api"] >= 40
    }

    return generate_gaps(result, confidences), result, confidences

def generate_gaps(result, scores):
    gaps = []
    if not result["has_backend"]: gaps.append("No backend detected.")
    if not result["has_api_calls"]: gaps.append("No API integration found.")
    if not result["has_auth"]: gaps.append("No authentication system found.")
    if not result["has_testing"]: gaps.append("No testing frameworks found.")
    if not result["has_readme"]: gaps.append("Projects missing README documentation.")
    return gaps

def get_ai_explanation(repos, result):
    if not model:
        return "Focus on adding more backend complexity and documentation to your repositories."
        
    try:
        repo_count = len(repos) if isinstance(repos, list) else 0
        repo_list = "\n".join([f"- {r.get('name', 'Unknown')}" for r in repos[:5]])
        
        prompt = f"""
        Analyze this developer's GitHub profile:
        - Repos: {repo_count}
        - Backend: {result['has_backend']}
        - API: {result['has_api_calls']}
        - Auth: {result['has_auth']}
        - Testing: {result['has_testing']}
        - README: {result['has_readme']}
        Top Repos:
        {repo_list}
        Write a 4-sentence career evaluation (2nd person).
        """
        response = model.generate_content(prompt)
        return response.text
    except:
        return "You have a solid start to your portfolio. Focus on adding more complexity."

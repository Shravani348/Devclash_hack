import os
import requests
import re
from base64 import b64decode
from dotenv import load_dotenv

load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"} if GITHUB_TOKEN else {"Accept": "application/vnd.github.v3+json"}

# ---------------------------------------------------------
# ⚡ ADAPTIVE ANALYSIS CONFIGURATION
# ---------------------------------------------------------
CONFIDENCE_THRESHOLD = 80
MAX_REPOS = 3
MAX_FILES_PER_REPO = 10

# Priority mapping for Stage 1 (Name-based detection)
PRIORITY_FILES = {
    'modularity': ['app.py', 'server.js', 'main.py', 'index.js', 'wsgi.py', 'controller.js', 'service.js'],
    'error_handling': ['middleware.js', 'error.py', 'exception.java'],
    'authentication': ['passport.js', 'auth.js', 'jwt.py', 'login.js', 'session.py'],
    'database': ['models.py', 'db.js', 'schema.sql', 'mongoose.js', 'repository.java'],
    'complexity': ['logic.js', 'processor.py', 'engine.py'],
    'security': ['.env', 'config.py', 'secrets.json']
}

# Content keywords for Stage 2 (Deep analysis)
KEYWORDS = {
    'modularity': [r'(def |class |function |=>)'],
    'error_handling': [r'(try:|except|try |catch)'],
    'authentication': [r'(login|auth|jwt|bcrypt|passport|token|session)'],
    'database': [r'(sql|mongoose|sqlalchemy|jdbc|db|select|insert|findone)'],
    'complexity': [r'(if |for |while |switch )'],
    'security': [r'(password\s*=\s*["\'].+["\']|api_key\s*=\s*["\'].+["\']|secret\s*=\s*["\'].+["\'])']
}

def get_repositories(username):
    url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page={MAX_REPOS}"
    try:
        response = requests.get(url, headers=HEADERS, timeout=5)
        return response.json() if response.status_code == 200 else []
    except: return []

def audit_github_user(username):
    """
    OPTIMIZED: Adaptive Analysis for Code Quality
    """
    repos = get_repositories(username)
    if not repos:
        return {"error": "User not found or no public repositories."}

    # Tracking confidence scores (0-100) per category
    confidences = {cat: 0 for cat in KEYWORDS}
    files_analyzed_count = 0
    file_map = {cat: "Not Found" for cat in KEYWORDS} # Track which file gave the best/worst signal

    for repo in repos:
        if all(c >= CONFIDENCE_THRESHOLD for c in confidences.values()):
            break # Early stop if we have high confidence in all areas

        repo_name = repo.get("name")
        branch = repo.get("default_branch", "main")
        
        # Fetch Repo Tree (One API call)
        tree_url = f"https://api.github.com/repos/{username}/{repo_name}/git/trees/{branch}?recursive=1"
        try:
            tree_data = requests.get(tree_url, headers=HEADERS, timeout=5).json()
            items = tree_data.get("tree", [])
        except: continue

        # --- STAGE 1: FAST PATH SCAN ---
        target_files = []
        for item in items:
            if item.get("type") != "blob": continue
            path = item.get("path", "")
            name = path.split("/")[-1].lower()
            
            # Skip heavy binaries
            if any(x in name for x in ['.png', '.jpg', '.zip', '.pdf', '.ico']): continue
            if not name.endswith(('.py', '.js', '.java', '.ts', '.go', '.c')): continue

            # Check for priority signals in names
            for cat, patterns in PRIORITY_FILES.items():
                if any(p in name for p in patterns):
                    confidences[cat] += 20
                    file_map[cat] = path
            
            target_files.append(item)

        # --- STAGE 2: SELECTIVE DEEP SCAN ---
        for file in target_files[:MAX_FILES_PER_REPO]:
            if all(confidences[cat] >= CONFIDENCE_THRESHOLD for cat in confidences):
                break

            path = file.get("path")
            needed_cats = [cat for cat, conf in confidences.items() if conf < CONFIDENCE_THRESHOLD]
            
            raw_url = f"https://raw.githubusercontent.com/{username}/{repo_name}/{branch}/{path}"
            try:
                content = requests.get(raw_url, timeout=3).text.lower()
                files_analyzed_count += 1
                
                for cat in needed_cats:
                    count = len(re.findall(KEYWORDS[cat][0], content, re.I))
                    if count > 0:
                        confidences[cat] += 40 if count >= 3 else 20
                        file_map[cat] = path
            except: continue

    # Final result mapping
    final_checks = {}
    for cat in KEYWORDS:
        conf = min(confidences[cat], 100)
        status = "PASS" if conf >= 80 else ("WARN" if conf >= 40 else "FAIL")
        
        messages = {
            'modularity': { 'PASS': 'Strong modular structure detected.', 'WARN': 'Limited functions found.', 'FAIL': 'No clear functions/classes detected.' },
            'error_handling': { 'PASS': 'Robust error handling found.', 'WARN': 'Partial try/catch usage.', 'FAIL': 'Missing error handling blocks.' },
            'authentication': { 'PASS': 'Authentication patterns detected.', 'WARN': 'Auth logic seems missing.', 'FAIL': 'No security/auth found.' },
            'database': { 'PASS': 'Database integration detected.', 'WARN': 'No clear DB patterns.', 'FAIL': 'No database usage found.' },
            'complexity': { 'PASS': 'Solid logical flow.', 'WARN': 'Basic script structure.', 'FAIL': 'Linear execution, no logic blocks.' },
            'security': { 'PASS': 'No hardcoded secrets detected.', 'WARN': 'N/A', 'FAIL': 'CRITICAL: Hardcoded secrets found!' }
        }
        
        # Security is binary
        if cat == 'security':
            status = "FAIL" if conf > 0 and "security" in file_map[cat] else "PASS"

        final_checks[cat] = {
            "status": status,
            "message": messages[cat][status],
            "file": file_map[cat]
        }

    # Scoring (Simplified for speed)
    total_score = sum([80 if c['status'] == 'PASS' else (40 if c['status'] == 'WARN' else 0) for c in final_checks.values()]) / 6
    total_score = round(total_score + 20, 1) # Add baseline

    level = "Beginner"
    if total_score >= 80: level = "Senior"
    elif total_score >= 60: level = "Intermediate"
    elif total_score >= 40: level = "Junior"

    return {
        "average_score": total_score,
        "level": level,
        "files_analyzed": files_analyzed_count,
        "checks": final_checks,
        "strengths": [c['message'] for c in final_checks.values() if c['status'] == 'PASS'][:3],
        "what_to_improve": [f"{k.title()}: {c['message']}" for k, c in final_checks.items() if c['status'] != 'PASS'][:3],
        "final_verdict": f"{level}-level practices detected."
    }

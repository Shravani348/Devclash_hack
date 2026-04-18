
import requests
import os
import concurrent.futures
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 🔥 ADD GITHUB TOKEN HEADERS
HEADERS = {
    "Accept": "application/vnd.github.v3+json"
}
if os.getenv("GITHUB_TOKEN"):
    HEADERS["Authorization"] = f"token {os.getenv('GITHUB_TOKEN')}"

# 🔥 KEYWORDS
BACKEND_KEYWORDS = [
    "express(", "app.listen", "router",
    "flask", "django", "fastapi",
    "@restcontroller", "springboot"
]

AUTH_KEYWORDS = ["jwt", "passport", "auth", "login", "bcrypt"]
TEST_KEYWORDS = ["describe(", "it(", "pytest", "unittest", "jest"]
API_KEYWORDS = ["fetch(", "axios", "requests.", "httpclient"]


# Removed fetch_files_recursive in favor of the lightning-fast GitHub Trees API


# -----------------------------
# 🧠 MAIN ANALYSIS FUNCTION
# -----------------------------
def analyze_repos(repos):
    result = {
        "has_backend": False,
        "has_auth": False,
        "has_testing": False,
        "has_readme": False,
        "has_api_calls": False
    }

    scores = {
        "backend": 0,
        "auth": 0,
        "testing": 0,
        "api": 0
    }

    for repo in repos[:5]:

        if not isinstance(repo, dict):
            continue

        owner = repo.get("owner", {}).get("login")
        repo_name = repo.get("name")
        default_branch = repo.get("default_branch", "main")
        
        if not owner or not repo_name:
            continue

        # 🔥 USE TREES API TO GET ENTIRE REPO IN 1 REQUEST (100x FASTER)
        trees_url = f"https://api.github.com/repos/{owner}/{repo_name}/git/trees/{default_branch}?recursive=1"
        try:
            tree_data = requests.get(trees_url, headers=HEADERS).json()
            all_blobs = [item for item in tree_data.get("tree", []) if item.get("type") == "blob"]
            files = all_blobs[:15] # only parse first 15 files for speed
        except:
            files = []

        def process_file(file):
            local_scores = {"backend": 0, "auth": 0, "testing": 0, "api": 0}
            is_readme = False
            path = file.get("path", "")
            name = path.split("/")[-1].lower()
            
            # Construct raw download url (does not hit API rate limits)
            download_url = f"https://raw.githubusercontent.com/{owner}/{repo_name}/{default_branch}/{path}"
            
            if "readme" in name:
                is_readme = True

            if any(x in name for x in ["server", "backend", "api", "app"]):
                local_scores["backend"] += 1
            if "test" in name:
                local_scores["testing"] += 1
            if any(x in name for x in ["auth", "login", "jwt"]):
                local_scores["auth"] += 1
            if any(x in name for x in ["routes", "controllers", "models"]):
                local_scores["backend"] += 1

            # Skip heavy/binary files
            if not name.endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.zip', '.mp4', '.lock')):
                try:
                    content_data = requests.get(download_url, timeout=3).text.lower()
                    if any(k in content_data for k in BACKEND_KEYWORDS):
                        local_scores["backend"] += 2
                    if any(k in content_data for k in API_KEYWORDS):
                        local_scores["api"] += 2
                    if any(k in content_data for k in AUTH_KEYWORDS):
                        local_scores["auth"] += 2
                    if any(k in content_data for k in TEST_KEYWORDS):
                        local_scores["testing"] += 2
                except:
                    pass
            return local_scores, is_readme

        # 🔥 USE PARALLEL THREADS TO DOWNLOAD FILES INSTANTLY
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(process_file, f) for f in files]
            for future in concurrent.futures.as_completed(futures):
                res_scores, has_readme = future.result()
                if has_readme:
                    result["has_readme"] = True
                scores["backend"] += res_scores["backend"]
                scores["api"] += res_scores["api"]
                scores["auth"] += res_scores["auth"]
                scores["testing"] += res_scores["testing"]

    # -----------------------
    # 🎯 FINAL DECISION (RELAXED THRESHOLD)
    # -----------------------
    result["has_backend"] = scores["backend"] >= 1
    result["has_api_calls"] = scores["api"] >= 1
    result["has_auth"] = scores["auth"] >= 1
    result["has_testing"] = scores["testing"] >= 1

    return generate_gaps(result, scores), result, scores


# -----------------------------
# 📉 GAP GENERATION
# -----------------------------
def generate_gaps(result, scores):
    gaps = []

    if not result["has_backend"]:
        gaps.append(
            "No backend detected. No server frameworks like Flask, Express, or Django found."
        )

    if not result["has_api_calls"]:
        gaps.append(
            "No API integration found. No fetch/axios/http requests detected."
        )

    if not result["has_auth"]:
        gaps.append(
            "No authentication system found. JWT, login systems, or auth libraries not detected."
        )

    if not result["has_testing"]:
        gaps.append(
            "No testing frameworks found. No test frameworks like Jest/Pytest detected."
        )

    if not result["has_readme"]:
        gaps.append("Projects missing README documentation.")

    return gaps


def get_ai_explanation(repos, result):
    try:
        repo_count = len(repos) if isinstance(repos, list) else 0
        repo_list = "\n".join([f"- {r.get('name', 'Unknown')} (Stars: {r.get('stargazers_count', 0)})" for r in repos[:10]]) if isinstance(repos, list) else "None"
        
        prompt = f"""
You are an expert software engineer and career coach.

Analyze this developer's GitHub profile and write a clear, honest, and helpful career evaluation in plain English.

📊 DATA:
- Total Repositories: {repo_count}
- Backend Detected: {result.get('has_backend', False)}
- API Integration: {result.get('has_api_calls', False)}
- Authentication: {result.get('has_auth', False)}
- Testing: {result.get('has_testing', False)}
- README Present: {result.get('has_readme', False)}

Top Repositories:
{repo_list}

---

Write a 4–6 sentence career insight paragraph covering:
1. Their current experience level (Beginner / Intermediate / Advanced) and why
2. Their strongest detected skill from the signals above
3. The most critical gap they need to fix to become hireable
4. One specific, concrete next step they should take THIS WEEK

Rules:
- Write in second person ("You have...", "Your projects...")
- Be direct, honest, and encouraging
- Do NOT use bullet points, headers, or JSON
- Keep it under 120 words
"""


        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )

        return response.choices[0].message.content

    except Exception as e:
        print("AI ERROR:", e)
        return _generate_local_insight(repos, result)


def _generate_local_insight(repos, result):
    """Generate a personalized career insight purely from the already-analyzed data,
    used as a fallback when the OpenAI API is unavailable."""
    repo_count = len(repos) if isinstance(repos, list) else 0
    has_backend = result.get("has_backend", False)
    has_api     = result.get("has_api_calls", False)
    has_auth    = result.get("has_auth", False)
    has_testing = result.get("has_testing", False)
    has_readme  = result.get("has_readme", False)

    # ── Determine experience level ──────────────────────────
    signals = sum([has_backend, has_api, has_auth, has_testing])
    if signals >= 3 or (repo_count >= 15 and signals >= 2):
        level = "Advanced"
    elif signals >= 1 or repo_count >= 6:
        level = "Intermediate"
    else:
        level = "Beginner"

    # ── Build personalized sentences ─────────────────────────
    parts = []

    # Sentence 1: level + repo count
    parts.append(
        f"Based on your {repo_count} public repositor{'y' if repo_count == 1 else 'ies'} and the "
        f"signals detected across your code, you appear to be a {level}-level developer."
    )

    # Sentence 2: strongest skill
    strengths = []
    if has_backend: strengths.append("backend development")
    if has_api:     strengths.append("API integration")
    if has_auth:    strengths.append("authentication systems")
    if has_testing: strengths.append("automated testing")
    if has_readme:  strengths.append("project documentation")

    if strengths:
        parts.append(
            f"Your strongest detected area{'s are' if len(strengths) > 1 else ' is'} "
            f"{', '.join(strengths[:-1]) + (' and ' if len(strengths) > 1 else '') + strengths[-1]}."
        )
    else:
        parts.append(
            "No strong technical signals were detected across your repositories yet, "
            "which suggests your projects are mostly frontend or script-based work."
        )

    # Sentence 3: biggest gap
    gaps = []
    if not has_backend: gaps.append("backend framework (Flask, Express, or Django)")
    if not has_auth:    gaps.append("authentication (JWT or OAuth)")
    if not has_testing: gaps.append("automated tests (Jest or Pytest)")
    if not has_api:     gaps.append("API integration (REST or third-party APIs)")
    if not has_readme:  gaps.append("README documentation")

    if gaps:
        most_critical = gaps[0]
        parts.append(
            f"Your most critical gap is the absence of {most_critical}, "
            "which is one of the top requirements employers look for when reviewing junior-to-mid engineering portfolios."
        )

    # Sentence 4: concrete next step
    if not has_backend and not has_api:
        step = "build a small REST API using Flask or Express.js and deploy it on Railway or Render"
    elif not has_auth:
        step = "add JWT-based login and registration to one of your existing backend projects"
    elif not has_testing:
        step = "write at least 5 unit tests for your most complex project using Pytest or Jest"
    elif not has_readme:
        step = "add proper README files with setup instructions and screenshots to your top 3 repos"
    else:
        step = "deploy one of your projects publicly and add the live URL to its GitHub description"

    parts.append(f"This week, focus on one concrete action: {step}.")

    return " ".join(parts)

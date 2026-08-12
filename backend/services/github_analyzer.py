"""
GitHub Analyzer — Deep Profile Analysis Engine
===============================================
Comprehensive GitHub profile analysis using:
  - GitHub REST API v3 (paginated, full data)
  - Pattern-based code scanning (fast, deterministic)
  - Gemini LLM for narrative & nuanced assessment
  - Weighted scoring formula across 8 dimensions

Score Formula:
  profile_completeness  × 0.08
  activity_score        × 0.22  (commits, recency, frequency)
  repo_quality_avg      × 0.25  (README, tests, CI, Docker)
  tech_diversity        × 0.15  (languages, frameworks, tools)
  community_score       × 0.10  (stars, forks, followers, PRs)
  code_quality_score    × 0.20  (pattern scan + LLM)
"""

import os
import re
import json
import requests
from datetime import datetime, timezone
from dateutil import parser as dateparser
from dotenv import load_dotenv

load_dotenv()

def get_github_headers():
    load_dotenv(override=True)
    token = os.getenv("GITHUB_TOKEN", "").strip()
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token and token != "your_github_token_here":
        headers["Authorization"] = f"token {token}"
    return headers

# ─── Tuning constants ────────────────────────────────────────────────────────
MAX_REPOS_FULL_SCAN   = 8    # repos to do deep file-level scan on
MAX_FILES_PER_REPO    = 15   # files per repo for code scan
MAX_FILE_CHARS        = 2000 # chars per file for AI context

# ─── Tech stack keyword maps ─────────────────────────────────────────────────
FRAMEWORK_PATTERNS = {
    # Backend
    "Flask":       [r"from flask", r"import flask", r"Flask\(__name__\)"],
    "Django":      [r"from django", r"django\.db", r"urlpatterns"],
    "FastAPI":     [r"from fastapi", r"FastAPI\(", r"@app\.(get|post|put|delete)"],
    "Express":     [r"require\(['\"]express['\"]", r"app\.listen\(", r"router\.(get|post)"],
    "NestJS":      [r"@Module\(", r"@Controller\(", r"@Injectable\("],
    "Spring":      [r"@SpringBootApplication", r"@RestController", r"@Autowired"],
    # Frontend
    "React":       [r"import React", r"useState\(", r"useEffect\(", r"from 'react'"],
    "Vue":         [r"from 'vue'", r"createApp\(", r"defineComponent\("],
    "Angular":     [r"@Component\(", r"@NgModule\(", r"from '@angular"],
    "Next.js":     [r"from 'next'", r"getServerSideProps", r"getStaticProps"],
    # Databases
    "MongoDB":     [r"mongoose", r"MongoClient", r"db\.collection"],
    "PostgreSQL":  [r"psycopg2", r"asyncpg", r"pg\.Pool", r"pg\.Client"],
    "MySQL":       [r"mysql\.connect", r"pymysql", r"mysql2"],
    "Redis":       [r"import redis", r"createClient\(", r"redis\.Redis"],
    "SQLAlchemy":  [r"from sqlalchemy", r"Base\.metadata", r"sessionmaker"],
    # Cloud / DevOps
    "Docker":      [r"FROM python", r"FROM node", r"EXPOSE", r"RUN pip install"],
    "AWS":         [r"boto3", r"aws-sdk", r"@aws-sdk"],
    "Firebase":    [r"firebase", r"initializeApp\(", r"getFirestore\("],
    # ML / AI
    "TensorFlow":  [r"import tensorflow", r"tf\.keras", r"tf\.Variable"],
    "PyTorch":     [r"import torch", r"nn\.Module", r"torch\.tensor"],
    "scikit-learn":[r"from sklearn", r"import sklearn", r"fit\(X"],
    "OpenAI":      [r"openai\.ChatCompletion", r"from openai", r"openai\.Completion"],
    # Testing
    "pytest":      [r"import pytest", r"def test_", r"@pytest\.fixture"],
    "Jest":        [r"describe\(", r"it\(", r"expect\(", r"test\("],
    "Mocha":       [r"require\('mocha'\)", r"describe\(.*done\)"],
    # Auth
    "JWT":         [r"jwt\.sign", r"jwt\.verify", r"PyJWT", r"import jwt"],
    "OAuth":       [r"passport\.", r"oauth2", r"OAuthProvider"],
    "bcrypt":      [r"bcrypt\.hash", r"bcrypt\.compare", r"bcrypt\.generate"],
    # GraphQL
    "GraphQL":     [r"graphql", r"gql`", r"GraphQLSchema", r"typeDefs"],
    # WebSockets
    "WebSocket":   [r"socket\.io", r"WebSocket\(", r"ws\.on\("],
    # CI/CD
    "GitHub Actions": [r"on:\s*push", r"jobs:", r"runs-on:"],
}

ANTI_PATTERNS = [
    (r'password\s*=\s*["\'][^"\']{3,}["\']',  "CRITICAL", "Hardcoded password"),
    (r'api_key\s*=\s*["\'][^"\']{10,}["\']',  "CRITICAL", "Hardcoded API key"),
    (r'secret\s*=\s*["\'][^"\']{5,}["\']',    "HIGH",     "Hardcoded secret"),
    (r'eval\s*\(',                              "HIGH",     "eval() — code injection risk"),
    (r'exec\s*\(',                              "HIGH",     "exec() — code injection risk"),
    (r'\.innerHTML\s*=',                        "HIGH",     "innerHTML assignment — XSS risk"),
    (r'except:\s*pass',                         "MEDIUM",   "Bare except:pass — silent errors"),
    (r'catch\s*\(\s*\w\s*\)\s*\{\s*\}',       "MEDIUM",   "Empty catch block"),
    (r'SELECT \* FROM',                         "MEDIUM",   "SELECT * — performance issue"),
    (r'md5\s*\(',                               "HIGH",     "MD5 for hashing — insecure"),
    (r'console\.log\(',                         "LOW",      "console.log in production"),
    (r'TODO|FIXME|HACK',                        "LOW",      "Unresolved TODO/FIXME"),
    (r'http://',                                "LOW",      "HTTP instead of HTTPS"),
]


# ─────────────────────────────────────────────────────────────────────────────
#  GITHUB API HELPERS
# ─────────────────────────────────────────────────────────────────────────────

class GitHubAPIError(Exception):
    def __init__(self, message, status_code=500):
        super().__init__(message)
        self.status_code = status_code


def _gh(url, timeout=8):
    """Make a GitHub API request, return JSON or raise GitHubAPIError on error."""
    try:
        resp = requests.get(url, headers=get_github_headers(), timeout=timeout)
        if resp.status_code == 200:
            return resp.json()
        
        if resp.status_code == 401:
            raise GitHubAPIError("GitHub API token is invalid or unauthorized.", 401)
        if resp.status_code == 403:
            if resp.headers.get('X-RateLimit-Remaining') == '0':
                raise GitHubAPIError("GitHub API rate limit exceeded.", 429)
            raise GitHubAPIError("GitHub API forbidden. Check permissions or rate limits.", 403)
        if resp.status_code == 404:
            raise GitHubAPIError("GitHub resource not found.", 404)
        
        raise GitHubAPIError(f"GitHub API returned status {resp.status_code}", resp.status_code)
    except GitHubAPIError:
        raise
    except requests.exceptions.Timeout:
        raise GitHubAPIError("GitHub API request timed out.", 504)
    except Exception as e:
        raise GitHubAPIError(f"GitHub API request failed: {str(e)}", 500)


def _raw(url, timeout=5):
    """Fetch raw file content."""
    try:
        resp = requests.get(url, headers=get_github_headers(), timeout=timeout)
        if resp.status_code == 200:
            return resp.text
        return ""
    except Exception:
        return ""


# ─────────────────────────────────────────────────────────────────────────────
#  PROFILE FETCHING
# ─────────────────────────────────────────────────────────────────────────────

def fetch_user_profile(username: str) -> dict:
    """Fetch complete GitHub user profile."""
    data = _gh(f"https://api.github.com/users/{username}")
    if not data:
        raise GitHubAPIError(f"GitHub user '{username}' not found.", 404)

    created = data.get("created_at", "")
    account_age_years = 0
    if created:
        try:
            age_delta = datetime.now(timezone.utc) - dateparser.parse(created)
            account_age_years = round(age_delta.days / 365, 1)
        except Exception:
            pass

    return {
        "login":            data.get("login", username),
        "name":             data.get("name") or username,
        "avatar_url":       data.get("avatar_url", ""),
        "bio":              data.get("bio") or "",
        "location":         data.get("location") or "",
        "company":          data.get("company") or "",
        "blog":             data.get("blog") or "",
        "email":            data.get("email") or "",
        "twitter":          data.get("twitter_username") or "",
        "followers":        data.get("followers", 0),
        "following":        data.get("following", 0),
        "public_repos":     data.get("public_repos", 0),
        "public_gists":     data.get("public_gists", 0),
        "html_url":         data.get("html_url", f"https://github.com/{username}"),
        "created_at":       created,
        "account_age_years": account_age_years,
        "hireable":         data.get("hireable"),
    }


def fetch_all_repos(username: str) -> list:
    """Fetch ALL public repos (paginated, sorted by last push)."""
    repos = []
    page = 1
    while True:
        try:
            batch = _gh(
                f"https://api.github.com/users/{username}/repos"
                f"?sort=pushed&per_page=100&page={page}"
            )
            if not batch or not isinstance(batch, list):
                break
        except GitHubAPIError as e:
            if page == 1:
                raise e # Bubble up if first page fails
            break # Otherwise just stop paginating

        repos.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return repos


# ─────────────────────────────────────────────────────────────────────────────
#  SCORING HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def score_profile_completeness(profile: dict) -> dict:
    """Score how complete the GitHub profile is (0-100)."""
    checks = {
        "has_name":      bool(profile.get("name") and profile["name"] != profile.get("login")),
        "has_bio":       bool(profile.get("bio")),
        "has_location":  bool(profile.get("location")),
        "has_website":   bool(profile.get("blog")),
        "has_company":   bool(profile.get("company")),
        "has_email":     bool(profile.get("email")),
        "has_twitter":   bool(profile.get("twitter")),
        "has_avatar":    bool(profile.get("avatar_url")),
        "account_old":   profile.get("account_age_years", 0) >= 1,
        "hireable":      bool(profile.get("hireable")),
    }
    weights = {
        "has_name": 15, "has_bio": 20, "has_location": 10, "has_website": 15,
        "has_company": 10, "has_email": 10, "has_twitter": 5, "has_avatar": 5,
        "account_old": 5, "hireable": 5,
    }
    score = sum(weights[k] for k, v in checks.items() if v)
    return {"score": score, "checks": checks}


def score_repo_quality(repo: dict, username: str) -> dict:
    """Deep-scan a single repo and return quality metrics."""
    name = repo.get("name", "")
    branch = repo.get("default_branch", "main")
    lang = repo.get("language") or "Unknown"
    stars = repo.get("stargazers_count", 0)
    forks = repo.get("forks_count", 0)
    open_issues = repo.get("open_issues_count", 0)
    is_fork = repo.get("fork", False)
    description = repo.get("description") or ""

    # Recency score
    pushed_at = repo.get("pushed_at") or repo.get("updated_at", "")
    days_since_push = 9999
    if pushed_at:
        try:
            delta = datetime.now(timezone.utc) - dateparser.parse(pushed_at)
            days_since_push = delta.days
        except Exception:
            pass

    recency_score = max(0, 100 - days_since_push // 3)

    # Fetch tree
    tree_data = _gh(
        f"https://api.github.com/repos/{username}/{name}/git/trees/{branch}?recursive=1"
    )
    tree = tree_data.get("tree", []) if tree_data else []

    # Structural checks
    all_paths = [item.get("path", "").lower() for item in tree if item.get("type") == "blob"]
    has_readme   = any("readme" in p for p in all_paths)
    has_tests    = any(any(x in p for x in ["test_", ".test.", ".spec.", "/tests/", "__tests__"]) for p in all_paths)
    has_ci       = any((".github/workflows" in p or ".travis" in p or "circle" in p or "jenkins" in p) for p in all_paths)
    has_docker   = any("dockerfile" in p or "docker-compose" in p for p in all_paths)
    has_lint     = any((".eslintrc" in p or "pylintrc" in p or ".flake8" in p or "prettier" in p) for p in all_paths)
    has_env_example = any(".env.example" in p or ".env.sample" in p for p in all_paths)
    has_license  = any("license" in p for p in all_paths)
    has_gitignore = any(".gitignore" in p for p in all_paths)
    file_count   = len([p for p in all_paths if any(p.endswith(e) for e in [".py",".js",".ts",".jsx",".tsx",".java",".go",".rb",".rs"])])

    # Score components
    quality = 0
    if has_readme:      quality += 20
    if has_tests:       quality += 25
    if has_ci:          quality += 20
    if has_docker:      quality += 10
    if has_lint:        quality += 8
    if has_license:     quality += 5
    if has_gitignore:   quality += 5
    if has_env_example: quality += 5
    if description:     quality += 2
    if stars > 0:       quality += min(10, stars * 2)

    # Verdict
    if quality >= 60 and not is_fork:
        verdict = "lead"
        verdict_reason = "Strong structure — good to showcase"
    elif quality >= 35 or (is_fork and stars > 0):
        verdict = "neutral"
        verdict_reason = "Average — show if relevant to role"
    else:
        verdict = "hide"
        verdict_reason = "Missing key signals (tests, README, CI)"

    return {
        "name":          name,
        "language":      lang,
        "stars":         stars,
        "forks":         forks,
        "open_issues":   open_issues,
        "is_fork":       is_fork,
        "description":   description,
        "quality_score": min(100, quality),
        "recency_score": recency_score,
        "days_since_push": days_since_push,
        "has_readme":    has_readme,
        "has_tests":     has_tests,
        "has_ci":        has_ci,
        "has_docker":    has_docker,
        "has_lint":      has_lint,
        "has_license":   has_license,
        "file_count":    file_count,
        "verdict":       verdict,
        "verdict_reason": verdict_reason,
        "url":           repo.get("html_url", ""),
    }


def score_activity(repos: list, profile: dict) -> dict:
    """Score developer activity (commits, recency, consistency)."""
    if not repos:
        return {"score": 0, "details": {}}

    own_repos = [r for r in repos if not r.get("fork")]
    total = len(repos)
    own_total = len(own_repos)

    pushed_dates = []
    for r in repos:
        pushed = r.get("pushed_at") or r.get("updated_at", "")
        if pushed:
            try:
                pushed_dates.append(dateparser.parse(pushed))
            except Exception:
                pass

    # How many repos pushed in last 90 / 180 / 365 days
    now = datetime.now(timezone.utc)
    recent_90  = sum(1 for d in pushed_dates if (now - d).days <= 90)
    recent_365 = sum(1 for d in pushed_dates if (now - d).days <= 365)

    # Stars / forks across all repos
    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    total_forks = sum(r.get("forks_count", 0) for r in repos)

    # Account age bonus
    age_years = profile.get("account_age_years", 0)

    # Score
    score = 0
    score += min(30, own_total * 3)          # own repos (max 30 pts at 10 repos)
    score += min(25, recent_90 * 5)           # active in last 90 days
    score += min(20, recent_365 * 2)          # active in last year
    score += min(15, total_stars * 1)         # total stars (max 15)
    score += min(10, age_years * 2)           # account age

    return {
        "score": min(100, score),
        "details": {
            "total_repos":     total,
            "own_repos":       own_total,
            "active_90d":      recent_90,
            "active_365d":     recent_365,
            "total_stars":     total_stars,
            "total_forks":     total_forks,
            "account_age_yrs": age_years,
        }
    }


def score_tech_diversity(repos: list, code_files: list) -> dict:
    """Score breadth and depth of tech stack."""
    # Languages from GitHub API
    languages = {}
    for r in repos:
        lang = r.get("language")
        if lang:
            languages[lang] = languages.get(lang, 0) + 1

    # Frameworks detected from code scan
    frameworks_found = {}
    for f in code_files:
        content = f.get("content", "")
        for fw, patterns in FRAMEWORK_PATTERNS.items():
            if fw not in frameworks_found:
                for p in patterns:
                    if re.search(p, content, re.IGNORECASE | re.MULTILINE):
                        frameworks_found[fw] = f.get("repo", "")
                        break

    # Score: diversity × depth
    lang_count = len(languages)
    fw_count   = len(frameworks_found)

    score = 0
    score += min(40, lang_count * 8)    # up to 5 languages
    score += min(40, fw_count * 4)      # up to 10 frameworks
    score += min(20, lang_count * 3)    # bonus for polyglot

    return {
        "score":       min(100, score),
        "languages":   languages,
        "frameworks":  frameworks_found,
        "lang_count":  lang_count,
        "fw_count":    fw_count,
    }


def score_community(profile: dict, repos: list) -> dict:
    """Score community engagement."""
    followers = profile.get("followers", 0)
    following = profile.get("following", 0)
    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    total_forks = sum(r.get("forks_count", 0) for r in repos)
    forked_by_others = total_forks  # repos others forked

    score = 0
    score += min(30, followers * 2)        # followers
    score += min(25, total_stars * 2)       # stars received
    score += min(20, forked_by_others * 3)  # forks by others
    score += min(15, profile.get("public_gists", 0) * 3)  # gists
    if following > 0 and followers > 0:
        ratio = followers / following
        score += min(10, ratio * 5)

    return {
        "score":       min(100, score),
        "followers":   followers,
        "following":   following,
        "total_stars": total_stars,
        "total_forks": total_forks,
    }


def collect_code_files(username: str, repos: list) -> list:
    """Collect actual code file contents from top repos."""
    code_files = []
    CODE_EXTS = {"py", "js", "ts", "jsx", "tsx", "java", "go", "rb", "cs", "cpp", "rs", "kt", "swift"}

    for repo in repos[:MAX_REPOS_FULL_SCAN]:
        if repo.get("fork"):
            continue
        name = repo.get("name", "")
        branch = repo.get("default_branch", "main")

        tree_data = _gh(
            f"https://api.github.com/repos/{username}/{name}/git/trees/{branch}?recursive=1"
        )
        if not tree_data:
            continue
        tree = tree_data.get("tree", [])

        code_items = [
            item for item in tree
            if item.get("type") == "blob"
            and item.get("path", "").split(".")[-1].lower() in CODE_EXTS
        ]

        fetched = 0
        for item in code_items[:MAX_FILES_PER_REPO]:
            path = item.get("path", "")
            ext  = path.split(".")[-1].lower()
            raw_url = f"https://raw.githubusercontent.com/{username}/{name}/{branch}/{path}"
            content = _raw(raw_url)
            if len(content.strip()) < 30:
                continue
            code_files.append({
                "repo":     name,
                "path":     path,
                "lang":     ext,
                "content":  content[:MAX_FILE_CHARS],
                "full_size": len(content),
            })
            fetched += 1
            if fetched >= MAX_FILES_PER_REPO:
                break

    return code_files


def scan_anti_patterns(code_files: list) -> list:
    """Fast regex scan for security and quality anti-patterns."""
    issues = []
    seen = set()
    for f in code_files:
        content = f["content"]
        for pattern, severity, msg in ANTI_PATTERNS:
            key = f"{f['repo']}::{msg}"
            if key in seen:
                continue
            match = re.search(pattern, content, re.IGNORECASE | re.MULTILINE)
            if match:
                # Find line number
                line_num = content[:match.start()].count("\n") + 1
                snippet = content.split("\n")[line_num - 1].strip()[:120]
                issues.append({
                    "repo":     f["repo"],
                    "file":     f["path"],
                    "line":     line_num,
                    "severity": severity,
                    "issue":    msg,
                    "snippet":  snippet,
                })
                seen.add(key)
    return issues


def score_code_quality(code_files: list, anti_pattern_issues: list) -> dict:
    """Rule-based code quality scoring across multiple dimensions."""
    if not code_files:
        return {
            "score": 30, "modularity": 30, "error_handling": 30,
            "documentation": 20, "naming": 40, "security": 50,
            "testing": 10, "architecture": 20,
        }

    total_content = "\n".join(f["content"] for f in code_files)

    # Modularity: functions, classes, modules
    func_count  = len(re.findall(r'\bdef \w+\b|\bfunction \w+\b|\b=>\s*\{', total_content))
    class_count = len(re.findall(r'\bclass \w+\b', total_content))
    modularity  = min(100, func_count * 3 + class_count * 5)

    # Error handling
    eh_count = len(re.findall(r'\btry\b|\bcatch\b|\bexcept\b|\bfinally\b', total_content, re.IGNORECASE))
    error_handling = min(100, eh_count * 8)

    # Documentation: comments, docstrings
    comment_count = len(re.findall(r'(#[^\n]+|//[^\n]+|/\*[\s\S]*?\*/|"""[\s\S]*?""")', total_content))
    documentation = min(100, comment_count * 4)

    # Naming conventions (camelCase / snake_case consistency)
    snake = len(re.findall(r'\b[a-z]+_[a-z_]+\b', total_content))
    camel = len(re.findall(r'\b[a-z]+[A-Z][a-zA-Z]+\b', total_content))
    naming = min(100, max(snake, camel) // 2)

    # Security (deduct for critical issues)
    critical_count = sum(1 for i in anti_pattern_issues if i["severity"] == "CRITICAL")
    high_count     = sum(1 for i in anti_pattern_issues if i["severity"] == "HIGH")
    security = max(0, 100 - critical_count * 30 - high_count * 15)

    # Testing signals
    test_patterns = len(re.findall(r'\bdef test_\b|\bdescribe\(|\bit\(|\bexpect\(', total_content))
    testing = min(100, test_patterns * 6)

    # Architecture signals (imports, separation of concerns)
    import_variety = len(set(re.findall(r'(?:import|from|require)\s+[\'"@]?(\w+)', total_content)))
    architecture = min(100, import_variety * 3)

    # Weighted composite score
    score = (
        modularity   * 0.20 +
        error_handling * 0.15 +
        documentation * 0.15 +
        naming        * 0.10 +
        security      * 0.20 +
        testing       * 0.10 +
        architecture  * 0.10
    )

    return {
        "score":          round(score),
        "modularity":     min(100, modularity),
        "error_handling": min(100, error_handling),
        "documentation":  min(100, documentation),
        "naming":         min(100, naming),
        "security":       security,
        "testing":        min(100, testing),
        "architecture":   min(100, architecture),
    }


# ─────────────────────────────────────────────────────────────────────────────
#  GEMINI AI ANALYSIS
# ─────────────────────────────────────────────────────────────────────────────

def _gemini_profile_summary(username: str, profile: dict, repos: list,
                             repo_scores: list, tech: dict,
                             code_quality: dict, anti_patterns: list,
                             code_files: list) -> dict:
    """Call Gemini for a nuanced, cited career assessment."""
    try:
        from services.gemini_client import ask_gemini_json

        repo_meta_str = "\n".join([
            f"  - {r['name']} [{r['language']}] ⭐{r['stars']} | "
            f"{'✅ tests' if r['has_tests'] else '❌ tests'} | "
            f"{'✅ CI' if r['has_ci'] else '❌ CI'} | "
            f"{'✅ README' if r['has_readme'] else '❌ README'} | "
            f"score={r['quality_score']}/100 | pushed {r['days_since_push']}d ago"
            for r in repo_scores[:8]
        ])

        issue_str = "\n".join([
            f"  - [{i['severity']}] {i['repo']}/{i['file']} L{i['line']}: {i['issue']}"
            for i in anti_patterns[:8]
        ]) or "  None detected."

        code_sample = "\n\n".join([
            f"=== {f['repo']}/{f['path']} ({f['full_size']} bytes) ===\n{f['content'][:800]}"
            for f in code_files[:5]
        ])

        frameworks_str = ", ".join(tech.get("frameworks", {}).keys()) or "None detected"
        langs_str = ", ".join(tech.get("languages", {}).keys()) or "None"

        prompt = f"""You are a brutally honest senior Staff Engineer doing a real code review of this GitHub profile.
Your job: assess the REAL skill level based on actual code evidence. Do NOT be encouraging unless justified.

DEVELOPER: github.com/{username}
ACCOUNT AGE: {profile.get('account_age_years', 0)} years
PUBLIC REPOS: {profile.get('public_repos', 0)}
FOLLOWERS: {profile.get('followers', 0)} | FOLLOWING: {profile.get('following', 0)}
LANGUAGES: {langs_str}
FRAMEWORKS DETECTED: {frameworks_str}

REPO HEALTH SUMMARY:
{repo_meta_str}

AUTOMATED SECURITY ISSUES:
{issue_str}

CODE QUALITY METRICS (rule-based):
  Modularity: {code_quality.get('modularity', 0)}/100
  Error Handling: {code_quality.get('error_handling', 0)}/100
  Documentation: {code_quality.get('documentation', 0)}/100
  Security: {code_quality.get('security', 0)}/100
  Testing: {code_quality.get('testing', 0)}/100
  Architecture: {code_quality.get('architecture', 0)}/100

ACTUAL CODE SAMPLES:
{code_sample[:3500]}

Return ONLY valid JSON (no markdown):
{{
  "developerLevel": "<Absolute Beginner|Beginner|Junior|Mid-Level|Senior|Staff>",
  "yearsExperienceEstimate": "<e.g. '0-6 months' or '1-2 years' or '5+ years'>",
  "percentileRank": <0-100 integer, honest estimate among ALL GitHub developers>,
  "careerVerdict": "<2-3 sentences. MUST cite actual repo/file names. Be specific and honest.>",
  "topStrengths": [
    "<specific strength with repo/file citation>",
    "<specific strength>",
    "<specific strength>"
  ],
  "criticalWeaknesses": [
    "<specific weakness with repo/file citation>",
    "<specific weakness>",
    "<specific weakness>"
  ],
  "whatBlocksNextLevel": "<The single most impactful thing holding this developer back. Cite their code.>",
  "repoVerdict": [
    {{
      "name": "<repo name>",
      "verdict": "<lead|neutral|hide>",
      "reason": "<specific reason based on code quality>",
      "aiScore": <0-100>
    }}
  ],
  "skillGaps": [
    {{
      "skill": "<missing skill>",
      "priority": "<high|medium|low>",
      "why": "<why it matters for their level>",
      "resource": "<one specific learning resource URL>"
    }}
  ],
  "hiringSignal": "<What a hiring manager would think in one honest sentence.>",
  "interviewReadiness": <0-100, honest score for technical interviews at their stated level>
}}"""

        result = ask_gemini_json(prompt)
        result["_source"] = "gemini-1.5-flash"
        return result

    except Exception as e:
        try:
            safe_msg = str(e).encode('ascii', errors='replace').decode('ascii')
            print(f"[GithubAnalyzer] Gemini unavailable ({safe_msg}). Using rule-based fallback.")
        except Exception:
            print("[GithubAnalyzer] Gemini unavailable. Using rule-based fallback.")
        return _rule_based_summary(username, profile, repos, repo_scores, tech, code_quality, anti_patterns)


def _rule_based_summary(username, profile, repos, repo_scores, tech, code_quality, anti_patterns):
    """Fallback rule-based summary when Gemini is unavailable."""
    has_tests = any(r["has_tests"] for r in repo_scores)
    has_ci    = any(r["has_ci"] for r in repo_scores)
    has_readme = any(r["has_readme"] for r in repo_scores)
    crit_issues = [i for i in anti_patterns if i["severity"] == "CRITICAL"]

    score = code_quality.get("score", 40)
    if score >= 75:
        level = "Senior"
    elif score >= 60:
        level = "Mid-Level"
    elif score >= 40:
        level = "Junior"
    else:
        level = "Beginner"

    strengths = []
    if has_tests:   strengths.append("Unit tests present in at least one repo")
    if has_ci:      strengths.append("CI/CD configured — shows engineering maturity")
    if has_readme:  strengths.append("READMEs present — good documentation habit")
    if tech.get("fw_count", 0) > 3: strengths.append(f"Diverse framework experience: {', '.join(list(tech.get('frameworks', {}).keys())[:4])}")
    if not strengths: strengths = ["Has public repositories"]

    weaknesses = []
    if not has_tests:  weaknesses.append("No unit tests detected — critical gap for mid+ level roles")
    if not has_ci:     weaknesses.append("No CI/CD pipeline — needed for production-level work")
    if crit_issues:    weaknesses.append(f"Security issues: {', '.join(i['issue'] for i in crit_issues[:2])}")
    if not weaknesses: weaknesses = ["Profile looks good overall"]

    return {
        "_source": "rule-based (add GEMINI_API_KEY for AI analysis)",
        "developerLevel": level,
        "yearsExperienceEstimate": "Unknown (add Gemini key for estimate)",
        "percentileRank": max(10, min(90, score - 10)),
        "careerVerdict": f"Based on {len(repos)} repos, this developer appears to be at {level} level. "
                         f"{'No tests found — primary career blocker.' if not has_tests else 'Some solid practices visible.'}",
        "topStrengths": strengths[:3],
        "criticalWeaknesses": weaknesses[:3],
        "whatBlocksNextLevel": "Add unit tests and CI/CD to at least 2 projects to demonstrate production readiness.",
        "repoVerdict": [
            {
                "name":    r["name"],
                "verdict": r["verdict"],
                "reason":  r["verdict_reason"],
                "aiScore": r["quality_score"],
            }
            for r in repo_scores[:5]
        ],
        "skillGaps": [
            {"skill": "Unit Testing",  "priority": "high",   "why": "Required for any mid+ role",           "resource": "https://docs.pytest.org/"} if not has_tests else None,
            {"skill": "CI/CD",         "priority": "high",   "why": "Expected at every professional role",  "resource": "https://docs.github.com/en/actions"} if not has_ci else None,
            {"skill": "Docker",        "priority": "medium", "why": "Standard for deployment & interviews", "resource": "https://docs.docker.com/get-started/"},
        ],
        "hiringSignal": f"{level} developer. {'Needs tests and CI.' if not has_tests else 'Shows decent engineering practices.'}",
        "interviewReadiness": max(20, score - 15),
    }


# ─────────────────────────────────────────────────────────────────────────────
#  MAIN ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────

def analyze_github_profile(username: str) -> dict:
    """
    Full GitHub profile analysis. Returns a comprehensive report dict.
    """
    print(f"[GithubAnalyzer] Starting analysis for: {username}")

    try:
        # 1. Fetch profile & repos
        profile = fetch_user_profile(username)
        repos = fetch_all_repos(username)
        if not repos:
            return {"error": f"No public repositories found for '{username}'.", "status_code": 404}
    except GitHubAPIError as e:
        return {"error": str(e), "status_code": e.status_code}


    print(f"[GithubAnalyzer] Found {len(repos)} repos. Starting deep scan...")

    # 2. Score each repo (top 12 for speed, all for language stats)
    repo_scores = []
    for repo in repos[:12]:
        rs = score_repo_quality(repo, username)
        repo_scores.append(rs)

    # 3. Collect actual code
    code_files = collect_code_files(username, repos)
    print(f"[GithubAnalyzer] Collected {len(code_files)} code files.")

    # 4. Anti-pattern scan
    anti_patterns = scan_anti_patterns(code_files)

    # 5. All scoring dimensions
    profile_score  = score_profile_completeness(profile)
    activity       = score_activity(repos, profile)
    tech_diversity = score_tech_diversity(repos, code_files)
    community      = score_community(profile, repos)
    code_quality   = score_code_quality(code_files, anti_patterns)
    repo_quality_avg = sum(r["quality_score"] for r in repo_scores) / max(len(repo_scores), 1)

    # 6. Gemini/rule-based summary
    ai_summary = _gemini_profile_summary(
        username, profile, repos, repo_scores,
        tech_diversity, code_quality, anti_patterns, code_files
    )

    # 7. Weighted final GitHub score
    github_score = round(
        profile_score["score"]  * 0.08 +
        activity["score"]       * 0.22 +
        repo_quality_avg        * 0.25 +
        tech_diversity["score"] * 0.15 +
        community["score"]      * 0.10 +
        code_quality["score"]   * 0.20
    )
    github_score = min(100, max(0, github_score))

    # 8. Skill distribution (for radar chart)
    skill_distribution = {
        "Backend":      min(100, len([fw for fw in tech_diversity.get("frameworks", {}) if fw in ["Flask","Django","FastAPI","Express","NestJS","Spring"]]) * 25),
        "Frontend":     min(100, len([fw for fw in tech_diversity.get("frameworks", {}) if fw in ["React","Vue","Angular","Next.js"]]) * 25),
        "DevOps":       min(100, (int(any(r["has_ci"] for r in repo_scores)) * 40) + (int(any(r["has_docker"] for r in repo_scores)) * 35) + 10),
        "Testing":      code_quality.get("testing", 0),
        "Security":     code_quality.get("security", 0),
        "Architecture": code_quality.get("architecture", 0),
        "Community":    community["score"],
        "Documentation": code_quality.get("documentation", 0),
    }

    print(f"[GithubAnalyzer] Analysis complete. Final score: {github_score}")

    return {
        # ── Top-level scores ──────────────────────────────────────
        "githubScore":        github_score,
        "developerLevel":     ai_summary.get("developerLevel", "Unknown"),
        "percentileRank":     ai_summary.get("percentileRank", 50),
        "interviewReadiness": ai_summary.get("interviewReadiness", 40),

        # ── Profile ───────────────────────────────────────────────
        "userProfile": profile,
        "profileCompleteness": profile_score,

        # ── Activity ──────────────────────────────────────────────
        "activityScore":  activity["score"],
        "activityDetails": activity["details"],

        # ── Tech Stack ────────────────────────────────────────────
        "techStack": {
            "languages":  tech_diversity["languages"],
            "frameworks": tech_diversity["frameworks"],
            "langCount":  tech_diversity["lang_count"],
            "fwCount":    tech_diversity["fw_count"],
        },

        # ── Repo Health ───────────────────────────────────────────
        "repoScores":     repo_scores,
        "repoQualityAvg": round(repo_quality_avg),
        "topRepos":       sorted(repo_scores, key=lambda r: r["quality_score"], reverse=True)[:3],
        "reposToImprove": [r for r in repo_scores if r["verdict"] == "hide"][:3],

        # ── Code Quality ──────────────────────────────────────────
        "codeQuality":   code_quality,
        "antiPatterns":  anti_patterns,

        # ── Community ─────────────────────────────────────────────
        "communityScore":   community["score"],
        "communityDetails": {
            "followers":   community["followers"],
            "following":   community["following"],
            "totalStars":  community["total_stars"],
            "totalForks":  community["total_forks"],
        },

        # ── Skill Radar ───────────────────────────────────────────
        "skillDistribution": skill_distribution,

        # ── Score Breakdown ───────────────────────────────────────
        "scoreBreakdown": {
            "profile":    round(profile_score["score"] * 0.08),
            "activity":   round(activity["score"] * 0.22),
            "repoQuality": round(repo_quality_avg * 0.25),
            "techDiversity": round(tech_diversity["score"] * 0.15),
            "community":  round(community["score"] * 0.10),
            "codeQuality": round(code_quality["score"] * 0.20),
        },

        # ── AI Summary ────────────────────────────────────────────
        "aiSummary": ai_summary,
        "aiSource":  ai_summary.get("_source", "rule-based"),

        # ── Legacy compatibility ──────────────────────────────────
        "overallScore":  github_score,
        "gaps":          [w for w in ai_summary.get("criticalWeaknesses", [])],
        "aiExplanation": ai_summary.get("careerVerdict", ""),
        "githubAnalysis": {
            "repos":           len(repos),
            "starredRepos":    sum(1 for r in repos if r.get("stargazers_count", 0) > 0),
            "stars":           sum(r.get("stargazers_count", 0) for r in repos),
            "repoList":        [{"name": r["name"], "stars": r.get("stargazers_count", 0), "url": r.get("html_url","")} for r in repos[:20]],
        },

        # ── Meta ──────────────────────────────────────────────────
        "analyzedAt":   datetime.now(timezone.utc).isoformat(),
        "username":     username,
    }

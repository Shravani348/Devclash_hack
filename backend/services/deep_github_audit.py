"""
Deep GitHub Audit Service — Powered by Google Gemini (FREE)
Reads EVERY file across ALL repos and produces a brutally honest code quality report
with specific file-level issues, anti-patterns, and traceable feedback.
"""
import requests
import os
import re
from dotenv import load_dotenv
from services.gemini_client import ask_gemini_json

def get_github_headers():
    load_dotenv(override=True)
    token = os.getenv("GITHUB_TOKEN", "").strip()
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token and token != "your_github_token_here":
        headers["Authorization"] = f"token {token}"
    return headers

MAX_REPOS = 6
MAX_FILES_PER_REPO = 15
MAX_CONTENT_CHARS = 1500


def _get_all_repos(username: str) -> list:
    repos = []
    page = 1
    while len(repos) < 30:
        try:
            resp = requests.get(
                f"https://api.github.com/users/{username}/repos?sort=updated&per_page=30&page={page}",
                headers=get_github_headers(), timeout=8
            )
            batch = resp.json() if resp.status_code == 200 else []
            if not batch:
                break
            repos.extend(batch)
            page += 1
            if len(batch) < 30:
                break
        except:
            break
    return repos


def _collect_code_files(username: str, repos: list) -> dict:
    """Collect actual code file contents from repos for AI analysis."""
    collected = {
        "files": [],          # [{repo, path, content, lang, size}]
        "tech_stack": set(),
        "repo_meta": [],      # [{name, stars, forks, lang, has_tests, has_readme, has_ci}]
        "total_repos": len(repos),
        "total_files_scanned": 0,
    }

    for repo in repos[:MAX_REPOS]:
        repo_name = repo.get("name", "")
        branch = repo.get("default_branch", "main")
        lang = repo.get("language") or ""
        stars = repo.get("stargazers_count", 0)
        forks = repo.get("fork_count", repo.get("forks_count", 0))

        if lang:
            collected["tech_stack"].add(lang)

        repo_info = {
            "name": repo_name,
            "stars": stars,
            "forks": forks,
            "language": lang,
            "has_tests": False,
            "has_readme": False,
            "has_ci": False,
            "has_dockerfile": False,
            "file_count": 0,
            "issues": []
        }

        try:
            tree = requests.get(
                f"https://api.github.com/repos/{username}/{repo_name}/git/trees/{branch}?recursive=1",
                headers=get_github_headers(), timeout=8
            ).json().get("tree", [])
        except:
            continue

        code_files = []
        for item in tree:
            if item.get("type") != "blob":
                continue
            path = item.get("path", "")
            name = path.split("/")[-1].lower()
            ext = name.split(".")[-1] if "." in name else ""

            # Detect structure
            if "readme" in name:
                repo_info["has_readme"] = True
            if any(x in path.lower() for x in ["test_", ".test.", ".spec.", "tests/", "__tests__", "conftest"]):
                repo_info["has_tests"] = True
            if any(x in name for x in ["dockerfile", "docker-compose"]):
                repo_info["has_dockerfile"] = True
            if ".github/workflows" in path or ".travis.yml" in name or "jenkinsfile" in name.lower():
                repo_info["has_ci"] = True

            # Detect tech stack from files
            tech_map = {
                "py": "Python", "js": "JavaScript", "ts": "TypeScript",
                "jsx": "React", "tsx": "React/TypeScript", "java": "Java",
                "go": "Go", "rb": "Ruby", "cs": "C#", "cpp": "C++",
                "rs": "Rust", "kt": "Kotlin", "swift": "Swift"
            }
            if ext in tech_map:
                collected["tech_stack"].add(tech_map[ext])
            if name == "package.json":
                collected["tech_stack"].add("Node.js")
            if name == "requirements.txt":
                collected["tech_stack"].add("Python")
            if "docker" in name:
                collected["tech_stack"].add("Docker")

            if ext in ("py", "js", "ts", "jsx", "tsx", "java", "go", "rb", "cs", "cpp", "rs"):
                code_files.append({"path": path, "ext": ext})

        repo_info["file_count"] = len(code_files)
        collected["repo_meta"].append(repo_info)
        collected["total_files_scanned"] += len(code_files)

        # Fetch actual content (top files)
        fetched = 0
        for file in code_files[:MAX_FILES_PER_REPO]:
            if fetched >= MAX_FILES_PER_REPO:
                break
            raw_url = f"https://raw.githubusercontent.com/{username}/{repo_name}/{branch}/{file['path']}"
            try:
                content = requests.get(raw_url, headers=get_github_headers(), timeout=4).text
                if len(content.strip()) < 30:
                    continue
                collected["files"].append({
                    "repo": repo_name,
                    "path": file["path"],
                    "content": content[:MAX_CONTENT_CHARS],
                    "full_size": len(content),
                    "lang": file["ext"]
                })
                fetched += 1
            except:
                continue

    collected["tech_stack"] = sorted(collected["tech_stack"])
    return collected


def _quick_pattern_scan(files: list) -> list:
    """Fast pattern-based scan for critical issues (runs before LLM)."""
    issues = []

    ANTI_PATTERNS = [
        (r'password\s*=\s*["\'][^"\']{3,}["\']', "CRITICAL", "Hardcoded password detected"),
        (r'api_key\s*=\s*["\'][^"\']{10,}["\']', "CRITICAL", "Hardcoded API key detected"),
        (r'secret\s*=\s*["\'][^"\']{5,}["\']', "HIGH", "Hardcoded secret detected"),
        (r'SELECT \* FROM', "MEDIUM", "SELECT * is a performance anti-pattern — select specific columns"),
        (r'eval\s*\(', "HIGH", "eval() usage — major security risk"),
        (r'exec\s*\(', "HIGH", "exec() usage — potential code injection risk"),
        (r'\.innerHTML\s*=', "HIGH", "innerHTML assignment — XSS vulnerability risk"),
        (r'console\.log\(', "LOW", "console.log left in production code"),
        (r'TODO|FIXME|HACK|XXX', "LOW", "Unresolved TODO/FIXME comments"),
        (r'catch\s*\(\s*e\s*\)\s*\{\s*\}', "MEDIUM", "Empty catch block — errors are being silently swallowed"),
        (r'except:\s*pass', "MEDIUM", "Bare except: pass — silently swallowing errors"),
        (r'md5\s*\(', "HIGH", "MD5 used for hashing — insecure, use bcrypt or SHA-256"),
        (r'http://', "MEDIUM", "Hardcoded HTTP URL — should be HTTPS"),
    ]

    for f in files:
        content = f["content"]
        for pattern, severity, msg in ANTI_PATTERNS:
            if re.search(pattern, content, re.IGNORECASE):
                line_num = None
                for i, line in enumerate(content.split("\n"), 1):
                    if re.search(pattern, line, re.IGNORECASE):
                        line_num = i
                        break
                issues.append({
                    "repo": f["repo"],
                    "file": f["path"],
                    "line": line_num,
                    "severity": severity,
                    "issue": msg,
                    "snippet": next((l.strip() for l in content.split("\n") if re.search(pattern, l, re.IGNORECASE)), "")[:120]
                })
                break  # one issue per pattern per file

    return issues


def run_deep_audit(username: str) -> dict:
    """
    Main entry point for the deep GitHub audit.
    Returns a comprehensive audit report.
    """
    repos = _get_all_repos(username)
    if not repos:
        return {"error": f"No public repositories found for GitHub user '{username}'."}

    # Collect all data
    data = _collect_code_files(username, repos)
    pattern_issues = _quick_pattern_scan(data["files"])

    try:
        return _gemini_deep_audit(username, repos, data, pattern_issues)
    except Exception as e:
        print(f"[DeepGithubAudit] Gemini failed: {e}. Using rule-based audit.")
        return _rule_based_deep_audit(username, repos, data, pattern_issues)


def _gemini_deep_audit(username, repos, data, pattern_issues) -> dict:
    """Full Gemini-powered deep code audit."""
    # Build code context
    code_samples = []
    for f in data["files"][:8]:
        code_samples.append(f"=== {f['repo']}/{f['path']} ({f['full_size']} bytes) ===\n{f['content']}")

    repo_meta_str = "\n".join([
        f"- {r['name']}: {r['language'] or 'Unknown'}, ⭐{r['stars']}, "
        f"{'✅ has tests' if r['has_tests'] else '❌ no tests'}, "
        f"{'✅ has README' if r['has_readme'] else '❌ no README'}, "
        f"{'✅ CI/CD' if r['has_ci'] else '❌ no CI'}, {r['file_count']} files"
        for r in data["repo_meta"]
    ])

    pattern_issues_str = "\n".join([
        f"- [{i['severity']}] {i['repo']}/{i['file']} line {i['line']}: {i['issue']}"
        for i in pattern_issues[:10]
    ]) if pattern_issues else "No critical pattern issues detected."

    code_block = "\n\n".join(code_samples)

    prompt = f"""You are a brutally honest senior staff engineer doing a 360-degree code audit. Your job is to assess this developer's REAL skill level based on their actual code.

DEVELOPER: {username}
TOTAL REPOS: {data['total_repos']} | ANALYZED: {len(data['repo_meta'])}
TECH STACK DETECTED: {', '.join(data['tech_stack'])}
FILES SCANNED: {data['total_files_scanned']}

REPO SUMMARY:
{repo_meta_str}

AUTOMATED PATTERN ISSUES FOUND:
{pattern_issues_str}

ACTUAL CODE SAMPLES:
{code_block[:4500]}

Perform a deep, honest audit. Return ONLY valid JSON (no markdown):
{{
  "overallScore": <0-100 integer, be honest and strict>,
  "developerLevel": "<Beginner|Junior|Mid-Level|Senior|Staff>",
  "percentileRank": <0-100, estimated percentile among all developers>,
  "yearsExperienceEstimate": "<e.g., '0-1 years' or '2-3 years'>",
  "techStackDetected": {data['tech_stack']},
  "codeQualityScores": {{
    "modularity": <0-100>,
    "errorHandling": <0-100>,
    "testCoverage": <0-100>,
    "documentation": <0-100>,
    "namingConventions": <0-100>,
    "security": <0-100>,
    "architecturalPatterns": <0-100>,
    "codeReuse": <0-100>
  }},
  "repoHealthSummary": [
    {{
      "name": "<repo name>",
      "verdict": "<lead|neutral|hide>",
      "reason": "<specific reason based on code quality seen>",
      "score": <0-100>
    }}
  ],
  "specificCodeIssues": [
    {{
      "repo": "<repo name>",
      "file": "<file path>",
      "line": <line number or null>,
      "severity": "<CRITICAL|HIGH|MEDIUM|LOW>",
      "issue": "<specific issue title>",
      "detail": "<exactly what is wrong and why a senior engineer would reject it in code review>",
      "fix": "<exactly how to fix it>"
    }}
  ],
  "antiPatterns": [
    {{
      "pattern": "<anti-pattern name>",
      "where": "<repo/file>",
      "impact": "<what this costs the developer in a real interview>"
    }}
  ],
  "strengths": [
    "<specific strength seen in the actual code — cite repo/file>"
  ],
  "whatBlocksNextLevel": "<the single most impactful thing standing between this developer and the next level — be specific and cite their code>",
  "careerLevelVerdict": "<2-3 sentence brutally honest assessment of demonstrated ability vs claimed experience. Cite specific evidence from the code.>"
}}

Be specific. Cite actual file names. Be honest — do NOT be encouraging unless the code genuinely deserves it."""

    result = ask_gemini_json(prompt)
    result["_source"] = "gemini-ai"
    result["patternIssues"] = pattern_issues
    result["repoMeta"] = data["repo_meta"]
    return result


def _rule_based_deep_audit(username, repos, data, pattern_issues) -> dict:
    """Rule-based fallback."""
    repo_meta = data["repo_meta"]
    files = data["files"]
    tech = data["tech_stack"]

    has_tests = any(r["has_tests"] for r in repo_meta)
    has_readme = any(r["has_readme"] for r in repo_meta)
    has_ci = any(r["has_ci"] for r in repo_meta)
    critical_issues = [i for i in pattern_issues if i["severity"] == "CRITICAL"]

    score = 50
    if has_tests: score += 10
    if has_readme: score += 5
    if has_ci: score += 8
    if not critical_issues: score += 10
    score = min(score, 85)

    level = "Beginner" if score < 40 else ("Junior" if score < 60 else ("Mid-Level" if score < 75 else "Senior"))

    return {
        "_source": "rule-based",
        "_note": "Add GEMINI_API_KEY to backend/.env for AI-powered deep audit",
        "overallScore": score,
        "developerLevel": level,
        "percentileRank": score - 10,
        "yearsExperienceEstimate": "1-2 years",
        "techStackDetected": tech,
        "codeQualityScores": {
            "modularity": 55,
            "errorHandling": 40 if not has_tests else 60,
            "testCoverage": 80 if has_tests else 10,
            "documentation": 80 if has_readme else 20,
            "namingConventions": 55,
            "security": 30 if critical_issues else 65,
            "architecturalPatterns": 50,
            "codeReuse": 45
        },
        "repoHealthSummary": [
            {
                "name": r["name"],
                "verdict": "lead" if (r["has_readme"] and r["has_tests"]) else ("neutral" if r["has_readme"] else "hide"),
                "reason": "Has tests and README — show this" if (r["has_readme"] and r["has_tests"]) else ("No tests found" if not r["has_tests"] else "Missing README"),
                "score": 70 if r["has_tests"] else 40
            }
            for r in repo_meta[:5]
        ],
        "specificCodeIssues": pattern_issues[:5],
        "antiPatterns": [
            {"pattern": "No unit tests", "where": "All repos", "impact": "Immediately disqualifies from most mid+ level roles"}
        ] if not has_tests else [],
        "strengths": [f"Working with {', '.join(tech[:3])}" if tech else "Has public repositories"],
        "whatBlocksNextLevel": "Add unit tests and CI/CD to at least one project to demonstrate engineering discipline.",
        "careerLevelVerdict": f"Based on {len(repos)} repos, this developer appears to be at {level} level. {'No unit tests found across any repo — this is the primary blocker.' if not has_tests else 'Some good practices detected.'}"
    }

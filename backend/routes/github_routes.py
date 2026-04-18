from flask import Blueprint, request, jsonify
import requests
import os
import json
from services.analysis_service import analyze_repos, get_ai_explanation, HEADERS

github_bp = Blueprint("github", __name__)

@github_bp.route("/analyze", methods=["POST"])
def analyze():
    # Handle both JSON and FormData
    if request.is_json:
        data = request.json
        username = data.get("username")
        github_url = f"https://github.com/{username}" if username else None
    else:
        username = request.form.get("username")
        github_url = request.form.get("githubUrl") or (f"https://github.com/{username}" if username else None)

    print("USERNAME RECEIVED:", username)

    total_repos = 0
    total_stars = 0
    starred_repos = 0
    github_score = 0
    gaps = []
    explanation = "No GitHub analysis."
    scores = {"backend": 0, "api": 0, "auth": 0, "testing": 0}
    repo_list = []
    starred_repo_list = []
    user_profile = {}
    analysis_result = {
        "has_backend": False, "has_api_calls": False,
        "has_auth": False, "has_testing": False, "has_readme": False
    }

    if username:
        # Fetch user profile
        profile_resp = requests.get(f"https://api.github.com/users/{username}", headers=HEADERS)
        if profile_resp.status_code == 200:
            p = profile_resp.json()
            user_profile = {
                "login":      p.get("login", username),
                "name":       p.get("name") or username,
                "avatar_url": p.get("avatar_url", ""),
                "bio":        p.get("bio") or "",
                "location":   p.get("location") or "",
                "followers":  p.get("followers", 0),
                "following":  p.get("following", 0),
                "html_url":   p.get("html_url", f"https://github.com/{username}"),
            }

        repos_url = f"https://api.github.com/users/{username}/repos"
        response = requests.get(repos_url, headers=HEADERS)

        if response.status_code == 200:
            repos = response.json()
            if isinstance(repos, list):
                total_repos = len(repos)
                total_stars = sum(r.get("stargazers_count", 0) for r in repos if isinstance(r, dict))
                starred_repos = sum(1 for r in repos if isinstance(r, dict) and r.get("stargazers_count", 0) > 0)
                repo_list = [
                    {"name": r.get("name"), "stars": r.get("stargazers_count", 0), "url": r.get("html_url", "")}
                    for r in repos if isinstance(r, dict)
                ]
                starred_repo_list = [r for r in repo_list if r["stars"] > 0]
                github_score = min(100, total_repos * 5 + total_stars)

                try:
                    gaps, analysis_result, scores = analyze_repos(repos)
                except Exception as e:
                    print("ANALYSIS ERROR:", e)
                    gaps = ["Error analyzing repositories"]
                    analysis_result = {
                        "has_backend": False, "has_api_calls": False,
                        "has_auth": False, "has_testing": False, "has_readme": False
                    }
                    scores = {"backend": 0, "api": 0, "auth": 0, "testing": 0}
                    repo_list = []
                    starred_repo_list = []

                try:
                    explanation = get_ai_explanation(repos, analysis_result)
                except Exception as e:
                    print("AI ERROR:", e)
                    explanation = "AI analysis temporarily unavailable."
        elif response.status_code == 403:
            return jsonify({"error": "GitHub API rate limit exceeded"}), 429


    overall_score = github_score

    # Pass AI text directly without JSON parsing
    explanation_text = explanation if explanation else "No AI insight available"

    return jsonify({
        "githubScore": github_score,
        "overallScore": overall_score,
        "gaps": gaps,
        "aiExplanation": explanation_text,
        "skillDistribution": scores,
        "userProfile": user_profile,
        "githubAnalysis": {
            "repos": total_repos,
            "starredRepos": starred_repos,
            "stars": total_stars,
            "repoList": repo_list,
            "starredRepoList": starred_repo_list,
        }
    })

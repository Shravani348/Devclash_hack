"""
GitHub Routes — /api/github/*
Uses the new comprehensive github_analyzer.py
with MongoDB caching via db_service.py
"""

from flask import Blueprint, request, jsonify
from services.github_analyzer import analyze_github_profile
from services.db_service import (
    save_github_analysis, get_cached_github_analysis,
    get_analysis_history, get_leaderboard, db_health
)

github_bp = Blueprint("github", __name__)


@github_bp.route("/analyze", methods=["POST"])
def analyze():
    """
    POST /api/github/analyze
    Body (JSON or form): { "username": "octocat" }
    Optional: { "force": true } to bypass cache
    """
    # Accept JSON or multipart form
    if request.is_json:
        data = request.get_json() or {}
    else:
        data = request.form.to_dict()

    username = (data.get("username") or "").strip().lstrip("@")
    if not username:
        return jsonify({"error": "GitHub username is required"}), 400

    force_refresh = str(data.get("force", "false")).lower() == "true"

    # ── Cache check ──────────────────────────────────────────────────────────
    if not force_refresh:
        cached = get_cached_github_analysis(username)
        if cached:
            return jsonify(cached)

    # ── Run full analysis ────────────────────────────────────────────────────
    result = analyze_github_profile(username)
    if "error" in result:
        status_code = result.get("status_code", 404 if "not found" in result["error"].lower() else 500)
        return jsonify(result), status_code

    # ── Persist to DB ────────────────────────────────────────────────────────
    save_github_analysis(username, result)

    return jsonify(result)


@github_bp.route("/history/<username>", methods=["GET"])
def analysis_history(username):
    """GET /api/github/history/:username — score history for progress tracking."""
    limit = min(int(request.args.get("limit", 10)), 50)
    history = get_analysis_history(username.strip(), limit=limit)
    return jsonify({"username": username, "history": history})


@github_bp.route("/leaderboard", methods=["GET"])
def leaderboard():
    """GET /api/github/leaderboard — top developers by score."""
    limit = min(int(request.args.get("limit", 20)), 100)
    board = get_leaderboard(limit=limit)
    return jsonify({"leaderboard": board})


@github_bp.route("/db-health", methods=["GET"])
def database_health():
    """GET /api/github/db-health — check database connectivity."""
    return jsonify(db_health())

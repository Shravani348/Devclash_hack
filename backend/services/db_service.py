"""
Database Service — MongoDB Persistence Layer
=============================================
Saves and caches analysis results so users don't wait for re-scans.
Cache TTL: 24 hours per username per analysis type.

Falls back gracefully if MongoDB is not configured.
"""

import os
import json
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI   = os.getenv("MONGODB_URI", "")
CACHE_TTL_HRS = 24   # hours before a cached result is considered stale

_client = None
_db     = None


def _get_db():
    """Lazy MongoDB connection. Returns None if not configured."""
    global _client, _db
    if _db is not None:
        return _db
    if not MONGODB_URI or MONGODB_URI in ("mongodb://localhost:27017/dcis", ""):
        # Try local connection
        uri = MONGODB_URI or "mongodb://localhost:27017/dcis"
    else:
        uri = MONGODB_URI
    try:
        from pymongo import MongoClient
        _client = MongoClient(uri, serverSelectionTimeoutMS=3000)
        # Ping to verify connection
        _client.admin.command("ping")
        _db = _client["dcis"]
        print(f"[DB] Connected to MongoDB at {uri}")
        return _db
    except Exception as e:
        print(f"[DB] MongoDB unavailable ({e}). Running without persistence.")
        return None


# ─── GitHub Analysis ─────────────────────────────────────────────────────────

def save_github_analysis(username: str, result: dict) -> bool:
    """Save a GitHub analysis result. Returns True on success."""
    db = _get_db()
    if not db:
        return False
    try:
        doc = {
            "username":    username.lower(),
            "result":      result,
            "analyzed_at": datetime.now(timezone.utc),
            "type":        "github_analysis",
        }
        db.github_analyses.update_one(
            {"username": username.lower()},
            {"$set": doc},
            upsert=True
        )
        # Also push to history
        db.analysis_history.insert_one({
            "username":    username.lower(),
            "type":        "github_analysis",
            "score":       result.get("githubScore", 0),
            "level":       result.get("developerLevel", "Unknown"),
            "analyzed_at": datetime.now(timezone.utc),
        })
        return True
    except Exception as e:
        print(f"[DB] Save error: {e}")
        return False


def get_cached_github_analysis(username: str) -> dict | None:
    """Return cached GitHub analysis if fresh (< 24h), else None."""
    db = _get_db()
    if not db:
        return None
    try:
        doc = db.github_analyses.find_one({"username": username.lower()})
        if not doc:
            return None
        analyzed_at = doc.get("analyzed_at")
        if not analyzed_at:
            return None
        age = datetime.now(timezone.utc) - analyzed_at.replace(tzinfo=timezone.utc)
        if age < timedelta(hours=CACHE_TTL_HRS):
            print(f"[DB] Cache hit for {username} (age: {age})")
            result = doc["result"]
            result["_cached"] = True
            result["_cacheAge"] = str(age).split(".")[0]
            return result
        return None  # stale
    except Exception as e:
        print(f"[DB] Cache read error: {e}")
        return None


def get_analysis_history(username: str, limit: int = 10) -> list:
    """Return past analysis scores for a user (for progress tracking)."""
    db = _get_db()
    if not db:
        return []
    try:
        cursor = db.analysis_history.find(
            {"username": username.lower()},
            sort=[("analyzed_at", -1)],
            limit=limit
        )
        history = []
        for doc in cursor:
            doc.pop("_id", None)
            if "analyzed_at" in doc:
                doc["analyzed_at"] = doc["analyzed_at"].isoformat()
            history.append(doc)
        return history
    except Exception as e:
        print(f"[DB] History read error: {e}")
        return []


# ─── User Sessions (for auth, if needed later) ───────────────────────────────

def save_user(email: str, username: str, password_hash: str) -> bool:
    """Save a new user account."""
    db = _get_db()
    if not db:
        return False
    try:
        existing = db.users.find_one({"email": email.lower()})
        if existing:
            return False  # already exists
        db.users.insert_one({
            "email":         email.lower(),
            "username":      username,
            "password_hash": password_hash,
            "created_at":    datetime.now(timezone.utc),
        })
        return True
    except Exception as e:
        print(f"[DB] User save error: {e}")
        return False


def find_user(email: str) -> dict | None:
    """Find a user by email."""
    db = _get_db()
    if not db:
        return None
    try:
        doc = db.users.find_one({"email": email.lower()})
        if doc:
            doc.pop("_id", None)
        return doc
    except Exception as e:
        print(f"[DB] User find error: {e}")
        return None


# ─── Leaderboard ─────────────────────────────────────────────────────────────

def get_leaderboard(limit: int = 20) -> list:
    """Return top developers by GitHub score (for a community board)."""
    db = _get_db()
    if not db:
        return []
    try:
        pipeline = [
            {"$sort": {"analyzed_at": -1}},
            {"$group": {
                "_id":      "$username",
                "score":    {"$first": "$score"},
                "level":    {"$first": "$level"},
                "analyzed": {"$first": "$analyzed_at"},
            }},
            {"$sort":  {"score": -1}},
            {"$limit": limit},
        ]
        results = list(db.analysis_history.aggregate(pipeline))
        for r in results:
            r.pop("_id", None)
            if "analyzed" in r:
                r["analyzed"] = r["analyzed"].isoformat()
        return results
    except Exception as e:
        print(f"[DB] Leaderboard error: {e}")
        return []


def db_health() -> dict:
    """Check DB connection health."""
    db = _get_db()
    if db is None:
        return {"status": "disconnected", "message": "Set MONGODB_URI in .env to enable persistence"}
    try:
        db.client.admin.command("ping")
        counts = {
            "analyses":  db.github_analyses.count_documents({}),
            "users":     db.users.count_documents({}),
            "history":   db.analysis_history.count_documents({}),
        }
        return {"status": "connected", "collections": counts}
    except Exception as e:
        return {"status": "error", "message": str(e)}

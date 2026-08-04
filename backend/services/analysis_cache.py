"""
Analysis Cache — SQLite-backed, SHA-256 keyed
===============================================
Caches full JSON analysis results so identical resume+JD pairs are served
instantly without an LLM call.

TTL: 7 days (configurable via CACHE_TTL_DAYS env var)
Storage: backend/cache/analysis_cache.db (SQLite, no server required)
"""

import os
import json
import hashlib
import sqlite3
from datetime import datetime, timezone, timedelta

CACHE_TTL_DAYS = int(os.getenv("CACHE_TTL_DAYS", "7"))
_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "cache", "analysis_cache.db")


def _get_conn() -> sqlite3.Connection:
    """Return a SQLite connection, creating the DB and table if needed."""
    os.makedirs(os.path.dirname(_DB_PATH), exist_ok=True)
    conn = sqlite3.connect(_DB_PATH, check_same_thread=False)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS analysis_cache (
            cache_key   TEXT PRIMARY KEY,
            result_json TEXT NOT NULL,
            created_at  TEXT NOT NULL
        )
    """)
    conn.commit()
    return conn


def make_cache_key(resume_text: str, jd: str = "") -> str:
    """SHA-256 hash of resume text + job description."""
    payload = (resume_text.strip() + "|JD|" + jd.strip()).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def get_cached(cache_key: str) -> dict | None:
    """
    Return the cached result if it exists and is within TTL.
    Returns None on cache miss, expired entry, or any error.
    """
    try:
        conn = _get_conn()
        row = conn.execute(
            "SELECT result_json, created_at FROM analysis_cache WHERE cache_key = ?",
            (cache_key,)
        ).fetchone()
        conn.close()

        if not row:
            return None

        result_json, created_at_str = row
        created_at = datetime.fromisoformat(created_at_str)
        age = datetime.now(timezone.utc) - created_at.replace(tzinfo=timezone.utc)

        if age > timedelta(days=CACHE_TTL_DAYS):
            print(f"[Cache] Stale entry (age={age}). Cache miss.")
            return None

        print(f"[Cache] HIT — age={str(age).split('.')[0]}, key={cache_key[:12]}...")
        result = json.loads(result_json)
        result["_cached"] = True
        result["_cacheAge"] = str(age).split(".")[0]
        return result

    except Exception as e:
        print(f"[Cache] Read error: {e}")
        return None


def set_cached(cache_key: str, result: dict) -> bool:
    """
    Store a result in the cache. Overwrites any existing entry for that key.
    Returns True on success.
    """
    try:
        # Don't cache fallback results
        if result.get("_source") == "fallback":
            return False

        conn = _get_conn()
        conn.execute(
            """INSERT OR REPLACE INTO analysis_cache (cache_key, result_json, created_at)
               VALUES (?, ?, ?)""",
            (cache_key, json.dumps(result), datetime.now(timezone.utc).isoformat())
        )
        conn.commit()
        conn.close()
        print(f"[Cache] STORED key={cache_key[:12]}...")
        return True
    except Exception as e:
        print(f"[Cache] Write error: {e}")
        return False


def invalidate(cache_key: str) -> bool:
    """Remove a specific entry from the cache (force re-analyze)."""
    try:
        conn = _get_conn()
        conn.execute("DELETE FROM analysis_cache WHERE cache_key = ?", (cache_key,))
        conn.commit()
        conn.close()
        print(f"[Cache] INVALIDATED key={cache_key[:12]}...")
        return True
    except Exception as e:
        print(f"[Cache] Invalidate error: {e}")
        return False


def cache_stats() -> dict:
    """Return basic stats about the cache."""
    try:
        conn = _get_conn()
        total = conn.execute("SELECT COUNT(*) FROM analysis_cache").fetchone()[0]
        fresh_cutoff = (datetime.now(timezone.utc) - timedelta(days=CACHE_TTL_DAYS)).isoformat()
        fresh = conn.execute(
            "SELECT COUNT(*) FROM analysis_cache WHERE created_at > ?", (fresh_cutoff,)
        ).fetchone()[0]
        conn.close()
        return {"total_entries": total, "fresh_entries": fresh, "ttl_days": CACHE_TTL_DAYS}
    except Exception as e:
        return {"error": str(e)}

"""
Audit Logger — Structured JSON logging for resume analysis requests
====================================================================
Writes one JSON line per analysis to backend/logs/audit.jsonl

Fields per entry:
  timestamp        ISO-8601 UTC
  provider         which LLM served the request (gemini-ai / fallback / cache)
  response_time_ms round-trip time in milliseconds
  cache_hit        bool — was this served from cache?
  success          bool — did the analysis succeed?
  error            str or null — error message if failed
  resume_hash      first 12 chars of cache key (for correlation, not PII)
"""

import os
import json
from datetime import datetime, timezone

_LOG_DIR  = os.path.join(os.path.dirname(__file__), "..", "logs")
_LOG_FILE = os.path.join(_LOG_DIR, "audit.jsonl")


def log_analysis(
    provider: str,
    response_time_ms: int,
    cache_hit: bool,
    success: bool,
    error: str | None = None,
    resume_hash: str = "",
) -> None:
    """
    Append one structured JSON log entry for a resume analysis request.
    Never raises — logging failures are silently swallowed so they can't
    break the main analysis flow.
    """
    try:
        os.makedirs(_LOG_DIR, exist_ok=True)
        entry = {
            "timestamp":        datetime.now(timezone.utc).isoformat(),
            "provider":         provider,
            "response_time_ms": response_time_ms,
            "cache_hit":        cache_hit,
            "success":          success,
            "error":            error,
            "resume_hash":      resume_hash[:12] if resume_hash else "",
        }
        with open(_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception as e:
        print(f"[AuditLogger] Failed to write log: {e}")


def get_recent_logs(n: int = 50) -> list:
    """Return the last n log entries as a list of dicts."""
    try:
        if not os.path.exists(_LOG_FILE):
            return []
        with open(_LOG_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()
        # Last n lines, newest first
        return [json.loads(l) for l in reversed(lines[-n:]) if l.strip()]
    except Exception as e:
        print(f"[AuditLogger] Failed to read logs: {e}")
        return []

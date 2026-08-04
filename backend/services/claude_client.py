"""
Claude AI Client — Shared helper for all services
===================================================
Uses the official Anthropic Python SDK with claude-sonnet-4-6.

Features:
- Loads ANTHROPIC_API_KEY from .env via python-dotenv (never hardcoded)
- Strips markdown code fences from responses before JSON parsing
- Retries ONCE on invalid JSON with an explicit correction prompt
- Raises on failure — never silently swallows errors
"""

import os
import json
import re
from dotenv import load_dotenv

load_dotenv()


def _get_api_key() -> str:
    """Load and validate the Anthropic API key from environment."""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise ValueError(
            "ANTHROPIC_API_KEY is not set. "
            "Add it to backend/.env as: ANTHROPIC_API_KEY=sk-ant-..."
        )
    return api_key


def _strip_markdown_fences(text: str) -> str:
    """Remove ```json ... ``` or ``` ... ``` wrappers from a string."""
    # Remove opening fence (with optional language tag like 'json')
    text = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.IGNORECASE)
    # Remove closing fence
    text = re.sub(r"\s*```$", "", text.strip())
    return text.strip()


def _call_claude(prompt: str) -> str:
    """Make a single call to Claude and return the raw text response."""
    import anthropic

    api_key = _get_api_key()
    client = anthropic.Anthropic(api_key=api_key)

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[
            {"role": "user", "content": prompt}
        ],
    )
    # Extract text from the first content block
    return message.content[0].text.strip()


def ask_claude_json(prompt: str) -> dict:
    """
    Send a prompt to Claude and parse the response as JSON.

    Behaviour:
    1. Calls Claude with the given prompt.
    2. Strips any markdown code fences from the response.
    3. Parses the result with json.loads().
    4. On JSONDecodeError, retries ONCE with an explicit correction message
       appended to the original prompt.
    5. If the retry also fails, raises the exception — never silently swallows it.

    Args:
        prompt: The full prompt text to send.

    Returns:
        A Python dict parsed from Claude's JSON response.

    Raises:
        ValueError: If ANTHROPIC_API_KEY is missing.
        anthropic.APIError: On any Anthropic API error.
        json.JSONDecodeError: If Claude returns invalid JSON even after retry.
    """
    # ── First attempt ──────────────────────────────────────────────────────────
    raw = _call_claude(prompt)
    cleaned = _strip_markdown_fences(raw)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass  # Fall through to retry

    # ── Retry with explicit correction prompt ──────────────────────────────────
    correction_prompt = (
        prompt
        + "\n\nYour previous response was not valid JSON. "
        "Return ONLY valid JSON, no markdown, no explanation."
    )
    raw_retry = _call_claude(correction_prompt)
    cleaned_retry = _strip_markdown_fences(raw_retry)

    # Let this raise if it still fails — the caller decides what to do
    return json.loads(cleaned_retry)

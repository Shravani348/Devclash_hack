"""
Gemini AI Client — Shared helper for all services
===================================================
Uses google.genai (new SDK) with gemini-2.0-flash.
Get your FREE key at: https://aistudio.google.com/

Features:
- Uses new google-genai SDK (not deprecated google.generativeai)
- Retry on transient errors (up to 3 attempts)
- JSON extraction even from messy responses
- Safe ASCII-only logging (no Windows cp1252 crashes)
"""

import os
import json
import re
import time
from dotenv import load_dotenv

load_dotenv()


def get_gemini_client():
    """Returns a configured Gemini client. Raises ValueError if key missing."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise ValueError(
            "GEMINI_API_KEY not set. "
            "Get your FREE key at https://aistudio.google.com/ "
            "and add it to backend/.env as: GEMINI_API_KEY=AIza..."
        )
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        return client
    except ImportError:
        # Fallback to deprecated package if new SDK not installed
        import google.generativeai as genai_legacy
        genai_legacy.configure(api_key=api_key)
        return None  # signals to use legacy path


def ask_gemini(prompt: str, expect_json: bool = False, retries: int = 3) -> str:
    """Send prompt to Gemini, return text. Retries on failure.
    
    Tries models in order: gemini-2.0-flash -> gemini-1.5-flash -> gemini-1.0-pro
    Automatically falls back to the next model on 429 rate-limit errors.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise ValueError(
            "GEMINI_API_KEY not set. "
            "Get your FREE key at https://aistudio.google.com/ "
            "and add it to backend/.env as: GEMINI_API_KEY=AIza..."
        )

    # Models to try in order — falls back automatically on 429 rate limit
    # Using models/ prefix required by the new google-genai SDK
    models_to_try = [
        "models/gemini-2.0-flash",      # primary: fastest free tier
        "models/gemini-2.0-flash-lite", # fallback: lighter quota pool
        "models/gemini-flash-latest",   # last resort alias
    ]

    from google import genai
    client = genai.Client(api_key=api_key)

    last_err = None
    for model_name in models_to_try:
        for attempt in range(retries):
            try:
                print(f"[Gemini] Trying model={model_name}, attempt={attempt + 1}/{retries}")
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                text = response.text.strip()

                if expect_json:
                    # Strip markdown fences
                    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
                    text = re.sub(r'\s*```$', '',         text, flags=re.MULTILINE)
                    text = text.strip()

                print(f"[Gemini] Success with model={model_name}")
                return text

            except Exception as e:
                last_err = e
                safe = str(e).encode('ascii', errors='replace').decode('ascii')
                is_rate_limit = "429" in safe or "RESOURCE_EXHAUSTED" in safe or "quota" in safe.lower()

                if is_rate_limit:
                    # Don't retry the same model on 429 — move to next model immediately
                    print(f"[Gemini] Model {model_name} rate-limited (429). Trying next model...")
                    break  # break inner loop → try next model in outer loop
                elif attempt < retries - 1:
                    wait = 2 ** attempt  # 1s, 2s
                    print(f"[Gemini] Attempt {attempt+1} failed: {safe}. Retrying in {wait}s...")
                    time.sleep(wait)
                else:
                    print(f"[Gemini] Model {model_name} failed after {retries} attempts. Trying next model...")
                    break  # try next model

    safe_last = str(last_err).encode('ascii', errors='replace').decode('ascii')
    raise RuntimeError(f"All Gemini models failed. Last error: {safe_last}")



def ask_gemini_json(prompt: str, retries: int = 3) -> dict:
    """Send prompt and parse JSON response. Returns dict."""
    raw = ask_gemini(prompt, expect_json=True, retries=retries)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Try extracting JSON object from surrounding text
        match = re.search(r'\{[\s\S]*\}', raw)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        raise ValueError(
            f"Gemini returned invalid JSON. "
            f"Response preview: {raw[:300]}"
        )


def gemini_available() -> bool:
    """Check if Gemini is configured."""
    key = os.getenv("GEMINI_API_KEY", "")
    return bool(key and key != "your_gemini_api_key_here")


# Legacy alias for backward compatibility
def get_gemini_model():
    """Deprecated — use ask_gemini() directly."""
    return get_gemini_client()

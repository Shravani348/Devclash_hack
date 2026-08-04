"""
Standalone Gemini API Connection Test
======================================
Run this BEFORE the full resume analysis flow to verify:
  1. Your GEMINI_API_KEY is being loaded from .env
  2. The google-genai SDK can reach the API
  3. Gemini returns a valid JSON response

Usage:
    cd backend
    python test_api_connection.py
"""

import os
import sys
import json
import re
import traceback
from datetime import datetime

# Load .env from the same directory as this script
from dotenv import load_dotenv
load_dotenv()


def main():
    print("=" * 60)
    print("  Gemini API Connection Test")
    print("=" * 60)

    # ── 1. Check that the API key is present ──────────────────────
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        print("\n[FAIL] GEMINI_API_KEY is NOT set in your .env file.")
        print("       Add this line to backend/.env:")
        print("         GEMINI_API_KEY=AIza...")
        print("       Get your FREE key at: https://aistudio.google.com/")
        sys.exit(1)

    # Show a masked version so you can confirm the right key loaded
    masked = api_key[:8] + "..." + api_key[-6:] if len(api_key) > 14 else api_key[:4] + "..."
    print(f"\n[OK]   GEMINI_API_KEY loaded: {masked}")
    print(f"       Key length: {len(api_key)} characters")

    # ── 2. Import the SDK ─────────────────────────────────────────
    try:
        from google import genai
        print(f"[OK]   google-genai SDK imported successfully")
    except ImportError:
        print("\n[FAIL] The 'google-genai' package is not installed.")
        print("       Run: pip install google-genai")
        sys.exit(1)

    # ── 3. Make a minimal test call (tries multiple models) ───────
    current_time = datetime.now().isoformat()
    prompt = (
        f'Return ONLY this exact JSON object with the current timestamp filled in, '
        f'and nothing else - no markdown, no explanation:\n'
        f'{{"status": "connected", "timestamp": "{current_time}"}}'
    )

    print(f"\n      Prompt: {prompt!r}")

    models_to_try = [
        "models/gemini-2.0-flash",      # primary
        "models/gemini-2.0-flash-lite", # fallback
        "models/gemini-flash-latest",   # last resort
    ]
    response = None
    used_model = None
    last_err = None

    client = genai.Client(api_key=api_key)
    for model_name in models_to_try:
        try:
            print(f"\n[...] Trying model: {model_name} ...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            used_model = model_name
            print(f"[OK]   Got response from {model_name}")
            break
        except Exception as e:
            last_err = e
            safe = str(e).encode('ascii', errors='replace').decode('ascii')
            is_rate_limit = "429" in safe or "RESOURCE_EXHAUSTED" in safe or "quota" in safe.lower()
            if is_rate_limit:
                print(f"[WARN] {model_name} is rate-limited (429). Trying next model...")
            else:
                print(f"[FAIL] {model_name} error: {safe}")
                break

    if response is None:
        print(f"\n[FAIL] All Gemini models failed. Last exception:")
        print(f"       {type(last_err).__name__}: {last_err}")
        print("\n--- Full traceback ---")
        traceback.print_exc()
        print("---------------------")
        print("\n[FAILED] CONNECTION FAILED - see error above.\n")
        print("Common causes:")
        print("  - Invalid or expired API key (check https://aistudio.google.com/)")
        print("  - All models rate-limited — wait 1 minute and retry")
        print("  - No internet / firewall blocking generativelanguage.googleapis.com")
        sys.exit(1)

    # ── 4. Parse the response ─────────────────────────────────────
    raw_text = response.text.strip()
    raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text, flags=re.IGNORECASE)
    raw_text = re.sub(r"\s*```$", "", raw_text.strip())
    raw_text = raw_text.strip()

    print(f"\n[OK]   Raw response from {used_model}:\n       {raw_text}")

    try:
        parsed = json.loads(raw_text)
        print(f"\n[OK]   JSON parsed successfully:")
        print(f"         status    = {parsed.get('status')}")
        print(f"         timestamp = {parsed.get('timestamp')}")
        print(f"\n[SUCCESS] CONNECTION SUCCEEDED using model={used_model}\n")
    except json.JSONDecodeError as je:
        print(f"\n[WARN] Gemini responded but the output was not valid JSON.")
        print(f"       JSON error: {je}")
        print(f"       Raw text: {raw_text}")
        print(f"\n[PARTIAL] PARTIAL SUCCESS using model={used_model} - API works but response was not pure JSON.")
        print("     This is non-critical; ask_gemini_json() handles this with retries.\n")


if __name__ == "__main__":
    main()

"""
Resume Audit Service — Powered by Google Gemini (FREE)
Analyzes the actual resume PDF content and gives personalized feedback.

LLM: gemini-2.0-flash (Google Gemini, free tier)
Fallback: smart rule-based analysis (no API key required)

v2: Extended with 10 new analysis dimensions, SQLite caching, and structured logging.
"""
import os
import re
import json
import time
import pdfplumber
from dotenv import load_dotenv

load_dotenv()


# ── PDF Text Extraction ──────────────────────────────────────────────
def extract_text(pdf_path: str) -> str:
    """Extract all text from a PDF file using pdfplumber."""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"[ResumeService] PDF extraction error: {e}")
    return text


# ── Main Entry Point ─────────────────────────────────────────────────
def audit_resume(pdf_path: str, jd: str = "", force: bool = False) -> dict:
    """
    Main entry point. Extracts PDF text, checks cache, calls Gemini AI.
    Falls back to smart rule-based analysis if Gemini is unavailable.

    Args:
        pdf_path: Path to the PDF file.
        jd:       Optional job description text.
        force:    If True, bypass cache and always call the LLM.
    """
    from services.analysis_cache import make_cache_key, get_cached, set_cached
    from services.audit_logger import log_analysis

    resume_text = extract_text(pdf_path)
    if not resume_text.strip():
        return {"error": "Could not extract text from PDF. Ensure it is not a scanned image."}

    cache_key = make_cache_key(resume_text, jd)

    # ── Cache check ──────────────────────────────────────────────────
    if not force:
        cached = get_cached(cache_key)
        if cached:
            log_analysis(
                provider=cached.get("_source", "cache"),
                response_time_ms=0,
                cache_hit=True,
                success=True,
                resume_hash=cache_key,
            )
            return cached

    # ── Live LLM call ────────────────────────────────────────────────
    t0 = time.time()
    try:
        result = _gemini_audit(resume_text, jd)
        elapsed_ms = int((time.time() - t0) * 1000)
        log_analysis(
            provider=result.get("_source", "gemini-ai"),
            response_time_ms=elapsed_ms,
            cache_hit=False,
            success=True,
            resume_hash=cache_key,
        )
        set_cached(cache_key, result)
        return result
    except Exception as e:
        import traceback
        elapsed_ms = int((time.time() - t0) * 1000)
        print(f"[ResumeService] Gemini API call FAILED: {e}")
        traceback.print_exc()
        log_analysis(
            provider="gemini-ai",
            response_time_ms=elapsed_ms,
            cache_hit=False,
            success=False,
            error=str(e),
            resume_hash=cache_key,
        )
        print("[ResumeService] Falling back to smart rule-based analysis.")
        return _smart_fallback(resume_text, jd)


# ── Gemini AI Audit ──────────────────────────────────────────────────
def _build_prompt(resume_text: str, jd: str) -> str:
    """Build the full structured prompt including all 10 new dimensions."""
    jd_block = (
        f"\n\nJOB DESCRIPTION:\n{jd[:2000]}"
        if jd.strip()
        else "\n\nNo job description provided — perform a general audit."
    )

    return f"""You are an expert technical recruiter and resume coach. Analyze the resume below carefully and return ONLY a valid JSON object — no markdown fences, no commentary, no explanation.

RESUME:
{resume_text[:5000]}
{jd_block}

Return EXACTLY this JSON structure. All fields are required. Fill every array with at least one item.

{{
  "score": <0-100 integer, overall resume quality>,
  "suggestedRole": "<single best fitting job title>",
  "suitableRoles": ["<role1>", "<role2>", "<role3>"],
  "suggestionsCount": <total count of all improvement suggestions as integer>,
  "_source": "gemini-ai",
  "overview": {{
    "summary": "<4-sentence personalized evaluation referencing actual skills/companies/technologies found in the resume>",
    "radarData": [
      {{"subject": "Content", "A": <1-10>, "fullMark": 10}},
      {{"subject": "Skills",  "A": <1-10>, "fullMark": 10}},
      {{"subject": "Format",  "A": <1-10>, "fullMark": 10}},
      {{"subject": "Sections","A": <1-10>, "fullMark": 10}},
      {{"subject": "Style",   "A": <1-10>, "fullMark": 10}}
    ],
    "highlights": ["<strength1>", "<strength2>", "<strength3>"],
    "improvements": ["<improvement1>", "<improvement2>", "<improvement3>"]
  }},
  "categories": {{
    "content":  {{"score": <1-10>, "suggestions": <count>}},
    "skills":   {{"score": <1-10>, "suggestions": <count>}},
    "format":   {{"score": <1-10>, "suggestions": <count>}},
    "sections": {{"score": <1-10>, "suggestions": <count>}},
    "style":    {{"score": <1-10>, "suggestions": <count>}}
  }},
  "content": {{
    "measurableResults": {{
      "count": <number of weak/vague bullet points>,
      "flagged": ["<weak bullet 1>", "<weak bullet 2>"]
    }},
    "spellingGrammar": {{
      "errors": [
        {{"original": "<sentence with error>", "error": "<wrong word>", "fix": "<correct word>", "explanation": "<why it is wrong>"}}
      ]
    }}
  }},
  "skills": {{
    "hardSkills": [
      {{"name": "<skill name>", "required": <1 if in JD else 0>, "found": <1 if in resume else 0>, "status": "<found|missing>"}}
    ],
    "softSkills": [
      {{"name": "<skill name>", "required": <1 if in JD else 0>, "found": <1 if in resume else 0>, "status": "<found|missing>"}}
    ]
  }},
  "format": {{
    "dateFormatting": {{"status": "<PASS|FAIL>", "text": "<observation about date formatting>"}},
    "resumeLength":   {{"status": "<PASS|FAIL>", "text": "<observation about length>"}},
    "bulletPoints":   {{"status": "<PASS|FAIL>", "text": "<observation about bullet usage>"}}
  }},
  "sections": {{
    "checklist": [
      {{"label": "Name",                 "status": "<PASS|FAIL>", "value": "<what was found or missing>"}},
      {{"label": "Email",                "status": "<PASS|FAIL>", "value": "<what was found or missing>"}},
      {{"label": "Phone",                "status": "<PASS|FAIL>", "value": "<what was found or missing>"}},
      {{"label": "LinkedIn/GitHub",      "status": "<PASS|FAIL>", "value": "<what was found or missing>"}},
      {{"label": "Professional Summary", "status": "<PASS|FAIL>", "value": "<what was found or missing>"}},
      {{"label": "Work Experience",      "status": "<PASS|FAIL>", "value": "<what was found or missing>"}},
      {{"label": "Education",            "status": "<PASS|FAIL>", "value": "<what was found or missing>"}},
      {{"label": "Skills Section",       "status": "<PASS|FAIL>", "value": "<what was found or missing>"}},
      {{"label": "Projects",             "status": "<PASS|FAIL>", "value": "<what was found or missing>"}}
    ]
  }},
  "style": {{
    "voice": {{
      "tags": ["#<tone_tag1>", "#<tone_tag2>"],
      "flagged": [
        {{"original": "<weak or passive sentence>", "suggestion": "<stronger active rewrite>"}}
      ]
    }},
    "buzzwords": [
      {{"phrase": "<cliche phrase>", "sentence": "<full sentence containing the cliche>", "suggestion": "<better alternative>"}}
    ]
  }},

  "impact_quantification": {{
    "score": <0-100>,
    "summary": "<1-sentence assessment of how well the resume uses metrics>",
    "flagged_bullets": [
      {{
        "original": "<bullet point with no measurable outcome>",
        "rewritten": "<same bullet with a plausible metric placeholder, e.g. 'increased efficiency by X%'>",
        "missing_metric_type": "<e.g. 'percentage improvement', 'users impacted', 'time saved', 'revenue'>"
      }}
    ]
  }},

  "action_verb_strength": {{
    "score": <0-100>,
    "summary": "<1-sentence assessment of verb quality across the resume>",
    "weak_verbs_found": [
      {{
        "original_phrase": "<e.g. 'was responsible for building'>",
        "weak_verb": "<e.g. 'responsible for'>",
        "suggested_verb": "<e.g. 'architected'>",
        "rewritten_phrase": "<full rewritten phrase with strong verb>"
      }}
    ]
  }},

  "keyword_density_vs_jd": {{
    "score": <0-100, 100 if no JD provided>,
    "jd_provided": <true|false>,
    "match_percentage": <0-100>,
    "exact_matches": ["<keyword found in both JD and resume>"],
    "semantic_matches": [
      {{"jd_term": "<JD keyword>", "resume_equivalent": "<synonym used in resume>"}}
    ],
    "missing_keywords": ["<critical JD keyword completely absent from resume>"]
  }},

  "ats_parseability": {{
    "score": <0-100>,
    "summary": "<1-sentence ATS compatibility verdict>",
    "flags": [
      {{
        "issue": "<e.g. 'Non-standard section title'>",
        "detail": "<e.g. 'Section titled My Journey instead of Experience'>",
        "fix": "<e.g. 'Rename to Work Experience'>"
      }}
    ]
  }},

  "seniority_consistency": {{
    "score": <0-100>,
    "claimed_level": "<e.g. 'Mid-level, 3 years experience'>",
    "detected_level": "<e.g. 'Junior — language and scope suggest 0-2 years'>",
    "consistent": <true|false>,
    "red_flags": [
      {{
        "claim": "<e.g. 'Led a team of 20 engineers'>",
        "concern": "<e.g. '2-year developer leading 20 people is statistically very rare'>"
      }}
    ]
  }},

  "redundancy_check": {{
    "score": <0-100>,
    "summary": "<1-sentence summary of redundancy level>",
    "redundant_items": [
      {{
        "phrase": "<repeated phrase or achievement>",
        "locations": ["<where it appears first>", "<where it appears again>"],
        "recommendation": "<keep one instance, remove or vary the others>"
      }}
    ]
  }},

  "quantified_score_breakdown": {{
    "weights": {{
      "content":    {{"weight_pct": 30, "raw_score": <1-10>, "weighted_contribution": <weight_pct * raw_score / 10>}},
      "skills":     {{"weight_pct": 25, "raw_score": <1-10>, "weighted_contribution": <weight_pct * raw_score / 10>}},
      "ats":        {{"weight_pct": 20, "raw_score": <0-100>, "weighted_contribution": <weight_pct * raw_score / 100>}},
      "impact":     {{"weight_pct": 15, "raw_score": <0-100>, "weighted_contribution": <weight_pct * raw_score / 100>}},
      "style":      {{"weight_pct": 10, "raw_score": <1-10>, "weighted_contribution": <weight_pct * raw_score / 10>}}
    }},
    "explanation": "<2-sentence plain-English explanation of why the user got this score>"
  }},

  "industry_benchmark": {{
    "role": "<claimed or suggested role>",
    "seniority": "<entry|mid|senior>",
    "typical_score_range": "<e.g. '60-75'>",
    "this_resume_vs_benchmark": "<below|within|above>",
    "benchmark_explanation": "<2-sentence explanation of what typically distinguishes resumes in this band>"
  }},

  "priority_ranking": [
    {{
      "rank": <1-based integer, 1 = most impactful>,
      "impact": "<High|Medium|Low>",
      "category": "<which analysis dimension this came from>",
      "issue": "<brief description of the problem>",
      "action": "<specific, ready-to-do fix>",
      "ready_to_paste": "<exact text to copy-paste into the resume, if applicable>"
    }}
  ]
}}"""


def _gemini_audit(resume_text: str, jd: str = "") -> dict:
    """Full Gemini-powered resume audit."""
    from services.gemini_client import ask_gemini_json

    prompt = _build_prompt(resume_text, jd)
    print(f"[ResumeService] Sending prompt to Gemini (first 200 chars): {prompt[:200]!r}")

    result = ask_gemini_json(prompt)
    result["_source"] = "gemini-ai"
    print(f"[ResumeService] SUCCESS — _source == {result['_source']!r}")
    return result


# ── Smart Rule-Based Fallback ────────────────────────────────────────
def _smart_fallback(resume_text: str, jd: str = "") -> dict:
    """Used when Gemini API key is not configured or API call fails."""
    text = resume_text.lower()

    role = "Software Engineer"
    suitable_roles = ["Junior Developer", "Systems Analyst", "Backend Developer"]
    if "react" in text and ("node" in text or "python" in text):
        role = "Full Stack Engineer"
        suitable_roles = ["Product Engineer", "Full Stack Developer", "Technical Lead"]
    elif "react" in text or "frontend" in text or "vue" in text:
        role = "Frontend Engineer"
        suitable_roles = ["React Developer", "UI Engineer", "Web Developer"]
    elif "machine learning" in text or "deep learning" in text or "tensorflow" in text:
        role = "ML/AI Engineer"
        suitable_roles = ["Data Scientist", "ML Researcher", "AI Developer"]
    elif "data" in text and ("sql" in text or "pandas" in text):
        role = "Data Engineer"
        suitable_roles = ["Data Analyst", "BI Developer", "Data Scientist"]
    elif "node" in text or "django" in text or "flask" in text:
        role = "Backend Engineer"
        suitable_roles = ["API Developer", "Backend Developer", "DevOps Engineer"]

    has_github = any(x in text for x in ["github", "gitlab", "portfolio"])
    has_linkedin = "linkedin" in text
    has_summary = any(x in text for x in ["summary", "objective", "about", "profile"])
    has_projects = "project" in text
    has_quantified = any(x in text for x in ["%", "increased", "reduced", "improved", "achieved"])

    score = 60
    if has_quantified: score += 8
    if has_projects: score += 5
    if has_github: score += 5
    if has_summary: score += 4
    score = min(score, 85)

    return {
        "_source": "fallback",
        "_note": "Add GEMINI_API_KEY to backend/.env for real Gemini AI analysis. Get your free key at https://aistudio.google.com/",
        "score": score,
        "suggestedRole": role,
        "suitableRoles": suitable_roles,
        "suggestionsCount": 7,
        "categories": {
            "content":  {"score": 7 if has_quantified else 5, "suggestions": 3},
            "skills":   {"score": 7, "suggestions": 2},
            "format":   {"score": 8, "suggestions": 1},
            "sections": {"score": 6 + (2 if has_github else 0) + (1 if has_summary else 0), "suggestions": 2},
            "style":    {"score": 7, "suggestions": 2},
        },
        "overview": {
            "summary": (
                f"Based on your resume, you appear well-suited for a {role} position. "
                f"{'Your resume includes quantified achievements which strengthen your profile. ' if has_quantified else 'Adding metrics to your bullets would significantly improve your profile. '}"
                f"{'Your project work demonstrates hands-on experience. ' if has_projects else 'Adding a dedicated projects section would help recruiters assess your skills. '}"
                "Add your Gemini API key to get a personalized AI analysis of your specific resume."
            ),
            "radarData": [
                {"subject": "Content",  "A": 7 if has_quantified else 5, "fullMark": 10},
                {"subject": "Skills",   "A": 7, "fullMark": 10},
                {"subject": "Format",   "A": 8, "fullMark": 10},
                {"subject": "Sections", "A": 6 + (2 if has_github else 0), "fullMark": 10},
                {"subject": "Style",    "A": 7, "fullMark": 10},
            ],
            "highlights": [
                f"Good fit for {role} roles based on detected skills",
                "Projects section demonstrates hands-on experience" if has_projects else "Technical skills detected in resume",
                "Online presence linked (GitHub/LinkedIn)" if (has_github or has_linkedin) else "Resume successfully parsed",
            ],
            "improvements": [
                "Add metrics to bullet points (e.g. 'reduced load time by 40%', 'served 10k users')",
                "Include a GitHub or portfolio link" if not has_github else "Pin your 3 best repos on GitHub with clear READMEs",
                "Add a 2-3 sentence professional summary" if not has_summary else f"Tailor your summary for {suitable_roles[0]} roles",
            ],
        },
        "content": {
            "measurableResults": {
                "count": 3,
                "flagged": ["Worked on backend features", "Assisted in development", "Helped with deployment"],
            },
            "spellingGrammar": {"errors": []},
        },
        "skills": {
            "hardSkills": [
                {"name": "Portfolio/GitHub",   "required": 1, "found": 1 if has_github else 0,      "status": "found" if has_github else "missing"},
                {"name": "Quantified Results", "required": 1, "found": 1 if has_quantified else 0,  "status": "found" if has_quantified else "missing"},
                {"name": "Project Experience", "required": 1, "found": 1 if has_projects else 0,    "status": "found" if has_projects else "missing"},
            ],
            "softSkills": [
                {"name": "Teamwork",      "required": 1, "found": 1 if "team" in text else 0, "status": "found" if "team" in text else "missing"},
                {"name": "Communication", "required": 1, "found": 1,                           "status": "found"},
            ],
        },
        "format": {
            "dateFormatting": {"status": "PASS", "text": "Date formatting appears consistent."},
            "resumeLength":   {"status": "PASS", "text": "Resume length seems appropriate."},
            "bulletPoints":   {"status": "PASS", "text": "Good use of bullet points."},
        },
        "sections": {
            "checklist": [
                {"label": "Name",                 "status": "PASS", "value": "Detected"},
                {"label": "LinkedIn/GitHub",      "status": "PASS" if (has_github or has_linkedin) else "FAIL",
                 "value": "Found" if (has_github or has_linkedin) else "Missing — add GitHub profile URL"},
                {"label": "Professional Summary", "status": "PASS" if has_summary else "FAIL",
                 "value": "Found" if has_summary else "Missing — add a 2-3 sentence targeted summary"},
                {"label": "Work Experience", "status": "PASS", "value": "Detected"},
                {"label": "Education",       "status": "PASS", "value": "Detected"},
                {"label": "Projects",        "status": "PASS" if has_projects else "FAIL",
                 "value": "Found" if has_projects else "Missing — add 2-3 projects with GitHub links"},
                {"label": "Skills Section",  "status": "PASS", "value": "Technical skills detected"},
            ]
        },
        "style": {
            "voice": {
                "tags": ["#Technical", "#Professional"],
                "flagged": [{"original": "Responsible for managing the system",
                             "suggestion": "Led the design and management of the system, improving reliability by X%"}],
            },
            "buzzwords": [{"phrase": "Hard worker", "sentence": "I am a hard worker",
                           "suggestion": "Show work ethic through specific achievements instead of claiming it"}],
        },
        # Stub extended fields so frontend doesn't crash on fallback
        "impact_quantification": {
            "score": 40, "summary": "Enable Gemini AI for detailed impact analysis.",
            "flagged_bullets": [{"original": "Worked on the project", "rewritten": "Delivered project outcomes, improving team throughput by ~X%", "missing_metric_type": "percentage improvement"}]
        },
        "action_verb_strength": {
            "score": 50, "summary": "Enable Gemini AI for verb analysis.",
            "weak_verbs_found": [{"original_phrase": "was responsible for building features", "weak_verb": "responsible for", "suggested_verb": "engineered", "rewritten_phrase": "Engineered features..."}]
        },
        "keyword_density_vs_jd": {
            "score": 100, "jd_provided": False, "match_percentage": 0,
            "exact_matches": [], "semantic_matches": [], "missing_keywords": []
        },
        "ats_parseability": {
            "score": 70, "summary": "Basic ATS compatibility assumed. Enable Gemini AI for full parse check.",
            "flags": [{"issue": "Cannot verify", "detail": "AI analysis required for ATS flag detection.", "fix": "Enable Gemini API key."}]
        },
        "seniority_consistency": {
            "score": 70, "claimed_level": "Unknown", "detected_level": "Unknown", "consistent": True, "red_flags": []
        },
        "redundancy_check": {
            "score": 70, "summary": "Enable Gemini AI for redundancy detection.", "redundant_items": []
        },
        "quantified_score_breakdown": {
            "weights": {
                "content": {"weight_pct": 30, "raw_score": 7, "weighted_contribution": 21},
                "skills":  {"weight_pct": 25, "raw_score": 7, "weighted_contribution": 17.5},
                "ats":     {"weight_pct": 20, "raw_score": 70, "weighted_contribution": 14},
                "impact":  {"weight_pct": 15, "raw_score": 40, "weighted_contribution": 6},
                "style":   {"weight_pct": 10, "raw_score": 7,  "weighted_contribution": 7},
            },
            "explanation": "Score is estimated from rule-based analysis. Enable Gemini API for a precise, weighted breakdown."
        },
        "industry_benchmark": {
            "role": role, "seniority": "entry", "typical_score_range": "55-70",
            "this_resume_vs_benchmark": "within",
            "benchmark_explanation": "Entry-level resumes in this category typically score 55-70. Enable Gemini AI for a role-specific benchmark."
        },
        "priority_ranking": [
            {"rank": 1, "impact": "High",   "category": "impact_quantification", "issue": "No measurable outcomes in bullet points",
             "action": "Add % or number to every bullet point", "ready_to_paste": "Reduced page load time by 35% by implementing lazy loading"},
            {"rank": 2, "impact": "High",   "category": "content", "issue": "Vague bullet points",
             "action": "Rewrite bullets with action verbs and metrics", "ready_to_paste": "Architected RESTful API serving 5,000 daily active users"},
            {"rank": 3, "impact": "Medium", "category": "sections", "issue": "Missing Professional Summary",
             "action": "Add a 2-3 sentence targeted summary", "ready_to_paste": ""},
        ]
    }

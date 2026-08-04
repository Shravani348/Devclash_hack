"""
Resume Rewriter Service — Powered by Google Gemini (FREE)
Rewrites resume bullet points based on what was ACTUALLY found in the developer's code.
Identifies which projects to lead with vs which damage the profile.
"""
from services.gemini_client import ask_gemini_json
from services.resume_service import extract_text


def rewrite_resume_from_code(
    pdf_path: str,
    audit_data: dict,
    github_username: str
) -> dict:
    """
    Cross-references resume claims with actual GitHub code audit data
    and rewrites bullet points to be honest, specific, and impressive.
    """
    resume_text = extract_text(pdf_path) if pdf_path else ""

    try:
        return _gemini_rewrite(resume_text, audit_data, github_username)
    except Exception as e:
        print(f"[ResumeRewriter] Gemini failed: {e}")
        return _fallback_rewrite(resume_text, audit_data, github_username)


def _gemini_rewrite(resume_text: str, audit_data: dict, username: str) -> dict:
    level = audit_data.get("developerLevel", "Junior")
    tech = ", ".join(audit_data.get("techStackDetected", []))
    repo_health = audit_data.get("repoHealthSummary", [])
    strengths = audit_data.get("strengths", [])
    issues = audit_data.get("specificCodeIssues", [])
    score = audit_data.get("overallScore", 50)

    repo_health_str = "\n".join([
        f"- {r['name']}: verdict={r['verdict']}, score={r['score']}/100, reason={r['reason']}"
        for r in repo_health
    ])

    issues_str = "\n".join([
        f"- [{i.get('severity','?')}] {i.get('repo','?')}/{i.get('file','?')}: {i.get('issue','?')}"
        for i in issues[:5]
    ]) if issues else "No critical issues detected"

    strengths_str = "\n".join(f"- {s}" for s in strengths[:5]) if strengths else "- General coding ability"

    resume_section = f"CURRENT RESUME:\n{resume_text[:3000]}" if resume_text.strip() else \
        "No resume provided — generate generic rewrites based on GitHub code."

    prompt = f"""You are a professional resume coach and senior engineer. Rewrite this developer's resume based on what was ACTUALLY found in their code — not what they claimed.

DEVELOPER: {username}
ACTUAL LEVEL (from code audit): {level} ({score}/100)
TECH STACK ACTUALLY FOUND: {tech}
REPO HEALTH:
{repo_health_str}

WHAT THE CODE ACTUALLY SHOWS (STRENGTHS):
{strengths_str}

CODE ISSUES FOUND:
{issues_str}

{resume_section}

Return ONLY valid JSON (no markdown):
{{
  "rewrittenBullets": [
    {{
      "original": "<original resume bullet or claim>",
      "rewritten": "<honest, specific, impressive rewrite based on actual code evidence>",
      "improvement": "<why this version is better>",
      "evidenceFrom": "<which repo/file proves this>"
    }}
  ],
  "generatedBullets": [
    "<brand new bullet point based purely on what was found in their code — specific and provable>",
    "<another generated bullet>",
    "<another generated bullet>",
    "<another generated bullet>",
    "<another generated bullet>"
  ],
  "projectsToFeature": [
    {{
      "repo": "<repo name>",
      "why": "<specific reason to feature this — cite actual qualities>",
      "suggestedDescription": "<how to describe this project on a resume — 1-2 lines>"
    }}
  ],
  "projectsToHide": [
    {{
      "repo": "<repo name>",
      "why": "<specific reason this hurts the profile>",
      "howToFix": "<what to add/change to make it showable>"
    }}
  ],
  "summaryRewrite": "<A rewritten 3-sentence professional summary that is 100% honest and backed by code evidence>",
  "titleSuggestion": "<Honest job title that matches demonstrated ability>",
  "keyWarnings": [
    "<things on the resume that are misleading vs what the code shows>"
  ]
}}"""

    result = ask_gemini_json(prompt)
    result["_source"] = "gemini-ai"
    return result


def _fallback_rewrite(resume_text: str, audit_data: dict, username: str) -> dict:
    level = audit_data.get("developerLevel", "Junior")
    tech = audit_data.get("techStackDetected", [])
    repo_health = audit_data.get("repoHealthSummary", [])
    tech_str = ", ".join(tech[:4]) if tech else "various technologies"

    lead = [r["name"] for r in repo_health if r.get("verdict") == "lead"]
    hide = [r["name"] for r in repo_health if r.get("verdict") == "hide"]

    return {
        "_source": "fallback",
        "_note": "Add GEMINI_API_KEY to backend/.env for AI-powered resume rewriting. Get your free key at https://aistudio.google.com/",
        "rewrittenBullets": [
            {
                "original": "Worked on backend features",
                "rewritten": f"Developed and deployed backend services using {tech_str}",
                "improvement": "More specific and action-oriented",
                "evidenceFrom": f"GitHub: {username}"
            },
            {
                "original": "Built a web application",
                "rewritten": f"Built and shipped a full-stack web application with {tech_str} — live on GitHub",
                "improvement": "References actual tech stack detected in code",
                "evidenceFrom": lead[0] if lead else "GitHub repos"
            }
        ],
        "generatedBullets": [
            f"Developed projects using {tech_str} with hands-on Git version control",
            f"Built web applications demonstrating proficiency in {tech_str}",
            "Maintained public GitHub portfolio with multiple shipped projects",
            "Applied object-oriented and functional programming principles",
            "Debugged and shipped code independently across multiple repositories"
        ],
        "projectsToFeature": [
            {"repo": r, "why": "Has README and tests — shows engineering discipline",
             "suggestedDescription": f"Full-stack project built with {tech_str}. Features [add key feature]. Live at [add URL]."}
            for r in lead[:3]
        ],
        "projectsToHide": [
            {"repo": r, "why": "Missing README, tests, or meaningful code",
             "howToFix": "Add a detailed README with setup instructions, add 3+ unit tests, ensure code is modular"}
            for r in hide[:2]
        ],
        "summaryRewrite": f"A {level} developer with hands-on experience in {tech_str}. "
                          f"Demonstrated ability to build and ship full-stack projects through {len(repo_health)} public GitHub repositories. "
                          f"Currently strengthening test coverage and system design skills to reach the next level.",
        "titleSuggestion": f"{level} {tech[0] if tech else 'Full Stack'} Developer",
        "keyWarnings": [
            "Avoid claiming 'expert' in technologies unless your code shows advanced patterns",
            "Remove projects that have no README — they harm your profile more than help",
            "Do not list skills you cannot demonstrate with code in a GitHub repo"
        ]
    }

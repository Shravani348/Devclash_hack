"""
Market Intelligence Service — Powered by Google Gemini (FREE)
Maps a developer's real skill level to job market data:
- Qualifying roles & realistic companies
- Salary bracket & gap to next level
- Percentile ranking among peers
"""
import traceback
from services.gemini_client import ask_gemini_json


def get_market_intelligence(
    developer_level: str,
    tech_stack: list,
    overall_score: int,
    code_quality_scores: dict,
    gaps: list,
    years_estimate: str = "1-2 years"
) -> dict:
    """Generate AI-powered market intelligence report."""
    try:
        return _gemini_market_intel(
            developer_level, tech_stack, overall_score,
            code_quality_scores, gaps, years_estimate
        )
    except Exception as e:
        print(f"[MarketIntelligence] Claude API call FAILED: {e}")
        traceback.print_exc()  # Print full stack trace so we can see the real error
        print("[MarketIntelligence] Falling back to hardcoded data.")
        return _fallback_market_intel(developer_level, tech_stack, overall_score)


def _gemini_market_intel(level, tech_stack, score, quality_scores, gaps, years_est) -> dict:
    tech_str = ", ".join(tech_stack) if tech_stack else "General Web Dev"
    gaps_str = "\n".join(f"- {g}" for g in gaps[:5]) if gaps else "- None identified"
    quality_str = "\n".join(f"- {k}: {v}/100" for k, v in quality_scores.items())

    prompt = f"""You are a tech industry recruiter with deep knowledge of the job market. Based on this developer's REAL demonstrated skill profile, give a market intelligence report.

DEVELOPER PROFILE:
- Level: {level}
- Overall Score: {score}/100
- Tech Stack: {tech_str}
- Experience Estimate: {years_est}
- Percentile Rank: ~{score - 10}th percentile

CODE QUALITY BREAKDOWN:
{quality_str}

IDENTIFIED GAPS:
{gaps_str}

Return ONLY valid JSON (no markdown):
{{
  "currentSalaryBracket": {{
    "range": "<e.g., '$45,000 - $65,000/yr (India: ₹6-10 LPA)'>",
    "currency": "USD",
    "inrRange": "<INR equivalent>",
    "confidence": "<low|medium|high>"
  }},
  "nextLevelSalaryBracket": {{
    "range": "<salary for next level>",
    "inrRange": "<INR equivalent>",
    "skillsNeeded": ["<specific skill to get there>", "<skill2>", "<skill3>"]
  }},
  "percentileRank": {{
    "overall": <0-100>,
    "inTechStack": <0-100>,
    "description": "<e.g., 'Top 40% of JavaScript developers with 2 years experience'>"
  }},
  "rolesYouQualifyFor": [
    {{
      "title": "<job title>",
      "matchScore": <0-100>,
      "reasoning": "<why they qualify based on their actual code>",
      "avgSalary": "<salary range>"
    }}
  ],
  "rolesYouDontQualifyForYet": [
    {{
      "title": "<job title>",
      "gap": "<specific skill/experience gap preventing qualification>",
      "timeToQualify": "<realistic estimate e.g., '3-4 months'>"
    }}
  ],
  "realisticCompanies": {{
    "good_fit_now": [
      {{
        "type": "<e.g., 'Early-stage Startup' or 'Mid-size SaaS'>",
        "examples": ["<company type or name>", "<example2>"],
        "why": "<why this is realistic right now>"
      }}
    ],
    "stretch_goal": [
      {{
        "type": "<e.g., 'FAANG' or 'Unicorn Startup'>",
        "examples": ["<example>", "<example2>"],
        "gap": "<what's missing>",
        "timeToReach": "<realistic timeline>"
      }}
    ]
  }},
  "keySkillsForSalaryJump": [
    {{
      "skill": "<specific skill>",
      "salaryImpact": "<e.g., '+$10,000/yr'>",
      "timeToLearn": "<e.g., '3 weeks'>",
      "resource": "<specific free resource>"
    }}
  ],
  "jobSearchStrategy": "<2-sentence specific advice on how this developer should position themselves in the job market right now>"
}}"""

    print(f"[MarketIntelligence] Sending prompt to Gemini (first 200 chars): {prompt[:200]!r}")
    result = ask_gemini_json(prompt)
    result["_source"] = "gemini-ai"
    print(f"[MarketIntelligence] SUCCESS — result['_source'] == {result['_source']!r} (real Gemini response)")
    return result


def _fallback_market_intel(level, tech_stack, score) -> dict:
    level_data = {
        "Beginner": {
            "salary": "$30,000 - $45,000/yr", "inr": "₹3-5 LPA",
            "next_salary": "$45,000 - $65,000/yr", "next_inr": "₹6-8 LPA",
            "roles": ["Junior Developer", "Trainee Engineer", "Intern → FTE"],
            "companies": ["Early-stage startups", "Agencies", "Small SaaS"],
            "percentile": max(10, score - 25)
        },
        "Junior": {
            "salary": "$50,000 - $70,000/yr", "inr": "₹6-10 LPA",
            "next_salary": "$75,000 - $100,000/yr", "next_inr": "₹12-18 LPA",
            "roles": ["Junior Developer", "Software Engineer I", "Frontend/Backend Dev"],
            "companies": ["Series A startups", "Mid-size product companies", "Consultancies"],
            "percentile": max(20, score - 15)
        },
        "Mid-Level": {
            "salary": "$80,000 - $110,000/yr", "inr": "₹14-22 LPA",
            "next_salary": "$120,000 - $160,000/yr", "next_inr": "₹25-40 LPA",
            "roles": ["Software Engineer II", "Full Stack Developer", "Tech Lead"],
            "companies": ["Series B/C startups", "Large product companies", "FAANG stretch"],
            "percentile": max(40, score - 10)
        },
        "Senior": {
            "salary": "$130,000 - $180,000/yr", "inr": "₹30-50 LPA",
            "next_salary": "$180,000 - $250,000+/yr", "next_inr": "₹50-80 LPA",
            "roles": ["Senior Engineer", "Staff Engineer", "Engineering Manager"],
            "companies": ["FAANG", "Unicorns", "High-growth Series C+"],
            "percentile": max(65, score)
        }
    }
    d = level_data.get(level, level_data["Junior"])
    tech_str = ", ".join(tech_stack[:3]) if tech_stack else "web technologies"

    return {
        "_source": "fallback",
        "currentSalaryBracket": {"range": d["salary"], "inrRange": d["inr"], "confidence": "medium"},
        "nextLevelSalaryBracket": {
            "range": d["next_salary"], "inrRange": d["next_inr"],
            "skillsNeeded": ["System Design", "Unit Testing (70%+ coverage)", "CI/CD Pipeline setup"]
        },
        "percentileRank": {
            "overall": d["percentile"],
            "inTechStack": d["percentile"] + 5,
            "description": f"Top {100 - d['percentile']}% of developers working with {tech_str}"
        },
        "rolesYouQualifyFor": [
            {"title": r, "matchScore": score, "reasoning": f"Based on {tech_str} experience", "avgSalary": d["salary"]}
            for r in d["roles"]
        ],
        "rolesYouDontQualifyForYet": [
            {"title": "Senior Software Engineer", "gap": "No system design evidence, no testing culture", "timeToQualify": "4-6 months"}
        ],
        "realisticCompanies": {
            "good_fit_now": [{"type": t, "examples": [], "why": "Matches current skill level"} for t in d["companies"][:2]],
            "stretch_goal": [{"type": "FAANG", "examples": ["Google", "Meta", "Amazon"], "gap": "DSA + System Design + Testing", "timeToReach": "12-18 months"}]
        },
        "keySkillsForSalaryJump": [
            {"skill": "System Design", "salaryImpact": "+$15,000/yr", "timeToLearn": "6 weeks", "resource": "System Design Primer (GitHub)"},
            {"skill": "Testing (Pytest/Jest)", "salaryImpact": "+$8,000/yr", "timeToLearn": "2 weeks", "resource": "pytest.org / jestjs.io"},
            {"skill": "Cloud (AWS/GCP)", "salaryImpact": "+$12,000/yr", "timeToLearn": "4 weeks", "resource": "AWS Free Tier + freeCodeCamp"}
        ],
        "jobSearchStrategy": f"Focus on {d['companies'][0]} as your primary target — your {tech_str} skills are relevant there. Build one polished deployed project with tests before applying."
    }

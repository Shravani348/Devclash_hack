import time
import json
import os
import re
from dotenv import load_dotenv

load_dotenv()


class LLMResumeAuditor:
    def __init__(self):
        self.gemini_key = os.environ.get('GEMINI_API_KEY', '')
        self.use_mock = not bool(self.gemini_key)
        if self.use_mock:
            print("[LLMResumeAuditor] GEMINI_API_KEY not set — will use mock data.")
        else:
            print(f"[LLMResumeAuditor] GEMINI_API_KEY loaded ({len(self.gemini_key)} chars) — using live Gemini AI.")

    def extract_and_analyze(self, file_path, job_description=""):
        """Extract text from a resume PDF and run an AI-powered audit via Gemini."""
        if self.use_mock:
            time.sleep(1)  # Simulate a short processing delay
            return self._generate_simulated_audit()

        try:
            # Use the shared Gemini client and resume service
            from services.resume_service import audit_resume
            result = audit_resume(file_path, job_description)
            return self._normalise(result)
        except Exception as e:
            import traceback
            print(f"[LLMResumeAuditor] Gemini audit failed: {e}")
            traceback.print_exc()
            print("[LLMResumeAuditor] Falling back to simulated audit.")
            return self._generate_simulated_audit()

    def _normalise(self, result: dict) -> dict:
        """
        Map the structured audit_resume() output to the shape expected by
        the existing frontend / API consumers of LLMResumeAuditor.
        """
        overview = result.get("overview", {})
        return {
            "matchScore": result.get("score", 70),
            "overallSummary": overview.get("summary", ""),
            "radar": [
                {"subject": r.get("subject", ""), "A": r.get("A", 5) * 10, "fullMark": 100}
                for r in overview.get("radarData", [])
            ],
            "highlights": overview.get("highlights", []),
            "improvements": overview.get("improvements", []),
            "content": {
                "score": result.get("categories", {}).get("content", {}).get("score", 7) * 10,
                "suggestionCount": result.get("categories", {}).get("content", {}).get("suggestions", 0),
                "measurableResults": [
                    {"original": f, "suggestion": "Add a measurable impact metric (e.g. %, users, speed)."}
                    for f in result.get("content", {}).get("measurableResults", {}).get("flagged", [])
                ],
                "spellingGrammar": [
                    {"original": e.get("original", ""), "errorWord": e.get("error", ""), "reason": e.get("explanation", "")}
                    for e in result.get("content", {}).get("spellingGrammar", {}).get("errors", [])
                ],
            },
            "skills": {
                "score": result.get("categories", {}).get("skills", {}).get("score", 7) * 10,
                "suggestionCount": result.get("categories", {}).get("skills", {}).get("suggestions", 0),
                "hardSkills": [
                    {"skill": s.get("name", ""), "required": bool(s.get("required")),
                     "jdCount": s.get("required", 0), "resumeCount": s.get("found", 0)}
                    for s in result.get("skills", {}).get("hardSkills", [])
                ],
                "softSkills": [
                    {"skill": s.get("name", ""), "required": bool(s.get("required")),
                     "jdCount": s.get("required", 0), "resumeCount": s.get("found", 0)}
                    for s in result.get("skills", {}).get("softSkills", [])
                ],
            },
            "format": {
                "score": result.get("categories", {}).get("format", {}).get("score", 8) * 10,
                "suggestionCount": result.get("categories", {}).get("format", {}).get("suggestions", 0),
                "metrics": [
                    {"label": "Date Formatting", "status": result.get("format", {}).get("dateFormatting", {}).get("status", "PASS"),
                     "message": result.get("format", {}).get("dateFormatting", {}).get("text", "")},
                    {"label": "Resume Length", "status": result.get("format", {}).get("resumeLength", {}).get("status", "PASS"),
                     "message": result.get("format", {}).get("resumeLength", {}).get("text", "")},
                    {"label": "Bullet Points", "status": result.get("format", {}).get("bulletPoints", {}).get("status", "PASS"),
                     "message": result.get("format", {}).get("bulletPoints", {}).get("text", "")},
                ],
            },
            "sections": {
                "score": result.get("categories", {}).get("sections", {}).get("score", 7) * 10,
                "suggestionCount": result.get("categories", {}).get("sections", {}).get("suggestions", 0),
                "items": [
                    {"label": item.get("label", ""), "status": "present" if item.get("status") == "PASS" else "missing",
                     "value": item.get("value", "")}
                    for item in result.get("sections", {}).get("checklist", [])
                ],
            },
            "style": {
                "score": result.get("categories", {}).get("style", {}).get("score", 7) * 10,
                "suggestionCount": result.get("categories", {}).get("style", {}).get("suggestions", 0),
                "voiceTags": result.get("style", {}).get("voice", {}).get("tags", []),
                "buzzwords": [
                    {"original": b.get("sentence", ""), "clicheWord": b.get("phrase", ""), "suggestion": b.get("suggestion", "")}
                    for b in result.get("style", {}).get("buzzwords", [])
                ],
            },
            "_source": result.get("_source", "gemini-ai"),
        }

    def _generate_simulated_audit(self):
        """Fallback mock payload matching the expected API shape."""
        return {
            "matchScore": 71,
            "overallSummary": "Your resume shows strong foundational skills in IT, web, and app development, supported by hands-on projects and internship experience. To better match typical job descriptions, emphasize clear roles, measurable impacts, and alignment with organizational goals. This will boost recruiter confidence in your fit.",
            "radar": [
                {"subject": "Content", "A": 85, "fullMark": 100},
                {"subject": "Format", "A": 90, "fullMark": 100},
                {"subject": "Style", "A": 75, "fullMark": 100},
                {"subject": "Sections", "A": 65, "fullMark": 100},
                {"subject": "Skills", "A": 45, "fullMark": 100}
            ],
            "highlights": [
                "Practical internship creating responsive websites.",
                "Developed AI-based movie recommendation system.",
                "Strong programming skills in Java, Python, C++."
            ],
            "improvements": [
                "Quantify internship project outcomes and impact.",
                "Add detailed role and responsibility descriptions.",
                "Highlight teamwork and communication examples."
            ],
            "content": {
                "score": 85,
                "suggestionCount": 3,
                "measurableResults": [
                    {"original": "Worked on backend API using Node.js.", "suggestion": "Include metrics. Try: 'Developed backend API in Node.js, reducing query response time by 30%.'"},
                    {"original": "Helped the marketing team with data.", "suggestion": "Quantify your help and its business impact."}
                ],
                "spellingGrammar": [
                    {"original": "Responcible for managing the database.", "errorWord": "Responcible", "reason": "Typo. Replace with 'Responsible'."}
                ]
            },
            "skills": {
                "score": 45,
                "suggestionCount": 6,
                "hardSkills": [
                    {"skill": "React.js", "required": True, "jdCount": 3, "resumeCount": 0},
                    {"skill": "Python", "required": False, "jdCount": 1, "resumeCount": 4},
                    {"skill": "AWS", "required": True, "jdCount": 2, "resumeCount": 0}
                ],
                "softSkills": [
                    {"skill": "Leadership", "required": True, "jdCount": 2, "resumeCount": 1},
                    {"skill": "Communication", "required": True, "jdCount": 1, "resumeCount": 0}
                ]
            },
            "format": {
                "score": 90,
                "suggestionCount": 0,
                "metrics": [
                    {"label": "Date Formatting", "status": "PASS", "message": "All dates are consistently formatted (e.g., MM/YYYY)."},
                    {"label": "Resume Length", "status": "PASS", "message": "Resume is concisely kept to 1 page."},
                    {"label": "Bullet Points", "status": "PASS", "message": "Excellent use of bullet points instead of paragraphs."}
                ]
            },
            "sections": {
                "score": 65,
                "suggestionCount": 2,
                "items": [
                    {"label": "Name", "status": "present", "value": "Found in header"},
                    {"label": "Job Title", "status": "missing", "value": "Missing target title"},
                    {"label": "Phone Number", "status": "present", "value": "Found"},
                    {"label": "Email Address", "status": "present", "value": "Found"},
                    {"label": "Portfolio or Website Link", "status": "missing", "value": "Missing GitHub/Portfolio"},
                    {"label": "Summary", "status": "present", "value": "Found"},
                    {"label": "Experience", "status": "present", "value": "Found"}
                ]
            },
            "style": {
                "score": 75,
                "suggestionCount": 3,
                "voiceTags": ["Professional", "Informative", "Technical"],
                "buzzwords": [
                    {"original": "I am a highly motivated team player focused on synergy.", "clicheWord": "highly motivated team player", "suggestion": "Remove fluff words. Show teamwork through a specific project outcome."},
                    {"original": "Think outside the box to solve bugs.", "clicheWord": "Think outside the box", "suggestion": "Use concrete problem-solving examples instead of cliches."}
                ]
            },
            "_source": "fallback"
        }

import time
import json
import os

class LLMResumeAuditor:
    def __init__(self):
        # Determine if we have an API key. For the hackathon, we default to the mock to prevent failures.
        self.anthropic_key = os.environ.get('ANTHROPIC_API_KEY')
        self.use_mock = True # Force mock for immediate hackathon stability

    def extract_and_analyze(self, file_path, job_description=""):
        # Simulate text extraction and LLM thinking time
        time.sleep(3) # Wait exactly 3 seconds to simulate complex AI pipeline

        if self.use_mock or not self.anthropic_key:
            return self._generate_simulated_audit()
        else:
            # Placeholder for actual Anthropic API call if needed later
            return self._generate_simulated_audit()

    def _generate_simulated_audit(self):
        # Highly structured fallback payload explicitly matching the Cake AI Reference Pattern
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
            
            # --- ACCORDION 1: CONTENT ---
            "content": {
                "score": 85,
                "suggestionCount": 3,
                "measurableResults": [
                    {
                        "original": "Worked on backend API using Node.js.",
                        "suggestion": "Include metrics. Try: 'Developed backend API in Node.js, reducing query response time by 30%.'"
                    },
                    {
                        "original": "Helped the marketing team with data.",
                        "suggestion": "Quantify your help and its business impact."
                    }
                ],
                "spellingGrammar": [
                    {
                        "original": "Responcible for managing the database.",
                        "errorWord": "Responcible",
                        "reason": "Typo. Replace with 'Responsible'."
                    }
                ]
            },

            # --- ACCORDION 2: SKILLS ---
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

            # --- ACCORDION 3: FORMAT ---
            "format": {
                "score": 90,
                "suggestionCount": 0,
                "metrics": [
                    {"label": "Date Formatting", "status": "PASS", "message": "All dates are consistently formatted (e.g., MM/YYYY)."},
                    {"label": "Resume Length", "status": "PASS", "message": "Resume is concisely kept to 1 page."},
                    {"label": "Bullet Points", "status": "PASS", "message": "Excellent use of bullet points instead of paragraphs."}
                ]
            },

            # --- ACCORDION 4: SECTIONS ---
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

            # --- ACCORDION 5: STYLE ---
            "style": {
                "score": 75,
                "suggestionCount": 3,
                "voiceTags": ["Professional", "Informative", "Technical"],
                "buzzwords": [
                    {
                        "original": "I am a highly motivated team player focused on synergy.",
                        "clicheWord": "highly motivated team player",
                        "suggestion": "Remove fluff words. Show teamwork through a specific project outcome."
                    },
                    {
                        "original": "Think outside the box to solve bugs.",
                        "clicheWord": "Think outside the box",
                        "suggestion": "Use concrete problem-solving examples instead of clichés."
                    }
                ]
            }
        }

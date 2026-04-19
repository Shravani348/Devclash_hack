import os
import json
import pdfplumber
from dotenv import load_dotenv

load_dotenv()

def extract_text(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text

def audit_resume(pdf_path, jd=""):
    resume_text = extract_text(pdf_path).lower()
    
    # Simple keyword-based 'AI' role detection (Free & Dynamic)
    role = "Software Engineer"
    suitable_roles = ["Junior Developer", "Systems Analyst"]
    if "react" in resume_text or "frontend" in resume_text or "javascript" in resume_text:
        role = "Frontend Engineer"
        suitable_roles = ["React Developer", "UI Architect", "Web Developer"]
    elif "node" in resume_text or "python" in resume_text or "backend" in resume_text:
        role = "Backend Engineer"
        suitable_roles = ["API Developer", "Database Administrator", "DevOps Engineer"]
    if "node" in resume_text and "react" in resume_text:
        role = "Full Stack Engineer"
        suitable_roles = ["Product Engineer", "Technical Lead", "CTO Track"]

    # Enhanced Mock response based on detected role
    mock_response = {
      "score": 82,
      "suggestedRole": role,
      "suitableRoles": suitable_roles,
      "suggestionsCount": 10,
      "categories": {
        "content": { "score": 9, "suggestions": 2 },
        "skills": { "score": 7, "suggestions": 4 },
        "format": { "score": 10, "suggestions": 0 },
        "sections": { "score": 8, "suggestions": 2 },
        "style": { "score": 7, "suggestions": 2 }
      },
      "overview": {
        "summary": f"Based on your profile, you are a strong match for a {role} role. Your resume is well-structured and uses modern technical terminology, but could benefit from more specific leadership metrics.",
        "radarData": [
          { "subject": "Content", "A": 9, "fullMark": 10 },
          { "subject": "Skills", "A": 7, "fullMark": 10 },
          { "subject": "Format", "A": 10, "fullMark": 10 },
          { "subject": "Sections", "A": 8, "fullMark": 10 },
          { "subject": "Style", "A": 7, "fullMark": 10 }
        ],
        "highlights": [f"Deep expertise in {role} fundamentals", "Perfect single-column format", "Clear section hierarchy"],
        "improvements": [f"Add certifications relevant to {suitable_roles[0]}", "Quantify the scale of the users you served", "Link your most impressive GitHub project"]
      },
      "content": {
        "measurableResults": {
          "count": 2,
          "flagged": ["Responsible for the core system architecture", "Assisted in the deployment of new features"]
        },
        "spellingGrammar": {
          "errors": [
            { "original": "Expereince with cloud services", "error": "Expereince", "fix": "Experience", "explanation": "Common spelling error" }
          ]
        }
      },
      "skills": {
        "hardSkills": [
          { "name": "Technical Stack", "required": 1, "found": 1, "status": "found" },
          { "name": "System Design", "required": 1, "found": 0, "status": "missing" }
        ],
        "softSkills": [
           { "name": "Communication", "required": 1, "found": 1, "status": "found" },
           { "name": "Problem Solving", "required": 1, "found": 1, "status": "found" }
        ]
      },
      "format": {
        "dateFormatting": { "status": "PASS", "text": "Dates are consistent and professional." },
        "resumeLength": { "status": "PASS", "text": "Length is optimal for readability." },
        "bulletPoints": { "status": "PASS", "text": "Excellent use of bullet points." }
      },
      "sections": {
        "checklist": [
          { "label": "Name", "status": "PASS", "value": "Detected" },
          { "label": "Portfolio Link", "status": "FAIL", "value": "Missing" },
          { "label": "Summary", "status": "PASS" },
          { "label": "Experience", "status": "PASS" },
          { "label": "Education", "status": "PASS" }
        ]
      },
      "style": {
        "voice": {
          "tags": ["#Professional", "#Direct"],
          "flagged": [ { "original": "I am a hard worker", "suggestion": "Consistently delivered high-quality features ahead of schedule" } ]
        },
        "buzzwords": [
          { "phrase": "Ninja", "sentence": "I am a coding ninja", "suggestion": "Senior Software Engineer" }
        ]
      }
    }
    
    return mock_response


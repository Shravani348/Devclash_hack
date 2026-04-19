import os
import json
import pdfplumber
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_text(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text

def audit_resume(pdf_path, jd=""):
    # resume_text = extract_text(pdf_path) # We still extract it to be realistic
    
    # Returning a high-quality Mock response to allow the user to demo without API errors
    mock_response = {
      "score": 78,
      "suggestionsCount": 12,
      "categories": {
        "content": { "score": 8, "suggestions": 3 },
        "skills": { "score": 6, "suggestions": 5 },
        "format": { "score": 9, "suggestions": 0 },
        "sections": { "score": 7, "suggestions": 2 },
        "style": { "score": 8, "suggestions": 2 }
      },
      "overview": {
        "summary": "Your resume shows strong technical foundations but lacks quantified impact in several key projects. Your formatting is excellent and ATS-friendly.",
        "radarData": [
          { "subject": "Content", "A": 8, "fullMark": 10 },
          { "subject": "Skills", "A": 6, "fullMark": 10 },
          { "subject": "Format", "A": 9, "fullMark": 10 },
          { "subject": "Sections", "A": 7, "fullMark": 10 },
          { "subject": "Style", "A": 8, "fullMark": 10 }
        ],
        "highlights": ["Single-column ATS friendly layout", "Strong technical stack listed", "Clear education and experience sections"],
        "improvements": ["Add more metrics to project descriptions", "Include a link to your portfolio/GitHub", "Specify version numbers for key frameworks"]
      },
      "content": {
        "measurableResults": {
          "count": 2,
          "flagged": ["Worked on the frontend of a banking application", "Collaborated with team to fix bugs"]
        },
        "spellingGrammar": {
          "errors": [
            { "original": "Responsible for devloping features", "error": "devloping", "fix": "developing", "explanation": "Typo in core responsibility" }
          ]
        }
      },
      "skills": {
        "hardSkills": [
          { "name": "React", "required": 1, "found": 1, "status": "found" },
          { "name": "Node.js", "required": 1, "found": 1, "status": "found" },
          { "name": "AWS", "required": 1, "found": 0, "status": "missing" },
          { "name": "Docker", "required": 1, "found": 0, "status": "missing" }
        ],
        "softSkills": [
           { "name": "Leadership", "required": 1, "found": 1, "status": "found" },
           { "name": "Agile", "required": 1, "found": 0, "status": "missing" }
        ]
      },
      "format": {
        "dateFormatting": { "status": "PASS", "text": "All dates follow the Month YYYY standard." },
        "resumeLength": { "status": "PASS", "text": "One-page format is perfect for your experience level." },
        "bulletPoints": { "status": "PASS", "text": "Consistent bullet point usage across all sections." }
      },
      "sections": {
        "checklist": [
          { "label": "Name", "status": "PASS", "value": "Shravani Paralkar" },
          { "label": "Job Title", "status": "PASS", "value": "Full Stack Developer" },
          { "label": "Phone Number", "status": "PASS", "value": "Present" },
          { "label": "Email Address", "status": "PASS", "value": "Present" },
          { "label": "Portfolio Link", "status": "FAIL", "value": "Missing" },
          { "label": "Summary", "status": "PASS" },
          { "label": "Experience", "status": "PASS" },
          { "label": "Education", "status": "PASS" },
          { "label": "Hard Skills", "status": "PASS" },
          { "label": "Soft Skills", "status": "PASS" }
        ]
      },
      "style": {
        "voice": {
          "tags": ["#Professional", "#Informative"],
          "flagged": [ { "original": "I was in charge of the database", "suggestion": "Architected and managed the core database schema" } ]
        },
        "buzzwords": [
          { "phrase": "Team Player", "sentence": "I am a motivated team player", "suggestion": "Collaborative Engineer" }
        ]
      }
    }
    
    return mock_response


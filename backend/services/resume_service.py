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
    resume_text = extract_text(pdf_path)
    
    prompt = f"""
    You are an expert ATS (Applicant Tracking System) auditor and career coach.
    Analyze the following resume text and compare it to the Job Description (if provided).
    
    Resume Text:
    {resume_text}
    
    Job Description:
    {jd if jd else "General Tech Role (Software Engineer / Fullstack)"}
    
    Return a strictly structured JSON response with the following fields:
    {{
      "score": (0-100),
      "suggestionsCount": total number of suggestions,
      "categories": {{
        "content": {{ "score": 0-10, "suggestions": count }},
        "skills": {{ "score": 0-10, "suggestions": count }},
        "format": {{ "score": 0-10, "suggestions": count }},
        "sections": {{ "score": 0-10, "suggestions": count }},
        "style": {{ "score": 0-10, "suggestions": count }}
      }},
      "overview": {{
        "summary": "2-3 sentence overall summary",
        "radarData": [
          {{ "subject": "Content", "A": score, "fullMark": 10 }},
          {{ "subject": "Skills", "A": score, "fullMark": 10 }},
          {{ "subject": "Format", "A": score, "fullMark": 10 }},
          {{ "subject": "Sections", "A": score, "fullMark": 10 }},
          {{ "subject": "Style", "A": score, "fullMark": 10 }}
        ],
        "highlights": ["bullet list of what the resume does well"],
        "improvements": ["bullet list of what needs fixing"]
      }},
      "content": {{
        "measurableResults": {{
          "count": count,
          "flagged": ["exact sentences from resume that lack measurable results"]
        }},
        "spellingGrammar": {{
          "errors": [
            {{ "original": "sentence", "error": "phrase", "fix": "fix", "explanation": "why" }}
          ]
        }}
      }},
      "skills": {{
        "hardSkills": [
          {{ "name": "Skill Name", "required": 1, "found": 0 or 1, "status": "missing" or "found" }}
        ],
        "softSkills": [
           {{ "name": "Skill Name", "required": 1, "found": 0 or 1, "status": "missing" or "found" }}
        ]
      }},
      "format": {{
        "dateFormatting": {{ "status": "PASS" or "FAIL", "text": "explanation" }},
        "resumeLength": {{ "status": "PASS" or "FAIL", "text": "explanation" }},
        "bulletPoints": {{ "status": "PASS" or "FAIL", "text": "explanation" }}
      }},
      "sections": {{
        "checklist": [
          {{ "label": "Name", "status": "PASS" or "FAIL", "value": "extracted value or Missing" }},
          {{ "label": "Job Title", "status": "PASS" or "FAIL", "value": "extracted value or Missing" }},
          {{ "label": "Phone Number", "status": "PASS" or "FAIL", "value": "extracted value or Missing" }},
          {{ "label": "Email Address", "status": "PASS" or "FAIL", "value": "extracted value or Missing" }},
          {{ "label": "Portfolio Link", "status": "PASS" or "FAIL", "value": "extracted value or Missing" }},
          {{ "label": "Summary", "status": "PASS" or "FAIL" }},
          {{ "label": "Experience", "status": "PASS" or "FAIL" }},
          {{ "label": "Education", "status": "PASS" or "FAIL" }},
          {{ "label": "Hard Skills", "status": "PASS" or "FAIL" }},
          {{ "label": "Soft Skills", "status": "PASS" or "FAIL" }}
        ]
      }},
      "style": {{
        "voice": {{
          "tags": ["#Professional", "#Informative", "#Clarifying"],
          "flagged": [ {{ "original": "sentence", "suggestion": "suggested active voice sentence" }} ]
        }},
        "buzzwords": [
          {{ "phrase": "cliche word", "sentence": "sentence", "suggestion": "better word" }}
        ]
      }}
    }}
    
    Ensure all sentences in the "original" fields are EXACT quotes from the resume.
    If Job Description is missing, infer the standard requirements for a Software Engineer.
    """

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{{"role": "user", "content": prompt}}],
        response_format={{ "type": "json_object" }}
    )
    
    return json.loads(response.choices[0].message.content)

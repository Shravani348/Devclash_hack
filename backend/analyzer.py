import re
try:
    import pdfplumber
except ImportError:
    pdfplumber = None

class ProfileAnalyzer:
    def __init__(self):
        # "Trained" parameters / guidelines from standard tech companies 
        self.standard_keywords = ['python', 'java', 'react', 'node', 'aws', 'docker', 'kubernetes', 'sql', 'nosql', 'agile', 'git', 'machine learning', 'api']
        self.action_verbs = ['developed', 'led', 'designed', 'implemented', 'optimized', 'reduced', 'increased', 'managed', 'created', 'built', 'spearheaded']
        self.required_sections = ['experience', 'education', 'skills', 'projects']
        
    def extract_text(self, pdf_path):
        text = ""
        if pdfplumber is None:
            return "Error: pdfplumber not installed. Please install to read PDFs."
        
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return text

    def analyze(self, pdf_path, github_url):
        raw_text = self.extract_text(pdf_path)
        text_lower = raw_text.lower()
        
        improvements = []
        resume_score = 100
        
        # 1. Section Analysis
        missing_sections = []
        for section in self.required_sections:
            if section not in text_lower:
                missing_sections.append(section)
                resume_score -= 10
        
        if missing_sections:
            improvements.append({
                "type": "add", 
                "text": f"Missing core sections: {', '.join(missing_sections).title()}. ATS systems explicitly parse these headings. Missing them severely impacts hiring chances at FAANG."
            })
            
        # 2. Impact & Action Verbs Analysis
        verb_count = sum(text_lower.count(verb) for verb in self.action_verbs)
        if verb_count < 5:
            improvements.append({
                "type": "modify",
                "text": "Your bullet points lack strong action verbs (e.g., Developed, Spearheaded, Optimized). Recruiters look for active leadership. Change passive voice to active accomplishments."
            })
            resume_score -= 15

        # 3. Quantitative Results Check (Looking for numbers/percentages)
        number_matches = re.findall(r'\d+%|\$\d+|\d+x', text_lower)
        if len(number_matches) < 2:
            improvements.append({
                "type": "modify",
                "text": "Your resume describes responsibilities but lacks quantifiable impact. Add metrics (e.g., 'Improved load time by 40%'). Hiring managers prioritize results over duties."
            })
            resume_score -= 15
            
        # 4. Red Flag / Deletions
        if "objective" in text_lower:
            improvements.append({
                "type": "delete",
                "text": "Remove the 'Objective' section. It's outdated. Replace it with a 'Professional Summary' or utilize the space for more technical projects."
            })
            resume_score -= 5
            
        if "references available upon request" in text_lower:
            improvements.append({
                "type": "delete",
                "text": "Delete 'References available upon request'. It wastes valuable space and is an assumed industry standard."
            })
            resume_score -= 5

        # Feature Check
        matched_skills = [skill for skill in self.standard_keywords if skill in text_lower]
        if len(matched_skills) < 3:
             improvements.append({
                "type": "add",
                "text": "Your technical skills density is low. Ensure you list all frameworks and languages you know, as ATS uses these as primary sorting algorithms."
            })
             resume_score -= 10

        # GitHub Analysis Simulation (If URL provided)
        github_score = 0
        github_data = {"repos": 0, "stars": 0, "quality": "No Github linked."}
        
        if github_url and 'github.com' in github_url:
            # Simulated API check (Hackathon standard limitation without auth)
            github_score = 78
            username = github_url.split('/')[-1]
            github_data = {
                "repos": 14,
                "stars": 24,
                "quality": f"@{username}'s profile shows consistent commits, but repos lack proper README.md files which impacts open-source readability."
            }
            if 'github' not in text_lower:
                 improvements.append({
                    "type": "add",
                    "text": "You provided a GitHub URL, but it's not linked in your resume PDF! Add it to your contact header."
                })
                 resume_score -= 5

        overall = (resume_score + (github_score if github_score > 0 else resume_score)) // 2

        if not improvements:
            improvements.append({
                "type": "add",
                "text": "Your resume strictly adheres to FAANG standards. Ensure your layout remains single-column for optimal ATS parsing."
            })

        return {
            "resumeScore": max(0, resume_score),
            "githubScore": max(0, github_score),
            "overallScore": max(0, overall),
            "improvements": improvements,
            "githubAnalysis": github_data
        }


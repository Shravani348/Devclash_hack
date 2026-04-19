from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProfileInput(BaseModel):
    name:str
    email:str
    github:str
    leetcode:str
    linkedin:str
    
@app.get("/")
def home():
    return {"message":"API Running"}

@app.post('/analyze')
def analyze(profile: ProfileInput):

    score=50

    if 'github' in profile.github.lower():
        score += 15

    if 'leetcode' in profile.leetcode.lower():
        score += 20

    if 'linkedin' in profile.linkedin.lower():
        score += 10

    if score < 60:
        level='Low'
    elif score < 80:
        level='Moderate'
    else:
        level='High'

    return {
        'skillLevel': level,
        'score': score,
        'chartData':[
            {'name':'Coding','value':75},
            {'name':'Projects','value':70},
            {'name':'Problem Solving','value':65},
            {'name':'System Design','value':45}
        ],
        'improvementAreas':[
            'Improve System Design',
            'Add Unit Testing',
            'Improve Database Optimization',
            'Strengthen Authentication Security'
        ],
        'overallAnalysis':
        'Good project foundation with moderate skill level. Focus on system design, testing and security to move higher.'
    }
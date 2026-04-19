export const developerData = {
  name: "Aryan Sharma",
  github: "aryan-dev",
  skillLevel: "Mid-Level",
  overallScore: 72,
  percentile: 68,
  languages: { JavaScript: 45, Python: 30, CSS: 15, HTML: 10 },
  scores: {
    codeQuality: 78, testCoverage: 42, documentation: 65,
    security: 55, architecture: 70, ciCd: 38
  },
  strengths: [
    { skill: "React Component Design", score: 88, evidence: "Consistent use of hooks and functional components across 12 repos" },
    { skill: "REST API Integration", score: 82, evidence: "Well-structured API calls with error handling in 8 projects" }
  ],
  weaknesses: [
    { area: "Test Coverage", severity: "Critical", issue: "Only 2 of 14 repos have any test files at all", fix: "Add Jest tests to your top 3 repos" },
    { area: "Security Headers", severity: "High", issue: "No authentication middleware in backend repos", fix: "Add JWT middleware to Express/Flask routes" },
    { area: "CI/CD Pipeline", severity: "Medium", issue: "No GitHub Actions config found in any repo", fix: "Add .github/workflows/test.yml" }
  ],
  jobMatches: [
    { title: "Frontend Developer", fit: 84, salary: "₹8L–₹14L", companies: ["Razorpay", "Swiggy", "Meesho"] },
    { title: "Full Stack Developer", fit: 71, salary: "₹10L–₹18L", companies: ["Zepto", "PhonePe", "CRED"] },
    { title: "React Developer", fit: 79, salary: "₹7L–₹13L", companies: ["Freshworks", "Zoho", "BrowserStack"] }
  ],
  roadmap: [
    { weeks: "Week 1–2", focus: "Test Coverage", action: "Add Jest tests to top 3 repos", outcome: "Test score 42 → 65" },
    { weeks: "Week 3–4", focus: "Security", action: "Implement JWT auth in one full project", outcome: "Unlocks Mid→Senior security score" },
    { weeks: "Week 5–8", focus: "CI/CD", action: "Set up GitHub Actions on every repo", outcome: "Adds DevOps credibility to resume" },
    { weeks: "Week 9–12", focus: "Architecture", action: "Refactor one project to clean layered architecture", outcome: "Portfolio becomes interview-ready" }
  ]
};

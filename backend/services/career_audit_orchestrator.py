"""
Career Audit Orchestrator — The main 360-degree audit engine.
Combines Deep GitHub Audit + Market Intelligence + Roadmap + Resume Rewrite
into one unified, comprehensive developer career report.
"""
import os
import traceback
from services.deep_github_audit import run_deep_audit
from services.market_intelligence import get_market_intelligence
from services.roadmap_service import generate_roadmap


def run_full_career_audit(github_username: str, pdf_path: str = None) -> dict:
    """
    Orchestrates the complete 360-degree career audit.
    Returns a unified report combining all AI services.
    """
    report = {
        "username": github_username,
        "status": "running",
        "stages": {}
    }

    # ── Stage 1: Deep GitHub Audit ──────────────────────────────────
    print(f"[Orchestrator] Stage 1: Deep GitHub audit for {github_username}")
    try:
        deep_audit = run_deep_audit(github_username)
        if "error" in deep_audit:
            return {"error": deep_audit["error"], "stage": "github_audit"}
        report["stages"]["deepAudit"] = deep_audit
    except Exception as e:
        traceback.print_exc()
        return {"error": f"GitHub audit failed: {str(e)}", "stage": "github_audit"}

    # Extract key signals from deep audit
    level = deep_audit.get("developerLevel", "Junior")
    score = deep_audit.get("overallScore", 50)
    tech_stack = deep_audit.get("techStackDetected", [])
    code_quality = deep_audit.get("codeQualityScores", {})
    specific_issues = deep_audit.get("specificCodeIssues", [])
    pattern_issues = deep_audit.get("patternIssues", [])
    repo_health = deep_audit.get("repoHealthSummary", [])
    what_blocks = deep_audit.get("whatBlocksNextLevel", "")
    years_est = deep_audit.get("yearsExperienceEstimate", "1-2 years")

    # Combine all issues
    all_issues = specific_issues + [
        {
            "repo": i.get("repo", ""),
            "file": i.get("file", ""),
            "line": i.get("line"),
            "severity": i.get("severity", "MEDIUM"),
            "issue": i.get("issue", ""),
            "detail": i.get("snippet", ""),
            "fix": "Fix immediately"
        }
        for i in pattern_issues
        if not any(pi.get("file") == i.get("file") for pi in specific_issues)
    ]

    # Build skill gaps for roadmap
    gaps = []
    if code_quality.get("testCoverage", 0) < 40:
        gaps.append("No unit tests — add Pytest/Jest test suite")
    if code_quality.get("security", 0) < 50:
        gaps.append("Security vulnerabilities detected in code")
    if code_quality.get("documentation", 0) < 40:
        gaps.append("Missing documentation and README files")
    if code_quality.get("errorHandling", 0) < 40:
        gaps.append("Poor error handling — missing try/catch blocks")
    if code_quality.get("architecturalPatterns", 0) < 40:
        gaps.append("No clear architectural patterns — code lacks structure")
    if what_blocks:
        gaps.insert(0, what_blocks)

    # ── Stage 2: Market Intelligence ────────────────────────────────
    print(f"[Orchestrator] Stage 2: Market intelligence")
    try:
        market = get_market_intelligence(
            developer_level=level,
            tech_stack=tech_stack,
            overall_score=score,
            code_quality_scores=code_quality,
            gaps=gaps,
            years_estimate=years_est
        )
        report["stages"]["marketIntelligence"] = market
    except Exception as e:
        traceback.print_exc()
        report["stages"]["marketIntelligence"] = {"error": str(e)}

    # ── Stage 3: Resume Rewrite (if PDF provided) ───────────────────
    if pdf_path and os.path.exists(pdf_path):
        print(f"[Orchestrator] Stage 3: Resume rewrite")
        try:
            from services.resume_rewriter import rewrite_resume_from_code
            rewrite = rewrite_resume_from_code(pdf_path, deep_audit, github_username)
            report["stages"]["resumeRewrite"] = rewrite
        except Exception as e:
            traceback.print_exc()
            report["stages"]["resumeRewrite"] = {"error": str(e)}

    # ── Stage 4: 90-Day Roadmap ─────────────────────────────────────
    print(f"[Orchestrator] Stage 4: 90-day roadmap generation")
    try:
        roadmap = generate_roadmap(
            github_username=github_username,
            tech_stack=tech_stack,
            current_level=level,
            target_role=_get_target_role(level, tech_stack),
            gaps=gaps[:5]
        )
        report["stages"]["roadmap"] = roadmap
    except Exception as e:
        traceback.print_exc()
        report["stages"]["roadmap"] = {"error": str(e)}

    # ── Flatten into final report ────────────────────────────────────
    report["status"] = "complete"
    report["summary"] = {
        "developerLevel": level,
        "overallScore": score,
        "percentileRank": deep_audit.get("percentileRank", 50),
        "techStackDetected": tech_stack,
        "yearsExperienceEstimate": years_est,
        "careerLevelVerdict": deep_audit.get("careerLevelVerdict", ""),
        "whatBlocksNextLevel": what_blocks,
    }
    report["codeAudit"] = {
        "codeQualityScores": code_quality,
        "specificIssues": all_issues[:10],
        "repoHealthSummary": repo_health,
        "antiPatterns": deep_audit.get("antiPatterns", []),
        "strengths": deep_audit.get("strengths", []),
    }
    report["marketIntelligence"] = report["stages"].get("marketIntelligence", {})
    report["resumeRewrite"] = report["stages"].get("resumeRewrite", None)
    report["roadmap"] = report["stages"].get("roadmap", {})

    return report


def _get_target_role(level: str, tech_stack: list) -> str:
    tech = tech_stack or []
    is_ml = any(t in tech for t in ["Python", "TensorFlow", "PyTorch", "scikit-learn"])
    is_frontend = any(t in tech for t in ["React", "Vue", "Angular", "TypeScript"])
    is_fullstack = len(tech) >= 3

    if is_ml:
        return "ML/AI Engineer"
    if is_fullstack and level in ("Mid-Level", "Senior"):
        return "Senior Full Stack Engineer"
    if is_fullstack:
        return "Full Stack Developer"
    if is_frontend:
        return "Frontend Engineer"
    level_map = {
        "Beginner": "Junior Software Developer",
        "Junior": "Software Engineer",
        "Mid-Level": "Senior Software Engineer",
        "Senior": "Staff Engineer"
    }
    return level_map.get(level, "Software Engineer")

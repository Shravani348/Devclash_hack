import os
import sys
import subprocess
import json
import time
from collections import defaultdict
from threading import Lock

# Fix Windows cp1252 encoding issues — force UTF-8 stdout/stderr
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from routes.github_routes import github_bp
from services.db_service import db_health

# ── In-memory rate limiter (per IP, no Redis needed) ─────────────────────
_rate_data = defaultdict(lambda: {"hourly": [], "daily": []})
_rate_lock = Lock()
RATE_LIMIT_HOURLY = 5
RATE_LIMIT_DAILY  = 20

def _check_rate_limit(ip: str):
    """Returns (allowed: bool, message: str, retry_after: int)."""
    now = time.time()
    with _rate_lock:
        entry = _rate_data[ip]
        entry["hourly"] = [t for t in entry["hourly"] if now - t < 3600]
        entry["daily"]  = [t for t in entry["daily"]  if now - t < 86400]

        if len(entry["hourly"]) >= RATE_LIMIT_HOURLY:
            oldest = entry["hourly"][0]
            retry_after = int(3600 - (now - oldest))
            return False, f"Hourly limit reached ({RATE_LIMIT_HOURLY} analyses/hr). Retry in {retry_after}s.", retry_after
        if len(entry["daily"]) >= RATE_LIMIT_DAILY:
            oldest = entry["daily"][0]
            retry_after = int(86400 - (now - oldest))
            return False, f"Daily limit reached ({RATE_LIMIT_DAILY} analyses/day). Retry in {retry_after}s.", retry_after

        entry["hourly"].append(now)
        entry["daily"].append(now)
        return True, "", 0

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(github_bp, url_prefix="/api/github")

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "version": "2.0.0",
        "database": db_health(),
        "features": ["github-analysis", "resume-audit", "code-quality", "career-audit", "roadmap"]
    })

def _save_temp(file):
    temp_dir = os.environ.get('TEMP', './') if os.name == 'nt' else '/tmp'
    temp_path = os.path.join(temp_dir, file.filename)
    file.save(temp_path)
    return temp_path

# ── Resume (legacy) ─────────────────────────────────────────────────
@app.route('/analyze', methods=['POST'])
def analyze_profile():
    if 'resume' not in request.files: return jsonify({'error': 'No resume file'}), 400
    file = request.files['resume']
    github_url = request.form.get('github', '')
    if not file.filename.endswith('.pdf'): return jsonify({'error': 'PDF required'}), 400
    temp_path = _save_temp(file)
    try:
        from analyzer import analyze
        return jsonify(analyze(temp_path, github_url))
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)

# ── AI Resume Audit ──────────────────────────────────────────────────────
@app.route('/api/resume/audit', methods=['POST'])
def resume_audit():
    if 'resume' not in request.files: return jsonify({'error': 'No resume file'}), 400
    file = request.files['resume']
    jd    = request.form.get('jd', '')
    force = request.form.get('force', 'false').lower() == 'true'
    if not file.filename.endswith('.pdf'): return jsonify({'error': 'PDF required'}), 400

    # Rate limiting (skip for cache hits)
    if not force:
        ip = request.remote_addr or '0.0.0.0'
        allowed, msg, retry_after = _check_rate_limit(ip)
        if not allowed:
            resp = jsonify({'error': msg, 'retry_after_seconds': retry_after})
            resp.headers['Retry-After'] = str(retry_after)
            return resp, 429

    temp_path = _save_temp(file)
    try:
        from services.resume_service import audit_resume
        return jsonify(audit_resume(temp_path, jd, force=force))
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)

# ── App Auditor (Playwright) ─────────────────────────────────────────
@app.route('/audit', methods=['POST'])
def audit_app():
    data = request.get_json()
    if not data or 'url' not in data: return jsonify({'error': 'No URL provided'}), 400
    try:
        cmd = ['python', 'auditor.py', data['url']]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True,
                                cwd=os.path.dirname(os.path.abspath(__file__)))
        return jsonify(json.loads(result.stdout.strip()))
    except subprocess.CalledProcessError as e:
        return jsonify({'error': f"Auditor crashed: {e.stderr}"}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ── LeetCode ─────────────────────────────────────────────────────────
@app.route('/api/leetcode/analyze', methods=['POST'])
def leetcode_analyze():
    data = request.get_json() or {}
    username = data.get('username', 'Unknown')
    return jsonify({'success': True, 'data': {
        'username': username, 'level': "Intermediate", 'ranking': 12345,
        'skillScore': 75, 'problemsSolved': {'easy': 120, 'medium': 80, 'hard': 25, 'total': 225}
    }})

# ── Code Quality (Gemini AI) ─────────────────────────────────────────
@app.route('/api/code/analyze', methods=['POST'])
def code_analyze():
    data = request.get_json() or {}
    username = data.get('username')
    if not username: return jsonify({'error': 'Username required'}), 400
    from services.code_quality_service import audit_github_user
    return jsonify(audit_github_user(username))

# ── Roadmap Generator ────────────────────────────────────────────────
@app.route('/api/roadmap', methods=['POST'])
def generate_roadmap():
    data = request.get_json() or {}
    try:
        from services.roadmap_service import generate_roadmap as gen
        return jsonify(gen(
            github_username=data.get('github_username', ''),
            tech_stack=data.get('tech_stack', []),
            current_level=data.get('current_level', 'Junior'),
            target_role=data.get('target_role', 'Full Stack Developer'),
            gaps=data.get('gaps', [])
        ))
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ── Skill Gap Detector ───────────────────────────────────────────────
@app.route('/api/skillgap', methods=['POST'])
def skill_gap():
    if 'resume' not in request.files: return jsonify({'error': 'No resume file'}), 400
    file = request.files['resume']
    github_username = request.form.get('github_username', '')
    if not file.filename.endswith('.pdf'): return jsonify({'error': 'PDF required'}), 400
    if not github_username: return jsonify({'error': 'GitHub username required'}), 400
    temp_path = _save_temp(file)
    try:
        from services.skillgap_service import analyze_skill_gap
        return jsonify(analyze_skill_gap(temp_path, github_username))
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)

# ── 🆕 FULL 360° CAREER AUDIT ────────────────────────────────────────
@app.route('/api/career/full-audit', methods=['POST'])
def full_career_audit():
    github_username = request.form.get('github_username') or (request.get_json() or {}).get('github_username')
    if not github_username:
        return jsonify({'error': 'GitHub username is required'}), 400

    pdf_path = None
    if 'resume' in request.files:
        file = request.files['resume']
        if file.filename.endswith('.pdf'):
            pdf_path = _save_temp(file)

    try:
        from services.career_audit_orchestrator import run_full_career_audit
        result = run_full_career_audit(github_username, pdf_path)
        return jsonify(result)
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    finally:
        if pdf_path and os.path.exists(pdf_path):
            os.remove(pdf_path)

# ── 🆕 RESUME REWRITE FROM CODE ──────────────────────────────────────
@app.route('/api/resume/rewrite', methods=['POST'])
def resume_rewrite():
    if 'resume' not in request.files: return jsonify({'error': 'No resume file'}), 400
    file = request.files['resume']
    github_username = request.form.get('github_username', '')
    if not file.filename.endswith('.pdf'): return jsonify({'error': 'PDF required'}), 400
    if not github_username: return jsonify({'error': 'GitHub username required'}), 400
    temp_path = _save_temp(file)
    try:
        from services.deep_github_audit import run_deep_audit
        from services.resume_rewriter import rewrite_resume_from_code
        audit_data = run_deep_audit(github_username)
        return jsonify(rewrite_resume_from_code(temp_path, audit_data, github_username))
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)


# ── PDF Export (reportlab) ───────────────────────────────────────────
@app.route('/export-report-pdf', methods=['POST'])
def export_report_pdf():
    """
    Accept the analysis JSON and return a clean, downloadable PDF.
    POST body: { "data": <analysis JSON object> }
    """
    try:
        body = request.get_json(force=True)
        if not body or 'data' not in body:
            return jsonify({'error': 'Missing "data" field in request body'}), 400
        data = body['data']

        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import mm
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        )
        from reportlab.lib.enums import TA_LEFT, TA_CENTER
        import io

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4,
                                leftMargin=15*mm, rightMargin=15*mm,
                                topMargin=15*mm, bottomMargin=15*mm)

        styles = getSampleStyleSheet()
        h1  = ParagraphStyle('h1',  parent=styles['Heading1'], fontSize=20, spaceAfter=6, textColor=colors.HexColor('#1e293b'))
        h2  = ParagraphStyle('h2',  parent=styles['Heading2'], fontSize=13, spaceAfter=4, textColor=colors.HexColor('#334155'))
        h3  = ParagraphStyle('h3',  parent=styles['Heading3'], fontSize=11, spaceAfter=3, textColor=colors.HexColor('#475569'))
        body_s = ParagraphStyle('body', parent=styles['Normal'],   fontSize=9,  spaceAfter=4, leading=13)
        good   = ParagraphStyle('good', parent=body_s, textColor=colors.HexColor('#16a34a'))
        warn   = ParagraphStyle('warn', parent=body_s, textColor=colors.HexColor('#d97706'))
        bad    = ParagraphStyle('bad',  parent=body_s, textColor=colors.HexColor('#dc2626'))

        story = []
        score = data.get('score', 0)
        role  = data.get('suggestedRole', 'N/A')
        source = data.get('_source', 'unknown')

        # ── Header ──
        story.append(Paragraph('Resume Audit Report', h1))
        story.append(Paragraph(f'<b>Overall Score:</b> {score}/100 &nbsp;|&nbsp; <b>Suggested Role:</b> {role} &nbsp;|&nbsp; <b>Source:</b> {source}', body_s))
        story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=8))

        # ── Overview summary ──
        overview = data.get('overview', {})
        if overview.get('summary'):
            story.append(Paragraph('Overview', h2))
            story.append(Paragraph(overview['summary'], body_s))
            story.append(Spacer(1, 4))

        if overview.get('highlights'):
            story.append(Paragraph('Highlights', h3))
            for h in overview['highlights']:
                story.append(Paragraph(f'• {h}', good))
            story.append(Spacer(1, 4))

        if overview.get('improvements'):
            story.append(Paragraph('Key Improvements', h3))
            for im in overview['improvements']:
                story.append(Paragraph(f'• {im}', warn))
            story.append(Spacer(1, 6))

        # ── Score Breakdown ──
        breakdown = data.get('quantified_score_breakdown', {})
        if breakdown.get('weights'):
            story.append(Paragraph('Score Breakdown (Weighted)', h2))
            tdata = [['Category', 'Weight', 'Raw Score', 'Contribution']]
            for cat, vals in breakdown['weights'].items():
                tdata.append([cat.capitalize(), f"{vals.get('weight_pct',0)}%",
                              str(vals.get('raw_score',0)), f"{vals.get('weighted_contribution',0):.1f}"])
            t = Table(tdata, hAlign='LEFT')
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
                ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
                ('FONTSIZE',   (0,0), (-1,-1), 8),
                ('GRID',       (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
                ('PADDING',    (0,0), (-1,-1), 4),
            ]))
            story.append(t)
            if breakdown.get('explanation'):
                story.append(Spacer(1,4))
                story.append(Paragraph(breakdown['explanation'], body_s))
            story.append(Spacer(1,6))

        # ── Priority Ranking ──
        priorities = data.get('priority_ranking', [])
        if priorities:
            story.append(Paragraph('Priority Action List', h2))
            for p in priorities:
                impact_color = {'High': '#dc2626', 'Medium': '#d97706', 'Low': '#16a34a'}.get(p.get('impact',''), '#64748b')
                story.append(Paragraph(
                    f'<font color="{impact_color}"><b>[{p.get("impact","?")}]</b></font> '
                    f'<b>#{p.get("rank","?")} {p.get("category","?")}:</b> {p.get("issue","")}',
                    body_s
                ))
                if p.get('action'):
                    story.append(Paragraph(f'   → {p["action"]}', body_s))
                if p.get('ready_to_paste'):
                    story.append(Paragraph(f'   <i>Paste: {p["ready_to_paste"]}</i>', body_s))
            story.append(Spacer(1,6))

        # ── Impact Quantification ──
        iq = data.get('impact_quantification', {})
        if iq.get('flagged_bullets'):
            story.append(Paragraph(f'Impact Quantification (Score: {iq.get("score","?")})', h2))
            story.append(Paragraph(iq.get('summary',''), body_s))
            for fb in iq['flagged_bullets']:
                story.append(Paragraph(f'<b>Original:</b> {fb.get("original","")}', bad))
                story.append(Paragraph(f'<b>Rewritten:</b> {fb.get("rewritten","")}', good))
            story.append(Spacer(1,6))

        # ── ATS Parseability ──
        ats = data.get('ats_parseability', {})
        if ats.get('flags'):
            story.append(Paragraph(f'ATS Parseability (Score: {ats.get("score","?")})', h2))
            story.append(Paragraph(ats.get('summary',''), body_s))
            for flag in ats['flags']:
                story.append(Paragraph(f'• <b>{flag.get("issue","")}:</b> {flag.get("detail","")} → {flag.get("fix","")}', warn))
            story.append(Spacer(1,6))

        # ── Sections Checklist ──
        checklist = data.get('sections', {}).get('checklist', [])
        if checklist:
            story.append(Paragraph('Sections Checklist', h2))
            for item in checklist:
                style_use = good if item.get('status') == 'PASS' else bad
                mark = '[PASS]' if item.get('status') == 'PASS' else '[FAIL]'
                story.append(Paragraph(f'{mark} {item.get("label","")} — {item.get("value","")}', style_use))
            story.append(Spacer(1,6))

        doc.build(story)
        buf.seek(0)
        return send_file(
            buf,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='resume_audit_report.pdf'
        )
    except ImportError:
        return jsonify({'error': 'reportlab is not installed. Run: pip install reportlab'}), 500
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ── Resume History (score over time) ────────────────────────────────
@app.route('/api/resume/history', methods=['GET'])
def resume_history():
    """Return cached analysis log entries — used for score-over-time chart."""
    try:
        from services.audit_logger import get_recent_logs
        logs = get_recent_logs(n=100)
        return jsonify({'history': logs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── Audit Logs (admin/debug view) ────────────────────────────────────
@app.route('/api/audit-logs', methods=['GET'])
def audit_logs():
    """Return recent structured audit log entries."""
    try:
        from services.audit_logger import get_recent_logs
        n = min(int(request.args.get('n', 50)), 200)
        return jsonify({'logs': get_recent_logs(n)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=8000)

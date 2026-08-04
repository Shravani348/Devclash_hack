import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Github, Upload, Zap, ArrowLeft, AlertTriangle, CheckCircle,
  XCircle, TrendingUp, Award, Code2, Briefcase, Map, FileText,
  ChevronDown, ChevronUp, Star, Shield, Target, Clock,
  BarChart2, AlertCircle, ExternalLink, Sparkles, RefreshCw
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Cell
} from 'recharts';

const FLASK_BASE = 'http://localhost:8000';

/* ── Severity Badge ─────────────────────────────────── */
const SeverityBadge = ({ s }) => {
  const map = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/40',
    HIGH:     'bg-orange-500/20 text-orange-400 border-orange-500/40',
    MEDIUM:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    LOW:      'bg-blue-500/20 text-blue-400 border-blue-500/40',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[s] || map.LOW}`}>
      {s}
    </span>
  );
};

/* ── Score Ring ─────────────────────────────────────── */
const ScoreRing = ({ score, size = 120, label }) => {
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.5s ease' }} />
      </svg>
      <div className="flex flex-col items-center" style={{ marginTop: -size * 0.7 - 4, position: 'relative', zIndex: 1 }}>
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">/ 100</span>
      </div>
      {label && <p className="text-xs text-gray-400 mt-6 font-medium">{label}</p>}
    </div>
  );
};

/* ── Section Card ───────────────────────────────────── */
const Section = ({ icon: Icon, title, subtitle, color = '#6366f1', children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden border"
      style={{ borderColor: color + '30', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(16px)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: color + '20' }}>
            <Icon size={20} style={{ color }} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </button>
      {open && <div className="px-5 pb-5 border-t" style={{ borderColor: color + '20' }}>{children}</div>}
    </div>
  );
};

/* ── Loading Steps ──────────────────────────────────── */
const LoadingSteps = ({ currentStep }) => {
  const steps = [
    { icon: Github,    label: 'Scanning all repositories...' },
    { icon: Code2,     label: 'Reading actual code files...' },
    { icon: Shield,    label: 'Detecting security anti-patterns...' },
    { icon: Sparkles,  label: 'Running AI deep code review...' },
    { icon: Briefcase, label: 'Mapping skills to job market...' },
    { icon: Map,       label: 'Generating 90-day roadmap...' },
  ];
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap size={28} className="text-indigo-400" />
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-1">Running 360° Career Audit</h3>
        <p className="text-sm text-gray-500">This takes 30-60 seconds — reading your actual code</p>
      </div>
      <div className="space-y-3 w-full max-w-sm">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all"
            style={{
              background: i <= currentStep ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${i <= currentStep ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}`,
              opacity: i > currentStep + 1 ? 0.4 : 1
            }}>
            <s.icon size={16} className={i <= currentStep ? 'text-indigo-400' : 'text-gray-600'} />
            <span className={`text-sm ${i <= currentStep ? 'text-gray-200' : 'text-gray-600'}`}>{s.label}</span>
            {i < currentStep && <CheckCircle size={14} className="text-green-400 ml-auto" />}
            {i === currentStep && <div className="ml-auto w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function ModuleCareerAudit() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [username, setUsername]     = useState('');
  const [file, setFile]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [loadStep, setLoadStep]     = useState(0);
  const [report, setReport]         = useState(null);
  const [error, setError]           = useState('');

  /* simulate step progression during load */
  const startLoadSim = () => {
    setLoadStep(0);
    const steps = [800, 1800, 3200, 5000, 8000, 11000];
    steps.forEach((delay, i) => setTimeout(() => setLoadStep(i), delay));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) { setError('GitHub username is required'); return; }
    setError('');
    setLoading(true);
    setReport(null);
    startLoadSim();

    const form = new FormData();
    form.append('github_username', username.trim());
    if (file) form.append('resume', file);

    try {
      const res = await fetch(`${FLASK_BASE}/api/career/full-audit`, { method: 'POST', body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Audit failed. Check that the Flask backend is running.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-dark-900 text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="border-b border-white/[0.06] sticky top-0 z-50"
        style={{ background: 'rgba(5,8,22,0.9)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-sm font-bold text-white">360° Career Intelligence</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Input Form ── */}
        {!report && !loading && (
          <div className="max-w-2xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                <Zap size={12} /> AI-Powered • Gemini • Free
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 50%, #c084fc 100%)' }}>
                  360° Career Audit
                </span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                We read your <strong className="text-white">actual code</strong> — not your resume claims.<br />
                Get a brutally honest assessment of where you really stand.
              </p>
            </div>

            {/* Features preview */}
            <div className="grid grid-cols-2 gap-3 mb-10">
              {[
                { icon: Code2, label: 'Deep Code Analysis', desc: 'Every repo, every file', color: '#6366f1' },
                { icon: Shield, label: 'Security Scan', desc: 'Anti-patterns & vulnerabilities', color: '#ef4444' },
                { icon: Briefcase, label: 'Market Intelligence', desc: 'Real companies & salaries', color: '#10b981' },
                { icon: FileText, label: 'Resume Rewrite', desc: 'From actual code evidence', color: '#f59e0b' },
              ].map((f, i) => (
                <div key={i} className="rounded-xl p-4 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <f.icon size={18} style={{ color: f.color }} className="mb-2" />
                  <p className="text-sm font-semibold text-white">{f.label}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}
              className="rounded-2xl p-8 border border-white/[0.08] space-y-5"
              style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(16px)' }}>
              {/* GitHub username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Github size={14} className="inline mr-2" />GitHub Username <span className="text-red-400">*</span>
                </label>
                <input
                  id="github-username-input"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. torvalds"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Resume upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FileText size={14} className="inline mr-2" />Resume PDF <span className="text-gray-500">(optional — enables resume rewriting)</span>
                </label>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                  onChange={e => setFile(e.target.files[0])} />
                <button type="button" onClick={() => fileRef.current.click()}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3"
                  style={{
                    background: file ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px dashed ${file ? '#10b981' : 'rgba(255,255,255,0.15)'}`,
                    color: file ? '#10b981' : '#9ca3af'
                  }}>
                  <Upload size={16} />
                  {file ? `✓ ${file.name}` : 'Click to upload resume (PDF)'}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button id="start-audit-btn" type="submit"
                className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.4)'
                }}
                onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>
                <Zap size={16} className="inline mr-2" />
                Run Full 360° Career Audit
              </button>

              <p className="text-center text-xs text-gray-600">
                Takes 30-60 seconds • Reads your actual code • Free with Gemini AI
              </p>
            </form>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && <LoadingSteps currentStep={loadStep} />}

        {/* ── Report ── */}
        {report && !loading && <AuditReport report={report} onReset={() => { setReport(null); setUsername(''); setFile(null); }} />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   AUDIT REPORT COMPONENT
══════════════════════════════════════════════════════ */
function AuditReport({ report, onReset }) {
  const { summary = {}, codeAudit = {}, marketIntelligence = {}, resumeRewrite, roadmap = {} } = report;
  const level = summary.developerLevel || 'Unknown';
  const score = summary.overallScore || 0;
  const percentile = summary.percentileRank || 50;

  const levelColor = {
    'Beginner': '#ef4444', 'Junior': '#f59e0b',
    'Mid-Level': '#10b981', 'Senior': '#6366f1', 'Staff': '#c084fc'
  }[level] || '#6366f1';

  const qualityScores = codeAudit.codeQualityScores || {};
  const radarData = Object.entries(qualityScores).map(([key, val]) => ({
    skill: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
    value: val
  }));

  const barData = Object.entries(qualityScores).map(([k, v]) => ({
    name: k.replace(/([A-Z])/g, ' $1').trim().substring(0, 12),
    score: v,
    fill: v >= 70 ? '#10b981' : v >= 45 ? '#f59e0b' : '#ef4444'
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">
            Career Audit: <span style={{ color: levelColor }}>{report.username}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">{summary.yearsExperienceEstimate} estimated experience</p>
        </div>
        <button onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <RefreshCw size={14} /> New Audit
        </button>
      </div>

      {/* ── Hero Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Score */}
        <div className="md:col-span-1 rounded-2xl p-6 flex flex-col items-center justify-center border border-white/[0.08]"
          style={{ background: 'rgba(15,23,42,0.9)' }}>
          <ScoreRing score={score} size={110} label="Overall Score" />
        </div>

        {/* Level + Percentile */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl p-5 border flex flex-col justify-center"
            style={{ background: levelColor + '15', borderColor: levelColor + '40' }}>
            <Award size={20} style={{ color: levelColor }} className="mb-3" />
            <p className="text-xs text-gray-400 mb-1">Developer Level</p>
            <p className="text-2xl font-black" style={{ color: levelColor }}>{level}</p>
          </div>
          <div className="rounded-2xl p-5 border flex flex-col justify-center"
            style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }}>
            <TrendingUp size={20} className="text-emerald-400 mb-3" />
            <p className="text-xs text-gray-400 mb-1">Percentile Rank</p>
            <p className="text-2xl font-black text-emerald-400">Top {100 - percentile}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {marketIntelligence?.percentileRank?.description || `Among ${summary.techStackDetected?.join(', ')} developers`}
            </p>
          </div>
          <div className="rounded-2xl p-5 border flex flex-col justify-center"
            style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)' }}>
            <Target size={20} className="text-indigo-400 mb-3" />
            <p className="text-xs text-gray-400 mb-1">Tech Stack</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {(summary.techStackDetected || []).slice(0, 5).map((t, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Verdict Banner ── */}
      {summary.careerLevelVerdict && (
        <div className="rounded-2xl p-5 border"
          style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.25)' }}>
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-indigo-300 mb-1">AI Verdict</p>
              <p className="text-sm text-gray-300 leading-relaxed">{summary.careerLevelVerdict}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── What Blocks Next Level ── */}
      {summary.whatBlocksNextLevel && (
        <div className="rounded-2xl p-5 border"
          style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.25)' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400 mb-1">What Blocks Your Next Level</p>
              <p className="text-sm text-gray-300 leading-relaxed">{summary.whatBlocksNextLevel}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Code Quality Radar & Bar ── */}
      <Section icon={BarChart2} title="Deep Code Quality Analysis" subtitle="8 dimensions measured from actual code" color="#6366f1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <p className="text-xs text-gray-500 mb-3 text-center">Skill Radar</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} outerRadius={90}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#334155', fontSize: 8 }} tickCount={4} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, fontSize: 12 }}
                  formatter={v => [`${v}%`, '']} />
                <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2}
                  dot={{ r: 3, fill: '#6366f1' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-3 text-center">Score Breakdown</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  formatter={v => [`${v}/100`, '']} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Section>

      {/* ── Specific Code Issues ── */}
      {codeAudit.specificIssues?.length > 0 && (
        <Section icon={AlertTriangle} title="Specific Code Issues" subtitle="Traceable to exact files — what a senior engineer would flag in code review" color="#ef4444">
          <div className="mt-4 space-y-3">
            {codeAudit.specificIssues.map((issue, i) => (
              <div key={i} className="rounded-xl p-4 border border-white/[0.05]"
                style={{ background: 'rgba(239,68,68,0.05)' }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge s={issue.severity || 'MEDIUM'} />
                    <code className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                      {issue.repo}/{issue.file}{issue.line ? `:${issue.line}` : ''}
                    </code>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white mb-1">{issue.issue}</p>
                {issue.detail && <p className="text-xs text-gray-400 mb-2 leading-relaxed">{issue.detail}</p>}
                {issue.fix && (
                  <div className="flex items-start gap-2 mt-2">
                    <CheckCircle size={12} className="text-green-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-green-300">{issue.fix}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Repo Health ── */}
      {codeAudit.repoHealthSummary?.length > 0 && (
        <Section icon={Github} title="Repository Health Report" subtitle="Which projects help vs hurt your profile" color="#10b981">
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {codeAudit.repoHealthSummary.map((repo, i) => {
              const verdictStyle = {
                lead:    { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', badge: 'bg-green-500/20 text-green-400', icon: '🏆' },
                neutral: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', badge: 'bg-indigo-500/20 text-indigo-400', icon: '📁' },
                hide:    { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', badge: 'bg-red-500/20 text-red-400', icon: '⚠️' },
              }[repo.verdict] || {};
              return (
                <div key={i} className="rounded-xl p-4 border"
                  style={{ background: verdictStyle.bg, borderColor: verdictStyle.border }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{verdictStyle.icon} {repo.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${verdictStyle.badge}`}>
                      {repo.verdict?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10">
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${repo.score}%`, background: verdictStyle.border }} />
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{repo.score}/100</span>
                  </div>
                  <p className="text-xs text-gray-400">{repo.reason}</p>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Market Intelligence ── */}
      {marketIntelligence && !marketIntelligence.error && (
        <Section icon={Briefcase} title="Market Intelligence" subtitle="Where you realistically stand in today's job market" color="#f59e0b">
          <div className="mt-4 space-y-5">
            {/* Salary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl p-4 border border-yellow-500/20"
                style={{ background: 'rgba(245,158,11,0.08)' }}>
                <p className="text-xs text-gray-500 mb-1">Current Salary Bracket</p>
                <p className="text-lg font-bold text-yellow-400">{marketIntelligence.currentSalaryBracket?.range}</p>
                <p className="text-xs text-gray-500 mt-1">{marketIntelligence.currentSalaryBracket?.inrRange}</p>
              </div>
              <div className="rounded-xl p-4 border border-emerald-500/20"
                style={{ background: 'rgba(16,185,129,0.08)' }}>
                <p className="text-xs text-gray-500 mb-1">Next Level Salary</p>
                <p className="text-lg font-bold text-emerald-400">{marketIntelligence.nextLevelSalaryBracket?.range}</p>
                <p className="text-xs text-gray-500 mt-1">{marketIntelligence.nextLevelSalaryBracket?.inrRange}</p>
                <div className="mt-2 space-y-1">
                  {(marketIntelligence.nextLevelSalaryBracket?.skillsNeeded || []).map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-400" />
                      <span className="text-xs text-emerald-300">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Roles */}
            {marketIntelligence.rolesYouQualifyFor?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Roles You Qualify For Now</p>
                <div className="space-y-2">
                  {marketIntelligence.rolesYouQualifyFor.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05]"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                        {r.matchScore}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{r.title}</p>
                        <p className="text-xs text-gray-500">{r.reasoning}</p>
                      </div>
                      <span className="text-xs text-gray-500">{r.avgSalary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills for salary jump */}
            {marketIntelligence.keySkillsForSalaryJump?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Skills for Maximum Salary Jump</p>
                <div className="space-y-2">
                  {marketIntelligence.keySkillsForSalaryJump.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05]"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <TrendingUp size={14} className="text-yellow-400 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{s.skill}</p>
                        <p className="text-xs text-gray-500">{s.timeToLearn} • {s.resource}</p>
                      </div>
                      <span className="text-xs font-bold text-yellow-400">{s.salaryImpact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── Resume Rewrite ── */}
      {resumeRewrite && !resumeRewrite.error && (
        <Section icon={FileText} title="AI Resume Rewrite" subtitle="Resume bullets rewritten from what was actually found in your code" color="#c084fc">
          <div className="mt-4 space-y-5">
            {/* Summary rewrite */}
            {resumeRewrite.summaryRewrite && (
              <div className="rounded-xl p-4 border border-purple-500/20"
                style={{ background: 'rgba(192,132,252,0.08)' }}>
                <p className="text-xs font-semibold text-purple-400 mb-2">✨ Rewritten Professional Summary</p>
                <p className="text-sm text-gray-200 leading-relaxed">{resumeRewrite.summaryRewrite}</p>
                <p className="text-xs text-gray-500 mt-2">Suggested Title: <span className="text-purple-300 font-semibold">{resumeRewrite.titleSuggestion}</span></p>
              </div>
            )}

            {/* Generated bullets */}
            {resumeRewrite.generatedBullets?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">AI-Generated Bullets (from your code)</p>
                <div className="space-y-2">
                  {resumeRewrite.generatedBullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(192,132,252,0.05)', border: '1px solid rgba(192,132,252,0.15)' }}>
                      <Star size={11} className="text-purple-400 shrink-0 mt-1" />
                      <p className="text-sm text-gray-200">{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewritten bullets */}
            {resumeRewrite.rewrittenBullets?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Rewritten from Your Resume</p>
                <div className="space-y-3">
                  {resumeRewrite.rewrittenBullets.map((b, i) => (
                    <div key={i} className="rounded-xl p-4 border border-white/[0.06]"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle size={12} className="text-red-400" />
                        <p className="text-xs text-red-300 line-through">{b.original}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle size={12} className="text-green-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-green-200">{b.rewritten}</p>
                      </div>
                      {b.evidenceFrom && (
                        <p className="text-xs text-gray-600 mt-1 ml-5">Evidence: {b.evidenceFrom}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {resumeRewrite.keyWarnings?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">⚠️ Resume Warnings</p>
                {resumeRewrite.keyWarnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-orange-300 py-1">
                    <AlertCircle size={11} className="shrink-0 mt-0.5" /> {w}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── 90-Day Roadmap ── */}
      {roadmap && !roadmap.error && (
        <Section icon={Map} title="90-Day Career Roadmap" subtitle="Personalized weekly plan — ordered by career ROI" color="#22d3ee" defaultOpen={false}>
          <div className="mt-4 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { data: roadmap.month1, month: 'Month 1', color: '#6366f1' },
                { data: roadmap.month2, month: 'Month 2', color: '#10b981' },
                { data: roadmap.month3, month: 'Month 3', color: '#f59e0b' },
              ].map(({ data, month, color }) => data && (
                <div key={month} className="rounded-xl p-4 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: color + '20' }}>
                    <Clock size={14} style={{ color }} />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{month}: {data.theme}</p>
                  <p className="text-xs text-gray-500 mb-3">{data.goal}</p>
                  {(data.weeks || []).slice(0, 2).map((w, i) => (
                    <div key={i} className="mb-2">
                      <p className="text-xs font-semibold text-gray-400">Week {w.week}: {w.focus}</p>
                      <p className="text-xs text-gray-600 mt-0.5">🏗 {w.project}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {roadmap.dailyHabit && (
              <div className="rounded-xl p-4 border border-cyan-500/20"
                style={{ background: 'rgba(34,211,238,0.08)' }}>
                <p className="text-xs font-semibold text-cyan-400 mb-1">⚡ Daily 15-Min Habit</p>
                <p className="text-sm text-gray-300">{roadmap.dailyHabit}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── Strengths ── */}
      {codeAudit.strengths?.length > 0 && (
        <Section icon={Star} title="Genuine Strengths Found" subtitle="What your code actually shows you're good at" color="#10b981" defaultOpen={false}>
          <div className="mt-4 space-y-2">
            {codeAudit.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <CheckCircle size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-200">{s}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Download ── */}
      <div className="flex justify-center pt-4 pb-10">
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `career-audit-${report.username}.json`;
            document.body.appendChild(a); a.click();
            document.body.removeChild(a); URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
          <ExternalLink size={14} /> Download Full Report (JSON)
        </button>
      </div>
    </div>
  );
}

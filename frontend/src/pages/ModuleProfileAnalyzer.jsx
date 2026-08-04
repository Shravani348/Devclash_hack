import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Github, Search, ArrowLeft, RefreshCw, ExternalLink, Star, GitFork,
  Shield, Zap, Code2, Users, Activity, Award, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Clock, Database,
  BookOpen, Cpu, Lock, Terminal, Globe, BarChart2, Sparkles,
  AlertCircle, Target, Brain, Flame, Calendar
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Cell, PieChart, Pie, Legend
} from 'recharts';

const FLASK = 'http://localhost:8000';

// ─── Color helpers ───────────────────────────────────────────────────────────
const scoreColor = (s) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
const levelColor  = {
  'Absolute Beginner': '#6b7280',
  'Beginner':          '#ef4444',
  'Junior':            '#f97316',
  'Mid-Level':         '#f59e0b',
  'Senior':            '#10b981',
  'Staff':             '#6366f1',
};
const severityColor = {
  CRITICAL: { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444', border: 'rgba(239,68,68,0.4)' },
  HIGH:     { bg: 'rgba(249,115,22,0.15)', text: '#f97316', border: 'rgba(249,115,22,0.4)' },
  MEDIUM:   { bg: 'rgba(234,179,8,0.15)',  text: '#eab308', border: 'rgba(234,179,8,0.4)' },
  LOW:      { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', border: 'rgba(99,102,241,0.4)' },
};

// ─── Animated Score Ring ─────────────────────────────────────────────────────
const ScoreRing = ({ score = 0, size = 140, strokeWidth = 10, label, sublabel }) => {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  const r    = (size / 2) - strokeWidth - 4;
  const circ = 2 * Math.PI * r;
  const dash = (animated / 100) * circ;
  const col  = scoreColor(score);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={`grad-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={col} stopOpacity="0.4" />
            <stop offset="100%" stopColor={col} stopOpacity="1" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={`url(#grad-${score})`} strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 900, color: col, lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: size * 0.08, color: '#64748b', letterSpacing: '0.05em' }}>
          / 100
        </span>
      </div>
      {label && (
        <p style={{ textAlign: 'center', marginTop: 8, color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>
          {label}
        </p>
      )}
      {sublabel && (
        <p style={{ textAlign: 'center', color: '#475569', fontSize: 11 }}>{sublabel}</p>
      )}
    </div>
  );
};

// ─── Collapsible Section ─────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, subtitle, accent = '#6366f1', children, defaultOpen = true, badge }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: 'rgba(15,23,42,0.85)',
      backdropFilter: 'blur(20px)',
      borderRadius: 16,
      border: `1px solid ${accent}30`,
      overflow: 'hidden',
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '16px 20px',
        background: 'none', border: 'none', cursor: 'pointer',
        textAlign: 'left',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: accent + '20',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} color={accent} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, margin: 0 }}>{title}</h3>
              {badge && (
                <span style={{
                  background: accent + '20', color: accent,
                  fontSize: 10, fontWeight: 700, padding: '2px 8px',
                  borderRadius: 999, border: `1px solid ${accent}40`,
                }}>{badge}</span>
              )}
            </div>
            {subtitle && <p style={{ color: '#64748b', fontSize: 12, margin: 0, marginTop: 2 }}>{subtitle}</p>}
          </div>
        </div>
        {open ? <ChevronUp size={16} color="#475569" /> : <ChevronDown size={16} color="#475569" />}
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${accent}20` }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Metric Bar ──────────────────────────────────────────────────────────────
const MetricBar = ({ label, value, icon: Icon, accent }) => {
  const col = scoreColor(value);
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon && <Icon size={13} color="#64748b" />}
          <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>{label}</span>
        </div>
        <span style={{ color: col, fontWeight: 700, fontSize: 13 }}>{value}/100</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${value}%`,
          background: `linear-gradient(90deg, ${col}80, ${col})`,
          transition: 'width 1s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
    </div>
  );
};

// ─── Verdict Badge ───────────────────────────────────────────────────────────
const VerdictBadge = ({ verdict }) => {
  const map = {
    lead:    { label: '🌟 Showcase', bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'rgba(16,185,129,0.4)' },
    neutral: { label: '➖ Optional', bg: 'rgba(234,179,8,0.15)',  color: '#eab308', border: 'rgba(234,179,8,0.4)' },
    hide:    { label: '⚠️ Improve',  bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', border: 'rgba(239,68,68,0.4)' },
  };
  const m = map[verdict] || map.neutral;
  return (
    <span style={{
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
    }}>{m.label}</span>
  );
};

// ─── Severity Badge ──────────────────────────────────────────────────────────
const SeverityBadge = ({ severity }) => {
  const c = severityColor[severity] || severityColor.LOW;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
    }}>{severity}</span>
  );
};

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
const Skeleton = ({ w = '100%', h = 16, r = 8 }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: 'rgba(255,255,255,0.06)',
    animation: 'pulse 1.5s ease-in-out infinite',
  }} />
);

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ModuleProfileAnalyzer() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading]   = useState(false);
  const [data, setData]         = useState(null);
  const [error, setError]       = useState('');
  const [stage, setStage]       = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const loadingStages = [
    'Fetching GitHub profile...',
    'Scanning repositories...',
    'Collecting code files...',
    'Running pattern analysis...',
    'Asking Gemini AI...',
    'Building report...',
  ];

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    setStage(loadingStages[0]);
    const iv = setInterval(() => {
      i = (i + 1) % loadingStages.length;
      setStage(loadingStages[i]);
    }, 3500);
    return () => clearInterval(iv);
  }, [loading]);

  const handleAnalyze = async (force = false) => {
    const user = username.trim().replace(/^@/, '');
    if (!user) { setError('Please enter a GitHub username.'); return; }
    setError('');
    setLoading(true);
    setData(null);
    try {
      const resp = await fetch(`${FLASK}/api/github/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, force: force }),
      });
      const json = await resp.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError(e.message || 'Analysis failed. Check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // ── Input screen ────────────────────────────────────────────────────────
  if (!data && !loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020817', display: 'flex', flexDirection: 'column' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
          @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
          @keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          .analyze-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(99,102,241,0.5) !important; }
          .analyze-btn:active { transform: translateY(0); }
          .example-btn:hover { background: rgba(99,102,241,0.15) !important; border-color: rgba(99,102,241,0.5) !important; }
        `}</style>

        {/* Back button */}
        <button onClick={() => navigate('/home')} style={{
          position: 'fixed', top: 20, left: 20,
          background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: '8px 14px', color: '#94a3b8',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
          backdropFilter: 'blur(10px)', zIndex: 50,
        }}>
          <ArrowLeft size={14} /> Back
        </button>

        {/* Hero */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', animation: 'fadeIn 0.6s ease' }}>
          {/* Icon */}
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(99,102,241,0.4)',
            marginBottom: 24, animation: 'float 4s ease-in-out infinite',
          }}>
            <Github size={36} color="white" />
          </div>

          <h1 style={{ color: '#f1f5f9', fontSize: 36, fontWeight: 900, textAlign: 'center', margin: 0, lineHeight: 1.2 }}>
            GitHub Profile Analyzer
          </h1>
          <p style={{ color: '#64748b', fontSize: 16, textAlign: 'center', marginTop: 12, maxWidth: 480 }}>
            Deep AI-powered analysis of your code, repos, and skills.<br />
            Get a brutally honest developer assessment.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 }}>
            {['8-Dimension Scoring', 'Gemini AI Analysis', 'Anti-Pattern Detection', 'Career Level Badge', 'Tech Stack Map', 'Skill Gaps'].map(f => (
              <span key={f} style={{
                background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.2)',
                fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 999,
              }}>{f}</span>
            ))}
          </div>

          {/* Input */}
          <div style={{ marginTop: 40, width: '100%', maxWidth: 480 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 14, overflow: 'hidden',
              boxShadow: '0 4px 30px rgba(99,102,241,0.15)',
            }}>
              <div style={{ padding: '14px 16px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <Github size={20} color="#6366f1" />
              </div>
              <input
                ref={inputRef}
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                placeholder="Enter GitHub username..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: '#f1f5f9', fontSize: 15, padding: '14px 16px',
                }}
              />
              <button
                onClick={() => handleAnalyze()}
                className="analyze-btn"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', color: 'white', fontWeight: 700,
                  padding: '14px 24px', cursor: 'pointer', fontSize: 14,
                  transition: 'all 0.2s',
                }}
              >
                Analyze
              </button>
            </div>
            {error && (
              <div style={{ marginTop: 12, color: '#ef4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </div>

          {/* Example usernames */}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ color: '#475569', fontSize: 12 }}>Try:</span>
            {['torvalds', 'gaearon', 'sindresorhus', 'antirez'].map(u => (
              <button key={u} className="example-btn" onClick={() => { setUsername(u); handleAnalyze(); }}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6, padding: '4px 10px', color: '#64748b',
                  cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  transition: 'all 0.2s',
                }}>
                @{u}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Loading screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#020817',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 24,
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 64, height: 64, border: '3px solid rgba(99,102,241,0.2)',
          borderTopColor: '#6366f1', borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, margin: 0 }}>
            Analyzing @{username}
          </p>
          <p style={{ color: '#6366f1', fontSize: 13, marginTop: 8 }}>{stage}</p>
          <p style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>
            This takes 15–30 seconds for deep analysis
          </p>
        </div>
      </div>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────
  if (!data) return null;

  const profile     = data.userProfile || {};
  const ai          = data.aiSummary   || {};
  const cq          = data.codeQuality || {};
  const tech        = data.techStack   || {};
  const community   = data.communityDetails || {};
  const activity    = data.activityDetails  || {};
  const breakdown   = data.scoreBreakdown   || {};
  const repoScores  = data.repoScores       || [];
  const antiPatterns = data.antiPatterns    || [];
  const skillDist   = data.skillDistribution || {};
  const level       = data.developerLevel   || 'Unknown';
  const levelCol    = levelColor[level] || '#6366f1';

  // Radar data
  const radarData = Object.entries(skillDist).map(([k, v]) => ({
    subject: k, score: v, fullMark: 100,
  }));

  // Language pie data
  const langData = Object.entries(tech.languages || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count], i) => ({
      name, value: count,
      fill: ['#6366f1','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#f97316'][i],
    }));

  // Score breakdown bars
  const breakdownData = [
    { name: 'Profile',      score: breakdown.profile || 0,      max: 8,  color: '#8b5cf6' },
    { name: 'Activity',     score: breakdown.activity || 0,     max: 22, color: '#6366f1' },
    { name: 'Repo Quality', score: breakdown.repoQuality || 0,  max: 25, color: '#10b981' },
    { name: 'Tech Diversity',score: breakdown.techDiversity || 0, max: 15, color: '#f59e0b' },
    { name: 'Community',    score: breakdown.community || 0,    max: 10, color: '#06b6d4' },
    { name: 'Code Quality', score: breakdown.codeQuality || 0,  max: 20, color: '#ef4444' },
  ];

  const card = (style = {}) => ({
    background: 'rgba(15,23,42,0.85)',
    backdropFilter: 'blur(20px)',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.06)',
    padding: 20,
    ...style,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#020817', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 999px; }
        .repo-card:hover { border-color: rgba(99,102,241,0.4) !important; transform: translateY(-2px); }
      `}</style>

      {/* Top nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(2,8,23,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => { setData(null); setUsername(''); }} style={{
            background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
          }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>
            GitHub Analysis — <strong style={{ color: '#f1f5f9' }}>@{data.username}</strong>
          </span>
          {data._cached && (
            <span style={{
              background: 'rgba(234,179,8,0.1)', color: '#eab308',
              border: '1px solid rgba(234,179,8,0.3)',
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
            }}>CACHED · {data._cacheAge}</span>
          )}
        </div>
        <button onClick={() => handleAnalyze(true)} style={{
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
          color: '#818cf8', borderRadius: 8, padding: '6px 14px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
        }}>
          <RefreshCw size={12} /> Re-analyze
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px', animation: 'fadeIn 0.5s ease' }}>

        {/* ── Hero: Profile + Score ──────────────────────────────────────────── */}
        <div style={{
          ...card(),
          display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center',
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(15,23,42,0.9) 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <img src={profile.avatar_url || `https://github.com/${data.username}.png`}
              alt="avatar"
              style={{ width: 90, height: 90, borderRadius: 50, border: `3px solid ${levelCol}` }}
            />
            <div style={{
              position: 'absolute', bottom: -4, right: -4,
              background: levelCol, borderRadius: 999,
              padding: '2px 8px', fontSize: 10, fontWeight: 800, color: 'white',
              border: '2px solid #020817',
            }}>{level}</div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 22, margin: 0 }}>
                {profile.name || data.username}
              </h1>
              <a href={profile.html_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} color="#64748b" />
              </a>
            </div>
            <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0' }}>@{profile.login}</p>
            {profile.bio && <p style={{ color: '#94a3b8', fontSize: 13, margin: '6px 0', maxWidth: 400 }}>{profile.bio}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 10 }}>
              {[
                { icon: Users, label: `${profile.followers} followers` },
                { icon: Github, label: `${profile.public_repos} repos` },
                { icon: Calendar, label: `${profile.account_age_years}y on GitHub` },
                { icon: Star, label: `${community.totalStars || 0} stars` },
              ].map(({ icon: I, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b', fontSize: 12 }}>
                  <I size={12} /> {label}
                </div>
              ))}
            </div>
          </div>

          {/* Score rings */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <ScoreRing score={data.githubScore || 0} label="GitHub Score" size={120} />
            <ScoreRing score={data.interviewReadiness || 0} label="Interview Ready" size={120} sublabel="%" />
          </div>
        </div>

        {/* ── AI Verdict ────────────────────────────────────────────────────── */}
        {ai.careerVerdict && (
          <div style={{
            ...card(),
            marginBottom: 24,
            border: '1px solid rgba(139,92,246,0.3)',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(15,23,42,0.9))',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(139,92,246,0.2)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brain size={18} color="#8b5cf6" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, margin: 0 }}>Gemini AI Verdict</h3>
                  <span style={{
                    background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
                    border: '1px solid rgba(139,92,246,0.3)',
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                  }}>{data.aiSource || 'AI'}</span>
                  <span style={{
                    background: levelCol + '20', color: levelCol,
                    border: `1px solid ${levelCol}40`,
                    fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                  }}>{level} • Top {100 - (ai.percentileRank || 50)}%</span>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  {ai.careerVerdict}
                </p>
                {ai.hiringSignal && (
                  <p style={{
                    color: '#64748b', fontSize: 12, marginTop: 8,
                    fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.05)',
                    paddingTop: 8, margin: '8px 0 0',
                  }}>
                    💼 {ai.hiringSignal}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Two-column grid ───────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>

          {/* Skill Radar */}
          <Section icon={BarChart2} title="Skill Radar" subtitle="8-dimension developer profile" accent="#6366f1">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8 }}
                  labelStyle={{ color: '#f1f5f9' }} itemStyle={{ color: '#818cf8' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Section>

          {/* Score Breakdown */}
          <Section icon={Target} title="Score Breakdown" subtitle="How your GitHub score is calculated" accent="#10b981">
            <div style={{ marginTop: 16 }}>
              {breakdownData.map(({ name, score, max, color }) => (
                <div key={name} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>{name}</span>
                    <span style={{ color, fontWeight: 700, fontSize: 12 }}>{score}/{max} pts</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99 }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      width: `${(score / max) * 100}%`,
                      background: color,
                      transition: 'width 1s ease',
                    }} />
                  </div>
                </div>
              ))}
              <div style={{
                marginTop: 16, padding: 12,
                background: 'rgba(16,185,129,0.08)', borderRadius: 10,
                border: '1px solid rgba(16,185,129,0.2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: 13 }}>Total GitHub Score</span>
                <span style={{ color: scoreColor(data.githubScore), fontWeight: 900, fontSize: 20 }}>
                  {data.githubScore}/100
                </span>
              </div>
            </div>
          </Section>
        </div>

        {/* ── Code Quality ──────────────────────────────────────────────────── */}
        <Section icon={Code2} title="Code Quality Analysis" subtitle="Pattern scan across your repositories" accent="#f59e0b" defaultOpen={true}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8, marginTop: 16 }}>
            <MetricBar label="Modularity"      value={cq.modularity || 0}      icon={Cpu} />
            <MetricBar label="Error Handling"  value={cq.error_handling || 0}  icon={Shield} />
            <MetricBar label="Documentation"   value={cq.documentation || 0}   icon={BookOpen} />
            <MetricBar label="Naming Quality"  value={cq.naming || 0}          icon={Terminal} />
            <MetricBar label="Security"        value={cq.security || 0}        icon={Lock} />
            <MetricBar label="Testing"         value={cq.testing || 0}         icon={CheckCircle} />
            <MetricBar label="Architecture"    value={cq.architecture || 0}    icon={Database} />
          </div>
        </Section>

        {/* ── Tech Stack ────────────────────────────────────────────────────── */}
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <Section icon={Globe} title="Tech Stack Detected" subtitle={`${tech.langCount || 0} languages · ${tech.fwCount || 0} frameworks`} accent="#06b6d4">
            {langData.length > 0 && (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={langData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10} fill="#6366f1">
                    {langData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {Object.keys(tech.frameworks || {}).length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                  Frameworks Detected
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.entries(tech.frameworks).map(([fw, repo]) => (
                    <span key={fw} title={`Found in: ${repo}`} style={{
                      background: 'rgba(6,182,212,0.1)', color: '#22d3ee',
                      border: '1px solid rgba(6,182,212,0.2)',
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                      cursor: 'default',
                    }}>{fw}</span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Strengths & Weaknesses */}
          <Section icon={Award} title="Strengths & Weaknesses" subtitle="Based on AI analysis" accent="#10b981">
            {(ai.topStrengths || []).length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ color: '#10b981', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                  ✅ Strengths
                </p>
                {ai.topStrengths.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8,
                    padding: '8px 12px', background: 'rgba(16,185,129,0.06)', borderRadius: 8,
                  }}>
                    <CheckCircle size={13} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>{s}</span>
                  </div>
                ))}
              </div>
            )}
            {(ai.criticalWeaknesses || []).length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                  ❌ Critical Weaknesses
                </p>
                {ai.criticalWeaknesses.map((w, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8,
                    padding: '8px 12px', background: 'rgba(239,68,68,0.06)', borderRadius: 8,
                  }}>
                    <XCircle size={13} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>{w}</span>
                  </div>
                ))}
              </div>
            )}
            {ai.whatBlocksNextLevel && (
              <div style={{
                marginTop: 12, padding: '12px 14px',
                background: 'rgba(139,92,246,0.08)', borderRadius: 10,
                border: '1px solid rgba(139,92,246,0.2)',
              }}>
                <p style={{ color: '#a78bfa', fontWeight: 700, fontSize: 11, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  🚀 What Blocks Next Level
                </p>
                <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5, margin: 0 }}>
                  {ai.whatBlocksNextLevel}
                </p>
              </div>
            )}
          </Section>
        </div>

        {/* ── Repo Health Grid ───────────────────────────────────────────────── */}
        <div style={{ marginTop: 20 }}>
          <Section icon={Github} title="Repository Health" subtitle={`${repoScores.length} repos analyzed`} accent="#6366f1">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginTop: 16 }}>
              {repoScores.map((repo, i) => {
                const aiVerdict = (ai.repoVerdict || []).find(r => r.name === repo.name);
                return (
                  <div key={i} className="repo-card" style={{
                    background: 'rgba(15,23,42,0.5)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12, padding: 14,
                    transition: 'all 0.2s',
                    cursor: 'default',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <a href={repo.url} target="_blank" rel="noopener noreferrer"
                          style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                          {repo.name}
                        </a>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                          {repo.language && (
                            <span style={{ color: '#64748b', fontSize: 11 }}>{repo.language}</span>
                          )}
                          {repo.stars > 0 && (
                            <span style={{ color: '#64748b', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Star size={10} /> {repo.stars}
                            </span>
                          )}
                        </div>
                      </div>
                      <VerdictBadge verdict={aiVerdict?.verdict || repo.verdict} />
                    </div>

                    {/* Quality score bar */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ color: '#475569', fontSize: 11 }}>Quality</span>
                        <span style={{ color: scoreColor(repo.quality_score), fontSize: 11, fontWeight: 700 }}>
                          {repo.quality_score}/100
                        </span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99 }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          width: `${repo.quality_score}%`,
                          background: scoreColor(repo.quality_score),
                        }} />
                      </div>
                    </div>

                    {/* Signal chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {[
                        { ok: repo.has_readme,  label: 'README' },
                        { ok: repo.has_tests,   label: 'Tests' },
                        { ok: repo.has_ci,      label: 'CI/CD' },
                        { ok: repo.has_docker,  label: 'Docker' },
                        { ok: repo.has_license, label: 'License' },
                      ].map(({ ok, label }) => (
                        <span key={label} style={{
                          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
                          background: ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                          color:      ok ? '#10b981'             : '#ef444480',
                          border: `1px solid ${ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.1)'}`,
                        }}>
                          {ok ? '✓' : '✗'} {label}
                        </span>
                      ))}
                    </div>

                    {/* AI or rule reason */}
                    <p style={{ color: '#475569', fontSize: 11, marginTop: 8, lineHeight: 1.4 }}>
                      {aiVerdict?.reason || repo.verdict_reason}
                    </p>
                    {repo.days_since_push < 9999 && (
                      <p style={{ color: '#334155', fontSize: 10, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={9} /> Last push: {repo.days_since_push}d ago
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* ── Security Issues ───────────────────────────────────────────────── */}
        {antiPatterns.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <Section icon={AlertTriangle} title="Security & Quality Issues"
              subtitle={`${antiPatterns.length} issues detected in your code`}
              accent="#ef4444" badge={`${antiPatterns.filter(i => i.severity === 'CRITICAL').length} CRITICAL`}>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {antiPatterns.map((issue, i) => (
                  <div key={i} style={{
                    padding: '12px 14px',
                    background: 'rgba(15,23,42,0.6)',
                    border: `1px solid ${severityColor[issue.severity]?.border || 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10,
                    borderLeft: `3px solid ${severityColor[issue.severity]?.text || '#64748b'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <SeverityBadge severity={issue.severity} />
                          <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 13 }}>{issue.issue}</span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: 11, margin: '4px 0 0', fontFamily: 'monospace' }}>
                          {issue.repo}/{issue.file}{issue.line ? ` · L${issue.line}` : ''}
                        </p>
                        {issue.snippet && (
                          <code style={{
                            display: 'block', marginTop: 6,
                            background: 'rgba(0,0,0,0.3)', borderRadius: 6,
                            padding: '6px 10px', color: '#94a3b8',
                            fontSize: 11, fontFamily: 'monospace',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {issue.snippet}
                          </code>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* ── Skill Gaps ─────────────────────────────────────────────────────── */}
        {(ai.skillGaps || []).filter(Boolean).length > 0 && (
          <div style={{ marginTop: 20 }}>
            <Section icon={TrendingUp} title="Skill Gaps & Learning Plan"
              subtitle="What to learn next to reach the next career level" accent="#f59e0b">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginTop: 16 }}>
                {ai.skillGaps.filter(Boolean).map((gap, i) => {
                  const pColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
                  const pc = pColors[gap.priority] || '#64748b';
                  return (
                    <div key={i} style={{
                      padding: '14px 16px',
                      background: 'rgba(15,23,42,0.6)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 12, borderLeft: `3px solid ${pc}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>{gap.skill}</span>
                        <span style={{
                          background: pc + '20', color: pc, border: `1px solid ${pc}40`,
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                          textTransform: 'uppercase',
                        }}>{gap.priority}</span>
                      </div>
                      {gap.why && <p style={{ color: '#64748b', fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>{gap.why}</p>}
                      {gap.resource && (
                        <a href={gap.resource} target="_blank" rel="noopener noreferrer" style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          color: '#6366f1', fontSize: 11, fontWeight: 600, marginTop: 8,
                          textDecoration: 'none',
                        }}>
                          <BookOpen size={11} /> Learn →
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>
        )}

        {/* ── Activity Stats ─────────────────────────────────────────────────── */}
        <div style={{ marginTop: 20 }}>
          <Section icon={Activity} title="Activity Overview" subtitle="Repository activity and engagement" accent="#06b6d4">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginTop: 16 }}>
              {[
                { label: 'Total Repos',    value: activity.total_repos || 0,   color: '#6366f1', icon: Github },
                { label: 'Own Projects',   value: activity.own_repos || 0,     color: '#8b5cf6', icon: Code2 },
                { label: 'Active (90d)',   value: activity.active_90d || 0,    color: '#10b981', icon: Flame },
                { label: 'Active (1yr)',   value: activity.active_365d || 0,   color: '#f59e0b', icon: Calendar },
                { label: 'Total Stars',    value: activity.total_stars || 0,   color: '#eab308', icon: Star },
                { label: 'Total Forks',    value: activity.total_forks || 0,   color: '#06b6d4', icon: GitFork },
                { label: 'Followers',      value: community.followers || 0,    color: '#ec4899', icon: Users },
                { label: 'Account Age',    value: `${profile.account_age_years || 0}y`, color: '#94a3b8', icon: Clock },
              ].map(({ label, value, color, icon: I }) => (
                <div key={label} style={{
                  padding: '14px', background: 'rgba(15,23,42,0.5)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
                  textAlign: 'center',
                }}>
                  <I size={18} color={color} style={{ marginBottom: 8 }} />
                  <div style={{ color, fontWeight: 800, fontSize: 22, lineHeight: 1 }}>{value}</div>
                  <div style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 32, color: '#334155', fontSize: 12 }}>
          Analysis powered by Gemini AI · GitHub API · Pattern Analysis
          {data.analyzedAt && ` · ${new Date(data.analyzedAt).toLocaleString()}`}
        </div>
      </div>
    </div>
  );
}

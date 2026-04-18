import React, { useState } from 'react';
import {
  RefreshCw, CheckCircle, XCircle, Code2,
  Star, GitBranch, ChevronDown, ChevronUp, ExternalLink,
  MapPin, Users
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts';

/* ─── Expandable Stat Card ─────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, accentBg, list = [], listLabel }) => {
  const [open, setOpen] = useState(false);
  const canExpand = list.length > 0;

  return (
    <div
      className="rounded-2xl border border-dark-700 overflow-hidden select-none"
      style={{
        background: 'rgba(15,23,42,0.7)',
        backdropFilter: 'blur(12px)',
        borderColor: open ? color + '60' : undefined,
        transition: 'border-color 0.3s',
      }}
    >
      {/* Header row */}
      <div
        className={`flex items-center justify-between p-5 ${canExpand ? 'cursor-pointer' : ''}`}
        onClick={() => canExpand && setOpen(o => !o)}
        style={{ transition: 'background 0.2s' }}
        onMouseEnter={e => canExpand && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold leading-none" style={{ color }}>{value}</p>
          {canExpand && (
            <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
              {open ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
              {open ? 'Hide list' : `View all ${list.length}`}
            </p>
          )}
        </div>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: accentBg, transition: 'transform 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>

      {/* Animated expanded list */}
      <div
        style={{
          maxHeight: open ? '280px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div className="border-t border-dark-700 px-4 py-3 space-y-1 overflow-y-auto" style={{ maxHeight: '280px' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pt-1">{listLabel}</p>
          {list.map((repo, i) => (
            <a
              key={i}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl group"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span className="flex items-center gap-2 text-sm text-gray-300">
                <GitBranch size={12} className="text-indigo-400 shrink-0" />
                <span className="truncate max-w-[160px]">{repo.name}</span>
              </span>
              <div className="flex items-center gap-3 shrink-0">
                {repo.stars > 0 && (
                  <span className="text-xs text-yellow-400 flex items-center gap-1">
                    <Star size={10} />{repo.stars}
                  </span>
                )}
                <ExternalLink size={11} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Dashboard ───────────────────────────────────── */
const Dashboard = ({ data = {}, onReset }) => {
  const sd   = data.skillDistribution || {};
  const ga   = data.githubAnalysis    || {};
  const up   = data.userProfile       || {};

  /* ── Profile card ─────────────────────────────────────── */
  const ProfileCard = () => (
    <div className="glass-panel p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 relative overflow-hidden"
      style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
      {/* Gradient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(99,102,241,0.08) 0%, transparent 65%)' }} />

      {/* Avatar */}
      <a href={up.html_url} target="_blank" rel="noopener noreferrer" className="shrink-0 group">
        <div className="relative">
          <img
            src={up.avatar_url || `https://github.com/identicons/${up.login}.png`}
            alt={up.login}
            className="w-20 h-20 rounded-2xl border-2 transition-all duration-300 group-hover:scale-105"
            style={{ borderColor: 'rgba(99,102,241,0.5)' }}
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-dark-900" />
        </div>
      </a>

      {/* Info */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
          <h2 className="text-xl font-bold text-white truncate">{up.name || up.login}</h2>
          <a href={up.html_url} target="_blank" rel="noopener noreferrer"
            className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors flex items-center gap-1 justify-center sm:justify-start">
            @{up.login} <ExternalLink size={11} />
          </a>
        </div>

        {up.bio && (
          <p className="text-gray-400 text-sm leading-relaxed mb-3 line-clamp-2">{up.bio}</p>
        )}

        <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-gray-500">
          {up.location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-indigo-400" /> {up.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users size={11} className="text-indigo-400" />
            <strong className="text-gray-300">{up.followers}</strong> followers
          </span>
          <span className="flex items-center gap-1">
            <strong className="text-gray-300">{up.following}</strong> following
          </span>
        </div>
      </div>
    </div>
  );

  /* Radar */
  const radarData = [
    { skill: 'Backend', value: Math.min(100, (sd.backend || 0) * 6) },
    { skill: 'API',     value: Math.min(100, (sd.api     || 0) * 6) },
    { skill: 'Auth',    value: Math.min(100, (sd.auth    || 0) * 6) },
    { skill: 'Testing', value: Math.min(100, (sd.testing || 0) * 6) },
    { skill: 'Docs',    value: (data.gaps || []).some(g => g.toLowerCase().includes('readme')) ? 10 : 100 },
  ];

  /* Donut */
  const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981'];
  const donut  = [
    { name: 'Backend', value: Math.max(sd.backend || 0, 0.5) },
    { name: 'API',     value: Math.max(sd.api     || 0, 0.5) },
    { name: 'Auth',    value: Math.max(sd.auth    || 0, 0.5) },
    { name: 'Testing', value: Math.max(sd.testing || 0, 0.5) },
  ];
  const donutTotal = donut.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Profile Card ── */}
      {up.login && <ProfileCard />}

      {/* ── Row 1: Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Radar */}
        <div className="glass-panel p-6">
          <h3 className="text-base font-semibold text-gray-100 mb-0.5">⚡ Skill Distribution</h3>
          <p className="text-xs text-gray-500 mb-4">Detected from your top repositories</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart outerRadius={82} data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]}
                tick={{ fill: '#334155', fontSize: 9 }} tickCount={4} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, fontSize: 12 }}
                formatter={v => [`${v}%`, 'Proficiency']}
              />
              <Radar name="Skills" dataKey="value"
                stroke="#6366f1" fill="#6366f1" fillOpacity={0.22} strokeWidth={2.5}
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div className="glass-panel p-6">
          <h3 className="text-base font-semibold text-gray-100 mb-0.5">📊 Repository Analysis</h3>
          <p className="text-xs text-gray-500 mb-4">Signal breakdown across scanned repos</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={donut} cx="50%" cy="45%"
                innerRadius={60} outerRadius={88} paddingAngle={4} dataKey="value"
              >
                {donut.map((_, i) => <Cell key={i} fill={COLORS[i]} stroke="transparent" />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, fontSize: 12 }}
                formatter={(v, name) => [`${Math.round((v / donutTotal) * 100)}%`, name]}
              />
              <Legend iconType="circle" iconSize={9}
                wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 6 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 2: GitHub Insights ── */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-100">GitHub Insights</h3>
          <Code2 size={18} className="text-gray-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={GitBranch} label="Total Repositories" value={ga.repos || 0}
            color="#6366f1" accentBg="rgba(99,102,241,0.15)"
            list={ga.repoList || []} listLabel="All Repositories"
          />
          <StatCard
            icon={Star} label="Starred Repositories" value={ga.starredRepos || 0}
            color="#f59e0b" accentBg="rgba(245,158,11,0.15)"
            list={ga.starredRepoList || []} listLabel="Repos with Stars"
          />
          <StatCard
            icon={Star} label="Total Stars Received" value={ga.stars || 0}
            color="#10b981" accentBg="rgba(16,185,129,0.15)"
            list={[]} listLabel=""
          />
        </div>
      </div>

      {/* ── Row 3: Skill Gaps ── */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-semibold border-b border-dark-700 pb-3">🚫 Skill Gaps Detected</h3>
        {data.gaps && data.gaps.length > 0 ? (
          <ul className="space-y-2">
            {data.gaps.map((gap, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-xl text-sm text-gray-300"
                style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}>
                <XCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                {gap}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <CheckCircle size={15} className="text-green-400" /> No major skill gaps detected 🎉
          </p>
        )}
      </div>

      {/* ── Row 4: AI Career Insight ── */}
      <div className="glass-panel p-6 space-y-3 relative overflow-hidden"
        style={{ border: '1px solid rgba(99,102,241,0.25)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top left, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />
        <h3 className="text-lg font-semibold border-b border-dark-700 pb-3">💡 AI Career Insight</h3>
        <p className="text-gray-300 text-sm leading-7 relative z-10">
          {data.aiExplanation || 'No AI insight available.'}
        </p>
      </div>

      {/* ── Reset ── */}
      <div className="flex justify-center pt-2 pb-6">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-medium text-gray-300 transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(99,102,241,0.12)';
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = '';
          }}
        >
          <RefreshCw size={14} /> Analyze Another Profile
        </button>
      </div>

    </div>
  );
};

export default Dashboard;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Github, FileText, Globe, Brain, Zap, ArrowRight } from 'lucide-react';

const modules = [
  {
    icon: Zap,
    title: '360° Career Audit',
    description: 'Brutally honest audit of your actual code. Real skill level, market position, salary bracket, and 90-day roadmap.',
    path: '/career-audit',
    gradient: 'from-indigo-600 to-purple-600',
    glow: 'rgba(99,102,241,0.4)',
    badge: '⭐ NEW',
    badgeColor: '#a5b4fc',
    featured: true,
  },
  {
    icon: Github,
    title: 'GitHub Analyzer',
    description: 'Deep-scan your GitHub profile. Detect skill gaps, analyze your top repositories, and get an AI career evaluation.',
    path: '/github-analysis',
    gradient: 'from-blue-600 to-cyan-600',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    icon: FileText,
    title: 'Resume Auditor',
    description: 'AI reads your actual PDF. Get specific feedback on content, skills, format, and sections — not generic advice.',
    path: '/resume-audit',
    gradient: 'from-emerald-600 to-teal-600',
    glow: 'rgba(16,185,129,0.3)',
  },
  {
    icon: Globe,
    title: 'Live App Auditor',
    description: 'Submit a live URL. We check responsiveness, accessibility, security headers, load time, and code quality.',
    path: '/live-app-audit',
    gradient: 'from-rose-600 to-pink-600',
    glow: 'rgba(239,68,68,0.3)',
  },
  {
    icon: Brain,
    title: 'LeetCode Analyzer',
    description: 'Analyze your LeetCode profile. Get your skill score, problem-solving level, and ranking among peers.',
    path: '/leetcode-analysis',
    gradient: 'from-amber-600 to-orange-600',
    glow: 'rgba(245,158,11,0.3)',
  },
];

const DashboardHome = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('userName') || 'Developer';

  return (
    <div className="min-h-screen bg-[#0A0F1E] font-sans">
      <Navbar />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-20"
          style={{ background: 'radial-gradient(circle, #4f46e5, transparent)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[140px] opacity-15"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      </div>

      <main className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm text-indigo-400 font-semibold mb-2">Welcome back,</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            {name} <span className="text-gray-600">👋</span>
          </h1>
          <p className="text-gray-500 text-base">
            Select a module below to start your AI-powered developer assessment.
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod, i) => (
            <button
              key={i}
              onClick={() => navigate(mod.path)}
              className={`text-left rounded-2xl p-6 border transition-all duration-300 group relative overflow-hidden ${
                mod.featured ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
              style={{
                background: mod.featured ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${mod.featured ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 20px 40px ${mod.glow}`;
                e.currentTarget.style.borderColor = mod.glow.replace('0.', '0.5').replace(', 0.4)', ', 0.5)');
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = mod.featured ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)';
              }}
            >
              {/* Gradient blob */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br ${mod.gradient}`} />

              <div className="relative z-10">
                {/* Icon + Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${mod.gradient}`}
                    style={{ boxShadow: `0 4px 15px ${mod.glow}` }}>
                    <mod.icon size={22} className="text-white" />
                  </div>
                  {mod.badge && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ background: 'rgba(165,180,252,0.15)', color: mod.badgeColor, border: `1px solid ${mod.badgeColor}50` }}>
                      {mod.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mb-2">{mod.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{mod.description}</p>

                <div className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: mod.featured ? '#a5b4fc' : '#6b7280' }}>
                  Launch Module <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-gray-700 mt-12">
          Powered by Google Gemini AI (Free) • All analysis uses your actual code, not self-reported claims
        </p>
      </main>
    </div>
  );
};

export default DashboardHome;

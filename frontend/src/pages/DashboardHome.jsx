import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Code2, Brain, User, Globe, Sparkles, 
  ChevronRight, ArrowRight, Zap, Shield, 
  History, Trash2, Cpu, Rocket, Calendar,
  Loader2, Star, TrendingUp, Target
} from 'lucide-react';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState([]);
  const [strategy, setStrategy] = useState(null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [strategyError, setStrategyError] = useState(null);
  const userName = localStorage.getItem('userName') || 'Developer';

  useEffect(() => {
    const loadSummaries = () => {
      const stored = localStorage.getItem('dcis_summaries');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSummaries([...parsed].reverse());
      }
    };
    loadSummaries();
    window.addEventListener('storage', loadSummaries);
    return () => window.removeEventListener('storage', loadSummaries);
  }, []);

  const generateStrategy = async () => {
    if (summaries.length === 0) return;
    setLoadingStrategy(true);
    setStrategyError(null);
    try {
      const response = await fetch('http://localhost:8000/api/dashboard/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaries: summaries })
      });
      const data = await response.json();
      if (data.error) {
        setStrategyError(data.error);
      } else {
        setStrategy(data);
      }
    } catch (err) {
      console.error(err);
      setStrategyError("Network error: Failed to connect to Intelligence Core.");
    }
    setLoadingStrategy(false);
  };

  const clearHistory = () => {
    localStorage.removeItem('dcis_summaries');
    setSummaries([]);
    setStrategy(null);
  };

  const getModuleIcon = (type) => {
    switch (type) {
      case 'github': return <Code2 className="text-blue-500" size={20} />;
      case 'leetcode': return <Brain className="text-purple-500" size={20} />;
      case 'resume': return <User className="text-emerald-500" size={20} />;
      case 'app-frontend': return <Globe className="text-rose-500" size={20} />;
      case 'app-backend': return <Shield className="text-amber-500" size={20} />;
      default: return <Sparkles className="text-primary-500" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-dot-pattern transition-colors duration-500">
      <Navbar />
      
      {/* Dynamic Background Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="container mx-auto px-6 py-12 relative z-10">
        
        {/* HERO SECTION */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2 animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Intelligence Dashboard</span>
              <div className="h-1 w-12 bg-primary-500/30 rounded-full"></div>
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-tight">
              Master your <span className="text-gradient">Career Path,</span> <br />
              <span className="text-slate-400 dark:text-slate-500">{userName}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-6 duration-700">
            {summaries.length > 0 && !strategy && (
              <button 
                onClick={generateStrategy}
                disabled={loadingStrategy}
                className={`btn-primary flex items-center gap-3 group relative overflow-hidden ${loadingStrategy ? 'opacity-80' : ''}`}
              >
                {loadingStrategy ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="animate-pulse">Analyzing Systems...</span>
                  </>
                ) : (
                  <>
                    <Cpu size={18} className="group-hover:rotate-12 transition-transform" />
                    <span>Analyze Overall Strategy</span>
                  </>
                )}
                {loadingStrategy && <div className="absolute inset-0 bg-white/10 animate-shimmer"></div>}
              </button>
            )}
            <button 
              onClick={clearHistory}
              className="p-3.5 glass-card bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 hover:text-rose-500 transition-all hover:scale-105"
              title="Clear Intelligence Data"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {strategyError && (
          <div className="mb-8 glass-card p-6 bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
              <Shield className="text-rose-500" size={20} />
            </div>
            <div>
              <p className="uppercase tracking-widest text-[10px] mb-1 font-black opacity-60">System Alert</p>
              <p>{strategyError.includes('insufficient_quota') ? "OpenAI API Quota Exceeded. Please check your billing/limits." : strategyError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: STRATEGY & INSIGHTS */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* LLM STRATEGY DISPLAY */}
            {strategyError && (
              <div className="glass-card p-6 bg-rose-500/5 border-rose-500/20 text-rose-500 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <Shield size={18} />
                {strategyError}
              </div>
            )}

            {strategy ? (
              <div className="animate-in fade-in slide-in-from-top-6 duration-1000">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Sparkles className="text-amber-500" size={18} />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Master Strategy</h2>
                </div>
                
                <div className="glass-card p-10 bg-gradient-to-br from-primary-600/[0.03] to-indigo-600/[0.03] border-primary-500/20">
                  <div className="flex items-start gap-6 mb-10">
                    <div className="p-4 rounded-2xl bg-primary-500/10 text-primary-500 animate-float">
                      <Cpu size={32} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-primary-500 uppercase tracking-widest mb-2">Executive Summary</h3>
                      <p className="text-xl text-slate-700 dark:text-slate-200 leading-relaxed font-medium italic">
                        "{strategy.overall_summary}"
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-emerald-500">
                        <Rocket size={20} />
                        <h3 className="text-sm font-black uppercase tracking-widest">90-Day "Senior-Ready" Master Plan</h3>
                      </div>
                      <div className="flex gap-1">
                        {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-emerald-500/30"></div>)}
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-black/40 rounded-3xl p-8 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-sans shadow-inner max-h-[600px] overflow-y-auto custom-scrollbar">
                      {strategy.roadmap}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* PLACEHOLDER WHEN NO STRATEGY */
              summaries.length > 0 && (
                <div className="glass-card p-12 text-center bg-gradient-to-r from-primary-500/5 to-indigo-500/5 border-dashed border-primary-500/20">
                  <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-6 text-primary-500">
                    <Cpu size={32} className="animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 text-gradient">Data Points Collected</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 font-medium">Click the analyze button above to generate your customized AI career roadmap based on your recent audits.</p>
                </div>
              )
            )}

            {/* RECENT DATA POINTS GRID */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History className="text-primary-500" size={18} />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Intelligence Archive</h2>
                </div>
                {summaries.length > 0 && <span className="text-[10px] font-black text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{summaries.length} Records</span>}
              </div>

              {summaries.length === 0 ? (
                <div className="glass-card p-20 text-center border-dashed bg-slate-50 dark:bg-white/[0.02]">
                  <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-8">
                    <Target className="text-slate-300 dark:text-slate-600" size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-400 mb-2">Systems Dormant</h3>
                  <p className="text-slate-500 mb-10 font-medium">Please initiate any audit module to begin data ingestion.</p>
                  <button 
                    onClick={() => navigate('/github-analysis')}
                    className="btn-primary"
                  >
                    Start Ingestion
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {summaries.map((s, i) => (
                    <div 
                      key={i} 
                      className="glass-card p-8 group hover:-translate-y-2 transition-all cursor-default"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:scale-110 transition-transform duration-500">
                          {getModuleIcon(s.type)}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{s.timestamp}</p>
                          <div className="h-0.5 w-8 bg-slate-200 dark:bg-white/10 ml-auto"></div>
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">
                        {s.title}
                      </h4>
                      
                      <div className="flex items-center gap-3 mb-6">
                        <div className="px-3 py-1 rounded-lg bg-primary-500/10 text-[10px] font-black text-primary-500 uppercase tracking-widest border border-primary-500/10">
                          {s.mainStat}
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">
                        {s.insight}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: QUICK ACTIONS & STATS */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* MODULE LAUNCHER */}
            <div className="glass-card p-8 space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Rocket size={14} className="text-primary-500" /> System Modules
              </h3>
              
              <div className="space-y-4">
                {[
                  { name: 'GitHub Profiler', route: '/github-analysis', icon: <Code2 />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { name: 'LeetCode Stats', route: '/leetcode-analysis', icon: <Brain />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                  { name: 'Resume AI Audit', route: '/resume-audit', icon: <User />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { name: 'Live App Audit', route: '/live-app-audit', icon: <Globe />, color: 'text-rose-500', bg: 'bg-rose-500/10' }
                ].map((m, i) => (
                  <button 
                    key={i} 
                    onClick={() => navigate(m.route)} 
                    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-2xl hover:border-primary-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${m.bg} ${m.color} group-hover:scale-110 transition-transform`}>
                        {m.icon}
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:translate-x-1 transition-transform">{m.name}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* PERFORMANCE GOAL */}
            <div className="glass-card p-8 relative overflow-hidden bg-gradient-to-br from-amber-500/[0.05] to-orange-500/[0.05] border-amber-500/20">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Star size={16} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500/80">Active Milestone</h3>
              </div>
              
              <p className="text-lg font-black text-slate-800 dark:text-white mb-2">Bridge the Testing Gap</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                  <span className="text-sm font-black text-amber-500">35%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-2">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-1000" style={{ width: '35%' }}></div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  You need <span className="text-amber-600 font-bold">2 more test-heavy repositories</span> to reach "Senior" tier signals in our system.
                </p>
              </div>
              
              <button className="w-full mt-8 py-3 bg-white dark:bg-amber-500/10 border border-slate-200 dark:border-amber-500/20 text-slate-800 dark:text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-amber-500/20 transition-all">
                View Detailed Metrics
              </button>
            </div>

            {/* SYSTEM STATS */}
            <div className="flex gap-4">
              <div className="flex-1 glass-card p-6 text-center">
                <TrendingUp size={16} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-black text-slate-400 uppercase mb-1">Status</p>
                <p className="text-lg font-black text-emerald-500">Optimal</p>
              </div>
              <div className="flex-1 glass-card p-6 text-center">
                <Zap size={16} className="text-blue-500 mx-auto mb-2" />
                <p className="text-xs font-black text-slate-400 uppercase mb-1">Latency</p>
                <p className="text-lg font-black text-blue-500">24ms</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardHome;

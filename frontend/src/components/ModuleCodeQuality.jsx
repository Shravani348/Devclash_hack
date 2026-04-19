import React, { useState } from 'react';
import { 
  Search, Shield, Code2, Database, Lock, Terminal, Activity, 
  CheckCircle2, AlertCircle, XCircle, Info, ChevronRight, 
  Target, BarChart3, AlertTriangle, Sparkles, RefreshCcw,
  Loader2
} from 'lucide-react';

const ModuleCodeQuality = () => {
  const [username, setUsername] = useState('');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!username) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/code/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'PASS') return <CheckCircle2 className="text-emerald-500" size={20} />;
    if (status === 'WARN') return <AlertTriangle className="text-amber-500" size={20} />;
    return <XCircle className="text-rose-500" size={20} />;
  };

  const getStatusBadge = (status) => {
    const colors = {
      'PASS': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'WARN': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'FAIL': 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors[status]}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-primary-500/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-primary-500 animate-spin"></div>
          <Code2 className="absolute inset-0 m-auto text-primary-400" size={30} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Auditing GitHub Codebases...</h3>
        <p className="text-gray-500 text-sm animate-pulse italic">Scanning repositories, analyzing files, and calculating debt...</p>
      </div>
    );
  }

  if (data) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-2 flex items-center justify-center gap-4">
            GitHub Code Auditor
          </h1>
          <p className="text-gray-400">Professional-grade security & quality analysis for your repositories.</p>
        </div>

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Score Card */}
          <div className="glass-panel p-8 bg-dark-950/40 flex flex-col items-center justify-center text-center">
             <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="54" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
                  <circle 
                    cx="64" cy="64" r="54" stroke={data.average_score > 70 ? '#10b981' : (data.average_score > 40 ? '#f59e0b' : '#ef4444')} strokeWidth="10" fill="transparent"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - data.average_score / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{data.average_score}%</span>
                </div>
             </div>
             <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Audit Score</p>
             <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${
                data.level === 'Senior' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 
                (data.level === 'Intermediate' ? 'bg-blue-500 text-white shadow-blue-500/20' : 'bg-rose-500 text-white shadow-rose-500/20')
             }`}>
                {data.level}
             </span>
          </div>

          {/* Health Bar Card */}
          <div className="lg:col-span-2 glass-panel p-8 bg-dark-950/40 relative overflow-hidden">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                   <Activity size={14} className="text-primary-400" /> Repository Health
                </h3>
                <div className="flex items-center gap-4 text-[10px] font-bold">
                   <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Stable</span>
                   <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Risky</span>
                </div>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-gray-400 flex items-center gap-2 italic"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Aggregated Files ({data.files_analyzed})</span>
                      <span className="text-white">{data.average_score}%</span>
                   </div>
                   <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-1000"
                        style={{ width: `${data.average_score}%` }}
                      ></div>
                   </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                   <div className="flex items-center gap-3">
                      <Shield size={14} className="text-rose-500" /> 
                      <span className="text-gray-400">Tech Debt:</span>
                      <span className={data.average_score < 50 ? 'text-rose-500' : 'text-emerald-500'}>{data.average_score < 50 ? 'HIGH' : 'LOW'}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Activity size={14} className="text-primary-500" />
                      <span className="text-gray-400">Rule-Engine:</span>
                      <span className="text-gray-200 font-black italic">ACTIVE</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* CHECKS LIST */}
        <div className="space-y-4 mb-10">
          {Object.entries(data.checks).map(([key, check], i) => (
            <div key={i} className="glass-panel p-6 hover:border-white/10 transition-all group relative overflow-hidden">
              <div className="absolute top-4 right-6 text-[10px] text-gray-700 italic font-medium">{check.file}</div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                    check.status === 'PASS' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                    (check.status === 'WARN' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20')
                  }`}>
                    {getStatusIcon(check.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">{key.replace('_', ' ')}</h4>
                      {getStatusBadge(check.status)}
                    </div>
                    <p className="text-sm font-bold text-gray-300">{check.message}</p>
                  </div>
                </div>
                <div className="md:w-64 p-3 rounded-lg bg-dark-950/50 border border-white/5">
                   <p className="text-[10px] text-gray-500 flex items-start gap-2">
                      <Sparkles size={12} className="text-amber-500 shrink-0 mt-0.5" />
                      {check.status === 'PASS' ? 'Architecture seems solid in this file.' : 'Refactor to improve modularity and reuse.'}
                   </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
           <div className="glass-panel p-6 border-emerald-500/20 bg-emerald-500/5">
              <h5 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <CheckCircle2 size={14} /> Strengths
              </h5>
              <ul className="space-y-3">
                 {data.strengths.map((s, i) => (
                   <li key={i} className="text-xs text-gray-300 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                      {s}
                   </li>
                 ))}
                 {data.strengths.length === 0 && <li className="text-xs text-gray-500 italic">No significant strengths detected.</li>}
              </ul>
           </div>
           <div className="glass-panel p-6 border-amber-500/20 bg-amber-500/5">
              <h5 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <AlertTriangle size={14} /> What to improve
              </h5>
              <ul className="space-y-3">
                 {data.what_to_improve.map((im, i) => (
                   <li key={i} className="text-xs text-gray-300 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                      {im}
                   </li>
                 ))}
                 {data.what_to_improve.length === 0 && <li className="text-xs text-gray-500 italic">Everything looks professional!</li>}
              </ul>
           </div>
        </div>

        <div className="glass-panel p-8 bg-gradient-to-r from-primary-900/20 to-indigo-900/20 border-primary-500/20 text-center">
           <h4 className="text-xs font-black text-primary-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <Activity size={16} /> Final Audit Verdict
           </h4>
           <p className="text-2xl font-black text-white italic">"{data.final_verdict}"</p>
           <button 
             onClick={() => setData(null)}
             className="mt-8 px-6 py-2 bg-dark-900 hover:bg-dark-800 border border-white/10 rounded-lg text-xs font-bold flex items-center gap-2 mx-auto transition-all"
           >
              <RefreshCcw size={14} /> Analyze Another Profile
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-20 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-white mb-4">Backend Quality Auditor</h2>
        <p className="text-gray-400">Evaluate real GitHub code for modularity, security, and technical debt.</p>
      </div>

      <div className="glass-panel p-10 bg-dark-950/50">
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <Search size={16} className="text-primary-500" /> GitHub Username
            </label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. torvalds"
              className="w-full bg-dark-900 border border-white/5 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-primary-500 transition-all shadow-inner"
            />
          </div>

          <button 
            type="submit"
            disabled={!username || isLoading}
            className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:scale-[1.02] active:scale-95 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <><Shield size={20} /> Run Security Audit</>}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-center text-xs italic">
             ⚠️ {error}
          </div>
        )}
      </div>

      <div className="mt-10 grid grid-cols-3 gap-4 text-center">
         <div className="p-4 rounded-xl border border-white/5 opacity-50 hover:opacity-100 transition-opacity">
            <Code2 size={24} className="mx-auto mb-2 text-primary-400" />
            <span className="text-[10px] font-black uppercase text-gray-500">Static Engine</span>
         </div>
         <div className="p-4 rounded-xl border border-white/5 opacity-50 hover:opacity-100 transition-opacity">
            <Lock size={24} className="mx-auto mb-2 text-rose-400" />
            <span className="text-[10px] font-black uppercase text-gray-500">Security Scan</span>
         </div>
         <div className="p-4 rounded-xl border border-white/5 opacity-50 hover:opacity-100 transition-opacity">
            <Database size={24} className="mx-auto mb-2 text-emerald-400" />
            <span className="text-[10px] font-black uppercase text-gray-500">DB Integrity</span>
         </div>
      </div>
    </div>
  );
};

export default ModuleCodeQuality;

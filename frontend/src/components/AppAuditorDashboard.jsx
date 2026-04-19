import React from 'react';
import { RefreshCw, Layout, Accessibility, Zap, Activity, ShieldCheck, Code } from 'lucide-react';

const CircularProgress = ({ value, label, colorClass }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-dark-700" />
          {/* Progress Circle */}
          <circle 
            cx="48" cy="48" r={radius} 
            stroke="currentColor" 
            strokeWidth="8" 
            fill="transparent" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${colorClass}`} 
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xl font-bold">{value}%</span>
      </div>
      <span className="mt-3 text-sm font-medium text-gray-400">{label}</span>
    </div>
  );
};

const AuditCard = ({ title, icon: Icon, data, colorClass }) => {
  return (
    <div className="glass-panel p-6 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-dark-700 pb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Icon className={colorClass} size={20} /> {title}
        </h3>
        <span className={`font-bold text-xl ${data.score >= 80 ? 'text-success' : data.score >= 50 ? 'text-warning' : 'text-danger'}`}>
          {data.score}/100
        </span>
      </div>
      <div className="space-y-3 flex-grow">
        {data.details.map((detail, idx) => (
          <div key={idx} className="bg-dark-900 p-3 rounded-lg text-sm text-gray-300">
            {detail}
          </div>
        ))}
      </div>
    </div>
  );
};

const AppAuditorDashboard = ({ data, onReset }) => {
  if (data.error) {
    return (
      <div className="glass-panel border-danger/50 p-8 max-w-2xl mx-auto mt-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold text-danger mb-4">Audit Failed</h2>
        <p className="text-gray-300 mb-6">{data.error}</p>
        <button 
          onClick={onReset}
          className="px-6 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors border border-dark-700 flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="glass-panel p-8 text-center flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none"></div>
        <h2 className="text-3xl font-bold mb-4">Audit Complete</h2>
        <div className="flex items-center gap-6 mt-4">
          <CircularProgress 
            value={data.overallScore} 
            label="Overall App Quality" 
            colorClass={data.overallScore >= 80 ? 'text-success' : data.overallScore >= 50 ? 'text-warning' : 'text-danger'} 
          />
        </div>
      </div>

      {/* Grid of 6 dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AuditCard 
          title="Responsiveness" 
          icon={Layout} 
          data={data.responsiveness} 
          colorClass="text-blue-400" 
        />
        <AuditCard 
          title="Accessibility" 
          icon={Accessibility} 
          data={data.accessibility} 
          colorClass="text-purple-400" 
        />
        <AuditCard 
          title="Performance" 
          icon={Zap} 
          data={data.performance} 
          colorClass="text-yellow-400" 
        />
        <AuditCard 
          title="Animations UX" 
          icon={Activity} 
          data={data.animations} 
          colorClass="text-pink-400" 
        />
        <AuditCard 
          title="Security" 
          icon={ShieldCheck} 
          data={data.security} 
          colorClass="text-emerald-400" 
        />
        <AuditCard 
          title="Code Quality" 
          icon={Code} 
          data={data.codeQuality} 
          colorClass="text-indigo-400" 
        />
      </div>

      <div className="flex justify-center mt-8 pb-10">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors text-sm font-medium border border-dark-700"
        >
          <RefreshCw size={16} /> Audit Another App
        </button>
      </div>
    </div>
  );
};

export default AppAuditorDashboard;

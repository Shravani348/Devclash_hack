import React from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Code2, Star, GitBranch } from 'lucide-react';

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

const Dashboard = ({ data, onReset }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex justify-center">
          <CircularProgress 
            value={data.resumeScore} 
            label="Resume Score" 
            colorClass={data.resumeScore > 75 ? 'text-success' : 'text-warning'} 
          />
        </div>
        <div className="glass-panel p-6 flex justify-center">
          <CircularProgress 
            value={data.githubScore} 
            label="GitHub Impact" 
            colorClass={data.githubScore > 75 ? 'text-success' : 'text-warning'} 
          />
        </div>
        <div className="glass-panel p-6 flex justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent"></div>
          <CircularProgress 
            value={data.overallScore} 
            label="Hiring Readiness" 
            colorClass="text-primary-400" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Detailed Improvements Report */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-6">
          <h3 className="text-xl font-semibold border-b border-dark-700 pb-3">Actionable Report</h3>
          
          <div className="space-y-4">
            {data.improvements.map((item, idx) => (
              <div key={idx} className={`p-4 rounded-lg flex gap-4 ${
                item.type === 'delete' ? 'bg-danger/10 border border-danger/20' :
                item.type === 'add' ? 'bg-success/10 border border-success/20' :
                'bg-warning/10 border border-warning/20'
              }`}>
                <div className="mt-1">
                  {item.type === 'delete' && <XCircle className="text-danger" size={20} />}
                  {item.type === 'add' && <CheckCircle className="text-success" size={20} />}
                  {item.type === 'modify' && <AlertTriangle className="text-warning" size={20} />}
                </div>
                <div>
                  <h4 className="font-semibold capitalize text-sm mb-1 text-gray-200">
                    {item.type} (Impacts Hiring)
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub Analysis Summary */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
             <h3 className="text-xl font-semibold">GitHub Insights</h3>
             <Code2 className="text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
              <span className="flex items-center gap-2 text-gray-300"><GitBranch size={16}/> Repositories</span>
              <span className="font-bold text-primary-400">{data.githubAnalysis.repos}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
              <span className="flex items-center gap-2 text-gray-300"><Star size={16}/> Total Stars</span>
              <span className="font-bold text-warning">{data.githubAnalysis.stars}</span>
            </div>
            <div className="p-4 bg-dark-900 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Code Quality Review</p>
              <p className="text-sm font-medium">{data.githubAnalysis.quality}</p>
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-center mt-8">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors text-sm font-medium border border-dark-700"
        >
          <RefreshCw size={16} /> Analyze Another Profile
        </button>
      </div>

    </div>
  );
};

export default Dashboard;

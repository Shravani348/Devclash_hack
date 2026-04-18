import React from 'react';
import { Briefcase, Building2, Wallet } from 'lucide-react';

const JobMatches = ({ matches }) => {
  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
        Target Job Matches
      </h3>
      
      <div className="flex flex-col gap-4">
        {matches.map((job, idx) => (
          <div key={idx} className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-5 hover:border-indigo-500/50 transition-colors group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="text-lg font-bold text-indigo-300 flex items-center gap-2 mb-1">
                  <Briefcase size={18} /> {job.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Wallet size={14} className="text-emerald-400"/> {job.salary}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-gray-300">Fit</div>
                <div className="relative w-24 h-24 sm:w-16 sm:h-16 flex items-center justify-center">
                   <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-dark-700 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                    <circle className="text-indigo-500 stroke-current progress-ring__circle" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" style={{ strokeDasharray: 251.2, strokeDashoffset: 251.2 - (251.2 * job.fit) / 100 }}></circle>
                  </svg>
                  <div className="absolute text-sm font-bold text-white">{job.fit}%</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-dark-700/50">
              <div className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Building2 size={12} /> Target Companies
              </div>
              <div className="flex flex-wrap gap-2">
                {job.companies.map((company, i) => (
                  <span key={i} className="px-3 py-1 bg-dark-900 border border-dark-600 rounded-md text-sm text-gray-300 group-hover:bg-indigo-500/10 group-hover:text-indigo-200 group-hover:border-indigo-500/30 transition-colors cursor-pointer">
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobMatches;

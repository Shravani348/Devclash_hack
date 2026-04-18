import React from 'react';
import { Github, Trophy, Target } from 'lucide-react';

const ProfileCard = ({ name, github, skillLevel, overallScore, percentile }) => {
  const dashArray = 2 * Math.PI * 40; // r=40
  const dashOffset = dashArray - (dashArray * overallScore) / 100;

  return (
    <div className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl"></div>
      
      <div className="flex items-center gap-6 z-10 w-full md:w-auto">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 p-1 shadow-lg">
          <div className="w-full h-full bg-dark-900 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-400">
              {name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
            {name}
            <span className="px-3 py-1 bg-dark-800 border border-dark-600 rounded-full text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <Trophy size={14} /> {skillLevel}
            </span>
          </h2>
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <span className="flex items-center gap-1.5 hover:text-gray-200 transition-colors cursor-pointer">
              <Github size={16} /> @{github}
            </span>
            <span className="flex items-center gap-1.5">
              <Target size={16} className="text-purple-400"/> Top {100 - percentile}% Developer
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 z-10 bg-dark-900/50 p-4 rounded-2xl border border-dark-700/50 w-full md:w-auto">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-400 mb-1">DCIS Overall Score</div>
          <div className="text-xs text-gray-500">Based on 6 vectors</div>
        </div>
        
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-dark-700 stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            ></circle>
            <circle
              className="text-primary-500 stroke-current progress-ring__circle drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              style={{ strokeDasharray: dashArray, strokeDashoffset: dashOffset }}
            ></circle>
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{overallScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;

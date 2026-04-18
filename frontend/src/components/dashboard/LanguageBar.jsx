import React from 'react';
import { Code2 } from 'lucide-react';

const LanguageBar = ({ languages }) => {
  const languageColors = {
    JavaScript: 'bg-[#f7df1e]',
    Python: 'bg-[#3776ab]',
    CSS: 'bg-[#1572b6]',
    HTML: 'bg-[#e34f26]',
    TypeScript: 'bg-[#3178c6]',
    Java: 'bg-[#b07219]',
    Other: 'bg-gray-500'
  };

  const total = Object.values(languages).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Code2 className="text-primary-400" size={20} /> Repository Language Profile
      </h3>
      
      {/* Segmented Bar */}
      <div className="w-full h-4 rounded-full overflow-hidden flex shadow-inner mb-6">
        {Object.entries(languages).map(([lang, amount], idx) => {
          const color = languageColors[lang] || languageColors['Other'];
          const percentage = (amount / total) * 100;
          return (
            <div 
              key={idx} 
              className={`h-full ${color} transition-all duration-500 hover:opacity-80 cursor-pointer`}
              style={{ width: `${percentage}%` }}
              title={`${lang}: ${percentage.toFixed(1)}%`}
            ></div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(languages).map(([lang, amount], idx) => {
          const color = languageColors[lang] || languageColors['Other'];
          const percentage = (amount / total) * 100;
          return (
            <div key={idx} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${color}`}></span>
              <span className="text-sm font-medium text-gray-300">{lang}</span>
              <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageBar;

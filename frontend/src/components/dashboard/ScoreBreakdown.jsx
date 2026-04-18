import React from 'react';

const ScoreBreakdown = ({ scores }) => {
  const formatLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  
  const getColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-primary-500';
    if (score >= 40) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-primary-500 rounded-full"></span>
        Technical Score Breakdown
      </h3>
      
      <div className="space-y-5">
        {Object.entries(scores).map(([key, score]) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300">{formatLabel(key)}</span>
              <span className="text-sm font-bold text-white">{score}/100</span>
            </div>
            <div className="w-full h-2.5 bg-dark-800 rounded-full overflow-hidden border border-dark-700/50">
              <div 
                className={`h-full rounded-full ${getColor(score)} transition-all duration-1000 ease-out relative`}
                style={{ width: `${score}%` }}
              >
                <div className="absolute inset-0 bg-white/20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBreakdown;

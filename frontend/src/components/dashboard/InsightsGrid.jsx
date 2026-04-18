import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

const InsightsGrid = ({ strengths, weaknesses }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Strengths */}
      <div className="glass-panel p-6 flex flex-col h-full">
        <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
          <CheckCircle size={20} /> Verified Strengths
        </h3>
        <div className="space-y-4 flex-grow">
          {strengths.map((str, idx) => (
            <div key={idx} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 transition-colors hover:bg-emerald-500/20">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-emerald-300">{str.skill}</h4>
                <div className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md">Score: {str.score}</div>
              </div>
              <p className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5 opacity-60">↳</span>
                {str.evidence}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Weaknesses */}
      <div className="glass-panel p-6 flex flex-col h-full border-danger/20 lg:border-l-0">
        <h3 className="text-lg font-bold text-rose-400 mb-4 flex items-center gap-2">
          <AlertTriangle size={20} /> Critical Weaknesses
        </h3>
        <div className="space-y-4 flex-grow">
          {weaknesses.map((weak, idx) => {
            const isRed = weak.severity === 'Critical';
            const isOrange = weak.severity === 'High';
            
            const badgeColor = isRed ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 
                              isOrange ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 
                              'bg-amber-500/20 text-amber-400 border-amber-500/30';
            
            const boxColor = isRed ? 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20' : 
                            isOrange ? 'bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/20' : 
                            'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20';

            return (
              <div key={idx} className={`${boxColor} border rounded-xl p-4 transition-colors`}>
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h4 className="font-semibold text-gray-200">{weak.area}</h4>
                  <div className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm border ${badgeColor}`}>
                    {weak.severity}
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-3 block">{weak.issue}</p>
                <div className="bg-dark-900 border border-dark-700 rounded-lg p-3 flex items-start gap-2">
                  <Lightbulb size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-primary-200 font-medium leading-snug">Fix: {weak.fix}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InsightsGrid;

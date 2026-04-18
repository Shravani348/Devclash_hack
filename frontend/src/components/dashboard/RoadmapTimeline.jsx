import React from 'react';
import { Compass, Calendar } from 'lucide-react';

const RoadmapTimeline = ({ roadmap }) => {
  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
        90-Day Execution Roadmap
      </h3>
      
      <div className="relative border-l-2 border-dark-700/50 pl-6 space-y-8 py-2 ml-3">
        {roadmap.map((step, idx) => (
          <div key={idx} className="relative group">
            <span className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-dark-900 border-2 border-amber-500 group-hover:bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-colors"></span>
            
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
              <Calendar size={14} /> {step.weeks}
            </div>
            
            <h4 className="text-lg font-bold text-gray-200 mb-2">{step.focus}</h4>
            
            <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-4 transition-colors group-hover:border-amber-500/30">
              <p className="text-sm text-gray-300 mb-3"><strong className="text-gray-400 font-medium">Action:</strong> {step.action}</p>
              <div className="bg-amber-500/10 text-amber-400 text-xs font-semibold px-3 py-2 rounded-lg inline-flex items-center gap-2 flex-wrap">
                <Compass size={14} /> {step.outcome}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapTimeline;

import React from 'react';
import Navbar from '../components/Navbar';
import LeetCodeAnalyzer from '../components/LeetCodeAnalyzer';

const ModuleLeetCode = () => {
  return (
    <div className="min-h-screen bg-transparent font-sans relative selection:bg-blue-500/30 overflow-x-hidden">
      <Navbar />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[8000ms]"></div>
      </div>

      <main className="relative z-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <LeetCodeAnalyzer />
      </main>
    </div>
  );
};

export default ModuleLeetCode;

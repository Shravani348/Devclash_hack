import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  // Smart auth check
  useEffect(() => {
    if (localStorage.getItem('loggedIn') === 'true') {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  return (
    <div 
      className="min-h-screen text-white relative font-sans flex flex-col items-center justify-center pt-20 pb-20"
      style={{ backgroundColor: '#0A0F1E' }}
    >
      {/* Subtle dot grid pattern */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{
             backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
             backgroundSize: '24px 24px'
           }}
      ></div>

      {/* Soft glow behind the title */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Developer Career Intelligence System
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Your code doesn't lie. We read every repo and tell you exactly where you stand.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/login"
              className="px-8 py-3 rounded-md bg-transparent border border-gray-600 hover:border-gray-400 hover:bg-gray-800 text-white font-semibold transition-all"
            >
              Sign In
            </Link>
            <Link 
              to="/register"
              className="px-8 py-3 rounded-md border border-transparent bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Feature Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 hover:border-gray-600 transition-colors">
            <h3 className="text-2xl font-bold mb-3">GitHub Analysis</h3>
            <p className="text-gray-400">
              Deep dive into your commit history, evaluating code quality, patterns, and impact across repositories.
            </p>
          </div>
          
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 hover:border-gray-600 transition-colors">
            <h3 className="text-2xl font-bold mb-3">AI Audit</h3>
            <p className="text-gray-400">
              Identify architectural weaknesses, hidden security flaws, and receive actionable refactoring logic.
            </p>
          </div>
          
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 hover:border-gray-600 transition-colors">
            <h3 className="text-2xl font-bold mb-3">Career Roadmap</h3>
            <p className="text-gray-400">
              Stop guessing. Follow a data-backed trajectory matching your unique metrics to your target salary tier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

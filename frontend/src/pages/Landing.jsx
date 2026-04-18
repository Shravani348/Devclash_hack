import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Github, Sparkles, Map } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('loggedIn') === 'true') {
      navigate('/home');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-dark-900 bg-dot-pattern relative overflow-hidden flex flex-col pt-20">
      {/* Soft glow behind title */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center flex-grow">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mt-16 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white drop-shadow-sm">
            Developer Career <br />
            <span className="gradient-text">Intelligence System</span>
          </h1>
          <p className="text-xl text-gray-300 font-medium mb-12 max-w-2xl mx-auto">
            Your code doesn't lie. We read every repo and tell you exactly where you stand.
          </p>

          <div className="flex items-center justify-center gap-6">
            <Link 
              to="/login"
              className="px-8 py-3 rounded-full bg-dark-800 border border-dark-700 hover:border-gray-500 text-white font-semibold transition-all hover:bg-dark-700 shadow-lg"
            >
              Sign In
            </Link>
            <Link 
              to="/register"
              className="px-8 py-3 rounded-full bg-primary-500 hover:bg-primary-400 text-white font-semibold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="glass-panel p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-dark-900 rounded-full flex items-center justify-center border border-dark-700 mb-6">
              <Github className="text-gray-100" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-100">GitHub Analysis</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We deep-dive into your commit history, code quality, and test coverage to build a completely objective profile.
            </p>
          </div>

          <div className="glass-panel p-8 text-center flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 to-transparent"></div>
            <div className="w-14 h-14 bg-dark-900 rounded-full flex items-center justify-center border border-primary-500/30 mb-6 relative z-10">
              <Sparkles className="text-primary-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-100 relative z-10">AI Audit</h3>
            <p className="text-gray-400 text-sm leading-relaxed relative z-10">
              Identify architectural weaknesses, hidden security flaws, and receive actionable fixes instantly via LLM pipelines.
            </p>
          </div>

          <div className="glass-panel p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-dark-900 rounded-full flex items-center justify-center border border-dark-700 mb-6">
              <Map className="text-gray-100" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-100">Career Roadmap</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Stop guessing. Follow a strict 90-day trajectory matching your unique metrics to your dream salary tier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Sparkles, Map, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const Landing = () => {
  return (
    <div className="min-h-screen bg-dark-900 overflow-hidden font-sans relative selection:bg-primary-500/30">
      <Navbar />
      
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[8000ms]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10000ms] delay-700"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[9000ms] delay-500"></div>
        {/* Subtle dot pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
      </div>

      <main className="container mx-auto px-6 relative z-10 flex flex-col items-center pt-24 pb-32">
        {/* Hero Section */}
        <div className="text-center max-w-5xl mb-24 relative flex flex-col items-center group">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-gray-300 mb-8 hover:bg-white/10 transition-colors cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            DCIS v2.0 is Live
            <ChevronRight size={14} className="text-gray-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-white drop-shadow-2xl leading-[1.1] relative">
            Developer Career <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-400 animate-gradient-x bg-[length:200%_auto]">
              Intelligence System
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
            Your code doesn't lie. We read every repository, audit your architecture, and pinpoint exactly where you stand in the developer market.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-md mx-auto relative z-20">
            <Link 
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white font-bold transition-all shadow-lg backdrop-blur-sm text-center"
            >
              Sign In
            </Link>
            <Link 
              to="/register"
              className="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-primary-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 border border-primary-500 hover:bg-primary-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transform hover:-translate-y-1"
            >
              Get Started Now
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid (Glassmorphism & 3D Hover) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10 perspective-1000">
          
          <div className="group relative rounded-3xl bg-dark-800/40 border border-white/10 backdrop-blur-xl p-8 hover:-translate-y-4 hover:shadow-[0_20px_40px_-5px_rgba(59,130,246,0.2)] hover:border-primary-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl flex items-center justify-center border border-white/10 mb-8 shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-500">
              <Github className="text-gray-100 group-hover:text-primary-400 transition-colors" size={32} />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 text-white relative z-10">Repository DNA</h3>
            <p className="text-gray-400 text-base leading-relaxed relative z-10 font-medium">
              We deep-dive into your commit history, evaluate code quality, and measure test coverage to build a completely objective developer profile.
            </p>
          </div>

          <div className="group relative rounded-3xl bg-dark-800/40 border border-white/10 backdrop-blur-xl p-8 hover:-translate-y-4 hover:shadow-[0_20px_40px_-5px_rgba(168,85,247,0.2)] hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl flex items-center justify-center border border-white/10 mb-8 shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="text-gray-100 group-hover:text-purple-400 transition-colors" size={32} />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 text-white relative z-10">AI App Auditor</h3>
            <p className="text-gray-400 text-base leading-relaxed relative z-10 font-medium">
              Submit your live URLs. We identify architectural weaknesses, hidden security flaws, and provide actionable fixes instantly via LLM pipelines.
            </p>
          </div>

          <div className="group relative rounded-3xl bg-dark-800/40 border border-white/10 backdrop-blur-xl p-8 hover:-translate-y-4 hover:shadow-[0_20px_40px_-5px_rgba(16,185,129,0.2)] hover:border-emerald-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl flex items-center justify-center border border-white/10 mb-8 shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-500">
              <Map className="text-gray-100 group-hover:text-emerald-400 transition-colors" size={32} />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 text-white relative z-10">Career Roadmap</h3>
            <p className="text-gray-400 text-base leading-relaxed relative z-10 font-medium">
              Stop guessing. Follow a strict 90-day trajectory matching your unique metrics to your dream FAANG or startup salary tier.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Landing;

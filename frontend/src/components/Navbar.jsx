import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Code, User, Brain, Globe, Sparkles } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-dark-900/40 backdrop-blur-xl border-b border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0 relative">
          <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
          <div className="w-11 h-11 bg-gradient-to-tr from-primary-600 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-300 transform group-hover:rotate-3 relative z-10 border border-white/10">
            <Code className="text-white drop-shadow-md" size={22} strokeWidth={2.5} absoluteStrokeWidth />
          </div>
          <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-500 group-hover:from-white group-hover:to-primary-300 transition-colors duration-300 relative z-10">DCIS<span className="text-primary-500">.</span></span>
        </Link>

        {/* Center: Horizontal Navigation Links */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-2 mx-8">
          <Link to="/github-analysis" className="flex items-center gap-2.5 px-4 py-2 rounded-full text-[14px] font-bold text-gray-400 hover:text-white transition-all hover:bg-white/5 relative group">
            <Code size={16} className="text-primary-500 group-hover:animate-pulse" />
            <span>Analysis</span>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></div>
          </Link>
          <Link to="/" className="flex items-center gap-2.5 px-4 py-2 rounded-full text-[14px] font-bold text-gray-400 hover:text-white transition-all hover:bg-white/5 relative group">
            <User size={16} className="text-emerald-500 group-hover:animate-pulse" />
            <span>Audit</span>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></div>
          </Link>
          <Link to="/" className="flex items-center gap-2.5 px-4 py-2 rounded-full text-[14px] font-bold text-gray-400 hover:text-white transition-all hover:bg-white/5 relative group">
            <Brain size={16} className="text-purple-500 group-hover:animate-pulse" />
            <span>Insights</span>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></div>
          </Link>
          <Link to="/" className="flex items-center gap-2.5 px-4 py-2 rounded-full text-[14px] font-bold text-gray-400 hover:text-white transition-all hover:bg-white/5 relative group">
            <Sparkles size={16} className="text-amber-500 group-hover:animate-pulse" />
            <span>Gen AI</span>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></div>
          </Link>
          <Link to="/live-app-audit" className="flex items-center gap-2.5 px-4 py-2 rounded-full text-[14px] font-bold text-gray-400 hover:text-white transition-all hover:bg-white/5 relative group">
            <Globe size={16} className="text-rose-500 group-hover:animate-pulse" />
            <span>Live App</span>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-rose-500 to-transparent transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></div>
          </Link>
        </nav>

        {/* Right: Avatar & Logout */}
        <div className="flex items-center gap-4 shrink-0">
          <button className="hidden sm:inline-flex px-4 py-1.5 rounded-full bg-gradient-to-r from-dark-800 to-dark-700 border border-white/10 text-[13px] font-bold text-white hover:border-primary-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all">
            Upgrade Pro
          </button>
          <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block"></div>
          <div className="flex items-center gap-3 bg-dark-800/40 p-1.5 pr-2 rounded-full border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-inner ring-2 ring-dark-900">
              AS
            </div>
            <div className="flex flex-col items-start hidden sm:flex">
              <span className="text-[13px] font-bold text-gray-200 leading-tight">Aryan S.</span>
              <span className="text-[10px] font-extrabold text-primary-400 uppercase tracking-wider leading-tight">Lvl 42 Dev</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 ml-1 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-all"
              title="Log Out"
            >
              <LogOut size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

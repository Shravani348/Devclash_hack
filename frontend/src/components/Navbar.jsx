import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Code, User, Brain, Globe, Sparkles } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-dark-900/80 backdrop-blur-lg border-b border-dark-700/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/home" className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-tighter text-primary-500 group-hover:text-primary-400 transition-colors">DCIS</span>
        </Link>

        {/* Center: Modules Dropdown */}
        <div 
          className="relative group h-full flex items-center"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button className="flex items-center gap-2 text-gray-300 hover:text-white font-medium px-4 py-2 rounded-lg transition-colors group-hover:bg-dark-800">
            Modules <ChevronDown size={16} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          <div className={`absolute top-[60px] left-1/2 -translate-x-1/2 w-64 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl py-2 transition-all duration-200 origin-top transform ${dropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
            
            {/* GitHub Analysis */}
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 text-primary-400 font-semibold mb-2">
                <Code size={16} /> GitHub Analysis
              </div>
              <div className="pl-6 border-l border-dark-600 ml-2 flex flex-col gap-1">
                <Link to="/home" className="text-sm text-gray-400 hover:text-white hover:bg-dark-700/50 px-2 py-1.5 rounded transition-colors block">Frontend</Link>
                <Link to="/home" className="text-sm text-gray-400 hover:text-white hover:bg-dark-700/50 px-2 py-1.5 rounded transition-colors block">Backend</Link>
              </div>
            </div>

            <div className="h-px bg-dark-700/50 my-1"></div>

            {/* Resume Audit */}
            <Link to="/home" className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-dark-700/50 transition-colors font-medium">
              <User size={16} className="text-emerald-400" /> Resume Audit
            </Link>

            <div className="h-px bg-dark-700/50 my-1"></div>

            {/* AI ML Insights */}
            <Link to="/home" className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-dark-700/50 transition-colors font-medium">
              <Brain size={16} className="text-purple-400" /> AI / ML Insights
            </Link>

            {/* Gen AI Tools */}
            <Link to="/home" className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-dark-700/50 transition-colors font-medium">
              <Sparkles size={16} className="text-amber-400" /> Generative AI Tools
            </Link>

            <div className="h-px bg-dark-700/50 my-1"></div>

            {/* Live App Audit */}
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 text-rose-400 font-semibold mb-2">
                <Globe size={16} /> Live App Audit
              </div>
              <div className="pl-6 border-l border-dark-600 ml-2 flex flex-col gap-1">
                <Link to="/home" className="text-sm text-gray-400 hover:text-white hover:bg-dark-700/50 px-2 py-1.5 rounded transition-colors block">Frontend</Link>
                <Link to="/home" className="text-sm text-gray-400 hover:text-white hover:bg-dark-700/50 px-2 py-1.5 rounded transition-colors block">Backend</Link>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Avatar & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-gray-100">Aryan Sharma</span>
              <span className="text-xs text-gray-400">Mid-Level Dev</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-dark-700 shadow-sm">
              AS
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors ml-2"
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

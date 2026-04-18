import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Code, User, Brain, Globe, Sparkles, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Developer');
  const [initials, setInitials] = useState('DEV');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
      
      // Calculate initials (e.g. "Aryan Sharma" -> "AS")
      const nameParts = storedName.split(' ');
      if (nameParts.length > 1) {
        setInitials(nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase());
      } else {
        setInitials(storedName.substring(0, 2).toUpperCase());
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userName');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-gray-800 shadow-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded drop-shadow">
            <Code className="text-white" size={18} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black text-gray-100 uppercase tracking-tighter cursor-default">DCIS<span className="text-blue-500">.</span></span>
        </div>

        {/* Center: Horizontal Navigation */}
        <nav className="hidden lg:flex items-center gap-4 absolute left-1/2 -translate-x-1/2">
          
          {/* GitHub Analysis */}
          <Link to="/github-analysis" className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors p-4">
            <Code size={16} className="text-blue-500" />
            <span>GitHub Analysis</span>
          </Link>

          {/* LeetCode Analysis */}
          <Link to="/leetcode-analysis" className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors p-4">
            <Brain size={16} className="text-purple-500" />
            <span>LeetCode</span>
          </Link>

          {/* Resume Audit (Placeholder for now) */}
          <Link to="/home" className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors p-4">
            <User size={16} className="text-emerald-500" />
            <span>Resume Audit</span>
          </Link>

          {/* Live App Audit */}
          <Link to="/live-app-audit" className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors p-4">
            <Globe size={16} className="text-rose-500" />
            <span>App Audit</span>
          </Link>

          {/* Simple Link */}
          <Link to="/home" className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors p-4 text-nowrap">
            <Sparkles size={16} className="text-amber-500" />
            <span>AI Tools</span>
          </Link>

        </nav>

        {/* Right: Auth Profile Avatar */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 bg-[#111827] border border-gray-800 pl-1.5 pr-2 py-1 rounded-full">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              {initials}
            </div>
            <span className="text-sm font-semibold text-white hidden sm:block mr-2">{userName}</span>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-rose-400 transition-colors"
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

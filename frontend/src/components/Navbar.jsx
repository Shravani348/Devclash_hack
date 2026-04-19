import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Code, User, Brain, Globe, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Developer');
  const [initials, setInitials] = useState('DEV');

  useEffect(() => {
    // 🔥 FORCE DARK MODE
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
      
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
    <header className="sticky top-0 z-50 w-full bg-white/60 dark:bg-[#0A0F1E]/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 transition-all duration-500">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div 
          className="flex items-center gap-4 group cursor-pointer" 
          onClick={() => navigate('/home')}
        >
          <div className="w-10 h-10 flex items-center justify-center bg-primary-600 rounded-2xl shadow-lg shadow-primary-600/20 group-hover:scale-110 transition-transform duration-500">
            <Code className="text-white" size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">DCIS<span className="text-primary-500">.</span></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Intelligence</span>
          </div>
        </div>

        {/* Center: Horizontal Navigation */}
        <nav className="hidden lg:flex items-center bg-slate-100/50 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 absolute left-1/2 -translate-x-1/2">
          
          {[
            { name: 'Dashboard', to: '/home', icon: <LayoutDashboard size={14} /> },
            { name: 'GitHub', to: '/github-analysis', icon: <Code size={14} /> },
            { name: 'LeetCode', to: '/leetcode-analysis', icon: <Brain size={14} /> },
            { name: 'Resume', to: '/resume-audit', icon: <User size={14} /> },
            { name: 'App Audit', to: '/live-app-audit', icon: <Globe size={14} /> }
          ].map((item, idx) => (
            <Link 
              key={idx}
              to={item.to} 
              className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all"
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Right: Auth Profile Avatar */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-2xl pr-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary-500/20">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{userName}</span>
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-4 p-2 text-slate-300 hover:text-rose-500 transition-colors"
              title="Terminate Session"
            >
              <LogOut size={16} strokeWidth={3} />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Code, Sparkles, ShieldCheck } from 'lucide-react';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('userName', email.split('@')[0]);
      navigate('/home');
    } else {
      alert('Please enter credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dot-pattern relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-indigo-500/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md px-6 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-600/20 rotate-3">
            <Code className="text-white" size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Access <span className="text-gradient">Intelligence</span></h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Continue your career evolution.</p>
        </div>

        <div className="glass-card p-10 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-white/5">
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white placeholder:text-slate-400"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Token</label>
                <Link to="#" className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline">Forgot?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-4 flex items-center justify-center gap-3 group mt-4"
            >
              Sign In to DCIS
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 text-center">
            <p className="text-sm text-slate-500 font-medium">
              New to the platform?{' '}
              <Link to="/signup" className="text-primary-500 font-bold hover:underline">Initialize Account</Link>
            </p>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 flex items-center justify-center gap-6 text-slate-400 dark:text-slate-600 grayscale opacity-50">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <Sparkles size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">AI Core Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

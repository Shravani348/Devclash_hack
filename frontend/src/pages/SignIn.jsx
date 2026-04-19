import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Github, Loader2 } from 'lucide-react';

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('userName', email.split('@')[0]); // Use part of email as name
      navigate('/home');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-dark-900 bg-dot-pattern flex items-center justify-center p-6">
      <div className="glass-panel p-10 w-full max-w-md animate-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm">Sign in to sync your repositories</p>
        </div>

        <button 
          type="button"
          onClick={handleSignIn}
          className="w-full bg-dark-900 border border-dark-700 hover:bg-dark-800 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-3 transition-colors mb-6 shadow-sm"
        >
          <Github size={20} /> Continue with GitHub
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-dark-700 w-full"></div>
          <span className="bg-[#101426] px-3 text-xs text-gray-500 absolute font-medium">OR USE EMAIL</span>
        </div>

        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              placeholder="developer@DCIS.com"
            />
          </div>
          
          <div className="space-y-1 pb-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300">Password</label>
            </div>
            <input 
              type="password" 
              required
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)]"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;

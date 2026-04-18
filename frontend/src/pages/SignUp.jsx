import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignUp = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('loggedIn', 'true');
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-dark-900 bg-dot-pattern flex items-center justify-center p-6">
      <div className="glass-panel p-10 w-full max-w-md animate-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-sm">Join DCIS and benchmark your skills</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              placeholder="Aryan Sharma"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              placeholder="developer@dcis.com"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1 pb-2">
            <label className="text-sm font-medium text-gray-300">Confirm Password</label>
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
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

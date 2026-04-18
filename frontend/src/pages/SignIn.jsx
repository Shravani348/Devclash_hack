import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e) => {
    e.preventDefault();
    // Simulate auth
    localStorage.setItem('loggedIn', 'true');
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0F1E] font-sans">
      <div className="bg-[#111827] border border-gray-800 p-8 rounded-xl w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Welcome Back</h2>
        
        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1F2937] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1F2937] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-md transition-colors mt-2"
          >
            Sign In
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <button 
          type="button"
          className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          Continue with GitHub
        </button>

        <p className="mt-6 text-center text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:text-blue-400 font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;

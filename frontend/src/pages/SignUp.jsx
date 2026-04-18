import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // Simulate auth
    localStorage.setItem('loggedIn', 'true');
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0F1E] font-sans">
      <div className="bg-[#111827] border border-gray-800 p-8 rounded-xl w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Create Your Account</h2>
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Full Name</label>
            <input 
              type="text" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#1F2937] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>

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
              placeholder="Create a password"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Confirm Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#1F2937] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Confirm your password"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-md transition-colors mt-4"
          >
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

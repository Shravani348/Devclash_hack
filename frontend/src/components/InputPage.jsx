import React, { useState } from 'react';
import { Github, Loader2, ArrowRight } from 'lucide-react';

const InputPage = ({ onAnalyze, isLoading }) => {
  const [githubUrl, setGithubUrl] = useState('');

  // ✅ FIXED USERNAME EXTRACTION (IMPORTANT)
  const extractUsername = (url) => {
    try {
      if (!url || !url.includes("github.com")) return null;

      let username = url.split("github.com/")[1];

      if (!username) return null;

      // 🔥 remove anything after username
      username = username.split("/")[0];

      return username.trim();
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!githubUrl) {
      alert("Please provide a GitHub URL.");
      return;
    }

    const username = extractUsername(githubUrl);

    if (!username) {
      alert("Please enter a valid GitHub URL");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    if (githubUrl) formData.append("githubUrl", githubUrl);

    onAnalyze(formData);
  };

  return (
    <div className="glass-panel p-8 max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Github className="text-primary-400" /> Enter GitHub Profile
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* GitHub */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Github size={16} /> GitHub Profile URL
          </label>
          <input 
            type="text" 
            placeholder="https://github.com/username"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-gray-100"
          />
        </div>

        {/* Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <><Loader2 className="animate-spin" size={20} /> Analyzing...</>
          ) : (
            <>Start Analysis <ArrowRight size={20} /></>
          )}
        </button>

      </form>
    </div>
  );
};

export default InputPage;
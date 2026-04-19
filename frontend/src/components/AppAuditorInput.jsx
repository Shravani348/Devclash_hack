import React, { useState } from 'react';
import { Globe, Loader2, ArrowRight } from 'lucide-react';

const AppAuditorInput = ({ onAudit, isAuditing }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url) {
      alert("Please enter a valid URL.");
      return;
    }
    onAudit(url);
  };

  return (
    <div className="glass-panel p-8 max-w-2xl mx-auto mt-10 animate-in fade-in zoom-in duration-300">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Globe className="text-primary-400" /> Audit Live Application
      </h2>
      
      <p className="text-gray-400 mb-6 text-sm">
        Enter the URL of your live application. We will use a headless browser to audit it against 6 critical dimensions: Responsiveness, Accessibility, Performance, Animations, Security Headers, and Code Quality.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* URL Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            Live URL
          </label>
          <input 
            type="text" 
            placeholder="https://my-portfolio.vercel.app"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            required
          />
        </div>

        {/* Action Button */}
        <button 
          type="submit" 
          disabled={isAuditing}
          className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isAuditing ? (
            <><Loader2 className="animate-spin" size={20} /> Running Comprehensive Audit...</>
          ) : (
            <>Start Audit <ArrowRight size={20} /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default AppAuditorInput;

import React, { useState } from 'react';
import { Upload, Github, Linkedin, Loader2, ArrowRight } from 'lucide-react';

const InputPage = ({ onAnalyze, isLoading }) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file && !githubUrl) {
      alert("Please upload a resume or provide a GitHub URL.");
      return;
    }
    
    // In a real scenario, you'd use FormData to send the file.
    const formData = new FormData();
    if (file) formData.append('resume', file);
    formData.append('github', githubUrl);
    formData.append('linkedin', linkedinUrl);
    
    onAnalyze(formData);
  };

  return (
    <div className="glass-panel p-8 max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Upload className="text-primary-400" /> Upload Your Profile
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* File Upload Area */}
        <div className="relative border-2 border-dashed border-dark-700 rounded-xl p-8 hover:border-primary-500 transition-colors bg-dark-900/50 text-center">
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-300">
            {file ? <span className="text-success font-medium">{file.name}</span> : 'Drag & Drop your Resume (PDF) or click to browse'}
          </p>
        </div>

        {/* GitHub Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Github size={16} /> GitHub Profile URL
          </label>
          <input 
            type="text" 
            placeholder="https://github.com/username"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
          />
        </div>

        {/* LinkedIn Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Linkedin size={16} /> LinkedIn Profile URL (Optional)
          </label>
          <input 
            type="text" 
            placeholder="https://linkedin.com/in/username"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
          />
        </div>

        {/* Action Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <><Loader2 className="animate-spin" size={20} /> Analyzing Your Profile...</>
          ) : (
            <>Start Analysis <ArrowRight size={20} /></>
          )}
        </button>

      </form>
    </div>
  );
};

export default InputPage;

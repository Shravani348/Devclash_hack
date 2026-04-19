import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const ResumeAuditInput = ({ onAnalyze, isLoading }) => {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jd', jd);
    onAnalyze(formData);
  };

  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    "Extracting resume text...",
    "Running ATS compatibility checks...",
    "Analyzing skills and content...",
    "Generating improvement suggestions..."
  ];

  // Cycle through loading steps if isLoading is true
  React.useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
        <div className="relative w-24 h-24 mb-10">
          <div className="absolute inset-0 rounded-full border-4 border-primary-500/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-t-4 border-primary-500 animate-spin"></div>
          <Sparkles className="absolute inset-0 m-auto text-primary-400 animate-bounce" size={32} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Analyzing Your Career...</h3>
        <p className="text-gray-400 animate-pulse flex items-center gap-2">
           <Loader2 size={16} className="animate-spin" /> {loadingSteps[loadingStep]}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Resume Audit</h1>
        <p className="text-gray-400 text-lg">Upload your resume and get an AI-powered ATS audit in seconds</p>
      </div>

      <div className="glass-panel p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* Upload Zone */}
          <div 
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 p-10 flex flex-col items-center justify-center cursor-pointer ${
              dragActive ? 'border-primary-500 bg-primary-500/10' : 'border-gray-700 hover:border-gray-500 bg-dark-900/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept=".pdf"
              onChange={handleFileChange}
            />
            
            {!file ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-gray-400 group-hover:text-primary-400" size={32} />
                </div>
                <p className="text-gray-200 font-bold text-lg mb-1">Drag & drop your resume PDF here</p>
                <p className="text-gray-500 text-sm">or click to browse (PDF only)</p>
              </>
            ) : (
              <div className="flex flex-col items-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="text-emerald-500" size={32} />
                </div>
                <p className="text-emerald-400 font-bold text-lg mb-1">{file.name}</p>
                <p className="text-gray-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
              </div>
            )}
          </div>

          {/* Job Description Textarea */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <FileText size={16} className="text-primary-400" /> Paste Job Description (optional)
              </label>
              <span className="text-[10px] uppercase tracking-widest text-gray-600 bg-dark-800 px-2 py-0.5 rounded">Better matching</span>
            </div>
            <textarea 
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the target JD here to see how well you match..."
              className="w-full h-32 bg-dark-950 border border-gray-800 rounded-xl p-4 text-gray-200 text-sm focus:outline-none focus:border-primary-500 transition-all resize-none placeholder:text-gray-700 shadow-inner"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={!file || isLoading}
            className={`w-full py-4 rounded-xl font-black text-lg transition-all transform hover:-translate-y-1 active:scale-95 shadow-lg flex items-center justify-center gap-3 ${
              !file || isLoading 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
              : 'bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 text-white border-b-4 border-indigo-800 shadow-indigo-500/20'
            }`}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Analyze Resume</>}
          </button>
        </form>
      </div>

      <div className="mt-8 flex items-center justify-center gap-6 text-gray-600 text-xs">
        <span className="flex items-center gap-1.5"><AlertCircle size={14} /> 100% Private & Secure</span>
        <span className="flex items-center gap-1.5"><Sparkles size={14} /> Powered by Advanced LLMs</span>
      </div>
    </div>
  );
};

export default ResumeAuditInput;

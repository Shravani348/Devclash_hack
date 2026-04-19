import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle, FileText, Sparkles, Loader2 } from 'lucide-react';

const loadingSteps = [
  "Extracting resume text...",
  "Running ATS compatibility checks...",
  "Analyzing skills and content...",
  "Generating improvement suggestions..."
];

const ResumeUploadInput = ({ onAnalyze, isAnalyzing }) => {
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % loadingSteps.length);
      }, 2500);
      return () => clearInterval(interval);
    } else {
      setLoadingStepIndex(0);
    }
  }, [isAnalyzing]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (uploadedFile) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (validTypes.includes(uploadedFile.type) || uploadedFile.name.endsWith('.pdf') || uploadedFile.name.endsWith('.docx')) {
      setFile(uploadedFile);
    } else {
      alert("Please upload a .pdf or .docx file");
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jd', jdText);
    onAnalyze(formData);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-bold text-white mb-3">Resume Audit</h2>
        <p className="text-gray-400">Upload your resume and get an AI-powered ATS audit in seconds</p>
      </div>

      <div className="space-y-6 relative z-10">
        {/* Upload Zone */}
        <div 
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
            isDragging ? 'border-primary-500 bg-primary-500/10' : 
            file ? 'border-emerald-500/50 bg-emerald-500/5' : 
            'border-gray-700 bg-[#0A0F1E] hover:border-gray-500 hover:bg-[#0A0F1E]/80'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: 'pointer' }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.docx"
          />
          
          {!file ? (
            <div className="flex flex-col items-center pointer-events-none">
              <UploadCloud size={48} className="text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-200 mb-2">Drag & drop your resume here</h3>
              <p className="text-sm text-gray-500">or click to browse (.pdf, .docx files only)</p>
            </div>
          ) : (
            <div className="flex flex-col items-center pointer-events-none">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                {file.name}
                <CheckCircle size={18} className="text-emerald-500" />
              </h3>
              <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="mt-4 text-xs text-rose-400 hover:underline"
              >
                Remove File
              </button>
            </div>
          )}
        </div>

        {/* Optional JD Input */}
        <div className="bg-[#0A0F1E] border border-gray-800 rounded-xl p-5 transition-all focus-within:border-gray-600">
          <label className="block text-sm font-medium text-gray-400 mb-3 flex justify-between items-center">
            <span>Paste Job Description (Optional)</span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">Boosts Match Accuracy</span>
          </label>
          <textarea 
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the job description here to see how well your resume matches..."
            className="w-full bg-transparent border-none outline-none text-gray-300 placeholder-gray-600 resize-none h-24 text-sm"
          />
        </div>

        {/* Submit Action */}
        {isAnalyzing ? (
          <div className="w-full py-4 px-6 bg-[#0A0F1E] border border-gray-800 rounded-xl flex items-center justify-between text-white shadow-inner">
            <div className="flex items-center gap-4">
              <Loader2 className="animate-spin text-blue-500" size={24} />
              <span className="font-medium animate-pulse">{loadingSteps[loadingStepIndex]}</span>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={!file}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              !file 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transform hover:-translate-y-1'
            }`}
          >
            <Sparkles size={20} />
            Analyze Resume
          </button>
        )}
      </div>
    </div>
  );
};

export default ResumeUploadInput;

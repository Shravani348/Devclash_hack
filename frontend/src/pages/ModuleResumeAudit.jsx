import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ResumeUploadInput from '../components/ResumeUploadInput';
import ResumeAuditReport from '../components/ResumeAuditReport';

const ModuleResumeAudit = () => {
  const [auditData, setAuditData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (formData) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/resume/audit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume. Check backend connection.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAuditData(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C18] font-sans relative overflow-x-hidden selection:bg-blue-500/30">
      <Navbar />

      {/* Decorative dark background lighting */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#111827] to-transparent pointer-events-none z-0"></div>

      <main className="relative z-10 w-full pt-10 px-6">
        {error && (
           <div className="max-w-3xl mx-auto bg-rose-500/10 border border-rose-500/50 text-rose-400 p-4 rounded-xl mb-6 text-center">
             {error}
           </div>
        )}

        {!auditData ? (
          <ResumeUploadInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        ) : (
          <ResumeAuditReport data={auditData} />
        )}
      </main>
    </div>
  );
};

export default ModuleResumeAudit;

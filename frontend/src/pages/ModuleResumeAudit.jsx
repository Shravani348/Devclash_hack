import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ResumeAuditInput from '../components/ResumeAuditInput';
import ResumeAuditResult from '../components/ResumeAuditResult';

const ModuleResumeAudit = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/resume/audit', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze resume');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C18] text-gray-100 selection:bg-primary-500/30">
      <Navbar />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      <main className="container mx-auto px-6 pt-10 pb-20 relative z-10">
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-center text-sm">
             ⚠️ {error}
          </div>
        )}

        {!data ? (
          <ResumeAuditInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        ) : (
          <ResumeAuditResult data={data} onReset={() => setData(null)} />
        )}
      </main>
    </div>
  );
};

export default ModuleResumeAudit;

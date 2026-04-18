import React, { useState } from 'react';
import InputPage from './components/InputPage';
import Dashboard from './components/Dashboard';
import AppAuditorInput from './components/AppAuditorInput';
import AppAuditorDashboard from './components/AppAuditorDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'audit'
  
  // Profile Analyzer State
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // App Auditor State
  const [auditData, setAuditData] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Profile Analyzer Handler
  const handleAnalyze = async (formData) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed. Is the Flask server running?');
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // App Auditor Handler
  const handleAudit = async (url) => {
    setIsAuditing(true);
    try {
      const response = await fetch('http://localhost:5000/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Audit failed. Is the Flask server running?');
      }

      const data = await response.json();
      setAuditData(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold gradient-text pb-2">Developer Career Intelligence System</h1>
        <p className="text-gray-400">Optimize your career profile and audit your live applications.</p>
      </header>
      
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 bg-dark-900 p-2 rounded-xl">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'profile' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white hover:bg-dark-800'}`}
        >
          Module 1: Profile Analyzer
        </button>
        <button 
          onClick={() => setActiveTab('audit')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'audit' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white hover:bg-dark-800'}`}
        >
          Module 2: Live App Audit
        </button>
      </div>

      <main className="w-full max-w-6xl">
        {activeTab === 'profile' && (
          !analysisData ? (
            <InputPage onAnalyze={handleAnalyze} isLoading={isLoading} />
          ) : (
            <Dashboard data={analysisData} onReset={() => setAnalysisData(null)} />
          )
        )}
        
        {activeTab === 'audit' && (
          !auditData ? (
             <AppAuditorInput onAudit={handleAudit} isAuditing={isAuditing} />
          ) : (
             <AppAuditorDashboard data={auditData} onReset={() => setAuditData(null)} />
          )
        )}
      </main>
    </div>
  );
}

export default App;

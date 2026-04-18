import React, { useState } from 'react';
import InputPage from './components/InputPage';
import Dashboard from './components/Dashboard';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (formData) => {
    setIsLoading(true);
    // Call the local Flask backend
    try {
      const response = await fetch('http://localhost:8000/api/github/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Analysis failed. Is the Flask server running?');
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

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold gradient-text pb-2">DevProfile Analyzer</h1>
        <p className="text-gray-400">Optimize your Resume and GitHub presence for top tech companies.</p>
      </header>

      <main className="w-full max-w-6xl">
        {!analysisData ? (
          <InputPage onAnalyze={handleAnalyze} isLoading={isLoading} />
        ) : (
          <Dashboard data={analysisData} onReset={() => setAnalysisData(null)} />
        )}
      </main>
    </div>
  );
}

export default App;

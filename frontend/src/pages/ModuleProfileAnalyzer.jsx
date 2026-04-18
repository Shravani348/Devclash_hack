import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import InputPage from '../components/InputPage';
import Dashboard from '../components/Dashboard';

const ModuleProfileAnalyzer = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (formData) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.error) {
        alert(result.error);
      } else {
        setData(result);
      }
    } catch (error) {
      console.error(error);
      alert('Analysis failed. Make sure backend is running on 5000.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 overflow-hidden font-sans relative selection:bg-primary-500/30">
      <Navbar />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[8000ms]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {!data ? (
          <InputPage onAnalyze={handleAnalyze} isLoading={isLoading} />
        ) : (
          <Dashboard data={data} onReset={() => setData(null)} />
        )}
      </div>
    </div>
  );
};

export default ModuleProfileAnalyzer;

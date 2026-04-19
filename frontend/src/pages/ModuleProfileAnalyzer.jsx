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
<<<<<<< HEAD
      const response = await fetch('http://localhost:8000/api/github/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
      alert(error.message || 'Analysis failed. Make sure Flask is running on 8000.');
=======
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
>>>>>>> origin/main
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] overflow-hidden font-sans relative selection:bg-blue-500/30">
      <Navbar />
      
      {/* Background Ambience tailored for Analysis */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/15 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-600/15 rounded-full blur-[100px] mix-blend-screen animate-pulse duration-[10000ms]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
      </div>

      <main className="container mx-auto px-6 py-12 relative z-10 animate-in fade-in duration-500">
        {!data ? (
          <InputPage onAnalyze={handleAnalyze} isLoading={isLoading} />
        ) : (
          <Dashboard data={data} onReset={() => setData(null)} />
        )}
      </main>
    </div>
  );
};

export default ModuleProfileAnalyzer;

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import AppAuditorInput from '../components/AppAuditorInput';
import AppAuditorDashboard from '../components/AppAuditorDashboard';

const ModuleAppAuditor = () => {
  const [data, setData] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleAudit = async (url) => {
    setIsAuditing(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const result = await response.json();
      if (result.error) {
        alert(result.error);
      } else {
        setData(result);
      }
    } catch (error) {
      console.error(error);
      alert('Audit failed. Make sure backend is running on 5000.');
    }
    setIsAuditing(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] overflow-hidden font-sans relative selection:bg-rose-500/30">
      <Navbar />
      
      {/* Background Ambience tailored for Audit */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[-10%] w-[35%] h-[35%] bg-rose-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10000ms]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[12000ms]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
      </div>

      <main className="container mx-auto px-6 py-12 relative z-10 animate-in fade-in duration-500">
        {!data ? (
          <AppAuditorInput onAudit={handleAudit} isAuditing={isAuditing} />
        ) : (
          <AppAuditorDashboard data={data} onReset={() => setData(null)} />
        )}
      </main>
    </div>
  );
};

export default ModuleAppAuditor;

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import AppAuditorInput from '../components/AppAuditorInput';
import AppAuditorDashboard from '../components/AppAuditorDashboard';
import ModuleCodeQuality from '../components/ModuleCodeQuality';
import { Globe, Shield, Terminal } from 'lucide-react';

const ModuleAppAuditor = () => {
  const [activeTab, setActiveTab] = useState('frontend'); // 'frontend' or 'backend'
  const [frontendData, setFrontendData] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleFrontendAudit = async (url) => {
    setIsAuditing(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const result = await response.json();
      if (result.error) {
        alert(result.error);
      } else {
        setFrontendData(result);
      }
    } catch (error) {
      console.error(error);
      alert('Audit failed. Make sure backend is running on 8000.');
    }
    setIsAuditing(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] overflow-x-hidden font-sans relative selection:bg-primary-500/30">
      <Navbar />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[-10%] w-[35%] h-[35%] bg-primary-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10000ms]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[12000ms]"></div>
      </div>

      <main className="container mx-auto px-6 pt-10 pb-20 relative z-10 animate-in fade-in duration-500">
        
        {/* TAB NAVIGATION */}
        <div className="max-w-md mx-auto mb-12">
           <div className="bg-dark-950/50 p-1.5 rounded-2xl border border-white/5 flex gap-2">
              <button 
                onClick={() => setActiveTab('frontend')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'frontend' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Globe size={14} /> Frontend
              </button>
              <button 
                onClick={() => setActiveTab('backend')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'backend' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Terminal size={14} /> Backend
              </button>
           </div>
        </div>

        {/* TAB CONTENT */}
        <div className="animate-in fade-in zoom-in-95 duration-500">
           {activeTab === 'frontend' ? (
              <div className="space-y-12">
                 <div className="text-center">
                    <h2 className="text-3xl font-black text-white mb-2">Live App Frontend Auditor</h2>
                    <p className="text-gray-400">Scan any live URL for SEO, performance, and accessibility patterns.</p>
                 </div>
                 {!frontendData ? (
                   <AppAuditorInput onAudit={handleFrontendAudit} isAuditing={isAuditing} />
                 ) : (
                   <AppAuditorDashboard data={frontendData} onReset={() => setFrontendData(null)} />
                 )}
              </div>
           ) : (
              <ModuleCodeQuality />
           )}
        </div>

      </main>
    </div>
  );
};

export default ModuleAppAuditor;

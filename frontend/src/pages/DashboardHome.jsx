import React from 'react';
import Navbar from '../components/Navbar';

const DashboardHome = () => {
  return (
    <div className="min-h-screen bg-[#0A0F1E] font-sans">
      <Navbar />
      
      {/* Blank Dashboard Canvas */}
      <main className="container mx-auto px-6 py-12 animate-in fade-in duration-500">
        <div className="text-center mt-20">
          <h1 className="text-3xl font-bold text-gray-400 opacity-50 mb-4">Dashboard Loading...</h1>
          <p className="text-gray-600">Select a module from the navigation above.</p>
        </div>
      </main>
    </div>
  );
};

export default DashboardHome;

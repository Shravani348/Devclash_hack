import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import DashboardHome from './pages/DashboardHome';
import ModuleProfileAnalyzer from './pages/ModuleProfileAnalyzer';
import ModuleAppAuditor from './pages/ModuleAppAuditor';
import LeetCodeAnalyzer from './components/LeetCodeAnalyzer';
import Navbar from './components/Navbar';

// Simple Auth Guard
const RequireAuth = ({ children }) => {
  const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />

        {/* Home Route renders the Horizontal Navbar & Blank Dashboard */}
        <Route 
          path="/home" 
          element={
            <RequireAuth>
              <DashboardHome />
            </RequireAuth>
          } 
        />

        {/* Module Routes */}
        <Route 
          path="/github-analysis" 
          element={
            <RequireAuth>
              <ModuleProfileAnalyzer />
            </RequireAuth>
          } 
        />
        
        <Route 
          path="/leetcode-analysis" 
          element={
            <RequireAuth>
              <div className="min-h-screen bg-[#0A0F1E]">
                <Navbar />
                <div className="py-10">
                  <LeetCodeAnalyzer />
                </div>
              </div>
            </RequireAuth>
          } 
        />

        <Route 
          path="/live-app-audit" 
          element={
            <RequireAuth>
              <ModuleAppAuditor />
            </RequireAuth>
          } 
        />
        
        {/* Placeholder redirect for anything else */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
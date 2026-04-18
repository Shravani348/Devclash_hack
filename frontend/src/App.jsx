import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ModuleProfileAnalyzer from './pages/ModuleProfileAnalyzer';
import ModuleAppAuditor from './pages/ModuleAppAuditor';

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
          path="/live-app-audit" 
          element={
            <RequireAuth>
              <ModuleAppAuditor />
            </RequireAuth>
          } 
        />

        {/* Home redirects to first module */}
        <Route path="/home" element={<Navigate to="/github-analysis" />} />
        
        {/* Placeholder redirect for anything else */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

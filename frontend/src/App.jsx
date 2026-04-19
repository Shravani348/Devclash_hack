import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import DashboardHome from './pages/DashboardHome';
import ModuleAppAuditor from './pages/ModuleAppAuditor';
import ModuleLeetCode from './pages/ModuleLeetCode';
import ModuleProfileAnalyzer from './pages/ModuleProfileAnalyzer';
import ModuleResumeAudit from './pages/ModuleResumeAudit';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/app-auditor" element={<ModuleAppAuditor />} />
        <Route path="/leetcode" element={<ModuleLeetCode />} />
        <Route path="/profile-analyzer" element={<ModuleProfileAnalyzer />} />
        <Route path="/resume-audit" element={<ModuleResumeAudit />} />
      </Routes>
    </Router>
  );
}

export default App;
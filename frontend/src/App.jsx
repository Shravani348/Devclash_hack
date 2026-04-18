import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import DashboardHome from './pages/DashboardHome';

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
        <Route 
          path="/home" 
          element={
            <RequireAuth>
              <DashboardHome />
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

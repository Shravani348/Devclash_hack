import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Github, Brain, LayoutDashboard } from "lucide-react";
import InputPage from "./components/InputPage";
import Dashboard from "./components/Dashboard";
import LeetCodeAnalyzer from "./components/LeetCodeAnalyzer";

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (formData) => {
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const response = await fetch("http://localhost:8000/api/github/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Analysis failed. Is the Flask server running?");
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setError(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-dark-950 text-gray-100">
        {/* Navigation Navbar */}
        <nav className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="text-primary-400" size={24} />
                <span className="font-bold text-xl tracking-tight">DevClash <span className="text-primary-400">AI</span></span>
              </div>
              <div className="flex gap-6">
                <Link to="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary-400 transition-colors">
                  <Github size={18} /> GitHub
                </Link>
                <Link to="/leetcode" className="flex items-center gap-2 text-sm font-medium hover:text-primary-400 transition-colors">
                  <Brain size={18} /> LeetCode
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={
              <div className="space-y-6">
                {error && (
                  <div className="max-w-2xl mx-auto p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm text-center">
                    ⚠️ {error}
                  </div>
                )}
                
                {!analysisData ? (
                  <InputPage onAnalyze={handleAnalyze} isLoading={isLoading} />
                ) : (
                  <Dashboard data={analysisData} onReset={handleReset} />
                )}
              </div>
            } />
            
            <Route path="/leetcode" element={<LeetCodeAnalyzer />} />
          </Routes>
        </main>
        
        <footer className="py-10 text-center text-gray-500 text-xs border-t border-dark-800 mt-20">
          Built with ❤️ for DevClash Hackathon
        </footer>
      </div>
    </Router>
  );
}

export default App;
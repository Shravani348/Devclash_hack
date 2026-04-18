import React from 'react';
import Navbar from '../components/Navbar';
import ProfileCard from '../components/dashboard/ProfileCard';
import ScoreBreakdown from '../components/dashboard/ScoreBreakdown';
import InsightsGrid from '../components/dashboard/InsightsGrid';
import JobMatches from '../components/dashboard/JobMatches';
import RoadmapTimeline from '../components/dashboard/RoadmapTimeline';
import LanguageBar from '../components/dashboard/LanguageBar';
import { developerData } from '../data/mockData';

const DashboardHome = () => {
  return (
    <div className="min-h-screen bg-dark-900 bg-dot-pattern">
      <Navbar />
      
      <main className="container mx-auto px-6 py-8 pb-20 animate-in fade-in duration-500">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Developer Intelligence Dashboard</h1>
          <p className="text-gray-400">Comprehensive analysis of your career metrics, codebase quality, and growth roadmap.</p>
        </header>

        <div className="flex flex-col gap-6">
          {/* Top Row: Profile */}
          <ProfileCard 
            name={developerData.name} 
            github={developerData.github} 
            skillLevel={developerData.skillLevel} 
            overallScore={developerData.overallScore} 
            percentile={developerData.percentile} 
          />
          
          {/* Second Row: Language Bar */}
          <LanguageBar languages={developerData.languages} />

          {/* Third Row: Scores & Job Matches */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 border border-dark-700/50 rounded-2xl relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-primary-500/5 pointer-events-none"></div>
              <ScoreBreakdown scores={developerData.scores} />
            </div>
            
            <div className="lg:col-span-2">
              <JobMatches matches={developerData.jobMatches} />
            </div>
          </div>

          {/* Fourth Row: Insights */}
          <InsightsGrid strengths={developerData.strengths} weaknesses={developerData.weaknesses} />

          {/* Fifth Row: Roadmap */}
          <RoadmapTimeline roadmap={developerData.roadmap} />
        </div>
      </main>
    </div>
  );
};

export default DashboardHome;

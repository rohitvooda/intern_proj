'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Header from '@/components/Header';
import AITutorPanel from '@/components/AITutorPanel';
import { 
  Compass, Activity, Cpu, Sparkles, BookOpen, 
  Award, Calendar, Heart, GraduationCap, ChevronRight, Zap, Target, BookMarked
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { token, user, dashboard, fetchDashboard, apiBaseUrl } = useStore();
  const [mounted, setMounted] = useState(false);
  
  // AI States
  const [learningPath, setLearningPath] = useState<string>('');
  const [loadingPath, setLoadingPath] = useState(false);
  const [weaknessReport, setWeaknessReport] = useState<any>(null);
  const [loadingWeakness, setLoadingWeakness] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('scienceverse_token');
      if (!storedToken) {
        router.push('/');
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchDashboard();
      fetchAIPath();
      fetchWeaknesses();
    }
  }, [token]);

  const fetchAIPath = async () => {
    setLoadingPath(true);
    try {
      const res = await fetch(`${apiBaseUrl}/ai/path`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLearningPath(data.personalized_path);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPath(false);
    }
  };

  const fetchWeaknesses = async () => {
    setLoadingWeakness(true);
    try {
      const res = await fetch(`${apiBaseUrl}/ai/weaknesses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setWeaknessReport(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWeakness(false);
    }
  };

  if (!mounted || !user) return null;

  return (
    <div className="min-h-screen flex flex-col relative pb-12">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Banner Welcome */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1">
            <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-white">
              Welcome back, {user.username}!
            </h2>
            <p className="text-sm text-cyan-400 font-mono tracking-wide">
              LEVEL {user.level} SCIENCE ADVENTURER • {user.xp} XP
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5">
            <div className="text-center">
              <span className="text-[10px] text-gray-400 block font-mono">STREAK</span>
              <span className="text-lg font-bold text-orange-400">🔥 {user.streak} Days</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] text-gray-400 block font-mono">AVG SCORE</span>
              <span className="text-lg font-bold text-green-400">
                {dashboard ? `${Math.round(dashboard.average_quiz_score)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="space-y-4">
          <h3 className="font-space font-bold text-lg text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-violet-400" />
            Active Learning Modules
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cell Explorer */}
            <div 
              onClick={() => router.push('/cell-explorer')}
              className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col justify-between h-56 cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <Compass className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="font-space font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">
                  Biology Cell Explorer
                </h4>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                  Interact with a 3D Eukaryotic Cell. Study the organelles, launch AI explanations, and test your knowledge.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold pt-4">
                <span>Enter Lab</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Physics Lab */}
            <div 
              onClick={() => router.push('/physics-lab')}
              className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col justify-between h-56 cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
                <h4 className="font-space font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                  Physics Lab Simulation
                </h4>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                  Simulate gravity, velocity, mass, and launch angles. Render real-time graphs and chat with our physics tutor.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold pt-4">
                <span>Open Simulator</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Data Structure Visualizer */}
            <div 
              onClick={() => router.push('/ds-visualizer')}
              className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col justify-between h-56 cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/15 transition-all" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mb-4">
                  <Cpu className="w-6 h-6 text-violet-400" />
                </div>
                <h4 className="font-space font-bold text-lg text-white group-hover:text-violet-300 transition-colors">
                  DS & Algorithm Visualizer
                </h4>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                  Animate Arrays, Stacks, Queues, Linked Lists, and Binary Search Trees. Step through operations like insertion and traversal.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-violet-400 font-semibold pt-4">
                <span>Start Coding</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>

        {/* AI Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* AI Path */}
          <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-space font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                AI Personalized Learning Path
              </h3>
              <button 
                onClick={fetchAIPath}
                className="text-xs text-violet-400 hover:text-white transition-all cursor-pointer font-semibold"
              >
                Regenerate Path
              </button>
            </div>

            {loadingPath ? (
              <div className="space-y-3">
                <div className="h-4 bg-white/5 rounded-md w-3/4 animate-pulse" />
                <div className="h-4 bg-white/5 rounded-md w-5/6 animate-pulse" />
                <div className="h-4 bg-white/5 rounded-md w-2/3 animate-pulse" />
                <div className="h-4 bg-white/5 rounded-md w-full animate-pulse" />
              </div>
            ) : (
              <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed border border-white/5 bg-white/5 p-4 rounded-2xl max-h-80 overflow-y-auto">
                {learningPath || "Let your AI academic advisor structure a customized educational timeline based on your achievements."}
              </div>
            )}
          </div>

          {/* AI Weakness & Revision Notes */}
          <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-space font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                AI Weakness & Revision Notes
              </h3>
              <button 
                onClick={fetchWeaknesses}
                className="text-xs text-cyan-400 hover:text-white transition-all cursor-pointer font-semibold"
              >
                Analyze Attempts
              </button>
            </div>

            {loadingWeakness ? (
              <div className="space-y-3">
                <div className="h-4 bg-white/5 rounded-md w-5/6 animate-pulse" />
                <div className="h-4 bg-white/5 rounded-md w-full animate-pulse" />
                <div className="h-4 bg-white/5 rounded-md w-3/4 animate-pulse" />
              </div>
            ) : weaknessReport ? (
              <div className="space-y-4">
                <div className="border border-red-500/20 bg-red-950/20 p-3 rounded-2xl">
                  <span className="text-xs font-bold text-red-400 block mb-1">Identified Areas of Improvement:</span>
                  <ul className="list-disc pl-4 space-y-1">
                    {weaknessReport.weaknesses?.map((w: string, i: number) => (
                      <li key={i} className="text-xs text-gray-300">{w}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="border border-white/5 bg-white/5 p-3 rounded-2xl max-h-48 overflow-y-auto">
                  <span className="text-xs font-bold text-cyan-400 block mb-1 flex items-center gap-1">
                    <BookMarked className="w-3.5 h-3.5" />
                    AI Flashcards & Revision Guide:
                  </span>
                  <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">
                    {weaknessReport.revision_notes}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-300 text-center py-8">
                Take a module quiz to activate automatic performance reports, strengths & weaknesses analysis, and customized flashcards.
              </div>
            )}
          </div>

        </div>

        {/* Achievements / Badges Panel */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <h3 className="font-space font-bold text-white flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-400" />
            Gamification Achievements & Badges
          </h3>

          {dashboard && dashboard.badges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {dashboard.badges.map((b, idx) => (
                <div 
                  key={idx}
                  className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center relative overflow-hidden"
                >
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 glow-purple">
                    <Award className="w-7 h-7 text-amber-400" />
                  </div>
                  <h4 className="font-space font-bold text-sm text-white">{b.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-[120px]">{b.description}</p>
                  <span className="text-[9px] text-cyan-400 font-mono mt-2 block">+{b.xp_reward} XP</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-300 text-center py-6">
              Unlock accomplishments like "Biology Genius" or "Physics Master" by scoring 60%+ on the module quizzes!
            </div>
          )}
        </div>

      </main>

      <AITutorPanel />
    </div>
  );
}

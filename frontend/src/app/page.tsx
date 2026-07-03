'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Compass, Activity, Cpu, Sparkles, Brain, Shield, UserPlus, LogIn, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { setToken, setUser, token } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, skip to dashboard
    if (token) {
      router.push('/dashboard');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isLogin
      ? 'http://127.0.0.1:8000/api/v1/auth/login'
      : 'http://127.0.0.1:8000/api/v1/auth/register';

    const bodyObj = isLogin
      ? { username, password }
      : { username, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyObj),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Something went wrong');
      }

      setToken(data.access_token);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Connection failed. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Hand side: Brand Presentation */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          
          <h1 className="font-space font-extrabold text-5xl sm:text-6xl md:text-7xl leading-tight text-white tracking-tight">
            SCIENCEVERSE
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="glass-card p-4 rounded-2xl flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="p-3 rounded-xl bg-violet-600/20 border border-violet-500/30 mb-2">
                <Compass className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="font-space font-bold text-sm text-white">Biology Cell</h3>
              <p className="text-xs text-gray-400 mt-1">Interactive 3D organelle explorer and quiz.</p>
            </div>
            
            <div className="glass-card p-4 rounded-2xl flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="p-3 rounded-xl bg-cyan-600/20 border border-cyan-500/30 mb-2">
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="font-space font-bold text-sm text-white">Physics Lab</h3>
              <p className="text-xs text-gray-400 mt-1">Real-time simulation variables and graphs.</p>
            </div>

            <div className="glass-card p-4 rounded-2xl flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 mb-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-space font-bold text-sm text-white">DS Visualizer</h3>
              <p className="text-xs text-gray-400 mt-1">Step-by-step algorithms & tree animation.</p>
            </div>
          </div>
        </div>

        {/* Right Hand side: Auth Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="glass-panel-heavy p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">


            <div className="text-center mb-6">
              <h2 className="font-space font-bold text-2xl text-white">
                {isLogin ? 'Welcome Back!' : 'Join ScienceVerse'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {isLogin ? 'Sign in to access your learning dashboard' : 'Create an account to begin tracking progress'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input placeholder-gray-600"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input placeholder-gray-600"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input placeholder-gray-600"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 text-xs text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-700/20 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 glow-purple flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {isLogin ? 'Sign In' : 'Sign Up'}
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-white/5 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                {isLogin ? "Don't have an account? Sign Up" : 'Already registered? Sign In'}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

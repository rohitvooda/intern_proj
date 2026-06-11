'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Compass, BookOpen, BarChart2, Award, LogOut, Cpu, Zap, Activity } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout, fetchDashboard, dashboard } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (token) {
      fetchDashboard();
    }
  }, [token]);

  if (!mounted) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart2 },
    { name: 'Cell Explorer', path: '/cell-explorer', icon: Compass },
    { name: 'Physics Lab', path: '/physics-lab', icon: Activity },
    { name: 'DS Visualizer', path: '/ds-visualizer', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href={token ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center glow-purple">
            <span className="font-space font-extrabold text-xl text-white">S</span>
          </div>
          <div>
            <h1 className="font-space font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-[#d1d5db] to-violet-400 bg-clip-text text-transparent">
              SCIENCEVERSE
            </h1>
            <span className="text-[10px] text-cyan-400 font-mono tracking-widest block -mt-1">
              AI LEARNING PLATFORM
            </span>
          </div>
        </Link>

        {token && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/10 shadow-inner'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {token && user ? (
        <div className="flex items-center gap-4">
          {/* Gamification status */}
          <div className="hidden sm:flex items-center gap-3 glass-card px-4 py-1.5 rounded-2xl border border-white/5 text-sm">
            <div className="flex items-center gap-1 text-violet-400 font-bold">
              <Award className="w-4 h-4" />
              <span>Lvl {user.level}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-1 text-cyan-400 font-mono">
              <Zap className="w-4 h-4" />
              <span>{user.xp} XP</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="text-amber-400 font-bold flex items-center gap-1">
              <span>🔥 {user.streak} days</span>
            </div>
          </div>

          {/* User Profile + Logout */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-200 hidden lg:inline">
              {user.username}
            </span>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <Link
          href="/"
          className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 glow-purple"
        >
          Sign In
        </Link>
      )}
    </header>
  );
}

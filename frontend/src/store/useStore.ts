import { create } from 'zustand';

interface User {
  id: number;
  username: string;
  email: string;
  level: number;
  xp: number;
  streak: number;
  last_active: string;
}

interface Badge {
  name: string;
  description: string;
  badge_code: string;
  xp_reward: number;
  unlocked_at: string;
}

interface DashboardData {
  user: User;
  completed_lessons_count: number;
  total_lessons_count: number;
  progress_percentage: number;
  streak: number;
  xp: number;
  level: number;
  badges: Badge[];
  quiz_attempts_count: number;
  average_quiz_score: number;
  leaderboard_rank: number;
}

interface StoreState {
  token: string | null;
  user: User | null;
  dashboard: DashboardData | null;
  leaderboard: any[];
  currentCourseCode: string | null;
  isSpeechEnabled: boolean;
  isListening: boolean;
  voiceText: string;
  apiBaseUrl: string;
  
  // Actions
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setSpeechEnabled: (enabled: boolean) => void;
  setListening: (listening: boolean) => void;
  setVoiceText: (text: string) => void;
  setCourse: (code: string | null) => void;
  
  // API requests
  fetchDashboard: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  logout: () => void;
}

export const useStore = create<StoreState>((set, get) => {
  // Safe window/localStorage access check
  const getInitialToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('scienceverse_token') || null;
    }
    return null;
  };

  const getInitialUser = () => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('scienceverse_user');
      return u ? JSON.parse(u) : null;
    }
    return null;
  };

  return {
    token: getInitialToken(),
    user: getInitialUser(),
    dashboard: null,
    leaderboard: [],
    currentCourseCode: null,
    isSpeechEnabled: true,
    isListening: false,
    voiceText: '',
    apiBaseUrl: 'http://127.0.0.1:8000/api/v1',

    setToken: (token) => {
      if (token) {
        localStorage.setItem('scienceverse_token', token);
      } else {
        localStorage.removeItem('scienceverse_token');
      }
      set({ token });
    },

    setUser: (user) => {
      if (user) {
        localStorage.setItem('scienceverse_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('scienceverse_user');
      }
      set({ user });
    },

    setSpeechEnabled: (isSpeechEnabled) => set({ isSpeechEnabled }),
    setListening: (isListening) => set({ isListening }),
    setVoiceText: (voiceText) => set({ voiceText }),
    setCourse: (currentCourseCode) => set({ currentCourseCode }),

    fetchDashboard: async () => {
      const { token, apiBaseUrl } = get();
      if (!token) return;

      try {
        const res = await fetch(`${apiBaseUrl}/progress/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          set({ dashboard: data, user: data.user });
          localStorage.setItem('scienceverse_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      }
    },

    fetchLeaderboard: async () => {
      const { apiBaseUrl } = get();
      try {
        const res = await fetch(`${apiBaseUrl}/progress/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          set({ leaderboard: data });
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      }
    },

    logout: () => {
      localStorage.removeItem('scienceverse_token');
      localStorage.removeItem('scienceverse_user');
      set({ token: null, user: null, dashboard: null });
    }
  };
});

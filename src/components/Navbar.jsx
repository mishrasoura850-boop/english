import React from 'react';
import { 
  Mic, 
  Flame, 
  BookOpen, 
  History, 
  Sparkles, 
  User, 
  LogIn, 
  LogOut, 
  Database,
  Compass,
  CheckCircle
} from 'lucide-react';
import { formatStreakBadge } from '../lib/streakService';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  user, 
  userProfile, 
  streakData, 
  onOpenAuth, 
  onSignOut,
  onOpenProfile,
  onOpenDbGuide,
  onStartNewPractice
}) {
  const streakBadge = formatStreakBadge(streakData?.current_streak || 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-700 bg-clip-text text-transparent">
                SpeakCheck
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                AI Coach
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={onStartNewPractice}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'practice' 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Mic className="w-4 h-4 text-emerald-600" />
              Practice
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'history' 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>

            <button
              onClick={() => setActiveTab('topics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'topics' 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              Topics
            </button>
          </nav>

          {/* Right Actions: Streak & User Auth */}
          <div className="flex items-center gap-3">
            
            {/* Streak Counter Badge */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 shadow-sm cursor-pointer hover:bg-amber-100 transition-colors"
              title={`${streakData?.current_streak || 0} day speaking streak!`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Flame className={`w-4 h-4 text-amber-500 ${(streakData?.current_streak || 0) > 0 ? 'animate-bounce' : ''}`} />
              <span className="text-xs font-bold">{streakData?.current_streak || 0}</span>
              <span className="hidden sm:inline text-xs font-medium text-amber-700">day streak</span>
            </div>

            {/* Supabase Schema Guide Button */}
            <button
              onClick={onOpenDbGuide}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Supabase Database Status & SQL Setup"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supabase DB</span>
            </button>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    {(userProfile?.display_name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {userProfile?.display_name || user.email?.split('@')[0]}
                  </span>
                </button>
                <button
                  onClick={onSignOut}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 bg-white">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs ${
            activeTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Dashboard
        </button>

        <button
          onClick={onStartNewPractice}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs ${
            activeTab === 'practice' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Mic className="w-4 h-4 text-emerald-600" />
          Practice
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs ${
            activeTab === 'history' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <History className="w-4 h-4" />
          History
        </button>

        <button
          onClick={() => setActiveTab('topics')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs ${
            activeTab === 'topics' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Compass className="w-4 h-4" />
          Topics
        </button>
      </div>
    </header>
  );
}


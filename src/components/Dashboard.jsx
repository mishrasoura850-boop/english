import React from 'react';
import { 
  Mic, 
  Flame, 
  Trophy, 
  Sparkles, 
  Compass, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  History, 
  Clock, 
  TrendingUp,
  Volume2,
  BookOpen
} from 'lucide-react';
import StreakHeatmap from './StreakHeatmap';

export default function Dashboard({ 
  todayTopic, 
  streakData, 
  recentSessions = [], 
  userProfile, 
  onStartPractice, 
  onOpenTopics, 
  onSelectPastSession,
  onOpenAuth,
  user
}) {
  // Compute average score
  const avgScore = recentSessions.length > 0 
    ? (recentSessions.reduce((acc, s) => acc + Number(s.score || 0), 0) / recentSessions.length).toFixed(1)
    : '0.0';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* Welcome & Motivational Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-10 overflow-hidden shadow-xl">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI English Speaking Coach</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Master Spoken English with Real Teacher Corrections ✍️
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Pick a topic, speak into the mic, and get your notebook checked with red-pen corrections, simple explanations, and a score out of 10.
            </p>

            {!user && (
              <p className="text-xs text-emerald-400 font-medium pt-1">
                Tip:{' '}
                <button onClick={onOpenAuth} className="underline font-bold hover:text-emerald-300">
                  Log in or sign up free
                </button>{' '}
                to permanently sync your streaks & notebook history to Supabase!
              </p>
            )}
          </div>

          {/* Quick Action Button */}
          <div className="flex-shrink-0">
            <button
              onClick={onStartPractice}
              className="w-full sm:w-auto px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 flex items-center justify-center gap-3"
            >
              <Mic className="w-5 h-5 text-slate-950" />
              <span>Start Today's Practice</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>

      {/* Key Metrics 4-Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Current Streak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Streak</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{streakData?.current_streak || 0}</span>
            <span className="text-xs font-semibold text-amber-700">Days Active 🔥</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Speak daily to keep it blazing</p>
        </div>

        {/* Longest Streak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Best Streak</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{streakData?.longest_streak || 0}</span>
            <span className="text-xs font-semibold text-emerald-700">Days Record</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Your all-time milestone</p>
        </div>

        {/* Total Sessions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Practice</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Mic className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{streakData?.total_sessions || recentSessions.length}</span>
            <span className="text-xs font-semibold text-blue-700">Sessions</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Speaking exercises completed</p>
        </div>

        {/* Average English Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Score</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{avgScore}</span>
            <span className="text-xs font-semibold text-purple-700">/ 10.0</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Overall speaking quality</p>
        </div>

      </div>

      {/* GitHub-Style Attendance Heatmap Section */}
      <StreakHeatmap streakData={streakData} />

      {/* Two Column Layout: Today's Spotlight Topic & Recent Practice Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Topic Card (1 Col) */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 rounded-2xl p-6 border border-emerald-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                Today's Topic
              </span>
              <span className="text-xs font-semibold text-emerald-800">
                {todayTopic?.category || 'Daily Life'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {todayTopic?.title || 'Describe your daily routine'}
            </h3>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {todayTopic?.description || 'Share your morning habits and evening relaxation.'}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={onStartPractice}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>Practice This Topic</span>
            </button>

            <button
              onClick={onOpenTopics}
              className="w-full py-2 px-4 border border-emerald-300 hover:bg-emerald-100/50 text-emerald-800 font-semibold text-xs rounded-xl transition-colors text-center"
            >
              Browse 100+ Topics
            </button>
          </div>
        </div>

        {/* Recent Practice Sessions List (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <span>Recent Practice Sessions</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {recentSessions.length} recorded
            </span>
          </div>

          {recentSessions.length === 0 ? (
            <div className="text-center py-10 px-4">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No practice sessions yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Press "Start Today's Practice" to speak into your microphone and generate your first Teacher Notebook review!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.slice(0, 4).map((session, idx) => (
                <div
                  key={session.id || idx}
                  onClick={() => onSelectPastSession(session)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/70 transition-all cursor-pointer group"
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                        {session.topic_title || 'Speaking Exercise'}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex-shrink-0">
                        {session.category || 'General'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate max-w-md italic">
                      "{session.original_transcript}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-700">
                        {Number(session.score || 0).toFixed(1)} <span className="text-[10px] text-slate-400">/ 10</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <span className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-800 text-slate-500 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}


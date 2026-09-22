import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  BookOpen, 
  ArrowRight, 
  Calendar, 
  Award, 
  Volume2, 
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function PracticeHistory({ 
  sessions = [], 
  onSelectSession, 
  onStartNewPractice 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');

  const categories = ['All', 'Daily Life', 'Entertainment', 'Career', 'Travel', 'Technology', 'Philosophy'];

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = 
      (s.topic_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.original_transcript || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.feedback_remarks || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'All' || 
      (s.category || '').toLowerCase() === selectedCategory.toLowerCase();

    let matchesScore = true;
    const sc = Number(s.score || 0);
    if (scoreFilter === 'high') matchesScore = sc >= 8.0;
    else if (scoreFilter === 'medium') matchesScore = sc >= 6.0 && sc < 8.0;
    else if (scoreFilter === 'low') matchesScore = sc < 6.0;

    return matchesSearch && matchesCategory && matchesScore;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <span>Practice History & Notebook Archive</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review past speaking exercises, teacher red-pen notes, and score improvements.
          </p>
        </div>

        <button
          onClick={onStartNewPractice}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Practice Session</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search topics or words you spoke..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Score filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
            >
              <option value="All">All Scores</option>
              <option value="high">High Scores (8.0 - 10.0)</option>
              <option value="medium">Good Scores (6.0 - 7.9)</option>
              <option value="low">Needs Improvement (&lt; 6.0)</option>
            </select>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* History Items List */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No practice sessions found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {sessions.length === 0 
              ? "You haven't practiced any speaking topics yet. Start your first session today!"
              : "Try adjusting your search or category filters to find older sessions."}
          </p>
          <button
            onClick={onStartNewPractice}
            className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Start Practice Now
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredSessions.map((session, index) => (
            <div
              key={session.id || index}
              onClick={() => onSelectSession(session)}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {session.category || 'General'}
                    </span>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {session.topic_title || 'Speaking Topic'}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(session.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 italic">
                    "{session.original_transcript}"
                  </p>

                  {session.mistakes && session.mistakes.length > 0 ? (
                    <div className="text-[11px] text-red-600 font-semibold flex items-center gap-1 pt-1">
                      <span>✍️ {session.mistakes.length} teacher correction{session.mistakes.length > 1 ? 's' : ''} made</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-1">
                      <span>🌟 Flawless speaking (0 mistakes)</span>
                    </div>
                  )}
                </div>

                {/* Score & Review Button */}
                <div className="flex items-center gap-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-700">
                      {Number(session.score || 0).toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 10</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase text-slate-500">
                      {session.feedback_category || 'Graded'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 text-xs font-bold transition-colors">
                    <span>Notebook</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}


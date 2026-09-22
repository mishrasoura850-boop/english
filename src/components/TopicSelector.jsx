import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  Shuffle, 
  Sparkles, 
  Lightbulb, 
  ArrowRight, 
  Check, 
  X,
  Layers
} from 'lucide-react';
import { SPEAKING_TOPICS, getRandomTopic } from '../lib/topicsData';

export default function TopicSelector({ 
  isOpen, 
  onClose, 
  onSelectTopic, 
  currentTopicId 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const categories = ['All', 'Daily Life', 'Entertainment', 'Career', 'Travel', 'Technology', 'Philosophy'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredTopics = SPEAKING_TOPICS.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'All' || t.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesDiff = 
      selectedDifficulty === 'All' || t.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    return matchesSearch && matchesCategory && matchesDiff;
  });

  const handleShuffle = () => {
    const random = getRandomTopic(currentTopicId);
    onSelectTopic(random);
    if (onClose) onClose();
  };

  const handleSelect = (topic) => {
    onSelectTopic(topic);
    if (onClose) onClose();
  };

  const content = (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600" />
            <span>Speaking Topics Library</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose from 100+ engaging speaking topics across different life & career themes.
          </p>
        </div>

        <button
          onClick={handleShuffle}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <Shuffle className="w-4 h-4" />
          <span>Surprise Me (Shuffle)</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search topics (e.g. routine, interview, trip)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
            >
              {difficulties.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d}</option>
              ))}
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

      {/* Topic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map((topic) => {
          const isCurrent = topic.id === currentTopicId;
          return (
            <div
              key={topic.id}
              onClick={() => handleSelect(topic)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isCurrent 
                  ? 'bg-emerald-50/60 border-emerald-400 shadow-md ring-1 ring-emerald-400' 
                  : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {topic.category}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {topic.difficulty}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                  {topic.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {topic.description}
                </p>

                {topic.hints && (
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-600" />
                      <span>{topic.hints[0]}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:underline">
                  <span>{isCurrent ? 'Current Topic' : 'Select Topic'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                {isCurrent && (
                  <span className="p-1 rounded-full bg-emerald-600 text-white">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );

  // If opened as a modal
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {content}
        </div>
      </div>
    );
  }

  // Standalone page view
  return (
    <div className="max-w-5xl mx-auto animate-fadeIn pb-16">
      {content}
    </div>
  );
}


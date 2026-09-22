import React, { useState } from 'react';
import { 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  Share2, 
  BookOpen, 
  Lightbulb, 
  Layers, 
  Award,
  HelpCircle,
  VolumeX,
  Copy,
  Check
} from 'lucide-react';
import { speakText, stopSpeaking } from '../lib/speechService';
import confetti from 'canvas-confetti';

export default function TeacherNotebook({ 
  sessionResult, 
  topic, 
  onPracticeAgain, 
  onNewTopic 
}) {
  const [activeMistakeIndex, setActiveMistakeIndex] = useState(null);
  const [viewMode, setViewMode] = useState('notebook'); // 'notebook' or 'clean'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Trigger celebration confetti if score is Good or above
  React.useEffect(() => {
    if (sessionResult?.score >= 7.0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }
  }, [sessionResult]);

  if (!sessionResult) return null;

  const {
    score = 8.0,
    feedback_category = 'Good',
    feedback_remarks = '',
    grammar_score = 8.0,
    vocabulary_score = 8.0,
    clarity_score = 8.5,
    original_transcript = '',
    corrected_transcript = '',
    mistakes = [],
    better_phrasings = [],
    teacher_note = ''
  } = sessionResult;

  const handleSpeak = (text) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(text);
      // Reset speaking state after estimated duration
      const duration = Math.max(2000, text.split(' ').length * 400);
      setTimeout(() => setIsSpeaking(false), duration);
    }
  };

  const handleCopyCorrection = () => {
    navigator.clipboard.writeText(corrected_transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (sc) => {
    if (sc >= 8.5) return 'text-emerald-700 border-emerald-600 bg-emerald-50';
    if (sc >= 7.0) return 'text-blue-700 border-blue-600 bg-blue-50';
    if (sc >= 5.5) return 'text-amber-700 border-amber-600 bg-amber-50';
    return 'text-red-700 border-red-600 bg-red-50';
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Excellent':
        return { color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '🌟' };
      case 'Very Good':
        return { color: 'bg-teal-100 text-teal-800 border-teal-300', icon: '⭐' };
      case 'Good':
        return { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '👍' };
      case 'Bad':
        return { color: 'bg-amber-100 text-amber-800 border-amber-300', icon: '⚠️' };
      default:
        return { color: 'bg-red-100 text-red-800 border-red-300', icon: '📝' };
    }
  };

  const badge = getCategoryBadge(feedback_category);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* Top Action Bar & Score Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Practice Result</span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{topic?.title || 'Speaking Practice Session'}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setViewMode('notebook')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'notebook' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📖 Teacher Notebook
            </button>
            <button
              onClick={() => setViewMode('clean')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'clean' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📋 Modern Card
            </button>
          </div>

          <button
            onClick={onPracticeAgain}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Again</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TEACHER NOTEBOOK INTERFACE */}
      {/* ==================================================================== */}
      {viewMode === 'notebook' ? (
        <div className="relative bg-[#fffef9] rounded-2xl border border-amber-200/80 shadow-notebook-deep overflow-hidden">
          
          {/* Top Spiral Wire Holes Header */}
          <div className="h-9 bg-[#f4ebd0]/70 border-b border-amber-200/80 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />
              <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />
              <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />
              <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />
              <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />
            </div>
            <div className="font-notebook text-xs text-amber-900/60 font-semibold tracking-wide">
              ENGLISH PRACTICE NOTEBOOK • PAGE #{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>

          {/* Lined Notebook Paper Body */}
          <div className="notebook-paper p-6 sm:p-10 relative min-h-[460px]">
            
            {/* Red Teacher Rubber Stamp in Top-Right Corner */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-10">
              <div className="teacher-stamp px-4 py-2 bg-red-50/90 border-2 border-red-600 rounded-lg shadow-teacher-stamp rotate-[-4deg] hover:rotate-0 transition-transform">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-black text-red-600 leading-none">
                    {score.toFixed(1)} / 10
                  </div>
                  <div className="text-[11px] font-bold text-red-700 tracking-wider mt-0.5">
                    {feedback_category.toUpperCase()}!
                  </div>
                </div>
              </div>
            </div>

            {/* Notebook Margin Area & Topic Header */}
            <div className="pl-14 sm:pl-20 mb-6">
              <div className="font-handwriting text-slate-500 text-sm">
                Topic: <span className="font-bold text-slate-800 underline decoration-amber-300 decoration-2">{topic?.title || 'Speaking Exercise'}</span>
              </div>
            </div>

            {/* Student's Original Spoken Text with Teacher Red-Pen Annotations */}
            <div className="pl-14 sm:pl-20 pr-4 sm:pr-24 space-y-6">
              
              <div>
                <div className="flex items-center gap-2 mb-2 font-handwriting text-sm text-slate-400">
                  <span>Student's Spoken Speech (Checked with Teacher Red Pen ✍️):</span>
                </div>

                {/* Handwritten student text */}
                <div className="font-handwriting text-2xl sm:text-3xl text-slate-800 leading-[2.2rem] sm:leading-[2.2rem] tracking-wide">
                  {original_transcript}
                </div>
              </div>

              {/* Teacher Red-Pen Mistake Breakdown (Sticky Notes) */}
              {mistakes && mistakes.length > 0 ? (
                <div className="mt-8 pt-4 border-t-2 border-dashed border-red-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-notebook text-base sm:text-lg font-bold text-red-700 flex items-center gap-2">
                      <span>📌 Teacher's Corrections & Simple Explanations:</span>
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                      {mistakes.length} correction{mistakes.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {mistakes.map((m, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveMistakeIndex(activeMistakeIndex === idx ? null : idx)}
                        className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                      >
                        {/* Red pen pin badge */}
                        <div className="flex items-center justify-between text-xs font-semibold pb-1.5 border-b border-amber-200/60 mb-2">
                          <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[11px] font-bold">
                            #{idx + 1} {m.category || m.mistake_type || 'Grammar'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeak(m.correction || m.corrected_snippet);
                            }}
                            className="text-amber-800 hover:text-emerald-700 flex items-center gap-1 text-[11px] font-medium"
                            title="Listen to correct pronunciation"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </button>
                        </div>

                        {/* What student said vs What teacher corrects */}
                        <div className="space-y-1.5 text-xs">
                          <div className="text-slate-600">
                            <span className="font-semibold text-slate-400 mr-1.5">You said:</span>
                            <span className="red-pen-strike font-handwriting text-lg text-red-600">
                              "{m.original || m.original_snippet}"
                            </span>
                          </div>
                          <div className="text-slate-900">
                            <span className="font-semibold text-emerald-700 mr-1.5">Correction:</span>
                            <span className="font-handwriting text-xl font-bold text-emerald-800">
                              "{m.correction || m.corrected_snippet}"
                            </span>
                          </div>
                        </div>

                        {/* Friendly Explanation (No Jargon) */}
                        <div className="mt-2.5 pt-2 border-t border-amber-200/50 text-xs text-slate-700 font-medium leading-relaxed bg-amber-100/50 p-2 rounded-lg">
                          <span className="font-bold text-amber-900">Teacher says: </span>
                          <span>{m.explanation || m.simple_explanation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Zero mistakes found! </span>
                    <span>Your English was completely clear and grammatically accurate in this session. Fantastic job!</span>
                  </div>
                </div>
              )}

              {/* Teacher Handwritten Remarks Section */}
              <div className="mt-8 pt-4 border-t border-slate-200">
                <div className="bg-yellow-50/80 border border-yellow-200 rounded-xl p-4 shadow-sm relative">
                  <div className="flex items-center gap-2 font-notebook text-sm font-bold text-amber-900 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Teacher's Summary Remarks:</span>
                  </div>
                  <p className="font-handwriting text-xl sm:text-2xl text-slate-800 leading-relaxed">
                    "{feedback_remarks || teacher_note || 'Great effort! Keep practicing every day to improve your fluency.'}"
                  </p>
                </div>
              </div>

              {/* Full Corrected Transcript Box with Listen Button */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="bg-white/90 border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      Full Corrected Version (Fluent English)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyCorrection}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => handleSpeak(corrected_transcript)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isSpeaking ? 'Pause' : 'Read Aloud'}</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-sans">
                    {corrected_transcript}
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* ==================================================================== */
        /* MODERN CARD VIEW */
        /* ==================================================================== */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Score & Category Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 ${getScoreColor(score)}`}>
                <span className="text-2xl font-black">{score.toFixed(1)}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">/ 10</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                    {badge.icon} {feedback_category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluated across Grammar, Vocabulary, and Speaking Clarity
                </p>
              </div>
            </div>

            {/* Sub-Scores Bar */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
                <div className="text-[10px] text-slate-500 font-semibold">Grammar</div>
                <div className="text-sm font-black text-slate-800">{grammar_score.toFixed(1)}/10</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
                <div className="text-[10px] text-slate-500 font-semibold">Vocabulary</div>
                <div className="text-sm font-black text-slate-800">{vocabulary_score.toFixed(1)}/10</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
                <div className="text-[10px] text-slate-500 font-semibold">Clarity</div>
                <div className="text-sm font-black text-slate-800">{clarity_score.toFixed(1)}/10</div>
              </div>
            </div>
          </div>

          {/* Feedback Remarks */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Teacher Feedback</h4>
            <p className="text-sm text-emerald-950 leading-relaxed font-medium">
              {feedback_remarks}
            </p>
          </div>

          {/* Side-by-side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Original Spoken</h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {original_transcript}
              </p>
            </div>

            <div className="bg-emerald-50/30 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Corrected Fluent English</h4>
                <button
                  onClick={() => handleSpeak(corrected_transcript)}
                  className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
              </div>
              <p className="text-sm text-slate-900 font-medium leading-relaxed">
                {corrected_transcript}
              </p>
            </div>
          </div>

          {/* Mistakes list */}
          {mistakes && mistakes.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Grammar & Word Corrections ({mistakes.length})</h4>
              <div className="space-y-2.5">
                {mistakes.map((m, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors bg-white">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-700">{m.category || 'Correction'}</span>
                      <button 
                        onClick={() => handleSpeak(m.correction || m.corrected_snippet)} 
                        className="text-emerald-600 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Volume2 className="w-3 h-3" /> Listen
                      </button>
                    </div>
                    <div className="text-xs text-slate-600 mb-1">
                      <span className="line-through text-red-500 mr-2">{m.original || m.original_snippet}</span>
                      <span className="font-bold text-emerald-700">{m.correction || m.corrected_snippet}</span>
                    </div>
                    <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mt-1.5">
                      💡 {m.explanation || m.simple_explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Vocabulary Upgrades / Natural Phrasing Suggestions */}
      {better_phrasings && better_phrasings.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 sm:p-6 border border-amber-200">
          <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>Bonus: Vocabulary & Fluency Upgrades</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {better_phrasings.map((b, idx) => (
              <div key={idx} className="bg-white/90 rounded-xl p-3 border border-amber-200/80 shadow-xs">
                <div className="text-xs text-slate-500 mb-1">
                  Instead of: <span className="italic font-medium text-slate-700">"{b.original_phrase}"</span>
                </div>
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <span>Try:</span>
                  <span className="underline decoration-emerald-400">"{b.improved_phrase}"</span>
                </div>
                {b.reason && (
                  <p className="text-[11px] text-slate-500 mt-1">{b.reason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
        <button
          onClick={onNewTopic}
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <span>Choose Another Speaking Topic</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onPracticeAgain}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Same Topic</span>
        </button>
      </div>

    </div>
  );
}

